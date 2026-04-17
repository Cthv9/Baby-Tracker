import { db } from '../db/schema.js';
import { saveSettings } from '../db/queries.js';

export async function migrateFromLocalStorage(settings) {
  if (settings?.migratedFromLocalStorage) return;

  const raw = localStorage.getItem('eventiBimbo');
  if (!raw) {
    await saveSettings({ migratedFromLocalStorage: true });
    return;
  }

  let legacy;
  try {
    legacy = JSON.parse(raw);
  } catch {
    await saveSettings({ migratedFromLocalStorage: true });
    return;
  }

  if (!Array.isArray(legacy) || legacy.length === 0) {
    await saveSettings({ migratedFromLocalStorage: true });
    return;
  }

  const mapped = legacy.map((ev) => {
    if (ev.tipo === 'poppata') {
      return { category: 'feeding', feedingType: 'breastfeeding', startTime: ev.data };
    }
    return { category: 'sleep', startTime: ev.data };
  });

  await db.entries.bulkAdd(mapped);
  await saveSettings({ migratedFromLocalStorage: true });
}
