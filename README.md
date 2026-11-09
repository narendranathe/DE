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

## Making it yours

A `CONFIG` block near the top of `docs/index.html` holds six values — program title, target role,
start date, current day, your name, accent colour. The gear icon in the nav edits the same
fields and saves them to your browser, so you never have to touch the file.

Set `startDate` and today advances by the calendar. Leave it empty and `currentDay` is used.
You can also paste *"today is Day 19"* into the TODAY IS box.

Everything you tick — checkboxes, milestone rewards, your six STAR stories — lives in
`localStorage`. Use **EXPORT STATE** before clearing site data or switching browsers.
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
