import { useState } from 'react';
import { LIVELIHOODS, DEFAULT_PRIORITIES, EMERGENCY_PRIORITIES } from '../lib/africaHubs';

const KNOWN = LIVELIHOODS.filter((l) => l.value !== 'other');

export function isKnownLivelihood(value) {
  return KNOWN.some((l) => l.value === value);
}

export default function LivelihoodPicker({ value, onChange, onSuggestPriorities }) {
  const known = isKnownLivelihood(value);
  const [otherOn, setOtherOn] = useState(Boolean(value) && !known);

  const pick = (item) => {
    setOtherOn(false);
    onChange(item.value);
    if (onSuggestPriorities) {
      const keys = DEFAULT_PRIORITIES[item.value] || [];
      onSuggestPriorities(keys.map((k) => EMERGENCY_PRIORITIES.find((p) => p.value === k)?.label || k));
    }
  };

  return (
    <div className="livelihood-picker">
      <ul className="livelihood-list">
        {KNOWN.map((item) => (
          <li key={item.value}>
            <button
              type="button"
              className={`livelihood-item ${!otherOn && value === item.value ? 'livelihood-item--on' : ''}`}
              onClick={() => pick(item)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={`livelihood-item ${otherOn ? 'livelihood-item--on' : ''}`}
            onClick={() => {
              setOtherOn(true);
              if (known) onChange('');
            }}
          >
            <span aria-hidden="true">✏️</span>
            <span>Other: type what you do</span>
          </button>
        </li>
      </ul>
      {otherOn && (
        <input
          className="form-input"
          autoFocus
          placeholder="e.g. fisher, motorbike taxi, midwife, carpenter"
          value={known ? '' : (value || '')}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Describe what you do"
        />
      )}
    </div>
  );
}
