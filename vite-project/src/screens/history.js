import { t } from '../i18n/index.js';
import { getAllEntries, deleteEntry } from '../db/queries.js';
import { showToast } from '../components/toast.js';
import { showConfirm } from '../components/confirm-modal.js';
import { goBack } from '../store/state.js';
import { formatDate, formatTime, formatDuration } from '../utils/formatters.js';

let filterDate = '';

export function mount(container) {
  filterDate = '';
  render(container);
}

export function unmount() {}

async function render(container) {
  const all = await getAllEntries();
  const filtered = filterDate
    ? all.filter((e) => e.startTime.startsWith(filterDate))
    : all;

  const categoryLabel = (e) => {
    if (e.category === 'feeding') return e.feedingType === 'bottle' ? `🍼 ${t('history.bottle')}` : `🤱 ${t('history.breastfeeding')}`;
    if (e.category === 'sleep') return `😴 ${t('history.sleep')}`;
    return `💧 ${t('history.diaper')}`;
  };

  const detail = (e) => {
    if (e.category === 'feeding') {
      if (e.feedingType === 'bottle') return e.amountMl ? `${e.amountMl} ml` : '';
      return [e.side ? t(`history.${e.side}`) : '', e.durationSeconds ? formatDuration(e.durationSeconds) : ''].filter(Boolean).join(' · ');
    }
    if (e.category === 'sleep') return e.durationSeconds ? formatDuration(e.durationSeconds) : '';
    if (e.category === 'diaper') return e.diaperType ? t(`history.${e.diaperType}`) : '';
    return '';
  };

  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-slate-50">
      <header class="px-5 pt-8 pb-4 flex items-center gap-3">
        <button id="back-btn" class="text-indigo-600 font-medium text-sm">${t('common.back')}</button>
        <h1 class="text-xl font-bold text-slate-800 flex-1">${t('history.title')}</h1>
      </header>
      <div class="px-5 mb-4">
        <input type="date" id="filter-date" value="${filterDate}"
          class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      </div>
      <div class="px-5 pb-4 space-y-2">
        ${filtered.length === 0 ? `
          <p class="text-center text-slate-400 text-sm py-8">${t('history.noEntries')}</p>
        ` : filtered.map((e) => `
          <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-700">${categoryLabel(e)}</p>
              <p class="text-xs text-slate-400 mt-0.5">${formatDate(e.startTime)} ${formatTime(e.startTime)}${detail(e) ? ' · ' + detail(e) : ''}</p>
            </div>
            <button data-delete="${e.id}" class="text-red-400 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50">${t('history.delete')}</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#back-btn')?.addEventListener('click', () => goBack());
  container.querySelector('#filter-date')?.addEventListener('change', (e) => {
    filterDate = e.target.value;
    render(container);
  });
  container.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ok = await showConfirm(t('history.deleteConfirm'));
      if (ok) {
        await deleteEntry(parseInt(btn.dataset.delete));
        showToast(t('common.delete'));
        render(container);
      }
    });
  });
}
