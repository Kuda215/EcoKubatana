import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { alertsAPI, safetyAPI } from '../lib/api';
import { PLAYBOOK_STEPS } from '../lib/playbook';
import { loadOfflineAlerts } from '../lib/offline';
import './PageStyles.css';

const MENUS = {
  home: {
    title: 'EcoKubatana *123#',
    lines: ['1 Alerts', '2 I am safe', '3 I need help', '4 Playbook', '5 Stokvel hint', '0 Exit'],
  },
};

export default function UssdConsole() {
  const { user } = useAuth();
  const [screen, setScreen] = useState('home');
  const [log, setLog] = useState(['EcoKubatana *123#\n1 Alerts\n2 I am safe\n3 I need help\n4 Playbook\n5 Stokvel hint\n0 Exit']);
  const [alerts, setAlerts] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    alertsAPI.list().then((r) => {
      if (r.success && r.data?.length) setAlerts(r.data);
      else setAlerts(loadOfflineAlerts());
    }).catch(() => setAlerts(loadOfflineAlerts()));
  }, []);

  const push = (line) => setLog((prev) => [...prev.slice(-12), line]);

  const go = async (key) => {
    const k = String(key).trim();
    push(`> ${k}`);
    if (screen === 'home') {
      if (k === '1') {
        setScreen('alerts');
        const lines = (alerts[0] ? alerts.slice(0, 3) : [{ type: 'No live alert', message: 'All quiet.', level: 'Info' }])
          .map((a, i) => `${i + 1} ${a.level} ${a.type}: ${(a.message || '').slice(0, 70)}`);
        push(['ALERTS', ...lines, '0 Back'].join('\n'));
      } else if (k === '2' || k === '3') {
        const status = k === '2' ? 'safe' : 'need_help';
        const res = await safetyAPI.checkIn({ status, channel: 'ussd', alertId: alerts[0]?.id || null });
        push(res.success ? (status === 'safe' ? 'OK. You are marked SAFE.' : 'OK. HELP flagged. Stay on the line if you can.') : (res.error || 'Failed'));
        setScreen('home');
      } else if (k === '4') {
        setScreen('play');
        push(['PLAYBOOK', ...PLAYBOOK_STEPS.map((s) => `${s.n} ${s.title}`), '0 Back'].join('\n'));
      } else if (k === '5') {
        push('STOKVEL: open the app Stokvel tab to log grain, goats, cash. Dial 0.');
        setScreen('home');
      } else if (k === '0') {
        push('Session ended. Dial *123# again.');
        setScreen('home');
      } else {
        push('Invalid. 1-5 or 0.');
      }
    } else if (k === '0') {
      setScreen('home');
      push(MENUS.home.lines.join('\n'));
    } else if (screen === 'play') {
      const step = PLAYBOOK_STEPS.find((s) => String(s.n) === k);
      push(step ? `${step.title}: ${step.body}` : 'Pick 1-5 or 0.');
    } else {
      setScreen('home');
      push(MENUS.home.lines.join('\n'));
    }
    setInput('');
  };

  return (
    <div className="page">
      <p className="page__sub">Feature-phone path. Same menus a real *123# gateway (Africa&apos;s Talking / Twilio) would serve. Works offline from the last saved alerts.</p>
      <div className="ussd-phone">
        <div className="ussd-phone__notch">*123# · {user?.phone || 'no SIM yet'}</div>
        <pre className="ussd-phone__screen" aria-live="polite">{log[log.length - 1]}</pre>
        <form className="ussd-phone__keys" onSubmit={(e) => { e.preventDefault(); go(input || '0'); }}>
          <label className="form-label" htmlFor="ussd-in">Type a number</label>
          <input id="ussd-in" className="form-input" inputMode="numeric" value={input} onChange={(e) => setInput(e.target.value)} placeholder="1" />
          <button className="btn btn--primary" type="submit">Send</button>
        </form>
        <div className="ussd-pad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((n) => (
            <button key={n} type="button" onClick={() => go(n)}>{n}</button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--neutral-500)' }}>Network operators: map this screen to USSD code *123# and the same 1/2/0 replies.</p>
    </div>
  );
}
