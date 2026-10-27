import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BLAST_CH, readLiveBlast, clearLiveBlast } from '../lib/liveBlast';

export default function LiveBlastPopup() {
  const { pathname } = useLocation();
  const [blast, setBlast] = useState(() => readLiveBlast());
  const faint = pathname === '/incidents';

  useEffect(() => {
    const apply = (payload) => {
      if (!payload || payload.clear) setBlast(null);
      else setBlast(payload);
    };
    const onStorage = (e) => {
      if (e.key === 'ecokubatana_live_blast') {
        try { apply(e.newValue ? JSON.parse(e.newValue) : { clear: true }); } catch { /* ignore */ }
      }
    };
    const onCustom = (e) => apply(e.detail);
    let ch;
    try {
      ch = new BroadcastChannel(BLAST_CH);
      ch.onmessage = (e) => apply(e.data);
    } catch { /* ignore */ }
    window.addEventListener('storage', onStorage);
    window.addEventListener('ecokubatana-blast', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ecokubatana-blast', onCustom);
      ch?.close();
    };
  }, []);

  if (!blast?.message) return null;

  return (
    <div className={`live-blast ${faint ? 'live-blast--faint' : ''}`} role="alertdialog">
      <div className="live-blast__card">
        <p className="live-blast__kicker">{blast.level} · {blast.type}</p>
        <h2>{blast.location}</h2>
        <p>{blast.message}</p>
        <button type="button" className="btn btn--primary" onClick={() => { clearLiveBlast(); setBlast(null); }}>
          I understand
        </button>
      </div>
    </div>
  );
}
