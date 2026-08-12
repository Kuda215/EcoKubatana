import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import Sidebar        from './components/Sidebar'
import Dashboard      from './components/Dashboard'
import SafetyHub      from './components/SafetyHub'
import Incidents      from './components/Incidents'
import Alerts         from './components/Alerts'
import CommunityBoard from './components/CommunityBoard'
import ReportIncident from './components/ReportIncident'
import TakeAction     from './components/TakeAction'
import KnowledgeHub   from './components/KnowledgeHub'
import Wellbeing      from './components/Wellbeing'
import Settings       from './components/Settings'
import Login          from './components/Login'
import AdminPortal    from './components/AdminPortal'
import './App.css'

// Page title mapping
const pageTitles = {
  '/': (userName) => `Welcome back, ${userName.split(' ')[0]}`,
  '/safety-hub': 'Nearest Help & Safety Hub',
  '/incidents': 'Climate Incidents',
  '/alerts': 'Weather & Climate Alerts',
  '/community': 'Community Board',
  '/knowledge': 'AI Knowledge Hub',
  '/take-action': 'Take Action',
  '/wellbeing': 'Support & Wellbeing',
  '/report': 'Report Incident',
  '/settings': 'Settings',
  '/admin': 'Admin Portal'
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  if (!isAuthenticated) {
    return <Login />;
  }

  const getPageTitle = (path) => {
    const title = pageTitles[path];
    if (typeof title === 'function') {
      return title(user?.name || 'User');
    }
    return title || 'EcoKubatana';
  };

  const currentTitle = getPageTitle(location.pathname)

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main">
        {/* Top bar */}
        <header className="topbar">
          <button className="topbar__menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <div className="topbar__brand">
            <span>🌿</span>
            <span>EcoKubatana</span>
          </div>
          <div className="topbar__title">{currentTitle}</div>
          <div className="topbar__right">
            <button className="topbar__help-btn" onClick={() => setHelpModalOpen(true)}>
              🚨 Request Help
            </button>
            <button
              className="topbar__icon topbar__theme-toggle"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button className="topbar__icon topbar__icon--bell" title="Alerts">
              🔔<span className="bell-count">8</span>
            </button>
            <div className="topbar__profile">
              <button 
                className="topbar__avatar" 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                title={user?.name}
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </button>
              {profileMenuOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <div className="profile-menu-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                    <div className="profile-menu-info">
                      <div className="profile-menu-name">{user?.name}</div>
                      <div className="profile-menu-role">{user?.role}</div>
                    </div>
                  </div>
                  <div className="profile-menu-divider"></div>
                  <button className="profile-menu-item" onClick={() => { setProfileMenuOpen(false); window.location.href = '/settings'; }}>
                    ⚙️ Settings
                  </button>
                  {isAdmin && (
                    <button className="profile-menu-item" onClick={() => { setProfileMenuOpen(false); window.location.href = '/admin'; }}>
                      🔧 Admin Portal
                    </button>
                  )}
                  <button className="profile-menu-item profile-menu-item--logout" onClick={logout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/safety-hub" element={<SafetyHub />} />
            <Route path="/incidents"  element={<Incidents />} />
            <Route path="/alerts"     element={<Alerts />} />
            <Route path="/community"  element={<CommunityBoard />} />
            <Route path="/knowledge"  element={<KnowledgeHub />} />
            <Route path="/take-action"element={<TakeAction />} />
            <Route path="/wellbeing"  element={<Wellbeing />} />
            <Route path="/report"     element={<ReportIncident />} />
            <Route path="/settings"   element={<Settings />} />
            <Route path="/admin"      element={isAdmin ? <AdminPortal /> : <Navigate to="/" />} />
          </Routes>
        </main>

        {/* Help Request Modal */}
        {helpModalOpen && (
          <div className="modal-overlay" onClick={() => setHelpModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🚨 Request Emergency Help</h2>
                <button className="modal-close" onClick={() => setHelpModalOpen(false)}>✕</button>
              </div>
              <div className="modal-body">
                <p>Your location: <strong>Ferndale, Johannesburg</strong></p>
                <div className="emergency-contacts-modal">
                  <a href="tel:10111" className="emergency-contact-item emergency-contact-item--police">
                    <span className="emergency-contact-icon">👮</span>
                    <div>
                      <div className="emergency-contact-label">Police</div>
                      <div className="emergency-contact-number">10111</div>
                    </div>
                  </a>
                  <a href="tel:10177" className="emergency-contact-item emergency-contact-item--fire">
                    <span className="emergency-contact-icon">🚒</span>
                    <div>
                      <div className="emergency-contact-label">Fire</div>
                      <div className="emergency-contact-number">10177</div>
                    </div>
                  </a>
                  <a href="tel:999" className="emergency-contact-item emergency-contact-item--medical">
                    <span className="emergency-contact-icon">🏥</span>
                    <div>
                      <div className="emergency-contact-label">Medical</div>
                      <div className="emergency-contact-number">999</div>
                    </div>
                  </a>
                  <a href="tel:0800-72835437" className="emergency-contact-item emergency-contact-item--weather">
                    <span className="emergency-contact-icon">⛈️</span>
                    <div>
                      <div className="emergency-contact-label">Weather Emergency</div>
                      <div className="emergency-contact-number">0800-WEATHER</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-shell">
            <AppContent />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
