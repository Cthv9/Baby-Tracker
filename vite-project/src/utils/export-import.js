import { db } from '../db/schema.js';

export async function exportData() {
  const [entries, medicalVisits, vaccines] = await Promise.all([
    db.entries.toArray(),
    db.medicalVisits.toArray(),
    db.vaccines.toArray(),
  ]);

  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    entries,
    medicalVisits,
    vaccines,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `baby-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('invalid_json');
  }

  if (!data.entries || !Array.isArray(data.entries)) {
    throw new Error('invalid_format');
  }

  const entries = data.entries.map(({ id: _id, ...e }) => e);
  const medicalVisits = (data.medicalVisits ?? []).map(({ id: _id, ...v }) => v);
  const vaccines = (data.vaccines ?? []).map(({ id: _id, ...v }) => v);

  await db.entries.bulkAdd(entries);
  if (medicalVisits.length > 0) await db.medicalVisits.bulkAdd(medicalVisits);
  if (vaccines.length > 0) await db.vaccines.bulkAdd(vaccines);

  return entries.length + medicalVisits.length + vaccines.length;
}
