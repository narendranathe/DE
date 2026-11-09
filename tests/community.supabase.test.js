'use strict';
// The Supabase adapter against the real schema in Postgres (PGlite), through a fake client.
const contract = require('./community.contract.js');
const { makeWorld } = require('../tools/dev/pg-world.js');
contract('supabase adapter meets the community contract (real schema, real row-level security)', async () => makeWorld());
