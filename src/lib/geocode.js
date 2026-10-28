/** Open-Meteo geocoding - no API key. */

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

/**
 * Open-Meteo has no reverse lookup, so GPS points are named with
 * OpenStreetMap Nominatim, falling back to BigDataCloud's free client API.
 * Coordinates always stay the GPS ones.
 */
export async function reverseGeocode(lat, lng) {
  const fallback = { id: `gps-${lat}-${lng}`, name: 'Current location', admin: '', country: '', lat, lng, fromGps: true };

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=12&accept-language=en`
    );
    if (res.ok) {
      const data = await res.json();
      const a = data.address || {};
      const name = a.suburb || a.city || a.town || a.village || a.municipality || a.county || data.name;
      if (name) {
        return placeFromGeo({
          id: `osm-${data.osm_type}-${data.osm_id}`,
          name,
          admin2: a.city && a.city !== name ? a.city : (a.county !== name ? a.county : ''),
          admin1: a.state || '',
          country: a.country || '',
        }, { fromGps: true, lat, lng });
      }
    }
  } catch { /* try the next service */ }

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (res.ok) {
      const d = await res.json();
      const name = d.locality || d.city;
      if (name) {
        return placeFromGeo({
          id: `bdc-${lat.toFixed(3)}-${lng.toFixed(3)}`,
          name,
          admin2: d.city && d.city !== name ? d.city : '',
          admin1: d.principalSubdivision || '',
          country: d.countryName || '',
        }, { fromGps: true, lat, lng });
      }
    }
  } catch { /* use the plain fallback */ }

  return fallback;
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

async function wikiSummaryImage(title) {
  if (!title) return null;
  try {
    const data = await fetchTimeout(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      2500
    );
    if (data.type === 'disambiguation') return null;
    return data.originalimage?.source || data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

export async function wikiPhoto(name) {
  return wikiSummaryImage(name);
}

/** Photo of this town, not a same-name page elsewhere. Uses lat/lng first. */
export async function wikiPhotoForPlace(place) {
  const name = place?.name;
  const lat = place?.lat;
  const lng = place?.lng;
  const country = place?.country || '';
  if (lat != null && lng != null) {
    try {
      const gs = await fetchTimeout(
        `https://en.wikipedia.org/w/api.php?origin=*&action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=12000&gslimit=10&format=json`,
        3000
      );
      const hits = gs.query?.geosearch || [];
      const n = String(name || '').toLowerCase();
      const ranked = [...hits].sort((a, b) => {
        const at = a.title.toLowerCase();
        const bt = b.title.toLowerCase();
        const as = n && (at.includes(n) || n.includes(at.split(',')[0])) ? 0 : 1;
        const bs = n && (bt.includes(n) || n.includes(bt.split(',')[0])) ? 0 : 1;
        return as - bs || (a.dist || 0) - (b.dist || 0);
      });
      for (const h of ranked.slice(0, 6)) {
        const img = await wikiSummaryImage(h.title);
        if (img) return img;
      }
    } catch { /* try title */ }
  }
  const titles = [
    country ? `${name}, ${country}` : null,
    place?.admin1 ? `${name}, ${place.admin1}` : null,
    name,
  ].filter(Boolean);
  for (const t of titles) {
    const img = await wikiSummaryImage(t);
    if (img) return img;
  }
  return null;
}

// Photon result types worth offering, in display order: real places before
// streets. Buildings and odd features are left out.
const PHOTON_RANK = { country: 0, state: 1, city: 2, county: 3, district: 4, locality: 5, street: 6 };

/**
 * Photon (OpenStreetMap, built for search-as-you-type) finds countries,
 * provinces, towns, suburbs and streets. `near` ranks results close to the
 * current place first. Falls back to Open-Meteo, which only knows towns.
 */
async function searchPhoton(q, count, near) {
  const bias = near?.lat != null && near?.lng != null ? `&lat=${near.lat}&lon=${near.lng}` : '';
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${count * 2}&lang=en${bias}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  const seen = new Set();
  const places = [];
  const typed = q.split(',')[0].trim().toLowerCase();
  const exact = (f) => (String(f.properties.name).toLowerCase() === typed ? 0 : 1);
  const features = (data.features || [])
    .filter((f) => f.properties?.type in PHOTON_RANK)
    .sort((a, b) => exact(a) - exact(b) || PHOTON_RANK[a.properties.type] - PHOTON_RANK[b.properties.type]);
  for (const f of features) {
    const p = f.properties || {};
    const [lng, lat] = f.geometry?.coordinates || [];
    if (!p.name || lat == null) continue;
    const town = p.city || p.county || '';
    const place = placeFromGeo({
      id: `photon-${p.osm_type}${p.osm_id}`,
      name: p.name,
      admin2: town !== p.name ? town : '',
      admin1: p.state !== p.name ? (p.state || '') : '',
      country: p.country || '',
      latitude: lat,
      longitude: lng,
    });
    const key = areaLabel(place).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    places.push(place);
    if (places.length >= count) break;
  }
  return places;
}

async function searchOpenMeteo(q, count) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=${count}&language=en&format=json`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((r) => placeFromGeo(r));
}

export async function searchPlaces(query, count = 6, near = null) {
  const q = String(query || '').trim();
  if (q.length < 2) return [];
  try {
    const hits = await searchPhoton(q, count, near);
    if (hits.length) return hits;
  } catch { /* fall back to Open-Meteo */ }
  return searchOpenMeteo(q, count);
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
      meaning: `Latest 7-day Open-Meteo read: about ${rain} mm of rain, up to ${chance}% chance of a wet day. That means low ground and rivers can rise - keep grain up and stay off flooded paths.`,
    };
  }
  if (hazard === 'Drought') {
    return {
      tag: 'Dry spell',
      line: 'Little rain and a dry week ahead.',
      meaning: `Latest 7-day Open-Meteo read: only about ${rain} mm of rain, hottest ${heat}°C. That means water and pasture can run short - share points and protect stock.`,
    };
  }
  if (hazard === 'Heat') {
    return {
      tag: 'Heat',
      line: 'Very hot days are coming.',
      meaning: `Latest 7-day Open-Meteo read: hottest ${heat}°C. That means shade, water, and rest at midday - check on children and elders.`,
    };
  }
  return {
    tag: 'Quiet',
    line: 'No strong weather warning this week.',
    meaning: `Latest 7-day Open-Meteo read: about ${rain} mm of rain, hottest ${heat}°C, rain chance up to ${chance}%. That means a fairly normal week - still watch the sky.`,
  };
}
