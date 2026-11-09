'use strict';
// Browser tests for the question workspace. Run with:  npm run test:e2e
// Real page, real DuckDB and real Python (Pyodide), real clicks. Only the network is faked: see harness.js.
// The community runs on the in-memory copy of the service (same contract as the Supabase one) so two people can be played in one page.
//   SHOTS=/some/dir npm run test:e2e   also saves screenshots there.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { start } = require('./harness.js');
const B = require('../../tools/build_problems.js');

const bank = Object.fromEntries(B.loadProblems().map((p) => [p.id, p]));
const SQLQ = bank['sql-d02-department-top-three-salaries'];
const PYQ = bank['py-d15-two-sum'];
const SQL_ID = SQLQ.id, PY_ID = PYQ.id;
const MEM_SRC = fs.readFileSync(path.join(__dirname, '../../tools/dev/memory-community.js'), 'utf8');
const SHOTS = process.env.SHOTS;

test('workspace in a real browser', { timeout: 900000 }, async (t) => {
  const env = await start();
  t.after(() => env.close());
  const { page, errors } = await env.newPage();
  await page.goto(env.url);
  await page.waitForFunction(() => window.Workspace && window.DE);

  const solveBtn = (id) => page.locator(`.solve[data-p="${id}"]`).first();
  const openQ = async (id) => { await page.evaluate((i) => window.Workspace.open(i), id); await page.waitForSelector('#ws[open]'); };
  const closeQ = async () => { await page.keyboard.press('Escape'); await page.waitForSelector('#ws:not([open])', { state: 'attached' }); };
  const editor = (code) => page.fill('#wsEditor', code);
  const verdict = async (btn) => {
    await page.evaluate(() => { const v = document.querySelector('#wsResult .ws-verdict'); if (v) v.remove(); });
    await page.click(btn);
    await page.waitForSelector('#wsResult .ws-verdict', { timeout: 150000 });
    return page.getAttribute('#wsResult .ws-verdict', 'data-verdict');
  };
  const tab = async (name) => { await page.click(`#ws [role=tab][data-tab="${name}"]`); await page.waitForTimeout(50); };
  const paneText = () => page.innerText('#wsPane');
  const shot = async (name) => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); } };

  /* ------------------------------------------------------------------ W1, W2 */
  await t.test('W1 the console shows SOLVE HERE for a bank question and nothing for one without', async () => {
    await page.click('#btnNext'); // day 2
    assert.equal(await page.locator(`#console .solve[data-p="${SQL_ID}"]`).count(), 1);
    assert.equal(await page.locator('#console .solve').count(), 1);
    assert.match(await page.innerText(`#console .solve[data-p="${SQL_ID}"]`), /SOLVE HERE/);
    await page.click('#btnPrev'); // day 1 has one too
    assert.equal(await page.locator('#console .solve').count(), 1);
    await page.evaluate(() => { for (let i = 0; i < 6; i++) document.getElementById('btnNext').click(); }); // day 7, no single question
    assert.equal(await page.locator('#console .solve').count(), 0);
    await page.evaluate(() => { document.getElementById('btnToday').click(); });
  });

  await t.test('W2 SOLVE HERE opens the split view; Esc closes it and focus goes back to the button', async () => {
    await page.click('#btnNext');
    await page.click(`#console .solve[data-p="${SQL_ID}"]`);
    await page.waitForSelector('#ws[open]');
    assert.equal(await page.evaluate(() => location.hash), '#p/' + SQL_ID);
    assert.equal(await page.innerText('#wsTitle'), SQLQ.title);
    const tabs = await page.locator('#ws [role=tab]').evaluateAll((els) => els.map((e) => e.dataset.tab));
    assert.deepEqual(tabs, ['desc', 'hints', 'solutions', 'discuss', 'subs']);
    assert.equal(await page.inputValue('#wsEditor'), SQLQ.starter);
    for (const id of ['#wsRun', '#wsSubmit', '#wsReset']) assert.equal(await page.locator(id).isVisible(), true, id);
    assert.match(await page.innerText('#wsBounty'), /20 XP/);
    await page.keyboard.press('Escape');
    await page.waitForSelector('#ws:not([open])', { state: 'attached' });
    await page.waitForFunction(() => location.hash === ''); // going back in history is asynchronous
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.dataset.p), SQL_ID);
    await page.evaluate(() => { document.getElementById('btnToday').click(); });
  });

  await t.test('W2 the description shows the statement and a sample, as text', async () => {
    await openQ(SQL_ID);
    const text = await paneText();
    assert.match(text, /three highest distinct salaries/);
    assert.match(text, /Example 1/);
    assert.match(text, /employee/);
    assert.equal(await page.locator('#wsPane code').count() > 0, true, 'inline code is shown as code');
    await closeQ();
  });

  await t.test('W2 side by side on a wide screen, stacked below 900 px', async () => {
    await openQ(SQL_ID);
    const rects = () => page.evaluate(() => {
      const a = document.querySelector('#ws .ws-left').getBoundingClientRect(), b = document.querySelector('#ws .ws-right').getBoundingClientRect();
      return { aRight: a.right, aBottom: a.bottom, bLeft: b.left, bTop: b.top };
    });
    let r = await rects();
    assert.ok(r.bLeft >= r.aRight - 1, 'editor sits to the right of the problem');
    await shot('desktop-light-sql');
    await page.setViewportSize({ width: 700, height: 900 });
    r = await rects();
    assert.ok(r.bTop >= r.aBottom - 1, 'editor sits below the problem');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'no sideways scroll');
    await shot('mobile-light-sql');
    await page.setViewportSize({ width: 1280, height: 860 });
    await closeQ();
  });

  /* ------------------------------------------------------------------ W3 */
  await t.test('W3 a draft is kept as you type, and RESET asks before it restores the starter', async () => {
    await openQ(SQL_ID);
    await editor('select 42 as draft');
    await page.waitForTimeout(600);
    assert.equal(await page.evaluate((id) => DE.ws().drafts[id], SQL_ID), 'select 42 as draft');
    await closeQ(); await openQ(SQL_ID);
    assert.equal(await page.inputValue('#wsEditor'), 'select 42 as draft');
    await page.click('#wsReset');
    assert.equal(await page.locator('#wsResult .ws-confirm-reset').isVisible(), true);
    await page.click('#wsResult .ws-cancel');
    assert.equal(await page.inputValue('#wsEditor'), 'select 42 as draft', 'cancel keeps the code');
    await page.click('#wsReset'); await page.click('#wsResult .ws-confirm-reset .ws-confirm');
    assert.equal(await page.inputValue('#wsEditor'), SQLQ.starter);
    assert.equal(await page.evaluate((id) => DE.ws().drafts[id], SQL_ID), undefined);
    await closeQ();
  });

  /* ------------------------------------------------------------------ J1, J2 on SQL */
  await t.test('J1 RUN on SQL: a wrong query shows your output next to the expected output', async () => {
    await openQ(SQL_ID);
    await editor('SELECT name AS department, name AS employee, id AS salary FROM department');
    assert.equal(await verdict('#wsRun'), 'Wrong Answer');
    assert.match(await page.innerText('#wsResult .ws-verdict'), /Wrong Answer on a sample/);
    const fail = await page.innerText('#wsResult .ws-fail');
    assert.match(fail, /Expected/);
    assert.match(fail, /Your output/);
    assert.equal(await page.locator('#wsResult .ws-fail table').count() >= 2, true, 'two tables: expected and yours');
    assert.equal(await page.evaluate((id) => (DE.ws().subs[id] || []).length, SQL_ID), 0, 'RUN is not a submission');
  });

  await t.test('J2 a syntax error is a Runtime Error with the engine message', async () => {
    await editor('SELEC 1');
    assert.equal(await verdict('#wsSubmit'), 'Runtime Error');
    assert.match(await page.innerText('#wsResult .ws-fail'), /syntax|Parser/i);
  });

  await t.test('J1 and J2 the reference solution passes the samples, then SUBMIT is Accepted and ticks the box', async () => {
    const key = await page.evaluate((id) => DE.problem(id).key, SQL_ID);
    assert.equal(await page.evaluate((k) => DE.isOn(k), key), false);
    await editor(SQLQ.solution);
    assert.equal(await verdict('#wsRun'), 'Accepted');
    assert.match(await page.innerText('#wsResult .ws-verdict'), /Samples passed/);
    assert.equal(await page.evaluate((k) => DE.isOn(k), key), false, 'RUN alone never ticks');
    assert.equal(await verdict('#wsSubmit'), 'Accepted');
    assert.match(await page.innerText('#wsResult .ws-verdict'), /Accepted · \d+\/\d+ cases/);
    assert.equal(await page.evaluate((k) => DE.isOn(k), key), true, 'H4 the question is ticked');
    assert.equal(await page.evaluate((k) => document.querySelector(`#days input[data-k="${k}"]`).checked, key), true, 'and so is the box in the day card');
    assert.match(await page.innerText('#wsResult'), /ticked/i);
    await shot('desktop-light-accepted');
  });

  await t.test('J5 a learner who creates a table cannot touch the playground\'s data', async () => {
    const before = await page.evaluate(() => (window.__pg ? 1 : 0));
    assert.equal(before, 1);
    await editor('CREATE TABLE employee(x INT); SELECT 1 AS x');
    await verdict('#wsRun');
    await editor(SQLQ.solution);
    assert.equal(await verdict('#wsSubmit'), 'Accepted', 'the next run starts clean');
  });

  /* ------------------------------------------------------------------ S1, S2 */
  await t.test('S1 and S2 every SUBMIT is saved; picking one loads its code', async () => {
    await tab('subs');
    const rows = await page.locator('#wsPane .ws-sub').count();
    assert.equal(rows, 3, 'syntax error, accepted, accepted (RUN is not saved)');
    const first = await page.locator('#wsPane .ws-sub').first().getAttribute('data-verdict');
    assert.equal(first, 'Accepted', 'newest first');
    const last = page.locator('#wsPane .ws-sub').last();
    assert.equal(await last.getAttribute('data-verdict'), 'Runtime Error');
    await last.click();
    assert.equal(await page.inputValue('#wsEditor'), 'SELEC 1');
    const saved = await page.evaluate((id) => DE.ws().subs[id].length, SQL_ID);
    assert.equal(saved, 3);
    await closeQ();
  });

  /* ------------------------------------------------------------------ J on Python */
  await t.test('J2 Python: wrong answer, runtime error, time limit, then Accepted', async () => {
    await page.evaluate(() => Workspace.setLimit(2500));
    await openQ(PY_ID);
    assert.equal(await page.inputValue('#wsEditor'), PYQ.starter);
    await editor('def two_sum(nums, target):\n    print("debug line")\n    return [0, 0]\n');
    assert.equal(await verdict('#wsSubmit'), 'Wrong Answer');
    const fail = await page.innerText('#wsResult .ws-fail');
    assert.match(fail, /two_sum\(/, 'the failing call is shown');
    assert.match(fail, /Expected/);
    assert.match(fail, /debug line/, 'what you printed is shown');

    await editor('def two_sum(nums, target):\n    return nums[99]\n');
    assert.equal(await verdict('#wsSubmit'), 'Runtime Error');
    assert.match(await page.innerText('#wsResult .ws-fail'), /IndexError/);

    await editor('def two_sum(nums, target):\n    while True:\n        pass\n');
    assert.equal(await verdict('#wsSubmit'), 'Time Limit Exceeded');

    await editor(PYQ.solution);
    assert.equal(await verdict('#wsRun'), 'Accepted');
    assert.equal(await verdict('#wsSubmit'), 'Accepted');
    const key = await page.evaluate((id) => DE.problem(id).key, PY_ID);
    assert.equal(await page.evaluate((k) => DE.isOn(k), key), true);
    await page.evaluate(() => Workspace.setLimit(5000));
    await closeQ();
  });

  /* ------------------------------------------------------------------ H2, H3, H5 */
  await t.test('H1 to H3 hints open one at a time, show their cost first, and need a confirm', async () => {
    const id = 'py-d15-group-anagrams';
    const q = bank[id];
    await openQ(id);
    await tab('hints');
    const states = await page.locator('#wsPane .ws-hint').evaluateAll((els) => els.map((e) => e.dataset.state));
    assert.deepEqual(states, ['next', 'locked', 'locked', 'locked']);
    const body = await paneText();
    assert.ok(!body.includes(q.hints[0].slice(0, 30)), 'a closed hint shows no text');
    const label = await page.innerText('.ws-hint[data-n="1"] .ws-reveal');
    assert.match(label, /3 XP/, 'the price is on the button');
    await page.click('.ws-hint[data-n="1"] .ws-reveal');
    assert.match(await page.innerText('.ws-hint[data-n="1"] .ws-confirm-box'), /3 XP/);
    assert.ok(!(await paneText()).includes(q.hints[0].slice(0, 30)), 'still closed before the confirm');
    await page.click('.ws-hint[data-n="1"] .ws-cancel');
    assert.equal(await page.evaluate((i) => DE.ws().hints[i] || 0, id), 0);
    await page.click('.ws-hint[data-n="1"] .ws-reveal');
    await page.click('.ws-hint[data-n="1"] .ws-confirm');
    assert.ok((await paneText()).includes(q.hints[0].slice(0, 30)));
    assert.equal(await page.evaluate((i) => DE.ws().hints[i], id), 1);
    const after = await page.locator('#wsPane .ws-hint').evaluateAll((els) => els.map((e) => e.dataset.state));
    assert.deepEqual(after, ['open', 'next', 'locked', 'locked']);
    assert.match(await page.innerText('#wsBounty'), /−3 XP|-3 XP/);
    assert.equal(await page.locator('.ws-hint[data-n="3"] .ws-reveal').count(), 0, 'cannot skip ahead');
    await closeQ(); await openQ(id); await tab('hints');
    assert.ok((await paneText()).includes(q.hints[0].slice(0, 30)), 'an opened hint stays open after closing and reopening');
    await closeQ();
  });

  await t.test('H5 the day line shows the XP the hints took, once the category is earned', async () => {
    const info = await page.evaluate(() => ({ keys: DAYS[15].cats.BUILD, max: DAYS[15].max }));
    await page.evaluate((keys) => keys.forEach((k) => DE.tick(k)), info.keys);
    await page.evaluate(() => { for (let i = 0; i < 14; i++) document.getElementById('btnNext').click(); });
    const label = await page.innerText('#conXp');
    assert.equal(label, `47 / ${info.max} XP (−3 hints)`, 'BUILD earns 50, the one hint on Group Anagrams cost 3');
    const chip = await page.innerText('[data-xp="15"]');
    assert.equal(chip, label);
    await openQ('py-d15-group-anagrams'); await tab('hints');
    await page.click('.ws-hint[data-n="2"] .ws-reveal'); await page.click('.ws-hint[data-n="2"] .ws-confirm');
    await closeQ();
    assert.equal(await page.innerText('#conXp'), `45 / ${info.max} XP (−5 hints)`);
    await page.evaluate(() => { document.getElementById('btnToday').click(); });
  });

  await t.test('H6 the full approach opens after the last hint and shows the reference solution', async () => {
    const id = 'py-d15-top-k-frequent';
    const q = bank[id];
    await openQ(id); await tab('hints');
    for (const n of [1, 2, 3, 4]) { await page.click(`.ws-hint[data-n="${n}"] .ws-reveal`); await page.click(`.ws-hint[data-n="${n}"] .ws-confirm`); }
    assert.equal(await page.evaluate((i) => DE.ws().hints[i], id), 4);
    assert.match(await page.innerText('.ws-hint[data-n="4"]'), /def top_k_frequent/);
    await tab('solutions');
    assert.match(await paneText(), /def top_k_frequent/, 'the approach is in Solutions too');
    await closeQ();
    assert.equal(q.bounty, 10);
  });

  /* ------------------------------------------------------------------ C1, C8 with no project */
  await t.test('C8 with no project configured the community says so instead of failing', async () => {
    await openQ('py-d16-valid-palindrome');
    await tab('discuss');
    assert.match(await paneText(), /not set up/i);
    await tab('solutions');
    assert.match(await paneText(), /not set up/i);
    assert.equal(await page.locator('#wsAuth button').count(), 0, 'no sign-in button without a project');
    await closeQ();
  });

  /* ------------------------------------------------------------------ community, two people */
  await t.test('C1 to C7 solutions and discussion, as alice, bob and a moderator', async () => {
    await page.evaluate((src) => {
      const m = { exports: {} };
      new Function('module', 'exports', 'require', src)(m, m.exports, () => window.Community);
      window.__world = m.exports.makeWorld();
    }, MEM_SRC);
    const as = (who) => page.evaluate((w) => Workspace.useCommunity(window.__world[w]), who);
    await as('alice');
    const clear = () => page.evaluate(() => DE.setWs(WorkspaceCore.emptyWs()));

    // alice solves, so her progress reaches the shared service, then shares
    await clear();
    await openQ(SQL_ID);
    assert.match(await page.innerText('#wsAuth'), /alice/);
    await editor(SQLQ.solution);
    assert.equal(await verdict('#wsSubmit'), 'Accepted');
    await tab('solutions');
    assert.match(await paneText(), /Share your solution/i);
    await page.fill('#wsShareTitle', 'DENSE_RANK in a subquery');
    await page.fill('#wsShareText', 'Ties share a place, so `DENSE_RANK`.');
    await page.click('#wsShare');
    await page.waitForSelector('.ws-sol');
    const first = await page.locator('.ws-sol').first().innerText();
    assert.match(first, /DENSE_RANK in a subquery/);
    assert.match(first, /alice/);
    assert.equal(await page.locator('.ws-sol .ws-vote').count(), 0, 'no vote button on your own solution');
    await closeQ();

    // bob has solved nothing: locked, until he opens the full approach
    await as('bob'); await clear();
    await openQ(SQL_ID); await tab('solutions');
    assert.match(await paneText(), /Solve this question, or open the full approach/i);
    assert.equal(await page.locator('.ws-sol').count(), 0);
    await tab('hints');
    for (const n of [1, 2, 3, 4]) { await page.click(`.ws-hint[data-n="${n}"] .ws-reveal`); await page.click(`.ws-hint[data-n="${n}"] .ws-confirm`); }
    await tab('solutions');
    await page.waitForSelector('.ws-sol');
    assert.match(await page.innerText('.ws-sol'), /DENSE_RANK in a subquery/);
    await page.click('.ws-sol .ws-vote');
    await page.waitForFunction(() => /1/.test(document.querySelector('.ws-sol .ws-vote').innerText));
    assert.equal(await page.getAttribute('.ws-sol .ws-vote', 'aria-pressed'), 'true');
    await page.click('.ws-sol .ws-vote');
    await page.waitForFunction(() => /0/.test(document.querySelector('.ws-sol .ws-vote').innerText));

    // discussion: text stays text (P4), spoilers are collapsed, replies, edit, delete, report
    await tab('discuss');
    const nasty = '<img src=x onerror="window.__xss=1"> & <b>bold</b>';
    await page.fill('#wsCommentBody', nasty);
    await page.click('#wsPost');
    await page.waitForSelector('.ws-cm');
    assert.equal(await page.locator('#wsPane img[src="x"], #wsPane b').count(), 0, 'no element was created from the text');
    assert.equal(await page.evaluate(() => window.__xss), undefined);
    assert.ok((await page.innerText('.ws-cm .ws-cm-body')).includes('<img src=x onerror="window.__xss=1">'));
    await page.fill('#wsCommentBody', 'The answer is DENSE_RANK');
    await page.check('#wsSpoiler');
    await page.click('#wsPost');
    await page.waitForFunction(() => document.querySelectorAll('.ws-cm').length === 2);
    const spoiler = page.locator('.ws-cm', { hasText: 'Spoiler' }).first();
    assert.ok(!(await page.innerText('#wsPane')).includes('The answer is DENSE_RANK'), 'a spoiler is hidden until clicked');
    await spoiler.locator('.ws-spoiler-btn').click();
    assert.ok((await page.innerText('#wsPane')).includes('The answer is DENSE_RANK'));

    await as('alice');
    await tab('subs'); await tab('discuss');
    const theirs = page.locator('.ws-cm', { hasText: 'bold' }).first();
    assert.equal(await theirs.locator('.ws-edit').count(), 0, 'alice cannot edit bob\'s comment');
    await theirs.locator('.ws-reply').click();
    await page.fill('.ws-reply-box textarea', 'good catch');
    await page.click('.ws-reply-box .ws-post-reply');
    await page.waitForSelector('.ws-cm.is-reply');
    await theirs.locator('.ws-report').click();
    await page.fill('.ws-report-box input', 'spam');
    await page.click('.ws-report-box .ws-confirm');
    await theirs.locator('.ws-report-done').waitFor();
    assert.equal(await theirs.locator('.ws-report').count(), 0, 'the report button is gone once it is sent');
    const mine = page.locator('.ws-cm.is-reply').first();
    await mine.locator('.ws-edit').click();
    await page.fill('.ws-edit-box textarea', 'good catch, thanks');
    await page.click('.ws-edit-box .ws-save');
    await page.waitForFunction(() => /good catch, thanks/.test(document.querySelector('.ws-cm.is-reply').innerText));
    assert.match(await page.innerText('.ws-cm.is-reply'), /edited/i);
    await mine.locator('.ws-del').click();
    await page.click('.ws-cm .ws-confirm-del .ws-confirm');
    await page.waitForFunction(() => document.querySelectorAll('.ws-cm.is-reply').length === 0);

    // the moderator hides bob's comment: bob stops seeing it, the moderator still sees it, marked
    await as('mod');
    await tab('subs'); await tab('discuss');
    await page.locator('.ws-cm', { hasText: 'bold' }).first().locator('.ws-hide').click();
    await page.waitForSelector('.ws-cm .ws-hidden-tag');
    await as('bob');
    await tab('subs'); await tab('discuss');
    await page.waitForFunction(() => document.querySelectorAll('.ws-cm').length >= 1);
    assert.equal(await page.locator('.ws-cm', { hasText: 'bold' }).count(), 1, 'the author of a hidden comment still sees it');
    await as('cy'); // a stranger with no progress at all
    await tab('subs'); await tab('discuss');
    await page.waitForFunction(() => document.querySelectorAll('.ws-cm').length === 1);
    assert.equal(await page.locator('.ws-cm', { hasText: 'bold' }).count(), 0, 'hidden for everyone else');
    await shot('desktop-light-discussion');
    await closeQ();
  });

  /* ------------------------------------------------------------------ export, import, reset */
  await t.test('S1 export includes the workspace, reset clears it, import brings it back', async () => {
    await page.evaluate(() => Workspace.useCommunity(null));
    await openQ(SQL_ID); await editor('SELEC 1'); await verdict('#wsSubmit'); await closeQ(); // one attempt of this browser's own
    const before = await page.evaluate(() => JSON.stringify(DE.ws()));
    assert.ok(JSON.parse(before).subs[SQL_ID].length >= 1);
    await page.click('#btnExport');
    const text = await page.inputValue('#ioBox');
    const snap = JSON.parse(text);
    assert.equal(snap.v, 4);
    assert.deepEqual(snap.ws.hints, JSON.parse(before).hints);
    page.once('dialog', (d) => d.accept());
    await page.click('#btnReset');
    assert.equal(await page.evaluate(() => JSON.stringify(DE.ws())), JSON.stringify({ hints: {}, solved: {}, subs: {}, drafts: {} }));
    assert.equal(await page.innerText('#conXp').then((x) => /hints/.test(x)), false);
    await page.click('#btnPaste'); // the first press opens the empty box
    await page.fill('#ioBox', text);
    page.once('dialog', (d) => d.accept());
    await page.click('#btnPaste');
    await page.waitForFunction(() => Object.keys(DE.ws().hints).length > 0);
    assert.equal(await page.evaluate(() => JSON.stringify(DE.ws())), before);
  });

  await t.test('P4 an import file with junk in the workspace part is cleaned, not trusted', async () => {
    const evil = JSON.stringify({ v: 4, checks: {}, log: {}, ws: { hints: { 'py-d15-two-sum': 99, '__proto__': 3 }, subs: { x: 'nope' }, drafts: { a: 5 } } });
    await page.click('#btnPaste');
    await page.fill('#ioBox', evil);
    page.once('dialog', (d) => d.accept());
    await page.click('#btnPaste');
    await page.waitForFunction(() => DE.ws().hints['py-d15-two-sum'] === 4);
    assert.deepEqual(await page.evaluate(() => DE.ws()), { hints: { 'py-d15-two-sum': 4 }, solved: {}, subs: {}, drafts: {} });
  });

  assert.deepEqual(errors, [], 'no script errors in the page: ' + errors.join(' | '));
});

