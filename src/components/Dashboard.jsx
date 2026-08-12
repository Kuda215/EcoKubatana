import { Link } from 'react-router-dom';
import './Dashboard.css';

const stats = [
  { label: 'Peer Incidents',       value: '12', sub: 'This Year',       icon: '⚠️',  trend: '+20% from last year' },
  { label: 'Community Members',    value: '2,345', sub: 'Across all areas', icon: '👥', trend: '+15% this month' },
  { label: 'Active Alerts',        value: '8',  sub: 'Across all areas', icon: '🔔',  trend: 'View Alerts →' },
  { label: 'Solutions Shared',     value: '23', sub: 'By community',    icon: '🌱',  trend: 'Explore Solutions →' },
];

const recentUpdates = [
  { user: 'Thandiwe', action: 'New rainwater harvesting training this Saturday at the Community Hall', area: 'Harare Group', time: '2 hours ago', type: 'event' },
  { user: 'Dumisani M.', action: 'Shared a solution: fenced garden beds to prevent soil erosion', area: 'Zava Village', time: '4 hours ago', type: 'solution' },
  { user: 'Community', action: 'Community clean-up campaign happening next week!', area: 'All Areas', time: '1 day ago', type: 'campaign' },
];

const helpfulResources = [
  { icon: '🚨', label: 'Emergency Contacts', desc: 'Quick contacts to keep you safe' },
  { icon: '📋', label: 'Preparedness Guide', desc: 'How to prepare your household' },
  { icon: '📣', label: 'Report an Incident', desc: 'Tell us what\'s happening near you' },
];

const weatherDays = [
  { day: 'Today', icon: '⛅', temp: '18°C' },
  { day: 'Wed',   icon: '🌧️', temp: '14°C' },
  { day: 'Thu',   icon: '🌤️', temp: '21°C' },
  { day: 'Fri',   icon: '☀️', temp: '24°C' },
  { day: 'Sat',   icon: '⛅', temp: '19°C' },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Climate Incident Highlight */}
      <div className="dashboard__highlight">
        <div className="highlight__badge">⚠️ HIGHLIGHT: CLIMATE INCIDENT</div>
        <div className="highlight__body">
          <div className="highlight__info">
            <h2>🌧️ Heavy Rainfall &amp; Flooding</h2>
            <p className="highlight__location">Nkulu Village, Guta District 📍</p>
            <p><strong>Date:</strong> 14–16 July 2026</p>
            <p>Heavy rainfall caused river overflow and flooding in low-lying areas. Stay safe and follow local alerts.</p>
            <div className="highlight__actions">
              <Link to="/incidents" className="btn btn--primary">View Incident Details</Link>
              <Link to="/alerts" className="btn btn--ghost">See All Alerts →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard__stats">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__icon">{s.icon}</div>
            <div>
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__sub">{s.sub}</div>
              <div className="stat-card__trend">{s.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="dashboard__mid">
        {/* Incidents Summary */}
        <div className="card">
          <h3 className="card__title">Incidents by Type (This Year)</h3>
          <div className="chart-placeholder">
            <div className="donut-chart-container">
              <svg className="donut-chart" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f0f4f7"
                  strokeWidth="12"
                />
                {/* Floods - 39% */}
                <circle
                  className="donut-segment-circle"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="12"
                  strokeDasharray="0 251"
                  transform="rotate(-90 50 50)"
                  style={{ '--segment-length': '98' }}
                />
                {/* Droughts - 26% */}
                <circle
                  className="donut-segment-circle"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="12"
                  strokeDasharray="0 251"
                  strokeDashoffset="-98"
                  transform="rotate(-90 50 50)"
                  style={{ '--segment-length': '65' }}
                />
                {/* Winds - 22% */}
                <circle
                  className="donut-segment-circle"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="12"
                  strokeDasharray="0 251"
                  strokeDashoffset="-163"
                  transform="rotate(-90 50 50)"
                  style={{ '--segment-length': '55' }}
                />
                {/* Heatwaves - 13% */}
                <circle
                  className="donut-segment-circle"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="12"
                  strokeDasharray="0 251"
                  strokeDashoffset="-218"
                  transform="rotate(-90 50 50)"
                  style={{ '--segment-length': '33' }}
                />
              </svg>
              <div className="donut-center">
                <div className="donut-total">74</div>
                <div className="donut-label">Total</div>
              </div>
            </div>
            <div className="donut-legend">
              <div className="legend-item"><span className="legend-dot" style={{background: '#f43f5e'}}></span> Floods 39%</div>
              <div className="legend-item"><span className="legend-dot" style={{background: '#fb923c'}}></span> Droughts 26%</div>
              <div className="legend-item"><span className="legend-dot" style={{background: '#0ea5e9'}}></span> Winds 22%</div>
              <div className="legend-item"><span className="legend-dot" style={{background: '#fbbf24'}}></span> Heatwaves 13%</div>
            </div>
          </div>
        </div>

        {/* Incidents Over Time */}
        <div className="card">
          <h3 className="card__title">Incidents Over Time</h3>
          <div className="chart-placeholder chart-placeholder--bar">
            <div className="bar-mock">
              {[4,6,5,9,7,10,12].map((h, i) => (
                <div key={i} className="bar" style={{ height: `${h * 6}px` }} />
              ))}
            </div>
            <div className="bar-labels">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Incidents by Area */}
        <div className="card">
          <h3 className="card__title">Incidents by Area</h3>
          <div className="area-list">
            {[
              { area: 'Nkulu Village', count: 5, color: '#e63946' },
              { area: 'Guta District', count: 3, color: '#f4a261' },
              { area: 'Zava Village', count: 2, color: '#2a9d8f' },
              { area: 'Chakoma', count: 2, color: '#457b9d' },
            ].map(a => (
              <div key={a.area} className="area-row">
                <span className="area-dot" style={{ background: a.color }} />
                <span className="area-name">{a.area}</span>
                <span className="area-count">{a.count} incidents</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard__bottom">
        {/* Recent Community Updates */}
        <div className="card card--wide">
          <div className="card__header">
            <h3 className="card__title">Recent Community Updates</h3>
            <Link to="/community" className="card__link">View All Updates →</Link>
          </div>
          {recentUpdates.map((u, i) => (
            <div key={i} className="update-item">
              <div className="update-avatar">{u.user[0]}</div>
              <div className="update-content">
                <p className="update-action">{u.action}</p>
                <span className="update-meta">{u.user} · {u.area} · {u.time}</span>
              </div>
              <span className={`update-tag update-tag--${u.type}`}>{u.type}</span>
            </div>
          ))}
        </div>

        {/* Weather Outlook */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Weather Outlook</h3>
            <Link to="/resources" className="card__link">View Full Forecast →</Link>
          </div>
          <div className="weather-current">
            <span className="weather-icon">⛅</span>
            <div>
              <div className="weather-temp">18°C</div>
              <div className="weather-desc">Partly Cloudy · Harku District</div>
            </div>
          </div>
          <div className="weather-forecast">
            {weatherDays.map(d => (
              <div key={d.day} className="weather-day">
                <span>{d.day}</span>
                <span>{d.icon}</span>
                <span>{d.temp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Helpful Resources */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Helpful Resources</h3>
            <Link to="/resources" className="card__link">View All Resources →</Link>
          </div>
          {helpfulResources.map((r) => (
            <div key={r.label} className="resource-row">
              <span className="resource-icon">{r.icon}</span>
              <div>
                <div className="resource-label">{r.label}</div>
                <div className="resource-desc">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
