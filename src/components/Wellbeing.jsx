import './PageStyles.css';

export default function Wellbeing() {
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

      <div className="card" style={{ marginTop: 0 }}>
        <h3 className="card__title">💬 Share How You're Feeling</h3>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>You're not alone. Share anonymously with your community.</p>
        <textarea className="form-textarea" rows={3} placeholder="How has the recent climate situation affected you? Share your experience…" />
        <button className="btn btn--primary" style={{ marginTop: '10px' }}>Share Anonymously</button>
      </div>
    </div>
  );
}
