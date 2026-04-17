import { t } from '../i18n/index.js';
import { addEntry } from '../db/queries.js';
import { showToast } from '../components/toast.js';

export function mount(container) {
  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-teal-50">
      <header class="px-5 pt-8 pb-4">
        <h1 class="text-2xl font-bold text-slate-800">${t('diaper.title')}</h1>
        <p class="text-sm text-slate-500 mt-1">${t('diaper.tap')}</p>
      </header>
      <div class="flex-1 flex flex-col justify-center gap-4 px-5 pb-8">
        <button data-type="wet"
          class="w-full py-8 rounded-3xl bg-sky-400 text-white text-2xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3">
          <span class="text-4xl">💧</span>
          ${t('diaper.wet')}
        </button>
        <button data-type="dirty"
          class="w-full py-8 rounded-3xl bg-amber-500 text-white text-2xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3">
          <span class="text-4xl">💩</span>
          ${t('diaper.dirty')}
        </button>
        <button data-type="mixed"
          class="w-full py-8 rounded-3xl bg-teal-500 text-white text-2xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3">
          <span class="text-4xl">🔄</span>
          ${t('diaper.mixed')}
        </button>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-type]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await addEntry({ category: 'diaper', diaperType: btn.dataset.type });
      showToast(t('diaper.saved'));
    });
  });
}

export function unmount() {}
