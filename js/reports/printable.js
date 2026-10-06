import { h } from '../ui/dom.js';
import * as S from '../core/storage.js';
import { CONFIGS } from '../modules/configs.js';
import { show } from '../modules/engine.js';
import { timelineEntries, byDateDesc } from '../core/records.js';
import { latestBySkill } from '../views/skills.js';
import { buildStory, renderSections } from './story.js';
import { real, opts, demoToggle, hero, printBtn } from './data.js';
import { fmtDate } from '../ui/dom.js';

const LABEL = { achievements: 'Achievements', projects: 'Projects', robotics: 'Robotics & engineering', coding: 'Coding', science: 'Science investigations', maths: 'Mathematics', spatial: 'Visual / spatial reasoning', challenges: 'STEM challenges', goals: 'Goals', reflections: 'Reflections', evidence: 'Evidence', interviews: 'Interview practice' };
const recs = k => real(CONFIGS[k].collection);
const none = () => h('p', { class: 'muted' }, 'Not yet documented.');
const block = (k, r) => { const c = CONFIGS[k]; return h('article', { class: 'rb' }, h('h3', {}, r[c.title] || 'Untitled'), h('dl', {}, c.fields.filter(f => f.k !== c.title && show(f, r[f.k]) !== '').map(f => [h('dt', {}, f.label), h('dd', {}, show(f, r[f.k]))]))); };
const section = (title, k, list = recs(k)) => [h('h2', {}, `${title} (${list.length})`), ...(list.length ? [...list].sort(byDateDesc(CONFIGS[k].date)).map(r => block(k, r)) : [none()])];
const profile = () => { const s = S.read('student')[0]; if (!s || (s.isDemo && !opts.demo)) return [h('h2', {}, 'Student profile'), h('p', { class: 'muted' }, 'Profile not filled in yet.')];
  const rows = [['Name', s.name], ['Age', s.age], ['School', s.school], ['Current level', s.level], ['Interests', s.interests], ['Favourite STEM areas', s.favStem], ['Other interests', s.otherInterests], ['Aspirations', s.aspirations]].filter(r => r[1]);
  return [h('h2', {}, 'Student profile'), s.photo ? h('img', { class: 'avatar', src: s.photo, alt: '' }) : null, h('dl', {}, rows.map(([a, b]) => [h('dt', {}, a), h('dd', {}, b)]))]; };
const skills = () => { const l = Object.values(latestBySkill(real('skills'))); return [h('h2', {}, 'Skills development'), l.length ? h('ul', {}, l.map(r => h('li', {}, `${r.skill}: ${r.level}` + (r.evidence ? ' — ' + r.evidence : '')))) : none(), h('p', { class: 'muted' }, 'Levels describe what has been observed. They are not scores.')]; };
const titles = (title, k) => { const l = recs(k); return [h('h2', {}, title), l.length ? h('ul', {}, l.map(r => h('li', {}, r[CONFIGS[k].title]))) : none()]; };
let year = String(new Date().getFullYear());

const REPORTS = {
  portfolio: ['Full STEM Portfolio', () => [...profile(), ...Object.keys(LABEL).flatMap(k => section(LABEL[k], k)), ...skills()]],
  profile1: ['One-page Student Profile', () => [...profile(), ...titles('Achievements', 'achievements'), ...titles('Projects', 'projects'), ...skills(), ...titles('Goals', 'goals')]],
  projects: ['Project Portfolio', () => section('Projects', 'projects')],
  robotics: ['Robotics Summary', () => section('Robotics & engineering', 'robotics')],
  coding: ['Coding Summary', () => section('Coding', 'coding')],
  competitions: ['Competition Summary', () => [...section('Competitions and events (achievements)', 'achievements', recs('achievements').filter(r => r.category === 'Competition' || r.event)), ...section('Robotics competitions', 'robotics', recs('robotics').filter(r => r.type === 'Competition'))]],
  development: ['STEM Development Summary', () => [h('h2', {}, 'Records by area'), h('ul', {}, Object.keys(LABEL).map(k => h('li', {}, `${LABEL[k]}: ${recs(k).length}`))), ...renderSections(buildStory().filter(s => ['What has he learned?', 'How has he improved?', 'What skills are emerging?'].includes(s.title)))]],
  skills: ['Skills Development Summary', () => skills()],
  sst: ['SST/DSA Preparation Summary', () => { const l = S.read('sstPrep').filter(r => r.available || r.developing || r.needed || r.next);
    return [h('p', { class: 'muted' }, 'Preparation categories only, not official admission criteria unless separately verified. No scores or rankings are produced.'),
      ...(l.length ? l.map(r => h('article', { class: 'rb' }, h('h3', {}, r.title), h('dl', {}, [['Evidence available', r.available], ['Evidence developing', r.developing], ['Evidence needed', r.needed], ['Next action', r.next]].filter(x => x[1]).map(([a, b]) => [h('dt', {}, a), h('dd', {}, b)])))) : [none()])]; }],
  interview: ['Interview Preparation Summary', () => section('Interview practice', 'interviews')],
  year: ['Year-in-Review', () => { const e = timelineEntries().filter(x => (opts.demo || !x.isDemo) && x.date.startsWith(year)); const types = [...new Set(e.map(x => x.type))];
    return [h('h2', {}, `Year in review: ${year}`), e.length ? h('p', {}, `${e.length} records: ` + types.map(t => `${e.filter(x => x.type === t).length} ${t}`).join(', ') + '.') : none(),
      ...types.flatMap(t => [h('h3', {}, t), h('ul', {}, e.filter(x => x.type === t).sort((a, b) => a.date.localeCompare(b.date)).map(x => h('li', {}, `${fmtDate(x.date)}: ${x.title}`)))])]; }],
};
let cur = 'portfolio';

export function printableView(m, rerender) {
  const [title, build] = REPORTS[cur];
  const years = [...new Set(timelineEntries().map(x => x.date.slice(0, 4)).concat(year))].sort().reverse();
  const sel = h('select', { id: 'rp', onchange: e => { cur = e.target.value; rerender(); } }, Object.entries(REPORTS).map(([k, [l]]) => h('option', { value: k, selected: k === cur }, l)));
  return h('div', { class: 'page' }, hero('science', 'Printable Reports', 'Built from recorded data only. Use Print, then choose “Save as PDF” to keep a copy.'),
    h('section', { class: 'card noprint' }, h('div', { class: 'filters' }, h('div', { class: 'fld' }, h('label', { for: 'rp' }, 'Report'), sel),
      cur === 'year' ? h('div', { class: 'fld' }, h('label', { for: 'rp-y' }, 'Year'), h('select', { id: 'rp-y', onchange: e => { year = e.target.value; rerender(); } }, years.map(y => h('option', { value: y, selected: y === year }, y)))) : null),
      h('div', { class: 'row' }, demoToggle(rerender), printBtn())),
    h('section', { class: 'card report' }, h('h1', {}, title), h('p', { class: 'muted' }, 'Cyllee STEM Journey. Generated ' + fmtDate(new Date().toISOString()) + '. Based only on recorded information.'), ...build()));
}
