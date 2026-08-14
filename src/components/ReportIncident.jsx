import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { incidentsAPI } from '../lib/api';
import './PageStyles.css';

const incidentTypes = ['Flood', 'Drought', 'Heatwave', 'Strong Winds', 'Landslide', 'Wildfire', 'Pollution', 'Other'];
console.log('ReportIncident component initialized.');
export default function ReportIncident() {

  console.log('ReportIncident component mounted.');
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', type: '', location: '', description: '', severity: 'medium', reporter_name: '', reporter_contact: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await incidentsAPI.create({
        title: form.title,
        type: form.type,
        location: form.location,
        description: form.description,
        severity: form.severity,
        reporter_name: form.reporter_name || user?.name || 'Anonymous',
        reporter_contact: form.reporter_contact,
      });

      if (result.success) {
        setSubmitted(true);
        setForm({ title: '', type: '', location: '', description: '', severity: 'medium', reporter_name: '', reporter_contact: '' });
      } else {
        setError(result.error || 'Failed to submit incident');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page">
        <div className="success-banner">
          <div className="success-icon">✅</div>
          <h2>Incident Reported!</h2>
          <p>Thank you for keeping your community informed. Our team will review and act on your report.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn--primary" onClick={() => setSubmitted(false)}>Report Another</button>
            <a href="/incidents" className="btn btn--ghost">View All Incidents</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">📋 Report an Incident</h1>
          <p className="page__sub">Help your community stay safe — report what you see around you.</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: '#fee', border: '1px solid #e63946' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <strong style={{ color: '#e63946' }}>Error:</strong>
              <p style={{ margin: '4px 0 0', color: '#666' }}>{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label className="form-label">Incident Title *</label>
            <input name="title" required className="form-input" placeholder="e.g. Flooding near the river bank" value={form.title} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type of Incident *</label>
              <select name="type" required className="form-input" value={form.type} onChange={handleChange}>
                <option value="">Select type…</option>
                {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select name="severity" className="form-input" value={form.severity} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High / Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Area *</label>
            <input name="location" required className="form-input" placeholder="e.g. Nkulu Village, Guta District" value={form.location} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" required className="form-input" rows="4" placeholder="Describe what happened and current situation..." value={form.description} onChange={handleChange}></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Your Name (optional)</label>
              <input name="reporter_name" className="form-input" placeholder={user?.name || "Anonymous if left blank"} value={form.reporter_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact (optional)</label>
              <input name="reporter_contact" className="form-input" placeholder="Phone or WhatsApp number" value={form.reporter_contact} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn--primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
            {submitting ? 'Submitting...' : 'Submit Incident Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
