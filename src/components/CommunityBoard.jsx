import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { communityAPI } from '../lib/api';
import './PageStyles.css';

const CATEGORIES = ['Event', 'Solution', 'Campaign', 'Tip', 'Alert', 'Discussion'];
const catColor = {
  Event: '#2d6a4f', Solution: '#457b9d', Campaign: '#e07b00',
  Tip: '#7b5ea7', Alert: '#dc2626', Discussion: '#0891b2'
};
const catIcon = {
  Event: '📅', Solution: '💡', Campaign: '📣',
  Tip: '🌿', Alert: '⚠️', Discussion: '💬'
};

const ACTIVE_EVENTS = [
  { id: 1, title: 'Rainwater Training', date: 'Sat 16 Aug', spots: 12, registered: 8, color: '#2d6a4f' },
  { id: 2, title: 'Drainage Clean-up',  date: 'Sun 17 Aug', spots: 30, registered: 21, color: '#e07b00' },
  { id: 3, title: 'Tree Planting Day',  date: 'Sat 23 Aug', spots: 20, registered: 5, color: '#10b981' },
];

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
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ totalMembers: 0, totalPosts: 0, activeMembers: 0 });
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [toast, setToast] = useState(null);
  const [events, setEvents] = useState(ACTIVE_EVENTS);
  const postRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsResult, leaderboardResult, statsResult] = await Promise.all([
        communityAPI.getPosts(),
        communityAPI.getLeaderboard(),
        communityAPI.getStats(),
      ]);

      if (postsResult.success) setPosts(postsResult.data);
      if (leaderboardResult.success) setLeaderboard(leaderboardResult.data);
      if (statsResult.success) setStats(statsResult.data);
    } catch (error) {
      console.error('Error loading community data:', error);
      showToast('Error loading data. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };
  const [newComment, setNewComment] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [toast, setToast] = useState(null);
  const [events, setEvents] = useState(ACTIVE_EVENTS);
  const postRef = useRef(null);

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

  const handleRegisterEvent = (eventId) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, registered: Math.min(e.registered + 1, e.spots) } : e
    ));
    showToast('You\'re registered! 🙌');
  };

  const filteredPosts = activeFilter === 'All'
    ? posts
    : posts.filter(p => p.category === activeFilter);

  const pinnedPosts = filteredPosts.filter(p => p.pinned);
  const regularPosts = filteredPosts.filter(p => !p.pinned);
  const sortedPosts = [...pinnedPosts, ...regularPosts];

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading community board...</p>
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
          <h1 className="page__title">🌍 Community Board</h1>
          <p className="page__sub">Share, connect, and build a resilient community together</p>
        </div>
        <div className="cb-live-badge">
          <span className="cb-live-dot" />
          LIVE
        </div>
      </div>

      {/* Category filter bar */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === 'All' ? 'filter-tab--active' : ''}`}
          onClick={() => setActiveFilter('All')}
        >All ({posts.length})</button>
        {CATEGORIES.map(cat => (
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
                {CATEGORIES.map(tag => (
                  <button key={tag}
                    className={`cb-tag ${selectedTag === tag ? 'cb-tag--selected' : ''}`}
                    style={selectedTag === tag
                      ? { background: catColor[tag], color: 'white', borderColor: catColor[tag] }
                      : { borderColor: catColor[tag], color: catColor[tag] }
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
          </div>

          {/* Posts Feed */}
          {sortedPosts.length === 0 && (
            <div className="cb-empty">No posts in this category yet. Be the first! 🌱</div>
          )}
          {sortedPosts.map(post => (
            <div key={post.id} className={`cb-post-card ${post.pinned ? 'cb-post-card--pinned' : ''}`}>
              {post.pinned && <div className="cb-pinned-badge">📌 Pinned</div>}
              {/* Post Header */}
              <div className="cb-post-header">
                <div className="cb-avatar" style={{ background: catColor[post.category] || '#2d6a4f' }}>
                  {(post.author?.name || 'U')[0].toUpperCase()}
                </div>
                <div className="cb-post-meta">
                  <div className="cb-post-author">
                    {post.author?.name || 'Community Member'}
                    {post.verified && <span className="cb-verified-badge">✓</span>}
                  </div>
                  <div className="cb-post-location">📍 {user?.location || 'EcoKubatana'} · 🕐 {timeAgo(post.created_at)}</div>
                </div>
                <span className="cb-category-pill"
                  style={{ background: catColor[post.category] + '20', color: catColor[post.category], borderColor: catColor[post.category] + '40' }}
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
                <button className="cb-action-btn" onClick={() => showToast('Link copied! 🔗')}>
                  🔗 Share
                </button>
              </div>

              {/* Comments */}
              {expandedComments[post.id] && (
                <div className="cb-comments-section">
                  {(post.comments || []).map(c => (
                    <div key={c.id} className="cb-comment">
                      <div className="cb-comment-avatar" style={{ background: '#10b981' }}>
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
                    <div className="cb-comment-avatar" style={{ background: '#0a3d2e' }}>
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
            <h3 className="cb-sidebar-title">📅 Upcoming Events</h3>
            <div className="cb-events-list">
              {events.map(ev => {
                const pct = Math.round((ev.registered / ev.spots) * 100);
                return (
                  <div key={ev.id} className="cb-event-item">
                    <div className="cb-event-dot" style={{ background: ev.color }} />
                    <div className="cb-event-info">
                      <div className="cb-event-name">{ev.title}</div>
                      <div className="cb-event-date">{ev.date}</div>
                      <div className="cb-event-progress-wrap">
                        <div className="cb-event-progress-bar">
                          <div className="cb-event-progress-fill" style={{ width: `${pct}%`, background: ev.color }} />
                        </div>
                        <span className="cb-event-spots">{ev.registered}/{ev.spots}</span>
                      </div>
                    </div>
                    <button
                      className="cb-event-btn"
                      style={{ borderColor: ev.color, color: ev.color }}
                      onClick={() => handleRegisterEvent(ev.id)}
                      disabled={ev.registered >= ev.spots}
                    >
                      {ev.registered >= ev.spots ? 'Full' : 'Join'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <h3>🏆 Top Contributors</h3>
              <button className="leaderboard-toggle" onClick={() => setShowLeaderboard(!showLeaderboard)}>
                {showLeaderboard ? '−' : '+'}
              </button>
            </div>
            {showleaderboard.map(m => (
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
            )}
          </div>

          {/* Community Stats */}
          <div className="stats-card">
            <h4>📊 Community Stats</h4>
            <div className="stat-row"><span>Total Posts</span><strong>{stats.totalPosts || 0}</strong></div>
            <div className="stat-row"><span>Total Members</span><strong>{stats.totalMembers || 0}</strong></div>
            <div className="stat-row"><span>Active Members</span><strong>{stats.activeMembers || 0}</strong></div>
            <div className="stat-row"><span>Total Likes</span><strong>{posts.reduce((s, p) => s + (p.likes_count || 0), 0)}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
