import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
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
import VoiceReport    from './components/VoiceReport'
import { helpRequestsAPI, alertsAPI, notificationsAPI } from './lib/api'
import './App.css'

const levelIcon  = { Info: '✅', Warning: '🌡️', Critical: '⚠️', Emergency: '🚨' }
const levelColor = { Info: '#52b788', Warning: '#e9c46a', Critical: '#f4a261', Emergency: '#e63946' }

function timeAgo(date) {
  const diff = Date.now() - date
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

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
  const [voiceReportOpen, setVoiceReportOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [helpForm, setHelpForm] = useState({ type: 'Medical', priority: 'medium', location: '', description: '' })
  const [helpSubmitting, setHelpSubmitting] = useState(false)
  const [helpSubmitResult, setHelpSubmitResult] = useState(null)
  const [bellOpen, setBellOpen] = useState(false)
  const [recentAlerts, setRecentAlerts] = useState([])
  const [lastSeenAlertsAt, setLastSeenAlertsAt] = useState('1970-01-01T00:00:00Z')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    if (!isAuthenticated) return
    alertsAPI.list()
      .then(result => { if (result.success) setRecentAlerts(result.data) })
      .catch(err => console.error('Failed to load alerts:', err))
    notificationsAPI.getLastSeenAlertsAt()
      .then(result => { if (result.success) setLastSeenAlertsAt(result.data) })
      .catch(err => console.error('Failed to load notification state:', err))
  }, [isAuthenticated])

  const unreadAlertsCount = recentAlerts.filter(
    a => new Date(a.published_at || a.created_at) > new Date(lastSeenAlertsAt)
  ).length

  const toggleBell = async () => {
    const opening = !bellOpen
    setBellOpen(opening)
    setProfileMenuOpen(false)
    if (opening) {
      const now = new Date().toISOString()
      setLastSeenAlertsAt(now)
      try {
        await notificationsAPI.markAlertsSeen()
      } catch (error) {
        console.error('Failed to mark alerts seen:', error)
      }
    }
  }

  const openHelpModal = () => {
    setHelpForm(f => ({ ...f, location: user?.location || '' }))
    setHelpSubmitResult(null)
    setHelpModalOpen(true)
  }

  const handleSubmitHelpRequest = async (e) => {
    e.preventDefault()
    if (!helpForm.location.trim() || !helpForm.description.trim()) return
    setHelpSubmitting(true)
    setHelpSubmitResult(null)
    try {
      const result = await helpRequestsAPI.create({
        type: helpForm.type,
        priority: helpForm.priority,
        location: helpForm.location.trim(),
        description: helpForm.description.trim(),
      })
      if (!result.success) {
        setHelpSubmitResult({ success: false, error: result.error || 'Please try again.' })
        return
      }
      setHelpSubmitResult({ success: true })
      setHelpForm({ type: 'Medical', priority: 'medium', location: user?.location || '', description: '' })
    } catch (error) {
      console.error('Failed to submit help request:', error)
      setHelpSubmitResult({ success: false, error: 'Please try again.' })
    } finally {
      setHelpSubmitting(false)
    }
  }

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
            <button className="topbar__help-btn" style={{ background: '#0a3d2e' }} onClick={() => setVoiceReportOpen(true)}>
              🎙️ Voice Report
            </button>
            <button className="topbar__help-btn" onClick={openHelpModal}>
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
            <div className="topbar__profile">
              <button className="topbar__icon topbar__icon--bell" title="Alerts" onClick={toggleBell}>
                🔔{unreadAlertsCount > 0 && <span className="bell-count">{unreadAlertsCount}</span>}
              </button>
              {bellOpen && (
                <div className="profile-menu" style={{ minWidth: '320px', maxWidth: '360px' }}>
                  <div className="profile-menu-header" style={{ paddingBottom: '8px' }}>
                    <div className="profile-menu-name" style={{ fontSize: '16px' }}>🔔 Alerts</div>
                  </div>
                  <div className="profile-menu-divider"></div>
                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {recentAlerts.length === 0 && (
                      <p style={{ padding: '16px', margin: 0, color: 'var(--neutral-500)', fontSize: '13px' }}>
                        No alerts yet.
                      </p>
                    )}
                    {recentAlerts.slice(0, 6).map(a => (
                      <div key={a.id} style={{ padding: '10px 16px', borderLeft: `3px solid ${levelColor[a.level]}`, display: 'flex', gap: '10px' }}>
                        <span>{levelIcon[a.level]}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{a.type}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--neutral-500)', whiteSpace: 'nowrap' }}>
                              {timeAgo(new Date(a.published_at || a.created_at))}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {a.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="profile-menu-divider"></div>
                  <button className="profile-menu-item" onClick={() => { setBellOpen(false); navigate('/alerts'); }}>
                    See all alerts →
                  </button>
                </div>
              )}
            </div>
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
                  <button className="profile-menu-item" onClick={() => { setProfileMenuOpen(false); navigate('/settings'); }}>
                    ⚙️ Settings
                  </button>
                  {isAdmin && (
                    <button className="profile-menu-item" onClick={() => { setProfileMenuOpen(false); navigate('/admin'); }}>
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
                <p>Your location: <strong>{user?.location || 'Not set'}</strong></p>
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

                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '15px', color: '#0a3d2e' }}>Or notify the EcoKubatana team</h3>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
                    For non-life-threatening situations, submit a request and an admin or volunteer will follow up.
                  </p>

                  {helpSubmitResult?.success ? (
                    <div style={{ padding: '12px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', color: '#047857', fontSize: '14px' }}>
                      ✓ Your request has been sent. Someone will respond shortly.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitHelpRequest}>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <div className="form-group" style={{ flex: 1, margin: 0 }}>
                          <label className="form-label">Type</label>
                          <select className="form-input" value={helpForm.type} onChange={e => setHelpForm({ ...helpForm, type: e.target.value })}>
                            <option value="Medical">Medical</option>
                            <option value="Fire">Fire</option>
                            <option value="Rescue">Rescue</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ flex: 1, margin: 0 }}>
                          <label className="form-label">Priority</label>
                          <select className="form-input" value={helpForm.priority} onChange={e => setHelpForm({ ...helpForm, priority: e.target.value })}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Location *</label>
                        <input type="text" className="form-input" placeholder="e.g., Ferndale, Johannesburg"
                          value={helpForm.location} onChange={e => setHelpForm({ ...helpForm, location: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">What's happening? *</label>
                        <textarea className="form-textarea" rows="3" placeholder="Briefly describe the situation..."
                          value={helpForm.description} onChange={e => setHelpForm({ ...helpForm, description: e.target.value })} />
                      </div>
                      {helpSubmitResult?.error && (
                        <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '8px' }}>{helpSubmitResult.error}</p>
                      )}
                      <button type="submit" className="btn btn--primary" style={{ width: '100%' }}
                        disabled={helpSubmitting || !helpForm.location.trim() || !helpForm.description.trim()}>
                        {helpSubmitting ? 'Sending…' : '🚨 Submit Help Request'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <VoiceReport isOpen={voiceReportOpen} onClose={() => setVoiceReportOpen(false)} />
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
