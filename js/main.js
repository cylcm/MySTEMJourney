import * as S from './core/storage.js';
import { MODULES } from './core/modules.js';
import { h, btn } from './ui/dom.js';
import { buildSidebar, updateSidebar, setupDrawer } from './ui/sidebar.js';
import { placeholder } from './views/basic.js';
import { dashboard } from './views/dashboard.js';
import { skillsView } from './views/skills.js';
import { sstView } from './views/sst.js';
import { timelineView } from './views/timeline.js';
import { reportsView } from './reports/index.js';
import { settingsView } from './views/settings.js';
import { downloadJSON } from './backup/backup.js';
import { initPWA } from './pwa/pwa.js';
import { initBanner } from './pwa/banner.js';
import { engineView, hasConfig } from './modules/engine.js';
import { profileView } from './views/profile.js';
import { loadDemo } from './core/demo.js';

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
  const special = hasConfig(m.id) && ['add', 'view', 'edit'].includes(p[1]);
  const sub = special ? p[1] : m.subs ? (m.subs.find(s => s.id === p[1]) || m.subs[0]).id : null;
  return { m, sub, arg: p[2] };
}

function render() {
  const { m, sub, arg } = route();
  const navSub = m.subs && (m.subs.some(s => s.id === sub) ? sub : (m.filterNav && m.filterNav[arg]) || m.subs[0].id);
  updateSidebar(side, m.id, navSub);
  let view;
  try {
    view = m.id === 'dashboard' ? dashboard() : m.id === 'settings' ? settingsView(sub, render) : m.id === 'profile' ? profileView() : m.id === 'skills' ? skillsView(m, render) : m.id === 'sst' ? sstView(m, render) : m.id === 'timeline' ? timelineView(m) : m.id === 'reports' ? reportsView(m, sub, render) : hasConfig(m.id) ? engineView(m, sub, arg) : placeholder(m, sub);
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
    loadDemo();
  }
  document.documentElement.dataset.size = S.getSettings().textSize || 'normal';
  buildSidebar(side); setupDrawer(); initPWA(); initBanner();
  addEventListener('hashchange', render);
  render();
}
