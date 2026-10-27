export const DATA_SOURCES = {
  openmeteo: {
    id: 'openmeteo',
    label: 'Open-Meteo',
    detail: 'Free weather forecast and 90-day archive used for rain, heat and drought signals.',
    url: 'https://open-meteo.com',
  },
  glofas: {
    id: 'glofas',
    label: 'Copernicus GloFAS',
    detail: 'Global flood awareness river discharge, served through the Open-Meteo Flood API.',
    url: 'https://global-flood.emergency.copernicus.eu',
  },
  eonet: {
    id: 'eonet',
    label: 'NASA EONET / Earthdata',
    detail: 'Satellite-linked natural events (wildfires, storms, volcanoes) from NASA Earth Observatory.',
    url: 'https://eonet.gsfc.nasa.gov',
  },
  reliefweb: {
    id: 'reliefweb',
    label: 'ReliefWeb (OCHA)',
    detail: 'Operational disaster records. We treat this as EM-DAT-style historic intelligence.',
    url: 'https://reliefweb.int',
  },
  emdat: {
    id: 'emdat',
    label: 'EM-DAT-style historic markers',
    detail: 'Curated landmark disasters (Idai, Freddy, Day Zero, Horn of Africa drought) used to weight the historic map.',
    url: 'https://www.emdat.be',
  },
  worldbank: {
    id: 'worldbank',
    label: 'World Bank',
    detail: 'Country population and GDP per capita used for people-at-risk and money-at-risk estimates.',
    url: 'https://data.worldbank.org',
  },
  worldpop: {
    id: 'worldpop',
    label: 'WorldPop-style city counts',
    detail: 'Urban population estimates aligned with WorldPop methods for each hub city.',
    url: 'https://www.worldpop.org',
  },
  osm: {
    id: 'osm',
    label: 'OpenStreetMap',
    detail: 'Free OpenStreetMap street tiles. No API key. Place names are OSM community data.',
    url: 'https://www.openstreetmap.org',
  },
  overpass: {
    id: 'overpass',
    label: 'OpenStreetMap Overpass',
    detail: 'Live hospitals, clinics, police and fire stations queried around African hub cities.',
    url: 'https://overpass-api.de',
  },
};

export const GDP_PER_CAPITA_USD = {
  ZWE: 2150, ZAF: 6250, KEN: 2100, NGA: 1620, GHA: 2260, ETH: 1290, UGA: 1070,
  ZMB: 1330, MOZ: 650, TZA: 1220, RWA: 1020, BWA: 7740, NAM: 4870, EGY: 3510,
  SDN: 760, SEN: 1740, MLI: 900, NER: 620, TCD: 690, SOM: 480, MDG: 530,
  COD: 680, AGO: 2310, CIV: 2670,
};

const HAZARD_GDP_SHARE = {
  Flood: 0.022,
  Drought: 0.018,
  Cyclone: 0.04,
  Heat: 0.008,
  Landslide: 0.015,
  Storm: 0.025,
  'Coastal flood': 0.02,
  Rain: 0.01,
  Stable: 0.004,
};

export function formatMoney(n) {
  const v = Math.max(0, Number(n) || 0);
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}bn`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}m`;
  if (v >= 1e3) return `$${Math.round(v).toLocaleString()}`;
  return `$${Math.round(v)}`;
}

export function estimateLosses(hub, livelihood = '') {
  const gdp = GDP_PER_CAPITA_USD[hub.iso3] || 1500;
  const score = Math.max(hub.historic_score || 0, hub.forecast_score || 0, 8);
  const hazard = hub.forecast_hazard && hub.forecast_hazard !== 'Stable' ? hub.forecast_hazard : hub.historic_hazard;
  const share = HAZARD_GDP_SHARE[hazard] || 0.015;
  const pop = hub.population_est || 0;
  const cityGdp = pop * gdp;
  const potential_loss_usd = Math.round(cityGdp * (score / 100) * share);
  const job = String(livelihood || '').toLowerCase();
  let householdMult = 1;
  if (job.includes('farm') || job.includes('livestock') || job.includes('fish')) householdMult = 1.9;
  else if (job.includes('trad') || job.includes('market') || job.includes('shop')) householdMult = 1.5;
  else if (job.includes('health') || job.includes('teach')) householdMult = 0.9;
  const household_loss_usd = Math.round(Math.min(9000, Math.max(60, 220 * (score / 40) * householdMult)));
  return {
    gdp_per_capita_usd: gdp,
    potential_loss_usd,
    household_loss_usd,
    hazard_for_money: hazard,
    method: 'City GDP (pop x World Bank GDP/capita) x hazard share x risk score. Household figure is a planning range, not insurance.',
  };
}

export function downloadExcelCsv(filename, rows) {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const s = value == null ? '' : String(value);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function hubForUser(hotspots, location) {
  const loc = String(location || '').toLowerCase();
  return hotspots.find((h) => loc.includes(h.name.toLowerCase()) || loc.includes(h.country.toLowerCase()))
    || hotspots.find((h) => h.id === 'harare')
    || hotspots[0];
}

export function nearestHub(hotspots, lat, lng) {
  if (lat == null || lng == null || !hotspots?.length) return hotspots?.[0];
  let best = hotspots[0];
  let bestD = Infinity;
  hotspots.forEach((h) => {
    const d = (h.lat - lat) ** 2 + (h.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = h;
    }
  });
  return best;
}
