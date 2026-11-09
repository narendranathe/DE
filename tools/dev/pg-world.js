'use strict';
// Runs the shipped Supabase adapter (tools/assets/community.js) against the real schema (supabase/schema.sql)
// in a real Postgres (PGlite). Postgres is real, including roles, row-level security and triggers.
// The only fake part is the client library: a small stand-in for supabase-js that turns the calls the adapter
// makes (from().select/insert/update/upsert/delete, eq, order, limit, single, embedded profiles) into SQL and
// runs each call in one transaction as the "authenticated" role with request.jwt.claim.sub set to the user.
//
// What this cannot prove: how the real PostgREST server and the real GitHub sign-in behave. See supabase/README.md.
const fs = require('node:fs');
const path = require('node:path');
const Community = require('../assets/community.js');

const SCHEMA = fs.readFileSync(path.join(__dirname, '../../supabase/schema.sql'), 'utf8');
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
const IDENT = /^[a-z_][a-z0-9_]*$/;
const ident = (s) => { if (!IDENT.test(s)) throw new Error('bad identifier: ' + s); return s; };

function splitTop(s) {
  const out = []; let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// "id, title, profiles(handle, avatar_url)" -> SQL select list
function columns(table, spec) {
  if (spec === '*') return '*';
  return splitTop(spec).map((part) => {
    const m = /^([a-z_]+)\((.*)\)$/.exec(part);
    if (!m) return ident(part);
    if (m[1] !== 'profiles') throw new Error('only profiles can be embedded');
    const fk = table === 'reports' ? 'reporter_id' : 'user_id';
    const pairs = splitTop(m[2]).map((c) => `'${ident(c)}', e.${ident(c)}`).join(', ');
    return `(select json_build_object(${pairs}) from de.profiles e where e.id = ${ident(table)}.${fk}) as profiles`;
  }).join(', ');
}

class Query {
  constructor(db, uid, table) {
    this.db = db; this.uid = uid; this.t = ident(table);
    this.op = 'select'; this.cols = '*'; this.row = null; this.conflict = null;
    this.where = []; this.orders = []; this.max = null; this.wantRows = true; this.one = false;
  }
  select(cols) { this.cols = cols || '*'; this.wantRows = true; return this; }
  insert(row) { this.op = 'insert'; this.row = row; this.wantRows = false; return this; }
  update(row) { this.op = 'update'; this.row = row; this.wantRows = false; return this; }
  upsert(row, o) { this.op = 'upsert'; this.row = row; this.conflict = o && o.onConflict; this.wantRows = false; return this; }
  delete() { this.op = 'delete'; this.wantRows = false; return this; }
  eq(c, v) { this.where.push([ident(c), v]); return this; }
  order(c, o) { this.orders.push(ident(c) + (o && o.ascending === false ? ' desc' : ' asc')); return this; }
  limit(n) { this.max = n; return this; }
  single() { this.one = true; return this; }
  then(res, rej) { return this.run().then(res, rej); }

  sql() {
    const params = [], p = (v) => { params.push(v); return '$' + params.length; };
    const where = this.where.length ? ' where ' + this.where.map(([c, v]) => `${c} = ${p(v)}`).join(' and ') : '';
    const returning = this.wantRows ? ' returning ' + columns(this.t, this.cols) : '';
    const keys = this.row ? Object.keys(this.row).map(ident) : [];
    let text;
    if (this.op === 'select') {
      text = `select ${columns(this.t, this.cols)} from de.${this.t}${where}` +
        (this.orders.length ? ' order by ' + this.orders.join(', ') : '') + (this.max ? ' limit ' + Number(this.max) : '');
    } else if (this.op === 'insert' || this.op === 'upsert') {
      text = `insert into de.${this.t} (${keys.join(', ')}) values (${keys.map((k) => p(this.row[k])).join(', ')})`;
      if (this.op === 'upsert') {
        const target = this.conflict.split(',').map((c) => ident(c.trim())).join(', ');
        text += ` on conflict (${target}) do update set ${keys.map((k) => `${k} = excluded.${k}`).join(', ')}`;
      }
      text += returning;
    } else if (this.op === 'update') {
      text = `update de.${this.t} set ${keys.map((k) => `${k} = ${p(this.row[k])}`).join(', ')}${where}${returning}`;
    } else {
      text = `delete from de.${this.t}${where}${returning}`;
    }
    return { text, params };
  }

  async run() {
    const uid = this.uid();
    let rows;
    try {
      const { text, params } = this.sql();
      await this.db.transaction(async (tx) => {
        await tx.exec('set local role ' + (uid ? 'authenticated' : 'anon'));
        await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [uid || '']);
        rows = (await tx.query(text, params)).rows;
      });
    } catch (e) {
      return { data: null, error: { code: e.code, message: e.message } };
    }
    if (!this.wantRows) return { data: null, error: null };
    if (this.one) {
      return rows.length === 1
        ? { data: rows[0], error: null }
        : { data: null, error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' } };
    }
    return { data: rows, error: null };
  }
}

function fakeClient(db, uid) {
  return {
    auth: {
      getSession: async () => ({ data: { session: uid() ? { user: { id: uid() } } : null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithOAuth: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: (table) => new Query(db, uid, table),
    // like PostgREST: a function that returns one row comes back as one object, run as the signed-in role
    rpc: async (name) => {
      const id = uid();
      try {
        let rows;
        await db.transaction(async (tx) => {
          await tx.exec('set local role ' + (id ? 'authenticated' : 'anon'));
          await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [id || '']);
          rows = (await tx.query(`select * from de.${ident(name)}()`)).rows;
        });
        return { data: rows.length === 1 ? rows[0] : rows, error: null };
      } catch (e) {
        return { data: null, error: { code: e.code, message: e.message } };
      }
    },
  };
}

const IDS = {
  alice: '00000000-0000-0000-0000-00000000000a',
  bob: '00000000-0000-0000-0000-00000000000b',
  cy: '00000000-0000-0000-0000-00000000000c',
  mod: '00000000-0000-0000-0000-0000000000f0',
};

async function makeWorld() {
  const { PGlite, types } = await import('@electric-sql/pglite');
  // timestamps come back as text with microseconds, like PostgREST sends them, so "newest first" has no ties
  const db = new PGlite({ parsers: { [types.TIMESTAMPTZ]: (v) => v } });
  await db.exec(STUB);
  await db.exec(SCHEMA);
  await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values
    ('${IDS.alice}', 'alice@example.com', '{"user_name":"alice","avatar_url":"https://avatars.example/alice.png"}'),
    ('${IDS.bob}', 'bob@example.com', '{"user_name":"bob","avatar_url":"https://avatars.example/bob.png"}'),
    ('${IDS.cy}', 'cy@example.com', '{"user_name":"cy"}'),
    ('${IDS.mod}', 'mod@example.com', '{"user_name":"mod"}')`);
  // the profile of each person is made the first time the adapter asks for the signed-in user, like on the real page
  await db.exec(`insert into de.profiles (id, handle, role) values ('${IDS.mod}', 'mod', 'moderator')`);

  const as = (name) => Community.create({ client: fakeClient(db, () => (name ? IDS[name] : null)) });
  return {
    alice: as('alice'), bob: as('bob'), cy: as('cy'), mod: as('mod'), anon: as(null),
    device: (name) => as(name),
    reset: async () => { await db.exec('truncate de.reports, de.votes, de.comments, de.shared_solutions, de.submissions, de.progress cascade'); },
    close: () => db.close(),
    db,
  };
}

module.exports = { makeWorld, fakeClient, IDS };
