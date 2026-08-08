import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: role selection, 2: details input
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Ferndale, Johannesburg'
  });

  const roles = [
    {
      value: 'member',
      label: 'Member',
      icon: '👤',
      description: 'Join as a community member to receive alerts, report incidents, and stay informed',
      color: '#10b981'
    },
    {
      value: 'volunteer',
      label: 'Volunteer',
      icon: '🤝',
      description: 'Volunteer to help respond to incidents, coordinate actions, and support the community',
      color: '#0ea5e9'
    },
    {
      value: 'admin',
      label: 'Admin',
      icon: '⚙️',
      description: 'Manage the platform, review reports, send alerts, and coordinate emergency responses',
      color: '#f43f5e'
    }
  ];

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      ...formData,
      role,
      joinedAt: new Date().toISOString()
    };
    login(userData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

        {step === 1 ? (
          <div className="role-selection">
            <h2 className="section-title">Join Our Community</h2>
            <p className="section-subtitle">Choose how you want to participate</p>

            <div className="role-cards">
              {roles.map((roleOption) => (
                <button
                  key={roleOption.value}
                  className="role-card"
                  onClick={() => handleRoleSelect(roleOption.value)}
                  style={{ '--role-color': roleOption.color }}
                >
                  <div className="role-card-icon">{roleOption.icon}</div>
                  <h3 className="role-card-title">{roleOption.label}</h3>
                  <p className="role-card-description">{roleOption.description}</p>
                  <div className="role-card-arrow">→</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="login-form-container">
            <button className="back-button" onClick={() => setStep(1)}>
              ← Back to role selection
            </button>

            <div className="selected-role-badge" style={{ background: roles.find(r => r.value === role)?.color }}>
              <span className="selected-role-icon">{roles.find(r => r.value === role)?.icon}</span>
              <span className="selected-role-label">Joining as {roles.find(r => r.value === role)?.label}</span>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+27 XX XXX XXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="City, Region"
                />
              </div>

              <button type="submit" className="btn-submit">
                Join EcoKubatana →
              </button>

              <p className="login-footer-text">
                By joining, you agree to receive climate alerts and emergency notifications
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
