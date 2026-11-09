'use strict';
// The pure rules behind the workspace screen: which hint is open, what it costs, how a solve is recorded,
// how progress from two devices is merged, how statement text is split into safe pieces.
// No browser needed. The screen itself is covered by tests/e2e/workspace.e2e.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const W = require('../tools/assets/workspace-core.js');

const SQLQ = { id: 'sql-d02-x', bounty: 20, lang: 'sql', hints: ['h1', 'h2', 'h3'], approach: 'the approach' };
const PYQ = { id: 'py-d15-x', bounty: 10, lang: 'python', hints: ['a', 'b', 'c'], approach: 'py approach' };

test('W1 matchAnchor: the link text is the anchor, or the anchor followed by a dash and a title', () => {
  assert.equal(W.matchAnchor('LC 185 — Department Top Three Salaries', 'LC 185'), true);
  assert.equal(W.matchAnchor('  LC 185 — Department Top Three Salaries ', 'LC 185'), true);
  assert.equal(W.matchAnchor('Two Sum', 'Two Sum'), true);
  assert.equal(W.matchAnchor('LC 1850 — Something', 'LC 185'), false, 'a longer number is another question');
  assert.equal(W.matchAnchor('LC 18 — Something', 'LC 185'), false);
  assert.equal(W.matchAnchor('Two Sum II', 'Two Sum'), false);
  assert.equal(W.matchAnchor('Two Sum — input is sorted', 'Two Sum'), true);
  assert.equal(W.matchAnchor('', 'Two Sum'), false);
  assert.equal(W.matchAnchor('Two Sum', ''), false);
});

test('P4 parseInline splits text, `code` and **bold**, and never produces HTML', () => {
  assert.deepEqual(W.parseInline('plain'), [{ t: 'text', v: 'plain' }]);
  assert.deepEqual(W.parseInline('use `RANK` here'), [{ t: 'text', v: 'use ' }, { t: 'code', v: 'RANK' }, { t: 'text', v: ' here' }]);
  assert.deepEqual(W.parseInline('the **three highest** salaries'), [{ t: 'text', v: 'the ' }, { t: 'bold', v: 'three highest' }, { t: 'text', v: ' salaries' }]);
  assert.deepEqual(W.parseInline('a `x` and **y** and `z`').map((s) => s.t), ['text', 'code', 'text', 'bold', 'text', 'code']);
  // tags stay as plain text for the page to show as text
  assert.deepEqual(W.parseInline('<b>hi</b>'), [{ t: 'text', v: '<b>hi</b>' }]);
  // an unclosed marker is just text
  assert.deepEqual(W.parseInline('a ` b'), [{ t: 'text', v: 'a ` b' }]);
  assert.deepEqual(W.parseInline('a ** b'), [{ t: 'text', v: 'a ** b' }]);
  assert.deepEqual(W.parseInline(''), []);
});

test('P4 a `code` span inside **bold** is a code span inside the bold, never literal backticks', () => {
  const [a, b, c] = W.parseInline('the **smallest whole number `k`** that works');
  assert.deepEqual([a.t, b.t, c.t], ['text', 'bold', 'text']);
  assert.deepEqual(b.kids, [{ t: 'text', v: 'smallest whole number ' }, { t: 'code', v: 'k' }]);
  // bold with no code keeps the plain shape the page already relies on
  assert.equal('kids' in W.parseInline('**plain**')[0], false);
  // every question in the bank shows no stray backtick after parsing
  const PROBLEMS = new Function('window', require('node:fs').readFileSync(require('node:path').join(__dirname, '../tools/assets/problems.js'), 'utf8') + '; return window.PROBLEMS;')({});
  const walk = (spans) => spans.flatMap((s) => (s.t === 'bold' ? (s.kids ? walk(s.kids) : [s]) : [s]));
  const texts = (md) => W.parseBlocks(md).flatMap((blk) => blk.t === 'p' ? walk(blk.v) : blk.t === 'ul' ? blk.items.flatMap(walk) : []);
  for (const q of PROBLEMS) {
    const all = [q.statement, q.approach, ...(q.hints || [])].filter(Boolean).flatMap(texts);
    for (const s of all) if (s.t !== 'code') assert.ok(!s.v.includes('`'), `${q.id}: a stray backtick in "${s.v.slice(0, 50)}"`);
  }
});

