import { h } from '../ui/dom.js';
import { real, demoToggle, hero } from './data.js';
import * as S from '../core/storage.js';

const n = (c, f) => real(c).filter(f || (() => true)).length;
const A = [
  ['independent scientific investigation', () => n('science'), 'Complete a small investigation and document: Question → Hypothesis → Experiment → Result → Reflection.'],
  ['robotics and engineering work', () => n('robotics') + n('stemChallenges'), 'Record one build: the problem, what failed, what changed, and what he would test next.'],
  ['coding / Python', () => n('coding'), 'Record one program: the problem, a bug he found, how he debugged it and what he learned.'],
  ['mathematical reasoning', () => n('mathematics'), 'Choose one tricky problem and record the first approach, where he got stuck and the breakthrough.'],
  ['visual and spatial reasoning', () => n('visualReasoning'), 'Record a visual puzzle or construction and how he worked it out.'],
  ['projects taken from idea to result', () => n('projects'), 'Take one idea through Idea → Design → Build → Test → Improve and record each step.'],
  ['reflection', () => n('reflections'), 'After the next project, write a short reflection: what went wrong and what he would change.'],
  ['teamwork', () => n('achievements', r => r.team === 'Team') + n('robotics', r => r.teamwork), 'Record a team activity, his role, and how any disagreement was handled.'],
  ['competitions and events', () => n('robotics', r => r.type === 'Competition') + n('achievements', r => r.category === 'Competition'), 'Record the next event and what he learned, whatever the result.'],
  ['interview practice', () => n('interviews'), 'Answer one practice question in his own words.'],
  ['saved evidence (certificates, photos, feedback)', () => n('evidence'), 'Add the details of one certificate, photo or piece of feedback.'],
  ['skills assessed with evidence', () => n('skills'), 'Update one skill with a note on what he was seen doing.'],
];
const level = c => (c === 0 ? 0 : c === 1 ? 1 : c < 4 ? 2 : 3);
const NAMES = ['Not yet documented', 'Limited evidence', 'Developing evidence', 'Strong evidence'];

export function gapsView(m, rerender) {
  const rows = A.map(([what, fn, action]) => ({ what, c: fn(), action })).map(r => ({ ...r, lv: level(r.c) }));
  const sentence = r => (r.lv === 0 ? `Not yet documented: ${r.what}.` : `${NAMES[r.lv]} of ${r.what}.`);
  const groups = [0, 1, 2, 3].map(lv => [lv, rows.filter(r => r.lv === lv)]).filter(([, l]) => l.length);
  return h('div', { class: 'page' }, hero('goals', 'What should we develop next?', 'Based only on what is in the journal. It describes recorded evidence, not ability.'),
    demoToggle(rerender),
    h('section', { class: 'card' }, h('p', {}, 'How to read this: 0 records = Not yet documented, 1 = Limited, 2–3 = Developing, 4 or more = Strong evidence. Missing evidence usually means it has not been written down yet.')),
    ...groups.map(([lv, list]) => h('section', {}, h('h2', { class: 'sec' }, NAMES[lv]), h('div', { class: 'grid wide' }, list.map(r => h('article', { class: 'card' },
      h('p', {}, h('span', { class: 'meter', 'aria-hidden': 'true' }, [0, 1, 2].map(i => h('i', { class: i < r.lv ? 'on' : '' }))), h('strong', {}, sentence(r))),
      h('p', { class: 'muted' }, `${r.c} related record${r.c === 1 ? '' : 's'}`), r.lv < 3 ? h('p', {}, 'Next step: ' + r.action) : h('p', {}, 'Keep encouraging whatever interests him here.')))))));
}
