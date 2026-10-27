import { AFRICA_HUBS } from './africaHubs';

export const AFRICA_EMERGENCY_NUMBERS = {
  DZA: { police: '17', medical: '14', fire: '14', general: '112' },
  AGO: { police: '113', medical: '112', fire: '115', general: '112' },
  BEN: { police: '117', medical: '112', fire: '118', general: '112' },
  BWA: { police: '999', medical: '997', fire: '998', general: '112' },
  BFA: { police: '17', medical: '18', fire: '18', general: '112' },
  BDI: { police: '117', medical: '112', fire: '118', general: '112' },
  CMR: { police: '117', medical: '119', fire: '118', general: '112' },
  CPV: { police: '132', medical: '130', fire: '131', general: '112' },
  CAF: { police: '117', medical: '1220', fire: '118', general: '112' },
  TCD: { police: '17', medical: '18', fire: '18', general: '112' },
  COM: { police: '17', medical: '18', fire: '18', general: '112' },
  COD: { police: '112', medical: '112', fire: '118', general: '112' },
  COG: { police: '117', medical: '118', fire: '118', general: '112' },
  CIV: { police: '110', medical: '185', fire: '180', general: '112' },
  DJI: { police: '17', medical: '19', fire: '18', general: '112' },
  EGY: { police: '122', medical: '123', fire: '180', general: '112' },
  GNQ: { police: '114', medical: '112', fire: '112', general: '112' },
  ERI: { police: '113', medical: '114', fire: '116', general: '112' },
  SWZ: { police: '999', medical: '977', fire: '933', general: '112' },
  ETH: { police: '911', medical: '907', fire: '939', general: '112' },
  GAB: { police: '1730', medical: '1300', fire: '18', general: '112' },
  GMB: { police: '117', medical: '116', fire: '118', general: '112' },
  GHA: { police: '191', medical: '193', fire: '192', general: '112' },
  GIN: { police: '117', medical: '18', fire: '18', general: '112' },
  GNB: { police: '117', medical: '112', fire: '118', general: '112' },
  KEN: { police: '999', medical: '999', fire: '999', general: '112' },
  LSO: { police: '123', medical: '121', fire: '122', general: '112' },
  LBR: { police: '911', medical: '911', fire: '911', general: '112' },
  LBY: { police: '193', medical: '191', fire: '1515', general: '112' },
  MDG: { police: '117', medical: '124', fire: '118', general: '117' },
  MWI: { police: '997', medical: '998', fire: '999', general: '112' },
  MLI: { police: '17', medical: '15', fire: '18', general: '112' },
  MRT: { police: '117', medical: '101', fire: '118', general: '112' },
  MUS: { police: '999', medical: '114', fire: '115', general: '112' },
  MAR: { police: '19', medical: '15', fire: '15', general: '112' },
  MOZ: { police: '119', medical: '117', fire: '198', general: '112' },
  NAM: { police: '10111', medical: '211111', fire: '211111', general: '112' },
  NER: { police: '17', medical: '15', fire: '18', general: '112' },
  NGA: { police: '112', medical: '112', fire: '112', general: '199' },
  RWA: { police: '112', medical: '912', fire: '111', general: '112' },
  STP: { police: '112', medical: '112', fire: '112', general: '112' },
  SEN: { police: '17', medical: '15', fire: '18', general: '112' },
  SYC: { police: '999', medical: '151', fire: '999', general: '112' },
  SLE: { police: '019', medical: '999', fire: '999', general: '112' },
  SOM: { police: '888', medical: '999', fire: '555', general: '112' },
  ZAF: { police: '10111', medical: '10177', fire: '10177', general: '112' },
  SSD: { police: '999', medical: '999', fire: '999', general: '112' },
  SDN: { police: '999', medical: '333', fire: '999', general: '112' },
  TZA: { police: '112', medical: '114', fire: '114', general: '112' },
  TGO: { police: '117', medical: '8200', fire: '118', general: '112' },
  TUN: { police: '197', medical: '190', fire: '198', general: '112' },
  UGA: { police: '999', medical: '911', fire: '999', general: '112' },
  ZMB: { police: '999', medical: '991', fire: '993', general: '112' },
  ZWE: { police: '995', medical: '994', fire: '993', general: '112' },
};

