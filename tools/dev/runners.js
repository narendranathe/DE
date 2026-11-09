'use strict';
// Real runners for the tests: DuckDB for Node and Pyodide for Node. Same interface the page uses.
const path = require('node:path');
const { Worker } = require('node:worker_threads');
const J = require('../assets/judge.js');

const DIST = path.join(__dirname, '../../node_modules/@duckdb/duckdb-wasm/dist/');

async function sqlRunner() {
  const D = require(DIST + 'duckdb-node-blocking.cjs');
  const bundles = {
    mvp: { mainModule: DIST + 'duckdb-mvp.wasm', mainWorker: DIST + 'duckdb-node-mvp.worker.cjs' },
    eh: { mainModule: DIST + 'duckdb-eh.wasm', mainWorker: DIST + 'duckdb-node-eh.worker.cjs' },
  };
  const db = await D.createDuckDB(bundles, new D.VoidLogger(), D.NODE_RUNTIME);
  await db.instantiate(() => {});
  const conn = db.connect(); // stands in for the playground's own connection
  const run = async (sql) => conn.query(sql);
  return {
    conn,
    run,
    session: () => J.openSession(async () => {
      const c = db.connect();
      return { query: async (sql) => c.query(sql), close: async () => c.close() };
    }),
    abort() {},
    close() { try { conn.close(); } catch (e) { /* done */ } },
  };
}

class PyRunner {
  constructor() { this.n = 0; this.spawn(); }
  spawn() {
    this.w = new Worker(path.join(__dirname, 'py-worker.js'));
    this.ready = new Promise((resolve, reject) => {
      const on = (m) => { if (m.ready) { this.w.off('message', on); resolve(); } };
      this.w.on('message', on);
      this.w.once('error', reject);
    });
    this.ready.catch(() => {});
  }
  async py(src, limitMs) {
    await this.ready;
    const w = this.w, id = ++this.n;
    let out = '';
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        w.off('message', on);
        w.terminate();
        if (this.w === w) this.spawn();
        const e = new Error('Time limit exceeded');
        e.timeout = true;
        e.partial = out;
        reject(e);
      }, limitMs || 5000);
      const on = (m) => {
        if (m.id !== id) return;
        if (m.chunk !== undefined) out += m.chunk + '\n';
        if (m.done) {
          clearTimeout(timer);
          w.off('message', on);
          if (m.err && !/@@(FATAL|END)@@/.test(out)) { const e = new Error(m.err); reject(e); } else resolve(out);
        }
      };
      w.on('message', on);
      w.postMessage({ id, src });
    });
  }
  abort() {}
  close() { return this.w.terminate(); }
}

module.exports = { sqlRunner, pyRunner: () => new PyRunner() };
