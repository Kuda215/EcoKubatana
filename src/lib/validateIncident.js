import { searchPlaces, forecastFor } from './geocode';
import { scoreForecast } from './climateData';
import { AFRICA_HUBS } from './africaHubs';
import { nearestHub } from './dataSources';

const TYPE_TO_HAZARD = {
  Flood: 'Flood',
  Drought: 'Drought',
  Heatwave: 'Heat',
  'Strong Winds': 'Flood',
  Landslide: 'Flood',
  Wildfire: 'Heat',
  Pollution: 'Other',
  Cyclone: 'Flood',
  Other: 'Other',
};

export async function recommendIncidentInArea({ type, location, lat, lng }) {
  let placeLat = lat;
  let placeLng = lng;
  let placeName = location || 'this area';

  if (placeLat == null || placeLng == null) {
    const hits = await searchPlaces(location, 1);
    if (hits[0]) {
      placeLat = hits[0].lat;
      placeLng = hits[0].lng;
      placeName = hits[0].name;
    }
  }

  if (placeLat == null || placeLng == null) {
    return {
      success: true,
      data: {
        likely: false,
        score: 0,
        reason: 'Could not place this report on the map. Ask for a clearer town or ward.',
        liveHazard: 'Unknown',
        historicHazard: 'Unknown',
        placeName,
      },
    };
  }

  const hub = nearestHub(AFRICA_HUBS, placeLat, placeLng);
  let liveHazard = 'Stable';
  let liveScore = 0;
  let metrics = {};
  try {
    const { wx } = await forecastFor(placeLat, placeLng);
    const scored = scoreForecast(wx?.daily || {});
    liveHazard = scored.forecast_hazard || 'Stable';
    liveScore = scored.forecast_score || 0;
    metrics = scored.metrics || {};
  } catch {
    liveHazard = hub?.historic_hazard || 'Unknown';
  }

  const wanted = TYPE_TO_HAZARD[type] || 'Other';
  const historic = hub?.historic_hazard || 'Unknown';
  const liveMatch = wanted !== 'Other' && (
    liveHazard === wanted
    || (wanted === 'Flood' && /flood|cyclone|coastal/i.test(String(historic)))
    || (wanted === 'Heat' && /heat|drought/i.test(String(historic)))
    || (wanted === 'Drought' && /drought|heat/i.test(String(historic)))
  );
  const historicMatch = wanted !== 'Other' && String(historic).toLowerCase().includes(wanted.toLowerCase().replace('heat', 'drought'));
  const droughtHist = /drought/i.test(String(historic)) && wanted === 'Drought';
  const floodHist = /flood|cyclone/i.test(String(historic)) && (wanted === 'Flood');
  const heatHist = /heat/i.test(String(historic)) && wanted === 'Heat';
  const likely = liveMatch || droughtHist || floodHist || heatHist || historicMatch;
  const score = Math.min(100, (liveMatch ? 55 : 0) + (droughtHist || floodHist || heatHist ? 30 : 0) + Math.round(liveScore * 0.2));

  let reason;
  if (likely) {
    reason = `Live Open-Meteo around ${placeName} leans ${liveHazard} this week (score ${liveScore}). Historic hub ${hub?.name || 'nearby'} is ${historic}. This ${type} report is consistent with the area.`;
  } else {
    reason = `Live forecast around ${placeName} is ${liveHazard}, historic pattern is ${historic}. A ${type} report is not a strong match - check the photo and local reports before publishing.`;
  }

  return {
    success: true,
    data: {
      likely,
      score,
      reason,
      liveHazard,
      liveScore,
      historicHazard: historic,
      hubName: hub?.name,
      placeName,
      lat: placeLat,
      lng: placeLng,
      metrics,
    },
  };
}
