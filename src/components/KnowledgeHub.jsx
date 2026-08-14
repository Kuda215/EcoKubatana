import { useState } from 'react';
import './PageStyles.css';

const videoContent = [
  { 
    id: 1, 
    title: 'What Causes Floods?', 
    emoji: '🌊', 
    duration: '8:24', 
    category: 'Floods',
    url: 'https://www.youtube.com/watch?v=yIUNr0H0I88',
    thumbnail: 'https://img.youtube.com/vi/yIUNr0H0I88/maxresdefault.jpg'
  },
  { 
    id: 2, 
    title: 'Climate Change Explained', 
    emoji: '🌍', 
    duration: '10:15', 
    category: 'Climate',
    url: 'https://www.youtube.com/watch?v=F8vI5_gN90g',
    thumbnail: 'https://img.youtube.com/vi/F8vI5_gN90g/maxresdefault.jpg'
  },
  { 
    id: 3, 
    title: 'Understanding Extreme Weather', 
    emoji: '⛈️', 
    duration: '12:45', 
    category: 'Weather',
    url: 'https://www.youtube.com/watch?v=eeISzbk9SeE',
    thumbnail: 'https://img.youtube.com/vi/eeISzbk9SeE/maxresdefault.jpg'
  },
  { 
    id: 4, 
    title: 'Water Conservation at Home', 
    emoji: '💧', 
    duration: '9:30', 
    category: 'Water',
    url: 'https://www.youtube.com/watch?v=eVdTkQ8_bk4',
    thumbnail: 'https://img.youtube.com/vi/eVdTkQ8_bk4/maxresdefault.jpg'
  },
  { 
    id: 5, 
    title: 'Disaster Preparedness Guide', 
    emoji: '🚨', 
    duration: '14:20', 
    category: 'Safety',
    url: 'https://www.youtube.com/watch?v=VMF4tDaJJXo',
    thumbnail: 'https://img.youtube.com/vi/VMF4tDaJJXo/maxresdefault.jpg'
  },
  { 
    id: 6, 
    title: 'Building Climate Resilience', 
    emoji: '🏘️', 
    duration: '11:05', 
    category: 'Community',
    url: 'https://www.youtube.com/watch?v=Q7iF_o16tcE',
    thumbnail: 'https://img.youtube.com/vi/Q7iF_o16tcE/maxresdefault.jpg'
  },
];

const faqs = [
  { q: 'What is climate change?', a: 'Climate change refers to long-term shifts in temperatures and weather patterns, primarily caused by human activities.' },
  { q: 'How can I reduce my water usage?', a: 'Fix leaks, use water-efficient fixtures, harvest rainwater, and be mindful of daily consumption.' },
  { q: 'What crops grow well in drought conditions?', a: 'Drought-resistant crops include sorghum, millet, cassava, and certain varieties of beans.' },
  { q: 'How do I report a climate incident?', a: 'Use the "Report Incident" feature in the navigation menu to submit detailed information.' },
  { q: 'Can I get AI help for climate questions?', a: 'Yes! Our AI assistant can answer your questions about climate adaptation, mitigation, and local solutions.' },
];

const resources = [
  { icon: '📋', cat: 'GUIDES', title: 'Household Preparedness Checklist', desc: 'Essential items and steps for climate emergencies' },
  { icon: '🌧️', cat: 'WATER', title: 'Rainwater Harvesting Guide', desc: 'Build your own water collection system' },
  { icon: '🌱', cat: 'AGRICULTURE', title: 'Climate-Smart Farming', desc: 'Techniques for sustainable food production' },
  { icon: '⚡', cat: 'ENERGY', title: 'Renewable Energy Options', desc: 'Solar, wind, and biogas for your community' },
  { icon: '🌳', cat: 'ENVIRONMENT', title: 'Tree Planting Guide', desc: 'Best practices for reforestation' },
  { icon: '📞', cat: 'EMERGENCY', title: 'Emergency Contacts', desc: 'Important numbers for climate emergencies' },
];

