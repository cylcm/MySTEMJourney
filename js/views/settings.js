import { h, btn, toast, openDialog, closeDialog, fmtDate } from '../ui/dom.js';
import * as S from '../core/storage.js';
import * as B from '../backup/backup.js';
import * as P from '../pwa/pwa.js';
import { MODULES } from '../core/modules.js';
import { loadDemo } from '../core/demo.js';

const section = (title, ...kids) => h('section', { class: 'card' }, h('h2', {}, title), ...kids);

export function settingsView(sub, rerender) {
  const m = MODULES.find(x => x.id === 'settings');
  const fn = { profile, appearance, backup, pwa, data, about }[sub] || backup;
  return h('div', { class: 'page' },
    h('header', { class: 'hero g-dashboard' }, h('h1', { tabindex: '-1', id: 'pageTitle' }, 'Settings'), h('p', {}, (m.subs.find(s => s.id === sub) || {}).label)),
    fn(rerender));
}

const profile = () => section('Profile Settings', h('p', {}, 'Edit name, age, school, interests and photo on the Profile page.'), h('a', { class: 'btn primary', href: '#/profile' }, 'Open Profile'));

function appearance() {
  const cur = S.getSettings().textSize || 'normal';
  const sel = h('select', { id: 'ts', onchange: e => { S.saveSettings({ textSize: e.target.value }); document.documentElement.dataset.size = e.target.value; toast('Text size saved'); } },
    [['normal', 'Normal'], ['large', 'Large'], ['xl', 'Extra large']].map(([v, l]) => h('option', { value: v, selected: v === cur }, l)));
  return section('Appearance', h('label', { for: 'ts' }, 'Text size'), sel, h('p', { class: 'muted' }, 'The pastel light theme is the default. More options may come later.'));
}

function backup(rerender) {
  const last = S.getSettings().lastBackupAt;
  const file = h('input', { type: 'file', accept: '.json,application/json', id: 'impFile', class: 'sr', onchange: async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    const res = B.parse(await f.text());
    if (res.errors) {
      const d = openDialog('This file can’t be imported', h('div', {}, h('p', {}, 'Nothing was changed. Problems found:'), h('ul', {}, res.errors.map(x => h('li', {}, x)))), [btn('Close', 'primary', () => closeDialog(d))]);
      return;
    }
    showImportPreview(res.data, rerender);
  } });
  return section('Backup & Restore',
    h('p', {}, 'Last backup: ', h('strong', {}, fmtDate(last)), '. Your data lives only in this browser on this device, so back it up regularly.'),
    h('div', { class: 'row' },
      btn('Export Backup (download JSON)', 'primary', () => { try { B.exportBackup(); toast('Backup downloaded'); rerender(); } catch (e) { toast(e.message, 'err'); } }),
      h('label', { class: 'btn', for: 'impFile', tabindex: '0', role: 'button', onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } } }, 'Import / Restore Backup'), file),
    h('p', { class: 'muted' }, 'Importing shows a preview first. Merge keeps everything and adds or updates by ID. Replace first downloads a safety backup of your current data.'));
}

function showImportPreview(data, rerender) {
  const rows = B.plan(data);
  const table = h('table', {}, h('thead', {}, h('tr', {}, ['Collection', 'New', 'Updated', 'Unchanged'].map(t => h('th', { scope: 'col' }, t)))),
    h('tbody', {}, rows.map(r => h('tr', {}, h('th', { scope: 'row' }, r.c), h('td', {}, r.n), h('td', {}, r.u), h('td', {}, r.s)))));
  const done = (f, msg) => { try { f(); closeDialog(d); toast(msg); rerender(); } catch (e) { toast(e.message, 'err'); } };
  const d = openDialog('Review before importing', h('div', {}, h('p', {}, `Backup exported ${fmtDate(data.exportedAt)}. Nothing has been changed yet.`), h('div', { class: 'scroll-x' }, table)), [
    btn('Cancel', '', () => closeDialog(d), { autofocus: true }),
    btn('Replace…', 'danger', () => {
      if (confirm('Replace ALL current data with this backup? A safety backup of your current data will download first.')) done(() => B.replace(data), 'Backup restored (replace)');
    }),
    btn('Merge (recommended)', 'primary', () => done(() => B.merge(data), 'Backup merged'))]);
}

