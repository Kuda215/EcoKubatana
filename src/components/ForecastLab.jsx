import { useClimateData } from '../lib/climateData';
import AfricaClimateMap from './AfricaClimateMap';
import DataGrid from './DataGrid';
import SourceInfo from './SourceInfo';
import { formatMoney, estimateLosses } from '../lib/dataSources';
import { useState } from 'react';
import './PageStyles.css';

// Promise.allSettled status -> words people understand
const SOURCE_STATUS_LABEL = { fulfilled: 'Live', rejected: 'Unavailable' };

export default function ForecastLab() {
  const { hotspots, events, loading, syncedAt, sourcesStatus } = useClimateData();
  const [selected, setSelected] = useState(null);
  const rows = [...hotspots]
    .map((h) => {
      const money = h.potential_loss_usd != null ? h : { ...h, ...estimateLosses(h) };
      const days = h.forecast_days || {};
      return {
        id: h.id,
        city: h.name,
        country: h.country,
        forecast_hazard: h.forecast_hazard || '-',
        forecast_score: h.forecast_score ?? 0,
        flag: h.flag_status || '-',
        rain_7d_mm: h.metrics?.precip_7d_mm ?? '-',
        max_temp_c: h.metrics?.max_temp_c ?? '-',
        rain_chance_max: h.metrics?.rain_chance_max ?? '-',
        river_discharge: h.metrics?.river_discharge ?? '-',
        potential_loss_usd: money.potential_loss_usd,
        household_range_usd: money.household_loss_usd,
        next_days: (days.time || []).slice(0, 3).join(' | '),
      };
    })
    .sort((a, b) => b.forecast_score - a.forecast_score);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Forecast lab</h1>
          <p className="page__sub">
            The 7-day weather and river-level outlook for every hub. A planning view, not a reason to panic.
            <SourceInfo sources={['openmeteo', 'glofas', 'worldbank']} />
          </p>
        </div>
      </div>
      <AfricaClimateMap hotspots={hotspots} events={events} mode="forecast" onSelect={setSelected} selectedId={selected?.id} />
      {loading && (
        <div className="ui-state" role="status">
          <div className="ui-spinner" aria-hidden="true" />
          <p className="ui-state__text">Refreshing the live forecast…</p>
        </div>
      )}
      {syncedAt && (
        <p className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>
          Last updated: {new Date(syncedAt).toLocaleString()} · river flood model: {SOURCE_STATUS_LABEL[sourcesStatus?.flood] || sourcesStatus?.flood}
          <SourceInfo sources={['glofas']} />
        </p>
      )}
      {selected && (
        <div className="card">
          <h3 className="card__title">{selected.name} outlook <SourceInfo sources={['openmeteo', 'glofas']} /></h3>
          <p>{selected.summary}</p>
          <p><strong>Action:</strong> {selected.farmer_action}</p>
          <p><strong>Potential city loss:</strong> {formatMoney(estimateLosses(selected).potential_loss_usd)} · household planning range {formatMoney(estimateLosses(selected).household_loss_usd)}</p>
        </div>
      )}
      <DataGrid
        title="Forecast grid (all Africa hubs)"
        filename="ecokubatana-forecast"
        sources={['openmeteo', 'glofas', 'worldbank']}
        rows={rows}
      />
      <div className="card">
        <h3 className="card__title">How to read this</h3>
        <ul className="specialist-notes">
          <li>Score 0-100 blends 7-day rain, heat and GloFAS discharge vs mean.</li>
          <li>Potential loss is a planning estimate from city population x World Bank GDP/capita x hazard share. Not an insurance quote.</li>
          <li>Export Excel, then join your own crop prices or facility lists.</li>
        </ul>
      </div>
    </div>
  );
}
