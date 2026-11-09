'use strict';
// supabase/schema.sql, run in a real Postgres (PGlite) with the roles and auth stub that Supabase provides.
// Every test acts as a role: anon, a signed-in user (by id), or the admin (the SQL editor).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SCHEMA = fs.readFileSync(path.join(__dirname, '../supabase/schema.sql'), 'utf8');

const STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb not null default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public to anon, authenticated;
  grant usage on schema auth to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;
`;

const U = {
  alice: '00000000-0000-0000-0000-00000000000a',
  bob: '00000000-0000-0000-0000-00000000000b',
  mod: '00000000-0000-0000-0000-0000000000f0',
  cy: '00000000-0000-0000-0000-00000000000c',
};

async function setup() {
  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  await db.exec(STUB);
  await db.exec(SCHEMA);
  await db.exec(SCHEMA); // the file says it is safe to run twice
  const admin = async (sql, params) => { await db.exec('reset role; select set_config(\'request.jwt.claim.sub\', \'\', false)'); return db.query(sql, params); };
  const as = async (uid, sql, params) => {
    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false)`);
    return db.query(sql, params);
  };
  const anon = async (sql, params) => { await db.exec("reset role; set role anon; select set_config('request.jwt.claim.sub', '', false)"); return db.query(sql, params); };
  await admin(`insert into auth.users (id, email, raw_user_meta_data) values
    ('${U.alice}', 'alice@example.com', '{"user_name":"alice","avatar_url":"https://avatars.example/a.png"}'),
    ('${U.bob}', 'bob@example.com', '{"user_name":"bob","avatar_url":"http://insecure.example/b.png"}'),
    ('${U.mod}', 'mod@example.com', '{"user_name":"mod"}'),
    ('${U.cy}', 'cy@example.com', '{}')`);
  await admin(`update public.profiles set role = 'moderator' where id = '${U.mod}'`);
  return { db, admin, as, anon };
}

const SOLVED = (uid, pid) => `insert into public.progress (user_id, problem_id, solved_at) values ('${uid}', '${pid}', now())`;
const rejects = (p, re) => assert.rejects(p, (e) => re.test(String(e.message)));

