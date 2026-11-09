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

const BY_LC = Object.fromEntries(PROBLEMS.map((p) => [p.lc, p]));
const lcLinks = (html) => [...html.matchAll(/<a [^>]*href="https:\/\/leetcode\.com\/problems\/([^"\/]+)\/?"[^>]*>/g)].map((m) => m[1]);
const qLinks = (html) => [...html.matchAll(/<a class="qlink"[^>]*data-p="([^"]+)"/g)].map((m) => m[1]);
const allCards = page.slice(page.indexOf('<article class="day'));

test('W1 a day without bank questions has no probs and no buttons', () => {
  assert.equal(DAYS[14].probs, undefined);
  assert.doesNotMatch(card(14), /class="solve/);
  assert.doesNotMatch(card(7), /class="solve/, 'the day 7 timed set lists several problems in one checkbox, so it gets links and no button');
});

test('A4 every question names a different LeetCode problem', () => {
  assert.equal(new Set(PROBLEMS.map((p) => p.lc)).size, PROBLEMS.length);
  for (const p of PROBLEMS) assert.match(p.lc, /^[a-z0-9]+(-[a-z0-9]+)*$/, p.id);
});

test('W4 no problem in the plan sends you to LeetCode first: every problem link is a question here, with LeetCode as a small extra', () => {
  const raw = [...allCards.matchAll(/<a [^>]*href="https:\/\/leetcode\.com\/problems\/([^"\/]+)\/?"[^>]*>/g)];
  assert.ok(raw.length > 60, 'the plan links to many LeetCode problems');
  const missing = [...new Set(raw.map((m) => m[1]).filter((slug) => !BY_LC[slug]))];
  assert.deepEqual(missing, [], 'LeetCode problems with no question of their own');
  // each remaining LeetCode link is the quiet "LC ↗" one, right after the link that opens the question
  const plain = [...allCards.matchAll(/<a (?![^>]*class="lc")[^>]*href="https:\/\/leetcode\.com\/problems\/[^"]+"[^>]*>/g)];
  assert.equal(plain.length, 0, 'a LeetCode problem link that is not the small LC link');
  const pairs = [...allCards.matchAll(/<a class="qlink" href="#p\/([^"]+)" data-p="\1">[^<]*<\/a> <a class="lc" href="https:\/\/leetcode\.com\/problems\/([^"\/]+)\/"/g)];
  assert.equal(pairs.length, raw.length);
  for (const m of pairs) assert.equal(BY_LC[m[2]].id, m[1], 'the question link and the LeetCode link name the same problem');
});

test('W4 the link keeps its text, opens #p/<id>, and the LeetCode copy opens in a new tab without sending a referrer', () => {
  const html = card(2);
  assert.match(html, /<a class="qlink" href="#p\/sql-d02-department-top-three-salaries" data-p="sql-d02-department-top-three-salaries">LC 185 — Department Top Three Salaries<\/a>/);
  assert.match(html, /<a class="lc" href="https:\/\/leetcode\.com\/problems\/department-top-three-salaries\/" target="_blank" rel="noopener noreferrer"[^>]*>LC ↗<\/a>/);
});

test('W5 a repeat of a question on a later day gets its own button and a probs entry that costs nothing', () => {
  const rows = [[62, 'sql-d01-delete-duplicate-emails'], [64, 'sql-d02-department-top-three-salaries'], [21, 'py-d16-longest-substring'], [31, 'py-d17-min-stack']];
  for (const [day, id] of rows) {
    const hit = (DAYS[day].probs || []).find((x) => x.id === id);
    assert.ok(hit, `day ${day} has a slot for ${id}`);
    assert.equal(hit.bounty, 0, 'the hints were paid for on the first day');
    assert.equal(hit.review, true);
    assert.equal(hit.cat, 'PRACTICE');
    assert.match(card(day), new RegExp(`<button[^>]*data-p="${id}"[^>]*>SOLVE HERE</button>`));
    assert.ok(DAYS[day].cats.PRACTICE.includes(hit.key));
  }
});

test('W5 the first day of a question carries the bounty, and only that day', () => {
  for (const p of PROBLEMS.filter((x) => x.bounty > 0)) {
    const slots = Object.keys(DAYS).flatMap((d) => (DAYS[d].probs || []).filter((x) => x.id === p.id).map((x) => ({ day: +d, ...x })));
    const paid = slots.filter((x) => x.bounty > 0);
    assert.equal(paid.length, 1, `${p.id}: slots that carry XP`);
    assert.equal(paid[0].day, p.day);
    assert.equal(paid[0].bounty, p.bounty);
    assert.ok(slots.filter((x) => x.day !== p.day).every((x) => x.review === true && x.bounty === 0), `${p.id}: later days are reviews`);
  }
});

test('W5 a checkbox that lists several problems gets a link for each and no button, and never ticks itself', () => {
  for (const [day, key] of [[7, '7.6'], [78, '78.8']]) {
    const li = items(card(day)).find((it) => it.key === key);
    assert.ok(li, `${day}: ${key}`);
    assert.ok(qLinks(li.html).length >= 3, `${day}: links to several questions in ${key}`);
    assert.doesNotMatch(li.html, /class="solve/);
    assert.ok(!(DAYS[day].probs || []).some((x) => x.key === key), 'no slot for a multi-problem checkbox');
  }
});

test('W5 a question that only appears inside such a checkbox has no XP to earn or lose', () => {
  const only = PROBLEMS.filter((p) => p.bounty === 0);
  assert.ok(only.length >= 2, 'game play analysis III and account balance');
  for (const p of only) {
    assert.equal(p.cat, null, p.id);
    const everywhere = Object.keys(DAYS).flatMap((d) => (DAYS[d].probs || []).filter((x) => x.id === p.id));
    assert.deepEqual(everywhere, [], `${p.id} has no slot`);
  }
});

test('W1 buttons: one for every checkbox that holds exactly one problem, and none anywhere else', () => {
  const lis = [...allCards.matchAll(/<li class="check">([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  const single = lis.filter((li) => qLinks(li).length === 1);
  const buttons = lis.filter((li) => /class="solve/.test(li));
  assert.equal(buttons.length, single.length);
  assert.ok(buttons.every((li) => qLinks(li).length === 1));
  assert.equal((allCards.match(/class="solve[^"]*" data-p="/g) || []).length, buttons.length, 'no button outside a checkbox');
  // the number of slots in DAYS matches the number of buttons in the cards
  const slots = Object.keys(DAYS).reduce((n, d) => n + (DAYS[d].probs || []).length, 0);
  assert.equal(slots, buttons.length);
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