const FALLBACK_NAMES = {
  harare: [
    { name: 'Parirenyatwa Group of Hospitals', type: 'Hospital', dlat: 0.008, dlng: 0.012 },
    { name: 'Harare Central Hospital', type: 'Hospital', dlat: -0.01, dlng: 0.006 },
    { name: 'Harare Central Police Station', type: 'Police', dlat: 0.002, dlng: -0.004 },
    { name: 'Belvedere Fire Station', type: 'Fire', dlat: -0.006, dlng: -0.01 },
  ],
  johannesburg: [
    { name: 'Charlotte Maxeke Johannesburg Academic Hospital', type: 'Hospital', dlat: 0.012, dlng: 0.004 },
    { name: 'Hillbrow Police Station', type: 'Police', dlat: 0.006, dlng: 0.008 },
    { name: 'Johannesburg Central Fire Station', type: 'Fire', dlat: -0.004, dlng: 0.01 },
    { name: 'Chris Hani Baragwanath Hospital', type: 'Hospital', dlat: -0.04, dlng: -0.03 },
  ],
  'cape-town': [
    { name: 'Groote Schuur Hospital', type: 'Hospital', dlat: 0.01, dlng: 0.02 },
    { name: 'Cape Town Central Police', type: 'Police', dlat: 0.002, dlng: -0.004 },
    { name: 'Roeland Street Fire Station', type: 'Fire', dlat: -0.006, dlng: 0.006 },
  ],
  nairobi: [
    { name: 'Kenyatta National Hospital', type: 'Hospital', dlat: -0.012, dlng: 0.006 },
    { name: 'Nairobi Central Police Station', type: 'Police', dlat: 0.004, dlng: -0.002 },
    { name: 'Ngong Road Fire Station', type: 'Fire', dlat: -0.008, dlng: -0.01 },
  ],
  lagos: [
    { name: 'Lagos University Teaching Hospital', type: 'Hospital', dlat: 0.02, dlng: -0.04 },
    { name: 'Lagos Island General Hospital', type: 'Hospital', dlat: 0.006, dlng: 0.01 },
    { name: 'Lion Building Police Station', type: 'Police', dlat: 0.004, dlng: 0.006 },
  ],
  accra: [
    { name: 'Korle Bu Teaching Hospital', type: 'Hospital', dlat: -0.01, dlng: -0.02 },
    { name: 'Accra Central Police Station', type: 'Police', dlat: 0.004, dlng: 0.002 },
    { name: 'Accra Fire Service HQ', type: 'Fire', dlat: 0.008, dlng: -0.006 },
  ],
  addis: [
    { name: 'Black Lion Hospital (TASH)', type: 'Hospital', dlat: 0.008, dlng: 0.006 },
    { name: 'Addis Ababa Police Commission', type: 'Police', dlat: 0.002, dlng: -0.004 },
  ],
  kampala: [
    { name: 'Mulago National Referral Hospital', type: 'Hospital', dlat: 0.02, dlng: 0.008 },
    { name: 'Central Police Station Kampala', type: 'Police', dlat: 0.002, dlng: 0.002 },
  ],
  lusaka: [
    { name: 'University Teaching Hospital Lusaka', type: 'Hospital', dlat: -0.012, dlng: 0.01 },
    { name: 'Lusaka Central Police', type: 'Police', dlat: 0.004, dlng: -0.004 },
  ],
  maputo: [
    { name: 'Maputo Central Hospital', type: 'Hospital', dlat: 0.006, dlng: 0.008 },
    { name: 'Maputo Police Command', type: 'Police', dlat: 0.002, dlng: -0.004 },
  ],
  beira: [
    { name: 'Beira Central Hospital', type: 'Hospital', dlat: 0.006, dlng: 0.004 },
    { name: 'Beira Police Station', type: 'Police', dlat: -0.004, dlng: 0.006 },
  ],
  dar: [
    { name: 'Muhimbili National Hospital', type: 'Hospital', dlat: 0.01, dlng: -0.008 },
    { name: 'Dar es Salaam Central Police', type: 'Police', dlat: 0.002, dlng: 0.004 },
  ],
  kigali: [
    { name: 'Kigali University Teaching Hospital', type: 'Hospital', dlat: 0.008, dlng: 0.006 },
    { name: 'Kacyiru Police HQ', type: 'Police', dlat: 0.012, dlng: 0.01 },
  ],
  gaborone: [
    { name: 'Princess Marina Hospital', type: 'Hospital', dlat: 0.006, dlng: 0.004 },
    { name: 'Gaborone Central Police', type: 'Police', dlat: 0.002, dlng: -0.004 },
  ],
  windhoek: [
    { name: 'Windhoek Central Hospital', type: 'Hospital', dlat: 0.006, dlng: 0.008 },
    { name: 'Windhoek Police Station', type: 'Police', dlat: -0.004, dlng: 0.002 },
  ],
  cairo: [
    { name: 'Kasr Al Ainy Hospital', type: 'Hospital', dlat: -0.008, dlng: 0.004 },
    { name: 'Cairo Police HQ', type: 'Police', dlat: 0.004, dlng: -0.006 },
  ],
  khartoum: [
    { name: 'Khartoum Teaching Hospital', type: 'Hospital', dlat: 0.008, dlng: 0.006 },
    { name: 'Khartoum Central Police', type: 'Police', dlat: -0.004, dlng: -0.004 },
  ],
  dakar: [
    { name: 'Hôpital Principal de Dakar', type: 'Hospital', dlat: 0.006, dlng: 0.004 },
    { name: 'Commissariat Central Dakar', type: 'Police', dlat: 0.002, dlng: -0.006 },
  ],
  bamako: [
    { name: 'CHU Point G', type: 'Hospital', dlat: 0.01, dlng: -0.008 },
    { name: 'Bamako Police Centrale', type: 'Police', dlat: 0.002, dlng: 0.004 },
  ],
  niamey: [
    { name: 'Hôpital National de Niamey', type: 'Hospital', dlat: 0.008, dlng: 0.006 },
    { name: 'Police Nationale Niamey', type: 'Police', dlat: -0.004, dlng: 0.002 },
  ],
  ndjamena: [
    { name: "Hôpital Général de Référence N'Djamena", type: 'Hospital', dlat: 0.006, dlng: 0.008 },
    { name: "Police N'Djamena", type: 'Police', dlat: -0.004, dlng: -0.004 },
  ],
  mogadishu: [
    { name: 'Mogadishu General Hospital', type: 'Hospital', dlat: 0.008, dlng: 0.006 },
    { name: 'Mogadishu Police Station', type: 'Police', dlat: -0.006, dlng: 0.004 },
  ],
  antananarivo: [
    { name: 'HJRA Antananarivo', type: 'Hospital', dlat: 0.006, dlng: 0.008 },
    { name: 'Antananarivo Police', type: 'Police', dlat: 0.002, dlng: -0.004 },
  ],
  kinshasa: [
    { name: 'Hôpital Général de Kinshasa', type: 'Hospital', dlat: 0.01, dlng: 0.008 },
    { name: 'Police Nationale Kinshasa', type: 'Police', dlat: 0.002, dlng: -0.006 },
  ],
  luanda: [
    { name: 'Hospital Josina Machel', type: 'Hospital', dlat: 0.008, dlng: 0.006 },
    { name: 'Luanda Police Command', type: 'Police', dlat: -0.004, dlng: 0.004 },
  ],
  abidjan: [
    { name: 'CHU de Treichville', type: 'Hospital', dlat: -0.01, dlng: 0.008 },
    { name: 'Police Abidjan Plateau', type: 'Police', dlat: 0.004, dlng: -0.004 },
  ],
};

