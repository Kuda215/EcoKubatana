import { playbookLang } from './playbook';

const VOICE_LANG = { en: 'en-ZA', sn: 'en-ZA', nd: 'en-ZA', sw: 'sw', zu: 'zu-ZA', fr: 'fr-FR', pt: 'pt-PT', ha: 'ha', yo: 'en-NG' };

function waitVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const done = () => resolve(window.speechSynthesis.getVoices() || []);
    window.speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 600);
  });
}

export function speakText(text, lang = 'en') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve();
  window.speechSynthesis.cancel();
  const voiceLang = VOICE_LANG[playbookLang(lang)] || VOICE_LANG[lang] || 'en-ZA';
  return waitVoices().then((voices) => new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voiceLang;
    u.rate = 0.94;
    u.onend = resolve;
    u.onerror = resolve;
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(voiceLang.slice(0, 2)));
    if (match) u.voice = match;
    window.speechSynthesis.speak(u);
  }));
}

export function stopSpeak() {
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
}

export function parseVoiceCommand(raw) {
  const t = String(raw || '').toLowerCase().trim();
  if (!t) return null;
  if (/\b(next|continue|go|forward|yes|okay|ok|ende|enderera|endelea|qhubeka|suivant|próximo|proximo)\b/.test(t)) return 'next';
  if (/\b(back|previous|behind|shure|nyuma|emva)\b/.test(t)) return 'back';
  if (/\b(repeat|again|what|say that|dzokorora)\b/.test(t)) return 'repeat';
  if (/\b(hub|hospital|police|clinic|fire|safety|shelter|map)\b/.test(t)) return 'hub';
  if (/\b(call|ambulance|phone|dial)\b/.test(t)) return 'call';
  if (/\b(stop|pause|enough|quiet)\b/.test(t)) return 'stop';
  if (/\b(help|need help|not safe)\b/.test(t)) return 'help';
  if (/\b(safe|i am safe|arrived)\b/.test(t)) return 'safe';
  return null;
}

export function canListen() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function listenOnce(lang = 'en', timeoutMs = 8000) {
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!SR) return Promise.reject(new Error('Voice listen needs Chrome or Edge. You can tap Next instead.'));
  return new Promise((resolve, reject) => {
    const rec = new SR();
    rec.lang = VOICE_LANG[playbookLang(lang)] || 'en-ZA';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { rec.stop(); } catch { /* already stopped */ }
      fn(value);
    };
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(' ');
      finish(resolve, text);
    };
    rec.onerror = (e) => {
      const msg = e.error === 'not-allowed'
        ? 'Microphone blocked. Allow it, or tap Next.'
        : e.error === 'no-speech'
          ? 'Did not catch that. Tap the mic or say next.'
          : 'Did not catch that. Tap Next, or try the mic again.';
      finish(reject, new Error(msg));
    };
    rec.onend = () => finish(reject, new Error('Did not catch that. Tap the mic or Next.'));
    const timer = setTimeout(() => finish(reject, new Error('Listening timed out. Tap Next.')), timeoutMs);
    try {
      rec.start();
    } catch (err) {
      finish(reject, err);
    }
  });
}

export function buildGuideSteps({ livelihood = '', priorities = [], hazard = 'Flood', numbers = {}, place = '' }) {
  const job = String(livelihood || 'household').replace(/_/g, ' ');
  const protect = (priorities || []).slice(0, 4).join(', ') || 'family, water, shelter';
  const police = numbers.police || '112';
  const medical = numbers.medical || '112';
  const fire = numbers.fire || '112';
  const where = place || 'your area';
  const extra = [];
  const j = job.toLowerCase();
  if (j.includes('farm') || j.includes('livestock')) {
    extra.push({
      title: 'Move livestock and seed',
      body: `Because you farm, move animals to higher ground and lift seed and tools above floor level. Protect: ${protect}.`,
      visual: '🐄 ➜ ⛰️',
      time: '15 minutes',
      say: `Because you are a farmer, move livestock to higher ground, and protect ${protect}. When you are done, say next.`,
    });
  } else if (j.includes('health')) {
    extra.push({
      title: 'Protect the clinic',
      body: 'Move medicines and records above flood or heat. Keep a clean water point for patients.',
      visual: '💊 ➜ 🏥',
      time: '10 minutes',
      say: 'Protect medicines, records, and a clean water point at the clinic. Say next when ready.',
    });
  } else if (j.includes('teach') || j.includes('student')) {
    extra.push({
      title: 'Account for every child',
      body: 'Stay with the group. Do not send learners into the hazard. Call caregivers when it is safe.',
      visual: '👨‍👩‍👧‍👦 ➜ 🏫',
      time: 'Now',
      say: 'Account for every child. Stay together. Do not dismiss into danger. Say next.',
    });
  } else if (j.includes('trad') || j.includes('market')) {
    extra.push({
      title: 'Leave stock if it delays escape',
      body: 'Life over goods. Warn neighbouring stalls, then use a dry road home.',
      visual: '🧺 ➜ 🚪',
      time: 'Now',
      say: 'Leave stock if it delays escape. Warn neighbouring stalls. Say next.',
    });
  } else if (j.includes('leader') || j.includes('respond')) {
    extra.push({
      title: 'Gather the street, then move',
      body: 'One person counts the block. Send the slowest first. Keep a list of who left.',
      visual: '🗣️ ➜ 🚶',
      time: 'Now',
      say: 'Gather the street. Send the slowest first. Keep a list of who left. Say next.',
    });
  }

  return [
    {
      title: `${hazard} - people first`,
      body: `You work as ${job} in ${where}. In this ${hazard}, protect ${protect} after people are on high, solid ground. Do not walk through flood water.`,
      visual: '🚶 ➜ ⛰️',
      time: 'Now',
      say: `This is a ${hazard} guide for a ${job} in ${where}. First, get people to safety. Then we protect ${protect}. Say next when you are ready, or hub to go to the map.`,
    },
    ...extra,
    {
      title: 'Take the essentials',
      body: 'IDs, medicines, torch, 3 litres of water each. Then tell a neighbour in the language they use at home.',
      visual: '👜 ➜ 🏠',
      time: '5 minutes',
      say: 'Take IDs, medicines, a torch, and water. Tell a neighbour. Say next, or repeat to hear this again.',
    },
    {
      title: 'Call for help if you need it',
      body: `Police ${police}. Medical ${medical}. Fire ${fire}. Or say help and we will flag EcoKubatana.`,
      visual: '📞',
      time: '1 minute',
      say: `If you need help, call police ${String(police).split('').join(' ')}, medical ${String(medical).split('').join(' ')}. Say hub to find a hospital or police station on the map, or next to continue.`,
    },
    {
      title: 'Go to the nearest safety hub',
      body: 'Open the Africa safety map for hospitals, police, fire and clinics near you. Say hub, or tap Find hub.',
      visual: '📍 ➜ 🏥',
      time: 'Depart',
      say: 'Last step. Say hub to open hospitals and police near you. Say next if you already know the way.',
      goHub: true,
    },
  ];
}