test('P4 parseBlocks: paragraphs, bullet lists and fenced code', () => {
  const md = 'First para\nstill first.\n\n- one\n- two with `code`\n\n```sql\nSELECT 1\n\nFROM t\n```\n\nLast.';
  const b = W.parseBlocks(md);
  assert.deepEqual(b.map((x) => x.t), ['p', 'ul', 'code', 'p']);
  assert.deepEqual(b[0].v, [{ t: 'text', v: 'First para still first.' }]);
  assert.equal(b[1].items.length, 2);
  assert.deepEqual(b[1].items[1], [{ t: 'text', v: 'two with ' }, { t: 'code', v: 'code' }]);
  assert.equal(b[2].lang, 'sql');
  assert.equal(b[2].v, 'SELECT 1\n\nFROM t', 'blank lines inside a fence stay');
  assert.deepEqual(W.parseBlocks(''), []);
  assert.deepEqual(W.parseBlocks('```\nunclosed')[0], { t: 'code', lang: '', v: 'unclosed' });
  assert.equal(W.parseBlocks('1. first\n2. second')[0].t, 'ul', 'numbered lists render as lists too');
});

test('H1 hintSlots: three hints and the approach open one at a time, in order', () => {
  let s = W.hintSlots(SQLQ, 0, false);
  assert.equal(s.length, 4);
  assert.deepEqual(s.map((x) => x.state), ['next', 'locked', 'locked', 'locked']);
  assert.deepEqual(s.map((x) => x.text), [null, null, null, null], 'closed slots reveal no text');
  s = W.hintSlots(SQLQ, 2, false);
  assert.deepEqual(s.map((x) => x.state), ['open', 'open', 'next', 'locked']);
  assert.deepEqual(s.map((x) => x.text), ['h1', 'h2', null, null]);
  s = W.hintSlots(SQLQ, 4, false);
  assert.deepEqual(s.map((x) => x.state), ['open', 'open', 'open', 'open']);
  assert.equal(s[3].text, 'the approach');
});

test('H3 hintSlots shows the cost of the next reveal, and the costs add up to the bounty', () => {
  const costs = (q) => { const out = []; let used = 0; while (used < 4) { out.push(W.hintSlots(q, used, false)[used].cost); used++; } return out; };
  assert.deepEqual(costs(SQLQ), [5, 5, 5, 5]);
  assert.deepEqual(costs(PYQ), [3, 2, 3, 2], 'bounty 10: 0 -> 3 -> 5 -> 8 -> 10');
  assert.equal(costs(PYQ).reduce((a, b) => a + b, 0), 10);
  assert.equal(W.hintSlots(SQLQ, 0, false)[1].cost, null, 'a locked slot shows no price yet');
});

test('H6 a solved question opens everything for free and records nothing', () => {
  const s = W.hintSlots(SQLQ, 1, true);
  assert.deepEqual(s.map((x) => x.state), ['open', 'open', 'open', 'open']);
  assert.equal(s[3].text, 'the approach');
  assert.equal(W.canReveal(1, 2, true), false, 'nothing to reveal once solved');
});

test('H2 canReveal: only the very next slot can be opened', () => {
  assert.equal(W.canReveal(0, 1, false), true);
  assert.equal(W.canReveal(0, 2, false), false);
  assert.equal(W.canReveal(2, 3, false), true);
  assert.equal(W.canReveal(2, 2, false), false, 'already open');
  assert.equal(W.canReveal(4, 4, false), false);
  assert.equal(W.canReveal(0, 5, false), false);
});

