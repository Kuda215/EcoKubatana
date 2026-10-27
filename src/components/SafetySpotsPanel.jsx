import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocationPlace } from '../contexts/LocationContext';
import { AFRICA_HUBS } from '../lib/africaHubs';
import { nearestHub } from '../lib/dataSources';
import { forecastFor } from '../lib/geocode';
import { scoreForecast } from '../lib/climateData';
import {
  loadSafetyPlaces,
  directoryPlaces,
  numbersForIso,
  PLACE_META,
  PLACE_TYPES,
  hazardForPlace,
  mixByType,
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
  const [hazard, setHazard] = useState('Stable');
  const [spots, setSpots] = useState(() =>
    lat != null ? directoryPlaces({ lat, lng, name, hazard: 'Stable' }) : []
  );
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const numbers = numbersForIso(isoForPlace(place));

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;
    forecastFor(lat, lng)
      .then(({ wx }) => {
        if (cancelled) return;
        const scored = scoreForecast(wx?.daily || {}, {});
        setHazard(scored.forecast_hazard || 'Stable');
      })
      .catch(() => { if (!cancelled) setHazard('Stable'); });
    return () => { cancelled = true; };
  }, [lat, lng]);

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;
    // Load every kind of spot (not just the forecast hazard's) so flood, drought and fire are all covered
    setSpots(directoryPlaces({ lat, lng, name, hazard: 'Stable' }));
    setLoading(true);
    setFilter('All');
    loadSafetyPlaces({ lat, lng, name, hazard: 'Stable' })
      .then((result) => {
        if (!cancelled && result.places?.length) setSpots(result.places);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lng, name]);

  const typeOpts = useMemo(
    () => PLACE_TYPES.filter((t) => spots.some((p) => p.type === t)),
    [spots]
  );

  const filtered = useMemo(
    () => (filter === 'All' ? mixByType(spots) : spots.filter((p) => p.type === filter)),
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
        <h3>Safety hubs <SourceInfo sources={['overpass', 'osm', 'openmeteo']} /></h3>
        <span className={`hub-tag hub-tag--${hazard.toLowerCase().replace(/\s+/g, '-')}`}>{hazard}</span>
      </div>
      <div className="home-safety__nums">
        <span>Call if life is at risk:</span>
        <a href={`tel:${numbers.police}`}>Police {numbers.police}</a>
        <a href={`tel:${numbers.medical}`}>Medical {numbers.medical}</a>
        <a href={`tel:${numbers.fire}`}>Fire {numbers.fire}</a>
      </div>
      <div className="home-safety__filters">
        {['All', ...typeOpts].map((t) => (
          <button key={t} type="button" className={filter === t ? 'is-on' : ''} onClick={() => setFilter(t)}>
            {PLACE_META[t]?.icon || '📍'} {t}
          </button>
        ))}
      </div>
      {loading && <p className="home-safety__hint">Looking near {name}…</p>}
      <ul className="home-safety__list">
        {filtered.slice(0, 14).map((p) => {
          const meta = PLACE_META[p.type] || PLACE_META.Other;
          const spotHazard = hazardForPlace(p.type, hazard);
          return (
            <li key={p.id}>
              <button type="button" onClick={() => openDirections(p)}>
                <span>{meta.icon}</span>
                <span>
                  <strong>{p.name}</strong>
                  <span className="hub-tags">
                    <span className={`hub-tag hub-tag--${spotHazard.toLowerCase().replace(/\s+/g, '-')}`}>{spotHazard}</span>
                    <span className={`hub-tag hub-tag--${p.type.toLowerCase().replace(/\s+/g, '-')}`}>{p.type}</span>
                    <em>{p.km} km</em>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="btn btn--primary home-safety__where"
        onClick={() => window.dispatchEvent(new Event('ecokubatana-where-now'))}
      >
        Where to now?
      </button>
    </aside>
  );
}
