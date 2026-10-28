import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { FeatureProvider } from './contexts/FeatureContext'
import { AccessProvider } from './contexts/AccessContext'
import Sidebar        from './components/Sidebar'
import Dashboard      from './components/Dashboard'
import Incidents      from './components/Incidents'
import CommunityBoard from './components/CommunityBoard'
import ReportIncident from './components/ReportIncident'
import KnowledgeHub   from './components/KnowledgeHub'
import Settings       from './components/Settings'
import Login          from './components/Login'
import AdminPortal    from './components/AdminPortal'
import VoiceReport    from './components/VoiceReport'
import ForecastLab    from './components/ForecastLab'
import HistoricIntel  from './components/HistoricIntel'
import HazardFlags    from './components/HazardFlags'
import PopulationRisk from './components/PopulationRisk'
import FeatureGate    from './components/FeatureGate'
import UssdConsole    from './components/UssdConsole'
import OfflineBanner  from './components/OfflineBanner'
import AlertGuidePopup from './components/AlertGuidePopup'
import LiveBlastPopup from './components/LiveBlastPopup'
import PlaceSearch from './components/PlaceSearch'
import ComingWatch from './components/ComingWatch'
import { LocationProvider } from './contexts/LocationContext'
import { numbersForIso } from './lib/safetyPlaces'
import { hubForUser } from './lib/dataSources'
import { AFRICA_HUBS } from './lib/africaHubs'
import { getAvatarUrl } from './lib/avatar'

import { helpRequestsAPI } from './lib/api'
import './App.css'
import './polish.css'

