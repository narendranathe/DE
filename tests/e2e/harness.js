'use strict';
// Browser harness for the workspace tests.
//
// It builds the page into a temp folder, serves it over http, and answers the runtime downloads
// (Pyodide and DuckDB-WASM) from node_modules through a local HTTPS server that stands in for cdn.jsdelivr.net.
// Chromium is told to send that one host to the local server, so the page runs its real code, unchanged,
// against the real engines, with no network.
//
// Needs: python3, openssl, esbuild (a dev dependency), Chromium through the `playwright` package (preinstalled here; otherwise `npm i -D playwright`).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '../..');
const PY = '/pyodide/v314.0.7/full/', DK = '/npm/@duckdb/duckdb-wasm@1.32.0/';
const MIME = { '.wasm': 'application/wasm', '.json': 'application/json', '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.zip': 'application/zip' };

function listen(server) { return new Promise((res) => server.listen(0, '127.0.0.1', () => res(server.address().port))); }

async function start(opts = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'de-e2e-'));
  const pagePath = path.join(dir, 'index.html');
  execFileSync('python3', [path.join(ROOT, 'tools/render_site.py')], { env: { ...process.env, DE_OUT: pagePath }, stdio: 'pipe' });
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '2', '-subj', '/CN=cdn.jsdelivr.net',
    '-keyout', path.join(dir, 'k.pem'), '-out', path.join(dir, 'c.pem')], { stdio: 'pipe' });

  // jsDelivr's "+esm" URL gives one file with the library's dependencies already inside. The package on disk imports them by name,
  // so build the same shape here.
  const duckEsm = path.join(dir, 'duck-esm.js');
  require('esbuild').buildSync({
    stdin: { contents: "export * from '@duckdb/duckdb-wasm';", resolveDir: ROOT, loader: 'js' },
    bundle: true, format: 'esm', platform: 'browser', outfile: duckEsm, logLevel: 'error',
  });

  const served = [];
  const cdn = https.createServer({ key: fs.readFileSync(path.join(dir, 'k.pem')), cert: fs.readFileSync(path.join(dir, 'c.pem')) }, (req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    let f = null;
    if (u.startsWith(PY)) f = path.join(ROOT, 'node_modules/pyodide', u.slice(PY.length));
    else if (u === DK + '+esm') f = duckEsm;
    else if (u.startsWith(DK + 'dist/')) f = path.join(ROOT, 'node_modules/@duckdb/duckdb-wasm/dist', u.slice((DK + 'dist/').length));
    const ok = f && fs.existsSync(f) && fs.statSync(f).isFile();
    served.push(u + (ok ? '' : ' MISSING'));
    if (!ok) { res.writeHead(404, { 'access-control-allow-origin': '*' }); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'access-control-allow-origin': '*' });
    fs.createReadStream(f).pipe(res);
  });
  const cdnPort = await listen(cdn);

  const web = http.createServer((req, res) => {
    if (req.url.split('?')[0] === '/' || req.url.startsWith('/index.html')) { res.writeHead(200, { 'content-type': 'text/html' }); res.end(fs.readFileSync(pagePath)); } else { res.writeHead(404); res.end(); }
  });
  const webPort = await listen(web);

  process.env.NO_PROXY = [process.env.NO_PROXY, 'cdn.jsdelivr.net', '127.0.0.1', 'localhost'].filter(Boolean).join(',');
  const { chromium } = require('playwright');
  // The proxy option does two jobs. In a sandbox that forces traffic through an outbound proxy, Chromium would send even the
  // mapped CDN host there and fail with ERR_TUNNEL_CONNECTION_FAILED; the bypass list sends that host (and localhost) straight out.
  // Everything else is pointed at a closed local port, so a test can never reach the real internet by accident.
  const browser = await chromium.launch({
    args: [`--host-resolver-rules=MAP cdn.jsdelivr.net 127.0.0.1:${cdnPort}`, '--ignore-certificate-errors'],
    proxy: { server: 'http://127.0.0.1:9', bypass: 'cdn.jsdelivr.net,127.0.0.1,localhost' },
  });
  async function newPage(o = {}) {
    const ctx = await browser.newContext({ viewport: o.viewport || { width: 1280, height: 860 }, deviceScaleFactor: o.scale || 1, colorScheme: o.colorScheme || 'light', acceptDownloads: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
    // "Failed to load resource" console lines carry no address, so failed requests are reported from the network side instead,
    // with the address. The web fonts are blocked on purpose (below) and do not count. A CDN file that is missing is a 404 and does.
    page.on('console', (m) => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
    page.on('requestfailed', (r) => { if (!/fonts\.(googleapis|gstatic)\.com/.test(r.url())) errors.push('request failed: ' + r.url().slice(0, 140) + ' ' + (r.failure() && r.failure().errorText)); });
    page.on('response', (r) => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 140)); });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    // the in-memory community gives people avatar addresses on a made-up host; answer them with a 1-pixel picture
    const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    await page.route('https://avatars.example/**', (r) => r.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
    return { ctx, page, errors };
  }
  return {
    dir, pagePath, url: `http://127.0.0.1:${webPort}/`, fileUrl: 'file://' + pagePath, served, newPage,
    close: async () => { await browser.close(); cdn.close(); web.close(); },
  };
}

module.exports = { start, ROOT };
