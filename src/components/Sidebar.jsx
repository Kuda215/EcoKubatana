import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useFeatures } from '../contexts/FeatureContext';
import './Sidebar.css';

const navItems = [
  { path: '/',          key: 'home',       icon: '🏠' },
  { path: '/coming',    key: 'coming',     icon: '🔮' },
  { path: '/incidents', key: 'incidents',  icon: '⚠️' },
  { path: '/community', key: 'community',  icon: '👥' },
  { path: '/knowledge', key: 'knowledge',  icon: '📚' },
  { path: '/settings',  key: 'settings',   icon: '⚙️' },
];

const adminNavItem = { path: '/admin', key: 'admin', icon: '🛡️' };

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, logout } = useAuth();
  const { technicalNav } = useFeatures();
  const { t } = useTranslation();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">🌿</span>
          <div>
            <span className="sidebar__name">EcoKubatana</span>
            <span className="sidebar__tagline">{t('sidebar.tagline')}</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map(({ path, key, icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar__icon">{icon}</span>
              <span className="sidebar__label">{t(`sidebar.${key}`)}</span>
            </NavLink>
          ))}

          {technicalNav.length > 0 && (
            <>
              <div className="sidebar__divider"></div>
              {technicalNav.map((f) => (
                <NavLink
                  key={f.key}
                  to={f.tab_path}
                  className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                  onClick={onClose}
                >
                  <span className="sidebar__icon">{f.icon}</span>
                  <span className="sidebar__label">{t(`sidebar.${f.key}`, { defaultValue: f.label })}</span>
                </NavLink>
              ))}
            </>
          )}

          {/* Admin Portal - Only visible to admins */}
          {isAdmin && (
            <>
              <div className="sidebar__divider"></div>
              <NavLink
                to={adminNavItem.path}
                className={({ isActive }) =>
                  `sidebar__link sidebar__link--admin ${isActive ? 'sidebar__link--active' : ''}`
                }
                onClick={onClose}
              >
                <span className="sidebar__icon">{adminNavItem.icon}</span>
                <span className="sidebar__label">{t(`sidebar.${adminNavItem.key}`)}</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar__footer">
          {/* Phones have no top bar (and so no profile menu), so log out lives here */}
          <button type="button" className="sidebar__logout" onClick={logout}>🚪 Log out</button>
          <p className="sidebar__motto">{t('sidebar.motto')}</p>
        </div>
      </aside>
    </>
  );
}
