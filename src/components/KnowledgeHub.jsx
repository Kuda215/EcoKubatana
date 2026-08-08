import { useState } from 'react';
import './PageStyles.css';

const videoContent = [
  { id: 1, title: 'Understanding Climate Change', emoji: '🌍', duration: '12:34', category: 'Basics' },
  { id: 2, title: 'Water Conservation at Home', emoji: '💧', duration: '8:45', category: 'Water' },
  { id: 3, title: 'Growing Climate-Resilient Crops', emoji: '🌾', duration: '15:22', category: 'Agriculture' },
  { id: 4, title: 'Solar Energy for Beginners', emoji: '☀️', duration: '10:15', category: 'Energy' },
  { id: 5, title: 'Community Action Planning', emoji: '👥', duration: '18:30', category: 'Community' },
  { id: 6, title: 'Disaster Preparedness', emoji: '🚨', duration: '14:10', category: 'Safety' },
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

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">🤖 AI Knowledge Hub</h1>
          <p className="page__sub">AI-powered learning, resources, and expert guidance</p>
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
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 className="card__title">🎓 Educational Videos</h3>
            <p style={{ color: 'var(--neutral-500)', marginBottom: '16px' }}>
              Watch and learn about climate adaptation, sustainable practices, and community action
            </p>
          </div>

          <div className="video-grid">
            {videoContent.map(video => (
              <div key={video.id} className="video-card">
                <div className="video-thumb">
                  <span className="video-thumb__emoji">{video.emoji}</span>
                  <span className="video-duration">{video.duration}</span>
                </div>
                <div className="video-info">
                  <div className="video-title">{video.title}</div>
                  <div className="video-meta">{video.category}</div>
                </div>
              </div>
            ))}
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
