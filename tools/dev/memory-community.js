'use strict';
// An in-memory copy of the community service. It states the same rules as supabase/schema.sql a second time,
// in plain JavaScript, so the contract in tests/community.contract.js is checked against two separate versions.
// The page does not use this file. It is for tests and for trying the interface without a Supabase project.
const { threadOrder, LIMITS, CommunityError } = require('../assets/community.js');

const VERDICTS = ['Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded'];
const HOUR = 3600 * 1000;
const PER_HOUR = { comments: 30, solutions: 20, submissions: 200 };

function makeWorld() {
  let ids = 0, last = 0;
  const state = {};
  const users = {};
  const newId = () => '00000000-0000-4000-8000-' + String(++ids).padStart(12, '0');
  // strictly increasing, so "newest first" has no ties
  const clock = () => { last = Math.max(Date.now(), last + 1); return last; };
  const iso = (ms) => new Date(ms).toISOString();

  function reset() {
    state.progress = new Map(); state.submissions = []; state.solutions = []; state.comments = [];
    state.votes = new Set(); state.reports = [];
  }
  reset();

  function addUser(handle, role) {
    const u = { id: newId(), handle, avatar: 'https://avatars.example/' + handle + '.png', role: role || 'member' };
    users[handle] = u;
    return u;
  }
  const byId = (id) => Object.values(users).find((u) => u.id === id);
  const person = (id) => { const u = byId(id); return { handle: u ? u.handle : 'someone', avatar: u ? u.avatar : null }; };

  function api(handle) {
    const me = handle ? users[handle] : null;
    const isMod = () => !!me && me.role === 'moderator';
    const need = () => { if (!me) throw CommunityError('auth', 'Sign in first.'); return me; };
    const text = (v, max, required, what) => {
      const s = v == null ? '' : String(v);
      if (required && !s.trim()) throw CommunityError('invalid', what + ' cannot be empty.');
      if (s.length > max) throw CommunityError('limit', what + ' is too long.');
      return s;
    };
    const prog = (pid) => state.progress.get(me.id + '|' + pid);
    const unlocked = (pid) => { const p = me && prog(pid); return !!p && (!!p.solved || p.hints >= 4); };
    const canSeeSolution = (s) => !!me && (s.userId === me.id || isMod() || (!s.hidden && unlocked(s.problemId)));
    const canSeeComment = (c) => !!me && (!c.hidden || c.userId === me.id || isMod());
    const recent = (rows) => rows.filter((r) => r.userId === me.id && r.atMs > Date.now() - HOUR).length;
    const voted = (kind, id) => !!me && state.votes.has(me.id + '|' + kind + '|' + id);
    const target = (kind, id) => (kind === 'solution' ? state.solutions : state.comments).find((x) => x.id === id);
    const sortBy = (list, sort) => list.sort((a, b) => (sort === 'new' ? 0 : b.score - a.score) || b.atMs - a.atMs);

    return {
      enabled: true,
      LIMITS,
      user: async () => (me ? { id: me.id, handle: me.handle, avatar: me.avatar, role: me.role } : null),
      onAuth: () => () => {},
      signIn: async () => {},
      signOut: async () => {},

      loadProgress: async () => {
        const out = {};
        if (!me) return out;
        for (const [k, p] of state.progress) if (k.startsWith(me.id + '|')) out[k.slice(me.id.length + 1)] = { hints: p.hints, solved: p.solved };
        return out;
      },
      saveProgress: async (pid, p) => {
        const h = Math.floor(Number(p && p.hints) || 0);
        if (h < 0 || h > 4) throw CommunityError('limit', 'Hints are 0 to 4.');
        need();
        const old = prog(pid) || { hints: 0, solved: null };
        const solved = old.solved || (p && p.solved ? (typeof p.solved === 'string' ? p.solved : iso(clock())) : null);
        state.progress.set(me.id + '|' + pid, { hints: Math.max(old.hints, h), solved });
      },

      addSubmission: async (pid, s) => {
        text(s.code, LIMITS.code, false, 'Code');
        need();
        if (!VERDICTS.includes(s.verdict)) throw CommunityError('limit', 'Unknown verdict.');
        if (recent(state.submissions) >= PER_HOUR.submissions) throw CommunityError('rate_limit', 'Too many.');
        const atMs = clock();
        state.submissions.push({ id: newId(), userId: me.id, problemId: pid, code: s.code, verdict: s.verdict, passed: s.passed, total: s.total, ms: s.ms == null ? null : Math.round(s.ms), hints: s.hints || 0, atMs });
      },
      listSubmissions: async (pid) => {
        if (!me) return [];
        return state.submissions.filter((s) => s.userId === me.id && s.problemId === pid)
          .sort((a, b) => b.atMs - a.atMs).slice(0, 50)
          .map((s) => ({ id: s.id, code: s.code, verdict: s.verdict, passed: s.passed, total: s.total, ms: s.ms, hints: s.hints, at: iso(s.atMs) }));
      },

      shareSolution: async (pid, s) => {
        const title = text(s.title, LIMITS.title, true, 'The title');
        const explanation = text(s.explanation, LIMITS.explanation, false, 'The explanation');
        const code = text(s.code, LIMITS.code, true, 'The code');
        need();
        const p = prog(pid);
        if (!p || !p.solved) throw CommunityError('forbidden', 'Solve the question first.');
        if (recent(state.solutions) >= PER_HOUR.solutions) throw CommunityError('rate_limit', 'Too many.');
        const row = { id: newId(), userId: me.id, problemId: pid, title, explanation, code, score: 0, hidden: false, atMs: clock() };
        state.solutions.push(row);
        return { id: row.id };
      },
      listSolutions: async (pid, o) => {
        if (!me) return [];
        return sortBy(state.solutions.filter((s) => s.problemId === pid && canSeeSolution(s)), o && o.sort).map((s) => ({
          id: s.id, author: person(s.userId), title: s.title, explanation: s.explanation, code: s.code, score: s.score,
          hidden: s.hidden, mine: s.userId === me.id, voted: voted('solution', s.id), at: iso(s.atMs),
        }));
      },
      deleteSolution: async (id) => {
        need();
        const s = state.solutions.find((x) => x.id === id);
        if (!s || !(s.userId === me.id || isMod())) throw CommunityError('forbidden', 'Only the author can delete this.');
        state.solutions = state.solutions.filter((x) => x !== s);
      },

      addComment: async (pid, c) => {
        const body = text(c.body, LIMITS.comment, true, 'The comment');
        need();
        if (c.parentId) {
          const par = state.comments.find((x) => x.id === c.parentId);
          if (!par || !canSeeComment(par) || par.problemId !== pid || par.parentId) throw CommunityError('invalid', 'You can only reply to a top-level comment on the same question.');
        }
        if (recent(state.comments) >= PER_HOUR.comments) throw CommunityError('rate_limit', 'Too many posts in the last hour.');
        const row = { id: newId(), userId: me.id, problemId: pid, parentId: c.parentId || null, body, spoiler: !!c.spoiler, score: 0, hidden: false, atMs: clock(), edited: false };
        state.comments.push(row);
        return { id: row.id };
      },
      listComments: async (pid, o) => {
        if (!me) return [];
        const items = state.comments.filter((c) => c.problemId === pid && canSeeComment(c)).map((c) => ({
          id: c.id, parentId: c.parentId, author: person(c.userId), body: c.body, spoiler: c.spoiler, score: c.score,
          hidden: c.hidden, mine: c.userId === me.id, voted: voted('comment', c.id), at: iso(c.atMs), edited: c.edited,
        }));
        return threadOrder(items, o && o.sort);
      },
      editComment: async (id, c) => {
        const body = text(c.body, LIMITS.comment, true, 'The comment');
        need();
        const row = state.comments.find((x) => x.id === id);
        if (!row || row.userId !== me.id) throw CommunityError('forbidden', 'You can only edit your own comment.');
        if (body !== row.body) row.edited = true;
        row.body = body; row.spoiler = !!c.spoiler;
      },
      deleteComment: async (id) => {
        need();
        const row = state.comments.find((x) => x.id === id);
        if (!row || !(row.userId === me.id || isMod())) throw CommunityError('forbidden', 'You can only delete your own.');
        state.comments = state.comments.filter((x) => x.id !== id && x.parentId !== id);
      },

      toggleVote: async (kind, id) => {
        if (kind !== 'solution' && kind !== 'comment') throw CommunityError('invalid', 'Unknown kind.');
        need();
        const row = target(kind, id);
        const visible = row && (kind === 'solution' ? canSeeSolution(row) : canSeeComment(row));
        if (!visible || row.userId === me.id) throw CommunityError('forbidden', 'You cannot vote on this.');
        const key = me.id + '|' + kind + '|' + id;
        if (state.votes.has(key)) { state.votes.delete(key); row.score -= 1; return { voted: false, score: row.score }; }
        state.votes.add(key); row.score += 1;
        return { voted: true, score: row.score };
      },
      report: async (kind, id, reason) => {
        const why = text(reason, LIMITS.reason, true, 'The reason');
        need();
        if (state.reports.some((r) => r.reporterId === me.id && r.kind === kind && r.targetId === id)) return;
        state.reports.push({ id: newId(), reporterId: me.id, kind, targetId: id, reason: why, atMs: clock() });
      },
      hide: async (kind, id) => {
        need();
        const row = target(kind, id);
        if (!isMod() || !row) throw CommunityError('forbidden', 'Only a moderator can hide this.');
        row.hidden = true;
      },
      listReports: async () => {
        if (!isMod()) return [];
        return state.reports.slice().sort((a, b) => b.atMs - a.atMs)
          .map((r) => ({ id: r.id, kind: r.kind, targetId: r.targetId, reason: r.reason, reporter: person(r.reporterId), at: iso(r.atMs) }));
      },
    };
  }

  addUser('alice'); addUser('bob'); addUser('cy'); addUser('mod', 'moderator');
  return {
    alice: api('alice'), bob: api('bob'), cy: api('cy'), mod: api('mod'), anon: api(null),
    device: (name) => api(name),
    reset: async () => reset(),
    close: async () => {},
  };
}

module.exports = { makeWorld };
