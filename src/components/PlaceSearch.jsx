import { useEffect, useRef, useState } from 'react';
import { searchPlaces, areaLabel } from '../lib/geocode';
import { useLocationPlace } from '../contexts/LocationContext';
import './ComingWatch.css';

export default function PlaceSearch({
  compact = true,
  inputId = 'place-search-input',
  onPicked,
  persist = false,
}) {
  const { place, setPlace, setHomePlace, locateMe, locating } = useLocationPlace();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState([]);
  const [open, setOpen] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const boxRef = useRef(null);

  const locateHere = () => {
    setGpsError('');
    // Drop any half-typed search so the box shows the live location
    setQ('');
    setHits([]);
    setOpen(false);
    document.getElementById(inputId)?.blur();
    locateMe({ persist })
      .then((p) => onPicked?.(p, areaLabel(p)))
      .catch((err) => {
        setGpsError(err?.code === 1
          ? 'Location access is blocked. Allow it in your browser settings.'
          : "Couldn't find your location. Try again or search instead.");
        setTimeout(() => setGpsError(''), 5000);
      });
  };

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      searchPlaces(q, 6, place).then(setHits).catch(() => setHits([]));
    }, 280);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const commit = (hit) => {
    if (persist) setHomePlace(hit);
    else setPlace(hit);
    onPicked?.(hit, areaLabel(hit));
    setQ('');
    setHits([]);
    setOpen(false);
  };

  const full = areaLabel(place);

  return (
    <div className={`place-search ${compact ? 'place-search--compact' : ''}`} ref={boxRef}>
      <label className="place-search__label" htmlFor={inputId}>Place</label>
      <span className="place-search__pin" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        id={inputId}
        className="place-search__input"
        value={locating ? '' : open ? q : q || full}
        placeholder={locating ? 'Finding you…' : 'Search town, district, country…'}
        onFocus={() => { setOpen(true); setQ(''); }}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        autoComplete="off"
        title={full}
      />
      <button
        type="button"
        className={`place-search__gps ${locating ? 'place-search__gps--busy' : ''}`}
        onClick={locateHere}
        disabled={locating}
        title="Use my current location"
        aria-label="Use my current location"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>
      {gpsError && <p className="place-search__error" role="alert">{gpsError}</p>}
      {open && hits.length > 0 && (
        <ul className="place-search__list">
          {hits.map((h) => (
            <li key={h.id}>
              <button type="button" onClick={() => commit(h)}>
                <strong>{h.name}</strong>
                <span>{areaLabel(h)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
