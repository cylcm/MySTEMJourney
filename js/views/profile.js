import { h, toast } from '../ui/dom.js';
import * as S from '../core/storage.js';

const FIELDS = [['name', 'Name'], ['age', 'Age'], ['school', 'School'], ['level', 'Current level'], ['interests', 'Interests', 1], ['favStem', 'Favourite STEM areas', 1],
  ['otherInterests', 'Other interests', 1], ['aspirations', 'Aspirations', 1]];

export function profileView() {
  const rec = S.read('student')[0] || {}, ctl = {}; let photo = rec.photo || '';
  const img = h('img', { class: 'avatar', alt: 'Profile photo', hidden: !photo, src: photo || undefined });
  const file = h('input', { type: 'file', accept: 'image/*', id: 'ph', onchange: e => {
    const f = e.target.files[0]; if (!f) return;
    const im = new Image(); const url = URL.createObjectURL(f);
    im.onload = () => {                                   // shrink to 256px so localStorage stays small
      const k = Math.min(1, 256 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      photo = c.toDataURL('image/jpeg', .8); img.src = photo; img.hidden = false; URL.revokeObjectURL(url);
    };
    im.onerror = () => toast('That image could not be read', 'err'); im.src = url;
  } });
  const fields = FIELDS.map(([k, label, multi]) => {
    const el = multi ? h('textarea', { id: 'p-' + k, rows: 2 }) : h('input', { type: 'text', id: 'p-' + k }); el.value = rec[k] || ''; ctl[k] = el;
    return h('div', { class: 'fld' }, h('label', { for: 'p-' + k }, label), el);
  });
  return h('div', { class: 'page' },
    h('header', { class: 'hero g-dashboard' }, h('h1', { tabindex: '-1', id: 'pageTitle' }, 'Profile'), h('p', {}, rec.isDemo ? 'Showing DEMO information. Saving replaces it with your own.' : 'Edit any time.')),
    h('form', { class: 'card', onsubmit: e => {
      e.preventDefault(); const data = { isDemo: false, photo };
      for (const [k] of FIELDS) data[k] = ctl[k].value.trim();
      try { if (rec.id) S.update('student', rec.id, data); else S.add('student', data); toast('Profile saved'); location.hash = '#/dashboard'; } catch (er) { toast(er.message, 'err'); }
    } }, h('div', { class: 'fld' }, img, h('label', { for: 'ph' }, 'Profile photo'), file), ...fields,
      h('div', { class: 'row' }, h('button', { type: 'submit', class: 'btn primary' }, 'Save profile'), h('a', { class: 'btn', href: '#/dashboard' }, 'Cancel'))));
}
