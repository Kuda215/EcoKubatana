import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocationPlace } from '../contexts/LocationContext';
import { EMERGENCY_PRIORITIES } from '../lib/africaHubs';
import LivelihoodPicker from './LivelihoodPicker';
import TagInput from './TagInput';
import PlaceSearch from './PlaceSearch';
import './Login.css';

const ROLE_OPTIONS = [
  { value: 'member',    label: 'Member',    icon: '👤', color: '#1a5c63' },
  { value: 'volunteer', label: 'Volunteer', icon: '🤝', color: '#3b82f6' },
  { value: 'admin',     label: 'Admin',     icon: '⚙️', color: '#f43f5e' },
];

export default function Login() {
  const { login, register } = useAuth();
  const { area } = useLocationPlace();
  const [mode, setMode] = useState('choose'); // 'choose' | 'register' | 'signin'
  const [step, setStep] = useState(1);        // register: 1 role, 2 livelihood, 3 form
  const [role, setRole] = useState('');
  const [livelihood, setLivelihood] = useState('');
  const [priorities, setPriorities] = useState([]);
  const [signinRole, setSigninRole] = useState('member');
  const [signinData, setSigninData] = useState({ identifier: '', password: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const home = (formData.location || area || '').trim();
    if (!home) {
      setError('Search and pick your location');
      return;
    }

    setLoading(true);
    const result = await register(formData.email, formData.password, {
      name: formData.name,
      role,
      location: home,
      phone: formData.phone,
      livelihood: livelihood.trim(),
      emergency_priorities: priorities,
    });

    setLoading(false);

    if (result.success) {
      // Success - user is now logged in
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(signinData.identifier, signinData.password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-pattern"></div>
      </div>

      <div className="login-content">
        <div className="login-header">
          <div className="login-logo">
            <span className="login-logo-icon">🌿</span>
            <h1>EcoKubatana</h1>
          </div>
          <p className="login-tagline">Stronger Communities, Safer Tomorrow</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        {/* Sign in mode */}
        {mode === 'signin' && (
          <div className="login-form-container">
            <button className="back-button" onClick={() => { setMode('choose'); setError(''); }}>← Back</button>
            <div className="selected-role-badge" style={{ background: 'var(--primary-dark)' }}>
              <span className="selected-role-icon">🔑</span>
              <span className="selected-role-label">Sign in to your account</span>
            </div>

            {/* Role toggle */}
            <div className="signin-role-toggle">
              <p className="signin-role-label">Signing in as</p>
              <div className="role-toggle-pills">
                {ROLE_OPTIONS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    className={`role-pill ${signinRole === r.value ? 'role-pill--active' : ''}`}
                    style={signinRole === r.value ? { background: r.color, borderColor: r.color } : { borderColor: r.color, color: r.color }}
                    onClick={() => setSigninRole(r.value)}
                  >
                    {r.icon} {r.label}
                  </button>
                ))}
              </div>
            </div>

            <form className="login-form" onSubmit={handleSignIn}>
              <div className="form-group">
                <label htmlFor="signin-identifier" className="form-label">Email *</label>
                <input
                  type="email"
                  id="signin-identifier"
                  className="form-input"
                  required
                  placeholder="your.email@example.com"
                  value={signinData.identifier}
                  onChange={e => setSigninData({ ...signinData, identifier: e.target.value })}
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signin-password" className="form-label">Password *</label>
                <input
                  type="password"
                  id="signin-password"
                  className="form-input"
                  required
                  placeholder="Enter your password"
                  value={signinData.password}
                  onChange={e => setSigninData({ ...signinData, password: e.target.value })}
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In →'}
              </button>
            </form>
          </div>
        )}

        {/* New user: role selection */}
        {mode === 'register' && step === 1 && (
          <div className="role-selection">
            <div className="role-selection-header">
              <button className="back-button" onClick={() => setMode('choose')}>← Back</button>
              <h2 className="section-title">Choose your role</h2>
              <p className="section-subtitle">Select how you want to participate</p>
            </div>
            <div className="role-cards">
              {ROLE_OPTIONS.map((roleOption) => (
                <button key={roleOption.value} className="role-card"
                  onClick={() => handleRoleSelect(roleOption.value)}
                  style={{ '--role-color': roleOption.color }}
                >
                  <div className="role-card-icon">{roleOption.icon}</div>
                  <h3 className="role-card-title">{roleOption.label}</h3>
                  <p className="role-card-description">
                    {roleOption.value === 'member' && 'Receive alerts, report incidents, and stay informed'}
                    {roleOption.value === 'volunteer' && 'Help respond to incidents and support the community'}
                    {roleOption.value === 'admin' && 'Manage the platform and coordinate emergency responses'}
                  </p>
                  <div className="role-card-arrow">→</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* New user: details form */}
        {mode === 'register' && step === 2 && (
          <div className="role-selection">
            <div className="role-selection-header">
              <button className="back-button" onClick={() => setStep(1)}>← Back</button>
              <h2 className="section-title">What do you do?</h2>
              <p className="section-subtitle">Pick from the list, or Other and type it. Example: Farmer - we will put crops, livestock and water first in an emergency.</p>
            </div>
            <LivelihoodPicker
              value={livelihood}
              onChange={setLivelihood}
              onSuggestPriorities={setPriorities}
            />
            {livelihood?.trim() && (
              <>
                <div style={{ marginTop: 16 }}>
                  <TagInput
                    label="If an emergency hits, protect first"
                    values={priorities}
                    onChange={setPriorities}
                    suggestions={EMERGENCY_PRIORITIES.map((p) => p.label)}
                    placeholder="e.g. my goats; school fees; irrigation pump"
                  />
                </div>
                <button className="btn-submit" style={{ marginTop: 20 }} disabled={!livelihood.trim()} onClick={() => setStep(3)}>
                  Continue →
                </button>
              </>
            )}
          </div>
        )}

        {mode === 'register' && step === 3 && (
          <div className="login-form-container">
            <button className="back-button" onClick={() => { setStep(2); setError(''); }}>← Back to what you do</button>
            <div className="selected-role-badge" style={{ background: 'var(--primary-dark)' }}>
              <span className="selected-role-icon">{ROLE_OPTIONS.find(r => r.value === role)?.icon}</span>
              <span className="selected-role-label">Joining as {ROLE_OPTIONS.find(r => r.value === role)?.label}</span>
            </div>
            <form className="login-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input type="text" id="name" name="name" className="form-input" value={formData.name}
                  onChange={handleChange} required placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input type="email" id="email" name="email" className="form-input" value={formData.email}
                  onChange={handleChange} required placeholder="your.email@example.com" autoComplete="email" />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password *</label>
                <input type="password" id="password" name="password" className="form-input" value={formData.password}
                  onChange={handleChange} required placeholder="At least 6 characters" autoComplete="new-password" minLength={6} />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                <input type="password" id="confirmPassword" name="confirmPassword" className="form-input" value={formData.confirmPassword}
                  onChange={handleChange} required placeholder="Re-enter your password" autoComplete="new-password" minLength={6} />
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number *</label>
                <input type="tel" id="phone" name="phone" className="form-input" value={formData.phone}
                  onChange={handleChange} required placeholder="+27 XX XXX XXXX" />
              </div>
              <div className="form-group">
                <label htmlFor="register-place" className="form-label">Location *</label>
                <PlaceSearch
                  compact={false}
                  inputId="register-place"
                  onPicked={(_hit, label) => setFormData((f) => ({ ...f, location: label }))}
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Join EcoKubatana →'}
              </button>
              <p className="login-footer-text">
                By joining, you agree to receive climate alerts and emergency notifications.
              </p>
            </form>
          </div>
        )}

        {/* Choose: new or returning */}
        {mode === 'choose' && (
          <div className="auth-choice">
            <h2 className="section-title">Welcome</h2>
            <p className="section-subtitle">Sign in or create a new account</p>
            <div className="auth-choice-buttons">
              <button className="auth-choice-btn auth-choice-btn--primary" onClick={() => setMode('signin')}>
                <span className="auth-choice-icon">🔑</span>
                <div>
                  <strong>Sign In</strong>
                  <span>Already have an account</span>
                </div>
              </button>
              <button className="auth-choice-btn auth-choice-btn--secondary" onClick={() => setMode('register')}>
                <span className="auth-choice-icon">✨</span>
                <div>
                  <strong>Create Account</strong>
                  <span>New to EcoKubatana</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




