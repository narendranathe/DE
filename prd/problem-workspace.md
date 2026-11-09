# PRD — Problem Workspace

Status: building. Owner: the repo owner. Last updated: 2026-11-09.

## 1. Problem

Today a practice question in a day card is a line of text with a LeetCode link. The learner leaves the
page, solves it somewhere else, comes back and ticks a box by hand. Many LeetCode problems also need a
paid plan, so the plan depends on a subscription the owner does not want to buy. Nothing records how they solved it,
how many hints they leaned on, or what other people did. The playground (section 07) runs code but it
knows nothing about the question in front of you.

## 2. Goal

Click a SQL or Python question in a day card and get a LeetCode-style workspace beside it: the problem,
a runnable editor, hidden tests, hints that cost XP, your own submission history, and, with a free
login, other people's solutions and discussion.

Success looks like this:
- A learner solves a question without leaving the page, and the box ticks itself.
- Using a hint is a visible, honest trade: it costs XP before it opens.
- A learner who is stuck can read how others solved it, without being spoiled before they try.

## 3. Users and stories

- **Solo learner (no login).** As a learner, I open a question, write code, press RUN to try the samples,
  press SUBMIT to be judged on hidden tests, and keep my history. Nothing leaves my browser.
- **Signed-in learner.** As a learner, I sign in with GitHub so my submissions follow me across devices,
  I can share a solution with a short write-up, and I can read and post in the discussion.
- **Stuck learner.** As a learner, I open a hint knowing what it costs, one step at a time.
- **Owner.** As the repo owner, I can add a question by adding one file, and a test tells me if the
  statement, tests or solution are broken.

## 4. Scope

Release 2 covers **every LeetCode problem in the plan: 69 questions**, 37 SQL and 32 Python, each written
here in original wording. Nothing in the plan needs a LeetCode account. The first release had 24 of them
(Weeks 1–3 only); the other 45 were added once the first release showed the links still sent people away.

- SQL, 37: every SQL problem in the plan, Days 1–78.
- Python, 32: Days 15–20 as BUILD problems (10 XP), later days as PRACTICE problems (20 XP).
- Tree and graph problems are in. The tests write a tree as a level-order list and a graph as an adjacency
  list, and the learner gets `TreeNode` and `Node` objects (A4).
- Two problems (Game Play Analysis III, Account Balance) only appear inside a checkbox that lists several
  problems. They have no checkbox of their own, so no XP is at stake and every hint is free.

Not in this release: server-side judging, live updates, direct messages, leaderboards, a code editor with
syntax colours, languages other than SQL and Python, and speed tests. The hidden cases check that the answer
is right on tricky inputs. The time limit only stops code that never ends; it does not rank fast against
slow code.

## 5. Requirements

Each requirement has an ID. Every ID maps to at least one automated test (section 9).

### 5.1 Opening the workspace (W)

- **W1** Each question with a bank entry shows a SOLVE HERE button next to its checkbox, in the TODAY
  console and in the full day card. A question without an entry looks exactly as it does today.
- **W2** SOLVE HERE opens a split view over the page. Left: tabs for Description, Hints, Solutions,
  Discussion, Submissions. Right: editor, RUN, SUBMIT, RESET, results. Below 900 px the two stack.
  Esc closes it and focus returns to the button. The address `#p/<id>` opens a question directly.
- **W4** No problem link in the plan sends you to LeetCode first. The link text opens the question in the
  page (`#p/<id>`). A small `LC ↗` link right after it opens the LeetCode page in a new tab, with
  `noopener noreferrer`.
- **W5** Where a problem comes back on a later day, that day's checkbox gets its own SOLVE HERE button. It ticks
  its own box, and it costs no XP (the bounty was on the first day). A checkbox that lists several problems gets
  a link for each and no button, and opening a question from it ticks nothing.
- **W3** Each question has one language. The editor starts from starter code. A draft is saved per
  question as you type. RESET restores the starter after confirmation.

### 5.2 Judging (J)

