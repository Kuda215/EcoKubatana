import { useState, useEffect, useRef } from 'react';
import { aiAssistantAPI, faqsAPI, videosAPI } from '../lib/api';
import './PageStyles.css';

function getYouTubeEmbedId(url) {
  const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

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
  const [chatMessages, setChatMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    faqsAPI.list()
      .then(result => { if (result.success) setFaqs(result.data); })
      .catch(err => console.error('Failed to load FAQs:', err))
      .finally(() => setFaqsLoading(false));

    videosAPI.list()
      .then(result => { if (result.success) setVideos(result.data); })
      .catch(err => console.error('Failed to load videos:', err))
      .finally(() => setVideosLoading(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAskAI = async () => {
    if (!aiMessage.trim() || sending) return;
    const nextMessages = [...chatMessages, { role: 'user', content: aiMessage.trim() }];
    setChatMessages(nextMessages);
    setAiMessage('');
    setSending(true);
    try {
      const result = await aiAssistantAPI.chat(nextMessages);
      const reply = result.success ? result.reply : (result.error || 'Something went wrong. Please try again.');
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('AI assistant error:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Could not reach the AI assistant right now. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

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

          {selectedVideo && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div className="video-title" style={{ fontSize: '16px' }}>{selectedVideo.title}</div>
                  <div className="video-meta">{selectedVideo.category}</div>
                </div>
                <button className="btn btn--ghost" onClick={() => setSelectedVideo(null)}>✕ Close</button>
              </div>
              {getYouTubeEmbedId(selectedVideo.youtube_url) ? (
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeEmbedId(selectedVideo.youtube_url)}`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: '8px' }}
                  />
                </div>
              ) : (
                <p style={{ color: 'var(--neutral-500)' }}>This video's link couldn't be played — invalid YouTube URL.</p>
              )}
            </div>
          )}

          {videosLoading && <p style={{ color: 'var(--neutral-500)' }}>Loading videos…</p>}
          {!videosLoading && videos.length === 0 && (
            <div className="cb-empty">No videos yet. 🌿</div>
          )}
          <div className="video-grid">
            {videos.map(video => (
              <div key={video.id} className="video-card" onClick={() => setSelectedVideo(video)} style={{ cursor: 'pointer' }}>
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
            {chatMessages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', marginBottom: '16px', padding: '4px' }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: msg.role === 'user' ? '#0a3d2e' : '#f1f5f4',
                    color: msg.role === 'user' ? 'white' : '#0a3d2e',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                ))}
                {sending && (
                  <div style={{ alignSelf: 'flex-start', color: 'var(--neutral-500)', fontSize: '13px', padding: '0 14px' }}>
                    Thinking…
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
            <div className="ai-chat-box">
              <textarea
                className="form-textarea"
                placeholder="Ask me anything about climate change, adaptation, or local solutions..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleAskAI(); }}
                rows={3}
              />
              <button className="btn btn--primary" style={{ marginTop: '12px' }}
                onClick={handleAskAI} disabled={sending || !aiMessage.trim()}>
                {sending ? 'Thinking…' : 'Ask AI Assistant'}
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="card__title">❓ Frequently Asked Questions</h3>
            {faqsLoading && <p style={{ color: 'var(--neutral-500)' }}>Loading FAQs…</p>}
            <div className="faq-list">
              {faqs.map((faq) => (
                <div key={faq.id} className="faq-item">
                  <div className="faq-question">Q: {faq.question}</div>
                  <div className="faq-answer">A: {faq.answer}</div>
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
