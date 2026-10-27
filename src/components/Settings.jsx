import { useState } from 'react';
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
import { useLocationPlace } from '../contexts/LocationContext';
import './PageStyles.css';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const { area } = useLocationPlace();
  const { catalog, isEnabled, setDraft, save, saving, saveMsg } = useFeatures();
  const [tab, setTab] = useState('personal');
  const [fontSize, setFontSize] = useState('medium');
  const [livelihood, setLivelihood] = useState(user?.livelihood || '');
  const [priorities, setPriorities] = useState(() =>
    (user?.emergency_priorities || []).map((p) => EMERGENCY_PRIORITIES.find((x) => x.value === p)?.label || p)
  );
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
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

  const saveProfile = async () => {
    const payload = {
      name: name.trim(),
      location: (area || location).trim(),
      livelihood: (livelihood || '').trim(),
      emergency_priorities: priorities,
      onboarding_complete: true,
    };
    if (avatar) payload.avatar_url = avatar;
    const result = await updateUser(payload);
    setProfileMsg(result.success ? 'Profile saved.' : (result.error || 'Could not save.'));
  };

  const handleSaveAll = async () => {
    await saveProfile();
    await save();
  };

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
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            <label className="form-label" style={{ marginTop: 12 }}>Home location</label>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px' }}>This is your default. Address search is below - pick a town and it follows you across the app.</p>
            <div className="settings-place">
              <PlaceSearch compact={false} inputId="settings-place" persist />
            </div>
            <p style={{ marginTop: 12 }}><strong>Role:</strong> {user?.role || 'member'}</p>
          </div>

          <div className="card">
            <h3 className="card__title">🌾 What you do</h3>
            <p style={{ color: 'var(--neutral-500)', marginBottom: 16 }}>
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
            <h3 className="card__title">🔤 Font Size</h3>
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
            <p style={{ color: 'var(--neutral-500)', marginBottom: 16 }}>{t('settings.languageDesc')}</p>
            <select
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
            <p style={{ color: 'var(--neutral-500)', marginBottom: 12 }}>
              Sends a popup to every member using EcoKubatana right now, and files the alert for the feed.
            </p>
            <label className="form-label">Type</label>
            <select className="form-input" value={blast.type} onChange={(e) => setBlast({ ...blast, type: e.target.value })}>
              {['Flood', 'Drought', 'Heatwave', 'Cyclone', 'Wildfire', 'Community alert'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <label className="form-label" style={{ marginTop: 10 }}>Level</label>
            <select className="form-input" value={blast.level} onChange={(e) => setBlast({ ...blast, level: e.target.value })}>
              {['Warning', 'Critical', 'Emergency'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <label className="form-label" style={{ marginTop: 10 }}>Area</label>
            <input className="form-input" value={blast.location} onChange={(e) => setBlast({ ...blast, location: e.target.value })} />
            <label className="form-label" style={{ marginTop: 10 }}>Message</label>
            <textarea className="form-input" rows={3} value={blast.message} onChange={(e) => setBlast({ ...blast, message: e.target.value })} placeholder="What should every member do now?" />
            <button type="button" className="btn btn--primary" style={{ marginTop: 14 }} onClick={triggerCommunityAlert} disabled={blasting}>
              {blasting ? 'Sending…' : 'Trigger alert for all members'}
            </button>
            {blastMsg && <p style={{ marginTop: 8, fontSize: 13 }}>{blastMsg}</p>}
          </div>
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="card__title">✨ Extra tools (toggles)</h3>
            <p style={{ color: 'var(--neutral-500)', marginBottom: 16 }}>
              Turn on *123# here to show it in the menu. Paid extras unlock forecast analysis and technical tabs.
            </p>
            <div className="setting-toggles">
              {catalog.map((f) => (
                <label key={f.key} className="setting-toggle">
                  <input type="checkbox" checked={isEnabled(f.key)} onChange={(e) => setDraft(f.key, e.target.checked)} />
                  <span>
                    <strong>{f.icon} {f.label}</strong>
                    {f.is_premium && <span className="premium-badge">Paid extra</span>}
                    <br />
                    <span style={{ color: 'var(--neutral-500)', fontSize: 13 }}>{f.description}</span>
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
            Data: NASA EONET, Open-Meteo / GloFAS, ReliefWeb, World Bank, OpenStreetMap. Voice uses the free browser speech tools.
            Safety spots use OSM hospitals, police and fire around hub cities, plus national emergency numbers.
          </p>
          <p style={{ color: 'var(--neutral-500)' }}>Ubuntu · Collaboration · Resilience</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        {(saveMsg || profileMsg) && <span style={{ fontSize: 13, color: '#072c30' }}>{saveMsg || profileMsg}</span>}
        <button className="btn btn--primary" onClick={handleSaveAll} disabled={saving}>
          {saving ? 'Saving…' : t('settings.save', { defaultValue: 'Save changes' })}
        </button>
      </div>
    </div>
  );
}
