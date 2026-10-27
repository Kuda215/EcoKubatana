import { useEffect, useState } from 'react';
import CommunitySolutions from './CommunitySolutions';

export default function AlertGuidePopup({ alerts = [] }) {
  const emergency = alerts.find((a) => a.level === 'Emergency' || a.level === 'Critical');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!emergency) return;
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    if (!mobile) return;
    const key = `ek_guide_dismiss_${emergency.id}`;
    if (sessionStorage.getItem(key)) return;
    setOpen(true);
  }, [emergency?.id]);

  if (!open || !emergency) return null;

  const dismiss = () => {
    sessionStorage.setItem(`ek_guide_dismiss_${emergency.id}`, '1');
    setOpen(false);
  };

  return (
    <div className="alert-guide-popup" role="dialog" aria-label="Where to now">
      <div className="alert-guide-popup__sheet">
        <header className="alert-guide-popup__bar">
          <strong>Where to now?</strong>
          <button type="button" onClick={dismiss} aria-label="Close guide">✕</button>
        </header>
        <div className="alert-guide-popup__body">
          <CommunitySolutions />
        </div>
      </div>
    </div>
  );
}
