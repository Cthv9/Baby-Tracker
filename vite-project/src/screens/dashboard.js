import { t } from '../i18n/index.js';
import { getTodayEntries, getLastByCategory } from '../db/queries.js';
import { navigate, setState } from '../store/state.js';
import { formatTimeAgo, formatDuration } from '../utils/formatters.js';

let intervalId = null;

export function mount(container) {
  render(container);
  intervalId = setInterval(() => render(container), 60000);
}

export function unmount() {
  clearInterval(intervalId);
  intervalId = null;
}

async function render(container) {
  const [todayEntries, lastFeeding, lastSleep, lastDiaper] = await Promise.all([
    getTodayEntries(),
    getLastByCategory('feeding'),
    getLastByCategory('sleep'),
    getLastByCategory('diaper'),
  ]);

  const todayFeedings = todayEntries.filter((e) => e.category === 'feeding').length;
  const todaySleeps = todayEntries.filter((e) => e.category === 'sleep').length;
  const todayDiapers = todayEntries.filter((e) => e.category === 'diaper').length;

  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-slate-50">
      <header class="px-5 pt-8 pb-2">
        <h1 class="text-2xl font-bold text-slate-800">👶 ${t('dashboard.title')}</h1>
      </header>

      <!-- Last events -->
      <section class="px-5 pt-4 pb-2 space-y-3">
        ${lastEventCard('🤱', t('dashboard.lastFeeding'), lastFeeding, 'indigo')}
        ${lastEventCard('😴', t('dashboard.lastSleep'), lastSleep, 'purple')}
        ${lastEventCard('💧', t('dashboard.lastDiaper'), lastDiaper, 'teal')}
      </section>

      <!-- Today summary -->
      <section class="px-5 pt-4 pb-2">
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">${t('dashboard.title')}</h2>
        <div class="grid grid-cols-3 gap-3">
          ${summaryCard('🤱', todayFeedings, t('dashboard.todayFeedings'), 'indigo')}
          ${summaryCard('😴', todaySleeps, t('dashboard.todaySleeps'), 'purple')}
          ${summaryCard('💧', todayDiapers, t('dashboard.todayDiapers'), 'teal')}
        </div>
      </section>

      <!-- Quick add -->
      <section class="px-5 pt-4 pb-4">
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">${t('dashboard.quickAdd')}</h2>
        <div class="grid grid-cols-3 gap-3">
          <button data-nav="feeding" class="bg-indigo-100 text-indigo-700 py-4 rounded-2xl font-semibold text-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <span class="text-2xl">🤱</span> ${t('nav.feeding')}
          </button>
          <button data-nav="sleep" class="bg-purple-100 text-purple-700 py-4 rounded-2xl font-semibold text-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <span class="text-2xl">😴</span> ${t('nav.sleep')}
          </button>
          <button data-nav="diaper" class="bg-teal-100 text-teal-700 py-4 rounded-2xl font-semibold text-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <span class="text-2xl">💧</span> ${t('nav.diaper')}
          </button>
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });
}

function lastEventCard(icon, label, entry, color) {
  const timeAgo = formatTimeAgo(entry?.startTime);
  const duration = entry?.durationSeconds ? ` · ${formatDuration(entry.durationSeconds)}` : '';
  return `
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center text-xl flex-shrink-0">${icon}</div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-slate-400 font-medium">${label}</p>
        <p class="text-sm font-semibold text-slate-700 truncate">${timeAgo}${duration}</p>
      </div>
    </div>
  `;
}

function summaryCard(icon, count, label, color) {
  return `
    <div class="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
      <div class="text-2xl mb-1">${icon}</div>
      <div class="text-2xl font-bold text-${color}-600">${count}</div>
      <div class="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">${label}</div>
    </div>
  `;
}