test('H6 approachOpen / peopleUnlocked: a solve or the full approach opens other people\'s solutions', () => {
  assert.equal(W.peopleUnlocked({ hints: 3 }, false), false);
  assert.equal(W.peopleUnlocked({ hints: 4 }, false), true);
  assert.equal(W.peopleUnlocked({ hints: 0 }, true), true);
  assert.equal(W.peopleUnlocked(undefined, false), false);
});

test('S3 mergeProgress takes the larger hint count and any solve, and says what to upload', () => {
  const local = { hints: { a: 2, b: 0, c: 1 }, solved: { a: '2026-01-01T10:00:00Z' } };
  const remote = { a: { hints: 1, solved: null }, b: { hints: 3, solved: '2026-01-02T10:00:00Z' }, d: { hints: 4, solved: null } };
  const m = W.mergeProgress(local, remote);
  assert.deepEqual(m.hints, { a: 2, b: 3, c: 1, d: 4 });
  assert.deepEqual(m.solved, { a: '2026-01-01T10:00:00Z', b: '2026-01-02T10:00:00Z' });
  assert.deepEqual(m.up.sort(), ['a', 'c'], 'a has more hints and a solve locally; c is new; b and d came from the cloud');
  assert.deepEqual(W.mergeProgress({ hints: {}, solved: {} }, {}), { hints: {}, solved: {}, up: [] });
  // the earlier solve time wins when both have one
  const both = W.mergeProgress({ hints: { a: 1 }, solved: { a: '2026-03-01T00:00:00Z' } }, { a: { hints: 1, solved: '2026-02-01T00:00:00Z' } });
  assert.equal(both.solved.a, '2026-02-01T00:00:00Z');
  assert.deepEqual(both.up, [], 'nothing local is ahead');
});

test('S3 mergeSubmissions keeps both devices\' entries once, newest first, at most 50', () => {
  const a = { code: 'x', verdict: 'Wrong Answer', passed: 1, total: 4, hints: 0, at: '2026-01-01T10:00:00.000Z' };
  const b = { code: 'y', verdict: 'Accepted', passed: 4, total: 4, hints: 1, at: '2026-01-01T11:00:00.000Z' };
  const bRemote = { ...b, id: 'r1', at: '2026-01-01T11:00:02.000Z' };      // the cloud stamps its own time
  const c = { code: 'z', verdict: 'Runtime Error', passed: 0, total: 4, hints: 0, at: '2026-01-02T09:00:00.000Z', id: 'r2' };
  const merged = W.mergeSubmissions([a, b], [bRemote, c]);
  assert.deepEqual(merged.map((x) => x.code), ['z', 'y', 'x']);
  const many = Array.from({ length: 60 }, (_, i) => ({ code: 'c' + i, verdict: 'Wrong Answer', passed: 0, total: 1, hints: 0, at: new Date(2026, 0, 1, 0, i).toISOString() }));
  assert.equal(W.mergeSubmissions(many, []).length, 50);
  assert.equal(W.mergeSubmissions(many, [])[0].code, 'c59');
  // two identical local submissions stay two when the cloud has two too
  assert.equal(W.mergeSubmissions([a, { ...a, at: '2026-01-01T10:05:00.000Z' }], [{ ...a, id: '1' }, { ...a, id: '2' }]).length, 2);
});

