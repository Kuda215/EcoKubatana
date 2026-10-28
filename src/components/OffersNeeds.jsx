import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aidAPI } from '../lib/api';
import './PageStyles.css';

const AID_CATEGORIES = ['Shelter', 'Water', 'Food', 'Transport', 'Medical', 'Check on someone', 'Other'];
const aidIcon = {
  Shelter: '🏠', Water: '💧', Food: '🍲', Transport: '🚚',
  Medical: '🩺', 'Check on someone': '👵', Other: '🤝',
};
const KIND_LABEL = { offer: 'Offering help', need: 'Needs help' };

function timeAgo(dateString) {
  if (!dateString) return 'Just now';
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// "Mbare, Harare" -> "mbare"; used to match posts in the same area
function areaKey(location) {
  return String(location || '').split(',')[0].trim().toLowerCase();
}

export default function OffersNeeds({ showToast }) {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formKind, setFormKind] = useState(null); // 'offer' | 'need' | null
  const [form, setForm] = useState({ category: 'Shelter', details: '', location: '', contact: '' });
  const [submitting, setSubmitting] = useState(false);
  const [kindFilter, setKindFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showSorted, setShowSorted] = useState(false);
  const [nearMe, setNearMe] = useState(false);

  const load = async () => {
    setLoading(true);
    const result = await aidAPI.list();
    if (result.success) {
      setItems(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openForm = (kind) => {
    setFormKind(kind);
    setForm({ category: 'Shelter', details: '', location: user?.location || '', contact: user?.phone || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.details.trim() || !form.location.trim()) return;
    setSubmitting(true);
    const result = await aidAPI.create({
      kind: formKind,
      category: form.category,
      details: form.details.trim(),
      location: form.location.trim(),
      contact: form.contact.trim(),
      authorName: user?.name,
    });
    setSubmitting(false);
    if (!result.success) {
      showToast(result.error || 'Could not post. Try again.', 'error');
      return;
    }
    setItems(prev => [result.data, ...prev]);
    setFormKind(null);
    showToast(formKind === 'offer' ? 'Thank you! Your offer is live 🙌' : 'Your request is live. Neighbours can see it now.');
  };

  const handleSorted = async (id) => {
    const result = await aidAPI.markSorted(id);
    if (!result.success) {
      showToast(result.error || 'Could not update', 'error');
      return;
    }
    setItems(prev => prev.map(i => (i.id === id ? result.data : i)));
    showToast('Marked as sorted ✓');
  };

  const open = items.filter(i => i.status === 'open');
  const openNeeds = open.filter(i => i.kind === 'need').length;
  const openOffers = open.filter(i => i.kind === 'offer').length;
  const sortedCount = items.filter(i => i.status === 'sorted').length;

  // Open posts of the opposite kind in the same category, e.g. shelter offers for a shelter need
  const matchesFor = (item) => open.filter(o => o.kind !== item.kind && o.category === item.category && o.id !== item.id);

  const myArea = areaKey(user?.location);
  const visible = items.filter(i =>
    (showSorted ? i.status === 'sorted' : i.status === 'open')
    && (kindFilter === 'all' || i.kind === kindFilter)
    && (categoryFilter === 'All' || i.category === categoryFilter)
    && (!nearMe || !myArea || areaKey(i.location) === myArea)
  );

  const showMatches = (item) => {
    setShowSorted(false);
    setKindFilter(item.kind === 'need' ? 'offer' : 'need');
    setCategoryFilter(item.category);
  };

  const clearFilters = () => {
    setKindFilter('all');
    setCategoryFilter('All');
    setNearMe(false);
  };

  return (
    <div className="aid">
      <div className="card aid-intro">
        <div>
          <h2 className="aid-intro__title">Offers &amp; needs</h2>
          <p className="aid-intro__sub">
            Neighbours helping neighbours. Offer what you have, ask for what you need, and mark it sorted once it&apos;s handled.
          </p>
        </div>
        <div className="aid-intro__actions">
          <button type="button" className="aid-big-btn aid-big-btn--offer" onClick={() => openForm('offer')}>
            🙋 I can help
          </button>
          <button type="button" className="aid-big-btn aid-big-btn--need" onClick={() => openForm('need')}>
            🆘 I need help
          </button>
        </div>
        <div className="aid-stats">
          <div><strong>{openNeeds}</strong><span>open needs</span></div>
          <div><strong>{openOffers}</strong><span>open offers</span></div>
          <div><strong>{sortedCount}</strong><span>sorted</span></div>
        </div>
      </div>

      {formKind && (
        <form className={`card aid-form aid-form--${formKind}`} onSubmit={handleSubmit}>
          <h3 className="card__title">{formKind === 'offer' ? '🙋 What can you offer?' : '🆘 What do you need?'}</h3>
          <div className="aid-form__cats">
            {AID_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`chip ${form.category === cat ? 'chip--on' : ''}`}
                onClick={() => setForm({ ...form, category: cat })}
              >{aidIcon[cat]} {cat}</button>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="aid-details">Details *</label>
            <textarea
              id="aid-details"
              className="form-textarea"
              rows="3"
              placeholder={formKind === 'offer'
                ? 'e.g. I have space for 2 families at my house tonight'
                : 'e.g. We need blankets for 3 children'}
              value={form.details}
              onChange={e => setForm({ ...form, details: e.target.value })}
            />
          </div>
          <div className="aid-form__row">
            <div className="form-group">
              <label className="form-label" htmlFor="aid-location">Where *</label>
              <input id="aid-location" className="form-input" placeholder="e.g. Ngangu, Chimanimani"
                value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="aid-contact">Phone (optional)</label>
              <input id="aid-contact" className="form-input" inputMode="tel" placeholder="Shown to signed-in members"
                value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
            </div>
          </div>
          <div className="aid-form__actions">
            <button type="button" className="btn btn--secondary" onClick={() => setFormKind(null)}>Cancel</button>
            <button type="submit" className="btn btn--primary"
              disabled={submitting || !form.details.trim() || !form.location.trim()}>
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      )}

      <div className="aid-filters">
        <div className="filter-tabs">
          {[['all', 'All'], ['need', '🆘 Needs'], ['offer', '🙋 Offers']].map(([value, label]) => (
            <button key={value} type="button"
              className={`filter-tab ${kindFilter === value ? 'filter-tab--active' : ''}`}
              onClick={() => setKindFilter(value)}
            >{label}</button>
          ))}
        </div>
        <select className="form-input aid-filters__select" value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)} aria-label="Filter by category">
          <option value="All">All categories</option>
          {AID_CATEGORIES.map(cat => <option key={cat} value={cat}>{aidIcon[cat]} {cat}</option>)}
        </select>
        <label className="aid-filters__toggle">
          <input type="checkbox" checked={nearMe} onChange={e => setNearMe(e.target.checked)} disabled={!myArea} />
          Near me{myArea ? ` (${user.location.split(',')[0]})` : ''}
        </label>
        <label className="aid-filters__toggle">
          <input type="checkbox" checked={showSorted} onChange={e => setShowSorted(e.target.checked)} />
          Show sorted
        </label>
      </div>

      {loading && (
        <div className="ui-state" role="status">
          <div className="ui-spinner" aria-hidden="true" />
          <p className="ui-state__text">Loading offers and needs…</p>
        </div>
      )}
      {!loading && error && (
        <div className="ui-state ui-state--boxed ui-state--error" role="alert">
          <div className="ui-state__icon" aria-hidden="true">⚠️</div>
          <h3 className="ui-state__title">We couldn't load offers and needs</h3>
          <p className="ui-state__text">Check your connection and try again.</p>
          <button className="btn btn--secondary" onClick={load}>Try again</button>
        </div>
      )}
      {!loading && !error && visible.length === 0 && (
        <div className="ui-state ui-state--boxed">
          <div className="ui-state__icon" aria-hidden="true">🌱</div>
          <h3 className="ui-state__title">{showSorted ? 'Nothing sorted yet' : 'Nothing here yet'}</h3>
          <p className="ui-state__text">
            {showSorted ? 'Posts marked as sorted will show here.' : 'Be the first to offer help or ask for it.'}
          </p>
          {(kindFilter !== 'all' || categoryFilter !== 'All' || nearMe) && (
            <button className="btn btn--secondary" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      )}

      <div className="aid-list">
        {!loading && !error && visible.map(item => {
          const matches = item.status === 'open' ? matchesFor(item) : [];
          const canSort = item.status === 'open' && (item.author_id === user?.id || isAdmin);
          return (
            <div key={item.id} className={`cb-post-card aid-card aid-card--${item.kind} ${item.status === 'sorted' ? 'aid-card--sorted' : ''}`}>
              <div className="aid-card__top">
                <span className={`aid-kind aid-kind--${item.kind}`}>{KIND_LABEL[item.kind]}</span>
                <span className="aid-card__cat">{aidIcon[item.category]} {item.category}</span>
                {item.status === 'sorted' && <span className="aid-kind aid-kind--sorted">✓ Sorted</span>}
              </div>
              <p className="cb-post-content">{item.details}</p>
              <div className="cb-post-location">
                👤 {item.author_name} · 📍 {item.location} · 🕐 {timeAgo(item.created_at)}
              </div>
              <div className="cb-post-actions">
                {item.contact && item.status === 'open' && item.author_id !== user?.id && (
                  <a className="cb-action-btn" href={`tel:${item.contact.replace(/[^\d+]/g, '')}`}>
                    📞 Call {item.author_name.split(' ')[0]}
                  </a>
                )}
                {matches.length > 0 && (
                  <button type="button" className="cb-action-btn aid-match-btn" onClick={() => showMatches(item)}>
                    🔗 {matches.length} matching {item.kind === 'need' ? (matches.length === 1 ? 'offer' : 'offers') : (matches.length === 1 ? 'need' : 'needs')}
                  </button>
                )}
                {canSort && (
                  <button type="button" className="cb-action-btn" onClick={() => handleSorted(item.id)}>
                    ✓ Mark sorted
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
