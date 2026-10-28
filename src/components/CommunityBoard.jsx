import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { communityAPI } from '../lib/api';
import OffersNeeds from './OffersNeeds';
import Wellbeing from './Wellbeing';
import './PageStyles.css';

const CATEGORIES = ['Event', 'Solution', 'Campaign', 'Tip', 'Alert', 'Discussion'];
// 'Alert' is not offered when posting: warnings must go through incident reports,
// where a coordinator verifies them first. Older Alert posts still display.
const COMPOSE_CATEGORIES = CATEGORIES.filter(c => c !== 'Alert');
const REPORT_REASONS = ['False information', 'Abusive', 'Spam', 'Other'];
const catColor = {
  Event: '#1a5c63', Solution: '#457b9d', Campaign: '#e07b00',
  Tip: '#7b5ea7', Alert: '#dc2626', Discussion: '#0891b2'
};
const catIcon = {
  Event: '📅', Solution: '💡', Campaign: '📣',
  Tip: '🌿', Alert: '⚠️', Discussion: '💬'
};

function timeAgo(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function CommunityBoard() {
  const { user, isAdmin } = useAuth();
  const [view, setView] = useState('board'); // 'board' | 'aid'
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ totalMembers: 0, totalPosts: 0, activeMembers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [toast, setToast] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportingId, setReportingId] = useState(null);
  const postRef = useRef(null);

  useEffect(() => {
    loadData(true);
    const tick = setInterval(() => loadData(false), 8000);
    return () => clearInterval(tick);
  }, []);

  const loadData = async (showLoad = true) => {
    try {
      if (showLoad) setLoading(true);
      setError(null);
      const [postsResult, leaderboardResult, statsResult, reportsResult] = await Promise.all([
        communityAPI.getPosts(),
        communityAPI.getLeaderboard(),
        communityAPI.getStats(),
        communityAPI.listReports(),
      ]);

      if (reportsResult.success) setReports(reportsResult.data);

      console.log('Community data loaded:', { postsResult, leaderboardResult, statsResult });

      if (postsResult.success) {
        setPosts(postsResult.data);
      } else {
        console.error('Failed to load posts:', postsResult.error);
      }
      
      if (leaderboardResult.success) {
        setLeaderboard(leaderboardResult.data);
      } else {
        console.error('Failed to load leaderboard:', leaderboardResult.error);
      }
      
      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        console.error('Failed to load stats:', statsResult.error);
      }

      // If all three failed, show error
      if (!postsResult.success && !leaderboardResult.success && !statsResult.success) {
        setError(postsResult.error || "We couldn't load the community feed. Check your connection and try again.");
      }
    } catch (error) {
      console.error('Error loading community data:', error);
      setError(error.message);
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  const handleSetPinned = async (postId, pinned) => {
    const result = await communityAPI.setPinned(postId, pinned);
    if (!result.success) {
      showToast(result.error || 'Could not update pin', 'error');
      return;
    }
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, pinned } : p)));
    showToast(pinned ? 'Pinned' : 'Unpinned');
  };
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    try {
      const result = await communityAPI.createPost({
        content: newPost.trim(),
        category: selectedTag || 'Discussion',
      });

      if (result.success) {
        setPosts(prev => [result.data, ...prev]);
        setNewPost('');
        setSelectedTag('');
        showToast('Your post is live! 🎉');
        // Reload stats
        const statsResult = await communityAPI.getStats();
        if (statsResult.success) setStats(statsResult.data);
      } else {
        showToast('Failed to post. Try again.', 'error');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('Error creating post', 'error');
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await communityAPI.toggleLike(postId);
      
      if (result.success) {
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { 
                ...p, 
                likes_count: result.liked ? p.likes_count + 1 : p.likes_count - 1, 
                likedByUser: result.liked 
              }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment[postId]?.trim()) return;
    
    try {
      const result = await communityAPI.addComment(postId, newComment[postId].trim());
      
      if (result.success) {
        setPosts(prev => prev.map(p => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: [...p.comments, result.data],
            comments_count: p.comments_count + 1,
          };
        }));
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        showToast('Comment added!');
      } else {
        showToast('Failed to add comment', 'error');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Error adding comment', 'error');
    }
  };

  const handleShare = async (post) => {
    const url = `${window.location.origin}/community#post-${post.id}`;
    const text = `${post.author?.name || 'A community member'} on EcoKubatana: ${post.content}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'EcoKubatana Community Board', text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      showToast('Link copied! 🔗');
    } catch (error) {
      // AbortError = the user closed the share sheet; nothing to report
      if (error?.name !== 'AbortError') showToast('Could not share this post', 'error');
    }
  };

  const handleReport = async (postId, reason) => {
    setReportingId(null);
    const result = await communityAPI.reportPost(postId, reason);
    if (!result.success) {
      showToast(result.error || 'Could not report this post', 'error');
      return;
    }
    setReports(prev => [...prev, { post_id: postId, reporter_id: user?.id, reason }]);
    showToast('Thanks. A coordinator will review this post.');
  };

  const handleSetHidden = async (postId, hidden) => {
    const result = await communityAPI.setHidden(postId, hidden);
    if (!result.success) {
      showToast(result.error || 'Could not update this post', 'error');
      return;
    }
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, hidden } : p)));
    showToast(hidden ? 'Post hidden' : 'Post visible again');
  };

  const openEventPost = (postId) => {
    setActiveFilter('All');
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  // Hidden posts (reported 3+ times, or hidden by an admin) stay visible to admins only
  const visiblePosts = isAdmin ? posts : posts.filter(p => !p.hidden);
  const reportCount = (postId) => reports.filter(r => r.post_id === postId).length;
  const reportedByMe = (postId) => reports.some(r => r.post_id === postId && r.reporter_id === user?.id);
  const filterCategories = visiblePosts.some(p => p.category === 'Alert') ? CATEGORIES : COMPOSE_CATEGORIES;
  const eventPosts = visiblePosts.filter(p => p.category === 'Event' && !p.hidden).slice(0, 4);

  const filteredPosts = activeFilter === 'All'
    ? visiblePosts
    : visiblePosts.filter(p => p.category === activeFilter);

  const pinnedPosts = filteredPosts.filter(p => p.pinned);
  const regularPosts = filteredPosts.filter(p => !p.pinned);
  const sortedPosts = [...pinnedPosts, ...regularPosts];

  if (loading) {
    return (
      <div className="page">
        <div className="ui-state" role="status">
          <div className="ui-spinner" aria-hidden="true" />
          <p className="ui-state__text">Loading the community board…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="ui-state ui-state--boxed ui-state--error" role="alert">
          <div className="ui-state__icon" aria-hidden="true">⚠️</div>
          <h3 className="ui-state__title">We couldn't load the community board</h3>
          <p className="ui-state__text">We couldn't load the community feed. Check your connection and try again.</p>
          <button className="btn btn--secondary" onClick={loadData}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Toast notification */}
      {toast && (
        <div className={`cb-toast cb-toast--${toast.type}`}>{toast.msg}</div>
      )}

      <div className="page__header">
        <div>
          <h1 className="page__title">Community board</h1>
          <p className="page__sub">Share, support, and wellbeing in one place</p>
        </div>
        <div className="page__actions">
          <div className="cb-live-badge">
            <span className="cb-live-dot" />
            Live
          </div>
        </div>
      </div>

      {/* Board / Offers & Needs switch */}
      <div className="cb-view-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={view === 'board'}
          className={`cb-view-tab ${view === 'board' ? 'cb-view-tab--active' : ''}`}
          onClick={() => setView('board')}
        >💬 Board</button>
        <button type="button" role="tab" aria-selected={view === 'aid'}
          className={`cb-view-tab ${view === 'aid' ? 'cb-view-tab--active' : ''}`}
          onClick={() => setView('aid')}
        >🤝 Offers &amp; Needs</button>
      </div>

      {view === 'aid' ? <OffersNeeds showToast={showToast} /> : (
      <>
      {/* Category filter bar */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === 'All' ? 'filter-tab--active' : ''}`}
          onClick={() => setActiveFilter('All')}
        >All ({visiblePosts.length})</button>
        {filterCategories.map(cat => (
          <button key={cat}
            className={`filter-tab ${activeFilter === cat ? 'filter-tab--active' : ''}`}
            style={activeFilter === cat ? { background: catColor[cat], borderColor: catColor[cat], color: 'white' } : {}}
            onClick={() => setActiveFilter(activeFilter === cat ? 'All' : cat)}
          >{catIcon[cat]} {cat}</button>
        ))}
      </div>

      <div className="community-layout">
        {/* ── Main Feed ──────────────────────────────────────── */}
        <div className="community-main">
          {/* Compose Box */}
          <div className="card cb-compose-box">
            <div className="cb-compose-header">
              <div className="cb-compose-avatar">{(user?.name || 'Y')[0].toUpperCase()}</div>
              <textarea
                ref={postRef}
                className="cb-compose-input"
                placeholder={`What's happening in your community, ${user?.name?.split(' ')[0] || 'friend'}?`}
                rows={3}
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handlePost(); }}
              />
            </div>
            <div className="cb-compose-footer">
              <div className="cb-compose-tags">
                {COMPOSE_CATEGORIES.map(tag => (
                  <button key={tag}
                    className={`cb-tag ${selectedTag === tag ? 'cb-tag--selected' : ''}`}
                    style={selectedTag === tag
                      ? { background: catColor[tag], color: 'white', borderColor: catColor[tag] }
                      : { borderColor: catColor[tag], color: 'var(--text-primary)' }
                    }
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  >{catIcon[tag]} {tag}</button>
                ))}
              </div>
              <button
                className="btn btn--primary cb-post-btn"
                disabled={!newPost.trim()}
                onClick={handlePost}
              >Post →</button>
            </div>
            {newPost.trim() && (
              <p className="cb-compose-hint">Press Ctrl+Enter to post quickly</p>
            )}
            <p className="cb-compose-hint">
              Seen danger, like a flood or fire? <Link to="/report">Report an incident</Link> instead. A coordinator checks it before anyone is warned.
            </p>
          </div>

          {/* Posts Feed */}
          {sortedPosts.length === 0 && (
            <div className="ui-state ui-state--boxed">
              <div className="ui-state__icon" aria-hidden="true">🌱</div>
              <h3 className="ui-state__title">No posts here yet</h3>
              <p className="ui-state__text">Nothing has been posted in this category. Be the first to share something.</p>
            </div>
          )}
          {sortedPosts.map(post => (
            <div key={post.id} id={`post-${post.id}`} className={`cb-post-card ${post.pinned ? 'cb-post-card--pinned' : ''} ${post.hidden ? 'cb-post-card--hidden' : ''}`}>
              {post.pinned && <div className="cb-pinned-badge">📌 Pinned</div>}
              {isAdmin && (post.hidden || reportCount(post.id) > 0) && (
                <div className="cb-moderation-note">
                  {post.hidden ? '🙈 Hidden from members' : '👁 Visible'}
                  {reportCount(post.id) > 0 && ` · 🚩 ${reportCount(post.id)} ${reportCount(post.id) === 1 ? 'report' : 'reports'}`}
                </div>
              )}
              {/* Post Header */}
              <div className="cb-post-header">
                    <div className="cb-avatar" style={{ background: catColor[post.category] || 'var(--primary-dark)' }}>
                  {(post.author?.name || 'U')[0].toUpperCase()}
                </div>
                <div className="cb-post-meta">
                  <div className="cb-post-author">
                    {post.author?.name || 'Community Member'}
                    {post.verified && <span className="cb-verified-badge">✓</span>}
                  </div>
                  <div className="cb-post-location">
                    {post.author?.location && <>📍 {post.author.location} · </>}🕐 {timeAgo(post.created_at)}
                  </div>
                </div>
                <span className="cb-category-pill"
                  style={{ background: catColor[post.category] + '20', color: 'var(--text-primary)', borderColor: catColor[post.category] }}
                >{catIcon[post.category]} {post.category}</span>
              </div>

              {/* Post Content */}
              <p className="cb-post-content">{post.content}</p>

              {/* Post Actions */}
              <div className="cb-post-actions">
                <button
                  className={`cb-action-btn ${post.likedByUser ? 'cb-action-btn--liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  {post.likedByUser ? '❤️' : '🤍'} {post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}
                </button>
                <button className="cb-action-btn" onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}>
                  💬 {post.comments_count} {post.comments_count === 1 ? 'Comment' : 'Comments'}
                </button>
                <button className="cb-action-btn" onClick={() => handleShare(post)}>
                  🔗 Share
                </button>
                {post.author_id !== user?.id && (
                  reportedByMe(post.id) ? (
                    <span className="cb-action-btn cb-action-btn--muted">🚩 Reported</span>
                  ) : (
                    <button className="cb-action-btn" onClick={() => setReportingId(reportingId === post.id ? null : post.id)}>
                      🚩 Report
                    </button>
                  )
                )}
                {isAdmin && (
                  <>
                    <button className="cb-action-btn" onClick={() => handleSetPinned(post.id, !post.pinned)}>
                      {post.pinned ? '📌 Unpin' : '📌 Pin'}
                    </button>
                    <button className={post.hidden ? 'btn btn--secondary btn--small' : 'btn btn--danger btn--small'} onClick={() => handleSetHidden(post.id, !post.hidden)}>
                      {post.hidden ? '👁 Unhide' : '🙈 Hide'}
                    </button>
                  </>
                )}
              </div>

              {reportingId === post.id && (
                <div className="cb-report-menu">
                  <span>Why are you reporting this post?</span>
                  {REPORT_REASONS.map(reason => (
                    <button key={reason} type="button" className="chip" onClick={() => handleReport(post.id, reason)}>{reason}</button>
                  ))}
                  <button type="button" className="btn btn--secondary btn--small" onClick={() => setReportingId(null)}>Cancel</button>
                </div>
              )}

              {/* Comments */}
              {expandedComments[post.id] && (
                <div className="cb-comments-section">
                  {(post.comments || []).map(c => (
                    <div key={c.id} className="cb-comment">
                      <div className="cb-comment-avatar" style={{ background: 'var(--primary-dark)' }}>
                        {(c.author?.name || 'U')[0].toUpperCase()}
                      </div>
                      <div className="cb-comment-body">
                        <div className="cb-comment-meta">
                          <span className="cb-comment-author">{c.author?.name || 'Anonymous'}</span>
                          <span className="cb-comment-time">{timeAgo(c.created_at)}</span>
                        </div>
                        <p className="cb-comment-text">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="cb-comment-input-row">
                    <div className="cb-comment-avatar" style={{ background: 'var(--primary-green)' }}>
                      {(user?.name || 'Y')[0].toUpperCase()}
                    </div>
                    <input
                      className="cb-comment-input"
                      placeholder="Add a comment…"
                      value={newComment[post.id] || ''}
                      onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <button className="btn btn--primary btn--small" onClick={() => handleAddComment(post.id)}>Send</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="leaderboard-sidebar">
          {/* Upcoming Events */}
          <div className="cb-sidebar-card">
            <h3 className="cb-sidebar-title">📅 Community events</h3>
            <div className="cb-events-list">
              {eventPosts.length === 0 && (
                <p className="cb-event-date">No events yet. Post one with the 📅 Event tag, like a clean-up or a drill.</p>
              )}
              {eventPosts.map(ev => (
                <div key={ev.id} className="cb-event-item">
                  <div className="cb-event-dot" style={{ background: catColor.Event }} />
                  <div className="cb-event-info">
                    <div className="cb-event-name">{ev.content.length > 70 ? `${ev.content.slice(0, 70)}…` : ev.content}</div>
                    <div className="cb-event-date">{ev.author?.name || 'Community member'} · {timeAgo(ev.created_at)}</div>
                  </div>
                  <button
                    className="btn btn--secondary btn--small"
                    onClick={() => openEventPost(ev.id)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <h3>🏆 Top contributors</h3>
              <button className="leaderboard-toggle" aria-label={showLeaderboard ? 'Hide top contributors' : 'Show top contributors'} aria-expanded={showLeaderboard} onClick={() => setShowLeaderboard(!showLeaderboard)}>
                {showLeaderboard ? '−' : '+'}
              </button>
            </div>
            {showLeaderboard && leaderboard.length === 0 && (
              <div className="ui-state">
                <p className="ui-state__text">No contributors yet. Post, comment or like to appear here.</p>
              </div>
            )}
            {showLeaderboard && leaderboard.map(m => (
              <div key={m.rank} className={`leaderboard-item ${m.medalClass}`}>
                <div className="leaderboard-rank">{m.badge}</div>
                <div className="leaderboard-avatar">{(m.name || 'U')[0].toUpperCase()}</div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">{m.name}</div>
                  <div className="leaderboard-stats">{m.points} pts · {m.posts} posts</div>
                </div>
              </div>
            ))}
          </div>
        

          {/* Community Stats */}
          <div className="stats-card">
            <h4>📊 Community stats</h4>
            <div className="stat-row"><span>Total posts</span><strong>{stats.totalPosts || 0}</strong></div>
            <div className="stat-row"><span>Total members</span><strong>{stats.totalMembers || 0}</strong></div>
            <div className="stat-row"><span>Active members</span><strong>{stats.activeMembers || 0}</strong></div>
            <div className="stat-row"><span>Total likes</span><strong>{posts.reduce((s, p) => s + (p.likes_count || 0), 0)}</strong></div>
          </div>
        </aside>
      </div>
      <Wellbeing />
      </>
      )}
    </div>
  );
}
