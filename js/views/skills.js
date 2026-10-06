import { h, btn, toast, openDialog, closeDialog, fmtDate } from '../ui/dom.js';
import * as S from '../core/storage.js';
import { today } from '../core/records.js';

export const GROUPS = { 'STEM thinking': ['Scientific reasoning', 'Engineering thinking', 'Computational thinking', 'Mathematical reasoning', 'Problem solving', 'Spatial reasoning'],
  'Personal development': ['Curiosity', 'Persistence', 'Creativity', 'Communication', 'Teamwork', 'Leadership', 'Initiative', 'Reflection', 'Research', 'Presentation'] };
export const LEVELS = ['Not yet observed', 'Emerging', 'Developing', 'Consistent', 'Strong evidence'];
const key = r => (r.date || '') + r.createdAt;
export const latestBySkill = recs => { const m = {}; [...recs].sort((a, b) => key(a).localeCompare(key(b))).forEach(r => { m[r.skill] = r; }); return m; };

export function skillsView(m, rerender) {
  const recs = S.read('skills'), latest = latestBySkill(recs);
  const meter = lv => h('span', { class: 'meter', 'aria-hidden': 'true' }, LEVELS.slice(1).map((_, i) => h('i', { class: i < LEVELS.indexOf(lv) ? 'on' : '' })));

  function assess(name, group, cur) {
    const lvl = h('select', { id: 'sk-l' }, LEVELS.map(l => h('option', { value: l, selected: l === cur }, l)));
    const date = h('input', { type: 'date', id: 'sk-d', value: today() });
    const ev = h('textarea', { id: 'sk-e', rows: 4 });
    const d = openDialog(name, h('div', {}, h('label', { for: 'sk-l' }, 'Development level'), lvl, h('label', { for: 'sk-d' }, 'Date'), date,
      h('label', { for: 'sk-e' }, 'Evidence supporting this assessment'), h('small', { class: 'muted' }, 'What did you actually see him do? Needed for any level above “Not yet observed”.'), ev), [
      btn('Cancel', '', () => closeDialog(d), { autofocus: true }),
      btn('Save assessment', 'primary', () => {
        if (lvl.value !== LEVELS[0] && !ev.value.trim()) { toast('Please add the evidence supporting this assessment', 'err'); ev.focus(); return; }
        try { S.add('skills', { skill: name, group, level: lvl.value, date: date.value || today(), evidence: ev.value.trim() }); closeDialog(d); toast('Assessment saved'); rerender(); } catch (e) { toast(e.message, 'err'); }
      })]);
  }

  const card = (name, group) => {
    const cur = latest[name], lv = cur ? cur.level : LEVELS[0];
    const hist = recs.filter(r => r.skill === name).sort((a, b) => key(b).localeCompare(key(a)));
    return h('article', { class: 'card skill' }, h('h3', {}, name), h('p', { class: 'lv' }, meter(lv), h('strong', {}, lv)),
      cur && cur.evidence ? h('p', {}, 'Evidence: ', cur.evidence) : h('p', { class: 'muted' }, cur ? 'No evidence note.' : 'No assessment recorded yet.'),
      h('div', { class: 'row' }, btn('Update assessment', '', () => assess(name, group, lv))),
      hist.length ? h('details', {}, h('summary', {}, `History (${hist.length})`), hist.map(r => h('div', { class: 'hist' },
        h('p', {}, h('strong', {}, fmtDate(r.date || r.createdAt) + ': ' + r.level)), r.evidence ? h('p', {}, r.evidence) : null,
        btn('Delete entry', 'danger', () => { if (confirm('Delete this history entry?')) { try { S.remove('skills', r.id); rerender(); } catch (e) { toast(e.message, 'err'); } } })))) : null);
  };
  return h('div', { class: 'page' },
    h('header', { class: 'hero g-goals' }, h('h1', { tabindex: '-1', id: 'pageTitle' }, 'Skills Development'), h('p', {}, 'Describes what has been observed. These are not scores, and nothing here is used for ranking or admission.')),
    ...Object.entries(GROUPS).map(([g, list]) => h('section', {}, h('h2', { class: 'sec' }, g), h('div', { class: 'grid wide' }, list.map(n => card(n, g))))));
}
