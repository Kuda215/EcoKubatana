export const AFRICA_ISO3 = new Set([
  'DZA','AGO','BEN','BWA','BFA','BDI','CMR','CPV','CAF','TCD','COM','COD','COG','CIV','DJI','EGY','GNQ','ERI','SWZ','ETH','GAB','GMB','GHA','GIN','GNB','KEN','LSO','LBR','LBY','MDG','MWI','MLI','MRT','MUS','MAR','MOZ','NAM','NER','NGA','RWA','STP','SEN','SYC','SLE','SOM','ZAF','SSD','SDN','TZA','TGO','TUN','UGA','ZMB','ZWE',
]);

export const AFRICA_HUBS = [
  { id: 'harare', name: 'Harare', country: 'Zimbabwe', iso3: 'ZWE', lat: -17.8292, lng: 31.0522, population_est: 1606000, historic_hazard: 'Drought', historic_score: 72, farmer_action: 'Mulch, stagger planting, protect seed and livestock water.' },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', iso3: 'ZAF', lat: -26.2041, lng: 28.0473, population_est: 5800000, historic_hazard: 'Flood', historic_score: 55, farmer_action: 'Clear drainage around fields; delay harvest if hail is forecast.' },
  { id: 'cape-town', name: 'Cape Town', country: 'South Africa', iso3: 'ZAF', lat: -33.9249, lng: 18.4241, population_est: 4600000, historic_hazard: 'Drought', historic_score: 88, farmer_action: 'Store greywater; protect winter vegetables.' },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', iso3: 'KEN', lat: -1.2921, lng: 36.8219, population_est: 5100000, historic_hazard: 'Flood', historic_score: 70, farmer_action: 'Raise seed stores; avoid riverbank plots in peak rains.' },
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', iso3: 'NGA', lat: 6.5244, lng: 3.3792, population_est: 21000000, historic_hazard: 'Flood', historic_score: 80, farmer_action: 'Move harvest off low ground; salt-tolerant crops inland.' },
  { id: 'accra', name: 'Accra', country: 'Ghana', iso3: 'GHA', lat: 5.6037, lng: -0.1870, population_est: 2500000, historic_hazard: 'Flood', historic_score: 74, farmer_action: 'Keep drainage clear; store grain above floor level.' },
  { id: 'addis', name: 'Addis Ababa', country: 'Ethiopia', iso3: 'ETH', lat: 9.0320, lng: 38.7469, population_est: 3600000, historic_hazard: 'Drought', historic_score: 68, farmer_action: 'Keep short-cycle seeds; share water points.' },
  { id: 'kampala', name: 'Kampala', country: 'Uganda', iso3: 'UGA', lat: 0.3476, lng: 32.5825, population_est: 1680000, historic_hazard: 'Flood', historic_score: 62, farmer_action: 'Avoid planting in wetland buffer zones.' },
  { id: 'lusaka', name: 'Lusaka', country: 'Zambia', iso3: 'ZMB', lat: -15.3875, lng: 28.3228, population_est: 3200000, historic_hazard: 'Flood', historic_score: 60, farmer_action: 'Protect wells; boil drinking water after heavy rain.' },
  { id: 'maputo', name: 'Maputo', country: 'Mozambique', iso3: 'MOZ', lat: -25.9692, lng: 32.5732, population_est: 1200000, historic_hazard: 'Cyclone', historic_score: 85, farmer_action: 'Harvest early if a storm is named; tie down stores.' },
  { id: 'beira', name: 'Beira', country: 'Mozambique', iso3: 'MOZ', lat: -19.8436, lng: 34.8389, population_est: 530000, historic_hazard: 'Cyclone', historic_score: 95, farmer_action: 'Evacuate livestock inland before landfall.' },
  { id: 'dar', name: 'Dar es Salaam', country: 'Tanzania', iso3: 'TZA', lat: -6.7924, lng: 39.2083, population_est: 7000000, historic_hazard: 'Flood', historic_score: 66, farmer_action: 'Raise seed; watch drainage in peri-urban plots.' },
  { id: 'kigali', name: 'Kigali', country: 'Rwanda', iso3: 'RWA', lat: -1.9441, lng: 30.0619, population_est: 1300000, historic_hazard: 'Landslide', historic_score: 58, farmer_action: 'Terraces and vetiver; avoid cutting slope toes.' },
  { id: 'gaborone', name: 'Gaborone', country: 'Botswana', iso3: 'BWA', lat: -24.6282, lng: 25.9231, population_est: 270000, historic_hazard: 'Drought', historic_score: 78, farmer_action: 'Prioritise livestock water; drought-tolerant sorghum/millet.' },
  { id: 'windhoek', name: 'Windhoek', country: 'Namibia', iso3: 'NAM', lat: -22.5609, lng: 17.0658, population_est: 430000, historic_hazard: 'Drought', historic_score: 82, farmer_action: 'Destock early; protect rangeland.' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', iso3: 'EGY', lat: 30.0444, lng: 31.2357, population_est: 20000000, historic_hazard: 'Heat', historic_score: 64, farmer_action: 'Shade nets; irrigate at night.' },
  { id: 'khartoum', name: 'Khartoum', country: 'Sudan', iso3: 'SDN', lat: 15.5007, lng: 32.5599, population_est: 5800000, historic_hazard: 'Flood', historic_score: 86, farmer_action: 'Move grain to higher ground.' },
  { id: 'dakar', name: 'Dakar', country: 'Senegal', iso3: 'SEN', lat: 14.7167, lng: -17.4677, population_est: 1500000, historic_hazard: 'Coastal flood', historic_score: 60, farmer_action: 'Protect coastal gardens from salt spray.' },
  { id: 'bamako', name: 'Bamako', country: 'Mali', iso3: 'MLI', lat: 12.6392, lng: -8.0029, population_est: 2700000, historic_hazard: 'Flood', historic_score: 70, farmer_action: 'Move livestock off river islands.' },
  { id: 'niamey', name: 'Niamey', country: 'Niger', iso3: 'NER', lat: 13.5116, lng: 2.1254, population_est: 1300000, historic_hazard: 'Drought', historic_score: 84, farmer_action: 'Millet/cowpea; destock before pasture collapse.' },
  { id: 'ndjamena', name: "N'Djamena", country: 'Chad', iso3: 'TCD', lat: 12.1348, lng: 15.0557, population_est: 1500000, historic_hazard: 'Flood', historic_score: 76, farmer_action: 'Evacuate riverbank fields early.' },
  { id: 'mogadishu', name: 'Mogadishu', country: 'Somalia', iso3: 'SOM', lat: 2.0469, lng: 45.3182, population_est: 2600000, historic_hazard: 'Drought', historic_score: 90, farmer_action: 'Protect breeding stock; water trucking points.' },
  { id: 'antananarivo', name: 'Antananarivo', country: 'Madagascar', iso3: 'MDG', lat: -18.8792, lng: 47.5079, population_est: 3400000, historic_hazard: 'Cyclone', historic_score: 80, farmer_action: 'Harvest rice before named storms.' },
  { id: 'kinshasa', name: 'Kinshasa', country: 'DR Congo', iso3: 'COD', lat: -4.4419, lng: 15.2663, population_est: 15000000, historic_hazard: 'Flood', historic_score: 72, farmer_action: 'Keep seed above flood line.' },
  { id: 'luanda', name: 'Luanda', country: 'Angola', iso3: 'AGO', lat: -8.8383, lng: 13.2344, population_est: 8300000, historic_hazard: 'Flood', historic_score: 58, farmer_action: 'Mulch; protect peri-urban horticulture.' },
  { id: 'abidjan', name: 'Abidjan', country: "Côte d'Ivoire", iso3: 'CIV', lat: 5.3600, lng: -4.0083, population_est: 5200000, historic_hazard: 'Flood', historic_score: 68, farmer_action: 'Elevate stores; delay field work in peak rain.' },
];

export const LIVELIHOODS = [
  { value: 'farmer', icon: '🌾', label: 'Farmer' },
  { value: 'health_worker', icon: '🩺', label: 'Health worker' },
  { value: 'teacher', icon: '📚', label: 'Teacher' },
  { value: 'trader', icon: '🧺', label: 'Market trader' },
  { value: 'community_leader', icon: '🗣️', label: 'Community leader' },
  { value: 'emergency_responder', icon: '🚑', label: 'Emergency responder' },
  { value: 'student', icon: '🎓', label: 'Student' },
  { value: 'other', icon: '🏠', label: 'Household / other' },
];

export const EMERGENCY_PRIORITIES = [
  { value: 'family_safety', label: 'Family safety' },
  { value: 'water', label: 'Clean water' },
  { value: 'food_crops', label: 'Food crops' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'shelter', label: 'Shelter / home' },
  { value: 'school', label: 'School' },
  { value: 'clinic', label: 'Clinic / health' },
  { value: 'roads', label: 'Roads / access' },
  { value: 'income', label: 'Income / market' },
];

export const DEFAULT_PRIORITIES = {
  farmer: ['family_safety', 'food_crops', 'livestock', 'water'],
  health_worker: ['family_safety', 'clinic', 'water'],
  teacher: ['family_safety', 'school', 'water'],
  trader: ['family_safety', 'income', 'roads'],
  community_leader: ['family_safety', 'shelter', 'water'],
  emergency_responder: ['family_safety', 'roads', 'clinic'],
  student: ['family_safety', 'school'],
  other: ['family_safety', 'water', 'shelter'],
};

export const FEATURE_CATALOG = [
  { key: 'forecast_lab', label: 'Forecast analysis', description: '7-day and river-discharge outlooks (Open-Meteo + Copernicus GloFAS).', is_premium: true, default_enabled: false, tab_path: '/forecast-lab', icon: '📈', sort_order: 10 },
  { key: 'historic_intel', label: 'Historic disaster intelligence', description: 'Past disasters from ReliefWeb / EM-DAT-style records.', is_premium: true, default_enabled: false, tab_path: '/historic-intel', icon: '📜', sort_order: 20 },
  { key: 'hazard_flags', label: 'Hazard flagging', description: 'Live wildfire, flood and drought flags from NASA EONET and weather models.', is_premium: true, default_enabled: false, tab_path: '/hazard-flags', icon: '🚩', sort_order: 30 },
  { key: 'population_risk', label: 'Population at risk', description: 'Who lives in exposed areas (World Bank / WorldPop-style).', is_premium: true, default_enabled: false, tab_path: '/population-risk', icon: '👥', sort_order: 40 },
  { key: 'osm_community', label: 'Community map layer', description: 'OpenStreetMap community context on the home map.', is_premium: false, default_enabled: true, tab_path: null, icon: '🗺️', sort_order: 50 },
  { key: 'ussd', label: '*123# phone', description: 'Feature-phone USSD simulator. Hidden from the menu until you turn it on here.', is_premium: false, default_enabled: false, tab_path: '/ussd', icon: '📟', sort_order: 60 },
];
