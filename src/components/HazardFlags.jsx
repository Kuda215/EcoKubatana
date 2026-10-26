import { useClimateData, riskColor } from '../lib/climateData';
import AfricaClimateMap from './AfricaClimateMap';
import DataGrid from './DataGrid';
import SourceInfo from './SourceInfo';
import { estimateLosses, formatMoney } from '../lib/dataSources';
import './PageStyles.css';

export default function HazardFlags() {
  const { hotspots, events, loading } = useClimateData();
  const flagged = hotspots.filter((h) => h.flag_status === 'alert' || h.flag_status === 'emergency');
  const eonet = events.filter((e) => String(e.source).includes('EONET'));
  const rows = [...hotspots]
    .map((h) => ({
      id: h.id,
      city: h.name,
      country: h.country,
      flag: h.flag_status,
      forecast_hazard: h.forecast_hazard || '-',
      forecast_score: h.forecast_score ?? 0,
      nearby_events: h.nearby_flags ?? 0,
      rain_7d_mm: h.metrics?.precip_7d_mm ?? '-',
      river_discharge: h.metrics?.river_discharge ?? '-',
      money_at_risk_usd: estimateLosses(h).potential_loss_usd,
    }))
    .sort((a, b) => b.forecast_score - a.forecast_score);

  return (
    <div className="page">
      <p className="page__sub">
        Flags combine NASA EONET events with GloFAS river discharge and 7-day rain/heat. Red = act now. Amber = prepare. Green = keep watching.
        <SourceInfo sources={['eonet', 'glofas', 'openmeteo']} />
      </p>
      <AfricaClimateMap hotspots={hotspots} events={events} mode="flags" />
      {loading && <p>Checking live flags...</p>}
      <div className="card">
        <h3 className="card__title">Places currently flagged</h3>
        {flagged.length === 0 && <p>No emergency flags on the latest model run. Stay subscribed to alerts.</p>}
        {flagged.map((h) => (
          <div key={h.id} className="alert-item" style={{ borderLeft: `4px solid ${riskColor(h.forecast_score, h.flag_status)}` }}>
            <div className="alert-item__body">
              <h3 className="alert-item__title">{h.name} · {h.flag_status} · {formatMoney(estimateLosses(h).potential_loss_usd)} at risk</h3>
              <p className="alert-item__msg">{h.summary}</p>
            </div>
          </div>
        ))}
      </div>
      <DataGrid title="Flag status grid" filename="ecokubatana-hazard-flags" sources={['eonet', 'glofas', 'openmeteo', 'worldbank']} rows={rows} />
      <DataGrid
        title="NASA EONET events over Africa"
        filename="ecokubatana-eonet"
        sources={['eonet']}
        rows={eonet.map((e) => ({ id: e.id, title: e.title, category: e.category, date: e.event_date, lat: e.lat, lng: e.lng }))}
      />
    </div>
  );
}
