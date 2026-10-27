/** Open-Meteo geocoding — no API key. */

export function detectGps() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not available'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      reject,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

export async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lng}&language=en&format=json`
  );
  if (!res.ok) {
    return { id: `gps-${lat}-${lng}`, name: 'Current location', admin: '', country: '', lat, lng, fromGps: true };
  }
  const data = await res.json();
  const r = data.results?.[0];
  if (!r) {
    return { id: `gps-${lat}-${lng}`, name: 'Current location', admin: '', country: '', lat, lng, fromGps: true };
  }
  return placeFromGeo(r, { fromGps: true, lat, lng });
}

function placeFromGeo(r, extra = {}) {
  const parts = [r.name, r.admin2, r.admin1, r.country].filter(Boolean);
  const unique = [...new Set(parts)];
  return {
    id: String(r.id || `${r.latitude}-${r.longitude}`),
    name: r.name,
    admin1: r.admin1 || '',
    admin2: r.admin2 || '',
    admin: unique.slice(1).join(', '),
    country: r.country || '',
    lat: r.latitude ?? extra.lat,
    lng: r.longitude ?? extra.lng,
    ...extra,
  };
}

export function areaLabel(place) {
  if (!place) return '';
  const bits = (place.admin1 || place.admin2)
    ? [place.name, place.admin2, place.admin1, place.country]
    : [place.name, place.admin, place.country];
  return [...new Set(bits.map((p) => String(p || '').trim()).filter(Boolean))].join(', ');
}

export async function wikiPhoto(name) {
  if (!name) return null;
  try {
    const data = await fetchTimeout(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      2500
    );
    return data.originalimage?.source || data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

export async function searchPlaces(query, count = 6) {
  const q = String(query || '').trim();
  if (q.length < 2) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=${count}&language=en&format=json`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((r) => placeFromGeo(r));
}

async function fetchTimeout(url, ms = 3500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function forecastFor(lat, lng) {
  const wx = await fetchTimeout(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,precipitation&daily=temperature_2m_max,precipitation_sum,precipitation_probability_max&forecast_days=7&timezone=auto`,
    3500
  );
  return { wx, flood: null };
}

export function plainTalk(scored) {
  const rain = scored?.metrics?.precip_7d_mm;
  const heat = scored?.metrics?.max_temp_c;
  const chance = scored?.metrics?.rain_chance_max;
  const hazard = scored?.forecast_hazard || 'Stable';
  if (hazard === 'Flood') {
    return {
      tag: 'Rain watch',
      line: 'Heavy rain is likely this week.',
      meaning: `Latest 7-day Open-Meteo read: about ${rain} mm of rain, up to ${chance}% chance of a wet day. That means low ground and rivers can rise — keep grain up and stay off flooded paths.`,
    };
  }
  if (hazard === 'Drought') {
    return {
      tag: 'Dry spell',
      line: 'Little rain and a dry week ahead.',
      meaning: `Latest 7-day Open-Meteo read: only about ${rain} mm of rain, hottest ${heat}°C. That means water and pasture can run short — share points and protect stock.`,
    };
  }
  if (hazard === 'Heat') {
    return {
      tag: 'Heat',
      line: 'Very hot days are coming.',
      meaning: `Latest 7-day Open-Meteo read: hottest ${heat}°C. That means shade, water, and rest at midday — check on children and elders.`,
    };
  }
  return {
    tag: 'Quiet',
    line: 'No strong weather warning this week.',
    meaning: `Latest 7-day Open-Meteo read: about ${rain} mm of rain, hottest ${heat}°C, rain chance up to ${chance}%. That means a fairly normal week — still watch the sky.`,
  };
}
