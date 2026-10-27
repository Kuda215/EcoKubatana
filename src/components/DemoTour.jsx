import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { downloadExcelCsv } from '../lib/dataSources';
import { AFRICA_HUBS } from '../lib/africaHubs';

const STEPS = [
  { id: 'farmer', title: 'You are a farmer in Chimanimani', body: 'Livelihood Farmer. Location Chimanimani, Zimbabwe. Priorities: family, livestock, seed, water. Idai memory, drought this season.', path: '/' },
  { id: 'home', title: 'Home: map + safety spots', body: 'Harare hub, police 995, hospitals on the right. Do not play a video. Point at the map and the nearest clinic.', path: '/' },
  { id: 'report', title: 'Someone on the street reports', body: 'Incident reporting is how a ward tells the rest of EcoKubatana. One photo, one place.', path: '/report' },
  { id: 'community', title: 'Community collaborates', body: 'Board plus support and wellbeing. Ubuntu: the street answers the street.', path: '/community' },
  { id: 'knowledge', title: 'Knowledge Hub (do not press play)', body: 'Zimbabwe drought, Idai and pfumvudza videos live here for after the pitch. Judges who want a clip can open one later.', path: '/knowledge' },
  { id: 'where', title: 'Where to now?', body: 'Spoken steps, then 1 = safe / 2 = help. No stage video.', path: '/' },
];

export default function DemoTour({ open, onClose }) {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const step = STEPS[i];

  useEffect(() => {
    if (!open) return;
    setI(0);
    updateUser({
      livelihood: 'farmer',
      location: 'Chimanimani, Zimbabwe',
      emergency_priorities: ['Food crops', 'Livestock', 'Clean water', 'Family safety'],
      onboarding_complete: true,
    }).catch(() => {});
    try { localStorage.setItem('ecokubatana_demo', '1'); } catch { /* ignore */ }
    navigate('/');
  }, [open]);

  if (!open || !step) return null;

  const next = () => {
    if (step.excel) {
      const beira = AFRICA_HUBS.find((h) => h.id === 'beira');
      downloadExcelCsv('ecokubatana-demo-beira', [{
        city: beira.name,
        country: beira.country,
        historic_hazard: beira.historic_hazard,
        historic_score: beira.historic_score,
        action: beira.farmer_action,
      }]);
    }
    if (i === STEPS.length - 1) {
      try { localStorage.removeItem('ecokubatana_demo'); } catch { /* */ }
      onClose();
      return;
    }
    const nxt = STEPS[i + 1];
    navigate(nxt.path);
    setI(i + 1);
  };

  return (
    <div className="demo-tour" role="dialog" aria-labelledby="demo-title">
      <div className="demo-tour__card">
        <p className="demo-tour__kicker">90-second judge path · {i + 1}/{STEPS.length}</p>
        <h2 id="demo-title">{step.title}</h2>
        <p>{step.body}</p>
        <div className="demo-tour__actions">
          <button type="button" className="btn btn--ghost" onClick={() => { try { localStorage.removeItem('ecokubatana_demo'); } catch { /* */ } onClose(); }}>Skip</button>
          <button type="button" className="btn btn--primary" onClick={next}>{i === STEPS.length - 1 ? 'Finish' : 'Next'}</button>
        </div>
      </div>
    </div>
  );
}
