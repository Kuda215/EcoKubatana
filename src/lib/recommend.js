import { EMERGENCY_PRIORITIES } from './africaHubs';

const ADVICE = {
  Flood: {
    family_safety: 'Move people to higher ground. Do not walk or drive flood water.',
    water: 'Use a high well or stored water. Boil before drinking.',
    food_crops: 'Lift seed and harvest off the floor. Delay field work in the wet.',
    livestock: 'Move animals off riverbanks and islands before the water rises.',
    shelter: 'Clear drains around the house. Raise bedding and grain.',
    school: 'Keep children home if the path to school is under water.',
    clinic: 'Use the clinic on dry roads. Carry a small first-aid pack.',
    roads: 'Stay off dipped roads and drifting water.',
    income: 'Move stall goods and stock to a high shelf or neighbour.',
  },
  Drought: {
    family_safety: 'Keep drinking water for people first. Share with neighbours if a well fails.',
    water: 'Store greywater. Guard the shared water point.',
    food_crops: 'Mulch basins, plant small grains, stagger what you still sow.',
    livestock: 'Protect breeding stock. Destock early if pasture is gone.',
    shelter: 'Keep the house shaded. Fix leaking tanks.',
    school: 'Send a bottle of water with each child.',
    clinic: 'Watch for heat and dehydration, especially in children.',
    roads: 'Dust roads get slick after a rare shower - still go slow.',
    income: 'Sell perishable stock early. Hold seed for the next rains.',
  },
  Heat: {
    family_safety: 'Keep the young and old in shade. Rest at midday.',
    water: 'Drink often. Keep a full jerry for the hottest hours.',
    food_crops: 'Water at dawn or night. Shade nets on young plants.',
    livestock: 'Shade and extra water for animals. Do not drive them at noon.',
    shelter: 'Open night air, close hot-side windows by day.',
    school: 'Pack water. Avoid long walks in peak heat.',
    clinic: 'Watch for dizziness and dry lips. Cool the body with cloths.',
    roads: 'Travel early. Carry water if the trip is long.',
    income: 'Open the stall at dawn. Rest the hottest hours.',
  },
  Stable: {
    family_safety: 'A quiet week - still know 995 and your meeting point.',
    water: 'Top up stored water while it is easy.',
    food_crops: 'Weed and mulch now so the next rain counts.',
    livestock: 'Check fences and water troughs while the weather is calm.',
    shelter: 'Fix small roof and drain jobs this week.',
    school: 'A normal week for school paths.',
    clinic: 'A good week to restock a small home kit.',
    roads: 'Roads should hold - still tell someone if you travel far.',
    income: 'A steady week for market. Keep a little cash aside.',
  },
};

function keyFor(item) {
  const s = String(item || '').toLowerCase().trim();
  const hit = EMERGENCY_PRIORITIES.find(
    (p) => p.value === s || p.label.toLowerCase() === s || s.includes(p.value.replaceAll('_', ' '))
  );
  return hit?.value || null;
}

export function recommendationsFor(hazard, priorities = []) {
  const kind = ADVICE[hazard] ? hazard : 'Stable';
  const table = ADVICE[kind];
  const keys = [];
  (priorities || []).forEach((p) => {
    const k = keyFor(p);
    if (k && !keys.includes(k)) keys.push(k);
  });
  if (!keys.length) keys.push('family_safety', 'water');
  return keys.slice(0, 3).map((k) => ({
    asset: EMERGENCY_PRIORITIES.find((p) => p.value === k)?.label || k,
    text: table[k] || table.family_safety,
  }));
}
