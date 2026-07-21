import { Link } from 'react-router-dom';
import './PageStyles.css';

const actions = [
  { icon: '📋', title: 'Report an Incident',      desc: 'Quickly report a climate issue near you.',          link: '/report',    btn: 'Report Now',    color: '#e63946' },
  { icon: '📚', title: 'Learning Hub',             desc: 'Build your climate resilience skills.',             link: '/learning',  btn: 'Start Learning', color: '#2d6a4f' },
  { icon: '👥', title: 'Community Chat',           desc: 'Connect and discuss with community members.',       link: '/community', btn: 'Join the Chat',  color: '#457b9d' },
  { icon: '📍', title: 'Find Nearest Help Nest',   desc: 'Locate the nearest community support center.',      link: '#',          btn: 'Locate Map',     color: '#f4a261' },
  { icon: '❓', title: 'FAQ',                      desc: 'Answers to common questions about the platform.',   link: '#',          btn: 'View FAQ',       color: '#7b5ea7' },
  { icon: '📦', title: 'More Resources',           desc: 'Access guides, tools, content and supplies.',       link: '/resources', btn: 'Explore More',   color: '#52b788' },
];

export default function TakeAction() {
  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">🌱 Take Action</h1>
          <p className="page__sub">Every action matters. Start here to make a difference in your community.</p>
        </div>
      </div>

      <div className="action-grid">
        {actions.map(a => (
          <div key={a.title} className="action-card" style={{ borderTop: `4px solid ${a.color}` }}>
            <div className="action-card__icon" style={{ background: a.color + '18', color: a.color }}>{a.icon}</div>
            <h3 className="action-card__title">{a.title}</h3>
            <p className="action-card__desc">{a.desc}</p>
            <Link to={a.link} className="btn btn--primary" style={{ background: a.color, marginTop: 'auto' }}>{a.btn}</Link>
          </div>
        ))}
      </div>

      {/* Emergency CTA */}
      <div className="emergency-banner">
        <div>
          <h3>🚨 In an Emergency?</h3>
          <p>Call the community emergency line or text HELP to 911 for immediate assistance.</p>
        </div>
        <button className="btn btn--orange" style={{ background: '#e63946', color: '#fff', flexShrink: 0 }}>Call Emergency Line</button>
      </div>
    </div>
  );
}
