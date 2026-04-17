import { t, getLang, setLang } from '../i18n/index.js';
import { saveSettings, getSettings } from '../db/queries.js';
import { setState, goBack } from '../store/state.js';
import { showToast } from '../components/toast.js';
import { showConfirm } from '../components/confirm-modal.js';
import { exportData, importData } from '../utils/export-import.js';
import { db } from '../db/schema.js';
import { navigateTo } from '../store/state.js';

export function mount(container) {
  render(container);
}

export function unmount() {}

function render(container) {
  const lang = getLang();

  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-slate-50">
      <header class="px-5 pt-8 pb-4 flex items-center gap-3">
        <button id="back-btn" class="text-indigo-600 font-medium text-sm">${t('common.back')}</button>
        <h1 class="text-xl font-bold text-slate-800 flex-1">${t('settings.title')}</h1>
      </header>

      <!-- Language -->
      <section class="px-5 mb-5">
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">${t('settings.language')}</h2>
        <div class="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
          <button id="lang-it" class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${lang === 'it' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}">
            🇮🇹 ${t('settings.italian')}
          </button>
          <button id="lang-en" class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}">
            🇬🇧 ${t('settings.english')}
          </button>
        </div>
      </section>

      <!-- Data -->
      <section class="px-5 mb-5">
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">${t('settings.data')}</h2>
        <div class="space-y-2">
          <button id="export-btn" class="w-full bg-white border border-slate-100 rounded-2xl px-4 py-4 text-left shadow-sm flex items-center gap-3">
            <span class="text-xl">📤</span>
            <span class="text-sm font-medium text-slate-700">${t('settings.export')}</span>
          </button>
          <label class="w-full bg-white border border-slate-100 rounded-2xl px-4 py-4 flex items-center gap-3 shadow-sm cursor-pointer">
            <span class="text-xl">📥</span>
            <span class="text-sm font-medium text-slate-700">${t('settings.import')}</span>
            <input id="import-input" type="file" accept=".json" class="hidden" />
          </label>
          <button id="history-btn" class="w-full bg-white border border-slate-100 rounded-2xl px-4 py-4 text-left shadow-sm flex items-center gap-3">
            <span class="text-xl">📋</span>
            <span class="text-sm font-medium text-slate-700">${t('settings.history')}</span>
          </button>
          <button id="delete-all-btn" class="w-full bg-white border border-red-100 rounded-2xl px-4 py-4 text-left shadow-sm flex items-center gap-3">
            <span class="text-xl">🗑️</span>
            <span class="text-sm font-medium text-red-500">${t('settings.deleteAll')}</span>
          </button>
        </div>
      </section>

      <!-- Info -->
      <section class="px-5 mb-6">
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">${t('settings.info')}</h2>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
          <p class="text-sm text-slate-600 leading-relaxed">${t('settings.aboutText')}</p>
          <p class="text-xs text-slate-400 leading-relaxed">${t('settings.localData')}</p>
        </div>
      </section>

      <p class="text-center text-xs text-slate-300 pb-6">Made with ❤️ by DF</p>
    </div>
  `;

  container.querySelector('#back-btn')?.addEventListener('click', () => goBack());

  container.querySelector('#lang-it')?.addEventListener('click', async () => {
    setLang('it');
    await saveSettings({ language: 'it' });
    setState({ language: 'it' });
    render(container);
  });
  container.querySelector('#lang-en')?.addEventListener('click', async () => {
    setLang('en');
    await saveSettings({ language: 'en' });
    setState({ language: 'en' });
    render(container);
  });

  container.querySelector('#export-btn')?.addEventListener('click', async () => {
    await exportData();
    showToast('✅ Export completato!');
  });

  container.querySelector('#import-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await showConfirm(t('settings.importConfirm'));
    if (!ok) return;
    try {
      const count = await importData(file);
      showToast(`${t('settings.importSuccess')} (${count} record)`);
    } catch {
      showToast(t('settings.importError'), 'error');
    }
    e.target.value = '';
  });

  container.querySelector('#history-btn')?.addEventListener('click', () => navigateTo('history'));

  container.querySelector('#delete-all-btn')?.addEventListener('click', async () => {
    const ok = await showConfirm(t('settings.deleteAllConfirm'));
    if (!ok) return;
    await db.entries.clear();
    await db.medicalVisits.clear();
    await db.vaccines.clear();
    showToast(t('settings.deleted'));
  });
}
