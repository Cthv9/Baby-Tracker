import { formatTimerDisplay, elapsedSeconds } from '../utils/formatters.js';

export class Timer {
  constructor({ onSave, onCancel, label = '' }) {
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.label = label;
    this.startIso = null;
    this.intervalId = null;
    this.el = null;
  }

  start(existingStartIso = null) {
    this.startIso = existingStartIso ?? new Date().toISOString();
    this._tick();
    this.intervalId = setInterval(() => this._tick(), 1000);
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  reset() {
    this.stop();
    this.startIso = null;
    if (this.el) this._renderStopped();
  }

  isRunning() {
    return this.intervalId !== null;
  }

  getStartIso() { return this.startIso; }

  mount(container) {
    this.el = document.createElement('div');
    this.el.className = 'flex flex-col items-center gap-4';
    container.appendChild(this.el);
    this._renderStopped();
    return this.el;
  }

  _tick() {
    if (!this.el || !this.startIso) return;
    const secs = elapsedSeconds(this.startIso);
    this.el.innerHTML = `
      <div class="text-6xl font-mono font-bold text-slate-800 tabular-nums tracking-tight">
        ${formatTimerDisplay(secs)}
      </div>
      ${this.label ? `<p class="text-sm text-slate-500">${this.label}</p>` : ''}
      <div class="flex gap-3 mt-2">
        <button id="timer-save" class="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold text-sm shadow-md active:scale-95 transition-transform">
          Salva
        </button>
        <button id="timer-cancel" class="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-medium text-sm">
          Annulla
        </button>
      </div>
    `;
    this.el.querySelector('#timer-save').addEventListener('click', () => {
      const endIso = new Date().toISOString();
      const dur = elapsedSeconds(this.startIso);
      this.stop();
      this.onSave({ startIso: this.startIso, endIso, durationSeconds: dur });
      this.reset();
    });
    this.el.querySelector('#timer-cancel').addEventListener('click', () => {
      this.stop();
      this.reset();
      this.onCancel?.();
    });
  }

  _renderStopped() {
    if (!this.el) return;
    this.el.innerHTML = `
      <div class="text-6xl font-mono font-bold text-slate-300 tabular-nums tracking-tight">00:00</div>
      ${this.label ? `<p class="text-sm text-slate-400">${this.label}</p>` : ''}
      <button id="timer-start" class="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold text-sm shadow-md active:scale-95 transition-transform mt-2">
        Avvia
      </button>
    `;
    this.el.querySelector('#timer-start').addEventListener('click', () => {
      this.start();
    });
  }
}
