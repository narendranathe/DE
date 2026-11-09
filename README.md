# DE — 12-Week AI + Data Engineering Program

A self-contained tracker for a 12-week AI + Data engineering program for interview prep.
84 day-cards of two hours each, a daily ritual checklist, built-in spaced review, XP and streak
tracking, and an 84-square status grid.

**Live:** https://narendranathe.github.io/DE/

Open `docs/index.html` and it works — no build step, no dependencies, no backend. Progress saves
to your browser.

## What's in it

| Section | |
|---|---|
| **Today** | The current card: cutoff target, review questions, ritual checklist, practice rep, recall questions |
| **The 84** | Every day as a coloured square — green done, amber today, steel in progress, hollow ahead |
| **Weeks** | Twelve phase cards with n/7 progress, and W10–11 bracketed as one capstone |
| **Ritual** | The nine steps every card follows, and what each costs in minutes |
| **XP & rewards** | Live per-category scoring, streak, milestone rewards you fill in |
| **Resources · Cheat sheets** | Every link from the plan; Python, SQL, complexity, HLD, LLD, frameworks |
| **Playground** | Python and SQL that run in the browser. Free, no sign-in, nothing to install |
| **All 84 days** | Every card in full |
| **State** | Export / import your progress as JSON |

## The twelve weeks

| Weeks | Focus |
|---|---|
| W1 | SQL and data modeling |
| W2 | Production Python |
| W3 | Data structures and algorithms, by pattern |
| W4–5 | Lakehouse and Spark, then dbt, data quality, Airflow, governance, a cloud map and a take-home drill |
| W6 | Data system design |
| W7 | LLM fundamentals and LLM app basics |
| W8 | RAG and evals |
| W9 | Agents, LLMOps, security and cost |
| W10–11 | Capstone: an AI-ready lakehouse that heals itself |
| W12 | Mock interviews and conversion |

## The two-hour day

Every day has the same shape and the same budget:

| Minutes | Step |
|---|---|
| 15 | **Review** old material from memory, then check |
| 20 | **Learn**: the concept, the alternatives, the classic roadblock and its fix, two short reads |
| 55 | **Build** it and commit; the commit is the checkpoint |
| 15 | **Practice**: one timed SQL or algorithm rep |
| 15 | **Recall** with the book closed |

**How the review loop works.** The review block on each card pulls one question from the days
1, 3, 7, 14 and 30 back, so a topic comes back at growing gaps. Day 1 is a cold baseline that you
re-test on Day 7. Every seventh day is a boss day that sweeps the whole week. A file you keep called
`error-log.md` holds every miss with a one-line correction; it is your own review list, and the
practice slot revisits the same patterns.

## The playground

The page has a code box that runs Python and SQL with no server and no account. Use it to try an
idea in a minute, then do the real build in your repo.

- **Python** runs in your browser through Pyodide (CPython compiled to WebAssembly). It handles the
  standard library, `pydantic`, `pytest`, `numpy`, `pandas`, `sqlite3` and most popular packages, which load by name
  when you import them. A `# pip: name` line at the top installs a pure-Python package from PyPI.
  **STOP** ends a runaway loop without freezing the page.
- **SQL** runs in DuckDB (also WebAssembly), the same engine as the sql-lab repo, so `QUALIFY`,
  `MERGE INTO`, window frames and `EXPLAIN ANALYZE` work. **LOAD SAMPLE WAREHOUSE** builds five small tables
  with planted duplicates, NULLs and orphan keys for the Week 1 queries.
- Every Python and SQL code block in the day cards and cheat sheets has a **TRY IN PLAYGROUND** button.
- The first run of each language downloads about 10 MB from a public CDN (jsDelivr), then your browser
  caches it. Your code is saved in this browser only. Python in it cannot make ordinary web requests, use
  `input()`, or read your local files, and it cannot run Spark, Airflow or dbt.

## Solve it here