test('W2 the address #p/<id> opens a question straight away, and a bad id opens nothing', { timeout: 120000 }, async (t) => {
  const env = await start();
  t.after(() => env.close());
  const { page, errors } = await env.newPage();
  await page.goto(env.url + '#p/' + PY_ID);
  await page.waitForSelector('#ws[open]');
  assert.equal(await page.innerText('#wsTitle'), 'Two Sum');
  assert.equal(await page.inputValue('#wsEditor'), PYQ.starter);
  await page.keyboard.press('Escape');
  await page.waitForSelector('#ws:not([open])', { state: 'attached' });
  await page.evaluate(() => { location.hash = '#p/sql-d02-department-top-three-salaries'; });
  await page.waitForSelector('#ws[open]');
  assert.equal(await page.innerText('#wsTitle'), SQLQ.title);
  await page.keyboard.press('Escape');
  await page.evaluate(() => { location.hash = '#p/does-not-exist'; });
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#ws[open]').count(), 0);
  // Back/forward: going to an ordinary hash closes an open workspace
  await page.evaluate(() => { location.hash = '#p/' + 'py-d15-two-sum'; });
  await page.waitForSelector('#ws[open]');
  await page.evaluate(() => { location.hash = '#d3'; });
  await page.waitForSelector('#ws:not([open])', { state: 'attached' });
  assert.deepEqual(errors, []);
});

