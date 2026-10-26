export const PLAYBOOK_STEPS = [
  { n: 1, key: 'safety', title: 'Get people to safety', body: 'Move to higher ground or the nearest solid building. Do not walk through flood water.', sign: 'Open both hands, palms out, and push forward - go. Then point uphill.', audio: { en: 'Step 1. Get people to safety. Move to higher ground. Do not walk through flood water.', sn: 'Nhamba 1. Endai kunzvimbo yakakwirira. Musafambe mumvura yemafashama.', nd: 'Isinyathelo 1. Hambani endaweni ephakeme. Ningahambi emanzini ezikhukhula.', sw: 'Hatua 1. Nenda mahali pa juu. Usiende kwenye maji ya mafuriko.', zu: 'Isinyathelo 1. Hambani endaweni ephakeme. Ningahambi emanzini ezikhukhula.' } },
  { n: 2, key: 'essentials', title: 'Take the essentials', body: 'People first, then IDs, medicines, torch, 3 litres of water each.', sign: 'Both hands gather to the chest, then hold up three fingers for water.', audio: { en: 'Step 2. Take people, IDs, medicines, a torch, and three litres of water each.', sn: 'Nhamba 2. Torai vanhu, zvitupa, mishonga, tochi, nemvura.', nd: 'Isinyathelo 2. Thathani abantu, izitifiketi, imithi, isibani, lamanzi.', sw: 'Hatua 2. Chukua watu, vitambulisho, dawa, tochi, na maji.', zu: 'Isinyathelo 2. Thathani abantu, imibhalo, imithi, uthoshi, namanzi.' } },
  { n: 3, key: 'call', title: 'Call for help', body: 'Police 10111. Fire 10177. Medical 999. Then tell EcoKubatana.', sign: 'Thumb and little finger to the ear - phone. Then tap the chest - you. Then point out - help.', audio: { en: 'Step 3. Call for help. Police 1 0 1 1 1. Fire 1 0 1 7 7. Medical 9 9 9.', sn: 'Nhamba 3. Ridzai rubatsiro. Mapurisa 10111. Moto 10177. Chipatara 999.', nd: 'Isinyathelo 3. Bizanani usizo. Amaphoyisa 10111. Umlilo 10177. Ukunakekelwa 999.', sw: 'Hatua 3. Piga simu ya msaada. Polisi 10111. Moto 10177. Hospitali 999.', zu: 'Isinyathelo 3. Shayela usizo. Amaphoyisa 10111. Umlilo 10177. Umkhunkulo 999.' } },
  { n: 4, key: 'neighbours', title: 'Tell neighbours', body: 'Share the alert in the language they use at home. Reply 1 if you are safe.', sign: 'Point around the circle of people, then speak with a flat hand from the mouth.', audio: { en: 'Step 4. Tell your neighbours. Use the language they speak at home. Reply 1 if you are safe.', sn: 'Nhamba 4. Udza vavakidzani. Shandisa mutauro wavanotaura kumba. Tsanangura 1 kana wakachengeteka.', nd: 'Isinyathelo 4. Tshela omakhelwane. Sebenzisa ulimi lwasekhaya. Phendula 1 uma uphephile.', sw: 'Hatua 4. Waambie majirani. Tumia lugha ya nyumbani. Jibu 1 kama uko salama.', zu: 'Isinyathelo 4. Tshela omakhelwane. Sebenzisa ulimi lwasekhaya. Phendula 1 uma uphephile.' } },
  { n: 5, key: 'after', title: 'Wait for the all-clear', body: 'Stay put until an official all-clear. Then check soil, stock and the community board.', sign: 'Both hands down, palms facing the floor - wait. Then a thumbs-up when it is safe.', audio: { en: 'Step 5. Wait for the all-clear. Do not go back until officials say it is safe.', sn: 'Nhamba 5. Mirai kusvika vatauri vati zvakanaka.', nd: 'Isinyathelo 5. Lindani kuze kube yilapho kuthiwa kuphephile.', sw: 'Hatua 5. Ngoja idhini rasmi kabla ya kurudi.', zu: 'Isinyathelo 5. Lindani kuze kuthiwe kuphephile.' } },
];

export const SIGN_VIDEO = {
  title: 'Disaster readiness in sign language (ASL, open captions)',
  youtubeId: 'AokZD9kzC-Q',
  credit: 'EMSC Innovation and Improvement Center - Be Ready series',
  extra: 'https://nid.org.za/deaf-resources/',
};

export function playbookLang(code) {
  if (['sn', 'nd', 'sw', 'zu', 'en'].includes(code)) return code;
  return 'en';
}

export function speakPlaybook(steps = PLAYBOOK_STEPS, lang = 'en') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve();
  window.speechSynthesis.cancel();
  const code = playbookLang(lang);
  const voiceLang = { en: 'en-ZA', sn: 'en-ZA', nd: 'en-ZA', sw: 'sw', zu: 'zu-ZA' }[code] || 'en-ZA';
  const text = steps.map((s) => s.audio?.[code] || s.audio?.en || `${s.title}. ${s.body}`).join(' ');
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voiceLang;
    u.rate = 0.92;
    u.onend = resolve;
    u.onerror = resolve;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(voiceLang.slice(0, 2)));
    if (match) u.voice = match;
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
}
