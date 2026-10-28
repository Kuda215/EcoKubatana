import { Link } from 'react-router-dom';
import { useFeatures } from '../contexts/FeatureContext';

export default function FeatureGate({ featureKey, children }) {
  const { isEnabled, catalog } = useFeatures();
  const demoOn = typeof localStorage !== 'undefined' && localStorage.getItem('ecokubatana_demo') === '1';
  if (isEnabled(featureKey) || demoOn) return children;
  const feature = catalog.find((f) => f.key === featureKey);
  return (
    <div className="page">
      <div className="ui-state ui-state--boxed" style={{ maxWidth: 560, margin: 'var(--space-6) auto' }}>
        <div className="ui-state__icon" aria-hidden="true">{feature?.icon || '🔒'}</div>
        <h2 className="ui-state__title">{feature?.label || 'This feature'}</h2>
        <p className="ui-state__text">
          {feature?.description}{' '}
          {feature?.is_premium
            ? 'This is a paid extra, so it is switched off until you turn it on in Settings.'
            : 'This feature is switched off for your account. You can turn it on in Settings.'}
        </p>
        <Link to="/settings" className="btn btn--primary">Open feature settings</Link>
      </div>
    </div>
  );
}
