import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { AFRICA_HUBS } from './africaHubs';
import { estimateLosses } from './dataSources';

const CACHE_KEY = 'ecokubatana_climate_cache_v1';
const CACHE_MS = 30 * 60 * 1000;

function sum(arr = []) {
  return arr.reduce((a, b) => a + (Number(b) || 0), 0);
}
function max(arr = []) {
  return arr.reduce((a, b) => Math.max(a, Number(b) || 0), 0);
}
function flagFromScore(score) {
  if (score >= 75) return 'emergency';
  if (score >= 55) return 'alert';
  if (score >= 35) return 'watch';
  return 'quiet';
}

export function scoreForecast(daily = {}, floodDaily = {}) {
  const precip7 = sum(daily.precipitation_sum);
  const maxTemp = max(daily.temperature_2m_max);
  const maxProb = max(daily.precipitation_probability_max);
  const discharge = max(floodDaily.river_discharge);
  const dischargeMean = max(floodDaily.river_discharge_mean);

  let flood = 0;
  if (precip7 >= 80 || maxProb >= 90) flood += 45;
  else if (precip7 >= 40 || maxProb >= 70) flood += 28;
  else if (precip7 >= 20) flood += 12;
  if (discharge && dischargeMean && discharge > dischargeMean * 1.8) flood += 25;
  else if (discharge && dischargeMean && discharge > dischargeMean * 1.3) flood += 12;

  let drought = 0;
  if (precip7 <= 1 && maxTemp >= 32) drought += 40;
  else if (precip7 <= 5 && maxTemp >= 30) drought += 22;

  let heat = 0;
  if (maxTemp >= 40) heat += 50;
  else if (maxTemp >= 36) heat += 30;
  else if (maxTemp >= 33) heat += 12;

  const ranked = [
    { hazard: 'Flood', score: Math.min(100, flood) },
    { hazard: 'Drought', score: Math.min(100, drought) },
    { hazard: 'Heat', score: Math.min(100, heat) },
  ].sort((a, b) => b.score - a.score);

  const top = ranked[0];
  return {
    forecast_hazard: top.score < 12 ? 'Stable' : top.hazard,
    forecast_score: top.score,
    flag_status: flagFromScore(Math.max(top.score, 0)),
    metrics: {
      precip_7d_mm: Math.round(precip7 * 10) / 10,
      max_temp_c: Math.round(maxTemp * 10) / 10,
      rain_chance_max: maxProb,
      river_discharge: discharge || null,
    },
  };
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function readCache(allowStale = false) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const stale = Date.now() - parsed.savedAt > CACHE_MS;
    if (stale && !allowStale && typeof navigator !== 'undefined' && navigator.onLine) return null;
    return parsed.data ? { ...parsed.data, fromCache: true, stale } : null;
  } catch {
    return null;
  }
}

function writeCache(data) {
  const packed = JSON.stringify({ savedAt: Date.now(), data });
  try { sessionStorage.setItem(CACHE_KEY, packed); } catch { /* quota */ }
  try { localStorage.setItem(CACHE_KEY, packed); } catch { /* quota */ }
}

