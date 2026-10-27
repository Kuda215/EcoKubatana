import { Link } from 'react-router-dom';
import './PageStyles.css';

const actions = [
  { icon: '📋', title: 'Report an Incident',      desc: 'Quickly report a climate issue near you.',          link: '/report',    btn: 'Report Now',     color: '#072c30' },
  { icon: '📚', title: 'AI Knowledge Hub',        desc: 'Build your climate resilience skills.',             link: '/knowledge', btn: 'Start Learning', color: '#072c30' },
  { icon: '👥', title: 'Community Board',         desc: 'Connect and discuss with community members.',       link: '/community', btn: 'Join the Chat',  color: '#072c30' },
  { icon: '📍', title: 'Find nearest safety spots', desc: 'Hospitals, police, fire and clinics sit on Home, beside the map.', link: '/', btn: 'Open Home', color: '#072c30' },
  { icon: '❓', title: 'FAQ',                       desc: 'Answers to common questions about the platform.',   link: '#',          btn: 'View FAQ',       color: '#072c30' },
  { icon: '📦', title: 'More Resources',          desc: 'Access guides, tools, content and supplies.',       link: '/resources', btn: 'Explore More',   color: '#072c30' },
];

export default function TakeAction() {
  return (
    <div className="page">


      <div className="action-grid">
        {actions.map(a => (
          <div key={a.title} className="action-card">
            <div className="action-card__icon" style={{ background: '#e6f2f3', color: '#072c30' }}>{a.icon}</div>
            <h3 className="action-card__title">{a.title}</h3>
            <p className="action-card__desc">{a.desc}</p>
            <Link to={a.link} className="btn btn--primary" style={{ marginTop: 'auto' }}>{a.btn}</Link>
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
