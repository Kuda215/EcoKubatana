const KEY = 'ecokubatana_alert_blast';
const CHANNEL = 'ecokubatana_alert_blast';

export function makeBlast(partial = {}) {
  return {
    id: `blast-${Date.now()}`,
    title: partial.title || 'Community climate alert',
    message: partial.message || 'Please check What\'s coming, stay with neighbours, and mark yourself safe.',
    level: partial.level || 'Emergency',
    at: new Date().toISOString(),
  };
}

export function publishBlast(blast) {
  const payload = JSON.stringify(blast);
  try { localStorage.setItem(KEY, payload); } catch { /* ignore */ }
  try {
    const ch = new BroadcastChannel(CHANNEL);
    ch.postMessage(blast);
    ch.close();
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('ek-alert-blast', { detail: blast }));
}

export function subscribeBlast(onBlast) {
  const fromStore = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) onBlast(JSON.parse(raw));
    } catch { /* ignore */ }
  };
  fromStore();
  const onStorage = (e) => {
    if (e.key === KEY && e.newValue) {
      try { onBlast(JSON.parse(e.newValue)); } catch { /* ignore */ }
    }
  };
  const onCustom = (e) => onBlast(e.detail);
  window.addEventListener('storage', onStorage);
  window.addEventListener('ek-alert-blast', onCustom);
  let ch;
  try {
    ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = (e) => onBlast(e.data);
  } catch { /* ignore */ }
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('ek-alert-blast', onCustom);
    try { ch?.close(); } catch { /* ignore */ }
  };
}

export function clearBlast() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('ek-alert-blast', { detail: null }));
}
