import it from './it.js';
import en from './en.js';

const langs = { it, en };
let current = 'it';

export function initI18n(lang) {
  current = lang in langs ? lang : 'it';
}

export function t(key) {
  return langs[current][key] ?? langs['it'][key] ?? key;
}

export function getLang() {
  return current;
}

export function setLang(lang) {
  if (lang in langs) current = lang;
}
