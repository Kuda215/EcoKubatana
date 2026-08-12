import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const ROLE_OPTIONS = [
  { value: 'member',    label: 'Member',    icon: '👤', color: '#10b981' },
  { value: 'volunteer', label: 'Volunteer', icon: '🤝', color: '#3b82f6' },
  { value: 'admin',     label: 'Admin',     icon: '⚙️', color: '#f43f5e' },
];

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState('choose'); // 'choose' | 'register' | 'signin'
  const [step, setStep] = useState(1);        // for register: 1 = role, 2 = form
  const [role, setRole] = useState('');
  const [signinRole, setSigninRole] = useState('member');
  const [signinData, setSigninData] = useState({ identifier: '', password: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Ferndale, Johannesburg'
  });

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    login({ ...formData, role, joinedAt: new Date().toISOString() });
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    const identifier = signinData.identifier.trim();
    const name = identifier.includes('@') ? identifier.split('@')[0] : identifier;
    login({
      name,
      email: identifier.includes('@') ? identifier : `${identifier}@ecokubatana.app`,
      role: signinRole,
      location: 'Ferndale, Johannesburg',
      joinedAt: new Date().toISOString()
    });
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

        {/* Sign in mode */}
        {mode === 'signin' && (
          <div className="login-form-container">
            <button className="back-button" onClick={() => setMode('choose')}>← Back</button>
            <div className="selected-role-badge" style={{ background: '#0a3d2e' }}>
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
                <label htmlFor="signin-identifier" className="form-label">Username or Email *</label>
                <input
                  type="text"
                  id="signin-identifier"
                  className="form-input"
                  required
                  placeholder="Enter username or email"
                  value={signinData.identifier}
                  onChange={e => setSigninData({ ...signinData, identifier: e.target.value })}
                  autoComplete="username"
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
              <button type="submit" className="btn-submit">Sign In →</button>
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
          <div className="login-form-container">
            <button className="back-button" onClick={() => setStep(1)}>← Back to role selection</button>
            <div className="selected-role-badge" style={{ background: '#0a3d2e' }}>
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
                  onChange={handleChange} required placeholder="your.email@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number *</label>
                <input type="tel" id="phone" name="phone" className="form-input" value={formData.phone}
                  onChange={handleChange} required placeholder="+27 XX XXX XXXX" />
              </div>
              <div className="form-group">
                <label htmlFor="location" className="form-label">Location *</label>
                <input type="text" id="location" name="location" className="form-input" value={formData.location}
                  onChange={handleChange} required placeholder="City, Region" />
              </div>
              <button type="submit" className="btn-submit">Join EcoKubatana →</button>
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




