// Renders the real site (production build) to docs/screenshots, light and dark, with Google Chrome driven over the
// DevTools protocol. Used by the README. Run `make screenshots` (builds the site first); set CHROME to use another binary.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = new URL('../../docs/screenshots/', import.meta.url).pathname;
const SITE_PORT = 3100;
const DEBUG_PORT = 9333;
const SITE = `http://127.0.0.1:${SITE_PORT}`;

/** name, path, and what to scroll to before the shot (a CSS selector) */
const SHOTS = [
  { name: 'landing', path: '/en' },
  { name: 'lesson', path: '/en/s3/02-versioning' },
  { name: 'lab', path: '/en/s3/02-versioning', scrollTo: '.lab' },
  { name: 'lesson-bn', path: '/bn/s3/02-versioning' },
];
const SCHEMES = ['light', 'dark'];
const VIEWPORT = { width: 1280, height: 860 };

async function waitFor(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  throw new Error(`${url} did not come up`);
}

/** A tiny DevTools client: one websocket, request/response by id, events by name. */
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let next = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method) listeners.get(msg.method)?.forEach((fn) => fn(msg.params));
  };
  return {
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++next;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      }),
    once: (method) =>
      new Promise((resolve) => {
        const fn = (params) => {
          listeners.get(method).delete(fn);
          resolve(params);
        };
        listeners.set(method, (listeners.get(method) ?? new Set()).add(fn));
      }),
    close: () => ws.close(),
  };
}

async function shoot(shot, scheme) {
  const target = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const page = await connect(target.webSocketDebuggerUrl);
  await page.send('Page.enable');
  await page.send('Emulation.setDeviceMetricsOverride', { ...VIEWPORT, deviceScaleFactor: 1.5, mobile: false });
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
  const loaded = page.once('Page.loadEventFired');
  await page.send('Page.navigate', { url: SITE + shot.path });
  await loaded;
  await sleep(1500); // web fonts and the theme script settle
  if (shot.scrollTo) {
    await page.send('Runtime.evaluate', { expression: `document.querySelector('${shot.scrollTo}')?.scrollIntoView({block:'start'}); window.scrollBy(0,-64)` });
    await sleep(400);
  }
  const { data } = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, `${shot.name}-${scheme}.png`), Buffer.from(data, 'base64'));
  page.close();
  await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/close/${target.id}`);
}

mkdirSync(OUT, { recursive: true });
// Start Next directly (not through pnpm) so killing it really stops the server, and never reuse a server that is
// already running: it may be serving an older build whose assets no longer exist.
const alreadyUp = await fetch(`${SITE}/en`).then(() => true, () => false);
if (alreadyUp) throw new Error(`port ${SITE_PORT} is already in use; stop that server first`);
const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next');
const site = spawn(process.execPath, [nextBin, 'start', '-p', String(SITE_PORT)], { stdio: 'ignore' });
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'shots-'))}`, 'about:blank'], { stdio: 'ignore' });
try {
  await waitFor(`${SITE}/en`);
  await waitFor(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  for (const shot of SHOTS) for (const scheme of SCHEMES) await shoot(shot, scheme);
  console.log(`wrote ${SHOTS.length * SCHEMES.length} screenshots to docs/screenshots`);
} finally {
  chrome.kill();
  site.kill();
}
