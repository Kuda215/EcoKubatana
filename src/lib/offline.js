const ALERTS_KEY = 'ecokubatana_offline_alerts';
const PLAY_KEY = 'ecokubatana_offline_playbook';
const META_KEY = 'ecokubatana_offline_meta';

export function saveOfflineAlerts(alerts) {
  try { localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts || [])); } catch { /* quota */ }
}
export function loadOfflineAlerts() {
  try { return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]'); } catch { return []; }
}
export function saveOfflinePlaybook(playbook) {
  try { localStorage.setItem(PLAY_KEY, JSON.stringify(playbook)); } catch { /* quota */ }
}
export function loadOfflinePlaybook() {
  try { return JSON.parse(localStorage.getItem(PLAY_KEY) || 'null'); } catch { return null; }
}
export function touchOfflineMeta() {
  try { localStorage.setItem(META_KEY, new Date().toISOString()); } catch { /* quota */ }
}
export function offlineMeta() {
  try { return localStorage.getItem(META_KEY); } catch { return null; }
}
