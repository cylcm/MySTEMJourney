import * as S from '../core/storage.js';
const APP = 'cyllee-stem-journey';

export function buildBackup() {
  const collections = {}; for (const c of S.COLLECTIONS) collections[c] = S.read(c);
  return { app: APP, schemaVersion: S.SCHEMA_VERSION, exportedAt: S.now(), collections };
}
export function downloadJSON(obj, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
  a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
export function exportBackup() {
  downloadJSON(buildBackup(), `cyllee-stem-journey-backup-${new Date().toISOString().slice(0, 10)}.json`);
  S.saveSettings({ lastBackupAt: S.now() });
}

// Validate before anything is touched. Returns {errors} or {data}.
export function parse(text) {
  let o; try { o = JSON.parse(text); } catch { return { errors: ['This file is not valid JSON, so it cannot be a backup.'] }; }
  const er = [];
  if (!o || typeof o !== 'object' || o.app !== APP) er.push('This is not a Cyllee STEM Journey backup file.');
  else {
    if (!Number.isInteger(o.schemaVersion)) er.push('The backup has no schema version.');
    else if (o.schemaVersion > S.SCHEMA_VERSION) er.push(`This backup is from a newer app version (v${o.schemaVersion}). This app supports up to v${S.SCHEMA_VERSION}. Update the app first.`);
    if (!o.collections || typeof o.collections !== 'object' || Array.isArray(o.collections)) er.push('The backup has no collections.');
    else for (const [c, arr] of Object.entries(o.collections)) {
      if (!S.COLLECTIONS.includes(c)) continue;
      if (!Array.isArray(arr)) { er.push(`"${c}" should be a list.`); continue; }
      const ids = new Set();
      arr.forEach((r, i) => {
        if (!r || typeof r !== 'object' || Array.isArray(r) || !r.id || typeof r.id !== 'string' || typeof r.createdAt !== 'string' || typeof r.updatedAt !== 'string') er.push(`${c} item ${i + 1} is missing id, createdAt or updatedAt.`);
        else if (ids.has(r.id)) er.push(`${c} contains a duplicate id.`); else ids.add(r.id);
      });
    }
  }
  return er.length ? { errors: er.slice(0, 8) } : { data: o };
}

export function plan(o) {
  const rows = [];
  for (const c of S.COLLECTIONS) {
    const inc = o.collections[c]; if (!inc) continue;
    const cur = new Map(S.read(c).map(r => [r.id, r])); let n = 0, u = 0, s = 0;
    for (const r of inc) { const x = cur.get(r.id); if (!x) n++; else if (r.updatedAt > x.updatedAt) u++; else s++; }
    rows.push({ c, n, u, s });
  }
  return rows;
}
// Merge: matches by id; the newer updatedAt wins; nothing is deleted.
export function merge(o) {
  S.atomic(() => {
    for (const c of S.COLLECTIONS) {
      const inc = o.collections[c]; if (!inc) continue;
      const map = new Map(S.read(c).map(r => [r.id, r]));
      for (const r of inc) { const x = map.get(r.id); if (!x || r.updatedAt > x.updatedAt) map.set(r.id, r); }
      S.write(c, [...map.values()]);
    }
  });
}
// Replace: downloads a safety backup of current data first, then swaps in the file's collections.
export function replace(o) {
  exportBackup();
  S.atomic(() => { for (const c of S.COLLECTIONS) if (o.collections[c]) S.write(c, o.collections[c]); });
}
