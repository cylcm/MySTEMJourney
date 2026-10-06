// Storage layer: the ONLY place that touches localStorage.
// Rule: startup only reads. Keys are created only when missing; nothing is ever overwritten here.
export const PREFIX = 'csj:';
export const SCHEMA_VERSION = 1;
export const COLLECTIONS = ['student', 'achievements', 'projects', 'robotics', 'coding', 'science',
  'mathematics', 'visualReasoning', 'stemChallenges', 'goals', 'reflections', 'skills', 'evidence',
  'interviews', 'monthlyReviews', 'sstPrep', 'settings'];
const key = n => PREFIX + n;
export const now = () => new Date().toISOString();
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() :
  'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

export function init() {
  const out = { firstRun: false, corrupt: [], newerVersion: false };
  const metaRaw = localStorage.getItem(key('meta'));
  if (metaRaw === null) {
    out.firstRun = true;
    localStorage.setItem(key('meta'), JSON.stringify({ schemaVersion: SCHEMA_VERSION, createdAt: now() }));
  } else {
    try { out.newerVersion = JSON.parse(metaRaw).schemaVersion > SCHEMA_VERSION; } catch { out.corrupt.push('meta'); }
  }
  for (const c of COLLECTIONS) {
    const raw = localStorage.getItem(key(c));
    if (raw === null) localStorage.setItem(key(c), '[]');           // create only if absent
    else { try { if (!Array.isArray(JSON.parse(raw))) throw 0; } catch { out.corrupt.push(c); } }
  }
  // Future migrations go here and run only when stored schemaVersion < SCHEMA_VERSION.
  return out;
}

export function read(name) {
  const raw = localStorage.getItem(key(name));
  if (raw === null) return [];
  const v = JSON.parse(raw);
  if (!Array.isArray(v)) throw new Error(name + ' is unreadable');
  return v;
}

export function write(name, arr) {
  const s = JSON.stringify(arr);
  try { localStorage.setItem(key(name), s); }
  catch { throw new Error('Could not save: browser storage is full or blocked. Export a backup and free some space.'); }
  if (localStorage.getItem(key(name)) !== s) throw new Error('Save could not be verified. Nothing was lost; please try again.');
}

export function add(name, data) {
  const t = now(); const rec = { ...data, id: uid(), createdAt: t, updatedAt: t };
  write(name, [...read(name), rec]); return rec;
}
export function update(name, id, patch) {
  const list = read(name); const i = list.findIndex(r => r.id === id);
  if (i < 0) throw new Error('Record not found');
  list[i] = { ...list[i], ...patch, id, updatedAt: now() }; write(name, list); return list[i];
}
export function remove(name, id) { write(name, read(name).filter(r => r.id !== id)); }

export function getSettings() {
  const s = read('settings')[0];
  return s || { textSize: 'normal', backupReminderDays: 30, lastBackupAt: null };
}
export function saveSettings(patch) {
  const list = read('settings'); const t = now();
  if (list[0]) list[0] = { ...list[0], ...patch, updatedAt: t };
  else list.push({ textSize: 'normal', backupReminderDays: 30, lastBackupAt: null, ...patch, id: uid(), createdAt: t, updatedAt: t });
  write('settings', list);
}

export function snapshot() { const o = {}; for (const c of COLLECTIONS) o[c] = localStorage.getItem(key(c)); return o; }
export function restoreSnapshot(o) { for (const [c, v] of Object.entries(o)) if (v !== null) localStorage.setItem(key(c), v); }

// Runs fn; if anything fails part-way, puts every collection back as it was.
export function atomic(fn) {
  const snap = snapshot();
  try { return fn(); } catch (e) { restoreSnapshot(snap); throw e; }
}

export function usedBytes() {
  let n = 0;
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(PREFIX)) n += (k.length + localStorage.getItem(k).length) * 2; }
  return n;
}
export function rawDump() {
  const o = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(PREFIX)) o[k] = localStorage.getItem(k); }
  return o;
}
// Only called from the confirmed Reset dialog.
export function wipeAll() {
  const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(PREFIX)) ks.push(k); }
  ks.forEach(k => localStorage.removeItem(k));
}
export function removeDemo() {
  atomic(() => { for (const c of COLLECTIONS) { const l = read(c); const k = l.filter(r => !r.isDemo); if (k.length !== l.length) write(c, k); } });
}
export function hasRealRecords() {
  return COLLECTIONS.some(c => c !== 'settings' && read(c).some(r => !r.isDemo));
}
