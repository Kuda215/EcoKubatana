export const BLAST_KEY = 'ecokubatana_live_blast';
export const BLAST_CH = 'ecokubatana_live_blast';

export function sendLiveBlast(alert) {
  const payload = {
    id: `blast-${Date.now()}`,
    at: new Date().toISOString(),
    type: alert.type || 'Community alert',
    level: alert.level || 'Emergency',
    location: alert.location || 'All members',
    message: alert.message || '',
  };
  localStorage.setItem(BLAST_KEY, JSON.stringify(payload));
  try {
    new BroadcastChannel(BLAST_CH).postMessage(payload);
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('ecokubatana-blast', { detail: payload }));
  return payload;
}

export function clearLiveBlast() {
  localStorage.removeItem(BLAST_KEY);
  try {
    new BroadcastChannel(BLAST_CH).postMessage({ clear: true });
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('ecokubatana-blast', { detail: { clear: true } }));
}

export function readLiveBlast() {
  try {
    return JSON.parse(localStorage.getItem(BLAST_KEY) || 'null');
  } catch {
    return null;
  }
}
