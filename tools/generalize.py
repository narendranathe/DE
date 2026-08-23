"""Rewrite the exported plan so any engineer can use it.

The Notion export is left untouched; this stage rewrites it into
`generalized.md`, which `parse_plan.py` then reads. Every rule below is an
exact-string rewrite tagged with the category it belongs to, so the whole
de-personalisation is reviewable as a list rather than buried in a 232 KB diff.

Nothing is deleted. Where a passage carried teaching value through a personal
story, it is rewritten as the generic version of the same lesson.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'notion-export.md')
OUT = os.path.join(HERE, 'generalized.md')

# (category, before, after)
RULES = [

# ---- 1. COMPANY / TARGET REFERENCES -----------------------------------------
(1, '"title":"📘 Daily Executor — Master Prep Document (GS ETO + Peer Firms)"',
    '"title":"📘 Daily Executor — Master Prep Document"'),

(1, '[GS-tagged](https://leetcode.com/company/goldman-sachs/)',
    '[company-tagged lists](https://leetcode.com/company_list/) — filter to your target firms'),

(1, '- **GS Open Source: FINOS Legend** — [legend.finos.org](https://legend.finos.org) — '
    'the actual platform you might work on at GS ETO. Rare candidate fuel.\n',
    '- **Your target firm\'s public tech stack** — most large engineering orgs open-source '
    'part of their data platform or write about it. Find the repo or the engineering blog for '
    'the team you are interviewing with and read it; almost no candidate does, and it turns '
    '"why us?" into a real conversation.\n'),

(1, 'records each divergence as a **"Break"** row (the finance term — great for your GS/fintech targets)',
    'records each divergence as a **"Break"** row (the term finance and payments teams use for '
    'a reconciliation mismatch — worth adopting if you are targeting that sector)'),

(1, 'Add the "why this matters" framing for a fintech/data hiring manager.',
    'Add the "why this matters" framing aimed at a hiring manager on the kind of team you are targeting.'),

# ---- 2. EMPLOYER / WORK HISTORY ---------------------------------------------
(2, '**CDC (your ExponentHR mastery):**',
    '**CDC (a common source of production pain):**'),

(2, 'match on a key, update/delete/insert accordingly — the lakehouse version of the CDC '
    'pipelines you master at ExponentHR.',
    'match on a key, update/delete/insert accordingly — the lakehouse version of the CDC '
    'pipelines that feed most enterprise warehouses.'),

(2, 'Re-implement one ExponentHR-style transform (a join + group-by aggregate)',
    'Re-implement one warehouse-style transform (a join + group-by aggregate)'),

(2, 'This is the day that connects your existing expertise to the new stack — your single '
    'biggest interview asset.',
    'This is the day that connects existing warehouse and ETL experience to the lakehouse '
    'stack — for anyone coming from a SQL or ETL background, that bridge is the single '
    'biggest interview asset.'),

(2, 'Build a STAR bank (Situation 15s / Task 10s / Action 45s / Result-with-metric 20s) from '
    'your real wins: the CDC hard-delete bug, cutting deployment 3 months → 14 days, the AKS '
    'migration (12%→64% CPU, \\$3.2k/mo saved), the CDC ETL 30min→\\<8min, and the capstone '
    '(self-healing system). Each ends in a quantified result.',
    'Build a STAR bank (Situation 15s / Task 10s / Action 45s / Result-with-metric 20s) from '
    'your own history. Mine it for five stories in these shapes: a subtle data-correctness bug '
    'you found and fixed; a delivery or deployment process you shortened; an infrastructure or '
    'cost optimisation you can quantify; a pipeline you made materially faster; and this '
    'capstone (a self-healing system). Each one ends in a number — if you cannot put a figure '
    'on it, go back to the logs, the tickets or the dashboards and find one.'),

# ---- 3. PERSONAL CIRCUMSTANCES ----------------------------------------------
(3, 'a Notion board (Target → Contacted → Replied → Call → Onsite) seeded with 20 roles '
    'needing H1B transfer (lottery-exempt — a non-filter at big firms).',
    'a tracking board (Target → Contacted → Replied → Call → Onsite) seeded with 20 roles that '
    'genuinely fit your stack and level. Filter on the constraints that actually apply to you — '
    'location, remote policy, visa sponsorship, clearance, domain — and record them on the board '
    'so you stop re-checking.'),

(3, 'No referral path → second-degree LinkedIn + alumni (Missouri S&T) + data-eng community '
    '(your hackathon/event contacts).',
    'No referral path → second-degree connections, your university alumni network, former '
    'colleagues, and the data-engineering community (conference, meetup and hackathon contacts).'),

(3, '(This is also your Joe Reis hackathon lesson — the winner used LangGraph persona-agents; '
    'now you build one.)',
    '(This pattern keeps winning data-engineering hackathons: teams that ship a small graph of '
    'persona-agents beat teams that ship another dashboard.)'),

(3, 'it directly echoes your hackathon lesson: agents \\> dashboards for investigation',
    'it reflects a repeatable lesson: for investigation work, an agent that explains a cause '
    'beats one more dashboard that shows a symptom'),

(3, '> 📬 **Outreach engine:** your standard LinkedIn DM template (personalized greeting → role '
    'mention → ExponentHR experience → value-add → meeting request), now with the capstone as '
    'the value-add hook.',
    '> 📬 **Outreach engine:** a short, repeatable outreach message — personalised opening → the '
    'specific role → one line of relevant experience → something useful you can offer → a '
    'concrete ask. Use the capstone as the useful thing you bring.'),

(3, 'an outreach push using your LinkedIn DM template',
    'an outreach push using a repeatable outreach message'),

(3, 'This README will be linked in every application + LinkedIn DM.',
    'This README gets linked in every application and every outreach message.'),

# ---- 4. BIOGRAPHICAL "you/your" BRIDGES -------------------------------------
(4, '<summary>🎮 Interactive / gamified — learn by building (your favorite mode)</summary>',
    '<summary>🎮 Interactive / gamified — learn by building</summary>'),

(4, 'Plus lean into your SQL superpower — a set of hard SQL (window functions, gaps-and-islands, '
    'top-N-per-group) since data-engineering screens lean SQL-heavy and it\'s where you dominate.',
    'Plus a set of hard SQL (window functions, gaps-and-islands, top-N-per-group), because '
    'data-engineering screens lean SQL-heavy. Engineers arriving from a SQL or analytics '
    'background should lean on that here — it is the round where an existing strength shows.'),

(4, 'retrying a **non-idempotent** write doubles data (you\'ve lived this with CDC)',
    'retrying a **non-idempotent** write doubles data (anyone who has operated a CDC pipeline '
    'has met this)'),

(4, 'CDC → Iceberg (your bridge day)', 'CDC → Iceberg (the bridge day)'),


(4, '**Anti-join** `NOT EXISTS` / `LEFT JOIN ... WHERE r.id IS NULL` (your orphan-detection pattern).',
    '**Anti-join** `NOT EXISTS` / `LEFT JOIN ... WHERE r.id IS NULL` (the orphan-detection pattern).'),
]

# ---- FRAME: titles, mission, closing arc, behavioural day ------------------
FRAME = [
(1, '# 🚀 Daily Executor — AI + Data + Lakehouse Engineer (12 Weeks)',
    '# 🚀 Daily Executor — 12-Week AI + Data + Lakehouse Engineering Program'),

(2, '> **One page. Open it, find today, do the card, tick the boxes, claim your reward.**',
    '> **One page. Open it, find today, do the card, tick the boxes.**'),

(2, '> **Target:** AI Engineer + Data Engineer + Lakehouse Engineer. **Stack:** Iceberg + PySpark '
    '+ dbt + object storage, plus a GenAI track (RAG → eval → agentic → LLMOps).',
    '> **Builds toward:** AI Engineer / Data Engineer / Lakehouse Engineer roles. **Stack:** '
    'Iceberg + PySpark + dbt + object storage, plus a GenAI track (RAG → eval → agentic → LLMOps).'),

(3, '> Five shipped repos, one standout capstone, reflex-level patterns, and a story that fuses '
    'your CDC/SQL mastery with modern AI+data engineering. Now go convert it. 🚀',
    '> Five shipped repos, one standout capstone, and reflex-level patterns — whatever background '
    'you started from. Now go convert it. 🚀'),

(2, 'you went from SQL-strong data engineer to a shipped-portfolio AI + Data + Lakehouse engineer.',
    'you went from wherever you started to a shipped-portfolio AI + Data + Lakehouse engineer.'),

# ---- 5. behavioural day: prompts, not someone else's stories ----------------
(5, '> 🎯 **Cutoff target:** 6 polished STAR stories ready, including the CDC bug fix, the '
    'deployment-cycle win, and the capstone.',
    '> 🎯 **Cutoff target:** 6 polished STAR stories written in your own words — five from your '
    'own history, one from this program\'s capstone.'),

(5, '- [ ] Tell the CDC-bug STAR story in 90s with the metric.',
    '- [ ] Tell your strongest debugging STAR story in 90s, landing the metric.'),

# ---- 6. the capstone framing is a suggestion, not a claim -------------------
(6, '⭐ This is the component that most directly tells your "self-healing systems" story — '
    'name it prominently.',
    '⭐ **Suggested framing:** if you want the portfolio to lead on "self-healing systems," this '
    'is the component that carries that claim furthest — name it prominently. Pick a different '
    'angle if it fits your target roles better; the build stands either way.'),

(6, 'Tier-2 features that tell *your* story (self-healing auto-remediation + an '
    'investigate-the-break agent + tracing/OTel)',
    'Tier-2 features that give the project its story (self-healing auto-remediation + an '
    'investigate-the-break agent + tracing/OTel)'),
]
RULES += FRAME

# ---- FINAL SWEEP: residue found by build/sweep.py ---------------------------
SWEEP = [
# 1 · an unannotated list of finance firms reads as target-firm naming, unlike the
#     three before it, which name what you would actually go there to read.
(1, '- **Eng blogs:** Stripe (idempotency/ledgers) · Netflix (fault tolerance/observability) · '
    'Uber (real-time data) · Two Sigma · Jane Street · Bloomberg.',
    '- **Eng blogs:** Stripe (idempotency/ledgers) · Netflix (fault tolerance/observability) · '
    'Uber (real-time data) — then the engineering blog of whichever firm you are interviewing '
    'with. Most large data teams publish one, and almost no candidate reads it.'),

# 3 · the write-up titles are suggestions for the reader to publish under their own
#     name; marking them as examples stops them reading as the author's claims.
(3, '**Post:** short write-up "From CDC to Iceberg: what a SQL Server engineer learns"',
    '**Post:** a short write-up — e.g. "From CDC to Iceberg: what a SQL engineer learns"'),
(3, '**Post:** write-up "Building a governed lakehouse pipeline: Spark + dbt + Dagster on Iceberg"',
    '**Post:** a write-up — e.g. "Building a governed lakehouse pipeline: Spark + dbt + Dagster on Iceberg"'),
(3, '**Post:** write-up "Don\'t ship RAG you haven\'t evaluated: faithfulness, context-recall, '
    'and how I moved them"',
    '**Post:** a write-up in your own voice — e.g. "Don\'t ship RAG you haven\'t evaluated: '
    'faithfulness, context-recall, and how I moved them"'),
(3, '**Post:** write-up "From a fraud model to an AI platform: registry, drift, tracing, agents, guardrails"',
    '**Post:** a write-up — e.g. "From a fraud model to an AI platform: registry, drift, tracing, agents, guardrails"'),
(3, '**Announce:** a LinkedIn post + Substack write-up — "I built a self-healing AI-ready '
    'lakehouse: CDC→Iceberg, eval\'d RAG, drift-aware serving, and an investigate-the-break agent."',
    '**Announce:** a post + write-up in your own voice — e.g. "I built a self-healing AI-ready '
    'lakehouse: CDC→Iceberg, eval\'d RAG, drift-aware serving, and an investigate-the-break agent."'),
]
RULES += SWEEP

# Applied after the exact rules: phrasing that recurs in many day cards.
PHRASE_RULES = [
    (2, r'\bat ExponentHR\b', 'in a production warehouse'),
    (2, r'\bExponentHR\b', 'your current or most recent role'),
    (1, r'\bGS ETO\b', 'your target firm'),
    (1, r'\bGoldman Sachs\b', 'a large financial-services firm'),
    (3, r'\bMissouri S&T\b', 'your university'),
    (3, r'\bH1B\b', 'visa'),
]


def main():
    src = open(SRC).read()
    text = src
    log = []
    for cat, before, after in RULES:
        hits = text.count(before)
        if not hits:
            print('WARN rule did not match (cat %d): %s' % (cat, before[:64]), file=sys.stderr)
            continue
        text = text.replace(before, after)
        log.append((cat, hits, before, after))
    for cat, pat, after in PHRASE_RULES:
        hits = len(re.findall(pat, text))
        if hits:
            text = re.sub(pat, after, text)
            log.append((cat, hits, pat, after))
    open(OUT, 'w').write(text)
    print('wrote %s  (%d rules applied, %d chars)' % (OUT, len(log), len(text)))
    return log


if __name__ == '__main__':
    main()
