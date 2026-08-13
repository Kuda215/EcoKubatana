import { useState, useEffect } from 'react';
import { incidentsAPI } from '../lib/api';
import './PageStyles.css';

const severityColor = { high: '#e63946', medium: '#f4a261', low: '#52b788' };

console.log('Incidents component initialized.');
export default function Incidents() {
  console.log('Incidents component mounted.');
  const [filter, setFilter] = useState('All');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const types = ['All', 'Flood', 'Drought', 'Heatwave', 'Strong Winds', 'Wildfire', 'Pollution'];

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    console.log('Loading incidents...');
    try {
      setLoading(true);
      const result = await incidentsAPI.list();

      console.log('Incidents loaded:', result);
      if (result.success) {
        setIncidents(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'All' ? incidents : incidents.filter(i => i.type === filter);

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading incidents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#e63946', marginBottom: '8px' }}>Error Loading Incidents</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>{error}</p>
          <button className="btn btn--primary" onClick={loadIncidents}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          {types.map(t => (
            <button key={t} className={`filter-tab ${filter === t ? 'filter-tab--active' : ''}`} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
        <a href="/report" className="btn btn--primary">+ Report New Incident</a>
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌤️</div>
          <h3 style={{ marginBottom: '8px' }}>No Incidents</h3>
          <p style={{ color: '#6b7280' }}>
            {filter === 'All' ? 'No incidents reported yet.' : `No ${filter} incidents found.`}
          </p>
        </div>
      )}

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
