import { h } from '../ui/dom.js';
import * as S from '../core/storage.js';
import { MODULES } from '../core/modules.js';

const head = (m, title, sub) => h('header', { class: 'hero g-' + m.grad }, h('h1', { tabindex: '-1', id: 'pageTitle' }, title), sub ? h('p', {}, sub) : null);

export function dashboard() {
  const m = MODULES[0]; const stu = S.read('student')[0];
  const cards = MODULES.filter(x => x.collection && x.collection !== 'student').map(x => {
    const n = S.read(x.collection).filter(r => !r.isDemo).length;
    return h('a', { class: 'card tile g-' + x.grad, href: '#/' + x.id + (x.subs ? '/' + x.subs[0].id : '') },
      h('span', { class: 'tile-n' }, String(n)), h('span', {}, x.label), h('small', {}, n === 1 ? 'record' : 'records'));
  });
  return h('div', { class: 'page' },
    head(m, "Welcome to Cyllee's STEM Journey", 'Explore • Build • Solve • Create'),
    h('section', { class: 'card' }, h('h2', {}, 'Profile'),
      stu ? h('p', {}, stu.name, stu.isDemo ? h('span', { class: 'badge' }, 'DEMO') : null) : h('p', {}, 'No profile yet.'),
      h('p', { class: 'muted' }, 'Profile editing, quick actions, recent activity and the timeline arrive in the next phases.')),
    h('h2', { class: 'sec' }, 'Records so far (your own, demo excluded)'),
    h('div', { class: 'grid' }, cards));
}

export function placeholder(m, sub) {
  const s = m.subs && m.subs.find(x => x.id === sub);
  return h('div', { class: 'page' }, head(m, m.label, s ? s.label : null),
    h('section', { class: 'card' }, h('h2', {}, 'Coming in Phase ' + m.phase),
      h('p', {}, 'The foundation is in place for this module: storage, routing and backup already include it. The forms and lists are built in a later phase.'),
      m.collection ? h('p', { class: 'muted' }, `Data collection: ${m.collection} (${S.read(m.collection).length} records stored).`) : null));
}
