#!/usr/bin/env node
'use strict';
/* build_problems.js — validates the question files in tools/problems/ and writes tools/assets/problems.js.
 *
 *   node tools/build_problems.js           build (needs `npm install` once, for DuckDB and Pyodide)
 *   node tools/build_problems.js --check   fail if the generated file is out of date
 *
 * A question is one file in tools/problems/ that exports a plain object (see tools/problems/README.md).
 * The visible cases carry a hand-written `expect`; the build runs the reference solution on every case and
 * fails if it disagrees with a hand-written answer. Hidden cases get their expected output from the reference.
 */
const fs = require('node:fs');
const path = require('node:path');
const J = require('./assets/judge.js');

const DIR = path.join(__dirname, 'problems');
const OUT = path.join(__dirname, 'assets', 'problems.js');

/* ---------------------------------------------------------------- authoring helpers */
function tbl(name, cols, rows) { return { name: name, cols: cols, rows: rows }; }
function para() { return Array.prototype.slice.call(arguments).join('\n\n'); }
function D(iso) { return { sql: "DATE '" + iso + "'" }; }

function lit(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'object' && typeof v.sql === 'string') return v.sql;
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function setupOf(tables) {
  var out = [];
  (tables || []).forEach(function (t) {
    out.push('CREATE TABLE ' + t.name + '(' + t.cols + ')');
    if (t.rows && t.rows.length) {
      out.push('INSERT INTO ' + t.name + ' VALUES ' + t.rows.map(function (r) { return '(' + r.map(lit).join(', ') + ')'; }).join(', '));
    }
  });
  return out;
}

