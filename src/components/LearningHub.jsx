import './PageStyles.css';

const videos = [
  { title: 'Introduction to Climate Resilience', views: '1.5k', date: '1 month ago', thumb: '🌍', duration: '5:32' },
  { title: 'Flood Preparedness Tips',            views: '4.4k', date: '2 months ago', thumb: '🌧️', duration: '8:14' },
  { title: 'Sustainable Farming Practices',      views: '3.2k', date: '3 months ago', thumb: '🌾', duration: '11:05' },
  { title: 'Community Emergency Plans',          views: '2.0k', date: '3 months ago', thumb: '📋', duration: '6:48' },
];

const articles = [
  { title: 'Understanding Climate Change and Its Impacts', time: '2 days ago', read: '5 min read' },
  { title: 'Food Preparedness Guide',                      time: '3 days ago', read: '3 min read' },
  { title: 'Drought Resistant Garden Tips',                time: '1 week ago', read: '4 min read' },
  { title: 'How to Create a Community Emergency Plan',     time: '1 week ago', read: '6 min read' },
  { title: 'Water Conservation Strategies',                time: '2 weeks ago', read: '3 min read' },
  { title: 'Water Conservation Strategies (Advanced)',     time: '2 weeks ago', read: '5 min read' },
];

export default function LearningHub() {
  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">📚 Learning Hub</h1>
          <p className="page__sub">Build your knowledge on climate resilience and community preparedness.</p>
        </div>
        <div className="search-bar">
          <input className="form-input" placeholder="🔍 Search topics…" style={{ width: '200px' }} />
        </div>
      </div>

      {/* Topic Filters */}
      <div className="filter-tabs">
        {['All Topics', 'Floods', 'Drought', 'Health', 'Farming', 'Emergency', 'Mental Health'].map(t => (
          <button key={t} className={`filter-tab ${t === 'All Topics' ? 'filter-tab--active' : ''}`}>{t}</button>
        ))}
      </div>

      {/* Videos Section */}
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">📹 Video Guides</h3>
          <button className="card__link">View All Videos →</button>
        </div>
        <div className="video-grid">
          {videos.map(v => (
            <div key={v.title} className="video-card">
              <div className="video-thumb">
                <span className="video-thumb__emoji">{v.thumb}</span>
                <span className="video-play">▶</span>
                <span className="video-duration">{v.duration}</span>
              </div>
              <div className="video-info">
                <p className="video-title">{v.title}</p>
                <span className="video-meta">{v.views} views · {v.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Articles Section */}
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">📰 Latest Articles &amp; Guides</h3>
          <button className="card__link">View All Articles →</button>
        </div>
        <div className="article-grid">
          {articles.map(a => (
            <div key={a.title} className="article-card">
              <div className="article-icon">📄</div>
              <div>
                <p className="article-title">{a.title}</p>
                <span className="article-meta">{a.time} · {a.read}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
