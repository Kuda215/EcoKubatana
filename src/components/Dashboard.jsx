import { Link } from 'react-router-dom';
import './Dashboard.css';
import { useState, useEffect, useRef } from 'react';

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
const [selectedZone, setSelectedZone] = useState(null);

  return (
    <div className="dashboard">
      {/* Climate Incident Highlight */}
      <div
      style={{
        position: "relative",
        height: "300px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "2px solid #e5e7eb",
      }}
    >
      <iframe
        title="Climate Risk Map - Ferndale Randburg"
        width="100%"
        height="300"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src="https://maps.google.com/maps?q=Ferndale%20Randburg&t=k&z=14&output=embed"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      ></iframe>

      {/* HIGH RISK */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "58%",
          zIndex: 1000,
          width: "880px",
          height: "280px",
          borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.25)",
          border: "4px solid rgba(233, 19, 19, 0.7)",
          boxShadow: "0 0 50px rgba(239, 68, 68, 0.6)",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        onClick={() =>
          setSelectedZone({
            level: "High Risk",
            color: "#ffa600",
            location: "Ferndale CBD",
            reports: 24,
            recommendation: "Avoid flooded roads and monitor community alerts.",
          })
        }
      >
        <div
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#fff", fontWeight: "bold",
            background: "rgba(0,0,0,0.7)", padding: "8px 12px",  borderRadius: "8px",
          }}
        >          
        </div>
      </div>

      {selectedZone && (
      <div
        style={{
          position: "absolute",
          right: "10px",
          top: "10px",
          width: "220px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderRadius: "10px",
          padding: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 2000,
          fontSize: "12px",
          lineHeight: "1.4",
        }}
      >
        <button
          onClick={() => setSelectedZone(null)}
          style={{
            float: "right",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "14px",
            padding: 0,
          }}
        >
          ✕
        </button>

        <div
          style={{
            display: "inline-block",
            padding: "2px 6px",
            borderRadius: "999px",
            background: selectedZone.color,
            color: "white",
            fontSize: "10px",
            fontWeight: 600,
            marginBottom: "6px",
          }}
        >
          {selectedZone.level}
        </div>

        <h4
          style={{
            margin: "4px 0",
            fontSize: "13px",
          }}
        >
          📍 {selectedZone.location}
        </h4>

        <p style={{ margin: "4px 0" }}>
          <strong>Reports:</strong> {selectedZone.reports}
        </p>

        <p style={{ margin: "4px 0" }}>
          <strong>Action:</strong> {selectedZone.recommendation}
        </p>

        <div
          style={{
            marginTop: "6px",
            padding: "6px",
            background: "#f8fafc",
            borderRadius: "6px",
            fontSize: "11px",
          }}
        >
          🤖 Elevated flood risk detected.
        </div>
      </div>
    )}


      {/* MODERATE RISK */}
      <div
          style={{
            position: "absolute",
            top: "-100%",
            left: "0%",
            zIndex: 1000,
            width: "0",
            height: "0",
            borderRadius: "50%",
            background: "rgba(245, 158, 11, 0.25)",
            border: "4px solid rgba(245, 158, 11, 0.7)",
            boxShadow: "0 0 50px rgba(245, 158, 11, 0.6)",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={() =>
            setSelectedZone({
              level: "Moderate Risk",
              color: "#f59e0b",
              location: "Randburg Sports Grounds",
              reports: 12,
              recommendation:
                "Heavy rainfall expected. Exercise caution and monitor community alerts.",
            })
          }
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fff",
              fontWeight: "bold",
              background: "rgba(0,0,0,0.7)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            MODERATE RISK
          </div>
        </div>

      {/* SAFE AREA */}
      <div
        title="Safe Area"
        style={{
          position: "absolute",
          top: "-20%",
          left: "-2%",
          zIndex: 1000,
          fontSize: "40px",
          cursor: "pointer",
          background: "rgba(197, 154, 34, 0.15)",
          border: "3px solid #ffa600",
          borderRadius: "50%",
          width: "220px",
          height: "270px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() =>
          setSelectedZone({
            level: "Safe Area",
            color: "#c58422",
            location: "Ferndale Residential",
            reports: 0,
            recommendation:
              "No active climate incidents reported. Continue monitoring conditions.",
          })
        }
      >
        
      </div>

      {/* LEGEND */}
      <div
        style={{
          position: "absolute",
          right: "15px",
          bottom: "15px",
          background: "white",
          padding: "12px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,.2)",
          zIndex: 1000,
          fontSize: "14px",
        }}
      >
        <div>🔴 High Risk (Flooding)</div>
        <div>🟡 Moderate Risk (Heavy Rain)</div>
        <div>🟢 Safe Area</div>
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
