import { h } from './dom.js';
import { MODULES } from '../core/modules.js';
import { showInstallHelp } from '../pwa/banner.js';

// Accordion behaviour comes from the route: only the active module is expanded.
export function buildSidebar(el) {
  const items = MODULES.map(m => {
    const hasSubs = !!m.subs;
    const head = hasSubs
      ? h('button', { type: 'button', class: 'nav-link', 'aria-expanded': 'false', 'aria-controls': 'sub-' + m.id,
          onclick: () => { location.hash = `#/${m.id}/${m.subs[0].id}`; } },
          h('span', { class: 'dot g-' + m.grad, 'aria-hidden': 'true' }), h('span', { class: 'lbl' }, m.label), h('span', { class: 'chev', 'aria-hidden': 'true' }, '▾'))
      : h('a', { class: 'nav-link', href: '#/' + m.id },
          h('span', { class: 'dot g-' + m.grad, 'aria-hidden': 'true' }), h('span', { class: 'lbl' }, m.label));
    const sub = hasSubs ? h('ul', { class: 'sub', id: 'sub-' + m.id, hidden: true },
      m.subs.map(s => h('li', {}, h('a', { href: `#/${m.id}/${s.id}`, 'data-sub': s.id }, s.label)))) : null;
    return h('li', { 'data-mod': m.id }, head, sub);
  });
  el.append(
    h('div', { class: 'brand' }, h('div', { class: 'brand-name' }, 'Cyllee STEM Journey'), h('div', { class: 'brand-sub' }, 'Explore • Build • Solve • Create')),
    h('button', { type: 'button', class: 'btn pill', id: 'installPill', onclick: showInstallHelp }, '📲 Install / Add to Home Screen'),
    h('nav', { 'aria-label': 'Main menu' }, h('ul', { class: 'nav' }, items)));
}

export function updateSidebar(el, modId, subId) {
  el.querySelectorAll('li[data-mod]').forEach(li => {
    const active = li.dataset.mod === modId;
    li.classList.toggle('active', active);
    const head = li.firstElementChild;
    if (head.tagName === 'BUTTON') head.setAttribute('aria-expanded', String(active));
    if (active) head.setAttribute('aria-current', subId ? 'true' : 'page'); else head.removeAttribute('aria-current');
    const sub = li.querySelector('.sub'); if (sub) sub.hidden = !active;
    li.querySelectorAll('.sub a').forEach(a => { if (active && a.dataset.sub === subId) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  });
}

export function setupDrawer() {
  const body = document.body, btn = document.getElementById('menuBtn');
  const set = open => { body.classList.toggle('drawer-open', open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => set(!body.classList.contains('drawer-open')));
  document.getElementById('scrim').addEventListener('click', () => set(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  window.addEventListener('hashchange', () => set(false));       // closes after choosing a module
  return { close: () => set(false) };
}
