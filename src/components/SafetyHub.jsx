import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addBasemap } from '../lib/mapTiles';
import { useAuth } from '../contexts/AuthContext';
import { useAccess } from '../contexts/AccessContext';
import { AFRICA_HUBS } from '../lib/africaHubs';
import { hubForUser } from '../lib/dataSources';
import {
  loadSafetyPlaces,
  directoryPlaces,
  numbersForIso,
  PLACE_META,
  PLACE_TYPES,
  nearestAfricaHub,
  haversineKm,
} from '../lib/safetyPlaces';
import { speakText, stopSpeak, listenOnce, parseVoiceCommand, canListen } from '../lib/voiceGuide';
import SourceInfo from './SourceInfo';
import SafetyCheckIn from './SafetyCheckIn';
import './PageStyles.css';

export default function SafetyHub() {
  const { user } = useAuth();
  const { flags } = useAccess();
  const navState = useLocation().state || {};
  const defaultHub = hubForUser(AFRICA_HUBS, user?.location) || AFRICA_HUBS[0];

  const [hubId, setHubId] = useState(navState.hubId || defaultHub.id);
  const [origin, setOrigin] = useState(navState.origin || { lat: defaultHub.lat, lng: defaultHub.lng, name: `${defaultHub.name}, ${defaultHub.country}` });
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('city');
  const [err, setErr] = useState('');
  const [voiceNote, setVoiceNote] = useState('');
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const elRef = useRef(null);
  const spokenRef = useRef(false);

  const hub = AFRICA_HUBS.find((h) => h.id === hubId) || defaultHub;
  const numbers = numbersForIso(hub.iso3);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((p) => {
      if (filter !== 'All' && p.type !== filter) return false;
      if (q && !`${p.name} ${p.address} ${p.type}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [places, filter, query]);

  const counts = useMemo(() => {
    const c = { All: places.length };
    PLACE_TYPES.forEach((t) => { c[t] = places.filter((p) => p.type === t).length; });
    return c;
  }, [places]);

  useEffect(() => {
    if (!filtered.length) return;
    if (!selected || !filtered.some((p) => p.id === selected.id)) setSelected(filtered[0]);
  }, [filtered, selected]);

  useEffect(() => {
    let cancelled = false;
    const instant = directoryPlaces({ lat: origin.lat, lng: origin.lng, hubId: hub.id });
    setPlaces(instant);
    setSelected(instant[0] || null);
    setFallback(true);
    setLoading(true);
    setErr('');
    loadSafetyPlaces({ lat: origin.lat, lng: origin.lng, hubId: hub.id })
      .then((result) => {
        if (cancelled) return;
        const tagged = (result.places || []).map((p) => ({
          ...p,
          km: Math.round(haversineKm(origin, p) * 10) / 10,
        })).sort((a, b) => a.km - b.km);
        setPlaces(tagged.length ? tagged : instant);
        setFallback(!!result.fallback && tagged.length < 8);
        setSelected((tagged[0] || instant[0]) || null);
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(e.message || 'Could not load safety places.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [hubId, origin.lat, origin.lng, hub.id]);

  useEffect(() => {
    if (!navState.speakNearest || loading || spokenRef.current) return;
    const top = places[0];
    if (!top) return;
    spokenRef.current = true;
    speakText(`Nearest ${top.type.toLowerCase()} is ${top.name}, ${top.km} kilometres. Tap it for directions, or say hospital, police, or fire.`).catch(() => {});
    return () => stopSpeak();
  }, [loading, places, navState.speakNearest]);

  useEffect(() => {
    if (flags.smsOnly || !elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { zoomControl: true, attributionControl: true }).setView([origin.lat, origin.lng], 12);
    addBasemap(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 80);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [flags.smsOnly]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (view === 'africa') {
      map.setView([2.2, 20], 3);
      AFRICA_HUBS.forEach((h) => {
        const marker = L.circleMarker([h.lat, h.lng], {
          radius: 8,
          color: h.id === hub.id ? '#047857' : '#0ea5e9',
          fillColor: h.id === hub.id ? '#10b981' : '#38bdf8',
          fillOpacity: 0.85,
          weight: h.id === hub.id ? 3 : 1,
        });
        marker.bindPopup(`<strong>${h.name}, ${h.country}</strong><br/>Tap the city chip to load hospitals and police.`);
        marker.on('click', () => selectHub(h));
        marker.addTo(layer);
      });
      return;
    }

    L.circleMarker([origin.lat, origin.lng], {
      radius: 9,
      color: '#047857',
      fillColor: '#10b981',
      fillOpacity: 0.9,
      weight: 3,
    }).bindPopup(`You · ${origin.name}`).addTo(layer);

    filtered.forEach((p) => {
      const meta = PLACE_META[p.type] || PLACE_META.Other;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: selected?.id === p.id ? 10 : 7,
        color: meta.color,
        fillColor: meta.color,
        fillOpacity: 0.75,
        weight: selected?.id === p.id ? 4 : 2,
      });
      marker.bindPopup(`<strong>${meta.icon} ${p.name}</strong><br/>${p.type} · ${p.km} km`);
      marker.on('click', () => setSelected(p));
      marker.addTo(layer);
    });

    const pts = [[origin.lat, origin.lng], ...filtered.slice(0, 40).map((p) => [p.lat, p.lng])];
    try {
      map.fitBounds(pts, { padding: [28, 28], maxZoom: 14 });
    } catch {
      map.setView([origin.lat, origin.lng], 12);
    }
  }, [filtered, origin, selected, view, hub.id, flags.smsOnly]);

  const selectHub = (h) => {
    setHubId(h.id);
    setOrigin({ lat: h.lat, lng: h.lng, name: `${h.name}, ${h.country}` });
    setView('city');
  };

  const useGps = () => {
    if (!navigator.geolocation) {
      setErr('This device has no GPS.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const near = nearestAfricaHub(lat, lng);
        setHubId(near.id);
        setOrigin({ lat, lng, name: 'Your GPS location' });
        setView('city');
      },
      () => setErr('Could not read GPS. Choose a city instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const listenNav = async () => {
    if (!canListen()) {
      setVoiceNote('Voice listen needs Chrome or Edge. Tap a place for directions.');
      return;
    }
    setVoiceNote('Listening… say hospital, police, fire, or directions.');
    try {
      const text = await listenOnce();
      const cmd = parseVoiceCommand(text);
      if (cmd === 'hub' || /hospital/.test(text.toLowerCase())) {
        const hit = places.find((p) => p.type === 'Hospital') || places[0];
        setFilter('Hospital');
        setSelected(hit || null);
        setVoiceNote(hit ? `${hit.name}, ${hit.km} km` : 'No hospital found.');
        if (hit) speakText(`${hit.name} is ${hit.km} kilometres away.`).catch(() => {});
      } else if (/police/.test(text.toLowerCase())) {
        const hit = places.find((p) => p.type === 'Police');
        setFilter('Police');
        setSelected(hit || null);
        if (hit) speakText(`${hit.name} is ${hit.km} kilometres away.`).catch(() => {});
        setVoiceNote(hit ? `${hit.name}, ${hit.km} km` : 'No police station found.');
      } else if (/fire/.test(text.toLowerCase())) {
        const hit = places.find((p) => p.type === 'Fire');
        setFilter('Fire');
        setSelected(hit || null);
        setVoiceNote(hit ? `${hit.name}, ${hit.km} km` : 'No fire station found.');
      } else if (cmd === 'call' || /direction/.test(text.toLowerCase())) {
        openDirections(selected || places[0]);
      } else {
        setVoiceNote(`Heard “${text}”. Say hospital, police, fire, or directions.`);
      }
    } catch (e) {
      setVoiceNote(e.message);
    }
  };

  const openDirections = (place) => {
    if (!place) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${place.lat},${place.lng}`,
      '_blank'
    );
  };

  const meta = selected ? (PLACE_META[selected.type] || PLACE_META.Other) : null;

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Africa safety hubs <SourceInfo sources={['overpass', 'osm']} /></h2>
          <p className="page__sub">
            Hospitals, clinics, police, fire and community shelters from OpenStreetMap around every EcoKubatana hub city. Pick a city or use GPS.
          </p>
        </div>
        <div className="safety-hub-actions">
          <button type="button" className="btn btn--ghost" onClick={useGps}>📍 Use my location</button>
          <button type="button" className="btn btn--ghost" onClick={() => setView(view === 'africa' ? 'city' : 'africa')}>
            {view === 'africa' ? 'Zoom to city' : 'All Africa hubs'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={listenNav}>🎤 Voice find</button>
        </div>
      </div>

      <div className="hub-chip-row" role="list">
        {AFRICA_HUBS.map((h) => (
          <button
            key={h.id}
            type="button"
            className={`hub-chip ${h.id === hub.id ? 'is-on' : ''}`}
            onClick={() => selectHub(h)}
          >
            {h.name}
          </button>
        ))}
      </div>

      {voiceNote && <p className="safety-voice-note">{voiceNote}</p>}
      {err && <p className="where-now__err">{err}</p>}
      {fallback && !loading && (
        <p className="safety-voice-note">Live OpenStreetMap was busy. Showing a short directory for {hub.name} plus national emergency numbers.</p>
      )}

      <div className="quick-contacts">
        <h3 className="card__title">Emergency numbers · {hub.country}</h3>
        <div className="emergency-grid">
          <a href={`tel:${numbers.police}`} className="emergency-card emergency-card--police">
            <div className="emergency-card__top">
              <span className="emergency-card__icon">👮</span>
              <div className="emergency-card__info"><h4>Police</h4><p>Tap to call</p></div>
            </div>
            <span className="emergency-card__number">{numbers.police}</span>
          </a>
          <a href={`tel:${numbers.medical}`} className="emergency-card emergency-card--medical">
            <div className="emergency-card__top">
              <span className="emergency-card__icon">🏥</span>
              <div className="emergency-card__info"><h4>Medical</h4><p>Tap to call</p></div>
            </div>
            <span className="emergency-card__number">{numbers.medical}</span>
          </a>
          <a href={`tel:${numbers.fire}`} className="emergency-card emergency-card--fire">
            <div className="emergency-card__top">
              <span className="emergency-card__icon">🚒</span>
              <div className="emergency-card__info"><h4>Fire</h4><p>Tap to call</p></div>
            </div>
            <span className="emergency-card__number">{numbers.fire}</span>
          </a>
          <a href={`tel:${numbers.general}`} className="emergency-card emergency-card--weather">
            <div className="emergency-card__top">
              <span className="emergency-card__icon">📞</span>
              <div className="emergency-card__info"><h4>General</h4><p>Tap to call</p></div>
            </div>
            <span className="emergency-card__number">{numbers.general}</span>
          </a>
        </div>
      </div>

      <div className="filter-tabs safety-filters">
        {['All', ...PLACE_TYPES].map((t) => (
          <button key={t} type="button" className={`filter-tab ${filter === t ? 'filter-tab--active' : ''}`} onClick={() => setFilter(t)}>
            {(PLACE_META[t]?.icon || '📍')} {t} ({counts[t] || 0})
          </button>
        ))}
      </div>
      <input
        className="form-input"
        placeholder="Search a hospital, police station, clinic…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search safety places"
      />

      <div className="safety-layout">
        <div className="safety-map-container">
          <div className="map-header">
            <h3>{view === 'africa' ? 'All EcoKubatana hub cities' : `Near ${origin.name}`}</h3>
            <div className="map-legend">
              {PLACE_TYPES.map((t) => (
                <span key={t}><span className="legend-icon">{PLACE_META[t].icon}</span> {t}</span>
              ))}
            </div>
          </div>
          {flags.smsOnly ? (
            <p>Map hidden in SMS-only mode. Use the list and phone numbers.</p>
          ) : (
            <div ref={elRef} className="safety-leaflet" />
          )}
          {loading && <p>Loading OpenStreetMap hospitals and police…</p>}
          <div className="location-quick-access">
            {filtered.slice(0, 12).map((p) => (
              <button
                key={p.id}
                type="button"
                className={`quick-access-card ${selected?.id === p.id ? 'quick-access-card--active' : ''}`}
                onClick={() => setSelected(p)}
              >
                <span className="quick-access-icon">{PLACE_META[p.type]?.icon || '📍'}</span>
                <div className="quick-access-info">
                  <div className="quick-access-name">{p.name}</div>
                  <div className="quick-access-type">{p.type} · {p.km} km</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="safety-info-panel">
          {selected ? (
            <div className="location-details">
              <div className="location-header">
                <span className="location-icon">{meta.icon}</span>
                <div>
                  <h3>{selected.name}</h3>
                  <span className="location-type" style={{ background: meta.color }}>{selected.type}</span>
                </div>
              </div>
              <div className="location-info">
                <div className="info-section">
                  <strong>📍 Distance</strong>
                  <p>{selected.km} km from {origin.name}</p>
                </div>
                {selected.address && (
                  <div className="info-section">
                    <strong>Address</strong>
                    <p>{selected.address}</p>
                  </div>
                )}
                {selected.phone && (
                  <div className="info-section">
                    <strong>📞 Phone</strong>
                    <p><a href={`tel:${selected.phone.replace(/\s/g, '')}`}>{selected.phone}</a></p>
                  </div>
                )}
                <p style={{ fontSize: 12, color: '#64748b' }}>Source: {selected.source}</p>
                <button type="button" className="btn btn--primary" style={{ width: '100%', marginTop: 12 }} onClick={() => openDirections(selected)}>
                  Get directions
                </button>
                {selected.phone && (
                  <a className="btn btn--ghost" style={{ width: '100%', marginTop: 8, textAlign: 'center' }} href={`tel:${selected.phone.replace(/\s/g, '')}`}>
                    Call this place
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="location-placeholder">
              <h4>{loading ? 'Finding places…' : `${filtered.length} places`}</h4>
              <p>Choose a pin, or pick Hospital / Police / Fire above.</p>
            </div>
          )}
        </div>
      </div>

      {navState.fromGuide && <SafetyCheckIn channel="app" />}
    </div>
  );
}
