import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { incidentsAPI } from '../lib/api';
import { useLocationPlace } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';
import { loadMyReports, mergeMine } from '../lib/myReports';
import './PageStyles.css';

const ICONS = {
  Flood: '🌊',
  Drought: '🏜️',
  Heatwave: '🌡️',
  'Strong Winds': '💨',
  Wildfire: '🔥',
  Fire: '🔥',
  Pollution: '🏭',
  Landslide: '⛰️',
};

function when(row) {
  const d = row.reported_at || row.created_at || row.date;
  if (!d) return '';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

export default function Incidents() {
  const { place } = useLocationPlace();
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [incidents, setIncidents] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadIncidents();
  }, [user?.id]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const [all, own] = await Promise.all([
        incidentsAPI.list(),
        incidentsAPI.list({ mine: '1' }),
      ]);
      if (all.success) setIncidents(all.data || []);
      else setError(all.error);
      const serverMine = own.success ? (own.data || []) : [];
      const local = loadMyReports(user?.id);
      const fromAll = (all.data || []).filter((i) =>
        i.reporter_id === user?.id || (user?.name && i.reporter_name === user.name)
      );
      setMine(mergeMine(serverMine.length ? serverMine : fromAll, local));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoped = useMemo(() => {
    const needle = (place?.name || '').toLowerCase();
    if (!needle) return incidents;
    const local = incidents.filter((i) => String(i.location || '').toLowerCase().includes(needle));
    return local.length ? local : incidents;
  }, [incidents, place]);

  const counts = useMemo(() => {
    const map = {};
    scoped.forEach((i) => {
      const type = i.type || 'Other';
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [scoped]);

  return (
    <div className="page incidents-page">
      <div className="page__header incidents-head">
        <div>
          <h1 className="page__title">Incidents</h1>
          <p className="page__sub">
            Snapshot for <strong>{place?.name || 'your area'}</strong>
          </p>
        </div>
        <div className="incidents-head__actions">
          <button
            type="button"
            className="where-now-faint"
            onClick={() => window.dispatchEvent(new Event('ecokubatana-where-now'))}
          >
            Where to now?
          </button>
          <Link to="/report" className="btn btn--primary incidents-head__report">+ Report an incident</Link>
        </div>
      </div>

      <div className="filter-tabs">
        <button type="button" className={`filter-tab ${tab === 'overview' ? 'filter-tab--active' : ''}`} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button type="button" className={`filter-tab ${tab === 'mine' ? 'filter-tab--active' : ''}`} onClick={() => setTab('mine')}>
          My reports ({mine.length})
        </button>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
      {error && (
        <div className="card" style={{ padding: 16 }}>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={loadIncidents}>Try again</button>
        </div>
      )}

      {!loading && tab === 'overview' && (
        <div className="incident-overview">
          {counts.length === 0 && (
            <div className="incident-stat">
              <span className="incident-stat__n">0</span>
              <span className="incident-stat__l">Reports yet</span>
            </div>
          )}
          {counts.map(([type, n]) => (
            <div key={type} className="incident-stat">
              <span className="incident-stat__icon">{ICONS[type] || '⚠️'}</span>
              <span className="incident-stat__n">{n}</span>
              <span className="incident-stat__l">{type} incident{n === 1 ? '' : 's'} reported</span>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'mine' && (
        mine.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <h3>No reports from you yet</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 16px' }}>
              When you log a flood, drought, or fire, it will sit here so you can follow it.
            </p>
            <Link to="/report" className="btn btn--primary">Report an incident</Link>
          </div>
        ) : (
          <div className="incident-grid">
            {mine.map((inc) => (
              <div key={inc.id} className="incident-card">
                <div className="incident-card__top">
                  <span className="incident-type">{inc.type}</span>
                  <span className={`incident-status incident-status--${String(inc.status || 'pending').toLowerCase()}`}>
                    {inc.status || 'pending'}
                  </span>
                </div>
                <h3 className="incident-card__title">{inc.title}</h3>
                <div className="incident-card__meta">
                  <span>📍 {inc.location}</span>
                  <span>📅 {when(inc)}</span>
                </div>
                <p className="incident-card__desc">{inc.description || inc.desc}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