function pwa() {
  const box = h('div', {});
  const draw = async () => {
    const per = await P.persisted();
    const kids = [];
    if (P.isStandalone()) kids.push(h('p', {}, '✓ Running as an installed app.'));
    else if (P.canPrompt()) kids.push(btn('Install App', 'primary', () => P.promptInstall()));
    else if (P.isIOS()) kids.push(h('p', {}, 'On iPhone/iPad (Safari): tap the Share button, then “Add to Home Screen”.'));
    else kids.push(h('p', {}, 'Use your browser’s menu: “Install app” or “Add to Home screen” (Chrome, Edge, Android), or File ▸ Add to Dock (Safari on Mac). Firefox on desktop cannot install web apps, but the app still works in a tab.'));
    kids.push(h('p', { class: 'muted' }, 'Offline support: ' + ('serviceWorker' in navigator && location.protocol !== 'file:' ? 'available after the first load.' : 'not available here (open via http://localhost or https).')),
      h('p', { class: 'muted' }, 'Protected from automatic clean-up: ' + (per === null ? 'unknown on this browser' : per ? 'yes' : 'not granted (installing to the Home Screen helps)') + '.'));
    box.replaceChildren(...kids);
  };
  P.onChange(draw); draw();
  return section('Install App', h('p', {}, 'Installing is optional. The app works normally in the browser.'), box);
}

function data(rerender) {
  const used = S.usedBytes(), pct = Math.min(100, Math.round(used / (5 * 1024 * 1024) * 100));
  return h('div', {},
    section('Storage', h('p', {}, `About ${(used / 1024).toFixed(1)} KB used of roughly 5 MB available (${pct}%).`), h('progress', { max: 100, value: pct, 'aria-label': 'Storage used' })),
    section('Demo data', h('p', {}, 'Removes only records marked DEMO. Your own records are not touched.'),
      btn('Load demo data', '', () => { try { toast(loadDemo() + ' demo records added'); rerender(); } catch (e) { toast(e.message, 'err'); } }), ' ', btn('Reset Demo Data', '', () => { if (confirm('Remove all DEMO records? Your own records stay.')) { try { S.removeDemo(); toast('Demo records removed'); rerender(); } catch (e) { toast(e.message, 'err'); } } })),
    h('section', { class: 'card danger-zone' }, h('h2', {}, 'Danger zone'),
      h('p', {}, 'Reset Application Data permanently deletes every record on this device. Refreshing, closing or navigating never does this.'),
      btn('Reset Application Data', 'danger', () => resetDialog())));
}

function resetDialog() {
  const inp = h('input', { type: 'text', id: 'rst', autocomplete: 'off', autocapitalize: 'characters', 'aria-describedby': 'rstHelp' });
  const go = btn('Confirm Reset', 'danger', () => {
    if (inp.value !== 'RESET') return;
    S.wipeAll(); S.init(); closeDialog(d); location.hash = '#/dashboard'; location.reload();
  }, { disabled: true });
  inp.addEventListener('input', () => { go.disabled = inp.value !== 'RESET'; });
  const d = openDialog('Reset Application Data?', h('div', {},
    h('p', { class: 'warn' }, 'This permanently deletes ALL records: profile, achievements, projects, reflections, goals, everything. It cannot be undone.'),
    h('p', {}, 'Download a backup first if there is any chance you need this data.'),
    btn('Download backup now', '', () => { try { B.exportBackup(); toast('Backup downloaded'); } catch (e) { toast(e.message, 'err'); } }),
    h('label', { for: 'rst' }, 'Type RESET (capital letters) to enable the button'), inp, h('p', { id: 'rstHelp', class: 'muted' }, 'The button stays disabled until the text matches exactly.')),
    [btn('Cancel', 'primary', () => closeDialog(d), { autofocus: true }), go]);
}

function about() {
  return section('About', h('p', {}, 'Cyllee STEM Journey, standalone version, phase 4 (reports and monthly review) — all planned phases.'), h('p', { class: 'muted' }, `Data format version ${S.SCHEMA_VERSION}. No data is sent anywhere; everything stays in this browser.`),
    h('p', { class: 'muted' }, 'This app records experiences and growth. It does not score, rank or predict admission.'));
}
