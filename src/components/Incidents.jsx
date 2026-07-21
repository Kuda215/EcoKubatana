import { useState } from 'react';
import './PageStyles.css';

const incidents = [
  { id: 1, type: 'Flood',    title: 'Heavy Rainfall & Flooding', location: 'Nkulu Village, Guta District', date: '14–16 Jul 2026', severity: 'high',   status: 'Active',   desc: 'River overflow caused flooding across low-lying areas. 40+ families displaced.' },
  { id: 2, type: 'Drought',  title: 'Severe Water Shortage',     location: 'Zava Village',                 date: '01 Jul 2026',    severity: 'medium', status: 'Ongoing',  desc: 'Borehole levels critically low. Livestock and crops at risk.' },
  { id: 3, type: 'Heatwave', title: 'Extreme Heat Warning',      location: 'Chakoma Area',                 date: '10 Jul 2026',    severity: 'medium', status: 'Resolved', desc: 'Temperatures reached 42°C for 3 consecutive days.' },
  { id: 4, type: 'Wind',     title: 'Strong Winds & Roof Damage',location: 'Harare North',                 date: '05 Jul 2026',    severity: 'low',    status: 'Resolved', desc: 'Several homes lost roofing sheets. Community repair efforts underway.' },
];

const severityColor = { high: '#e63946', medium: '#f4a261', low: '#52b788' };

export default function Incidents() {
  const [filter, setFilter] = useState('All');
  const types = ['All', 'Flood', 'Drought', 'Heatwave', 'Wind'];

  const filtered = filter === 'All' ? incidents : incidents.filter(i => i.type === filter);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">⚠️ Incidents</h1>
          <p className="page__sub">Track and review climate incidents in your community.</p>
        </div>
        <a href="/report" className="btn btn--primary">+ Report New Incident</a>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {types.map(t => (
          <button key={t} className={`filter-tab ${filter === t ? 'filter-tab--active' : ''}`} onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>

      {/* Incident Cards */}
      <div className="incident-grid">
        {filtered.map(inc => (
          <div key={inc.id} className="incident-card">
            <div className="incident-card__top">
              <span className="incident-type" style={{ background: severityColor[inc.severity] + '22', color: severityColor[inc.severity] }}>{inc.type}</span>
              <span className={`incident-status incident-status--${inc.status.toLowerCase()}`}>{inc.status}</span>
            </div>
            <h3 className="incident-card__title">{inc.title}</h3>
            <div className="incident-card__meta">
              <span>📍 {inc.location}</span>
              <span>📅 {inc.date}</span>
            </div>
            <p className="incident-card__desc">{inc.desc}</p>
            <div className="incident-card__severity">
              <div className="severity-bar">
                <div className="severity-fill" style={{ width: inc.severity === 'high' ? '90%' : inc.severity === 'medium' ? '55%' : '25%', background: severityColor[inc.severity] }} />
              </div>
              <span style={{ color: severityColor[inc.severity], fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{inc.severity} severity</span>
            </div>
            <button className="btn btn--ghost" style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}>View Full Report</button>
          </div>
        ))}
      </div>
    </div>
  );
}
