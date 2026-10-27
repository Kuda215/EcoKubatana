import { useEffect, useRef, useState } from 'react';
import { searchPlaces } from '../lib/geocode';
import { useLocationPlace } from '../contexts/LocationContext';
import './ComingWatch.css';

export default function PlaceSearch({ compact = true }) {
  const { place, setPlace, addWatch } = useLocationPlace();
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

  const pick = (hit) => {
    setPlace(hit);
    addWatch(hit);
    setQ('');
    setHits([]);
    setOpen(false);
  };

  return (
    <div className={`place-search ${compact ? 'place-search--compact' : ''}`} ref={boxRef}>
      <label className="place-search__label" htmlFor="place-search-input">Place</label>
      <input
        id="place-search-input"
        className="place-search__input"
        value={open ? q : q || (place ? `${place.name}` : '')}
        placeholder="Search a town…"
        onFocus={() => { setOpen(true); setQ(''); }}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        autoComplete="off"
      />
      {open && hits.length > 0 && (
        <ul className="place-search__list">
          {hits.map((h) => (
            <li key={h.id}>
              <button type="button" onClick={() => pick(h)}>
                <strong>{h.name}</strong>
                <span>{h.admin}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
