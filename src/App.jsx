import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar        from './components/Sidebar'
import Dashboard      from './components/Dashboard'
import Incidents      from './components/Incidents'
import Alerts         from './components/Alerts'
import CommunityBoard from './components/CommunityBoard'
import ReportIncident from './components/ReportIncident'
import TakeAction     from './components/TakeAction'
import LearningHub    from './components/LearningHub'
import Resources      from './components/Resources'
import Wellbeing      from './components/Wellbeing'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="app-main">
          {/* Top bar (mobile) */}
          <header className="topbar">
            <button className="topbar__menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              ☰
            </button>
            <div className="topbar__brand">
              <span>🌿</span>
              <span>EcoKubatana</span>
            </div>
            <div className="topbar__right">
              <button className="topbar__icon" title="Alerts">🔔</button>
              <div className="topbar__avatar">T</div>
            </div>
          </header>

          <main className="app-content">
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/incidents"  element={<Incidents />} />
              <Route path="/alerts"     element={<Alerts />} />
              <Route path="/community"  element={<CommunityBoard />} />
              <Route path="/resources"  element={<Resources />} />
              <Route path="/learning"   element={<LearningHub />} />
              <Route path="/take-action"element={<TakeAction />} />
              <Route path="/wellbeing"  element={<Wellbeing />} />
              <Route path="/report"     element={<ReportIncident />} />
              <Route path="/settings"   element={<div className="page"><h1 style={{color:'#1a3c2e'}}>⚙️ Settings</h1><p>Settings panel coming soon.</p></div>} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
