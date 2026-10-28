import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { aiAssistantAPI, faqsAPI, translationsAPI } from '../lib/api';
import { CLIMATE_VIDEOS, recommendVideosForArea } from '../lib/climateVideos';
import { useLocationPlace } from '../contexts/LocationContext';
import { useClimateData } from '../lib/climateData';
import './PageStyles.css';

const PAGE_SIZE = 12;

const RESOURCE_CATS = ['All', 'Prepare', 'Flood', 'Drought', 'Heat', 'Fire', 'Storm', 'Health', 'Community'];

const resources = [
  { icon: '📋', cat: 'Prepare', title: 'Household go-bag for drought and flood', desc: 'What to pack before the warning comes, so you can leave in five minutes.',
    steps: ['IDs, birth certificates and title deeds in a sealed plastic bag', '3 litres of water per person per day, for 3 days', 'Torch, spare batteries and a charged phone power bank', 'Medicines for a week, plus a small first-aid kit', 'Seed and grain stored above the flood line', 'Written list of family phone numbers in case your phone dies'] },
  { icon: '👨‍👩‍👧', cat: 'Prepare', title: 'Make a family emergency plan', desc: 'Agree tonight where you meet and who collects the children.',
    steps: ['Pick one meeting place near home and one outside the area', 'Decide who fetches children from school and who checks on elders', 'Agree a relative outside the area everyone texts "safe" to', 'Practise the route to higher ground once with the whole family', 'Keep the plan on paper by the door'] },
  { icon: '🌊', cat: 'Flood', title: 'When the river rises', desc: 'Moving water is the biggest killer in a flood. Leave early.',
    steps: ['Move people, then livestock, then belongings to higher ground', 'Never walk or drive through moving water - 15 cm can knock you down', 'Switch off electricity at the main switch if it is safe', 'Stay off bridges and low crossings until officials reopen them', 'Boil or treat all drinking water after the flood'] },
  { icon: '🧹', cat: 'Flood', title: 'Coming home after a flood', desc: 'The danger is not over when the water goes down.',
    steps: ['Wait for Civil Protection to say the area is safe', 'Look for cracks in walls and sagging roofs before going in', 'Wear shoes and gloves - mud hides glass, nails and snakes', 'Throw away food that touched flood water', 'Photograph damage for aid and insurance claims'] },
  { icon: '🌱', cat: 'Drought', title: 'Pfumvudza / small grains', desc: 'Mulch basins, sorghum and millet when the maize season fails.',
    steps: ['Dig planting basins and keep crop residue as mulch to hold moisture', 'Plant drought-tolerant sorghum, millet and cowpeas alongside maize', 'Plant with the first effective rains, not before', 'Weed early so weeds do not steal water', 'Destock early in drought - sell before animals lose condition'] },
  { icon: '🌧️', cat: 'Drought', title: 'Rainwater and greywater', desc: 'Roof catch and reuse when municipal supply is erratic.',
    steps: ['Fit a gutter and a covered tank to the roof', 'Let the first rain wash the roof before collecting (first flush)', 'Boil or use purification tablets before drinking stored water', 'Reuse washing water on gardens and trees, not food leaves', 'Share water points with neighbours who have none'] },
  { icon: '🌡️', cat: 'Heat', title: 'Staying safe in a heatwave', desc: 'Children, elders and outdoor workers are most at risk.',
    steps: ['Drink water often, even when not thirsty', 'Work and travel early morning or late afternoon', 'Keep children and elders in shade between 11:00 and 15:00', 'Know the signs of heatstroke: confusion, hot dry skin, fainting', 'Cool someone down with wet cloths and get them to a clinic'] },
  { icon: '🔥', cat: 'Fire', title: 'Veld and bush fire safety', desc: 'Most veld fires start from burning rubbish or clearing land.',
    steps: ['Do not burn rubbish or fields on hot, windy days', 'Clear a 3 m firebreak around homes and granaries', 'Keep a bucket of water or sand ready when cooking outside', 'If fire approaches, move upwind and to cleared or burnt ground', 'Report fires early - call the fire brigade (993 in Zimbabwe)'] },
  { icon: '🌀', cat: 'Storm', title: 'Cyclones: lessons from Idai', desc: 'Chimanimani and Chipinge showed what works.',
    steps: ['Leave homes near rivers and steep slopes before landfall', 'Tie down roofs and move livestock inland', 'Do not shelter under trees or near rocky slopes', 'Listen to MSD and Civil Protection on radio', 'After the storm, watch for landslides for several days'] },
  { icon: '💨', cat: 'Storm', title: 'Strong winds and hail', desc: 'Protect roofs, people and animals.',
    steps: ['Weigh down roof sheets with sandbags or tie them to beams', 'Bring animals into a shelter and close doors', 'Stay indoors away from windows', 'Unplug electrical appliances during lightning'] },
  { icon: '🩺', cat: 'Health', title: 'Cholera and clean water after disasters', desc: 'Floods and drought both raise the risk of water-borne disease.',
    steps: ['Boil water for at least one minute, or use purification tablets', 'Wash hands with soap after the toilet and before eating', 'Mix oral rehydration: 1 litre clean water, 6 level teaspoons sugar, ½ teaspoon salt', 'Get anyone with severe watery diarrhoea to a clinic immediately'] },
  { icon: '🧠', cat: 'Health', title: 'Coping after a disaster', desc: 'Stress, grief and fear are normal. Talk about it.',
    steps: ['Keep daily routines for children as much as possible', 'Talk to someone you trust - a neighbour, church or community leader', 'Check on people living alone', 'Use the Wellbeing section on the Community page to ask for support'] },
  { icon: '🤝', cat: 'Community', title: 'Set up a street warning chain', desc: 'One person hears the alert, ten houses know in minutes.',
    steps: ['List every household on your street with a phone number', 'Each person agrees to call or visit the next three', 'Mark elders, disabled people and children who need help to move', 'Test the chain once a season'] },
  { icon: '📡', cat: 'Community', title: 'Trust official warnings', desc: 'MSD and Civil Protection are official. EcoKubatana carries the alert to the street.',
    steps: ['Follow the Meteorological Services Department (MSD) forecasts', 'Act on Civil Protection Unit evacuation orders without delay', 'Do not share unverified warnings - check before forwarding', 'Report what you see in EcoKubatana so others are warned'] },
];