export const PLACE_TYPES = ['High ground', 'Open ground', 'Water', 'Assembly'];

export const PLACE_META = {
  'High ground': { icon: '⛰️', color: '#1a5c63' },
  'Open ground': { icon: '🟩', color: '#1a5c63' },
  Water: { icon: '💧', color: '#1a5c63' },
  Assembly: { icon: '🚩', color: '#c45c26' },
  Other: { icon: '📍', color: '#64748b' },
};

// The incident each kind of spot protects you from; assembly points serve whatever is forecast
const HAZARD_FOR_TYPE = { 'High ground': 'Flood', Water: 'Drought', 'Open ground': 'Wildfire' };

export function hazardForPlace(type, forecastHazard) {
  return HAZARD_FOR_TYPE[type] || (forecastHazard && forecastHazard !== 'Stable' ? forecastHazard : 'Any emergency');
}

// Round-robin by type so one kind of spot (e.g. parks) can't fill the whole list
export function mixByType(places) {
  const groups = new Map();
  places.forEach((p) => {
    if (!groups.has(p.type)) groups.set(p.type, []);
    groups.get(p.type).push(p);
  });
  const queues = [...groups.values()];
  const out = [];
  while (queues.some((q) => q.length)) {
    queues.forEach((q) => { if (q.length) out.push(q.shift()); });
  }
  return out;
}

