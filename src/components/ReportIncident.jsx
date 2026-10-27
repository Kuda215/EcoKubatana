import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocationPlace } from '../contexts/LocationContext';
import { incidentsAPI, incidentImagesAPI, incidentAnalysisAPI, alertsAPI } from '../lib/api';
import { saveMyReport } from '../lib/myReports';
import './PageStyles.css';

const incidentTypes = ['Flood', 'Drought', 'Heatwave', 'Strong Winds', 'Landslide', 'Wildfire', 'Pollution', 'Other'];

const NOT_CLIMATE_MSG = "You won't be able to report this incident";

const ALERT_TYPE_FOR = { Flood: 'Flood Warning', Wildfire: 'Fire Emergency' };
const ALERT_LEVEL_FOR = { high: 'Critical', medium: 'Warning', low: 'Info' };
const WOW_MOVES = {
  Flood: ['Move people uphill', 'Keep grain off the floor', 'Stay off swollen rivers'],
  Drought: ['Share water points', 'Mulch what is left', 'Protect breeding stock'],
  Heatwave: ['Shade the young and old', 'Work at dawn', 'Check on neighbours'],
  Wildfire: ['Clear a break', 'Ready 995', 'Do not burn trash today'],
  Pollution: ['Keep children indoors', 'Boil or fetch clean water', 'Photo the source'],
  Landslide: ['Leave the slope', 'Watch cracks in soil', 'Warn downhill homes'],
  'Strong Winds': ['Tie down roofs', 'Bring stock in', 'Stay off trees'],
  Other: ['Tell the ward', 'Keep the photo', 'Ask the street what they saw'],
};

