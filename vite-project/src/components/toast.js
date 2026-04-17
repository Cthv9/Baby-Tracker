let container;

export function initToast(el) {
  container = el;
}

export function showToast(message, type = 'success', duration = 2500) {
  if (!container) return;
  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-indigo-500',
  };
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg
    ${colors[type] ?? colors.success} transition-all duration-300 opacity-0 translate-y-2`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}
