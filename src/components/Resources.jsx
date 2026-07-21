import './PageStyles.css';

const resources = [
  { cat: 'Emergency',    icon: '🚨', title: 'Emergency Contacts',         desc: 'All important numbers for flood, fire, and medical emergencies.' },
  { cat: 'Guide',        icon: '📋', title: 'Household Preparedness Guide',desc: 'Step-by-step guide to prepare your home for climate events.' },
  { cat: 'Download',     icon: '📥', title: 'Drought Response Toolkit',   desc: 'Practical tools and tips for water conservation during drought.' },
  { cat: 'Guide',        icon: '🌱', title: 'Sustainable Farming Guide',  desc: 'Drought-resilient crops and farming methods for Southern Africa.' },
  { cat: 'Emergency',    icon: '🏥', title: 'First Aid for Heat Stroke',  desc: 'Quick reference guide on treating heat-related illnesses.' },
  { cat: 'Download',     icon: '🗺️',  title: 'Community Risk Map',        desc: 'Interactive map showing high-risk flood and drought zones.' },
];

const catColor = { Emergency: '#e63946', Guide: '#2d6a4f', Download: '#457b9d' };

export default function Resources() {
  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">📦 Resources</h1>
          <p className="page__sub">Guides, toolkits, and emergency contacts to help your community stay prepared.</p>
        </div>
        <div className="search-bar">
          <input className="form-input" placeholder="🔍 Search resources…" style={{ width: '200px' }} />
        </div>
      </div>

      <div className="filter-tabs">
        {['All', 'Emergency', 'Guide', 'Download'].map(t => (
          <button key={t} className={`filter-tab ${t === 'All' ? 'filter-tab--active' : ''}`}>{t}</button>
        ))}
      </div>

      <div className="resources-grid">
        {resources.map(r => (
          <div key={r.title} className="resource-card" style={{ borderTop: `3px solid ${catColor[r.cat]}` }}>
            <div className="resource-card__icon">{r.icon}</div>
            <span className="resource-card__cat" style={{ color: catColor[r.cat] }}>{r.cat}</span>
            <h3 className="resource-card__title">{r.title}</h3>
            <p className="resource-card__desc">{r.desc}</p>
            <button className="btn btn--ghost" style={{ marginTop: 'auto', borderColor: catColor[r.cat], color: catColor[r.cat] }}>
              {r.cat === 'Download' ? '⬇ Download' : 'View Resource'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
