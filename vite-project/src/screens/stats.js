import { t } from '../i18n/index.js';
import { getEntriesInRange } from '../db/queries.js';
import { goBack } from '../store/state.js';

let charts = [];

export function mount(container) {
  render(container);
}

export function unmount() {
  charts.forEach((c) => c.destroy());
  charts = [];
}

async function render(container) {
  const days = 7;
  const labels = [];
  const dayKeys = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dayKeys.push(key);
    labels.push(d.toLocaleDateString([], { weekday: 'short', day: 'numeric' }));
  }

  const fromDate = dayKeys[0];
  const toDate = dayKeys[dayKeys.length - 1];
  const entries = await getEntriesInRange(fromDate, toDate);

  const feedingsPerDay = dayKeys.map((k) => entries.filter((e) => e.category === 'feeding' && e.startTime.startsWith(k)).length);
  const diapersPerDay = dayKeys.map((k) => entries.filter((e) => e.category === 'diaper' && e.startTime.startsWith(k)).length);
  const sleepPerDay = dayKeys.map((k) => {
    const sleeps = entries.filter((e) => e.category === 'sleep' && e.startTime.startsWith(k) && e.durationSeconds);
    const totalSecs = sleeps.reduce((sum, e) => sum + (e.durationSeconds ?? 0), 0);
    return Math.round(totalSecs / 3600 * 10) / 10;
  });

  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-slate-50">
      <header class="px-5 pt-8 pb-4 flex items-center gap-3">
        <button id="back-btn" class="text-indigo-600 font-medium text-sm">${t('common.back')}</button>
        <h1 class="text-xl font-bold text-slate-800 flex-1">${t('stats.title')}</h1>
      </header>
      <p class="px-5 text-xs text-slate-400 mb-4">${t('stats.last7days')}</p>
      <div class="px-5 space-y-5 pb-6">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p class="text-sm font-semibold text-indigo-700 mb-3">🤱 ${t('stats.feedingsPerDay')}</p>
          <canvas id="chart-feedings" height="160"></canvas>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p class="text-sm font-semibold text-purple-700 mb-3">😴 ${t('stats.sleepPerDay')}</p>
          <canvas id="chart-sleep" height="160"></canvas>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p class="text-sm font-semibold text-teal-700 mb-3">💧 ${t('stats.diapersPerDay')}</p>
          <canvas id="chart-diapers" height="160"></canvas>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#back-btn')?.addEventListener('click', () => goBack());

  const { Chart, registerables } = await import('chart.js');
  Chart.register(...registerables);

  const chartDefaults = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8', font: { size: 11 } }, grid: { color: '#f1f5f9' } },
      x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
    },
  };

  charts.forEach((c) => c.destroy());
  charts = [];

  charts.push(new Chart(container.querySelector('#chart-feedings'), {
    type: 'bar',
    data: { labels, datasets: [{ data: feedingsPerDay, backgroundColor: '#818cf8', borderRadius: 6 }] },
    options: chartDefaults,
  }));

  charts.push(new Chart(container.querySelector('#chart-sleep'), {
    type: 'bar',
    data: { labels, datasets: [{ data: sleepPerDay, backgroundColor: '#c084fc', borderRadius: 6 }] },
    options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, ticks: { ...chartDefaults.scales.y.ticks, callback: (v) => v + 'h' } } } },
  }));

  charts.push(new Chart(container.querySelector('#chart-diapers'), {
    type: 'bar',
    data: { labels, datasets: [{ data: diapersPerDay, backgroundColor: '#2dd4bf', borderRadius: 6 }] },
    options: chartDefaults,
  }));
}