Every SQL and Python problem in the plan has its own question in the page: 69 of them, 37 in SQL and
32 in Python. The questions are written here, in original wording, so you do not need a LeetCode account
or a LeetCode subscription. Click the title of a problem anywhere in a day card and it opens the
workspace: the problem on the left, an editor on the right. A small **LC ↗** link beside the title opens
the matching LeetCode page in a new tab, in case you want to compare.

- A problem that has a checkbox of its own also has a **SOLVE HERE** button next to it, in the day card
  and in the TODAY console. An accepted answer ticks that box.
- When a problem comes back on a later day (a cold re-solve), that day's checkbox gets its own SOLVE HERE
  button. It ticks that day's box and costs no XP: the hints were paid for on the first day.
- A checkbox that lists several problems (a timed set) gets a link for each problem and no button. Opening
  one does not tick the box. Two problems only appear in such a set, so they have no XP at stake and
  every hint on them is free.

- **RUN** checks the sample cases and shows your output beside the expected output.
- **SUBMIT** checks every case, including hidden ones, and saves the attempt. Verdicts are Accepted,
  Wrong Answer, Runtime Error and Time Limit Exceeded (5 seconds per case). Accepted ticks the question's
  own checkbox for you. *Could not run the checker* is not a verdict on your code: it means the engine
  did not download, so check your connection and try again.
- **Hints cost XP.** Each question has a bounty: 20 XP for a SQL practice rep or a later Python problem,
  10 XP for a Python build problem on Days 15–20. Three hints and then the full approach open in order, and each asks you to confirm first. After
  *k* reveals you have paid `round(bounty × k / 4)`, so the full approach costs the whole bounty. After
  hint 1, hint 2, hint 3 and the approach, the running total is 5, 10, 15 and 20 XP for SQL and 3, 5, 8 and
  10 XP for Python. The day line shows the result, for example
  `150 / 170 XP (−10 hints)`. Once you solve a question every hint is free to read, and what you already
  paid stays paid.
- **Submissions** are kept in this browser, the last 50 for each question. Click one to load its code.
- **Sign-in, shared solutions and discussion** are optional and off by default. Without them the Discussion tab
  is hidden, the Solutions tab shows the official approach, and your progress, hints and attempts stay in this
  browser (use **EXPORT STATE** to move them to another one). The owner can switch them on later by connecting a
  free Supabase project (see [`supabase/README.md`](supabase/README.md)). Then learners sign in with GitHub,
  share a solution with a short explanation, read the solutions of people who solved the question or opened
  its full approach, vote, reply in threads, hide a spoiler behind a click, report a comment, and keep their
  attempts and hint count on every device. A moderator can hide a post. Everything else on the page works
  without any of this.
- The address `#p/sql-d02-department-top-three-salaries` opens a question directly.

The checker runs in your browser with its own DuckDB and Python, separate from the playground, so a
`CREATE TABLE` in an answer never touches your playground data. Because it runs in your browser, someone
determined can fake an Accepted. That only unlocks other people's solutions, which is a spoiler and
nothing more, so there is no server judge.

## Making it yours

A `CONFIG` block near the top of `docs/index.html` holds six values — program title, target role,
start date, current day, your name, accent colour — plus two optional ones, `supabaseUrl` and
`supabaseKey`, for the community. The gear icon in the nav edits the six fields and saves them to your
browser, so you never have to touch the file.

Set `startDate` and today advances by the calendar. Leave it empty and `currentDay` is used.
You can also paste *"today is Day 19"* into the TODAY IS box.

Everything you tick — checkboxes, milestone rewards, your six STAR stories, hints you opened, your
submissions and code drafts — lives in `localStorage`. Use **EXPORT STATE** before clearing site data or switching browsers.
This version stores progress under a new key (`daily-executor.v4`), so ticks saved by the earlier
84-card version do not carry over.

## Rebuilding

`docs/index.html` is generated. See [`tools/README.md`](tools/README.md):

```sh
cd tools
python3 parse_plan.py    # generalized.md -> assets/plan.js
python3 render_site.py   # assets/plan.js -> ../docs/index.html
```

## Deploying

Settings → Pages → *Deploy from a branch* → `main` / `/docs`. It republishes on every push.
