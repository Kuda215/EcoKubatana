import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './PageStyles.css';

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
  { rank: 1, name: 'Miriam C.', avatar: 'M', points: 276, posts: 18, badge: '🏆' },
  { rank: 2, name: 'Dumisani K.', avatar: 'D', points: 241, posts: 15, badge: '🥈' },
  { rank: 3, name: 'Thandiwe M.', avatar: 'T', points: 198, posts: 12, badge: '🥉' },
  { rank: 4, name: 'Joseph N.', avatar: 'J', points: 156, posts: 10, badge: '⭐' },
  { rank: 5, name: 'Sarah K.', avatar: 'S', points: 132, posts: 9, badge: '⭐' },
];

const catColor = { Event: '#2d6a4f', Solution: '#457b9d', Campaign: '#e07b00', Tip: '#7b5ea7' };

export default function CommunityBoard() {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(initialPosts);
  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
          likedByUser: !post.likedByUser
        };
      }
      return post;
    }));
  };

  const toggleComments = (postId) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  };

  const handleAddComment = (postId) => {
    if (!newComment[postId]?.trim()) return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: post.comments.length + 1,
              author: user?.name || 'Anonymous',
              content: newComment[postId],
              time: 'Just now'
            }
          ]
        };
      }
      return post;
    }));
    
    setNewComment({ ...newComment, [postId]: '' });
  };

  return (
    <div className="page">
      <div className="community-layout">
        {/* Main Content */}
        <div className="community-main">
          {/* Post Box */}
          <div className="card post-box">
            <h3 className="card__title">Share with your community</h3>
            <textarea
              className="form-textarea"
              placeholder="Share a climate tip, experience, or community update..."
              rows={3}
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
            />
            <div className="post-box__footer">
              <div className="post-box__tags">
                {['Event', 'Solution', 'Campaign', 'Tip'].map(tag => (
                  <button key={tag} className="tag-btn" style={{ borderColor: catColor[tag], color: catColor[tag] }}>{tag}</button>
                ))}
              </div>
              <button className="btn btn--primary" disabled={!newPost.trim()}>Post Update</button>
            </div>
          </div>

          {/* Posts */}
          <div className="post-list">
            {posts.map(p => (
              <div key={p.id} className="post-card">
                <div className="post-card__top">
                  <div className="update-avatar" style={{ background: '#2d6a4f' }}>{p.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div className="post-author">{p.author}</div>
                    <div className="post-meta">📍 {p.area} · 🕐 {p.time}</div>
                  </div>
                  <span className="post-category" style={{ background: catColor[p.category] + '18', color: catColor[p.category] }}>{p.category}</span>
                </div>
                <p className="post-content">{p.content}</p>
                <div className="post-actions">
                  <button 
                    className={`action-btn ${p.likedByUser ? 'action-btn--liked' : ''}`}
                    onClick={() => handleLike(p.id)}
                  >
                    {p.likedByUser ? '❤️' : '👍'} {p.likes}
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => toggleComments(p.id)}
                  >
                    💬 {p.comments.length} Comments
                  </button>
                  <button className="action-btn">🔗 Share</button>
                </div>

                {/* Comments Section */}
                {expandedComments[p.id] && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {p.comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-avatar">{comment.author[0]}</div>
                          <div className="comment-body">
                            <div className="comment-header">
                              <span className="comment-author">{comment.author}</span>
                              <span className="comment-time">{comment.time}</span>
                            </div>
                            <p className="comment-content">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="comment-input-box">
                      <input
                        type="text"
                        className="comment-input"
                        placeholder="Write a comment..."
                        value={newComment[p.id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [p.id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(p.id)}
                      />
                      <button 
                        className="btn btn--primary btn--small"
                        onClick={() => handleAddComment(p.id)}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <aside className="leaderboard-sidebar">
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <h3>🏆 Top Contributors</h3>
              <button 
                className="leaderboard-toggle"
                onClick={() => setShowLeaderboard(!showLeaderboard)}
              >
                {showLeaderboard ? '−' : '+'}
              </button>
            </div>
            {showLeaderboard && (
              <div className="leaderboard-list">
                {leaderboard.map(member => (
                  <div key={member.rank} className={`leaderboard-item ${member.rank <= 3 ? 'leaderboard-item--top' : ''}`}>
                    <div className="leaderboard-rank">{member.badge}</div>
                    <div className="leaderboard-avatar">{member.avatar}</div>
                    <div className="leaderboard-info">
                      <div className="leaderboard-name">{member.name}</div>
                      <div className="leaderboard-stats">{member.points} pts · {member.posts} posts</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="stats-card">
            <h4>📊 Community Stats</h4>
            <div className="stat-row">
              <span>Total Posts</span>
              <strong>142</strong>
            </div>
            <div className="stat-row">
              <span>Active Members</span>
              <strong>2,345</strong>
            </div>
            <div className="stat-row">
              <span>This Week</span>
              <strong>+28 posts</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
