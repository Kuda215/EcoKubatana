import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { aiAssistantAPI, faqsAPI, videosAPI, translationsAPI } from '../lib/api';
import './PageStyles.css';

function getYouTubeEmbedId(url) {
  const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

const videoContent = [
  {
    id: 1,
    title: 'All this area used to be green - Zimbabwe voices from the climate frontline',
    author: 'The Climate Frontline',
    duration: '8:42',
    posted: '2 years ago',
    category: 'Drought',
    url: 'https://www.youtube.com/watch?v=eMOviCHkqh8',
    thumbnail: 'https://img.youtube.com/vi/eMOviCHkqh8/hqdefault.jpg',
  },
  {
    id: 2,
    title: 'Drought resilience in Buhera and Makoni, Zimbabwe',
    author: 'Practical Action',
    duration: '6:15',
    posted: '3 years ago',
    category: 'Drought',
    url: 'https://www.youtube.com/watch?v=mHH4nWGoxdA',
    thumbnail: 'https://img.youtube.com/vi/mHH4nWGoxdA/hqdefault.jpg',
  },
  {
    id: 3,
    title: 'Cyclone Idai: roads destroyed in Zimbabwe (MSF)',
    author: 'MSF / Doctors Without Borders',
    duration: '4:08',
    posted: '5 years ago',
    category: 'Cyclone',
    url: 'https://www.youtube.com/watch?v=t_GjiwGw9kA',
    thumbnail: 'https://img.youtube.com/vi/t_GjiwGw9kA/hqdefault.jpg',
  },
  {
    id: 4,
    title: 'Building climate resilience in Zimbabwe',
    author: 'UNDP Zimbabwe',
    duration: '5:21',
    posted: '1 year ago',
    category: 'Community',
    url: 'https://www.youtube.com/watch?v=cISoqgq-BG4',
    thumbnail: 'https://img.youtube.com/vi/cISoqgq-BG4/hqdefault.jpg',
  },
  {
    id: 5,
    title: 'Early Warnings for All - Zimbabwe climate action',
    author: 'WMO',
    duration: '3:47',
    posted: '11 months ago',
    category: 'Early warning',
    url: 'https://www.youtube.com/watch?v=gglCXUzODyk',
    thumbnail: 'https://img.youtube.com/vi/gglCXUzODyk/hqdefault.jpg',
  },
];

const resources = [
  { icon: '📋', cat: 'GUIDES', title: 'Household pack for drought and flood', desc: 'IDs, 3 litres of water each, seed above flood line, torch. Civil Protection first.' },
  { icon: '🌧️', cat: 'WATER', title: 'Rainwater and greywater (Harare to rural wards)', desc: 'Roof catch, first-flush, boil after heavy rain. Useful when municipal supply is erratic.' },
  { icon: '🌱', cat: 'AGRICULTURE', title: 'Pfumvudza / small grains', desc: 'Mulch basins, sorghum and millet when the maize season fails. Destock early in drought.' },
  { icon: '🌀', cat: 'CYCLONE', title: 'Eastern Highlands after Idai', desc: 'Chimanimani and Chipinge: higher ground, do not walk flood water, livestock inland.' },
  { icon: '📞', cat: 'EMERGENCY', title: 'Zimbabwe numbers', desc: 'Police 995. Medical 994. Fire 993. Or 112. Then mark safe in EcoKubatana.' },
  { icon: '📡', cat: 'MSD', title: 'Listen to Meteorological Services', desc: 'Treat MSD / Civil Protection as official. EcoKubatana carries the same alert into the street.' },
];

export default function KnowledgeHub() {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('learning');
  const [aiMessage, setAiMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [faqTranslations, setFaqTranslations] = useState({});
  const [translatingFaqs, setTranslatingFaqs] = useState(false);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const chatEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Drought', 'Cyclone', 'Community', 'Early warning'];

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

  // Translate stored FAQ content on demand when the UI language isn't
  // English. Falls back to the original English text while a translation
  // is loading or if it fails - never blocks rendering.
  useEffect(() => {
    if (i18n.language === 'en' || faqs.length === 0) return;
    let cancelled = false;
    setTranslatingFaqs(true);

    Promise.all(faqs.map(async (faq) => {
      const [qResult, aResult] = await Promise.all([
        translationsAPI.translate({ sourceType: 'faq_question', sourceId: faq.id, text: faq.question, language: i18n.language }),
        translationsAPI.translate({ sourceType: 'faq_answer', sourceId: faq.id, text: faq.answer, language: i18n.language }),
      ]);
      return {
        id: faq.id,
        question: qResult.success ? qResult.translated_text : faq.question,
        answer: aResult.success ? aResult.translated_text : faq.answer,
      };
    }))
      .then(results => {
        if (cancelled) return;
        const map = {};
        results.forEach(r => { map[r.id] = { question: r.question, answer: r.answer }; });
        setFaqTranslations(map);
      })
      .catch(err => console.error('Failed to translate FAQs:', err))
      .finally(() => { if (!cancelled) setTranslatingFaqs(false); });

    return () => { cancelled = true; };
  }, [i18n.language, faqs]);

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

  // Optional: filter the static videos by search + category
  const filteredVideos = videoContent.filter(video => {
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page kh-page">
      <div className="page__header kh-head">
        <div>
          <h1 className="page__title">AI Knowledge Hub</h1>
          <p className="page__sub">Watch, ask, and take home a step you can use this week — drought, Idai, pfumvudza, early warning.</p>
        </div>
        <div className="kh-search">
          <input
            type="text"
            className="form-input"
            placeholder="Search a topic…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="kh-cats">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-tab ${selectedCategory === cat ? 'filter-tab--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
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
          <div className="yt-grid">
            {filteredVideos.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="yt-card"
              >
                <div className="yt-thumb">
                  <img src={video.thumbnail} alt="" />
                  <span className="yt-play">▶</span>
                  <span className="yt-time">{video.duration}</span>
                  <span className={`yt-tag yt-tag--${video.category.toLowerCase().replace(/\s+/g, '-')}`}>{video.category}</span>
                </div>
                <div className="yt-row">
                  <div className="yt-avatar" aria-hidden>{video.author[0]}</div>
                  <div>
                    <h4 className="yt-title">{video.title}</h4>
                    <p className="yt-author">{video.author}</p>
                    <p className="yt-meta">{video.posted}</p>
                  </div>
                </div>
              </a>
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
                  <div key={idx} className={`kh-bubble kh-bubble--${msg.role}`}>
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
            {translatingFaqs && <p style={{ color: 'var(--neutral-500)', fontSize: '13px' }}>Translating…</p>}
            <div className="faq-list">
              {faqs.map((faq) => {
                const translated = i18n.language !== 'en' ? faqTranslations[faq.id] : null;
                return (
                  <div key={faq.id} className="faq-item">
                    <div className="faq-question">Q: {translated?.question || faq.question}</div>
                    <div className="faq-answer">A: {translated?.answer || faq.answer}</div>
                  </div>
                );
              })}
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