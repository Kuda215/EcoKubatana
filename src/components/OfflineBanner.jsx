import useOnlineStatus from '../hooks/useOnlineStatus';
import { offlineMeta } from '../lib/offline';

export default function OfflineBanner() {
  const online = useOnlineStatus();
  const saved = offlineMeta();
  if (online) return null;
  return (
    <div className="offline-banner" role="status">
      You are offline. Showing the last saved map, alerts and playbook{saved ? ` from ${new Date(saved).toLocaleString()}` : ''}.
    </div>
  );
}
