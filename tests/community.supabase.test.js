'use strict';
// The Supabase adapter against the real schema in Postgres (PGlite), through a fake client.
const test = require('node:test');
const assert = require('node:assert/strict');
const contract = require('./community.contract.js');
const Community = require('../tools/assets/community.js');
const { makeWorld, fakeClient } = require('../tools/dev/pg-world.js');

contract('supabase adapter meets the community contract (real schema, real row-level security)', async () => makeWorld());

test('S1 the page talks to the "de" schema, so it can share a Supabase project with another app', async () => {
  const seen = [];
  global.window = { supabase: { createClient: (url, key, opts) => { seen.push({ url, key, opts }); return { auth: { getSession: async () => ({ data: { session: null } }) } }; } } };
  try {
    const api = Community.create({ url: 'https://abc.supabase.co', key: 'anon-key' });
    assert.equal(await api.user(), null);
    assert.equal(seen.length, 1);
    assert.equal(seen[0].opts.db.schema, 'de');
    assert.equal(seen[0].opts.auth.flowType, 'pkce');
  } finally { delete global.window; }
});

test('S2 someone who writes before the page ever asked who they are still gets a profile, once', async (t) => {
  const w = await makeWorld();
  t.after(() => w.close());
  const id = '00000000-0000-0000-0000-0000000000d4';
  await w.db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${id}', 'd4@example.com', '{"user_name":"dee"}')`);
  assert.equal((await w.db.query(`select count(*)::int as n from de.profiles where id = '${id}'`)).rows[0].n, 0);
  const dee = Community.create({ client: fakeClient(w.db, () => id) });
  await dee.saveProgress('p1', { hints: 1 });                       // no user() call first
  await dee.addComment('p1', { body: 'first words' });
  assert.deepEqual((await w.db.query(`select handle from de.profiles where id = '${id}'`)).rows, [{ handle: 'dee' }]);
  assert.equal((await dee.user()).handle, 'dee');
  const mine = await dee.listComments('p1');
  assert.equal(mine[0].author.handle, 'dee');
});
