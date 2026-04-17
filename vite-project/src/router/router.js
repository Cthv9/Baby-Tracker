import { getState, subscribe } from '../store/state.js';
import { mount as mountDashboard, unmount as unmountDashboard } from '../screens/dashboard.js';
import { mount as mountFeeding, unmount as unmountFeeding } from '../screens/feeding.js';
import { mount as mountSleep, unmount as unmountSleep } from '../screens/sleep.js';
import { mount as mountDiaper, unmount as unmountDiaper } from '../screens/diaper.js';
import { mount as mountAltro, unmount as unmountAltro } from '../screens/altro.js';
import { mount as mountMedical, unmount as unmountMedical } from '../screens/medical.js';
import { mount as mountStats, unmount as unmountStats } from '../screens/stats.js';
import { mount as mountSettings, unmount as unmountSettings } from '../screens/settings.js';
import { mount as mountHistory, unmount as unmountHistory } from '../screens/history.js';

const screens = {
  dashboard: { mount: mountDashboard, unmount: unmountDashboard },
  feeding: { mount: mountFeeding, unmount: unmountFeeding },
  sleep: { mount: mountSleep, unmount: unmountSleep },
  diaper: { mount: mountDiaper, unmount: unmountDiaper },
  altro: { mount: mountAltro, unmount: unmountAltro },
  medical: { mount: mountMedical, unmount: unmountMedical },
  stats: { mount: mountStats, unmount: unmountStats },
  settings: { mount: mountSettings, unmount: unmountSettings },
  history: { mount: mountHistory, unmount: unmountHistory },
};

let currentView = null;
let screenContainer = null;

function getActiveView(state) {
  return state.subView ?? state.activeTab;
}

export function initRouter(container) {
  screenContainer = container;

  const initial = getActiveView(getState());
  screens[initial]?.mount(screenContainer);
  currentView = initial;

  subscribe((state) => {
    const view = getActiveView(state);
    if (view !== currentView) {
      screens[currentView]?.unmount?.();
      screenContainer.innerHTML = '';
      screens[view]?.mount(screenContainer);
      currentView = view;
      screenContainer.scrollTop = 0;
    }
  });
}
