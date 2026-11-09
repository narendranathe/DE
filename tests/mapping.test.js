'use strict';
// W1 and A3 against the built page: every question in the bank lands on exactly one checkbox of its own day,
// in the right XP category, and nothing else gets a button. Also checks that the page carries the scripts it needs.
// The test builds the page itself, into a temp file, so it never touches docs/index.html.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const W = require('../tools/assets/workspace-core.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'de-map-')), 'index.html');
execFileSync('python3', [path.join(ROOT, 'tools/render_site.py')], { env: { ...process.env, DE_OUT: OUT }, stdio: 'pipe' });
const page = fs.readFileSync(OUT, 'utf8');

const PROBLEMS = new Function('window', fs.readFileSync(path.join(ROOT, 'tools/assets/problems.js'), 'utf8') + '; return window.PROBLEMS;')({});
const start = page.indexOf('window.DAYS=') + 'window.DAYS='.length;
const DAYS = JSON.parse(page.slice(start, page.indexOf(';</script>', start)));

const card = (day) => {
  const a = page.indexOf(`<article class="day`);
  const i = page.indexOf(`id="d${day}" data-day="${day}"`, a);
  assert.ok(i > 0, 'day card ' + day);
  return page.slice(i, page.indexOf('</article>', i));
};
const items = (html) => [...html.matchAll(/<li class="check">([\s\S]*?)<\/li>/g)].map((m) => {
  const li = m[1];
  const link = /<a [^>]*>([\s\S]*?)<\/a>/.exec(li);
  return { html: li, key: (/data-k="([\d.]+)"/.exec(li) || [])[1], text: link ? link[1].replace(/<[^>]+>/g, '') : '' };
});
const btn = (id) => new RegExp(`<button\\b[^>]*\\bdata-p="${id}"[^>]*>\\s*SOLVE HERE\\s*</button>`);

test('A3 the bank has 24 questions with unique ids', () => {
  assert.equal(PROBLEMS.length, 24);
  assert.equal(new Set(PROBLEMS.map((p) => p.id)).size, 24);
});

for (const p of PROBLEMS) {
  test(`W1 ${p.id}: "${p.anchor}" matches exactly one checkbox on day ${p.day}`, () => {
    const hits = items(card(p.day)).filter((it) => W.matchAnchor(it.text, p.anchor));
    assert.equal(hits.length, 1, `checkboxes whose link starts with "${p.anchor}" on day ${p.day}: ${hits.length}`);
    assert.match(hits[0].html, btn(p.id), 'the SOLVE HERE button sits in the same list item');
    const day = DAYS[p.day];
    assert.ok(day.cats[p.cat].includes(hits[0].key), `${hits[0].key} is in the ${p.cat} category of day ${p.day}`);
    assert.deepEqual(day.probs.find((x) => x.id === p.id), { id: p.id, key: hits[0].key, cat: p.cat, bounty: p.bounty });
    const inConsole = day.groups.filter((g) => btn(p.id).test(g.html));
    assert.equal(inConsole.length, 1, 'the TODAY console shows the button too');
    assert.equal(inConsole[0].k, p.cat);
  });
}

test('W1 only bank questions get a button, and a day without any has no probs', () => {
  const inCards = page.match(/class="solve[^"]*" data-p="/g) || [];
  assert.equal(inCards.length, PROBLEMS.length);
  const withProbs = Object.keys(DAYS).filter((d) => DAYS[d].probs && DAYS[d].probs.length);
  const expected = [...new Set(PROBLEMS.map((p) => String(p.day)))].sort();
  assert.deepEqual(withProbs.sort(), expected);
  assert.equal(DAYS[14].probs, undefined);
  assert.doesNotMatch(card(14), /class="solve/);
  assert.doesNotMatch(card(7), /class="solve/, 'the day 7 timed set is not a single question');
});

test('W1 the button has an accessible name that says which question it opens', () => {
  const p = PROBLEMS.find((x) => x.id === 'sql-d02-department-top-three-salaries');
  assert.match(card(2), new RegExp(`aria-label="Solve here: ${p.title}"`));
});

test('C8 the page ships with the community switched off until a project is configured', () => {
  assert.match(page, /supabaseUrl:\s*""/);
  assert.match(page, /supabaseKey:\s*""/);
});

test('page carries the workspace scripts, in the order they need', () => {
  const at = (needle) => { const i = page.indexOf(needle); assert.ok(i > 0, 'missing ' + needle); return i; };
  const judge = at('root.Judge = factory()');
  const core = at('root.WorkspaceCore = factory(root.Judge)');
  const community = at('root.Community = factory()');
  const problems = at('window.PROBLEMS=');
  const tracker = at("var XP={REVIEW:20,READ:30,BUILD:50,PRACTICE:20,RECALL:25}");
  const workspace = at('window.Workspace');
  assert.ok(judge < core && core < tracker, 'judge and core load before the tracker, which scores with them');
  assert.ok(problems < workspace && community < workspace);
  const opens = (page.match(/<script\b/g) || []).length, closes = (page.match(/<\/script>/g) || []).length;
  assert.equal(opens, closes, 'no inlined text closes a script early');
});

test('the page stays one self-contained file: no local file references', () => {
  assert.doesNotMatch(page, /<script[^>]+src="(?!https:)/);
  assert.doesNotMatch(page, /<link[^>]+href="(?!https:|data:)/);
});
