import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './PageStyles.css';

export default function AdminPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for admin portal
  const stats = {
    totalMembers: 2345,
    totalVolunteers: 127,
    activeIncidents: 12,
    pendingReports: 8,
    alertsSent: 45,
    helpRequests: 3
  };

  const recentReports = [
    { id: 1, reporter: 'John Doe', type: 'Flooding', location: 'Ferndale', status: 'pending', date: '2026-08-08' },
    { id: 2, reporter: 'Jane Smith', type: 'Fire', location: 'Randburg', status: 'verified', date: '2026-08-07' },
    { id: 3, reporter: 'Mike Johnson', type: 'Storm Damage', location: 'Northcliff', status: 'pending', date: '2026-08-07' },
    { id: 4, reporter: 'Sarah Williams', type: 'Drought', location: 'Cresta', status: 'investigating', date: '2026-08-06' },
  ];

  const helpRequests = [
    { id: 1, name: 'Alice Brown', location: 'Ferndale', type: 'Medical', priority: 'high', time: '10 mins ago' },
    { id: 2, name: 'Bob Wilson', location: 'Randburg', type: 'Fire', priority: 'critical', time: '25 mins ago' },
    { id: 3, name: 'Carol Davis', location: 'Northcliff', type: 'Rescue', priority: 'medium', time: '1 hour ago' },
  ];

  const recentMembers = [
    { id: 1, name: 'David Lee', role: 'member', location: 'Ferndale', joined: '2026-08-08' },
    { id: 2, name: 'Emma White', role: 'volunteer', location: 'Randburg', joined: '2026-08-07' },
    { id: 3, name: 'Frank Miller', role: 'member', location: 'Cresta', joined: '2026-08-07' },
    { id: 4, name: 'Grace Taylor', role: 'volunteer', location: 'Northcliff', joined: '2026-08-06' },
  ];

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
      <div className="page__header">
        <div>
          <h1 className="page__title">⚙️ Admin Portal</h1>
          <p className="page__sub">Manage platform, review reports, and coordinate responses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeTab === 'overview' ? 'filter-tab--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`filter-tab ${activeTab === 'reports' ? 'filter-tab--active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
        <button
          className={`filter-tab ${activeTab === 'help-requests' ? 'filter-tab--active' : ''}`}
          onClick={() => setActiveTab('help-requests')}
        >
          Help Requests
        </button>
        <button
          className={`filter-tab ${activeTab === 'members' ? 'filter-tab--active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button
          className={`filter-tab ${activeTab === 'alerts' ? 'filter-tab--active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Send Alert
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="admin-overview">
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}>👥</div>
              <div className="admin-stat-info">
                <div className="admin-stat-value">{stats.totalMembers.toLocaleString()}</div>
                <div className="admin-stat-label">Total Members</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }}>🤝</div>
              <div className="admin-stat-info">
                <div className="admin-stat-value">{stats.totalVolunteers}</div>
                <div className="admin-stat-label">Volunteers</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #fde8e8 0%, #ffd1d1 100%)' }}>⚠️</div>
              <div className="admin-stat-info">
                <div className="admin-stat-value">{stats.activeIncidents}</div>
                <div className="admin-stat-label">Active Incidents</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)' }}>📋</div>
              <div className="admin-stat-info">
                <div className="admin-stat-value">{stats.pendingReports}</div>
                <div className="admin-stat-label">Pending Reports</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #e8fff8 0%, #d1fae5 100%)' }}>📢</div>
              <div className="admin-stat-info">
                <div className="admin-stat-value">{stats.alertsSent}</div>
                <div className="admin-stat-label">Alerts Sent</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #fff8f0 0%, #fde8e8 100%)' }}>🚨</div>
              <div className="admin-stat-info">
                <div className="admin-stat-value">{stats.helpRequests}</div>
                <div className="admin-stat-label">Active Help Requests</div>
              </div>
            </div>
          </div>

          <div className="admin-quick-actions">
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0a3d2e', marginBottom: '16px' }}>Quick Actions</h3>
            <div className="action-grid">
              <button className="action-card" onClick={() => setActiveTab('alerts')}>
                <div className="action-card__icon">📢</div>
                <h4 className="action-card__title">Send Alert</h4>
                <p className="action-card__desc">Broadcast emergency alert to all members</p>
              </button>
              <button className="action-card" onClick={() => setActiveTab('reports')}>
                <div className="action-card__icon">📋</div>
                <h4 className="action-card__title">Review Reports</h4>
                <p className="action-card__desc">Process pending incident reports</p>
              </button>
              <button className="action-card" onClick={() => setActiveTab('help-requests')}>
                <div className="action-card__icon">🚨</div>
                <h4 className="action-card__title">Help Requests</h4>
                <p className="action-card__desc">View and respond to emergency requests</p>
              </button>
              <button className="action-card" onClick={() => setActiveTab('members')}>
                <div className="action-card__icon">👥</div>
                <h4 className="action-card__title">Manage Members</h4>
                <p className="action-card__desc">View and manage community members</p>
              </button>
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
              <button className="filter-tab filter-tab--active">All</button>
              <button className="filter-tab">Pending</button>
              <button className="filter-tab">Verified</button>
              <button className="filter-tab">Investigating</button>
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
              {recentReports.map(report => (
                <tr key={report.id}>
                  <td>{report.reporter}</td>
                  <td>{report.type}</td>
                  <td>{report.location}</td>
                  <td>
                    <span className={`status-badge status-badge--${report.status}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>{report.date}</td>
                  <td>
                    <button className="btn-table-action">View</button>
                    <button className="btn-table-action btn-table-action--primary">Verify</button>
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
          {helpRequests.map(request => (
            <div key={request.id} className={`help-request-card help-request-card--${request.priority}`}>
              <div className="help-request-header">
                <div className="help-request-priority">{request.priority}</div>
                <div className="help-request-time">{request.time}</div>
              </div>
              <div className="help-request-body">
                <div className="help-request-icon">
                  {request.type === 'Medical' && '🏥'}
                  {request.type === 'Fire' && '🚒'}
                  {request.type === 'Rescue' && '🚁'}
                </div>
                <div className="help-request-info">
                  <h4>{request.name}</h4>
                  <p>📍 {request.location}</p>
                  <p>Type: {request.type}</p>
                </div>
              </div>
              <div className="help-request-actions">
                <button className="btn btn--primary">Respond</button>
                <button className="btn btn--secondary">Assign Volunteer</button>
                <button className="btn btn--secondary">Call Emergency Services</button>
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
            />
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Location</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>
                    <span className={`role-badge role-badge--${member.role}`}>
                      {member.role}
                    </span>
                  </td>
                  <td>{member.location}</td>
                  <td>{member.joined}</td>
                  <td>
                    <button className="btn-table-action">View</button>
                    <button className="btn-table-action">Edit</button>
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
          <h3 style={{ marginTop: 0 }}>Send Emergency Alert</h3>
          <form className="report-form">
            <div className="form-group">
              <label className="form-label">Alert Type *</label>
              <select className="form-input">
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
                <button type="button" className="filter-tab">Info</button>
                <button type="button" className="filter-tab">Warning</button>
                <button type="button" className="filter-tab filter-tab--active">Critical</button>
                <button type="button" className="filter-tab">Emergency</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Target Area *</label>
              <input type="text" className="form-input" placeholder="e.g., Ferndale, Randburg, or All Areas" />
            </div>
            <div className="form-group">
              <label className="form-label">Alert Message *</label>
              <textarea className="form-textarea" rows="5" placeholder="Enter alert message..."></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Send To *</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <label className="setting-toggle">
                  <input type="checkbox" defaultChecked />
                  <span>All Members</span>
                </label>
                <label className="setting-toggle">
                  <input type="checkbox" defaultChecked />
                  <span>Volunteers</span>
                </label>
                <label className="setting-toggle">
                  <input type="checkbox" />
                  <span>Admins Only</span>
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>
              📢 Send Alert to Community
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
