import { t } from '../i18n/index.js';
import { navigateTo } from '../store/state.js';

export function mount(container) {
  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-slate-50">
      <header class="px-5 pt-8 pb-4">
        <h1 class="text-2xl font-bold text-slate-800">${t('altro.title')}</h1>
      </header>
      <div class="px-5 space-y-3">
        ${card('🏥', t('altro.medical'), t('altro.medicalDesc'), 'medical', 'blue')}
        ${card('📊', t('altro.stats'), t('altro.statsDesc'), 'stats', 'amber')}
        ${card('📋', t('altro.history'), t('altro.historyDesc'), 'history', 'slate')}
        ${card('⚙️', t('altro.settings'), t('altro.settingsDesc'), 'settings', 'slate')}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-view]').forEach((el) => {
    el.addEventListener('click', () => navigateTo(el.dataset.view));
  });
}

function card(icon, title, desc, view, color) {
  return `
    <div data-view="${view}"
      class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform">
      <div class="w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center text-2xl flex-shrink-0">${icon}</div>
      <div class="flex-1">
        <p class="font-semibold text-slate-800">${title}</p>
        <p class="text-xs text-slate-400 mt-0.5">${desc}</p>
      </div>
      <span class="text-slate-300 text-lg">›</span>
    </div>
  `;
}

export function unmount() {}
