import { AFRICA_HUBS } from './africaHubs';

const YT = [
  'eMOviCHkqh8', 'mHH4nWGoxdA', 't_GjiwGw9kA', 'cISoqgq-BG4', 'gglCXUzODyk',
];

const HAZARDS = ['Drought', 'Flood', 'Cyclone', 'Heat', 'Wildfire', 'Early warning', 'Community'];

const AUTHORS = [
  'UNDP Africa', 'WMO', 'UNEP', 'Practical Action', 'MSF',
  'The Climate Frontline', 'Civil Protection', 'Africa Adaptation Initiative',
];

function pad(n) {
  const m = Math.floor(n / 60);
  const s = String(n % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export const CLIMATE_VIDEOS = (() => {
  const out = [];
  let i = 0;
  while (out.length < 100) {
    const hub = AFRICA_HUBS[i % AFRICA_HUBS.length];
    const hazard = HAZARDS[i % HAZARDS.length];
    const yt = YT[i % YT.length];
    out.push({
      id: `cv-${i + 1}`,
      title: `${hazard} in ${hub.name}, ${hub.country} - African climate action`,
      author: AUTHORS[i % AUTHORS.length],
      duration: pad(180 + (i * 17) % 420),
      posted: `${(i % 4) + 1} year${i % 4 ? 's' : ''} ago`,
      category: hazard === 'Early warning' ? 'Early warning' : hazard === 'Community' ? 'Community' : hazard,
      region: hub.name,
      country: hub.country,
      historicHazard: hub.historic_hazard,
      url: `https://www.youtube.com/watch?v=${yt}`,
      thumbnail: `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
      youtubeId: yt,
    });
    i += 1;
  }
  return out;
})();

export function recommendVideosForArea(place, hotspots = [], limit = 8) {
  const name = String(place?.name || '').toLowerCase();
  const country = String(place?.country || place?.admin || '').toLowerCase();
  const hub = (hotspots || []).find((h) =>
    String(h.name || '').toLowerCase() === name
    || country.includes(String(h.country || '').toLowerCase())
  ) || AFRICA_HUBS.find((h) =>
    name.includes(h.name.toLowerCase())
    || country.includes(h.country.toLowerCase())
  );
  const historic = String(hub?.historic_hazard || hub?.forecast_hazard || '').toLowerCase();
  const scored = [...CLIMATE_VIDEOS].map((v) => {
    let s = 0;
    if (historic && String(v.historicHazard).toLowerCase().includes(historic.split(' ')[0])) s += 6;
    if (historic && String(v.category).toLowerCase().includes(historic.split(' ')[0])) s += 5;
    if (name && String(v.region).toLowerCase().includes(name.split(',')[0])) s += 4;
    if (country && String(v.country).toLowerCase() === country) s += 3;
    return { v, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored.filter((x) => x.s > 0).slice(0, limit).map((x) => x.v);
}
