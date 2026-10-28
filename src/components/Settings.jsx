import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { useFeatures } from '../contexts/FeatureContext';
import { useAccess } from '../contexts/AccessContext';
import { EMERGENCY_PRIORITIES } from '../lib/africaHubs';
import { getAvatarUrl, setLocalAvatar, resizeImageFile } from '../lib/avatar';
import { incidentImagesAPI, alertsAPI } from '../lib/api';
import { sendLiveBlast } from '../lib/liveBlast';
import LivelihoodPicker from './LivelihoodPicker';
import TagInput from './TagInput';
import PlaceSearch from './PlaceSearch';
import './PageStyles.css';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const { catalog, isEnabled, setAndSave, saveMsg } = useFeatures();
  const [tab, setTab] = useState('personal');
  const [fontSize, setFontSize] = useState('medium');
  const [livelihood, setLivelihood] = useState(user?.livelihood || '');
  const [priorities, setPriorities] = useState(() =>
    (user?.emergency_priorities || []).map((p) => EMERGENCY_PRIORITIES.find((x) => x.value === p)?.label || p)
  );
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(getAvatarUrl(user));
  const [profileMsg, setProfileMsg] = useState('');
  const [blast, setBlast] = useState({ type: 'Flood', level: 'Emergency', location: 'All members', message: '' });
  const [blastMsg, setBlastMsg] = useState('');
  const [blasting, setBlasting] = useState(false);
  const { flags, setFlag } = useAccess();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('ecokubatana_language', lang);
    updateUser({ preferred_language: lang }).catch(() => {});
  };

  const handleFontChange = (size) => {
    setFontSize(size);
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[size];
  };

  const onPickPhoto = async (file) => {
    if (!file) return;
    try {
      const blob = await resizeImageFile(file);
      const asFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      const uploaded = await incidentImagesAPI.upload(asFile);
      const url = uploaded.success ? uploaded.url : URL.createObjectURL(blob);
      setAvatar(url);
      setLocalAvatar(url);
      const result = await updateUser({ avatar_url: url });
      if (!result.success) setLocalAvatar(url);
      setProfileMsg(result.success ? 'Photo saved.' : 'Photo saved on this device.');
    } catch (err) {
      setProfileMsg(err.message || 'Could not use that photo.');
    }
  };

  // Autosave the typed fields shortly after the user stops typing.
  // Photo, location, language, font and access already save the moment they change.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (!name.trim()) return;
    const timer = setTimeout(async () => {
      const result = await updateUser({
        name: name.trim(),
        livelihood: (livelihood || '').trim(),
        emergency_priorities: priorities,
        onboarding_complete: true,
      });
      setProfileMsg(result.success ? '✓ Saved' : (result.error || 'Could not save.'));
    }, 800);
    return () => clearTimeout(timer);
  }, [name, livelihood, priorities]);

  const triggerCommunityAlert = async () => {
    if (!blast.message.trim()) {
      setBlastMsg('Write what people should do.');
      return;
    }
    setBlasting(true);
    setBlastMsg('');
    sendLiveBlast(blast);
    try {
      await alertsAPI.create({
        type: blast.type,
        level: blast.level,
        area: blast.location,
        message: blast.message,
        targets: { all: true, volunteers: true, admins: true },
      });
    } catch { /* popup already shown to everyone on this device / tab */ }
    setBlastMsg('Alert sent to all members. A popup is on every open session.');
    setBlasting(false);
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Settings</h1>
          <p className="page__sub">Your profile, language, access options and extra tools.</p>
        </div>
      </div>
      <div className="settings-tabs">
        {[
          ['personal', '👤 Personal'],
          ['tools', '✨ Tools'],
          ['about', 'ℹ️ About'],
        ].map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'is-on' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'personal' && (
        <div className="settings-grid">
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="card__title">Profile picture</h3>
            <div className="settings-avatar-row">
              {avatar
                ? <img src={avatar} alt="" className="settings-avatar-preview" />
                : <div className="settings-avatar-preview settings-avatar-preview--letter">{(name || user?.name || 'U')[0]?.toUpperCase()}</div>}
              <label className="btn btn--ghost">
                Choose photo
                <input type="file" accept="image/*" hidden onChange={(e) => onPickPhoto(e.target.files?.[0])} />
              </label>
            </div>
          </div>

          <div className="card">
            <h3 className="card__title">Your details</h3>
            <label className="form-label" htmlFor="settings-name">Name *</label>
            <input id="settings-name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            <label className="form-label" htmlFor="settings-place" style={{ marginTop: 12 }}>Home location</label>
            <p className="text-muted" style={{ fontSize: 13, margin: '0 0 8px' }}>This is your default place. Search below, pick a town, and the app uses it everywhere.</p>
            <div className="settings-place">
              <PlaceSearch compact={false} inputId="settings-place" persist />
            </div>
            <p style={{ marginTop: 12 }}><strong>Role:</strong> {user?.role || 'member'}</p>
          </div>

          <div className="card">
            <h3 className="card__title">🌾 What you do</h3>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              In an emergency we lead with this. Farmer is the example: crops, livestock, water. Or type your own work under Other.
            </p>
            <LivelihoodPicker value={livelihood} onChange={setLivelihood} onSuggestPriorities={setPriorities} />
            <div style={{ marginTop: 16 }}>
              <TagInput
                label="If an emergency hits, protect first"
                values={Array.isArray(priorities) ? priorities : []}
                onChange={setPriorities}
                suggestions={EMERGENCY_PRIORITIES.map((p) => p.label)}
                placeholder="e.g. my goats; school fees; irrigation pump"
              />
            </div>
          </div>

          <div className="card">
            <h3 className="card__title">🔤 Font size</h3>
            <div className="setting-options">
              {['small', 'medium', 'large'].map((size) => (
                <button key={size} className={`setting-option ${fontSize === size ? 'setting-option--active' : ''}`} onClick={() => handleFontChange(size)}>
                  <span className="setting-option__label">{size[0].toUpperCase() + size.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="card__title">🌍 {t('settings.language')}</h3>
            <p className="text-muted" style={{ marginBottom: 16 }}>{t('settings.languageDesc')}</p>
            <select
              aria-label={t('settings.language')}
              className="form-input"
              value={SUPPORTED_LANGUAGES.includes(i18n.language) ? i18n.language : 'en'}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              {SUPPORTED_LANGUAGES.map((code) => (
                <option key={code} value={code}>{LANGUAGE_LABELS[code]}</option>
              ))}
            </select>
          </div>

          <div className="card">
            <h3 className="card__title">♿ Access</h3>
            <div className="setting-toggles">
              {[
                ['highContrast', 'High contrast'],
                ['reduceMotion', 'Reduce motion'],
                ['dyslexiaFont', 'Dyslexia-friendly font'],
                ['colorBlind', 'Colour-blind map (letters + patterns)'],
                ['bigTargets', 'Bigger tap targets'],
                ['smsOnly', 'SMS-only (hide maps, text lists)'],
              ].map(([key, label]) => (
                <label key={key} className="setting-toggle">
                  <input type="checkbox" checked={!!flags[key]} onChange={(e) => setFlag(key, e.target.checked)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'tools' && (
        <div className="settings-grid">
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="card__title">Trigger community alert</h3>
            <p className="text-muted" style={{ marginBottom: 12 }}>
              Sends a popup to every member using EcoKubatana right now, and files the alert for the feed.
            </p>
            <label className="form-label" htmlFor="blast-type">Type</label>
            <select id="blast-type" className="form-input" value={blast.type} onChange={(e) => setBlast({ ...blast, type: e.target.value })}>
              {['Flood', 'Drought', 'Heatwave', 'Cyclone', 'Wildfire', 'Community alert'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <label className="form-label" htmlFor="blast-level" style={{ marginTop: 10 }}>Level</label>
            <select id="blast-level" className="form-input" value={blast.level} onChange={(e) => setBlast({ ...blast, level: e.target.value })}>
              {['Warning', 'Critical', 'Emergency'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <label className="form-label" htmlFor="blast-area" style={{ marginTop: 10 }}>Area</label>
            <input id="blast-area" className="form-input" value={blast.location} onChange={(e) => setBlast({ ...blast, location: e.target.value })} />
            <label className="form-label" htmlFor="blast-message" style={{ marginTop: 10 }}>Message *</label>
            <textarea id="blast-message" className="form-input" rows={3} value={blast.message} onChange={(e) => setBlast({ ...blast, message: e.target.value })} placeholder="What should every member do now?" />
            <button type="button" className="btn btn--danger" style={{ marginTop: 14 }} onClick={triggerCommunityAlert} disabled={blasting}>
              {blasting ? 'Sending…' : 'Trigger alert for all members'}
            </button>
            {blastMsg && <p className="text-muted" style={{ marginTop: 8, fontSize: 13 }}>{blastMsg}</p>}
          </div>
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="card__title">✨ Extra tools</h3>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Turn on *123# here to show it in the menu. Paid extras unlock forecast analysis and technical tabs.
            </p>
            <div className="setting-toggles">
              {catalog.map((f) => (
                <label key={f.key} className="setting-toggle">
                  <input type="checkbox" checked={isEnabled(f.key)} onChange={(e) => { setProfileMsg(''); setAndSave(f.key, e.target.checked); }} />
                  <span>
                    <strong>{f.icon} {f.label}</strong>
                    {f.is_premium && <span className="premium-badge">Paid extra</span>}
                    <br />
                    <span className="text-muted" style={{ fontSize: 13 }}>{f.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'about' && (
        <div className="card">
          <h3 className="card__title">About EcoKubatana</h3>
          <p style={{ lineHeight: 1.7 }}>
            EcoKubatana is where neighbours share what they see, decide together, and act before climate harm grows. Regular members report, learn, and help each other cut risk in their own streets and fields.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            Data comes from NASA, Open-Meteo, GloFAS, ReliefWeb, the World Bank and OpenStreetMap. Voice uses your browser's free speech tools.
            Safety spots show hospitals, police and fire stations from OpenStreetMap, plus national emergency numbers.
          </p>
          <p className="text-muted">Ubuntu · Collaboration · Resilience</p>
        </div>
      )}

      {(profileMsg || saveMsg) && (
        <p className="text-muted" style={{ textAlign: 'right', marginTop: 16, fontSize: 13 }}>
          {profileMsg || saveMsg}
        </p>
      )}
    </div>
  );
}
