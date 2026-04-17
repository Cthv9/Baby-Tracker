const state = {
  activeTab: 'dashboard',
  subView: null,
  language: 'it',
  activeTimer: null,
};

const navStack = [];
const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function navigate(tab, subView = null) {
  navStack.length = 0;
  setState({ activeTab: tab, subView });
}

export function navigateTo(subView) {
  navStack.push(state.subView);
  setState({ subView });
}

export function goBack() {
  if (navStack.length > 0) {
    setState({ subView: navStack.pop() });
  } else if (state.subView) {
    setState({ subView: null });
  }
}
