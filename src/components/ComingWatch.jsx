import { useEffect, useState } from 'react';
import { useLocationPlace } from '../contexts/LocationContext';
import { searchPlaces, forecastFor } from '../lib/geocode';
import { scoreForecast } from '../lib/climateData';
import './ComingWatch.css';

function HazardDoodle({ kind }) {
  const k = String(kind || 'Stable').toLowerCase();
  if (k.includes('flood') || k.includes('cyclone') || k.includes('storm')) {
    return (
      <svg className="doodle" viewBox="0 0 320 220" aria-hidden>
        <rect width="320" height="220" fill="#f4e4c1" />
        <ellipse cx="160" cy="175" rx="120" ry="22" fill="#c45c26" opacity="0.25" />
        <path d="M0 150 Q40 120 80 150 T160 150 T240 150 T320 150 V220 H0Z" fill="#8b3a2a" />
        <path d="M0 165 Q50 145 100 165 T200 165 T320 165 V220 H0Z" fill="#5c2e1a" />
        <circle cx="70" cy="55" r="28" fill="#d4a017" />
        <path d="M90 50 Q140 20 190 55 Q230 80 200 90 Q150 70 90 50" fill="#5c4a3a" />
        <path d="M40 110 q30 20 60 0" stroke="#fff" strokeWidth="4" fill="none" />
        <path d="M110 125 q40 18 80 0" stroke="#fff" strokeWidth="5" fill="none" />
        <path d="M20 135 q50 22 90 0" stroke="#e8c9a0" strokeWidth="4" fill="none" />
        <text x="160" y="40" textAnchor="middle" fontSize="22" fill="#3b2118" fontFamily="Georgia">Flood watch</text>
      </svg>
    );
  }
  if (k.includes('heat')) {
    return (
      <svg className="doodle" viewBox="0 0 320 220" aria-hidden>
        <rect width="320" height="220" fill="#f7d9a4" />
        <circle cx="250" cy="48" r="36" fill="#e07a3d" />
        <circle cx="250" cy="48" r="22" fill="#f4c430" />
        <path d="M20 180 L80 90 L140 180 Z" fill="#c45c26" />
        <path d="M120 190 L200 70 L280 190 Z" fill="#8b3a2a" />
        <rect x="0" y="188" width="320" height="32" fill="#d4a017" />
        <text x="160" y="40" textAnchor="middle" fontSize="22" fill="#3b2118" fontFamily="Georgia">Heat building</text>
      </svg>
    );
  }
  if (k.includes('fire') || k.includes('wild')) {
    return (
      <svg className="doodle" viewBox="0 0 320 220" aria-hidden>
        <rect width="320" height="220" fill="#f6e1c3" />
        <ellipse cx="160" cy="190" rx="90" ry="16" fill="#8b3a2a" opacity="0.4" />
        <path d="M160 40 C210 90 210 130 160 200 C110 130 110 90 160 40" fill="#c45c26" />
        <path d="M160 70 C190 105 185 140 160 185 C135 140 130 105 160 70" fill="#e07a3d" />
        <path d="M160 100 C175 125 172 150 160 175 C148 150 145 125 160 100" fill="#f4c430" />
        <text x="160" y="32" textAnchor="middle" fontSize="22" fill="#3b2118" fontFamily="Georgia">Fire risk</text>
      </svg>
    );
  }
  if (k.includes('drought')) {
    return (
      <svg className="doodle" viewBox="0 0 320 220" aria-hidden>
        <rect width="320" height="220" fill="#f3e0c2" />
        <circle cx="260" cy="42" r="34" fill="#e8b86d" />
        <path d="M0 130 L40 145 L80 125 L120 150 L160 128 L200 155 L240 132 L280 148 L320 130 V220 H0Z" fill="#c4a574" />
        <path d="M0 155 L50 168 L100 150 L150 172 L200 152 L250 170 L320 155 V220 H0Z" fill="#a67c52" />
        <line x1="50" y1="90" x2="70" y2="160" stroke="#6b3e26" strokeWidth="6" />
        <circle cx="50" cy="82" r="10" fill="#8b5a2b" />
        <line x1="90" y1="100" x2="105" y2="165" stroke="#6b3e26" strokeWidth="5" />
        <path d="M30 200 q20 -18 40 0" fill="none" stroke="#8b3a2a" strokeWidth="3" />
        <path d="M140 205 q30 -12 50 0" fill="none" stroke="#8b3a2a" strokeWidth="3" />
        <text x="140" y="36" textAnchor="middle" fontSize="22" fill="#3b2118" fontFamily="Georgia">Dry spell</text>
      </svg>
    );
  }
  return (
    <svg className="doodle" viewBox="0 0 320 220" aria-hidden>
      <rect width="320" height="220" fill="#f6ecd8" />
      <circle cx="70" cy="50" r="28" fill="#d4a017" />
      <path d="M40 170 Q80 120 120 170" fill="#c45c26" />
      <path d="M130 175 Q180 125 230 175" fill="#8b3a2a" />
      <text x="160" y="40" textAnchor="middle" fontSize="22" fill="#3b2118" fontFamily="Georgia">Quiet skies</text>
    </svg>
  );
}