function VideoCard({ video }) {
  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer" className="yt-card">
      <div className="yt-thumb">
        <img src={video.thumbnail} alt="" loading="lazy" />
        <span className="yt-play">▶</span>
        <span className="yt-time">{video.duration}</span>
        <span className={`yt-tag yt-tag--${video.category.toLowerCase().replace(/\s+/g, '-')}`}>{video.category}</span>
      </div>
      <div className="yt-row">
        <div className="yt-avatar" aria-hidden>{video.author[0]}</div>
        <div>
          <h4 className="yt-title">{video.title}</h4>
          <p className="yt-author">{video.author}</p>
          <p className="yt-meta">{video.posted} · {video.country}</p>
        </div>
      </div>
    </a>
  );
}

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
  const { place } = useLocationPlace();
  const { hotspots } = useClimateData();
  const chatEndRef = useRef(null);
  const moreRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [resourceCat, setResourceCat] = useState('All');
  const [openGuide, setOpenGuide] = useState(null);
  const [recording, setRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(null); // 'transcribing' | 'speaking' | null
  const [voiceError, setVoiceError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  // Only offer categories that actually have videos, so no filter leads to an empty page
  const categories = useMemo(
    () => ['All', ...new Set(CLIMATE_VIDEOS.map((v) => v.category))],
    []
  );
  const filtering = selectedCategory !== 'All' || !!searchQuery.trim();
  const recommended = useMemo(
    () => (filtering ? [] : recommendVideosForArea(place, hotspots, 4)),
    [place, hotspots, filtering]
  );

  useEffect(() => {
    faqsAPI.list()
      .then(result => { if (result.success) setFaqs(result.data); })
      .catch(err => console.error('Failed to load FAQs:', err))
      .finally(() => setFaqsLoading(false));

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

  const handleAskAI = async (spoken) => {
    const question = (typeof spoken === 'string' ? spoken : aiMessage).trim();
    if (!question || sending) return null;
    const nextMessages = [...chatMessages, { role: 'user', content: question }];
    setChatMessages(nextMessages);
    setAiMessage('');
    setSending(true);
    try {
      const result = await aiAssistantAPI.chat(nextMessages);
      const reply = result.success ? result.reply : (result.error || 'Something went wrong. Please try again.');
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      return result.success ? reply : null;
    } catch (error) {
      console.error('AI assistant error:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Could not reach the AI assistant right now. Please try again.' }]);
      return null;
    } finally {
      setSending(false);
    }
  };

  // Voice: record a question, transcribe it, ask the assistant, then read the answer aloud
  const startRecording = async () => {
    setVoiceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        handleVoiceQuestion(new Blob(audioChunksRef.current, { type: recorder.mimeType }), recorder.mimeType);
      };
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
      setVoiceError("Couldn't access your microphone. Please allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleVoiceQuestion = async (blob, mimeType) => {
    setVoiceStatus('transcribing');
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const heard = await aiAssistantAPI.transcribe(base64, mimeType);
      const transcript = heard.success ? heard.transcript?.trim() : '';
      if (!transcript) {
        setVoiceError(heard.success ? "Didn't catch that - try again." : (heard.error || "Couldn't understand the recording."));
        return;
      }
      setVoiceStatus(null);
      const reply = await handleAskAI(transcript);
      if (!reply) return;
      setVoiceStatus('speaking');
      const spoken = await aiAssistantAPI.speak(reply);
      if (spoken.success && audioPlayerRef.current) {
        audioPlayerRef.current.src = `data:${spoken.mime_type};base64,${spoken.audio_base64}`;
        await audioPlayerRef.current.play().catch((err) => console.error('Playback error:', err));
      }
    } catch (err) {
      console.error('Voice question error:', err);
      setVoiceError('Something went wrong. Please try again.');
    } finally {
      setVoiceStatus(null);
    }
  };

  const recommendedIds = new Set(recommended.map((v) => v.id));
  const filteredVideos = CLIMATE_VIDEOS.filter((video) => {
    if (recommendedIds.has(video.id)) return false;
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery
      || video.title.toLowerCase().includes(q)
      || video.category.toLowerCase().includes(q)
      || String(video.country || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });
  const shown = filteredVideos.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const el = moreRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setVisibleCount((n) => Math.min(n + PAGE_SIZE, filteredVideos.length));
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [filteredVideos.length, activeTab]);

  return (
    <div className="page kh-page">
      <div className="page__header kh-head">
        <div>
          <h1 className="page__title">Knowledge hub</h1>
          <p className="page__sub">Watch, ask, and take home a step you can use this week - drought, Idai, pfumvudza, early warning.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="knowledge-tabs">
        <button 
          className={`knowledge-tab ${activeTab === 'learning' ? 'knowledge-tab--active' : ''}`}
          onClick={() => setActiveTab('learning')}
        >
          🎥 Video learning
        </button>
        <button 
          className={`knowledge-tab ${activeTab === 'ai' ? 'knowledge-tab--active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          🤖 AI assistant & FAQs
        </button>
        <button 
          className={`knowledge-tab ${activeTab === 'resources' ? 'knowledge-tab--active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          📦 Resources & guides
        </button>
      </div>

      {/* Video Learning Tab */}
      {activeTab === 'learning' && (
        <div className="tab-content">
          <div className="kh-toolbar">
            <input
              type="text"
              className="form-input kh-toolbar__search"
              placeholder="Search a topic, country or title…"
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

          {recommended.length > 0 && (
            <section className="kh-section">
              <h3 className="kh-section__title">For {place?.name || 'your area'}</h3>
              <div className="yt-grid">
                {recommended.map((video) => <VideoCard key={`rec-${video.id}`} video={video} />)}
              </div>
            </section>
          )}

          <section className="kh-section">
            {recommended.length > 0 && <h3 className="kh-section__title">More African climate videos</h3>}
            {filteredVideos.length === 0 ? (
              <div className="ui-state ui-state--boxed">
                <div className="ui-state__icon" aria-hidden="true">🔍</div>
                <h4 className="ui-state__title">No videos found</h4>
                <p className="ui-state__text">
                  No videos match{searchQuery.trim() ? ` "${searchQuery.trim()}"` : ''}{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.
                </p>
                <button type="button" className="btn btn--secondary" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="yt-grid">
                {shown.map((video) => <VideoCard key={video.id} video={video} />)}
              </div>
            )}
          </section>
          <div ref={moreRef} className="kh-more">
            {shown.length < filteredVideos.length && `Loading ${shown.length} of ${filteredVideos.length}…`}
          </div>
        </div>
      )}

      {/* AI Assistant & FAQs Tab */}
      {activeTab === 'ai' && (
        <div className="tab-content">
          <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
            <h3 className="card__title">🤖 AI climate assistant</h3>
            <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
              Climate only - drought, flood, heat, storms, crops, water, and how to stay safe. Other topics are refused.
            </p>
            {chatMessages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', marginBottom: '16px', padding: '4px' }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`kh-bubble kh-bubble--${msg.role}`}>
                    {msg.content}
                  </div>
                ))}
                {sending && (
                  <div className="text-muted" style={{ alignSelf: 'flex-start', fontSize: 'var(--fs-sm)', padding: '0 14px' }}>
                    Thinking…
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
            <div className="ai-chat-box">
              <textarea
                className="form-textarea"
                placeholder="Ask a climate question - drought, flood, heat, crops, water… or tap the mic and speak"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleAskAI(); }}
                rows={3}
              />
              {voiceError && <p className="kh-voice-error">{voiceError}</p>}
              <div className="kh-ask-row">
                <button
                  type="button"
                  className={`kh-mic ${recording ? 'kh-mic--on' : ''}`}
                  onClick={recording ? stopRecording : startRecording}
                  disabled={sending || !!voiceStatus}
                  aria-label={recording ? 'Stop recording' : 'Ask by voice'}
                >
                  {recording ? '⏹' : '🎙️'}
                </button>
                <span className="kh-voice-status">
                  {recording ? 'Listening… tap to stop'
                    : voiceStatus === 'transcribing' ? 'Working out what you said…'
                    : voiceStatus === 'speaking' ? '🔊 Reading the answer aloud…'
                    : 'Speak your question'}
                </span>
                <button className="btn btn--primary kh-ask-btn"
                  onClick={handleAskAI} disabled={sending || !aiMessage.trim()}>
                  {sending ? 'Thinking…' : 'Ask the assistant'}
                </button>
              </div>
              <audio ref={audioPlayerRef} style={{ display: 'none' }} />
            </div>
          </div>

          <div className="card">
            <h3 className="card__title">❓ Frequently asked questions</h3>
            {faqsLoading && (
              <div className="ui-state" role="status">
                <div className="ui-spinner" aria-hidden="true" />
                <p className="ui-state__text">Loading questions…</p>
              </div>
            )}
            {translatingFaqs && <p className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>Translating…</p>}
            {!faqsLoading && faqs.length === 0 && (
              <div className="ui-state ui-state--boxed">
                <div className="ui-state__icon" aria-hidden="true">❓</div>
                <h4 className="ui-state__title">No questions yet</h4>
                <p className="ui-state__text">Common questions will appear here. Until then, ask the assistant above.</p>
              </div>
            )}
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
          <div className="kh-toolbar">
            <p className="page__sub" style={{ margin: 0 }}>
              {resources.length} practical guides - tap one to read the steps.
            </p>
            <div className="kh-cats">
              {RESOURCE_CATS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-tab ${resourceCat === cat ? 'filter-tab--active' : ''}`}
                  onClick={() => setResourceCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="resources-grid">
            {resources.filter((r) => resourceCat === 'All' || r.cat === resourceCat).map((resource) => {
              const isOpen = openGuide === resource.title;
              return (
                <div key={resource.title} className={`resource-card ${isOpen ? 'resource-card--open' : ''}`}>
                  <div className="resource-card__icon">{resource.icon}</div>
                  <div className="resource-card__cat">{resource.cat}</div>
                  <div className="resource-card__title">{resource.title}</div>
                  <div className="resource-card__desc">{resource.desc}</div>
                  {isOpen && (
                    <ol className="resource-card__steps">
                      {resource.steps.map((s) => <li key={s}>{s}</li>)}
                    </ol>
                  )}
                  <button type="button" className="btn btn--ghost" style={{ width: '100%' }}
                    onClick={() => setOpenGuide(isOpen ? null : resource.title)}>
                    {isOpen ? 'Hide steps' : 'Read guide'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ marginTop: 'var(--space-5)' }}>
            <h3 className="card__title">📞 Zimbabwe emergency contacts</h3>
            <div className="kh-contacts">
              {[
                ['🚓 Police', '995'],
                ['🚑 Ambulance', '994'],
                ['🚒 Fire', '993'],
                ['🆘 Any emergency', '112'],
              ].map(([label, num]) => (
                <a key={label} href={`tel:${num}`} className="kh-contact">
                  <strong>{label}</strong>
                  <span>{num}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}