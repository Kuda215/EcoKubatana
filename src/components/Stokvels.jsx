import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { stokvelAPI } from '../lib/api';
import { useClimateData } from '../lib/climateData';
import { estimateLosses, formatMoney, hubForUser, downloadExcelCsv } from '../lib/dataSources';
import DataGrid from './DataGrid';
import SourceInfo from './SourceInfo';
import './PageStyles.css';

export default function Stokvels() {
  const { user } = useAuth();
  const { hotspots } = useClimateData();
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', location: user?.location || '', notes: '' });
  const [asset, setAsset] = useState({ label: '', category: 'livestock', value_usd: '' });
  const [memberName, setMemberName] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [err, setErr] = useState('');

  const load = () => stokvelAPI.list().then((r) => { if (r.success) setGroups(r.data || []); else setErr(r.error || ''); });
  useEffect(() => { load(); }, []);

  const active = groups.find((g) => g.id === activeId) || groups[0];
  const hub = hubForUser(hotspots, active?.location || user?.location);
  const hazardShare = hub ? (Math.max(hub.historic_score || 0, hub.forecast_score || 0) / 100) : 0.4;
  const pool = (active?.stokvel_assets || []).reduce((a, x) => a + Number(x.value_usd || 0), 0);
  const atRisk = Math.round(pool * Math.max(0.08, hazardShare));

  const create = async (e) => {
    e.preventDefault();
    const r = await stokvelAPI.create(form);
    if (r.success) { setForm({ name: '', location: user?.location || '', notes: '' }); load(); setActiveId(r.data.id); }
    else setErr(r.error);
  };

  return (
    <div className="page">
      <p className="page__sub">
        Village savings / stokvel: shared grain, goats, and cash at risk if the nearest hazard hits. Not household-only.
        <SourceInfo sources={['worldbank']} />
      </p>
      <div className="card">
        <h3 className="card__title">Start a group</h3>
        <form className="report-form" onSubmit={create}>
          <input className="form-input" placeholder="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="form-input" placeholder="Village / town" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <button className="btn btn--primary" type="submit">Create stokvel</button>
        </form>
        {err && <p style={{ color: '#b91c1c' }}>{err}</p>}
      </div>

      <div className="stokvel-switch">
        {groups.map((g) => (
          <button key={g.id} type="button" className={`chip ${active?.id === g.id ? 'chip--on' : ''}`} onClick={() => setActiveId(g.id)}>{g.name}</button>
        ))}
      </div>

      {active && (
        <>
          <div className="card">
            <h3 className="card__title">{active.name} · {active.location || 'no place set'}</h3>
            <p>Members: {(active.stokvel_members || []).length} · Pool {formatMoney(pool)} · At risk near {hub?.name || 'your hub'}: <strong>{formatMoney(atRisk)}</strong> ({Math.round(hazardShare * 100)}% hazard score).</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await stokvelAPI.addMember(active.id, memberName);
              setMemberName('');
              load();
            }} className="stokvel-inline">
              <input className="form-input" placeholder="Add member name" value={memberName} onChange={(e) => setMemberName(e.target.value)} required />
              <button className="btn btn--ghost" type="submit">Add member</button>
            </form>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await stokvelAPI.addAsset(active.id, { ...asset, value_usd: Number(asset.value_usd) || 0 });
              setAsset({ label: '', category: 'livestock', value_usd: '' });
              load();
            }} className="stokvel-inline">
              <input className="form-input" placeholder="Asset e.g. 4 goats" value={asset.label} onChange={(e) => setAsset({ ...asset, label: e.target.value })} required />
              <input className="form-input" placeholder="USD value" inputMode="decimal" value={asset.value_usd} onChange={(e) => setAsset({ ...asset, value_usd: e.target.value })} required />
              <button className="btn btn--primary" type="submit">Add asset</button>
            </form>
          </div>
          <DataGrid
            title="Group assets"
            filename={`stokvel-${active.name}`}
            sources={['worldbank']}
            rows={(active.stokvel_assets || []).map((a) => ({ item: a.label, category: a.category, value_usd: a.value_usd }))}
          />
          <button className="btn btn--ghost" type="button" onClick={() => downloadExcelCsv(`stokvel-risk-${active.name}`, [{
            group: active.name,
            location: active.location,
            pool_usd: pool,
            hazard_hub: hub?.name,
            hazard_score: Math.round(hazardShare * 100),
            at_risk_usd: atRisk,
            city_loss_usd: hub ? estimateLosses(hub).potential_loss_usd : '',
          }])}>📗 Excel risk sheet</button>
        </>
      )}
    </div>
  );
}
