'use strict';
// One behaviour contract for the community API. Every adapter must pass it:
//   - the in-memory adapter (tools/dev/memory-community.js), and
//   - the Supabase adapter, talking to the real schema in Postgres through a fake client.
// makeWorld() -> { alice, bob, cy, mod, anon, device(name), reset(), close() }
//   alice/bob/cy/mod/anon are Community API objects acting as that person (anon is signed out).
const test = require('node:test');
const assert = require('node:assert/strict');

const code = (p) => p.then(() => { throw new Error('expected a refusal'); }, (e) => e.code);

module.exports = function contract(label, makeWorld) {
  test(label, async (t) => {
    const w = await makeWorld();
    t.after(() => w.close());
    const fresh = async () => { await w.reset(); };
    const solve = (who, pid) => who.saveProgress(pid, { hints: 0, solved: true });
    const open = (who, pid) => who.saveProgress(pid, { hints: 4 });

    await t.test('C1 signed out: no user, and every write is refused with code "auth"', async () => {
      await fresh();
      assert.equal(await w.anon.user(), null);
      assert.equal(await code(w.anon.addComment('p1', { body: 'hi' })), 'auth');
      assert.equal(await code(w.anon.saveProgress('p1', { hints: 1 })), 'auth');
      assert.equal(await code(w.anon.addSubmission('p1', { code: 'x', verdict: 'Accepted', passed: 1, total: 1 })), 'auth');
      assert.deepEqual(await w.anon.listComments('p1'), []);
    });

    await t.test('C1 signed in: the user is the GitHub handle and avatar', async () => {
      await fresh();
      const me = await w.alice.user();
      assert.equal(me.handle, 'alice');
      assert.ok(me.id);
      assert.equal((await w.mod.user()).role, 'moderator');
      assert.equal(me.role, 'member');
    });

    await t.test('S3 progress follows the person to another device, only moves forward, and is private', async () => {
      await fresh();
      await w.alice.saveProgress('p1', { hints: 2 });
      assert.deepEqual(await w.device('alice').loadProgress(), { p1: { hints: 2, solved: null } });
      await w.alice.saveProgress('p1', { hints: 1 });
      assert.equal((await w.alice.loadProgress()).p1.hints, 2);
      await w.alice.saveProgress('p1', { hints: 2, solved: true });
      const solved = (await w.alice.loadProgress()).p1.solved;
      assert.ok(solved, 'a solve time is set');
      await w.alice.saveProgress('p1', { hints: 2, solved: false });
      assert.equal((await w.alice.loadProgress()).p1.solved, solved, 'a solve is never undone');
      assert.deepEqual(await w.bob.loadProgress(), {});
      assert.equal(await code(w.alice.saveProgress('p1', { hints: 9 })), 'limit');
    });

    await t.test('S3 submissions are saved newest first, are private, and code is limited to 20000 characters', async () => {
      await fresh();
      await w.alice.addSubmission('p1', { code: 'first', verdict: 'Wrong Answer', passed: 1, total: 4, ms: 12, hints: 0 });
      await w.alice.addSubmission('p1', { code: 'second', verdict: 'Accepted', passed: 4, total: 4, ms: 9, hints: 1 });
      const list = await w.device('alice').listSubmissions('p1');
      assert.deepEqual(list.map((s) => s.code), ['second', 'first']);
      assert.equal(list[0].verdict, 'Accepted');
      assert.equal(list[0].passed, 4);
      assert.equal(list[0].hints, 1);
      assert.deepEqual(await w.bob.listSubmissions('p1'), []);
      assert.deepEqual(await w.alice.listSubmissions('p2'), []);
      assert.equal(await code(w.alice.addSubmission('p1', { code: 'x'.repeat(20001), verdict: 'Accepted', passed: 1, total: 1 })), 'limit');
    });

    await t.test('C2 and C4 shared solutions: share after a solve, locked until you solve or open the approach', async () => {
      await fresh();
      assert.equal(await code(w.alice.shareSolution('p1', { title: 'mine', explanation: '', code: 'select 1' })), 'forbidden', 'not solved yet');
      await solve(w.alice, 'p1');
      const { id } = await w.alice.shareSolution('p1', { title: 'window first', explanation: 'rank, then filter', code: 'select 1' });
      assert.ok(id);

      const mine = await w.alice.listSolutions('p1');
      assert.equal(mine.length, 1);
      assert.equal(mine[0].title, 'window first');
      assert.equal(mine[0].author.handle, 'alice');
      assert.equal(mine[0].mine, true);
      assert.equal(mine[0].score, 0);

      assert.deepEqual(await w.bob.listSolutions('p1'), [], 'locked for bob');
      await w.bob.saveProgress('p1', { hints: 3 });
      assert.deepEqual(await w.bob.listSolutions('p1'), [], 'three hints is not enough');
      await open(w.bob, 'p1');
      const seen = await w.bob.listSolutions('p1');
      assert.equal(seen.length, 1);
      assert.equal(seen[0].mine, false);
      assert.equal(seen[0].code, 'select 1');

      await solve(w.cy, 'p2');
      assert.deepEqual(await w.cy.listSolutions('p1'), [], 'solving a different question unlocks nothing here');
    });

    await t.test('C2 only the author deletes a solution', async () => {
      await fresh();
      await solve(w.alice, 'p1'); await solve(w.bob, 'p1');
      const { id } = await w.alice.shareSolution('p1', { title: 't', explanation: '', code: 'c' });
      assert.equal(await code(w.bob.deleteSolution(id)), 'forbidden');
      await w.alice.deleteSolution(id);
      assert.deepEqual(await w.bob.listSolutions('p1'), []);
    });

    await t.test('C7 a moderator hides a solution: others stop seeing it, the author still does', async () => {
      await fresh();
      await solve(w.alice, 'p1'); await solve(w.bob, 'p1');
      const { id } = await w.alice.shareSolution('p1', { title: 't', explanation: '', code: 'c' });
      assert.equal(await code(w.bob.hide('solution', id)), 'forbidden');
      assert.equal(await code(w.alice.hide('solution', id)), 'forbidden', 'the author cannot hide their own either');
      await w.mod.hide('solution', id);
      assert.deepEqual(await w.bob.listSolutions('p1'), []);
      const own = await w.alice.listSolutions('p1');
      assert.equal(own.length, 1);
      assert.equal(own[0].hidden, true);
    });

    await t.test('C3 comments: threads of one level, edit and delete your own, a spoiler flag, an edited mark', async () => {
      await fresh();
      const a = await w.alice.addComment('p1', { body: 'try a window', spoiler: true });
      const b = await w.bob.addComment('p1', { body: 'thanks', parentId: a.id });
      assert.equal(await code(w.cy.addComment('p1', { body: 'too deep', parentId: b.id })), 'invalid');
      assert.equal(await code(w.cy.addComment('p2', { body: 'wrong question', parentId: a.id })), 'invalid');

      const list = await w.cy.listComments('p1');
      assert.deepEqual(list.map((c) => c.id), [a.id, b.id], 'a reply comes right after its parent');
      assert.equal(list[0].spoiler, true);
      assert.equal(list[0].parentId, null);
      assert.equal(list[1].parentId, a.id);
      assert.equal(list[0].author.handle, 'alice');
      assert.equal(list[0].mine, false);
      assert.equal(list[0].edited, false);

      assert.equal(await code(w.bob.editComment(a.id, { body: 'hijack' })), 'forbidden');
      await w.alice.editComment(a.id, { body: 'try a window and a heap', spoiler: false });
      const after = (await w.alice.listComments('p1'))[0];
      assert.equal(after.body, 'try a window and a heap');
      assert.equal(after.spoiler, false);
      assert.equal(after.edited, true);
      assert.equal(after.mine, true);

      assert.equal(await code(w.bob.deleteComment(a.id)), 'forbidden');
      await w.alice.deleteComment(a.id);
      assert.deepEqual(await w.cy.listComments('p1'), [], 'the reply went with its parent');
    });

    await t.test('C5 votes: one per person, toggle off, score is shared, no self-vote, no vote on a locked solution', async () => {
      await fresh();
      const c = await w.alice.addComment('p1', { body: 'good idea' });
      assert.equal(await code(w.alice.toggleVote('comment', c.id)), 'forbidden');
      assert.deepEqual(await w.bob.toggleVote('comment', c.id), { voted: true, score: 1 });
      assert.deepEqual(await w.cy.toggleVote('comment', c.id), { voted: true, score: 2 });
      const seen = (await w.bob.listComments('p1'))[0];
      assert.equal(seen.score, 2);
      assert.equal(seen.voted, true);
      assert.equal((await w.alice.listComments('p1'))[0].voted, false);
      assert.deepEqual(await w.bob.toggleVote('comment', c.id), { voted: false, score: 1 });

      await solve(w.alice, 'p1');
      const s = await w.alice.shareSolution('p1', { title: 't', explanation: '', code: 'c' });
      assert.equal(await code(w.bob.toggleVote('solution', s.id)), 'forbidden', 'bob cannot see it yet');
      await solve(w.bob, 'p1');
      assert.equal(await code(w.alice.toggleVote('solution', s.id)), 'forbidden', 'no vote on your own solution');
      assert.deepEqual(await w.bob.toggleVote('solution', s.id), { voted: true, score: 1 });
      assert.equal((await w.bob.listSolutions('p1'))[0].voted, true);
    });

    await t.test('C5 lists sort by votes or by newest', async () => {
      await fresh();
      const one = await w.alice.addComment('p1', { body: 'one' });
      const two = await w.alice.addComment('p1', { body: 'two' });
      const three = await w.alice.addComment('p1', { body: 'three' });
      await w.bob.toggleVote('comment', one.id);
      await w.cy.toggleVote('comment', one.id);
      await w.bob.toggleVote('comment', two.id);
      assert.deepEqual((await w.cy.listComments('p1', { sort: 'votes' })).map((c) => c.id), [one.id, two.id, three.id]);
      assert.deepEqual((await w.cy.listComments('p1', { sort: 'new' })).map((c) => c.id), [three.id, two.id, one.id]);

      await solve(w.alice, 'p1'); await solve(w.bob, 'p1');
      const s1 = await w.alice.shareSolution('p1', { title: 'older', explanation: '', code: 'c' });
      const s2 = await w.alice.shareSolution('p1', { title: 'newer', explanation: '', code: 'c' });
      await w.bob.toggleVote('solution', s1.id);
      assert.deepEqual((await w.bob.listSolutions('p1', { sort: 'votes' })).map((s) => s.id), [s1.id, s2.id]);
      assert.deepEqual((await w.bob.listSolutions('p1', { sort: 'new' })).map((s) => s.id), [s2.id, s1.id]);
    });

    await t.test('C7 reports: filed by anyone, read only by a moderator, a repeat is quietly ignored; hiding a comment', async () => {
      await fresh();
      const c = await w.alice.addComment('p1', { body: 'rude' });
      await w.bob.report('comment', c.id, 'spam');
      await w.bob.report('comment', c.id, 'spam again');
      assert.deepEqual(await w.alice.listReports(), []);
      assert.deepEqual(await w.bob.listReports(), []);
      const reports = await w.mod.listReports();
      assert.equal(reports.length, 1);
      assert.equal(reports[0].kind, 'comment');
      assert.equal(reports[0].targetId, c.id);
      assert.equal(reports[0].reason, 'spam');
      assert.equal(reports[0].reporter.handle, 'bob');

      assert.equal(await code(w.bob.hide('comment', c.id)), 'forbidden');
      await w.mod.hide('comment', c.id);
      assert.deepEqual(await w.bob.listComments('p1'), []);
      assert.equal((await w.alice.listComments('p1'))[0].hidden, true);
      assert.equal((await w.mod.listComments('p1')).length, 1);
    });

    await t.test('C6 length limits and empty text', async () => {
      await fresh();
      assert.equal(await code(w.alice.addComment('p1', { body: '' })), 'invalid');
      assert.equal(await code(w.alice.addComment('p1', { body: '   ' })), 'invalid');
      assert.equal(await code(w.alice.addComment('p1', { body: 'x'.repeat(4001) })), 'limit');
      await w.alice.addComment('p1', { body: 'x'.repeat(4000) });
      await solve(w.alice, 'p1');
      assert.equal(await code(w.alice.shareSolution('p1', { title: 'x'.repeat(121), explanation: '', code: 'c' })), 'limit');
      assert.equal(await code(w.alice.shareSolution('p1', { title: '', explanation: '', code: 'c' })), 'invalid');
      assert.equal(await code(w.alice.shareSolution('p1', { title: 't', explanation: 'x'.repeat(4001), code: 'c' })), 'limit');
      assert.equal(await code(w.alice.shareSolution('p1', { title: 't', explanation: '', code: 'x'.repeat(20001) })), 'limit');
    });

    await t.test('C6 the 31st comment in an hour is refused with rate_limit', async () => {
      await fresh();
      for (let i = 1; i <= 30; i++) await w.bob.addComment('p1', { body: 'c' + i });
      assert.equal(await code(w.bob.addComment('p1', { body: 'one too many' })), 'rate_limit');
      await w.cy.addComment('p1', { body: 'someone else is fine' });
    });

    await t.test('C3 the text is returned exactly as typed, so the page can render it as text (P4)', async () => {
      await fresh();
      const nasty = '<img src=x onerror=alert(1)> & "quotes" \'single\' `ticks`   ünï';
      await w.alice.addComment('p1', { body: nasty });
      assert.equal((await w.bob.listComments('p1'))[0].body, nasty);
    });
  });
};
