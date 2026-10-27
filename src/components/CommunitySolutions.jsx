import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LIVELIHOODS, EMERGENCY_PRIORITIES, AFRICA_HUBS } from '../lib/africaHubs';
import { useClimateData } from '../lib/climateData';
import { hubForUser } from '../lib/dataSources';
import { numbersForIso, loadSafetyPlaces } from '../lib/safetyPlaces';
import { buildGuideSteps, speakText, stopSpeak, listenOnce, parseVoiceCommand, canListen } from '../lib/voiceGuide';
import { safetyAPI } from '../lib/api';
import SafetyCheckIn from './SafetyCheckIn';
import './PageStyles.css';

export default function CommunitySolutions() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { hotspots } = useClimateData();
  const lang = i18n.language || 'en';

  const localHub = hubForUser(hotspots?.length ? hotspots : AFRICA_HUBS, user?.location);
  const numbers = numbersForIso(localHub?.iso3);
  const livelihood = user?.livelihood || 'household';
  const livelihoodLabel = LIVELIHOODS.find((l) => l.value === livelihood)?.label || String(livelihood).replace(/_/g, ' ') || 'Household';
  const priorities = (user?.emergency_priorities || []).map((p) => EMERGENCY_PRIORITIES.find((x) => x.value === p)?.label || p);
  const hazard = localHub?.forecast_hazard || localHub?.historic_hazard || 'Flood';
  const score = localHub?.forecast_score || localHub?.historic_score || 70;
  const risk = score >= 75 ? 'HIGH' : score >= 55 ? 'ELEVATED' : 'WATCH';

  const steps = useMemo(
    () => buildGuideSteps({
      livelihood,
      priorities,
      hazard,
      numbers,
      place: localHub ? `${localHub.name}, ${localHub.country}` : user?.location || '',
    }),
    [livelihood, priorities.join('|'), hazard, numbers.police, localHub?.id, user?.location]
  );

  const [screen, setScreen] = useState('alert');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('voice');
  const [handsFree, setHandsFree] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [heard, setHeard] = useState('');
  const [voiceErr, setVoiceErr] = useState('');
  const [cycle, setCycle] = useState(0);
  const skipListenRef = useRef(false);
  const current = steps[step] || steps[0];

  useEffect(() => {
    if (!localHub) return;
    loadSafetyPlaces({ lat: localHub.lat, lng: localHub.lng, hubId: localHub.id }).catch(() => {});
  }, [localHub?.id]);

  useEffect(() => () => stopSpeak(), []);

  const goHub = () => {
    setHandsFree(false);
    stopSpeak();
    navigate('/', {
      state: { openSafety: true, hubId: localHub?.id },
    });
  };

  const applyCommand = (cmd) => {
    if (!cmd) return;
    if (cmd === 'stop') {
      setHandsFree(false);
      stopSpeak();
      return;
    }
    if (cmd === 'hub' || cmd === 'call') {
      goHub();
      return;
    }
    if (cmd === 'help') {
      safetyAPI.checkIn({ status: 'need_help', channel: 'voice' }).catch(() => {});
      goHub();
      return;
    }
    if (cmd === 'safe') {
      safetyAPI.checkIn({ status: 'safe', channel: 'voice' }).catch(() => {});
      setHandsFree(false);
      setScreen('arrived');
      return;
    }
    if (cmd === 'repeat') {
      skipListenRef.current = false;
      setCycle((c) => c + 1);
      return;
    }
    if (cmd === 'back') {
      setStep((s) => Math.max(0, s - 1));
      return;
    }
    if (cmd === 'next') {
      if (current.goHub || step >= steps.length - 1) goHub();
      else setStep((s) => s + 1);
    }
  };

  useEffect(() => {
    if (screen !== 'guide') return;
    if (mode !== 'voice' && !handsFree) return;
    let cancelled = false;
    (async () => {
      setVoiceErr('');
      setSpeaking(true);
      await speakText(current.say || `${current.title}. ${current.body}`, lang);
      if (cancelled) return;
      setSpeaking(false);
      if (!handsFree || skipListenRef.current) return;
      if (!canListen()) {
        setVoiceErr('This browser cannot listen. Tap Next, or use Chrome / Edge for voice prompts.');
        return;
      }
      setListening(true);
      try {
        const text = await listenOnce(lang);
        if (cancelled) return;
        setHeard(text);
        const cmd = parseVoiceCommand(text);
        if (cmd) applyCommand(cmd);
        else setVoiceErr(`Heard “${text}”. Say next, back, repeat, or hub.`);
      } catch (err) {
        if (!cancelled) setVoiceErr(err.message);
      } finally {
        if (!cancelled) setListening(false);
      }
    })();
    return () => {
      cancelled = true;
      stopSpeak();
    };
  }, [screen, step, handsFree, cycle, mode, current?.title]);

  const startVoice = () => {
    setScreen('guide');
    setStep(0);
    setMode('voice');
    setHandsFree(true);
    skipListenRef.current = false;
    setCycle((c) => c + 1);
  };

  const tapListen = async () => {
    setVoiceErr('');
    if (!canListen()) {
      setVoiceErr('This browser cannot listen. Tap Next, or use Chrome / Edge.');
      return;
    }
    setListening(true);
    try {
      const text = await listenOnce(lang);
      setHeard(text);
      const cmd = parseVoiceCommand(text);
      if (cmd) applyCommand(cmd);
      else setVoiceErr(`Heard “${text}”. Say next, back, repeat, or hub.`);
    } catch (err) {
      setVoiceErr(err.message);
    } finally {
      setListening(false);
    }
  };

  return (
    <div className="page where-now">
      <div className="where-now__phone">
        {screen === 'alert' && (
          <div className="where-now__alert">
            <div className="where-now__siren" aria-hidden>🚨</div>
            <h1>Verified {hazard} alert</h1>
            <p>
              {localHub
                ? `${hazard} risk around ${localHub.name}, ${localHub.country}. This guide is for a ${livelihoodLabel}.`
                : `A ${hazard} risk is active in your area.`}
            </p>
            <div className="where-now__facts">
              <div><span>Risk</span><strong>{risk}</strong></div>
              <div><span>Place</span><strong>{localHub ? `${localHub.name}` : (user?.location || 'Your area')}</strong></div>
              <div><span>Protect</span><strong>{priorities.slice(0, 3).join(', ') || 'People first'}</strong></div>
            </div>
            <p className="where-now__hint">
              Free voice on this phone: we speak each step, then listen for next, back, repeat, hub, or help. No extra app.
            </p>
            <button type="button" className="where-now__primary" onClick={startVoice}>
              🔊 Start voice guide
            </button>
            <button
              type="button"
              className="where-now__ghost"
              onClick={() => { setScreen('guide'); setMode('read'); setHandsFree(false); }}
            >
              Read the steps instead
            </button>
          </div>
        )}

        {screen === 'guide' && (
          <>
            <div className="where-now__head">
              <h2>🚨 {hazard} · {livelihoodLabel}</h2>
              <p>{priorities.length ? `Priorities: ${priorities.join(', ')}` : 'People first, then essentials.'}</p>
            </div>

            <div className="where-now__modes">
              {['voice', 'visual', 'read'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={mode === tab ? 'is-on' : ''}
                  onClick={() => { setMode(tab); if (tab === 'voice') { setHandsFree(true); setCycle((c) => c + 1); } else setHandsFree(false); }}
                >
                  {tab === 'voice' ? '🔊 Voice' : tab === 'visual' ? '🖼 Visual' : '📖 Read'}
                </button>
              ))}
            </div>

            <div className="where-now__card">
              <div className="where-now__progress-label">Step {step + 1} of {steps.length}</div>
              <div className="where-now__dots" aria-hidden>
                {steps.map((_, i) => <span key={i} className={i <= step ? 'is-on' : ''} />)}
              </div>
              <h2>{current.title}</h2>
              {mode === 'visual' && <div className="where-now__visual">{current.visual}</div>}
              <p>{current.body}</p>
              <div className="where-now__time">⏱ {current.time}</div>

              {mode === 'voice' && (
                <div className={`where-now__mic ${listening ? 'is-live' : ''} ${speaking ? 'is-speak' : ''}`}>
                  <button type="button" onClick={tapListen} disabled={listening || speaking}>
                    {speaking ? 'Speaking…' : listening ? 'Listening… say next' : '🎤 Tap to speak'}
                  </button>
                  <p>
                    Say <strong>next</strong>, <strong>back</strong>, <strong>repeat</strong>, or <strong>hub</strong>.
                    {heard ? ` Last heard: “${heard}”.` : ''}
                  </p>
                  {voiceErr && <p className="where-now__err">{voiceErr}</p>}
                  <label className="where-now__hands">
                    <input type="checkbox" checked={handsFree} onChange={(e) => setHandsFree(e.target.checked)} />
                    Hands-free: speak then listen automatically
                  </label>
                </div>
              )}

              <div className="where-now__nav">
                <button type="button" className="where-now__ghost" disabled={step === 0} onClick={() => applyCommand('back')}>Previous</button>
                <button type="button" className="where-now__primary" onClick={() => applyCommand(current.goHub ? 'hub' : 'next')}>
                  {current.goHub || step >= steps.length - 1 ? 'Find safety hub' : 'Next'}
                </button>
              </div>
              <button type="button" className="where-now__link" onClick={goHub}>Open Africa hospitals &amp; police map</button>
            </div>
          </>
        )}

        {screen === 'arrived' && (
          <div className="where-now__card where-now__arrived">
            <div className="where-now__visual">✅</div>
            <h1>You reached safety</h1>
            <p>Mark yourself safe, then stay until officials say it is clear.</p>
            <SafetyCheckIn channel="app" />
            <button type="button" className="where-now__primary" onClick={goHub}>Open safety map</button>
            <button type="button" className="where-now__ghost" onClick={() => { setScreen('alert'); setStep(0); setHandsFree(false); }}>Instructions again</button>
          </div>
        )}
      </div>
    </div>
  );
}