export function typesForHazard(hazard) {
  const h = String(hazard || 'Stable');
  if (h === 'Flood' || h === 'Cyclone') return ['High ground', 'Assembly', 'Open ground'];
  if (h === 'Wildfire' || h === 'Heat') return ['Open ground', 'Water', 'Assembly'];
  if (h === 'Drought') return ['Water', 'Open ground'];
  if (h === 'Landslide') return ['Open ground', 'Assembly'];
  return ['Open ground', 'Water', 'Assembly', 'High ground'];
}

export function numbersForIso(iso3) {
  return AFRICA_EMERGENCY_NUMBERS[iso3] || { police: '112', medical: '112', fire: '112', general: '112' };
}

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestAfricaHub(lat, lng) {
  return AFRICA_HUBS.slice().sort((a, b) => haversineKm({ lat, lng }, a) - haversineKm({ lat, lng }, b))[0];
}

export function hubById(id) {
  return AFRICA_HUBS.find((h) => h.id === id) || AFRICA_HUBS[0];
}

function typeOf(tags = {}) {
  const natural = tags.natural || '';
  if (['peak', 'ridge', 'saddle', 'hill', 'cliff'].includes(natural)) return 'High ground';
  if (tags.emergency === 'assembly_point') return 'Assembly';
  if (tags.amenity === 'drinking_water' || tags.man_made === 'water_well' || natural === 'spring' || natural === 'water') return 'Water';
  if (tags.leisure === 'park' || tags.leisure === 'pitch' || tags.landuse === 'recreation_ground') return 'Open ground';
  return 'Other';
}

function overpassForHazard(hazard, radiusM, lat, lng) {
  const around = `(around:${radiusM},${lat},${lng})`;
  if (hazard === 'Flood' || hazard === 'Cyclone') {
    return `[out:json][timeout:12];(
      node["natural"~"^(peak|ridge|saddle|hill)$"]${around};
      node["emergency"="assembly_point"]${around};
      node["leisure"="park"]${around};
      way["leisure"="park"]${around};
    );out center 80;`;
  }
  if (hazard === 'Wildfire') {
    return `[out:json][timeout:12];(
      node["emergency"="assembly_point"]${around};
      node["natural"="water"]${around};
      node["leisure"~"^(park|pitch)$"]${around};
      way["leisure"~"^(park|pitch)$"]${around};
    );out center 80;`;
  }
  if (hazard === 'Drought' || hazard === 'Heat') {
    return `[out:json][timeout:12];(
      node["amenity"="drinking_water"]${around};
      node["man_made"="water_well"]${around};
      node["natural"="spring"]${around};
      node["leisure"="park"]${around};
      way["leisure"="park"]${around};
    );out center 80;`;
  }
  return `[out:json][timeout:12];(
    node["emergency"="assembly_point"]${around};
    node["amenity"="drinking_water"]${around};
    node["natural"~"^(peak|ridge|hill|spring)$"]${around};
    node["leisure"="park"]${around};
    way["leisure"="park"]${around};
  );out center 80;`;
}

function fallbackPlacesForHub(hub) {
  if (!hub) return [];
  const named = FALLBACK_NAMES[hub.id] || [
    { name: `${hub.name} Referral Hospital`, type: 'Hospital', dlat: 0.008, dlng: 0.006 },
    { name: `${hub.name} Central Police`, type: 'Police', dlat: -0.004, dlng: 0.004 },
    { name: `${hub.name} Fire Station`, type: 'Fire', dlat: 0.002, dlng: -0.008 },
  ];
  const origin = { lat: hub.lat, lng: hub.lng };
  return named.map((p, i) => {
    const lat = hub.lat + (p.dlat || 0);
    const lng = hub.lng + (p.dlng || 0);
    return {
      id: `fb-${hub.id}-${i}`,
      name: p.name,
      type: p.type,
      lat,
      lng,
      address: `${hub.name}, ${hub.country}`,
      phone: '',
      km: Math.round(haversineKm(origin, { lat, lng }) * 10) / 10,
      source: 'Directory fallback',
    };
  });
}

