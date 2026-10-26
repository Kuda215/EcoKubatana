import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { useFeatures } from '../contexts/FeatureContext';
import { useAccess } from '../contexts/AccessContext';
import { EMERGENCY_PRIORITIES } from '../lib/africaHubs';
import LivelihoodPicker from './LivelihoodPicker';
import TagInput from './TagInput';
import './PageStyles.css';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const { catalog, isEnabled, setDraft, save, saving, saveMsg } = useFeatures();
  const [fontSize, setFontSize] = useState('medium');
  const [livelihood, setLivelihood] = useState(user?.livelihood || '');
  const [priorities, setPriorities] = useState(() =>
    (user?.emergency_priorities || []).map((p) => EMERGENCY_PRIORITIES.find((x) => x.value === p)?.label || p)
  );
  const [profileMsg, setProfileMsg] = useState('');
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

  const saveProfile = async () => {
    const result = await updateUser({
      livelihood: (livelihood || '').trim(),
      emergency_priorities: priorities,
      onboarding_complete: true,
    });
    setProfileMsg(result.success ? 'Profile saved.' : (result.error || 'Could not save.'));
  };

  const handleSaveAll = async () => {
    await saveProfile();
    await save();
  };

  return (
    <div className="page">
      <div className="settings-grid">
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="card__title">✨ Extra tools (toggles)</h3>
          <p style={{ color: 'var(--neutral-500)', marginBottom: 16 }}>
            Default accounts keep today&apos;s community tools. Paid extras unlock forecast analysis and technical tabs. Defaults live in Supabase <code>feature_catalog</code>.
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
          <p style={{ color: 'var(--neutral-500)', marginBottom: 16 }}>Switch-control friendly: every control is a large target. Voice Report is in the top bar.</p>
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

        <div className="card">
          <h3 className="card__title">👤 Profile</h3>
          <p><strong>Name:</strong> {user?.name || '-'}</p>
          <p><strong>Location:</strong> {user?.location || '-'}</p>
          <p><strong>Role:</strong> {user?.role || 'member'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        {(saveMsg || profileMsg) && <span style={{ fontSize: 13, color: '#047857' }}>{saveMsg || profileMsg}</span>}
        <button className="btn btn--primary" onClick={handleSaveAll} disabled={saving}>
          {saving ? 'Saving…' : t('settings.save', { defaultValue: 'Save changes' })}
        </button>
      </div>
    </div>
  );
}