test('S1 and H4 recordSubmission saves the attempt, and the first Accepted marks the question solved', () => {
  const ws = W.emptyWs();
  const at = '2026-02-03T04:05:06.000Z';
  const r1 = W.recordSubmission(ws, SQLQ, { verdict: 'Wrong Answer', passed: 1, total: 4, ms: 7 }, 'select 1', at);
  assert.equal(r1.firstSolve, false);
  assert.equal(r1.ws.subs[SQLQ.id].length, 1);
  assert.deepEqual(r1.ws.subs[SQLQ.id][0], { code: 'select 1', verdict: 'Wrong Answer', passed: 1, total: 4, ms: 7, hints: 0, at });
  assert.deepEqual(ws, W.emptyWs(), 'the old state is not changed');

  const withHints = { ...r1.ws, hints: { [SQLQ.id]: 2 } };
  const r2 = W.recordSubmission(withHints, SQLQ, { verdict: 'Accepted', passed: 4, total: 4, ms: 9 }, 'select 2', at);
  assert.equal(r2.firstSolve, true);
  assert.equal(r2.ws.solved[SQLQ.id], at);
  assert.equal(r2.ws.subs[SQLQ.id][0].hints, 2, 'the hints used at that moment are saved with the attempt');
  assert.equal(r2.ws.subs[SQLQ.id].length, 2);
  assert.equal(r2.ws.subs[SQLQ.id][0].verdict, 'Accepted', 'newest first');

  const r3 = W.recordSubmission(r2.ws, SQLQ, { verdict: 'Accepted', passed: 4, total: 4, ms: 3 }, 'select 3', '2026-02-04T00:00:00.000Z');
  assert.equal(r3.firstSolve, false);
  assert.equal(r3.ws.solved[SQLQ.id], at, 'the first solve time stays');

  let ws2 = W.emptyWs();
  for (let i = 0; i < 55; i++) ws2 = W.recordSubmission(ws2, SQLQ, { verdict: 'Wrong Answer', passed: 0, total: 1, ms: 1 }, 'c' + i, at).ws;
  assert.equal(ws2.subs[SQLQ.id].length, 50, 'the last 50 are kept');
  assert.equal(ws2.subs[SQLQ.id][0].code, 'c54');
});

test('H2 revealHint records the reveal once, in order, and never goes back', () => {
  let ws = W.emptyWs();
  ws = W.revealHint(ws, SQLQ.id, 1);
  assert.equal(ws.hints[SQLQ.id], 1);
  assert.equal(W.revealHint(ws, SQLQ.id, 3).hints[SQLQ.id], 1, 'cannot skip ahead');
  assert.equal(W.revealHint(ws, SQLQ.id, 1).hints[SQLQ.id], 1, 'cannot open twice');
  ws = W.revealHint(ws, SQLQ.id, 2);
  assert.equal(ws.hints[SQLQ.id], 2);
  const solved = { ...ws, solved: { [SQLQ.id]: 'x' } };
  assert.equal(W.revealHint(solved, SQLQ.id, 3).hints[SQLQ.id], 2, 'free after a solve, so nothing is recorded');
});

test('W3 draftFor: the saved draft, else the starter', () => {
  const q = { id: 'p', starter: '-- start\n' };
  assert.equal(W.draftFor(W.emptyWs(), q), '-- start\n');
  assert.equal(W.draftFor({ ...W.emptyWs(), drafts: { p: 'select 1' } }, q), 'select 1');
  assert.equal(W.draftFor({ ...W.emptyWs(), drafts: { p: '' } }, q), '', 'an empty draft is a draft');
  assert.equal(W.setDraft(W.emptyWs(), 'p', 'abc').drafts.p, 'abc');
  assert.equal(W.setDraft({ ...W.emptyWs(), drafts: { p: 'abc' } }, 'p', null).drafts.p, undefined, 'null removes it');
  assert.equal(W.setDraft(W.emptyWs(), 'p', 'x'.repeat(30000)).drafts.p.length, 20000, 'drafts are capped');
});

