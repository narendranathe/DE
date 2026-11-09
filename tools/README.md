# tools — rebuilding the tracker

`../docs/index.html` is generated, not hand-edited. Regenerate it with:

```sh
cd tools
python3 parse_plan.py    # generalized.md -> assets/plan.js
python3 render_site.py   # assets/plan.js -> ../docs/index.html
```

Then commit `docs/index.html`. GitHub Pages serves it directly — no CI step.

| File | Role |
|---|---|
| `generalized.md` | The program content: 12 weeks, 84 two-hour day-cards, cheat sheets, resources |
| `parse_plan.py` | Markdown → structured JSON (`assets/plan.js`) |
| `render_site.py` | The page itself — all HTML, CSS and JS live here |
| `assets/playground.js`, `assets/playground.css` | The Python and SQL playground; `render_site.py` inlines both into the page |
| `generalize.py` | The de-personalisation rules (see below) |
| `sweep.py` | Audits the built page for personalisation leaks, by day and section |

## Editing content

Edit `generalized.md`, then re-run the two commands. Day cards follow a fixed shape —
`## Day N — Title 🎮 Level N` (or `🎮 Boss Level`), a `🎯 Cutoff target` blockquote, then bolded
sections for review, concept, alternatives, roadblock, key ideas, read, build, practice reps,
done-when, reward and recall. The parser keys off those lead-ins, so keep them, and do not start
a body line with a bold phrase or it becomes a new section.

Review blocks are written by hand into each card, one question per earlier day at gaps of 1, 3, 7,
14 and 30 days, taken from that day's recall questions. If you move, add or reword a day, update the
review lines on the days that point at it. Each reward line states the day's XP ceiling
(`= **170 XP**`, or 140 on days with no reading); the page trusts that number.

## Editing the page

`render_site.py` holds the whole front end: `CSS` for styling, `JS` for behaviour, and one
function per section. The semantic colour palette is six CSS variables at the top of `CSS`;
`CONFIG_BLOCK` is the six user-editable settings that ship at the top of the page.

## Editing the playground

`assets/playground.js` holds the editor, the example lists and the two runtimes. The versions are
two constants at the top, `PY_VER` (Pyodide) and `DUCK_VER` (DuckDB-WASM). Both load from jsDelivr
the first time someone presses RUN, so nothing is bundled into the page.

- Pyodide 314 only runs in a **module** worker and is imported from `pyodide.mjs`. A classic
  `importScripts` worker throws "Classic web workers are not supported". The worker starts from a
  Blob URL and falls back to a `data:` URL, because Chrome blocks Blob module workers on `file://` pages.
- DuckDB's own worker is a classic one, started through a Blob that calls `importScripts`.
- Before bumping a version, check that the new Pyodide has `pyodide.mjs` and `pydantic` and `pytest`
  in its lock file, and that every example still runs. The `Day N` labels on the examples should
  match the syllabus; they are plain strings in `EX`.
- Test without internet by serving jsDelivr paths from local copies, for example a small HTTPS server
  plus `--host-resolver-rules=MAP cdn.jsdelivr.net 127.0.0.1` in Chromium. Playwright's `page.route`
  does not reliably serve `importScripts` from a worker.

## generalize.py

The content originally came from a personal study plan and carried its author's employer,
target firms and circumstances. `generalize.py` rewrote that source into `generalized.md`
through ~37 exact-string rules, each tagged with a category. The raw source is deliberately
not in this repo — `generalized.md` is the de-personalised output and is what the build reads.

`sweep.py` re-audits the result across five categories (organisation names, resume-shaped
metrics, first-person career claims, visa/location/university, reader assumptions). It
currently reports no real hits.
