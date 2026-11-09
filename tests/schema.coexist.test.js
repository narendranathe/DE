'use strict';
// supabase/schema.sql installed into a project that already runs another app (Postgres in PGlite, Supabase roles and
// auth stub). The other app is made to look like the usual Supabase starter: its own public.profiles table, its own
// on_auth_user_created trigger and handle_new_user() function, tables with row-level security, and grants to the
// API roles. Installing the community schema must leave every bit of it exactly as it was.
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

// the other app: names chosen to collide with what a community schema would be tempted to use
const OTHER_APP = `
  create table public.profiles (id uuid primary key references auth.users (id) on delete cascade, full_name text, plan text default 'free');
  create table public.comments (id serial primary key, owner uuid, body text);
  create table public.todos (id serial primary key, owner uuid default auth.uid(), title text not null);
  alter table public.todos enable row level security;
  create policy todos_own on public.todos for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
  create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
  begin
    insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name');
    return new;
  end $$;
  create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
`;

// everything a careless install could change in the other app, as plain data
async function snapshot(db) {
  const q = async (sql) => (await db.query(sql)).rows;
  return {
    tables: await q(`select c.relname, c.relrowsecurity, c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' order by 1`),
    columns: await q(`select table_name, column_name, data_type, column_default, is_nullable from information_schema.columns where table_schema = 'public' order by 1, ordinal_position`),
    grants: await q(`select table_name, grantee, privilege_type from information_schema.role_table_grants where table_schema = 'public' order by 1, 2, 3`),
    policies: await q(`select tablename, policyname, cmd, roles::text, qual, with_check from pg_policies where schemaname = 'public' order by 1, 2`),
    functions: await q(`select p.proname, pg_get_functiondef(p.oid) as def, has_function_privilege('anon', p.oid, 'execute') as anon_exec from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' order by 1`),
    triggers: await q(`select tgname, tgrelid::regclass::text as on_table, pg_get_triggerdef(oid) as def from pg_trigger where not tgisinternal and tgrelid::regclass::text not like 'de.%' order by 1, 2`),
    constraints: await q(`select conrelid::regclass::text as t, conname, pg_get_constraintdef(oid) as def from pg_constraint where connamespace = 'public'::regnamespace order by 1, 2`),
    rows: {
      profiles: await q('select * from public.profiles order by id'),
      comments: await q('select * from public.comments order by id'),
      todos: await q('select * from public.todos order by id'),
    },
  };
}

async function world() {
  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  await db.exec(STUB);
  await db.exec(OTHER_APP);
  await db.exec(`
    insert into auth.users (id, raw_user_meta_data) values
      ('00000000-0000-0000-0000-0000000000a1', '{"full_name":"Pat Other"}');
    insert into public.comments (owner, body) values ('00000000-0000-0000-0000-0000000000a1', 'their own comment');
    insert into public.todos (owner, title) values ('00000000-0000-0000-0000-0000000000a1', 'ship it');
  `);
  return db;
}

test('the file has no reference to the public schema and no trigger on auth.users', () => {
  const code = SCHEMA.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');
  assert.doesNotMatch(code, /\bpublic\./, 'every object is named in its own schema');
  assert.doesNotMatch(code, /schema public\b/i, 'no statement is aimed at the whole public schema');
  assert.doesNotMatch(code, /(create|drop)\s+trigger[^;]*\bon\s+auth\./i, 'a trigger on auth.users would run for the other app too');
  assert.doesNotMatch(code, /\b(service_role|drop\s+(table|schema)|truncate)\b/i);
});

test('X1 installing, twice, changes nothing in the other app', async (t) => {
  const db = await world();
  t.after(() => db.close());
  const before = await snapshot(db);
  assert.ok(before.tables.length === 3 && before.triggers.some((x) => x.tgname === 'on_auth_user_created'), 'the stand-in app is what the test says it is');
  await db.exec(SCHEMA);
  await db.exec(SCHEMA);
  const after = await snapshot(db);
  for (const k of Object.keys(before)) assert.deepEqual(after[k], before[k], `the other app's ${k}`);
});