test('W1 hints, submissions and drafts survive a reload', { timeout: 120000 }, async (t) => {
  const env = await start();
  t.after(() => env.close());
  const { page } = await env.newPage();
  await page.goto(env.url);
  await page.waitForFunction(() => window.Workspace && window.DE);
  await page.evaluate((id) => {
    let ws = WorkspaceCore.emptyWs();
    ws = WorkspaceCore.revealHint(ws, id, 1);
    ws = WorkspaceCore.recordSubmission(ws, DE.problem(id) && { id, bounty: 10 }, { verdict: 'Wrong Answer', passed: 1, total: 4, ms: 5 }, 'x = 1', '2026-01-01T00:00:00.000Z').ws;
    ws = WorkspaceCore.setDraft(ws, id, 'draft text');
    DE.setWs(ws);
  }, PY_ID);
  await page.reload();
  await page.waitForFunction(() => window.Workspace && window.DE);
  assert.deepEqual(await page.evaluate((id) => [DE.ws().hints[id], DE.ws().subs[id].length, DE.ws().drafts[id]], PY_ID), [1, 1, 'draft text']);
});

test('works when the page is opened straight from disk (file://)', { timeout: 300000 }, async (t) => {
  const env = await start();
  t.after(() => env.close());
  const { page, errors } = await env.newPage();
  await page.goto(env.fileUrl);
  await page.waitForFunction(() => window.Workspace && window.DE);
  await page.evaluate((id) => Workspace.open(id), SQL_ID);
  await page.waitForSelector('#ws[open]');
  await page.fill('#wsEditor', SQLQ.solution);
  await page.click('#wsRun');
  await page.waitForSelector('#wsResult .ws-verdict', { timeout: 150000 });
  assert.equal(await page.getAttribute('#wsResult .ws-verdict', 'data-verdict'), 'Accepted');
  await page.keyboard.press('Escape');
  await page.evaluate((id) => Workspace.open(id), PY_ID);
  await page.waitForSelector('#ws[open]');
  await page.fill('#wsEditor', PYQ.solution);
  await page.click('#wsRun');
  await page.waitForFunction(() => { const v = document.querySelector('#wsResult .ws-verdict'); return v && v.dataset.verdict; }, null, { timeout: 150000 });
  assert.equal(await page.getAttribute('#wsResult .ws-verdict', 'data-verdict'), 'Accepted');
  assert.deepEqual(errors.filter((e) => !/Failed to load resource/.test(e)), []);
});

test('the playground and the workspace use separate engines, so the playground keeps its tables', { timeout: 300000 }, async (t) => {
  const env = await start();
  t.after(() => env.close());
  const { page } = await env.newPage();
  await page.goto(env.url);
  await page.waitForFunction(() => window.Workspace && window.__pg);
  await page.evaluate(() => window.__pg.setLang('sql'));
  await page.click('#pgSeed');
  await page.waitForFunction(() => /SAMPLE DATA LOADED/.test(document.getElementById('pgStatus').innerText), null, { timeout: 150000 });
  await page.evaluate(() => Workspace.open('sql-d01-delete-duplicate-emails'));
  await page.waitForSelector('#ws[open]');
  await page.fill('#wsEditor', 'DELETE FROM person');
  await page.click('#wsSubmit');
  await page.waitForSelector('#wsResult .ws-verdict', { timeout: 150000 });
  await page.keyboard.press('Escape');
  await page.fill('#pgEd', 'SELECT count(*) AS n FROM customers');
  await page.click('#pgRun');
  await page.waitForSelector('#pgOut table', { timeout: 150000 });
  assert.match(await page.innerText('#pgOut table'), /\d{4}/, 'the playground still has its seeded customers');
});
