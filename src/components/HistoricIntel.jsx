import { useClimateData } from '../lib/climateData';
import AfricaClimateMap from './AfricaClimateMap';
import DataGrid from './DataGrid';
import SourceInfo from './SourceInfo';
import { estimateLosses, formatMoney } from '../lib/dataSources';
import './PageStyles.css';

export default function HistoricIntel() {
  const { hotspots, events, loading } = useClimateData();
  const hubRows = [...hotspots]
    .map((h) => ({
      id: h.id,
      city: h.name,
      country: h.country,
      historic_hazard: h.historic_hazard,
      historic_score: h.historic_score,
      rain_90d_mm: h.metrics?.rain_90d_mm ?? '-',
      peak_archive_temp_c: h.metrics?.hist_max_temp_c ?? '-',
      nearby_live_flags: h.nearby_flags ?? 0,
      indicative_loss_usd: estimateLosses(h).potential_loss_usd,
    }))
    .sort((a, b) => b.historic_score - a.historic_score);

  const eventRows = events.map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    source: e.source,
    country: e.country || 'Africa',
    date: e.event_date || 'ongoing',
    lat: e.lat ?? '',
    lng: e.lng ?? '',
  }));

  const totalMemory = hubRows.reduce((a, r) => a + (r.indicative_loss_usd || 0), 0);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Past disasters</h1>
          <p className="page__sub">
            What has happened before: recent disaster reports plus landmark events such as Cyclone Idai, Cape Town&apos;s Day Zero, the Horn of Africa drought and the Sahel.
            <SourceInfo sources={['reliefweb', 'emdat', 'openmeteo']} />
          </p>
        </div>
      </div>
      <AfricaClimateMap hotspots={hotspots} events={events} mode="historic" />
      {loading && (
        <div className="ui-state" role="status">
          <div className="ui-spinner" aria-hidden="true" />
          <p className="ui-state__text">Loading past disasters…</p>
        </div>
      )}
      <div className="card">
        <h3 className="card__title">If past disasters happened again <SourceInfo sources={['worldbank', 'emdat']} /></h3>
        <p>If similar events repeated at today's city sizes, indicative loss across hubs is about <strong>{formatMoney(totalMemory)}</strong>.</p>
      </div>
      <DataGrid title="Historic hub grid" filename="ecokubatana-historic-hubs" sources={['emdat', 'openmeteo', 'worldbank']} rows={hubRows} />
      <DataGrid title="ReliefWeb / EONET event table" filename="ecokubatana-historic-events" sources={['reliefweb', 'eonet']} rows={eventRows} />
    </div>
  );
}
