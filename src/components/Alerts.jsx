import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { alertsAPI } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { LIVELIHOODS, EMERGENCY_PRIORITIES, AFRICA_HUBS } from '../lib/africaHubs';
import { hubForUser } from '../lib/dataSources';
import { numbersForIso } from '../lib/safetyPlaces';
import { PLAYBOOK_STEPS, speakPlaybook, stopSpeech } from '../lib/playbook';
import { saveOfflineAlerts, saveOfflinePlaybook, touchOfflineMeta, loadOfflineAlerts } from '../lib/offline';
import SafetyCheckIn from './SafetyCheckIn';
import SignPlaybook from './SignPlaybook';
import { useTranslation } from 'react-i18next';
import './PageStyles.css';

const levelIcon  = { Info: '✅', Warning: '🌡️', Critical: '⚠️', Emergency: '🚨' };
const levelColor = { Info: '#52b788', Warning: '#e9c46a', Critical: '#f4a261', Emergency: '#e63946' };

function timeAgo(date) {
  const diff = Date.now() - date;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const ALERT_TYPES = ['Weather Alert', 'Fire Emergency', 'Flood Warning', 'Evacuation Notice', 'General Emergency'];
const ALERT_LEVELS = ['Info', 'Warning', 'Critical', 'Emergency'];
const emptyProposeForm = { type: ALERT_TYPES[0], level: 'Info', area: '', message: '', targets: { all: true, volunteers: true, admins: false } };

export default function Alerts() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState(null);
  const [proposeForm, setProposeForm] = useState(emptyProposeForm);
  const [proposeStatus, setProposeStatus] = useState(null);
  const [proposing, setProposing] = useState(false);
  const [playbook, setPlaybook] = useState(null);
  const [guideOpen, setGuideOpen] = useState(true);

  const livelihood = user?.livelihood || 'other';
  const livelihoodLabel = LIVELIHOODS.find((l) => l.value === livelihood)?.label || livelihood || 'Household';
  const playbookKey = LIVELIHOODS.some((l) => l.value === livelihood) ? livelihood : 'other';
  const priorityLabels = (user?.emergency_priorities || []).map((p) => EMERGENCY_PRIORITIES.find((x) => x.value === p)?.label || p);
  const localNumbers = numbersForIso(hubForUser(AFRICA_HUBS, user?.location)?.iso3);

  useEffect(() => {
    alertsAPI.list()
      .then(result => {
        if (result.success && result.data?.length) {
          setAlerts(result.data);
          saveOfflineAlerts(result.data);
          touchOfflineMeta();
        } else {
          setAlerts(loadOfflineAlerts());
        }
      })
      .catch(() => setAlerts(loadOfflineAlerts()))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user?.phone]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.from('emergency_playbooks').select('*').eq('livelihood', playbookKey).maybeSingle();
      if (!cancelled && data) {
        setPlaybook(data);
        saveOfflinePlaybook(data);
      }
    })();
    return () => { cancelled = true; };
  }, [playbookKey]);

  const steps = playbook?.steps?.length ? playbook.steps : PLAYBOOK_STEPS;

  const handleSubscribe = async () => {
    if (!phone.trim()) return;
    try {
      const result = await alertsAPI.subscribe(phone.trim());
      if (result.success) {
        setSubscribeStatus({ msg: '✓ Subscribed! You\'ll receive alerts via SMS/WhatsApp.', type: 'success' });
      } else {
        setSubscribeStatus({ msg: result.error || 'Could not subscribe right now. Try again.', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      setSubscribeStatus({ msg: 'Could not subscribe right now. Try again.', type: 'error' });
    }
  };

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!proposeForm.message.trim()) return;
    setProposing(true);
    try {
      const result = await alertsAPI.create(proposeForm);
      if (result.success) {
        setProposeStatus({ msg: '✓ Submitted for admin review. It\'ll go live once approved.', type: 'success' });
        setProposeForm(emptyProposeForm);
      } else {
        setProposeStatus({ msg: result.error || 'Could not submit. Try again.', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to propose alert:', error);
      setProposeStatus({ msg: 'Could not submit. Try again.', type: 'error' });
    } finally {
      setProposing(false);
    }
  };

  const emergencies = alerts.filter((a) => a.level === 'Emergency' || a.level === 'Critical');

  useEffect(() => {
    const top = emergencies[0];
    if (!top) return;
    const spokenKey = `ek_spoken_${top.id}`;
    if (sessionStorage.getItem(spokenKey)) return;
    sessionStorage.setItem(spokenKey, '1');
    speakPlaybook(PLAYBOOK_STEPS, i18n.language).catch(() => {});
    return () => stopSpeech();
  }, [emergencies[0]?.id, i18n.language]);

  return (
    <div className="page">
      <div className="alert-guide card">
        <button className="alert-guide__toggle" onClick={() => setGuideOpen((o) => !o)}>
          <span>🛟 What to do in an emergency</span>
          <span>{guideOpen ? 'Hide' : 'Show'}</span>
        </button>
        {guideOpen && (
          <div className="alert-guide__body">
            <p>
              You are signed in as a <strong>{livelihoodLabel}</strong>.
              {priorityLabels.length > 0 && <> We will keep <strong>{priorityLabels.join(', ')}</strong> at the front of every step.</>}
            </p>
            <ol className="playbook-steps">
              {steps.map((s) => (
                <li key={s.n || s.title}>
                  <span className="playbook-n">{s.n || '•'}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="emergency-strip">
              <a href={`tel:${localNumbers.police}`}>👮 Police {localNumbers.police}</a>
              <a href={`tel:${localNumbers.fire}`}>🚒 Fire {localNumbers.fire}</a>
              <a href={`tel:${localNumbers.medical}`}>🏥 Medical {localNumbers.medical}</a>
            </div>
            <button type="button" className="btn btn--ghost" style={{ marginTop: 12 }} onClick={() => speakPlaybook(PLAYBOOK_STEPS, i18n.language)}>
              🔊 Read playbook aloud
            </button>
            <Link to="/CommunitySolutions" className="btn btn--primary" style={{ marginTop: 12, marginLeft: 8, display: 'inline-block' }}>
              Where to now? Follow by voice
            </Link>
          </div>
        )}
      </div>

      {emergencies.length > 0 && <SafetyCheckIn alertId={emergencies[0].id} channel="app" />}
      {emergencies.length === 0 && <SafetyCheckIn channel="app" />}
      <SignPlaybook steps={PLAYBOOK_STEPS} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="badge badge--red">🔔 {alerts.length} Active Alerts</span>
        {emergencies.length > 0 && <span className="badge badge--red">🚨 {emergencies.length} need action now</span>}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card__title">📝 Propose an Alert</h3>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
          Anyone can submit an alert for review - an admin needs to approve it before it goes out to the community.
        </p>
        <form className="report-form" onSubmit={handlePropose}>
          <div className="form-group">
            <label className="form-label">Alert Type *</label>
            <select className="form-input" value={proposeForm.type}
              onChange={e => setProposeForm({ ...proposeForm, type: e.target.value })}>
              {ALERT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Alert Level *</label>
            <div className="filter-tabs">
              {ALERT_LEVELS.map(lvl => (
                <button key={lvl} type="button"
                  className={`filter-tab ${proposeForm.level === lvl ? 'filter-tab--active' : ''}`}
                  onClick={() => setProposeForm({ ...proposeForm, level: lvl })}
                >{lvl}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Target Area *</label>
            <input type="text" className="form-input" placeholder="e.g., Harare, Lagos, Beira, or All Areas"
              value={proposeForm.area} onChange={e => setProposeForm({ ...proposeForm, area: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Alert Message *</label>
            <textarea className="form-textarea" rows="4" placeholder="Say what is happening, where, and the first action people should take."
              value={proposeForm.message} onChange={e => setProposeForm({ ...proposeForm, message: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Send To *</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[['all', 'All Members'], ['volunteers', 'Volunteers'], ['admins', 'Admins Only']].map(([key, label]) => (
                <label key={key} className="setting-toggle">
                  <input type="checkbox" checked={proposeForm.targets[key]}
                    onChange={e => setProposeForm({ ...proposeForm, targets: { ...proposeForm.targets, [key]: e.target.checked } })} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={proposing || !proposeForm.message.trim()}>
            {proposing ? 'Submitting...' : '📝 Submit for Review'}
          </button>
          {proposeStatus && (
            <p style={{ fontSize: '13px', marginTop: '8px', color: proposeStatus.type === 'error' ? '#e63946' : '#52b788' }}>
              {proposeStatus.msg}
            </p>
          )}
        </form>
      </div>

      {loading && <div className="cb-empty">Loading alerts…</div>}
      {!loading && alerts.length === 0 && (
        <div className="cb-empty">No active alerts right now. 🌿 Keep the playbook handy.</div>
      )}

      <div className="alert-list">
        {alerts.map(a => (
          <div key={a.id} className="alert-item" style={{ borderLeft: `4px solid ${levelColor[a.level]}` }}>
            <div className="alert-item__left">
              <span className="alert-item__icon">{levelIcon[a.level]}</span>
            </div>
            <div className="alert-item__body">
              <div className="alert-item__top">
                <h3 className="alert-item__title">{a.type}</h3>
                <span className="alert-level" style={{ background: levelColor[a.level] + '22', color: levelColor[a.level] }}>{a.level}</span>
              </div>
              <div className="alert-item__meta">📍 {a.area} · 🕐 {timeAgo(new Date(a.created_at))}</div>
              <p className="alert-item__msg">{a.message}</p>
              {(a.level === 'Emergency' || a.level === 'Critical') && (
                <p className="alert-item__msg" style={{ fontWeight: 600 }}>
                  For you as a {livelihoodLabel}: start at step 1 of the guide above
                  {priorityLabels[0] ? ` - protect ${priorityLabels[0]} first.` : '.'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card subscribe-card">
        <h3 className="card__title">📲 Subscribe to Alerts</h3>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>Receive alerts via SMS or WhatsApp even with limited internet access.</p>
        <div className="subscribe-form">
          <input type="tel" placeholder="Enter your phone number" className="form-input"
            value={phone} onChange={e => { setPhone(e.target.value); setSubscribeStatus(null); }} />
          <button className="btn btn--primary" onClick={handleSubscribe} disabled={!phone.trim()}>Subscribe</button>
        </div>
        {subscribeStatus && (
          <p style={{ fontSize: '13px', marginTop: '8px', color: subscribeStatus.type === 'error' ? '#e63946' : '#52b788' }}>
            {subscribeStatus.msg}
          </p>
        )}
      </div>
    </div>
  );
}
