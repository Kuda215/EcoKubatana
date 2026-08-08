import { useState } from 'react';
import './PageStyles.css';

export default function Settings() {
  const [fontSize, setFontSize] = useState('medium');
  const [language, setLanguage] = useState('en');

  const handleFontChange = (size) => {
    setFontSize(size);
    // Apply font size to body
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[size];
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">⚙️ Settings</h1>
          <p className="page__sub">Customize your EcoKubatana experience</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Font Size Settings */}
        <div className="card">
          <h3 className="card__title">🔤 Font Size</h3>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '16px' }}>
            Adjust the text size for better readability
          </p>
          <div className="setting-options">
            <button
              className={`setting-option ${fontSize === 'small' ? 'setting-option--active' : ''}`}
              onClick={() => handleFontChange('small')}
            >
              <span className="setting-option__label">Small</span>
              <span className="setting-option__desc">Compact text</span>
            </button>
            <button
              className={`setting-option ${fontSize === 'medium' ? 'setting-option--active' : ''}`}
              onClick={() => handleFontChange('medium')}
            >
              <span className="setting-option__label">Medium</span>
              <span className="setting-option__desc">Default size</span>
            </button>
            <button
              className={`setting-option ${fontSize === 'large' ? 'setting-option--active' : ''}`}
              onClick={() => handleFontChange('large')}
            >
              <span className="setting-option__label">Large</span>
              <span className="setting-option__desc">Easier to read</span>
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="card">
          <h3 className="card__title">🌍 Language</h3>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '16px' }}>
            Select your preferred language
          </p>
          <div className="form-group">
            <label className="form-label">Language Selection</label>
            <select
              className="form-input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="sn">Shona</option>
              <option value="nd">Ndebele</option>
              <option value="sw">Swahili</option>
              <option value="fr">French</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--neutral-400)', marginTop: '12px' }}>
            💡 More languages coming soon
          </p>
        </div>

        {/* Accessibility Settings */}
        <div className="card">
          <h3 className="card__title">♿ Accessibility</h3>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '16px' }}>
            Make EcoKubatana easier to use
          </p>
          <div className="setting-toggles">
            <label className="setting-toggle">
              <input type="checkbox" />
              <span>High contrast mode</span>
            </label>
            <label className="setting-toggle">
              <input type="checkbox" />
              <span>Reduce animations</span>
            </label>
            <label className="setting-toggle">
              <input type="checkbox" defaultChecked />
              <span>Screen reader support</span>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <h3 className="card__title">🔔 Notifications</h3>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '16px' }}>
            Control how you receive updates
          </p>
          <div className="setting-toggles">
            <label className="setting-toggle">
              <input type="checkbox" defaultChecked />
              <span>Climate alerts</span>
            </label>
            <label className="setting-toggle">
              <input type="checkbox" defaultChecked />
              <span>Community updates</span>
            </label>
            <label className="setting-toggle">
              <input type="checkbox" />
              <span>Weekly summary email</span>
            </label>
            <label className="setting-toggle">
              <input type="checkbox" />
              <span>SMS notifications</span>
            </label>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="card">
          <h3 className="card__title">👤 Profile</h3>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '16px' }}>
            Your account information
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <strong style={{ color: 'var(--neutral-700)' }}>Name:</strong>
              <span style={{ marginLeft: '8px', color: 'var(--neutral-600)' }}>Thandiwe</span>
            </div>
            <div>
              <strong style={{ color: 'var(--neutral-700)' }}>Location:</strong>
              <span style={{ marginLeft: '8px', color: 'var(--neutral-600)' }}>Harare, Zimbabwe</span>
            </div>
            <div>
              <strong style={{ color: 'var(--neutral-700)' }}>Member since:</strong>
              <span style={{ marginLeft: '8px', color: 'var(--neutral-600)' }}>January 2026</span>
            </div>
            <button className="btn btn--ghost" style={{ marginTop: '8px' }}>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="card">
          <h3 className="card__title">🔒 Data & Privacy</h3>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '16px' }}>
            Control your data and privacy
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn btn--ghost">Download my data</button>
            <button className="btn btn--ghost">Privacy policy</button>
            <button className="btn btn--ghost">Delete account</button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button className="btn btn--ghost">Cancel</button>
        <button className="btn btn--primary">Save Changes</button>
      </div>
    </div>
  );
}