export async function loadClimateBundle() {
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  const staleOk = readCache(true);
  if (offline && staleOk?.hotspots?.length) return { ...staleOk, fromCache: true };
  const fresh = readCache(false);
  if (fresh?.hotspots?.length) return fresh;

  const lats = AFRICA_HUBS.map((h) => h.lat).join(',');
  const lngs = AFRICA_HUBS.map((h) => h.lng).join(',');
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90);
  const iso = (d) => d.toISOString().slice(0, 10);

  const [forecastRes, archiveRes, floodRes, eonetRes, reliefRes, wbRes] = await Promise.allSettled([
    fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,precipitation,weather_code&daily=temperature_2m_max,precipitation_sum,precipitation_probability_max&forecast_days=7&timezone=auto`),
    fetchJson(`https://archive-api.open-meteo.com/v1/archive?latitude=${lats}&longitude=${lngs}&start_date=${iso(start)}&end_date=${iso(end)}&daily=precipitation_sum,temperature_2m_max`),
    fetchJson(`https://flood-api.open-meteo.com/v1/flood?latitude=${lats}&longitude=${lngs}&daily=river_discharge,river_discharge_mean&forecast_days=7`),
    fetchJson('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=120'),
    fetchJson('https://api.reliefweb.int/v1/disasters?appname=ecokubatana&preset=latest&limit=40&profile=lite'),
    fetchJson(`https://api.worldbank.org/v2/country/${[...new Set(AFRICA_HUBS.map((h) => h.iso3))].join(';')}/indicator/SP.POP.TOTL?format=json&mrv=1&per_page=60`),
  ]);

  const asArray = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const forecasts = forecastRes.status === 'fulfilled' ? asArray(forecastRes.value) : [];
  const archives = archiveRes.status === 'fulfilled' ? asArray(archiveRes.value) : [];
  const floods = floodRes.status === 'fulfilled' ? asArray(floodRes.value) : [];

  const countryPop = {};
  if (wbRes.status === 'fulfilled' && Array.isArray(wbRes.value?.[1])) {
    wbRes.value[1].forEach((row) => {
      if (row?.countryiso3code && row.value) countryPop[row.countryiso3code] = row.value;
    });
  }

  const eonetEvents = [];
  if (eonetRes.status === 'fulfilled') {
    (eonetRes.value.events || []).forEach((ev) => {
      const geo = ev.geometry?.[ev.geometry.length - 1];
      const coords = geo?.coordinates;
      const lng = Array.isArray(coords) ? coords[0] : null;
      const lat = Array.isArray(coords) ? coords[1] : null;
      if (lat == null || lng == null) return;
      const category = ev.categories?.[0]?.title || 'Hazard';
      eonetEvents.push({
        id: `eonet-${ev.id}`,
        title: ev.title,
        category,
        source: 'NASA EONET / Earthdata',
        lat,
        lng,
        event_date: geo?.date?.slice(0, 10) || null,
        severity: category.toLowerCase().includes('wildfire') ? 'Warning' : 'Watch',
        url: ev.sources?.[0]?.url || 'https://eonet.gsfc.nasa.gov',
        description: `${category} tracked by NASA Earth Observatory Natural Event Tracker.`,
      });
    });
  }

  const reliefEvents = [];
  if (reliefRes.status === 'fulfilled') {
    (reliefRes.value.data || []).forEach((item) => {
      const fields = item.fields || {};
      const iso = fields.primary_country?.iso3 || fields.country?.[0]?.iso3;
      reliefEvents.push({
        id: `rw-${item.id}`,
        title: fields.name || 'Disaster',
        category: fields.primary_type?.name || 'Disaster',
        source: 'ReliefWeb (OCHA / EM-DAT-style)',
        country: fields.primary_country?.name || iso,
        lat: fields.primary_country?.location?.lat || null,
        lng: fields.primary_country?.location?.lon || null,
        event_date: (fields.date?.created || fields.date?.event || '').slice(0, 10) || null,
        severity: 'Warning',
        url: fields.url_alias || `https://reliefweb.int/disaster/${item.id}`,
        description: `${fields.primary_type?.name || 'Disaster'} recorded for ${fields.primary_country?.name || 'Africa'}.`,
      });
    });
  }

  const liveEvents = [...eonetEvents, ...reliefEvents];

  const hotspots = AFRICA_HUBS.map((hub, i) => {
    const daily = forecasts[i]?.daily || {};
    const floodDaily = floods[i]?.daily || {};
    const scored = scoreForecast(daily, floodDaily);
    const archiveDaily = archives[i]?.daily || {};
    const histPrecip = sum(archiveDaily.precipitation_sum);
    const histMaxTemp = max(archiveDaily.temperature_2m_max);
    let historic_score = hub.historic_score;
    if (histPrecip && histPrecip < 40) historic_score = Math.max(historic_score, 70);
    if (histPrecip && histPrecip > 400) historic_score = Math.max(historic_score, 68);

    const nearbyFlags = liveEvents.filter((e) => {
      if (e.lat == null) return e.country === hub.country;
      const dlat = e.lat - hub.lat;
      const dlng = e.lng - hub.lng;
      return dlat * dlat + dlng * dlng < 25;
    });
    if (nearbyFlags.length) {
      scored.forecast_score = Math.min(100, scored.forecast_score + 12);
      scored.flag_status = flagFromScore(scored.forecast_score);
    }

    const sources = ['NASA Earthdata (EONET)', 'Copernicus GloFAS via Open-Meteo Flood', 'Open-Meteo forecast + archive', 'ReliefWeb / EM-DAT-style', 'World Bank population', 'OpenStreetMap'];
    const money = estimateLosses({ ...hub, historic_score, ...scored });

    return {
      ...hub,
      country_population: countryPop[hub.iso3] || null,
      historic_score,
      ...scored,
      current_temp: forecasts[i]?.current?.temperature_2m ?? null,
      forecast_days: daily,
      summary: `${hub.name}: historic ${hub.historic_hazard} (score ${historic_score}). Next 7 days lean ${scored.forecast_hazard} (${scored.forecast_score}). 90-day rain ${Math.round(histPrecip)} mm, peak ${Math.round(histMaxTemp)}°C.`,
      sources,
      nearby_flags: nearbyFlags.length,
      potential_loss_usd: money.potential_loss_usd,
      household_loss_usd: money.household_loss_usd,
      gdp_per_capita_usd: money.gdp_per_capita_usd,
      metrics: {
        ...scored.metrics,
        rain_90d_mm: Math.round(histPrecip),
        hist_max_temp_c: Math.round(histMaxTemp * 10) / 10,
        country_population: countryPop[hub.iso3] || null,
        potential_loss_usd: money.potential_loss_usd,
        household_loss_usd: money.household_loss_usd,
      },
    };
  });

  const data = {
    hotspots,
    events: liveEvents,
    countryPop,
    sourcesStatus: {
      forecast: forecastRes.status,
      archive: archiveRes.status,
      flood: floodRes.status,
      eonet: eonetRes.status,
      reliefweb: reliefRes.status,
      worldbank: wbRes.status,
    },
    syncedAt: new Date().toISOString(),
  };
  writeCache(data);
  persistClimate(data).catch(() => {});
  return data;
}

