import { useEffect, useState } from 'react';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { offlineMeta } from '../lib/offline';

export default function OfflineBanner() {
  const online = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const saved = offlineMeta();

  // Show again the next time the connection drops
  useEffect(() => { if (online) setDismissed(false); }, [online]);

  if (online || dismissed) return null;
  return (
    <div className="offline-banner" role="status">
      <span>📴 You are offline. Showing the last saved map, alerts and playbook{saved ? ` from ${new Date(saved).toLocaleString()}` : ''}.</span>
      <button type="button" className="offline-banner__close" aria-label="Dismiss" onClick={() => setDismissed(true)}>✕</button>
    </div>
  );
}
