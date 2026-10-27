import L from 'leaflet';

/** OpenStreetMap only - free community tiles, no API key, not Carto. */
export const MAP_TILES = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
};

export function addBasemap(map) {
  return L.tileLayer(MAP_TILES.url, {
    maxZoom: MAP_TILES.maxZoom,
    attribution: MAP_TILES.attribution,
    crossOrigin: true,
  }).addTo(map);
}
