import './PageStyles.css';

const alerts = [
  { id: 1, level: 'red',    icon: '🚨', title: 'Flash Flood Warning',        area: 'Nkulu Village',  time: '2h ago',   msg: 'Flash flood risk in low-lying areas. Move to higher ground immediately. Avoid river crossings.' },
  { id: 2, level: 'orange', icon: '⚠️', title: 'Drought Advisory',           area: 'Zava Village',   time: '6h ago',   msg: 'Water scarcity levels critical. Conserve water and report any broken infrastructure.' },
  { id: 3, level: 'yellow', icon: '🌡️', title: 'Heatwave Advisory',          area: 'Chakoma Area',   time: '1d ago',   msg: 'Temperatures expected to rise above 38°C. Stay hydrated and avoid midday sun.' },
  { id: 4, level: 'green',  icon: '✅', title: 'Strong Wind Warning Lifted', area: 'Harare North',   time: '2d ago',   msg: 'Wind conditions have normalized. Continue to check for structural damage to homes.' },
];

const levelLabel = { red: 'Critical', orange: 'High', yellow: 'Moderate', green: 'Resolved' };
const levelColor  = { red: '#e63946',  orange: '#f4a261', yellow: '#e9c46a', green: '#52b788' };

export default function Alerts() {
  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span className="badge badge--red">🔔 8 Active Alerts</span>
      </div>

      <div className="alert-list">
        {alerts.map(a => (
          <div key={a.id} className="alert-item" style={{ borderLeft: `4px solid ${levelColor[a.level]}` }}>
            <div className="alert-item__left">
              <span className="alert-item__icon">{a.icon}</span>
            </div>
            <div className="alert-item__body">
              <div className="alert-item__top">
                <h3 className="alert-item__title">{a.title}</h3>
                <span className="alert-level" style={{ background: levelColor[a.level] + '22', color: levelColor[a.level] }}>{levelLabel[a.level]}</span>
              </div>
              <div className="alert-item__meta">📍 {a.area} · 🕐 {a.time}</div>
              <p className="alert-item__msg">{a.msg}</p>
              <div className="alert-item__actions">
                <button className="btn btn--ghost">Share Alert</button>
                <button className="btn btn--primary">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscribe panel */}
      <div className="card subscribe-card">
        <h3 className="card__title">📲 Subscribe to Alerts</h3>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>Receive alerts via SMS or WhatsApp even with limited internet access.</p>
        <div className="subscribe-form">
          <input type="tel" placeholder="Enter your phone number" className="form-input" />
          <button className="btn btn--primary">Subscribe</button>
        </div>
      </div>
    </div>
  );
}
