import { h, btn, toast, openDialog, closeDialog } from '../ui/dom.js';
import * as S from '../core/storage.js';
import { SOURCES } from '../core/records.js';
import { hero } from './data.js';

const Q = [['enjoyed', 'What did Cyllee enjoy most?'], ['independent', 'What did he learn independently?'], ['challenged', 'What challenged him?'], ['built', 'What did he build?'],
  ['solved', 'What problem did he solve?'], ['surprised', 'What surprised us?'], ['evidence', 'What evidence did we collect?'], ['skill', 'What skill appears to be developing?'],
  ['encourage', 'What should we encourage?'], ['avoid', 'What should we avoid over-directing?'], ['goal', 'What is one meaningful goal for next month?']];
let editing = null;                                   // null = list, 'new' or a record id = form

const activity = month => {
  const c = SOURCES.map(s => [s.type, S.read(s.coll).filter(r => !r.isDemo && String(r.createdAt).startsWith(month)).length]).filter(([, k]) => k);
  return c.length ? 'Records added in this month: ' + c.map(([t, k]) => `${k} ${t}`).join(', ') + '.' : 'No records were added in this month.';
};

export function monthlyView(m, rerender) {
  const all = S.read('monthlyReviews').sort((a, b) => String(b.month).localeCompare(String(a.month)));
  const wrap = h('div', { class: 'page' }, hero('reflection', 'Monthly Review', 'A short monthly look back, written together.'));
  if (editing) { wrap.append(form(editing === 'new' ? null : all.find(r => r.id === editing), all, rerender)); return wrap; }
  wrap.append(h('div', { class: 'row' }, btn('+ New monthly review', 'primary', () => { editing = 'new'; rerender(); })));
  if (!all.length) wrap.append(h('p', { class: 'muted' }, 'No monthly reviews yet.'));
  all.forEach(r => wrap.append(h('article', { class: 'card' }, h('h3', {}, 'Review for ' + r.month),
    h('details', {}, h('summary', {}, 'Show answers'), h('dl', {}, Q.filter(([k]) => r[k]).map(([k, l]) => [h('dt', {}, l), h('dd', {}, r[k])]))),
    h('div', { class: 'row' }, btn('Edit', '', () => { editing = r.id; rerender(); }), btn('Delete', 'danger', () => {
      const d = openDialog('Delete this review?', h('p', {}, `The review for ${r.month} will be permanently deleted.`), [btn('Cancel', 'primary', () => closeDialog(d), { autofocus: true }),
        btn('Delete', 'danger', () => { try { S.remove('monthlyReviews', r.id); closeDialog(d); toast('Deleted'); rerender(); } catch (e) { toast(e.message, 'err'); } })]); })))));
  return wrap;
}

function form(rec, all, rerender) {
  const month = h('input', { type: 'month', id: 'mo-m', value: rec ? rec.month : new Date().toISOString().slice(0, 7) });
  const note = h('small', { class: 'muted' }, activity(month.value));
  month.addEventListener('input', () => { note.textContent = activity(month.value); });
  const ctl = {};
  const fields = Q.map(([k, l]) => { ctl[k] = h('textarea', { id: 'mo-' + k, rows: 3 }); ctl[k].value = rec ? rec[k] || '' : ''; return h('div', { class: 'fld' }, h('label', { for: 'mo-' + k }, l), k === 'evidence' ? note : null, ctl[k]); });
  return h('form', { class: 'card', onsubmit: e => {
    e.preventDefault(); if (!month.value) { toast('Choose a month', 'err'); return; }
    const data = { month: month.value, title: 'Monthly review ' + month.value }; Q.forEach(([k]) => { data[k] = ctl[k].value.trim(); });
    const same = all.find(r => r.month === month.value && (!rec || r.id !== rec.id));
    try {
      if (same) { if (!confirm(`A review for ${month.value} already exists. Replace its answers with these?`)) return; S.update('monthlyReviews', same.id, data); if (rec) S.remove('monthlyReviews', rec.id); }
      else if (rec) S.update('monthlyReviews', rec.id, data); else S.add('monthlyReviews', data);
      editing = null; toast('Review saved'); rerender();
    } catch (er) { toast(er.message, 'err'); }
  } }, h('div', { class: 'fld' }, h('label', { for: 'mo-m' }, 'Month'), month), ...fields,
    h('div', { class: 'row' }, h('button', { type: 'submit', class: 'btn primary' }, 'Save review'), btn('Cancel', '', () => { editing = null; rerender(); })));
}
