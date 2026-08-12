import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

const INITIAL_POSTS = [
  {
    id: 1, author: 'Thandiwe M.', avatar: 'T', area: 'Nkulu Village', time: '2h ago',
    category: 'Event', verified: true,
    content: 'Rainwater harvesting training this Saturday 9am at the Community Hall. Bring your household water needs discussion.',
    likes: 24, likedByUser: false, pinned: true,
    images: [],
    comments: [
      { id: 1, author: 'John D.', avatar: 'J', content: 'This is great! Will definitely attend.', time: '1h ago', likes: 3 },
      { id: 2, author: 'Sarah K.', avatar: 'S', content: 'Can we bring kids along?', time: '30m ago', likes: 1 }
    ]
  },
  {
    id: 2, author: 'Dumisani K.', avatar: 'D', area: 'Zava Village', time: '4h ago',
    category: 'Solution', verified: true,
    content: 'We built fenced garden beds to prevent soil erosion during heavy rain. I can share the plans with anyone interested! The design uses repurposed timber and costs under R200.',
    likes: 41, likedByUser: false, pinned: false,
    images: [],
    comments: [
      { id: 1, author: 'Mike T.', avatar: 'M', content: 'Would love to see the plans!', time: '2h ago', likes: 5 },
      { id: 2, author: 'Alice M.', avatar: 'A', content: 'How much did it cost?', time: '1h ago', likes: 2 }
    ]
  },
  {
    id: 3, author: 'Miriam C.', avatar: 'M', area: 'All Areas', time: '1d ago',
    category: 'Campaign', verified: false,
    content: 'Community clean-up campaign next weekend. Let\'s clear drainage channels before the rainy season. Who is joining? 🙋 We need at least 30 volunteers!',
    likes: 63, likedByUser: false, pinned: false,
    images: [],
    comments: [
      { id: 1, author: 'David L.', avatar: 'D', content: 'Count me in! I can bring my team.', time: '12h ago', likes: 8 },
      { id: 2, author: 'Emma W.', avatar: 'E', content: 'What time does it start?', time: '8h ago', likes: 2 },
      { id: 3, author: 'Frank M.', avatar: 'F', content: 'I can bring tools and a trailer.', time: '6h ago', likes: 4 }
    ]
  },
  {
    id: 4, author: 'Joseph N.', avatar: 'J', area: 'Chakoma Area', time: '2d ago',
    category: 'Tip', verified: true,
    content: '🌱 Tip: Plant vetiver grass along slopes to reduce runoff. It\'s cheap, grows fast and saves your soil! Also great for stabilizing riverbanks.',
    likes: 37, likedByUser: false, pinned: false,
    images: [],
    comments: [
      { id: 1, author: 'Grace T.', avatar: 'G', content: 'Where can I get the seeds?', time: '1d ago', likes: 6 }
    ]
  },
  {
    id: 5, author: 'EcoKubatana Team', avatar: 'E', area: 'All Areas', time: '3d ago',
    category: 'Alert', verified: true,
    content: '⚠️ WEATHER ALERT: Heavy rainfall expected this weekend across all zones. Please clear gutters, check drainage, and prepare emergency kits. Stay safe, community!',
    likes: 89, likedByUser: false, pinned: false,
    images: [],
    comments: [
      { id: 1, author: 'Linda B.', avatar: 'L', content: 'Thanks for the heads up!', time: '2d ago', likes: 12 },
      { id: 2, author: 'Tom R.', avatar: 'T', content: 'Will do! Please keep us updated.', time: '2d ago', likes: 7 }
    ]
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Miriam C.',   avatar: 'M', points: 276, posts: 18, badge: '🏆', medalClass: 'medal--gold' },
  { rank: 2, name: 'Dumisani K.', avatar: 'D', points: 241, posts: 15, badge: '🥈', medalClass: 'medal--silver' },
  { rank: 3, name: 'Thandiwe M.', avatar: 'T', points: 198, posts: 12, badge: '🥉', medalClass: 'medal--bronze' },
  { rank: 4, name: 'Joseph N.',   avatar: 'J', points: 156, posts: 10, badge: '⭐', medalClass: '' },
  { rank: 5, name: 'Sarah K.',    avatar: 'S', points: 132, posts: 9,  badge: '⭐', medalClass: '' },
];

const ACTIVE_EVENTS = [
  { id: 1, title: 'Rainwater Training', date: 'Sat 16 Aug', spots: 12, registered: 8, color: '#2d6a4f' },
  { id: 2, title: 'Drainage Clean-up',  date: 'Sun 17 Aug', spots: 30, registered: 21, color: '#e07b00' },
  { id: 3, title: 'Tree Planting Day',  date: 'Sat 23 Aug', spots: 20, registered: 5, color: '#10b981' },
];

function timeAgo(date) {
  const diff = Date.now() - date;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export default function CommunityBoard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [toast, setToast] = useState(null);
  const [events, setEvents] = useState(ACTIVE_EVENTS);
  const postRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      author: user?.name || 'Community Member',
      avatar: (user?.name || 'C')[0].toUpperCase(),
      area: user?.location || 'Your Area',
      time: 'Just now',
      createdAt: Date.now(),
      category: selectedTag || 'Discussion',
      verified: false,
      content: newPost.trim(),
      likes: 0,
      likedByUser: false,
      pinned: false,
      images: [],
      comments: []
    };
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setSelectedTag('');
    showToast('Your post is live! 🎉');
  };

  const handleLike = (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes: p.likedByUser ? p.likes - 1 : p.likes + 1, likedByUser: !p.likedByUser }
        : p
    ));
  };

  const handleAddComment = (postId) => {
    if (!newComment[postId]?.trim()) return;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [...p.comments, {
          id: Date.now(),
          author: user?.name || 'Anonymous',
          avatar: (user?.name || 'A')[0].toUpperCase(),
          content: newComment[postId].trim(),
          time: 'Just now',
          likes: 0
        }]
      };
    }));
    setNewComment(prev => ({ ...prev, [postId]: '' }));
    showToast('Comment added!');
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
                  {post.avatar}
                </div>
                <div className="cb-post-meta">
                  <div className="cb-post-author">
                    {post.author}
                    {post.verified && <span className="cb-verified-badge">✓</span>}
                  </div>
                  <div className="cb-post-location">📍 {post.area} · 🕐 {post.time}</div>
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
                  {post.likedByUser ? '❤️' : '🤍'} {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
                </button>
                <button className="cb-action-btn" onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}>
                  💬 {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                </button>
                <button className="cb-action-btn" onClick={() => showToast('Link copied! 🔗')}>
                  🔗 Share
                </button>
              </div>

              {/* Comments */}
              {expandedComments[post.id] && (
                <div className="cb-comments-section">
                  {post.comments.map(c => (
                    <div key={c.id} className="cb-comment">
                      <div className="cb-comment-avatar" style={{ background: '#10b981' }}>{c.avatar}</div>
                      <div className="cb-comment-body">
                        <div className="cb-comment-meta">
                          <span className="cb-comment-author">{c.author}</span>
                          <span className="cb-comment-time">{c.time}</span>
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
            {showLeaderboard && (
              <div className="leaderboard-list">
                {LEADERBOARD.map(m => (
                  <div key={m.rank} className={`leaderboard-item ${m.medalClass}`}>
                    <div className="leaderboard-rank">{m.badge}</div>
                    <div className="leaderboard-avatar">{m.avatar}</div>
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
            <div className="stat-row"><span>Total Posts</span><strong>{posts.length + 137}</strong></div>
            <div className="stat-row"><span>Active Members</span><strong>2,345</strong></div>
            <div className="stat-row"><span>This Week</span><strong>+{posts.filter(p => p.createdAt).length + 28} posts</strong></div>
            <div className="stat-row"><span>Total Likes</span><strong>{posts.reduce((s, p) => s + p.likes, 0) + 412}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  );
}


const initialPosts = [
  { 
    id: 1, 
    author: 'Thandiwe M.', 
    avatar: 'T', 
    area: 'Nkulu Village', 
    time: '2h ago', 
    category: 'Event',    
    content: 'Rainwater harvesting training this Saturday 9am at the Community Hall. Bring your household water needs discussion.', 
    likes: 24, 
    likedByUser: false,
    comments: [
      { id: 1, author: 'John D.', content: 'This is great! Will definitely attend.', time: '1h ago' },
      { id: 2, author: 'Sarah K.', content: 'Can we bring kids along?', time: '30m ago' }
    ]
  },
  { 
    id: 2, 
    author: 'Dumisani K.', 
    avatar: 'D', 
    area: 'Zava Village',   
    time: '4h ago', 
    category: 'Solution', 
    content: 'We built fenced garden beds to prevent soil erosion during heavy rain. I can share the plans with anyone interested!', 
    likes: 41, 
    likedByUser: false,
    comments: [
      { id: 1, author: 'Mike T.', content: 'Would love to see the plans!', time: '2h ago' },
      { id: 2, author: 'Alice M.', content: 'How much did it cost?', time: '1h ago' }
    ]
  },
  { 
    id: 3, 
    author: 'Miriam C.',   
    avatar: 'M', 
    area: 'All Areas',      
    time: '1d ago', 
    category: 'Campaign', 
    content: 'Community clean-up campaign next weekend. Let\'s clear drainage channels before the rainy season. Who is joining? 🙋', 
    likes: 63, 
    likedByUser: false,
    comments: [
      { id: 1, author: 'David L.', content: 'Count me in!', time: '12h ago' },
      { id: 2, author: 'Emma W.', content: 'What time does it start?', time: '8h ago' },
      { id: 3, author: 'Frank M.', content: 'I can bring tools', time: '6h ago' }
    ]
  },
  { 
    id: 4, 
    author: 'Joseph N.',   
    avatar: 'J', 
    area: 'Chakoma Area',   
    time: '2d ago', 
    category: 'Tip',      
    content: 'Tip: Plant vetiver grass along slopes to reduce runoff. It\'s cheap, grows fast and saves your soil!', 
    likes: 37, 
    likedByUser: false,
    comments: [
      { id: 1, author: 'Grace T.', content: 'Where can I get the seeds?', time: '1d ago' }
    ]
  },
];

const leaderboard = [
  { rank: 1, name: 'Miriam C.', avatar: 'M', points: 276, posts: 18, badge: '🏆', medalClass: 'medal--gold' },
  { rank: 2, name: 'Dumisani K.', avatar: 'D', points: 241, posts: 15, badge: '🥈', medalClass: 'medal--silver' },
  { rank: 3, name: 'Thandiwe M.', avatar: 'T', points: 198, posts: 12, badge: '🥉', medalClass: 'medal--bronze' },
  { rank: 4, name: 'Joseph N.', avatar: 'J', points: 156, posts: 10, badge: '⭐', medalClass: '' },
  { rank: 5, name: 'Sarah K.', avatar: 'S', points: 132, posts: 9, badge: '⭐', medalClass: '' },
];