export default function KnowledgeHub() {
  const [activeTab, setActiveTab] = useState('learning');
  const [aiMessage, setAiMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Floods', 'Climate', 'Weather', 'Water', 'Safety', 'Community'];

  return (
    <div className="page">
      <div className="page__header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page__title">🤖 AI Knowledge Hub</h1>
          <p className="page__sub">AI-powered learning, resources, and expert guidance</p>
        </div>
        
        {/* Search and Filters in Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end', width: '100%', maxWidth: '500px' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text"
              className="form-input" 
              placeholder="🔍 Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 16px 10px 40px',
                borderRadius: '8px',
                fontSize: '14px',
                border: '2px solid #e5e7eb'
              }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
          </div>

          {/* Category Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="filter-tab"
                style={{
                  padding: '6px 16px',
                  borderRadius: '16px',
                  border: selectedCategory === cat ? '2px solid #667eea' : '2px solid #e5e7eb',
                  background: selectedCategory === cat ? '#667eea' : 'white',
                  color: selectedCategory === cat ? 'white' : '#6b7280',
                  fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="knowledge-tabs">
        <button 
          className={`knowledge-tab ${activeTab === 'learning' ? 'knowledge-tab--active' : ''}`}
          onClick={() => setActiveTab('learning')}
        >
          🎥 Video Learning
        </button>
        <button 
          className={`knowledge-tab ${activeTab === 'ai' ? 'knowledge-tab--active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          🤖 AI Assistant & FAQs
        </button>
        <button 
          className={`knowledge-tab ${activeTab === 'resources' ? 'knowledge-tab--active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          📦 Resources & Guides
        </button>
      </div>

      {/* Video Learning Tab */}
      {activeTab === 'learning' && (
        <div className="tab-content">
          {/* Video Grid - 2 rows of 3 videos */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            {videoContent.map(video => (
              <a 
                key={video.id} 
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="video-card-enhanced"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.3)';
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Video Thumbnail */}
                <div style={{ position: 'relative', paddingTop: '56.25%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `url(${video.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    {/* Play Button Overlay */}
                    <div style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease'
                    }}>
                      <span style={{ fontSize: '28px', marginLeft: '4px', color: '#667eea' }}>▶</span>
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}>
                    {video.duration}
                  </span>

                  {/* Category Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#667eea',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {video.category}
                  </span>
                </div>

                {/* Video Info */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px', flexShrink: 0 }}>{video.emoji}</span>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '17px', 
                      fontWeight: 'bold', 
                      color: '#1f2937',
                      lineHeight: '1.4'
                    }}>
                      {video.title}
                    </h4>
                  </div>
                  
                  <div style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: '#667eea',
                    fontWeight: '600',
                    marginTop: '12px'
                  }}>
                    Watch Now
                    <span style={{ fontSize: '16px' }}>→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Stats Banner */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white', 
            padding: '24px',
            textAlign: 'center'
          }}>
            <h4 style={{ marginBottom: '12px', fontSize: '20px' }}>📊 Learning Statistics</h4>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{videoContent.length}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Videos</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>12.5k</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Views</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>45+</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Topics Covered</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant & FAQs Tab */}
      {activeTab === 'ai' && (
        <div className="tab-content">
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 className="card__title">🤖 AI Climate Assistant</h3>
            <p style={{ color: 'var(--neutral-500)', marginBottom: '16px' }}>
              Ask questions about climate change, get local solutions, and learn adaptation strategies
            </p>
            <div className="ai-chat-box">
              <textarea
                className="form-textarea"
                placeholder="Ask me anything about climate change, adaptation, or local solutions..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                rows={3}
              />
              <button className="btn btn--primary" style={{ marginTop: '12px' }}>
                Ask AI Assistant
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="card__title">❓ Frequently Asked Questions</h3>
            <div className="faq-list">
              {faqs.map((faq, idx) => (
                <div key={idx} className="faq-item">
                  <div className="faq-question">Q: {faq.q}</div>
                  <div className="faq-answer">A: {faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resources & Guides Tab */}
      {activeTab === 'resources' && (
        <div className="tab-content">
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 className="card__title">📚 Resource Library</h3>
            <p style={{ color: 'var(--neutral-500)', marginBottom: '16px' }}>
              Download guides, access tools, and find practical resources for climate action
            </p>
          </div>

          <div className="resources-grid">
            {resources.map((resource, idx) => (
              <div key={idx} className="resource-card">
                <div className="resource-card__icon">{resource.icon}</div>
                <div className="resource-card__cat">{resource.cat}</div>
                <div className="resource-card__title">{resource.title}</div>
                <div className="resource-card__desc">{resource.desc}</div>
                <button className="btn btn--ghost" style={{ width: '100%', marginTop: '12px' }}>
                  Download
                </button>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <h3 className="card__title">📞 Emergency Contacts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong style={{ color: '#0a3d2e' }}>🚨 Emergency Services</strong>
                <p style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: '700', color: '#e63946' }}>999</p>
              </div>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong style={{ color: '#0a3d2e' }}>🌧️ Weather Hotline</strong>
                <p style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: '700', color: '#0077b6' }}>0800-WEATHER</p>
              </div>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong style={{ color: '#0a3d2e' }}>🏥 Health Emergency</strong>
                <p style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: '700', color: '#ff8c00' }}>114</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
