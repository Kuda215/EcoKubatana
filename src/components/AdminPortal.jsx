import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './PageStyles.css';

export default function AdminPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [popup, setPopup] = useState(null); // { type: 'verify'|'reject'|'view', data: {} }
  const [popupVisible, setPopupVisible] = useState(false);
  const [reports, setReports] = useState([
    { id: 1, reporter: 'John Doe',       type: 'Flooding',     location: 'Ferndale',   status: 'pending',       date: '2026-08-08', description: 'Severe flooding on Bram Fischer Drive. Multiple vehicles stranded. Water level rising quickly near the low bridge.' },
    { id: 2, reporter: 'Jane Smith',     type: 'Fire',         location: 'Randburg',   status: 'verified',      date: '2026-08-07', description: 'Veld fire reported along the N1 highway boundary. Spreading rapidly due to wind. Fire services have been notified.' },
    { id: 3, reporter: 'Mike Johnson',   type: 'Storm Damage', location: 'Northcliff', status: 'pending',       date: '2026-08-07', description: 'Fallen trees blocking 3 roads. Power lines down on Ridge Road. 2 households without electricity.' },
    { id: 4, reporter: 'Sarah Williams', type: 'Drought',      location: 'Cresta',     status: 'investigating', date: '2026-08-06', description: 'Extended dry spell affecting community gardens and small-scale farmers in the Cresta area. Borehole access requested.' },
    { id: 5, reporter: 'Bongani Dube',   type: 'Pollution',    location: 'Ferndale',   status: 'pending',       date: '2026-08-05', description: 'Chemical spill detected near the Jukskei River. Strong odour and discolouration of water reported by 12 residents.' },
  ]);
  const [members, setMembers] = useState([
    { id: 1, name: 'David Lee',     role: 'member',    location: 'Ferndale',   joined: '2026-08-08', status: 'active' },
    { id: 2, name: 'Emma White',    role: 'volunteer', location: 'Randburg',   joined: '2026-08-07', status: 'active' },
    { id: 3, name: 'Frank Miller',  role: 'member',    location: 'Cresta',     joined: '2026-08-07', status: 'active' },
    { id: 4, name: 'Grace Taylor',  role: 'volunteer', location: 'Northcliff', joined: '2026-08-06', status: 'suspended' },
    { id: 5, name: 'Hector Moyo',   role: 'member',    location: 'Ferndale',   joined: '2026-08-04', status: 'active' },
  ]);
  const [helpRequests, setHelpRequests] = useState([
    { id: 1, name: 'Alice Brown', location: 'Ferndale',   type: 'Medical', priority: 'high',     time: '10 mins ago', status: 'open',     description: 'Elderly resident requires urgent medical assistance. Chest pains reported.' },
    { id: 2, name: 'Bob Wilson',  location: 'Randburg',   type: 'Fire',    priority: 'critical', time: '25 mins ago', status: 'open',     description: 'Kitchen fire out of control. Family of 4 evacuating. Fire department ETA unknown.' },
    { id: 3, name: 'Carol Davis', location: 'Northcliff', type: 'Rescue',  priority: 'medium',   time: '1 hour ago',  status: 'assigned', description: 'Person trapped in flooded basement. Requires ladder rescue assistance.' },
  ]);
  const [alertLevel, setAlertLevel] = useState('Critical');
  const [alertForm, setAlertForm] = useState({ type: 'Weather Alert', area: '', message: '', targets: { all: true, volunteers: true, admins: false } });
  const [alertSent, setAlertSent] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [reportFilter, setReportFilter] = useState('All');

  const stats = {
    totalMembers: members.length + 2340,
    totalVolunteers: 127,
    activeIncidents: reports.filter(r => r.status === 'pending' || r.status === 'investigating').length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    alertsSent: 45,
    helpRequests: helpRequests.filter(r => r.status === 'open').length
  };

  const triggerPopup = (type, data) => {
    setPopup({ type, data });
    setPopupVisible(true);
    if (type === 'verify' || type === 'reject') {
      setTimeout(() => {
        setPopupVisible(false);
        setTimeout(() => setPopup(null), 400);
      }, 2200);
    }
  };

  const handleVerify = (report) => {
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'verified' } : r));
    triggerPopup('verify', report);
  };

  const handleReject = (report) => {
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'rejected' } : r));
    triggerPopup('reject', report);
  };

  const handleRespond = (req) => {
    setHelpRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'assigned' } : r));
    triggerPopup('verify', { ...req, type: `${req.type} Response Assigned` });
  };

  const handleSendAlert = (e) => {
    e.preventDefault();
    setAlertSent(true);
    triggerPopup('verify', { type: 'Alert Sent!', location: alertForm.area || 'All Areas' });
    setTimeout(() => setAlertSent(false), 3000);
  };

  const filteredReports = reportFilter === 'All'
    ? reports
    : reports.filter(r => r.status === reportFilter.toLowerCase());

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.location.toLowerCase().includes(memberSearch.toLowerCase())
  );

  if (user?.role !== 'admin') {
    return (
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">⚠️ Access Denied</h1>
        </div>
        <div className="card">
          <p>You do not have permission to access this page. Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ── Animated Popup Overlay ─────────────────────────────── */}
      {popup && (
        <div className={`admin-popup-overlay ${popupVisible ? 'admin-popup-overlay--visible' : 'admin-popup-overlay--exit'}`}
          onClick={() => { if (popup.type === 'view') { setPopupVisible(false); setTimeout(() => setPopup(null), 300); } }}
        >
          <div className={`admin-popup-box admin-popup-box--${popup.type} ${popupVisible ? 'admin-popup-box--in' : 'admin-popup-box--out'}`}
            onClick={e => e.stopPropagation()}
          >
            {popup.type === 'verify' && (
              <>
                <div className="admin-popup-icon admin-popup-icon--verify">
                  <svg viewBox="0 0 100 100" className="popup-svg">
                    <circle cx="50" cy="50" r="45" className="popup-circle popup-circle--green" />
                    <polyline points="25,52 42,68 75,35" className="popup-checkmark" />
                  </svg>
                </div>
                <h2 className="admin-popup-title">Verified!</h2>
                <p className="admin-popup-sub">{popup.data?.type} — {popup.data?.location}</p>
              </>
            )}
            {popup.type === 'reject' && (
              <>
                <div className="admin-popup-icon admin-popup-icon--reject">
                  <svg viewBox="0 0 100 100" className="popup-svg">
                    <circle cx="50" cy="50" r="45" className="popup-circle popup-circle--red" />
                    <line x1="30" y1="30" x2="70" y2="70" className="popup-cross" />
                    <line x1="70" y1="30" x2="30" y2="70" className="popup-cross" />
                  </svg>
                </div>
                <h2 className="admin-popup-title">Rejected</h2>
                <p className="admin-popup-sub">{popup.data?.type} — {popup.data?.location}</p>
              </>
            )}
            {popup.type === 'view' && (
              <>
                <div className="admin-popup-view-header">
                  <h2 className="admin-popup-view-title">📋 Report Details</h2>
                  <button className="admin-popup-close" onClick={() => { setPopupVisible(false); setTimeout(() => setPopup(null), 300); }}>✕</button>
                </div>
                <div className="admin-popup-view-body">
                  <div className="admin-popup-detail-row"><span>Reporter</span><strong>{popup.data?.reporter}</strong></div>
                  <div className="admin-popup-detail-row"><span>Type</span><strong>{popup.data?.type}</strong></div>
                  <div className="admin-popup-detail-row"><span>Location</span><strong>{popup.data?.location}</strong></div>
                  <div className="admin-popup-detail-row"><span>Date</span><strong>{popup.data?.date}</strong></div>
                  <div className="admin-popup-detail-row"><span>Status</span>
                    <span className={`status-badge status-badge--${popup.data?.status}`}>{popup.data?.status}</span>
                  </div>
                  <div className="admin-popup-description">
                    <p className="admin-popup-desc-label">Description</p>
                    <p className="admin-popup-desc-text">{popup.data?.description}</p>
                  </div>
                </div>
                {popup.data?.status === 'pending' && (
                  <div className="admin-popup-view-actions">
                    <button className="btn btn--primary" onClick={() => { handleVerify(popup.data); setPopup(null); }}>✓ Verify</button>
                    <button className="btn btn--danger" onClick={() => { handleReject(popup.data); setPopup(null); }}>✕ Reject</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="page__header">
        <div>
          <h1 className="page__title">⚙️ Admin Portal</h1>
          <p className="page__sub">Manage platform, review reports, and coordinate responses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-tabs">
        {['overview', 'reports', 'help-requests', 'members', 'alerts'].map(tab => (
          <button key={tab}
            className={`filter-tab ${activeTab === tab ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'reports' && `Reports ${stats.pendingReports > 0 ? `(${stats.pendingReports})` : ''}`}
            {tab === 'help-requests' && `Help Requests ${stats.helpRequests > 0 ? `(${stats.helpRequests})` : ''}`}
            {tab === 'members' && 'Members'}
            {tab === 'alerts' && 'Send Alert'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="admin-overview">
          <div className="admin-stats-grid">
            {[
              { icon: '👥', value: stats.totalMembers.toLocaleString(), label: 'Total Members',        bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
              { icon: '🤝', value: stats.totalVolunteers,               label: 'Volunteers',           bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' },
              { icon: '⚠️', value: stats.activeIncidents,              label: 'Active Incidents',     bg: 'linear-gradient(135deg,#fde8e8,#ffd1d1)' },
              { icon: '📋', value: stats.pendingReports,               label: 'Pending Reports',      bg: 'linear-gradient(135deg,#fed7aa,#fdba74)' },
              { icon: '📢', value: stats.alertsSent,                   label: 'Alerts Sent',          bg: 'linear-gradient(135deg,#e8fff8,#d1fae5)' },
              { icon: '🚨', value: stats.helpRequests,                 label: 'Active Help Requests', bg: 'linear-gradient(135deg,#fff8f0,#fde8e8)' },
            ].map((s, i) => (
              <div key={i} className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div className="admin-stat-info">
                  <div className="admin-stat-value">{s.value}</div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="admin-quick-actions">
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0a3d2e', marginBottom: '16px' }}>Quick Actions</h3>
            <div className="action-grid">
              {[
                { icon: '📢', title: 'Send Alert',      desc: 'Broadcast emergency alert to all members', tab: 'alerts' },
                { icon: '📋', title: 'Review Reports',  desc: 'Process pending incident reports',          tab: 'reports' },
                { icon: '🚨', title: 'Help Requests',   desc: 'View and respond to emergency requests',    tab: 'help-requests' },
                { icon: '👥', title: 'Manage Members',  desc: 'View and manage community members',         tab: 'members' },
              ].map(a => (
                <button key={a.tab} className="action-card" onClick={() => setActiveTab(a.tab)}>
                  <div className="action-card__icon">{a.icon}</div>
                  <h4 className="action-card__title">{a.title}</h4>
                  <p className="action-card__desc">{a.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Incident Reports</h3>
            <div className="filter-tabs" style={{ marginBottom: 0 }}>
              {['All', 'Pending', 'Verified', 'Investigating', 'Rejected'].map(f => (
                <button key={f}
                  className={`filter-tab ${reportFilter === f ? 'filter-tab--active' : ''}`}
                  onClick={() => setReportFilter(f)}
                >{f}</button>
              ))}
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr key={report.id} className={report.status === 'rejected' ? 'admin-table-row--muted' : ''}>
                  <td>{report.reporter}</td>
                  <td>{report.type}</td>
                  <td>{report.location}</td>
                  <td>
                    <span className={`status-badge status-badge--${report.status}`}>{report.status}</span>
                  </td>
                  <td>{report.date}</td>
                  <td className="admin-table-actions">
                    <button className="btn-table-action" onClick={() => triggerPopup('view', report)}>
                      👁 View
                    </button>
                    {report.status !== 'verified' && report.status !== 'rejected' && (
                      <button className="btn-table-action btn-table-action--primary" onClick={() => handleVerify(report)}>
                        ✓ Verify
                      </button>
                    )}
                    {report.status !== 'rejected' && report.status !== 'verified' && (
                      <button className="btn-table-action btn-table-action--danger" onClick={() => handleReject(report)}>
                        ✕ Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Help Requests Tab */}
      {activeTab === 'help-requests' && (
        <div className="help-requests-list">
          {helpRequests.map(req => (
            <div key={req.id} className={`help-request-card help-request-card--${req.priority}`}>
              <div className="help-request-header">
                <div className="help-request-priority">{req.priority.toUpperCase()}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`status-badge status-badge--${req.status === 'open' ? 'pending' : 'verified'}`}>{req.status}</span>
                  <div className="help-request-time">{req.time}</div>
                </div>
              </div>
              <div className="help-request-body">
                <div className="help-request-icon">
                  {req.type === 'Medical' ? '🏥' : req.type === 'Fire' ? '🚒' : '🚁'}
                </div>
                <div className="help-request-info">
                  <h4>{req.name}</h4>
                  <p>📍 {req.location} · {req.type}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{req.description}</p>
                </div>
              </div>
              <div className="help-request-actions">
                {req.status === 'open' && (
                  <button className="btn btn--primary" onClick={() => handleRespond(req)}>✓ Respond</button>
                )}
                <button className="btn btn--secondary" onClick={() => triggerPopup('view', { ...req, reporter: req.name, date: req.time, status: req.status === 'open' ? 'pending' : 'assigned' })}>
                  👁 View Details
                </button>
                <button className="btn btn--secondary">👮 Assign Volunteer</button>
                <button className="btn btn--secondary">📞 Emergency Services</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Community Members</h3>
            <input
              type="search"
              placeholder="Search members..."
              className="form-input"
              style={{ maxWidth: '300px' }}
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
            />
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Location</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td><span className={`role-badge role-badge--${member.role}`}>{member.role}</span></td>
                  <td>{member.location}</td>
                  <td>{member.joined}</td>
                  <td><span className={`status-badge status-badge--${member.status === 'active' ? 'verified' : 'rejected'}`}>{member.status}</span></td>
                  <td className="admin-table-actions">
                    <button className="btn-table-action" onClick={() => triggerPopup('view', { type: `${member.role} Profile`, reporter: member.name, location: member.location, date: member.joined, status: member.status, description: `Member since ${member.joined}. Located in ${member.location}. Current role: ${member.role}. Account status: ${member.status}.` })}>
                      👁 View
                    </button>
                    <button className="btn-table-action btn-table-action--primary"
                      onClick={() => {
                        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: m.role === 'member' ? 'volunteer' : 'member' } : m));
                        triggerPopup('verify', { type: 'Role Updated', location: member.name });
                      }}
                    >↑ Promote</button>
                    <button className="btn-table-action btn-table-action--danger"
                      onClick={() => {
                        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' } : m));
                        triggerPopup(member.status === 'active' ? 'reject' : 'verify', { type: member.status === 'active' ? 'Member Suspended' : 'Member Reinstated', location: member.name });
                      }}
                    >
                      {member.status === 'active' ? '⏸ Suspend' : '▶ Reinstate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Send Alert Tab */}
      {activeTab === 'alerts' && (
        <div className="form-card">
          <h3 style={{ marginTop: 0 }}>📢 Send Emergency Alert</h3>
          <form className="report-form" onSubmit={handleSendAlert}>
            <div className="form-group">
              <label className="form-label">Alert Type *</label>
              <select className="form-input" value={alertForm.type} onChange={e => setAlertForm({ ...alertForm, type: e.target.value })}>
                <option>Weather Alert</option>
                <option>Fire Emergency</option>
                <option>Flood Warning</option>
                <option>Evacuation Notice</option>
                <option>General Emergency</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Alert Level *</label>
              <div className="filter-tabs">
                {['Info', 'Warning', 'Critical', 'Emergency'].map(lvl => (
                  <button key={lvl} type="button"
                    className={`filter-tab ${alertLevel === lvl ? 'filter-tab--active' : ''}`}
                    onClick={() => setAlertLevel(lvl)}
                  >{lvl}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Target Area *</label>
              <input type="text" className="form-input" placeholder="e.g., Ferndale, Randburg, or All Areas"
                value={alertForm.area} onChange={e => setAlertForm({ ...alertForm, area: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Alert Message *</label>
              <textarea className="form-textarea" rows="5" placeholder="Enter alert message..."
                value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Send To *</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[['all', 'All Members'], ['volunteers', 'Volunteers'], ['admins', 'Admins Only']].map(([key, label]) => (
                  <label key={key} className="setting-toggle">
                    <input type="checkbox" checked={alertForm.targets[key]}
                      onChange={e => setAlertForm({ ...alertForm, targets: { ...alertForm.targets, [key]: e.target.checked } })} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={alertSent}>
              {alertSent ? '✓ Alert Sent!' : '📢 Send Alert to Community'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
