import { AFRICA_HUBS } from './africaHubs';

/** One row per real YouTube id. Do not cycle the same clip under new titles. */
const RAW = [
  { yt: 'eMOviCHkqh8', title: 'All this area used to be green: Zimbabwe climate frontline', author: 'The Climate Frontline', duration: '8:42', posted: '2 years ago', category: 'Drought', region: 'Chimanimani', country: 'Zimbabwe', historicHazard: 'Drought' },
  { yt: 'mHH4nWGoxdA', title: 'Emergency drought resilience in Buhera and Makoni', author: 'Practical Action', duration: '6:15', posted: '3 years ago', category: 'Drought', region: 'Buhera', country: 'Zimbabwe', historicHazard: 'Drought' },
  { yt: 't_GjiwGw9kA', title: 'Cyclone Idai: roads destroyed in Zimbabwe', author: 'MSF', duration: '4:08', posted: '5 years ago', category: 'Cyclone', region: 'Chimanimani', country: 'Zimbabwe', historicHazard: 'Cyclone' },
  { yt: 'cISoqgq-BG4', title: 'Building climate resilience in Zimbabwe', author: 'UNDP Zimbabwe', duration: '5:21', posted: '1 year ago', category: 'Community', region: 'Harare', country: 'Zimbabwe', historicHazard: 'Drought' },
  { yt: 'gglCXUzODyk', title: 'Early Warnings for All: Zimbabwe climate action', author: 'WMO', duration: '3:47', posted: '11 months ago', category: 'Early warning', region: 'Harare', country: 'Zimbabwe', historicHazard: 'Flood' },
  { yt: '0zuRMxaCrvQ', title: "Nowhere to Run: Nigeria's climate and environment crisis", author: 'Yar\'Adua Foundation', duration: '45:40', posted: '9 years ago', category: 'Drought', region: 'Katsina', country: 'Nigeria', historicHazard: 'Drought' },
  { yt: 'fHqRnz2TIzs', title: "Nowhere to Run: Kenya's climate refugees", author: 'Yar\'Adua Foundation', duration: '28:00', posted: '8 years ago', category: 'Drought', region: 'Turkana', country: 'Kenya', historicHazard: 'Drought' },
  { yt: 'nse--YU_nfs', title: "Restoring balance after Malawi's Cyclone Freddy", author: 'UNEP', duration: '3:20', posted: '3 years ago', category: 'Cyclone', region: 'Blantyre', country: 'Malawi', historicHazard: 'Cyclone' },
  { yt: 'PDl0VQcY_ig', title: 'Anticipatory action helping families through drought in Somalia', author: 'FAO', duration: '3:12', posted: '3 years ago', category: 'Early warning', region: 'Beletweyne', country: 'Somalia', historicHazard: 'Drought' },
  { yt: '1_rT_Q4kalw', title: 'The fight against drought in southern Ethiopia', author: 'FAO', duration: '4:40', posted: '3 years ago', category: 'Drought', region: 'Borana', country: 'Ethiopia', historicHazard: 'Drought' },
  { yt: 'IRrX7uzqJ80', title: 'Washed away: the Lagos erosion crisis', author: 'Independent documentary', duration: '22:00', posted: '4 years ago', category: 'Flood', region: 'Lagos', country: 'Nigeria', historicHazard: 'Flood' },
  { yt: 'fggSOq6_f1M', title: 'Heavy rain in Lagos and climate change in Africa', author: 'News report', duration: '5:10', posted: '2 years ago', category: 'Flood', region: 'Lagos', country: 'Nigeria', historicHazard: 'Flood' },
  { yt: 'G_6dw1GmMOA', title: 'KwaZulu-Natal floods: hundreds dead after extreme rain', author: 'News report', duration: '3:05', posted: '4 years ago', category: 'Flood', region: 'Durban', country: 'South Africa', historicHazard: 'Flood' },
  { yt: 'd0KDAdlb_yA', title: 'Cape Town, facing Day Zero', author: 'SLICE Earth', duration: '51:23', posted: '3 years ago', category: 'Drought', region: 'Cape Town', country: 'South Africa', historicHazard: 'Drought' },
  { yt: '4xls7K_xFBQ', title: 'Why is Africa building a Great Green Wall?', author: 'BBC News', duration: '4:30', posted: '5 years ago', category: 'Community', region: 'Dakar', country: 'Senegal', historicHazard: 'Drought' },
  { yt: 'v4LrY9GNlEQ', title: 'Adaptation Fund climate innovation in Africa (UNEP, UNDP)', author: 'UNDP', duration: '12:00', posted: '5 years ago', category: 'Community', region: 'Nairobi', country: 'Kenya', historicHazard: 'Flood' },
];

export const CLIMATE_VIDEOS = RAW.map((v, i) => ({
  id: `cv-${v.yt}`,
  title: v.title,
  author: v.author,
  duration: v.duration,
  posted: v.posted,
  category: v.category,
  region: v.region,
  country: v.country,
  historicHazard: v.historicHazard,
  url: `https://www.youtube.com/watch?v=${v.yt}`,
  thumbnail: `https://img.youtube.com/vi/${v.yt}/hqdefault.jpg`,
  youtubeId: v.yt,
  order: i,
}));

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
  const word = historic.split(' ')[0];
  const scored = [...CLIMATE_VIDEOS].map((v) => {
    let s = 0;
    if (word && String(v.historicHazard).toLowerCase().includes(word)) s += 6;
    if (word && String(v.category).toLowerCase().includes(word)) s += 5;
    if (name && String(v.region).toLowerCase().includes(name.split(',')[0])) s += 8;
    if (country && String(v.country).toLowerCase() === country) s += 4;
    return { v, s };
  });
  scored.sort((a, b) => b.s - a.s || a.v.order - b.v.order);
  const picked = scored.filter((x) => x.s > 0).map((x) => x.v);
  const unique = [];
  const seen = new Set();
  for (const v of picked) {
    if (seen.has(v.youtubeId)) continue;
    seen.add(v.youtubeId);
    unique.push(v);
    if (unique.length >= limit) break;
  }
  if (unique.length < limit) {
    for (const v of CLIMATE_VIDEOS) {
      if (seen.has(v.youtubeId)) continue;
      seen.add(v.youtubeId);
      unique.push(v);
      if (unique.length >= limit) break;
    }
  }
  return unique;
}
