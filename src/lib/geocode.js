/** Open-Meteo geocoding — no API key. */

export async function searchPlaces(query, count = 6) {
  const q = String(query || '').trim();
  if (q.length < 2) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=${count}&language=en&format=json`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((r) => ({
    id: `${r.id || r.latitude}-${r.longitude}`,
    name: r.name,
    admin: [r.admin1, r.country].filter(Boolean).join(', '),
    country: r.country,
    lat: r.latitude,
    lng: r.longitude,
  }));
}

export async function forecastFor(lat, lng) {
  const wx = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,precipitation&daily=temperature_2m_max,precipitation_sum,precipitation_probability_max&forecast_days=7&timezone=auto`
  ).then((r) => r.json());
  let flood = null;
  try {
    flood = await fetch(
      `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lng}&daily=river_discharge,river_discharge_mean&forecast_days=7`
    ).then((r) => r.json());
  } catch {
    flood = null;
  }
  return { wx, flood };
}
