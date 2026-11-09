/* judge-runtime.js — the engines the checker runs on, inside the browser.
 *
 * These are separate from the playground's engines on purpose (PRD J5): the checker can create tables, change
 * data and be stopped for running too long without touching the playground's sample warehouse or Python session.
 *
 * Both runners match the interfaces judge.js expects, the same ones tools/dev/runners.js gives the Node tests:
 *   SQL     { session() -> Promise<{exec, query, close}>, abort() }
 *   Python  { py(source, limitMs) -> Promise<stdout text>, abort() }   rejects with err.timeout = true and err.partial
 *
 * Keep PY_VER and DUCK_VER the same as in playground.js (tests/static.test.js checks this).
 */
(function () {
  'use strict';

  var PY_VER = '314.0.7', DUCK_VER = '1.32.0';
  var PY_BASE = 'https://cdn.jsdelivr.net/pyodide/v' + PY_VER + '/full/';
  var DUCK_ESM = 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@' + DUCK_VER + '/+esm';

  function say(runner, text) { if (runner.onStatus) runner.onStatus(text); }
  function msg(e) { return String(e && e.message ? e.message : e).replace(/^(Error: )+/, ''); }

  /* ------------------------------------------------------------ SQL (DuckDB-WASM) */
  function SqlRunner(onStatus) { this.onStatus = onStatus; this.p = null; }

  SqlRunner.prototype.start = function () {
    var me = this;
    if (this.p) return this.p;
    say(this, 'Loading the SQL engine. About 10 MB the first time, then cached.');
    this.p = (async function () {
      var duckdb = await import(DUCK_ESM);
      var bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
      var url = URL.createObjectURL(new Blob(['importScripts("' + bundle.mainWorker + '");'], { type: 'text/javascript' }));
      var worker = new Worker(url);
      var db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(url);
      return { db: db, worker: worker };
    })();
    this.p.catch(function () { me.p = null; });
    return this.p;
  };

  // A fresh connection and a fresh in-memory database for every case. See Judge.openSession.
  SqlRunner.prototype.session = function () {
    return this.start().then(function (h) {
      return window.Judge.openSession(async function () {
        var c = await h.db.connect();
        return { query: function (sql) { return c.query(sql); }, close: function () { return c.close(); } };
      });
    });
  };

  // A query that runs too long cannot be cancelled politely, so the engine is thrown away and rebuilt on the next use.
  SqlRunner.prototype.abort = function () {
    var p = this.p;
    this.p = null;
    if (p) p.then(function (h) { try { h.worker.terminate(); } catch (e) { /* already gone */ } }, function () {});
  };

  /* ------------------------------------------------------------ Python (Pyodide in a module worker) */
  // Pyodide 314 only runs in a module worker, so it is pulled in with import(), not importScripts().
  var PY_WORKER_SRC = '(' + function () {
    var py = null;
    function post(m) { self.postMessage(m); }
    self.onmessage = function (e) {
      var m = e.data;
      if (m.type === 'init') {
        import(m.base + 'pyodide.mjs').then(function (mod) {
          return mod.loadPyodide({ indexURL: m.base });
        }).then(function (p) {
          py = p;
          py.setStdout({ batched: function (s) { post({ type: 'chunk', text: s }); } });
          py.setStderr({ batched: function (s) { post({ type: 'chunk', text: s }); } });
          post({ type: 'ready' });
        }).catch(function (err) { post({ type: 'fatal', text: String(err && err.message ? err.message : err) }); });
      } else if (m.type === 'run') {
        var g = null;
        try {
          g = py.globals.get('dict')();
          py.runPython(m.src, { globals: g });
          post({ type: 'done', id: m.id });
        } catch (err) {
          post({ type: 'done', id: m.id, err: String(err && err.message ? err.message : err) });
        } finally {
          try { if (g) g.destroy(); } catch (e2) { /* nothing to free */ }
        }
      }
    };
  }.toString() + ')()';

  function PyRunner(onStatus) { this.onStatus = onStatus; this.w = null; this.ready = null; this.url = null; this.cur = null; this.n = 0; }

  PyRunner.prototype.start = function () {
    var me = this;
    if (this.ready) return this.ready;
    say(this, 'Loading Python. About 10 MB the first time, then cached.');
    this.ready = new Promise(function (resolve, reject) {
      // A Blob worker works on http(s). A page opened straight from disk (file://) blocks Blob module workers,
      // so if that one cannot start we try again from a data: URL.
      function launch(kind) {
        var w;
        try {
          if (kind === 'blob') {
            me.url = URL.createObjectURL(new Blob([PY_WORKER_SRC], { type: 'text/javascript' }));
            w = new Worker(me.url, { type: 'module' });
          } else {
            w = new Worker('data:text/javascript;charset=utf-8,' + encodeURIComponent(PY_WORKER_SRC), { type: 'module' });
          }
        } catch (err) {
          if (kind === 'blob') return launch('data');
          return reject(err);
        }
        me.w = w;
        var started = false;
        w.onmessage = function (e) {
          started = true;
          var m = e.data, c = me.cur;
          if (m.type === 'ready') resolve();
          else if (m.type === 'fatal') reject(new Error(m.text));
          else if (m.type === 'chunk' && c) c.chunk(m.text);
          else if (m.type === 'done' && c && m.id === c.id) c.done(m);
        };
        w.onerror = function (e) {
          if (e && e.preventDefault) e.preventDefault();
          if (!started && kind === 'blob') {
            w.terminate();
            if (me.url) { URL.revokeObjectURL(me.url); me.url = null; }
            launch('data');
          } else if (me.cur) {
            me.cur.fail(new Error((e && e.message) || 'The Python worker stopped unexpectedly.'));
          } else {
            reject(new Error((e && e.message) || 'The Python worker failed to start.'));
          }
        };
        w.postMessage({ type: 'init', base: PY_BASE });
      }
      launch('blob');
    });
    this.ready.catch(function () { me.drop(); });
    return this.ready;
  };

  PyRunner.prototype.drop = function () {
    if (this.w) { this.w.onmessage = null; this.w.onerror = null; this.w.terminate(); this.w = null; }
    if (this.url) { URL.revokeObjectURL(this.url); this.url = null; }
    this.ready = null;
    this.cur = null;
  };

  // The time limit starts after the engine is ready, so a slow first download is never blamed on the learner's code.
  PyRunner.prototype.py = function (src, limitMs) {
    var me = this;
    return this.start().then(function () {
      return new Promise(function (resolve, reject) {
        var id = ++me.n, out = '';
        var timer = setTimeout(function () {
          me.drop(); // a loop that never ends can only be stopped by ending the worker
          var e = new Error('Time limit exceeded');
          e.timeout = true; e.partial = out;
          reject(e);
        }, limitMs || 5000);
        me.cur = {
          id: id,
          chunk: function (text) { out += text + '\n'; },
          done: function (m) {
            clearTimeout(timer); me.cur = null;
            if (m.err && !/@@(FATAL|END)@@/.test(out)) reject(new Error(m.err)); else resolve(out);
          },
          fail: function (err) { clearTimeout(timer); me.cur = null; me.drop(); reject(err); },
        };
        me.w.postMessage({ type: 'run', id: id, src: src });
      });
    });
  };

  PyRunner.prototype.abort = function () { this.drop(); };

  window.JudgeRuntime = {
    PY_VER: PY_VER, DUCK_VER: DUCK_VER, msg: msg,
    sql: function (onStatus) { return new SqlRunner(onStatus); },
    py: function (onStatus) { return new PyRunner(onStatus); },
  };
})();
