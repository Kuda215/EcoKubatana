import { useState, useEffect } from 'react';
import './PageStyles.css';
import { wellbeingAPI } from '../lib/api';

export default function Wellbeing() {
  const [feeling, setFeeling] = useState('');
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  useEffect(() => {
    fetchShares();
  }, []);

  async function fetchShares() {
    setLoading(true);
    setError('');

    try {
      const result = await wellbeingAPI.getShares(20);

      if (!result.success) {
        throw new Error(result.error || 'Failed to load wellbeing shares');
      }

      setShares(result.data || []);
    } catch (err) {
      console.error('Error fetching wellbeing shares:', err);
      setError('Unable to load community shares. Please try again.');
      setShares([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    const content = feeling.trim();

    if (!content || sharing) return;

    setSharing(true);
    setError('');

    try {
      const result = await wellbeingAPI.createShare(content);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create share');
      }

      setShares((prev) => [result.data, ...prev]);
      setFeeling('');
    } catch (err) {
      console.error('Error creating wellbeing share:', err);
      setError(err.message || 'Unable to submit your share. Please try again.');
    } finally {
      setSharing(false);
    }
  }

  async function handleSupport(shareId) {
    setError('');

    try {
      const result = await wellbeingAPI.supportShare(shareId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to support share');
      }

      setShares((prev) => prev.map((share) => share.id === shareId ? { ...share, support_count: result.data.support_count } : share));
    } catch (err) {
      console.error('Error supporting share:', err);
      setError('Unable to support this share. Please try again.');
    }
  }

  async function handleFlag(shareId) {
    const share = shares.find((item) => item.id === shareId);

    if (share?.reported) return;

    try {
      setError('');
      setReportSuccess('');

      const result = await wellbeingAPI.flagShare(shareId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to flag share');
      }

      setShares((prev) => prev.map((item) => item.id === shareId ? { ...item, reported: true } : item));

      setReportSuccess('Thank you for reporting. It will be reviewed by an admin.');

      setTimeout(() => {
        setReportSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error flagging share:', err);
      setError('Unable to report this share. Please try again.');
    }
  }

  function timeAgo(date) {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;

    const hours = Math.floor(mins / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="page">

      <div className="wellbeing-grid">
        <div className="card wellbeing-card">
          <div className="wellbeing-card__icon">🧠</div>
          <h3>Mental Health Support</h3>
          <p>Connect with trained community wellbeing volunteers for anonymous, compassionate support during climate stress.</p>
          <button className="btn btn--primary">Find Support</button>
        </div>
        <div className="card wellbeing-card">
          <div className="wellbeing-card__icon">🤝</div>
          <h3>Community Circle</h3>
          <p>Join group discussions where community members share experiences, coping strategies, and hope with one another.</p>
          <button className="btn btn--primary">Join a Circle</button>
        </div>
        <div className="card wellbeing-card">
          <div className="wellbeing-card__icon">📞</div>
          <h3>Crisis Line</h3>
          <p>24/7 confidential support line for anyone experiencing distress related to climate events or displacement.</p>
          <button className="btn btn--calm">Call Now</button>
        </div>
        <div className="card wellbeing-card">
          <div className="wellbeing-card__icon">📓</div>
          <h3>Resilience Toolkit</h3>
          <p>Practical guides on managing anxiety, stress, and uncertainty during and after climate-related events.</p>
          <button className="btn btn--ghost">Download Toolkit</button>
        </div>
      </div>

      {error && (
        <div className="wellbeing-message wellbeing-message--error">{error}</div>
      )}

      {reportSuccess && !error && (
        <div className="wellbeing-message wellbeing-message--success">✓ {reportSuccess}</div>
      )}

      <div className="wellbeing-share-grid">

        <div className="card wellbeing-share-card">
          <h3 className="card__title">💬 Share How You're Feeling</h3>
          <p className="wellbeing-share-description">You're not alone. Share anonymously with your community.</p>
          <textarea className="form-textarea" rows={3} maxLength={2000} placeholder="How has the recent climate situation affected you? Share your experience…" value={feeling} onChange={(e) => setFeeling(e.target.value)} disabled={sharing} />
          <div className="wellbeing-character-count">{feeling.length}/2000</div>
          <button className="btn btn--primary wellbeing-share-button" onClick={handleShare} disabled={sharing || !feeling.trim()}>{sharing ? 'Sharing...' : 'Share Anonymously'}</button>
        </div>

        <div className="card wellbeing-share-card">
          <h3 className="card__title">🗨️ Recent Shares</h3>
          <p className="wellbeing-share-description">Anonymous experiences from your community.</p>

          <div className="wellbeing-share-list">
            {loading && (
              <p className="wellbeing-status">Loading…</p>
            )}

            {!loading && shares.length === 0 && (
              <p className="wellbeing-status">No shares yet. Be the first.</p>
            )}

            {!loading && shares.map((share) => (
              <div key={share.id} className="wellbeing-share-item">
                <p>{share.content}</p>

                <div className="wellbeing-share-item__footer">
                  <span className="wellbeing-share-item__time">{timeAgo(share.created_at)}</span>

                  <div className="wellbeing-share-item__actions">
                    <button type="button" className="wellbeing-action-button wellbeing-action-button--support" onClick={() => handleSupport(share.id)}>❤️ {share.support_count || 0} Support</button>

                    {share.reported ? (
                      <button type="button" className="wellbeing-action-button wellbeing-action-button--reported" disabled>✓ Reported</button>
                    ) : (
                      <button type="button" className="wellbeing-action-button wellbeing-action-button--report" onClick={() => handleFlag(share.id)}>🚩 Report</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
