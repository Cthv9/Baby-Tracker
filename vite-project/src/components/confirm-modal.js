import { t } from '../i18n/index.js';

let overlay;

export function initModal(el) {
  overlay = el;
}

export function showConfirm(message) {
  return new Promise((resolve) => {
    if (!overlay) { resolve(window.confirm(message)); return; }

    overlay.innerHTML = `
      <div class="bg-white rounded-2xl mx-4 p-6 w-full max-w-sm shadow-xl">
        <p class="text-slate-700 text-base mb-6 text-center leading-relaxed">${message}</p>
        <div class="flex gap-3">
          <button id="modal-no" class="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm">
            ${t('common.no')}
          </button>
          <button id="modal-yes" class="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium text-sm">
            ${t('common.yes')}
          </button>
        </div>
      </div>
    `;
    overlay.classList.remove('hidden');

    const cleanup = (result) => {
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
      resolve(result);
    };

    overlay.querySelector('#modal-yes').addEventListener('click', () => cleanup(true));
    overlay.querySelector('#modal-no').addEventListener('click', () => cleanup(false));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(false); }, { once: true });
  });
}
