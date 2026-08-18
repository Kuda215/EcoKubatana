import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const navItems = [
  { path: '/',              label: 'Dashboard',         icon: '🏠' },
  { path: '/CommunitySolutions',    label: 'Where to now? ',        icon: '👀' },
  { path: '/safety-hub',    label: 'Safety Hub',        icon: '🗺️' },
  { path: '/incidents',     label: 'Incidents',         icon: '⚠️' },
  { path: '/alerts',        label: 'Alerts',            icon: '🔔' },
  { path: '/community',     label: 'Community Board',   icon: '👥' },
  { path: '/knowledge',     label: 'AI Knowledge Hub',  icon: '🤖' },
  // { path: '/take-action',   label: 'Take Action',       icon: '🌱' },
  { path: '/wellbeing',     label: 'Support & Wellbeing', icon: '💚' },
  // { path: '/report',        label: 'Report Incident',   icon: '📋' },
  { path: '/settings',      label: 'Settings',          icon: '⚙️' },
];

const adminNavItem = { path: '/admin', label: 'Admin Portal', icon: '🔧' };

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();
  
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">🌿</span>
          <div>
            <span className="sidebar__name">EcoKubatana</span>
            <span className="sidebar__tagline">Stronger Communities</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map(({ path, label, icon }) => (
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
              <span className="sidebar__label">{label}</span>
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
                <span className="sidebar__label">{adminNavItem.label}</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__motto">Ubuntu · Collaboration · Resilience</p>
        </div>
      </aside>
    </>
  );
}
