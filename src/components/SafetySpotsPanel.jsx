import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocationPlace } from '../contexts/LocationContext';
import { AFRICA_HUBS } from '../lib/africaHubs';
import { hubForUser } from '../lib/dataSources';
import {
  loadSafetyPlaces,
  directoryPlaces,
  numbersForIso,
  PLACE_META,
  PLACE_TYPES,
} from '../lib/safetyPlaces';
import SourceInfo from './SourceInfo';

export default function SafetySpotsPanel() {
  const { user } = useAuth();
  const { place } = useLocationPlace();
  const defaultHub = hubForUser(AFRICA_HUBS, place?.name || user?.location) || AFRICA_HUBS[0];
  const [hubId, setHubId] = useState(defaultHub.id);
  const [places, setPlaces] = useState(() => directoryPlaces({ lat: defaultHub.lat, lng: defaultHub.lng, hubId: defaultHub.id }));
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const hub = AFRICA_HUBS.find((h) => h.id === hubId) || defaultHub;
  const origin = useMemo(() => ({
    lat: place?.lat ?? hub.lat,
    lng: place?.lng ?? hub.lng,
    hubId: hub.id,
  }), [place?.lat, place?.lng, hub.id, hub.lat, hub.lng]);
  const numbers = numbersForIso(hub.iso3);

  useEffect(() => {
    let cancelled = false;
    const instant = directoryPlaces(origin);
    setPlaces(instant);
    setLoading(true);
    loadSafetyPlaces(origin)
      .then((result) => {
        if (!cancelled && result.places?.length) setPlaces(result.places);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [origin.hubId, origin.lat, origin.lng]);

  const filtered = useMemo(
    () => places.filter((p) => filter === 'All' || p.type === filter),
    [places, filter]
  );

  const openDirections = (place) => {
    window.open(
      `https://www.openstreetmap.org/directions?from=${origin.lat}%2C${origin.lng}&to=${place.lat}%2C${place.lng}`,
      '_blank'
    );
  };

  return (
    <aside className="home-safety">
      <div className="home-safety__head">
        <h3>Safety spots <SourceInfo sources={['overpass', 'osm']} /></h3>
        <p>Hospitals, police, fire and clinics near a hub city.</p>
      </div>
      <select className="form-input" value={hubId} onChange={(e) => setHubId(e.target.value)} aria-label="Safety hub city">
        {AFRICA_HUBS.map((h) => (
          <option key={h.id} value={h.id}>{h.name}, {h.country}</option>
        ))}
      </select>
      <div className="home-safety__nums">
        <a href={`tel:${numbers.police}`}>Police {numbers.police}</a>
        <a href={`tel:${numbers.medical}`}>Medical {numbers.medical}</a>
        <a href={`tel:${numbers.fire}`}>Fire {numbers.fire}</a>
      </div>
      <div className="home-safety__filters">
        {['All', ...PLACE_TYPES].map((t) => (
          <button key={t} type="button" className={filter === t ? 'is-on' : ''} onClick={() => setFilter(t)}>
            {PLACE_META[t]?.icon || '📍'} {t}
          </button>
        ))}
      </div>
      {loading && <p className="home-safety__hint">Refreshing live map places…</p>}
      <ul className="home-safety__list">
        {filtered.slice(0, 14).map((p) => {
          const meta = PLACE_META[p.type] || PLACE_META.Other;
          return (
            <li key={p.id}>
              <button type="button" onClick={() => openDirections(p)}>
                <span>{meta.icon}</span>
                <span>
                  <strong>{p.name}</strong>
                  <em>{p.type} · {p.km} km</em>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
