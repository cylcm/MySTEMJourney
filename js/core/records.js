// Read-only helpers that gather records from every module (used by Dashboard and Timeline).
import * as S from './storage.js';
export const SOURCES = [
  { mod: 'achievements', coll: 'achievements', type: 'Achievement', date: 'date', cat: 'category' },
  { mod: 'projects', coll: 'projects', type: 'Project', date: 'date' },
  { mod: 'robotics', coll: 'robotics', type: 'Robotics', date: 'date', cat: 'type' },
  { mod: 'coding', coll: 'coding', type: 'Coding', date: 'date', cat: 'concept' },
  { mod: 'science', coll: 'science', type: 'Science', date: 'date' },
  { mod: 'maths', coll: 'mathematics', type: 'Mathematics', date: 'date', cat: 'topic' },
  { mod: 'spatial', coll: 'visualReasoning', type: 'Spatial', date: 'date', cat: 'kind' },
  { mod: 'challenges', coll: 'stemChallenges', type: 'STEM Challenge', date: 'date', cat: 'category' },
  { mod: 'goals', coll: 'goals', type: 'Goal', date: 'createdAt', title: 'title' },
  { mod: 'reflections', coll: 'reflections', type: 'Reflection', date: 'date' },
  { mod: 'skills', coll: 'skills', type: 'Skill', date: 'date', cat: 'group', label: r => `${r.skill}: ${r.level}`, href: () => '#/skills' },
];
export const today = () => new Date().toISOString().slice(0, 10);
export const byDateDesc = (k) => (a, b) => String(b[k] || b.createdAt).localeCompare(String(a[k] || a.createdAt));

export function timelineEntries() {
  const out = [];
  for (const s of SOURCES) for (const r of S.read(s.coll)) {
    out.push({ id: r.id, type: s.type, cat: s.cat ? r[s.cat] || '' : '', isDemo: !!r.isDemo,
      date: String(r[s.date] || r.createdAt).slice(0, 10), title: s.label ? s.label(r) : r.title || '(untitled)',
      href: s.href ? s.href(r) : `#/${s.mod}/view/${r.id}` });
  }
  return out;
}
