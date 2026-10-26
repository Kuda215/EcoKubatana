import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { riskColor } from '../lib/climateData';
import { useFeatures } from '../contexts/FeatureContext';
import { useAccess } from '../contexts/AccessContext';
import SourceInfo from './SourceInfo';

function patternFor(hazard = '') {
  const h = String(hazard).toLowerCase();
  if (h.includes('flood') || h.includes('cyclone') || h.includes('storm')) return { shape: 'square', dash: '4 3', letter: 'F' };
  if (h.includes('drought') || h.includes('heat')) return { shape: 'triangle', dash: '1 4', letter: 'D' };
  if (h.includes('fire')) return { shape: 'diamond', dash: '6 2', letter: 'R' };
  return { shape: 'circle', dash: null, letter: 'W' };
}

export default function AfricaClimateMap({ hotspots = [], events = [], mode = 'historic', onSelect, selectedId, height = 360 }) {
  const { isEnabled } = useFeatures();
  const { flags } = useAccess();
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const elRef = useRef(null);

  useEffect(() => {
    if (flags.smsOnly || !elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { zoomControl: true, attributionControl: true }).setView([2.2, 20], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 12,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [flags.smsOnly]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    hotspots.forEach((h) => {
      const score = mode === 'forecast' ? h.forecast_score : mode === 'flags' ? Math.max(h.forecast_score || 0, h.nearby_flags ? 70 : 0) : h.historic_score;
      const color = riskColor(score, mode === 'flags' ? h.flag_status : null, flags.colorBlind);
      const hazard = mode === 'forecast' ? h.forecast_hazard : h.historic_hazard;
      const pat = patternFor(hazard);
      const radius = 7 + Math.min(14, (score || 20) / 10);
      const marker = L.circleMarker([h.lat, h.lng], {
        radius,
        color,
        weight: selectedId === h.id ? 4 : flags.colorBlind ? 3 : 2,
        fillColor: color,
        fillOpacity: flags.colorBlind ? 0.35 : 0.55,
        dashArray: flags.colorBlind ? pat.dash : null,
      });
      marker.bindPopup(
        `<strong>${h.name}, ${h.country}</strong><br/>${mode}: ${hazard || h.flag_status} (${score || 0}) ${pat.letter}<br/>People: ${(h.population_est || 0).toLocaleString()}`
      );
      marker.on('click', () => onSelect?.(h));
      marker.addTo(layer);
      if (flags.colorBlind) {
        L.marker([h.lat, h.lng], {
          icon: L.divIcon({ className: 'cb-letter', html: `<span>${pat.letter}</span>`, iconSize: [16, 16] }),
        }).addTo(layer);
      }
    });

    if (mode === 'flags') {
      events.filter((e) => e.lat != null && e.lng != null).forEach((e) => {
        L.circleMarker([e.lat, e.lng], {
          radius: 5,
          color: '#111',
          fillColor: flags.colorBlind ? '#000' : '#e63946',
          fillOpacity: 0.9,
          weight: 1,
          dashArray: '2 2',
        }).bindPopup(`<strong>${e.title}</strong><br/>${e.category}<br/>${e.source}`).addTo(layer);
      });
    }
  }, [hotspots, events, mode, selectedId, onSelect, flags.colorBlind]);

  if (flags.smsOnly) {
    const rows = [...hotspots].sort((a, b) => (b.historic_score || 0) - (a.historic_score || 0)).slice(0, 12);
    return (
      <div className="sms-map-fallback">
        <p><strong>SMS-only mode.</strong> Map hidden. Highest historic scores:</p>
        <ol>
          {rows.map((h) => (
            <li key={h.id}>
              <button type="button" onClick={() => onSelect?.(h)}>{h.name}, {h.country} - {h.historic_hazard} {h.historic_score}</button>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="africa-map-shell">
      <div ref={elRef} className="africa-map-canvas" style={{ height }} />
      {isEnabled('osm_community') && (
        <p className="africa-map-note">
          OpenStreetMap basemap · markers sized by {mode} risk{flags.colorBlind ? ' · letters F flood, D drought, R fire, W watch' : ''}
          <SourceInfo sources={['osm', 'openmeteo', 'eonet', 'reliefweb']} />
        </p>
      )}
    </div>
  );
}
