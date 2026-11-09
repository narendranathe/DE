'use strict';
// Runs real CPython (Pyodide) inside a worker thread so a test can kill it on a hang.
const { parentPort } = require('node:worker_threads');

let py = null;
let cur = 0;
const ready = (async () => {
  const { loadPyodide } = require('pyodide');
  py = await loadPyodide();
  py.setStdout({ batched: (s) => parentPort.postMessage({ id: cur, chunk: s }) });
  py.setStderr({ batched: (s) => parentPort.postMessage({ id: cur, chunk: s }) });
  parentPort.postMessage({ ready: true });
})();

parentPort.on('message', async (m) => {
  await ready;
  cur = m.id;
  try {
    const g = py.globals.get('dict')();
    py.runPython(m.src, { globals: g });
    g.destroy();
    parentPort.postMessage({ id: m.id, done: true });
  } catch (e) {
    parentPort.postMessage({ id: m.id, done: true, err: String(e && e.message || e) });
  }
});
