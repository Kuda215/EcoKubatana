import { useEffect, useState } from 'react';
import { safetyAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function SafetyCheckIn({ alertId, channel = 'app' }) {
  const { isAdmin } = useAuth();
  const [mine, setMine] = useState(null);
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');

  const refresh = () => {
    safetyAPI.list(alertId || undefined).then((r) => {
      if (r.success) setList(r.data || []);
    }).catch(() => {});
  };

  useEffect(() => { refresh(); }, [alertId]);

  const send = async (status) => {
    const result = await safetyAPI.checkIn({ alertId, status, channel });
    if (result.success) {
      setMine(status);
      setMsg(status === 'safe' ? 'Thanks. You are marked safe.' : 'Thanks. We have flagged that you need help.');
      refresh();
    } else {
      setMsg(result.error || 'Could not send.');
    }
  };

  const safeCount = list.filter((r) => r.status === 'safe').length;
  const helpCount = list.filter((r) => r.status === 'need_help').length;

  return (
    <div className="card safety-checkin">
      <h3 className="card__title">Reply 1 if you are safe</h3>
      <p className="text-muted" style={{ fontSize: 14 }}>
        After an emergency blast we send: “Reply 1 if you are safe. Reply 2 if you need help.” Do it here, on *123#, or on WhatsApp.
      </p>
      <div className="safety-checkin__btns">
        <button type="button" className="btn btn--primary" onClick={() => send('safe')} disabled={mine === 'safe'}>1 - I am safe</button>
        <button type="button" className="btn btn--danger" onClick={() => send('need_help')} disabled={mine === 'need_help'}>2 - I need help</button>
      </div>
      {msg && <p style={{ marginTop: 8, color: 'var(--heading-color)' }}>{msg}</p>}
      <p style={{ fontSize: 13, marginTop: 12 }}>{safeCount} safe · {helpCount} need help</p>
      {isAdmin && list.length > 0 && (
        <ul className="safety-checkin__list">
          {list.slice(0, 12).map((row) => (
            <li key={row.id}>
              {row.status === 'safe' ? 'safe' : 'needs help'} · {row.channel} · {new Date(row.created_at).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
