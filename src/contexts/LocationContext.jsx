import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { searchPlaces } from '../lib/geocode';
import { AFRICA_HUBS } from '../lib/africaHubs';

const KEY = 'ecokubatana_place_v1';
const WATCH_KEY = 'ecokubatana_watch_v1';
const LocationContext = createContext(null);

function hubPlace(hub) {
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
  hubPlace(AFRICA_HUBS.find((h) => h.id === 'beira')),
];

export function LocationProvider({ children }) {
  const { user } = useAuth();
  const [place, setPlaceState] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return DEFAULT_WATCH[1];
  });
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const raw = localStorage.getItem(WATCH_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return DEFAULT_WATCH;
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(place)); } catch { /* ignore */ }
  }, [place]);

  useEffect(() => {
    try { localStorage.setItem(WATCH_KEY, JSON.stringify(watchlist)); } catch { /* ignore */ }
  }, [watchlist]);

  useEffect(() => {
    if (!user?.location || place?.fromUser) return;
    const loc = String(user.location);
    if (place?.name && loc.toLowerCase().includes(String(place.name).toLowerCase())) return;
    searchPlaces(loc, 1).then((hits) => {
      if (hits[0]) setPlaceState({ ...hits[0], fromUser: true });
    }).catch(() => {});
  }, [user?.location]);

  const setPlace = (p) => setPlaceState(p);

  const addWatch = (p) => {
    setWatchlist((prev) => {
      if (prev.some((x) => x.id === p.id || (x.name === p.name && x.country === p.country))) return prev;
      return [p, ...prev].slice(0, 16);
    });
    setPlaceState(p);
  };

  const removeWatch = (id) => {
    setWatchlist((prev) => prev.filter((x) => x.id !== id));
  };

  const value = useMemo(
    () => ({ place, setPlace, watchlist, addWatch, removeWatch }),
    [place, watchlist]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationPlace() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationPlace needs LocationProvider');
  return ctx;
}
