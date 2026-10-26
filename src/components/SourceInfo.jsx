import { useState } from 'react';
import { DATA_SOURCES } from '../lib/dataSources';

export default function SourceInfo({ sources = [], label = 'Where this data comes from' }) {
  const [open, setOpen] = useState(false);
  const items = sources.map((s) => (typeof s === 'string' ? DATA_SOURCES[s] : s)).filter(Boolean);

  return (
    <span className="source-info">
      <button
        type="button"
        className="source-info__btn"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
      >
        i
      </button>
      {open && (
        <div className="source-info__pop" role="tooltip">
          <strong>{label}</strong>
          <ul>
            {items.map((s) => (
              <li key={s.id || s.label}>
                <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
                {s.detail ? ` - ${s.detail}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
}
