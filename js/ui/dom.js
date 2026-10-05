// Tiny DOM helpers. Text is always inserted as text (never innerHTML), so stored data cannot inject markup.
export function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
export const btn = (label, cls, onclick, extra) => h('button', { type: 'button', class: 'btn ' + (cls || ''), onclick, ...extra }, label);

export function toast(msg, kind) {
  const t = h('div', { class: 'toast ' + (kind || '') }, (kind === 'err' ? 'Problem: ' : '') + msg);
  document.getElementById('toasts').append(t);
  setTimeout(() => t.remove(), kind === 'err' ? 8000 : 3500);
}

// Modal dialog. `actions` is an array of button nodes. Returns the <dialog>.
export function openDialog(title, body, actions) {
  const d = h('dialog', { class: 'dlg', 'aria-labelledby': 'dlgTitle' },
    h('h2', { id: 'dlgTitle' }, title), h('div', { class: 'dlg-body' }, body), h('div', { class: 'dlg-actions' }, actions));
  d.addEventListener('close', () => d.remove());
  document.body.append(d);
  if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  return d;
}
export const closeDialog = d => { if (d.close) d.close(); else d.remove(); };
export const fmtDate = iso => iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never';
