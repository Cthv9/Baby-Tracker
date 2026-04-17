import Dexie from 'dexie';
import { db } from './schema.js';

export async function addEntry(entry) {
  return db.entries.add({ ...entry, startTime: entry.startTime ?? new Date().toISOString() });
}

export async function deleteEntry(id) {
  return db.entries.delete(id);
}

export async function getAllEntries() {
  return db.entries.orderBy('startTime').reverse().toArray();
}

export async function getEntriesByDay(dateStr) {
  return db.entries
    .where('startTime')
    .between(dateStr, dateStr + '\uffff')
    .toArray();
}

export async function getEntriesInRange(fromDate, toDate) {
  return db.entries
    .where('startTime')
    .between(fromDate, toDate + '\uffff')
    .toArray();
}

export async function getTodayEntries() {
  const today = new Date().toISOString().split('T')[0];
  return getEntriesByDay(today);
}

export async function getLastByCategory(category) {
  const result = await db.entries
    .where('[category+startTime]')
    .between([category, Dexie.minKey], [category, Dexie.maxKey])
    .last();
  return result ?? null;
}

export async function getSettings() {
  return db.settings.get(1);
}

export async function saveSettings(patch) {
  const existing = await db.settings.get(1);
  if (existing) {
    return db.settings.update(1, patch);
  }
  return db.settings.put({ id: 1, ...patch });
}

export async function addMedicalVisit(visit) {
  return db.medicalVisits.add(visit);
}

export async function updateMedicalVisit(id, patch) {
  return db.medicalVisits.update(id, patch);
}

export async function deleteMedicalVisit(id) {
  return db.medicalVisits.delete(id);
}

export async function getAllMedicalVisits() {
  return db.medicalVisits.orderBy('date').reverse().toArray();
}

export async function addVaccine(vaccine) {
  return db.vaccines.add(vaccine);
}

export async function deleteVaccine(id) {
  return db.vaccines.delete(id);
}

export async function getAllVaccines() {
  return db.vaccines.orderBy('date').reverse().toArray();
}