test('schema', async (t) => {
  const { db, admin, as, anon } = await setup();
  t.after(() => db.close());
  const reset = async () => {
    await admin('truncate public.reports, public.votes, public.comments, public.shared_solutions, public.submissions, public.progress cascade');
  };

  /* ------------------------------------------------------------ P1 profiles and privacy */
  await t.test('P1 a profile is made at sign-up from the GitHub handle, with no email', async () => {
    const r = await admin('select id, handle, avatar_url, role from public.profiles order by handle');
    const byHandle = Object.fromEntries(r.rows.map((x) => [x.handle, x]));
    assert.equal(byHandle.alice.avatar_url, 'https://avatars.example/a.png');
    assert.equal(byHandle.bob.avatar_url, null, 'an avatar that is not https is dropped');
    assert.equal(byHandle.alice.role, 'member');
    assert.match(byHandle['user-' + U.cy.slice(0, 6)].handle, /^user-/, 'a fallback handle when GitHub gives none');
    assert.equal(byHandle.mod.role, 'moderator');
  });

  await t.test('P1 no table in the public schema has an email column', async () => {
    const r = await admin("select table_name, column_name from information_schema.columns where table_schema = 'public' and column_name ilike '%mail%'");
    assert.deepEqual(r.rows, []);
  });

  /* ------------------------------------------------------------ P3 anonymous visitors */
  await t.test('P3 the anonymous key can reach no table at all', async () => {
    const tables = (await admin("select tablename from pg_tables where schemaname = 'public'")).rows.map((x) => x.tablename);
    assert.ok(tables.length >= 7);
    for (const tb of tables) {
      await rejects(anon(`select * from public.${tb}`), /permission denied/i);
      await rejects(anon(`delete from public.${tb}`), /permission denied/i);
    }
  });

  await t.test('P3 every public table has row-level security on', async () => {
    const r = await admin("select tablename from pg_tables where schemaname = 'public' and not rowsecurity");
    assert.deepEqual(r.rows, []);
  });

  await t.test('profiles: signed-in people can read everyone, and cannot change a role', async () => {
    const r = await as(U.bob, 'select handle from public.profiles');
    assert.ok(r.rows.length >= 4);
    await rejects(as(U.bob, `update public.profiles set role = 'moderator' where id = '${U.bob}'`), /permission denied/i);
    await rejects(as(U.bob, `insert into public.profiles (id, handle) values (gen_random_uuid(), 'x')`), /permission denied/i);
  });

  /* ------------------------------------------------------------ progress (S3, H6) */
  await t.test('S3 progress is private, and can only move forward', async () => {
    await reset();
    await as(U.alice, `insert into public.progress (problem_id, hints_used) values ('p1', 2)`);
    assert.equal((await as(U.bob, 'select * from public.progress')).rows.length, 0, 'bob sees nothing of alice');
    await as(U.alice, `update public.progress set hints_used = 1 where problem_id = 'p1'`);
    assert.equal((await as(U.alice, 'select hints_used from public.progress')).rows[0].hints_used, 2, 'hints never go back down');
    await as(U.alice, `update public.progress set solved_at = now() where problem_id = 'p1'`);
    await as(U.alice, `update public.progress set solved_at = null where problem_id = 'p1'`);
    assert.ok((await as(U.alice, 'select solved_at from public.progress')).rows[0].solved_at, 'a solve is never undone');
  });

  await t.test('S3 progress: no more than 4 reveals, no writing for someone else, no delete', async () => {
    await reset();
    await rejects(as(U.alice, `insert into public.progress (problem_id, hints_used) values ('p1', 5)`), /check constraint|violates/i);
    await rejects(as(U.alice, `insert into public.progress (user_id, problem_id) values ('${U.bob}', 'p1')`), /row-level security/i);
    await as(U.alice, `insert into public.progress (problem_id) values ('p1')`);
    await rejects(as(U.alice, 'delete from public.progress'), /permission denied/i);
  });

  /* ------------------------------------------------------------ submissions (S1, S3, C6) */
  await t.test('S3 submissions are private, newest history is kept per person', async () => {
    await reset();
    await as(U.alice, `insert into public.submissions (problem_id, code, verdict, passed, total, hints_used) values ('p1', 'select 1', 'Accepted', 3, 3, 1)`);
    assert.equal((await as(U.alice, 'select * from public.submissions')).rows.length, 1);
    assert.equal((await as(U.bob, 'select * from public.submissions')).rows.length, 0);
    await rejects(as(U.alice, `insert into public.submissions (problem_id, code, verdict, passed, total) values ('p1', 'x', 'Great', 1, 1)`), /check constraint|violates/i);
    await rejects(as(U.alice, `insert into public.submissions (problem_id, code, verdict, passed, total) values ('p1', repeat('x', 20001), 'Accepted', 1, 1)`), /check constraint|violates/i);
    await as(U.alice, `insert into public.submissions (problem_id, code, verdict, passed, total) values ('p1', repeat('x', 20000), 'Wrong Answer', 0, 3)`);
  });

  /* ------------------------------------------------------------ shared solutions (C2, C4, C6, C7) */
  await t.test('C2 only someone who solved the question can share a solution', async () => {
    await reset();
    await rejects(as(U.alice, `insert into public.shared_solutions (problem_id, title, code) values ('p1', 'mine', 'select 1')`), /row-level security/i);
    await as(U.alice, `insert into public.progress (problem_id, hints_used) values ('p1', 4)`);
    await rejects(as(U.alice, `insert into public.shared_solutions (problem_id, title, code) values ('p1', 'mine', 'select 1')`), /row-level security/i);
    await as(U.alice, `update public.progress set solved_at = now() where problem_id = 'p1'`);
    await as(U.alice, `insert into public.shared_solutions (problem_id, title, explanation, code) values ('p1', 'mine', 'why', 'select 1')`);
  });

  await t.test('C4 other people’s solutions stay hidden until you solve it or open the full approach', async () => {
    await reset();
    await admin(SOLVED(U.alice, 'p1'));
    await as(U.alice, `insert into public.shared_solutions (problem_id, title, code) values ('p1', 'mine', 'select 1')`);
    assert.equal((await as(U.alice, 'select * from public.shared_solutions')).rows.length, 1, 'the author always sees their own');
    assert.equal((await as(U.bob, 'select * from public.shared_solutions')).rows.length, 0, 'bob has done nothing yet');
    await as(U.bob, `insert into public.progress (problem_id, hints_used) values ('p1', 3)`);
    assert.equal((await as(U.bob, 'select * from public.shared_solutions')).rows.length, 0, 'three hints is not enough');
    await as(U.bob, `update public.progress set hints_used = 4 where problem_id = 'p1'`);
    assert.equal((await as(U.bob, 'select * from public.shared_solutions')).rows.length, 1, 'the full approach unlocks it');
    await as(U.cy, `insert into public.progress (problem_id, hints_used) values ('p2', 4)`);
    assert.equal((await as(U.cy, 'select * from public.shared_solutions')).rows.length, 0, 'unlocking one question does not unlock another');
  });

  await t.test('C7 a moderator can hide a solution; others stop seeing it, the author and moderators still do', async () => {
    await reset();
    await admin(SOLVED(U.alice, 'p1'));
    await admin(SOLVED(U.bob, 'p1'));
    const id = (await as(U.alice, `insert into public.shared_solutions (problem_id, title, code) values ('p1', 'mine', 'select 1') returning id`)).rows[0].id;
    assert.equal((await as(U.bob, 'select * from public.shared_solutions')).rows.length, 1);
    await as(U.bob, `update public.shared_solutions set hidden = true where id = '${id}'`);
    assert.equal((await as(U.bob, 'select * from public.shared_solutions')).rows.length, 1, 'a member cannot hide other people’s work');
    await as(U.mod, `update public.shared_solutions set hidden = true where id = '${id}'`);
    assert.equal((await as(U.bob, 'select * from public.shared_solutions')).rows.length, 0);
    assert.equal((await as(U.alice, 'select * from public.shared_solutions')).rows.length, 1);
    assert.equal((await as(U.mod, 'select * from public.shared_solutions')).rows.length, 1);
    await as(U.alice, `update public.shared_solutions set hidden = false where id = '${id}'`);
    assert.equal((await as(U.bob, 'select * from public.shared_solutions')).rows.length, 0, 'the author cannot lift a moderator’s hide');
  });

  await t.test('C2 the author can edit the write-up and delete; nobody else can', async () => {
    await reset();
    await admin(SOLVED(U.alice, 'p1'));
    await admin(SOLVED(U.bob, 'p1'));
    const id = (await as(U.alice, `insert into public.shared_solutions (problem_id, title, code) values ('p1', 'mine', 'select 1') returning id`)).rows[0].id;
    await as(U.alice, `update public.shared_solutions set title = 'better', code = 'tampered' where id = '${id}'`);
    const row = (await as(U.alice, 'select title, code from public.shared_solutions')).rows[0];
    assert.equal(row.title, 'better');
    assert.equal(row.code, 'select 1', 'the code of a shared solution is fixed');
    await as(U.bob, `update public.shared_solutions set title = 'bobs' where id = '${id}'`);
    await as(U.bob, `delete from public.shared_solutions where id = '${id}'`);
    assert.equal((await as(U.alice, 'select title from public.shared_solutions')).rows[0].title, 'better');
    await as(U.alice, `delete from public.shared_solutions where id = '${id}'`);
    assert.equal((await admin('select count(*)::int as n from public.shared_solutions')).rows[0].n, 0);
  });

  await t.test('C6 solution length limits', async () => {
    await reset();
    await admin(SOLVED(U.alice, 'p1'));
    const ins = (title, expl, code) => as(U.alice, 'insert into public.shared_solutions (problem_id, title, explanation, code) values ($1, $2, $3, $4)', ['p1', title, expl, code]);
    await rejects(ins('x'.repeat(121), '', 'c'), /check constraint|violates/i);
    await rejects(ins('', '', 'c'), /check constraint|violates/i);
    await rejects(ins('t', 'x'.repeat(4001), 'c'), /check constraint|violates/i);
    await rejects(ins('t', '', 'x'.repeat(20001)), /check constraint|violates/i);
    await ins('x'.repeat(120), 'y'.repeat(4000), 'z'.repeat(20000));
  });

  /* ------------------------------------------------------------ comments (C3, C6, C7) */
  await t.test('C3 comments: everyone signed in can read, anyone can post, one level of replies', async () => {
    await reset();
    const top = (await as(U.alice, `insert into public.comments (problem_id, body, is_spoiler) values ('p1', 'start with a window', true) returning id`)).rows[0].id;
    assert.equal((await as(U.cy, 'select * from public.comments')).rows[0].is_spoiler, true, 'read without having solved it');
    const reply = (await as(U.bob, `insert into public.comments (problem_id, parent_id, body) values ('p1', '${top}', 'thanks') returning id`)).rows[0].id;
    await rejects(as(U.cy, `insert into public.comments (problem_id, parent_id, body) values ('p1', '${reply}', 'too deep')`), /invalid_parent/i);
    await rejects(as(U.cy, `insert into public.comments (problem_id, parent_id, body) values ('p2', '${top}', 'wrong question')`), /invalid_parent/i);
    await rejects(as(U.cy, `insert into public.comments (problem_id, parent_id, body) values ('p1', gen_random_uuid(), 'no such parent')`), /invalid_parent/i);
  });

  await t.test('C3 you can edit and delete your own comment only; an edit is marked', async () => {
    await reset();
    const id = (await as(U.alice, `insert into public.comments (problem_id, body) values ('p1', 'first') returning id`)).rows[0].id;
    await as(U.bob, `update public.comments set body = 'bob was here' where id = '${id}'`);
    await as(U.bob, `delete from public.comments where id = '${id}'`);
    let row = (await as(U.alice, 'select body, edited_at from public.comments')).rows[0];
    assert.equal(row.body, 'first');
    assert.equal(row.edited_at, null);
    await as(U.alice, `update public.comments set body = 'second' where id = '${id}'`);
    row = (await as(U.alice, 'select body, edited_at from public.comments')).rows[0];
    assert.equal(row.body, 'second');
    assert.ok(row.edited_at);
    await as(U.alice, `delete from public.comments where id = '${id}'`);
    assert.equal((await admin('select count(*)::int as n from public.comments')).rows[0].n, 0);
  });

  await t.test('C3 deleting a comment deletes its replies', async () => {
    await reset();
    const top = (await as(U.alice, `insert into public.comments (problem_id, body) values ('p1', 'a') returning id`)).rows[0].id;
    await as(U.bob, `insert into public.comments (problem_id, parent_id, body) values ('p1', '${top}', 'b')`);
    await as(U.alice, `delete from public.comments where id = '${top}'`);
    assert.equal((await admin('select count(*)::int as n from public.comments')).rows[0].n, 0);
  });

  await t.test('C6 comment length limits', async () => {
    await reset();
    await rejects(as(U.alice, `insert into public.comments (problem_id, body) values ('p1', '')`), /check constraint|violates/i);
    await rejects(as(U.alice, `insert into public.comments (problem_id, body) values ('p1', repeat('x', 4001))`), /check constraint|violates/i);
    await as(U.alice, `insert into public.comments (problem_id, body) values ('p1', repeat('x', 4000))`);
  });

  await t.test('C7 a hidden comment disappears for others; only a moderator can hide', async () => {
    await reset();
    const id = (await as(U.alice, `insert into public.comments (problem_id, body) values ('p1', 'rude') returning id`)).rows[0].id;
    await as(U.alice, `update public.comments set hidden = true where id = '${id}'`);
    assert.equal((await as(U.bob, 'select * from public.comments')).rows.length, 1, 'authors cannot hide their own either');
    await as(U.mod, `update public.comments set hidden = true where id = '${id}'`);
    assert.equal((await as(U.bob, 'select * from public.comments')).rows.length, 0);
    assert.equal((await as(U.alice, 'select * from public.comments')).rows.length, 1);
    assert.equal((await as(U.mod, 'select * from public.comments')).rows.length, 1);
    await as(U.mod, `update public.comments set body = 'edited by mod' where id = '${id}'`);
    assert.equal((await as(U.alice, 'select body from public.comments')).rows[0].body, 'rude', 'a moderator hides; they do not rewrite');
  });

  /* ------------------------------------------------------------ votes (C5) */
  await t.test('C5 one vote per person per item, no self-votes, and the score follows', async () => {
    await reset();
    const id = (await as(U.alice, `insert into public.comments (problem_id, body) values ('p1', 'a') returning id`)).rows[0].id;
    await rejects(as(U.alice, `insert into public.votes (kind, target_id) values ('comment', '${id}')`), /row-level security/i);
    await as(U.bob, `insert into public.votes (kind, target_id) values ('comment', '${id}')`);
    await rejects(as(U.bob, `insert into public.votes (kind, target_id) values ('comment', '${id}')`), /duplicate key|unique/i);
    await as(U.cy, `insert into public.votes (kind, target_id) values ('comment', '${id}')`);
    assert.equal((await as(U.cy, 'select score from public.comments')).rows[0].score, 2);
    await as(U.bob, `delete from public.votes where kind = 'comment' and target_id = '${id}'`);
    assert.equal((await as(U.cy, 'select score from public.comments')).rows[0].score, 1);
    assert.equal((await as(U.bob, 'select * from public.votes')).rows.length, 0, 'you only see your own votes');
    assert.equal((await as(U.cy, 'select * from public.votes')).rows.length, 1);
  });

  await t.test('C5 a score cannot be set by hand, and you cannot vote on what you cannot see', async () => {
    await reset();
    await admin(SOLVED(U.alice, 'p1'));
    const sol = (await as(U.alice, `insert into public.shared_solutions (problem_id, title, code) values ('p1', 'mine', 'select 1') returning id`)).rows[0].id;
    await rejects(as(U.bob, `insert into public.votes (kind, target_id) values ('solution', '${sol}')`), /row-level security/i);
    await admin(SOLVED(U.bob, 'p1'));
    await as(U.bob, `insert into public.votes (kind, target_id) values ('solution', '${sol}')`);
    await as(U.alice, `update public.shared_solutions set score = 99 where id = '${sol}'`);
    assert.equal((await as(U.alice, 'select score from public.shared_solutions')).rows[0].score, 1);
    await rejects(as(U.bob, `insert into public.votes (kind, target_id) values ('comment', gen_random_uuid())`), /row-level security/i);
    await rejects(as(U.bob, `insert into public.votes (kind, target_id) values ('banana', '${sol}')`), /check constraint|violates/i);
  });

  /* ------------------------------------------------------------ reports (C7) */
  await t.test('C7 reports: anyone signed in can file one, only moderators can read them', async () => {
    await reset();
    const id = (await as(U.alice, `insert into public.comments (problem_id, body) values ('p1', 'x') returning id`)).rows[0].id;
    await as(U.bob, `insert into public.reports (kind, target_id, reason) values ('comment', '${id}', 'spam')`);
    await rejects(as(U.bob, `insert into public.reports (kind, target_id, reason) values ('comment', '${id}', 'again')`), /duplicate key|unique/i);
    await rejects(as(U.bob, `insert into public.reports (kind, target_id, reason) values ('comment', '${id}', '')`), /check constraint|violates/i);
    assert.equal((await as(U.bob, 'select * from public.reports')).rows.length, 0, 'the reporter cannot read it back');
    assert.equal((await as(U.alice, 'select * from public.reports')).rows.length, 0);
    assert.equal((await as(U.mod, 'select * from public.reports')).rows.length, 1);
  });

  /* ------------------------------------------------------------ rate limits (C6) */
  await t.test('C6 at most 30 comments, 20 solutions and 200 submissions per person per hour', async () => {
    await reset();
    await admin(`insert into public.comments (user_id, problem_id, body) select '${U.bob}', 'p1', 'c' || g from generate_series(1, 30) g`);
    await rejects(as(U.bob, `insert into public.comments (problem_id, body) values ('p1', 'one too many')`), /rate_limit/);
    await as(U.alice, `insert into public.comments (problem_id, body) values ('p1', 'someone else is fine')`);
    // created_at is fixed for everyone, so age the rows with the guard switched off, as an admin could
    await admin('alter table public.comments disable trigger comments_guard');
    await admin(`update public.comments set created_at = now() - interval '2 hours' where user_id = '${U.bob}'`);
    await admin('alter table public.comments enable trigger comments_guard');
    await as(U.bob, `insert into public.comments (problem_id, body) values ('p1', 'an hour later is fine')`);

    await admin(SOLVED(U.bob, 'p1'));
    await admin(`insert into public.shared_solutions (user_id, problem_id, title, code) select '${U.bob}', 'p1', 't' || g, 'c' from generate_series(1, 20) g`);
    await rejects(as(U.bob, `insert into public.shared_solutions (problem_id, title, code) values ('p1', 'x', 'c')`), /rate_limit/);

    await admin(`insert into public.submissions (user_id, problem_id, code, verdict, passed, total) select '${U.bob}', 'p1', 'c', 'Accepted', 1, 1 from generate_series(1, 200)`);
    await rejects(as(U.bob, `insert into public.submissions (problem_id, code, verdict, passed, total) values ('p1', 'c', 'Accepted', 1, 1)`), /rate_limit/);
  });

  /* ------------------------------------------------------------ P2 delete my data */
  await t.test('P2 deleting a person deletes everything they made, and their votes come off the scores', async () => {
    await reset();
    await admin(SOLVED(U.alice, 'p1'));
    await admin(SOLVED(U.bob, 'p1'));
    const sol = (await as(U.alice, `insert into public.shared_solutions (problem_id, title, code) values ('p1', 's', 'c') returning id`)).rows[0].id;
    const com = (await as(U.alice, `insert into public.comments (problem_id, body) values ('p1', 'c') returning id`)).rows[0].id;
    await as(U.alice, `insert into public.submissions (problem_id, code, verdict, passed, total) values ('p1', 'c', 'Accepted', 1, 1)`);
    await as(U.bob, `insert into public.votes (kind, target_id) values ('solution', '${sol}')`);
    await as(U.bob, `insert into public.votes (kind, target_id) values ('comment', '${com}')`);
    await as(U.bob, `insert into public.reports (kind, target_id, reason) values ('comment', '${com}', 'r')`);

    await admin(`delete from auth.users where id = '${U.bob}'`);
    assert.equal((await admin(`select count(*)::int as n from public.profiles where id = '${U.bob}'`)).rows[0].n, 0);
    for (const tb of ['progress', 'votes']) {
      assert.equal((await admin(`select count(*)::int as n from public.${tb} where user_id = '${U.bob}'`)).rows[0].n, 0, tb);
    }
    assert.equal((await admin('select count(*)::int as n from public.reports')).rows[0].n, 0);
    assert.equal((await admin(`select score from public.shared_solutions where id = '${sol}'`)).rows[0].score, 0);
    assert.equal((await admin(`select score from public.comments where id = '${com}'`)).rows[0].score, 0);

    await admin(`delete from auth.users where id = '${U.alice}'`);
    for (const tb of ['progress', 'submissions', 'shared_solutions', 'comments']) {
      assert.equal((await admin(`select count(*)::int as n from public.${tb}`)).rows[0].n, 0, tb);
    }
  });
});
