-- ============================================
-- INCIDENTS - DEFAULT SEED DATA
-- ============================================
-- This inserts the 4 default incidents shown in the UI

INSERT INTO incidents (
  title,
  type,
  location,
  description,
  severity,
  status,
  date,
  reporter_name,
  affected_count
) VALUES
  (
    'Heavy Rainfall & Flooding',
    'Flood',
    'Nkulu Village, Guta District',
    'River overflow caused flooding across low-lying areas. 40+ families displaced.',
    'high',
    'active',
    '14–16 Jul 2026',
    'Community Observer',
    40
  ),
  (
    'Severe Water Shortage',
    'Drought',
    'Zava Village',
    'Borehole levels critically low. Livestock and crops at risk.',
    'medium',
    'active',
    '01 Jul 2026',
    'Village Elder',
    120
  ),
  (
    'Extreme Heat Warning',
    'Heatwave',
    'Chakoma Area',
    'Temperatures reached 42°C for 3 consecutive days.',
    'medium',
    'resolved',
    '10 Jul 2026',
    'EcoKubatana Team',
    0
  ),
  (
    'Strong Winds & Roof Damage',
    'Strong Winds',
    'Harare North',
    'Several homes lost roofing sheets. Community repair efforts underway.',
    'low',
    'resolved',
    '05 Jul 2026',
    'Local Volunteer',
    8
  );

-- Verify data was inserted
SELECT 
  id,
  title,
  type,
  severity,
  status,
  location
FROM incidents
ORDER BY reported_at DESC;
