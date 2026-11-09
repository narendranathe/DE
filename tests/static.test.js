'use strict';
// Checks on the source files that no browser run would catch.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const A = (f) => fs.readFileSync(path.join(__dirname, '../tools/assets', f), 'utf8');

test('the engine versions in the playground and in the checker are the same', () => {
  const ver = (src, name) => (new RegExp(name + "\\s*=\\s*'([^']+)'").exec(src) || [])[1];
  const pg = A('playground.js'), rt = A('judge-runtime.js');
  for (const name of ['PY_VER', 'DUCK_VER']) {
    assert.ok(ver(pg, name), name + ' in playground.js');
    assert.equal(ver(rt, name), ver(pg, name), name + ' differs between playground.js and judge-runtime.js');
  }
});

test('the engine versions match the packages the tests run against', () => {
  const rt = A('judge-runtime.js');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')).devDependencies;
  assert.equal((/PY_VER = '([^']+)'/.exec(rt) || [])[1], pkg.pyodide);
  assert.equal((/DUCK_VER = '([^']+)'/.exec(rt) || [])[1], pkg['@duckdb/duckdb-wasm']);
});

// P4: text from other people and from the bank is shown with textContent. These calls turn text into markup.
for (const f of ['workspace.js', 'community.js', 'workspace-core.js', 'judge-runtime.js']) {
  test(`P4 ${f} never builds markup from text`, () => {
    const src = A(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const bad of ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write', 'srcdoc', 'eval(', 'new Function']) {
      assert.ok(!src.includes(bad), `${f} uses ${bad}`);
    }
  });
}

test('P4 the workspace only shows https avatars', () => {
  const src = A('workspace.js');
  assert.match(src, /\^https:\\\/\\\//);
});
