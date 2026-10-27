import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocationPlace } from '../contexts/LocationContext';
import { searchPlaces, forecastFor, wikiPhoto, plainTalk } from '../lib/geocode';
import { scoreForecast } from '../lib/climateData';
import { recommendationsFor } from '../lib/recommend';
import './ComingWatch.css';

export default function ComingWatch() {
  const { user } = useAuth();
  const { place, setPlace, watchlist, addWatch, removeWatch } = useLocationPlace();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState([]);
  const [pred, setPred] = useState(null);
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [tags, setTags] = useState({});

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      searchPlaces(q).then(setHits).catch(() => setHits([]));
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!place?.lat) return;
    let live = true;
    setLoading(true);
    forecastFor(place.lat, place.lng)
      .then(({ wx }) => {
        if (!live) return;
        const scored = scoreForecast(wx?.daily || {}, {});
        setPred({ wx, ...scored, talk: plainTalk(scored) });
        setUpdatedAt(new Date());
      })
      .catch(() => {})
      .finally(() => { if (live) setLoading(false); });
    wikiPhoto(place.name)
      .then((url) => { if (live && url) setPhoto(url); })
      .catch(() => {});
    return () => { live = false; };
  }, [place?.lat, place?.lng, place?.name]);

  useEffect(() => {
    let live = true;
    watchlist.forEach((w) => {
      if (w.lat == null) return;
      forecastFor(w.lat, w.lng)
        .then(({ wx }) => {
          if (!live) return;
          const scored = scoreForecast(wx?.daily || {}, {});
          setTags((prev) => ({ ...prev, [w.id]: plainTalk(scored).tag }));
        })
        .catch(() => {});
    });
    return () => { live = false; };
  }, [watchlist]);

  const pick = (hit) => {
    addWatch(hit);
    setQ('');
    setHits([]);
  };

  const talk = pred?.talk;
  const recs = pred
    ? recommendationsFor(pred.forecast_hazard, user?.emergency_priorities)
    : [];

  return (
    <div className="coming coming--two">
      <section className="coming__stage">
        <p className="coming__kicker">What’s coming</p>
        <h1>{place?.name || 'Choose a town'}</h1>
        <p className="coming__admin">{place?.admin}</p>
        <div className="coming__photo">
          {photo ? (
            <img src={photo} alt={place?.name || 'Place'} />
          ) : (
            <div className="coming__photo-empty">{loading ? 'Updating…' : 'No photo yet'}</div>
          )}
          {loading && <div className="coming__photo-load">Updating…</div>}
        </div>
        {talk && (
          <>
            <p className="coming__headline">{talk.line}</p>
            <div className="coming__metrics">
              <span>Rain {pred.metrics?.precip_7d_mm ?? '—'} mm</span>
              <span>Hottest {pred.metrics?.max_temp_c ?? '—'}°C</span>
              <span>Rain chance {pred.metrics?.rain_chance_max ?? '—'}%</span>
            </div>
            <p className="coming__meaning">{talk.meaning}</p>
            {recs.length > 0 && (
              <div className="coming__recs">
                <p className="coming__recs-kicker">For what you protect first</p>
                {recs.map((r) => (
                  <p key={r.asset}><strong>{r.asset}:</strong> {r.text}</p>
                ))}
                {!(user?.emergency_priorities || []).length && (
                  <Link to="/settings" className="coming__recs-link">Set your important assets in Settings</Link>
                )}
              </div>
            )}
            <p className="coming__note">
              {updatedAt
                ? `Updated ${updatedAt.toLocaleTimeString()} · next 7 days · Open-Meteo`
                : 'Open-Meteo, next 7 days'}
            </p>
          </>
        )}
        {!talk && !loading && <p className="coming__note">Pick a town on the right to see the week ahead.</p>}
      </section>

      <aside className="coming__right">
        <h2>Find a place</h2>
        <input
          className="coming__search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type a town…"
        />
        <ul className="coming__hits">
          {hits.map((h) => (
            <li key={h.id}>
              <button type="button" onClick={() => pick(h)}>
                <strong>{h.name}</strong>
                <span>{h.admin}</span>
              </button>
            </li>
          ))}
        </ul>
        <h2 style={{ marginTop: 20 }}>Your places</h2>
        <ul className="coming__watch">
          {watchlist.map((w) => (
            <li key={w.id} className={place?.id === w.id ? 'is-on' : ''}>
              <button type="button" className="coming__watch-name" onClick={() => setPlace(w)}>
                {w.name}
                <small>{w.admin || w.country}</small>
              </button>
              {tags[w.id] && <span className={`coming__tag coming__tag--${tags[w.id].toLowerCase().replace(/\s+/g, '-')}`}>{tags[w.id]}</span>}
              <button type="button" className="coming__x" onClick={() => removeWatch(w.id)} aria-label={`Remove ${w.name}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