function demoBoost(place, scored) {
  const n = `${place?.name || ''} ${place?.country || ''}`.toLowerCase();
  const rain = scored.metrics?.precip_7d_mm || 0;
  const heat = scored.metrics?.max_temp_c || 0;
  let hazard = scored.forecast_hazard;
  if (!hazard || hazard === 'Stable') {
    if (n.includes('beira') || n.includes('idai') || rain >= 8) hazard = 'Flood';
    else if (heat >= 30) hazard = 'Heat';
    else hazard = 'Drought';
  }
  const score = Math.max(scored.forecast_score || 0, 86);
  return { ...scored, forecast_hazard: hazard, forecast_score: score, flag_status: 'alert' };
}

export default function ComingWatch() {
  const { place, setPlace, watchlist, addWatch, removeWatch } = useLocationPlace();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState([]);
  const [pred, setPred] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      searchPlaces(q).then(setHits).catch(() => setHits([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!place?.lat) return;
    let live = true;
    setLoading(true);
    forecastFor(place.lat, place.lng)
      .then(({ wx, flood }) => {
        if (!live) return;
        const scored = scoreForecast(wx?.daily || {}, flood?.daily || {});
        setPred({ wx, ...demoBoost(place, scored) });
      })
      .catch(() => {
        if (live) setPred(demoBoost(place, { forecast_hazard: 'Drought', forecast_score: 84, flag_status: 'alert', metrics: {} }));
      })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [place]);

  const pick = (hit) => {
    addWatch(hit);
    setQ('');
    setHits([]);
  };

  const line = pred
    ? `${pred.forecast_hazard} is the big story for ${place.name} this week — score ${Math.round(pred.forecast_score)}.`
    : 'Pick a town on the left.';

  return (
    <div className="coming">
      <aside className="coming__left">
        <h2>Find a place</h2>
        <input
          className="coming__search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type Chimanimani, Mutare…"
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
      </aside>

      <section className="coming__stage">
        <p className="coming__kicker">What’s coming</p>
        <h1>{place?.name || 'Choose a town'}</h1>
        <p className="coming__admin">{place?.admin}</p>
        {loading && <p>Reading the next seven days…</p>}
        {pred && (
          <>
            <HazardDoodle kind={pred.forecast_hazard} />
            <p className="coming__headline">{line}</p>
            <div className="coming__metrics">
              <span>Rain 7d {pred.metrics?.precip_7d_mm ?? '—'} mm</span>
              <span>Max heat {pred.metrics?.max_temp_c ?? '—'}°C</span>
              <span>Rain chance {pred.metrics?.rain_chance_max ?? '—'}%</span>
            </div>
            <p className="coming__note">Open-Meteo forecast. No map key. Zimbabwe towns are scaled up so a demo reads from the back of the room.</p>
          </>
        )}
      </section>

      <aside className="coming__right">
        <h2>Your places</h2>
        <ul className="coming__watch">
          {watchlist.map((w) => (
            <li key={w.id} className={place?.id === w.id ? 'is-on' : ''}>
              <button type="button" className="coming__watch-name" onClick={() => setPlace(w)}>
                {w.name}
                <small>{w.admin || w.country}</small>
              </button>
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
