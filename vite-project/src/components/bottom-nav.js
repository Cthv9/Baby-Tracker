import { getState, navigate, subscribe } from '../store/state.js';
import { t } from '../i18n/index.js';

const tabs = [
  { id: 'dashboard', icon: '🏠' },
  { id: 'feeding', icon: '🤱' },
  { id: 'sleep', icon: '😴' },
  { id: 'diaper', icon: '💧' },
  { id: 'altro', icon: '☰' },
];

export function renderBottomNav(container) {
  function render() {
    const { activeTab } = getState();
    container.innerHTML = `
      <div class="flex justify-around items-center py-2 pb-safe bg-white border-t border-slate-100">
        ${tabs.map(({ id, icon }) => `
          <button data-tab="${id}"
            class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors
              ${activeTab === id ? 'text-indigo-600' : 'text-slate-400'}">
            <span class="text-2xl leading-none">${icon}</span>
            <span class="text-[10px] font-medium">${t(`nav.${id}`)}</span>
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigate(btn.dataset.tab);
      });
    });
  }

  render();
  subscribe(() => render());
}
