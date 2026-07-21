import { useState } from 'react';
import './PageStyles.css';

const posts = [
  { id: 1, author: 'Thandiwe M.', avatar: 'T', area: 'Nkulu Village', time: '2h ago', category: 'Event',    content: 'Rainwater harvesting training this Saturday 9am at the Community Hall. Bring your household water needs discussion.', likes: 24, comments: 8 },
  { id: 2, author: 'Dumisani K.', avatar: 'D', area: 'Zava Village',   time: '4h ago', category: 'Solution', content: 'We built fenced garden beds to prevent soil erosion during heavy rain. I can share the plans with anyone interested!', likes: 41, comments: 12 },
  { id: 3, author: 'Miriam C.',   avatar: 'M', area: 'All Areas',      time: '1d ago', category: 'Campaign', content: 'Community clean-up campaign next weekend. Let\'s clear drainage channels before the rainy season. Who is joining? 🙋', likes: 63, comments: 19 },
  { id: 4, author: 'Joseph N.',   avatar: 'J', area: 'Chakoma Area',   time: '2d ago', category: 'Tip',      content: 'Tip: Plant vetiver grass along slopes to reduce runoff. It\'s cheap, grows fast and saves your soil!', likes: 37, comments: 6 },
];

const catColor = { Event: '#2d6a4f', Solution: '#457b9d', Campaign: '#e07b00', Tip: '#7b5ea7' };

export default function CommunityBoard() {
  const [newPost, setNewPost] = useState('');

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">👥 Community Board</h1>
          <p className="page__sub">Share updates, solutions, and connect with your community.</p>
        </div>
      </div>

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
              <button className="action-btn">👍 {p.likes}</button>
              <button className="action-btn">💬 {p.comments} Comments</button>
              <button className="action-btn">🔗 Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
