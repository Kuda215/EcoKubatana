import { downloadExcelCsv } from '../lib/dataSources';
import SourceInfo from './SourceInfo';

export default function DataGrid({ title, rows = [], sources = [], filename = 'ecokubatana-export' }) {
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  return (
    <div className="card data-grid-card">
      <div className="card__header" style={{ alignItems: 'center' }}>
        <h3 className="card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {title}
          {sources.length > 0 && <SourceInfo sources={sources} />}
        </h3>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => downloadExcelCsv(filename, rows)}
          disabled={!rows.length}
          aria-label={`Download Excel sheet for ${title}`}
        >
          📗 Excel
        </button>
      </div>
      <div className="data-grid-wrap" tabIndex={0} aria-label={title}>
        <table className="data-grid">
          <thead>
            <tr>
              {headers.map((h) => <th key={h}>{h.replace(/_/g, ' ')}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={headers.length || 1}>No rows yet.</td></tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.id || row.name || i}>
                {headers.map((h) => <td key={h}>{row[h] == null ? '-' : String(row[h])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
