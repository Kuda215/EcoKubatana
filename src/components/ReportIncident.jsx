import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { incidentsAPI, incidentImagesAPI, incidentAnalysisAPI, alertsAPI } from '../lib/api';
import './PageStyles.css';

const incidentTypes = ['Flood', 'Drought', 'Heatwave', 'Strong Winds', 'Landslide', 'Wildfire', 'Pollution', 'Other'];

const ALERT_TYPE_FOR = { Flood: 'Flood Warning', Wildfire: 'Fire Emergency' };
const ALERT_LEVEL_FOR = { high: 'Critical', medium: 'Warning', low: 'Info' };

console.log('ReportIncident component initialized.');
export default function ReportIncident() {

  console.log('ReportIncident component mounted.');
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', type: '', location: '', description: '', severity: 'medium', reporter_name: '', reporter_contact: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [imageUrl, setImageUrl] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [alertProposing, setAlertProposing] = useState(false);
  const [alertProposed, setAlertProposed] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setAiAnalysis(null);
    setAlertProposed(false);
    setImageUploading(true);
    setImageUrl(null);

    try {
      const uploadResult = await incidentImagesAPI.upload(file);
      if (!uploadResult.success) {
        setImageError(uploadResult.error || 'Failed to upload photo');
        setImageUploading(false);
        return;
      }
      setImageUrl(uploadResult.url);
      setImageUploading(false);

      setAnalyzing(true);
      const analysisResult = await incidentAnalysisAPI.analyze(uploadResult.url);
      if (analysisResult.success) {
        setAiAnalysis(analysisResult.data);
      } else {
        setImageError(analysisResult.error || 'Could not analyze this photo');
      }
    } catch (err) {
      setImageError(err.message);
    } finally {
      setImageUploading(false);
      setAnalyzing(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiAnalysis) return;
    setForm(f => ({ ...f, type: aiAnalysis.likelyType, severity: aiAnalysis.suggestedSeverity }));
  };

  const handleProposeAlert = async () => {
    if (!aiAnalysis) return;
    setAlertProposing(true);
    try {
      const result = await alertsAPI.create({
        type: ALERT_TYPE_FOR[aiAnalysis.likelyType] || 'General Emergency',
        level: ALERT_LEVEL_FOR[aiAnalysis.suggestedSeverity] || 'Warning',
        area: form.location || 'All Areas',
        message: `AI-assisted report: ${aiAnalysis.assessment} Please stay alert and follow official guidance for this area.`,
        targets: { all: true, volunteers: true, admins: false },
      });
      if (result.success) {
        setAlertProposed(true);
      } else {
        setImageError(result.error || 'Failed to propose alert');
      }
    } catch (err) {
      setImageError(err.message);
    } finally {
      setAlertProposing(false);
    }
  };

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
        image_url: imageUrl || undefined,
      });

      if (result.success) {
        setSubmitted(true);
        setForm({ title: '', type: '', location: '', description: '', severity: 'medium', reporter_name: '', reporter_contact: '' });
        setImageUrl(null);
        setAiAnalysis(null);
        setAlertProposed(false);
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

          <div className="form-group">
            <label className="form-label">Photo (optional)</label>
            <input type="file" accept="image/*" className="form-input" onChange={handleImageChange} disabled={imageUploading || analyzing} />
            {imageError && <p style={{ color: '#e63946', fontSize: '13px', marginTop: '6px' }}>{imageError}</p>}

            {imageUrl && (
              <img src={imageUrl} alt="Uploaded incident" style={{ marginTop: '10px', maxWidth: '240px', borderRadius: '8px', display: 'block' }} />
            )}

            {(imageUploading || analyzing) && (
              <p style={{ fontSize: '13px', color: 'var(--neutral-500)', marginTop: '8px' }}>
                {imageUploading ? 'Uploading photo…' : '🤖 Analyzing photo…'}
              </p>
            )}

            {aiAnalysis && (
              <div style={{ marginTop: '12px', padding: '14px', background: '#f1f5f4', borderRadius: '8px', border: '1px solid #d1dbd8' }}>
                <div style={{ fontWeight: 700, color: '#0a3d2e', marginBottom: '4px' }}>🤖 AI Photo Assessment</div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#374151' }}>
                  Likely type: <strong>{aiAnalysis.likelyType}</strong> · Suggested severity: <strong>{aiAnalysis.suggestedSeverity}</strong>
                  <br />
                  {aiAnalysis.assessment}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn--secondary" onClick={applyAiSuggestion}>
                    Use this type & severity
                  </button>
                  {alertProposed ? (
                    <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600, alignSelf: 'center' }}>
                      ✓ Alert proposed — pending admin review
                    </span>
                  ) : (
                    <button type="button" className="btn btn--primary" onClick={handleProposeAlert} disabled={alertProposing}>
                      {alertProposing ? 'Proposing…' : '🚨 Alert nearby communities?'}
                    </button>
                  )}
                </div>
              </div>
            )}
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
