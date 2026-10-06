// Demo records: fixed ids (so loading twice never duplicates), isDemo flag, titles start with "DEMO —".
import * as S from './storage.js';
const D = {
  achievements: [{ id: 'demo-ach-1', title: 'DEMO — Example robotics competition', date: '2026-03-01', category: 'Robotics', result: 'Example only', description: 'DEMO — replace with a real achievement.' }],
  projects: [{ id: 'demo-prj-1', title: 'DEMO — Example bridge-building project', date: '2026-02-10', stage: 'Test', problem: 'DEMO — how strong can a paper bridge be?' }],
  coding: [{ id: 'demo-cod-1', title: 'DEMO — Example number-guessing game', language: 'Python', date: '2026-04-02', concept: 'Loops' }],
  science: [{ id: 'demo-sci-1', title: 'DEMO — Does light colour change how fast a plant grows?', date: '2026-01-15', hypothesis: 'DEMO — example hypothesis.' }],
  goals: [{ id: 'demo-gol-1', title: 'DEMO — Finish a small Python project', term: 'short', status: 'Planning', priority: 'Medium', progress: 20 }],
  reflections: [{ id: 'demo-ref-1', title: 'DEMO — What I learned from a failed test', date: '2026-04-05', by: 'Student', learned: 'DEMO — example text.' }],
};
export function loadDemo() {
  let n = 0;
  S.atomic(() => { for (const [c, recs] of Object.entries(D)) { const cur = S.read(c), t = S.now(); const add = recs.filter(r => !cur.some(x => x.id === r.id)).map(r => ({ ...r, isDemo: true, createdAt: t, updatedAt: t })); if (add.length) { S.write(c, [...cur, ...add]); n += add.length; } } });
  return n;
}
