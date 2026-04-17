import Dexie from 'dexie';

export const db = new Dexie('BabyTrackerDB');

db.version(1).stores({
  entries: '++id, category, startTime, [category+startTime]',
  medicalVisits: '++id, date, visitType',
  vaccines: '++id, date',
  settings: 'id',
});
