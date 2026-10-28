import { useClimateData } from '../lib/climateData';
import AfricaClimateMap from './AfricaClimateMap';
import DataGrid from './DataGrid';
import SourceInfo from './SourceInfo';
import { estimateLosses, formatMoney } from '../lib/dataSources';
import './PageStyles.css';

export default function PopulationRisk() {
  const { hotspots, loading } = useClimateData();
  const rows = [...hotspots]
    .map((h) => {
      const money = estimateLosses(h);
      const exposure = Math.round(((h.population_est || 0) * (Math.max(h.historic_score, h.forecast_score) || 1)) / 100);
      return {
        id: h.id,
        city: h.name,
        country: h.country,
        city_population: h.population_est,
        country_population: h.metrics?.country_population || h.country_population || '-',
        historic_score: h.historic_score,
        forecast_score: h.forecast_score ?? 0,
        people_x_hazard: exposure,
        gdp_per_capita_usd: money.gdp_per_capita_usd,
        potential_loss_usd: money.potential_loss_usd,
        household_range_usd: money.household_loss_usd,
      };
    })
    .sort((a, b) => b.people_x_hazard - a.people_x_hazard);

  const people = rows.reduce((a, r) => a + (Number(r.people_x_hazard) || 0), 0);
  const money = rows.reduce((a, r) => a + (Number(r.potential_loss_usd) || 0), 0);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Population at risk</h1>
          <p className="page__sub">
            How many people live where floods, droughts or heat are likely. Bigger markers mean more people facing a known hazard.
            <SourceInfo sources={['worldpop', 'worldbank']} />
          </p>
        </div>
      </div>
      <AfricaClimateMap hotspots={hotspots} mode="historic" />
      {loading && (
        <div className="ui-state" role="status">
          <div className="ui-spinner" aria-hidden="true" />
          <p className="ui-state__text">Loading population and hazard data…</p>
        </div>
      )}
      <div className="card">
        <h3 className="card__title">Totals <SourceInfo sources={['worldbank', 'worldpop']} /></h3>
        <p>Roughly <strong>{people.toLocaleString()}</strong> people are exposed, counting each city&apos;s population by how high its hazard score is. If those hazards struck at today&apos;s city sizes, the possible economic loss is about <strong>{formatMoney(money)}</strong>.</p>
      </div>
      <DataGrid title="Population and money-at-risk grid" filename="ecokubatana-population-risk" sources={['worldpop', 'worldbank']} rows={rows} />
    </div>
  );
}