async function persistClimate(data) {
  if (!supabase) return;
  const hotspotRows = data.hotspots.map((h) => ({
    id: h.id,
    name: h.name,
    country: h.country,
    iso3: h.iso3,
    lat: h.lat,
    lng: h.lng,
    population_est: h.population_est,
    historic_hazard: h.historic_hazard,
    historic_score: h.historic_score,
    forecast_hazard: h.forecast_hazard,
    forecast_score: h.forecast_score,
    flag_status: h.flag_status,
    summary: h.summary,
    farmer_action: h.farmer_action,
    sources: h.sources,
    metrics: h.metrics,
    updated_at: new Date().toISOString(),
  }));
  await supabase.from('climate_hotspots').upsert(hotspotRows);
  if (data.events?.length) {
    const eventRows = data.events.slice(0, 80).map((e) => ({
      id: String(e.id).slice(0, 120),
      title: e.title,
      category: e.category,
      source: e.source,
      country: e.country || null,
      lat: e.lat,
      lng: e.lng,
      event_date: e.event_date || null,
      severity: e.severity || null,
      url: e.url || null,
      description: e.description || null,
    }));
    await supabase.from('climate_events').upsert(eventRows);
  }
}

export function riskColor(score, status, colorBlind = false) {
  const s = status || flagFromScore(score || 0);
  if (colorBlind) {
    if (s === 'emergency' || score >= 75) return '#d55e00';
    if (s === 'alert' || score >= 55) return '#e69f00';
    if (s === 'watch' || score >= 35) return '#0072b2';
    return '#009e73';
  }
  if (s === 'emergency' || score >= 75) return '#e63946';
  if (s === 'alert' || score >= 55) return '#f4a261';
  if (s === 'watch' || score >= 35) return '#e9c46a';
  return '#52b788';
}

export function useClimateData() {
  const [bundle, setBundle] = useState({ loading: true, hotspots: AFRICA_HUBS, events: [], error: null, syncedAt: null, sourcesStatus: {} });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (supabase) {
          const { data } = await supabase.from('climate_hotspots').select('*');
          if (!cancelled && data?.length) {
            setBundle((prev) => ({ ...prev, hotspots: data, loading: true }));
          }
        }
        const live = await loadClimateBundle();
        if (!cancelled) setBundle({ loading: false, ...live, error: null });
      } catch (error) {
        if (!cancelled) setBundle((prev) => ({ ...prev, loading: false, error: error.message }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return bundle;
}

export async function geocodeAndForecast(place) {
  if (!place) return null;
  const geo = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`);
  const loc = geo.results?.[0];
  if (!loc) return null;
  const wx = await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code,precipitation&daily=temperature_2m_max,precipitation_sum&forecast_days=5&timezone=auto`);
  return { loc, wx };
}