/* ---------------------------------------------------------------- validation */
function validate(p) {
  var errs = [], id = String(p && p.id), say = function (m) { errs.push(id + ': ' + m); };
  var nonEmpty = function (s) { return typeof s === 'string' && s.trim().length > 0; };
  if (!/^(sql|py)-d\d\d-[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) say('id must look like sql-d02-name or py-d15-name');
  if (!nonEmpty(p.title)) say('title is required');
  if (p.lang !== 'sql' && p.lang !== 'python') say('lang must be "sql" or "python"');
  if (!(Number.isInteger(p.day) && p.day >= 1 && p.day <= 84)) say('day must be a whole number from 1 to 84');
  if (!nonEmpty(p.anchor)) say('anchor is required (the text of the checkbox link, e.g. "LC 196")');
  if (p.cat !== 'PRACTICE' && p.cat !== 'BUILD') say('cat must be "PRACTICE" or "BUILD"');
  if (!(Number.isInteger(p.bounty) && p.bounty > 0)) say('bounty must be a positive whole number');
  if (!nonEmpty(p.statement)) say('statement is required');
  if (!nonEmpty(p.starter)) say('starter is required');
  if (!nonEmpty(p.solution)) say('solution is required');
  if (!nonEmpty(p.approach)) say('approach is required');
  if (!Array.isArray(p.hints) || p.hints.length !== 3 || !p.hints.every(nonEmpty)) say('hints must be exactly three non-empty strings');
  if (!Array.isArray(p.mutants) || p.mutants.length < 2 || !p.mutants.every(function (m) { return m && nonEmpty(m.name) && nonEmpty(m.code); })) {
    say('mutants needs at least two wrong solutions, each with a name and code');
  }
  var cases = Array.isArray(p.cases) ? p.cases : [];
  if (!cases.some(function (c) { return !c.hidden; })) say('needs at least one visible case');
  if (cases.filter(function (c) { return c.hidden; }).length < 2) say('needs at least two hidden cases');
  cases.forEach(function (c, i) {
    if (!c.hidden && c.expect === undefined) say('case ' + (i + 1) + ' is visible, so it needs a hand-written expect');
  });
  if (!['eq', 'unordered', 'groups'].includes(p.cmp || 'eq')) say('cmp must be eq, unordered or groups');

  if (p.lang === 'sql') {
    if (!['select', 'mutate'].includes(p.kind || 'select')) say('kind must be "select" or "mutate"');
    if (p.kind === 'mutate' && !nonEmpty(p.verify)) say('a mutate question needs a verify query');
    cases.forEach(function (c, i) {
      if (!(c.tables && c.tables.length) && !(c.setup && c.setup.length)) say('case ' + (i + 1) + ' needs tables or setup');
    });
  }
  if (p.lang === 'python') {
    if (p.kind === 'class') {
      if (!nonEmpty(p.cls)) say('cls is required for a class question');
      cases.forEach(function (c, i) {
        if (!Array.isArray(c.ops) || !Array.isArray(c.args) || c.ops.length !== c.args.length || c.ops[0] !== p.cls) {
          say('case ' + (i + 1) + ': ops must start with the class name and match args one for one');
        }
      });
    } else {
      if (!nonEmpty(p.fn)) say('fn is required for a function question');
      cases.forEach(function (c, i) { if (!Array.isArray(c.args)) say('case ' + (i + 1) + ' needs an args array'); });
    }
  }
  return errs;
}

function validateAll(list) {
  var errs = [], ids = {}, anchors = {};
  list.forEach(function (p) {
    errs = errs.concat(validate(p));
    if (ids[p.id]) errs.push(p.id + ': duplicate id');
    ids[p.id] = true;
    var k = p.day + '|' + p.anchor;
    if (anchors[k]) errs.push(p.id + ': anchor "' + p.anchor + '" on day ' + p.day + ' is already used by ' + anchors[k]);
    anchors[k] = p.id;
  });
  return errs;
}

/* ---------------------------------------------------------------- expected output from the reference */
function clip(v) { var s = JSON.stringify(v); return s.length > 300 ? s.slice(0, 300) + '…' : s; }

async function computeSql(src, runner, limit) {
  var out = [];
  for (var i = 0; i < src.cases.length; i++) {
    var c = src.cases[i], setup = c.setup && c.setup.length ? c.setup : setupOf(c.tables), s, got;
    var tag = src.id + ': case ' + (i + 1);
    try {
      s = await runner.session();
      for (var q = 0; q < setup.length; q++) await s.exec(setup[q]);
      if (src.kind === 'mutate') { await s.exec(src.solution); got = await s.query(src.verify); }
      else got = await s.query(src.solution);
    } catch (e) {
      if (s) { try { await s.close(); } catch (e2) { /* ignore */ } }
      throw new Error(tag + ': the reference solution failed: ' + (e && e.message ? e.message : e));
    }
    await s.close();
    if (c.expect !== undefined) {
      var cmp = J.compareTables(got, c.expect, { ordered: !!src.ordered });
      if (!cmp.ok) throw new Error(tag + ': the reference gives ' + clip(got.rows) + ' but the hand-written answer is ' + clip(c.expect.rows) + ' (' + cmp.detail + ')');
    }
    var o = { setup: setup, expected: got };
    if (c.hidden) o.hidden = true;
    if (c.tables && !c.hidden) o.tables = c.tables;
    if (c.tables && c.hidden) o.tables = c.tables;
    out.push(o);
  }
  return out;
}

async function computePy(src, runner, limit) {
  var cases = src.cases.map(function (c) { return { args: c.args, ops: c.ops, expected: c.expect }; });
  var text;
  try { text = await runner.py(J.pyHarness(src, src.solution, cases, { record: true }), limit); }
  catch (e) { throw new Error(src.id + ': the reference solution did not finish: ' + (e && e.message ? e.message : e)); }
  var p = J.parsePyOutput(text);
  if (p.fatal) throw new Error(src.id + ': the reference solution failed to load: ' + p.fatal);
  p.cases.forEach(function (r, i) {
    if (r.err) throw new Error(src.id + ': case ' + (i + 1) + ': the reference raised ' + r.err);
  });
  if (!p.done || p.cases.length !== src.cases.length) throw new Error(src.id + ': the reference run ended early');
  return src.cases.map(function (c, i) {
    var r = p.cases[i], tag = src.id + ': case ' + (i + 1);
    if (c.expect !== undefined && !r.ok) throw new Error(tag + ': the reference gives ' + clip(r.got) + ' but the hand-written answer is ' + clip(c.expect));
    var o = { expected: r.got };
    if (c.args) o.args = c.args;
    if (c.ops) o.ops = c.ops;
    if (c.hidden) o.hidden = true;
    return o;
  });
}

// returns a copy of the source with `cases` rewritten: setup/args, hidden flag, and a computed `expected`
async function computeExpected(src, runners, opts) {
  var limit = (opts && opts.limitMs) || 20000;
  var copy = Object.assign({}, src);
  if (src.lang === 'sql') copy.cases = await computeSql(src, runners.sql, limit);
  else copy.cases = await computePy(src, runners.py, limit);
  return copy;
}

/* ---------------------------------------------------------------- page output */
function toPage(full) {
  var fence = full.lang === 'sql' ? 'sql' : 'python';
  var page = {
    id: full.id, day: full.day, lang: full.lang, anchor: full.anchor, cat: full.cat, bounty: full.bounty,
    title: full.title, statement: full.statement, starter: full.starter, hints: full.hints,
    approach: full.approach.trim() + '\n\n```' + fence + '\n' + full.solution.trim() + '\n```',
  };
  if (full.lang === 'sql') {
    page.kind = full.kind || 'select';
    page.ordered = !!full.ordered;
    if (full.verify) page.verify = full.verify;
    page.schema = full.schema || [];
  } else {
    page.kind = full.kind || 'func';
    page.cmp = full.cmp || 'eq';
    if (full.fn) page.fn = full.fn;
    if (full.cls) page.cls = full.cls;
    if (full.signature) page.signature = full.signature;
  }
  page.cases = full.cases.map(function (c) {
    var o = {};
    if (c.setup) o.setup = c.setup;
    if (c.tables && !c.hidden) o.tables = c.tables;
    if (c.args) o.args = c.args;
    if (c.ops) o.ops = c.ops;
    o.expected = c.expected;
    if (c.hidden) o.hidden = true;
    return o;
  });
  return page;
}

function render(problems) {
  var json = JSON.stringify(problems);
  json = json.split('<').join('\\u003c').split(String.fromCharCode(0x2028)).join('\\u2028').split(String.fromCharCode(0x2029)).join('\\u2029');
  return 'window.PROBLEMS=' + json + ';\n';
}

/* ---------------------------------------------------------------- files and CLI */
function loadProblems(dir) {
  dir = dir || DIR;
  return fs.readdirSync(dir)
    .filter(function (f) { return /\.js$/.test(f) && f.charAt(0) !== '_'; })
    .map(function (f) { return require(path.join(dir, f)); })
    .sort(function (a, b) { return a.day - b.day || (a.id < b.id ? -1 : 1); });
}

async function main(argv) {
  var check = argv.indexOf('--check') >= 0;
  var list = loadProblems();
  var errs = validateAll(list);
  if (errs.length) { console.error(errs.join('\n')); return 1; }
  var R = require('./dev/runners.js');
  var sql = await R.sqlRunner(), py = R.pyRunner();
  try {
    var pages = [];
    for (var i = 0; i < list.length; i++) {
      pages.push(toPage(await computeExpected(list[i], { sql: sql, py: py })));
      process.stdout.write('  ' + list[i].id + '\n');
    }
    var text = render(pages);
    if (check) {
      var have = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
      if (have !== text) { console.error('tools/assets/problems.js is out of date. Run: node tools/build_problems.js'); return 1; }
      console.log('problems.js is up to date (' + pages.length + ' questions)');
      return 0;
    }
    fs.writeFileSync(OUT, text);
    console.log('wrote ' + path.relative(process.cwd(), OUT) + ' (' + pages.length + ' questions, ' + Math.round(text.length / 1024) + ' KB)');
    return 0;
  } finally { sql.close(); await py.close(); }
}

module.exports = { tbl: tbl, D: D, para: para, lit: lit, setupOf: setupOf, validate: validate, validateAll: validateAll, computeExpected: computeExpected, toPage: toPage, render: render, loadProblems: loadProblems, main: main };

if (require.main === module) main(process.argv.slice(2)).then(function (code) { process.exit(code); }, function (e) { console.error(e.stack || e); process.exit(1); });
