import { useMemo, useState } from 'react';

export default function TagInput({
  values = [],
  onChange,
  suggestions = [],
  placeholder = 'Type, then ; or Enter',
  label,
}) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);

  const commit = (raw) => {
    const parts = String(raw)
      .split(/[;]+/)
      .map((p) => p.replace(/,$/, '').trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...values];
    parts.forEach((p) => {
      const exists = next.some((v) => v.toLowerCase() === p.toLowerCase());
      if (!exists) next.push(p);
    });
    onChange(next);
    setDraft('');
    setOpen(false);
  };

  const matches = useMemo(() => {
    const q = draft.trim().toLowerCase();
    return suggestions
      .filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()))
      .filter((s) => !q || s.toLowerCase().includes(q))
      .slice(0, 8);
  }, [draft, suggestions, values]);

  return (
    <div className="tag-input">
      {label && <label className="form-label">{label}</label>}
      <div className="tag-input__box" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
        {values.map((tag) => (
          <span key={tag} className="tag-bubble">
            {tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(values.filter((v) => v !== tag))}>×</button>
          </span>
        ))}
        <input
          className="tag-input__field"
          value={draft}
          placeholder={values.length ? '' : placeholder}
          aria-autocomplete="list"
          aria-expanded={open && matches.length > 0}
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(';')) {
              commit(v);
              return;
            }
            setDraft(v);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commit(draft);
            } else if (e.key === 'Backspace' && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => {
            if (draft.trim()) commit(draft);
            setOpen(false);
          }, 120)}
        />
      </div>
      {open && matches.length > 0 && (
        <ul className="tag-input__suggest" role="listbox">
          {matches.map((s) => (
            <li key={s}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); commit(s); }}>{s}</button>
            </li>
          ))}
        </ul>
      )}
      <p className="tag-input__hint">Type freely. Press ; or Enter to lock a bubble. Suggestions appear as you type. Add as many as you need.</p>
    </div>
  );
}
