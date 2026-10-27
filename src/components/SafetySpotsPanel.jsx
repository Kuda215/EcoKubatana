import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocationPlace } from '../contexts/LocationContext';
import { AFRICA_HUBS } from '../lib/africaHubs';
import { nearestHub } from '../lib/dataSources';
import {
  loadSafetyPlaces,
  directoryPlaces,
  numbersForIso,
  PLACE_META,
  PLACE_TYPES,
} from '../lib/safetyPlaces';
import SourceInfo from './SourceInfo';

function isoForPlace(place) {
  const country = String(place?.country || place?.admin || '').toLowerCase();
  const hit = AFRICA_HUBS.find((h) => country.includes(h.country.toLowerCase()) || country.includes(h.iso3.toLowerCase()));
  if (hit) return hit.iso3;
  return nearestHub(AFRICA_HUBS, place?.lat, place?.lng)?.iso3 || 'ZWE';
}

export default function SafetySpotsPanel() {
  const { user } = useAuth();
  const { place } = useLocationPlace();
  const lat = place?.lat;
  const lng = place?.lng;
  const name = place?.name || user?.location || 'here';
  const [spots, setSpots] = useState(() =>
    lat != null ? directoryPlaces({ lat, lng, name }) : []
  );
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const numbers = numbersForIso(isoForPlace(place));

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;
    setSpots(directoryPlaces({ lat, lng, name }));
    setLoading(true);
    loadSafetyPlaces({ lat, lng, name })
      .then((result) => {
        if (!cancelled && result.places?.length) setSpots(result.places);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lng, name]);

  const filtered = useMemo(
    () => spots.filter((p) => filter === 'All' || p.type === filter),
    [spots, filter]
  );

  const openDirections = (spot) => {
    window.open(
      `https://www.openstreetmap.org/directions?from=${lat}%2C${lng}&to=${spot.lat}%2C${spot.lng}`,
      '_blank'
    );
  };

  return (
    <aside className="home-safety">
      <div className="home-safety__head">
        <h3>Safety spots <SourceInfo sources={['overpass', 'osm']} /></h3>
        <p>Near {name} — hospitals, police, fire and clinics around the top-bar place.</p>
      </div>
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
      {loading && <p className="home-safety__hint">Looking near {name}…</p>}
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