- **J1** RUN checks the visible sample cases only and shows your output beside the expected output.
- **J2** SUBMIT checks visible and hidden cases. Verdicts: Accepted, Wrong Answer, Runtime Error,
  Time Limit Exceeded. A failure shows the first failing case: its input, expected and actual output.
  A fifth outcome, Judge Error, means the checker itself could not run (the engine failed to download or
  the question's own setup broke). It says nothing about the learner's code, so it is not saved as an
  attempt and costs nothing.
- **J3** SQL comparison: rows are compared as a set unless the question says ordered; numbers match within
  1e-6; NULL equals NULL; column count must match; column names match ignoring case.
- **J4** Python comparison: each case calls the user's function and compares with `==`, or with a named
  comparison the question declares (unordered, group of groups). An exception in user code is a Runtime
  Error with its message. Code that runs past the limit is stopped and gets Time Limit Exceeded.
- **J5** Isolation: every SQL case runs in a fresh schema on its own connection, so it cannot read or
  change the playground's tables. Python runs in its own worker, separate from the playground's session.
- **J6** A question of kind "mutate" runs the user's statements, then compares the result of a fixed
  verification query.

### 5.3 Hints and XP (H)

- **H1** Each question has three hints and a full approach. They open one at a time, in order.
- **H2** Before a hint opens, the learner sees its cost and must confirm. Opening is recorded and cannot be
  undone by closing or reloading.
- **H3** Each question has a bounty B: 20 XP for a SQL practice rep, 10 XP for a Python Build problem.
  After k reveals the cost is `round(B × k / 4)`; reveal 4 is the full approach and costs the whole bounty.
- **H4** An Accepted submit ticks the question's checkbox for the learner.
- **H5** A day's XP is its existing score minus the costs of its questions, counted only when the category
  that question belongs to is fully earned, never below 0. The console shows the deduction, e.g.
  `150 / 170 XP (−10 hints)`.
- **H6** Opening the full approach counts as having solved it for unlocking other people's solutions (C4).

### 5.4 Submissions (S)

- **S1** Every SUBMIT is saved in the browser: code, verdict, cases passed, time, hints used at that
  moment. The last 50 per question are kept.
- **S2** The Submissions tab lists them. Selecting one loads its code into the editor.
- **S3** Signed in, submissions and hint progress are also saved to the shared database, so history follows
  the learner to another device.

### 5.5 Community (C)

- **C1** Sign in with GitHub. Signed out, the workspace works fully on this device; Solutions shows the
  written approaches and the community tabs say what signing in adds.
- **C2** After an Accepted submit, SHARE publishes the solution with a title and a short explanation.
  The author can delete it.
- **C3** Discussion is one thread per question: comments, one level of replies, a spoiler checkbox that
  hides the text until clicked, edit and delete for your own, and a report button for others.
- **C4** Other people's shared solutions are visible only to a learner who has solved the question or
  opened its full approach. Discussion is visible to every signed-in learner; spoiler posts stay collapsed.
- **C5** One upvote per person per solution or comment. Lists sort by votes or by newest.
- **C6** Limits enforced by the database: a comment is at most 4,000 characters, code at most 20,000,
  a title at most 120. At most 30 comments, 20 solutions and 200 submissions per person per hour.
- **C7** A moderator can hide a solution or comment; hidden content is not returned to anyone else.
  Reports are stored for the moderator.
- **C8** Without a configured project (no URL and key in CONFIG) the community is off, not broken.

### 5.6 Privacy and safety (P)

- **P1** The database stores the GitHub handle and avatar URL only. No email address.
- **P2** Deleting a profile deletes that person's submissions, solutions, comments and votes.
- **P3** The anonymous key in the page can do nothing the row-level security rules do not allow;
  an anonymous visitor cannot read or write any table.
- **P4** User text is always rendered as text, never as HTML.
- **P5** Accepted risk: the verdict is computed in the browser, so a determined person can fake Accepted to
  unlock other people's solutions. The stakes are a spoiler, not money or rank, so there is no server judge.

### 5.7 Authoring (A)

- **A1** A question is one file in `tools/problems/`. `node tools/build_problems.js` validates all of them
  and writes `tools/assets/problems.js`.
- **A2** For every question a test proves: the reference solution is Accepted; the starter code is not;
  each listed wrong solution ("mutant") is not Accepted; hidden expected output is computed from the
  reference, not typed by hand.
- **A3** Every question with XP at stake has an anchor that matches exactly one checkbox on its day in the built page.
- **A4** Every question names the LeetCode problem it replaces (`lc`), no two share one, and every LeetCode
  problem linked in the plan has a question. A Python function question may declare `conv` so that trees and
  graphs reach the learner as `TreeNode` and `Node` objects while the test data stays plain lists.

## 6. XP rules in one place

| Item | Rule |
|---|---|
| Bounty | SQL practice rep 20, Python Build problem (Days 15–20) 10, later Python problem 20. A repeat on a later day and a problem with no checkbox: 0 |
| Cost after k reveals | `round(B × k / 4)`; k = 4 is the full approach |
| Counted when | the question's category is fully earned on that day |
| Day XP | existing score − costs, floor 0 |
| Ticking | Accepted ticks the box; a manual tick still works; hints already used still cost |

Example: Day 2 practice rep, bounty 20. One hint costs 5, two cost 10, three cost 15, the approach costs 20.

## 7. Data model (Postgres on Supabase)

| Table | Holds | Read by |
|---|---|---|
| `profiles` | handle, avatar, role | everyone signed in |
| `progress` | per person and question: hints used, solved time | the owner |
| `submissions` | code, verdict, passed, total, runtime, hints used | the owner |
| `shared_solutions` | title, explanation, code | the owner, and anyone who solved or opened the approach |
| `comments` | body, spoiler flag, parent | everyone signed in |
| `votes` | person, target kind, target | the owner; counts are public |
| `reports` | reporter, target, reason | moderators |

All tables have row-level security on. The schema is `supabase/schema.sql`, and every object in it lives in its own
Postgres schema, `de`. It does not touch `public`, other tables, or `auth.users`, so it can share a Supabase project
with another app (test `schema.coexist.test.js`). A profile is made on first use by `de.ensure_profile()`, not by a
sign-up trigger. The page selects the schema with `db: { schema: 'de' }`, and the owner adds `de` to Exposed schemas
once.

## 8. Risks

- Supabase free projects pause after a week without traffic. First visit after a pause is slow until it
  wakes. The page says so when the call fails.
- Spam. Mitigated by sign-in, hourly limits, reports and moderator hide. Not eliminated.
- Content licence. Shared solutions are shown to other learners under the repo's licence; the SHARE dialog says so.
- The Supabase JS client and runtimes load from a CDN. If it is blocked, the workspace says so and the page
  still works.

## 9. Test plan (written before the code)

| Area | Suite | How it runs |
|---|---|---|
| J3, J2 verdicts, H3, H5 | `judge.test.js` | pure functions, no browser |
| J4, J6, A2 | `problems.test.js` | real DuckDB and real Python in Node, 69 questions |
| C3, C4, C5, C7, S3 | `community.memory.test.js` | in-memory adapter with the same rules |
| C1, C8, S1, S2, S3 | `community.supabase.test.js` | the same adapter code, sending its calls through a small stand-in for the Supabase client onto the real `schema.sql` in Postgres (PGlite) |
| (both above) | `community.contract.js` | one list of 14 cases that both adapter suites run, so the two backends cannot drift apart |
| C4, C6, C7, P1–P3 | `schema.rls.test.js` | the real SQL, in Postgres (PGlite), as anon and signed-in roles |
| X1–X4 | `schema.coexist.test.js` | the schema installed twice next to a stand-in for another app (own `profiles`, own sign-up trigger, RLS tables, grants): nothing of theirs changes, no trigger on `auth.users`, profile made on first use |
| H1–H6, S1, S3, W1 | `workspace.core.test.js` | pure rules: hint order and cost, draft and submission keeping, progress merge, safe text parsing |
| A3, A4, W1, W4, W5 | `mapping.test.js` | built page: every question lands on its own checkbox, no LeetCode-first link left, review days, multi-problem boxes, script order, one self-contained file |
| P4 and versions | `static.test.js` | no markup built from text; the engine versions agree everywhere |
| W1–W5, H1–H6, J1, J2, J5, C1–C8, S1, S2, P4 | `e2e/workspace.e2e.js` | headless Chromium on the built page, with real DuckDB and real Python, real clicks |

Run `npm install` once, then `npm test`. The browser suite is opt-in: `npm run test:e2e`.

Not covered by any automated test here, because they need services this repo does not run: the live
Supabase API (PostgREST and GoTrue), the GitHub sign-in round trip, jsDelivr itself, and the Supabase
client library loaded from the CDN. The browser suite stands in for jsDelivr with a local server that
serves the same files, and the community runs on the in-memory adapter. `supabase/README.md` ends with a
short manual check for the owner to run once after setup.

## 10. Setup the owner does once (community only)

1. Create a free Supabase project, or reuse one that already has an app (read the two cautions in `supabase/README.md`
   first: the anon key becomes public, and learners become users of that project).
2. Run `supabase/schema.sql` in the SQL editor, then add `de` to Exposed schemas in the API settings.
3. Create a GitHub OAuth app and enable the GitHub provider in Supabase Auth, unless it is already on.
4. Paste the project URL and anon key into `CONFIG_BLOCK` in `tools/render_site.py` and rebuild, or edit the
   `CONFIG` block at the top of `docs/index.html` directly. The Settings panel does not carry them.

Full steps with screenshots-free instructions are in `supabase/README.md`.
