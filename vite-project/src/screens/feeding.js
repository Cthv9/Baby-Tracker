import { t } from '../i18n/index.js';
import { addEntry } from '../db/queries.js';
import { showToast } from '../components/toast.js';
import { getState, setState } from '../store/state.js';
import { formatTimerDisplay, elapsedSeconds, formatTime } from '../utils/formatters.js';

let intervalId = null;
let activeMode = 'breastfeeding';
let bottleAmount = 120;

export function mount(container) {
  activeMode = 'breastfeeding';
  bottleAmount = 120;
  render(container);
}

export function unmount() {
  clearInterval(intervalId);
  intervalId = null;
}

function render(container) {
  const { activeTimer } = getState();
  const isTimerRunning = activeTimer?.category === 'feeding';

  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-indigo-50">
      <header class="px-5 pt-8 pb-4">
        <h1 class="text-2xl font-bold text-slate-800">${t('feeding.title')}</h1>
      </header>

      <!-- Mode toggle -->
      <div class="px-5 mb-6">
        <div class="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
          <button id="mode-breastfeeding"
            class="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${activeMode === 'breastfeeding' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}">
            🤱 ${t('feeding.breastfeeding')}
          </button>
          <button id="mode-bottle"
            class="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${activeMode === 'bottle' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}">
            🍼 ${t('feeding.bottle')}
          </button>
        </div>
      </div>

      <!-- Breastfeeding UI -->
      <div id="breastfeeding-section" class="${activeMode === 'breastfeeding' ? '' : 'hidden'} flex-1 flex flex-col items-center gap-6 px-5 pb-10">
        ${isTimerRunning ? `
          <!-- Active timer -->
          <div class="text-6xl font-mono font-bold text-indigo-800 tabular-nums tracking-tight" id="feed-timer">
            ${formatTimerDisplay(elapsedSeconds(activeTimer.startTime))}
          </div>
          <p class="text-sm text-slate-500">${t('feeding.startedAt')} ${formatTime(activeTimer.startTime)}</p>
          <div class="flex gap-2 mt-1">
            ${['left', 'right', 'both'].map((side) => `
              <button data-side="${side}"
                class="px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors
                  ${activeTimer.side === side ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600'}">
                ${t(`feeding.${side}`)}
              </button>
            `).join('')}
          </div>
          <div class="flex gap-3 mt-4">
            <button id="feed-save" class="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-md active:scale-95 transition-transform">
              ${t('feeding.saveSession')}
            </button>
            <button id="feed-cancel" class="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-medium">
              ${t('feeding.cancelSession')}
            </button>
          </div>
        ` : `
          <!-- Start timer -->
          <div class="text-8xl mb-2">🤱</div>
          <p class="text-sm text-slate-400 text-center">${t('feeding.selectSide')}</p>
          <div class="flex gap-3">
            ${['left', 'right', 'both'].map((side) => `
              <button data-start-side="${side}"
                class="px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95
                  bg-white border-indigo-200 text-indigo-700 shadow-sm">
                ${t(`feeding.${side}`)}
              </button>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Bottle UI -->
      <div id="bottle-section" class="${activeMode === 'bottle' ? '' : 'hidden'} flex-1 flex flex-col items-center gap-5 px-5 pb-10">
        <div class="text-8xl mb-2">🍼</div>
        <p class="text-slate-600 font-medium">${t('feeding.amountMl')}</p>
        <div class="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <button id="minus10" class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-xl flex items-center justify-center active:scale-90 transition-transform">−</button>
          <span id="bottle-amount" class="text-4xl font-bold text-indigo-700 w-20 text-center">${bottleAmount}</span>
          <span class="text-slate-400 text-sm">ml</span>
          <button id="plus10" class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-xl flex items-center justify-center active:scale-90 transition-transform">+</button>
        </div>
        <div class="flex gap-2 flex-wrap justify-center">
          ${[60, 90, 120, 150].map((ml) => `
            <button data-preset="${ml}"
              class="px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-colors
                ${bottleAmount === ml ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600'}">
              ${ml} ml
            </button>
          `).join('')}
        </div>
        <button id="bottle-save" class="bg-indigo-600 text-white px-10 py-4 rounded-3xl text-base font-bold shadow-lg active:scale-95 transition-transform mt-2">
          ${t('feeding.save')}
        </button>
      </div>
    </div>
  `;

  // Mode toggle
  container.querySelector('#mode-breastfeeding')?.addEventListener('click', () => {
    activeMode = 'breastfeeding';
    render(container);
  });
  container.querySelector('#mode-bottle')?.addEventListener('click', () => {
    activeMode = 'bottle';
    render(container);
  });

  if (isTimerRunning) {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      const el = container.querySelector('#feed-timer');
      if (el) el.textContent = formatTimerDisplay(elapsedSeconds(activeTimer.startTime));
    }, 1000);

    container.querySelectorAll('[data-side]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setState({ activeTimer: { ...activeTimer, side: btn.dataset.side } });
        render(container);
      });
    });

    container.querySelector('#feed-save')?.addEventListener('click', async () => {
      clearInterval(intervalId); intervalId = null;
      const endIso = new Date().toISOString();
      const dur = elapsedSeconds(activeTimer.startTime);
      await addEntry({
        category: 'feeding', feedingType: 'breastfeeding',
        side: activeTimer.side ?? 'left',
        startTime: activeTimer.startTime, endTime: endIso, durationSeconds: dur,
      });
      setState({ activeTimer: null });
      showToast(t('feeding.sessionSaved'));
      render(container);
    });

    container.querySelector('#feed-cancel')?.addEventListener('click', () => {
      clearInterval(intervalId); intervalId = null;
      setState({ activeTimer: null });
      render(container);
    });
  } else {
    container.querySelectorAll('[data-start-side]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setState({ activeTimer: { category: 'feeding', startTime: new Date().toISOString(), side: btn.dataset.startSide } });
        render(container);
      });
    });
  }

  // Bottle controls
  container.querySelector('#minus10')?.addEventListener('click', () => {
    bottleAmount = Math.max(10, bottleAmount - 10);
    render(container);
  });
  container.querySelector('#plus10')?.addEventListener('click', () => {
    bottleAmount = Math.min(500, bottleAmount + 10);
    render(container);
  });
  container.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      bottleAmount = parseInt(btn.dataset.preset);
      render(container);
    });
  });
  container.querySelector('#bottle-save')?.addEventListener('click', async () => {
    await addEntry({ category: 'feeding', feedingType: 'bottle', amountMl: bottleAmount });
    showToast(t('feeding.saved'));
  });
}
