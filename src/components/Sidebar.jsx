import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const navItems = [
  { path: '/',                   key: 'dashboard',           icon: '🏠' },
  { path: '/CommunitySolutions', key: 'communitySolutions',  icon: '👀' },
  { path: '/safety-hub',         key: 'safetyHub',            icon: '🗺️' },
  { path: '/incidents',          key: 'incidents',             icon: '⚠️' },
  { path: '/alerts',             key: 'alerts',                icon: '🔔' },
  { path: '/community',          key: 'community',             icon: '👥' },
  { path: '/knowledge',          key: 'knowledge',             icon: '🤖' },
  { path: '/wellbeing',          key: 'wellbeing',             icon: '💚' },
  { path: '/settings',           key: 'settings',              icon: '⚙️' },
];

const adminNavItem = { path: '/admin', key: 'admin', icon: '🔧' };

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();
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
          <p className="sidebar__motto">{t('sidebar.motto')}</p>
        </div>
      </aside>
    </>
  );
}
