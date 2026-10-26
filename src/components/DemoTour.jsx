import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { downloadExcelCsv } from '../lib/dataSources';
import { AFRICA_HUBS } from '../lib/africaHubs';

const STEPS = [
  { id: 'farmer', title: 'You are a farmer in Beira', body: 'Livelihood set to Farmer. Location Beira, Mozambique - Cyclone Idai memory. Priorities: crops, livestock, water.', path: '/' },
  { id: 'flag', title: 'Flood flag on the map', body: 'Open Historic / Forecast / Flags. Beira is a high historic cyclone/flood marker. Colour-blind patterns still read as high risk.', path: '/' },
  { id: 'excel', title: 'Specialist Excel sheet', body: 'Beira flood/cyclone row downloads as Excel so a planner is not stuck on a map.', path: '/', excel: true },
  { id: 'alerts', title: 'Alert steps + reply 1', body: 'Playbook, sign steps, and WhatsApp-style 1 = safe / 2 = help.', path: '/alerts' },
  { id: 'wherenow', title: 'Where to now? voice', body: 'Hands-free steps: the phone speaks, then listens for next, back, repeat, or hub. Built for a farmer in Beira.', path: '/CommunitySolutions' },
  { id: 'hub', title: 'Africa safety map', body: 'Hospitals, police, fire and clinics from OpenStreetMap around every hub city. Country emergency numbers included.', path: '/safety-hub' },
  { id: 'ussd', title: 'Feature phone *123#', body: 'Same choices on a USSD screen for people with no smartphone data.', path: '/ussd' },
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
      location: 'Beira, Mozambique',
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
