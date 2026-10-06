import { h } from '../ui/dom.js';
import { timelineEntries } from '../core/records.js';
import { fmtDate } from '../ui/dom.js';

export function timelineView(m) {
  const all = timelineEntries(), box = h('div', {});
  const uniq = f => [...new Set(all.map(f).filter(Boolean))].sort();
  const sel = (id, label, vals) => h('div', { class: 'fld' }, h('label', { for: id }, label), h('select', { id, onchange: draw }, h('option', { value: '' }, 'All'), vals.map(v => h('option', { value: v }, v))));
  const ctl = h('div', { class: 'filters' }, sel('tl-y', 'Year', uniq(e => e.date.slice(0, 4)).reverse()), sel('tl-t', 'Type', uniq(e => e.type)), sel('tl-c', 'Category', uniq(e => e.cat)),
    h('div', { class: 'fld' }, h('label', { for: 'tl-o' }, 'Order'), h('select', { id: 'tl-o', onchange: draw }, h('option', { value: 'asc' }, 'Oldest first'), h('option', { value: 'desc' }, 'Newest first'))));
  function draw() {
    const v = id => document.getElementById(id).value;
    let rows = all.filter(e => (!v('tl-y') || e.date.startsWith(v('tl-y'))) && (!v('tl-t') || e.type === v('tl-t')) && (!v('tl-c') || e.cat === v('tl-c')));
    rows.sort((a, b) => (v('tl-o') === 'desc' ? -1 : 1) * a.date.localeCompare(b.date));
    if (!rows.length) { box.replaceChildren(h('p', { class: 'muted' }, all.length ? 'No records match these filters.' : 'The timeline fills in automatically as records are added.')); return; }
    const groups = []; rows.forEach(e => { const y = e.date.slice(0, 4); if (!groups.length || groups[groups.length - 1][0] !== y) groups.push([y, []]); groups[groups.length - 1][1].push(e); });
    box.replaceChildren(...groups.map(([y, list]) => h('section', {}, h('h2', { class: 'sec' }, y), h('ol', { class: 'tl' }, list.map(e =>
      h('li', {}, h('time', { datetime: e.date }, fmtDate(e.date)), h('span', { class: 'badge' }, e.type), h('a', { href: e.href }, e.title), e.cat ? h('small', { class: 'muted' }, ' ' + e.cat) : null, e.isDemo ? h('span', { class: 'badge' }, 'DEMO') : null))))));
  }
  const page = h('div', { class: 'page' }, h('header', { class: 'hero g-dashboard' }, h('h1', { tabindex: '-1', id: 'pageTitle' }, 'Development Timeline'), h('p', {}, 'Built automatically from the records you have saved.')), h('section', { class: 'card' }, ctl), box);
  queueMicrotask(draw); setTimeout(draw, 0);
  return page;
}
