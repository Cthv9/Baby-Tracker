import './style.css';
import { getSettings } from './db/queries.js';
import { migrateFromLocalStorage } from './migration/fromLocalStorage.js';
import { initI18n } from './i18n/index.js';
import { setState } from './store/state.js';
import { renderBottomNav } from './components/bottom-nav.js';
import { initToast } from './components/toast.js';
import { initModal } from './components/confirm-modal.js';
import { initRouter } from './router/router.js';

async function boot() {
  const settings = await getSettings();
  const language = settings?.language ?? 'it';

  initI18n(language);
  setState({ language });

  await migrateFromLocalStorage(settings);

  const app = document.getElementById('app');
  app.innerHTML = `
    <main id="screen-container" class="min-h-screen pb-20 overflow-y-auto"></main>
    <nav id="bottom-nav" class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-sm"></nav>
    <div id="toast-container" class="fixed top-4 left-4 right-4 z-50 pointer-events-none flex flex-col gap-2"></div>
    <div id="modal-overlay" class="hidden fixed inset-0 bg-black/50 z-50 flex items-end justify-center pb-8 px-4"></div>
    <button id="btn-install" class="hidden fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 py-2.5 rounded-full shadow-lg z-50 text-sm font-semibold whitespace-nowrap">
      📲 Installa App
    </button>
  `;

  initToast(document.getElementById('toast-container'));
  initModal(document.getElementById('modal-overlay'));
  renderBottomNav(document.getElementById('bottom-nav'));
  initRouter(document.getElementById('screen-container'));

  // PWA install prompt
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    if (!localStorage.getItem('pwaPromptShown')) {
      deferredPrompt = e;
      document.getElementById('btn-install').classList.remove('hidden');
    }
  });
  document.getElementById('btn-install').addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      localStorage.setItem('pwaPromptShown', 'true');
      document.getElementById('btn-install').classList.add('hidden');
      deferredPrompt = null;
    });
  });

  // Register service worker (base path handled by registerSW.js from vite-plugin-pwa)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/Baby-Tracker/sw.js', { scope: '/Baby-Tracker/' }).catch(() => {});
  }
}

boot().catch(console.error);