// Page title mapping - maps each route to its pageTitles.* translation key
const pageTitleKeys = {
  '/incidents': 'incidents',
  '/alerts': 'incidents',
  '/community': 'community',
  '/knowledge': 'knowledge',
  '/take-action': 'takeAction',
  '/report': 'report',
  '/settings': 'settings',
  '/admin': 'admin',
  '/forecast-lab': 'forecastLab',
  '/historic-intel': 'historicIntel',
  '/hazard-flags': 'hazardFlags',
  '/population-risk': 'populationRisk',
  '/ussd': 'ussd',
  '/coming': 'coming',
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [voiceReportOpen, setVoiceReportOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [helpForm, setHelpForm] = useState({ type: 'Medical', priority: 'medium', location: '', description: '' })
  const [helpSubmitting, setHelpSubmitting] = useState(false)
  const [helpSubmitResult, setHelpSubmitResult] = useState(null)
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()

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
    if (path === '/') {
      return t('pageTitles.welcomeBack', { name: (user?.name || 'User').split(' ')[0] });
    }
    const key = pageTitleKeys[path];
    return key ? t(`pageTitles.${key}`) : 'EcoKubatana';
  };

  const currentTitle = getPageTitle(location.pathname)
  const localNumbers = numbersForIso(hubForUser(AFRICA_HUBS, user?.location)?.iso3 || 'ZWE')

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <OfflineBanner />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Phones hide the top bar and sidebar; these keep the menu and emergency actions in reach */}
      {!sidebarOpen && (
        <div className="mobile-fab">
          <button type="button" className="mobile-fab__btn mobile-fab__btn--help" onClick={openHelpModal} aria-label={t('topbar.requestHelp')}>🚨</button>
          <button type="button" className="mobile-fab__btn" onClick={() => setVoiceReportOpen(true)} aria-label={t('topbar.voiceReport')}>🎙️</button>
          <button type="button" className="mobile-fab__btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">☰</button>
        </div>
      )}

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
          <div className={`topbar__title ${location.pathname === '/' ? 'topbar__title--greeting' : ''}`}>{currentTitle}</div>
          <PlaceSearch />
          <div className="topbar__right">
            <button className="topbar__help-btn topbar__help-btn--voice" onClick={() => setVoiceReportOpen(true)} aria-label={t('topbar.voiceReport')}>
              🎙️ <span className="topbar__btn-label">{t('topbar.voiceReport')}</span>
            </button>
            <button className="topbar__help-btn" onClick={openHelpModal} aria-label={t('topbar.requestHelp')}>
              🚨 <span className="topbar__btn-label">{t('topbar.requestHelp')}</span>
            </button>
            <button
              className="topbar__icon topbar__theme-toggle"
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <div className="topbar__profile">
              <button 
                className="topbar__avatar" 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                title={user?.name}
                aria-label="Account menu"
                aria-expanded={profileMenuOpen}
              >
                {getAvatarUrl(user)
                  ? <img src={getAvatarUrl(user)} alt="" />
                  : (user?.name?.[0]?.toUpperCase() || 'U')}
              </button>
              {profileMenuOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <div className="profile-menu-avatar">
                      {getAvatarUrl(user)
                        ? <img src={getAvatarUrl(user)} alt="" />
                        : (user?.name?.[0]?.toUpperCase())}
                    </div>
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
                      🛡️ Admin portal
                    </button>
                  )}
                  <button className="profile-menu-item profile-menu-item--logout" onClick={logout}>
                    🚪 Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content" id="main-content">
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/safety-hub" element={<Navigate to="/" replace />} />
            <Route path="/incidents"  element={<Incidents />} />
            <Route path="/coming"     element={<ComingWatch />} />
            <Route path="/alerts"     element={<Navigate to="/incidents" replace />} />
            <Route path="/community"  element={<CommunityBoard />} /> 
            <Route path="/knowledge"  element={<KnowledgeHub />} />
            <Route path="/CommunitySolutions" element={<Navigate to="/" replace />} />
            <Route path="/wellbeing"  element={<Navigate to="/community" replace />} />
            <Route path="/report"     element={<ReportIncident />} />
            <Route path="/settings"   element={<Settings />} />
            <Route path="/forecast-lab" element={<FeatureGate featureKey="forecast_lab"><ForecastLab /></FeatureGate>} />
            <Route path="/historic-intel" element={<FeatureGate featureKey="historic_intel"><HistoricIntel /></FeatureGate>} />
            <Route path="/hazard-flags" element={<FeatureGate featureKey="hazard_flags"><HazardFlags /></FeatureGate>} />
            <Route path="/population-risk" element={<FeatureGate featureKey="population_risk"><PopulationRisk /></FeatureGate>} />
            <Route path="/ussd"       element={<FeatureGate featureKey="ussd"><UssdConsole /></FeatureGate>} />
            <Route path="/stokvel"    element={<Navigate to="/" replace />} />
            <Route path="/admin"      element={isAdmin ? <AdminPortal /> : <Navigate to="/" />} />
          </Routes>
        </main>

        {/* Help Request Modal */}
        {helpModalOpen && (
          <div className="modal-overlay" onClick={() => setHelpModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🚨 Request emergency help</h2>
                <button className="modal-close" onClick={() => setHelpModalOpen(false)} aria-label="Close">✕</button>
              </div>
              <div className="modal-body">
                <p>Your location: <strong>{user?.location || 'Not set'}</strong></p>
                <div className="emergency-contacts-modal">
                  <a href={`tel:${localNumbers.police}`} className="emergency-contact-item emergency-contact-item--police">
                    <span className="emergency-contact-icon">👮</span>
                    <div>
                      <div className="emergency-contact-label">Police</div>
                      <div className="emergency-contact-number">{localNumbers.police}</div>
                    </div>
                  </a>
                  <a href={`tel:${localNumbers.fire}`} className="emergency-contact-item emergency-contact-item--fire">
                    <span className="emergency-contact-icon">🚒</span>
                    <div>
                      <div className="emergency-contact-label">Fire</div>
                      <div className="emergency-contact-number">{localNumbers.fire}</div>
                    </div>
                  </a>
                  <a href={`tel:${localNumbers.medical}`} className="emergency-contact-item emergency-contact-item--medical">
                    <span className="emergency-contact-icon">🏥</span>
                    <div>
                      <div className="emergency-contact-label">Ambulance</div>
                      <div className="emergency-contact-number">{localNumbers.medical}</div>
                    </div>
                  </a>
                </div>

                <div className="section-divider">
                  <h3 style={{ margin: '0 0 8px', fontSize: 15, color: 'var(--heading-color)' }}>Or notify the EcoKubatana team</h3>
                  <p className="text-muted" style={{ margin: '0 0 12px', fontSize: 13 }}>
                    For non-life-threatening situations, submit a request and an admin or volunteer will follow up.
                  </p>

                  {helpSubmitResult?.success ? (
                    <div className="form-note form-note--success">
                      ✓ Your request has been sent. Someone will respond shortly.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitHelpRequest}>
                      <div className="form-row" style={{ marginBottom: 12 }}>
                        <div className="form-group">
                          <label className="form-label">Type</label>
                          <select className="form-input" value={helpForm.type} onChange={e => setHelpForm({ ...helpForm, type: e.target.value })}>
                            <option value="Medical">Medical</option>
                            <option value="Fire">Fire</option>
                            <option value="Rescue">Rescue</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
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
                        <input type="text" className="form-input" placeholder="e.g., Avondale, Harare"
                          value={helpForm.location} onChange={e => setHelpForm({ ...helpForm, location: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">What's happening? *</label>
                        <textarea className="form-textarea" rows="3" placeholder="Briefly describe the situation…"
                          value={helpForm.description} onChange={e => setHelpForm({ ...helpForm, description: e.target.value })} />
                      </div>
                      {helpSubmitResult?.error && (
                        <p className="form-note form-note--error" style={{ marginBottom: 8 }}>{helpSubmitResult.error}</p>
                      )}
                      <button type="submit" className="btn btn--primary" style={{ width: '100%' }}
                        disabled={helpSubmitting || !helpForm.location.trim() || !helpForm.description.trim()}>
                        {helpSubmitting ? 'Sending…' : '🚨 Send help request'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <VoiceReport isOpen={voiceReportOpen} onClose={() => setVoiceReportOpen(false)} />
        <AlertGuidePopup alerts={[]} />
        <LiveBlastPopup />
      </div>
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AccessProvider>
        <AuthProvider>
          <FeatureProvider>
            <LocationProvider>
              <BrowserRouter>
                <div className="app-shell">
                  <AppContent />
                </div>
              </BrowserRouter>
            </LocationProvider>
          </FeatureProvider>
        </AuthProvider>
      </AccessProvider>
    </ThemeProvider>
  )
}

export default App