async function postOverpass(url, query, signal) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: `data=${encodeURIComponent(query)}`,
    signal,
  });
  if (!res.ok) throw new Error(`OpenStreetMap Overpass ${res.status}`);
  return res.json();
}

export async function fetchOsmSafetyPlaces(lat, lng, radiusM = 25000, hazard = 'Stable') {
  const query = overpassForHazard(hazard, radiusM, lat, lng);
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];
  const origin = { lat, lng };
  let json = null;
  let lastErr = null;
  for (const url of endpoints) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      json = await postOverpass(url, query, ctrl.signal);
      clearTimeout(timer);
      break;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
    }
  }
  if (!json) throw lastErr || new Error('OpenStreetMap Overpass unavailable');
  const places = (json.elements || [])
    .map((el) => {
      const plat = el.lat || el.center?.lat;
      const plng = el.lon || el.center?.lon;
      if (plat == null || plng == null) return null;
      const tags = el.tags || {};
      const type = typeOf(tags);
      const name = tags.name || tags['name:en'] || `${type} (unnamed)`;
      const phone = tags.phone || tags['contact:phone'] || '';
      return {
        id: `${el.type}-${el.id}`,
        name,
        type,
        lat: plat,
        lng: plng,
        address: [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ') || tags['addr:full'] || '',
        phone,
        km: Math.round(haversineKm(origin, { lat: plat, lng: plng }) * 10) / 10,
        source: 'OpenStreetMap',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.km - b.km);
  const seen = new Set();
  return places.filter((p) => {
    const k = `${p.type}-${p.name.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function directoryPlaces({ lat, lng, name, hazard }) {
  const label = name || 'Local';
  const origin = { lat, lng };
  const h = hazard || 'Stable';
  const named = (h === 'Flood' || h === 'Cyclone')
    ? [
      { name: `Higher ground north of ${label}`, type: 'High ground', dlat: 0.04, dlng: 0.01 },
      { name: `${label} assembly point (open)`, type: 'Assembly', dlat: 0.012, dlng: -0.01 },
      { name: `Ridge / high path near ${label}`, type: 'High ground', dlat: -0.03, dlng: 0.02 },
    ]
    : h === 'Wildfire'
      ? [
        { name: `Open assembly ground, ${label}`, type: 'Open ground', dlat: 0.02, dlng: 0.01 },
        { name: `Water / dam near ${label}`, type: 'Water', dlat: -0.015, dlng: 0.02 },
      ]
      : h === 'Drought' || h === 'Heat'
        ? [
          { name: `${label} water point / well`, type: 'Water', dlat: 0.01, dlng: -0.008 },
          { name: `Shaded park / open ground, ${label}`, type: 'Open ground', dlat: -0.012, dlng: 0.01 },
        ]
        : [
          { name: `Open assembly ground, ${label}`, type: 'Open ground', dlat: 0.012, dlng: 0.008 },
          { name: `${label} water point`, type: 'Water', dlat: -0.008, dlng: 0.01 },
          { name: `Higher ground near ${label}`, type: 'High ground', dlat: 0.03, dlng: -0.01 },
        ];
  return named.map((p, i) => {
    const plat = lat + p.dlat;
    const plng = lng + p.dlng;
    return {
      id: `fb-${label}-${i}`,
      name: p.name,
      type: p.type,
      lat: plat,
      lng: plng,
      address: label,
      phone: '',
      km: Math.round(haversineKm(origin, { lat: plat, lng: plng }) * 10) / 10,
      source: 'Nearby estimate',
    };
  }).sort((a, b) => a.km - b.km);
}

export async function loadSafetyPlaces({ lat, lng, name, hazard = 'Stable' }) {
  const key = `ek_osm_places_v4_${hazard}_${Number(lat).toFixed(3)}_${Number(lng).toFixed(3)}`;
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.t < 30 * 60 * 1000 && parsed.places?.length && !parsed.fallback) {
        return { places: parsed.places, cached: true, fallback: false };
      }
    }
  } catch { /* ignore */ }

  const directory = directoryPlaces({ lat, lng, name, hazard });
  try {
    const osm = await fetchOsmSafetyPlaces(lat, lng, 25000, hazard);
    if (osm.length) {
      sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), places: osm, fallback: false }));
      return { places: osm, cached: false, fallback: false };
    }
  } catch { /* use directory */ }
  sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), places: directory, fallback: true }));
  return { places: directory, cached: false, fallback: true };
}
