import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FEATURE_CATALOG } from '../lib/africaHubs';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const FeatureContext = createContext(null);
const LOCAL_KEY = 'ecokubatana_user_features';

export function useFeatures() {
  const ctx = useContext(FeatureContext);
  if (!ctx) throw new Error('useFeatures must be used within FeatureProvider');
  return ctx;
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

export function FeatureProvider({ children }) {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState(FEATURE_CATALOG);
  const [overrides, setOverrides] = useState(readLocal());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase.from('feature_catalog').select('*').order('sort_order');
      if (data?.length) {
        const keys = new Set(data.map((row) => row.key));
        const extra = FEATURE_CATALOG.filter((f) => !keys.has(f.key));
        setCatalog([...data, ...extra].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
      }
    })();
  }, []);

  useEffect(() => {
    if (!supabase || !user?.id) return;
    (async () => {
      const { data } = await supabase.from('user_features').select('feature_key, enabled').eq('user_id', user.id);
      if (data) {
        const map = {};
        data.forEach((row) => { map[row.feature_key] = row.enabled; });
        setOverrides(map);
      }
    })();
  }, [user?.id]);

  const enabledMap = useMemo(() => {
    const map = {};
    catalog.forEach((f) => {
      map[f.key] = overrides[f.key] !== undefined ? overrides[f.key] : f.default_enabled;
    });
    return map;
  }, [catalog, overrides]);

  const isEnabled = (key) => !!enabledMap[key];

  const setDraft = (key, enabled) => {
    setOverrides((prev) => ({ ...prev, [key]: enabled }));
  };

  // `next` lets a caller save overrides it has just changed, before state has re-rendered
  const save = async (next = overrides) => {
    setSaving(true);
    setSaveMsg('');
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      if (supabase && user?.id) {
        const rows = catalog.map((f) => ({
          user_id: user.id,
          feature_key: f.key,
          enabled: next[f.key] !== undefined ? next[f.key] : f.default_enabled,
          updated_at: new Date().toISOString(),
        }));
        const { error } = await supabase.from('user_features').upsert(rows);
        if (error) throw error;
      }
      setSaveMsg('Saved. Extra tabs will show in the menu.');
    } catch (error) {
      setSaveMsg(error.message || 'Could not save to the cloud; kept on this device.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle and save straight away (Settings autosaves)
  const setAndSave = (key, enabled) => {
    const next = { ...overrides, [key]: enabled };
    setOverrides(next);
    return save(next);
  };

  const technicalNav = catalog.filter((f) => f.tab_path && isEnabled(f.key));

  return (
    <FeatureContext.Provider value={{ catalog, enabledMap, isEnabled, setDraft, setAndSave, save, saving, saveMsg, technicalNav }}>
      {children}
    </FeatureContext.Provider>
  );
}