test('P4 normalizeWs cleans state that comes from outside (an import file, an old version)', () => {
  assert.deepEqual(W.normalizeWs(undefined), W.emptyWs());
  assert.deepEqual(W.normalizeWs('nope'), W.emptyWs());
  const dirty = {
    hints: { a: 2, b: 9, c: -1, d: 'x', e: 1.7 },
    solved: { a: '2026-01-01T00:00:00Z', b: 5, c: '' },
    subs: { a: [{ code: 'x', verdict: 'Accepted', passed: 1, total: 1, ms: 2, hints: 0, at: '2026-01-01T00:00:00Z' }, { nope: true }, 'str'], b: 'bad' },
    drafts: { a: 'ok', b: 7 },
    extra: 'dropped',
  };
  const n = W.normalizeWs(dirty);
  assert.deepEqual(n.hints, { a: 2, b: 4, e: 1 }, 'clamped to 0..4, junk dropped, zero kept out');
  assert.deepEqual(n.solved, { a: '2026-01-01T00:00:00Z' });
  assert.equal(n.subs.a.length, 1);
  assert.equal(n.subs.b, undefined);
  assert.deepEqual(n.drafts, { a: 'ok' });
  assert.equal(n.extra, undefined);
  assert.deepEqual(W.normalizeWs({ hints: { __proto__: 1, constructor: 2 } }).hints, {}, 'no prototype keys');
  // JSON.parse makes a real own "__proto__" key, which is how an import file could try it
  const evil = W.normalizeWs(JSON.parse('{"subs":{"__proto__":[{"code":"x","verdict":"Accepted","passed":1,"total":1}]},"hints":{"__proto__":3},"solved":{"constructor":"x"}}'));
  assert.deepEqual(Object.keys(evil.subs), []);
  assert.equal(Object.getPrototypeOf(evil.subs), Object.prototype);
  assert.deepEqual(evil.hints, {});
  assert.deepEqual(evil.solved, {});
});

test('J2 a checker failure is not an attempt: nothing is saved', () => {
  const ws = W.emptyWs();
  const r = W.recordSubmission(ws, SQLQ, { verdict: 'Judge Error', passed: 0, total: 3, ms: 4 }, 'select 1', 'x');
  assert.equal(r.ws, ws);
  assert.equal(r.firstSolve, false);
});

test('W2 the address #p/<id> opens a question, and only a safe id counts', () => {
  assert.equal(W.parseHash('#p/sql-d02-department-top-three-salaries'), 'sql-d02-department-top-three-salaries');
  assert.equal(W.parseHash('#p/py-d15-two-sum'), 'py-d15-two-sum');
  assert.equal(W.parseHash('#d15'), null);
  assert.equal(W.parseHash(''), null);
  assert.equal(W.parseHash('#p/'), null);
  assert.equal(W.parseHash('#p/<script>'), null);
  assert.equal(W.parseHash('#p/a/b'), null);
  assert.equal(W.hashFor('py-d15-two-sum'), '#p/py-d15-two-sum');
});

test('J2 verdictLine and the table that shows a failing case', () => {
  assert.equal(W.verdictLine({ verdict: 'Accepted', passed: 6, total: 6, ms: 123 }), 'Accepted · 6/6 cases · 123 ms');
  assert.equal(W.verdictLine({ verdict: 'Wrong Answer', passed: 2, total: 6, ms: 5000 }), 'Wrong Answer · 2/6 cases passed · 5.0 s');
  assert.equal(W.verdictLine({ verdict: 'Time Limit Exceeded', passed: 0, total: 3, ms: 5003 }), 'Time Limit Exceeded · 0/3 cases passed · 5.0 s');
  assert.equal(W.verdictLine({ verdict: 'Runtime Error', passed: 0, total: 3, ms: 1 }), 'Runtime Error · 0/3 cases passed · 1 ms');
  assert.equal(W.verdictLine({ verdict: 'Judge Error', passed: 0, total: 3, ms: 1 }), 'Could not run the checker');
  assert.equal(W.verdictLine({ verdict: 'Accepted', passed: 1, total: 1, ms: 1 }, 'run'), 'Samples passed · 1/1 · 1 ms');
  assert.equal(W.verdictLine({ verdict: 'Wrong Answer', passed: 0, total: 2, ms: 8 }, 'run'), 'Wrong Answer on a sample · 0/2 passed · 8 ms');
});

test('H5 xpLabel: the day line shows net XP and what the hints took', () => {
  assert.equal(W.xpLabel(150, 170, 0), '150 / 170 XP');
  assert.equal(W.xpLabel(150, 170, 10), '150 / 170 XP (−10 hints)');
  assert.equal(W.xpLabel(0, 170, 5), '0 / 170 XP (−5 hints)');
});
