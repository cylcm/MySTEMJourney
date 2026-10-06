import { h } from '../ui/dom.js';
import * as S from '../core/storage.js';
import { opts, real, trunc, filled, demoToggle, hero, printBtn } from './data.js';

const nice = (l, c, tk = 'title') => { const r = real(c); return r.length ? `${l} (${r.length}): ${r.slice(0, 5).map(x => x[tk]).filter(Boolean).join('; ')}` : null; };

// Builds the story ONLY from saved records. Empty sections stay empty.
export function buildStory() {
  const st = S.read('student')[0], ok = st && (opts.demo || !st.isDemo);
  const R = { ach: real('achievements'), prj: real('projects'), rob: real('robotics'), cod: real('coding'), sci: real('science'), mat: real('mathematics'), sp: real('visualReasoning'), ch: real('stemChallenges'), ref: real('reflections'), goal: real('goals'), sk: real('skills') };
  const hist = {}; [...R.sk].sort((a, b) => ((a.date || '') + a.createdAt).localeCompare((b.date || '') + b.createdAt)).forEach(r => (hist[r.skill] = hist[r.skill] || []).push(r));
  const latest = Object.values(hist).map(l => l[l.length - 1]).filter(r => r.level !== 'Not yet observed');
  const moved = Object.entries(hist).filter(([, l]) => l.length > 1 && l[0].level !== l[l.length - 1].level).map(([k, l]) => `${k}: ${l[0].level} → ${l[l.length - 1].level}`);
  const sec = (title, items) => ({ title, items: items.filter(Boolean) });
  return [
    sec('Who is Cyllee?', ok ? [[st.name, st.age && 'Age ' + st.age, st.school, st.level].filter(Boolean).join(', '), st.aspirations && 'Aspirations: ' + st.aspirations] : []),
    sec('What interests him?', ok ? [st.interests && 'Interests: ' + st.interests, st.favStem && 'Favourite STEM areas: ' + st.favStem, st.otherInterests && 'Other interests: ' + st.otherInterests] : []),
    sec('What has he explored?', [nice('Robotics', 'robotics'), nice('Coding', 'coding'), nice('Science investigations', 'science'), nice('Mathematics problems', 'mathematics'), nice('Visual / spatial reasoning', 'visualReasoning'), nice('STEM challenges', 'stemChallenges')]),
    sec('What has he built?', [...R.prj.map(p => p.title + (p.result ? ': ' + trunc(p.result) : '')), ...R.rob.map(r => 'Robotics: ' + r.title)]),
    sec('What problems has he solved?', [...filled(R.mat, 'solution'), ...filled(R.sci, 'conclusion'), ...filled(R.ref, 'solved')]),
    sec('What challenges has he faced?', [...filled(R.prj, 'failures'), ...filled(R.rob, 'failed'), ...filled(R.ach, 'challenge'), ...filled(R.ch, 'failure'), ...filled(R.cod, 'bugs'), ...filled(R.ref, 'difficult')]),
    sec('What has he learned?', [...filled(R.prj, 'lessons'), ...filled(R.rob, 'lessons'), ...filled(R.ach, 'learned'), ...filled(R.cod, 'learned'), ...filled(R.ref, 'learned')]),
    sec('How has he improved?', [...moved, ...filled(R.prj, 'improvements'), ...filled(R.rob, 'changed'), ...filled(R.ch, 'improvement'), ...filled(R.sci, 'improvement')]),
    sec('What skills are emerging?', latest.map(r => `${r.skill}: ${r.level}` + (r.evidence ? ' — ' + trunc(r.evidence, 160) : ''))),
    sec('What does he want to explore next?', [...R.goal.filter(g => g.status !== 'Completed').map(g => 'Goal: ' + g.title), ...filled(R.ref, 'learnNext'), ...filled(R.prj, 'next'), ...filled(R.sci, 'further')]),
  ];
}

export function renderSections(sections, cap = 12) {
  return sections.map(s => h('section', { class: 'rb' }, h('h2', {}, s.title), s.items.length
    ? h('ul', {}, s.items.slice(0, cap).map(i => h('li', {}, i)), s.items.length > cap ? h('li', { class: 'muted' }, `…and ${s.items.length - cap} more in the records`) : null)
    : h('p', { class: 'muted' }, 'Not yet documented.')));
}

export function storyView(m, rerender) {
  return h('div', { class: 'page' }, hero('science', 'Cyllee Story', 'Compiled only from what has been recorded. Nothing is added or guessed.'),
    h('div', { class: 'row' }, demoToggle(rerender), printBtn()),
    h('section', { class: 'card report' }, h('h1', { class: 'only-print' }, 'Cyllee Story'), ...renderSections(buildStory())));
}