console.log('ReportIncident component initialized.');
export default function ReportIncident() {

  console.log('ReportIncident component mounted.');
  const { user } = useAuth();
  const { area, place } = useLocationPlace();
  const [areaCheck, setAreaCheck] = useState(null);
  const [form, setForm] = useState({ title: '', type: '', location: '', description: '', severity: 'medium', reporter_name: '', reporter_contact: '' });

  useEffect(() => {
    if (!area) return;
    setForm((f) => ({ ...f, location: area }));
  }, [area]);

  useEffect(() => {
    if (!form.type || !form.location) {
      setAreaCheck(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      incidentsAPI.recommendInArea({
        type: form.type,
        location: form.location,
        lat: place?.lat,
        lng: place?.lng,
      }).then((r) => {
        if (!cancelled && r.success) setAreaCheck(r.data);
      }).catch(() => {});
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [form.type, form.location, place?.lat, place?.lng]);
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
        const data = analysisResult.data;
        if (data?.climateRelated === false) {
          setAiAnalysis(null);
          setImageUrl(null);
          setImageError(NOT_CLIMATE_MSG);
        } else {
          setAiAnalysis(data);
          // The photo decides type and severity; the dropdowns lock while it is attached
          setForm(f => ({ ...f, type: data.likelyType, severity: data.suggestedSeverity }));
        }
      } else {
        setAiAnalysis(null);
        setImageUrl(null);
        setImageError(NOT_CLIMATE_MSG);
      }
    } catch {
      setAiAnalysis(null);
      setImageUrl(null);
      setImageError(NOT_CLIMATE_MSG);
    } finally {
      setImageUploading(false);
      setAnalyzing(false);
    }
  };

  // Manual type/severity only when no photo is driving them
  const photoLocked = !!aiAnalysis || imageUploading || analyzing;

  const removePhoto = () => {
    setImageUrl(null);
    setAiAnalysis(null);
    setAlertProposed(false);
    setImageError(null);
    setForm(f => ({ ...f, type: '', severity: 'medium' }));
  };

  const handleProposeAlert = async () => {
    if (!aiAnalysis || aiAnalysis.climateRelated === false) return;
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
    if (imageError === NOT_CLIMATE_MSG || (aiAnalysis && aiAnalysis.climateRelated === false)) {
      setError(NOT_CLIMATE_MSG);
      return;
    }
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
        saveMyReport(user?.id, result.data || {
          title: form.title,
          type: form.type,
          location: form.location,
          description: form.description,
          severity: form.severity,
          status: 'pending',
          reporter_id: user?.id,
          reported_at: new Date().toISOString(),
        });
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
          <p className="page__sub">Report a climate or environment incident you can see - flood, drought, heat, storm, fire, landslide, or pollution.</p>
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

      <div className="report-split">
        <div className="form-card">
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label className="form-label">Incident Title *</label>
              <input name="title" required className="form-input" placeholder="e.g. Flooding near the river bank" value={form.title} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type of Incident *</label>
                <select name="type" required className="form-input" value={form.type} onChange={handleChange} disabled={photoLocked}>
                  <option value="">{photoLocked ? 'Reading the photo…' : 'Select type…'}</option>
                  {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select name="severity" className="form-input" value={form.severity} onChange={handleChange} disabled={photoLocked}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High / Critical</option>
                </select>
              </div>
            </div>
            {aiAnalysis && (
              <p style={{ margin: '-8px 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
                🤖 Type and severity were set from your photo.{' '}
                <button type="button" className="btn btn--ghost" style={{ padding: '2px 8px', fontSize: 13 }} onClick={removePhoto}>
                  Remove photo to choose yourself
                </button>
              </p>
            )}

            <div className="form-group">
              <label className="form-label">Location / Area *</label>
              <input name="location" required className="form-input" placeholder="e.g. Nkulu Village, Guta District" value={form.location} onChange={handleChange} />
              {areaCheck && (
                <p className={`area-check ${areaCheck.likely ? 'area-check--yes' : 'area-check--no'}`}>
                  {areaCheck.likely ? 'Live data supports this incident in the area. ' : 'Live data does not strongly support this incident here. '}
                  {areaCheck.reason}
                </p>
              )}
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

            <button type="submit" disabled={submitting || imageError === NOT_CLIMATE_MSG} className="btn btn--primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
              {imageError === NOT_CLIMATE_MSG ? NOT_CLIMATE_MSG : submitting ? 'Submitting...' : 'Submit Incident Report'}
            </button>
          </form>
        </div>

        <aside className="report-ai">
          <p className="report-ai__kicker">Live photo read</p>
          <h2 className="report-ai__headline">
            {aiAnalysis ? 'What the street just showed us' : 'Drop a photo. Watch it think.'}
          </h2>
          <input type="file" accept="image/*" className="report-ai__file" onChange={handleImageChange} disabled={imageUploading || analyzing} />
          {imageError && <p className="report-ai__err">{imageError}</p>}

          <div className="report-ai__photo">
            {imageUrl ? <img src={imageUrl} alt="Uploaded incident" /> : <p style={{ padding: 40, opacity: 0.7 }}>Climate photos only - flood, dry fields, heat, wind damage, fire, slope, or pollution.</p>}
            {(imageUploading || analyzing) && (
              <div className="report-ai__loader">
                <div className="report-ai__rings" />
                <div className="report-ai__scan" />
                <p>ANALYZING</p>
                <small>{imageUploading ? 'Uploading the photo…' : 'Checking this is a climate photo'}</small>
              </div>
            )}
          </div>

          {aiAnalysis ? (
            <>
              <div className="report-ai__type">{aiAnalysis.likelyType}</div>
              <p style={{ margin: 0, opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {aiAnalysis.suggestedSeverity} severity
              </p>
              <div className="report-ai__sev" aria-hidden>
                {['low', 'medium', 'high'].map((level, i) => (
                  <span
                    key={level}
                    className={['low', 'medium', 'high'].indexOf(aiAnalysis.suggestedSeverity) >= i ? 'is-on' : ''}
                  />
                ))}
              </div>
              <p className="report-ai__quote">{aiAnalysis.assessment}</p>
              <div className="report-ai__chips">
                {(WOW_MOVES[aiAnalysis.likelyType] || WOW_MOVES.Other).map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
              {alertProposed ? (
                <p style={{ fontWeight: 700 }}>Alert proposed - pending review</p>
              ) : (
                <button type="button" className="btn btn--primary" onClick={handleProposeAlert} disabled={alertProposing}>
                  {alertProposing ? 'Proposing…' : 'Alert nearby communities'}
                </button>
              )}
            </>
          ) : (
            <p style={{ fontSize: 18, lineHeight: 1.4, opacity: 0.85 }}>
              {analyzing || imageUploading
                ? 'Reading land, water, smoke, and heat…'
                : 'AI only reads climate photos. Unrelated pictures are rejected.'}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
