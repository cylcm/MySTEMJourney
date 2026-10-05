let deferred = null;
const listeners = [];
export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const canPrompt = () => !!deferred;
export const onChange = fn => listeners.push(fn);
export async function promptInstall() { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; listeners.forEach(f => f()); }

export function initPWA() {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; listeners.forEach(f => f()); });
  window.addEventListener('appinstalled', () => { deferred = null; listeners.forEach(f => f()); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
  // Ask the browser not to evict our data under storage pressure (best effort; not all browsers grant it).
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
export async function persisted() {
  try { return navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : null; } catch { return null; }
}
