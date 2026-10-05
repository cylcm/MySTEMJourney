import * as S from './core/storage.js';
import { MODULES } from './core/modules.js';
import { h, btn } from './ui/dom.js';
import { buildSidebar, updateSidebar, setupDrawer } from './ui/sidebar.js';
import { dashboard, placeholder } from './views/basic.js';
import { settingsView } from './views/settings.js';
import { downloadJSON } from './backup/backup.js';
import { initPWA } from './pwa/pwa.js';

const main = document.getElementById('main');
const side = document.getElementById('sidebar');

function recovery(info) {
  // Stored data could not be read. Do NOT write anything; just let the user save the raw data.
  document.querySelector('.app').replaceChildren(h('main', { class: 'page', id: 'main' }, h('section', { class: 'card' },
    h('h1', {}, 'Your saved data needs attention'),
    h('p', {}, info.newerVersion ? 'This data was saved by a newer version of the app. Update the app to open it.' : 'Some saved data could not be read: ' + info.corrupt.join(', ') + '.'),
    h('p', {}, 'Nothing has been changed or deleted. Download a copy of the raw data to keep it safe.'),
    btn('Download raw data', 'primary', () => downloadJSON(S.rawDump(), 'cyllee-stem-journey-raw-data.json')))));
}

function route() {
  const p = location.hash.replace(/^#\/?/, '').split('/');
  const m = MODULES.find(x => x.id === p[0]) || MODULES[0];
  const sub = m.subs ? (m.subs.find(s => s.id === p[1]) || m.subs[0]).id : null;
  return { m, sub };
}

function render() {
  const { m, sub } = route();
  updateSidebar(side, m.id, sub);
  let view;
  try {
    view = m.id === 'dashboard' ? dashboard() : m.id === 'settings' ? settingsView(sub, render) : placeholder(m, sub);
  } catch (e) { view = h('div', { class: 'page' }, h('section', { class: 'card' }, h('h2', {}, 'This page could not load'), h('p', {}, e.message + ' Your data was not changed.'))); }
  main.replaceChildren(...[reminder(), view].filter(Boolean));
  document.title = m.label + ' · Cyllee STEM Journey';
  scrollTo(0, 0);
  const t = document.getElementById('pageTitle'); if (t) t.focus({ preventScroll: true });
}

function reminder() {
  try {
    const s = S.getSettings(), days = s.backupReminderDays || 30;
    const due = !s.lastBackupAt || (Date.now() - new Date(s.lastBackupAt)) > days * 864e5;
    if (due && S.hasRealRecords()) return h('div', { class: 'banner' }, 'You have records but no recent backup. ', h('a', { href: '#/settings/backup' }, 'Back up now'));
  } catch (e) {}
  return null;
}

const info = S.init();
if (info.corrupt.length || info.newerVersion) recovery(info);
else {
  if (info.firstRun) {
    const t = S.now();
    S.write('student', [{ id: S.uid(), createdAt: t, updatedAt: t, isDemo: true, name: 'DEMO — Cyllee', age: 'DEMO', school: 'DEMO — School name' }]);
  }
  document.documentElement.dataset.size = S.getSettings().textSize || 'normal';
  buildSidebar(side); setupDrawer(); initPWA();
  addEventListener('hashchange', render);
  render();
}
