import { t } from '../i18n/index.js';
import {
  getAllMedicalVisits, addMedicalVisit, deleteMedicalVisit, updateMedicalVisit,
  getAllVaccines, addVaccine, deleteVaccine,
} from '../db/queries.js';
import { showToast } from '../components/toast.js';
import { showConfirm } from '../components/confirm-modal.js';
import { goBack } from '../store/state.js';
import { formatDate } from '../utils/formatters.js';

let activeTab = 'visits';
let showVisitForm = false;
let showVaccineForm = false;
let selectedVisit = null;
let actionItems = [];

export function mount(container) {
  activeTab = 'visits';
  showVisitForm = false;
  showVaccineForm = false;
  selectedVisit = null;
  actionItems = [];
  render(container);
}

export function unmount() {}

async function render(container) {
  if (showVisitForm) { renderVisitForm(container); return; }
  if (selectedVisit !== null) { renderVisitDetail(container, selectedVisit); return; }
  if (showVaccineForm) { renderVaccineForm(container); return; }

  const [visits, vaccines] = await Promise.all([getAllMedicalVisits(), getAllVaccines()]);

  const visitTypeLabel = (type) => t(`medical.visitType.${type}`) ?? type;
  const visitTypeColor = { routine: 'blue', vaccination: 'green', specialist: 'purple', urgent: 'red' };

  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-slate-50">
      <header class="px-5 pt-8 pb-4 flex items-center gap-3">
        <button id="back-btn" class="text-indigo-600 font-medium text-sm">${t('common.back')}</button>
        <h1 class="text-xl font-bold text-slate-800 flex-1">${t('medical.title')}</h1>
      </header>

      <!-- Tabs -->
      <div class="px-5 mb-4">
        <div class="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
          <button id="tab-visits" class="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'visits' ? 'bg-blue-600 text-white' : 'text-slate-500'}">
            🏥 ${t('medical.visits')}
          </button>
          <button id="tab-vaccines" class="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'vaccines' ? 'bg-blue-600 text-white' : 'text-slate-500'}">
            💉 ${t('medical.vaccines')}
          </button>
        </div>
      </div>

      <!-- Visits list -->
      <div id="visits-section" class="${activeTab === 'visits' ? '' : 'hidden'} px-5 space-y-3 pb-4">
        <button id="new-visit-btn" class="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold text-sm shadow-md active:scale-95 transition-transform">
          + ${t('medical.newVisit')}
        </button>
        ${visits.length === 0
          ? `<p class="text-center text-slate-400 text-sm py-8">${t('medical.noVisits')}</p>`
          : visits.map((v) => `
          <div data-visit="${v.id}" class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-xs text-slate-400">${formatDate(v.date)}</p>
                <p class="font-semibold text-slate-800 mt-0.5">${escHtml(v.doctor || '—')}</p>
                <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${visitTypeColor[v.visitType] ?? 'slate'}-100 text-${visitTypeColor[v.visitType] ?? 'slate'}-700">
                  ${visitTypeLabel(v.visitType)}
                </span>
              </div>
              <button data-delete-visit="${v.id}" class="text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-red-50 flex-shrink-0">✕</button>
            </div>
            ${v.actionItems?.filter((a) => !a.done).length > 0
              ? `<p class="text-xs text-orange-500 mt-2">⚠ ${v.actionItems.filter((a) => !a.done).length} ${activeTab === 'visits' ? 'da fare' : ''}</p>`
              : ''}
          </div>
        `).join('')}
      </div>

      <!-- Vaccines list -->
      <div id="vaccines-section" class="${activeTab === 'vaccines' ? '' : 'hidden'} px-5 space-y-3 pb-4">
        <button id="new-vaccine-btn" class="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold text-sm shadow-md active:scale-95 transition-transform">
          + ${t('medical.newVaccine')}
        </button>
        ${vaccines.length === 0
          ? `<p class="text-center text-slate-400 text-sm py-8">${t('medical.noVaccines')}</p>`
          : vaccines.map((v) => `
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">💉</div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-800 text-sm">${escHtml(v.name)}</p>
              <p class="text-xs text-slate-400 mt-0.5">${formatDate(v.date)}${v.lotNumber ? ' · lotto: ' + escHtml(v.lotNumber) : ''}</p>
            </div>
            <button data-delete-vaccine="${v.id}" class="text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-red-50">✕</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#back-btn')?.addEventListener('click', () => goBack());
  container.querySelector('#tab-visits')?.addEventListener('click', () => { activeTab = 'visits'; render(container); });
  container.querySelector('#tab-vaccines')?.addEventListener('click', () => { activeTab = 'vaccines'; render(container); });
  container.querySelector('#new-visit-btn')?.addEventListener('click', () => { showVisitForm = true; actionItems = []; render(container); });
  container.querySelector('#new-vaccine-btn')?.addEventListener('click', () => { showVaccineForm = true; render(container); });

  container.querySelectorAll('[data-visit]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.dataset.deleteVisit) return;
      const id = parseInt(el.dataset.visit);
      const visit = visits.find((v) => v.id === id);
      if (visit) { selectedVisit = visit; render(container); }
    });
  });

  container.querySelectorAll('[data-delete-visit]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await showConfirm(t('medical.deleteConfirm'));
      if (ok) { await deleteMedicalVisit(parseInt(btn.dataset.deleteVisit)); render(container); }
    });
  });

  container.querySelectorAll('[data-delete-vaccine]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ok = await showConfirm(t('medical.vaccineDeleteConfirm'));
      if (ok) { await deleteVaccine(parseInt(btn.dataset.deleteVaccine)); render(container); }
    });
  });
}

function renderVisitForm(container) {
  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-slate-50">
      <header class="px-5 pt-8 pb-4 flex items-center gap-3">
        <button id="back-form" class="text-indigo-600 font-medium text-sm">${t('common.back')}</button>
        <h1 class="text-xl font-bold text-slate-800 flex-1">${t('medical.newVisit')}</h1>
      </header>
      <form id="visit-form" class="px-5 space-y-4 pb-8">
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.visitDate')}</label>
          <input type="date" id="v-date" required value="${new Date().toISOString().split('T')[0]}"
            class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.doctor')}</label>
          <input type="text" id="v-doctor" placeholder="Dr. Rossi..."
            class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.visitType')}</label>
          <select id="v-type" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="routine">${t('medical.visitType.routine')}</option>
            <option value="vaccination">${t('medical.visitType.vaccination')}</option>
            <option value="specialist">${t('medical.visitType.specialist')}</option>
            <option value="urgent">${t('medical.visitType.urgent')}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.notes')}</label>
          <textarea id="v-notes" rows="3" placeholder="Annotazioni, prescrizioni..."
            class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"></textarea>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.actionItems')}</label>
          <div id="action-list" class="space-y-2 mb-2">
            ${actionItems.map((a, i) => `
              <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                <span class="flex-1 text-sm text-slate-700">${escHtml(a.text)}</span>
                <button type="button" data-remove-action="${i}" class="text-red-400 text-xs">✕</button>
              </div>
            `).join('')}
          </div>
          <div class="flex gap-2">
            <input type="text" id="action-input" placeholder="${t('medical.addAction')}"
              class="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <button type="button" id="add-action-btn" class="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-sm font-medium">+</button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.nextAppointment')}</label>
            <input type="date" id="v-next"
              class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.weight')}</label>
            <input type="number" step="0.01" id="v-weight" placeholder="4.5"
              class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.height')}</label>
            <input type="number" step="0.1" id="v-height" placeholder="52"
              class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.headCircumference')}</label>
            <input type="number" step="0.1" id="v-head" placeholder="35"
              class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold shadow-md active:scale-95 transition-transform mt-2">
          ${t('medical.save')}
        </button>
      </form>
    </div>
  `;

  container.querySelector('#back-form')?.addEventListener('click', () => { showVisitForm = false; render(container); });

  container.querySelector('#add-action-btn')?.addEventListener('click', () => {
    const input = container.querySelector('#action-input');
    const text = input.value.trim();
    if (text) { actionItems.push({ text, done: false }); input.value = ''; renderVisitForm(container); }
  });

  container.querySelector('#action-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); container.querySelector('#add-action-btn').click(); }
  });

  container.querySelectorAll('[data-remove-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      actionItems.splice(parseInt(btn.dataset.removeAction), 1);
      renderVisitForm(container);
    });
  });

  container.querySelector('#visit-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const weightVal = container.querySelector('#v-weight').value;
    const heightVal = container.querySelector('#v-height').value;
    const headVal = container.querySelector('#v-head').value;
    const visit = {
      date: container.querySelector('#v-date').value,
      doctor: container.querySelector('#v-doctor').value,
      visitType: container.querySelector('#v-type').value,
      notes: container.querySelector('#v-notes').value,
      actionItems: [...actionItems],
      nextAppointment: container.querySelector('#v-next').value || null,
      weightKg: weightVal ? parseFloat(weightVal) : null,
      heightCm: heightVal ? parseFloat(heightVal) : null,
      headCircumferenceCm: headVal ? parseFloat(headVal) : null,
    };
    await addMedicalVisit(visit);
    showToast(t('medical.saved'));
    showVisitForm = false;
    actionItems = [];
    render(container);
  });
}

