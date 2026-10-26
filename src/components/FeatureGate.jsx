import { Link } from 'react-router-dom';
import { useFeatures } from '../contexts/FeatureContext';

export default function FeatureGate({ featureKey, children }) {
  const { isEnabled, catalog } = useFeatures();
  const demoOn = typeof localStorage !== 'undefined' && localStorage.getItem('ecokubatana_demo') === '1';
  if (isEnabled(featureKey) || demoOn) return children;
  const feature = catalog.find((f) => f.key === featureKey);
  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>{feature?.icon || '🔒'}</div>
        <h2>{feature?.label || 'Premium tab'}</h2>
        <p style={{ color: 'var(--neutral-500)' }}>{feature?.description} Turn it on in Settings (paid extras). Default accounts stay on the community tools you already have.</p>
        <Link to="/settings" className="btn btn--primary">Open feature settings</Link>
      </div>
    </div>
  );
}