test('X2 a sign-up in the other app still runs its own trigger, and nothing of ours', async (t) => {
  const db = await world();
  t.after(() => db.close());
  await db.exec(SCHEMA);
  await db.exec(`insert into auth.users (id, raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000b2', '{"full_name":"New Person","user_name":"newperson"}')`);
  const theirs = await db.query(`select full_name from public.profiles where id = '00000000-0000-0000-0000-0000000000b2'`);
  assert.deepEqual(theirs.rows, [{ full_name: 'New Person' }], 'the other app still gets its profile');
  const ours = await db.query('select count(*)::int as n from de.profiles');
  assert.equal(ours.rows[0].n, 0, 'nobody is added to the community until they use the community');
  const hooks = await db.query(`select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal`);
  assert.deepEqual(hooks.rows.map((r) => r.tgname), ['on_auth_user_created'], 'the only trigger on auth.users is still theirs');
});

test('X3 everything the file creates is in the de schema, and the API roles get only what they need there', async (t) => {
  const db = await world();
  t.after(() => db.close());
  const names = async (sql) => (await db.query(sql)).rows.map((r) => r.n).sort();
  const publicBefore = await names(`select c.relname as n from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind in ('r','v','m','S','i')`);
  await db.exec(SCHEMA);
  assert.deepEqual(await names(`select c.relname as n from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind in ('r','v','m','S','i')`), publicBefore, 'no new relation in public');
  assert.deepEqual(await names(`select p.proname as n from pg_proc p where p.pronamespace = 'public'::regnamespace`), ['handle_new_user'], 'no new function in public');
  assert.deepEqual(await names(`select t.typname as n from pg_type t where t.typnamespace = 'public'::regnamespace and t.typtype = 'e'`), [], 'no new enum in public');
  const tables = await names(`select tablename as n from pg_tables where schemaname = 'de'`);
  assert.deepEqual(tables, ['comments', 'profiles', 'progress', 'reports', 'shared_solutions', 'submissions', 'votes']);
  // anon gets nothing in de; authenticated gets usage on the schema and the table rights the schema file lists
  const anon = await db.query(`select has_schema_privilege('anon', 'de', 'usage') as u`);
  assert.equal(anon.rows[0].u, false);
  const authed = await db.query(`select has_schema_privilege('authenticated', 'de', 'usage') as u`);
  assert.equal(authed.rows[0].u, true);
});

test('X4 the page makes its own profile on first use, once, from the sign-in data, with no email', async (t) => {
  const db = await world();
  t.after(() => db.close());
  await db.exec(SCHEMA);
  const id = '00000000-0000-0000-0000-0000000000c3';
  await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${id}', 'c3@example.com', '{"user_name":"octo","avatar_url":"https://avatars.example/o.png"}')`);
  const as = async (uid, sql) => {
    await db.exec(`reset role; set role ${uid ? 'authenticated' : 'anon'}; select set_config('request.jwt.claim.sub', '${uid || ''}', false)`);
    return db.query(sql);
  };
  const first = await as(id, 'select * from de.ensure_profile()');
  assert.equal(first.rows[0].handle, 'octo');
  assert.equal(first.rows[0].avatar_url, 'https://avatars.example/o.png');
  assert.equal(first.rows[0].role, 'member');
  assert.ok(!('email' in first.rows[0]));
  const again = await as(id, 'select * from de.ensure_profile()');
  assert.deepEqual(again.rows[0], first.rows[0], 'a second call returns the same profile');
  assert.equal((await as(id, 'select count(*)::int as n from de.profiles')).rows[0].n, 1);
  await assert.rejects(as(null, 'select * from de.ensure_profile()'), /permission denied|not signed in/i, 'a signed-out visitor cannot call it');
  await db.exec('reset role');
  const meta = await db.query(`select raw_user_meta_data from auth.users where id = '${id}'`);
  assert.equal(meta.rows[0].raw_user_meta_data.user_name, 'octo', 'auth.users is read, never written');
});
