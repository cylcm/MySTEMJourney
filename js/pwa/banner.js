import { h, btn, openDialog, closeDialog } from '../ui/dom.js';
import * as P from './pwa.js';
const KEY = 'csj-ui-banner-until';       // not a data key: never included in backups or reset

export function showInstallHelp() {
  const sec = (t, ...s) => h('div', { class: 'how' }, h('h3', {}, t), h('ol', {}, s.map(x => h('li', {}, x))));
  const body = h('div', {},
    P.canPrompt() ? h('p', {}, btn('Install now', 'primary', async () => { await P.promptInstall(); closeDialog(d); })) : null,
    sec('iPhone or iPad (Safari)', 'Open this page in Safari (not inside another app).', 'Tap the Share button (square with an arrow).', 'Scroll and tap “Add to Home Screen”, then “Add”.'),
    sec('Android (Chrome)', 'Tap the ⋮ menu at the top right.', 'Tap “Install app” or “Add to Home screen”.', 'Confirm. The icon appears on your home screen.'),
    sec('Windows or Mac (Chrome / Edge)', 'Click the install icon at the right end of the address bar, or open the ⋯ menu and choose “Install”.'),
    sec('Mac (Safari)', 'Choose File ▸ Add to Dock.'),
    h('p', { class: 'muted' }, 'Installing needs the app to be opened from a web address (https), not from a file on your computer. Your records stay on this device either way.'));
  const d = openDialog('Add Cyllee STEM Journey to your device', body, [btn('Close', 'primary', () => closeDialog(d), { autofocus: true })]);
}

export function initBanner() {
  const pill = document.getElementById('installPill');
  if (P.isStandalone()) { if (pill) pill.hidden = true; return; }
  let until = 0; try { until = +localStorage.getItem(KEY) || 0; } catch (e) {}
  if (Date.now() < until) return;
  setTimeout(() => {
    const bar = h('div', { class: 'install-banner', role: 'region', 'aria-label': 'Install app' },
      h('img', { src: 'icons/icon-192.png', alt: '', width: 44, height: 44 }),
      h('div', { class: 'ib-text' }, h('strong', {}, 'Add Cyllee STEM Journey to your device'), h('span', {}, 'Get an app icon for one-tap access — no app store needed.')),
      h('div', { class: 'ib-actions' }, btn('How?', 'primary', () => showInstallHelp()),
        btn('Not now', '', () => { bar.remove(); try { localStorage.setItem(KEY, String(Date.now() + 7 * 864e5)); } catch (e) {} })));
    document.body.append(bar);
    P.onChange(() => { if (P.isStandalone()) bar.remove(); });
  }, 1500);
}