function renderVisitDetail(container, visit) {
  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-slate-50">
      <header class="px-5 pt-8 pb-4 flex items-center gap-3">
        <button id="back-detail" class="text-indigo-600 font-medium text-sm">${t('common.back')}</button>
        <h1 class="text-xl font-bold text-slate-800 flex-1">${escHtml(visit.doctor || '—')}</h1>
      </header>
      <div class="px-5 space-y-4 pb-8">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2">
          <p class="text-xs text-slate-400">${t('medical.visitDate')}</p>
          <p class="font-semibold text-slate-800">${formatDate(visit.date)}</p>
          <p class="text-xs text-slate-400 mt-2">${t('medical.visitType')}</p>
          <p class="font-medium text-slate-700">${t(`medical.visitType.${visit.visitType}`)}</p>
          ${visit.nextAppointment ? `<p class="text-xs text-blue-600 mt-1">📅 Prossimo: ${formatDate(visit.nextAppointment)}</p>` : ''}
        </div>
        ${(visit.weightKg || visit.heightCm || visit.headCircumferenceCm) ? `
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p class="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Misurazioni</p>
            <div class="grid grid-cols-3 gap-2 text-center">
              ${visit.weightKg ? `<div><p class="text-lg font-bold text-blue-600">${visit.weightKg}</p><p class="text-xs text-slate-400">kg</p></div>` : ''}
              ${visit.heightCm ? `<div><p class="text-lg font-bold text-blue-600">${visit.heightCm}</p><p class="text-xs text-slate-400">cm</p></div>` : ''}
              ${visit.headCircumferenceCm ? `<div><p class="text-lg font-bold text-blue-600">${visit.headCircumferenceCm}</p><p class="text-xs text-slate-400">cc</p></div>` : ''}
            </div>
          </div>
        ` : ''}
        ${visit.notes ? `
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p class="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">${t('medical.notes')}</p>
            <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">${escHtml(visit.notes)}</p>
          </div>
        ` : ''}
        ${visit.actionItems?.length > 0 ? `
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p class="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">${t('medical.actionItems')}</p>
            <div class="space-y-2">
              ${visit.actionItems.map((a, i) => `
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" data-action-idx="${i}" ${a.done ? 'checked' : ''}
                    class="w-4 h-4 rounded text-blue-600 focus:ring-blue-300" />
                  <span class="text-sm text-slate-700 ${a.done ? 'line-through text-slate-400' : ''}">${escHtml(a.text)}</span>
                </label>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  container.querySelector('#back-detail')?.addEventListener('click', () => { selectedVisit = null; render(container); });

  container.querySelectorAll('[data-action-idx]').forEach((cb) => {
    cb.addEventListener('change', async () => {
      const idx = parseInt(cb.dataset.actionIdx);
      const updated = visit.actionItems.map((a, i) => i === idx ? { ...a, done: cb.checked } : a);
      await updateMedicalVisit(visit.id, { actionItems: updated });
      visit.actionItems = updated;
      renderVisitDetail(container, visit);
    });
  });
}

function renderVaccineForm(container) {
  container.innerHTML = `
    <div class="flex flex-col min-h-screen bg-slate-50">
      <header class="px-5 pt-8 pb-4 flex items-center gap-3">
        <button id="back-vax-form" class="text-indigo-600 font-medium text-sm">${t('common.back')}</button>
        <h1 class="text-xl font-bold text-slate-800 flex-1">${t('medical.newVaccine')}</h1>
      </header>
      <form id="vaccine-form" class="px-5 space-y-4 pb-8">
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.vaccineName')}</label>
          <input type="text" id="vax-name" required placeholder="Esavalente, MPR..."
            class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.vaccineDate')}</label>
          <input type="date" id="vax-date" required value="${new Date().toISOString().split('T')[0]}"
            class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.vaccineLot')}</label>
          <input type="text" id="vax-lot" placeholder="AB1234..."
            class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">${t('medical.vaccineNotes')}</label>
          <textarea id="vax-notes" rows="2"
            class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"></textarea>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold shadow-md active:scale-95 transition-transform mt-2">
          ${t('medical.saveVaccine')}
        </button>
      </form>
    </div>
  `;

  container.querySelector('#back-vax-form')?.addEventListener('click', () => { showVaccineForm = false; render(container); });

  container.querySelector('#vaccine-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addVaccine({
      name: container.querySelector('#vax-name').value,
      date: container.querySelector('#vax-date').value,
      lotNumber: container.querySelector('#vax-lot').value || null,
      notes: container.querySelector('#vax-notes').value || null,
    });
    showToast(t('medical.vaccineSaved'));
    showVaccineForm = false;
    render(container);
  });
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}
