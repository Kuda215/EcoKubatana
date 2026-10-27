import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { subscribeBlast, clearBlast } from '../lib/alertBlast';

export default function CommunityAlertPopup() {
  const [blast, setBlast] = useState(null);
  const loc = useLocation();
  const faint = loc.pathname === '/incidents';

  useEffect(() => subscribeBlast(setBlast), []);

  if (!blast) return null;

  return (
    <div className={`community-blast ${faint ? 'community-blast--faint' : ''}`} role="alertdialog">
      <div className="community-blast__card">
        <p className="community-blast__kicker">{blast.level}</p>
        <h2>{blast.title}</h2>
        <p>{blast.message}</p>
        <button type="button" className="btn btn--primary" onClick={() => { clearBlast(); setBlast(null); }}>
          I have seen this
        </button>
      </div>
    </div>
  );
}
