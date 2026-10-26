import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'ecokubatana_access';
const AccessContext = createContext(null);

const DEFAULTS = {
  dyslexiaFont: false,
  colorBlind: false,
  bigTargets: false,
  smsOnly: false,
  highContrast: false,
  reduceMotion: false,
};

function read() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

function apply(flags) {
  const b = document.body;
  b.classList.toggle('dyslexia-font', !!flags.dyslexiaFont);
  b.classList.toggle('colorblind', !!flags.colorBlind);
  b.classList.toggle('big-targets', !!flags.bigTargets);
  b.classList.toggle('sms-only', !!flags.smsOnly);
  b.classList.toggle('high-contrast', !!flags.highContrast);
  b.classList.toggle('reduce-motion', !!flags.reduceMotion);
}

export function AccessProvider({ children }) {
  const [flags, setFlags] = useState(read);

  useEffect(() => {
    apply(flags);
    localStorage.setItem(KEY, JSON.stringify(flags));
  }, [flags]);

  const setFlag = (key, value) => setFlags((prev) => ({ ...prev, [key]: value }));

  return (
    <AccessContext.Provider value={{ flags, setFlag }}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error('useAccess must be used within AccessProvider');
  return ctx;
}
