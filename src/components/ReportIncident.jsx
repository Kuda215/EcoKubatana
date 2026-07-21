import { useState } from 'react';
import './PageStyles.css';

const incidentTypes = ['Flood', 'Drought', 'Heatwave', 'Strong Winds', 'Landslide', 'Wildfire', 'Other'];

export default function ReportIncident() {
  const [form, setForm] = useState({ title: '', type: '', location: '', description: '', severity: 'medium', name: '', contact: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page">
        <div className="success-banner">
          <div className="success-icon">✅</div>
          <h2>Incident Reported!</h2>
          <p>Thank you for keeping your community informed. Our team will review and act on your report.</p>
          <button className="btn btn--primary" onClick={() => setSubmitted(false)}>Report Another</button>
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
            <textarea name="description" required className="form-textarea" rows={4} placeholder="Describe what you see, when it started, and who is affected…" value={form.description} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">📷 Attach Photo / Video (optional)</label>
            <div className="upload-area">
              <span>📁 Tap to upload or take a photo</span>
              <input type="file" accept="image/*,video/*" style={{ display: 'none' }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Your Name (optional)</label>
              <input name="name" className="form-input" placeholder="Anonymous if left blank" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact (optional)</label>
              <input name="contact" className="form-input" placeholder="Phone or WhatsApp number" value={form.contact} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn--primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
            Submit Incident Report
          </button>
        </form>
      </div>
    </div>
  );
}
