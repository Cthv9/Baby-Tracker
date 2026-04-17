import { t } from '../i18n/index.js';

export function formatDuration(seconds) {
  if (!seconds || seconds < 60) return `${seconds ?? 0}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}${t('common.h')} ${m}${t('common.min')}`;
  return `${m} ${t('common.min')}`;
}

export function formatTimeAgo(isoString) {
  if (!isoString) return t('dashboard.never');
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return t('common.now');
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} ${t('common.min')} ${t('dashboard.ago')}`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${h}${t('common.h')} ${t('dashboard.ago')}`;
  return `${h}${t('common.h')} ${rem}${t('common.min')} ${t('dashboard.ago')}`;
}

export function formatTime(isoString) {
  if (!isoString) return '--:--';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  return `${formatDate(isoString)} ${formatTime(isoString)}`;
}

export function formatTimerDisplay(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function elapsedSeconds(startIso) {
  return Math.floor((Date.now() - new Date(startIso).getTime()) / 1000);
}
