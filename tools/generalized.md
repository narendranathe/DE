Here is the result of "view" for the Page with URL https://app.notion.com/p/363e10221fac8188bf7ae97588ca7a21 as of 2026-05-29T01:01:41.315Z:
<page url="https://app.notion.com/p/363e10221fac8188bf7ae97588ca7a21" icon="📘">
<ancestor-path>
<parent-page url="https://app.notion.com/p/2e6e10221fac81329b37f9d8a31b0e44" title="🎯 Interview Prep Master Plan - 4 Weeks to Success"/>
</ancestor-path>
<properties>
{"title":"📘 Daily Executor — Master Prep Document"}
</properties>
<content>
# 🚀 Daily Executor — 12-Week AI + Data + Lakehouse Engineering Program
> **One page. Open it, find today, do the card, tick the boxes.** Every day *teaches* the topic before it tests you: what it is & why engineers use it → alternatives → the classic roadblock + the fix → read → **build it (the real test)** → recall with the book closed.
> **Builds toward:** AI Engineer / Data Engineer / Lakehouse Engineer roles. **Stack:** Iceberg + PySpark + dbt + object storage, plus a GenAI track (RAG → eval → agentic → LLMOps).
## 🎮 How this plan gamifies learning (read once)
> You don't learn a concept by reading it — you learn it by **building** it. This plan is structured like CS50 / [Boot.dev](http://Boot.dev): levels, save points, and boss checks.
- **The running project = your game save.** Every day adds a layer to **Sentinel-Lite** (a self-healing reconciliation service → your capstone). Each day ends with a **git commit = a checkpoint** you can always return to.
- **Days = levels.** Each day has a clear 🎯 cutoff target. Clear it, commit, claim XP.
- **Recall = boss check.** Close the book and beat it from memory — that's the true test of what stuck.
- **Drills = the arcade.** Interactive platforms (CodeCrafters, [Boot.dev](http://Boot.dev), Exercism, CS50P — in the Resource Library) are where you grind a concept until it's reflex.
## 🏆 Reward & XP System
> Motivation is a scoreboard, not willpower. Tick XP as you earn it; cash in real rewards at milestones.
- **Per task:** Read-and-understood `+30` · Build/level cleared `+50` · SQL reps `+20` · Recall boss-check `+25`
- **Perfect day** (all ✅ boxes) = `+25` bonus → a perfect day is **150 XP**
- **🔥 Streak:** every no-zero day (min 2 hrs) extends it. Miss a day → streak resets. Protect the streak.
**Milestone rewards — write in your own treat:**
- [ ] 🔥 7-day streak → 🎁 reward: `__________________`
- [ ] 🔥 14-day streak → 🎁 reward: `__________________`
- [ ] 🏔️ Finish any week (all 7 ✅) → 🎁 reward: `__________________`
- [ ] 🚢 Ship the capstone (W11) → 🎁 BIG reward: `__________________`
**XP log:**
<table header-row="true">
<tr>
<td>Week</td>
<td>1</td>
<td>2</td>
<td>3</td>
<td>4</td>
<td>5</td>
<td>6</td>
<td>7</td>
<td>8</td>
<td>9–11</td>
<td>12</td>
</tr>
<tr>
<td>XP</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
</table>
## 🗺️ The 12-Week Map
- **W1–2** Production Python (build Sentinel-Lite) · **W3** DSA Core (trimmed) · **W4** Lakehouse Foundations (Iceberg)
- **W5** Spark + dbt + Governance · **W6** Distributed Systems for Data · **W7** RAG + Vector + Eval · **W8** LLMOps + Agentic + Serving
- **W9–11** Capstone: AI-Ready Lakehouse · **W12** Mocks + Outreach
## 🗄️ Linked pages (kept, not deleted)
<page url="https://app.notion.com/p/364e10221fac81dd81ded65176abb93b">📙 Daily Executor — Days 29–84 (continued)</page>
<page url="https://app.notion.com/p/368e10221fac81819cbcfd5c338b261c">📗 Daily Executor v2 — AI + Data + Lakehouse Engineer (Re-architected 12 Weeks)</page>
---
# 📚 Cheat Sheets (skim daily — 10-min warm-up)
<details>
<summary>🐍 Python Syntax — muscle-memory templates</summary>
	**Loops & Iteration**
	```python
for i, item in enumerate(items): ...            # with index
for a, b in zip(list_a, list_b): ...            # parallel
for key, value in d.items(): ...                # dict pairs
for item in reversed(items): ...                # reverse
for i in range(n - 1, -1, -1): ...              # n-1 down to 0
	```
	**Comprehensions**
	```python
[x * 2 for x in nums if x > 0]                  # filter + map
{x: x * 2 for x in nums}                        # dict comp
{x for x in nums}                               # set comp
	```
	**Dict / Set / Counter**
	```python
d.get(key, 0); d.setdefault(key, [])
from collections import Counter, defaultdict, deque
Counter(items).most_common(k)                   # top-k
d = defaultdict(list); d["k"].append(x)
d = defaultdict(int);  d["k"] += 1
	```
	**Sorting**
	```python
sorted(items, key=lambda x: (-x.score, x.name)) # multi-key, desc primary
items.sort()                                    # in-place
	```
	**Heap**
	```python
import heapq
heapq.heappush(heap, (priority, item))
heapq.heappop(heap)                             # smallest first
heapq.nlargest(k, items); heapq.nsmallest(k, items)
# Max-heap: negate priorities
	```
	**Strings**
	```python
s.lower(); s.upper(); s.strip(); s.split(); ",".join(words)
s.isalnum(); s.isalpha(); s.isdigit()
ord('A')  # 65;  chr(65)  # 'A';  s[::-1]  # reverse
	```
	**Production Python**
	```python
from typing import Protocol, TypeVar, Literal, Optional
from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    db_url: str
    retry_max: int = 3
from tenacity import retry, stop_after_attempt, wait_exponential
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1))
def fragile_call(): ...
import asyncio
async def fetch_all(urls):
    return await asyncio.gather(*(fetch(u) for u in urls))
	```
</details>
<details>
<summary>📊 SQL Patterns — window functions, joins, plans</summary>
	**Window functions**
	```sql
ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn
RANK()       OVER (PARTITION BY dept ORDER BY salary DESC)
DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)
SUM(amount) OVER (PARTITION BY user_id ORDER BY ts ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
LAG(price, 1)  OVER (ORDER BY ts)
LEAD(price, 1) OVER (ORDER BY ts)
	```
	**Top-N per group**
	```sql
WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) rn FROM employees
) SELECT * FROM ranked WHERE rn <= 3;
	```
	**Recursive CTE (hierarchy)**
	```sql
WITH RECURSIVE hierarchy AS (
  SELECT id, manager_id, 1 AS depth FROM employees WHERE id = ?
  UNION ALL
  SELECT e.id, e.manager_id, h.depth + 1 FROM employees e JOIN hierarchy h ON e.id = h.manager_id
) SELECT * FROM hierarchy;
	```
	**Joins:** INNER (matches only) · LEFT (all left + NULLs) · FULL OUTER · CROSS (date-spine fills) · **Anti-join** `NOT EXISTS` / `LEFT JOIN ... WHERE r.id IS NULL` (the orphan-detection pattern).
	**Plan operators:** Nested Loop (small outer + indexed inner) · Hash Join (large, no index) · Merge Join (both sorted on key) · Index Seek (good) vs Scan (bad unless tiny).
	**Isolation:** READ UNCOMMITTED (dirty) · READ COMMITTED (default) · RCSI (row versioning — use for OLTP at scale) · REPEATABLE READ · SERIALIZABLE (range locks) · SNAPSHOT.
	**Indexing:** clustered = narrow + ever-increasing; non-clustered with INCLUDE for covering; WHERE/JOIN cols first; filtered indexes for skewed predicates.
	**CDC (a common source of production pain):** `fn_cdc_get_all_changes` (preserves history) vs `fn_cdc_get_net_changes` (collapses) · LSN window via `sys.fn_cdc_get_min/max_lsn` · bypass channel = a dbo table recording intent so the merge proc finds deletes even after CDC collapses.
</details>
<details>
<summary>⏱️ Complexity Cheat Table</summary>
	<table header-row="true">
<tr>
<td>Pattern</td>
<td>Time</td>
<td>Space</td>
<td>Why</td>
</tr>
<tr>
<td>Hashmap one-pass</td>
<td>O(n)</td>
<td>O(n)</td>
<td>dict ≤ n</td>
</tr>
<tr>
<td>Two pointers (sorted)</td>
<td>O(n)</td>
<td>O(1)</td>
<td>no extra structure</td>
</tr>
<tr>
<td>Sliding window</td>
<td>O(n)</td>
<td>O(k)</td>
<td>window holds k</td>
</tr>
<tr>
<td>Sort then scan</td>
<td>O(n log n)</td>
<td>O(n)</td>
<td>sort dominates</td>
</tr>
<tr>
<td>Heap top-k</td>
<td>O(n log k)</td>
<td>O(k)</td>
<td>heap size k</td>
</tr>
<tr>
<td>BFS/DFS graph</td>
<td>O(V+E)</td>
<td>O(V)</td>
<td>visited set</td>
</tr>
<tr>
<td>Binary search</td>
<td>O(log n)</td>
<td>O(1)</td>
<td>halve each step</td>
</tr>
<tr>
<td>Tree traversal</td>
<td>O(n)</td>
<td>O(h)</td>
<td>h = height</td>
</tr>
<tr>
<td>DP 1D</td>
<td>O(n)</td>
<td>O(n)/O(1)</td>
<td>rolling state</td>
</tr>
<tr>
<td>DP 2D</td>
<td>O(m·n)</td>
<td>O(m·n)</td>
<td>table</td>
</tr>
<tr>
<td>Topo sort (Kahn)</td>
<td>O(V+E)</td>
<td>O(V)</td>
<td>indegree queue</td>
</tr>
<tr>
<td>Dijkstra (heap)</td>
<td>O((V+E) log V)</td>
<td>O(V)</td>
<td>heap of distances</td>
</tr>
<tr>
<td>Union-Find</td>
<td>O(α(n))/op</td>
<td>O(n)</td>
<td>near-constant</td>
</tr>
	</table>
</details>
<details>
<summary>🏛️ HLD Concepts</summary>
	**Scale axes:** throughput (RPS) · latency (p50/p99/p999) · storage (GB/day) · durability (RPO) & availability (RTO, SLO 9s) · consistency model.
	**Consistency:** CAP (under partition choose C or A); PACELC (else: latency vs consistency). Linearizable \> sequential \> causal \> eventual. SI allows write-skew; serializable doesn't.
	**Replication:** leader-follower (sync = strong/lower-availability, async = stale reads) · leaderless quorum (R+W\>N) · multi-leader (conflicts → CRDT/LWW).
	**Partitioning:** hash (even, no range) · range (scans, hot ranges) · composite · consistent hashing (minimal movement on resize) · hot-partition fix = salt the key.
	**Caching:** cache-aside (most common) · write-through · write-back · eviction LRU/LFU/TTL · stampede → locks/coalescing/early expiration.
	**Streaming:** at-most-once / at-least-once (needs idempotency) / exactly-once (idempotency keys + tx + dedup) · backpressure = bounded queue or pull-based.
	**Reliability:** idempotency keys · transactional outbox · circuit breaker (closed→open→half-open) · bulkhead · DLQ + replay · saga.
	**DDIA map:** Ch5 Replication · Ch6 Partitioning · Ch7 Transactions · Ch8 Trouble · Ch9 Consensus · Ch11 Stream processing.
</details>
<details>
<summary>🧩 LLD Concepts</summary>
	**SOLID:** SRP (one reason to change) · Open/closed · Liskov · Interface-segregation · Dependency-inversion (inject abstractions).
	**Patterns:** Strategy (swappable algorithm — your fraud model) · Factory · Builder · Observer (pub/sub = Kafka) · Decorator (`@retry`, `@cache`) · Adapter · Chain of Responsibility · Repository · Unit of Work.
	**OOD template:** clarify scope → nouns=classes → verbs=methods → relationships (composition vs inheritance) → interfaces first → walk one flow → extension points.
	**Python OOD:** `Protocol` over ABC · `@dataclass(frozen=True)` for value objects · `__slots__` for memory · composition over inheritance.
</details>
<details>
<summary>🗣️ Interview Frameworks</summary>
	**Coding talk-track (9 steps):** restate → clarify edges → brute force + complexity → name bottleneck + the change → confirm → code while narrating → trace example → edge cases → scale follow-up.
	**System design (Hello Interview, \~7 min/phase):** requirements (functional + non-functional) → core entities → API → high-level design → deep dives (where you earn the offer) → tradeoffs.
	**STAR:** Situation 15s · Task 10s · Action 45s · Result-with-metric 20s.
	**Save phrases when stuck:** "let me think out loud about why this is hard" · "can I try a small example by hand" · "brute force first, then optimize" · "there's a tradeoff here — let me name both options."
</details>
---
# 🛠️ Resource Library (bookmark once — use always)
<details>
<summary>🎮 Interactive / gamified — learn by building</summary>
	- **CodeCrafters** — [codecrafters.io](https://codecrafters.io) — *build your own Redis / Git / SQLite / Docker / interpreter* in Python, step by step, tests gate each stage. The closest thing to "implement the technique to prove you learned it." **Use for:** distributed-systems + systems depth (W6), and to make Python reflexive.
	- [**Boot.dev**](http://Boot.dev) — [boot.dev](https://www.boot.dev) — a literally gamified backend course (XP, levels, achievements, streaks) covering Python, data structures, SQL, web servers. **Use for:** W1–3 Python + DSA + SQL warmups in a game loop.
	- **Exercism (Python track)** — [exercism.org/tracks/python](https://exercism.org/tracks/python) — free, mentored, hundreds of small exercises with feedback. **Use for:** drilling each W1–2 concept until reflex.
	- **CS50P — Intro to Programming with Python** (Harvard, free) — [cs50.harvard.edu/python](https://cs50.harvard.edu/python/) — gamified problem sets + check50 autograder. **Use for:** filling any Python fundamentals gaps fast.
</details>
<details>
<summary>📖 Books — chapters that pay rent</summary>
	- **Designing Data-Intensive Applications** (Kleppmann) — Ch 5 Replication · 6 Partitioning · 7 Transactions · 8 Trouble · 9 Consensus · 11 Stream Processing. The single most-asked-about book for data/infra interviews.
	- **System Design Interview vol 1 & 2** (Alex Xu) — URL shortener, news feed, chat are most-asked.
	- **The Pragmatic Programmer** — production sensibilities.
	- *(Optional)* **Database Internals** (Petrov) — storage engines & B-trees, deeper than DDIA.
</details>
<details>
<summary>🎥 Video Channels</summary>
	- **NeetCode** — [neetcode.io/roadmap](https://neetcode.io/roadmap) — pattern-based DSA.
	- **Hello Interview** (Evan King) — [hellointerview.com](https://hellointerview.com) — best free system-design + LLD resource.
	- **ByteByteGo** (Alex Xu) — illustrated system design.
	- **Jordan Has No Life** — DDIA chapter walkthroughs.
	- **Tushar Roy** — dynamic programming. **Abdul Bari** — algorithms/graphs.
</details>
<details>
<summary>🎯 Practice Platforms</summary>
	- **LeetCode** — [SQL 50](https://leetcode.com/studyplan/top-sql-50/) · [Top Interview 150](https://leetcode.com/studyplan/top-interview-150/) · [company-tagged lists](https://leetcode.com/company_list/) — filter to your target firms
	- **Sean Prashad's Patterns** — [seanprashad.com/leetcode-patterns](https://seanprashad.com/leetcode-patterns/) — 178 problems by pattern, filter by company. Your problem source-of-truth.
	- **DataLemur** (SQL) — [datalemur.com](https://datalemur.com) · **StrataScratch** — real company SQL tags.
	- **Pramp / **[**interviewing.io**](http://interviewing.io) — mock interviews (W12 daily).
</details>
<details>
<summary>👩‍💻 Real Engineer References</summary>
	- **Sean Prashad** — [github.com/seanprashad/leetcode-patterns](https://github.com/seanprashad/leetcode-patterns).
	- **Evan King + Stefan Mai** — [hellointerview.com](http://hellointerview.com) (ran 500+ FAANG interviews).
	- **Your target firm's public tech stack** — most large engineering orgs open-source part of their data platform or write about it. Find the repo or the engineering blog for the team you are interviewing with and read it; almost no candidate does, and it turns "why us?" into a real conversation.
	- **Eng blogs:** Stripe (idempotency/ledgers) · Netflix (fault tolerance/observability) · Uber (real-time data) — then the engineering blog of whichever firm you are interviewing with. Most large data teams publish one, and almost no candidate reads it.
</details>
---
# 📅 Week 1 — Production Python: from "I know syntax" to "I ship services"
> **Phase goal:** turn Python knowledge into production instinct. Daily output: one more layer of **Sentinel-Lite** (ingest → detect mismatches vs source-of-truth → auto-remediate). 🎮 **Save rule:** end each day with `git commit -m "day N: <what you built>"` — that's your checkpoint. A day is *cleared* when its tests pass.
## Day 1 — The Type System 🎮 Level 1
> 🎯 **Cutoff target:** `mypy --strict sentinel/models.py` passes with 0 errors, and you can defend TypedDict vs Protocol vs plain annotation out loud.
**📖 The concept (what & why engineers use it).** Type hints + a static checker (mypy) let a team catch shape/contract bugs *before* runtime — the Python equivalent of column types + constraints on a SQL table. Engineers reach for this constantly because untyped Python rots fast on a team: nobody knows what a function actually accepts. On data/AI-infra teams, `mypy --strict` in CI is table stakes, and typed code is the difference between junior- and senior-looking Python.
**🔀 Alternatives & when to pick them.**
- `TypedDict` — when data travels as a **dict** (JSON, row records). Lightweight, no class needed.
- `Protocol` — when you care **what an object can do**, not what it is (structural typing). Pick over ABCs when you don't control the implementing classes.
- Plain annotation (`x: int`) — the default; use when you already know the exact concrete type.
- `dataclass`/`Pydantic` (later days) — when you want a real object / runtime validation.
**🚧 Roadblock → fix.** The classic wall: `mypy --strict` floods you with `error: Function is missing a type annotation` and `Need type annotation for...`. Beginners disable strict; engineers instead annotate incrementally and use `reveal_type(x)` to see what mypy infers, plus `# type: ignore[code]` *sparingly* on genuinely untypeable third-party calls. The fix is precision, not surrender.
**💡 Key ideas / hints.**
- `Literal["A","B"]` pins a value to an exact set — kills typo bugs a bare `str` allows.
- `X | None` (3.10+) is the modern `Optional[X]`.
- Hints describe intent; `mypy --strict` is the gate that fails loud.
**📚 Read (what + how).**
- [Real Python: Type Checking](https://realpython.com/python-type-checking/) §1–5 — **extract:** how mypy runs, what `--strict` adds.
- [PEP 544 (Protocols)](https://peps.python.org/pep-0544/) — intro + first example — **extract:** why structural typing beats ABCs.
**🎮 Build & save progress (the real test).** In `sentinel/models.py`: a `Record` TypedDict (`key`, `amount`, `version`, `updated_at`); `MismatchKind = Literal["MISSING","EXTRA","DIVERGENT"]`; a `Fetcher` Protocol with `fetch(keys) -> list[Record]`; typed stubs for `detect(...)` and `load_truth(...)`. Run `mypy --strict` until clean, then **commit** (`day1: typed domain model`). 🕹️ **Arcade drill:** Exercism Python "Guido's Gorgeous Lasagna" + "Tisbury Treasure Hunt" to warm the syntax.
**🧮 SQL reps:**
- [x] [LC 175 — Combine Two Tables](https://leetcode.com/problems/combine-two-tables/)
- [x] [LC 181 — Employees Earning More Than Managers](https://leetcode.com/problems/employees-earning-more-than-their-managers/)
**✅ Done when:**
- [x] `mypy --strict sentinel/models.py` → 0 errors
- [x] [models.py](http://models.py) has Record, MismatchKind, Fetcher + 2 typed stubs
- [x] both SQL reps accepted
- [x] committed ✅ checkpoint
**🏆 Reward:** read `+30` · build `+50` · SQL `+20` · recall `+25` · perfect-day `+25` = **150 XP**. Extend streak 🔥.
**🔁 Recall (boss check, book closed):**
- [x] One line each: when do you reach for TypedDict vs Protocol vs a plain annotation?
- [x] Why does `Literal[...]` beat `str` for MismatchKind — what exact bug does it stop?
## Day 2 — Pydantic v2 + Settings 🎮 Level 2
> 🎯 **Cutoff target:** Sentinel-Lite refuses to start on a bad config — fails loud at startup, not mid-run.
**📖 The concept (what & why engineers use it).** Pydantic validates and coerces data at **runtime** — it's the bouncer at your program's front door. Engineers use it *everywhere* untrusted data enters: API request bodies (it's the core of FastAPI), config/settings, external feeds, LLM/tool outputs. Why so popular: you declare a model once and get parsing, validation, coercion, and clear errors for free, instead of hand-writing `if not isinstance(...)` checks. `BaseSettings` does the same for env vars/config.
**🔀 Alternatives & when to pick them.**
- **Pydantic** — runtime validation at I/O boundaries (the default choice today). Pick when data is untrusted.
- **dataclasses** (Day 3) — internal value objects you already trust; no validation overhead.
- **TypedDict** — static-only hints for dict-shaped data; zero runtime cost, zero runtime safety.
- **attrs / marshmallow** — older ecosystems; Pydantic v2 (Rust core) is faster and now the default for new work.
**🚧 Roadblock → fix.** The big one migrating to v2: validators changed. People hit `@validator is deprecated` and confusing `ValidationError`s. The fix the community reaches for: use `@field_validator` (v2 name) and `model_config = ConfigDict(...)` instead of the old `class Config`, and read the error's `.errors()` list — it tells you exactly which field and rule failed. Second gotcha: Pydantic *coerces* (`"5"` → `5`) which can hide bugs; use `Strict` types when you want hard rejection.
**💡 Key ideas / hints.**
- `BaseSettings` auto-loads from env vars / `.env`.
- Fail-fast: validate everything you depend on *before* doing real work.
- TypedDict vs Pydantic = static-only hint vs runtime-enforced. Use both, in their lanes (internal vs boundary).
**📚 Read (what + how).**
- [Pydantic v2 — Models](https://docs.pydantic.dev/latest/concepts/models/) — **extract:** validation/coercion + `field_validator`.
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) — **extract:** BaseSettings + `.env`.
**🎮 Build & save progress (the real test).** `sentinel/config.py`: `Settings(BaseSettings)` with `source_dsn`, `truth_dsn`, `batch_size=500`, `retry_max=3`, `quarantine_path`; a `@field_validator` checking DSN prefixes + `batch_size > 0`; a Pydantic `RecordModel` (the validated twin of Day 1's TypedDict). Commit `.env.example`. **Commit** (`day2: validated config + boundary model`). 🕹️ **Arcade drill:** [Boot.dev](http://Boot.dev) "Learn Python" validation/exception lessons if you want a gamified rep.
**🧮 SQL reps:**
- [x] [LC 1075 — Project Employees I](https://leetcode.com/problems/project-employees-i/)
- [x] [LC 1731 — Employees Report Count](https://leetcode.com/problems/the-number-of-employees-which-report-to-each-employee/)
**✅ Done when:**
- [x] bad DSN → clear validation error at startup
- [x] RecordModel accepts a good record, rejects a malformed one
- [x] `.env.example` committed ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [x] Which validates at runtime — TypedDict or Pydantic? Where does each belong in Sentinel-Lite?
- [x] Why validate config at startup vs first use — name the failure it prevents.
## Day 3 — Dataclasses, `__slots__`, frozen 🎮 Level 3
> 🎯 **Cutoff target:** Sentinel-Lite's internal value objects are frozen+slots dataclasses, and you can state the memory win.
**📖 The concept (what & why engineers use it).** Dataclasses generate the boilerplate (`__init__`, `__repr__`, `__eq__`) for data-holding objects. Engineers use them for **internal value objects** — the records, results, and configs that flow through a system. `frozen=True` makes them immutable (safe to share, hashable, no spooky mutation); `slots=True` drops the per-instance `__dict__`, cutting memory and speeding attribute access — which matters a lot when you hold millions of them.
**🔀 Alternatives & when to pick them.**
- **dataclass** — the default for internal objects.
- **Pydantic model** — when you need runtime validation (boundary). Heavier; don't use for hot internal objects.
- **NamedTuple** — immutable + tuple-like + lightweight; pick when you want positional/iterable access.
- **plain dict / TypedDict** — when you genuinely just need a bag of keys and don't want a type.
**🚧 Roadblock → fix.** Two classic walls: (1) mutable default args — `field: list = []` raises `ValueError: mutable default`; the fix is `field: list = field(default_factory=list)`. (2) Wanting both `frozen=True` and a computed field — you can't just assign in `__post_init__` on a frozen instance; the community fix is `object.__setattr__(self, "name", value)` inside `__post_init__`, or compute it as a `@property`.
**💡 Key ideas / hints.**
- `@dataclass(frozen=True, slots=True)` = immutable + memory-tight.
- `__post_init__` validates invariants at construction.
- The five shape tools now in hand: TypedDict (static dict) · dataclass (object) · Pydantic (validated) · NamedTuple (immutable tuple) · Protocol (interface).
**📚 Read (what + how).**
- [Real Python: Data Classes](https://realpython.com/python-data-classes/) — **extract:** field options, frozen, default_factory.
- [`__slots__`](https://docs.python.org/3/reference/datamodel.html#slots)[ reference](https://docs.python.org/3/reference/datamodel.html#slots) — **extract:** the memory / no-`__dict__` tradeoff.
**🎮 Build & save progress (the real test).** Add `@dataclass(frozen=True, slots=True)` objects: `Mismatch(key, kind, source_val, truth_val)` and `RemediationReport(attempted, fixed, quarantined)`. Replace Day 1's tuple return with `Mismatch`. `__post_init__` asserts `kind` is valid. Benchmark frozen+slots vs plain class with `timeit` + `sys.getsizeof`; write the delta in a comment. **Commit** (`day3: frozen value objects`).
**🧮 SQL reps:**
- [x] [LC 184 — Department Highest Salary](https://leetcode.com/problems/department-highest-salary/)
- [x] [LC 185 — Department Top Three Salaries](https://leetcode.com/problems/department-top-three-salaries/) (hard)
**✅ Done when:**
- [x] Mismatch + RemediationReport are frozen+slots
- [x] mutating a frozen instance raises; `__post_init__` rejects bad kind
- [x] memory delta recorded ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [x] From memory: TypedDict vs dataclass vs Pydantic vs NamedTuple vs Protocol — which validate at runtime? which are mutable? where does each live in Sentinel-Lite?
- [x] When does `slots=True` actually matter?
## Day 4 — OOP design: SOLID + Protocols 🎮 Level 4
> 🎯 **Cutoff target:** swappable `Detector` + `Remediator` interfaces wired into an orchestrator via constructor injection — add a 3rd detector without touching the orchestrator.
**📖 The concept (what & why engineers use it).** SOLID is the shared vocabulary engineers use to justify design in reviews and interviews. The two that earn their keep daily: **Single Responsibility** (one reason to change per class) and **Dependency Inversion** (depend on abstractions, inject the concretes). In Python you express the interface with `Protocol`. Why it matters: it's what lets a system grow — new behavior = new class, not edits to existing code (Open/Closed).
**🔀 Alternatives & when to pick them.**
- **Protocol** — structural interface, no inheritance required. Default in modern Python.
- **ABC (abstractmethod)** — nominal interface; pick when you want to *share* base implementation or force explicit subclassing.
- **Duck typing, no interface** — fine for tiny scripts; doesn't scale to a team or a checker.
**🚧 Roadblock → fix.** The wall: people reach for **inheritance** to share code and end up with fragile deep hierarchies (the classic "banana → gorilla → jungle" problem — you wanted one method, you got the world). The fix the field settled on: **composition over inheritance** + dependency injection — pass collaborators in, don't subclass to get them. Second gotcha: over-abstracting too early; add the interface when you have *two* implementations, not before.
**💡 Key ideas / hints.**
- DI = pass collaborators via the constructor; don't `new` them inside.
- Open/closed in practice: new detector = new class implementing the Protocol, zero orchestrator edits.
**📚 Read (what + how).**
- [Hello Interview — OOP fundamentals](https://www.hellointerview.com/learn/code-design/in-a-hurry/intro-to-oop) (\~30 min) — **extract:** responsibilities + relationships.
- [Real Python: SOLID](https://realpython.com/solid-principles-python/) (\~30 min) — **extract:** SRP + DIP examples.
**🎮 Build & save progress (the real test).** Define `Detector` Protocol (`detect(source, truth) -> list[Mismatch]`) and `Remediator` Protocol (`remediate(mismatches) -> RemediationReport`). Implement `MissingRecordDetector` + `DivergentValueDetector`. Write `ReconcileOrchestrator` taking detectors + remediator by constructor. Prove extensibility: add a throwaway 3rd detector without editing the orchestrator, then delete it. **Commit** (`day4: pluggable detectors + orchestrator`).
**🧮 SQL reps:**
- [x] [LC 178 — Rank Scores](https://leetcode.com/problems/rank-scores/)
- [x] [LC 180 — Consecutive Numbers](https://leetcode.com/problems/consecutive-numbers/)
**✅ Done when:**
- [x] adding a 3rd detector required zero orchestrator edits
- [x] orchestrator gets its collaborators by injection
- [x] both SQL reps accepted ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [x] Explain SRP + DIP using your `ReconcileOrchestrator` (90s aloud).
- [x] When would you pick an ABC over a Protocol?
## Day 5 — Decorators & context managers 🎮 Level 5
> 🎯 **Cutoff target:** a working `@retry_on_transient` decorator + a `reconciliation_run(...)` context manager, both covered by passing tests.
**📖 The concept (what & why engineers use it).** Decorators wrap a function to add behavior (retry, cache, log, time, auth) **without editing its body** — the clean way to handle cross-cutting concerns. Context managers (`with ...`) guarantee setup/teardown even when exceptions fly. Engineers lean on both constantly: `@retry`, `@lru_cache`, `@app.route`, `with open(...)`, `with session.begin()`. You already think this way in SQL — a transaction is a context manager around statements.
**🔀 Alternatives & when to pick them.**
- **Decorator** — behavior that wraps *whole functions* uniformly (retry/cache/log).
- **Context manager** — behavior bracketing a *block* with guaranteed cleanup (resources, transactions).
- **Plain try/finally** — fine for one-off cleanup; promote to a context manager when you repeat it.
- **Middleware** (web frameworks) — when the cross-cutting concern spans requests, not functions.
**🚧 Roadblock → fix.** Two classic walls: (1) a decorator clobbers the wrapped function's name/docstring → tooling and tracebacks get confusing. Fix: `@functools.wraps(fn)` on the wrapper. (2) Writing a *parameterized* decorator and getting lost in the nesting (`TypeError: got multiple values`). Fix: remember it's **three layers** — `args → decorator(fn) → wrapper(*a, **kw)` — and write them outside-in.
**💡 Key ideas / hints.**
- `@contextmanager` turns a generator into a context manager: pre-`yield` = setup, post = teardown; wrap in try/finally for rollback.
- Retry only on *transient* errors (define your own `TransientError`) — never blanket-retry.
**📚 Read (what + how).**
- [Real Python: Decorators](https://realpython.com/primer-on-python-decorators/) §1–6 — **extract:** the 3-layer nesting + `wraps`.
- [contextlib docs](https://docs.python.org/3/library/contextlib.html) — **extract:** `@contextmanager`, `ExitStack`.
**🎮 Build & save progress (the real test).** Write `@retry_on_transient(max_attempts=3, base_delay=0.1)` (exponential backoff, only `TransientError`). Write `@contextmanager reconciliation_run(store)` — opens a run, commits on success, rolls back + quarantines on exception. Test both with a fake store that raises on first call. **Commit** (`day5: retry + run context manager`).
**🧮 SQL reps:**
- [x] [LC 196 — Delete Duplicate Emails](https://leetcode.com/problems/delete-duplicate-emails/)
- [x] [LC 197 — Rising Temperature](https://leetcode.com/problems/rising-temperature/)
**✅ Done when:**
- [x] retry decorator retries exactly 3× on TransientError, re-raises after, ignores other errors
- [x] context manager rolls back + quarantines on exception
- [x] tests green ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [x] Walk through the 3-layer nesting of `@decorator(args)` from memory.
- [x] What does the context manager guarantee that a bare try/except wouldn't?
## Day 6 — Generators, iterators, `itertools` 🎮 Level 6
> 🎯 **Cutoff target:** Sentinel-Lite streams its feed row-by-row — provably holds \~one record in memory, not the whole file.
**📖 The concept (what & why engineers use it).** A generator `yield`s items lazily — one at a time — instead of building a giant list. This is *the* data-engineering pattern: bounded memory regardless of input size, plus natural backpressure (the consumer pulls when ready). Engineers use generators for streaming files, paging APIs, and pipeline stages; `itertools` gives composable building blocks (`chain`, `groupby`, `islice`, `batched`).
**🔀 Alternatives & when to pick them.**
- **Generator / iterator** — streaming, large or infinite data, bounded memory. Default for feeds.
- **List comprehension** — when the data is small and you need it all in memory (random access, multiple passes).
- **Pandas/Polars/Arrow** (later) — columnar batch analytics; pick when you want vectorized ops over generators' row-at-a-time.
**🚧 Roadblock → fix.** The classic trap: a generator is **single-use** — iterate it twice and the second loop is silently empty (`for x in gen` then `len(list(gen)) == 0`). Beginners burn hours here. The fix: materialize with `list(gen)` if you need multiple passes, or use `itertools.tee` for limited re-iteration — and know that consuming it is destructive by design.
**💡 Key ideas / hints.**
- `itertools.batched` (3.12+) re-chunks a stream into fixed batches.
- `groupby` on a *sorted* stream = SQL-style aggregation without loading all rows.
- Pull-based iteration *is* backpressure — the consumer sets the pace.
**📚 Read (what + how).**
- [Real Python: Generators](https://realpython.com/introduction-to-python-generators/) — **extract:** lazy eval + memory profile.
- [itertools docs](https://docs.python.org/3/library/itertools.html) — **extract:** `chain`, `groupby`, `islice`, `batched`, `tee`.
**🎮 Build & save progress (the real test).** Write `stream_records(path) -> Iterator[Record]` that yields row-by-row. Use `itertools.batched` to re-chunk into `batch_size` from config. Use `groupby` on a sorted stream to aggregate by key (mirror a SQL GROUP BY). Prove memory stays flat on a big file. **Commit** (`day6: streaming feed`). 🕹️ **Watch (optional):** [James Powell — Generators](https://www.youtube.com/watch?v=D1twn9kLmYg) (first 30 min).
**🧮 SQL reps:**
- [x] [LC 262 — Trips and Users](https://leetcode.com/problems/trips-and-users/) (hard)
**✅ Done when:**
- [x] `stream_records` provably holds \~one record (not the whole file)
- [x] batching + groupby aggregation work on the stream
- [x] SQL rep accepted ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [x] Why does streaming give backpressure "for free"? Tie it to a slow downstream consumer.
- [x] What's the single-use generator trap, and how do you work around it?
## Day 7 — Week 1 review + cheat sheet 🎮 Boss Level
> 🎯 **Cutoff target:** rebuild Week 1's whole mental model on a blank page, then verify against your code with no major gaps.
**📖 The concept (what & why).** Active recall + spaced review is how knowledge sticks — reconstructing from memory (hard, effective) beats re-reading (easy, useless). Today you also turn the week into a reusable cheat sheet: a portfolio artifact *and* your future warm-up.
**💡 The Week 1 arc.** typing → runtime validation → value objects → interfaces → cross-cutting behavior → streaming. Sentinel-Lite is now: typed models → validated config → frozen value objects → pluggable detectors/remediator → orchestrator → streaming feed.
**🎮 Build / consolidate (the real test).**
- [x] **Active recall (60 min):** blank doc — write 2 pages on everything Week 1 taught + sketch the Sentinel-Lite architecture. No peeking.
- [x] **Verify (45 min):** compare to your code; mark gaps red; re-read only the red items.
- [x] **Commit:** push `python-production-cheatsheet.md` + your Week-1 code (`day7: week1 complete`).
- [x] **Spaced SQL (30 min):** re-solve cold the hardest SQL of the week + [LC 1393 — Capital Gain/Loss](https://leetcode.com/problems/capital-gainloss/).
**✅ Done when:**
- [x] 2-page recall written before opening notes
- [x] cheat sheet + code committed
- [x] Friday retro written: what worked / what dragged / one change for Week 2 ✅ checkpoint
**🏆 Reward:** up to **150 XP** + 🏔️ **Week 1 complete** — claim your week reward. 🔥🔥
**🔁 Recall (boss check, book closed):**
- [x] No notes: name every quality/resilience layer Sentinel-Lite has so far and the failure each one defends against.
---
> ⏭️ **Week 2** (testing, mocking, property-based testing, async, the GIL, resilience, observability).
---
# 📅 Week 2 — Production Python pt.2: tests, async, resilience, observability
> **Phase goal:** make Sentinel-Lite *trustworthy* — proven by tests, resilient under failure, observable in production. By Friday you ship a real PR with tests + structured logs + metrics. 🎮 **Save rule:** same as W1 — `git commit` per day = checkpoint; a day is cleared when its tests are green.
## Day 8 — pytest: fixtures, parametrize, structure 🎮 Level 8
> 🎯 **Cutoff target:** Sentinel-Lite has a `tests/` suite that runs with `pytest -q`, uses fixtures + parametrize, and reports coverage.
**📖 The concept (what & why engineers use it).** pytest is the de-facto Python test framework. Engineers live in it because it makes the cheap-but-valuable tests trivial to write: plain `assert`, fixtures for reusable setup, and `parametrize` to run one test body across many inputs. Tests are what let you refactor without fear — the single biggest unlock for moving fast on a real codebase. On a team, "no tests" means "can't merge."
**🔀 Alternatives & when to pick them.**
- **pytest** — the default for app/library testing; rich plugin ecosystem.
- **unittest** (stdlib) — pick only when you can't add deps, or you're in a codebase already using it.
- **doctest** — tiny executable examples in docstrings; nice for docs, not a real suite.
- **fixtures vs plain setup** — use fixtures when setup is shared/expensive; a local object is fine for one test.
**🚧 Roadblock → fix.** The classic wall: tests that pass alone but fail together (or vice-versa) because of **shared state / order dependence**. The fix the community reaches for: function-scoped fixtures (fresh state per test), `tmp_path` for files, and never mutating module-level globals in tests. Second gotcha: slow suites — mark slow ones (`@pytest.mark.slow`) and keep the default run fast.
**💡 Key ideas / hints.**
- `@pytest.fixture` returns setup; `yield` in a fixture adds teardown.
- `@pytest.mark.parametrize("inp,expected", [...])` = table-driven tests.
- `conftest.py` shares fixtures across files. `pytest-cov` for coverage.
**📚 Read (what + how).**
- [pytest — Get Started](https://docs.pytest.org/en/stable/getting-started.html) + [Fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html) — **extract:** fixtures, scope, parametrize.
- [Real Python: pytest](https://realpython.com/pytest-python-testing/) — **extract:** structure + conftest.
**🎮 Build & save progress (the real test).** Add `tests/`: unit-test your `Detector`s and `Remediator` with `parametrize` covering MISSING/EXTRA/DIVERGENT; a fixture builds a small source+truth pair; assert the `RemediationReport` counts. Get coverage on the detect/remediate path. **Commit** (`day8: test suite + fixtures`). 🕹️ **Arcade drill:** [Boot.dev](http://Boot.dev) or Exercism — re-solve any 2 prior exercises *test-first*.
**🧮 SQL reps:**
- [ ] [LC 1741 — Total Time Spent by Each Employee](https://leetcode.com/problems/find-total-time-spent-by-each-employee/)
- [ ] [LC 1693 — Daily Leads and Partners](https://leetcode.com/problems/daily-leads-and-partners/)
**✅ Done when:**
- [ ] `pytest -q` green; detectors + remediator covered via parametrize
- [ ] a shared fixture builds the source/truth pair
- [ ] coverage reported ✅ checkpoint
**🏆 Reward:** read `+30` · build `+50` · SQL `+20` · recall `+25` · perfect-day `+25` = **150 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] When do you reach for a fixture vs building the object inline in the test?
- [ ] What does `parametrize` buy you over a `for` loop inside one test?
## Day 9 — Mocking, patching, freezegun 🎮 Level 9
> 🎯 **Cutoff target:** tests for Sentinel-Lite's retry + time-based logic run with **zero** real I/O and **zero** real sleeping.
**📖 The concept (what & why engineers use it).** Mocking replaces a real dependency (DB, HTTP, clock) with a controllable stand-in, so a unit test is fast, deterministic, and tests *your* logic — not the network. Engineers use it to simulate failures on demand (force a timeout to prove retry works) and to freeze time so time-based code is testable. Without mocking, you can't test the interesting failure paths.
**🔀 Alternatives & when to pick them.**
- **`unittest.mock`**** / ****`monkeypatch`** — replace a collaborator in a unit test. Default.
- **Fakes** (a tiny in-memory implementation) — pick over mocks when the collaborator is used heavily; less brittle than asserting call-by-call.
- **`responses`**** / ****`httpx`**** mock transports** — for HTTP specifically.
- **Real integration test** — pick when the *integration itself* is what you need to verify; don't mock the thing under test.
**🚧 Roadblock → fix.** The #1 mocking mistake: **patching where it's defined instead of where it's used** → your mock does nothing and you debug for an hour. The rule the community repeats: *"patch where the name is looked up."* If `module_a` does `from time import sleep`, you patch `module_a.sleep`, not `time.sleep`. Second gotcha: over-mocking until the test only tests the mock — prefer fakes when that happens.
**💡 Key ideas / hints.**
- `mocker.patch("pkg.mod.dep")` (pytest-mock) is cleaner than nested `with patch`.
- `freezegun.freeze_time(...)` pins `datetime.now()`; patch `sleep` so backoff tests are instant.
- Assert behavior (final state) over implementation (exact calls) where you can.
**📚 Read (what + how).**
- [unittest.mock](https://docs.python.org/3/library/unittest.mock.html) — **extract:** `patch`, `MagicMock`, `side_effect`.
- ["Where to patch"](https://docs.python.org/3/library/unittest.mock.html#where-to-patch) — read this whole short section — it's the gotcha-killer.
**🎮 Build & save progress (the real test).** Test Day 5's `@retry_on_transient`: a mock that raises `TransientError` twice then succeeds — assert exactly 3 calls and patched-out sleep. Use `freeze_time` to test any "as-of" logic. Add a `FakeStore` and use it instead of mocking the store call-by-call. **Commit** (`day9: deterministic failure-path tests`).
**🧮 SQL reps:**
- [ ] [LC 1934 — Confirmation Rate](https://leetcode.com/problems/confirmation-rate/)
- [ ] [LC 550 — Game Play Analysis IV](https://leetcode.com/problems/game-play-analysis-iv/)
**✅ Done when:**
- [ ] retry test proves 3 attempts with no real sleeping
- [ ] one time-dependent test uses frozen time
- [ ] FakeStore replaces call-by-call mocking on the hot path ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] State the "patch where it's used" rule and give your own example.
- [ ] When is a fake better than a mock?
## Day 10 — Property-based testing (Hypothesis) 🎮 Level 10
> 🎯 **Cutoff target:** a Hypothesis test finds (or proves the absence of) an edge case in your reconciliation logic that you didn't hand-write.
**📖 The concept (what & why engineers use it).** Instead of you picking examples, Hypothesis generates hundreds of inputs to try to break an invariant, then **shrinks** any failure to a minimal reproducer. Engineers use it on logic with a clear property — parsers, serializers, dedup/reconciliation, anything where "round-trip" or "count conservation" must hold. It finds the empty-list, the duplicate-key, the off-by-one you'd never type by hand.
**🔀 Alternatives & when to pick them.**
- **Hypothesis (property-based)** — when you can state an invariant over many inputs. Highest bug-per-line.
- **Example-based pytest** — when behavior is specific/tabular ("input X → output Y"). Use both.
- **Fuzzing** — for binary/security-sensitive parsing; heavier tooling.
**🚧 Roadblock → fix.** The wall: flaky/slow property tests, or "Hypothesis found a failure but it's actually a bad assumption in my test." Fixes the community uses: constrain inputs with the right strategies (`st.integers(min_value=...)`), use `assume(...)` to drop invalid cases, set a deadline/`max_examples` for speed, and treat a shrunk counterexample as a *gift* — add it as a permanent regression test.
**💡 Key ideas / hints.**
- Think in **invariants**: "detect then remediate ⇒ zero remaining mismatches"; "no mismatch invented or lost."
- `@given(st.lists(st.builds(Record, ...)))` generates whole record sets.
- Shrinking → you get the smallest failing case automatically.
**📚 Read (what + how).**
- [Hypothesis — Quick start](https://hypothesis.readthedocs.io/en/latest/quickstart.html) + [Strategies](https://hypothesis.readthedocs.io/en/latest/data.html) — **extract:** `@given`, core strategies, `assume`.
**🎮 Build & save progress (the real test).** Write a property: for any generated (source, truth) pair, after `orchestrator.run()` the count of remaining mismatches is 0 **and** `fixed + quarantined == attempted` (conservation). Let Hypothesis hunt. Pin any counterexample as a regression test. **Commit** (`day10: property-based reconciliation invariants`).
**🧮 SQL reps:**
- [ ] [LC 1907 — Count Salary Categories](https://leetcode.com/problems/count-salary-categories/)
- [ ] [LC 1789 — Primary Department for Each Employee](https://leetcode.com/problems/primary-department-for-each-employee/)
**✅ Done when:**
- [ ] a Hypothesis test encodes the conservation invariant
- [ ] any counterexample captured as a fixed regression test
- [ ] suite still fast (deadline/max_examples tuned) ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] When does property-based testing beat example-based? Give one invariant from Sentinel-Lite.
- [ ] What is shrinking and why does it matter?
## Day 11 — asyncio: coroutines, tasks, gather 🎮 Level 11
> 🎯 **Cutoff target:** Sentinel-Lite fetches from source + truth **concurrently** with asyncio and you can explain when async actually helps.
**📖 The concept (what & why engineers use it).** asyncio runs many I/O-bound operations concurrently on one thread by switching whenever something `await`s. Engineers use it when the bottleneck is *waiting* — network calls, DB queries, API fan-out — letting one process handle thousands of in-flight requests (it's the engine under FastAPI). The mental shift: concurrency ≠ parallelism; async overlaps *waiting*, not CPU work.
**🔀 Alternatives & when to pick them.**
- **asyncio** — many concurrent **I/O-bound** tasks (API/DB fan-out). Pick for high-concurrency services.
- **threads** — also I/O-bound; pick for blocking libraries with no async support (the GIL makes threads bad for CPU work).
- **multiprocessing** — **CPU-bound** work; sidesteps the GIL with real parallel processes.
- **sync** — simplest; pick when concurrency adds no value (one call, a script).
**🚧 Roadblock → fix.** The classic trap: calling a **blocking** function inside async code (e.g. `requests.get`, `time.sleep`) freezes the whole event loop — async "doesn't work" and nobody knows why. Fixes: use async-native libs (`httpx`, `asyncio.sleep`), or push blocking calls to `asyncio.to_thread(...)`. Second gotcha: forgetting to `await` (you get a coroutine object, not a result) — a warning the linter will flag.
**💡 Key ideas / hints.**
- `async def` defines a coroutine; `await` yields control while waiting.
- `asyncio.gather(*coros)` runs them concurrently and collects results.
- `asyncio.TaskGroup` (3.11+) is the modern, safer way to run a batch with structured cancellation.
**📚 Read (what + how).**
- [Real Python: Async IO](https://realpython.com/async-io-python/) — **extract:** event loop, coroutine vs task, gather.
- [asyncio docs — high-level API](https://docs.python.org/3/library/asyncio-task.html) — **extract:** `gather`, `TaskGroup`, `to_thread`.
**🎮 Build & save progress (the real test).** Give the `Fetcher` an `async fetch_async(keys)`; fetch source + truth concurrently with `gather`/`TaskGroup`; measure wall-clock vs sequential on simulated 100ms-latency calls. Show the speedup in a comment. **Commit** (`day11: concurrent fetch`). 🕹️ **Optional arcade:** CodeCrafters "Build your own HTTP server" (async track) if you want a deeper rep.
**🧮 SQL reps:**
- [ ] [LC 1164 — Product Price at a Given Date](https://leetcode.com/problems/product-price-at-a-given-date/)
- [ ] [LC 1204 — Last Person to Fit in the Bus](https://leetcode.com/problems/last-person-to-fit-in-the-bus/)
**✅ Done when:**
- [ ] source + truth fetched concurrently; measured speedup recorded
- [ ] no blocking call stalls the loop (async libs or `to_thread`)
- [ ] both SQL reps accepted ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Concurrency vs parallelism — which does asyncio give you, and when is it the wrong tool?
- [ ] What happens if you put `requests.get` in a coroutine, and how do you fix it?
## Day 12 — The GIL, threads vs processes 🎮 Level 12
> 🎯 **Cutoff target:** you can state, with a measured demo, when to use asyncio vs threads vs multiprocessing — and what the GIL does.
**📖 The concept (what & why engineers use it).** CPython's Global Interpreter Lock lets only one thread execute Python bytecode at a time. So threads help **I/O-bound** work (they wait outside the lock) but not **CPU-bound** work (they serialize on it); for real CPU parallelism you use processes. This is *the* most-asked Python systems question, and it directly governs how you scale Sentinel-Lite. (Note the 3.13+ free-threaded build is changing this — worth a sentence in interviews.)
**🔀 Alternatives & when to pick them.**
- **asyncio** — high-concurrency I/O, one thread, low overhead.
- **ThreadPoolExecutor** — I/O-bound work using blocking libraries.
- **ProcessPoolExecutor / multiprocessing** — CPU-bound (parsing/crunching millions of rows): real parallelism, at the cost of IPC/serialization.
- **A real distributed engine (Spark — W5)** — when data exceeds one machine.
**🚧 Roadblock → fix.** The wall everyone hits: "I added threads to speed up my number-crunching and it got *slower*." Cause: GIL contention + thread overhead on CPU work. Fix: move CPU-bound work to processes (`ProcessPoolExecutor`), keep threads for I/O. Second gotcha: multiprocessing pickling errors / huge memory from copying data — fix by passing small inputs, chunking, or shared memory.
**💡 Key ideas / hints.**
- Decision tree: I/O-bound + async libs → asyncio; I/O-bound + blocking libs → threads; CPU-bound → processes.
- `concurrent.futures` gives one API (`ThreadPoolExecutor`/`ProcessPoolExecutor`) to swap between them.
**📚 Read (what + how).**
- [Real Python: Python GIL](https://realpython.com/python-gil/) — **extract:** what it locks, why it exists.
- [Real Python: concurrency overview](https://realpython.com/python-concurrency/) — **extract:** the I/O vs CPU decision table.
**🎮 Build & save progress (the real test).** Write a CPU-bound function (hash/normalize a big batch) and a benchmark across sequential / threads / processes — confirm processes win on CPU, threads don't. Add a one-paragraph "how Sentinel-Lite would scale" note (async fetch + process pool for transforms). **Commit** (`day12: concurrency benchmark + scaling note`).
**🧮 SQL reps:**
- [ ] [LC 1321 — Restaurant Growth](https://leetcode.com/problems/restaurant-growth/)
- [ ] [LC 615 — Average Salary: Department vs Company](https://leetcode.com/problems/average-salary-departments-vs-company/)
**✅ Done when:**
- [ ] benchmark shows processes beat threads on the CPU task
- [ ] scaling note written
- [ ] both SQL reps accepted ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] In one breath: what does the GIL lock, and how does that pick asyncio vs threads vs processes?
- [ ] Why did threads make the CPU task slower?
## Day 13 — Resilience: tenacity, circuit breaker, idempotency 🎮 Level 13
> 🎯 **Cutoff target:** Sentinel-Lite survives a flapping dependency — retries with backoff, trips a circuit breaker, and re-running a batch never double-applies.
**📖 The concept (what & why engineers use it).** Production systems assume dependencies fail. The standard toolkit: **retry with exponential backoff + jitter** (ride out transient blips), **circuit breaker** (stop hammering a dead dependency — fail fast, recover gracefully), and **idempotency** (re-processing the same input is safe). Engineers bake these in because at scale, "it failed halfway and we ran it again" is a *daily* event — these patterns are what make that safe. This is squarely your "self-recovery systems" goal.
**🔀 Alternatives & when to pick them.**
- **tenacity** — declarative retry/backoff via decorator. Default over hand-rolled loops.
- **Circuit breaker** (e.g. `pybreaker`) — when a dependency can stay down; protects it from a retry storm and you from cascading latency.
- **Idempotency key + dedup** — when re-delivery is possible (almost always in distributed systems).
- **DLQ + replay** — when some items can't be processed now but shouldn't block the batch.
**🚧 Roadblock → fix.** The classic failure: **retry storms** — everything retries in lockstep and synchronized-hammers the recovering service into staying down (the "thundering herd"). Fix: **jitter** (randomize backoff) + a circuit breaker + a retry budget/cap. Second gotcha: retrying a **non-idempotent** write doubles data (anyone who has operated a CDC pipeline has met this) — fix with an idempotency key or an upsert/MERGE keyed on a natural id.
**💡 Key ideas / hints.**
- Retry **only** transient errors; never retry a validation/4xx-type error.
- Circuit breaker states: closed → (failures) open → (cooldown) half-open → closed.
- Idempotency = "apply once" semantics even under at-least-once delivery.
**📚 Read (what + how).**
- [tenacity docs](https://tenacity.readthedocs.io/en/latest/) — **extract:** `stop`, `wait`, `retry`, jitter.
- [Stripe: Idempotency](https://docs.stripe.com/api/idempotent_requests) + skim a circuit-breaker write-up — **extract:** idempotency keys, breaker states.
**🎮 Build & save progress (the real test).** Swap Day-5's hand-rolled retry for `tenacity` with exponential backoff **+ jitter**. Add a simple circuit breaker around the source fetch (open after N failures, half-open after a cooldown). Make remediation idempotent via an idempotency key per (batch, record); prove re-running a batch changes nothing. **Commit** (`day13: retries+breaker+idempotency`).
**🧮 SQL reps:**
- [ ] [LC 1174 — Immediate Food Delivery II](https://leetcode.com/problems/immediate-food-delivery-ii/)
- [ ] [LC 1045 — Customers Who Bought All Products](https://leetcode.com/problems/customers-who-bought-all-products/)
**✅ Done when:**
- [ ] retries use tenacity with backoff + jitter, transient-only
- [ ] breaker opens under sustained failure, recovers via half-open
- [ ] re-running an identical batch is a no-op (idempotent) ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Why does jitter matter — what failure does retry-without-jitter cause?
- [ ] Walk the circuit-breaker state machine and what each transition protects.
## Day 14 — Observability + ship the PR 🎮 Boss Level
> 🎯 **Cutoff target:** Sentinel-Lite emits structured logs + metrics + a trace, and you open a real PR with tests and a clear description.
**📖 The concept (what & why engineers use it).** Observability = being able to answer "what is the system doing right now and why" without redeploying. The three pillars: **structured logs** (machine-parseable events), **metrics** (counts/latencies/gauges over time → dashboards + alerts), **traces** (one request's path across components). Engineers treat this as day-one work, not an afterthought — you can't operate or auto-heal what you can't see. This is your "real-time monitoring" goal made concrete, and it sets up the capstone's Grafana dashboard.
**🔀 Alternatives & when to pick them.**
- **structlog / JSON logging** — structured events. Pick over plain `print`/string logs always in prod.
- **Prometheus client (metrics)** — pull-based counts/histograms; the standard for dashboards + alerting.
- **OpenTelemetry (traces, also logs+metrics)** — vendor-neutral tracing across services; pick when work spans components.
- **Sentry** — error aggregation specifically; complements, not replaces, the above.
**🚧 Roadblock → fix.** The classic trap: **logging everything** → noise, cost, and no signal when it matters (plus accidentally logging secrets/PII). Fixes: structured logs with levels + sampling, metrics for the high-volume "how often/how slow" questions (not a log line per record), and never log credentials. Second gotcha: high-cardinality metric labels (e.g. per-record id) blow up Prometheus — keep labels low-cardinality (kind, status), not unbounded.
**💡 Key ideas / hints.**
- Emit a structured event per run: records_in, mismatches, fixed, quarantined, duration_ms.
- Counter for mismatches by `kind`, histogram for run duration — these become capstone dashboard panels + alerts.
- Wrap a run in one OTel span with child spans for fetch/detect/remediate.
**📚 Read (what + how).**
- [structlog](https://www.structlog.org/en/stable/) — **extract:** processors, JSON renderer, bound context.
- [Prometheus Python client](https://prometheus.github.io/client_python/) + [OTel Python](https://opentelemetry.io/docs/languages/python/) — **extract:** Counter/Histogram; tracer + spans.
**🎮 Build & save progress (the real test — ship it).**
- [ ] Add structured logging (one event per run with the fields above).
- [ ] Add a `mismatches_total{kind=...}` counter + a `run_duration_seconds` histogram.
- [ ] Wrap a run in an OTel trace (fetch / detect / remediate child spans).
- [ ] Open a **real PR** on the Sentinel-Lite repo: description, before/after, test output, a screenshot of logs/metrics. **Commit/PR** (`day14: observability + ship`).
**🧮 SQL reps (spaced — keep them warm):**
- [ ] Re-solve cold the 2 hardest SQL from W1–W2
- [ ] [LC 1142 — User Activity Past 30 Days](https://leetcode.com/problems/user-activity-for-the-past-30-days-i/)
**✅ Done when:**
- [ ] one run emits structured log + metrics + a trace
- [ ] PR opened with tests passing in CI + a clear write-up
- [ ] Friday retro written: what worked / what dragged / one change for Week 3 ✅ checkpoint
**🏆 Reward:** up to **150 XP** + 🏔️ **Week 2 complete** — claim your week reward. Sentinel-Lite is now tested, resilient, and observable. 🔥🔥
**🔁 Recall (boss check, book closed):**
- [ ] Name the three pillars of observability and the question each answers.
- [ ] What's the high-cardinality-label trap, and why does it matter for metrics?
- [ ] No notes: list every resilience + quality layer Sentinel-Lite has after 2 weeks and the failure each defends against.
---
> ⏭️ **Week 3** (DSA Core — pattern recognition + thought process per pattern).
---
# 📅 Week 3 — DSA Core: pattern *recognition* (constraints → pattern → solution)
> **Phase goal:** look at a problem's wording + constraints and *know the pattern on sight*, then run a repeatable thought process to the solution. The 6 patterns behind \~80% of screens. **Hard excluded by default** (fallback: 3–4 targeted Hards only if a company is known for them).
> 🎮 **Save rule:** the "build" is *solve + narrate*. A day is cleared when you can, for each problem, **(1) name the pattern + complexity before coding, (2) explain the recognition trigger, (3) re-derive the approach out loud.** Commit solutions to a `dsa/` repo with a one-line "trigger → approach" note each.
> 🧠 **Your edge:** you already think in sets and indexes. Each pattern maps to SQL you know.
> 📌 **Reinforcement (carries into W4–W11):** the highest-frequency patterns get spaced-rep warm-ups on **Days 1/3/5/7 of every later week** — one problem, book-closed, name pattern + complexity first.
## Day 15 — Hashmaps & frequency 🎮 Level 15
> 🎯 **Cutoff target:** on each problem, say the trigger phrase that flags "hashmap," then state "O(n)/O(n)" before coding.
**📖 What the pattern IS.** A dict gives O(1) average lookup/insert. The move: replace an O(n²) "search for a matching/related element" with **one pass that remembers what it has already seen** (or counts occurrences).
**🔍 How to identify it — triggers & constraint signals.**
- Words: *"have we seen," "count / frequency / how many times," "duplicate," "anagram / grouping," "pair that sums to," "first unique."*
- Constraint signal: n is large (10⁴–10⁶) so O(n²) is too slow → you need O(n).
- Shape: "for each element, is there another element with property X?" → store what you've seen keyed by X.
**🧠 Thought process (repeatable steps).**
1. Ask: "for each item, what *related* item am I looking for?" Name it (the complement, the same key, the count).
2. Choose the key (the thing you look up) and the value (index, count, or list).
3. One pass: **check the map first** (is the thing I need already here?), **then add the current item**. Order matters — check before insert to avoid matching yourself.
4. State complexity: O(n) time, O(n) space.
> **Worked mini-example — Two Sum.** "Return indices of two numbers that add to `target`." Trigger = "two numbers that add to" → looking for a *complement*. Key = the number, value = its index. Walk the array: for `num`, the related item is `target - num`; **check** if `target - num` is in the map → if yes, return both indices; **then** store `num → index`. One pass, O(n)/O(n). The naïve nested loop is O(n²) — the map removes the inner loop.
**🔀 When to pick it vs alternatives.** Hashmap when you need existence/count by key and order doesn't matter. Need *sorted* order → sort first (O(n log n)). Keys are a small fixed range (e.g. 26 letters) → a fixed array beats a dict. Need order *and* lookup → dict preserves insertion order (3.7+).
**🚧 Roadblock → fix.** Reaching for a nested loop and timing out → store-as-you-go so the match is a lookup. `KeyError` → use `dict.get(k, default)`, `defaultdict`, or `Counter`. Matching an element with itself → check-before-insert.
**🧠 SQL bridge.** Hashmap = `GROUP BY` + hash aggregate. `Counter(items)` ≈ `SELECT item, COUNT(*) GROUP BY item`. Building a lookup dict ≈ a hash join's build phase.
**📚 Read/watch:** [NeetCode — Arrays & Hashing](https://neetcode.io/roadmap). **Tools:** `dict`, `collections.Counter`, `defaultdict`.
**🎮 Solve & narrate (the real test):**
- [ ] [Two Sum](https://leetcode.com/problems/two-sum/)
- [ ] [Group Anagrams](https://leetcode.com/problems/group-anagrams/)
- [ ] [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)
- [ ] Commit each with a "trigger → approach" note ✅ checkpoint
**🏆 Reward:** solve `+50` · narrate-trigger-aloud `+25` · all-3-cold `+25` · outreach `+20` · perfect-day `+25` = **up to \~145 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Which words in a prompt make you reach for a hashmap?
- [ ] Why check-before-insert? What bug does insert-first cause?
- [ ] When is a fixed array better than a dict?
## Day 16 — Two pointers & sliding window 🎮 Level 16
> 🎯 **Cutoff target:** on sight, classify a problem as converging-two-pointers, fast/slow, or sliding-window — and say why.
**📖 What the pattern IS.** Two indices walk a sequence with O(1) extra space instead of nested loops. **Sliding window** is the variable-width variant: expand `right` to include elements, shrink `left` to restore a constraint — built for "longest/shortest contiguous run where X."
**🔍 How to identify it — triggers & constraint signals.**
- Two pointers: *"sorted array," "pair/triplet that sums to," "is it a palindrome," "remove duplicates in place," "max area / container."*
- Sliding window: *"contiguous subarray/substring," "longest/shortest … such that," "at most K," "without repeating."*
- Fast/slow: *"cycle," "find the middle," "happy number."*
- Constraint signal: the answer is a **contiguous** run, or the array is **sorted**, and n is large → O(n) needed.
**🧠 Thought process (sliding window steps).**
1. Confirm it's contiguous + has a constraint you can test as you grow.
2. Init `left = 0`, a window aggregate (sum / count / a Counter), and `best`.
3. For each `right`: add `nums[right]` to the window.
4. `while` the window violates the constraint: remove `nums[left]`, `left += 1`.
5. The window is now valid → update `best`. (Invariant: window is always valid after the while.)
6. Complexity: each element enters and leaves once → O(n).
> **Worked mini-example — Longest Substring Without Repeating Characters.** Trigger = "longest substring … without repeating" = contiguous + constraint ("no repeats"). Window = a set/Counter of chars in `[left, right]`. Expand `right`, adding the char. If it's now a duplicate, shrink from `left` (removing chars) until the duplicate is gone — invariant restored. Record `right - left + 1` as a candidate max at each valid step. Each index moves forward only → O(n)/O(k).
**🔀 When to pick it vs alternatives.** Two pointers (converging) → sorted, find a pair/triplet. Sliding window → contiguous run under a constraint. Fast/slow → cycle / middle. If the subarray isn't contiguous or you need all-pairs → hashmap or DP instead.
**🚧 Roadblock → fix.** Off-by-one / wrong answers from mishandling **when to shrink** → use the fixed template (expand always; `while` violated, shrink; record when valid) and write the invariant as a comment. Forgetting to update the aggregate when shrinking → remove from the window exactly what you added.
**🧠 SQL bridge.** Sliding window = a running aggregate over a moving range (`SUM(x) OVER (ORDER BY t ROWS BETWEEN ...)`). Two-pointer on sorted data = a merge join.
**📚 Read/watch:** [NeetCode — Two Pointers + Sliding Window](https://neetcode.io/roadmap).
**🎮 Solve & narrate (the real test):**
- [ ] [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
- [ ] [Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
- [ ] [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
- [ ] Commit with "trigger → approach" notes ✅ checkpoint
**🏆 Reward:** up to **\~145 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Which 3 trigger-phrase families split into two-pointers vs sliding-window vs fast/slow?
- [ ] State the sliding-window template + its invariant from memory.
## Day 17 — Stacks & queues (incl. monotonic stack) 🎮 Level 17
> 🎯 **Cutoff target:** see "matching/nesting" → stack, "next greater/smaller" → monotonic stack, instantly.
**📖 What the pattern IS.** A stack (LIFO) holds "the most recent unresolved thing" — brackets, undo, call frames. A **monotonic stack** keeps its contents sorted so it can answer "next greater/smaller element" in O(n). A queue/`deque` (FIFO) drives BFS and sliding-window-max.
**🔍 How to identify it — triggers & constraint signals.**
- Stack: *"valid parentheses / balanced," "nesting," "undo," "evaluate expression," "most recent."*
- Monotonic stack: *"next greater / warmer / larger element," "days until," "previous smaller," "largest rectangle."*
- Queue/deque: *"level order," "shortest steps," "sliding window maximum."*
- Constraint signal: you'd otherwise compare each element to others to its right → O(n²); monotonic stack makes it O(n).
**🧠 Thought process (monotonic stack steps).**
1. Spot "for each element, find the next element to the right that is greater/smaller."
2. Keep a stack of **indices** whose answers aren't resolved yet.
3. For each new index `i`: `while` stack non-empty **and** `nums[i]` beats `nums[stack[-1]]` → pop, and `i` is that popped index's answer.
4. Push `i`. Anything left on the stack at the end has no answer (default 0/-1).
5. Each index pushed/popped once → O(n).
> **Worked mini-example — Daily Temperatures.** "For each day, how many days until a warmer one?" Trigger = "next warmer to the right." Looks like nested loops (O(n²)) but is monotonic-stack. Stack holds indices of days awaiting a warmer day. For day `i`: while the current temp \> temp at `stack[-1]`, pop index `j` and set `answer[j] = i - j`. Push `i`. O(n)/O(n).
**🔀 When to pick it vs alternatives.** Stack → nesting/matching/"most recent." Monotonic stack → next-greater/smaller, spans. Queue/`deque` → BFS, window-max, producer/consumer. Need random access by index → that's an array, not a stack.
**🚧 Roadblock → fix.** Not *seeing* the monotonic-stack case → pattern-match the phrase "next greater/smaller to the right," push indices, pop while beaten. Using a `list` as a queue with `.pop(0)` (O(n)) → use `collections.deque` (O(1) both ends).
**🧠 SQL bridge.** "Next greater element" ≈ `LEAD()`/`LAG()` reasoning over an ordering. Nesting ≈ a recursive CTE walking a hierarchy.
**📚 Read/watch:** [NeetCode — Stack](https://neetcode.io/roadmap). **Tools:** `list` (stack), `collections.deque` (queue).
**🎮 Solve & narrate (the real test):**
- [ ] [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)
- [ ] [Min Stack](https://leetcode.com/problems/min-stack/)
- [ ] [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
- [ ] Commit with "trigger → approach" notes ✅ checkpoint
**🏆 Reward:** up to **\~145 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] What phrase screams "monotonic stack," and do you push values or indices? Why?
- [ ] Why `deque` over `list` for a queue?
## Day 18 — Trees & graphs (DFS/BFS) 🎮 Level 18
> 🎯 **Cutoff target:** classify a problem as BFS vs DFS from its wording, then write either from muscle memory.
**📖 What the pattern IS.** Trees/graphs model hierarchy and relationships. **DFS** (deep; recursion or an explicit stack) and **BFS** (wide; a queue) are the two traversals everything builds on — paths, components, levels, ordering.
**🔍 How to identify it — triggers & constraint signals.**
- Graph/tree at all: *"grid / matrix of cells," "connected," "network," "tree," "nodes and edges," "dependencies," "regions / islands."*
- BFS specifically: *"shortest path / fewest steps"* on an **unweighted** graph, or *"level by level."*
- DFS specifically: *"does a path exist," "all paths," "explore fully," "topological / ordering," "flood fill."*
- Constraint signal: input is a grid, tree, adjacency list, or "n items with dependencies."
**🧠 Thought process (steps).**
1. Identify nodes and edges (for a grid: each cell is a node; neighbors are up/down/left/right).
2. Pick traversal: shortest-unweighted → **BFS**; existence / full exploration / ordering → **DFS**.
3. Keep a `visited` set; mark visited **when you enqueue** (BFS) or **on entry** (DFS).
4. BFS: queue, pop front, push unvisited neighbors, track depth per level. DFS: recurse (or stack), process node, recurse neighbors.
5. Complexity: O(V + E) time, O(V) space.
> **Worked mini-example — Number of Islands.** Trigger = "grid + connected regions of land." Nodes = cells; edges = 4-directional neighbors. Count = number of connected components. Loop every cell; when you hit unvisited land, increment the count and **DFS/BFS** to mark the whole island visited so you don't recount it. Each cell visited once → O(rows·cols).
**🔀 When to pick it vs alternatives.** BFS → shortest unweighted path, level-order. DFS → path existence, full exploration, topo sort, backtracking. Weighted shortest path → Dijkstra (heap, W6). Connectivity under unions → Union-Find. DAG cycle detection → DFS colors or Kahn's topo sort.
**🚧 Roadblock → fix.** Infinite loop / re-processing → you forgot `visited`, or marked it too late (mark on enqueue/entry). Recursion depth blowup on deep input → convert DFS to an explicit stack. Picking the wrong traversal → "shortest" on unweighted = BFS, reflexively.
**🧠 SQL bridge.** DAG traversal = dbt/Dagster dependency order. Recursive CTE = DFS/BFS over a hierarchy. "Number of Islands" = connected components.
**📚 Read/watch:** [NeetCode — Trees + Graphs](https://neetcode.io/roadmap).
**🎮 Solve & narrate (the real test):**
- [ ] [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/)
- [ ] [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)
- [ ] [Number of Islands](https://leetcode.com/problems/number-of-islands/)
- [ ] Commit with "trigger → approach" notes ✅ checkpoint
**🏆 Reward:** up to **\~145 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Which wording sends you to BFS vs DFS? Give the reflex rule for "shortest."
- [ ] Where does `visited` get marked in BFS, and what breaks if it's late?
## Day 19 — Binary search (incl. on the answer) 🎮 Level 19
> 🎯 **Cutoff target:** recognize plain binary search *and* "binary-search-the-answer," and write one bug-free template.
**📖 What the pattern IS.** Halve a **sorted or monotonic** space each step → O(log n). The senior move is "search the answer": when feasibility of a candidate value is **monotonic** (if X works, anything bigger works), binary-search the value range itself.
**🔍 How to identify it — triggers & constraint signals.**
- Plain: *"sorted array," "find target / position," "rotated sorted."*
- On the answer: *"minimum/maximum value such that …," "smallest capacity / speed / days to …,"* and you can write a yes/no `feasible(x)` test that's monotonic.
- Constraint signal: huge value range (e.g. 1…10⁹) but a cheap feasibility check → O(log(range)·check).
**🧠 Thought process (search-the-answer steps).**
1. Define `feasible(x)` returning True/False, and confirm it's monotonic (False…False, True…True).
2. Set `lo`/`hi` to the value range bounds.
3. `while lo < hi: mid = (lo + hi)//2; if feasible(mid): hi = mid else: lo = mid + 1`.
4. `lo` is the boundary — the smallest feasible value.
5. Complexity: O(log(range) × cost of `feasible`).
> **Worked mini-example — Koko Eating Bananas.** "Min eating speed to finish in H hours." Trigger = "minimum speed such that … within a limit." `feasible(speed)` = total hours at that speed ≤ H — monotonic (faster always finishes sooner). Binary-search speed in `[1, max(pile)]`; keep the smallest feasible. The *array* isn't what's sorted — the *answer space* is monotonic. That recognition is the whole point.
**🔀 When to pick it vs alternatives.** Sorted data + lookup → plain binary search. Monotonic predicate over a numeric range → search the answer. Repeated k-th smallest → heap. Unsorted single lookup → hashmap (don't sort just to search once).
**🚧 Roadblock → fix.** Off-by-one / infinite loops → commit to **one** template (half-open `[lo, hi)`, `while lo < hi`, `mid=(lo+hi)//2`) and never improvise; use `bisect` for plain lookups. Missing that the *answer* is the monotonic thing → always ask "can I write a monotonic feasible(x)?"
**🧠 SQL bridge.** Like an index **seek** vs a scan — log-time targeted lookup instead of reading everything.
**📚 Read/watch:** [NeetCode — Binary Search](https://neetcode.io/roadmap). **Tool:** `bisect`.
**🎮 Solve & narrate (the real test):**
- [ ] [Binary Search](https://leetcode.com/problems/binary-search/)
- [ ] [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)
- [ ] [Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/)
- [ ] Commit with "trigger → approach" notes ✅ checkpoint
**🏆 Reward:** up to **\~145 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Write your single binary-search template + invariant from memory.
- [ ] What question tells you a problem is "binary search on the answer"?
## Day 20 — Heaps & intervals 🎮 Level 20
> 🎯 **Cutoff target:** see "top-k / k-th / streaming min-max" → heap, and "intervals / scheduling" → sort-by-start sweep.
**📖 What the pattern IS.** A heap (priority queue) gives O(log n) push/pop with O(1) peek at the min — for "k largest," "merge k sorted," running median. **Interval** problems (merge/overlap/scheduling) start with "sort by start, then sweep," often with a min-heap of end-times.
**🔍 How to identify it — triggers & constraint signals.**
- Heap: *"top K," "k-th largest/smallest," "K closest," "merge K sorted," "running/median," "schedule by priority."*
- Intervals: *"merge overlapping," "meeting rooms," "can attend all," "minimum number of … to cover," "\[start, end\] pairs."*
- Constraint signal (heap): you need the best-k, not a full sort → O(n log k) beats O(n log n). Streaming data → can't sort once.
**🧠 Thought process — heap (top-k) steps.**
1. Spot "K largest/closest" → maintain a **min-heap of size K**.
2. Push each item; if `len(heap) > K`, pop the smallest.
3. The heap holds the K largest; its root is the k-th largest. O(n log k).
**🧠 Thought process — intervals steps.** Sort by start; walk; if the current interval overlaps the last kept one (`start <= prev_end`), merge (extend end); else start a new one. For "rooms needed," push end-times to a min-heap and pop whenever a new start ≥ the smallest end.
> **Worked mini-example — Merge Intervals.** Trigger = "merge overlapping \[start,end\]." Sort by start (the universal first move). Walk: keep `current`; if `next.start <= current.end` they overlap → `current.end = max(current.end, next.end)`; else push `current` and set `current = next`. Sort dominates → O(n log n).
**🔀 When to pick it vs alternatives.** Heap → top-k / k-th / streaming min-max / k-way merge. Full sort → when you need *everything* ordered. Intervals → sort + sweep; min-heap of ends for resource-count.
**🚧 Roadblock → fix.** `heapq` is **min-heap only** → push **negated** values for a max-heap; push `(priority, tiebreaker, item)` tuples so comparisons never blow up on un-orderable objects. Intervals: forgetting to sort first, or fumbling touching intervals → sort by start and decide `<` vs `<=` explicitly.
**🧠 SQL bridge.** Top-k heap ≈ `ORDER BY … LIMIT k` (but streaming). K-way merge ≈ merging sorted partitions. Intervals ≈ time-range reconciliation — exactly your TimeAllocations/TimePunches overlap logic.
**📚 Read/watch:** [NeetCode — Heap/Priority Queue + Intervals](https://neetcode.io/roadmap). **Tool:** `heapq`.
**🎮 Solve & narrate (the real test):**
- [ ] [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/)
- [ ] [Merge Intervals](https://leetcode.com/problems/merge-intervals/)
- [ ] [Task Scheduler](https://leetcode.com/problems/task-scheduler/) *(free; Meeting Rooms II is Premium — use this or a free Meeting-Rooms mirror)*
- [ ] Commit with "trigger → approach" notes ✅ checkpoint
**🏆 Reward:** up to **\~145 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] How do you fake a max-heap with `heapq`, and why the tuple tiebreaker?
- [ ] Universal first step on any interval problem? How do you decide overlap?
## Day 21 — Mixed timed set + retro 🎮 Boss Level
> 🎯 **Cutoff target:** with the pattern *hidden*, name it + complexity within 60s and solve 3–4 mediums; every pattern sits at 🟢.
**📖 Why today.** Real screens don't label the pattern. Today trains the actual skill — *recognition under pressure* — and audits which patterns are shaky.
**🎮 The arena (the real test):**
- [ ] 3–4 **random** mediums (mixed patterns; [NeetCode 150](https://neetcode.io/practice) or [Sean Prashad list](https://seanprashad.com/leetcode-patterns/)). 25 min each, **talk aloud**, name the **recognition trigger** + pattern + complexity *before* coding.
- [ ] **Adversarial rep:** on ≥1, state brute force → bottleneck → optimization out loud before writing.
- [ ] Commit solutions ✅ checkpoint
**🔁 Cumulative recall (no notes) — the audit:**
- [ ] For all 6 patterns: write the **trigger phrase → pattern → approach → complexity**. Mark each 🟢/🟡/🔴.
- [ ] Any 🟡/🔴 → schedule into the W4–W11 Day-1/3/5/7 warm-ups + drop in the Concept Ledger.
**🏆 Reward:** up to **150 XP** + 🏔️ **Week 3 complete** — claim your week reward. 🔥🔥
> **🎯 Recognition cheat (also in the cheat sheets up top):** "seen before/count" → hashmap · "contiguous run under a constraint" → sliding window · "sorted pair" → two pointers · "next greater to the right" → monotonic stack · "shortest unweighted" → BFS · "path exists / explore / order" → DFS · "min/max value such that (monotonic)" → binary-search-the-answer · "top-k / k-th / streaming" → heap · "\[start,end\] overlap" → sort-by-start sweep. **Name the trigger out loud, every time.**
---
> ⏭️ **Week 4** (Lakehouse Foundations — Iceberg from first principles, your CDC→MERGE bridge day). DSA spaced-rep begins Days 1/3/5/7.
---
# 📅 Week 4 — Lakehouse Foundations: operate Iceberg from first principles
> **Phase goal:** don't just *read* about the lakehouse — run one. Build a public **`iceberg-lakehouse-lab`** repo whose README tells the CDC→Iceberg story (your differentiator). Stack: Apache Iceberg + PySpark + PyIceberg + MinIO (local S3) + DuckDB. 🎮 **Save rule:** each day's lab step commits to the repo; a day is cleared when the query/job runs green against MinIO.
> 🧠 **DSA stays warm this week:** Days 1/3/5/7 open with a 15–20 min **spaced-rep warm-up** — one problem, book-closed, *name the trigger + pattern + complexity before coding*. Rotating the highest-frequency patterns so they soak in.
## Day 22 — Columnar foundations (Parquet + Arrow) 🎮 Level 22
> 🎯 **Cutoff target:** convert CSV→Parquet, inspect row groups + column stats, and measure a faster column-projection scan vs CSV.
> 🔁 **DSA warm-up (hashmaps — 15 min, book closed):** [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/). Trigger "seen before" → set, O(n)/O(n). *Hashmaps are highest-frequency — re-touch first.*
**📖 The concept (what & why engineers use it).** Columnar formats (Parquet) store data by column, not row — so a query reading 2 of 50 columns touches only those, and compression is far better (similar values sit together). Arrow is the in-memory columnar standard that lets engines share data without re-serializing. This is the substrate the entire lakehouse sits on.
**🔀 Alternatives & when to pick them.** Parquet → analytics/columnar scans (lakehouse default). CSV/JSON → interchange + human-readable, never for scale. ORC → similar, Hive-world default. Avro → row-oriented, great for streaming/CDC payloads. Arrow → the in-memory layer, not a file format.
**🚧 Roadblock → fix.** Tiny-file explosion — thousands of small Parquet files kill read performance → target 128MB–1GB files, control row-group size, compact regularly (Day 27). Wrong types (timestamps as strings) defeat predicate pushdown → declare real types.
**💡 Key ideas / hints.** Row groups + column stats (min/max per chunk) enable predicate pushdown ("skip this chunk"). `pyarrow.parquet` to inspect metadata.
**📚 Read:** [Parquet docs](https://parquet.apache.org/docs/) (row groups, encodings) + [PyArrow](https://arrow.apache.org/docs/python/) — **extract:** why column pruning + pushdown make it fast.
**🎮 Build & save (the real test).** Convert a CSV → Parquet; `pyarrow` print row-group count + per-column min/max; scan one column from each and compare wall-clock. **Commit** (`day22: parquet + column stats`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] Parquet written; row groups + column stats inspected
- [ ] column-projection scan measured faster than CSV ✅ checkpoint
**🏆 Reward:** DSA `+25` · read `+30` · build `+50` · recall `+25` · perfect-day `+25` = **up to 155 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Why is Parquet faster than CSV for "SELECT 2 of 50 columns WHERE x\>k"? Name both mechanisms.
- [ ] When would you pick Avro over Parquet?
## Day 23 — Table formats & your first Iceberg table 🎮 Level 23
> 🎯 **Cutoff target:** create an Iceberg table on MinIO, write data, and trace the metadata→manifest-list→manifest→data-file tree by hand.
**📖 The concept (what & why engineers use it).** A *table format* (Iceberg) adds a metadata layer on top of Parquet files so a directory of files behaves like a real table: atomic commits, schema, snapshots, hidden partitioning. Plain "files in a folder" (Hive) can't do safe concurrent writes, time travel, or schema evolution. Iceberg is the open standard winning this space (Netflix→Apache).
**🔀 Alternatives & when to pick them.** Iceberg → open, engine-agnostic, strong evolution (your target). Delta Lake → Databricks-native. Hudi → upsert/CDC-first heritage. Plain Hive tables → legacy, avoid. (Keep a bilingual Iceberg↔Delta map — interviewers switch dialects.)
**🚧 Roadblock → fix.** The Iceberg Spark **runtime jar must match your Spark + Scala version** or you get cryptic `ClassNotFound`/catalog errors → pin the exact `iceberg-spark-runtime-<spark>_<scala>` and configure the catalog explicitly. Be deliberate about which catalog (Hadoop/REST/Glue) owns the table.
**💡 Key ideas / hints.** The tree: table metadata JSON → manifest list → manifests → data files. A snapshot points at a manifest list. Opening these by hand once makes the model click.
**📚 Read:** [Iceberg docs](https://iceberg.apache.org/docs/latest/) + [Table Spec](https://iceberg.apache.org/spec/) (just the metadata tree).
**🎮 Build & save (the real test).** Create your first Iceberg table on MinIO; write rows; open the metadata JSON + a manifest and follow the pointers to a data file. **Commit** (`day23: first iceberg table + metadata trace`).
**✅ Done when:**
- [ ] Iceberg table created on MinIO, data written
- [ ] traced metadata→manifest-list→manifest→data file by hand
- [ ] Iceberg↔Delta↔Snowflake mapping noted ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Draw the Iceberg metadata tree from memory. What does a snapshot point to?
- [ ] What can Iceberg do that a Hive directory-of-files cannot?
## Day 24 — ACID, snapshots, time travel 🎮 Level 24
> 🎯 **Cutoff target:** make 3 commits, query each snapshot by id and timestamp, roll back, and confirm.
**📖 The concept (what & why engineers use it).** Iceberg commits are atomic and create immutable **snapshots** — readers see a consistent version and you can query/roll back to any past state ("time travel"). Engineers rely on this to recover from a bad write, reproduce a report "as of" a date, and run concurrent readers/writers safely.
**🔀 Alternatives & when to pick them.** Snapshot isolation (Iceberg default) → readers unaffected by in-flight writes; fits analytics. Serializable → prevent write-skew between concurrent writers (rarer in batch). Compare to your SQL Server SNAPSHOT/RCSI knowledge — same idea, file-level.
**🚧 Roadblock → fix.** Snapshots accumulate forever → metadata bloat + cost → `expire_snapshots` on a retention policy (Day 27), but never expire one you still time-travel to. Optimistic-concurrency commit conflicts under parallel writers → retry the commit (re-base and re-commit).
**💡 Key ideas / hints.** `SELECT ... VERSION AS OF <snap_id>` / `TIMESTAMP AS OF <ts>`. The `.snapshots` and `.history` metadata tables are your audit trail.
**📚 Read:** [Iceberg Spark Queries](https://iceberg.apache.org/docs/latest/spark-queries/) (time travel + metadata tables).
**🎮 Build & save (the real test).** Make 3 commits; query snapshots 1/2/3 by id and timestamp; roll back to snapshot 1; verify row counts. **Commit** (`day24: snapshots + time travel + rollback`).
**✅ Done when:**
- [ ] queried 3 snapshots by id and timestamp
- [ ] rolled back and confirmed
- [ ] `.history` inspected ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] How does Iceberg snapshot isolation relate to SQL Server SNAPSHOT isolation?
- [ ] What breaks if you expire a snapshot you still query? How do you set retention safely?
## Day 25 — Schema & partition evolution 🎮 Level 25
> 🎯 **Cutoff target:** rename a column, add a column, change the partition spec — and prove old snapshots still read correctly.
> 🔁 **DSA warm-up (two-pointers/sliding-window — 18 min, book closed):** [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/). Trigger "best contiguous gain" → running min, O(n)/O(1).
**📖 The concept (what & why engineers use it).** Iceberg evolves schema and partitioning **without rewriting data**: columns tracked by stable field-IDs (not name/position), partitioning "hidden" (the query layer applies it, so you can change it going forward). Production tables must add columns and re-partition as data grows; rewriting petabytes isn't an option.
**🔀 Alternatives & when to pick them.** Iceberg field-ID evolution → safe rename/add/drop/reorder, default. Hive → name/position-based, renames corrupt reads, avoid. Delta → supports evolution but historically more constrained on partition evolution; note for interviews.
**🚧 Roadblock → fix.** The Hive trap: assuming a rename rewrites or breaks history — in Iceberg it's metadata-only and safe *because* of field IDs. Changing a partition spec doesn't re-partition old data (only new writes) → plan a compaction/rewrite if you need old data re-laid-out.
**💡 Key ideas / hints.** Field IDs make rename safe. Hidden partitioning means queries don't hardcode partition columns — you can evolve them.
**📚 Read:** [Iceberg Evolution](https://iceberg.apache.org/docs/latest/evolution/).
**🎮 Build & save (the real test).** Rename a column, add a column, change the partition spec; query an old snapshot to confirm it still reads; query new data under the new spec. **Commit** (`day25: schema + partition evolution`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] rename + add + partition-spec change done
- [ ] old snapshot still reads correctly ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Why can Iceberg rename a column safely when Hive can't?
- [ ] Does changing the partition spec re-partition existing data? What do you do if you need that?
## Day 26 — CDC → Iceberg (the bridge day) ⭐🎮 Level 26
> 🎯 **Cutoff target:** apply a simulated CDC batch (inserts, updates, a hard delete) via `MERGE INTO`, reconciled against expected — and defend COW vs MOR.
**📖 The concept (what & why engineers use it).** `MERGE INTO` upserts change-data: match on a key, update/delete/insert accordingly — the lakehouse version of the CDC pipelines that feed most enterprise warehouses. **COW** rewrites whole files on update (fast reads, slow writes); **MOR** writes delete/update deltas merged at read time (fast writes, slower reads). This is the day that connects existing warehouse and ETL experience to the lakehouse stack — for anyone coming from a SQL or ETL background, that bridge is the single biggest interview asset.
**🔀 Alternatives & when to pick them.** COW → read-heavy, infrequent updates (BI tables). MOR → write/update-heavy, streaming CDC — at the cost of read-time merge + compaction. Choosing per-table is a senior signal.
**🚧 Roadblock → fix.** The wall you know intimately: **hard deletes**. In SQL Server, `fn_cdc_get_net_changes` collapsed a hard-deleted row to nothing and duplicated hours — you fixed it with an all-changes rescue channel. Same lesson: the CDC feed must *carry* the delete (op-type), or MERGE can't apply it → emit op-type (I/U/D) and handle `WHEN MATCHED AND op='D' THEN DELETE`. MOR without compaction → read rot; schedule compaction.
**💡 Key ideas / hints.** `MERGE INTO t USING changes ON t.key=changes.key WHEN MATCHED AND op='D' THEN DELETE WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT ...`. Write your COW-vs-MOR decision rule in one sentence for the Concept Ledger.
**📚 Read:** [Iceberg Spark Writes](https://iceberg.apache.org/docs/latest/spark-writes/) (MERGE INTO, COW vs MOR).
**🎮 Build & save (the real test).** Simulate a CDC batch with op-types incl. a hard delete; apply via `MERGE INTO`; reconcile result vs expected (Sentinel-Lite's reconciliation idea, now on Iceberg). **Commit** (`day26: CDC merge into iceberg`).
**✅ Done when:**
- [ ] MERGE applies insert + update + hard delete correctly
- [ ] result reconciles against expected counts
- [ ] COW-vs-MOR decision rule written ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥. ⭐ Portfolio centerpiece — make the commit message + README note crisp.
**🔁 Recall (boss check, book closed):**
- [ ] Replay your `fn_cdc_get_net_changes` hard-delete bug in Iceberg terms — how does the change feed prevent it?
- [ ] COW vs MOR — pick one for a streaming-CDC table and justify in one sentence.
## Day 27 — Maintenance & operations 🎮 Level 27
> 🎯 **Cutoff target:** create the small-files problem, run compaction, re-measure file count + scan time, and expire old snapshots.
**📖 The concept (what & why engineers use it).** Lakehouse tables need housekeeping: **compaction** (small files → few big), **snapshot expiration**, **orphan-file cleanup**. Streaming/CDC writes create small files and endless snapshots that quietly destroy read performance and inflate cost. This is your "self-sustaining systems" instinct applied to data.
**🔀 Alternatives & when to pick them.** `rewrite_data_files` (compaction) → small files. `expire_snapshots` → bound metadata/storage. `rewrite_manifests` → manifest bloat. Schedule by write rate (MOR needs it more).
**🚧 Roadblock → fix.** Compaction competes with writers and is costly run naively → compact incrementally (recent partitions), schedule off-peak, tune target file size. Expiring snapshots too aggressively kills time-travel you still need → set retention from your actual RPO.
**💡 Key ideas / hints.** Decide the 3 metrics you'd alert on (file count/size, snapshot count, commit latency) — they become capstone dashboard panels.
**📚 Read:** [Iceberg Maintenance](https://iceberg.apache.org/docs/latest/maintenance/) + [Spark Procedures](https://iceberg.apache.org/docs/latest/spark-procedures/).
**🎮 Build & save (the real test).** Generate many tiny commits → measure file count + scan time → `rewrite_data_files` → re-measure → `expire_snapshots`. **Commit** (`day27: compaction + retention`).
**✅ Done when:**
- [ ] small-files problem created; compaction measurably improves scan
- [ ] old snapshots expired under a retention rule
- [ ] 3 alert-worthy metrics chosen ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Which 3 metrics would you alert on for a production Iceberg table, and why?
- [ ] Why do MOR tables need compaction more than COW tables?
## Day 28 — Ship + write-up 🎮 Boss Level
> 🎯 **Cutoff target:** `iceberg-lakehouse-lab` is public with a README telling the CDC→Iceberg story, an architecture diagram, and green CI.
> 🔁 **DSA warm-up (trees/graphs — 18 min, book closed):** [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/) then, if time, [Same Tree](https://leetcode.com/problems/same-tree/). DFS recursion, O(n)/O(h). *Graphs decay fastest — boss-day rep.*
**📖 Why today.** A lab nobody can read isn't a portfolio piece. Make it legible to a hiring manager skimming for 90 seconds: the story, the diagram, the "why," and proof it runs.
**🎮 Build & ship (the real test).**
- [ ] README: the CDC→Iceberg narrative (SQL Server CDC → lakehouse MERGE), setup steps, what each day proved.
- [ ] Architecture diagram (MinIO → PySpark → Iceberg → DuckDB query).
- [ ] Green public CI (smoke job: write + read + time-travel).
- [ ] **Post:** a short write-up — e.g. "From CDC to Iceberg: what a SQL engineer learns" (Substack + LinkedIn). **Commit** (`day28: ship lakehouse lab`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] repo public, README + diagram + green CI
- [ ] write-up posted ✅ checkpoint
**🏆 Reward:** up to **155 XP** + 🏔️ **Week 4 complete** — claim your week reward. You can now *operate* a lakehouse, not just describe one. 🔥🔥
**🔁 Recall (boss check, book closed) — cumulative:**
- [ ] No notes: metadata tree → snapshots/time-travel → evolution → MERGE (COW/MOR) → maintenance. Narrate the lifecycle in 2 minutes.
---
> ⏭️ **Week 5** (PySpark + Structured Streaming + dbt on the lakehouse + data quality/contracts + Dagster + lineage). DSA spaced-rep continues Days 1/3/5/7.
---
# 📅 Week 5 — Spark + dbt + Orchestration + Governance: the processing layer
> **Phase goal:** turn your static Iceberg lab into a *moving* pipeline — distributed batch + streaming transforms (PySpark), modeled + tested transformations (dbt), orchestration (Dagster), and data-quality contracts + lineage. By Friday the `iceberg-lakehouse-lab` repo grows a `pipeline/` that ingests → transforms → quality-gates → lands curated Iceberg tables, scheduled and observable. 🎮 **Save rule:** each day commits a working stage; a day is cleared when the stage runs green end-to-end.
> 🧠 **DSA stays warm:** Days 1/3/5/7 (Days 29/31/33/35) open with a 15–20 min spaced-rep warm-up — one problem, book-closed, *name the trigger + pattern + complexity before coding*.
## Day 29 — PySpark fundamentals: DataFrames, lazy execution, the shuffle 🎮 Level 29
> 🎯 **Cutoff target:** rewrite one of your SQL transforms as a PySpark DataFrame job against Iceberg, and read its physical plan to spot the shuffle.
> 🔁 **DSA warm-up (heaps — 18 min, book closed):** [Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/). Trigger "k-th largest" → min-heap of size k, O(n log k).
**📖 The concept (what & why engineers use it).** Spark distributes a computation across a cluster: a DataFrame is a *logical* description, and Spark builds an optimized physical plan that runs in parallel across partitions. Transformations are **lazy** (they just build the plan); an **action** (count, write, collect) triggers execution. The expensive thing is the **shuffle** — moving data across the network to group/join by key. Engineers reach for Spark when data outgrows one machine; your SQL instincts transfer directly (it's SQL-shaped), but you now reason about *partitions and shuffles* the way you reason about indexes and scans.
**🔀 Alternatives & when to pick them.** Spark → data \> one machine, or you need a cluster. DuckDB/Polars → single-node analytics, often *faster* up to \~100GB and far simpler — pick first if it fits. Pandas → small data, prototyping. SQL-in-warehouse (Snowflake/BigQuery) → when the warehouse is the compute. Senior signal: not reaching for Spark when DuckDB would do.
**🚧 Roadblock → fix.** The #1 Spark pain: **data skew** — one key has most of the rows, so one task runs forever while others finish (the straggler). You'll see it as a single slow task in the UI. Fixes the field uses: salt the hot key, broadcast the small side of a join, or `repartition` by a better key. Second gotcha: calling `.collect()` on a huge DataFrame pulls it all to the driver → OOM; aggregate first, collect small.
**💡 Key ideas / hints.**
- Narrow transforms (map/filter) = no shuffle. Wide transforms (groupBy/join/distinct) = shuffle.
- `df.explain()` shows the physical plan — look for `Exchange` (= a shuffle).
- Broadcast join (`broadcast(small_df)`) avoids shuffling the big side.
**📚 Read (what + how).**
- [Spark SQL/DataFrame Guide](https://spark.apache.org/docs/latest/sql-programming-guide.html) — **extract:** DataFrame ops, lazy vs action, `explain`.
- Skim [Spark tuning — shuffle/skew](https://spark.apache.org/docs/latest/sql-performance-tuning.html) — **extract:** AQE, broadcast, partitions.
**🎮 Build & save (the real test).** Point PySpark at your Iceberg catalog. Re-implement one warehouse-style transform (a join + group-by aggregate) as a DataFrame job reading an Iceberg table and writing a new one. Run `.explain()` and identify the `Exchange`. **Commit** (`day29: pyspark transform on iceberg`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] a PySpark job reads + transforms + writes Iceberg
- [ ] you can point to the shuffle in the physical plan ✅ checkpoint
**🏆 Reward:** DSA `+25` · read `+30` · build `+50` · recall `+25` · perfect-day `+25` = **up to 155 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Lazy vs action — what triggers execution, and why does laziness let Spark optimize?
- [ ] What is a shuffle, which operations cause it, and how do you spot skew?
## Day 30 — Structured Streaming + Iceberg sink 🎮 Level 30
> 🎯 **Cutoff target:** a streaming job consumes a feed and writes micro-batches into Iceberg with exactly-once semantics via checkpointing.
**📖 The concept (what & why engineers use it).** Structured Streaming treats a stream as an unbounded table processed in **micro-batches** — same DataFrame API as batch, so one mental model covers both. Engineers use it for near-real-time pipelines (CDC ingestion, metrics, alerting). The two ideas that make it *correct*: **checkpointing** (it remembers offsets so a restart resumes exactly where it left off) and **idempotent sinks** (writing the same micro-batch twice doesn't double data) → together they give exactly-once. This is your "real-time systems" goal landing on the lakehouse.
**🔀 Alternatives & when to pick them.** Spark Structured Streaming → micro-batch, unifies with your batch code, lakehouse sink. Flink → true record-at-a-time, lower latency, richer state — pick when sub-second + complex event-time logic matters. Kafka Streams → JVM apps close to Kafka. Plain batch on a schedule → when minutes-to-hours latency is fine (often it is — don't stream by default).
**🚧 Roadblock → fix.** The classic trap: **deleting or losing the checkpoint** → on restart the job reprocesses from the beginning (or skips data), breaking exactly-once. Fix: treat the checkpoint dir as sacred state, one per query, never share or hand-edit it. Second gotcha: tiny micro-batches → the small-files problem on the Iceberg side; tune trigger interval + compact (W4 Day 27).
**💡 Key ideas / hints.**
- Output modes: append / update / complete — pick by whether aggregates change.
- `trigger(processingTime=...)` controls batch cadence; `availableNow` drains a backlog.
- Watermarks bound state for event-time aggregations (drop data later than the watermark).
**📚 Read (what + how).**
- [Structured Streaming Guide](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html) — **extract:** micro-batch model, checkpointing, output modes, watermarks.
**🎮 Build & save (the real test).** Stream a simulated CDC/event feed (a directory source or a socket) → transform → write to an Iceberg table with a checkpoint dir. Kill and restart the job; prove no dupes/no loss. **Commit** (`day30: streaming → iceberg, exactly-once`).
**✅ Done when:**
- [ ] streaming job writes micro-batches to Iceberg with a checkpoint
- [ ] restart-after-kill produces no duplicates and no loss
- [ ] trigger interval tuned to avoid tiny files ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] How do checkpointing + an idempotent sink combine to give exactly-once?
- [ ] When would you reach for Flink over Spark Structured Streaming?
## Day 31 — dbt on the lakehouse: models, refs, materializations 🎮 Level 31
> 🎯 **Cutoff target:** a small dbt project builds staging → mart models on your Iceberg tables, with `ref()` wiring the DAG and an incremental model.
> 🔁 **DSA warm-up (binary search — 18 min, book closed):** [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/). Trigger "sorted-ish + find boundary" → binary search, O(log n).
**📖 The concept (what & why engineers use it).** dbt lets you build transformations as **SELECT statements** (models) that it turns into tables/views, with dependencies expressed via `ref()` so dbt computes the build DAG and runs them in order. Engineers love it because it brings software practices to SQL: version control, testing, documentation, and incremental builds. It's the de-facto transformation layer (the "T" in ELT) — and it plays directly to your SQL strength while teaching the modern workflow around it.
**🔀 Alternatives & when to pick them.** dbt → SQL-centric transformations with tests + lineage (the default "T"). Hand-written Spark/SQL jobs → when logic is too imperative for SQL. SQLMesh → a newer dbt alternative with stronger incremental/virtual-environment semantics — worth name-dropping. Materialized views in the warehouse → simple cases.
**🚧 Roadblock → fix.** The incremental-model trap: a naive incremental model double-counts or misses late-arriving rows. Fix: use `is_incremental()` with a proper filter on an updated-at watermark, and choose the right `incremental_strategy` (merge vs insert-overwrite) — merge keyed on your unique id is the safe default (it's your CDC MERGE instinct again). Second gotcha: full-refresh accidentally in prod → guard it.
**💡 Key ideas / hints.**
- Materializations: view (cheap, always fresh) · table (fast reads, rebuilt) · incremental (only new rows) · ephemeral (inlined CTE).
- `ref()` builds the DAG and makes lineage automatic.
- staging (clean/rename) → intermediate → marts (business-facing) is the standard layering.
**📚 Read (what + how).**
- [dbt — Models](https://docs.getdbt.com/docs/build/models) + [Incremental](https://docs.getdbt.com/docs/build/incremental-models) — **extract:** ref, materializations, `is_incremental()`.
**🎮 Build & save (the real test).** Init a dbt project against your lakehouse (dbt-spark or dbt-duckdb on the Iceberg tables). Build `stg_*` → `mart_*` models; make the mart **incremental** with a merge strategy on your key. `dbt run` + `dbt docs generate` to see the lineage graph. **Commit** (`day31: dbt models + incremental`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] staging → mart models build via `ref()`
- [ ] one incremental model merges new rows correctly ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] When do you pick view vs table vs incremental vs ephemeral?
- [ ] How does an incremental model avoid double-counting late rows?
## Day 32 — Data quality & contracts (dbt tests + Great Expectations) 🎮 Level 32
> 🎯 **Cutoff target:** a quality gate fails the pipeline on a bad batch — not-null, uniqueness, accepted-values, and a freshness check all enforced.
**📖 The concept (what & why engineers use it).** Data quality testing asserts properties of *data* (not code): no nulls in a key, values in an allowed set, row counts in range, freshness within SLA. **Data contracts** make these expectations explicit and enforced at boundaries so a bad upstream change *fails loud* instead of silently corrupting downstream tables. Engineers treat this as the data equivalent of unit tests + types — it's exactly your Sentinel-Lite reconciliation instinct, now declarative and in the pipeline.
**🔀 Alternatives & when to pick them.** dbt tests (generic + singular) → cheapest, lives with your models, default. Great Expectations → richer expectation suites + data docs, pick for heavier validation/profiling. Soda / Elementary → monitoring + anomaly detection over time. Pandera → DataFrame-level schema checks in Python/Spark. Pick the lightest that enforces the contract.
**🚧 Roadblock → fix.** The trap: tests that *warn* but don't *block* → bad data flows downstream anyway and everyone ignores the warnings. Fix: make critical tests `error`-severity and wire them as a **gate** (pipeline stops, batch quarantined) — your "fail the run, quarantine the batch" pattern from Sentinel-Lite. Second gotcha: over-testing every column → noise; test keys, critical invariants, and freshness, not everything.
**💡 Key ideas / hints.**
- dbt generic tests: `not_null`, `unique`, `accepted_values`, `relationships` (FK). Singular tests = a SELECT that should return zero rows.
- Freshness: assert max(updated_at) within SLA.
- A failing gate should quarantine the batch + emit a metric (ties to W2 observability + capstone dashboard).
**📚 Read (what + how).**
- [dbt — Tests](https://docs.getdbt.com/docs/build/data-tests) + [Source freshness](https://docs.getdbt.com/docs/build/sources#snapshotting-source-data-freshness) — **extract:** generic vs singular, severity, freshness.
- Skim [Great Expectations intro](https://docs.greatexpectations.io/docs/) — **extract:** expectation suites + data docs.
**🎮 Build & save (the real test).** Add dbt tests to your models (not_null + unique on keys, accepted_values on a category, a relationships test). Add a freshness check on the source. Feed a deliberately bad batch and prove the gate **fails** + the batch is quarantined. **Commit** (`day32: quality gate + contracts`).
**✅ Done when:**
- [ ] not-null / unique / accepted-values / relationships tests pass on good data
- [ ] a bad batch makes the gate fail (error severity) + quarantines
- [ ] a freshness check is enforced ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] What's the difference between a data *test* and a data *contract*, and where is each enforced?
- [ ] Why must critical checks block (not warn)? Tie it to Sentinel-Lite's quarantine.
## Day 33 — Orchestration with Dagster (assets, schedules, sensors) 🎮 Level 33
> 🎯 **Cutoff target:** your ingest → transform → quality-gate → publish steps run as a Dagster asset graph, scheduled, with a sensor that triggers on new data.
> 🔁 **DSA warm-up (trees/graphs — 18 min, book closed):** [Course Schedule](https://leetcode.com/problems/course-schedule/). Trigger "prereqs / can finish all" → topological sort / cycle detection, O(V+E). *Note: a DAG scheduler is literally today's topic.*
**📖 The concept (what & why engineers use it).** An orchestrator runs your pipeline steps in dependency order, on a schedule or trigger, with retries, logging, and a UI to see what ran. **Dagster** models the pipeline as **assets** (the *data* each step produces) rather than just tasks — so lineage, freshness, and "what's stale" are first-class. Engineers need orchestration the moment a pipeline has more than one step or a schedule; the asset model fits your "observable, self-sustaining systems" goal especially well.
**🔀 Alternatives & when to pick them.** Dagster → asset-centric, great local dev + typing + lineage (recommended for you). Airflow → the incumbent, task-centric, huge ecosystem — pick when a team already runs it. Prefect → lightweight, Pythonic, dynamic flows. dbt Cloud scheduler → if dbt is the whole pipeline. Cron → never for real pipelines (no retries/visibility).
**🚧 Roadblock → fix.** The retry trap: a step that isn't **idempotent** gets retried and double-writes (you know this cold from CDC). Fix: make each asset idempotent (overwrite/merge by key, not append) so retries are safe. Second gotcha: a giant monolithic task that's hard to retry/observe → break it into assets at natural data boundaries so failures are isolated and re-runnable.
**💡 Key ideas / hints.**
- Asset = a persisted data object + the function that computes it; dependencies form the DAG (topo sort — today's warm-up!).
- Schedules (time-based) vs sensors (event-based: fire when a new file/partition lands).
- Retries + backoff config per asset; the UI shows runs, lineage, and freshness.
**📚 Read (what + how).**
- [Dagster — Assets](https://docs.dagster.io/concepts/assets/software-defined-assets) + [Schedules & Sensors](https://docs.dagster.io/concepts/automation) — **extract:** asset graph, schedule vs sensor, retries.
**🎮 Build & save (the real test).** Wrap your pipeline as Dagster assets: raw_ingest → transformed (PySpark/dbt) → quality_gate → published_iceberg. Add a schedule and a sensor that fires on a new input partition. Configure retries on the ingest asset. **Commit** (`day33: dagster asset graph + schedule/sensor`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] pipeline runs as a Dagster asset graph in dependency order
- [ ] a schedule + a sensor both work; ingest retries on failure ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Asset-centric vs task-centric orchestration — what does the asset model give you?
- [ ] Why must an asset be idempotent for retries to be safe?
## Day 34 — Catalogs, lineage & OpenLineage 🎮 Level 34
> 🎯 **Cutoff target:** end-to-end lineage is visible (source → staging → mart → published), and you can explain catalog choices for Iceberg.
**📖 The concept (what & why engineers use it).** A **catalog** is the registry that tracks which tables exist and where their metadata lives (Hadoop/REST/Glue/Nessie for Iceberg). **Lineage** is the graph of how data flows table-to-table — essential for impact analysis ("if I change this source, what breaks?"), debugging, and governance/compliance. **OpenLineage** is the open standard for emitting lineage events from Spark/dbt/Airflow so a tool (Marquez, DataHub) can assemble the graph. Engineers need this the moment a pipeline has more than a couple of hops; it's the backbone of a *governed* platform.
**🔀 Alternatives & when to pick them.** Iceberg catalogs: Hadoop (file-based, simplest, local/dev) · REST (standard, production) · Glue (AWS-native) · Nessie (git-like branching for data — powerful for CI/experiments). Lineage: dbt's built-in docs DAG (free, model-level) · OpenLineage + Marquez (cross-tool, run-level) · DataHub/OpenMetadata (full catalog + governance). Pick by how many tools + how much governance you need.
**🚧 Roadblock → fix.** The trap: column-level lineage is much harder than table-level, and naive setups only get table-level → you can't answer "which downstream column depends on this one." Fix: rely on dbt + OpenLineage's column-lineage support where available, and document the gaps. Second gotcha: catalog mismatch between engines (Spark vs Trino reading the same Iceberg tables) → standardize on a REST/Glue catalog both speak.
**💡 Key ideas / hints.**
- Nessie's git-like branches let you build/test on a branch and atomically "merge" data — a killer story for CI + your self-healing/experimentation angle.
- OpenLineage emits run events; Marquez visualizes the graph.
- Lineage = the data-side of the observability you built in W2.
**📚 Read (what + how).**
- [Iceberg Catalogs](https://iceberg.apache.org/concepts/catalog/) — **extract:** Hadoop vs REST vs Glue vs Nessie.
- [OpenLineage intro](https://openlineage.io/docs/) — **extract:** the event model + Spark/dbt integrations.
**🎮 Build & save (the real test).** Wire OpenLineage emission from your dbt/Spark runs into Marquez (docker) — or, if time-boxed, generate `dbt docs` and capture the lineage graph as the artifact. Write one paragraph comparing the four Iceberg catalogs and which you'd use in prod + why. **Commit** (`day34: lineage graph + catalog write-up`).
**✅ Done when:**
- [ ] end-to-end lineage visible (source → staging → mart → published)
- [ ] catalog comparison written (incl. when you'd pick Nessie)
- [ ] artifact (Marquez screenshot or dbt docs graph) committed ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Name the 4 Iceberg catalog options and when you'd pick each.
- [ ] What question does lineage answer that logs/metrics can't?
## Day 35 — Ship the pipeline + write-up 🎮 Boss Level
> 🎯 **Cutoff target:** the repo runs ingest → PySpark/dbt transform → quality gate → published Iceberg, orchestrated by Dagster, with lineage + a README story, green CI.
> 🔁 **DSA warm-up (hashmaps + sliding window mix — 18 min, book closed):** [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/). Trigger "longest run of consecutive" → hash set, O(n). *Recognize it's a set problem, not sorting.*
**📖 Why today.** This is the week that proves you can run a *processing platform*, not just store files. Make it legible and runnable so it reads as production-grade.
**🎮 Build & ship (the real test).**
- [ ] One `docker compose up` (or `dagster dev`) brings the whole pipeline up locally.
- [ ] README: the architecture story (ingest → Spark/dbt → quality gate → Iceberg → lineage), a diagram, and how the quality gate + orchestration make it self-sustaining.
- [ ] Green CI: a smoke run that ingests a sample, transforms, passes the gate, publishes.
- [ ] **Post:** a write-up — e.g. "Building a governed lakehouse pipeline: Spark + dbt + Dagster on Iceberg" (Substack + LinkedIn). **Commit** (`day35: ship pipeline`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] full pipeline runs end-to-end locally + in CI
- [ ] README + diagram + lineage shown; write-up posted ✅ checkpoint
**🏆 Reward:** up to **155 XP** + 🏔️ **Week 5 complete** — claim your week reward. You now own the *processing + governance* layer. 🔥🔥
**🔁 Recall (boss check, book closed) — cumulative:**
- [ ] No notes: trace a record from raw source → Spark/dbt transform → quality gate → published Iceberg table → lineage graph. Name what makes each step observable and self-healing.
---
> ⏭️ **Week 6** (Distributed Systems for Data — CAP/PACELC, partitioning/skew, exactly-once, backpressure, fault-tolerance/self-healing, system-design practice). DSA spaced-rep continues Days 1/3/5/7.
---
# 📅 Week 6 — Distributed Systems for Data: the senior layer
> **Phase goal:** acquire the vocabulary + judgment to *reason about* distributed data systems out loud — the thing that separates senior from mid in interviews. Less building, more deep understanding + design practice. Artifact: a `designs/` folder of written system-design answers + a one-page distributed-systems cheat sheet (yours, from memory). 🎮 **Save rule:** each day commits a written design or a worked-through tradeoff doc; a day is cleared when you can defend it out loud, ending in a tradeoff.
> 🧠 **DSA stays warm:** Days 1/3/5/7 (Days 36/38/40/42) open with a 15–20 min spaced-rep warm-up — book-closed, name the trigger + pattern + complexity first.
> 📖 **Spine for the week:** Kleppmann's *Designing Data-Intensive Applications* (DDIA) — the most-referenced book in data/infra interviews. You'll read the chapters that pay rent.
## Day 36 — Consistency models: CAP, PACELC, isolation 🎮 Level 36
> 🎯 **Cutoff target:** explain CAP and PACELC correctly (the common version is wrong), and place SNAPSHOT vs SERIALIZABLE on the isolation spectrum.
> 🔁 **DSA warm-up (hashmaps — 15 min, book closed):** [Valid Anagram](https://leetcode.com/problems/valid-anagram/). Trigger "same characters / counts" → Counter, O(n).
**📖 The concept (what & why engineers use it).** Consistency models define *what guarantees a reader gets* in a distributed system. **CAP**: under a network *partition*, you choose Consistency or Availability — that's it (the famous "pick 2 of 3" framing is misleading; partitions aren't optional, so it's really C-vs-A *during* a partition). **PACELC** completes it: when **P**artitioned, choose A or C; **E**lse (normal operation), choose **L**atency or **C**onsistency. Engineers use this to justify datastore choices ("we picked an AP store because availability matters more than read-your-writes here"). Isolation levels (your SQL Server turf — SNAPSHOT, SERIALIZABLE) are the single-node cousin of the same question.
**🔀 When to pick what (the tradeoff).** CP store (e.g. a strongly-consistent DB) → correctness-critical (ledgers, inventory). AP store (e.g. Dynamo-style) → availability-critical, can tolerate staleness (shopping carts, feeds). Tunable (Cassandra quorum) → dial per-query. The senior move is naming *which* operations need which — rarely the whole system.
**🚧 Roadblock → fix.** The interview trap: reciting "CAP = pick 2 of 3." Fix: say "partitions are a given, so it's C-vs-A *under* partition; PACELC adds the latency-vs-consistency tradeoff in the normal case" — that one sentence signals you actually understand it. Second trap: conflating consistency (CAP) with isolation (ACID) — they're different axes; say so.
**💡 Key ideas / hints.** Linearizable \> sequential \> causal \> eventual. SNAPSHOT isolation allows write-skew; SERIALIZABLE doesn't. Read-your-writes, monotonic-reads are the "session guarantees" worth naming.
**📚 Read (what + how).** [DDIA Ch 5 (Replication) intro + Ch 9 (Consistency/Consensus) linearizability section](https://dataintensive.net/) — **extract:** linearizability vs eventual, why consensus is hard. Skim [Jepsen's consistency map](https://jepsen.io/consistency) — **extract:** the hierarchy picture.
**🎮 Build & save (the real test).** Write `designs/consistency.md`: define CAP correctly, PACELC, the isolation spectrum, and a 3-row table "system → model → why." Map your fraud-serving API and your reconciliation store onto it. **Commit** (`day36: consistency models`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] `consistency.md` written with the correct CAP/PACELC framing
- [ ] you can say the C-vs-A-under-partition sentence out loud ✅ checkpoint
**🏆 Reward:** DSA `+25` · read `+30` · build `+50` · recall `+25` · perfect-day `+25` = **up to 155 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] State CAP correctly (not "2 of 3") and what PACELC adds.
- [ ] SNAPSHOT vs SERIALIZABLE — what does SNAPSHOT allow that SERIALIZABLE forbids?
## Day 37 — Partitioning, sharding & skew 🎮 Level 37
> 🎯 **Cutoff target:** choose a partition key for a given workload and explain how you'd detect + fix a hot partition.
**📖 The concept (what & why engineers use it).** Partitioning (sharding) splits data across nodes so the system scales horizontally. The whole game is the **partition key**: a good one spreads load evenly *and* keeps related data together for efficient queries. Engineers obsess over this because the #1 scaling failure is a **hot partition** — one key (or range) gets most of the traffic and one node melts while others idle. You already have the instinct from SQL Server partitioning + your CDC work; this is the distributed generalization.
**🔀 When to pick what (the tradeoff).** Hash partitioning → even spread, but kills range scans (adjacent keys scatter). Range partitioning → great range scans, but risks hot ranges (e.g. everything "today"). Composite (hash of a prefix + range) → balance. Consistent hashing → minimizes data movement when you add/remove nodes (vs naive `hash % N` which reshuffles everything).
**🚧 Roadblock → fix.** The classic failure: a hot key (a celebrity user, a "today" timestamp, a NULL bucket). Detect it via per-partition metrics (one partition's QPS/latency dwarfs the rest — ties to your W2 observability). Fix: **salt** the hot key (append a random suffix to spread it, fan-in on read), or pick a higher-cardinality key. Second gotcha: choosing a key that forces cross-partition joins/transactions on the hot path → co-locate related data under the same key.
**💡 Key ideas / hints.** `hash % N` reshuffles on resize → use consistent hashing/virtual nodes. Skew shows up as a single straggler task (same thing you saw in Spark, W5 Day 29). Rebalancing should move minimal data.
**📚 Read (what + how).** [DDIA Ch 6 (Partitioning)](https://dataintensive.net/) — **extract:** key-range vs hash, rebalancing, request routing, hot spots.
**🎮 Build & save (the real test).** Write `designs/partitioning.md`: for a "real-time events" workload, pick a partition key, justify it, and write the hot-partition detection + salting remediation. Connect it to the Spark skew fix you did in W5. **Commit** (`day37: partitioning + skew`).
**✅ Done when:**
- [ ] partition-key choice justified for a given workload
- [ ] hot-partition detection (which metric) + fix (salting/rekey) written
- [ ] consistent-hashing-vs-`hash % N` explained ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Hash vs range partitioning — the tradeoff in one sentence each.
- [ ] How do you detect a hot partition, and what are two fixes?
## Day 38 — Replication & consensus 🎮 Level 38
> 🎯 **Cutoff target:** explain leader-follower vs leaderless, sync vs async tradeoffs, and why consensus (Raft) exists.
> 🔁 **DSA warm-up (sliding window — 18 min, book closed):** [Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/). Trigger "shortest subarray ≥ target" → shrink-when-valid window, O(n).
**📖 The concept (what & why engineers use it).** Replication keeps copies of data on multiple nodes for durability + availability + read scaling. The models: **leader-follower** (one node takes writes, replicates out), **multi-leader** (multiple write nodes, conflict resolution needed), **leaderless/quorum** (write to W nodes, read from R, with R+W\>N for overlap). **Consensus** (Raft/Paxos) is how nodes *agree* on one value/leader despite failures — the foundation under etcd, ZooKeeper, Kafka's controller, and every system that needs a single source of truth. Engineers need this to reason about durability guarantees and failover.
**🔀 When to pick what (the tradeoff).** Sync replication → no data loss on failover, but higher write latency + lower availability (a slow follower blocks). Async → fast writes, but a failover can lose the last un-replicated writes (RPO \> 0). Leaderless quorum → high availability + tunable, but you handle conflicts (LWW/CRDT). Multi-leader → multi-region writes, at the cost of conflict resolution.
**🚧 Roadblock → fix.** The trap people fumble: **split-brain** — a network partition leaves two leaders accepting writes → divergence. Fix: consensus + quorum (a majority is required to elect/commit, so a minority partition can't make progress). Second gotcha: assuming async replication is "basically safe" — name the RPO window where committed-to-leader-but-not-replicated writes are lost on failover.
**💡 Key ideas / hints.** R+W\>N guarantees read/write overlap (at least one node has the latest). Raft = leader election + log replication + safety via majority commit. Quorum doesn't fix stale reads unless R+W\>N.
**📚 Read (what + how).** [DDIA Ch 5 (Replication)](https://dataintensive.net/) fully + \[Ch 9 consensus section\] — **extract:** sync/async, quorum, the Raft intuition. Optional: [The Secret Lives of Data — Raft (visual)](https://thesecretlivesofdata.com/raft/).
**🎮 Build & save (the real test).** Write `designs/replication.md`: the three replication models with a when-to-use line each, the split-brain problem + consensus fix, and how Kafka/your streaming pipeline (W5) achieves durability. **Commit** (`day38: replication + consensus`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] three replication models + sync/async tradeoff written
- [ ] split-brain + consensus-fix explained; R+W\>N stated ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Sync vs async replication — what exactly do you lose with async on failover?
- [ ] Why does R+W\>N matter, and what problem does consensus solve that quorum alone doesn't?
## Day 39 — Delivery semantics: exactly-once, idempotency, outbox 🎮 Level 39
> 🎯 **Cutoff target:** explain why "exactly-once delivery" is a myth and how exactly-once *processing* is actually achieved.
**📖 The concept (what & why engineers use it).** In a distributed system you get **at-most-once** (may lose messages) or **at-least-once** (may duplicate); true exactly-once *delivery* is impossible (the two-generals problem). What engineers actually build is **exactly-once \*processing*** = at-least-once delivery + idempotent consumers (or dedup by an idempotency key) so duplicates have no effect. The transactional outbox*\* pattern solves the "update DB and publish event atomically" problem (write the event to an outbox table in the same transaction, relay it separately). This is the rigorous version of the resilience you built in W2 Day 13 and the streaming exactly-once in W5 Day 30 — and it's your CDC hard-delete lesson generalized.
**🔀 When to pick what (the tradeoff).** At-most-once → telemetry where loss is fine and speed matters. At-least-once + idempotency → the default for anything that mutates state (almost everything). Outbox → when you must atomically change state *and* emit an event without a distributed transaction. Dual-write (update DB then publish) → tempting but **broken** (one can succeed while the other fails) — name why you avoid it.
**🚧 Roadblock → fix.** The dual-write trap: "I'll update the DB, then publish to Kafka" → a crash between the two leaves them inconsistent. Fix: transactional outbox (or CDC-from-the-DB, which is literally your wheelhouse — Debezium reads the log). Second gotcha: idempotency keys that aren't actually unique per logical operation → use a natural business key + operation id; persist processed-ids to dedup.
**💡 Key ideas / hints.** Idempotency = "apply once" even under retries/redelivery (upsert/MERGE on a natural key — your CDC instinct). Outbox + a relay (or CDC) = atomic state-change + event. Kafka "exactly-once" = idempotent producer + transactions + a dedup'd consumer.
**📚 Read (what + how).** [DDIA Ch 11 (Stream Processing)](https://dataintensive.net/) — **extract:** fault tolerance, exactly-once, idempotence. [microservices.io](http://microservices.io)[ — Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html) — **extract:** the pattern + why dual-write fails.
**🎮 Build & save (the real test).** Write `designs/delivery-semantics.md`: the three semantics, why exactly-once delivery is impossible, how exactly-once processing is achieved, and the outbox pattern diagram. Tie each to where it lives in your pipeline (streaming sink, reconciliation remediation). **Commit** (`day39: delivery semantics + outbox`).
**✅ Done when:**
- [ ] three semantics + the impossibility-of-exactly-once-delivery argument written
- [ ] outbox pattern explained + why dual-write is broken
- [ ] mapped onto your streaming + reconciliation code ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Why is exactly-once *delivery* impossible, and how do you get exactly-once *processing*?
- [ ] What breaks with dual-write, and how does the outbox fix it?
## Day 40 — Backpressure, queues & flow control 🎮 Level 40
> 🎯 **Cutoff target:** explain backpressure, when to buffer vs drop vs block, and how DLQ + replay fits a self-healing pipeline.
> 🔁 **DSA warm-up (stacks — 18 min, book closed):** [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/). Trigger "evaluate expression / nesting" → stack, O(n).
**📖 The concept (what & why engineers use it).** Backpressure is how a system protects itself when input arrives faster than it can process: it signals upstream to slow down (pull-based), or buffers/drops/blocks (push-based). Without it, queues grow unbounded → OOM/latency collapse → cascading failure. Engineers design flow control because every real pipeline eventually faces a burst. A **dead-letter queue (DLQ)** parks un-processable messages so one bad record doesn't block the stream, with **replay** to recover later — squarely your "self-healing systems" goal.
**🔀 When to pick what (the tradeoff).** Block (pull-based, bounded buffer) → when you can't lose data and upstream can slow (your generators in W1 Day 6 — pull = natural backpressure). Drop/sample → when fresh data matters more than completeness (metrics, telemetry). Buffer → smooths short bursts, but bounded or it's just deferred OOM. DLQ + replay → poison messages: isolate, alert, fix, replay.
**🚧 Roadblock → fix.** The trap: an unbounded queue/buffer "to be safe" → it hides the problem until memory runs out under load (deferred catastrophe). Fix: bounded queues + an explicit policy (block/drop/DLQ) + a depth metric + alert. Second gotcha: a single poison message infinitely retried, blocking the whole partition → cap retries, route to DLQ, continue.
**💡 Key ideas / hints.** Pull-based (consumer asks for more) gives backpressure for free; push-based needs explicit flow control. Little's Law (L = λW) sizes queues/concurrency. Queue depth + consumer lag are the metrics to alert on (Kafka consumer lag = your canary).
**📚 Read (what + how).** [DDIA Ch 11 (messaging/streams + backpressure)](https://dataintensive.net/) — **extract:** message brokers, consumer lag, dropping vs buffering. Skim [Reactive Streams backpressure](https://www.reactive-streams.org/) — **extract:** the pull-based idea.
**🎮 Build & save (the real test).** Write `designs/backpressure.md`: define backpressure, the block/drop/buffer decision table, DLQ + replay design, and the metrics you'd alert on. Add a DLQ + bounded queue to Sentinel-Lite's design (or implement a small bounded-queue demo if time). **Commit** (`day40: backpressure + DLQ`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] backpressure + block/drop/buffer decision table written
- [ ] DLQ + replay + queue-depth alerting designed ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Why does an unbounded buffer make things worse, not safer?
- [ ] How does pull-based consumption give backpressure "for free"? (tie to W1 generators)
## Day 41 — Fault tolerance & self-healing 🎮 Level 41
> 🎯 **Cutoff target:** design a pipeline that detects its own failures and recovers without a human — and name every pattern doing the work.
**📖 The concept (what & why engineers use it).** Fault tolerance = the system keeps working (possibly degraded) despite component failures; **self-healing** = it detects and recovers automatically. This is the synthesis of your whole journey and your stated north star ("large-scale self-recovery systems without human intervention"). The toolkit, now assembled: health checks + restarts, retries + backoff + jitter (W2), circuit breakers (W2), idempotency + outbox (D39), DLQ + replay (D40), bulkheads (isolate failures), graceful degradation, and the reconciliation loop (Sentinel-Lite itself — detect drift from source-of-truth, auto-remediate).
**🔀 When to pick what (the tradeoff).** Retry → transient faults. Circuit breaker → a dependency that can stay down (stop the bleeding). Bulkhead → isolate so one failure doesn't sink everything (separate pools/queues). Graceful degradation → serve stale/partial rather than nothing. Reconciliation/control loop → the strongest form: continuously detect divergence and self-correct (your fraud-drift retrain, your data reconciliation). Self-healing isn't free — it adds complexity; name when a human-in-the-loop alert is the right call instead.
**🚧 Roadblock → fix.** The trap: "self-healing" that masks real problems — auto-retry hides a systemic bug, auto-remediation silently corrupts data. Fix: every automated recovery **emits a metric + leaves an audit trail** (you can't heal what you can't see — ties to W2/W14), and dangerous remediations quarantine + alert rather than guess. Second gotcha: no idempotency → self-healing retries double-apply (the failure mode you fixed in CDC).
**💡 Key ideas / hints.** The control-loop pattern (observe → diff vs desired → act) is what Kubernetes and your reconciliation service share — *that's* the senior framing of "self-healing." Bulkhead = the Titanic's compartments. Degradation \> outage.
**📚 Read (what + how).** [DDIA Ch 8 (The Trouble with Distributed Systems)](https://dataintensive.net/) — **extract:** partial failure, unreliable clocks/networks, why detection is hard. Skim a [Kubernetes controller/reconcile-loop overview](https://kubernetes.io/docs/concepts/architecture/controller/) — **extract:** the observe-diff-act loop.
**🎮 Build & save (the real test).** Write `designs/self-healing.md`: a pipeline that detects + recovers from each failure class, naming the pattern per failure and the metric/audit each emits. Frame Sentinel-Lite explicitly as a reconciliation control loop. This doc is interview gold for your target identity. **Commit** (`day41: self-healing design`).
**✅ Done when:**
- [ ] every failure class mapped to a recovery pattern
- [ ] each automated recovery emits a metric + audit trail
- [ ] Sentinel-Lite framed as an observe-diff-act control loop ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Name 6 fault-tolerance patterns and the failure each addresses.
- [ ] What's the risk of self-healing that hides problems, and how do you prevent it?
## Day 42 — System-design practice + cheat sheet 🎮 Boss Level
> 🎯 **Cutoff target:** do two timed system-design problems end-to-end using a framework, and write your distributed-systems cheat sheet from memory.
> 🔁 **DSA warm-up (trees/graphs — 18 min, book closed):** [Clone Graph](https://leetcode.com/problems/clone-graph/). Trigger "copy a graph" → BFS/DFS + visited map, O(V+E).
**📖 Why today.** Knowing the pieces isn't the same as assembling them under time pressure with someone watching. Today you practice the *performance* — the structured walk-through that earns the offer.
**🎮 The arena (the real test).**
- [ ] **Design 1 — "real-time data pipeline / metrics system"** (your wheelhouse): use the Hello Interview framework (requirements → core entities → API → high-level design → deep dives → tradeoffs). 35–40 min, written in `designs/`. Force yourself to invoke this week's concepts (partitioning, replication, exactly-once, backpressure, self-healing).
- [ ] **Design 2 — a classic** ("design a rate limiter" or "design a notification system"). Same framework, 35–40 min.
- [ ] **Cheat sheet (from memory):** write `distributed-systems-cheatsheet.md` covering CAP/PACELC, partitioning, replication/consensus, delivery semantics, backpressure, fault-tolerance. Verify against DDIA; mark gaps red.
- [ ] Commit all three ✅ checkpoint
**🏆 Reward:** up to **150 XP** + 🏔️ **Week 6 complete** — claim your week reward. You can now *reason* like a distributed-systems engineer, not just name the parts. 🔥🔥
**🔁 Recall (boss check, book closed) — cumulative:**
- [ ] No notes, 3 minutes: walk the full distributed-data stack — partition the data → replicate it → agree via consensus → deliver exactly-once → apply backpressure → self-heal on failure. Name the tradeoff at each layer.
---
> ⏭️ **Week 7** (AI Engineering I — RAG + vector search + embeddings + chunking + Ragas eval + FastAPI serving). The GenAI track begins; reuses your fraud model + streaming instincts. DSA spaced-rep continues Days 1/3/5/7.
---
# 📅 Week 7 — AI Engineering I: RAG + vector search + evaluation
> **Phase goal:** build a *real, evaluated* retrieval-augmented-generation service — not a toy demo. The differentiator is **eval**: most candidates can wire a RAG chain; few can measure whether it's any good. Artifact: a public **`rag-eval-service`** repo — ingest → chunk → embed → retrieve → generate → **Ragas-scored** → served behind FastAPI, with the eval numbers in the README. 🎮 **Save rule:** each day commits a working stage; a day is cleared when the stage runs + (from D46) the eval score moves.
> 🧠 **DSA stays warm:** Days 1/3/5/7 (Days 43/45/47/49) open with a 15–20 min spaced-rep warm-up — book-closed, name the trigger + pattern + complexity first.
> 🧩 **Your bridge:** RAG retrieval is *search + ranking over your data*; eval is *test-driven development for a non-deterministic system* (your W2 testing instinct). You're not starting cold.
## Day 43 — Embeddings & vector search foundations 🎮 Level 43
> 🎯 **Cutoff target:** embed a corpus, store vectors in pgvector, and run a similarity query that returns sensible neighbours.
> 🔁 **DSA warm-up (binary search — 15 min, book closed):** [Search Insert Position](https://leetcode.com/problems/search-insert-position/). Trigger "sorted + find position" → binary search, O(log n).
**📖 The concept (what & why engineers use it).** An embedding maps text (or any data) to a vector such that *semantically similar things land near each other*. Vector search finds nearest neighbours by cosine/dot distance — "retrieve by meaning," not keyword match. Engineers use it for RAG, semantic search, dedup, recommendations, and clustering. This is the foundation of the entire GenAI retrieval stack; under the hood it's "an index for meaning," which maps cleanly onto your index-and-lookup instincts.
**🔀 Alternatives & when to pick them.** pgvector (Postgres extension) → you already have Postgres, modest scale, want SQL + vectors together (great default for you). Dedicated vector DBs (Qdrant, Weaviate, Milvus) → large scale, advanced filtering, high QPS. FAISS → in-process, max speed, no persistence layer. Managed (Pinecone) → don't want to run infra. Keyword search (BM25) → exact-term matching; often *combined* with vectors (hybrid).
**🚧 Roadblock → fix.** The trap: treating cosine similarity as "relevance." High similarity ≠ correct answer — embeddings capture topical closeness, not factual match, so retrieval can return plausible-but-wrong chunks. Fix: hybrid search (BM25 + vector) + reranking (D45), and *measure* with eval (D46). Second gotcha: mismatched embedding models between index and query (you must embed queries with the *same* model you indexed with).
**💡 Key ideas / hints.** Distance metrics: cosine (most common for text), dot, L2. Dimensionality (e.g. 384, 768, 1536) is fixed by the model. ANN indexes (HNSW, IVFFlat) trade a little recall for big speed — exact search doesn't scale.
**📚 Read (what + how).** [pgvector README](https://github.com/pgvector/pgvector) — **extract:** creating a vector column, `<=>` cosine operator, HNSW/IVFFlat index. Skim [a sentence-transformers quickstart](https://www.sbert.net/) — **extract:** how to embed text locally (free, no API key).
**🎮 Build & save (the real test).** Stand up Postgres + pgvector (docker). Pick a corpus (your own Substack posts, or docs). Embed with a local `sentence-transformers` model; store vectors; create an HNSW index; run a few similarity queries and eyeball the neighbours. **Commit** (`day43: pgvector + embeddings`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] corpus embedded + stored in pgvector with an ANN index
- [ ] similarity query returns sensible neighbours ✅ checkpoint
**🏆 Reward:** DSA `+25` · read `+30` · build `+50` · recall `+25` · perfect-day `+25` = **up to 155 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] What does an embedding actually encode, and why is cosine-similarity ≠ correctness?
- [ ] When would you pick a dedicated vector DB over pgvector?
## Day 44 — Chunking & ingestion 🎮 Level 44
> 🎯 **Cutoff target:** an ingestion pipeline that chunks documents sensibly, with metadata, and you can articulate the chunk-size tradeoff.
**📖 The concept (what & why engineers use it).** Chunking splits documents into retrieval-sized pieces before embedding. It's quietly *the* highest-leverage knob in RAG quality: too big and a chunk dilutes the relevant bit (poor precision, and you blow the context budget); too small and you lose the surrounding context needed to answer. Engineers spend real effort here because retrieval quality caps the whole system — a perfect LLM can't answer from a bad chunk.
**🔀 Alternatives & when to pick them.** Fixed-size + overlap → simplest, decent baseline. Recursive/structural (split on headings/paragraphs) → respects document structure, usually better. Semantic chunking (split on embedding-similarity shifts) → best quality, more compute. Per-document-type (code vs prose vs tables) → when corpus is heterogeneous. Start simple (recursive + overlap), improve if eval says so.
**🚧 Roadblock → fix.** The trap: chunking mid-sentence / mid-table so meaning is severed, or zero overlap so an answer spanning a boundary is unretrievable. Fix: overlap (e.g. 10–20%) + structure-aware splitting + attach metadata (source, section, doc id) so you can cite and filter. Second gotcha: not storing enough metadata → you can't filter retrieval (by date/source) or show citations later.
**💡 Key ideas / hints.** Chunk size + overlap are eval-driven, not guessed. Metadata enables filtered retrieval + citations (which matter for trust). Keep a stable doc-id so re-ingestion is idempotent (your CDC/idempotency instinct — re-embed only changed docs).
**📚 Read (what + how).** [LangChain — Text Splitters](https://python.langchain.com/docs/concepts/text_splitters/) — **extract:** recursive splitter, chunk size/overlap, metadata. Skim [Pinecone's chunking guide](https://www.pinecone.io/learn/chunking-strategies/) — **extract:** the size tradeoff + strategies.
**🎮 Build & save (the real test).** Build `ingest.py`: load docs → recursive/structure-aware chunk with overlap → attach metadata (source, section, doc_id) → embed → upsert to pgvector keyed on a stable chunk id (idempotent re-ingestion). **Commit** (`day44: chunking + ingestion`).
**✅ Done when:**
- [ ] documents chunked with overlap + metadata
- [ ] re-running ingestion is idempotent (no duplicate chunks)
- [ ] you can state your chunk-size/overlap choice + why ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Why is chunk size the highest-leverage RAG knob? State both failure directions.
- [ ] What metadata do you attach and what does each enable?
## Day 45 — The RAG chain: retrieve → generate (+ reranking) 🎮 Level 45
> 🎯 **Cutoff target:** an end-to-end RAG function answers a question from retrieved context with citations, and you've added a reranking step.
> 🔁 **DSA warm-up (heaps — 18 min, book closed):** [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/). Trigger "K closest" → max-heap of size k (or sort), O(n log k). *Note: reranking top-k is the same shape.*
**📖 The concept (what & why engineers use it).** RAG = retrieve relevant chunks, stuff them into the prompt as context, let the LLM generate an answer grounded in them. It exists to fix the LLM's two big failures: stale knowledge and hallucination — ground the model in *your* retrieved facts. **Reranking** adds a second, more precise scoring pass over the top-N candidates (a cross-encoder reads query+chunk together) to push the truly relevant chunks to the top before generation. Engineers reach for RAG whenever answers must reflect private/current data.
**🔀 Alternatives & when to pick them.** RAG → answers must be grounded in a knowledge base (the default for Q&A over your data). Fine-tuning → when you need behavior/style/format change, not fresh facts (RAG for knowledge, fine-tune for behavior — a key interview distinction). Long-context stuffing → small, fixed corpus that fits in context. Agentic/tool-use (W8) → when the task needs actions, not just retrieval. Reranking → add when retrieval recall is fine but precision (top-1 quality) is weak.
**🚧 Roadblock → fix.** The defining RAG failure: **hallucination despite retrieval** — the model answers from its own priors and ignores (or contradicts) the context. Fixes: a strict prompt ("answer ONLY from the context; if it's not there, say you don't know"), include citations, and *measure faithfulness* (D46). Second gotcha: retrieving k too high → context bloat, lower-quality chunks dilute the prompt, cost/latency up → rerank and trim.
**💡 Key ideas / hints.** Pipeline: embed query → ANN retrieve top-N → rerank → take top-k → prompt with context + citations → generate. "Answer only from context, else say I don't know" is the anti-hallucination instruction. Return sources for trust + later eval.
**📚 Read (what + how).** [LangChain — RAG tutorial](https://python.langchain.com/docs/tutorials/rag/) — **extract:** retriever → prompt → LLM wiring. Skim [a cross-encoder reranking explainer](https://www.sbert.net/examples/applications/retrieve_rerank/README.html) — **extract:** why a second pass beats bi-encoder alone.
**🎮 Build & save (the real test).** Build `rag.py`: query → retrieve top-N from pgvector → rerank (cross-encoder) → top-k → prompt (context + "cite sources, else say I don't know") → generate (use the Anthropic API or a local model). Return the answer **with citations**. Test a question whose answer is in the corpus and one that isn't (it should decline). **Commit** (`day45: rag chain + rerank + citations`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] end-to-end RAG answers from context with citations
- [ ] an out-of-corpus question gets "I don't know," not a hallucination ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] RAG vs fine-tuning — which for fresh facts, which for behavior, and why?
- [ ] What does reranking add over plain vector retrieval, and when is it worth it?
## Day 46 — Evaluation with Ragas (your differentiator) ⭐🎮 Level 46
> 🎯 **Cutoff target:** an eval harness scores the RAG system on faithfulness + answer-relevancy + context-precision/recall over a question set — a real number you can move.
**📖 The concept (what & why engineers use it).** RAG eval measures whether the system is actually *good*, with metrics that decompose the pipeline: **faithfulness** (is the answer grounded in the retrieved context, i.e. not hallucinated?), **answer relevancy** (does it address the question?), **context precision/recall** (did retrieval fetch the right stuff?). Engineers treat this as the core skill because RAG is non-deterministic — without eval you're "vibes-tuning," and you can't tell if a change helped. **Ragas** is the standard library; an LLM-as-judge scores each dimension. This is test-driven development for AI, and it's what makes your project senior-grade.
**🔀 Alternatives & when to pick them.** Ragas → RAG-specific, decomposed metrics (the default here). DeepEval / promptfoo → general LLM eval + assertions + CI integration. LLM-as-judge (custom) → when you need a bespoke rubric. Human eval → gold standard, expensive — use to validate your automated metrics. Golden Q&A set → always build one; it's your regression suite.
**🚧 Roadblock → fix.** The trap: optimizing one metric and quietly wrecking another — e.g. retrieving more chunks lifts context-recall but tanks faithfulness (more noise → more hallucination). Fix: track the *whole vector* of metrics, change one variable at a time, and keep a fixed golden set so runs are comparable (regression testing). Second gotcha: LLM-judge noise → use a capable judge model, average over a real question set (not 3 questions), and sanity-check against a few human judgments.
**💡 Key ideas / hints.** Faithfulness = the anti-hallucination metric (most important for trust). Build a golden Q&A set first — it's your regression suite. Eval makes every later change (chunking, k, rerank, prompt) measurable. Put the scores in the README — *that's* the thing hiring managers rarely see.
**📚 Read (what + how).** [Ragas docs — metrics + quickstart](https://docs.ragas.io/) — **extract:** faithfulness, answer relevancy, context precision/recall, how to run an eval set.
**🎮 Build & save (the real test).** Build `eval.py`: a golden set of \~15–25 Q&A over your corpus; run Ragas to score the D45 system; record the baseline metric vector. Then change ONE thing (chunk size or k or rerank on/off), re-run, and show the metric delta in the README. **Commit** (`day46: ragas eval harness + baseline`).
**✅ Done when:**
- [ ] golden Q&A set built
- [ ] Ragas reports faithfulness + relevancy + context metrics (a baseline)
- [ ] one change measured as a metric delta (not vibes) ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥. ⭐ This day is the portfolio differentiator — make the eval table the centerpiece of the README.
**🔁 Recall (boss check, book closed):**
- [ ] Define faithfulness vs answer-relevancy vs context-recall. Which catches hallucination?
- [ ] Why change one variable at a time against a fixed golden set?
## Day 47 — Serve it: FastAPI + streaming + the eval gate 🎮 Level 47
> 🎯 **Cutoff target:** the RAG system is a FastAPI `/ask` endpoint (streaming, validated, observable), and eval runs in CI as a quality gate.
> 🔁 **DSA warm-up (two pointers — 18 min, book closed):** [3Sum](https://leetcode.com/problems/3sum/). Trigger "triplet that sums to 0, sorted" → sort + two pointers, O(n²).
**📖 The concept (what & why engineers use it).** Serving turns your pipeline into a product: an HTTP API others can call, with request validation (Pydantic — W1!), streaming responses (tokens as they generate, for UX), error handling, and observability (W2!). The senior move: wire your **eval as a CI gate** — a PR that drops faithfulness below a threshold fails, exactly like a unit test. Engineers do this because an unevaluated, unserved model isn't a system; this is where all your prior weeks converge (Pydantic validation, structured logs/metrics, resilience).
**🔀 Alternatives & when to pick them.** FastAPI → async, Pydantic-native, streaming, the default for Python AI services (you already know the pieces). LangServe / LiteLLM proxy → faster wiring if you want less control. BentoML / Ray Serve → heavier ML-serving infra (batching, GPU) — overkill here. Streaming via SSE → for token-by-token UX; plain JSON for batch.
**🚧 Roadblock → fix.** The trap: shipping an LLM endpoint with no guardrails → no timeout (a slow generation hangs the worker), no input validation (prompt-injection / oversized inputs), no cost cap. Fix: Pydantic-validate inputs, set timeouts + max tokens, rate-limit, and apply the resilience patterns from W2 (retry the model call, circuit-break the vector DB). Second gotcha: blocking the event loop with a sync embedding/LLM call → use async clients or `to_thread` (W2 Day 11 lesson).
**💡 Key ideas / hints.** `/ask` (RAG) endpoint; stream tokens via SSE/`StreamingResponse`. Emit the W2 observability: structured log per request + latency histogram + a retrieval-hit counter. Eval-in-CI = the quality gate (your W5 data-quality-gate instinct, now for the model).
**📚 Read (what + how).** [FastAPI — first steps + async](https://fastapi.tiangolo.com/) + [StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse) — **extract:** Pydantic request/response models, async endpoints, streaming.
**🎮 Build & save (the real test).** Wrap D45's RAG in FastAPI `/ask`: Pydantic request/response, streaming, timeout + max-tokens, structured logging + a latency metric. Add a GitHub Action that runs `eval.py` and **fails if faithfulness \< threshold**. **Commit** (`day47: fastapi serve + eval-in-CI gate`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] `/ask` streams, validates input, emits logs + a latency metric
- [ ] CI fails a PR when the eval score drops below threshold ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] What guardrails does an LLM endpoint need that a CRUD endpoint doesn't?
- [ ] How is "eval-in-CI" the same idea as your W5 data-quality gate?
## Day 48 — Iterate on eval: improve the number 🎮 Level 48
> 🎯 **Cutoff target:** measurably improve at least one Ragas metric vs the D46 baseline, with each change logged as an experiment.
**📖 The concept (what & why engineers use it).** This is the *loop* that defines an AI engineer: hypothesize → change one thing → re-run eval → keep or revert based on the number. Engineers do this because RAG quality comes from disciplined iteration, not a lucky first build — and being able to *show the iteration log* ("faithfulness 0.71 → 0.86 by adding reranking + tightening the prompt") is exactly the senior signal interviewers probe for. It's the scientific method applied to a non-deterministic system.
**🔀 Levers & when to pull them (the tradeoff).** Chunking (size/overlap/strategy) → fixes retrieval precision/recall. Retrieval k + reranking → precision vs context-bloat. Hybrid search (BM25 + vector) → fixes "keyword-y" queries vectors miss. Prompt (stricter grounding) → fixes faithfulness. Better embedding model → broad lift, more cost. Query rewriting/expansion → fixes vague queries. Pull the lever the *metrics* point to (low context-recall → retrieval; low faithfulness → prompt/rerank).
**🚧 Roadblock → fix.** The trap: changing five things at once → you can't attribute the gain (or the regression). Fix: one variable per experiment, logged in an `experiments.md` table (change → metric deltas → keep/revert). Second gotcha: overfitting to the golden set → keep a held-out question set you only check occasionally.
**💡 Key ideas / hints.** Diagnose from the metric vector: low context-recall → retrieval/chunking; low faithfulness → prompt/rerank; low answer-relevancy → generation/prompt. Log every run. Revert anything that doesn't help.
**📚 Read (what + how).** Re-skim [Ragas — interpreting metrics](https://docs.ragas.io/) — **extract:** which metric points to which fix. (No new tool today — this is deliberate practice.)
**🎮 Build & save (the real test).** Run 3–4 experiments (e.g. add hybrid search, tune chunk size, stricter prompt, swap embedding model), each logged in `experiments.md` with metric deltas. Keep the winners; revert the rest. Update the README eval table with before/after. **Commit** (`day48: eval iteration log + improved metrics`).
**✅ Done when:**
- [ ] ≥3 experiments logged with metric deltas
- [ ] at least one metric beats the D46 baseline
- [ ] README shows the before/after improvement ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Given low context-recall but high faithfulness, which lever do you pull and why?
- [ ] Why one-variable-at-a-time, and why hold out a separate question set?
## Day 49 — Ship + write-up 🎮 Boss Level
> 🎯 **Cutoff target:** `rag-eval-service` is public — runnable, eval table front-and-center, architecture diagram, green CI with the eval gate.
> 🔁 **DSA warm-up (mixed — 18 min, book closed):** [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/). Trigger "all-but-self, no division" → prefix/suffix passes, O(n). *Recognize it's a two-pass scan, not brute force.*
**📖 Why today.** A RAG demo is common; a RAG service with a **published eval methodology + iteration log** is rare and senior. Make that legible in 90 seconds.
**🎮 Build & ship (the real test).**
- [ ] `docker compose up` brings up pgvector + the API.
- [ ] README leads with the **eval table** (baseline → improved, the metrics, the methodology), then architecture (ingest → chunk → embed → retrieve → rerank → generate → eval → serve), then the `experiments.md` story.
- [ ] Green CI with the eval gate (from D47).
- [ ] **Post:** a write-up in your own voice — e.g. "Don't ship RAG you haven't evaluated: faithfulness, context-recall, and how I moved them" (Substack + LinkedIn). **Commit** (`day49: ship rag-eval-service`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] repo public, runnable, eval table + diagram + green CI gate
- [ ] write-up posted ✅ checkpoint
**🏆 Reward:** up to **155 XP** + 🏔️ **Week 7 complete** — claim your week reward. You can now build RAG *and prove it works* — the thing most candidates can't. 🔥🔥
**🔁 Recall (boss check, book closed) — cumulative:**
- [ ] No notes, 2 min: walk the RAG lifecycle — chunk → embed → retrieve → rerank → generate → eval → serve → iterate. Name the dominant failure + the metric that catches it at each stage.
---
> ⏭️ **Week 8** (AI Engineering II — LLMOps: MLflow registry for your fraud model, Evidently drift, Langfuse/Phoenix tracing, a LangGraph agent, guardrails, integrate /predict + /ask + /act). DSA spaced-rep continues Days 1/3/5/7.
# 📅 Week 8 — AI Engineering II: LLMOps, agents & the unified service (Days 50–56)
> **Phase goal:** operate models in production like an engineer, not a notebook-runner — registry + versioning, drift detection, LLM tracing, a real agent with guardrails — then **converge everything into one service** exposing `/predict` (your fraud model), `/ask` (RAG from W7), and `/act` (an agent). Artifact: a public **`ai-serving-platform`** repo. 🎮 **Save rule:** each day commits a working capability; a day is cleared when it runs + emits an observable signal (a logged trace, a drift metric, a registered version).
> 🧠 **DSA stays warm:** Days 1/3/5/7 (Days 50/52/54/56) open with a 15–20 min spaced-rep warm-up — book-closed, name the trigger + pattern + complexity first.
> 🧩 **Your bridge:** this is W2 observability + W6 self-healing applied to ML/LLMs. You already built the fraud model (LightGBM+MLflow) and the RAG service — this week makes them *operable*.
## Day 50 — MLflow model registry: version, stage, serve 🎮 Level 50
> 🎯 **Cutoff target:** your fraud model is registered with versions + stages (Staging/Production), loaded from the registry, and served behind `/predict`.
> 🔁 **DSA warm-up (hashmaps — 15 min, book closed):** [Two Sum II (sorted)](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/). Trigger "sorted + pair sum" → two pointers (sorted flips this from hashmap to two-pointer — recognition practice).
**📖 The concept (what & why engineers use it).** A model registry is version control for models: every trained model gets a version, a stage (Staging → Production → Archived), lineage (which data/run produced it), and a single load-by-name API so serving code never hardcodes a file path. Engineers need it because "which model is actually in prod, and can I roll back?" must have a crisp answer — the model equivalent of your Iceberg snapshots + rollback. You already used MLflow for tracking; this is the *operational* half.
**🔀 Alternatives & when to pick them.** MLflow Registry → open, self-hostable, you already use it (default). SageMaker / Vertex Model Registry → if you're all-in on that cloud. Weights & Biases → strong experiment tracking + registry, popular in research. Plain S3 + a metadata table → only for the simplest cases. The interview point: *have* a registry with stages + rollback, whatever the tool.
**🚧 Roadblock → fix.** The trap: training and serving compute features differently → **training/serving skew** (the model sees different inputs in prod than in training, silently degrading). Fix: a shared feature-transform module used by both paths (a mini feature store), and log the feature schema with the model. Second gotcha: no rollback path → always keep the previous Production version so promoting a bad model is one stage-transition to undo.
**💡 Key ideas / hints.** Register by name + version; transition stages via the API. Load with `models:/FraudModel/Production` so serving is decoupled from storage. Log the input schema/signature so bad inputs fail fast (Pydantic at the boundary — W1).
**📚 Read (what + how).** [MLflow Model Registry](https://mlflow.org/docs/latest/model-registry.html) — **extract:** register, stages/aliases, load-by-stage. Skim [MLflow model signatures](https://mlflow.org/docs/latest/model/signatures.html) — **extract:** schema enforcement.
**🎮 Build & save (the real test).** Register your existing fraud model in MLflow; create v1 → Staging → Production; load it by stage in a FastAPI `/predict` endpoint (Pydantic-validated input matching the logged signature). Confirm a rollback = one stage transition. **Commit** (`day50: model registry + /predict`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] fraud model registered with versions + Production stage
- [ ] `/predict` loads from the registry by stage; rollback path proven ✅ checkpoint
**🏆 Reward:** DSA `+25` · read `+30` · build `+50` · recall `+25` · perfect-day `+25` = **up to 155 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] What does a registry give you that a saved `.pkl` doesn't? Name the rollback story.
- [ ] What is training/serving skew and how do you prevent it?
## Day 51 — Drift detection with Evidently 🎮 Level 51
> 🎯 **Cutoff target:** a drift report flags when incoming data (or predictions) diverge from the training baseline, emitting a metric you could alert on.
**📖 The concept (what & why engineers use it).** Models silently rot as the world changes — **data drift** (input distributions shift) and **concept drift** (the input→output relationship shifts). Drift detection statistically compares live data to a training baseline and flags divergence *before* accuracy visibly craters. Engineers need it because a model with no drift monitoring is a silent time-bomb; this is the ML-specific form of your W2 observability and feeds the W6 self-healing loop (drift → alert → retrain).
**🔀 Alternatives & when to pick them.** Evidently → open, rich reports + metrics, easy to wire (default). NannyML → strong on *estimating* performance without labels (great when labels are delayed — common in fraud). whylogs/WhyLabs → data logging + monitoring at scale. Custom PSI/KS tests → when you want a tiny dependency-free check. Pick by whether you have timely labels.
**🚧 Roadblock → fix.** The trap: **alerting on statistical drift that doesn't matter** — a p-value trips on a harmless shift and everyone tunes out (alert fatigue). Fix: tie drift thresholds to *business* impact, monitor the highest-importance features, and distinguish "drift detected" from "performance dropped." Second gotcha (fraud especially): labels arrive late, so you can't measure accuracy now → use drift + performance-estimation as the leading indicator.
**💡 Key ideas / hints.** Data drift = input shift; concept drift = relationship shift (needs labels or estimation). PSI / KS test / Wasserstein are the common drift stats. The output: a drift metric + report you can gate/alert on (→ retrain trigger in the capstone).
**📚 Read (what + how).** [Evidently — Get Started + Data Drift](https://docs.evidentlyai.com/) — **extract:** reference vs current dataset, drift report, metrics you can extract.
**🎮 Build & save (the real test).** Add an Evidently drift check to the fraud pipeline: training set = reference, a shifted sample = current; generate a drift report + extract a numeric drift score; expose it as a metric (Prometheus, reusing W2). Write the "when would this trigger a retrain?" rule. **Commit** (`day51: drift detection`).
**✅ Done when:**
- [ ] drift report compares current vs reference + emits a drift metric
- [ ] a deliberately shifted input set trips the detector
- [ ] retrain-trigger rule written (ties to capstone self-healing) ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Data drift vs concept drift — which can you detect without labels?
- [ ] How do you avoid drift-alert fatigue?
## Day 52 — LLM observability: tracing with Langfuse/Phoenix 🎮 Level 52
> 🎯 **Cutoff target:** every `/ask` call produces a trace (prompt, retrieved context, tokens, latency, cost) you can inspect — and you can find the slowest/most-expensive step.
> 🔁 **DSA warm-up (sliding window — 18 min, book closed):** [Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/). Trigger "longest window with ≤k changes" → window + count, O(n).
**📖 The concept (what & why engineers use it).** LLM tracing records each step of a generation/agent run — the prompt, retrieved chunks, tool calls, token counts, latency, and cost — so you can debug *why* an answer was bad and *what* it cost. Engineers need it because LLM apps fail in opaque ways (bad retrieval? bad prompt? wrong tool?) and cost/latency are real production concerns. This is distributed tracing (W2 OTel) specialized for LLMs, and it's how you actually operate the W7 RAG service.
**🔀 Alternatives & when to pick them.** Langfuse → open-source, self-hostable, great traces + cost + eval hooks (recommended). Arize Phoenix → strong on eval + embedding-drift visualization, open. LangSmith → tight LangChain integration (managed). Plain OpenTelemetry → vendor-neutral but you build the LLM-specific views. Pick Langfuse for self-hosting + your privacy-first leaning.
**🚧 Roadblock → fix.** The trap: logging full prompts/responses with **PII or secrets** into a trace store → a compliance problem. Fix: redact/mask sensitive fields, sample high-volume traces, and scope retention. Second gotcha: tracing overhead on the hot path → trace async/sampled, never block the response on writing a trace.
**💡 Key ideas / hints.** A trace = nested spans (retrieve → rerank → generate), each with metadata (tokens, cost, latency). Tie a trace id to your structured logs (W2) so one request is debuggable end-to-end. Cost-per-request is a first-class metric now.
**📚 Read (what + how).** [Langfuse — Get Started + Tracing](https://langfuse.com/docs) — **extract:** spans/generations, how to wrap a RAG call, cost + latency capture.
**🎮 Build & save (the real test).** Instrument W7's `/ask` with Langfuse (self-hosted via docker): trace retrieve → rerank → generate, capturing tokens/cost/latency per span. Run a few queries; use the UI to find the slowest + priciest step. Redact any sensitive field. **Commit** (`day52: LLM tracing`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] `/ask` emits a full trace (prompt, context, tokens, cost, latency)
- [ ] you identified the slowest/priciest step from the trace ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] What does an LLM trace capture that a normal log line doesn't?
- [ ] Two risks of naive LLM tracing and the fix for each.
## Day 53 — Build a LangGraph agent 🎮 Level 53
> 🎯 **Cutoff target:** a LangGraph agent that, given a question, decides to retrieve / call a tool / answer — as an inspectable state graph, not an opaque loop.
**📖 The concept (what & why engineers use it).** An agent is an LLM that *decides and acts in a loop* — choosing tools, observing results, and iterating toward a goal, rather than answering in one shot. **LangGraph** models this as an explicit **state graph** (nodes = steps, edges = transitions, with state passed along) — which makes agents debuggable, resumable, and controllable vs a free-running while-loop. Engineers use agents when a task needs multiple steps or tool use; the graph framing is what makes them production-safe. (This pattern keeps winning data-engineering hackathons: teams that ship a small graph of persona-agents beat teams that ship another dashboard.)
**🔀 Alternatives & when to pick them.** LangGraph → controllable, stateful, inspectable multi-step agents (recommended; the graph = your W6 control-loop instinct). Plain function-calling / tool-use loop → simplest, when one or two tool calls suffice (often enough — don't over-agent). CrewAI / AutoGen → multi-agent collaboration framings. No agent at all → if RAG or a single tool call answers it, skip the agent (agents add latency, cost, failure modes). The senior move: justify *why* a task needs an agent.
**🚧 Roadblock → fix.** The classic agent failure: **infinite loops / runaway cost** — the agent keeps calling tools without converging. Fix: a max-step/recursion limit, a budget cap, and explicit termination conditions in the graph (LangGraph makes these first-class). Second gotcha: the agent confidently calls a tool with wrong/hallucinated args → validate tool inputs (Pydantic), and make tools return structured errors the agent can recover from.
**💡 Key ideas / hints.** Nodes = steps (plan / retrieve / call-tool / answer); edges = conditional transitions on state. State carries the conversation + intermediate results. A checkpointer makes runs resumable (your idempotency/recovery instinct). Keep tools small + well-described.
**📚 Read (what + how).** [LangGraph — Quickstart + concepts](https://langchain-ai.github.io/langgraph/) — **extract:** StateGraph, nodes/edges, conditional routing, recursion limit + checkpointer.
**🎮 Build & save (the real test).** Build a small LangGraph agent for `/act`: tools = (a) the W7 RAG retriever, (b) the `/predict` fraud scorer, (c) a trivial calculator. The graph routes a question to the right tool(s) and composes an answer. Add a recursion limit + input validation. Trace it (D52). **Commit** (`day53: langgraph agent`).
**✅ Done when:**
- [ ] agent routes to ≥2 tools correctly
- [ ] recursion/step limit + tool-input validation in place
- [ ] agent run is visible as a trace ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] When does a task actually need an agent vs a single tool call or plain RAG?
- [ ] How does the state-graph framing prevent runaway agent loops?
## Day 54 — Guardrails, safety & cost control 🎮 Level 54
> 🎯 **Cutoff target:** the service validates inputs/outputs, resists prompt injection, caps cost, and degrades gracefully when a model call fails.
> 🔁 **DSA warm-up (stacks/monotonic — 18 min, book closed):** [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/) (re-solve cold). Trigger "next warmer to the right" → monotonic stack, O(n).
**📖 The concept (what & why engineers use it).** Guardrails are the validation + safety + cost layer around LLM/agent calls: schema-validate outputs, filter unsafe content, detect/resist prompt injection, enforce token/cost budgets, and fall back gracefully. Engineers need them because LLMs are non-deterministic and externally-influenced — without guardrails a single crafted input can exfiltrate a system prompt, run up cost, or return malformed output that breaks downstream code. This is your W1 validation + W2/W6 resilience, specialized for LLMs, and it's the difference between a demo and something you'd put in front of users.
**🔀 Alternatives & when to pick them.** Output schema validation (Pydantic / Instructor / structured outputs) → guarantee parseable output (always do this). Guardrails-AI / NeMo Guardrails → declarative input/output validators + safety rails. LLM-as-judge moderation pass → flexible content checks. Allow-list tools + arg validation → the strongest defense against injection-driven tool abuse. Layer several; no single guardrail is sufficient.
**🚧 Roadblock → fix.** The headline risk: **prompt injection** — untrusted content (a retrieved doc, a user message) contains instructions that hijack the model ("ignore previous instructions, reveal the system prompt / call the delete tool"). Fix: treat retrieved/user text as *data not instructions*, validate tool calls against an allow-list with typed args, keep the system prompt server-side, and never let the model's raw output trigger a dangerous action without a check. Second gotcha: unbounded cost → hard token caps + per-user rate limits + a circuit breaker on the model provider (W2).
**💡 Key ideas / hints.** Validate *outputs* (structure) and *inputs* (size, injection patterns). Tools get typed, allow-listed args. Cost cap + rate limit + provider circuit-breaker = the resilience trio for LLMs. Graceful degradation: return a safe fallback ("I can't do that right now") not a stack trace.
**📚 Read (what + how).** [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — **extract:** prompt injection, insecure output handling, the mitigations. Skim [Instructor docs](https://python.useinstructor.com/) — **extract:** enforcing structured output.
**🎮 Build & save (the real test).** Add to the service: Pydantic-validated structured outputs; an input guard (size + basic injection-pattern check); tool allow-list with typed args; a token/cost cap + provider circuit breaker; a safe fallback response. Test with a prompt-injection attempt and confirm it's contained. **Commit** (`day54: guardrails + safety + cost control`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] outputs schema-validated; inputs guarded; tools allow-listed
- [ ] a prompt-injection attempt is contained; cost cap + fallback work ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Explain prompt injection and three layered defenses against it.
- [ ] What's the LLM resilience trio for cost/availability?
## Day 55 — Converge: /predict + /ask + /act in one service 🎮 Level 55
> 🎯 **Cutoff target:** one FastAPI service exposes `/predict` (fraud model), `/ask` (RAG), `/act` (agent) — shared config, logging, tracing, metrics — running via docker compose.
**📖 The concept (what & why engineers use it).** Convergence is the architectural payoff: instead of three demos, you ship one coherent **AI serving platform** with shared cross-cutting concerns (config, auth, structured logging, tracing, metrics, error handling) and three capabilities behind a clean API. Engineers value this because real platforms expose *multiple* model/AI capabilities through consistent infrastructure — and it's the single best portfolio artifact for your "AI + Data Engineer" target identity. Everything you built (W1 typing/config, W2 observability/resilience, W7 RAG, this week's registry/drift/tracing/agent/guardrails) lands here.
**🔀 Alternatives & when to pick them.** Modular monolith (one FastAPI app, clean internal modules) → recommended for a portfolio + most real services (simple to run + reason about). Microservices (separate deploys per capability) → only at real scale/team boundaries; overkill here and harder to demo. Serverless functions → spiky low-volume workloads. Pick the monolith and *say why* (you can articulate when you'd split).
**🚧 Roadblock → fix.** The trap: three endpoints that secretly duplicate config/logging/error-handling → drift and inconsistency. Fix: shared dependencies (FastAPI `Depends` for config/clients), one logging+tracing setup, one error-handler, one metrics registry — DRY cross-cutting concerns. Second gotcha: one slow capability (the agent) starving the others → separate timeouts/limits per route, and isolate heavy work (W6 bulkhead).
**💡 Key ideas / hints.** Shared: Settings (W1 Pydantic), structured logging + trace ids (W2/D52), Prometheus metrics (W2), error handlers, model/vector clients via `Depends`. Per-route: its own timeout, cost cap, and guardrails. `/healthz` + `/metrics` endpoints. One `docker compose` brings up app + Postgres/pgvector + MLflow + Langfuse.
**📚 Read (what + how).** [FastAPI — Bigger Applications / dependencies](https://fastapi.tiangolo.com/tutorial/bigger-applications/) — **extract:** routers, shared `Depends`, app structure. (No new concept — this is integration.)
**🎮 Build & save (the real test).** Merge the pieces into `ai-serving-platform`: routers for `/predict`, `/ask`, `/act`; shared config/logging/tracing/metrics via dependencies; per-route guardrails + timeouts; `/healthz` + `/metrics`; one `docker compose` for the whole stack. **Commit** (`day55: unified ai-serving-platform`).
**✅ Done when:**
- [ ] all three endpoints work behind shared infra (config/logging/tracing/metrics)
- [ ] per-route guardrails + timeouts; `/healthz` + `/metrics` live
- [ ] `docker compose up` brings up the whole stack ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Modular monolith vs microservices here — which and why?
- [ ] Name the cross-cutting concerns you DRY'd across the three routes.
## Day 56 — Ship + write-up 🎮 Boss Level
> 🎯 **Cutoff target:** `ai-serving-platform` is public — runnable, documented, traced, with an architecture diagram and green CI.
> 🔁 **DSA warm-up (trees/graphs — 18 min, book closed):** [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/). Trigger "ordering with prereqs" → topological sort (Kahn), O(V+E).
**📖 Why today.** This repo is the centerpiece of your "AI Engineer" claim — a service that serves a classical model *and* RAG *and* an agent, with registry, drift, tracing, guardrails, and observability. Make a hiring manager get it in 90 seconds.
**🎮 Build & ship (the real test).**
- [ ] README: architecture diagram (the three endpoints + shared infra + MLflow/Langfuse/pgvector), what each capability does, and the LLMOps story (versioning, drift, tracing, guardrails).
- [ ] `docker compose up` runs the whole platform; documented example calls for each endpoint.
- [ ] Green CI (lint + tests + the W7 eval gate + a smoke test hitting all three routes).
- [ ] **Post:** a write-up — e.g. "From a fraud model to an AI platform: registry, drift, tracing, agents, guardrails" (Substack + LinkedIn). **Commit** (`day56: ship ai-serving-platform`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] repo public + runnable; diagram + LLMOps story in README; green CI
- [ ] write-up posted ✅ checkpoint
**🏆 Reward:** up to **155 XP** + 🏔️ **Week 8 complete** — claim your week reward. You can now *operate* AI in production: version it, watch it drift, trace it, agent-ify it, and guard it. 🔥🔥
**🔁 Recall (boss check, book closed) — cumulative:**
- [ ] No notes, 3 min: walk a request through the platform — validate → route → (predict \| retrieve+generate \| agent-act) → guardrail → trace → metric. Name the failure mode + defense at each hop, and where drift/registry fit the lifecycle.
---
> ⏭️ **Weeks 9–11 — Capstone: AI-Ready Lakehouse** (everything converges: CDC→streaming→Iceberg + dbt+quality gate + reconciliation + fraud `/predict` + drift + RAG `/ask` + eval + Grafana + self-healing). Then **Week 12** — mocks + outreach push. DSA spaced-rep continues.
# 📅 Week 9 — Capstone Pt.1: AI-Ready Lakehouse — the ugly-complete slice (Days 57–63)
> **The capstone (W9–11) is ONE project: the AI-Ready Lakehouse.** It fuses everything — CDC→streaming→Iceberg (W4–5) + dbt + a data-quality gate (W5) + reconciliation/self-healing (W6) + the fraud model `/predict` + drift (W8) + RAG `/ask` + eval (W7) + a Grafana dashboard + a LangGraph "investigate-the-break" agent (W8). **W9 = get a thin, ugly, end-to-end slice working** (data in → lakehouse → a model served → one dashboard tile). W10 = the must-haves, polished + README/Loom. W11 = the should-haves (self-healing, agent) + ship.
> 🎯 **W9 goal: an *ugly-complete* vertical slice that runs end-to-end.** Done \> perfect this week. One record should be able to travel the *entire* pipe, even if every stage is minimal.
> 🧠 **DSA stays warm:** Days 1/3/5/7 (Days 57/59/61/63) — 15–20 min, book-closed, name the trigger + pattern + complexity first.
> 📦 **Repo:** new public **`ai-ready-lakehouse`** (the portfolio centerpiece). Each day commits a working stage.
## 🏗️ The capstone tiers (your definition of done — pin this)
> **Tier 1 — MUST (W9–10):** CDC→Spark Streaming→Iceberg · dbt models + tests + quality gate · a reconciliation "Break" detector · fraud model via MLflow `/predict` · Evidently drift · RAG `/ask` · Ragas eval · a Grafana dashboard · docker compose · README · a 10-min Loom.
> **Tier 2 — SHOULD (W11):** auto-remediation (the Sentinel self-healing loop) · a LangGraph "investigate-the-break" agent · LLM tracing · OpenTelemetry · Hypothesis tests.
> **Tier 3 — COULD (only if ahead):** medallion layering · chaos injectors · an operator UI · incremental re-embedding · retrain-on-drift automation.
> **Rule:** build Tier 1 *complete and ugly* first (W9), then make it good (W10), then add Tier 2 (W11). Never start a new tier with the previous one unfinished.
## Day 57 — Architecture + scaffold the slice 🎮 Level 57
> 🎯 **Cutoff target:** a one-page architecture diagram + a running `docker compose` skeleton where every service starts (even if it does almost nothing).
> 🔁 **DSA warm-up (hashmaps — 15 min, book closed):** [Group Anagrams](https://leetcode.com/problems/group-anagrams/). Trigger "group by signature" → dict keyed on sorted-string/char-count, O(n·k).
**📖 Why this first.** A capstone dies when you build three beautiful disconnected pieces that never integrate. The cure is a **walking skeleton**: stand up every service wired together *before* any of them is good, so integration risk is paid down on day one. This is your "tracer bullet" instinct — cut through all layers thin-first.
**🔀 Scope decisions (make them now, write them down).** Source = a simulated CDC feed (reuse your W4 generator). Streaming = Spark Structured Streaming. Lake = Iceberg on MinIO. Transform = dbt. Serving = the W8 `ai-serving-platform` (drop it in). Dashboard = Grafana + Prometheus. Orchestration = Dagster (or compose for now). Pick the *smallest* version of each that can run.
**🚧 Roadblock → fix.** The trap: over-architecting the diagram for weeks. Fix: one diagram, 8 boxes + arrows, 30 minutes, then code. Second: dependency hell in compose → pin versions, start services one at a time, add healthchecks so the stack comes up in order.
**🎮 Build & save (the real test).** Draw `docs/architecture.md` (the 8-box diagram: CDC → Spark → Iceberg → dbt → quality gate → serving (/predict,/ask) → Prometheus → Grafana, with reconciliation + drift hanging off it). Scaffold `docker-compose.yml` with every service + healthchecks; `docker compose up` brings them all green (even if endpoints are stubs). **Commit** (`day57: architecture + compose skeleton`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] architecture diagram committed
- [ ] `docker compose up` starts every service healthy (stubs OK) ✅ checkpoint
**🏆 Reward:** DSA `+25` · plan `+30` · build `+50` · recall `+25` · perfect-day `+25` = **up to 155 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Why a walking skeleton before polishing any single component?
- [ ] Name the 8 boxes and the one arrow most likely to break first.
## Day 58 — Ingest: CDC → Spark Streaming → Iceberg 🎮 Level 58
> 🎯 **Cutoff target:** the simulated CDC feed lands in a raw Iceberg table via a running Structured Streaming job, exactly-once.
**📖 What you're building.** The front of the pipe: events (with op-types I/U/D — your W4 Day 26 lesson) → Spark Structured Streaming → `MERGE INTO` a raw Iceberg table, with a checkpoint for exactly-once (W5 Day 30). This is the part that makes the whole thing "real-time + lakehouse," and it's your core strength on display.
**🚧 Roadblock → fix.** Hard deletes collapsing (the bug you fixed in CDC) → ensure the feed carries the delete op-type and the MERGE handles `WHEN MATCHED AND op='D' THEN DELETE`. Tiny-file blizzard from streaming micro-batches → tune trigger interval + plan compaction (W4 Day 27).
**🎮 Build & save (the real test).** Wire the CDC generator → Structured Streaming → `raw_transactions` Iceberg table with op-type handling + a checkpoint dir. Kill/restart the job; prove no dupes/no loss. **Commit** (`day58: streaming ingest to iceberg`).
**✅ Done when:**
- [ ] streaming job lands CDC events (incl. deletes) into raw Iceberg
- [ ] restart-after-kill = no duplicates / no loss
- [ ] trigger interval tuned to limit tiny files ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] How does this slice guarantee exactly-once, end to end?
- [ ] Where would a hard delete silently break it, and what prevents that?
## Day 59 — Transform + quality gate: dbt + tests 🎮 Level 59
> 🎯 **Cutoff target:** dbt builds `raw → staging → mart` on the Iceberg tables, with tests that **block** the pipeline on bad data.
> 🔁 **DSA warm-up (binary search — 18 min, book closed):** [Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/) (re-solve cold). Trigger "min value such that (monotonic)" → binary-search-the-answer, O(n log m).
**📖 What you're building.** The transform + governance layer: dbt models curate raw → business-ready marts, and dbt tests (not_null/unique/accepted_values/relationships + freshness) act as a **quality gate** that fails the run + quarantines bad batches (W5 Day 32). This is the data-quality story that makes the lakehouse trustworthy.
**🚧 Roadblock → fix.** Tests that warn but don't block → set critical tests to error severity and wire them as a gate. Incremental model double-counting → merge strategy on the natural key (W5 Day 31).
**🎮 Build & save (the real test).** dbt project: `stg_transactions` → `mart_transactions` (incremental, merge on key); tests on keys + an accepted-values + a freshness check; prove a bad batch fails the gate. **Commit** (`day59: dbt models + quality gate`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] dbt builds staging → mart via `ref()`
- [ ] a bad batch fails the gate (error severity) + is quarantined ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] What's in your quality gate, and what does it do on failure?
- [ ] Why incremental-merge-on-key, not insert-append?
## Day 60 — The reconciliation "Break" detector 🎮 Level 60
> 🎯 **Cutoff target:** a job compares the lakehouse mart against the source-of-truth and writes a `breaks` table when they diverge — Sentinel-Lite, now on the capstone.
**📖 What you're building.** This is the heart that ties to your identity: a reconciliation job that detects when the lakehouse has drifted from the source-of-truth (counts/sums/row-level mismatches) and records each divergence as a **"Break"** row (the term finance and payments teams use for a reconciliation mismatch — worth adopting if you are targeting that sector). It's W1–W2 Sentinel-Lite + W6 reconciliation loop, applied to the capstone. W11 will make it *self-heal*; W9 just makes it *detect + record*.
**🚧 Roadblock → fix.** Cross-connection/perf issues comparing big tables → compare aggregates first (cheap), drill to row-level only on a flagged key (your bounded-subquery instinct). False breaks from in-flight data → reconcile as-of a watermark/snapshot (Iceberg time-travel — W4).
**🎮 Build & save (the real test).** A reconciliation job: aggregate-compare source vs mart as-of a snapshot; on divergence, write a `Break(key, kind, source_val, lake_val, detected_at)` row to a `breaks` table; emit a `breaks_total` metric. **Commit** (`day60: reconciliation break detector`).
**✅ Done when:**
- [ ] reconciliation detects an injected divergence + writes a Break row
- [ ] `breaks_total` metric emitted (for the dashboard)
- [ ] reconciles as-of a snapshot (no false breaks from in-flight data) ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥. ⭐ **Suggested framing:** if you want the portfolio to lead on "self-healing systems," this is the component that carries that claim furthest — name it prominently. Pick a different angle if it fits your target roles better; the build stands either way.
**🔁 Recall (boss check, book closed):**
- [ ] What is a "Break," and why reconcile as-of a snapshot?
- [ ] Aggregate-first, drill-on-flag — why that order?
## Day 61 — Serve the model + drift on capstone data 🎮 Level 61
> 🎯 **Cutoff target:** the fraud model scores records from the lakehouse via `/predict` (loaded from MLflow registry), and Evidently drift runs on the live feature distribution.
> 🔁 **DSA warm-up (trees/graphs — 18 min, book closed):** [Number of Islands](https://leetcode.com/problems/number-of-islands/) (re-solve cold). Trigger "connected regions in a grid" → DFS/BFS flood-fill, O(rows·cols).
**📖 What you're building.** Drop your W8 `ai-serving-platform` into the capstone: `/predict` loads the fraud model from the MLflow registry and scores transactions flowing through the lakehouse; Evidently compares the live feature distribution to the training baseline and emits a drift metric. This fuses the data side and the ML side into one system.
**🚧 Roadblock → fix.** Training/serving skew (features computed differently in the pipeline vs training) → shared feature-transform module (W8 Day 50). Drift alert fatigue → threshold on the high-importance features (W8 Day 51).
**🎮 Build & save (the real test).** Wire `/predict` to score from the lakehouse; run Evidently on the live feature set vs the reference; emit `prediction_score` + `feature_drift` metrics. **Commit** (`day61: predict + drift on capstone`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] `/predict` scores lakehouse records from the registry model
- [ ] drift metric emitted on the live distribution ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] How does a record get from CDC all the way to a fraud score? Trace it.
- [ ] What would trigger a retrain, and where does that decision live?
## Day 62 — RAG `/ask` over the lakehouse + one dashboard 🎮 Level 62
> 🎯 **Cutoff target:** `/ask` answers questions grounded in lakehouse metadata/docs, and a Grafana dashboard shows at least the core metrics live.
**📖 What you're building.** Two things that complete the *visible* slice: (1) point your W7 RAG `/ask` at the lakehouse's own context (table docs, run logs, the breaks table) so it can answer "what broke and why"; (2) a Grafana dashboard wired to Prometheus showing the metrics you've been emitting (breaks_total, feature_drift, run_duration, prediction volume). This is where "observable, real-time" becomes literally visible — your stated goal.
**🚧 Roadblock → fix.** Grafana/Prometheus wiring fiddliness → use a provisioned dashboard JSON in the repo so it comes up automatically (no manual clicking) — and that JSON is itself a portfolio artifact. RAG answering from priors not context → the strict grounding prompt + citations (W7 Day 45).
**🎮 Build & save (the real test).** Wire `/ask` to retrieve from lakehouse docs/breaks; provision a Grafana dashboard (committed JSON) with ≥4 panels (breaks, drift, run duration, throughput). **Commit** (`day62: rag over lakehouse + grafana dashboard`).
**✅ Done when:**
- [ ] `/ask` answers a "what broke?"-style question grounded in lakehouse context
- [ ] Grafana dashboard (provisioned from repo) shows core metrics live ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Which metrics earned a dashboard panel, and what alert would you set on each?
- [ ] What context does `/ask` retrieve from, and how does it avoid hallucinating a cause?
## Day 63 — Slice review: prove it runs end-to-end 🎮 Boss Level
> 🎯 **Cutoff target:** one command runs the whole slice; one record provably travels CDC → Iceberg → dbt → gate → reconcile → predict → dashboard. Ugly is fine — *complete* is the bar.
> 🔁 **DSA warm-up (heaps — 18 min, book closed):** [Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/). Trigger "merge k sorted streams" → min-heap of k heads, O(N log k).
**📖 Why today.** End of W9 = the riskiest thing (integration) must be *proven done*. If the slice runs end-to-end — however rough — the capstone will ship. If it doesn't, you found out with two weeks to spare.
**🎮 Build & verify (the real test).**
- [ ] `docker compose up` + one trigger script pushes a batch through the *entire* pipe.
- [ ] Demonstrate: a record lands in Iceberg → appears in the mart → a bad one trips the gate → an injected divergence creates a Break → `/predict` scores it → it shows on the dashboard.
- [ ] Write `docs/slice-status.md`: what works, what's stubbed, the W10 must-do list. **Commit** (`day63: end-to-end slice complete`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] one record provably traverses all stages
- [ ] slice-status + W10 plan written ✅ checkpoint
**🏆 Reward:** up to **155 XP** + 🏔️ **Capstone slice complete** — the integration risk is dead. 🔥🔥
**🔁 Recall (boss check, book closed) — cumulative:**
- [ ] No notes, 3 min: narrate one record's full journey through the capstone, naming the technology + the failure-defense at each of the 8 stages.
---
> ⏭️ **Week 10 — Capstone Pt.2** (harden Tier 1 to production-grade: real dbt tests + Hypothesis, polish each component, draft the README + record a rough Loom). Then **Week 11** — Tier 2 (self-healing auto-remediation + the LangGraph investigate-the-break agent + tracing + OTel) + final polish + ship. **Week 12** — mocks + outreach. DSA spaced-rep continues Days 1/3/5/7.
# 📅 Week 10 — Capstone Pt.2: harden Tier 1 to production-grade + README/Loom (Days 64–70)
> **Capstone Pt.2 (W9–11 are ONE project).** W9 gave you an *ugly-complete* end-to-end slice. **W10 = make Tier 1 production-grade**: every component goes from "runs" to "runs well, tested, observable" — then you draft the README and record a rough Loom so the story exists before final polish. Resist adding Tier 2 features this week; *finish* Tier 1.
> 🎯 **W10 goal: Tier 1 is complete, hardened, and demoable.** A stranger can `docker compose up`, push data, and watch it flow on the dashboard — and the README tells them why it matters.
> 🧠 **DSA stays warm:** Days 1/3/5/7 (Days 64/66/68/70) — 15–20 min, book-closed, name the trigger + pattern + complexity first.
> 🔁 **Reminder of Tier 1 (must-haves):** CDC→Spark Streaming→Iceberg · dbt + tests + quality gate · reconciliation Break detector · fraud `/predict` (MLflow) · Evidently drift · RAG `/ask` · Ragas eval · Grafana dashboard · docker compose · README · 10-min Loom.
## Day 64 — Harden ingest + reconciliation 🎮 Level 64
> 🎯 **Cutoff target:** the streaming ingest + reconciliation survive bad/duplicate/late data without corrupting the lake or throwing false Breaks.
> 🔁 **DSA warm-up (hashmaps — 15 min, book closed):** [Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/). Trigger "count subarrays summing to k" → prefix-sum + hashmap, O(n).
**📖 What you're doing.** Take the W9 ingest from "happy path" to "survives reality": malformed records, duplicate deliveries, out-of-order/late events, and a mid-stream restart. Apply the resilience you already own — idempotent MERGE on the natural key (no double-apply), watermark-based reconciliation (no false Breaks from in-flight data), and a quarantine path for unparseable rows.
**🚧 Roadblock → fix.** Late events re-opening a settled window → define a watermark + a grace period, and reconcile as-of a snapshot. Duplicate CDC deliveries → idempotency key; re-run proves a no-op. Poison record kills the stream → route to a quarantine/DLQ, keep flowing (W6 Day 40).
**🎮 Build & save (the real test).** Throw a chaos batch at the pipe (malformed + dupes + late + a hard delete); confirm: lake stays correct, dupes are no-ops, the bad row is quarantined, and reconciliation raises a Break only for the *real* divergence. **Commit** (`day64: harden ingest + reconciliation`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] chaos batch handled: correct lake, no dupes, bad row quarantined
- [ ] reconciliation raises Breaks only for true divergence ✅ checkpoint
**🏆 Reward:** DSA `+25` · read/plan `+30` · build `+50` · recall `+25` · perfect-day `+25` = **up to 155 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Name the four failure inputs and the defense for each.
- [ ] Why does watermark + snapshot reconciliation prevent false Breaks?
## Day 65 — Real tests: pytest + Hypothesis + dbt + the eval gate 🎮 Level 65
> 🎯 **Cutoff target:** the repo has a real test suite — unit (pytest), property-based (Hypothesis) on the reconciliation invariant, dbt data tests, and the Ragas eval — all runnable with one command.
**📖 What you're doing.** A capstone without tests reads as a demo. Bring the W2 + W7 discipline: pytest for the Python components, a **Hypothesis** property on the reconciliation invariant ("detect-then-remediate ⇒ zero remaining true Breaks; no Break invented or lost" — W2 Day 10), dbt tests for the data, and the Ragas eval for `/ask`. One `make test` runs them all.
**🚧 Roadblock → fix.** Slow/flaky integration tests → unit-test logic with fakes (W2 Day 9), keep one end-to-end smoke test separate. Hypothesis finding "bugs" that are bad assumptions → constrain strategies, treat a real shrunk counterexample as a permanent regression test.
**🎮 Build & save (the real test).** Add `tests/`: unit tests for detectors/transforms; a Hypothesis property for reconciliation conservation; dbt tests wired; the Ragas eval as a test. A `Makefile`/`make test` runs unit + property + dbt + eval. **Commit** (`day65: real test suite`).
**✅ Done when:**
- [ ] unit + Hypothesis + dbt + eval all run via one command
- [ ] the reconciliation conservation property passes (or caught a real bug)
- [ ] coverage on the detect/remediate + transform paths ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] State the reconciliation invariant Hypothesis checks.
- [ ] Which tests are unit vs integration, and why keep them separate?
## Day 66 — Full observability: metrics, logs, traces, alerts 🎮 Level 66
> 🎯 **Cutoff target:** every stage emits structured logs + metrics; the Grafana dashboard tells the whole story at a glance; at least one alert rule fires on a real condition.
> 🔁 **DSA warm-up (binary search — 18 min, book closed):** [Find First and Last Position](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/). Trigger "leftmost/rightmost in sorted" → two binary searches, O(log n).
**📖 What you're doing.** Make the system fully observable — your literal north-star goal. Every stage (ingest, transform, gate, reconcile, predict, ask) emits structured logs (trace-id correlated) + Prometheus metrics; the Grafana dashboard reads like an operator's cockpit (throughput, lag, breaks, drift, eval score, p99 latency); and you wire one **alert** (e.g. breaks_total spikes, or drift over threshold) so the system *tells you* when it's unhealthy.
**🚧 Roadblock → fix.** High-cardinality labels blow up Prometheus (W2 Day 14) → low-cardinality labels (stage, status), not per-record ids. Dashboard sprawl → one row per concern, the four "golden signals" (latency, traffic, errors, saturation) framing. Alert noise → alert on symptoms users feel, threshold from real data.
**🎮 Build & save (the real test).** Standardize structured logging + a trace-id across stages; finalize the provisioned Grafana dashboard (committed JSON); add a Prometheus/Grafana alert rule that fires on an injected unhealthy condition. **Commit** (`day66: full observability + alert`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] dashboard shows throughput, breaks, drift, eval, p99 latency live
- [ ] one alert fires on an injected bad condition ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥. ⭐ The dashboard + alert *is* your "real-time monitoring" story — screenshot it for the README.
**🔁 Recall (boss check, book closed):**
- [ ] Name the four golden signals and a panel for each in your dashboard.
- [ ] What condition did you alert on, and why is it the right symptom?
## Day 67 — Polish each capability to "good" 🎮 Level 67
> 🎯 **Cutoff target:** `/predict`, `/ask`, drift, dbt marts, and the dashboard each move from "works" to "genuinely good" — measured, not vibes.
**📖 What you're doing.** Spend a focused day raising quality where it shows: improve the RAG eval score vs the W7 baseline (one or two experiments), confirm `/predict` latency + correctness, tighten the dbt marts (naming, docs, a couple more tests), make the drift report readable, and ensure the dashboard panels are labeled and legible. The goal: nothing in the demo looks half-finished.
**🚧 Roadblock → fix.** Endless polishing (gold-plating) → timebox each component to \~60–90 min; "good enough to demo confidently," not perfect. Improving one metric wrecks another → re-run the eval/tests after each change (your one-variable-at-a-time discipline).
**🎮 Build & save (the real test).** One measurable improvement per capability, logged: RAG eval Δ, `/predict` p99, +2 dbt tests + model docs, a cleaner drift summary, labeled dashboard panels. **Commit** (`day67: polish tier-1 components`).
**✅ Done when:**
- [ ] RAG eval improved vs baseline (logged)
- [ ] dbt marts documented + a couple more tests; drift report readable
- [ ] dashboard panels labeled + legible ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Which capability improved most, by what measure?
- [ ] Where did you stop polishing, and why was that the right line?
## Day 68 — Draft the README (the 90-second story) 🎮 Level 68
> 🎯 **Cutoff target:** a README a hiring manager understands in 90 seconds — problem, architecture diagram, what's impressive, how to run it, and the results.
> 🔁 **DSA warm-up (trees/graphs — 18 min, book closed):** [Lowest Common Ancestor of a BST](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/). Trigger "LCA in a BST" → walk down using ordering, O(h).
**📖 What you're doing.** The README is the highest-leverage artifact in your whole job search — most reviewers read it and nothing else. Structure it for a skim: one-line hook → the problem it solves → architecture diagram → "what's technically interesting" (CDC→Iceberg + reconciliation/self-healing + RAG-with-eval + drift) → quickstart (`docker compose up`) → **results** (the eval table, a dashboard screenshot, the Break-detection demo). Lead with outcomes, not a tech-list.
**🚧 Roadblock → fix.** A wall of text nobody reads → diagram + bullets + screenshots, ruthless trimming. Burying the impressive part → put the differentiators (reconciliation + eval'd RAG + drift) above the fold. No proof it runs → a copy-paste quickstart that actually works from clean.
**🎮 Build & save (the real test).** Write `README.md`: hook → problem → architecture diagram → what's interesting → quickstart → results (eval table + dashboard screenshot + reconciliation demo). Verify the quickstart on a clean checkout. **Commit** (`day68: draft README`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] README skims in 90s: diagram, differentiators, quickstart, results
- [ ] quickstart verified from a clean clone ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] What three differentiators sit above the fold, and why those?
- [ ] What proof-of-results does the README show?
## Day 69 — Record a rough Loom + integration freeze 🎮 Level 69
> 🎯 **Cutoff target:** a rough \~10-min Loom walks the system end-to-end; Tier 1 is feature-frozen (no new features after today — only fixes + W11 Tier 2).
**📖 What you're doing.** A short demo video massively boosts a portfolio repo — reviewers *watch* you reason. Record a rough first pass (you'll polish in W11): the problem, a live `docker compose up`, push a batch, watch it flow on the dashboard, trigger a Break, hit `/predict` and `/ask`, show the eval table. Rough is fine — the point is to surface gaps while there's time. Then **freeze Tier 1**: from here, only bug-fixes + W11's Tier-2 additions.
**🚧 Roadblock → fix.** Re-recording forever for perfection → one rough take today, polish in W11 Day 76. The demo exposes a broken path → good, that's the point; log it as a W10-remainder fix, not a W11 feature.
**🎮 Build & save (the real test).** Record the \~10-min Loom (script the beats first). Note any gaps it exposed in `docs/demo-gaps.md`. Tag the repo `tier1-freeze`. **Commit** (`day69: rough Loom + tier-1 freeze`).
**✅ Done when:**
- [ ] rough end-to-end Loom recorded
- [ ] gaps logged; Tier 1 tagged/frozen
- [ ] only fixes + Tier 2 remain for W11 ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Walk your demo's beat sheet from memory.
- [ ] What does "feature freeze" protect you from in the final week?
## Day 70 — Tier-1 sign-off + W11 plan 🎮 Boss Level
> 🎯 **Cutoff target:** Tier 1 is *done* by a written checklist; W11's Tier-2 scope is chosen and ordered (self-healing first).
> 🔁 **DSA warm-up (heaps — 18 min, book closed):** [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/). Trigger "running median" → two heaps (max-heap low / min-heap high), O(log n) insert.
**📖 Why today.** A clean Tier-1 sign-off means that even if W11 goes sideways, you already have a complete, shippable, impressive capstone. Everything after is upside. Then you pick the Tier-2 work that best tells *your* story — self-healing auto-remediation first (it's your identity), then the investigate-the-break agent.
**🎮 Build & verify (the real test).**
- [ ] Tier-1 checklist all ticked (every must-have present, tested, demoable).
- [ ] `docs/w11-plan.md`: ordered Tier-2 — (1) self-healing auto-remediation, (2) LangGraph investigate-the-break agent, (3) LLM tracing + OTel, (4) Hypothesis-hardening; each with a "done when."
- [ ] Decide the W11 stop line: what you will *not* do (Tier 3) unless wildly ahead. **Commit** (`day70: tier-1 signoff + w11 plan`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] Tier-1 checklist complete — the capstone is already shippable
- [ ] ordered W11 Tier-2 plan + explicit stop line written ✅ checkpoint
**🏆 Reward:** up to **155 XP** + 🏔️ **Tier 1 complete** — you have a portfolio-grade capstone *in hand*. 🔥🔥
**🔁 Recall (boss check, book closed) — cumulative:**
- [ ] No notes, 3 min: give the full capstone pitch as if to an interviewer — problem, architecture, the three differentiators, results, and what Tier 2 will add.
---
> ⏭️ **Week 11 — Capstone Pt.3** (Tier 2: the self-healing auto-remediation loop + the LangGraph investigate-the-break agent + LLM tracing + OTel + Hypothesis-hardening, then final README/Loom polish and **ship**). **Week 12** — mocks + outreach push. DSA spaced-rep continues Days 1/3/5/7.
# 📅 Week 11 — Capstone Pt.3: Tier 2 self-healing + the agent, then SHIP
> **Capstone Pt.3 (final).** Tier 1 was signed off in W10 — you already have a shippable capstone. This week is pure upside: add the Tier-2 features that give the project its story (self-healing auto-remediation + an investigate-the-break agent + tracing/OTel), then polish the README/Loom and **ship it publicly**. Honor the W10 stop line — do not wander into Tier 3 unless wildly ahead.
> 🎯 **W11 goal: the AI-Ready Lakehouse is public, self-healing, and demoed.** A stranger can run it, watch it detect *and fix* a break on its own, and read/watch the story.
> 🧠 **DSA stays warm:** Days 1/3/5/7 (Days 71/73/75/77) — 15–20 min, book-closed, name the trigger + pattern + complexity first. This is also the last structured DSA before the W12 mock peak.
## Day 71 — The self-healing auto-remediation loop ⭐🎮 Level 71
> 🎯 **Cutoff target:** when reconciliation detects a Break, the system *automatically* remediates it (idempotently, with an audit trail) — not just alerts.
> 🔁 **DSA warm-up (hashmaps — 15 min, book closed):** [First Unique Character in a String](https://leetcode.com/problems/first-unique-character-in-a-string/). Trigger "first non-repeating" → Counter then scan, O(n).
**📖 What you're building (your north star, made real).** This is *the* feature that proves your identity: the observe→diff→act control loop (W6 Day 41). When a Break appears, a remediator decides the fix (re-pull the source slice, re-run the MERGE, or quarantine), applies it **idempotently**, re-reconciles to confirm the Break is gone, and records every action. The system corrects itself — "large-scale self-recovery without human intervention" in working code.
**🔀 When to auto-heal vs alert (the senior nuance).** Auto-remediate well-understood, safe, reversible breaks (a missed/duplicated batch). Alert-and-wait for ambiguous or destructive cases (a schema change, a huge divergence) — don't let automation guess and corrupt data. Encode this as a policy: confidence/size thresholds route to auto-fix vs human.
**🚧 Roadblock → fix.** Auto-remediation that masks a systemic bug (W6 trap) → every auto-fix emits a metric + audit row, and a repeated-break detector escalates to a human. Non-idempotent fix double-applies → fix keyed on the natural id; re-run is a no-op. Remediation loop that never converges → cap attempts, then quarantine + alert.
**🎮 Build & save (the real test).** Add a `Remediator`: on a Break, apply the keyed idempotent fix, re-reconcile, write a `remediation_log` row (break, action, before/after, outcome). Add the auto-vs-alert policy + a max-attempts cap. Demo: inject a divergence → watch it detect → fix → confirm clean, all on the dashboard. **Commit** (`day71: self-healing remediation loop`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] an injected Break is auto-remediated, re-reconciled clean, and logged
- [ ] auto-vs-alert policy + max-attempts cap in place ✅ checkpoint
**🏆 Reward:** DSA `+25` · read `+30` · build `+50` · recall `+25` · perfect-day `+25` = **up to 155 XP**. Streak 🔥. ⭐ This is the single most important day for your target identity — make the demo crisp.
**🔁 Recall (boss check, book closed):**
- [ ] Walk the observe→diff→act loop in your capstone. Where's the audit trail?
- [ ] Which breaks do you auto-fix vs escalate, and why is that line important?
## Day 72 — LangGraph "investigate-the-break" agent 🎮 Level 72
> 🎯 **Cutoff target:** an agent takes a Break, gathers context (lineage, recent runs, the offending rows), and proposes a likely root cause + suggested fix.
**📖 What you're building.** A LangGraph agent (W8 Day 53) for the *ambiguous* breaks the auto-loop escalates. Given a Break, it uses tools — query the breaks/lineage tables, fetch recent run logs, sample the offending rows, RAG over the runbook — and produces a structured "here's what likely happened + suggested remediation" report. This is the human-in-the-loop half of self-healing, and it's a standout portfolio piece (it reflects a repeatable lesson: for investigation work, an agent that explains a cause beats one more dashboard that shows a symptom).
**🚧 Roadblock → fix.** Agent runaway/cost (W8) → recursion + budget caps, explicit termination. Agent hallucinates a cause → ground every claim in tool output + citations; it proposes, never auto-executes a destructive fix. Tool-arg errors → typed, validated, allow-listed tools.
**🎮 Build & save (the real test).** Build the agent: tools = breaks/lineage query, run-log fetch, row sampler, runbook RAG. Input a Break → it returns a grounded root-cause hypothesis + suggested fix (proposal only). Trace the run (Langfuse). **Commit** (`day72: investigate-the-break agent`).
**✅ Done when:**
- [ ] agent produces a grounded root-cause + suggested fix for a Break
- [ ] every claim cites tool output; no destructive auto-execution
- [ ] run is traced + bounded (recursion/budget caps) ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Why does this agent *propose* rather than *execute*?
- [ ] How does grounding-in-tool-output prevent a hallucinated root cause?
## Day 73 — End-to-end tracing + OpenTelemetry 🎮 Level 73
> 🎯 **Cutoff target:** one trace id follows a record across ingest → transform → reconcile → predict → (heal \| investigate), visible end-to-end.
> 🔁 **DSA warm-up (sliding window — 18 min, book closed):** [Permutation in String](https://leetcode.com/problems/permutation-in-string/). Trigger "fixed-window anagram match" → sliding window + counts, O(n).
**📖 What you're building.** Unify observability across the whole platform with OpenTelemetry (W2 Day 14 + W8 Day 52): a single trace id threads through every stage so you can follow one record's full journey — including a break and its remediation — in one view. This is the capstone-scale version of your "real-time monitoring" goal and a strong senior signal (most portfolios stop at per-service logs).
**🚧 Roadblock → fix.** Trace context lost across process/stage boundaries (streaming → batch → service) → propagate the trace id explicitly through the record/metadata. Span explosion → sample, and span at stage granularity, not per-row.
**🎮 Build & save (the real test).** Wire OTel across stages; propagate one trace id end-to-end; view a single record's full span tree (including a remediation). Correlate trace id with structured logs + the dashboard. **Commit** (`day73: end-to-end OTel tracing`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] one trace id spans ingest→…→heal, viewable as a tree
- [ ] trace id correlates with logs + dashboard ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] How do you keep one trace id alive across streaming→batch→service hops?
- [ ] What does end-to-end tracing let you debug that per-stage logs can't?
## Day 74 — Tier-2 hardening + Hypothesis on the heal loop 🎮 Level 74
> 🎯 **Cutoff target:** the self-healing loop is property-tested (it always converges or escalates; never corrupts), and Tier 2 is feature-frozen.
**📖 What you're building.** Make the new Tier-2 features trustworthy. A **Hypothesis** property on the heal loop: for any set of injected breaks, after remediation either all true breaks are resolved *or* the unresolved ones were escalated — and nothing was corrupted or invented (conservation again, W2 Day 10). Then freeze Tier 2 so the last days are pure polish.
**🚧 Roadblock → fix.** Property tests that are slow/flaky over a stateful loop → bound input sizes, seed deterministically, assert the invariant not the path. A found counterexample → it's a gift; fix + pin as regression.
**🎮 Build & save (the real test).** Write the Hypothesis property for the heal loop (converge-or-escalate + conservation); fix anything it finds; add 1–2 chaos cases as regression tests. Tag `tier2-freeze`. **Commit** (`day74: heal-loop property tests + tier-2 freeze`).
**✅ Done when:**
- [ ] heal-loop property passes (converge-or-escalate, no corruption)
- [ ] any counterexample fixed + pinned
- [ ] Tier 2 frozen ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] State the heal-loop invariant in one sentence.
- [ ] Why assert the invariant, not the exact remediation path?
## Day 75 — Polish the README + architecture story 🎮 Level 75
> 🎯 **Cutoff target:** the README is portfolio-grade — the self-healing + agent + eval'd-RAG story is unmissable, with diagrams, screenshots, and results above the fold.
> 🔁 **DSA warm-up (binary search — 18 min, book closed):** [Time Based Key-Value Store](https://leetcode.com/problems/time-based-key-value-store/). Trigger "latest value ≤ timestamp" → binary search on sorted timestamps, O(log n).
**📖 What you're building.** Upgrade the W10 draft README into the centerpiece of your job search. Lead with the three differentiators — **self-healing reconciliation**, **eval'd RAG**, **drift-aware serving** — each with a diagram/screenshot and a concrete result (breaks auto-fixed, eval scores, drift caught). Add the "why this matters" framing aimed at a hiring manager on the kind of team you are targeting. This README gets linked in every application and every outreach message.
**🚧 Roadblock → fix.** Tech-list dump → lead with outcomes + a story, push the stack lower. Differentiators buried → a "What makes this interesting" section right after the hook. Stale screenshots → regenerate from the current build.
**🎮 Build & save (the real test).** Finalize `README.md`: hook → what makes it interesting (the 3 differentiators) → architecture diagram → self-healing demo (GIF/screenshot) → quickstart → results (eval table, dashboard, breaks-fixed count) → design tradeoffs. Re-verify quickstart on a clean clone. **Commit** (`day75: portfolio README`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] README leads with the 3 differentiators + results, diagrams current
- [ ] quickstart verified clean ✅ checkpoint
**🏆 Reward:** up to **155 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Give the 30-second verbal version of this README.
- [ ] Which single screenshot best sells the project, and why?
## Day 76 — Record the final Loom + dry-run the demo 🎮 Level 76
> 🎯 **Cutoff target:** a polished \~10-min Loom that nails the self-healing money-shot; you can give the live demo smoothly end-to-end.
**📖 What you're building.** The demo you'll reuse in interviews. Tight beat sheet: the problem (60s) → architecture (90s) → live run: data flows, a break is injected, the system **detects → auto-heals → confirms** on the dashboard (the money shot) → the agent investigates an ambiguous break → `/ask` + eval table → close with tradeoffs + what you'd do next. Rehearse until it's smooth — you'll perform a version of this in onsites.
**🚧 Roadblock → fix.** Rambling → scripted beats + a timer. A live failure mid-record → you froze features (D74), so the path is stable; do a dry run first. Too long → 10 min hard cap; cut setup, lead with the result.
**🎮 Build & save (the real test).** Script the beats; dry-run once; record the final Loom; link it in the README. **Commit** (`day76: final demo Loom`).
**✅ Done when:**
- [ ] polished Loom recorded + linked in README
- [ ] the self-healing money-shot is front-and-center
- [ ] you can deliver the demo live without notes ✅ checkpoint
**🏆 Reward:** up to **130 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Recite the demo beat sheet + the timing for each beat.
- [ ] What's your one-sentence answer to "what would you build next"?
## Day 77 — SHIP IT 🎮 Boss Level
> 🎯 **Cutoff target:** the capstone is public, green-CI, documented, demoed — and announced. The 11-week build is *done*.
> 🔁 **DSA warm-up (trees/graphs — 18 min, book closed):** [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/). Trigger "reachability from edges" → multi-source DFS/BFS, O(rows·cols).
**📖 Why today.** Shipped + announced beats perfect-in-a-drawer. Today you make it public, prove CI is green, and *tell people* — because a portfolio piece nobody sees can't get you hired.
**🎮 Build & ship (the real test).**
- [ ] Repo public; CI green (lint + tests + Hypothesis + eval gate + smoke).
- [ ] README + Loom + architecture diagram all linked and current.
- [ ] **Announce:** a post + write-up in your own voice — e.g. "I built a self-healing AI-ready lakehouse: CDC→Iceberg, eval'd RAG, drift-aware serving, and an investigate-the-break agent." Lead with the self-healing demo GIF.
- [ ] Add the project (with the Loom link) to your resume + portfolio site. **Commit/tag** (`v1.0: ship ai-ready-lakehouse`).
**✅ Done when:**
- [ ] DSA warm-up solved + narrated
- [ ] repo public + green CI + all artifacts linked
- [ ] announced (LinkedIn + Substack) + added to resume/portfolio ✅ checkpoint
**🏆 Reward:** up to **155 XP** + 🚀 **CAPSTONE SHIPPED** — the biggest milestone in the plan. Claim a *big* reward. 🔥🔥🔥
**🔁 Recall (boss check, book closed) — cumulative:**
- [ ] No notes, 5 min: deliver the full capstone interview pitch end-to-end — problem, architecture, the three differentiators, the self-healing loop, results, tradeoffs, and next steps. This is your onsite story.
---
> ⏭️ **Week 12 — Mocks + Outreach** (convert the portfolio into interviews): daily mock interviews + the DSA spaced-rep peak + an outreach push using a repeatable outreach message. Below.
---
# 📅 Week 12 — Mocks + Outreach: convert the build into interviews
> **Phase goal:** you now have the skills + a standout capstone. This week turns that into *callbacks and offers*: daily mock interviews (coding + system design + behavioral), the DSA spaced-rep at peak intensity, and a sustained outreach push leveraging the shipped project. The build was the hard part — this is the conversion.
> 🧠 **DSA at peak:** every day opens with a recognition rep — random problem, name the trigger + pattern + complexity in \<60s, then solve. The W3 patterns must all sit 🟢.
> 📬 **Outreach engine:** a short, repeatable outreach message — personalised opening → the specific role → one line of relevant experience → something useful you can offer → a concrete ask. Use the capstone as the useful thing you bring.
## Day 78 — Coding mock #1 + outreach setup 🎮 Level 78
> 🎯 **Cutoff target:** one full coding mock done + a target list of 20 companies/roles with the outreach pipeline set up in Notion.
**📖 What you're doing.** Start the conversion engine on two fronts. (1) Coding mock on Pramp / [interviewing.io](http://interviewing.io/) — a real timed problem with a human, narrating throughout (restate → clarify → brute force + complexity → optimize → code → test). (2) Build the outreach pipeline: a tracking board (Target → Contacted → Replied → Call → Onsite) seeded with 20 roles that genuinely fit your stack and level. Filter on the constraints that actually apply to you — location, remote policy, visa sponsorship, clearance, domain — and record them on the board so you stop re-checking.
**🚧 Roadblock → fix.** Silent coding under pressure → the 9-step talk-track (cheat sheet) is your scaffold; practice narrating even when stuck ("let me think out loud about why this is hard"). Outreach paralysis → a fixed daily quota (e.g. 5 personalized DMs/day) beats sporadic bursts.
**🎮 Do & log (the real test).** Complete 1 coding mock; write a 3-bullet retro (what worked / what froze / one fix). Build the Notion pipeline; seed 20 targets; send the first 5 DMs (capstone as the hook). **Log** the mock + outreach count.
**✅ Done when:**
- [ ] 1 coding mock done + retro written
- [ ] pipeline built, 20 targets seeded
- [ ] 5 personalized DMs sent ✅ checkpoint
**🏆 Reward:** mock `+50` · retro `+25` · outreach `+25` · pipeline `+25` · perfect-day `+25` = **up to 150 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Recite the 9-step coding talk-track.
- [ ] What's your one-line capstone hook for a cold DM?
## Day 79 — System-design mock + the capstone as your case study 🎮 Level 79
> 🎯 **Cutoff target:** one system-design mock done, and you can pivot any design prompt toward the real system you built.
**📖 What you're doing.** A system-design mock using the Hello Interview framework (requirements → entities → API → high-level → deep dives → tradeoffs). Your edge: when asked to design a data pipeline / real-time system / ML-serving platform, you *built one* — pull concrete decisions (CDC→Iceberg, exactly-once, reconciliation/self-healing, drift, eval) from the capstone as lived evidence, not theory.
**🚧 Roadblock → fix.** Jumping to components before requirements → spend the first \~7 min on functional + non-functional reqs. Staying generic → anchor in your capstone's real tradeoffs (that's what makes you memorable).
**🎮 Do & log (the real test).** 1 system-design mock; map the prompt to capstone decisions where possible; 3-bullet retro. Send 5 more DMs; reply to any inbound. **Log** mock + outreach.
**✅ Done when:**
- [ ] 1 system-design mock done + retro
- [ ] pulled ≥2 concrete capstone decisions into the answer
- [ ] 5 DMs sent ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] The 6 phases of the design framework + minutes each.
- [ ] Which capstone decision best demonstrates senior judgment?
## Day 80 — Behavioral (STAR) + the impact stories 🎮 Level 80
> 🎯 **Cutoff target:** 6 polished STAR stories written in your own words — five from your own history, one from this program's capstone.
**📖 What you're doing.** Behavioral rounds decide more offers than people admit. Build a STAR bank (Situation 15s / Task 10s / Action 45s / Result-with-metric 20s) from your own history. Mine it for five stories in these shapes: a subtle data-correctness bug you found and fixed; a delivery or deployment process you shortened; an infrastructure or cost optimisation you can quantify; a pipeline you made materially faster; and this capstone (a self-healing system). Each one ends in a number — if you cannot put a figure on it, go back to the logs, the tickets or the dashboards and find one.
**🚧 Roadblock → fix.** Rambling with no metric → the STAR timing forces a crisp arc; always land the number. Same story for everything → tag each story to the traits it shows (ownership, debugging depth, impact, leadership) so you can pick the right one per question.
**🎮 Do & log (the real test).** Write/polish 6 STAR stories in `behavioral.md`, each ≤ 90s with a metric + a trait tag. Say each aloud once. Send 5 DMs. **Log.**
**✅ Done when:**
- [ ] 6 STAR stories written with metrics + trait tags
- [ ] each rehearsed aloud ≤ 90s
- [ ] 5 DMs sent ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Tell your strongest debugging STAR story in 90s, landing the metric.
- [ ] Which story answers "tell me about a time you owned something end-to-end"?
## Day 81 — Coding mock #2 + SQL/DSA peak 🎮 Level 81
> 🎯 **Cutoff target:** a second coding mock + a hard SQL set, with pattern-recognition at reflex speed.
**📖 What you're doing.** Second coding mock (different partner/platform). Plus a set of hard SQL (window functions, gaps-and-islands, top-N-per-group), because data-engineering screens lean SQL-heavy. Engineers arriving from a SQL or analytics background should lean on that here — it is the round where an existing strength shows. Keep the DSA recognition reps sharp.
**🚧 Roadblock → fix.** A shaky DSA pattern resurfacing → re-solve it cold + drop in the Concept Ledger. SQL rust on exotic window frames → the SQL cheat sheet, then drill 3 hard ones.
**🎮 Do & log (the real test).** 1 coding mock + retro; 3 hard SQL problems; any 5 DMs + reply to inbound. **Log.**
**✅ Done when:**
- [ ] 1 coding mock + retro
- [ ] 3 hard SQL solved
- [ ] 5 DMs sent ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Which DSA pattern is weakest right now, and what's the re-solve plan?
- [ ] Write the top-N-per-group SQL template from memory.
## Day 82 — Full loop simulation 🎮 Level 82
> 🎯 **Cutoff target:** simulate an onsite — back-to-back coding + system design + behavioral in one sitting — to build stamina.
**📖 What you're doing.** Real onsites are 4–5 hours of sustained performance; today trains the stamina. Do a compressed loop: 1 coding (45m) → 1 system design (45m) → 1 behavioral (30m), minimal breaks, ideally with real humans ([interviewing.io](http://interviewing.io/) / a peer). Notice where focus drops and plan around it.
**🚧 Roadblock → fix.** Energy crash mid-loop → note when it hits; plan caffeine/breaks for the real thing. Context-switching whiplash → a 2-min reset ritual between rounds (breathe, re-read the cheat-sheet header for that round type).
**🎮 Do & log (the real test).** Run the 3-round loop; one combined retro (stamina, transitions, weakest round). Send 5 DMs. **Log.**
**✅ Done when:**
- [ ] 3-round loop completed in one sitting
- [ ] combined retro written
- [ ] 5 DMs sent ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Which round drained you most, and what's your mitigation?
- [ ] Your between-rounds reset ritual in one line.
## Day 83 — Outreach push + follow-ups 🎮 Level 83
> 🎯 **Cutoff target:** the pipeline is active — follow-ups sent, referrals asked for, a couple of conversations booked.
**📖 What you're doing.** Conversion day. Follow up with everyone contacted who hasn't replied (a polite second touch lifts response a lot), ask warm contacts for referrals (referrals dwarf cold applies), and book any interest into calls. Lead with the shipped capstone — it's your differentiator and a natural reason to reach out.
**🚧 Roadblock → fix.** Fear of "bothering" people → one value-adding follow-up is normal + expected; reference the capstone, keep it short. No referral path → second-degree connections, your university alumni network, former colleagues, and the data-engineering community (conference, meetup and hackathon contacts).
**🎮 Do & log (the real test).** Send all due follow-ups; ask ≥3 people for referrals; book/confirm any calls; update the pipeline. **Log** counts.
**✅ Done when:**
- [ ] all due follow-ups sent
- [ ] ≥3 referral asks made
- [ ] pipeline updated; any calls booked ✅ checkpoint
**🏆 Reward:** up to **150 XP** + streak 🔥.
**🔁 Recall (boss check, book closed):**
- [ ] Your follow-up message in 3 sentences.
- [ ] Three referral sources you haven't tapped yet.
## Day 84 — Retro + the sustainable cadence 🎮 Boss Level 🏁
> 🎯 **Cutoff target:** a written 12-week retro + a lightweight ongoing cadence so momentum survives past day 84.
**📖 Why today.** Day 84 is a milestone, not a finish line — interviews will land over the following weeks. Lock in what worked, keep skills warm without burning out, and define the steady-state loop until you sign an offer.
**🎮 Do & save (the real test).**
- [ ] **12-week retro** (`retro.md`): biggest wins, what you'd do differently, skills leveled up, the portfolio you built (5 shipped repos + the capstone).
- [ ] **Ongoing cadence:** e.g. 3 DSA reps/week, 1 mock/week, 5 outreach DMs/week, keep the capstone repo warm — enough to stay sharp, sustainable indefinitely.
- [ ] **Interview-prep loop:** before each real onsite, re-run the relevant cheat sheet + 1 mock + the company's tagged questions.
- [ ] Update resume + portfolio site with all 12 weeks of output. **Commit** (`day84: 12-week retro + cadence`).
**✅ Done when:**
- [ ] retro written
- [ ] sustainable weekly cadence defined
- [ ] resume/portfolio fully updated ✅ checkpoint
**🏆 Reward:** up to **150 XP** + 🏆 **12-WEEK PLAN COMPLETE** — you went from wherever you started to a shipped-portfolio AI + Data + Lakehouse engineer. Claim the big final reward. 🔥🔥🔥
**🔁 Final recall (book closed):**
- [ ] Deliver your 2-minute "who I am as an engineer" pitch — identity, the systems you build (self-healing, observable, production-grade), and the proof (the capstone + repos).
---
## 🎓 You made it. The whole arc:
> **W1–2** production Python · **W3** DSA recognition · **W4** Iceberg lakehouse · **W5** Spark/dbt/governance · **W6** distributed systems · **W7** RAG + eval · **W8** LLMOps + agents · **W9–11** the self-healing AI-ready lakehouse capstone · **W12** mocks + outreach.
> Five shipped repos, one standout capstone, and reflex-level patterns — whatever background you started from. Now go convert it. 🚀
</content>
</page>