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
  const boxRef = useRef(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      searchPlaces(q).then(setHits).catch(() => setHits([]));
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
      <span className="place-search__pin" aria-hidden>📍</span>
      <input
        id={inputId}
        className="place-search__input"
        value={open ? q : q || full}
        placeholder={locating ? 'Finding you…' : 'Search town, district, country…'}
        onFocus={() => { setOpen(true); setQ(''); }}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        autoComplete="off"
        title={full}
      />
      <button
        type="button"
        className="place-search__gps"
        onClick={() => locateMe({ persist }).then((p) => onPicked?.(p, areaLabel(p))).catch(() => {})}
        title="Use current location"
      >
        📍
      </button>
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
