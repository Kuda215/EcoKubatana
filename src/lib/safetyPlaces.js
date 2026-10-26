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

export const PLACE_TYPES = ['Hospital', 'Clinic', 'Pharmacy', 'Police', 'Fire', 'Shelter'];

export const PLACE_META = {
  Hospital: { icon: '🏥', color: '#ef4444' },
  Clinic: { icon: '🩺', color: '#f43f5e' },
  Pharmacy: { icon: '💊', color: '#ec4899' },
  Police: { icon: '👮', color: '#3b82f6' },
  Fire: { icon: '🚒', color: '#f97316' },
  Shelter: { icon: '🏠', color: '#a855f7' },
  Other: { icon: '📍', color: '#64748b' },
};

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
  const a = tags.amenity || tags.emergency || '';
  if (a === 'hospital') return 'Hospital';
  if (a === 'clinic' || a === 'doctors' || a === 'healthcare') return 'Clinic';
  if (a === 'pharmacy') return 'Pharmacy';
  if (a === 'police') return 'Police';
  if (a === 'fire_station') return 'Fire';
  if (tags.emergency === 'assembly_point' || a === 'community_centre' || a === 'social_facility') return 'Shelter';
  if (a === 'ambulance_station') return 'Hospital';
  return 'Other';
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

export async function fetchOsmSafetyPlaces(lat, lng, radiusM = 8000) {
  const query = `[out:json][timeout:10];node["amenity"~"^(hospital|clinic|doctors|police|fire_station|pharmacy)$"](around:${radiusM},${lat},${lng});out 60;`;
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

export function directoryPlaces({ lat, lng, hubId }) {
  const hub = hubId ? hubById(hubId) : nearestAfricaHub(lat, lng);
  return fallbackPlacesForHub(hub).map((p) => ({
    ...p,
    km: Math.round(haversineKm({ lat, lng }, p) * 10) / 10,
  })).sort((a, b) => a.km - b.km);
}

export async function loadSafetyPlaces({ lat, lng, hubId }) {
  const key = `ek_osm_places_${hubId || `${Number(lat).toFixed(2)}_${Number(lng).toFixed(2)}`}`;
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.t < 30 * 60 * 1000 && parsed.places?.length && !parsed.fallback) {
        return { places: parsed.places, cached: true, fallback: false };
      }
    }
  } catch { /* ignore */ }

  const directory = directoryPlaces({ lat, lng, hubId });
  try {
    const osm = await fetchOsmSafetyPlaces(lat, lng);
    if (osm.length) {
      sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), places: osm, fallback: false }));
      return { places: osm, cached: false, fallback: false };
    }
  } catch { /* use directory */ }
  sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), places: directory, fallback: true }));
  return { places: directory, cached: false, fallback: true };
}
