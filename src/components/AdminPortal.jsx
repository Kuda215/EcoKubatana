import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { alertsAPI, faqsAPI, videosAPI, helpRequestsAPI, incidentsAPI, adminStatsAPI } from '../lib/api';

function formatRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
import './PageStyles.css';

export default function AdminPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [popup, setPopup] = useState(null); // { type: 'verify'|'reject'|'view', data: {} }
  const [popupVisible, setPopupVisible] = useState(false);
  const [reports, setReports] = useState([]);
  const [memberCounts, setMemberCounts] = useState({ totalMembers: 0, totalVolunteers: 0 });
  const [members, setMembers] = useState([
    { id: 1, name: 'David Lee',     role: 'member',    location: 'Ferndale',   joined: '2026-08-08', status: 'active' },
    { id: 2, name: 'Emma White',    role: 'volunteer', location: 'Randburg',   joined: '2026-08-07', status: 'active' },
    { id: 3, name: 'Frank Miller',  role: 'member',    location: 'Cresta',     joined: '2026-08-07', status: 'active' },
    { id: 4, name: 'Grace Taylor',  role: 'volunteer', location: 'Northcliff', joined: '2026-08-06', status: 'suspended' },
    { id: 5, name: 'Hector Moyo',   role: 'member',    location: 'Ferndale',   joined: '2026-08-04', status: 'active' },
  ]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [publishedAlerts, setPublishedAlerts] = useState([]);
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [reportFilter, setReportFilter] = useState('All');
  const [faqs, setFaqs] = useState([]);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' });
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [editFaqForm, setEditFaqForm] = useState({ question: '', answer: '' });
  const emptyVideoForm = { title: '', youtube_url: '', category: '', duration: '', emoji: '🎥' };
  const [videos, setVideos] = useState([]);
  const [videoForm, setVideoForm] = useState(emptyVideoForm);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editVideoForm, setEditVideoForm] = useState(emptyVideoForm);

  const loadAlerts = () => {
    if (user?.role !== 'admin') return;
    alertsAPI.list()
      .then(result => { if (result.success) setPublishedAlerts(result.data); })
      .catch(err => console.error('Failed to load published alerts:', err));
    alertsAPI.list({ status: 'pending' })
      .then(result => { if (result.success) setPendingAlerts(result.data); })
      .catch(err => console.error('Failed to load pending alerts:', err));
  };

  useEffect(loadAlerts, [user?.role]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    faqsAPI.list()
      .then(result => { if (result.success) setFaqs(result.data); })
      .catch(err => console.error('Failed to load FAQs:', err));
    videosAPI.list()
      .then(result => { if (result.success) setVideos(result.data); })
      .catch(err => console.error('Failed to load videos:', err));
    helpRequestsAPI.list()
      .then(result => { if (result.success) setHelpRequests(result.data); })
      .catch(err => console.error('Failed to load help requests:', err));
    incidentsAPI.list()
      .then(result => { if (result.success) setReports(result.data); })
      .catch(err => console.error('Failed to load incidents:', err));
    adminStatsAPI.getMemberCounts()
      .then(result => { if (result.success) setMemberCounts(result.data); })
      .catch(err => console.error('Failed to load member counts:', err));
  }, [user?.role]);

  const stats = {
    totalMembers: memberCounts.totalMembers,
    totalVolunteers: memberCounts.totalVolunteers,
    activeIncidents: reports.filter(r => r.status === 'pending' || r.status === 'investigating').length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    alertsSent: publishedAlerts.length,
    pendingAlerts: pendingAlerts.length,
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

  const handleVerify = async (report) => {
    try {
      const result = await incidentsAPI.verify(report.id);
      if (!result.success) {
        triggerPopup('reject', { type: 'Update Failed', location: result.error || 'Please try again' });
        return;
      }
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, ...result.data } : r));
      triggerPopup('verify', { ...report, reporter: report.reporter_name || 'Anonymous' });
    } catch (error) {
      console.error('Failed to verify incident:', error);
      triggerPopup('reject', { type: 'Update Failed', location: 'Please try again' });
    }
  };

  const handleReject = async (report) => {
    try {
      const result = await incidentsAPI.reject(report.id);
      if (!result.success) {
        triggerPopup('reject', { type: 'Update Failed', location: result.error || 'Please try again' });
        return;
      }
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, ...result.data } : r));
      triggerPopup('reject', { ...report, reporter: report.reporter_name || 'Anonymous' });
    } catch (error) {
      console.error('Failed to reject incident:', error);
      triggerPopup('reject', { type: 'Update Failed', location: 'Please try again' });
    }
  };

  const handleRespond = async (req) => {
    try {
      const result = await helpRequestsAPI.respond(req.id);
      if (!result.success) {
        triggerPopup('reject', { type: 'Update Failed', location: result.error || 'Please try again' });
        return;
      }
      setHelpRequests(prev => prev.map(r => r.id === req.id ? result.data : r));
      triggerPopup('verify', { type: `${req.type} Response Assigned`, location: req.location });
    } catch (error) {
      console.error('Failed to respond to help request:', error);
      triggerPopup('reject', { type: 'Update Failed', location: 'Please try again' });
    }
  };

  const handleResolveHelp = async (req) => {
    try {
      const result = await helpRequestsAPI.resolve(req.id);
      if (!result.success) {
        triggerPopup('reject', { type: 'Update Failed', location: result.error || 'Please try again' });
        return;
      }
      setHelpRequests(prev => prev.map(r => r.id === req.id ? result.data : r));
      triggerPopup('verify', { type: `${req.type} Request Resolved`, location: req.location });
    } catch (error) {
      console.error('Failed to resolve help request:', error);
      triggerPopup('reject', { type: 'Update Failed', location: 'Please try again' });
    }
  };

  const handlePublishAlert = async (alert) => {
    try {
      const result = await alertsAPI.publish(alert.id);
      if (!result.success) {
        triggerPopup('reject', { type: 'Publish Failed', location: result.error || 'Please try again' });
        return;
      }

      setPendingAlerts(prev => prev.filter(a => a.id !== alert.id));
      setPublishedAlerts(prev => [result.data, ...prev]);
      const channelSummaries = [
        result.smsResults && `📱 SMS ${result.smsResults.sent}/${result.smsResults.total}`,
        result.whatsappResults && `💬 WhatsApp ${result.whatsappResults.sent}/${result.whatsappResults.total}`,
      ].filter(Boolean).join(' · ');
      triggerPopup('verify', {
        type: 'Alert Published!',
        location: [alert.area || 'All Areas', channelSummaries].filter(Boolean).join(' · '),
      });
    } catch (error) {
      console.error('Failed to publish alert:', error);
      triggerPopup('reject', { type: 'Publish Failed', location: 'Please try again' });
    }
  };

  const handleRejectAlert = async (alert) => {
    try {
      const result = await alertsAPI.reject(alert.id);
      if (!result.success) {
        triggerPopup('reject', { type: 'Reject Failed', location: result.error || 'Please try again' });
        return;
      }

      setPendingAlerts(prev => prev.filter(a => a.id !== alert.id));
      triggerPopup('reject', { type: 'Alert Rejected', location: alert.area || 'All Areas' });
    } catch (error) {
      console.error('Failed to reject alert:', error);
      triggerPopup('reject', { type: 'Reject Failed', location: 'Please try again' });
    }
  };

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    try {
      const result = await faqsAPI.create({
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        display_order: faqs.length,
      });
      if (!result.success) {
        triggerPopup('reject', { type: 'FAQ Save Failed', location: result.error || 'Please try again' });
        return;
      }
      setFaqs(prev => [...prev, result.data]);
      setFaqForm({ question: '', answer: '' });
      triggerPopup('verify', { type: 'FAQ Added', location: result.data.question });
    } catch (error) {
      console.error('Failed to add FAQ:', error);
      triggerPopup('reject', { type: 'FAQ Save Failed', location: 'Please try again' });
    }
  };

  const startEditFaq = (faq) => {
    setEditingFaqId(faq.id);
    setEditFaqForm({ question: faq.question, answer: faq.answer });
  };

  const handleSaveFaqEdit = async (id) => {
    if (!editFaqForm.question.trim() || !editFaqForm.answer.trim()) return;
    try {
      const result = await faqsAPI.update(id, {
        question: editFaqForm.question.trim(),
        answer: editFaqForm.answer.trim(),
      });
      if (!result.success) {
        triggerPopup('reject', { type: 'FAQ Save Failed', location: result.error || 'Please try again' });
        return;
      }
      setFaqs(prev => prev.map(f => f.id === id ? result.data : f));
      setEditingFaqId(null);
      triggerPopup('verify', { type: 'FAQ Updated', location: result.data.question });
    } catch (error) {
      console.error('Failed to update FAQ:', error);
      triggerPopup('reject', { type: 'FAQ Save Failed', location: 'Please try again' });
    }
  };

  const handleDeleteFaq = async (faq) => {
    try {
      const result = await faqsAPI.remove(faq.id);
      if (!result.success) {
        triggerPopup('reject', { type: 'Delete Failed', location: result.error || 'Please try again' });
        return;
      }
      setFaqs(prev => prev.filter(f => f.id !== faq.id));
      triggerPopup('reject', { type: 'FAQ Deleted', location: faq.question });
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      triggerPopup('reject', { type: 'Delete Failed', location: 'Please try again' });
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.youtube_url.trim()) return;
    try {
      const result = await videosAPI.create({
        title: videoForm.title.trim(),
        youtube_url: videoForm.youtube_url.trim(),
        category: videoForm.category.trim() || 'General',
        duration: videoForm.duration.trim(),
        emoji: videoForm.emoji.trim() || '🎥',
        display_order: videos.length,
      });
      if (!result.success) {
        triggerPopup('reject', { type: 'Video Save Failed', location: result.error || 'Please try again' });
        return;
      }
      setVideos(prev => [...prev, result.data]);
      setVideoForm(emptyVideoForm);
      triggerPopup('verify', { type: 'Video Added', location: result.data.title });
    } catch (error) {
      console.error('Failed to add video:', error);
      triggerPopup('reject', { type: 'Video Save Failed', location: 'Please try again' });
    }
  };

  const startEditVideo = (video) => {
    setEditingVideoId(video.id);
    setEditVideoForm({
      title: video.title,
      youtube_url: video.youtube_url,
      category: video.category,
      duration: video.duration,
      emoji: video.emoji,
    });
  };

  const handleSaveVideoEdit = async (id) => {
    if (!editVideoForm.title.trim() || !editVideoForm.youtube_url.trim()) return;
    try {
      const result = await videosAPI.update(id, {
        title: editVideoForm.title.trim(),
        youtube_url: editVideoForm.youtube_url.trim(),
        category: editVideoForm.category.trim() || 'General',
        duration: editVideoForm.duration.trim(),
        emoji: editVideoForm.emoji.trim() || '🎥',
      });
      if (!result.success) {
        triggerPopup('reject', { type: 'Video Save Failed', location: result.error || 'Please try again' });
        return;
      }
      setVideos(prev => prev.map(v => v.id === id ? result.data : v));
      setEditingVideoId(null);
      triggerPopup('verify', { type: 'Video Updated', location: result.data.title });
    } catch (error) {
      console.error('Failed to update video:', error);
      triggerPopup('reject', { type: 'Video Save Failed', location: 'Please try again' });
    }
  };

  const handleDeleteVideo = async (video) => {
    try {
      const result = await videosAPI.remove(video.id);
      if (!result.success) {
        triggerPopup('reject', { type: 'Delete Failed', location: result.error || 'Please try again' });
        return;
      }
      setVideos(prev => prev.filter(v => v.id !== video.id));
      triggerPopup('reject', { type: 'Video Deleted', location: video.title });
    } catch (error) {
      console.error('Failed to delete video:', error);
      triggerPopup('reject', { type: 'Delete Failed', location: 'Please try again' });
    }
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
        {['overview', 'reports', 'help-requests', 'members', 'alerts', 'faqs', 'videos'].map(tab => (
          <button key={tab}
            className={`filter-tab ${activeTab === tab ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'reports' && `Reports ${stats.pendingReports > 0 ? `(${stats.pendingReports})` : ''}`}
            {tab === 'help-requests' && `Help Requests ${stats.helpRequests > 0 ? `(${stats.helpRequests})` : ''}`}
            {tab === 'members' && 'Members'}
            {tab === 'alerts' && `Pending Alerts ${stats.pendingAlerts > 0 ? `(${stats.pendingAlerts})` : ''}`}
            {tab === 'faqs' && 'FAQs'}
            {tab === 'videos' && 'Videos'}
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
              { icon: '📝', value: stats.pendingAlerts,                label: 'Pending Alerts',       bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
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
                { icon: '📢', title: 'Review Alerts',   desc: 'Approve or reject pending community alerts', tab: 'alerts' },
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
                  <td>{report.reporter_name || 'Anonymous'}</td>
                  <td>{report.type}</td>
                  <td>{report.location}</td>
                  <td>
                    <span className={`status-badge status-badge--${report.status}`}>{report.status}</span>
                  </td>
                  <td>{report.date}</td>
                  <td className="admin-table-actions">
                    <button className="btn-table-action" onClick={() => triggerPopup('view', { ...report, reporter: report.reporter_name || 'Anonymous' })}>
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
          {helpRequests.length === 0 && (
            <div className="cb-empty">No help requests yet. 🌿</div>
          )}
          {helpRequests.map(req => (
            <div key={req.id} className={`help-request-card help-request-card--${req.priority}`}>
              <div className="help-request-header">
                <div className="help-request-priority">{req.priority.toUpperCase()}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`status-badge status-badge--${req.status === 'open' ? 'pending' : req.status === 'assigned' ? 'investigating' : 'verified'}`}>{req.status}</span>
                  <div className="help-request-time">{formatRelativeTime(req.created_at)}</div>
                </div>
              </div>
              <div className="help-request-body">
                <div className="help-request-icon">
                  {req.type === 'Medical' ? '🏥' : req.type === 'Fire' ? '🚒' : '🚁'}
                </div>
                <div className="help-request-info">
                  <h4>{req.profiles?.name || 'Unknown user'}</h4>
                  <p>📍 {req.location} · {req.type}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{req.description}</p>
                </div>
              </div>
              <div className="help-request-actions">
                {req.status === 'open' && (
                  <button className="btn btn--primary" onClick={() => handleRespond(req)}>✓ Respond</button>
                )}
                {req.status === 'assigned' && (
                  <button className="btn btn--primary" onClick={() => handleResolveHelp(req)}>✅ Mark Resolved</button>
                )}
                {req.profiles?.phone && (
                  <a className="btn btn--secondary" href={`tel:${req.profiles.phone}`}>📞 Call {req.profiles.name}</a>
                )}
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

      {/* Pending Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Pending Alerts</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Anyone can propose an alert from the Alerts page — publishing here sends it live and triggers SMS/WhatsApp.
            </p>
          </div>
          {pendingAlerts.length === 0 && (
            <div className="cb-empty">No pending alerts to review. 🌿</div>
          )}
          {pendingAlerts.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Level</th>
                  <th>Area</th>
                  <th>Message</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAlerts.map(alert => (
                  <tr key={alert.id}>
                    <td>{alert.type}</td>
                    <td><span className={`status-badge status-badge--${alert.level === 'Emergency' || alert.level === 'Critical' ? 'pending' : 'investigating'}`}>{alert.level}</span></td>
                    <td>{alert.area || 'All Areas'}</td>
                    <td style={{ maxWidth: '320px' }}>{alert.message}</td>
                    <td className="admin-table-actions">
                      <button className="btn-table-action btn-table-action--primary" onClick={() => handlePublishAlert(alert)}>
                        ✓ Publish
                      </button>
                      <button className="btn-table-action btn-table-action--danger" onClick={() => handleRejectAlert(alert)}>
                        ✕ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Manage FAQs</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Shown on the AI Knowledge Hub page's FAQ list.
            </p>
          </div>

          <form onSubmit={handleAddFaq} className="form-card" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Question *</label>
              <input type="text" className="form-input" placeholder="e.g., How do I report a climate incident?"
                value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Answer *</label>
              <textarea className="form-textarea" rows="3" placeholder="Enter the answer..."
                value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} />
            </div>
            <button type="submit" className="btn btn--primary" disabled={!faqForm.question.trim() || !faqForm.answer.trim()}>
              + Add FAQ
            </button>
          </form>

          {faqs.length === 0 && (
            <div className="cb-empty">No FAQs yet — add one above. 🌿</div>
          )}
          {faqs.map(faq => (
            <div key={faq.id} className="card" style={{ marginBottom: '12px' }}>
              {editingFaqId === faq.id ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Question *</label>
                    <input type="text" className="form-input"
                      value={editFaqForm.question} onChange={e => setEditFaqForm({ ...editFaqForm, question: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Answer *</label>
                    <textarea className="form-textarea" rows="3"
                      value={editFaqForm.answer} onChange={e => setEditFaqForm({ ...editFaqForm, answer: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn--primary" onClick={() => handleSaveFaqEdit(faq.id)}>Save</button>
                    <button className="btn btn--secondary" onClick={() => setEditingFaqId(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, color: '#0a3d2e' }}>Q: {faq.question}</div>
                  <p style={{ margin: '8px 0', color: '#6b7280' }}>A: {faq.answer}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-table-action" onClick={() => startEditFaq(faq)}>✏ Edit</button>
                    <button className="btn-table-action btn-table-action--danger" onClick={() => handleDeleteFaq(faq)}>✕ Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Manage Videos</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Shown on the AI Knowledge Hub page's Video Learning tab. Paste any standard YouTube URL.
            </p>
          </div>

          <form onSubmit={handleAddVideo} className="form-card" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-input" placeholder="e.g., Understanding Climate Change"
                value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">YouTube URL *</label>
              <input type="text" className="form-input" placeholder="https://www.youtube.com/watch?v=..."
                value={videoForm.youtube_url} onChange={e => setVideoForm({ ...videoForm, youtube_url: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Category</label>
                <input type="text" className="form-input" placeholder="e.g., Water"
                  value={videoForm.category} onChange={e => setVideoForm({ ...videoForm, category: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Duration</label>
                <input type="text" className="form-input" placeholder="e.g., 8:45"
                  value={videoForm.duration} onChange={e => setVideoForm({ ...videoForm, duration: e.target.value })} />
              </div>
              <div className="form-group" style={{ width: '80px' }}>
                <label className="form-label">Emoji</label>
                <input type="text" className="form-input"
                  value={videoForm.emoji} onChange={e => setVideoForm({ ...videoForm, emoji: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn--primary" disabled={!videoForm.title.trim() || !videoForm.youtube_url.trim()}>
              + Add Video
            </button>
          </form>

          {videos.length === 0 && (
            <div className="cb-empty">No videos yet — add one above. 🌿</div>
          )}
          {videos.map(video => (
            <div key={video.id} className="card" style={{ marginBottom: '12px' }}>
              {editingVideoId === video.id ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input type="text" className="form-input"
                      value={editVideoForm.title} onChange={e => setEditVideoForm({ ...editVideoForm, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">YouTube URL *</label>
                    <input type="text" className="form-input"
                      value={editVideoForm.youtube_url} onChange={e => setEditVideoForm({ ...editVideoForm, youtube_url: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Category</label>
                      <input type="text" className="form-input"
                        value={editVideoForm.category} onChange={e => setEditVideoForm({ ...editVideoForm, category: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Duration</label>
                      <input type="text" className="form-input"
                        value={editVideoForm.duration} onChange={e => setEditVideoForm({ ...editVideoForm, duration: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ width: '80px' }}>
                      <label className="form-label">Emoji</label>
                      <input type="text" className="form-input"
                        value={editVideoForm.emoji} onChange={e => setEditVideoForm({ ...editVideoForm, emoji: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn--primary" onClick={() => handleSaveVideoEdit(video.id)}>Save</button>
                    <button className="btn btn--secondary" onClick={() => setEditingVideoId(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, color: '#0a3d2e' }}>{video.emoji} {video.title}</div>
                  <p style={{ margin: '8px 0', color: '#6b7280' }}>{video.category} · {video.duration} · {video.youtube_url}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-table-action" onClick={() => startEditVideo(video)}>✏ Edit</button>
                    <button className="btn-table-action btn-table-action--danger" onClick={() => handleDeleteVideo(video)}>✕ Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
