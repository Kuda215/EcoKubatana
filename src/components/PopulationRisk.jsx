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
      <p className="page__sub">
        Population at risk joins WorldPop-style city counts with World Bank country population and hazard scores. Bigger markers mean more people on a known hazard.
        <SourceInfo sources={['worldpop', 'worldbank']} />
      </p>
      <AfricaClimateMap hotspots={hotspots} mode="historic" />
      {loading && <p>Joining population and hazard layers...</p>}
      <div className="card">
        <h3 className="card__title">Totals <SourceInfo sources={['worldbank', 'worldpop']} /></h3>
        <p>About <strong>{people.toLocaleString()}</strong> people-weighted exposure units, and about <strong>{formatMoney(money)}</strong> indicative economic loss if scored hazards hit at today's city sizes.</p>
      </div>
      <DataGrid title="Population and money-at-risk grid" filename="ecokubatana-population-risk" sources={['worldpop', 'worldbank']} rows={rows} />
    </div>
  );
}
