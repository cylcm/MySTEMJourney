// Shared helpers for reports. Reports use recorded data only; DEMO records are excluded unless switched on.
import { h } from '../ui/dom.js';
import * as S from '../core/storage.js';
export const opts = { demo: false };
export const real = c => S.read(c).filter(r => opts.demo || !r.isDemo);
export const trunc = (s, n = 240) => { s = String(s).trim().replace(/\s+/g, ' '); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
export const filled = (recs, field, tk = 'title') => recs.filter(r => r[field] && String(r[field]).trim()).map(r => `${r[tk] || 'Untitled'}: ${trunc(r[field])}`);
export const demoToggle = rerender => h('label', { class: 'noprint chk' }, h('input', { type: 'checkbox', checked: opts.demo, onchange: e => { opts.demo = e.target.checked; rerender(); } }), ' Include DEMO records (off by default)');
export const hero = (grad, title, sub) => h('header', { class: 'hero g-' + grad + ' noprint' }, h('h1', { tabindex: '-1', id: 'pageTitle' }, title), sub ? h('p', {}, sub) : null);
export const printBtn = () => h('button', { type: 'button', class: 'btn primary noprint', onclick: () => window.print() }, 'Print / Save as PDF');
