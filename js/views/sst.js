import { h, btn, toast, openDialog, closeDialog } from '../ui/dom.js';
import * as S from '../core/storage.js';

const n = (c, f) => S.read(c).filter(f || (() => true)).length;
const AREAS = [
  ['stem', 'Real-world STEM reasoning', () => n('projects')],
  ['eng', 'Engineering / LEGO design challenges', () => n('robotics') + n('stemChallenges')],
  ['py', 'Python logic problems', () => n('coding')],
  ['sci', 'Science investigation questions', () => n('science')],
  ['math', 'Mathematics problem solving', () => n('mathematics')],
  ['spatial', 'Visual / spatial reasoning', () => n('visualReasoning')],
  ['change', '“What would you change and why?”', () => n('stemChallenges', r => r.change) + n('robotics', r => r.redesign) + n('reflections', r => r.whyChange)],
  ['group', 'Group STEAM challenges', () => n('stemChallenges') + n('achievements', r => r.team === 'Team')],
  ['mock', 'Mock written assessment', () => 0],
  ['interview', 'Interview practice', () => n('interviews')],
];
const BLOCKS = [['available', 'Evidence available'], ['developing', 'Evidence developing'], ['needed', 'Evidence needed'], ['next', 'Next action']];

export function sstView(m, rerender) {
  const recs = S.read('sstPrep');
  function edit(key, label, rec) {
    const ctl = {};
    const body = h('div', {}, BLOCKS.map(([k, l]) => { ctl[k] = h('textarea', { id: 'ss-' + k, rows: 3 }); ctl[k].value = (rec && rec[k]) || ''; return h('div', { class: 'fld' }, h('label', { for: 'ss-' + k }, l), ctl[k]); }));
    const d = openDialog(label, body, [btn('Cancel', '', () => closeDialog(d), { autofocus: true }), btn('Save', 'primary', () => {
      const data = { area: key, title: label }; BLOCKS.forEach(([k]) => { data[k] = ctl[k].value.trim(); });
      try { rec ? S.update('sstPrep', rec.id, data) : S.add('sstPrep', data); closeDialog(d); toast('Saved'); rerender(); } catch (e) { toast(e.message, 'err'); }
    })]);
  }
  const card = ([key, label, count]) => {
    const rec = recs.find(r => r.area === key), c = count();
    return h('article', { class: 'card' }, h('h3', {}, label), h('p', { class: 'muted' }, c ? `${c} related record${c === 1 ? '' : 's'} in this journal.` : 'No related records in this journal yet.'),
      h('dl', {}, BLOCKS.map(([k, l]) => [h('dt', {}, l), h('dd', {}, rec && rec[k] ? rec[k] : 'Not written yet')])),
      h('div', { class: 'row' }, btn('Edit notes', '', () => edit(key, label, rec))));
  };
  return h('div', { class: 'page' },
    h('header', { class: 'hero g-goals' }, h('h1', { tabindex: '-1', id: 'pageTitle' }, 'SST / DSA Preparation'),
      h('p', {}, 'These are preparation categories, not official admission criteria unless you verify them separately.')),
    h('section', { class: 'card' }, h('p', {}, 'This page never produces scores, probabilities or comparisons with other students. The notes are yours; the record counts only show what is already in the journal.')),
    ...AREAS.map(card));
}
