import { t } from '../i18n/index.js';
import { addEntry } from '../db/queries.js';
import { showToast } from '../components/toast.js';
import { getState, setState } from '../store/state.js';
import { formatTimerDisplay, elapsedSeconds, formatTime } from '../utils/formatters.js';

let intervalId = null;

export function mount(container) {
  render(container);
}

export function unmount() {
  clearInterval(intervalId);
  intervalId = null;
}

function render(container) {
  const { activeTimer } = getState();
  const isRunning = activeTimer?.category === 'sleep';

  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-purple-50">
      <header class="px-5 pt-8 pb-4">
        <h1 class="text-2xl font-bold text-slate-800">${t('sleep.title')}</h1>
      </header>
      <div class="flex-1 flex flex-col items-center justify-center gap-6 px-5 pb-10">
        <div class="text-8xl mb-2">😴</div>
        <div id="sleep-timer" class="text-6xl font-mono font-bold text-purple-800 tabular-nums tracking-tight">
          ${isRunning ? formatTimerDisplay(elapsedSeconds(activeTimer.startTime)) : '00:00'}
        </div>
        ${isRunning
          ? `<p class="text-sm text-slate-500">${t('sleep.startedAt')} ${formatTime(activeTimer.startTime)}</p>`
          : `<p class="text-sm text-slate-400 text-center max-w-xs">${t('sleep.tap')}</p>`
        }
        ${isRunning ? `
          <div class="flex gap-3 mt-4">
            <button id="sleep-save" class="bg-purple-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-md active:scale-95 transition-transform">
              ${t('sleep.save')}
            </button>
            <button id="sleep-cancel" class="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-medium">
              ${t('sleep.cancel')}
            </button>
          </div>
        ` : `
          <button id="sleep-start" class="bg-purple-600 text-white px-10 py-4 rounded-3xl text-lg font-bold shadow-lg active:scale-95 transition-transform mt-4">
            ${t('sleep.start')}
          </button>
        `}
      </div>
    </div>
  `;

  if (isRunning) {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      const el = container.querySelector('#sleep-timer');
      if (el) el.textContent = formatTimerDisplay(elapsedSeconds(activeTimer.startTime));
    }, 1000);

    container.querySelector('#sleep-save')?.addEventListener('click', async () => {
      clearInterval(intervalId);
      intervalId = null;
      const endIso = new Date().toISOString();
      const dur = elapsedSeconds(activeTimer.startTime);
      await addEntry({ category: 'sleep', startTime: activeTimer.startTime, endTime: endIso, durationSeconds: dur });
      setState({ activeTimer: null });
      showToast(t('sleep.saved'));
      render(container);
    });

    container.querySelector('#sleep-cancel')?.addEventListener('click', () => {
      clearInterval(intervalId);
      intervalId = null;
      setState({ activeTimer: null });
      render(container);
    });
  } else {
    container.querySelector('#sleep-start')?.addEventListener('click', () => {
      const startTime = new Date().toISOString();
      setState({ activeTimer: { category: 'sleep', startTime } });
      render(container);
    });
  }
}
