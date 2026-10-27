const keyFor = (userId) => `ecokubatana_my_reports_${userId || 'anon'}`;

export function loadMyReports(userId) {
  try {
    return JSON.parse(localStorage.getItem(keyFor(userId)) || '[]');
  } catch {
    return [];
  }
}

export function saveMyReport(userId, report) {
  const list = loadMyReports(userId);
  const id = report.id || `local-${Date.now()}`;
  const next = [{ ...report, id, reporter_id: report.reporter_id || userId }, ...list.filter((r) => r.id !== id)];
  try { localStorage.setItem(keyFor(userId), JSON.stringify(next.slice(0, 80))); } catch { /* ignore */ }
  return next;
}

export function mergeMine(server = [], local = []) {
  const seen = new Set();
  const out = [];
  [...server, ...local].forEach((r) => {
    const id = r.id || `${r.title}-${r.reported_at || r.date}`;
    if (seen.has(id)) return;
    seen.add(id);
    out.push(r);
  });
  return out;
}
