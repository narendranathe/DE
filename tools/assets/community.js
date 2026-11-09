/* community.js — shared solutions, discussion, votes and cloud progress for the problem workspace.
 *
 * One API, two homes: the page uses it with Supabase (window.Community.create({url, key})), and the tests
 * run the same contract against an in-memory copy and against the real schema in Postgres.
 *
 * Every method rejects with a CommunityError whose .code is one of:
 *   off          no Supabase project is configured
 *   auth         sign in first
 *   forbidden    the rules do not allow it (not yours, not unlocked, not a moderator)
 *   limit        too long, or too many reveals
 *   invalid      empty text, or a reply to something that cannot be replied to
 *   rate_limit   too many posts in the last hour
 *   network      the project could not be reached
 *   error        anything else
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Community = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LIMITS = { comment: 4000, title: 120, explanation: 4000, code: 20000, reason: 500 };
  var SUPABASE_SRC = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';

  function CommunityError(code, message) {
    var e = new Error(message || code);
    e.name = 'CommunityError';
    e.code = code;
    return e;
  }

  function mapError(err) {
    if (err && err.name === 'CommunityError') return err;
    var msg = String(err && err.message ? err.message : err), c = err && err.code;
    if (/rate_limit/.test(msg)) return CommunityError('rate_limit', 'Too many posts in the last hour. Try again later.');
    if (/invalid_parent/.test(msg)) return CommunityError('invalid', 'You can only reply to a top-level comment on the same question.');
    if (c === '42501' || /row-level security|permission denied/i.test(msg)) return CommunityError('forbidden', 'The rules do not allow that.');
    if (c === '23514') return CommunityError('limit', 'That is too long, or out of range.');
    if (c === '23502' || c === '22P02') return CommunityError('invalid', 'Something required is missing.');
    if (c === '23505') return CommunityError('duplicate', 'Already done.');
    if (c === 'PGRST301' || /JWT|not authenticated/i.test(msg)) return CommunityError('auth', 'Sign in with GitHub first.');
    if (/fetch|network|load failed|timeout/i.test(msg)) return CommunityError('network', 'Could not reach the community service.');
    return CommunityError('error', msg);
  }

  // Top-level items in the chosen order, each followed by its replies (oldest first).
  // items: [{id, parentId, score, at}]
  function threadOrder(items, sort) {
    var tops = [], replies = {};
    items.forEach(function (it) {
      if (it.parentId) (replies[it.parentId] = replies[it.parentId] || []).push(it);
      else tops.push(it);
    });
    var newest = function (a, b) { return a.at < b.at ? 1 : a.at > b.at ? -1 : 0; };
    tops.sort(sort === 'new' ? newest : function (a, b) { return (b.score - a.score) || newest(a, b); });
    var out = [];
    tops.forEach(function (t) {
      out.push(t);
      (replies[t.id] || []).sort(function (a, b) { return a.at < b.at ? -1 : a.at > b.at ? 1 : 0; }).forEach(function (r) { out.push(r); });
    });
    return out;
  }

  // checks done before any network call; the database enforces the same limits again
  function text(value, max, required, what) {
    var s = value == null ? '' : String(value);
    if (required && !s.trim()) throw CommunityError('invalid', what + ' cannot be empty.');
    if (s.length > max) throw CommunityError('limit', what + ' is limited to ' + max + ' characters.');
    return s;
  }

  function loadSupabase() {
    return new Promise(function (resolve, reject) {
      if (typeof window === 'undefined') return reject(CommunityError('network', 'No browser.'));
      if (window.supabase && window.supabase.createClient) return resolve(window.supabase);
      var s = document.createElement('script');
      s.src = SUPABASE_SRC;
      s.onload = function () { window.supabase && window.supabase.createClient ? resolve(window.supabase) : reject(CommunityError('network', 'The Supabase library did not load.')); };
      s.onerror = function () { reject(CommunityError('network', 'The Supabase library could not be downloaded.')); };
      document.head.appendChild(s);
    });
  }

  // opts: { client } for tests, or { url, key } for the page
  function create(opts) {
    opts = opts || {};
    var enabled = !!(opts.client || (opts.url && opts.key));
    var clientP = null, meCache = null;

    function client() {
      if (!enabled) return Promise.reject(CommunityError('off', 'The community is not set up.'));
      if (!clientP) {
        clientP = opts.client ? Promise.resolve(opts.client) : loadSupabase().then(function (lib) {
          return lib.createClient(opts.url, opts.key, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true } });
        });
        clientP.catch(function () { clientP = null; });
      }
      return clientP;
    }
    async function session(c) { var r = await c.auth.getSession(); return r && r.data && r.data.session || null; }
    async function need() {
      var c = await client(), s = await session(c);
      if (!s) throw CommunityError('auth', 'Sign in with GitHub first.');
      return { c: c, uid: s.user.id };
    }
    function ok(res) { if (res && res.error) throw mapError(res.error); return res ? res.data : null; }
    async function guard(fn) { try { return await fn(); } catch (e) { throw mapError(e); } }
    function person(p) { return { handle: p && p.handle || 'someone', avatar: p && p.avatar_url || null }; }
    async function myVotes(c, kind) {
      var rows = ok(await c.from('votes').select('target_id').eq('kind', kind)) || [];
      var set = {};
      rows.forEach(function (r) { set[r.target_id] = true; });
      return set;
    }

    var api = {
      enabled: enabled,
      LIMITS: LIMITS,

      user: function () {
        return guard(async function () {
          if (!enabled) return null;
          var c = await client(), s = await session(c);
          if (!s) { meCache = null; return null; }
          if (meCache && meCache.id === s.user.id) return meCache;
          var p = ok(await c.from('profiles').select('id, handle, avatar_url, role').eq('id', s.user.id).single());
          meCache = { id: p.id, handle: p.handle, avatar: p.avatar_url, role: p.role };
          return meCache;
        });
      },
      onAuth: function (cb) {
        var off = function () {}, dead = false;
        client().then(function (c) {
          if (dead) return;
          var r = c.auth.onAuthStateChange(function () { meCache = null; cb(); });
          var sub = r && r.data && r.data.subscription;
          off = function () { if (sub) sub.unsubscribe(); };
        }, function () {});
        return function () { dead = true; off(); };
      },
      signIn: function () {
        return guard(async function () {
          var c = await client();
          ok(await c.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: location.origin + location.pathname } }));
        });
      },
      signOut: function () { return guard(async function () { var c = await client(); meCache = null; ok(await c.auth.signOut()); }); },

      /* progress */
      loadProgress: function () {
        return guard(async function () {
          if (!enabled) return {};
          var c = await client();
          if (!(await session(c))) return {};
          var out = {};
          (ok(await c.from('progress').select('problem_id, hints_used, solved_at')) || []).forEach(function (r) { out[r.problem_id] = { hints: r.hints_used, solved: r.solved_at }; });
          return out;
        });
      },
      saveProgress: function (pid, p) {
        return guard(async function () {
          var h = Math.floor(Number(p && p.hints) || 0);
          if (h < 0 || h > 4) throw CommunityError('limit', 'Hints are 0 to 4.');
          var n = await need();
          var row = { user_id: n.uid, problem_id: pid, hints_used: h };
          if (p && p.solved) row.solved_at = typeof p.solved === 'string' ? p.solved : new Date().toISOString();
          ok(await n.c.from('progress').upsert(row, { onConflict: 'user_id,problem_id' }));
        });
      },

      /* submissions */
      addSubmission: function (pid, s) {
        return guard(async function () {
          text(s.code, LIMITS.code, false, 'Code');
          var n = await need();
          ok(await n.c.from('submissions').insert({ problem_id: pid, code: s.code, verdict: s.verdict, passed: s.passed, total: s.total, runtime_ms: s.ms == null ? null : Math.round(s.ms), hints_used: s.hints || 0 }));
        });
      },
      listSubmissions: function (pid) {
        return guard(async function () {
          if (!enabled) return [];
          var c = await client();
          if (!(await session(c))) return [];
          var rows = ok(await c.from('submissions').select('id, code, verdict, passed, total, runtime_ms, hints_used, created_at').eq('problem_id', pid).order('created_at', { ascending: false }).limit(50)) || [];
          return rows.map(function (r) { return { id: r.id, code: r.code, verdict: r.verdict, passed: r.passed, total: r.total, ms: r.runtime_ms, hints: r.hints_used, at: r.created_at }; });
        });
      },

      /* shared solutions */
      shareSolution: function (pid, s) {
        return guard(async function () {
          var title = text(s.title, LIMITS.title, true, 'The title');
          var expl = text(s.explanation, LIMITS.explanation, false, 'The explanation');
          var code = text(s.code, LIMITS.code, true, 'The code');
          var n = await need();
          var row = ok(await n.c.from('shared_solutions').insert({ problem_id: pid, title: title, explanation: expl, code: code }).select('id').single());
          return { id: row.id };
        });
      },
      listSolutions: function (pid, o) {
        return guard(async function () {
          if (!enabled) return [];
          var c = await client(), s = await session(c);
          if (!s) return [];
          var q = c.from('shared_solutions').select('id, user_id, title, explanation, code, score, hidden, created_at, profiles(handle, avatar_url)').eq('problem_id', pid);
          q = o && o.sort === 'new' ? q.order('created_at', { ascending: false }) : q.order('score', { ascending: false }).order('created_at', { ascending: false });
          var rows = ok(await q) || [], voted = await myVotes(c, 'solution');
          return rows.map(function (r) {
            return { id: r.id, author: person(r.profiles), title: r.title, explanation: r.explanation, code: r.code, score: r.score, hidden: r.hidden, mine: r.user_id === s.user.id, voted: !!voted[r.id], at: r.created_at };
          });
        });
      },
      deleteSolution: function (id) { return removeRow('shared_solutions', id); },

      /* comments */
      addComment: function (pid, c0) {
        return guard(async function () {
          var body = text(c0.body, LIMITS.comment, true, 'The comment');
          var n = await need();
          var row = ok(await n.c.from('comments').insert({ problem_id: pid, body: body, parent_id: c0.parentId || null, is_spoiler: !!c0.spoiler }).select('id').single());
          return { id: row.id };
        });
      },
      listComments: function (pid, o) {
        return guard(async function () {
          if (!enabled) return [];
          var c = await client(), s = await session(c);
          if (!s) return [];
          var rows = ok(await c.from('comments').select('id, user_id, parent_id, body, is_spoiler, score, hidden, created_at, edited_at, profiles(handle, avatar_url)').eq('problem_id', pid).order('created_at', { ascending: true }).limit(500)) || [];
          var voted = await myVotes(c, 'comment');
          return threadOrder(rows.map(function (r) {
            return { id: r.id, parentId: r.parent_id, author: person(r.profiles), body: r.body, spoiler: r.is_spoiler, score: r.score, hidden: r.hidden, mine: r.user_id === s.user.id, voted: !!voted[r.id], at: r.created_at, edited: !!r.edited_at };
          }), o && o.sort);
        });
      },
      editComment: function (id, c0) {
        return guard(async function () {
          var body = text(c0.body, LIMITS.comment, true, 'The comment');
          var n = await need();
          var rows = ok(await n.c.from('comments').update({ body: body, is_spoiler: !!c0.spoiler }).eq('id', id).select('id'));
          if (!rows || !rows.length) throw CommunityError('forbidden', 'You can only edit your own comment.');
        });
      },
      deleteComment: function (id) { return removeRow('comments', id); },

      /* votes, reports, moderation */
      toggleVote: function (kind, id) {
        return guard(async function () {
          if (kind !== 'solution' && kind !== 'comment') throw CommunityError('invalid', 'Unknown kind.');
          var n = await need(), c = n.c, table = kind === 'solution' ? 'shared_solutions' : 'comments';
          var had = (ok(await c.from('votes').select('target_id').eq('kind', kind).eq('target_id', id)) || []).length > 0;
          if (had) ok(await c.from('votes').delete().eq('kind', kind).eq('target_id', id));
          else ok(await c.from('votes').insert({ kind: kind, target_id: id }));
          var row = ok(await c.from(table).select('score').eq('id', id).single());
          return { voted: !had, score: row.score };
        });
      },
      report: function (kind, id, reason) {
        return guard(async function () {
          var why = text(reason, LIMITS.reason, true, 'The reason');
          var n = await need();
          var res = await n.c.from('reports').insert({ kind: kind, target_id: id, reason: why });
          if (res.error && res.error.code === '23505') return; // already reported by this person
          ok(res);
        });
      },
      hide: function (kind, id) {
        return guard(async function () {
          var n = await need(), table = kind === 'solution' ? 'shared_solutions' : 'comments';
          var rows = ok(await n.c.from(table).update({ hidden: true }).eq('id', id).select('id, hidden'));
          if (!rows || !rows.length || rows[0].hidden !== true) throw CommunityError('forbidden', 'Only a moderator can hide this.');
        });
      },
      listReports: function () {
        return guard(async function () {
          if (!enabled) return [];
          var c = await client();
          if (!(await session(c))) return [];
          var rows = ok(await c.from('reports').select('id, kind, target_id, reason, created_at, profiles(handle, avatar_url)').order('created_at', { ascending: false })) || [];
          return rows.map(function (r) { return { id: r.id, kind: r.kind, targetId: r.target_id, reason: r.reason, reporter: person(r.profiles), at: r.created_at }; });
        });
      },
    };

    function removeRow(table, id) {
      return guard(async function () {
        var n = await need();
        var rows = ok(await n.c.from(table).delete().eq('id', id).select('id'));
        if (!rows || !rows.length) throw CommunityError('forbidden', 'You can only delete your own.');
      });
    }
    return api;
  }

  return { create: create, threadOrder: threadOrder, mapError: mapError, CommunityError: CommunityError, LIMITS: LIMITS, SUPABASE_SRC: SUPABASE_SRC };
});
