# DE — 12-Week Data Engineering Program

A self-contained tracker for a 12-week AI + Data + Lakehouse engineering program.
84 day-cards, a daily ritual checklist, XP and streak tracking, and an 84-square status grid.

**Live:** https://narendranathe.github.io/DE/

Open `index.html` and it works — no build step, no dependencies, no backend. Progress saves
to your browser.

## What's in it

| Section | |
|---|---|
| **Today** | The current card: cutoff target, ritual checklist, SQL rep links, recall questions |
| **The 84** | Every day as a coloured square — green done, amber today, steel in progress, hollow ahead |
| **Weeks** | Twelve phase cards with n/7 progress, and W9–11 bracketed as one capstone |
| **Ritual** | The nine steps every card follows |
| **XP & rewards** | Live per-category scoring, streak, milestone rewards you fill in |
| **Resources · Cheat sheets** | Every link from the plan; Python, SQL, complexity, HLD, LLD, frameworks |
| **All 84 days** | Every card in full |
| **State** | Export / import your progress as JSON |

## Making it yours

A `CONFIG` block near the top of `index.html` holds six values — program title, target role,
start date, current day, your name, accent colour. The gear icon in the nav edits the same
fields and saves them to your browser, so you never have to touch the file.

Set `startDate` and today advances by the calendar. Leave it empty and `currentDay` is used.
You can also paste *"today is Day 19"* into the TODAY IS box.

Everything you tick — checkboxes, milestone rewards, your six STAR stories — lives in
`localStorage`. Use **EXPORT STATE** before clearing site data or switching browsers.

## Rebuilding

`index.html` is generated. See [`tools/README.md`](tools/README.md):

```sh
cd tools
python3 parse_plan.py    # generalized.md -> assets/plan.js
python3 render_site.py   # assets/plan.js -> ../index.html
```

## Deploying

Settings → Pages → *Deploy from a branch* → `main` / `/ (root)`. It republishes on every push.
