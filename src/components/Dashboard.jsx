import { Link } from 'react-router-dom';
import './Dashboard.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { incidentsAPI, communityAPI, alertsAPI } from '../lib/api';
import { useClimateData, geocodeAndForecast, riskColor } from '../lib/climateData';
import AfricaClimateMap from './AfricaClimateMap';
import SourceInfo from './SourceInfo';
import { estimateLosses, formatMoney, hubForUser } from '../lib/dataSources';

const WX_ICON = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 80: '🌦️', 95: '⛈️' };

export default function Dashboard() {
  const { user } = useAuth();
  const { hotspots, events, loading: climateLoading, syncedAt } = useClimateData();
  const [selected, setSelected] = useState(null);
  const [mapMode, setMapMode] = useState('historic');
  const [incidents, setIncidents] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    incidentsAPI.list().then((r) => { if (r.success) setIncidents(r.data || []); }).catch(() => {});
    communityAPI.getStats().then((r) => { if (r.success) setMemberCount(r.data?.totalMembers || 0); }).catch(() => {});
    alertsAPI.list().then((r) => { if (r.success) setAlertCount((r.data || []).length); }).catch(() => {});
    geocodeAndForecast(user?.location || 'Harare').then(setWeather).catch(() => {});
  }, [user?.location]);

  const typeCounts = incidents.reduce((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {});
  const typeEntries = Object.entries(typeCounts);
  const totalInc = incidents.length || typeEntries.reduce((a, [, n]) => a + n, 0);
  const colors = { Flood: '#f43f5e', Drought: '#fb923c', Heatwave: '#fbbf24', 'Strong Winds': '#0ea5e9', Wildfire: '#e63946', Landslide: '#78716c', Pollution: '#64748b', Other: '#94a3b8' };
  const flagged = hotspots.filter((h) => h.flag_status === 'alert' || h.flag_status === 'emergency').length;
  const areaCounts = Object.entries(
    incidents.reduce((acc, i) => { acc[i.location || 'Unknown'] = (acc[i.location || 'Unknown'] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const stats = [
    { label: 'Peer Incidents', value: String(totalInc || 0), sub: 'From the community feed', icon: '⚠️', trend: 'Live from reports' },
    { label: 'Community Members', value: (memberCount || 0).toLocaleString(), sub: 'Across Africa hubs', icon: '👥', trend: 'Profiles in EcoKubatana' },
    { label: 'Active Alerts', value: String(alertCount), sub: `${flagged} map flags`, icon: '🔔', trend: 'View Alerts →' },
    { label: 'Hazard hubs', value: String(hotspots.length), sub: 'Historic + forecast layers', icon: '🌍', trend: climateLoading ? 'Refreshing…' : 'Live APIs' },
  ];

  const localHub = hubForUser(hotspots, user?.location);
  const localMoney = localHub ? estimateLosses(localHub, user?.livelihood) : null;
  const job = String(user?.livelihood || '').toLowerCase();

  const days = weather?.wx?.daily?.time?.map((t, i) => ({
    day: i === 0 ? 'Today' : new Date(t).toLocaleDateString(undefined, { weekday: 'short' }),
    icon: WX_ICON[weather.wx.daily.weather_code?.[i]] || (weather.wx.daily.precipitation_sum?.[i] > 1 ? '🌧️' : '⛅'),
    temp: `${Math.round(weather.wx.daily.temperature_2m_max[i])}°C`,
  })) || [];

  return (
    <div className="dashboard">
      {!user?.livelihood && (
        <div className="dashboard__highlight">
          <div className="highlight__badge">Finish setup</div>
          <p>Tell us what you do (for example Farmer) and what to protect first in an emergency. It personalises alerts.</p>
          <Link to="/settings" className="card__link">Complete your profile →</Link>
        </div>
      )}

      <div className="africa-map-panel">
        <div className="map-mode-tabs" style={{ alignItems: 'center' }}>
          {[
            ['historic', 'Historic'],
            ['forecast', 'Forecast'],
            ['flags', 'Flags'],
          ].map(([id, label]) => (
            <button key={id} className={`filter-tab ${mapMode === id ? 'filter-tab--active' : ''}`} onClick={() => setMapMode(id)}>{label}</button>
          ))}
          <SourceInfo sources={mapMode === 'historic' ? ['emdat', 'reliefweb', 'osm'] : mapMode === 'forecast' ? ['openmeteo', 'glofas', 'osm'] : ['eonet', 'glofas', 'osm']} />
        </div>
        <AfricaClimateMap
          hotspots={hotspots}
          events={events}
          mode={mapMode}
          selectedId={selected?.id}
          onSelect={setSelected}
          height={340}
        />
        {selected && (
          <div className="map-selected-card">
            <button className="map-selected-close" onClick={() => setSelected(null)}>✕</button>
            <span className="map-risk-pill" style={{ background: riskColor(mapMode === 'forecast' ? selected.forecast_score : selected.historic_score, selected.flag_status) }}>
              {mapMode === 'forecast' ? selected.forecast_hazard : selected.historic_hazard} · {selected.flag_status}
            </span>
            <h4>📍 {selected.name}, {selected.country}</h4>
            <p>{selected.summary}</p>
            {(job.includes('farm') || job.includes('livestock')) && <p><strong>For your work:</strong> {selected.farmer_action}</p>}
            <p><strong>Money at risk (city):</strong> {formatMoney(estimateLosses(selected, user?.livelihood).potential_loss_usd)}</p>
            <p style={{ fontSize: 11, color: 'var(--neutral-500)' }}>Sources: {(selected.sources || []).join(' · ')} <SourceInfo sources={['openmeteo', 'eonet', 'reliefweb', 'worldbank', 'osm']} /></p>
          </div>
        )}
        <div className="map-legend-bar">
          <span>🟢 Watch / quieter</span>
          <span>🟡 Historic or building risk</span>
          <span>🟠 Alert</span>
          <span>🔴 Emergency flag</span>
          {syncedAt && <span>Updated {new Date(syncedAt).toLocaleTimeString()}</span>}
        </div>
      </div>

      {localMoney && (
        <div className="dashboard__highlight">
          <div className="highlight__badge">Potential loss near you <SourceInfo sources={['worldbank']} /></div>
          <p>
            Around <strong>{localHub.name}</strong>, a scored {localMoney.hazard_for_money} event could put about <strong>{formatMoney(localMoney.potential_loss_usd)}</strong> of local economic value at risk.
            For your household{user?.livelihood ? ` (${String(user.livelihood).replace(/_/g, ' ')})` : ''}, a planning range is <strong>{formatMoney(localMoney.household_loss_usd)}</strong> - crops, stock, travel, repairs. Not an insurance quote.
          </p>
        </div>
      )}

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

      <div className="dashboard__mid">
        <div className="card">
          <h3 className="card__title">Incidents by Type</h3>
          <div className="chart-placeholder">
            {totalInc === 0 ? (
              <p style={{ color: 'var(--neutral-500)' }}>No verified incidents yet - the map still uses historic + forecast APIs. <SourceInfo sources={['openmeteo', 'eonet']} /></p>
            ) : (
              <div className="donut-legend">
                {typeEntries.map(([type, n]) => (
                  <div key={type} className="legend-item">
                    <span className="legend-dot" style={{ background: colors[type] || '#94a3b8' }} />
                    {type} {Math.round((n / totalInc) * 100)}% ({n})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card__title">Africa hubs by historic score</h3>
          <div className="area-list">
            {[...hotspots].sort((a, b) => (b.historic_score || 0) - (a.historic_score || 0)).slice(0, 5).map((h) => (
              <div key={h.id} className="area-row">
                <span className="area-dot" style={{ background: riskColor(h.historic_score) }} />
                <span className="area-name">{h.name}</span>
                <span className="area-count">{h.historic_hazard} · {h.historic_score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card__title">Incidents by Area</h3>
          <div className="area-list">
            {areaCounts.length === 0 && <p style={{ color: 'var(--neutral-500)' }}>Waiting for community reports.</p>}
            {areaCounts.map(([area, count], i) => (
              <div key={area} className="area-row">
                <span className="area-dot" style={{ background: ['#e63946', '#f4a261', '#2a9d8f', '#457b9d'][i] }} />
                <span className="area-name">{area}</span>
                <span className="area-count">{count} incidents</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard__bottom">
        <div className="card card--wide">
          <div className="card__header">
            <h3 className="card__title">Why the map looks like this</h3>
            <Link to="/historic-intel" className="card__link">Historic intel →</Link>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            We combine satellite-linked events (NASA EONET / Earthdata), predictive models (Open-Meteo + Copernicus GloFAS river flow), historic disaster records (ReliefWeb / EM-DAT-style), population context (World Bank / WorldPop-style urban estimates), and OpenStreetMap as the basemap - focused on Africa.
            <SourceInfo sources={['eonet', 'openmeteo', 'glofas', 'reliefweb', 'emdat', 'worldbank', 'worldpop', 'osm']} />
          </p>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Weather Outlook</h3>
          </div>
          <div className="weather-current">
            <span className="weather-icon">{WX_ICON[weather?.wx?.current?.weather_code] || '⛅'}</span>
            <div>
              <div className="weather-temp">{weather?.wx?.current?.temperature_2m != null ? `${Math.round(weather.wx.current.temperature_2m)}°C` : '-'}</div>
              <div className="weather-desc">{weather?.loc?.name || user?.location || 'Your area'} · Open-Meteo <SourceInfo sources={['openmeteo']} /></div>
            </div>
          </div>
          <div className="weather-forecast">
            {days.slice(0, 5).map((d) => (
              <div key={d.day} className="weather-day">
                <span>{d.day}</span>
                <span>{d.icon}</span>
                <span>{d.temp}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Helpful Resources</h3>
            <Link to="/alerts" className="card__link">Alert steps →</Link>
          </div>
          {[
            { icon: '🚨', label: 'Emergency Contacts', desc: 'Police, fire, medical - then EcoKubatana' },
            { icon: '🌾', label: 'Role playbook', desc: user?.livelihood ? `Steps for a ${user.livelihood.replace('_', ' ')}` : 'Set your livelihood in settings' },
            { icon: '📣', label: 'Report an Incident', desc: 'Tell us what is happening near you' },
          ].map((r) => (
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
