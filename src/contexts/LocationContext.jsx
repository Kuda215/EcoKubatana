import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { searchPlaces, detectGps, reverseGeocode, areaLabel } from '../lib/geocode';
import { AFRICA_HUBS } from '../lib/africaHubs';

const WATCH_KEY = 'ecokubatana_watch_v1';
const LocationContext = createContext(null);

function hubPlace(hub) {
  if (!hub) return null;
  return {
    id: hub.id,
    name: hub.name,
    admin: hub.country,
    country: hub.country,
    lat: hub.lat,
    lng: hub.lng,
  };
}

const DEFAULT_WATCH = [
  hubPlace(AFRICA_HUBS.find((h) => h.id === 'harare')),
  { id: 'chimanimani', name: 'Chimanimani', admin: 'Manicaland, Zimbabwe', country: 'Zimbabwe', lat: -19.8, lng: 32.87 },
  { id: 'mutare', name: 'Mutare', admin: 'Manicaland, Zimbabwe', country: 'Zimbabwe', lat: -18.9707, lng: 32.6709 },
].filter(Boolean);

function sameSpot(a, b) {
  if (!a || !b) return false;
  return Math.abs(a.lat - b.lat) < 0.02 && Math.abs(a.lng - b.lng) < 0.02;
}

export function LocationProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [place, setPlaceState] = useState(null);
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const raw = localStorage.getItem(WATCH_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return DEFAULT_WATCH;
  });
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(WATCH_KEY, JSON.stringify(watchlist)); } catch { /* ignore */ }
  }, [watchlist]);

  const applyPlace = (p) => {
    if (!p) return p;
    setPlaceState(p);
    return p;
  };

  const saveHome = (p) => {
    const label = areaLabel(p);
    if (!label || !user) return;
    if (user.location === label) return;
    updateUser({ location: label }).catch(() => {});
  };

  const setPlace = (p) => applyPlace(p);

  const setHomePlace = (p) => {
    applyPlace(p);
    saveHome(p);
  };

  const locateMe = async ({ persist = false } = {}) => {
    setLocating(true);
    try {
      const gps = await detectGps();
      const resolved = await reverseGeocode(gps.lat, gps.lng);
      applyPlace(resolved);
      if (persist) saveHome(resolved);
      return resolved;
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    if (!user?.location) return;
    let cancelled = false;
    searchPlaces(user.location, 1)
      .then((hits) => {
        if (cancelled || !hits[0]) return;
        if (sameSpot(place, hits[0])) return;
        applyPlace(hits[0]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.location]);

  useEffect(() => {
    if (user?.location) return;
    if (place) return;
    applyPlace(DEFAULT_WATCH[0]);
  }, [user]);

  const addWatch = (p) => {
    setWatchlist((prev) => {
      if (prev.some((x) => x.id === p.id || (x.name === p.name && x.country === p.country))) return prev;
      return [p, ...prev].slice(0, 16);
    });
    applyPlace(p);
  };

  const removeWatch = (id) => {
    setWatchlist((prev) => prev.filter((x) => x.id !== id));
  };

  const value = useMemo(
    () => ({
      place,
      setPlace,
      setHomePlace,
      watchlist,
      addWatch,
      removeWatch,
      locateMe,
      locating,
      area: areaLabel(place),
    }),
    // user/updateUser are needed so saving the home place never uses the
    // signed-out user captured before login
    [place, watchlist, locating, user, updateUser]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationPlace() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationPlace needs LocationProvider');
  return ctx;
}
