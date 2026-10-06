import { h } from '../ui/dom.js';
import * as S from '../core/storage.js';

export function placeholder(m, sub) {
  const s = m.subs && m.subs.find(x => x.id === sub);
  return h('div', { class: 'page' }, h('header', { class: 'hero g-' + m.grad }, h('h1', { tabindex: '-1', id: 'pageTitle' }, m.label), s ? h('p', {}, s.label) : null),
    h('section', { class: 'card' }, h('h2', {}, 'Coming in Phase ' + m.phase),
      h('p', {}, 'The foundation is in place for this module. It is built in a later phase.'),
      m.collection ? h('p', { class: 'muted' }, `Data collection: ${m.collection} (${S.read(m.collection).length} records stored).`) : null));
}
