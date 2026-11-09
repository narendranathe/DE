<content>
# 🚀 Daily Executor — 12-Week AI + Data Engineering Program (2 hours a day)
> **One page. Open it, find today, do the card, tick the boxes.** Every day is two hours and has the same shape: review old material from memory, learn one idea, build it, practise one timed rep, then say it back with the book closed. Spaced review is built into every card, so what you learn in week 1 is still in your head in week 12.
> **Builds toward:** AI Engineer and Data Engineer interview loops. **Stack:** DuckDB and Python, then Iceberg + PySpark + dbt + Airflow on object storage, Postgres + pgvector, LLM APIs, RAG, evals and agents.
## ⏱️ The two-hour day
- **15 min · Review** — answer questions from earlier days cold: yesterday, 3 days ago, a week ago, two weeks ago, a month ago. Retrieval, not rereading, is what builds memory.
- **20 min · Learn** — the concept, the alternatives, the classic roadblock and the fix, then two short reads.
- **55 min · Build** — make it real, run it, commit. A git commit is the checkpoint.
- **15 min · Practice** — one timed SQL or algorithm rep. Hints only after the timer.
- **15 min · Recall** — close everything and answer the card's questions aloud.
## 🧠 How this plan builds long-term memory (read once)
- **Spaced retrieval.** Each day's review pulls one question from the days 1, 3, 7, 14 and 30 days back. Boss days sweep the whole week. The gaps get longer as the material gets firmer.
- **Error log.** Keep one file, `error-log.md`. Every missed question, slow problem or wrong guess goes in with the date and a one-line correction. The log is your personal review list.
- **Interleaving.** The practice rep alternates between SQL and algorithms, and revisits earlier patterns, so skills stay warm while the main topic moves on.
- **Build to learn.** You remember what you made. Every day ends in a commit.
- **Boss days** (every 7th day) have no new material. They test the week under time pressure.
## 🏆 Reward & XP System
> Motivation is a scoreboard, not willpower. Tick XP as you earn it; cash in real rewards at milestones.
- **Per task:** Review `+20` · Read-and-understood `+30` · Build/level cleared `+50` · Practice `+20` · Recall boss-check `+25`
- **Perfect day** (every box ticked) = `+25` bonus → a perfect day is **170 XP** (boss days have no new reading, so they top out at 140).
- **🔥 Streak:** every no-zero day (the full 2 hours) extends it. Miss a day → streak resets. Protect the streak.
**Milestone rewards — write in your own treat:**
- [ ] 🔥 7-day streak → 🎁 reward: `__________________`
- [ ] 🔥 14-day streak → 🎁 reward: `__________________`
- [ ] 🏔️ Finish any week (all 7 ✅) → 🎁 reward: `__________________`
- [ ] 🚢 Ship the capstone (Day 77) → 🎁 BIG reward: `__________________`
**XP log:**
<table header-row="true">
<tr>
<td>Week</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td></tr>
<tr>
<td>XP</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
</table>
## 🗺️ The 12-Week Map
- **W1** SQL + data modeling · **W2** Production Python · **W3** DSA patterns
- **W4** Lakehouse + Spark · **W5** dbt, quality, Airflow, governance, cloud map, take-home drill · **W6** Data system design
- **W7** LLM fundamentals + LLM app basics · **W8** RAG + evals · **W9** Agents, LLMOps, security, cost
- **W10–11** Capstone: AI-ready lakehouse · **W12** Mocks + conversion
---
# 📚 Cheat Sheets (skim daily — they feed the review loop)
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
<summary>📊 SQL Patterns — windows, sessions, MERGE, SCD2, plans</summary>
**Window functions**
```sql
ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, id)   -- exactly N rows
RANK()       OVER (PARTITION BY dept ORDER BY salary DESC)       -- ties share a rank, then a gap
DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)       -- ties share, no gap
SUM(x) OVER (PARTITION BY u ORDER BY ts ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
AVG(x) OVER (ORDER BY d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) -- 7-row moving average
LAG(x) OVER (PARTITION BY u ORDER BY ts, id)                      -- always a unique ORDER BY
```
**Default-frame trap:** with an `ORDER BY` and no frame, `SUM() OVER` uses RANGE, so ties share a running total. Write `ROWS`.
**Top-N per group, and dedup (latest row per key)**
```sql
WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY k ORDER BY updated_at DESC, id DESC) rn FROM t
) SELECT * FROM ranked WHERE rn = 1;   -- rn <= 3 for top 3; QUALIFY rn = 1 where supported
```
**Sessions (30-minute timeout)**
```sql
WITH f AS (
  SELECT *, CASE WHEN LAG(ts) OVER w IS NULL
                   OR ts - LAG(ts) OVER w > INTERVAL '30 minutes' THEN 1 ELSE 0 END AS new_s
  FROM events WINDOW w AS (PARTITION BY u ORDER BY ts, id))
SELECT *, SUM(new_s) OVER (PARTITION BY u ORDER BY ts, id) AS session_id FROM f;
```
**Gaps and islands:** `date − ROW_NUMBER()` is constant inside an unbroken run, so group by it.
```sql
SELECT u, MIN(d) AS start_d, MAX(d) AS end_d, COUNT(*) AS days
FROM (SELECT u, d, d - (ROW_NUMBER() OVER (PARTITION BY u ORDER BY d))::int AS grp
      FROM (SELECT DISTINCT u, d FROM activity) a) t
GROUP BY u, grp;
```
**Idempotent upsert (MERGE; syntax varies by engine)**
```sql
MERGE INTO target t USING (latest-per-key of the batch) s ON t.id = s.id
WHEN MATCHED AND s.op = 'D' THEN DELETE
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET ...
WHEN NOT MATCHED AND s.op <> 'D' THEN INSERT ...;
```
**SCD type 2:** `valid_to = COALESCE(LEAD(valid_from) OVER (PARTITION BY id ORDER BY valid_from), '9999-12-31')`; one `is_current` row per key; point-in-time join `ON f.cust = d.cust AND f.ts >= d.valid_from AND f.ts < d.valid_to`.
**Joins:** INNER (matches only) · LEFT (all left + NULLs) · FULL OUTER · CROSS (date-spine fills) · **Anti-join** `NOT EXISTS` or `LEFT JOIN … WHERE r.id IS NULL`. `NOT IN` returns nothing if the list holds a NULL. A filter on the right table of a LEFT JOIN belongs in `ON`.
**Fan-out:** joining to the many side multiplies the one side's measures. Aggregate first, or sum at the measure's own grain.
**Recursive CTE (hierarchy)**
```sql
WITH RECURSIVE hierarchy AS (
  SELECT id, manager_id, 1 AS depth FROM employees WHERE id = ?
  UNION ALL
  SELECT e.id, e.manager_id, h.depth + 1 FROM employees e JOIN hierarchy h ON e.id = h.manager_id
) SELECT * FROM hierarchy;
```
**Plan operators:** Nested Loop (small outer + indexed inner) · Hash Join (large, no index) · Merge Join (both sorted on key) · Index Seek (good) vs Scan (bad unless tiny). Compare estimated vs actual rows.
**Isolation:** READ UNCOMMITTED (dirty) · READ COMMITTED (default) · REPEATABLE READ · SNAPSHOT (readers do not block writers) · SERIALIZABLE (stops write skew).
**Indexing:** narrow, ever-increasing clustered keys; covering indexes with included columns; WHERE and JOIN columns first; filtered indexes for skewed predicates.
**CDC:** log-based capture gives inserts, updates and deletes with an op type and a sequence number. Apply the latest change per key by sequence; a delete is a tombstone; replays must be idempotent.
</details>
<details>
<summary>🧱 Data Modeling — grain, stars, SCDs</summary>
**Four steps:** business process → **grain** (one sentence: "one row per order line") → dimensions → facts. Say the grain before anything else.
**Fact types:** additive (revenue: sum across anything) · semi-additive (balance: not across time) · non-additive (ratio: store numerator and denominator).
**Dimensions:** surrogate keys; conformed dimensions shared across facts; a date dimension every time; degenerate dimension (the order number lives on the fact); junk dimension for low-cardinality flags.
**Star vs snowflake vs one big table:** star is the default; snowflake saves space at the cost of joins; one big table is fast for BI and hard to keep consistent.
**Kimball vs Inmon vs Data Vault:** Kimball = conformed dimensions, bottom-up marts · Inmon = normalized enterprise warehouse first · Data Vault = hubs, links, satellites for auditability.
**SCD:** Type 1 overwrite · Type 2 new row with validity dates · Type 3 previous-value column · Type 6 hybrid. Pick 2 when the business asks "as it was then".
**Mid-round change checklist:** does the grain change? does a dimension need history? does a measure now sit at a different grain? re-state, then adjust.
**Mixed-grain trap:** order-level shipping on order-line rows multiplies in a SUM. Keep each measure at its own grain.
**Reconcile:** fact totals must equal the source totals; test it.
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
	**Patterns:** Strategy (swappable algorithm, such as a scoring model) · Factory · Builder · Observer (pub/sub = Kafka) · Decorator (`@retry`, `@cache`) · Adapter · Chain of Responsibility · Repository · Unit of Work.
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
<details>
<summary>🤖 LLM, RAG and Evals — the one-page sheet</summary>
**Tokens and context:** the model reads tokens; cost = input × price + output × price; the context window holds prompt + answer. Details in the middle of long prompts are recalled less reliably.
**Sampling:** temperature reshapes the distribution; top-p keeps the smallest set of tokens adding to p; top-k keeps the k best. Temperature 0 is near-deterministic, not guaranteed.
**Attention:** `softmax(Q·Kᵀ / √d) · V`. √d keeps scores from saturating the softmax; the causal mask hides the future. Cost grows with the square of context length. KV cache stores past keys and values. Prefill is parallel, decode is sequential.
**Encoder vs decoder vs both:** encoder = embeddings, classification · decoder = generation, chat, tools · encoder-decoder = translation, summarization.
**Which lever:** facts that change → RAG · behaviour or format → prompt, then fine-tune · cost or latency → smaller model, quantization, caching.
**Adapters and training:** LoRA trains small low-rank adapters · QLoRA does it on a 4-bit base · quantization = fewer bits per weight (cheaper serving, some quality loss) · RLHF = supervised tune → reward model from preferences → policy optimization (DPO skips the reward model).
**ML metrics:** precision = flagged and right ÷ flagged · recall = found ÷ existing · PR-AUC for rare positives · accuracy lies on imbalanced data · split by time · fit scalers on the training split only.
**RAG stages and where it fails:** ingest → chunk → embed → retrieve (hybrid) → rerank → assemble prompt → generate → cite. Debug in that order; the first failing stage is the cause.
**Retrieval metrics:** recall@k · MRR = mean of 1/rank of the first hit · NDCG = rank-discounted gain. **Generation metrics:** faithfulness, answer relevancy, context precision, context recall.
**LLM judge:** label a sample yourself, measure agreement, fix the rubric, re-check after any change. Known biases: length, self-preference.
**API contract:** schema (Pydantic) · structured output or tool call · validate · one repair retry · timeout · bounded retries · versioned prompt · log tokens, latency, cost.
**Agent vs workflow:** if you can draw the steps, it is a workflow. Agents need tool schemas, an allow-list, and budgets (steps, tokens, dollars, seconds).
**Security:** treat retrieved text as data; allow-list tools; filter permissions inside the retrieval query; cap cost; return a safe fallback.
**Cost and latency:** measure p50 and p95 per stage · prompt cache (static prefix first) · scoped semantic cache · route easy requests to a small model · fewer, tighter chunks.
</details>
---
# 🛠️ Resource Library (bookmark once — use always)
<details>
<summary>🎓 Courses that back the plan</summary>
- **DeepLearning.AI Data Engineering Professional Certificate** — [coursera.org](https://www.coursera.org/professional-certificates/data-engineering) — lifecycle, SQL, modeling, Airflow, AWS. **Use for:** reference alongside Days 1–7 and 22–35.
- **Data Engineering Zoomcamp** (free) — [github.com/datatalksclub/data-engineering-zoomcamp](https://github.com/datatalksclub/data-engineering-zoomcamp) — Docker, orchestration, dbt, Spark batch, Kafka streaming. **Use for:** Days 22–42.
- **Generative AI with LLMs** (DeepLearning.AI and AWS, about 13 hours) — [deeplearning.ai](https://www.deeplearning.ai/courses/generative-ai-with-llms?id=b3) — transformers, prompting, fine-tuning, PEFT and LoRA, evaluation, RLHF. **Use for:** Days 43–49.
- **LLM Zoomcamp** (free) — [github.com/DataTalksClub/llm-zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp) — RAG, hybrid search, evaluation, monitoring. **Use for:** Days 50–56.
- **DeepLearning.AI short courses** — [deeplearning.ai/short-courses](https://deeplearning.ai/short-courses/) — take the short ones as add-ons: Pydantic for LLM Workflows (Day 47), MCP (Day 58), guardrails (Day 60), RAG (Days 50–52), agentic AI (Days 57–58), orchestrating workflows for GenAI (Day 31).
- **MLOps Specialization** (DeepLearning.AI) — [the launch letter](https://www.deeplearning.ai/the-batch/introducing-the-machine-learning-engineering-for-production-mlops-specialization) — optional, for ML platform roles (Day 62).
- *Courses confirm topic coverage. None of them teaches interview formats such as the AI-assisted round or the project deep dive, so those stay as mocks in Days 78–84.*
</details>
<details>
<summary>🧠 Memory tools — spaced repetition</summary>
- **`error-log.md`** — your own file. Every miss, with the date and a one-line correction. Review the last 14 days every week and before any real interview.
- **Anki** — [apps.ankiweb.net](https://apps.ankiweb.net) — free flashcards with built-in spacing. **Use for:** cloud service maps (Day 33), definitions (Days 43–49), SCD and isolation tables.
- **Paper Leitner box** — five piles reviewed on days 1, 3, 7, 14 and 30. The same schedule as the card reviews, with no software.
- **Say it aloud.** Recording yourself and listening back finds gaps that reading never does.
</details>
<details>
<summary>🎮 Interactive — learn by building</summary>
- **CodeCrafters** — [codecrafters.io](https://codecrafters.io) — build your own Redis, Git, SQLite or Docker step by step; tests gate each stage. **Use for:** systems depth around Days 36–40.
- **Exercism (Python track)** — [exercism.org/tracks/python](https://exercism.org/tracks/python) — free, mentored small exercises. **Use for:** drilling a Week 2 concept until it is reflex.
- *Only if Python basics need repair:* [Boot.dev](https://www.boot.dev) or [CS50P](https://cs50.harvard.edu/python/) before Day 8. Otherwise skip them; Week 2 assumes you can already write Python.
</details>
<details>
<summary>📖 Books — chapters that pay rent</summary>
- **Designing Data-Intensive Applications** (Kleppmann) — Ch 5 Replication · 6 Partitioning · 7 Transactions · 8 Trouble · 9 Consensus · 11 Stream Processing. The most-cited book for data and infrastructure interviews. **Use for:** Days 36–40.
- **The Data Warehouse Toolkit** (Kimball and Ross) — dimensional modeling, grain, SCDs. **Use for:** Days 5–6.
- **Fundamentals of Data Engineering** (Reis and Housley) — the lifecycle and the vocabulary interviewers use. **Use for:** Days 22–35.
- **AI Engineering** (Chip Huyen) — evals, RAG, agents, serving, cost. **Use for:** Days 43–63.
- **System Design Interview vol 1 and 2** (Alex Xu) — URL shortener, news feed, chat are the most asked.
- *(Optional)* **Database Internals** (Petrov) — storage engines and B-trees, deeper than DDIA.
</details>
<details>
<summary>🎥 Video channels</summary>
- **NeetCode** — [neetcode.io/roadmap](https://neetcode.io/roadmap) — pattern-based algorithms.
- **Hello Interview** — [hellointerview.com](https://hellointerview.com) — the best free system design and mock resource.
- **ByteByteGo** — illustrated system design.
- **Andrej Karpathy** — "Intro to Large Language Models" and "Let's build GPT" — the clearest explanations of how LLMs work. **Use for:** Days 43–44.
- **3Blue1Brown** — [3blue1brown.com](https://www.3blue1brown.com) — the neural network and transformer visual series.
- **Jordan Has No Life** — DDIA chapter walkthroughs.
</details>
<details>
<summary>🎯 Practice platforms</summary>
- **LeetCode** — [SQL 50](https://leetcode.com/studyplan/top-sql-50/) · [Top Interview 150](https://leetcode.com/studyplan/top-interview-150/) · [company-tagged lists](https://leetcode.com/company_list/) — filter to the companies you are interviewing with. The practice slot links problems by slug; if a link fails, search the LC number in the label. If a problem is locked behind Premium, swap in any unsolved problem of the same pattern from the SQL 50 or Top Interview 150 list and note the swap in `error-log.md`.
- **Sean Prashad's Patterns** — [seanprashad.com/leetcode-patterns](https://seanprashad.com/leetcode-patterns/) — problems grouped by pattern, filter by company.
- **DataLemur** — [datalemur.com](https://datalemur.com) · **StrataScratch** — real company SQL tags.
- **Pramp** and [interviewing.io](https://interviewing.io) — live mock interviews for Week 12.
</details>
<details>
<summary>✍️ AI engineering reading</summary>
- **Eugene Yan** — [Patterns for building LLM-based systems](https://eugeneyan.com/writing/llm-patterns/) and [Evaluating LLM evaluators](https://eugeneyan.com/writing/llm-evaluators/).
- **Hamel Husain** — [Your AI product needs evals](https://hamel.dev/blog/posts/evals/).
- **Anthropic** — [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents).
- **Model Context Protocol** — [modelcontextprotocol.io](https://modelcontextprotocol.io).
- **OWASP** — [Top 10 for LLM applications](https://genai.owasp.org/llm-top-10/) and **Simon Willison** on [prompt injection](https://simonwillison.net/series/prompt-injection/).
- **Jay Alammar** — [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/).
</details>
<details>
<summary>👩‍💻 Real engineer references</summary>
- **Sean Prashad** — [github.com/seanprashad/leetcode-patterns](https://github.com/seanprashad/leetcode-patterns).
- **Evan King and Stefan Mai** — [hellointerview.com](http://hellointerview.com) (ran 500+ interviews).
- **Your target firm's public tech stack** — most large engineering orgs open-source part of their data platform or write about it. Find the repo or the engineering blog for the team you are interviewing with and read it; almost no candidate does, and it turns "why us?" into a real conversation.
- **Eng blogs:** Stripe (idempotency, ledgers) · Netflix (fault tolerance, observability) · Uber (real-time data) — then the engineering blog of whichever firm you are interviewing with.
</details>
---
# 📅 Week 1 — SQL and Data Modeling: the most-tested skill goes first
> **Phase goal:** SQL shows up in most data engineering loops and modeling in about half of them, so they open the program. By Day 7 you can dedup, rank, sessionize, upsert idempotently, model a star schema with the grain stated first, and read a query plan. You build all of it against a small warehouse you generate yourself (`sql-lab`, DuckDB). If SQL is already your daily language, run Days 1–3 as a one-hour speed set each and spend the saved time on Days 5–6.
## Day 1 — Joins, dedup and NULL traps 🎮 Level 1
> 🎯 **Cutoff target:** three dedup queries return identical rows, and you can say what a NULL does to `NOT IN`, `COUNT(col)` and a `LEFT JOIN` filter.
**🔁 Review (15 min, from memory).** Cold start. You have not studied this yet, so a wrong answer is fine. Write your best answer to each in two or three lines. You re-test these on Day 7.
- [ ] Write a query for the second-highest salary. What changes if two people tie for the highest?
- [ ] Explain INNER, LEFT and FULL OUTER JOIN with one example of when you would use each.
- [ ] What can a window function do that GROUP BY cannot?
**📖 The concept (what & why engineers use it).** Interviewers start with joins and dedup because they expose whether you think about **grain**: what one row of each table means. A join that multiplies rows (a fan-out) silently breaks every SUM after it. Dedup means keeping one row per key by a rule you can defend, usually "latest by `updated_at`": `ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated_at DESC) = 1`.
**🔀 Alternatives & when to pick them.**
- **ROW_NUMBER filter** — the default. Add a tie-breaker so the result is deterministic.
- **QUALIFY** (DuckDB, Snowflake, BigQuery) or **DISTINCT ON** (Postgres) — shorter, not portable to SQL Server or MySQL.
- **GROUP BY + MAX, then join back** — works everywhere, but ties return duplicate rows.
- **NOT EXISTS vs LEFT JOIN … IS NULL vs NOT IN** — NOT EXISTS and the anti-join are safe; NOT IN returns nothing if the subquery contains a NULL.
**🚧 Roadblock → fix.** Fan-out: join `orders` to `order_items`, then `SUM(orders.amount)` — every order is counted once per item. Fix: aggregate the many side first, or sum at the grain the measure lives at. Second wall: a filter on the right table in `WHERE` turns a LEFT JOIN into an INNER JOIN. Put it in `ON`.
**💡 Key ideas / hints.**
- Say the grain before you join: "one row per order".
- `COUNT(col)` skips NULLs, `COUNT(*)` does not, and `= NULL` is never true — use `IS NULL`.
- Inside `ROW_NUMBER`, always end the `ORDER BY` with a unique column.
**📚 Read (what + how).**
- [PostgreSQL tutorial — Joins Between Tables](https://www.postgresql.org/docs/current/tutorial-join.html) — **extract:** inner vs outer, and what the NULL side looks like.
- [Mode — SQL joins](https://mode.com/sql-tutorial/sql-joins) — **extract:** where a filter belongs in an outer join.
**🎮 Build & save (the real test).**
Create the `sql-lab` repo: a `seed.py` that builds a DuckDB file with ~10k customers, ~100k orders and ~300k order items. Plant dirt on purpose: duplicate customer rows with different `updated_at`, NULL regions, and orders whose `customer_id` has no customer. Then write four queries under `q/` and a `tests/test_sql.py` (`pytest -q`) that checks each:
- [ ] dedup customers three ways (ROW_NUMBER, QUALIFY or DISTINCT ON, GROUP BY + join back) and assert the three agree
- [ ] find orphan orders with `NOT EXISTS` and with `LEFT JOIN … IS NULL`; then show `NOT IN` returning zero rows after you add one NULL to the list
- [ ] revenue per region without fan-out, checked against a hand-computed total on a 5-row fixture
**Commit** (`day1: sql-lab seed, dedup, orphans`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 196 — Delete Duplicate Emails](https://leetcode.com/problems/delete-duplicate-emails/) — dedup: keep the row you can defend
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the three dedup queries return identical rows
- [ ] a NOT IN demo shows the NULL failure
- [ ] revenue per region matches the hand-computed number ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What does one row of `orders` mean, and what happens to `SUM(amount)` after you join to `order_items`?
- [ ] Why does `NOT IN` fail on NULLs, and what do you write instead?
- [ ] Write latest-row-per-key dedup from memory, tie-breaker included.
## Day 2 — Window functions I: ranking, top-N, running totals 🎮 Level 2
> 🎯 **Cutoff target:** top-N per group in three tie rules, a running total with an explicit frame, and a 7-day moving average over a date spine — each tested on `sql-lab`.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 1, yesterday: What does one row of `orders` mean, and what happens to `SUM(amount)` after you join to `order_items`?
- [ ] Day 1, yesterday: Write latest-row-per-key dedup from memory, tie-breaker included.
- [ ] Day 1, yesterday: Why does `NOT IN` fail on NULLs, and what do you write instead?
**📖 The concept (what & why engineers use it).** A window function computes a value for each row from a set of related rows without collapsing them the way GROUP BY does. It has three parts: `PARTITION BY` (the groups), `ORDER BY` (the order inside a group) and a **frame** (which neighbouring rows count). Ranking has three flavours: `ROW_NUMBER` (never ties), `RANK` (ties share a rank, then a gap) and `DENSE_RANK` (ties share, no gap). The classic question is "top 3 per group", then the interviewer changes the tie rule.
**🔀 Alternatives & when to pick them.**
- **ROW_NUMBER / RANK / DENSE_RANK** — pick by the tie rule: exactly N rows, everyone tied at rank N, or N distinct values.
- **Window vs correlated subquery vs self-join** — a window is one pass and the easiest to read; self-joins fan out.
- **ROWS vs RANGE frame** — ROWS counts physical rows; RANGE includes every row with the same ORDER BY value.
- **CTE filter vs QUALIFY** — window results cannot go in `WHERE`; wrap in a CTE for portability.
**🚧 Roadblock → fix.** The default frame trap: `SUM(x) OVER (ORDER BY ts)` uses `RANGE … CURRENT ROW`, so two rows with the same `ts` get the same running total. Fix: write the frame (`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`) or add a unique tie-breaker. Second wall: a moving average over missing days is wrong. Build a date spine first and LEFT JOIN to it.
**💡 Key ideas / hints.**
- Window functions run after `WHERE`, `GROUP BY` and `HAVING`, and before the final `ORDER BY` and `LIMIT`.
- An empty `OVER ()` means one partition: the whole table.
- 7-day average: `AVG(x) OVER (ORDER BY d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`, one row per day.
**📚 Read (what + how).**
- [PostgreSQL tutorial — Window Functions](https://www.postgresql.org/docs/current/tutorial-window.html) — **extract:** partition, order and what the frame is.
- [Mode — SQL window functions](https://mode.com/sql-tutorial/sql-window-functions) — **extract:** ranking and running totals side by side.
**🎮 Build & save (the real test).**
In `sql-lab`, plant tied revenue in the seed, then:
- [ ] top 3 customers per region by revenue in three versions: exactly 3 rows (`ROW_NUMBER`), ties included (`RANK`), 3 distinct revenue values (`DENSE_RANK`) — assert the row counts differ
- [ ] running revenue per customer with an explicit `ROWS` frame; show the surprise you get from the `RANGE` default on tied timestamps
- [ ] a 7-day moving average over a `generate_series` date spine, so days with no orders count as 0
**Commit** (`day2: ranking, running totals, moving average`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 185 — Department Top Three Salaries](https://leetcode.com/problems/department-top-three-salaries/) — say the tie rule out loud before you pick RANK or DENSE_RANK
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the three top-N variants return different row counts on tied data
- [ ] the ROWS vs RANGE difference is demonstrated in a test
- [ ] the moving average uses a date spine ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] "Top 3 per group, include ties." What changes in your query?
- [ ] Why do two rows with the same timestamp get the same running total by default?
- [ ] Where do window functions sit in the logical order of a query, and what does that forbid?
## Day 3 — Window functions II: LAG/LEAD, sessions, gaps and islands 🎮 Level 3
> 🎯 **Cutoff target:** sessionize an event stream with `LAG`, find consecutive-day streaks with the row-number trick, and say why `ORDER BY` inside the window is not optional.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 2, yesterday: Why do two rows with the same timestamp get the same running total by default?
- [ ] Day 2, yesterday: Where do window functions sit in the logical order of a query, and what does that forbid?
- [ ] Day 2, yesterday: "Top 3 per group, include ties." What changes in your query?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** `LAG` and `LEAD` read the previous or next row in the window order. Most "compare to the row before" questions use them: day-over-day change, time between events, a new session when the gap passes 30 minutes. **Gaps and islands** groups consecutive rows: subtract a row number from a date and every row in an unbroken run gets the same value.
**🔀 Alternatives & when to pick them.**
- **LAG/LEAD vs self-join on id+1** — the self-join breaks when ids have holes; LAG follows the ORDER BY.
- **`date − ROW_NUMBER()` vs LAG flag + running SUM** — the subtraction trick only fits exact-step runs; the flag version handles timeouts (sessions).
- **SQL vs pandas/Polars** — SQL when the data is big and already in the warehouse; Python when the logic needs custom state.
**🚧 Roadblock → fix.** `LAG` with no `ORDER BY`, or an order on a non-unique column, gives neighbours that change between runs. It "works" on your laptop and fails in production. Fix: order by a unique key such as `(ts, event_id)`. Second wall: the first row has no previous row, so `LAG` is NULL — decide what NULL means (usually "new session") and handle it.
**💡 Key ideas / hints.**
- Session id = `SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY ts)`, where `is_new_session` is `ts − LAG(ts) > 30 minutes OR LAG(ts) IS NULL`.
- Islands: `d − ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY d)` is constant inside a run of consecutive days.
- Longest streak per user = the biggest island.
**📚 Read (what + how).**
- [PostgreSQL — window function reference](https://www.postgresql.org/docs/current/functions-window.html) — **extract:** `lag`, `lead` and their default-value argument.
- [Mode — SQL window functions](https://mode.com/sql-tutorial/sql-window-functions) — **extract:** the LAG/LEAD section.
**🎮 Build & save (the real test).**
Add an `events` table (`user_id`, `ts`, `type`) with planted sessions, then:
- [ ] day-over-day revenue change and percent change with `LAG`, NULL-safe
- [ ] sessionization with a 30-minute timeout: sessions per user and average session length
- [ ] the longest run of consecutive active days per user, using the subtraction trick
Test each against a 5-event fixture whose sessions you worked out by hand first. **Commit** (`day3: lag, sessions, islands`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 180 — Consecutive Numbers](https://leetcode.com/problems/consecutive-numbers/) — LAG or a self-join; name which and why
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] sessions match your hand-worked fixture
- [ ] streak query handles a user with two separate runs
- [ ] you can explain why the LAG order must be unique ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Write the sessionization query shape from memory: flag, running sum, group.
- [ ] How does `date − ROW_NUMBER()` identify a run of consecutive days?
- [ ] Why is `LAG` without a unique ORDER BY a production bug?
## Day 4 — Idempotent MERGE, late data and incremental loads 🎮 Level 4
> 🎯 **Cutoff target:** a MERGE-based upsert you can run twice with the same result, and a late-arriving row that corrects history without double counting.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 3, yesterday: Why is `LAG` without a unique ORDER BY a production bug?
- [ ] Day 3, yesterday: Write the sessionization query shape from memory: flag, running sum, group.
- [ ] Day 1, 3 days back: Why does `NOT IN` fail on NULLs, and what do you write instead?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Pipelines re-run: retries, backfills, replays. An **idempotent** load leaves the table in the same state no matter how many times you apply the same batch. In SQL that means an upsert by business key (`MERGE`, or `INSERT … ON CONFLICT`) with a rule for which version wins — not a blind `INSERT`. **Late data** arrives after its window closed; you either reload a lookback window or let the upsert correct the row.
**🔀 Alternatives & when to pick them.**
- **MERGE vs INSERT … ON CONFLICT vs delete-and-insert by partition** — MERGE handles insert, update and delete in one statement; ON CONFLICT needs a unique constraint; delete-and-insert by partition is the simplest idempotent load for append-only facts.
- **Full refresh vs high-water-mark incremental vs CDC log** — full refresh is safest for small tables; a watermark needs a trustworthy timestamp; only CDC sees deletes.
- **Exact watermark vs lookback window** — a lookback (reload the last 3 days) absorbs late data at the cost of rework.
**🚧 Roadblock → fix.** Duplicate keys inside one batch make MERGE fail ("multiple source rows match") or apply in random order. Fix: dedup the batch first (Day 1), then MERGE. Second wall: a replayed old batch overwrites newer data. Fix: guard the update with `WHEN MATCHED AND src.updated_at > tgt.updated_at`.
**💡 Key ideas / hints.**
- Idempotent means `apply(apply(x)) == apply(x)`.
- The MERGE `ON` clause is the business key, never a surrogate you generate.
- MERGE never removes rows by itself — deletes need a tombstone flag or an explicit `WHEN MATCHED AND src.op = 'D' THEN DELETE`.
**📚 Read (what + how).**
- [PostgreSQL — MERGE](https://www.postgresql.org/docs/current/sql-merge.html) — **extract:** WHEN MATCHED / NOT MATCHED and the extra AND conditions.
- [Delta Lake — upsert with MERGE](https://docs.delta.io/latest/delta-update.html) — **extract:** the same pattern at lakehouse scale; you meet it again on Day 24.
**🎮 Build & save (the real test).**
Create `customers_dim` as the target and feed it four batches from `seed.py` helpers:
- [ ] batch A: new rows; batch B: updates; batch C: a replay of old data with duplicate keys; batch D: a late row for last week plus a delete tombstone
- [ ] load = dedup the batch (Day 1 pattern), then MERGE (DuckDB `MERGE INTO` if your version has it, otherwise `INSERT … ON CONFLICT DO UPDATE … WHERE`)
- [ ] test: apply each batch twice and assert the table did not change the second time; assert the stale replay did not overwrite newer rows
**Commit** (`day4: idempotent merge`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1174 — Immediate Food Delivery II](https://leetcode.com/problems/immediate-food-delivery-ii/) — first row per customer, then a percentage
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] every batch applied twice leaves the table unchanged
- [ ] a stale replay does not overwrite a newer row
- [ ] the tombstone removes exactly one row ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Define idempotent in one line and show where your MERGE guard enforces it.
- [ ] Why dedup the batch before MERGE?
- [ ] Full refresh, watermark, CDC: which one sees deletes, and why?
## Day 5 — Dimensional modeling: declare the grain first 🎮 Level 5
> 🎯 **Cutoff target:** a star schema for orders (fact, customer, product and date dimensions) with the grain written in one sentence, answering three business questions.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 4, yesterday: Define idempotent in one line and show where your MERGE guard enforces it.
- [ ] Day 4, yesterday: Why dedup the batch before MERGE?
- [ ] Day 2, 3 days back: Where do window functions sit in the logical order of a query, and what does that forbid?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Dimensional modeling splits data into **facts** (events you measure: an order line, a click) and **dimensions** (the context: customer, product, date). The habit interviewers reward is declaring the **grain** first — "one row per order line" — and only then choosing the dimensions and measures that are true at that grain. Measures can be additive (revenue), semi-additive (a balance: not summable across time) or non-additive (a ratio: store numerator and denominator). Surrogate keys decouple the warehouse from source ids and make history possible.
**🔀 Alternatives & when to pick them.**
- **Star vs snowflake vs one big table** — star is the default (simple joins); snowflake normalizes dimensions (less space, more joins); one big table is fast for BI but hard to keep consistent.
- **Kimball vs Inmon vs Data Vault** — Kimball builds conformed dimensions and marts bottom-up; Inmon builds a normalized enterprise warehouse first; Data Vault (hubs, links, satellites) favors auditability. Default to Kimball unless the prompt says otherwise.
- **Surrogate vs natural keys** — surrogate keys survive source-system changes and enable SCD2.
**🚧 Roadblock → fix.** Mixed grain: order-level shipping cost copied onto every order-line row, then `SUM(shipping)` multiplies it. Fix: keep each measure at its own grain — an order-grain fact, or an explicit allocation. Second wall: modeling the source tables instead of the business process. Start from "what is being measured", not from the schema you were handed.
**💡 Key ideas / hints.**
- Four steps: business process → grain → dimensions → facts.
- A **degenerate dimension** (the order number) lives on the fact with no table of its own.
- A date dimension is worth building every time; a **junk dimension** collects low-cardinality flags.
**📚 Read (what + how).**
- [Kimball Group — dimensional modeling techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/) — **extract:** the four-step process, grain, additive vs not.
- [Microsoft Learn — star schema guidance](https://learn.microsoft.com/en-us/power-bi/guidance/star-schema) — **extract:** fact vs dimension tables and why the shape helps reporting.
**🎮 Build & save (the real test).**
In `sql-lab`, build a star schema from the raw tables:
- [ ] DDL for `dim_date` (from `generate_series`), `dim_customer` (surrogate key), `dim_product` and `fact_order_lines`, with the grain as a one-line comment at the top of the fact DDL
- [ ] three BI queries: revenue by region by month; top 3 products per quarter; repeat-customer rate
- [ ] a reconciliation test: `SUM(fact revenue)` equals the raw total
- [ ] draw the schema on paper (boxes and keys), no tools
**Commit** (`day5: star schema`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1070 — Product Sales Analysis III](https://leetcode.com/problems/product-sales-analysis-iii/) — state the grain of the answer first
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the grain sentence is written in the DDL
- [ ] fact revenue reconciles to the raw total
- [ ] the paper diagram shows keys on every join ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] State the grain of your fact table, then name one measure that would break it if added.
- [ ] Additive, semi-additive, non-additive: one example each.
- [ ] Star vs snowflake vs one big table: when would you pick each?
## Day 6 — SCD types and reading a query plan 🎮 Level 6
> 🎯 **Cutoff target:** `dim_customer` as SCD type 2, a point-in-time join that returns the version valid at order time, and an `EXPLAIN` you can read aloud.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 5, yesterday: Additive, semi-additive, non-additive: one example each.
- [ ] Day 5, yesterday: State the grain of your fact table, then name one measure that would break it if added.
- [ ] Day 3, 3 days back: Write the sessionization query shape from memory: flag, running sum, group.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** A **slowly changing dimension** is a dimension whose attributes change over time (a customer moves region). **Type 1** overwrites (no history). **Type 2** closes the old row and inserts a new one with validity dates (full history). **Type 3** keeps the previous value in an extra column (one step of history). Interviewers ask which you would pick, then change the requirement mid-round: "finance now wants last year's revenue by the region the customer lived in *then*." A **query plan** (`EXPLAIN`) shows how the engine runs your SQL — scan, filter, join type, sort, aggregate. You are looking for full scans, a bad join order, and row estimates far from reality.
**🔀 Alternatives & when to pick them.**
- **Type 1 vs 2 vs 3 vs 6** — 1 when history is worthless, 2 when the business asks "as it was then", 3 for a single before/after column, 6 is a hybrid you only name.
- **SCD2 via MERGE vs a snapshot tool (dbt snapshots)** — know both; you meet dbt on Day 29.
- **Join by date range at query time vs store the dimension key on the fact at load time** — resolving the key once at load is cheaper and safer.
**🚧 Roadblock → fix.** Overlapping or gapped validity ranges after a late-arriving change. Fix: derive `valid_to` from `LEAD(valid_from)` so ranges are contiguous by construction, use `9999-12-31` rather than NULL for the open row, and test for overlaps. Second wall: reading a plan by cost number alone. Compare estimated rows with actual rows and look at what is scanned.
**💡 Key ideas / hints.**
- Make `valid_to` exclusive: `valid_from <= ts AND ts < valid_to`.
- One `is_current` row per business key — write a test for it.
- In a plan: which scan, which join (hash, merge, nested loop), where the filter is applied, estimated vs actual rows.
**📚 Read (what + how).**
- [Kimball Group — Type 2 slowly changing dimension](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2/) — **extract:** the row-versioning mechanics.
- [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html) — **extract:** how to read nodes, costs and actual rows.
**🎮 Build & save (the real test).**
- [ ] add region changes to the seed (customers move twice), including one late-arriving change
- [ ] build `dim_customer_scd2` with `valid_from`, `valid_to` (from `LEAD`) and `is_current`
- [ ] write the point-in-time join: revenue by the region at order time vs revenue by current region, and show the numbers differ
- [ ] tests: exactly one current row per customer; no overlaps and no gaps
- [ ] run `EXPLAIN ANALYZE` on the point-in-time join and write three sentences: what is scanned, which join runs, what you would change
**Commit** (`day6: scd2 + plan notes`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1164 — Product Price at a Given Date](https://leetcode.com/problems/product-price-at-a-given-date/) — point-in-time lookup, the SCD2 idea in miniature
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] one current row per customer, no overlaps, no gaps
- [ ] revenue by historical region differs from revenue by current region
- [ ] three sentences on the plan are written ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Type 1, 2, 3: what does each keep, and when do you pick each?
- [ ] "Now finance wants the region as it was at order time." Which table design answers it?
- [ ] Name three things you look at first in a query plan.
## Day 7 — Boss: timed SQL set and a modeling whiteboard 🎮 Boss Level
> 🎯 **Cutoff target:** solve four SQL problems against the clock with no notes, then whiteboard a star schema from a one-paragraph brief with the grain stated first.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 1: Why does `NOT IN` fail on NULLs, and what do you write instead?
- [ ] Day 2: "Top 3 per group, include ties." What changes in your query?
- [ ] Day 3: Why is `LAG` without a unique ORDER BY a production bug?
- [ ] Day 4: Why dedup the batch before MERGE?
- [ ] Day 5: State the grain of your fact table, then name one measure that would break it if added.
- [ ] Day 6: Name three things you look at first in a query plan.
**📖 The concept (what & why engineers use it).** Boss days teach nothing new. They check whether the week is retrievable under time pressure. The rule for today: no notes while the timer runs, and you check answers only after it stops. A slow or wrong answer is useful — it goes in `error-log.md` and comes back in the next reviews.
**🎮 Build & save (the real test).**
- [ ] **Timed set (30 min, ~7 min each, no notes):** [LC 1204 — Last Person to Fit in the Bus](https://leetcode.com/problems/last-person-to-fit-in-the-bus/), [LC 262 — Trips and Users](https://leetcode.com/problems/trips-and-users/), [LC 534 — Game Play Analysis III](https://leetcode.com/problems/game-play-analysis-iii/), [LC 1193 — Monthly Transactions I](https://leetcode.com/problems/monthly-transactions-i/)
- [ ] **Modeling brief (25 min):** "A food-delivery app wants to analyze delivery time, courier performance and promo effectiveness." State the process and grain, list dimensions and facts, pick an SCD type for the courier's home zone, and draw it. Compare with your Day 5–6 notes afterward.
- [ ] Write `sql-cheatsheet.md` (one page): tie-rule table for ranking, the frame default trap, the LAG session pattern, the islands trick, the MERGE guard, the grain checklist, SCD types. **Commit** (`day7: sql week complete`).
**🧮 Practice reps (15 min).**
- [ ] Re-answer the three Day 1 baseline questions from memory, then compare with your Day 1 answers. Note the difference in `error-log.md`.
**✅ Done when:**
- [ ] four problems attempted inside 30 minutes, then checked
- [ ] the modeling brief states grain before anything else
- [ ] `sql-cheatsheet.md` committed
- [ ] Week 1 retro written: what worked, what dragged, one change for Week 2 ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏔️ **Week 1 complete.** Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Teach it: explain grain, fan-out and SCD2 to an imaginary junior in three minutes, out loud.
- [ ] Which two problems cost you the most time today, and what pattern did you miss?
---
# 📅 Week 2 — Production Python: ship a small service you can trust
> **Phase goal:** Python is tested in most loops as data handling and general coding, so you need a production habit, not framework trivia. Over seven days you build **Sentinel-Lite**, a small service that compares a source feed with a source of truth and repairs the differences: typed, validated, tested, async, resilient and observable. Each day ends with a `git commit` as a checkpoint. A day is cleared when its tests are green.
## Day 8 — Types, Pydantic and fail-loud settings 🎮 Level 8
> 🎯 **Cutoff target:** `mypy --strict` passes on `sentinel/models.py`, and Sentinel-Lite refuses to start on a bad config: it fails at startup, not mid-run.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 7, yesterday: Which two problems cost you the most time today, and what pattern did you miss?
- [ ] Day 5, 3 days back: Star vs snowflake vs one big table: when would you pick each?
- [ ] Day 1, a week back: What does one row of `orders` mean, and what happens to `SUM(amount)` after you join to `order_items`?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Type hints plus a checker such as mypy catch shape bugs before the code runs. They do nothing at runtime, so data from outside (files, APIs, environment variables) still needs validation. That is Pydantic's job: it parses untrusted input into typed objects and raises a precise error when the input is wrong. Settings follow the same rule: load config once, validate it at startup, and refuse to run on bad values. Today you build the typed core of Sentinel-Lite.
**🔀 Alternatives & when to pick them.**
- **Pydantic** — runtime validation at I/O boundaries (the default choice today). Pick when data is untrusted.
- **dataclasses** (Day 9) — internal value objects you already trust; no validation overhead.
- **TypedDict** — static-only hints for dict-shaped data; zero runtime cost, zero runtime safety.
- **attrs / marshmallow** — older ecosystems; Pydantic v2 (Rust core) is faster and now the default for new work.
**🚧 Roadblock → fix.**
The classic wall: `mypy --strict` floods you with `error: Function is missing a type annotation` and `Need type annotation for...`. Beginners disable strict; engineers instead annotate incrementally and use `reveal_type(x)` to see what mypy infers, plus `# type: ignore[code]` *sparingly* on genuinely untypeable third-party calls. The fix is precision, not surrender.

The big one migrating to v2: validators changed. People hit `@validator is deprecated` and confusing `ValidationError`s. The fix the community reaches for: use `@field_validator` (v2 name) and `model_config = ConfigDict(...)` instead of the old `class Config`, and read the error's `.errors()` list — it tells you exactly which field and rule failed. Second gotcha: Pydantic *coerces* (`"5"` → `5`) which can hide bugs; use `Strict` types when you want hard rejection.
**💡 Key ideas / hints.**
- `BaseSettings` auto-loads from env vars / `.env`.
- Fail-fast: validate everything you depend on *before* doing real work.
- TypedDict vs Pydantic = static-only hint vs runtime-enforced. Use both, in their lanes (internal vs boundary).
**📚 Read (what + how).**
- [Real Python: Type Checking](https://realpython.com/python-type-checking/) §1–5 — **extract:** how mypy runs, what `--strict` adds.
- [Pydantic v2 — Models](https://docs.pydantic.dev/latest/concepts/models/) — **extract:** validation/coercion + `field_validator`.
**🎮 Build & save (the real test).**
- [ ] `sentinel/models.py`: a `Record` TypedDict (`key`, `amount`, `version`, `updated_at`), `MismatchKind = Literal["MISSING","EXTRA","DIVERGENT"]`, a `Fetcher` Protocol with `fetch(keys) -> list[Record]`, and typed stubs for `detect(...)` and `load_truth(...)`. Run `mypy --strict` until it is clean.
- [ ] `sentinel/config.py`: `Settings(BaseSettings)` with `source_dsn`, `truth_dsn`, `batch_size=500`, `retry_max=3`, `quarantine_path`; a `@field_validator` for the DSN prefixes and `batch_size > 0`; a Pydantic `RecordModel` as the validated twin of `Record`.
- [ ] commit `.env.example`. **Commit** (`day8: types + validated settings`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 601 — Human Traffic of Stadium](https://leetcode.com/problems/human-traffic-of-stadium/) — gaps and islands
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] `mypy --strict sentinel/models.py` reports 0 errors
- [ ] a bad DSN gives a clear validation error at startup
- [ ] `RecordModel` accepts a good record and rejects a malformed one ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] One line each: when do you reach for TypedDict, Protocol or a plain annotation?
- [ ] Which validates at runtime, TypedDict or Pydantic? Where does each belong in Sentinel-Lite?
- [ ] Why validate config at startup instead of at first use? Name the failure it prevents.
## Day 9 — Value objects, Protocols and SOLID in practice 🎮 Level 9
> 🎯 **Cutoff target:** `Mismatch` and `RemediationReport` are frozen, slotted dataclasses, and a third detector plugs into the orchestrator with zero orchestrator edits.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 8, yesterday: Which validates at runtime, TypedDict or Pydantic? Where does each belong in Sentinel-Lite?
- [ ] Day 6, 3 days back: Type 1, 2, 3: what does each keep, and when do you pick each?
- [ ] Day 2, a week back: Why do two rows with the same timestamp get the same running total by default?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Internal objects you already trust do not need Pydantic. A `@dataclass(frozen=True, slots=True)` is a cheap, immutable value object, and `slots` drops the per-instance `__dict__`, which saves memory when you hold millions of them. Design the moving parts around **interfaces**: a `Protocol` describes what an object can do, so the orchestrator depends on `Detector` and `Remediator`, not on concrete classes. Pass collaborators in through the constructor (dependency injection) instead of subclassing to share code.
**🔀 Alternatives & when to pick them.**
- **Protocol** — structural interface, no inheritance required. Default in modern Python.
- **ABC (abstractmethod)** — nominal interface; pick when you want to *share* base implementation or force explicit subclassing.
- **Duck typing, no interface** — fine for tiny scripts; doesn't scale to a team or a checker.
**🚧 Roadblock → fix.** The wall: people reach for **inheritance** to share code and end up with fragile deep hierarchies (the classic "banana → gorilla → jungle" problem — you wanted one method, you got the world). The fix the field settled on: **composition over inheritance** + dependency injection — pass collaborators in, don't subclass to get them. Second gotcha: over-abstracting too early; add the interface when you have *two* implementations, not before.
**💡 Key ideas / hints.**
- `@dataclass(frozen=True, slots=True)` = immutable + memory-tight.
- `__post_init__` validates invariants at construction.
- The five shape tools now in hand: TypedDict (static dict) · dataclass (object) · Pydantic (validated) · NamedTuple (immutable tuple) · Protocol (interface).
**📚 Read (what + how).**
- [Real Python: Data Classes](https://realpython.com/python-data-classes/) — **extract:** field options, frozen, default_factory.
- [Real Python: SOLID](https://realpython.com/solid-principles-python/) (~30 min) — **extract:** SRP + DIP examples.
**🎮 Build & save (the real test).**
- [ ] `Mismatch(key, kind, source_val, truth_val)` and `RemediationReport(attempted, fixed, quarantined)` as `@dataclass(frozen=True, slots=True)`; `__post_init__` rejects an invalid `kind`.
- [ ] `Detector` and `Remediator` Protocols; `MissingRecordDetector` and `DivergentValueDetector`; a `ReconcileOrchestrator` that takes both by constructor.
- [ ] prove the open/closed point: add a third detector without touching the orchestrator.
**Commit** (`day9: value objects + interfaces`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1204 — Last Person to Fit in the Bus](https://leetcode.com/problems/last-person-to-fit-in-the-bus/) — running total, then pick the last row under the limit
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] mutating a frozen instance raises; a bad `kind` is rejected
- [ ] adding a third detector required zero orchestrator edits
- [ ] the orchestrator receives its collaborators by injection ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] TypedDict vs dataclass vs Pydantic vs NamedTuple vs Protocol: which validate at runtime, which are mutable?
- [ ] Explain SRP and dependency inversion using the orchestrator (90 seconds, aloud).
- [ ] When would you pick an ABC over a Protocol?
## Day 10 — Decorators, context managers and generators 🎮 Level 10
> 🎯 **Cutoff target:** a working `@retry_on_transient`, a `reconciliation_run` context manager and a streaming `stream_records` generator, all covered by passing tests.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 9, yesterday: When would you pick an ABC over a Protocol?
- [ ] Day 7, 3 days back: Which two problems cost you the most time today, and what pattern did you miss?
- [ ] Day 3, a week back: Why is `LAG` without a unique ORDER BY a production bug?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Three tools make Python code read like the problem. A **decorator** wraps a function to add behaviour (retry, cache, timing) without editing it. A **context manager** (`with`) guarantees cleanup — commit on success, roll back on error. A **generator** (`yield`) produces values one at a time, so a 10 GB file costs the memory of one row. Pipelines use all three constantly.
**🔀 Alternatives & when to pick them.**
- **Decorator** — behavior that wraps *whole functions* uniformly (retry/cache/log).
- **Context manager** — behavior bracketing a *block* with guaranteed cleanup (resources, transactions).
- **Plain try/finally** — fine for one-off cleanup; promote to a context manager when you repeat it.
- **Middleware** (web frameworks) — when the cross-cutting concern spans requests, not functions.
**🚧 Roadblock → fix.** Two classic walls: (1) a decorator clobbers the wrapped function's name/docstring → tooling and tracebacks get confusing. Fix: `@functools.wraps(fn)` on the wrapper. (2) Writing a *parameterized* decorator and getting lost in the nesting (`TypeError: got multiple values`). Fix: remember it's **three layers** — `args → decorator(fn) → wrapper(*a, **kw)` — and write them outside-in.
**💡 Key ideas / hints.**
- `itertools.batched` (3.12+) re-chunks a stream into fixed batches.
- `groupby` on a *sorted* stream = SQL-style aggregation without loading all rows.
- Pull-based iteration *is* backpressure — the consumer sets the pace.
**📚 Read (what + how).**
- [Real Python: Decorators](https://realpython.com/primer-on-python-decorators/) §1–6 — **extract:** the 3-layer nesting + `wraps`.
- [Real Python: Generators](https://realpython.com/introduction-to-python-generators/) — **extract:** lazy eval + memory profile.
**🎮 Build & save (the real test).**
- [ ] `@retry_on_transient(max_attempts=3, base_delay=0.1)`: exponential backoff, retries only `TransientError`, uses `functools.wraps`.
- [ ] `@contextmanager reconciliation_run(store)`: opens a run, commits on success, rolls back and quarantines on exception.
- [ ] `stream_records(path) -> Iterator[Record]` yields row by row; re-chunk with `itertools.batched` to `batch_size`; prove memory stays flat on a large file.
- [ ] test the decorator and the context manager with a fake store that fails once.
**Commit** (`day10: decorators, context manager, streaming`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 262 — Trips and Users](https://leetcode.com/problems/trips-and-users/) — filter both sides of a join, then a rate
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the decorator retries exactly 3 times on TransientError and ignores other errors
- [ ] the context manager rolls back and quarantines on exception
- [ ] the stream holds about one record in memory, not the whole file ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Draw the three-layer decorator nesting from memory. Why `functools.wraps`?
- [ ] What does `yield` inside a `@contextmanager` function mark?
- [ ] Why does a generator keep memory flat, and what breaks if you call `list()` on it?
## Day 11 — pytest and mocking: fast tests with no real I/O 🎮 Level 11
> 🎯 **Cutoff target:** `pytest -q` runs a suite with fixtures and parametrize, and the retry and time-based logic is tested with zero real I/O and zero real sleeping.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 10, yesterday: Draw the three-layer decorator nesting from memory. Why `functools.wraps`?
- [ ] Day 8, 3 days back: Why validate config at startup instead of at first use? Name the failure it prevents.
- [ ] Day 4, a week back: Define idempotent in one line and show where your MERGE guard enforces it.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** pytest is the default Python test framework: plain `assert`, **fixtures** for shared setup and `parametrize` to run one test body over many inputs. Tests are what let you change code without fear. A **mock** replaces a real dependency (network, clock, database) so a test runs fast and the same way every time. The rule: mock at the boundary you own, not deep inside someone else's library.
**🔀 Alternatives & when to pick them.**
- **pytest** — the default for app/library testing; rich plugin ecosystem.
- **unittest** (stdlib) — pick only when you can't add deps, or you're in a codebase already using it.
- **doctest** — tiny executable examples in docstrings; nice for docs, not a real suite.
- **fixtures vs plain setup** — use fixtures when setup is shared/expensive; a local object is fine for one test.
**🚧 Roadblock → fix.** The classic wall: tests that pass alone but fail together (or vice-versa) because of **shared state / order dependence**. The fix the community reaches for: function-scoped fixtures (fresh state per test), `tmp_path` for files, and never mutating module-level globals in tests. Second gotcha: slow suites — mark slow ones (`@pytest.mark.slow`) and keep the default run fast.
**💡 Key ideas / hints.**
- `mocker.patch("pkg.mod.dep")` (pytest-mock) is cleaner than nested `with patch`.
- `freezegun.freeze_time(...)` pins `datetime.now()`; patch `sleep` so backoff tests are instant.
- Assert behavior (final state) over implementation (exact calls) where you can.
**📚 Read (what + how).**
- [pytest — Get Started](https://docs.pytest.org/en/stable/getting-started.html) + [Fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html) — **extract:** fixtures, scope, parametrize.
- [unittest.mock](https://docs.python.org/3/library/unittest.mock.html) — **extract:** `patch`, `MagicMock`, `side_effect`.
**🎮 Build & save (the real test).**
- [ ] `tests/`: unit-test the detectors and the remediator with `parametrize` covering MISSING, EXTRA and DIVERGENT; a fixture builds a small source and truth pair; assert the `RemediationReport` counts; report coverage with `pytest-cov`.
- [ ] test the retry decorator and any time-based logic with a patched sleep and a frozen clock (`freezegun` or `monkeypatch`): the suite must finish in well under a second.
- [ ] mark any slow test `@pytest.mark.slow` and keep the default run fast.
**Commit** (`day11: tests + mocks`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 550 — Game Play Analysis IV](https://leetcode.com/problems/game-play-analysis-iv/) — next-day retention
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] `pytest -q` is green; detectors and remediator are covered through parametrize
- [ ] retry tests do no real sleeping and no real I/O
- [ ] coverage is reported ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] When do you use a fixture and when do you build the object inline?
- [ ] What does `parametrize` give you that a `for` loop in one test does not?
- [ ] Where do you patch: where a name is defined, or where it is used? Why?
## Day 12 — asyncio, threads, processes and the GIL 🎮 Level 12
> 🎯 **Cutoff target:** Sentinel-Lite fetches source and truth concurrently with asyncio, and you can say when to use asyncio, threads or processes, backed by a measured demo.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 11, yesterday: What does `parametrize` give you that a `for` loop in one test does not?
- [ ] Day 9, 3 days back: TypedDict vs dataclass vs Pydantic vs NamedTuple vs Protocol: which validate at runtime, which are mutable?
- [ ] Day 5, a week back: Additive, semi-additive, non-additive: one example each.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Concurrency answers one question: what is the program waiting on? Waiting on the network or disk (I/O-bound): `asyncio` or threads help, because the program idles most of the time. Burning CPU (CPU-bound): the **GIL** lets only one thread run Python bytecode at a time, so threads do not speed it up and you use processes. `asyncio` runs many tasks on one thread by switching at every `await`; one blocking call inside a coroutine stalls everything.
**🔀 Alternatives & when to pick them.**
- **asyncio** — high-concurrency I/O, one thread, low overhead.
- **ThreadPoolExecutor** — I/O-bound work using blocking libraries.
- **ProcessPoolExecutor / multiprocessing** — CPU-bound (parsing/crunching millions of rows): real parallelism, at the cost of IPC/serialization.
- **A real distributed engine (Spark, Days 26–27)** — when data exceeds one machine.
**🚧 Roadblock → fix.** The classic trap: calling a **blocking** function inside async code (e.g. `requests.get`, `time.sleep`) freezes the whole event loop — async "doesn't work" and nobody knows why. Fixes: use async-native libs (`httpx`, `asyncio.sleep`), or push blocking calls to `asyncio.to_thread(...)`. Second gotcha: forgetting to `await` (you get a coroutine object, not a result) — a warning the linter will flag.
**💡 Key ideas / hints.**
- Decision tree: I/O-bound + async libs → asyncio; I/O-bound + blocking libs → threads; CPU-bound → processes.
- `concurrent.futures` gives one API (`ThreadPoolExecutor`/`ProcessPoolExecutor`) to swap between them.
**📚 Read (what + how).**
- [Real Python: Async IO](https://realpython.com/async-io-python/) — **extract:** event loop, coroutine vs task, gather.
- [Real Python: Python GIL](https://realpython.com/python-gil/) — **extract:** what it locks, why it exists.
**🎮 Build & save (the real test).**
- [ ] make the source and truth fetchers async and run them together with `asyncio.gather` (or a `TaskGroup`); add a timeout.
- [ ] measure it: the same 20 simulated 100 ms calls run sequentially, with asyncio, and with a thread pool; then a CPU-bound function with a thread pool vs a process pool. Write the four timings in `docs/concurrency.md`.
- [ ] test the async path with `pytest-asyncio` (or `anyio`).
**Commit** (`day12: async fetch + measured demo`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1193 — Monthly Transactions I](https://leetcode.com/problems/monthly-transactions-i/) — conditional aggregation by month and country
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] source and truth fetch concurrently, with a timeout
- [ ] the four timings are recorded and you can explain each
- [ ] an async test passes ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] I/O-bound or CPU-bound: which tool for each, and what does the GIL do to threads?
- [ ] What happens when you call a blocking function inside a coroutine?
- [ ] Why can `asyncio.gather` hide a failure, and how do you stop it?
## Day 13 — Resilience: backoff, circuit breaker, idempotency 🎮 Level 13
> 🎯 **Cutoff target:** Sentinel-Lite survives a flapping dependency: it retries with backoff, trips a circuit breaker, and re-running a batch changes nothing.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 12, yesterday: Why can `asyncio.gather` hide a failure, and how do you stop it?
- [ ] Day 10, 3 days back: What does `yield` inside a `@contextmanager` function mark?
- [ ] Day 6, a week back: Name three things you look at first in a query plan.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Production systems assume dependencies fail, and "it failed halfway and we ran it again" is a daily event at scale. Three patterns make that safe. **Retry with exponential backoff and jitter** rides out short blips. A **circuit breaker** stops hammering a dead dependency, fails fast, then probes for recovery. **Idempotency** makes a repeated run harmless — the same lesson as Day 4, now in code. Optional extra (15 minutes): one Hypothesis property test, "reconciling twice equals reconciling once".
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
**🎮 Build & save (the real test).**
- [ ] replace the hand-rolled retry with `tenacity`: exponential backoff plus jitter, transient errors only.
- [ ] add a simple circuit breaker around the source fetch: open after N failures, half-open after a cooldown.
- [ ] make remediation idempotent with a key per (batch, record) and prove that re-running a batch changes nothing.
- [ ] test the breaker's three states with a fake dependency that flaps.
**Commit** (`day13: retries, breaker, idempotency`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1341 — Movie Rating](https://leetcode.com/problems/movie-rating/) — two top-1 questions in one query, with a tie-break rule
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] retries use tenacity with backoff + jitter, transient-only
- [ ] breaker opens under sustained failure, recovers via half-open
- [ ] re-running an identical batch is a no-op (idempotent) ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Why does jitter matter — what failure does retry-without-jitter cause?
- [ ] Walk the circuit-breaker state machine and what each transition protects.
- [ ] What is the difference between a retry and an idempotent operation, and why do you need both?
## Day 14 — Boss: observability and ship the PR 🎮 Boss Level
> 🎯 **Cutoff target:** Sentinel-Lite emits a structured log, metrics and a trace for one run, and you open a real pull request with tests and a clear write-up.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 8: Why validate config at startup instead of at first use? Name the failure it prevents.
- [ ] Day 9: Explain SRP and dependency inversion using the orchestrator (90 seconds, aloud).
- [ ] Day 10: Draw the three-layer decorator nesting from memory. Why `functools.wraps`?
- [ ] Day 11: Where do you patch: where a name is defined, or where it is used? Why?
- [ ] Day 12: What happens when you call a blocking function inside a coroutine?
- [ ] Day 13: Why does jitter matter — what failure does retry-without-jitter cause?
**📖 The concept (what & why engineers use it).** Observability = being able to answer "what is the system doing right now and why" without redeploying. The three pillars: **structured logs** (machine-parseable events), **metrics** (counts/latencies/gauges over time → dashboards + alerts), **traces** (one request's path across components). Engineers treat this as day-one work, not an afterthought — you can't operate or auto-heal what you can't see. The capstone reuses all three.
**💡 Key ideas / hints.**
- Emit a structured event per run: records_in, mismatches, fixed, quarantined, duration_ms.
- Counter for mismatches by `kind`, histogram for run duration — these become capstone dashboard panels + alerts.
- Wrap a run in one OTel span with child spans for fetch/detect/remediate.
**🎮 Build & save (the real test).**
- [ ] **Instrument (30 min):** one structured log event per run (`records_in`, `mismatches`, `fixed`, `quarantined`, `duration_ms`); a `mismatches_total{kind=...}` counter and a `run_duration_seconds` histogram; one OpenTelemetry trace with fetch, detect and remediate child spans.
- [ ] **Ship (25 min):** open a real PR on the Sentinel-Lite repo with a description, before and after, test output, and a screenshot of the logs or metrics. **Commit/PR** (`day14: observability + ship`).
**🧮 Practice reps (15 min).**
- [ ] Closed book, 10 minutes: write the Week 2 architecture as boxes and arrows (config → fetchers → detectors → orchestrator → remediator → report), then label which layer defends against which failure.
**✅ Done when:**
- [ ] one run emits structured log + metrics + a trace
- [ ] PR opened with tests passing in CI + a clear write-up
- [ ] Friday retro written: what worked / what dragged / one change for Week 3 ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏔️ **Week 2 complete.** Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Name the three pillars of observability and the question each answers.
- [ ] What is the high-cardinality label trap, and why does it hurt metrics?
- [ ] No notes: list every resilience and quality layer Sentinel-Lite has and the failure each one defends against.
---
# 📅 Week 3 — DSA Core: pattern recognition, not grinding
> **Phase goal:** coding screens still test data structures at several large companies, but 35–50 well-chosen problems are enough for data engineering roles. This week you learn to see the **trigger** (what the prompt says), name the **pattern**, and state the **complexity** before you type. Dynamic programming and deep graph theory are cut on purpose. Every problem ends with a one-line note: trigger → approach.
## Day 15 — Hashmaps, frequency and strings 🎮 Level 15
> 🎯 **Cutoff target:** on each problem, say the trigger phrase that flags "hashmap," then state "O(n)/O(n)" before coding.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 14, yesterday: What is the high-cardinality label trap, and why does it hurt metrics?
- [ ] Day 12, 3 days back: I/O-bound or CPU-bound: which tool for each, and what does the GIL do to threads?
- [ ] Day 8, a week back: Which validates at runtime, TypedDict or Pydantic? Where does each belong in Sentinel-Lite?
- [ ] Day 1, 2 weeks back: Write latest-row-per-key dedup from memory, tie-breaker included.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
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
**📚 Read/watch.** [NeetCode — Arrays & Hashing](https://neetcode.io/roadmap). **Tools:** `dict`, `collections.Counter`, `defaultdict`.
**🎮 Solve & narrate (the real test).**
- [ ] [Two Sum](https://leetcode.com/problems/two-sum/)
- [ ] [Group Anagrams](https://leetcode.com/problems/group-anagrams/)
- [ ] [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)
- [ ] Commit each with a "trigger → approach" note ✅ checkpoint
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 626 — Exchange Seats](https://leetcode.com/problems/exchange-seats/) — LEAD/LAG with an odd-row edge case
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] each problem: trigger, pattern and complexity said before you code
- [ ] a one-line trigger → approach note committed for each ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Which words in a prompt make you reach for a hashmap?
- [ ] Why check-before-insert? What bug does insert-first cause?
- [ ] When is a fixed array better than a dict?
## Day 16 — Two pointers and sliding window 🎮 Level 16
> 🎯 **Cutoff target:** on sight, classify a problem as converging-two-pointers, fast/slow, or sliding-window — and say why.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 15, yesterday: When is a fixed array better than a dict?
- [ ] Day 13, 3 days back: Walk the circuit-breaker state machine and what each transition protects.
- [ ] Day 9, a week back: When would you pick an ABC over a Protocol?
- [ ] Day 2, 2 weeks back: "Top 3 per group, include ties." What changes in your query?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
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
**📚 Read/watch.** [NeetCode — Two Pointers + Sliding Window](https://neetcode.io/roadmap).
**🎮 Solve & narrate (the real test).**
- [ ] [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
- [ ] [Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
- [ ] [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
- [ ] Commit with "trigger → approach" notes ✅ checkpoint
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1907 — Count Salary Categories](https://leetcode.com/problems/count-salary-categories/) — every category must appear, even with 0 rows
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] each problem: trigger, pattern and complexity said before you code
- [ ] a one-line trigger → approach note committed for each ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Which 3 trigger-phrase families split into two-pointers vs sliding-window vs fast/slow?
- [ ] State the sliding-window template + its invariant from memory.
## Day 17 — Stacks, queues and the monotonic stack 🎮 Level 17
> 🎯 **Cutoff target:** see "matching/nesting" → stack, "next greater/smaller" → monotonic stack, instantly.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 16, yesterday: Which 3 trigger-phrase families split into two-pointers vs sliding-window vs fast/slow?
- [ ] Day 14, 3 days back: No notes: list every resilience and quality layer Sentinel-Lite has and the failure each one defends against.
- [ ] Day 10, a week back: Draw the three-layer decorator nesting from memory. Why `functools.wraps`?
- [ ] Day 3, 2 weeks back: How does `date − ROW_NUMBER()` identify a run of consecutive days?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
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
> **Worked mini-example — Daily Temperatures.** "For each day, how many days until a warmer one?" Trigger = "next warmer to the right." Looks like nested loops (O(n²)) but is monotonic-stack. Stack holds indices of days awaiting a warmer day. For day `i`: while the current temp > temp at `stack[-1]`, pop index `j` and set `answer[j] = i - j`. Push `i`. O(n)/O(n).
**🔀 When to pick it vs alternatives.** Stack → nesting/matching/"most recent." Monotonic stack → next-greater/smaller, spans. Queue/`deque` → BFS, window-max, producer/consumer. Need random access by index → that's an array, not a stack.
**🚧 Roadblock → fix.** Not *seeing* the monotonic-stack case → pattern-match the phrase "next greater/smaller to the right," push indices, pop while beaten. Using a `list` as a queue with `.pop(0)` (O(n)) → use `collections.deque` (O(1) both ends).
**🧠 SQL bridge.** "Next greater element" ≈ `LEAD()`/`LAG()` reasoning over an ordering. Nesting ≈ a recursive CTE walking a hierarchy.
**📚 Read/watch.** [NeetCode — Stack](https://neetcode.io/roadmap). **Tools:** `list` (stack), `collections.deque` (queue).
**🎮 Solve & narrate (the real test).**
- [ ] [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)
- [ ] [Min Stack](https://leetcode.com/problems/min-stack/)
- [ ] [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
- [ ] Commit with "trigger → approach" notes ✅ checkpoint
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1327 — List the Products Ordered in a Period](https://leetcode.com/problems/list-the-products-ordered-in-a-period/) — filter the month, then aggregate; check the boundary dates
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] each problem: trigger, pattern and complexity said before you code
- [ ] a one-line trigger → approach note committed for each ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] What phrase screams "monotonic stack," and do you push values or indices? Why?
- [ ] Why `deque` over `list` for a queue?
## Day 18 — Binary search, including on the answer 🎮 Level 18
> 🎯 **Cutoff target:** recognize plain binary search *and* "binary-search-the-answer," and write one bug-free template.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 17, yesterday: Why `deque` over `list` for a queue?
- [ ] Day 15, 3 days back: Which words in a prompt make you reach for a hashmap?
- [ ] Day 11, a week back: What does `parametrize` give you that a `for` loop in one test does not?
- [ ] Day 4, 2 weeks back: Full refresh, watermark, CDC: which one sees deletes, and why?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
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
**📚 Read/watch.** [NeetCode — Binary Search](https://neetcode.io/roadmap). **Tool:** `bisect`.
**🎮 Solve & narrate (the real test).**
- [ ] [Binary Search](https://leetcode.com/problems/binary-search/)
- [ ] [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)
- [ ] [Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/)
- [ ] Commit with "trigger → approach" notes ✅ checkpoint
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 177 — Nth Highest Salary](https://leetcode.com/problems/nth-highest-salary/) — N can be bigger than the row count: what returns?
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] each problem: trigger, pattern and complexity said before you code
- [ ] a one-line trigger → approach note committed for each ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Write your single binary-search template + invariant from memory.
- [ ] What question tells you a problem is "binary search on the answer"?
## Day 19 — Heaps and intervals 🎮 Level 19
> 🎯 **Cutoff target:** see "top-k / k-th / streaming min-max" → heap, and "intervals / scheduling" → sort-by-start sweep.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 18, yesterday: Write your single binary-search template + invariant from memory.
- [ ] Day 16, 3 days back: Which 3 trigger-phrase families split into two-pointers vs sliding-window vs fast/slow?
- [ ] Day 12, a week back: Why can `asyncio.gather` hide a failure, and how do you stop it?
- [ ] Day 5, 2 weeks back: State the grain of your fact table, then name one measure that would break it if added.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 What the pattern IS.** A heap (priority queue) gives O(log n) push/pop with O(1) peek at the min — for "k largest," "merge k sorted," running median. **Interval** problems (merge/overlap/scheduling) start with "sort by start, then sweep," often with a min-heap of end-times.
**🔍 How to identify it — triggers & constraint signals.**
- Heap: *"top K," "k-th largest/smallest," "K closest," "merge K sorted," "running/median," "schedule by priority."*
- Intervals: *"merge overlapping," "meeting rooms," "can attend all," "minimum number of … to cover," "\[start, end\] pairs."*
- Constraint signal (heap): you need the best-k, not a full sort → O(n log k) beats O(n log n). Streaming data → can't sort once.
**🧠 Thought process — intervals steps.**
Sort by start; walk; if the current interval overlaps the last kept one (`start <= prev_end`), merge (extend end); else start a new one. For "rooms needed," push end-times to a min-heap and pop whenever a new start ≥ the smallest end.
> **Worked mini-example — Merge Intervals.** Trigger = "merge overlapping \[start,end\]." Sort by start (the universal first move). Walk: keep `current`; if `next.start <= current.end` they overlap → `current.end = max(current.end, next.end)`; else push `current` and set `current = next`. Sort dominates → O(n log n).
**🔀 When to pick it vs alternatives.** Heap → top-k / k-th / streaming min-max / k-way merge. Full sort → when you need *everything* ordered. Intervals → sort + sweep; min-heap of ends for resource-count.
**🚧 Roadblock → fix.** `heapq` is **min-heap only** → push **negated** values for a max-heap; push `(priority, tiebreaker, item)` tuples so comparisons never blow up on un-orderable objects. Intervals: forgetting to sort first, or fumbling touching intervals → sort by start and decide `<` vs `<=` explicitly.
**🧠 SQL bridge.** Top-k heap ≈ `ORDER BY … LIMIT k` (but streaming). K-way merge ≈ merging sorted partitions. Intervals ≈ time-range reconciliation — exactly your TimeAllocations/TimePunches overlap logic.
**📚 Read/watch.** [NeetCode — Heap/Priority Queue + Intervals](https://neetcode.io/roadmap). **Tool:** `heapq`.
**🎮 Solve & narrate (the real test).**
- [ ] [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/)
- [ ] [Merge Intervals](https://leetcode.com/problems/merge-intervals/)
- [ ] [Task Scheduler](https://leetcode.com/problems/task-scheduler/) *(free; Meeting Rooms II is Premium — use this or a free Meeting-Rooms mirror)*
- [ ] Commit with "trigger → approach" notes ✅ checkpoint
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 570 — Managers with at Least 5 Direct Reports](https://leetcode.com/problems/managers-with-at-least-5-direct-reports/) — self-join + HAVING
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] each problem: trigger, pattern and complexity said before you code
- [ ] a one-line trigger → approach note committed for each ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] How do you fake a max-heap with `heapq`, and why the tuple tiebreaker?
- [ ] Universal first step on any interval problem? How do you decide overlap?
## Day 20 — Trees and graphs: BFS and DFS in one day 🎮 Level 20
> 🎯 **Cutoff target:** classify a problem as BFS vs DFS from its wording, then write either from muscle memory.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 19, yesterday: Universal first step on any interval problem? How do you decide overlap?
- [ ] Day 17, 3 days back: Why `deque` over `list` for a queue?
- [ ] Day 13, a week back: Why does jitter matter — what failure does retry-without-jitter cause?
- [ ] Day 6, 2 weeks back: "Now finance wants the region as it was at order time." Which table design answers it?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
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
**🔀 When to pick it vs alternatives.** BFS → shortest unweighted path, level-order. DFS → path existence, full exploration, topo sort, backtracking. Weighted shortest path → Dijkstra (heap). Connectivity under unions → Union-Find. DAG cycle detection → DFS colors or Kahn's topo sort.
**🚧 Roadblock → fix.** Infinite loop / re-processing → you forgot `visited`, or marked it too late (mark on enqueue/entry). Recursion depth blowup on deep input → convert DFS to an explicit stack. Picking the wrong traversal → "shortest" on unweighted = BFS, reflexively.
**🧠 SQL bridge.** DAG traversal = dbt/Airflow dependency order. Recursive CTE = DFS/BFS over a hierarchy. "Number of Islands" = connected components.
**📚 Read/watch.** [NeetCode — Trees + Graphs](https://neetcode.io/roadmap).
**🎮 Solve & narrate (the real test).**
- [ ] [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/)
- [ ] [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)
- [ ] [Number of Islands](https://leetcode.com/problems/number-of-islands/)
- [ ] Commit with "trigger → approach" notes ✅ checkpoint
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 586 — Customer Placing the Largest Number of Orders](https://leetcode.com/problems/customer-placing-the-largest-number-of-orders/) — what if two customers tie?
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] each problem: trigger, pattern and complexity said before you code
- [ ] a one-line trigger → approach note committed for each ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Which wording sends you to BFS vs DFS? Give the reflex rule for "shortest."
- [ ] Where does `visited` get marked in BFS, and what breaks if it's late?
## Day 21 — Boss: mixed timed set, patterns hidden 🎮 Boss Level
> 🎯 **Cutoff target:** with the pattern hidden, name it and its complexity within 60 seconds, then solve 2–3 mediums. Every pattern gets a green, amber or red mark.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 15: Which words in a prompt make you reach for a hashmap?
- [ ] Day 16: Which 3 trigger-phrase families split into two-pointers vs sliding-window vs fast/slow?
- [ ] Day 17: Why `deque` over `list` for a queue?
- [ ] Day 18: Write your single binary-search template + invariant from memory.
- [ ] Day 19: Universal first step on any interval problem? How do you decide overlap?
- [ ] Day 20: Which wording sends you to BFS vs DFS? Give the reflex rule for "shortest."
**📖 The concept (what & why engineers use it).** A boss day checks recognition, not recall of a single template. Pick problems you have not seen, do not look at the topic tag, and talk out loud. Interviewers grade the narration as much as the code: restate, clarify, brute force, bottleneck, optimize, trace an example.
**🎮 Build & save (the real test).**
- [ ] 2–3 **random mediums** (mixed patterns; [NeetCode 150](https://neetcode.io/practice) or [Sean Prashad's list](https://seanprashad.com/leetcode-patterns/)), ~18 minutes each. Talk aloud and name the **trigger**, the **pattern** and the **complexity** before you code.
- [ ] On at least one problem, state brute force → bottleneck → optimization out loud before writing code.
- [ ] Commit the solutions with trigger → approach notes ✅ checkpoint
**🧮 Practice reps (15 min).**
- [ ] Re-solve cold, no hints: [LC 3 — Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) and say which pattern and invariant you used.
**✅ Done when:**
- [ ] every pattern marked green, amber or red
- [ ] each red or amber pattern is in `error-log.md` with today's date ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏔️ **Week 3 complete.** Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] For all six patterns write trigger phrase → pattern → approach → complexity. Mark each green, amber or red.
- [ ] Any amber or red pattern goes into `error-log.md` with today's date; the practice slot revisits it for the next five weeks.
---
# 📅 Week 4 — Lakehouse and Spark: table formats, CDC, maintenance, the shuffle
> **Phase goal:** the data platform layer. You learn what a table format adds on top of Parquet, apply CDC with `MERGE`, keep a table healthy, then process it with PySpark and Structured Streaming. Iceberg is the worked example, with Delta mapped alongside because Databricks appears in roughly three in ten data engineering postings and interviewers switch dialects. Stack: MinIO + PySpark + Iceberg + DuckDB.
## Day 22 — Columnar files and table formats: Parquet, Iceberg, Delta 🎮 Level 22
> 🎯 **Cutoff target:** convert CSV to Parquet and read its row-group stats, then create an Iceberg table and trace metadata → manifest list → manifest → data file by hand.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 21, yesterday: Any amber or red pattern goes into `error-log.md` with today's date; the practice slot revisits it for the next five weeks.
- [ ] Day 19, 3 days back: Universal first step on any interval problem? How do you decide overlap?
- [ ] Day 15, a week back: When is a fixed array better than a dict?
- [ ] Day 8, 2 weeks back: One line each: when do you reach for TypedDict, Protocol or a plain annotation?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** **Parquet** stores data by column in row groups, with min/max statistics per column chunk, so an engine reads only the columns and row groups it needs. A **table format** (Iceberg, Delta Lake, Hudi) adds a metadata layer on top of those files so a folder of files behaves like a table: atomic commits, a schema, snapshots and hidden partitioning. Plain "files in a folder" cannot do safe concurrent writes, time travel or schema evolution.
**🔀 Alternatives & when to pick them.**
Iceberg → open, engine-agnostic, strong evolution. Delta Lake → Databricks-native. Hudi → upsert/CDC-first heritage. Plain Hive tables → legacy, avoid.

Keep a two-column map in your notes (Iceberg term ↔ Delta term). Interviewers switch dialects mid-question.
**🚧 Roadblock → fix.** The Iceberg Spark **runtime jar must match your Spark + Scala version** or you get cryptic `ClassNotFound`/catalog errors → pin the exact `iceberg-spark-runtime-<spark>_<scala>` and configure the catalog explicitly. Be deliberate about which catalog (Hadoop/REST/Glue) owns the table.
**💡 Key ideas / hints.** Row groups + column stats (min/max per chunk) enable predicate pushdown ("skip this chunk"). `pyarrow.parquet` to inspect metadata.
**📚 Read (what + how).**
- [Parquet docs](https://parquet.apache.org/docs/) (row groups, encodings) — **extract:** why column pruning and predicate pushdown make it fast.
- [Iceberg table spec](https://iceberg.apache.org/spec/) (just the metadata tree) — **extract:** metadata file → manifest list → manifest → data file.
**🎮 Build & save (the real test).**
- [ ] convert a CSV to Parquet with `pyarrow`; print the row-group count and per-column min/max; scan one column from the CSV and from the Parquet and compare wall-clock time.
- [ ] create your first Iceberg table on MinIO, write rows, then open the metadata JSON and a manifest and follow the pointers down to a data file.
- [ ] (10 min) write the same rows as a Delta table and compare `_delta_log` with the Iceberg metadata folder; add three lines to your Iceberg ↔ Delta map.
**Commit** (`day22: parquet stats + first iceberg table`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1978 — Employees Whose Manager Left the Company](https://leetcode.com/problems/employees-whose-manager-left-the-company/) — anti-join, then filter and order
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] a Parquet column-projection scan beats CSV, with the numbers recorded
- [ ] you traced metadata JSON → manifest list → manifest → data file
- [ ] the Iceberg ↔ Delta map has at least 6 rows ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Why is Parquet faster than CSV for "SELECT 2 of 50 columns WHERE x>k"? Name both mechanisms.
- [ ] When would you pick Avro over Parquet?
- [ ] Draw the Iceberg metadata tree from memory. What does a snapshot point to?
- [ ] What can Iceberg do that a Hive directory-of-files cannot?
## Day 23 — ACID, snapshots, time travel and schema evolution 🎮 Level 23
> 🎯 **Cutoff target:** make three commits, read each snapshot by id and by timestamp, roll back, then rename a column and change the partition spec while old snapshots still read correctly.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 22, yesterday: Why is Parquet faster than CSV for "SELECT 2 of 50 columns WHERE x>k"? Name both mechanisms.
- [ ] Day 20, 3 days back: Which wording sends you to BFS vs DFS? Give the reflex rule for "shortest."
- [ ] Day 16, a week back: Which 3 trigger-phrase families split into two-pointers vs sliding-window vs fast/slow?
- [ ] Day 9, 2 weeks back: Explain SRP and dependency inversion using the orchestrator (90 seconds, aloud).
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Table-format commits are atomic and create immutable **snapshots**: a reader sees one consistent version while a writer works, and you can query or roll back to any earlier state ("time travel"). You use it to recover from a bad write, reproduce a report "as of" a date, and run readers and writers together safely. **Schema and partition evolution** work through metadata, not rewrites: columns are tracked by id, so a rename is safe, and a new partition spec applies only to new writes.
**🔀 Alternatives & when to pick them.**
- **Snapshot isolation (Iceberg and Delta default)** — readers are untouched by in-flight writes; fits analytics.
- **Serializable** — stops write skew between concurrent writers; rarer in batch, and costlier.
- **Time travel vs backups** — time travel is short-term and bounded by snapshot retention; a backup is for disaster recovery.
**🚧 Roadblock → fix.** The Hive trap: assuming a rename rewrites or breaks history — in Iceberg it's metadata-only and safe *because* of field IDs. Changing a partition spec doesn't re-partition old data (only new writes) → plan a compaction/rewrite if you need old data re-laid-out.
**💡 Key ideas / hints.**
Field IDs make rename safe. Hidden partitioning means queries don't hardcode partition columns — you can evolve them.
- Time travel: `VERSION AS OF` / `TIMESTAMP AS OF` in Spark SQL; roll back with the table procedures, not by deleting files.
**📚 Read (what + how).**
- [Iceberg Spark queries](https://iceberg.apache.org/docs/latest/spark-queries/) — **extract:** time travel by snapshot id and by timestamp, and the metadata tables.
- [Iceberg evolution](https://iceberg.apache.org/docs/latest/evolution/) — **extract:** why a rename is safe (field IDs) and what a partition-spec change does not rewrite.
**🎮 Build & save (the real test).**
- [ ] make 3 commits; query snapshots 1, 2 and 3 by id and by timestamp; roll back to snapshot 1 and verify the row counts.
- [ ] rename a column, add a column, and change the partition spec; query an old snapshot to confirm it still reads; query new data under the new spec.
- [ ] write down what happens to old data files after the partition-spec change and what you would do about it.
**Commit** (`day23: snapshots, rollback, evolution`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 49 — Group Anagrams](https://leetcode.com/problems/group-anagrams/) — cold re-solve: name the key you hash on
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] snapshots read correctly by id and by timestamp; rollback verified
- [ ] a renamed column still reads in old snapshots
- [ ] you can state what a partition-spec change does and does not rewrite ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] How does Iceberg snapshot isolation relate to SNAPSHOT isolation in a relational database?
- [ ] What breaks if you expire a snapshot you still query? How do you set retention safely?
- [ ] Why can Iceberg rename a column safely when Hive can't?
- [ ] Does changing the partition spec re-partition existing data? What do you do if you need that?
## Day 24 — CDC into the lakehouse with MERGE 🎮 Level 24
> 🎯 **Cutoff target:** apply a simulated CDC batch (inserts, updates, a hard delete) with `MERGE INTO`, reconcile it against the expected table, and defend copy-on-write vs merge-on-read.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 23, yesterday: What breaks if you expire a snapshot you still query? How do you set retention safely?
- [ ] Day 21, 3 days back: Any amber or red pattern goes into `error-log.md` with today's date; the practice slot revisits it for the next five weeks.
- [ ] Day 17, a week back: Why `deque` over `list` for a queue?
- [ ] Day 10, 2 weeks back: Why does a generator keep memory flat, and what breaks if you call `list()` on it?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** `MERGE INTO` upserts change-data: match on a key, update/delete/insert accordingly — the lakehouse version of the CDC pipelines that feed most enterprise warehouses. **COW** rewrites whole files on update (fast reads, slow writes); **MOR** writes delete/update deltas merged at read time (fast writes, slower reads). This is the day that connects existing warehouse and ETL experience to the lakehouse stack — for anyone coming from a SQL or ETL background, that bridge is the single biggest interview asset.
**🔀 Alternatives & when to pick them.** COW → read-heavy, infrequent updates (BI tables). MOR → write/update-heavy, streaming CDC — at the cost of read-time merge + compaction. Choosing per-table is a senior signal.
**🚧 Roadblock → fix.** The CDC feed must **carry** the delete. If the feed collapses a hard-deleted row into nothing, `MERGE` has no way to remove it and the target keeps a ghost row. Fix: emit an op-type (I/U/D) on every change and handle `WHEN MATCHED AND op = 'D' THEN DELETE`. Second wall: merge-on-read without compaction makes reads slower every day; schedule compaction (Day 25). This is the Day 4 MERGE guard at lakehouse scale: dedup the batch, guard on the change sequence, then merge.
**💡 Key ideas / hints.** `MERGE INTO t USING changes ON t.key=changes.key WHEN MATCHED AND op='D' THEN DELETE WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT ...`. Write your copy-on-write vs merge-on-read decision rule in one sentence in `error-log.md`.
**📚 Read (what + how).** [Iceberg Spark Writes](https://iceberg.apache.org/docs/latest/spark-writes/) (MERGE INTO, COW vs MOR).
**🎮 Build & save (the real test).**
- [ ] simulate a CDC batch with op-types, including a hard delete and a duplicate key inside the batch.
- [ ] dedup the batch to the latest change per key, then apply it with `MERGE INTO`.
- [ ] reconcile the result against an expected table (the Sentinel-Lite idea, now on Iceberg); apply the same batch twice and prove nothing changes.
**Commit** (`day24: cdc merge into iceberg`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 585 — Investments in 2016](https://leetcode.com/problems/investments-in-2016/) — window COUNT as a filter
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] inserts, updates and the hard delete all land correctly
- [ ] the result reconciles against the expected table
- [ ] applying the batch twice is a no-op ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] A source row is hard-deleted. What does the CDC change feed carry for it, and how does your MERGE apply it?
- [ ] COW vs MOR — pick one for a streaming-CDC table and justify in one sentence.
## Day 25 — Table maintenance: compaction, expiry, and the Delta equivalents 🎮 Level 25
> 🎯 **Cutoff target:** create the small-files problem, run compaction, re-measure file count and scan time, then expire old snapshots.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 24, yesterday: A source row is hard-deleted. What does the CDC change feed carry for it, and how does your MERGE apply it?
- [ ] Day 22, 3 days back: Why is Parquet faster than CSV for "SELECT 2 of 50 columns WHERE x>k"? Name both mechanisms.
- [ ] Day 18, a week back: Write your single binary-search template + invariant from memory.
- [ ] Day 11, 2 weeks back: When do you use a fixture and when do you build the object inline?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Lakehouse tables need housekeeping. **Compaction** turns many small files into a few large ones, **snapshot expiration** bounds metadata and storage, and **orphan-file cleanup** removes files no snapshot references. Streaming and CDC writes create small files and endless snapshots that quietly slow reads and raise cost. Interviewers ask this as "your table got slower every week — why, and what do you schedule?"
**🔀 Alternatives & when to pick them.**
`rewrite_data_files` (compaction) → small files. `expire_snapshots` → bound metadata/storage. `rewrite_manifests` → manifest bloat. Schedule by write rate (MOR needs it more).
- **Delta equivalents** — `OPTIMIZE` ≈ compaction, `VACUUM` ≈ expire snapshots plus orphan cleanup, `ZORDER` ≈ sort-order clustering.
**🚧 Roadblock → fix.** Compaction competes with writers and is costly run naively → compact incrementally (recent partitions), schedule off-peak, tune target file size. Expiring snapshots too aggressively kills time-travel you still need → set retention from your actual RPO.
**💡 Key ideas / hints.** Decide the 3 metrics you'd alert on (file count/size, snapshot count, commit latency) — they become capstone dashboard panels.
**📚 Read (what + how).** [Iceberg Maintenance](https://iceberg.apache.org/docs/latest/maintenance/) + [Spark Procedures](https://iceberg.apache.org/docs/latest/spark-procedures/).
**🎮 Build & save (the real test).**
- [ ] generate many tiny commits; measure file count and scan time.
- [ ] run `rewrite_data_files`; re-measure both numbers.
- [ ] run `expire_snapshots`; confirm time travel stops at the retention edge.
- [ ] write the maintenance schedule you would set for a table fed by streaming writes (what runs, how often, why).
**Commit** (`day25: compaction + retention`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 347 — Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) — counter + heap or bucket sort; give both complexities
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] small-files problem created; compaction measurably improves scan
- [ ] old snapshots expired under a retention rule
- [ ] 3 alert-worthy metrics chosen ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Which 3 metrics would you alert on for a production Iceberg table, and why?
- [ ] Why do MOR tables need compaction more than COW tables?
## Day 26 — PySpark: lazy execution, the shuffle and skew 🎮 Level 26
> 🎯 **Cutoff target:** rewrite a SQL transform as a PySpark DataFrame job against Iceberg, read its physical plan, and point at the shuffle.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 25, yesterday: Why do MOR tables need compaction more than COW tables?
- [ ] Day 23, 3 days back: What breaks if you expire a snapshot you still query? How do you set retention safely?
- [ ] Day 19, a week back: Universal first step on any interval problem? How do you decide overlap?
- [ ] Day 12, 2 weeks back: What happens when you call a blocking function inside a coroutine?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Spark distributes a computation across a cluster: a DataFrame is a *logical* description, and Spark builds an optimized physical plan that runs in parallel across partitions. Transformations are **lazy** (they just build the plan); an **action** (count, write, collect) triggers execution. The expensive thing is the **shuffle** — moving data across the network to group/join by key. Engineers reach for Spark when data outgrows one machine; your SQL instincts transfer directly (it's SQL-shaped), but you now reason about *partitions and shuffles* the way you reason about indexes and scans.
**🔀 Alternatives & when to pick them.** Spark → data > one machine, or you need a cluster. DuckDB/Polars → single-node analytics, often *faster* up to ~100GB and far simpler — pick first if it fits. Pandas → small data, prototyping. SQL-in-warehouse (Snowflake/BigQuery) → when the warehouse is the compute. Senior signal: not reaching for Spark when DuckDB would do.
**🚧 Roadblock → fix.** The #1 Spark pain: **data skew** — one key has most of the rows, so one task runs forever while others finish (the straggler). You'll see it as a single slow task in the UI. Fixes the field uses: salt the hot key, broadcast the small side of a join, or `repartition` by a better key. Second gotcha: calling `.collect()` on a huge DataFrame pulls it all to the driver → OOM; aggregate first, collect small.
**💡 Key ideas / hints.**
- Narrow transforms (map/filter) = no shuffle. Wide transforms (groupBy/join/distinct) = shuffle.
- `df.explain()` shows the physical plan — look for `Exchange` (= a shuffle).
- Broadcast join (`broadcast(small_df)`) avoids shuffling the big side.
**📚 Read (what + how).**
- [Spark SQL/DataFrame Guide](https://spark.apache.org/docs/latest/sql-programming-guide.html) — **extract:** DataFrame ops, lazy vs action, `explain`.
- Skim [Spark tuning — shuffle/skew](https://spark.apache.org/docs/latest/sql-performance-tuning.html) — **extract:** AQE, broadcast, partitions.
**🎮 Build & save (the real test).**
- [ ] point PySpark at your Iceberg catalog.
- [ ] re-implement a join + group-by aggregate from `sql-lab` as a DataFrame job that reads an Iceberg table and writes a new one.
- [ ] run `.explain()` and mark the `Exchange`; then force a skewed key, find the slow task in the Spark UI, and fix it with a broadcast join or salting.
**Commit** (`day26: pyspark transform + skew fix`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 602 — Friend Requests II: Who Has the Most Friends](https://leetcode.com/problems/friend-requests-ii-who-has-the-most-friends/) — UNION ALL to make both directions one column
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the DataFrame result matches the SQL result
- [ ] you can point at the `Exchange` in the plan
- [ ] a skewed run is diagnosed and fixed ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Lazy vs action — what triggers execution, and why does laziness let Spark optimize?
- [ ] What is a shuffle, which operations cause it, and how do you spot skew?
## Day 27 — Structured Streaming into Iceberg 🎮 Level 27
> 🎯 **Cutoff target:** a streaming job consumes a feed and writes micro-batches into Iceberg with exactly-once results through checkpointing.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 26, yesterday: Lazy vs action — what triggers execution, and why does laziness let Spark optimize?
- [ ] Day 24, 3 days back: A source row is hard-deleted. What does the CDC change feed carry for it, and how does your MERGE apply it?
- [ ] Day 20, a week back: Which wording sends you to BFS vs DFS? Give the reflex rule for "shortest."
- [ ] Day 13, 2 weeks back: What is the difference between a retry and an idempotent operation, and why do you need both?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Structured Streaming treats a stream as an unbounded table processed in **micro-batches** — same DataFrame API as batch, so one mental model covers both. Engineers use it for near-real-time pipelines (CDC ingestion, metrics, alerting). The two ideas that make it *correct*: **checkpointing** (it remembers offsets so a restart resumes exactly where it left off) and **idempotent sinks** (writing the same micro-batch twice doesn't double data) → together they give exactly-once. This is your "real-time systems" goal landing on the lakehouse.
**🔀 Alternatives & when to pick them.** Spark Structured Streaming → micro-batch, unifies with your batch code, lakehouse sink. Flink → true record-at-a-time, lower latency, richer state — pick when sub-second + complex event-time logic matters. Kafka Streams → JVM apps close to Kafka. Plain batch on a schedule → when minutes-to-hours latency is fine (often it is — don't stream by default).
**🚧 Roadblock → fix.** The classic trap: **deleting or losing the checkpoint** → on restart the job reprocesses from the beginning (or skips data), breaking exactly-once. Fix: treat the checkpoint dir as sacred state, one per query, never share or hand-edit it. Second gotcha: tiny micro-batches → the small-files problem on the Iceberg side; tune trigger interval + compact (Day 25).
**💡 Key ideas / hints.**
- Output modes: append / update / complete — pick by whether aggregates change.
- `trigger(processingTime=...)` controls batch cadence; `availableNow` drains a backlog.
- Watermarks bound state for event-time aggregations (drop data later than the watermark).
**📚 Read (what + how).**
- [Structured Streaming Guide](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html) — **extract:** micro-batch model, checkpointing, output modes, watermarks.
**🎮 Build & save (the real test).**
- [ ] stream a simulated event feed (directory or socket source) → transform → write to an Iceberg table with its own checkpoint directory.
- [ ] kill the job mid-run and restart it; prove there are no duplicates and no loss.
- [ ] run `availableNow` to drain a backlog and note the small-file effect of tiny micro-batches.
**Commit** (`day27: streaming into iceberg, exactly-once`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 15 — 3Sum](https://leetcode.com/problems/3sum/) — sort, then converge two pointers; how do you skip duplicates?
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] restart after a kill produces no duplicates and no loss
- [ ] the checkpoint directory is per query and untouched by hand
- [ ] you can explain output modes and watermarks in one sentence each ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] How do checkpointing + an idempotent sink combine to give exactly-once?
- [ ] When would you reach for Flink over Spark Structured Streaming?
## Day 28 — Boss: ship the lakehouse lab and diagnose a slow job 🎮 Boss Level
> 🎯 **Cutoff target:** `iceberg-lakehouse-lab` is public with a README that tells the CDC → Iceberg story, an architecture diagram and a green smoke test; you can walk through a slow-job diagnosis aloud.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 22: Draw the Iceberg metadata tree from memory. What does a snapshot point to?
- [ ] Day 23: What breaks if you expire a snapshot you still query? How do you set retention safely?
- [ ] Day 24: A source row is hard-deleted. What does the CDC change feed carry for it, and how does your MERGE apply it?
- [ ] Day 25: Why do MOR tables need compaction more than COW tables?
- [ ] Day 26: Lazy vs action — what triggers execution, and why does laziness let Spark optimize?
- [ ] Day 27: When would you reach for Flink over Spark Structured Streaming?
**📖 The concept (what & why engineers use it).** A repo is evidence. A hiring manager spends 90 seconds on it: what problem, what picture, does it run. Today you package Week 4 so it answers those three questions, then rehearse the question that follows every Spark or lakehouse project: "a job that ran in 10 minutes now takes two hours — what do you check?"
**🎮 Build & save (the real test).**
- [ ] **README (20 min):** problem, the CDC → Iceberg story, setup steps in under 5 commands, and what each day proved.
- [ ] **Diagram (10 min):** MinIO → PySpark → Iceberg → DuckDB query, drawn and committed as an image.
- [ ] **Smoke test (15 min):** a CI job that writes, reads and time-travels on a tiny table.
- [ ] **Slow-job drill (10 min, aloud):** walk the checklist: data volume change, skew, small files, shuffle count in the plan, snapshot count, a driver collect. **Commit** (`day28: ship lakehouse lab`).
**🧮 Practice reps (15 min).**
- [ ] Closed book, 10 minutes: draw the Iceberg metadata tree and label what a commit writes, in order.
**✅ Done when:**
- [ ] the repo is public with a README, a diagram and a green CI run
- [ ] you can walk the slow-job checklist without notes
- [ ] Week 4 retro written: what worked, what dragged, one change for Week 5 ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏔️ **Week 4 complete.** Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Describe what a table format adds on top of Parquet in three sentences.
- [ ] A streaming job makes a table slow within a week. Name the cause and the two scheduled jobs that fix it.
---
# 📅 Week 5 — Transform, orchestrate, govern: dbt, quality, Airflow, cloud map
> **Phase goal:** the processing and operations layer. dbt for modeling, tests as a quality gate, Airflow for orchestration (it appears in roughly three in ten data engineer postings, so it replaces Dagster here; Dagster stays as a short comparison), governance as access control and PII handling, a map of the same pipeline onto AWS, Azure and Databricks, and a two-day take-home drill under the clock.
## Day 29 — dbt on the lakehouse: models, refs, incremental 🎮 Level 29
> 🎯 **Cutoff target:** a small dbt project builds staging → mart models on your Iceberg tables, with `ref()` wiring the DAG and an incremental model.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 28, yesterday: Describe what a table format adds on top of Parquet in three sentences.
- [ ] Day 26, 3 days back: Lazy vs action — what triggers execution, and why does laziness let Spark optimize?
- [ ] Day 22, a week back: Why is Parquet faster than CSV for "SELECT 2 of 50 columns WHERE x>k"? Name both mechanisms.
- [ ] Day 15, 2 weeks back: Why check-before-insert? What bug does insert-first cause?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** dbt lets you build transformations as **SELECT statements** (models) that it turns into tables/views, with dependencies expressed via `ref()` so dbt computes the build DAG and runs them in order. Engineers love it because it brings software practices to SQL: version control, testing, documentation, and incremental builds. It's the de-facto transformation layer (the "T" in ELT) — and it plays directly to your SQL strength while teaching the modern workflow around it.
**🔀 Alternatives & when to pick them.** dbt → SQL-centric transformations with tests + lineage (the default "T"). Hand-written Spark/SQL jobs → when logic is too imperative for SQL. SQLMesh → a newer dbt alternative with stronger incremental/virtual-environment semantics — worth name-dropping. Materialized views in the warehouse → simple cases.
**🚧 Roadblock → fix.** The incremental-model trap: a naive incremental model double-counts or misses late-arriving rows. Fix: use `is_incremental()` with a proper filter on an updated-at watermark, and choose the right `incremental_strategy` (merge vs insert-overwrite) — merge keyed on your unique id is the safe default (the same MERGE idea as Day 24). Second gotcha: full-refresh accidentally in prod → guard it.
**💡 Key ideas / hints.**
- Materializations: view (cheap, always fresh) · table (fast reads, rebuilt) · incremental (only new rows) · ephemeral (inlined CTE).
- `ref()` builds the DAG and makes lineage automatic.
- staging (clean/rename) → intermediate → marts (business-facing) is the standard layering.
- dbt snapshots implement SCD2 for you — compare with your Day 6 hand-built version.
**📚 Read (what + how).**
- [dbt — Models](https://docs.getdbt.com/docs/build/models) + [Incremental](https://docs.getdbt.com/docs/build/incremental-models) — **extract:** ref, materializations, `is_incremental()`.
**🎮 Build & save (the real test).**
- [ ] initialize a dbt project against your lakehouse (dbt-spark or dbt-duckdb).
- [ ] build `stg_*` → `mart_*` models; make the mart **incremental** with a merge strategy on your key.
- [ ] add one dbt snapshot for the customer dimension and compare it with your Day 6 SCD2 table.
- [ ] `dbt run` and `dbt docs generate`; open the lineage graph.
**Commit** (`day29: dbt models + incremental + snapshot`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 424 — Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/) — sliding window: state the invariant
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] staging → mart runs with `ref()` wiring
- [ ] the incremental model is idempotent when run twice
- [ ] the snapshot matches your hand-built SCD2 ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] When do you pick view vs table vs incremental vs ephemeral?
- [ ] How does an incremental model avoid double-counting late rows?
## Day 30 — Data quality and contracts 🎮 Level 30
> 🎯 **Cutoff target:** a quality gate fails the pipeline on a bad batch: not-null, uniqueness, accepted values, a relationship test and a freshness check, all enforced.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 29, yesterday: How does an incremental model avoid double-counting late rows?
- [ ] Day 27, 3 days back: When would you reach for Flink over Spark Structured Streaming?
- [ ] Day 23, a week back: What breaks if you expire a snapshot you still query? How do you set retention safely?
- [ ] Day 16, 2 weeks back: Which 3 trigger-phrase families split into two-pointers vs sliding-window vs fast/slow?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Data quality testing asserts properties of *data* (not code): no nulls in a key, values in an allowed set, row counts in range, freshness within SLA. **Data contracts** make these expectations explicit and enforced at boundaries so a bad upstream change *fails loud* instead of silently corrupting downstream tables. Engineers treat this as the data equivalent of unit tests + types — it's exactly your Sentinel-Lite reconciliation instinct, now declarative and in the pipeline.
**🔀 Alternatives & when to pick them.** dbt tests (generic + singular) → cheapest, lives with your models, default. Great Expectations → richer expectation suites + data docs, pick for heavier validation/profiling. Soda / Elementary → monitoring + anomaly detection over time. Pandera → DataFrame-level schema checks in Python/Spark. Pick the lightest that enforces the contract.
**🚧 Roadblock → fix.** The trap: tests that *warn* but don't *block* → bad data flows downstream anyway and everyone ignores the warnings. Fix: make critical tests `error`-severity and wire them as a **gate** (pipeline stops, batch quarantined) — your "fail the run, quarantine the batch" pattern from Sentinel-Lite. Second gotcha: over-testing every column → noise; test keys, critical invariants, and freshness, not everything.
**💡 Key ideas / hints.**
- dbt generic tests: `not_null`, `unique`, `accepted_values`, `relationships` (FK). Singular tests = a SELECT that should return zero rows.
- Freshness: assert max(updated_at) within SLA.
- A failing gate should quarantine the batch + emit a metric (ties to the Day 14 observability and the capstone dashboard).
**📚 Read (what + how).**
- [dbt — Tests](https://docs.getdbt.com/docs/build/data-tests) + [Source freshness](https://docs.getdbt.com/docs/build/sources#snapshotting-source-data-freshness) — **extract:** generic vs singular, severity, freshness.
- Skim [Great Expectations intro](https://docs.greatexpectations.io/docs/) — **extract:** expectation suites + data docs.
**🎮 Build & save (the real test).**
- [ ] add dbt tests: `not_null` and `unique` on keys, `accepted_values` on a category, a `relationships` test; add a freshness check on the source.
- [ ] feed a deliberately bad batch and prove the gate **fails** and the batch is quarantined.
- [ ] write a one-page data contract for one table: owner, schema, freshness, nullability, what a breaking change is.
**Commit** (`day30: quality gate + contract`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1045 — Customers Who Bought All Products](https://leetcode.com/problems/customers-who-bought-all-products/) — relational division: count distinct = count of all
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the bad batch fails the gate and lands in quarantine
- [ ] a good batch passes
- [ ] the contract names an owner and a definition of "breaking" ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What's the difference between a data *test* and a data *contract*, and where is each enforced?
- [ ] Why must critical checks block (not warn)? Tie it to Sentinel-Lite's quarantine.
## Day 31 — Orchestration with Airflow (Dagster as a comparison) 🎮 Level 31
> 🎯 **Cutoff target:** your ingest → transform → quality gate → publish steps run as an Airflow DAG with a schedule, retries, and a backfill that is safe to repeat.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 30, yesterday: What's the difference between a data *test* and a data *contract*, and where is each enforced?
- [ ] Day 28, 3 days back: Describe what a table format adds on top of Parquet in three sentences.
- [ ] Day 24, a week back: A source row is hard-deleted. What does the CDC change feed carry for it, and how does your MERGE apply it?
- [ ] Day 17, 2 weeks back: Why `deque` over `list` for a queue?
- [ ] Day 1, a month back: Why does `NOT IN` fail on NULLs, and what do you write instead?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** An orchestrator runs tasks in dependency order on a schedule, retries failures, and shows you what ran and what did not. **Airflow** is the common default: a DAG file declares tasks and dependencies, a scheduler creates runs per **data interval**, and workers execute them. The key habit is idempotent tasks: a task reads and writes the slice for its data interval (not "now"), so a retry or a backfill produces the same result.
**🔀 Alternatives & when to pick them.**
- **Airflow** — the default in postings and interviews; big ecosystem, schedule-centric.
- **Dagster** — asset-centric (you declare the tables, not the tasks); great lineage. Spend one hour on it for the comparison.
- **Prefect** — Python-first, lighter to start.
- **Cloud-native** — Step Functions, Azure Data Factory, Databricks Workflows: fewer servers to run, less portable.
- **Cron + a script** — fine for one job; no retries, no visibility, no backfill.
**🚧 Roadblock → fix.** Top-level code in a DAG file runs on every scheduler parse, so a database call at import time slows or breaks the whole scheduler. Keep the file light and do the work inside tasks. Second wall: using `datetime.now()` inside a task instead of the run's data interval, which makes a backfill write today's data into last month's partition. Third: passing big data through XCom — pass a path or a table name instead.
**💡 Key ideas / hints.**
- Logical date and data interval: a run for 2026-01-05 processes the 2026-01-05 slice, whenever it executes.
- `catchup`, `max_active_runs`, retries with exponential backoff, and pools for rate limits.
- Sensors wait for something (a file, a partition); prefer deferrable sensors so they do not hold a worker slot.
- A failed quality-gate task must stop the publish task: dependency, not hope.
**📚 Read (what + how).**
- [Airflow — running in Docker (docker compose)](https://airflow.apache.org/docs/apache-airflow/stable/howto/docker-compose/index.html) — **extract:** the five-command local setup.
- [Airflow documentation home](https://airflow.apache.org/docs/apache-airflow/stable/index.html) — **extract:** core concepts: DAGs, tasks, data intervals, backfill.
**🎮 Build & save (the real test).**
- [ ] bring Airflow up locally with the official docker compose file.
- [ ] write one DAG (TaskFlow API): `ingest` → `transform` (dbt or Spark) → `quality_gate` → `publish`, daily schedule, retries with backoff.
- [ ] make every task read and write by data interval; run a backfill for 3 past days twice and prove the results are identical.
- [ ] break the quality gate on purpose and show `publish` does not run.
- [ ] (10 min) skim the Dagster asset docs and write three sentences: what does asset-centric change?
**Commit** (`day31: airflow dag + backfill`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 155 — Min Stack](https://leetcode.com/problems/min-stack/) — what do you store next to each value?
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the DAG runs end to end with retries configured
- [ ] a backfill run twice gives identical output
- [ ] a failing gate blocks publish ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What is a data interval, and why must a task use it instead of the current time?
- [ ] Why is a database call at the top of a DAG file a problem?
- [ ] When would you pick Dagster, a cloud-native orchestrator, or plain cron over Airflow?
## Day 32 — Governance: access, PII, lineage and catalogs 🎮 Level 32
> 🎯 **Cutoff target:** a role-based access matrix, a masked view for PII columns, a visible lineage graph, and a catalog choice you can defend in one paragraph.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 31, yesterday: What is a data interval, and why must a task use it instead of the current time?
- [ ] Day 29, 3 days back: How does an incremental model avoid double-counting late rows?
- [ ] Day 25, a week back: Why do MOR tables need compaction more than COW tables?
- [ ] Day 18, 2 weeks back: Write your single binary-search template + invariant from memory.
- [ ] Day 2, a month back: Where do window functions sit in the logical order of a query, and what does that forbid?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Interviewers ask governance as practical questions: who can read this table, how do you hide a column, what happens if the data is deleted by mistake, and where does this number come from. The answers are **access control** (roles and least privilege), **PII handling** (tagging, masking, retention), **backup and recovery** (time travel is not a backup), **lineage** (source → model → report) and a **catalog** (where tables are registered and discovered). Tool names matter less than the reasoning.
**🔀 Alternatives & when to pick them.** Iceberg catalogs: Hadoop (file-based, simplest, local/dev) · REST (standard, production) · Glue (AWS-native) · Nessie (git-like branching for data — powerful for CI/experiments). Lineage: dbt's built-in docs DAG (free, model-level) · OpenLineage + Marquez (cross-tool, run-level) · DataHub/OpenMetadata (full catalog + governance). Pick by how many tools + how much governance you need.
**🚧 Roadblock → fix.** The trap: column-level lineage is much harder than table-level, and naive setups only get table-level → you can't answer "which downstream column depends on this one." Fix: rely on dbt + OpenLineage's column-lineage support where available, and document the gaps. Second gotcha: catalog mismatch between engines (Spark vs Trino reading the same Iceberg tables) → standardize on a REST/Glue catalog both speak.
**💡 Key ideas / hints.**
- Least privilege: grant roles, not people; read-only by default.
- Mask at the view or policy layer so raw PII never reaches analysts.
- Retention is a rule per table, written down, and enforced by a job.
- Lineage answers "what breaks if I change this column?"
**📚 Read (what + how).**
- [Iceberg Catalogs](https://iceberg.apache.org/concepts/catalog/) — **extract:** Hadoop vs REST vs Glue vs Nessie.
- [OpenLineage intro](https://openlineage.io/docs/) — **extract:** the event model + Spark/dbt integrations.
**🎮 Build & save (the real test).**
- [ ] write a role matrix (analyst, engineer, admin × raw, staging, mart) and apply it as grants where your engine supports them.
- [ ] tag two PII columns and build a masked view; prove an analyst role sees masked values.
- [ ] open the `dbt docs` lineage graph and screenshot source → staging → mart; (optional, 10 min) skim OpenLineage.
- [ ] write one paragraph comparing the Iceberg catalogs and which you would use in production, and why.
- [ ] write down your backup and restore plan for one table and its tested recovery time.
**Commit** (`day32: governance notes + masked view`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1393 — Capital Gain/Loss](https://leetcode.com/problems/capital-gainloss/) — signed sum with CASE
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the role matrix and masked view exist and are tested
- [ ] lineage is visible end to end
- [ ] the catalog paragraph and the restore plan are written ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] An analyst needs revenue by region but must not see emails. What do you build?
- [ ] Why is time travel not a backup strategy?
- [ ] What question does lineage answer in an incident?
## Day 33 — The cloud service map: AWS, Azure and Databricks 🎮 Level 33
> 🎯 **Cutoff target:** the same pipeline drawn three times, each box labelled with its capability first and the AWS, Azure and Databricks service second.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 32, yesterday: Why is time travel not a backup strategy?
- [ ] Day 30, 3 days back: What's the difference between a data *test* and a data *contract*, and where is each enforced?
- [ ] Day 26, a week back: Lazy vs action — what triggers execution, and why does laziness let Spark optimize?
- [ ] Day 19, 2 weeks back: Universal first step on any interval problem? How do you decide overlap?
- [ ] Day 3, a month back: Write the sessionization query shape from memory: flag, running sum, group.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Interviewers say "how would you build this on AWS?" and expect you to translate, not recite service names. Think **capability first** (object storage, stream ingestion, batch compute, warehouse, orchestration, catalog and governance), then name the service the company uses. AWS appears in roughly 45% and Azure in 38% of data engineer postings, Databricks in about 30%, so the three maps below cover most loops.
**🔀 Alternatives & when to pick them.**
- **Object storage** — S3 / ADLS Gen2 / cloud storage under Unity Catalog volumes.
- **Stream ingestion** — Kinesis or MSK / Event Hubs / Kafka with Structured Streaming.
- **Batch and ETL compute** — EMR or Glue / Synapse, Fabric or Data Factory data flows / Databricks jobs.
- **Warehouse** — Redshift / Synapse or Fabric warehouse / Databricks SQL (Snowflake and BigQuery sit across all three).
- **Orchestration** — MWAA or Step Functions / Data Factory / Databricks Workflows.
- **Catalog and governance** — Glue Data Catalog + Lake Formation / Purview / Unity Catalog.
**🚧 Roadblock → fix.** The trap is memorizing service names without the capability behind them, then freezing when the company uses a different cloud. Fix: always answer in two beats — "I need X capability; on your stack that is Y" — and keep one comparison sentence ready for managed vs self-run (cost, operations, lock-in).
**💡 Key ideas / hints.**
- Name the data path first: source → ingest → store → transform → serve → monitor.
- Separate storage from compute; say why (scale and cost independently).
- Mention identity and network early (roles, private endpoints); it signals production thinking.
**📚 Read (what + how).**
- [Microsoft Learn — Azure data architecture guide](https://learn.microsoft.com/en-us/azure/architecture/data-guide/) — **extract:** the capability categories and example services.
- [Databricks — lakehouse architecture](https://docs.databricks.com/en/lakehouse-architecture/index.html) — **extract:** the layers and where governance sits.
**🎮 Build & save (the real test).**
- [ ] redraw your lakehouse pipeline three times (AWS, Azure, Databricks); label each box with capability first, service second.
- [ ] for each version write two sentences: what is managed for you, and what you would still operate yourself.
- [ ] make 12 flashcards (capability → three services) in Anki or on paper; they enter your review loop.
- [ ] pick the cloud your target companies use most and write the 90-second spoken version of the whole pipeline on it.
**Commit** (`day33: cloud maps + flashcards`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 739 — Daily Temperatures](https://leetcode.com/problems/daily-temperatures/) — monotonic stack
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] three diagrams, capability-first labels
- [ ] 12 flashcards made
- [ ] the 90-second spoken version is written and timed ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] "How would you build this on AWS?" Answer aloud in two minutes without service-name lists.
- [ ] Give the capability and the three service names for orchestration and for governance.
- [ ] Managed vs self-run: three tradeoffs.
## Day 34 — Take-home drill, part 1: build under the clock 🎮 Level 34
> 🎯 **Cutoff target:** a messy order export loaded into a clean star schema by an idempotent pipeline, within 2 hours including today's other steps.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 33, yesterday: Managed vs self-run: three tradeoffs.
- [ ] Day 31, 3 days back: Why is a database call at the top of a DAG file a problem?
- [ ] Day 27, a week back: When would you reach for Flink over Spark Structured Streaming?
- [ ] Day 20, 2 weeks back: Which wording sends you to BFS vs DFS? Give the reflex rule for "shortest."
- [ ] Day 4, a month back: Why dedup the batch before MERGE?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Take-home projects run at roughly a quarter of companies (a vendor estimate). Reviewers read the README first, run your code second, and judge **correctness, idempotency, tests, clear assumptions and restraint**: a small thing that works beats a framework that does not. You will do a four-hour take-home across two days. Today is part 1: set up and build the pipeline. Tomorrow is part 2: tests, README and a self-review.
**🔀 Alternatives & when to pick them.**
- **Scope** — build the smallest pipeline that answers the questions; list extras under "next steps".
- **Tools** — DuckDB or Postgres plus plain Python is enough; do not bring Spark to a 50 MB file.
- **Assumptions** — when the brief is vague, choose, write the choice down, and move on.
**🚧 Roadblock → fix.** Running out of time on polish while the core is incomplete. Fix: a vertical slice first (load → clean → one query) in the first hour, then widen. Second wall: silent assumptions. Reviewers forgive a wrong assumption that is written down and cannot forgive one that is hidden.
**💡 Key ideas / hints.**
- The brief: a messy CSV/JSON export of orders (duplicates, late updates, bad dates, mixed currencies, orphan customer ids) plus a customers file. Load it into a star schema and answer three business questions.
- Generate the messy input from your `sql-lab` seed if you have no source; plant at least six kinds of dirt.
- Time box: setup 15 min, vertical slice 45 min, widen 45 min.
**📚 Read (what + how).**
- [dbt — best practices for project structure](https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview) — **extract:** staging → intermediate → marts as a layout you can copy.
- Your own Day 5 and Day 6 notes — **extract:** the grain checklist and the SCD2 pattern; reuse them today.
**🎮 Build & save (the real test).**
Start the clock. Work in a new repo `takehome-orders`:
- [ ] write the messy input (or take a public dataset) and a one-paragraph brief with three business questions
- [ ] load → clean (dedup, parse dates, normalize currency, quarantine orphans) → star schema, idempotent on re-run
- [ ] one query per business question, in `queries/`
- [ ] stop at the end of today's build slot, whatever is unfinished, and list what is left
**Commit** (`day34: takehome part 1`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1633 — Percentage of Users Attended a Contest](https://leetcode.com/problems/percentage-of-users-attended-a-contest/) — denominator comes from a different table
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the pipeline runs end to end on the dirty input
- [ ] a second run changes nothing
- [ ] the unfinished list is written ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What do reviewers read first, and what does it need to say?
- [ ] Which three assumptions did you make today, and where did you write them?
- [ ] What would you have cut if you had half the time?
## Day 35 — Boss: take-home drill, part 2, and a self-review 🎮 Boss Level
> 🎯 **Cutoff target:** tests, a README that states assumptions and next steps, and a self-review against a rubric, finished inside today's slot.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 29: How does an incremental model avoid double-counting late rows?
- [ ] Day 30: What's the difference between a data *test* and a data *contract*, and where is each enforced?
- [ ] Day 31: What is a data interval, and why must a task use it instead of the current time?
- [ ] Day 32: What question does lineage answer in an incident?
- [ ] Day 33: Give the capability and the three service names for orchestration and for governance.
- [ ] Day 34: What do reviewers read first, and what does it need to say?
**📖 The concept (what & why engineers use it).** Part 2 is where take-homes are won. A short test suite, a README that a stranger can run in five minutes, and an honest "what I would do next" section separate a hire from a maybe. Today you finish and then grade your own work like a reviewer, without mercy.
**🎮 Build & save (the real test).**
- [ ] **Tests (20 min):** pytest for the dedup rule, the idempotency guarantee (run twice, same result) and one reconciliation (fact total equals clean input total).
- [ ] **README (20 min):** problem, how to run (≤5 commands), data model with the grain, assumptions, results of the three queries, next steps.
- [ ] **Self-review (15 min):** score each 0–2: correctness, idempotency, tests, assumptions written, restraint (nothing extra), readability. Fix the worst one. **Commit** (`day35: takehome complete`).
**🧮 Practice reps (15 min).**
- [ ] Closed book, 10 minutes: write the five-minute spoken walkthrough of your take-home (problem, grain, idempotency, one trade-off, next step).
**✅ Done when:**
- [ ] tests pass, including the run-twice test
- [ ] README runs from a clean checkout
- [ ] rubric score written, worst item fixed
- [ ] Week 5 retro written ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏔️ **Week 5 complete.** Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Describe the data model and the grain in two sentences.
- [ ] How do you prove idempotency, and what does the test look like?
- [ ] What would you put under "next steps" and why those items?
---
# 📅 Week 6 — Data System Design: reason from constraints and failure modes
> **Phase goal:** system design is asked in roughly two thirds of data engineer loops, and it is judged on reasoning from constraints and failure modes, not on tool names. You study the five ideas that carry most designs (consistency and replication, partitioning, delivery semantics, backpressure, fault tolerance), then do two timed design mocks. Each day produces a short written design note in `designs/`. Theory is kept at explain-it-in-two-minutes level; framework internals such as Kafka rebalancing are not needed.
## Day 36 — Consistency, isolation, replication and consensus 🎮 Level 36
> 🎯 **Cutoff target:** explain CAP and PACELC correctly (the common version is wrong), place snapshot vs serializable isolation on the spectrum, and say in two sentences why consensus exists.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 35, yesterday: How do you prove idempotency, and what does the test look like?
- [ ] Day 33, 3 days back: "How would you build this on AWS?" Answer aloud in two minutes without service-name lists.
- [ ] Day 29, a week back: How does an incremental model avoid double-counting late rows?
- [ ] Day 22, 2 weeks back: Draw the Iceberg metadata tree from memory. What does a snapshot point to?
- [ ] Day 6, a month back: Type 1, 2, 3: what does each keep, and when do you pick each?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** A distributed system cannot treat the network as reliable, so you choose what to give up when links fail. **CAP** says that during a network **partition** a system must pick consistency or availability; it says nothing about normal operation. **PACELC** adds the part interviewers care about: *else* (no partition), you still trade **latency** against consistency. Replication copies data to survive failures: leader-follower, multi-leader or leaderless quorums. When copies disagree about who the leader is (split brain), a **consensus** protocol such as Raft gets a majority to agree. Explain level is enough; you do not need to implement Raft.
**🔀 Alternatives & when to pick them.** Sync replication → no data loss on failover, but higher write latency + lower availability (a slow follower blocks). Async → fast writes, but a failover can lose the last un-replicated writes (RPO > 0). Leaderless quorum → high availability + tunable, but you handle conflicts (LWW/CRDT). Multi-leader → multi-region writes, at the cost of conflict resolution.
**🚧 Roadblock → fix.** The interview trap: reciting "CAP = pick 2 of 3." Fix: say "partitions are a given, so it's C-vs-A *under* partition; PACELC adds the latency-vs-consistency tradeoff in the normal case" — that one sentence signals you actually understand it. Second trap: conflating consistency (CAP) with isolation (ACID) — they're different axes; say so.
**💡 Key ideas / hints.** Linearizable > sequential > causal > eventual. SNAPSHOT isolation allows write-skew; SERIALIZABLE doesn't. Read-your-writes, monotonic-reads are the "session guarantees" worth naming.
**📚 Read (what + how).**
- [Designing Data-Intensive Applications](https://dataintensive.net/), Ch 5 (Replication) and the linearizability section of Ch 9 — **extract:** sync vs async replication, quorum, linearizable vs eventual.
- [Jepsen — consistency models](https://jepsen.io/consistency) — **extract:** the hierarchy picture and where each guarantee sits.
- *(optional)* [The Secret Lives of Data — Raft](https://thesecretlivesofdata.com/raft/) — **extract:** the leader-election idea in one animation.
**🎮 Build & save (the real test).**
Write `designs/consistency-replication.md`:
- [ ] CAP stated correctly, PACELC in one line, and the isolation spectrum (read committed → snapshot → serializable) with the anomaly each one still allows
- [ ] replication models (leader-follower sync vs async, multi-leader, leaderless quorum with R + W > N), one when-to-use line each
- [ ] split brain and how consensus fixes it, in two sentences
- [ ] a 3-row table: system → consistency model → why (for example your Iceberg table, a payments ledger, a news feed)
**Commit** (`day36: consistency and replication`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1661 — Average Time of Process per Machine](https://leetcode.com/problems/average-time-of-process-per-machine/) — pivot start/end rows into one row
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] CAP and PACELC are stated correctly
- [ ] the three replication models each have a when-to-use line
- [ ] the 3-row table is filled and defended ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] State CAP correctly (not "2 of 3") and what PACELC adds.
- [ ] SNAPSHOT vs SERIALIZABLE — what does SNAPSHOT allow that SERIALIZABLE forbids?
- [ ] Sync vs async replication — what exactly do you lose with async on failover?
- [ ] Why does R+W>N matter, and what problem does consensus solve that quorum alone doesn't?
## Day 37 — Partitioning, sharding and skew 🎮 Level 37
> 🎯 **Cutoff target:** choose a partition key for a given workload, and explain how you detect and fix a hot partition.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 36, yesterday: Sync vs async replication — what exactly do you lose with async on failover?
- [ ] Day 34, 3 days back: Which three assumptions did you make today, and where did you write them?
- [ ] Day 30, a week back: What's the difference between a data *test* and a data *contract*, and where is each enforced?
- [ ] Day 23, 2 weeks back: Does changing the partition spec re-partition existing data? What do you do if you need that?
- [ ] Day 7, a month back: Which two problems cost you the most time today, and what pattern did you miss?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Partitioning (sharding) splits data across nodes so the system scales horizontally. The whole game is the **partition key**: a good one spreads load evenly *and* keeps related data together for efficient queries. Engineers obsess over this because the #1 scaling failure is a **hot partition** — one key (or range) gets most of the traffic and one node melts while others idle. You met the idea in table partitioning on Days 22–23; this is the distributed version.
**🔀 Alternatives & when to pick them.** Hash partitioning → even spread, but kills range scans (adjacent keys scatter). Range partitioning → great range scans, but risks hot ranges (e.g. everything "today"). Composite (hash of a prefix + range) → balance. Consistent hashing → minimizes data movement when you add/remove nodes (vs naive `hash % N` which reshuffles everything).
**🚧 Roadblock → fix.** The classic failure: a hot key (a celebrity user, a "today" timestamp, a NULL bucket). Detect it via per-partition metrics (one partition's QPS/latency dwarfs the rest; the metrics habit from Day 14). Fix: **salt** the hot key (append a random suffix to spread it, fan-in on read), or pick a higher-cardinality key. Second gotcha: choosing a key that forces cross-partition joins/transactions on the hot path → co-locate related data under the same key.
**💡 Key ideas / hints.** `hash % N` reshuffles on resize → use consistent hashing/virtual nodes. Skew shows up as a single straggler task (the same thing you saw in Spark on Day 26). Rebalancing should move minimal data.
**📚 Read (what + how).** [DDIA Ch 6 (Partitioning)](https://dataintensive.net/) — **extract:** key-range vs hash, rebalancing, request routing, hot spots.
**🎮 Build & save (the real test).**
Write `designs/partitioning.md`:
- [ ] for a "real-time events" workload, pick a partition key, justify it, and name the query it makes slow
- [ ] how you detect a hot partition (which metric, which threshold) and the fix (salting, a better key, splitting the key)
- [ ] connect it to the Spark skew fix from Day 26 and the Iceberg partition spec from Day 23
**Commit** (`day37: partitioning + skew`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 33 — Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) — which half is sorted?
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] partition-key choice justified for a given workload
- [ ] hot-partition detection (which metric) + fix (salting/rekey) written
- [ ] consistent-hashing-vs-`hash % N` explained ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Hash vs range partitioning — the tradeoff in one sentence each.
- [ ] How do you detect a hot partition, and what are two fixes?
## Day 38 — Delivery semantics, idempotency and the outbox 🎮 Level 38
> 🎯 **Cutoff target:** explain why "exactly-once delivery" is a myth and how exactly-once *processing* is achieved.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 37, yesterday: How do you detect a hot partition, and what are two fixes?
- [ ] Day 35, 3 days back: What would you put under "next steps" and why those items?
- [ ] Day 31, a week back: What is a data interval, and why must a task use it instead of the current time?
- [ ] Day 24, 2 weeks back: A source row is hard-deleted. What does the CDC change feed carry for it, and how does your MERGE apply it?
- [ ] Day 8, a month back: Why validate config at startup instead of at first use? Name the failure it prevents.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** In a distributed system you get **at-most-once** (may lose messages) or **at-least-once** (may duplicate); true exactly-once *delivery* is impossible (the two-generals problem). What engineers actually build is **exactly-once \*processing*** = at-least-once delivery + idempotent consumers (or dedup by an idempotency key) so duplicates have no effect. The transactional outbox*\* pattern solves the "update DB and publish event atomically" problem (write the event to an outbox table in the same transaction, relay it separately). This is the rigorous version of the resilience from Day 13 and the streaming exactly-once from Day 27, and the CDC hard-delete lesson from Day 24 generalized.
**🔀 Alternatives & when to pick them.** At-most-once → telemetry where loss is fine and speed matters. At-least-once + idempotency → the default for anything that mutates state (almost everything). Outbox → when you must atomically change state *and* emit an event without a distributed transaction. Dual-write (update DB then publish) → tempting but **broken** (one can succeed while the other fails) — name why you avoid it.
**🚧 Roadblock → fix.** The dual-write trap: "I'll update the DB, then publish to Kafka" → a crash between the two leaves them inconsistent. Fix: transactional outbox (or CDC from the database, the simplest fix when the source is a database (Debezium reads the log)). Second gotcha: idempotency keys that aren't actually unique per logical operation → use a natural business key + operation id; persist processed-ids to dedup.
**💡 Key ideas / hints.** Idempotency = "apply once" even under retries/redelivery (upsert/MERGE on a natural key, as on Day 4). Outbox + a relay (or CDC) = atomic state-change + event. Kafka "exactly-once" = idempotent producer + transactions + a dedup'd consumer.
**📚 Read (what + how).** [DDIA Ch 11 (Stream Processing)](https://dataintensive.net/) — **extract:** fault tolerance, exactly-once, idempotence. [microservices.io](http://microservices.io)[ — Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html) — **extract:** the pattern + why dual-write fails.
**🎮 Build & save (the real test).**
Write `designs/delivery-semantics.md`:
- [ ] the three semantics (at-most-once, at-least-once, exactly-once) and a failure story for each
- [ ] why exactly-once *delivery* cannot exist, and how exactly-once *processing* is built from at-least-once delivery + idempotent writes or transactions
- [ ] the transactional outbox pattern as a diagram
- [ ] where each idea lives in your own work: the streaming sink (Day 27), the MERGE guard (Day 4), remediation (Day 13)
**Commit** (`day38: delivery semantics + outbox`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1934 — Confirmation Rate](https://leetcode.com/problems/confirmation-rate/) — LEFT JOIN keeps users with no confirmations
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] three semantics + the impossibility-of-exactly-once-delivery argument written
- [ ] outbox pattern explained + why dual-write is broken
- [ ] mapped onto your streaming + reconciliation code ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Why is exactly-once *delivery* impossible, and how do you get exactly-once *processing*?
- [ ] What breaks with dual-write, and how does the outbox fix it?
## Day 39 — Backpressure, queues and flow control 🎮 Level 39
> 🎯 **Cutoff target:** explain backpressure, when to buffer, drop or block, and how a dead-letter queue plus replay fits a pipeline that fixes itself.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 38, yesterday: Why is exactly-once *delivery* impossible, and how do you get exactly-once *processing*?
- [ ] Day 36, 3 days back: Sync vs async replication — what exactly do you lose with async on failover?
- [ ] Day 32, a week back: Why is time travel not a backup strategy?
- [ ] Day 25, 2 weeks back: Why do MOR tables need compaction more than COW tables?
- [ ] Day 9, a month back: TypedDict vs dataclass vs Pydantic vs NamedTuple vs Protocol: which validate at runtime, which are mutable?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Backpressure is how a system protects itself when input arrives faster than it can process: it signals upstream to slow down (pull-based), or buffers/drops/blocks (push-based). Without it, queues grow unbounded → OOM/latency collapse → cascading failure. Engineers design flow control because every real pipeline eventually faces a burst. A **dead-letter queue (DLQ)** parks un-processable messages so one bad record doesn't block the stream, with **replay** to recover later — a building block of self-healing systems.
**🔀 Alternatives & when to pick them.** Block (pull-based, bounded buffer) → when you can't lose data and upstream can slow (the generators from Day 10: pull = natural backpressure). Drop/sample → when fresh data matters more than completeness (metrics, telemetry). Buffer → smooths short bursts, but bounded or it's just deferred OOM. DLQ + replay → poison messages: isolate, alert, fix, replay.
**🚧 Roadblock → fix.** The trap: an unbounded queue/buffer "to be safe" → it hides the problem until memory runs out under load (deferred catastrophe). Fix: bounded queues + an explicit policy (block/drop/DLQ) + a depth metric + alert. Second gotcha: a single poison message infinitely retried, blocking the whole partition → cap retries, route to DLQ, continue.
**💡 Key ideas / hints.** Pull-based (consumer asks for more) gives backpressure for free; push-based needs explicit flow control. Little's Law (L = λW) sizes queues/concurrency. Queue depth + consumer lag are the metrics to alert on (Kafka consumer lag = your canary).
**📚 Read (what + how).** [DDIA Ch 11 (messaging/streams + backpressure)](https://dataintensive.net/) — **extract:** message brokers, consumer lag, dropping vs buffering. Skim [Reactive Streams backpressure](https://www.reactive-streams.org/) — **extract:** the pull-based idea.
**🎮 Build & save (the real test).**
Write `designs/backpressure.md`:
- [ ] define backpressure and give the buffer / drop / block decision table with one example each
- [ ] DLQ + replay design: what goes in, how it is replayed, how you stop a poison message from looping
- [ ] the three metrics you would alert on (queue depth, consumer lag, DLQ rate)
- [ ] (optional, 20 min) a bounded-queue demo in Python where the producer slows when the queue is full
**Commit** (`day39: backpressure + DLQ`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 215 — Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) — heap of size k, or quickselect
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] backpressure + block/drop/buffer decision table written
- [ ] DLQ + replay + queue-depth alerting designed ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Why does an unbounded buffer make things worse, not safer?
- [ ] How does pull-based consumption give backpressure "for free"? (tie to the generators from Day 10)
## Day 40 — Fault tolerance and self-healing pipelines 🎮 Level 40
> 🎯 **Cutoff target:** design a pipeline that detects its own failures and recovers without a human, naming every pattern that does the work.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 39, yesterday: How does pull-based consumption give backpressure "for free"? (tie to the generators from Day 10)
- [ ] Day 37, 3 days back: How do you detect a hot partition, and what are two fixes?
- [ ] Day 33, a week back: Managed vs self-run: three tradeoffs.
- [ ] Day 26, 2 weeks back: Lazy vs action — what triggers execution, and why does laziness let Spark optimize?
- [ ] Day 10, a month back: What does `yield` inside a `@contextmanager` function mark?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Fault tolerance = the system keeps working (possibly degraded) despite component failures; **self-healing** = it detects and recovers automatically. This pulls the last few days together: systems that recover without a human in the loop. The toolkit, now assembled: health checks + restarts, retries + backoff + jitter and circuit breakers (Day 13), idempotency + outbox (Day 38), DLQ + replay (Day 39), bulkheads (isolate failures), graceful degradation, and the reconciliation loop (Sentinel-Lite itself — detect drift from source-of-truth, auto-remediate).
**🔀 Alternatives & when to pick them.** Retry → transient faults. Circuit breaker → a dependency that can stay down (stop the bleeding). Bulkhead → isolate so one failure doesn't sink everything (separate pools/queues). Graceful degradation → serve stale/partial rather than nothing. Reconciliation/control loop → the strongest form: continuously detect divergence and self-correct (a drift-triggered retrain, a data reconciliation job). Self-healing isn't free — it adds complexity; name when a human-in-the-loop alert is the right call instead.
**🚧 Roadblock → fix.** The trap: "self-healing" that masks real problems — auto-retry hides a systemic bug, auto-remediation silently corrupts data. Fix: every automated recovery **emits a metric + leaves an audit trail** (you can't heal what you can't see; see the observability work on Day 14), and dangerous remediations quarantine + alert rather than guess. Second gotcha: no idempotency → self-healing retries double-apply (the failure mode behind the CDC MERGE on Day 24).
**💡 Key ideas / hints.** The control-loop pattern (observe → diff vs desired → act) is what Kubernetes and your reconciliation service share — *that's* the senior framing of "self-healing." Bulkhead = the Titanic's compartments. Degradation > outage.
**📚 Read (what + how).** [DDIA Ch 8 (The Trouble with Distributed Systems)](https://dataintensive.net/) — **extract:** partial failure, unreliable clocks/networks, why detection is hard. Skim a [Kubernetes controller/reconcile-loop overview](https://kubernetes.io/docs/concepts/architecture/controller/) — **extract:** the observe-diff-act loop.
**🎮 Build & save (the real test).**
Write `designs/self-healing.md`:
- [ ] a failure-class table: transient error, bad batch, duplicate delivery, schema change, dependency down, silent data drift
- [ ] for each: the detection signal, the automatic recovery, the pattern name (retry, quarantine, idempotent re-run, breaker, DLQ + replay, reconciliation), and the metric or audit record it emits
- [ ] frame Sentinel-Lite as a reconciliation control loop: observe → compare → decide → act → verify
**Commit** (`day40: self-healing design`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1789 — Primary Department for Each Employee](https://leetcode.com/problems/primary-department-for-each-employee/) — a rule with an exception
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] every failure class mapped to a recovery pattern
- [ ] each automated recovery emits a metric + audit trail
- [ ] Sentinel-Lite framed as an observe-diff-act control loop ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Name 6 fault-tolerance patterns and the failure each addresses.
- [ ] What's the risk of self-healing that hides problems, and how do you prevent it?
## Day 41 — Design mock A: a batch analytics warehouse 🎮 Level 41
> 🎯 **Cutoff target:** one 45-minute written design for a daily batch warehouse, scored against a rubric, with at least three deep dives.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 40, yesterday: Name 6 fault-tolerance patterns and the failure each addresses.
- [ ] Day 38, 3 days back: Why is exactly-once *delivery* impossible, and how do you get exactly-once *processing*?
- [ ] Day 34, a week back: What do reviewers read first, and what does it need to say?
- [ ] Day 27, 2 weeks back: When would you reach for Flink over Spark Structured Streaming?
- [ ] Day 11, a month back: Where do you patch: where a name is defined, or where it is used? Why?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Use a fixed frame so you never stall: **requirements** (functional, then non-functional: scale, freshness, cost) → **core entities** → **interfaces** (inputs, outputs, SLAs) → **high-level design** → **deep dives** (where you earn the offer) → **tradeoffs and failure modes**. Spend about 7 minutes per phase. Say your assumptions out loud, ask two or three clarifying questions, and name the failure mode of each component.
**🔀 Alternatives & when to pick them.**
- **ELT into a warehouse vs lakehouse tables vs both** — pick on query pattern, cost and who consumes the data.
- **Full reload vs incremental vs CDC** — by volume and by whether deletes matter.
- **Star schema in the warehouse vs wide tables for BI** — star for consistency, wide for speed.
**🚧 Roadblock → fix.** Starting with tools ("I would use Spark and Kafka") before the constraints are clear. Fix: write the numbers first (rows per day, freshness, number of consumers, restatement frequency) and let them choose the design. Second wall: no failure story. For each box say what happens when it is slow, down or wrong.
**💡 Key ideas / hints.**
- Deep-dive menu for batch: late and restated data, idempotent backfills, SCD choices, partitioning and file sizes, quality gates and quarantine, SLAs and alerting, cost control.
- Always include how you would know the numbers are right (reconciliation to the source).
**📚 Read (what + how).**
- [Hello Interview — system design delivery framework](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery) — **extract:** the phase order and time split.
- Your Day 5, 6, 24, 31 and 32 notes — **extract:** the pieces you will reuse as deep dives.
**🎮 Build & save (the real test).**
**Prompt:** "Design a daily analytics warehouse for an e-commerce company: orders, customers and a product catalog, about 200 million order lines per year, analysts need yesterday's numbers by 8:00, finance occasionally restates past months."
- [ ] 45 minutes, timer on, written in `designs/mock-batch-warehouse.md` using the frame
- [ ] include at least three deep dives and one failure story per component
- [ ] 10 minutes: score yourself 0–2 on requirements, data model (grain), idempotency and backfill, quality and reconciliation, failure handling, cost. Circle the weakest and fix that section.
**Commit** (`day41: design mock A`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 56 — Merge Intervals](https://leetcode.com/problems/merge-intervals/) — sort by start, then sweep
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] requirements and numbers come before any tool name
- [ ] three deep dives and failure stories are written
- [ ] the self-score and one fix are recorded ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Recite the six phases of the design frame in order.
- [ ] What do you do in the first two minutes of any design prompt?
- [ ] Name three deep dives for a batch warehouse and one failure mode each.
## Day 42 — Boss: design mock B, streaming and CDC, plus the cheat sheet 🎮 Boss Level
> 🎯 **Cutoff target:** one 40-minute design for a CDC-to-lakehouse streaming pipeline that uses this week's concepts, then a one-page distributed-systems cheat sheet written from memory.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 36: State CAP correctly (not "2 of 3") and what PACELC adds.
- [ ] Day 37: How do you detect a hot partition, and what are two fixes?
- [ ] Day 38: Why is exactly-once *delivery* impossible, and how do you get exactly-once *processing*?
- [ ] Day 39: How does pull-based consumption give backpressure "for free"? (tie to the generators from Day 10)
- [ ] Day 40: Name 6 fault-tolerance patterns and the failure each addresses.
- [ ] Day 41: What do you do in the first two minutes of any design prompt?
**📖 The concept (what & why engineers use it).** Today you run the same frame on a streaming problem, and you must invoke the week's ideas by name where they apply: partitioning, delivery semantics, backpressure, replay, fault tolerance. Then you write the cheat sheet without looking. What you cannot write is what to review next.
**🎮 Build & save (the real test).**
**Prompt:** "Replicate an operational database into a lakehouse with under 5 minutes of freshness. Handle deletes, schema changes and replays, and give analysts a table they can trust."
- [ ] **Design (40 min):** frame, numbers first, written in `designs/mock-streaming-cdc.md`; force yourself to cover partition key, delivery semantics, backpressure, DLQ + replay, schema change handling, and how you reconcile to the source
- [ ] **Cheat sheet (15 min, closed book):** `designs/dist-sys-cheatsheet.md`, one page, then compare with your Day 36–40 notes and mark the gaps. **Commit** (`day42: mock B + cheat sheet`).
**🧮 Practice reps (15 min).**
- [ ] Closed book, 10 minutes: draw the CDC pipeline from Day 24 and Day 27 from memory and label where each of the five concepts applies.
**✅ Done when:**
- [ ] the design uses at least four of this week's concepts by name
- [ ] the cheat sheet was written before checking notes
- [ ] gaps are marked and logged in `error-log.md`
- [ ] Week 6 retro written ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏔️ **Week 6 complete.** Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Explain exactly-once processing to an interviewer in 60 seconds.
- [ ] What goes in a DLQ, and how do you stop a poison message looping?
- [ ] Which phase of the design frame did you rush today?
---
# 📅 Week 7 — LLM Fundamentals and LLM App Basics: the missing layer
> **Phase goal:** AI-engineer loops open with questions about how LLMs work and how you wrap them in code: tokens and context windows, sampling, attention, encoder vs decoder, prompting vs RAG vs fine-tuning, LoRA, quantization, RLHF, plus honest metrics and a reliable API contract. This block is new to the program. Whiteboard gradient descent and training from scratch have faded from these interviews, so they are left out. All code lives in a new repo, `llm-lab`. Any provider with an API key works; with no key, run a small open model locally with Ollama.
## Day 43 — Tokens, context windows and sampling 🎮 Level 43
> 🎯 **Cutoff target:** count tokens for different kinds of text, explain why cost and context limits are token limits, and show how temperature changes real output.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 42, yesterday: Which phase of the design frame did you rush today?
- [ ] Day 40, 3 days back: Name 6 fault-tolerance patterns and the failure each addresses.
- [ ] Day 36, a week back: Sync vs async replication — what exactly do you lose with async on failover?
- [ ] Day 29, 2 weeks back: How does an incremental model avoid double-counting late rows?
- [ ] Day 13, a month back: Walk the circuit-breaker state machine and what each transition protects.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** An LLM reads and writes **tokens** (word pieces), not words. Prices, speed and limits are all counted in tokens: input, output, and the **context window**, the most tokens the model can see at once (prompt plus answer). At each step the model produces a probability distribution over the next token and **sampling** picks from it. **Temperature** reshapes the distribution (low is predictable, high is varied), **top-p** keeps the smallest set of tokens whose probabilities add up to p, and **top-k** keeps the k most likely. Temperature 0 is close to deterministic, not guaranteed identical.
**🔀 Alternatives & when to pick them.**
- **Low temperature vs higher** — extraction, classification and SQL generation want low; brainstorming wants higher.
- **Top-p vs top-k** — both trim the unlikely tail; change one at a time.
- **Long context vs retrieval** — stuffing everything into the window costs more, slows responses and is less reliable in the middle; retrieval sends only what matters (Day 50).
- **Tokenizers differ by model family** — counts from one do not match another.
**🚧 Roadblock → fix.** Surprise cost and latency: a long system prompt plus chat history is re-sent on every call, so tokens balloon. Fix: log tokens in and out on every call, trim history, and cache stable prefixes. Second wall: "the model forgot." The early text fell out of the context window. The fix is summarizing or retrieving, not a bigger prompt.
**💡 Key ideas / hints.**
- Rough rule: 1 token ≈ ¾ of an English word. Code, numbers and non-English text use more.
- Cost = input tokens × input price + output tokens × output price; output usually costs more per token.
- "Lost in the middle": details in the middle of a long prompt are recalled less reliably than the start or end.
**📚 Read (what + how).**
- [OpenAI tokenizer tool](https://platform.openai.com/tokenizer) — **extract:** paste English, code, JSON and another language; compare counts.
- [Karpathy — Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g) (first 25 min) — **extract:** next-token prediction and what training produces.
**🎮 Build & save (the real test).**
Create the `llm-lab` repo (Python, `uv` or `venv`, API key in `.env`, never committed):
- [ ] a script that counts tokens for five inputs (English prose, code, JSON, a non-English sentence, a long repeated string) with your provider's tokenizer or `tiktoken`; print a table
- [ ] call a model five times each at temperature 0, 0.7 and 1.2 on one prompt; record how many distinct answers you got
- [ ] `cost.py`: tokens in and out → dollars from a price table kept in config (not hard-coded), with a pytest
**Commit** (`day43: tokens, sampling, cost`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 200 — Number of Islands](https://leetcode.com/problems/number-of-islands/) — BFS or DFS; mark visited in place or in a set
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the token table shows code and non-English costing more than prose
- [ ] you have measured answer variety at three temperatures
- [ ] the cost function is tested with the price in config ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What is a token, and why do cost and latency depend on it?
- [ ] What happens when a conversation exceeds the context window?
- [ ] What do temperature and top-p each do? Why is temperature 0 not a guarantee?
## Day 44 — Attention and the transformer, at interview depth 🎮 Level 44
> 🎯 **Cutoff target:** explain self-attention, positional information and encoder vs decoder in under three minutes, with one small attention example computed by hand.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 43, yesterday: What is a token, and why do cost and latency depend on it?
- [ ] Day 41, 3 days back: Name three deep dives for a batch warehouse and one failure mode each.
- [ ] Day 37, a week back: How do you detect a hot partition, and what are two fixes?
- [ ] Day 30, 2 weeks back: What's the difference between a data *test* and a data *contract*, and where is each enforced?
- [ ] Day 14, a month back: No notes: list every resilience and quality layer Sentinel-Lite has and the failure each one defends against.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** **Self-attention** lets every token look at every other token and decide how much of each to use. For each token the model makes a query, a key and a value; the weights are `softmax(Q·Kᵀ / √d)` and the output is the weighted sum of the values. Several heads run in parallel, and attention alone ignores order, so position information is added. A transformer block adds a feed-forward layer, residual connections and normalization, and many blocks are stacked. **Encoder** models read the input in both directions (embeddings, classification). **Decoder** models predict the next token using only earlier ones, which a **causal mask** enforces (most chat LLMs). **Encoder-decoder** models map one sequence to another (translation, summarization).
**🔀 Alternatives & when to pick them.**
- **Encoder vs decoder vs encoder-decoder** — embeddings and rerankers use encoders; chat, generation and tool use use decoders; classic sequence-to-sequence uses encoder-decoder.
- **Transformer vs RNN** — transformers train in parallel and handle long-range links better; RNNs process step by step.
- **Dense vs mixture-of-experts** — only some experts run per token, so each token is cheaper while the total weights are larger.
**🚧 Roadblock → fix.** Memorizing the formula without the reasons. Interviewers ask "why divide by √d?" (without it, dot products grow with dimension and push the softmax into a saturated range with tiny gradients) and "why a causal mask?" (so a token cannot see the future it is trying to predict). Fix: explain each piece by the problem it solves.
**💡 Key ideas / hints.**
- Attention cost grows with the square of context length, because every token pair is compared.
- **KV cache:** generation stores past keys and values so it does not recompute them; it trades memory for speed, and long contexts make it large.
- Latency has two parts: **prefill** (process the prompt, parallel) and **decode** (one token at a time, sequential).
**📚 Read (what + how).**
- [Jay Alammar — The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) — **extract:** the query, key and value picture and multi-head attention.
- [DeepLearning.AI — Generative AI with LLMs](https://www.deeplearning.ai/courses/generative-ai-with-llms?id=b3) (week 1) — **extract:** encoder vs decoder and what each is used for.
**🎮 Build & save (the real test).**
In `llm-lab/attention/`:
- [ ] implement scaled dot-product attention in NumPy for a 4-token toy example (Q, K, V as 4×3 arrays); print the attention matrix
- [ ] add a causal mask; show the upper triangle becomes 0
- [ ] pytest: every row sums to 1, and masked weights are 0
- [ ] write `attention-in-my-words.md`: one diagram plus a three-minute spoken script (no formulas without a reason)
**Commit** (`day44: attention from scratch`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1731 — The Number of Employees Which Report to Each Employee](https://leetcode.com/problems/the-number-of-employees-which-report-to-each-employee/) — self-join, rounded average
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the attention matrix rows sum to 1 and the mask works
- [ ] the spoken script covers why √d and why the causal mask
- [ ] you can place encoder, decoder and encoder-decoder with one use each ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Explain self-attention in 60 seconds, aloud.
- [ ] Why divide by √d? Why a causal mask?
- [ ] What is the KV cache, and what is the difference between prefill and decode?
## Day 45 — Adapting a model: prompting, RAG or fine-tuning; LoRA, quantization, RLHF 🎮 Level 45
> 🎯 **Cutoff target:** a one-page decision guide for prompting vs RAG vs fine-tuning, and two-sentence answers on LoRA, quantization and RLHF.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 44, yesterday: Why divide by √d? Why a causal mask?
- [ ] Day 42, 3 days back: Explain exactly-once processing to an interviewer in 60 seconds.
- [ ] Day 38, a week back: Why is exactly-once *delivery* impossible, and how do you get exactly-once *processing*?
- [ ] Day 31, 2 weeks back: When would you pick Dagster, a cloud-native orchestrator, or plain cron over Airflow?
- [ ] Day 15, a month back: Which words in a prompt make you reach for a hashmap?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** When a model's answers are wrong, you have three levers, tried in this order. **Prompting** (clear instructions, examples, structure) is cheapest. **RAG** supplies knowledge the model lacks or that changes often by retrieving documents at question time. **Fine-tuning** changes behaviour, style or a stable skill; it is a poor way to add facts that change. **LoRA** fine-tunes small low-rank adapter matrices instead of all the weights (cheap and swappable). **Quantization** stores weights in fewer bits (8 or 4) to cut memory and speed up serving at some quality cost. **RLHF** shapes a model toward answers people prefer, using a reward model trained on human comparisons.
**🔀 Alternatives & when to pick them.**
- **Missing or changing facts** → RAG. **Auditability or citations** → RAG.
- **Wrong format or tone** → better prompt and examples first; fine-tune if that fails at scale.
- **Latency or cost at scale** → a smaller model, distillation, quantization, caching.
- **A narrow, stable skill with lots of examples** → fine-tuning, usually LoRA.
**🚧 Roadblock → fix.** Jumping to fine-tuning because it sounds serious. Most failures are prompt or retrieval problems, and you find them by reading failing examples. Fix: build a small eval set first (Day 53), name the failure category, and only then choose a lever.
**💡 Key ideas / hints.**
- Facts → RAG. Behaviour → prompt, then fine-tune.
- **QLoRA** = LoRA on a 4-bit quantized base model, so it fits on one GPU.
- RLHF in three stages: supervised fine-tune → train a reward model from preference pairs → optimize the policy against it (DPO skips the explicit reward model).
- Quantization is a serving-cost tool; fine-tuning is a behaviour tool.
**📚 Read (what + how).**
- [Eugene Yan — Patterns for building LLM-based systems](https://eugeneyan.com/writing/llm-patterns/) — **extract:** where evals, RAG, fine-tuning, caching and guardrails each fit.
- [Hugging Face — PEFT docs](https://huggingface.co/docs/peft) — **extract:** what a LoRA adapter is and how it loads on a base model.
**🎮 Build & save (the real test).**
Write `llm-lab/docs/adaptation-guide.md`:
- [ ] a decision table with 8 scenarios, for example "answers must cite policy that changes monthly", "output must be strict JSON", "a 300 ms latency budget", "a niche tone of voice", each with the lever, a one-line reason, and what you would measure
- [ ] two-sentence definitions of LoRA, quantization (including the quality trade) and RLHF, in your own words
- [ ] make 10 flashcards from the page (Anki or paper)
**Commit** (`day45: adaptation guide`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 102 — Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/) — BFS with a level size
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] eight scenarios each have a lever and a metric
- [ ] LoRA, quantization and RLHF are explained without copying
- [ ] 10 flashcards exist ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Prompting, RAG, fine-tuning: how do you choose? Give a one-line rule for each.
- [ ] Why is LoRA cheaper than full fine-tuning?
- [ ] What does quantization trade, and when would you use it?
## Day 46 — ML basics for AI roles: leakage, metrics, overfitting 🎮 Level 46
> 🎯 **Cutoff target:** pick the right metric for three scenarios, spot leakage in a given pipeline, and explain how you would detect overfitting.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 45, yesterday: What does quantization trade, and when would you use it?
- [ ] Day 43, 3 days back: What happens when a conversation exceeds the context window?
- [ ] Day 39, a week back: How does pull-based consumption give backpressure "for free"? (tie to the generators from Day 10)
- [ ] Day 32, 2 weeks back: An analyst needs revenue by region but must not see emails. What do you build?
- [ ] Day 16, a month back: Which 3 trigger-phrase families split into two-pointers vs sliding-window vs fast/slow?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** You do not need to derive gradient descent, but you must evaluate honestly. **Overfitting**: the model memorizes training data and fails on new data; detect it as a gap between training and validation scores. **Leakage**: information from the label or the future sneaks into features or the split (normalizing on the full dataset before splitting, duplicates across train and test, a feature computed after the outcome). **Metrics**: accuracy misleads on imbalanced data; **precision** is "of what I flagged, how much was right"; **recall** is "of what exists, how much I caught"; PR-AUC suits rare positives. For ranking and retrieval you use recall@k, MRR and NDCG (Day 53).
**🔀 Alternatives & when to pick them.**
- **Favor recall** when a miss is expensive (fraud, safety); **favor precision** when a false alarm is expensive (auto-blocking users).
- **Random split vs time-based split** — use a time-based split for anything with a time order.
- **Cross-validation vs a single hold-out** — cross-validation for small data, a hold-out for large data.
**🚧 Roadblock → fix.** A great metric on a leaky split. 99% accuracy on a 1% positive rate is the "always predict negative" model. Fix: look at class balance first, split by time or by entity, compute a naive baseline, and report precision and recall at a stated threshold.
**💡 Key ideas / hints.**
- Always compare against a dumb baseline (majority class, last value).
- Fit scalers, encoders and imputers on the training split only.
- The threshold is a business decision: choose it from the cost of each kind of error.
**📚 Read (what + how).**
- [Google — Classification: accuracy, precision, recall](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall) — **extract:** the confusion matrix and when accuracy lies.
- [scikit-learn — common pitfalls (data leakage)](https://scikit-learn.org/stable/common_pitfalls.html) — **extract:** the leakage examples and the pipeline fix.
**🎮 Build & save (the real test).**
In `llm-lab/ml-basics/`, with scikit-learn:
- [ ] a synthetic dataset with 1% positives; train logistic regression; show accuracy vs precision, recall and PR-AUC; compare with the "always negative" baseline
- [ ] plant leakage (fit the scaler on all data, or add a feature built from the label); show the inflated score; fix it with a `Pipeline`
- [ ] overfit a deep decision tree; print the train vs validation gap; reduce it with regularization
- [ ] three sentences per finding in `findings.md`
**Commit** (`day46: metrics, leakage, overfitting`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1141 — User Activity for the Past 30 Days I](https://leetcode.com/problems/user-activity-for-the-past-30-days-i/) — date window + COUNT DISTINCT
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the baseline comparison exposes the accuracy trap
- [ ] the leakage example is planted, shown and fixed
- [ ] the overfit gap is measured before and after ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What is leakage? Give two examples and the fix for each.
- [ ] Fraud alerts: precision or recall, and why?
- [ ] Why is accuracy misleading on imbalanced data?
## Day 47 — LLM API contracts: structured output, timeouts, bounded retries, prompt versions 🎮 Level 47
> 🎯 **Cutoff target:** a typed `extract_invoice()` that returns validated output or a clear error, with a timeout, bounded retries and a versioned prompt.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 46, yesterday: What is leakage? Give two examples and the fix for each.
- [ ] Day 44, 3 days back: What is the KV cache, and what is the difference between prefill and decode?
- [ ] Day 40, a week back: Name 6 fault-tolerance patterns and the failure each addresses.
- [ ] Day 33, 2 weeks back: Give the capability and the three service names for orchestration and for governance.
- [ ] Day 17, a month back: Why `deque` over `list` for a queue?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Treat an LLM call like any slow, flaky, expensive remote service with a fuzzy contract. A good wrapper has a **schema** for the output (Pydantic), **structured output** or **function calling** so the model returns that shape, **validation** with one bounded repair attempt, a **timeout**, **retries** for transient errors only with backoff and a total budget, **logging** of prompt version, model, tokens, latency and cost, and **versioned prompts** stored as files so you can diff and roll back. It reuses Day 8 (Pydantic) and Day 13 (retries).
**🔀 Alternatives & when to pick them.**
- **Plain text + regex** — fragile; avoid.
- **JSON mode** — valid JSON, no schema guarantee.
- **Schema-enforced structured output** — the provider constrains output to your schema; prefer it, and validate anyway.
- **Function or tool calling** — the model picks a function and arguments; the basis of agents (Day 57).
**🚧 Roadblock → fix.** Validation failures you did not plan for: prose around the JSON, a missing field, an invented enum value. Fix: schema-enforced output where available, `Literal` enums with an "unknown" option, **one** repair retry that feeds the validation error back, then fail loudly into a quarantine. Second wall: unbounded retries burn money. Cap attempts and total time.
**💡 Key ideas / hints.**
- Use temperature 0 for extraction.
- Log `prompt_version`, model, tokens, latency and cost on every call; never log secrets or raw PII.
- Set a client timeout and an overall request deadline.
- A prompt is code: file, version, review, test.
**📚 Read (what + how).**
- [OpenAI — Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) and [Anthropic — Tool use](https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview) — **extract:** the shared idea: a schema in, a validated object out.
- [DeepLearning.AI short courses](https://deeplearning.ai/short-courses/) — **extract:** "Pydantic for LLM Workflows" (under 2 hours), skim the validation and retry section.
**🎮 Build & save (the real test).**
In `llm-lab/`:
- [ ] `Invoice` Pydantic model (vendor, date, total, currency as a `Literal`, line items); the prompt lives in `prompts/extract_invoice.v1.txt`
- [ ] `extract_invoice(text) -> Invoice` with a timeout, `tenacity` retries (transient errors only, max 3, total budget), one repair attempt that sends the validation error back, and a typed `ExtractionFailed`
- [ ] tests with a **fake client** (no network): valid JSON, JSON wrapped in prose, a missing field, an invalid enum, a timeout then success; assert each outcome
**Commit** (`day47: llm api contract`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 238 — Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) — prefix and suffix, no division
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] all five fake-client cases pass
- [ ] retries are bounded by count and by time
- [ ] every call logs prompt version, tokens and latency ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] How do you get reliable structured output from an LLM? List the layers.
- [ ] What belongs in an LLM wrapper besides the call?
- [ ] Why one repair attempt, and what happens after it fails?
## Day 48 — Build one tested LLM feature 🎮 Level 48
> 🎯 **Cutoff target:** a support-ticket triage function with a 20-case labeled eval set, unit tests on a fake client, and a quality check that fails when accuracy drops.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 47, yesterday: What belongs in an LLM wrapper besides the call?
- [ ] Day 45, 3 days back: Prompting, RAG, fine-tuning: how do you choose? Give a one-line rule for each.
- [ ] Day 41, a week back: What do you do in the first two minutes of any design prompt?
- [ ] Day 34, 2 weeks back: What would you have cut if you had half the time?
- [ ] Day 18, a month back: Write your single binary-search template + invariant from memory.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** An LLM feature needs two kinds of tests, and they must not be mixed. **Unit tests** use a fake client: fast and deterministic, they cover parsing, retries, validation and routing. **Evals** call the real model on a labeled set: slower and statistical, they measure quality. The eval is what lets you change a prompt or model and know whether you improved or broke things. This is the smallest version of the discipline you scale up on Days 53–55.
**🔀 Alternatives & when to pick them.**
- **Unit test vs eval vs online monitoring** — unit tests guard your code, evals guard answer quality before release, monitoring guards it after.
- **Exact-match scoring vs LLM-as-judge** — use exact match whenever the answer is a label; a judge is for free text (Day 54).
- **Golden set size** — 20 cases is a start; grow it from real failures.
**🚧 Roadblock → fix.** Flaky tests because a real model runs in CI. Fix: a fake client for unit tests; run the real-model eval separately, at temperature 0, with a threshold that has a tolerance (for example accuracy ≥ 0.85) and results stored per run so you can see drift. Second wall: an eval set the prompt has been tuned to, so the score is inflated. Hold out a few cases you never look at.
**💡 Key ideas / hints.**
- Write the eval cases before the prompt; include hard and ambiguous ones.
- Store every eval run (date, prompt version, model, score) in a CSV or JSON file.
- Keep 5 of the 20 cases as a hidden hold-out.
**📚 Read (what + how).**
- [Hamel Husain — Your AI product needs evals](https://hamel.dev/blog/posts/evals/) — **extract:** start with unit-test-style assertions and look at real data.
- [Eugene Yan — Patterns for building LLM-based systems](https://eugeneyan.com/writing/llm-patterns/) — **extract:** the evals section.
**🎮 Build & save (the real test).**
In `llm-lab/triage/`:
- [ ] `triage(ticket) -> Triage` (category from a fixed list, urgency 1–3, one-line summary) using the Day 47 wrapper
- [ ] `evals/cases.jsonl` with 20 labeled tickets (5 marked hold-out) and `evals/run.py` that prints accuracy per category and lists the failures
- [ ] pytest unit tests on a fake client; a separate `make eval` for the real model with a threshold that exits non-zero when accuracy drops
- [ ] store each run's result in `evals/history.csv`
**Commit** (`day48: tested llm feature`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1148 — Article Views I](https://leetcode.com/problems/article-views-i/) — easy: aim for under 3 minutes
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] unit tests pass offline
- [ ] the eval prints per-category accuracy and lists failures
- [ ] a lowered threshold makes `make eval` fail ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] How do you test an LLM feature? Name the two kinds of test and what each guards.
- [ ] Why keep a hidden hold-out in the eval set?
- [ ] Why is the real model not in your normal CI run?
## Day 49 — Boss: 20 LLM questions answered aloud 🎮 Boss Level
> 🎯 **Cutoff target:** answer 20 LLM fundamentals questions aloud, no notes, about 2 minutes each, and mark every answer green, amber or red.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 43: What happens when a conversation exceeds the context window?
- [ ] Day 44: Explain self-attention in 60 seconds, aloud.
- [ ] Day 45: What does quantization trade, and when would you use it?
- [ ] Day 46: Fraud alerts: precision or recall, and why?
- [ ] Day 47: How do you get reliable structured output from an LLM? List the layers.
- [ ] Day 48: Why is the real model not in your normal CI run?
**📖 The concept (what & why engineers use it).** Interview answers fail on delivery as often as on content. Today you say the week out loud, record it, and grade it. A good answer is short, starts with the point, gives one concrete example, and names a trade-off.
**🎮 Build & save (the real test).**
- [ ] **Aloud and recorded (40 min), no notes.** Answer in order, about 2 minutes each: 1) What is a token and why do cost and latency depend on it? 2) What is a context window and what happens when you exceed it? 3) What do temperature and top-p do? 4) Explain self-attention. 5) Why divide by √d? 6) Encoder vs decoder vs encoder-decoder: one use each. 7) What is the KV cache? 8) Prefill vs decode latency? 9) Prompting vs RAG vs fine-tuning: how do you choose? 10) What is LoRA and why is it cheaper? 11) What does quantization trade? 12) RLHF in four sentences. 13) What is leakage? 14) Precision vs recall for fraud alerts? 15) Why does accuracy mislead on imbalanced data? 16) How do you get reliable structured output? 17) What belongs in an LLM wrapper besides the call? 18) How do you test an LLM feature? 19) What is "lost in the middle"? 20) Why does temperature 0 not guarantee identical output?
- [ ] **Grade (15 min):** mark each green, amber or red; fix the reds from your notes and add them to `error-log.md`. **Commit** (`day49: llm week complete`).
**🧮 Practice reps (15 min).**
- [ ] Re-record your two weakest answers, 90 seconds each, and compare with the first take.
**✅ Done when:**
- [ ] all 20 answered aloud and recorded
- [ ] every red answer has a written fix in `error-log.md`
- [ ] Week 7 retro written ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏔️ **Week 7 complete.** Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Without notes, list the five levers for making an LLM answer better, in the order you try them.
- [ ] Which answer was longest and which was vaguest? What is the rule you will use to shorten it?
---
# 📅 Week 8 — RAG and Evals: retrieval you can measure
> **Phase goal:** RAG opens most AI-engineer phone screens, and evals are where candidates most often fail. You build a retrieval-augmented service end to end (`rag-eval-service`) and put numbers on it: retrieval metrics (recall@k, MRR, NDCG), generation metrics (faithfulness, answer relevancy), a calibrated LLM judge, and an eval gate in CI. The week ends with the question every interviewer asks: "the answer is wrong — which stage failed?"
## Day 50 — Embeddings, vector search and hybrid search 🎮 Level 50
> 🎯 **Cutoff target:** embed a corpus, store vectors in pgvector, and compare vector-only, keyword-only and hybrid search on the same questions.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 49, yesterday: Which answer was longest and which was vaguest? What is the rule you will use to shorten it?
- [ ] Day 47, 3 days back: Why one repair attempt, and what happens after it fails?
- [ ] Day 43, a week back: What is a token, and why do cost and latency depend on it?
- [ ] Day 36, 2 weeks back: State CAP correctly (not "2 of 3") and what PACELC adds.
- [ ] Day 20, a month back: Which wording sends you to BFS vs DFS? Give the reflex rule for "shortest."
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** An embedding maps text (or any data) to a vector such that *semantically similar things land near each other*. Vector search finds nearest neighbours by cosine/dot distance — "retrieve by meaning," not keyword match. Engineers use it for RAG, semantic search, dedup, recommendations, and clustering. This is the foundation of the entire GenAI retrieval stack; under the hood it's "an index for meaning," which maps cleanly onto your index-and-lookup instincts.
**🔀 Alternatives & when to pick them.**
pgvector (Postgres extension) → you already have Postgres, modest scale, want SQL + vectors together (great default for you). Dedicated vector DBs (Qdrant, Weaviate, Milvus) → large scale, advanced filtering, high QPS. FAISS → in-process, max speed, no persistence layer. Managed (Pinecone) → don't want to run infra. Keyword search (BM25) → exact-term matching; often *combined* with vectors (hybrid).
- **Hybrid search** — combine keyword (BM25 or full-text) and vector scores, for example with reciprocal rank fusion. It catches exact terms, names and ids that embeddings blur.
**🚧 Roadblock → fix.** The trap: treating cosine similarity as "relevance." High similarity ≠ correct answer — embeddings capture topical closeness, not factual match, so retrieval can return plausible-but-wrong chunks. Fix: hybrid search (BM25 + vector) + reranking (Day 52), and *measure* with eval (Day 53). Second gotcha: mismatched embedding models between index and query (you must embed queries with the *same* model you indexed with).
**💡 Key ideas / hints.** Distance metrics: cosine (most common for text), dot, L2. Dimensionality (e.g. 384, 768, 1536) is fixed by the model. ANN indexes (HNSW, IVFFlat) trade a little recall for big speed — exact search doesn't scale.
**📚 Read (what + how).** [pgvector README](https://github.com/pgvector/pgvector) — **extract:** creating a vector column, `<=>` cosine operator, HNSW/IVFFlat index. Skim [a sentence-transformers quickstart](https://www.sbert.net/) — **extract:** how to embed text locally (free, no API key).
**🎮 Build & save (the real test).**
- [ ] start Postgres + pgvector with docker.
- [ ] pick a corpus of roughly 200 documents (product docs, your own notes, or a public docs site); embed with a local `sentence-transformers` model; store vectors; create an HNSW index.
- [ ] add Postgres full-text search; fuse the two rankings with reciprocal rank fusion.
- [ ] ask 8 questions, including two that contain exact identifiers; record which method finds the right document for each.
**Commit** (`day50: pgvector + hybrid search`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1280 — Students and Examinations](https://leetcode.com/problems/students-and-examinations/) — CROSS JOIN first, then LEFT JOIN so zero counts stay
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the corpus is embedded and indexed with an ANN index
- [ ] hybrid search is implemented with a fusion rule
- [ ] a table shows which method won on which question ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What does an embedding actually encode, and why is cosine-similarity ≠ correctness?
- [ ] When would you pick a dedicated vector DB over pgvector?
## Day 51 — Chunking and ingestion 🎮 Level 51
> 🎯 **Cutoff target:** an ingestion pipeline that chunks documents sensibly with metadata, re-runs without duplicates, and a chunk-size choice you can defend.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 50, yesterday: What does an embedding actually encode, and why is cosine-similarity ≠ correctness?
- [ ] Day 48, 3 days back: How do you test an LLM feature? Name the two kinds of test and what each guards.
- [ ] Day 44, a week back: Why divide by √d? Why a causal mask?
- [ ] Day 37, 2 weeks back: How do you detect a hot partition, and what are two fixes?
- [ ] Day 21, a month back: Any amber or red pattern goes into `error-log.md` with today's date; the practice slot revisits it for the next five weeks.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Chunking splits documents into retrieval-sized pieces before embedding. It's quietly *the* highest-leverage knob in RAG quality: too big and a chunk dilutes the relevant bit (poor precision, and you blow the context budget); too small and you lose the surrounding context needed to answer. Engineers spend real effort here because retrieval quality caps the whole system — a perfect LLM can't answer from a bad chunk.
**🔀 Alternatives & when to pick them.** Fixed-size + overlap → simplest, decent baseline. Recursive/structural (split on headings/paragraphs) → respects document structure, usually better. Semantic chunking (split on embedding-similarity shifts) → best quality, more compute. Per-document-type (code vs prose vs tables) → when corpus is heterogeneous. Start simple (recursive + overlap), improve if eval says so.
**🚧 Roadblock → fix.** The trap: chunking mid-sentence / mid-table so meaning is severed, or zero overlap so an answer spanning a boundary is unretrievable. Fix: overlap (e.g. 10–20%) + structure-aware splitting + attach metadata (source, section, doc id) so you can cite and filter. Second gotcha: not storing enough metadata → you can't filter retrieval (by date/source) or show citations later.
**💡 Key ideas / hints.** Chunk size + overlap are eval-driven, not guessed. Metadata enables filtered retrieval + citations (which matter for trust). Keep a stable doc-id so re-ingestion is idempotent (the idempotency idea from Day 4: re-embed only changed docs).
**📚 Read (what + how).** [LangChain — Text Splitters](https://python.langchain.com/docs/concepts/text_splitters/) — **extract:** recursive splitter, chunk size/overlap, metadata. Skim [Pinecone's chunking guide](https://www.pinecone.io/learn/chunking-strategies/) — **extract:** the size tradeoff + strategies.
**🎮 Build & save (the real test).**
- [ ] `ingest.py`: load docs → structure-aware chunking with overlap → attach metadata (`source`, `section`, `doc_id`, `updated_at`) → embed → upsert to pgvector keyed on a stable chunk id.
- [ ] run it twice and prove no duplicates; change one document and prove only its chunks change.
- [ ] build two chunk sizes (for example 300 and 800 tokens) side by side so you can compare them on Day 53.
**Commit** (`day51: chunking + idempotent ingestion`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 560 — Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/) — prefix sums in a hashmap
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] documents chunked with overlap + metadata
- [ ] re-running ingestion is idempotent (no duplicate chunks)
- [ ] you can state your chunk-size/overlap choice + why ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Why is chunk size the highest-leverage RAG knob? State both failure directions.
- [ ] What metadata do you attach and what does each enable?
## Day 52 — The RAG chain: retrieve, rerank, generate with citations 🎮 Level 52
> 🎯 **Cutoff target:** an end-to-end function answers from retrieved context with citations, adds a reranking step, and declines a question that is not in the corpus.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 51, yesterday: What metadata do you attach and what does each enable?
- [ ] Day 49, 3 days back: Which answer was longest and which was vaguest? What is the rule you will use to shorten it?
- [ ] Day 45, a week back: What does quantization trade, and when would you use it?
- [ ] Day 38, 2 weeks back: Why is exactly-once *delivery* impossible, and how do you get exactly-once *processing*?
- [ ] Day 22, a month back: Draw the Iceberg metadata tree from memory. What does a snapshot point to?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** RAG = retrieve relevant chunks, stuff them into the prompt as context, let the LLM generate an answer grounded in them. It exists to fix the LLM's two big failures: stale knowledge and hallucination — ground the model in *your* retrieved facts. **Reranking** adds a second, more precise scoring pass over the top-N candidates (a cross-encoder reads query+chunk together) to push the truly relevant chunks to the top before generation. Engineers reach for RAG whenever answers must reflect private/current data.
**🔀 Alternatives & when to pick them.** RAG → answers must be grounded in a knowledge base (the default for Q&A over your data). Fine-tuning → when you need behavior/style/format change, not fresh facts (RAG for knowledge, fine-tune for behavior — a key interview distinction). Long-context stuffing → small, fixed corpus that fits in context. Agentic/tool-use (Days 57–58) → when the task needs actions, not just retrieval. Reranking → add when retrieval recall is fine but precision (top-1 quality) is weak.
**🚧 Roadblock → fix.** The defining RAG failure: **hallucination despite retrieval** — the model answers from its own priors and ignores (or contradicts) the context. Fixes: a strict prompt ("answer ONLY from the context; if it's not there, say you don't know"), include citations, and *measure faithfulness* (Day 53). Second gotcha: retrieving k too high → context bloat, lower-quality chunks dilute the prompt, cost/latency up → rerank and trim.
**💡 Key ideas / hints.** Pipeline: embed query → ANN retrieve top-N → rerank → take top-k → prompt with context + citations → generate. "Answer only from context, else say I don't know" is the anti-hallucination instruction. Return sources for trust + later eval.
**📚 Read (what + how).** [LangChain — RAG tutorial](https://python.langchain.com/docs/tutorials/rag/) — **extract:** retriever → prompt → LLM wiring. Skim [a cross-encoder reranking explainer](https://www.sbert.net/examples/applications/retrieve_rerank/README.html) — **extract:** why a second pass beats bi-encoder alone.
**🎮 Build & save (the real test).**
- [ ] `rag.py`: query → retrieve top-N → rerank with a cross-encoder → keep top-k → prompt (context, "cite sources, otherwise say you do not know") → generate with any API or a local model; return the answer **with citations**.
- [ ] test one question whose answer is in the corpus and one that is not; the second must decline.
- [ ] log the retrieved chunk ids with every answer; you need them for the debugging drill on Day 54.
**Commit** (`day52: rag chain + rerank + citations`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 197 — Rising Temperature](https://leetcode.com/problems/rising-temperature/) — compare to the previous calendar day, not the previous row
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the answer cites its sources
- [ ] an out-of-corpus question gets "I don't know", not a guess
- [ ] retrieved chunk ids are logged for every answer ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] RAG vs fine-tuning — which for fresh facts, which for behavior, and why?
- [ ] What does reranking add over plain vector retrieval, and when is it worth it?
## Day 53 — Evaluation: Ragas plus retrieval metrics 🎮 Level 53
> 🎯 **Cutoff target:** an eval harness scores retrieval (recall@k, MRR, NDCG) and generation (faithfulness, answer relevancy, context precision and recall) over a golden set, giving a baseline you can move.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 52, yesterday: RAG vs fine-tuning — which for fresh facts, which for behavior, and why?
- [ ] Day 50, 3 days back: What does an embedding actually encode, and why is cosine-similarity ≠ correctness?
- [ ] Day 46, a week back: What is leakage? Give two examples and the fix for each.
- [ ] Day 39, 2 weeks back: How does pull-based consumption give backpressure "for free"? (tie to the generators from Day 10)
- [ ] Day 23, a month back: Does changing the partition spec re-partition existing data? What do you do if you need that?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** A RAG system has two jobs, and you evaluate them separately. **Retrieval** metrics need labeled relevant documents: **recall@k** (is a relevant chunk in the top k?), **MRR** (how high is the first relevant result? average of 1/rank) and **NDCG** (are the best chunks ranked above the weaker ones, with a rank discount?). **Generation** metrics, usually from Ragas with an LLM as judge: **faithfulness** (grounded in the retrieved context, so not hallucinated), **answer relevancy** (answers the question), **context precision and recall**. Without a golden set you are tuning by feel.
**🔀 Alternatives & when to pick them.** Ragas → RAG-specific, decomposed metrics (the default here). DeepEval / promptfoo → general LLM eval + assertions + CI integration. LLM-as-judge (custom) → when you need a bespoke rubric. Human eval → gold standard, expensive — use to validate your automated metrics. Golden Q&A set → always build one; it's your regression suite.
**🚧 Roadblock → fix.** The trap: optimizing one metric and quietly wrecking another — e.g. retrieving more chunks lifts context-recall but tanks faithfulness (more noise → more hallucination). Fix: track the *whole vector* of metrics, change one variable at a time, and keep a fixed golden set so runs are comparable (regression testing). Second gotcha: LLM-judge noise → use a capable judge model, average over a real question set (not 3 questions), and sanity-check against a few human judgments.
**💡 Key ideas / hints.**
- Build the golden set first: 25 questions, each with the expected answer and the ids of the chunks that contain it.
- Retrieval metrics tell you whether retrieval is the problem; faithfulness tells you whether generation is.
- Change one variable per run and keep the golden set fixed so runs are comparable.
**📚 Read (what + how).**
- [Ragas docs — metrics and quickstart](https://docs.ragas.io/) — **extract:** faithfulness, answer relevancy, context precision and recall, and how to run an eval set.
- [Wikipedia — Discounted cumulative gain](https://en.wikipedia.org/wiki/Discounted_cumulative_gain) and [Mean reciprocal rank](https://en.wikipedia.org/wiki/Mean_reciprocal_rank) — **extract:** the formulas and one worked example each.
**🎮 Build & save (the real test).**
- [ ] `eval/golden.jsonl`: 25 questions with expected answers and relevant chunk ids.
- [ ] `eval/retrieval.py`: compute recall@5, MRR and NDCG@5 yourself (a few lines each) and unit-test them on a tiny hand-computed example.
- [ ] `eval/generation.py`: run Ragas for faithfulness, answer relevancy and context precision and recall.
- [ ] record the baseline vector for both chunk sizes from Day 51; change ONE thing (chunk size, k, or rerank on/off), re-run, and write the delta in `experiments.md`.
**Commit** (`day53: retrieval + generation eval baseline`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 875 — Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/) — binary search the answer
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the metric functions pass tests against hand-computed values
- [ ] a baseline for retrieval and generation is recorded
- [ ] one change is measured as a metric delta, not a feeling ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Define recall@k, MRR and NDCG in one line each. Which one cares about order?
- [ ] Given low context recall but high faithfulness, which lever do you pull?
- [ ] Why change one variable at a time against a fixed golden set?
## Day 54 — LLM judges, calibration, and debugging a wrong answer stage by stage 🎮 Level 54
> 🎯 **Cutoff target:** measure how well your LLM judge agrees with human labels, and walk five wrong answers back to the stage that failed.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 53, yesterday: Given low context recall but high faithfulness, which lever do you pull?
- [ ] Day 51, 3 days back: What metadata do you attach and what does each enable?
- [ ] Day 47, a week back: What belongs in an LLM wrapper besides the call?
- [ ] Day 40, 2 weeks back: Name 6 fault-tolerance patterns and the failure each addresses.
- [ ] Day 24, a month back: A source row is hard-deleted. What does the CDC change feed carry for it, and how does your MERGE apply it?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** An **LLM judge** scores answers automatically, but it is a model with its own biases (it likes long answers and its own style) and noise. **Calibrate** it: label 20–30 answers yourself, compare, and compute agreement; if it disagrees often, change the rubric or the judge model before trusting its numbers. **Debugging a wrong answer** is a procedure, not a guess. Check the stages in order: was the right document ingested? chunked so the answer survives? retrieved in the top k? kept after reranking? present in the prompt? used by the generation? The first stage that fails is the cause.
**🔀 Alternatives & when to pick them.**
- **Reference-based scoring** (compare with the expected answer) vs **reference-free** (judge against the context) — reference-based is more reliable when you have the answers.
- **Pairwise comparison** (which of two is better) vs **absolute scores** — pairwise is usually more stable.
- **A stronger judge model vs the same model family** — a different, stronger judge reduces self-preference bias.
- **Human review** — the ground truth; sample it regularly.
**🚧 Roadblock → fix.** Trusting judge scores that nobody checked. Fix: a human-labeled sample, agreement measured (for example Cohen's kappa or simple percent agreement), a written rubric with examples, and re-checking after any judge or prompt change. Second wall: fixing the prompt when retrieval was the failure. Always find the failing stage first.
**💡 Key ideas / hints.**
- Stage checklist: ingested → chunked → retrieved → reranked → in the prompt → used.
- Log chunk ids, scores and the final prompt for every request; you cannot debug what you did not record.
- A judge prompt is code: version it, test it on labeled cases.
**📚 Read (what + how).**
- [Eugene Yan — Evaluating the effectiveness of LLM evaluators](https://eugeneyan.com/writing/llm-evaluators/) — **extract:** known judge biases and how to measure agreement.
- [Hamel Husain — Your AI product needs evals](https://hamel.dev/blog/posts/evals/) — **extract:** error analysis on real traces before building metrics.
**🎮 Build & save (the real test).**
- [ ] label 25 of your system's answers yourself (pass or fail, with a one-line reason); run your judge on the same 25; compute percent agreement and list the disagreements.
- [ ] edit the judge rubric once to fix the biggest disagreement; re-run and record the new agreement.
- [ ] **Debug drill:** pick the 5 worst answers from your eval, and for each write which stage failed (use the logged chunk ids) and the one-line fix.
- [ ] summarize in `docs/debugging-rag.md`: the stage checklist plus your five cases.
**Commit** (`day54: judge calibration + debugging`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 184 — Department Highest Salary](https://leetcode.com/problems/department-highest-salary/) — ties must all appear
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] judge agreement with your labels is measured and recorded
- [ ] five wrong answers each name a failing stage
- [ ] the stage checklist is in the repo ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] "The RAG answer is wrong." Give the six stages you check, in order.
- [ ] Why can you not trust an LLM judge you have not calibrated?
- [ ] Name two judge biases and one way to reduce each.
## Day 55 — Serve it: FastAPI, streaming, and an eval gate in CI 🎮 Level 55
> 🎯 **Cutoff target:** the RAG system is a FastAPI `/ask` endpoint (streaming, validated, observable), and eval runs in CI as a quality gate.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 54, yesterday: Name two judge biases and one way to reduce each.
- [ ] Day 52, 3 days back: RAG vs fine-tuning — which for fresh facts, which for behavior, and why?
- [ ] Day 48, a week back: Why is the real model not in your normal CI run?
- [ ] Day 41, 2 weeks back: Recite the six phases of the design frame in order.
- [ ] Day 25, a month back: Why do MOR tables need compaction more than COW tables?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** A prototype becomes a service when it has a contract (validated input and output), limits (timeouts, max tokens), visibility (logs, a latency metric) and a gate that stops regressions. The **eval gate** is the same idea as the data-quality gate on Day 30: a change that lowers the score does not merge.
**🔀 Alternatives & when to pick them.** FastAPI → async, Pydantic-native, streaming, the default for Python AI services (Pydantic, async and tests, all from Week 2). LangServe / LiteLLM proxy → faster wiring if you want less control. BentoML / Ray Serve → heavier ML-serving infra (batching, GPU) — overkill here. Streaming via SSE → for token-by-token UX; plain JSON for batch.
**🚧 Roadblock → fix.** The trap: shipping an LLM endpoint with no guardrails → no timeout (a slow generation hangs the worker), no input validation (prompt-injection / oversized inputs), no cost cap. Fix: Pydantic-validate inputs, set timeouts + max tokens, rate-limit, and apply the resilience patterns from Day 13 (retry the model call, circuit-break the vector DB). Second gotcha: blocking the event loop with a sync embedding/LLM call → use async clients or `to_thread` (the Day 12 lesson).
**💡 Key ideas / hints.** `/ask` (RAG) endpoint; stream tokens via SSE/`StreamingResponse`. Emit the Day 14 observability: structured log per request + latency histogram + a retrieval-hit counter. Eval-in-CI = the quality gate (the same gate idea as Day 30, now for the model).
**📚 Read (what + how).** [FastAPI — first steps + async](https://fastapi.tiangolo.com/) + [StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse) — **extract:** Pydantic request/response models, async endpoints, streaming.
**🎮 Build & save (the real test).**
- [ ] wrap `rag.py` in FastAPI `/ask`: Pydantic request and response, streaming, a timeout, a max-tokens cap, structured logging and a latency metric.
- [ ] a GitHub Action that runs the retrieval metrics (cheap, every PR) and the generation eval (on a schedule or by label), and **fails if faithfulness or recall@5 falls below the threshold**.
- [ ] store each eval run as a CSV artifact.
**Commit** (`day55: fastapi serve + eval gate`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 207 — Course Schedule](https://leetcode.com/problems/course-schedule/) — cycle detection in a directed graph
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] `/ask` streams, validates input and emits logs and a latency metric
- [ ] a PR that lowers the score fails CI
- [ ] eval results are stored per run ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What guardrails does an LLM endpoint need that a CRUD endpoint does not?
- [ ] How is an eval gate in CI the same idea as a data-quality gate?
- [ ] Why run the cheap retrieval metrics on every PR and the expensive judge eval less often?
## Day 56 — Boss: ship `rag-eval-service` and defend it 🎮 Boss Level
> 🎯 **Cutoff target:** `rag-eval-service` is public, runnable, with the eval table at the top of the README, an architecture diagram and a green CI gate.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 50: What does an embedding actually encode, and why is cosine-similarity ≠ correctness?
- [ ] Day 51: What metadata do you attach and what does each enable?
- [ ] Day 52: RAG vs fine-tuning — which for fresh facts, which for behavior, and why?
- [ ] Day 53: Why change one variable at a time against a fixed golden set?
- [ ] Day 54: Why can you not trust an LLM judge you have not calibrated?
- [ ] Day 55: What guardrails does an LLM endpoint need that a CRUD endpoint does not?
**📖 The concept (what & why engineers use it).** A hiring manager opens the README and looks for three things: what it does, a number, and whether it runs. Lead with the eval table. Today you package the week and then rehearse the follow-up: "walk me through your RAG system and tell me where it fails."
**🎮 Build & save (the real test).**
- [ ] **README (25 min):** the eval table first (baseline → improved, the metrics, the method), then the architecture (ingest → chunk → embed → retrieve → rerank → generate → eval → serve), then the `experiments.md` story and known failure modes.
- [ ] **Run it (15 min):** `docker compose up` starts pgvector and the API from a clean checkout; add example calls.
- [ ] **Defend it (15 min, aloud):** a 4-minute walkthrough, then answer: where does it fail, what did you try that did not work, what would you do with another week? **Commit** (`day56: ship rag-eval-service`).
**🧮 Practice reps (15 min).**
- [ ] Closed book, 10 minutes: draw the RAG lifecycle and write, at each stage, the dominant failure and the metric that catches it.
**✅ Done when:**
- [ ] repo public and runnable from a clean checkout
- [ ] eval table, diagram and a green CI gate are in place
- [ ] the 4-minute walkthrough was said aloud once
- [ ] Week 8 retro written ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏔️ **Week 8 complete.** Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] No notes, 2 min: walk the RAG lifecycle — chunk → embed → retrieve → rerank → generate → eval → serve → iterate. Name the dominant failure + the metric that catches it at each stage.
---
# 📅 Week 9 — Agents, LLMOps, Security and Cost: running AI in production
> **Phase goal:** the production half of AI engineering. You build an agent and learn when not to; trace it; protect it against prompt injection and over-permissioned retrieval; budget its cost and tail latency; version and monitor a model in one day; and finish with an incident drill, the exercise interviewers describe as "tell me about a time it broke."
## Day 57 — Build a LangGraph agent 🎮 Level 57
> 🎯 **Cutoff target:** a LangGraph agent that decides whether to retrieve, query or answer, as an inspectable state graph with a step limit.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 56, yesterday: No notes, 2 min: walk the RAG lifecycle — chunk → embed → retrieve → rerank → generate → eval → serve → iterate. Name the dominant failure + the metric that catches it at each stage.
- [ ] Day 54, 3 days back: "The RAG answer is wrong." Give the six stages you check, in order.
- [ ] Day 50, a week back: What does an embedding actually encode, and why is cosine-similarity ≠ correctness?
- [ ] Day 43, 2 weeks back: What do temperature and top-p each do? Why is temperature 0 not a guarantee?
- [ ] Day 27, a month back: When would you reach for Flink over Spark Structured Streaming?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** An **agent** is an LLM that decides and acts in a loop: choose a tool, read the result, decide again, until it can answer. **LangGraph** models the loop as an explicit **state graph** (nodes are steps, edges are transitions, state is passed along), which makes the agent inspectable and resumable instead of an opaque `while` loop. You use an agent when a task needs several steps whose order cannot be known in advance.
**🔀 Alternatives & when to pick them.**
- **LangGraph** — controllable, stateful, inspectable graphs; a good default when you need an agent.
- **A plain tool-use loop** — the simplest option and often enough for one or two tool calls.
- **CrewAI or AutoGen** — multi-agent framings; reach for them only when one agent measurably fails.
- **No agent** — if retrieval or one tool call answers it, skip the agent: agents add latency, cost and failure modes.
**🚧 Roadblock → fix.** The classic agent failure: **infinite loops / runaway cost** — the agent keeps calling tools without converging. Fix: a max-step/recursion limit, a budget cap, and explicit termination conditions in the graph (LangGraph makes these first-class). Second gotcha: the agent confidently calls a tool with wrong/hallucinated args → validate tool inputs (Pydantic), and make tools return structured errors the agent can recover from.
**💡 Key ideas / hints.**
- Nodes are steps (plan, retrieve, call tool, answer); edges are conditional transitions on state.
- State carries the conversation and intermediate results; a checkpointer makes a run resumable.
- Keep tools small, typed and well described.
**📚 Read (what + how).** [LangGraph — Quickstart + concepts](https://langchain-ai.github.io/langgraph/) — **extract:** StateGraph, nodes/edges, conditional routing, recursion limit + checkpointer.
**🎮 Build & save (the real test).**
- [ ] build a small LangGraph agent with three tools: (a) your RAG retriever from Day 52, (b) a read-only SQL tool over `sql-lab`, (c) a calculator.
- [ ] route a question to the right tool or tools, then compose an answer.
- [ ] add a recursion limit and Pydantic validation on tool arguments.
- [ ] run five questions (two need no tool, one needs retrieval, one needs SQL, one needs both) and print the path each took.
**Commit** (`day57: langgraph agent`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 98 — Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/) — pass bounds down, not just the parent
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the graph routes each of the five questions sensibly
- [ ] a looping prompt stops at the recursion limit
- [ ] bad tool arguments are rejected before the tool runs ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What is an agent, in one sentence, and what does a state graph add?
- [ ] Name the two classic agent failures and the fix for each.
- [ ] When would you not use an agent?
## Day 58 — Agent or workflow? Tool schemas, stop conditions, budgets, MCP 🎮 Level 58
> 🎯 **Cutoff target:** a written rule for agent vs fixed workflow, an allow-listed tool registry, hard budgets that stop the agent, and a clear explanation of MCP.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 57, yesterday: When would you not use an agent?
- [ ] Day 55, 3 days back: How is an eval gate in CI the same idea as a data-quality gate?
- [ ] Day 51, a week back: What metadata do you attach and what does each enable?
- [ ] Day 44, 2 weeks back: Explain self-attention in 60 seconds, aloud.
- [ ] Day 28, a month back: Describe what a table format adds on top of Parquet in three sentences.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** A **workflow** fixes the steps in code and uses the model inside individual steps. An **agent** lets the model choose the steps. Default to the simplest thing that works: one call → a fixed workflow (chain, routing, parallel steps) → an agent only when the path cannot be known ahead of time. A production agent needs typed **tool schemas** with clear descriptions, an **allow-list** of tools, **stop conditions** (final answer, maximum steps, tokens, dollars and wall-clock time), errors returned to the model once and then surfaced, and a trace of every step. **MCP** (Model Context Protocol) is an open standard for exposing tools and data to LLM apps through servers, so one tool implementation works across many clients.
**🔀 Alternatives & when to pick them.**
- **Single call** — if one prompt solves it, stop here.
- **Fixed workflow** — prompt chaining, routing, parallel calls, an evaluator loop: predictable, cheaper, easier to test.
- **Agent loop** — only for open-ended tasks.
- **Multi-agent** — usually avoid until a single agent has failed on a measured task.
- **Your own thin loop vs a framework** — a framework saves time on state and tracing; a thin loop is easier to read.
**🚧 Roadblock → fix.** Agents that loop forever, burn money, or call the wrong tool with confident arguments. Fix: hard budgets (steps, tokens, dollars, seconds), tool descriptions with examples and typed arguments, validation on both arguments and results, and an explicit "I cannot do this" exit. Second wall: debugging blind. Trace every step (Day 59).
**💡 Key ideas / hints.**
- Decision rule: can you draw the steps in advance? Then it is a workflow.
- Tools are read-only and idempotent by default; put writes behind a confirmation or an approval step.
- Every tool returns structured results and structured errors.
- MCP separates tool providers (servers) from LLM apps (clients).
**📚 Read (what + how).**
- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — **extract:** workflow patterns vs agents and when each fits.
- [Model Context Protocol — introduction](https://modelcontextprotocol.io) — **extract:** what a server, a client and a tool are.
**🎮 Build & save (the real test).**
In `llm-lab/agent/` (or your Day 57 repo):
- [ ] `docs/agent-vs-workflow.md`: your decision rule plus four scenarios, each answered "single call, workflow or agent" with a reason
- [ ] a tool registry with Pydantic argument schemas and an allow-list; any other tool call is rejected
- [ ] budgets enforced in code (6 steps, 4k output tokens, $0.05, 30 seconds) that return a clear `BudgetExceeded` result
- [ ] tests with a scripted fake model: one that loops forever stops at the budget; one that calls a tool not on the list is rejected; a tool error gets one retry then a graceful message
- [ ] (stretch, 15 min) expose the read-only SQL tool as an MCP server and call it from a client
**Commit** (`day58: agent budgets + tool registry`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1581 — Customer Who Visited but Did Not Make Any Transactions](https://leetcode.com/problems/customer-who-visited-but-did-not-make-any-transactions/) — anti-join, then count
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the decision rule and four scenarios are written
- [ ] all three budget and allow-list tests pass
- [ ] you can explain MCP in two sentences ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Agent or workflow: what is your rule, and what does each cost you?
- [ ] List four stop conditions a production agent needs.
- [ ] What problem does MCP solve?
## Day 59 — LLM observability: tracing, tokens, cost 🎮 Level 59
> 🎯 **Cutoff target:** every `/ask` call produces a trace (prompt, retrieved context, tokens, latency, cost) you can inspect, and you can find the slowest and most expensive step.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 58, yesterday: Agent or workflow: what is your rule, and what does each cost you?
- [ ] Day 56, 3 days back: No notes, 2 min: walk the RAG lifecycle — chunk → embed → retrieve → rerank → generate → eval → serve → iterate. Name the dominant failure + the metric that catches it at each stage.
- [ ] Day 52, a week back: RAG vs fine-tuning — which for fresh facts, which for behavior, and why?
- [ ] Day 45, 2 weeks back: Why is LoRA cheaper than full fine-tuning?
- [ ] Day 29, a month back: How does an incremental model avoid double-counting late rows?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** LLM tracing records each step of a generation/agent run — the prompt, retrieved chunks, tool calls, token counts, latency, and cost — so you can debug *why* an answer was bad and *what* it cost. Engineers need it because LLM apps fail in opaque ways (bad retrieval? bad prompt? wrong tool?) and cost/latency are real production concerns. This is distributed tracing (OpenTelemetry, Day 14) specialized for LLMs, and it's how you operate the Day 56 RAG service.
**🔀 Alternatives & when to pick them.** Langfuse → open-source, self-hostable, great traces + cost + eval hooks (recommended). Arize Phoenix → strong on eval + embedding-drift visualization, open. LangSmith → tight LangChain integration (managed). Plain OpenTelemetry → vendor-neutral but you build the LLM-specific views. Pick Langfuse for self-hosting + your privacy-first leaning.
**🚧 Roadblock → fix.** The trap: logging full prompts/responses with **PII or secrets** into a trace store → a compliance problem. Fix: redact/mask sensitive fields, sample high-volume traces, and scope retention. Second gotcha: tracing overhead on the hot path → trace async/sampled, never block the response on writing a trace.
**💡 Key ideas / hints.** A trace = nested spans (retrieve → rerank → generate), each with metadata (tokens, cost, latency). Tie a trace id to your structured logs (Day 14) so one request is debuggable end-to-end. Cost-per-request is a first-class metric now.
**📚 Read (what + how).** [Langfuse — Get Started + Tracing](https://langfuse.com/docs) — **extract:** spans/generations, how to wrap a RAG call, cost + latency capture.
**🎮 Build & save (the real test).**
- [ ] instrument `/ask` with Langfuse (self-hosted with docker) or Phoenix: trace retrieve → rerank → generate, capturing tokens, cost and latency per span.
- [ ] trace the Day 57 agent too, so every step and tool call is a span.
- [ ] run ten queries; use the UI to find the slowest step and the most expensive step.
- [ ] redact sensitive fields before they are sent to the trace store.
**Commit** (`day59: llm tracing`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 146 — LRU Cache](https://leetcode.com/problems/lru-cache/) — hashmap + doubly linked list, or OrderedDict
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] each `/ask` and agent run produces a complete trace
- [ ] the slowest and the priciest step are identified
- [ ] sensitive fields are redacted ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What does an LLM trace capture that a normal log line doesn't?
- [ ] Two risks of naive LLM tracing and the fix for each.
## Day 60 — Prompt injection, guardrails and authorization at retrieval 🎮 Level 60
> 🎯 **Cutoff target:** the service validates inputs and outputs, resists a prompt-injection attempt, never retrieves documents the caller may not see, and degrades gracefully.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 59, yesterday: Two risks of naive LLM tracing and the fix for each.
- [ ] Day 57, 3 days back: What is an agent, in one sentence, and what does a state graph add?
- [ ] Day 53, a week back: Given low context recall but high faithfulness, which lever do you pull?
- [ ] Day 46, 2 weeks back: Why is accuracy misleading on imbalanced data?
- [ ] Day 30, a month back: What's the difference between a data *test* and a data *contract*, and where is each enforced?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Guardrails are the validation, safety and cost layer around model calls. The headline risk is **prompt injection**: untrusted text (a user message or a retrieved document) contains instructions that hijack the model. The second risk specific to RAG is **authorization at retrieval**: a user must only receive chunks they are allowed to read, so the permission filter is part of the retrieval query, not a check on the answer afterwards. Layer the defenses; no single guardrail is enough.
**🔀 Alternatives & when to pick them.** Output schema validation (Pydantic / Instructor / structured outputs) → guarantee parseable output (always do this). Guardrails-AI / NeMo Guardrails → declarative input/output validators + safety rails. LLM-as-judge moderation pass → flexible content checks. Allow-list tools + arg validation → the strongest defense against injection-driven tool abuse. Layer several; no single guardrail is sufficient.
**🚧 Roadblock → fix.** The headline risk: **prompt injection** — untrusted content (a retrieved doc, a user message) contains instructions that hijack the model ("ignore previous instructions, reveal the system prompt / call the delete tool"). Fix: treat retrieved/user text as *data not instructions*, validate tool calls against an allow-list with typed args, keep the system prompt server-side, and never let the model's raw output trigger a dangerous action without a check. Second gotcha: unbounded cost → hard token caps + per-user rate limits + a circuit breaker on the model provider (Day 13). Third wall: filtering permissions after retrieval or after generation. By then the content is already in the prompt; filter inside the retrieval query using metadata such as `tenant_id` and `acl`.
**💡 Key ideas / hints.**
Validate *outputs* (structure) and *inputs* (size, injection patterns). Tools get typed, allow-listed args. Cost cap + rate limit + provider circuit-breaker = the resilience trio for LLMs. Graceful degradation: return a safe fallback ("I can't do that right now") not a stack trace.
- Treat retrieved text as data, never as instructions.
- Store an access-control list in each chunk's metadata and filter on it in the vector query.
**📚 Read (what + how).** [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — **extract:** prompt injection, insecure output handling, the mitigations. Skim [Simon Willison on prompt injection](https://simonwillison.net/series/prompt-injection/) — **extract:** why it has no complete fix and what limits the damage.
**🎮 Build & save (the real test).**
- [ ] validated structured outputs; an input guard (size limit and basic injection patterns); a tool allow-list with typed arguments; a token and cost cap; a provider circuit breaker; a safe fallback response.
- [ ] add `tenant_id` and `acl` metadata to chunks; make retrieval filter on the caller's identity.
- [ ] write 6 attack tests: a direct injection ("ignore previous instructions…"), an injection hidden in a retrieved document, an attempt to call a tool outside the allow-list, an oversized input, a cross-tenant question, a request to reveal the system prompt. Confirm each is contained.
**Commit** (`day60: guardrails + retrieval authorization`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] [LC 1321 — Restaurant Growth](https://leetcode.com/problems/restaurant-growth/) — a 7-day moving average over a date spine
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] all six attack tests pass
- [ ] a user from tenant A never receives a tenant B chunk
- [ ] a provider failure returns the safe fallback ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Explain prompt injection and name three mitigations that limit the damage.
- [ ] Why must the permission filter be inside the retrieval query?
- [ ] What is the resilience trio for LLM calls (cap, limit, breaker), and what does each stop?
## Day 61 — Cost and latency: caching, routing, tail latency 🎮 Level 61
> 🎯 **Cutoff target:** a latency and cost budget for one request, with per-stage p50 and p95 timings, a scoped semantic cache and a small-model router, each checked against the eval.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 60, yesterday: What is the resilience trio for LLM calls (cap, limit, breaker), and what does each stop?
- [ ] Day 58, 3 days back: List four stop conditions a production agent needs.
- [ ] Day 54, a week back: Name two judge biases and one way to reduce each.
- [ ] Day 47, 2 weeks back: How do you get reliable structured output from an LLM? List the layers.
- [ ] Day 31, a month back: Why is a database call at the top of a DAG file a problem?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Production LLM apps are judged on cost and **tail latency** (p95, p99), not the average. Measure first: latency per stage (retrieve, rerank, generate), tokens, and cost per request. Then pull levers. **Prompt caching** lets the provider reuse a stable prefix, so put static text first. A **semantic cache** returns a stored answer when a new question embeds close to an old one. **Model routing** sends easy requests to a small cheap model and hard ones to a large model. Also: fewer, tighter chunks, a cap on output tokens, parallel calls, and streaming (which improves perceived latency, not total time).
**🔀 Alternatives & when to pick them.**
- **Exact-match cache vs semantic cache** — exact is safe; semantic has a hit rate but can return a wrong answer.
- **Router by rules vs by a small classifier** — rules first; a classifier when rules stop working. Route by measured eval score, not by gut.
- **Bigger model vs better retrieval** — often better retrieval is cheaper than a bigger model.
- **API vs self-hosted** — self-hosting trades per-token cost for operations work.
**🚧 Roadblock → fix.** A semantic cache that returns a wrong answer, or another user's answer. Fix: a high similarity threshold, a cache key scoped by tenant, permissions and document version, a TTL, invalidation when the index changes, and measured hit quality. Second wall: optimizing the average while p99 times out. Fix: per-stage timeouts, parallel retrieval, and a fallback path.
**💡 Key ideas / hints.**
- p95 is the time that 95% of requests beat; the slowest 5% are what users complain about.
- Track cache hit rate and false-hit rate. Both are metrics.
- A cost budget has a number: cost per request × requests per day.
**📚 Read (what + how).**
- [Anthropic — prompt caching](https://docs.claude.com/en/docs/build-with-claude/prompt-caching) — **extract:** what is cached, the minimum size and the lifetime.
- [Eugene Yan — Patterns for building LLM-based systems](https://eugeneyan.com/writing/llm-patterns/) — **extract:** the caching and guardrails sections.
**🎮 Build & save (the real test).**
In `rag-eval-service`:
- [ ] per-stage timings for retrieve, rerank and generate; run 50 requests; report p50 and p95 per stage
- [ ] an exact cache plus a semantic cache (embedding similarity ≥ 0.95, keyed by tenant, with a TTL); measure hit rate on 20 paraphrase pairs and false-hit rate on 10 near-miss pairs
- [ ] a router: simple questions to a small model, the rest to a large one; compare faithfulness and cost per request with always-large over the golden set
- [ ] one paragraph: your p95 target, your cost per request, and what you cut to reach it
**Commit** (`day61: latency and cost budget`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 981 — Time Based Key-Value Store](https://leetcode.com/problems/time-based-key-value-store/) — hashmap of sorted lists + binary search
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] p50 and p95 per stage are recorded
- [ ] the cache false-hit rate is measured, not assumed
- [ ] the router's quality and cost are compared with the baseline ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Why does p95 matter more than the average?
- [ ] How can a semantic cache be wrong, and how do you scope it?
- [ ] Give three ways to cut cost per request without changing the model.
## Day 62 — Model registry and drift in one day 🎮 Level 62
> 🎯 **Cutoff target:** a small classifier registered in MLflow with a production alias, served at `/predict`, with an Evidently drift report that produces a number you could alert on.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 61, yesterday: Why does p95 matter more than the average?
- [ ] Day 59, 3 days back: Two risks of naive LLM tracing and the fix for each.
- [ ] Day 55, a week back: What guardrails does an LLM endpoint need that a CRUD endpoint does not?
- [ ] Day 48, 2 weeks back: Why keep a hidden hold-out in the eval set?
- [ ] Day 32, a month back: What question does lineage answer in an incident?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** ML platform questions come in four parts: how do you version a model, promote it, roll it back, and know when the data has changed. A **model registry** stores versions with metadata and aliases (such as `production`), so serving loads "the production model" and a rollback is moving an alias. **Drift** means the input data (data drift) or the link between inputs and the label (concept drift) changed, so a once-good model degrades. You detect it by comparing recent data with a reference window, alert on a drift score, and write down the rule that triggers a retrain.
**🔀 Alternatives & when to pick them.**
- **MLflow registry vs a cloud registry (SageMaker, Azure ML, Vertex, Unity Catalog)** — same ideas; pick what your platform already runs.
- **Evidently vs hand-written tests (PSI, KS test)** — a library saves time; know the underlying statistic.
- **Retrain on a schedule vs on drift** — a schedule is simple; drift-triggered retrains need a trustworthy signal.
**🚧 Roadblock → fix.** Alerting on every small drift and teaching everyone to ignore the alert. Fix: pick a few important features, set thresholds from a baseline window, and alert on a sustained shift. Second wall: drift in inputs is not proof the model is worse; if labels arrive later, track real performance too.
**💡 Key ideas / hints.**
- A model signature (input schema) enforces the contract at serve time.
- Rollback = move the alias back; never delete versions you may need.
- Data drift is detectable without labels; performance drift usually needs labels.
**📚 Read (what + how).**
- [MLflow — Model Registry](https://mlflow.org/docs/latest/model-registry.html) — **extract:** register, aliases, load by alias.
- [Evidently docs](https://docs.evidentlyai.com/) — **extract:** reference vs current dataset, a data drift report, extracting a numeric drift score.
**🎮 Build & save (the real test).**
- [ ] reuse your Day 46 synthetic dataset; train a classifier; log it to MLflow with a signature; register v1 and set the `production` alias.
- [ ] `/predict` in FastAPI: load the model by alias; Pydantic input that matches the signature.
- [ ] register a v2, promote it, then roll back by moving the alias; confirm `/predict` changes with no code edit.
- [ ] run an Evidently drift report (training data as reference, a shifted sample as current); extract the drift share as a number and expose it on `/metrics` or as JSON.
- [ ] write the retrain rule in two sentences.
**Commit** (`day62: registry + drift`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] Cold re-solve, timer on (15 min): [LC 196 — Delete Duplicate Emails](https://leetcode.com/problems/delete-duplicate-emails/) — first seen on Day 1. Write it from memory, then compare with your old answer.
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] `/predict` serves the model behind the `production` alias
- [ ] a rollback is one alias change
- [ ] the drift score is exposed as a number and a threshold is chosen ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What does a model registry give you that a folder of pickles does not?
- [ ] Data drift vs concept drift: what is each, and which can you detect without labels?
- [ ] When would you retrain, and what signal triggers it?
## Day 63 — Boss: incident drill, with rollback, replay and a regression test 🎮 Boss Level
> 🎯 **Cutoff target:** a staged incident in your own service: detect it, contain it with a rollback, replay the failed requests, and leave a regression test and a short post-mortem.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 57: What is an agent, in one sentence, and what does a state graph add?
- [ ] Day 58: What problem does MCP solve?
- [ ] Day 59: Two risks of naive LLM tracing and the fix for each.
- [ ] Day 60: Explain prompt injection and name three mitigations that limit the damage.
- [ ] Day 61: Give three ways to cut cost per request without changing the model.
- [ ] Day 62: Data drift vs concept drift: what is each, and which can you detect without labels?
**📖 The concept (what & why engineers use it).** Interviewers ask "tell me about a time something broke," and for AI roles "answers got worse after a deploy — what do you do?" The answer is a procedure: **detect** (alert, metric, eval), **contain** (roll back or flip a flag), **diagnose** (traces, the failing stage), **fix**, **replay** what failed, and **prevent** (a regression test and an alert). Today you practise it end to end, on purpose.
**🎮 Build & save (the real test).**
- [ ] **Break it (10 min):** on a branch `incident-drill`, change something plausible (embedding model, chunk size or a prompt version) so quality drops, and run enough requests to produce bad answers and a few failures logged to a JSONL file.
- [ ] **Detect and diagnose (15 min):** find it from the eval and the traces, not from knowing what you changed; name the failing stage.
- [ ] **Contain (5 min):** roll back by prompt version or alias; confirm recovery.
- [ ] **Replay (10 min):** a tiny script that re-runs the failed requests from the JSONL; confirm they succeed.
- [ ] **Prevent (15 min):** add the failing cases to the golden set as a regression test; write a 10-line post-mortem (impact, timeline, root cause, fix, prevention). **Commit** (`day63: incident drill`).
**🧮 Practice reps (15 min).**
- [ ] Say the incident story aloud in 90 seconds using the STAR shape (situation, task, action, result with a number). You use it again on Day 82.
**✅ Done when:**
- [ ] the failure was found through metrics or traces
- [ ] rollback and replay both worked
- [ ] a regression test and a post-mortem are committed
- [ ] Week 9 retro written ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏔️ **Week 9 complete.** Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Recite the six steps of incident handling in order.
- [ ] Why add the failing case to the eval set before closing the incident?
- [ ] What alert would have caught this earlier?
---
# 📅 Week 10 — Capstone Pt.1: the AI-ready lakehouse, a complete slice
> **One project over 14 days: `ai-ready-lakehouse`.** It joins CDC → Spark Streaming → Iceberg, dbt with a quality gate, a reconciliation "Break" detector, a RAG `/ask` with an eval gate, observability, a self-healing loop and a LangGraph investigation agent. **Tier 1, must (Days 64–70):** ingest, transform, gate, reconcile, `/ask`, tests, dashboard, compose, a one-command run. **Tier 2, should (Days 71–77):** auto-remediation, the agent, tracing, README, a recorded demo. **Tier 3, only if ahead:** medallion layers, chaos injectors, an operator UI. Never start a tier with the previous one unfinished: build complete and ugly first, then make it good.
## Day 64 — Architecture and scaffold the slice 🎮 Level 64
> 🎯 **Cutoff target:** a one-page architecture diagram and a running `docker compose` skeleton where every service starts, even if most endpoints are stubs.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 63, yesterday: What alert would have caught this earlier?
- [ ] Day 61, 3 days back: How can a semantic cache be wrong, and how do you scope it?
- [ ] Day 57, a week back: When would you not use an agent?
- [ ] Day 50, 2 weeks back: What does an embedding actually encode, and why is cosine-similarity ≠ correctness?
- [ ] Day 34, a month back: Which three assumptions did you make today, and where did you write them?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** A capstone fails when it is a pile of notebooks. Start with the boxes: CDC feed → Spark Streaming → Iceberg raw → dbt staging and marts with a quality gate → serving (`/ask`) → Prometheus and Grafana, with reconciliation and the agent hanging off the side. Every box gets one owner file and one health check on day one, so integration is never the surprise at the end.
**🔀 Alternatives & when to pick them.**
- **Everything in one compose file vs several** — one file for a portfolio project; it must start with one command.
- **Medallion naming (bronze, silver, gold) vs raw, staging, mart** — either is fine; be consistent.
- **Real database CDC vs a generator** — a generator that emits insert, update and delete events is enough and is reproducible.
**🚧 Roadblock → fix.** Over-building the scaffold. Fix: stubs are allowed; the only requirement is that every service starts and reports healthy. Second wall: services that start in the wrong order. Use healthchecks and `depends_on: condition: service_healthy`.
**💡 Key ideas / hints.**
- Name the repo `ai-ready-lakehouse`; commit every day, each commit a working stage.
- Folder layout: `ingest/`, `dbt/`, `reconcile/`, `serve/`, `agent/`, `eval/`, `docs/`.
- A `make up`, `make test` and `make demo` from day one.
**📚 Read (what + how).**
- [Docker — Compose healthchecks and startup order](https://docs.docker.com/compose/how-tos/startup-order/) — **extract:** `depends_on` with `service_healthy`.
- Your own Day 28, 31 and 56 repos — **extract:** the pieces you will lift into this one.
**🎮 Build & save (the real test).**
- [ ] `docs/architecture.md`: the diagram (CDC → Spark → Iceberg → dbt → quality gate → serving → Prometheus → Grafana, with reconciliation and the agent attached) and one sentence per box.
- [ ] `docker-compose.yml` with every service and a healthcheck; `docker compose up` brings them all green.
- [ ] a CDC generator script that emits insert, update and delete events for an `orders` stream.
**Commit** (`day64: architecture + compose skeleton`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] Cold re-solve, timer on (15 min): [LC 185 — Department Top Three Salaries](https://leetcode.com/problems/department-top-three-salaries/) — first seen on Day 2. Write it from memory, then compare with your old answer.
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] one command starts every service and they report healthy
- [ ] the diagram and the folder layout match
- [ ] the generator emits all three event types ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Draw the whole system from memory and say what each box does.
- [ ] Why healthchecks before integration?
- [ ] What is the smallest slice that proves the idea?
## Day 65 — Ingest: CDC to Spark Streaming to Iceberg 🎮 Level 65
> 🎯 **Cutoff target:** the generated CDC feed lands in a raw Iceberg table through a running streaming job, and a kill and restart loses nothing and duplicates nothing.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 64, yesterday: Draw the whole system from memory and say what each box does.
- [ ] Day 62, 3 days back: When would you retrain, and what signal triggers it?
- [ ] Day 58, a week back: Agent or workflow: what is your rule, and what does each cost you?
- [ ] Day 51, 2 weeks back: What metadata do you attach and what does each enable?
- [ ] Day 35, a month back: What would you put under "next steps" and why those items?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** This is Day 24 (CDC and MERGE) and Day 27 (streaming and checkpoints) joined. The raw table keeps every event with its operation type and sequence number; later layers decide what the current state is. Keeping the raw log means you can always replay and reconcile.
**🚧 Roadblock → fix.** Losing deletes, or applying out-of-order events. Fix: carry `op` and a monotonically increasing sequence number on every event; later layers pick the latest by sequence, and a delete is a tombstone, not an absence. Second wall: tiny micro-batches creating small files; set a trigger interval and schedule compaction (Day 25).
**🎮 Build & save (the real test).**
- [ ] structured streaming job: generator output → `raw_orders` Iceberg table with `op`, `seq`, `event_ts`, `ingested_at`, and a checkpoint directory.
- [ ] kill and restart the job mid-run; count rows before and after; prove no duplicates and no loss.
- [ ] a maintenance job (compaction + snapshot expiry) scheduled but not yet tuned.
**Commit** (`day65: streaming ingest to iceberg`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 621 — Task Scheduler](https://leetcode.com/problems/task-scheduler/) — greedy or heap; explain the idle-slot formula
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] events land with `op` and `seq`
- [ ] restart yields no duplicates and no loss
- [ ] the maintenance job exists ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Why keep the raw event log instead of only current state?
- [ ] How does a delete travel through the pipeline?
- [ ] What does the checkpoint directory protect, and what breaks if it is lost?
## Day 66 — Transform and the quality gate 🎮 Level 66
> 🎯 **Cutoff target:** dbt builds raw → staging → mart on the Iceberg tables, with tests that block the pipeline on bad data.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 65, yesterday: How does a delete travel through the pipeline?
- [ ] Day 63, 3 days back: Recite the six steps of incident handling in order.
- [ ] Day 59, a week back: Two risks of naive LLM tracing and the fix for each.
- [ ] Day 52, 2 weeks back: RAG vs fine-tuning — which for fresh facts, which for behavior, and why?
- [ ] Day 36, a month back: State CAP correctly (not "2 of 3") and what PACELC adds.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Staging picks the latest event per key (Day 1 dedup by `seq`) and removes deleted keys. The mart is the clean, incremental table consumers use. Tests on keys, accepted values and freshness make the gate: a failed critical test stops the run and quarantines the batch (Day 30).
**🚧 Roadblock → fix.** Tests that warn but do not block, so bad data flows anyway. Fix: error severity on critical tests and a gate task that fails the run. Second wall: the incremental mart drifting from staging after a late event. Test row counts between layers.
**🎮 Build & save (the real test).**
- [ ] `stg_orders` (latest by `seq`, tombstones removed) → `mart_orders` (incremental, merge on key).
- [ ] tests: `not_null` and `unique` on the key, `accepted_values` on status, a `relationships` test to customers, and a freshness check on the source.
- [ ] push a deliberately bad batch; prove the gate fails and the batch is quarantined.
**Commit** (`day66: dbt models + quality gate`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] Cold re-solve, timer on (15 min): [LC 180 — Consecutive Numbers](https://leetcode.com/problems/consecutive-numbers/) — first seen on Day 3. Write it from memory, then compare with your old answer.
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the mart matches the latest state of the raw log
- [ ] a bad batch fails the gate and is quarantined
- [ ] a late event is corrected in the mart ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] How does staging turn an event log into current state?
- [ ] Which tests are critical enough to block, and why?
- [ ] How do you prove the mart has not drifted from staging?
## Day 67 — The reconciliation Break detector 🎮 Level 67
> 🎯 **Cutoff target:** a job compares the lakehouse mart against a source of truth and writes a `breaks` row when they diverge.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 66, yesterday: How do you prove the mart has not drifted from staging?
- [ ] Day 64, 3 days back: Why healthchecks before integration?
- [ ] Day 60, a week back: What is the resilience trio for LLM calls (cap, limit, breaker), and what does each stop?
- [ ] Day 53, 2 weeks back: Define recall@k, MRR and NDCG in one line each. Which one cares about order?
- [ ] Day 37, a month back: How do you detect a hot partition, and what are two fixes?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Sentinel-Lite's idea, now on the lakehouse. Compare the mart with the generator's source of truth on counts, sums and a per-key hash; when they differ, write a `Break(key, kind, source_val, lake_val, detected_at)` row and emit a `breaks_total` metric. The detector is what turns "I think the data is right" into "I can prove it, or I will be told when it is not".
**🚧 Roadblock → fix.** False breaks from comparing at different moments. Fix: compare as of one snapshot (Iceberg time travel) and allow for events still in flight. Second wall: row-by-row comparison on large tables. Compare aggregates first, then drill into the keys that differ.
**🎮 Build & save (the real test).**
- [ ] reconcile at a chosen snapshot: counts, sums, then per-key hashes only for buckets that differ.
- [ ] write `breaks` rows with `kind` (MISSING, EXTRA, DIVERGENT); expose `breaks_total{kind}`.
- [ ] inject a divergence (drop a row, change an amount); confirm exactly that Break appears and no false ones.
**Commit** (`day67: reconciliation break detector`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 57 — Insert Interval](https://leetcode.com/problems/insert-interval/) — three phases: before, overlap, after
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] injected divergences produce exactly the expected Breaks
- [ ] a clean run produces none
- [ ] the metric is exposed ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Why reconcile at a snapshot rather than "now"?
- [ ] Why aggregates first, then keys?
- [ ] How would a false Break cost trust, and how do you prevent it?
## Day 68 — `/ask` over the lakehouse, with the eval gate 🎮 Level 68
> 🎯 **Cutoff target:** `/ask` answers questions about the pipeline (runbooks, table docs, recent Breaks) with citations, and the eval gate from Day 55 runs against it.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 67, yesterday: Why reconcile at a snapshot rather than "now"?
- [ ] Day 65, 3 days back: What does the checkpoint directory protect, and what breaks if it is lost?
- [ ] Day 61, a week back: Why does p95 matter more than the average?
- [ ] Day 54, 2 weeks back: Why can you not trust an LLM judge you have not calibrated?
- [ ] Day 38, a month back: Why is exactly-once *delivery* impossible, and how do you get exactly-once *processing*?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Reuse your Day 52–55 code. The corpus is now the pipeline's own documentation, runbooks and Break history: "why did order 1042 break last night?" The point is not a new RAG system but wiring the existing one into the capstone with the same discipline: citations, a golden set and a gate.
**🚧 Roadblock → fix.** Re-implementing instead of reusing. Import the code from `rag-eval-service` or copy it with its tests. Second wall: a golden set about the wrong thing. Write 15 questions an operator would ask and the documents that answer them.
**🎮 Build & save (the real test).**
- [ ] ingest the runbooks, table docs and a summary of recent Breaks into pgvector (idempotent, with metadata).
- [ ] `/ask` with citations, a timeout and the Day 60 guardrails.
- [ ] 15 operator questions in a golden set; recall@5 and faithfulness recorded; the CI gate runs.
**Commit** (`day68: rag over the lakehouse`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] Cold re-solve, timer on (15 min): [LC 1174 — Immediate Food Delivery II](https://leetcode.com/problems/immediate-food-delivery-ii/) — first seen on Day 4. Write it from memory, then compare with your old answer.
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] operator questions are answered with citations
- [ ] the golden set and thresholds exist and the gate runs
- [ ] an out-of-scope question is declined ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What is the corpus, and why is it a good RAG fit?
- [ ] Which metric would catch a stale runbook?
- [ ] Why reuse the earlier service instead of rewriting?
## Day 69 — Real tests: pytest, Hypothesis, dbt and the eval gate 🎮 Level 69
> 🎯 **Cutoff target:** the repo has a real test suite: unit tests, a property test, dbt tests and the eval gate, all runnable with `make test`.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 68, yesterday: Which metric would catch a stale runbook?
- [ ] Day 66, 3 days back: How does staging turn an event log into current state?
- [ ] Day 62, a week back: Data drift vs concept drift: what is each, and which can you detect without labels?
- [ ] Day 55, 2 weeks back: Why run the cheap retrieval metrics on every PR and the expensive judge eval less often?
- [ ] Day 39, a month back: How does pull-based consumption give backpressure "for free"? (tie to the generators from Day 10)
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Tests are what let you change a system you are proud of. Unit tests cover logic, a property test covers an invariant for many inputs (for example "applying a batch twice equals applying it once"), dbt tests cover the data, and the eval gate covers the AI. Put them behind one command and run them in CI.
**🚧 Roadblock → fix.** A slow or flaky suite that nobody runs. Fix: fast unit tests by default, slower integration tests behind a marker, the real-model eval on a schedule or label. Second wall: tests that need the whole stack up. Use small fixtures and fake clients.
**🎮 Build & save (the real test).**
- [ ] pytest unit tests for the reconciliation logic and the generator.
- [ ] a Hypothesis property: reconciling the same state twice yields the same Breaks; applying a batch twice changes nothing.
- [ ] `make test` runs unit + property + dbt tests; the eval gate runs in CI.
- [ ] a GitHub Action runs `make test` on every push.
**Commit** (`day69: test suite + ci`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 994 — Rotting Oranges](https://leetcode.com/problems/rotting-oranges/) — multi-source BFS
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] `make test` passes from a clean checkout
- [ ] one Hypothesis property exists and passes
- [ ] CI is green ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Name the four kinds of test in this repo and what each guards.
- [ ] What invariant did your property test state?
- [ ] How do you keep the suite fast?
## Day 70 — Boss: slice review, one command, Tier 1 sign-off 🎮 Boss Level
> 🎯 **Cutoff target:** one command runs the whole slice, and one record provably travels CDC → Iceberg → dbt → gate → reconcile → `/ask` and shows on the dashboard.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 64: Why healthchecks before integration?
- [ ] Day 65: Why keep the raw event log instead of only current state?
- [ ] Day 66: How do you prove the mart has not drifted from staging?
- [ ] Day 67: Why aggregates first, then keys?
- [ ] Day 68: What is the corpus, and why is it a good RAG fit?
- [ ] Day 69: How do you keep the suite fast?
**📖 The concept (what & why engineers use it).** Tier 1 is done by a written checklist, not by feeling. Today you prove the slice end to end, write down what is stubbed, and pick the Tier 2 scope in order.
**🎮 Build & save (the real test).**
- [ ] **Demo script (30 min):** `make up` then `make demo`: a record lands in Iceberg and appears in the mart; a bad record trips the gate; an injected divergence creates a Break; `/ask` explains it; the dashboard shows it. Fix whatever breaks.
- [ ] **Sign-off (15 min):** `docs/slice-status.md`: works, stubbed, known issues. Tick each Tier 1 item.
- [ ] **Plan Week 11 (10 min):** order the Tier 2 items (heal loop, agent, tracing, README, demo). **Commit** (`day70: tier 1 complete`).
**🧮 Practice reps (15 min).**
- [ ] Closed book, 10 minutes: explain the pipeline end to end in 2 minutes as if to an interviewer, then check it against `docs/architecture.md`.
**✅ Done when:**
- [ ] a single command runs the whole slice
- [ ] every Tier 1 item is ticked or listed as a known gap
- [ ] the Tier 2 order is written
- [ ] Week 10 retro written ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏔️ **Week 10 complete.** Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Walk one record from the generator to the dashboard, naming the table at each hop.
- [ ] What is stubbed, and what is your plan for it?
---
# 📅 Week 11 — Capstone Pt.2: self-healing, the agent, then ship
> **Goal:** the project is public, self-healing and demoed. A stranger can run it, watch a Break appear, watch it repair itself, and read how in a README that makes the point in 90 seconds.
## Day 71 — The self-healing auto-remediation loop 🎮 Level 71
> 🎯 **Cutoff target:** when reconciliation finds a Break, the system repairs it automatically, re-checks that the Break is gone, and records every action.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 70, yesterday: Walk one record from the generator to the dashboard, naming the table at each hop.
- [ ] Day 68, 3 days back: Why reuse the earlier service instead of rewriting?
- [ ] Day 64, a week back: Draw the whole system from memory and say what each box does.
- [ ] Day 57, 2 weeks back: Name the two classic agent failures and the fix for each.
- [ ] Day 41, a month back: Name three deep dives for a batch warehouse and one failure mode each.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** The control loop from Day 40 and Sentinel-Lite made real: **observe** (the Break), **decide** (re-pull the source slice, re-run the MERGE, or quarantine), **act** idempotently, **verify** (re-reconcile), **record** (an audit row and a metric). The system corrects itself without a person, and says what it did.
**🚧 Roadblock → fix.** Auto-fixes that hide a systemic bug. Fix: every repair emits a metric and an audit row, and a repeated-break detector escalates to a human. Second wall: a fix that double-applies. Key it on the natural id so a re-run is a no-op. Third: a loop that never converges. Cap attempts, then quarantine and alert.
**💡 Key ideas / hints.**
- Decision table: failure kind → action → idempotency key → verification.
- Cap attempts; escalate after N repeats of the same Break.
- Every action writes `remediation_log(break_id, action, outcome, ts)`.
**🎮 Build & save (the real test).**
- [ ] the decision table in `docs/healing.md`.
- [ ] a remediator that handles MISSING, EXTRA and DIVERGENT Breaks idempotently, then re-reconciles to confirm the Break is gone.
- [ ] `remediation_log` rows and `repairs_total{kind,outcome}`; a repeated-break escalation after 3 attempts.
- [ ] inject all three Break kinds and watch them heal.
**Commit** (`day71: self-healing loop`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 133 — Clone Graph](https://leetcode.com/problems/clone-graph/) — map old node to new node
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] all three Break kinds heal without a person
- [ ] each repair is logged and counted
- [ ] a stubborn Break escalates instead of looping ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Say the control loop in five words and what each step guards against.
- [ ] How do you stop auto-remediation from masking a real bug?
- [ ] Why must the repair be idempotent?
## Day 72 — The LangGraph agent that investigates a Break 🎮 Level 72
> 🎯 **Cutoff target:** an agent takes an escalated Break, gathers context with tools, and returns a structured report with evidence and a suggested fix; it never executes a destructive change itself.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 71, yesterday: How do you stop auto-remediation from masking a real bug?
- [ ] Day 69, 3 days back: Name the four kinds of test in this repo and what each guards.
- [ ] Day 65, a week back: How does a delete travel through the pipeline?
- [ ] Day 58, 2 weeks back: What problem does MCP solve?
- [ ] Day 42, a month back: Explain exactly-once processing to an interviewer in 60 seconds.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** The human-in-the-loop half of self-healing. For Breaks the loop cannot fix, an agent uses read-only tools (query `breaks` and `remediation_log`, fetch recent run logs, sample the offending rows, search the runbooks with RAG) and writes a report: what likely happened, the evidence, the suggested action. It proposes; a person approves.
**🚧 Roadblock → fix.** A confident, wrong cause. Fix: every claim in the report must cite tool output; no citation, no claim. Second wall: runaway cost. Use the Day 58 budgets and allow-list. Third: tool-argument errors; validate arguments with Pydantic.
**🎮 Build & save (the real test).**
- [ ] LangGraph agent with read-only tools: `query_breaks`, `recent_runs`, `sample_rows`, `search_runbooks`.
- [ ] output schema: `{break_id, likely_cause, evidence[], suggested_action, confidence}`; reject any claim without evidence.
- [ ] Day 58 budgets and allow-list enforced; traces enabled (Day 59).
- [ ] run it on three escalated Breaks; read each report and mark it right, partly right or wrong.
**Commit** (`day72: investigate-the-break agent`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] Cold re-solve, timer on (15 min): [LC 1070 — Product Sales Analysis III](https://leetcode.com/problems/product-sales-analysis-iii/) — first seen on Day 5. Write it from memory, then compare with your old answer.
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] each report cites tool output
- [ ] budgets stop a runaway run in a test
- [ ] three Breaks are investigated and graded ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Why does the agent propose rather than execute?
- [ ] How do you stop an agent from inventing a cause?
- [ ] Which two budgets do you enforce first?
## Day 73 — Observability: metrics, logs, traces, dashboard, alerts 🎮 Level 73
> 🎯 **Cutoff target:** every stage emits structured logs and metrics, one trace id follows a record through the system, and the dashboard tells the whole story at a glance.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 72, yesterday: Which two budgets do you enforce first?
- [ ] Day 70, 3 days back: Walk one record from the generator to the dashboard, naming the table at each hop.
- [ ] Day 66, a week back: How do you prove the mart has not drifted from staging?
- [ ] Day 59, 2 weeks back: Two risks of naive LLM tracing and the fix for each.
- [ ] Day 43, a month back: What happens when a conversation exceeds the context window?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** You cannot operate or heal what you cannot see. Give each stage structured logs and metrics (throughput, lag, breaks, repairs, gate failures, `/ask` latency, eval score), propagate one trace id from ingest to reconcile to `/ask` with OpenTelemetry, and build a dashboard whose first row answers "is it healthy right now?".
**🚧 Roadblock → fix.** A dashboard of everything and answers to nothing. Fix: four questions per panel group (is data flowing, is it correct, is it healing, is AI answering well) and an alert for each. Second wall: high-cardinality labels (a record id as a metric label) that blow up storage.
**🎮 Build & save (the real test).**
- [ ] structured logs with a shared `trace_id` in every stage.
- [ ] metrics: ingest lag, gate failures, `breaks_total`, `repairs_total`, `/ask` p95, eval score.
- [ ] Grafana dashboard (committed JSON), at least 6 panels grouped by the four questions.
- [ ] two alerts (for example breaks unrepaired for 10 minutes, `/ask` p95 above target) and a test that fires one.
**Commit** (`day73: observability`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 128 — Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/) — set, start only at sequence heads
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] one trace id follows a record across stages
- [ ] the dashboard answers the four questions
- [ ] an alert fires on a staged failure ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What are the four questions your dashboard answers?
- [ ] Why is a record id a bad metric label?
- [ ] How does a trace id help in an incident?
## Day 74 — Harden: properties on the heal loop, and polish each part 🎮 Level 74
> 🎯 **Cutoff target:** the healing loop is property-tested (it always converges or escalates, and never double-applies), and each capability moves from "works" to "good".
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 73, yesterday: What are the four questions your dashboard answers?
- [ ] Day 71, 3 days back: Why must the repair be idempotent?
- [ ] Day 67, a week back: Why reconcile at a snapshot rather than "now"?
- [ ] Day 60, 2 weeks back: Why must the permission filter be inside the retrieval query?
- [ ] Day 44, a month back: What is the KV cache, and what is the difference between prefill and decode?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Hardening is a short list, not a vibe. Test the invariant that matters most (a repair is idempotent, and the loop ends in repair or escalation), then walk each capability and fix the one rough edge a reviewer would hit first: an unclear error, a missing default, a slow query, a flaky test.
**🚧 Roadblock → fix.** Polishing everything and finishing nothing. Fix: for each capability write the single worst edge, fix only that, and move on. Second wall: new features sneaking in. Tier 2 is frozen at this point.
**🎮 Build & save (the real test).**
- [ ] Hypothesis properties: applying a repair twice equals once; the loop terminates with repaired or escalated for any generated Break sequence.
- [ ] for ingest, dbt, reconciliation, `/ask`, the agent and the dashboard: write the worst rough edge and fix it.
- [ ] run the demo from a clean clone and note every stumble; fix the top three.
**Commit** (`day74: hardening`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] Cold re-solve, timer on (15 min): [LC 1164 — Product Price at a Given Date](https://leetcode.com/problems/product-price-at-a-given-date/) — first seen on Day 6. Write it from memory, then compare with your old answer.
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] both properties pass over many generated cases
- [ ] six rough edges are fixed
- [ ] a clean clone runs the demo ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] State the two invariants you test on the healing loop.
- [ ] Why freeze features before the README?
- [ ] What was the worst stumble in the clean-clone run?
## Day 75 — README and the architecture story 🎮 Level 75
> 🎯 **Cutoff target:** a README a hiring manager understands in 90 seconds: the problem, the diagram, the numbers, and how to run it.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 74, yesterday: Why freeze features before the README?
- [ ] Day 72, 3 days back: Why does the agent propose rather than execute?
- [ ] Day 68, a week back: Which metric would catch a stale runbook?
- [ ] Day 61, 2 weeks back: Give three ways to cut cost per request without changing the model.
- [ ] Day 45, a month back: Prompting, RAG, fine-tuning: how do you choose? Give a one-line rule for each.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** The README is the product. In order: one sentence on the problem, the diagram, what is distinctive (self-healing, an eval gate, reconciliation), numbers (eval table, p95, breaks repaired), how to run it in under five commands, design decisions with trade-offs, and known limits. A reader who stops after 90 seconds should still know why it is good.
**🚧 Roadblock → fix.** A README that lists features instead of telling a story. Fix: write the 90-second version first; everything else goes below the fold. Second wall: claims with no numbers. Put the eval table and one reconciliation result at the top.
**🎮 Build & save (the real test).**
- [ ] the 90-second top section, then diagram, eval and reliability numbers, quick start, decisions and trade-offs, limits.
- [ ] `docs/decisions.md`: five decisions in the form "we chose X over Y because Z".
- [ ] give the README to someone (or reread it cold tomorrow) and note where they stop reading.
**Commit** (`day75: readme + decisions`).
**🧮 Practice reps (15 min).** One timed rep: say the trigger, the pattern and the complexity before you code.
- [ ] [LC 973 — K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/) — max-heap of size k
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] the top 90 seconds state problem, picture and proof
- [ ] five decisions are written with their trade-offs
- [ ] quick start works from a clean checkout ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Say the 90-second pitch aloud without notes.
- [ ] Which decision would you defend first, and what is the trade-off?
- [ ] What are the known limits, said honestly?
## Day 76 — Record the demo and dry-run the deep dive 🎮 Level 76
> 🎯 **Cutoff target:** a polished 8–10 minute recording that lands the self-healing moment, and answers prepared for the project deep dive.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 75, yesterday: What are the known limits, said honestly?
- [ ] Day 73, 3 days back: Why is a record id a bad metric label?
- [ ] Day 69, a week back: How do you keep the suite fast?
- [ ] Day 62, 2 weeks back: What does a model registry give you that a folder of pickles does not?
- [ ] Day 46, a month back: Fraud alerts: precision or recall, and why?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Two audiences: a viewer who watches a recording, and an interviewer who asks about the project for 30 minutes. The recording has a script: problem, architecture, the money shot (inject a Break, watch it heal, show the audit row and the dashboard), the eval gate, and what you would do next. The deep dive is a list of hard questions you answer out loud.
**🚧 Roadblock → fix.** A demo that spends five minutes on setup. Fix: start with the result, then show how. Second wall: only rehearsing the happy path. Practise the questions where you admit what is weak.
**🎮 Build & save (the real test).**
- [ ] write the script (problem 30 s, architecture 90 s, the heal demo 3 min, eval gate 90 s, next steps 60 s) and record it; re-record only the weakest section.
- [ ] write answers for 10 deep-dive questions: biggest trade-off, what failed, what you would change, how you measured quality, how it scales, what happens when a dependency is down, how you handle PII, how you would test it, why these tools, what you would cut.
- [ ] say five of them aloud against a timer (2 minutes each).
**Commit** (`day76: demo + deep-dive answers`).
**🧮 Practice reps (15 min).** One timed rep. No hints until the timer ends.
- [ ] Cold re-solve, timer on (15 min): [LC 601 — Human Traffic of Stadium](https://leetcode.com/problems/human-traffic-of-stadium/) — first seen on Day 8. Write it from memory, then compare with your old answer.
- [ ] Write the slip or trap that cost you time in `error-log.md` (one line). It feeds the next review.
**✅ Done when:**
- [ ] a recording under 10 minutes exists
- [ ] ten deep-dive answers are written
- [ ] five were said aloud and timed ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What is the money shot of the demo, and why does it come early?
- [ ] Answer "what failed and what did you learn?" in 90 seconds.
- [ ] How does the system behave when Iceberg storage is unreachable?
## Day 77 — Boss: ship it 🎮 Boss Level
> 🎯 **Cutoff target:** the capstone is public, green in CI, documented and demoed; the 11-week build is done.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 71: Why must the repair be idempotent?
- [ ] Day 72: How do you stop an agent from inventing a cause?
- [ ] Day 73: What are the four questions your dashboard answers?
- [ ] Day 74: What was the worst stumble in the clean-clone run?
- [ ] Day 75: Which decision would you defend first, and what is the trade-off?
- [ ] Day 76: What is the money shot of the demo, and why does it come early?
**📖 The concept (what & why engineers use it).** Shipping is a checklist. Today you run it, then you stop building. From tomorrow the work is converting this into interview performance.
**🎮 Build & save (the real test).**
- [ ] **Checklist (30 min):** clean clone runs `make up` and `make demo`; CI green; README top section final; license; no secrets in history; the recording linked; repo description and topics set.
- [ ] **Tag a release (5 min):** `v1.0.0`, with release notes of five lines.
- [ ] **Publish (10 min):** make the repo public and pin it; add it to your resume and profile with one line and one number.
- [ ] **Retro (10 min):** `retro-capstone.md`: what worked, what you would cut, what surprised you. **Commit** (`day77: ship ai-ready-lakehouse`).
**🧮 Practice reps (15 min).**
- [ ] Closed book, 10 minutes: list the five hardest questions about the capstone and a one-line answer to each.
**✅ Done when:**
- [ ] the repo is public with CI green and a tagged release
- [ ] no secrets or data in history
- [ ] the capstone line is on your resume and profile
- [ ] Week 11 retro written ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🚢 **Capstone shipped.** Claim the big reward. Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] The 30-second version of the capstone, aloud.
- [ ] The one number that proves it works.
---
# 📅 Week 12 — Mocks and Conversion: turn the build into interviews
> **Phase goal:** performance, not content. Seven days of timed mocks in the formats you will meet: a coding and SQL screen, a data system design round, an AI system design round with a project deep dive, an AI-assisted coding round, behavioral stories, a full back-to-back loop, and a retro that sets a sustainable cadence. After each mock, score it, log the misses in `error-log.md`, and let the review step bring them back.
## Day 78 — Mock 1: coding screen plus SQL speed set 🎮 Level 78
> 🎯 **Cutoff target:** one 25-minute coding problem and three SQL problems (about 8 minutes each) done aloud against the clock, scored with the talk-track.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 77, yesterday: The one number that proves it works.
- [ ] Day 75, 3 days back: Say the 90-second pitch aloud without notes.
- [ ] Day 71, a week back: How do you stop auto-remediation from masking a real bug?
- [ ] Day 64, 2 weeks back: What is the smallest slice that proves the idea?
- [ ] Day 48, a month back: How do you test an LLM feature? Name the two kinds of test and what each guards.
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Phone screens combine a coding problem and a few SQL problems in about an hour. Interviewers watch your process: restate, clarify edge cases, brute force first, name the bottleneck, optimize, code while narrating, trace an example, then talk scale. Speed matters in SQL: state the grain, write the skeleton, then fill in.
**🚧 Roadblock → fix.** Going silent while thinking, or coding before clarifying. Fix: the save phrases ("let me think out loud about why this is hard", "can I try a small example by hand?"). Second wall: spending 20 minutes on a perfect solution. Get a working one first, then improve.
**💡 Key ideas / hints.**
- Coding talk-track: restate → edge cases → brute force and its cost → bottleneck → improvement → confirm → code → trace → edge cases → scale.
- SQL: grain, joins, filters, aggregates, then window functions; check for NULLs and ties at the end.
- Pick problems from your amber and red patterns in `error-log.md`.
**📚 Read (what + how).**
- Your Day 21 pattern marks and your Day 7 SQL cheat sheet — **extract:** the patterns you rated amber or red.
- [Hello Interview — coding interview preparation](https://www.hellointerview.com) — **extract:** the structure of a screen and how interviewers score it.
**🎮 Build & save (the real test).**
- [ ] **Coding (25 min):** one unseen medium from your weakest pattern; talk the whole time; record audio.
- [ ] **SQL (25 min):** three unseen problems, 8 minutes each, grain stated first; for example [LC 1045](https://leetcode.com/problems/customers-who-bought-all-products/), [LC 1321](https://leetcode.com/problems/restaurant-growth/), [LC 2066](https://leetcode.com/problems/account-balance/) if you have not done them.
- [ ] **Score (5 min):** 0–2 each on clarifying, narration, correctness, complexity stated, testing. Log the misses. **Commit** (`day78: mock 1`).
**🧮 Practice reps (15 min).**
- [ ] Listen to 5 minutes of your recording and write the three filler habits or silences to fix.
**✅ Done when:**
- [ ] one coding and three SQL problems attempted inside the time
- [ ] the five-item score is written
- [ ] misses are in `error-log.md` ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Say the nine-step coding talk-track from memory.
- [ ] What do you do when you are stuck for more than two minutes?
- [ ] Which SQL habit saved you the most time?
## Day 79 — Mock 2: data system design, with the capstone as the case study 🎮 Level 79
> 🎯 **Cutoff target:** one 45-minute data system design done aloud and written, plus a 10-minute pivot that maps any design prompt onto your capstone.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 78, yesterday: Which SQL habit saved you the most time?
- [ ] Day 76, 3 days back: Answer "what failed and what did you learn?" in 90 seconds.
- [ ] Day 72, a week back: Which two budgets do you enforce first?
- [ ] Day 65, 2 weeks back: Why keep the raw event log instead of only current state?
- [ ] Day 49, a month back: Which answer was longest and which was vaguest? What is the rule you will use to shorten it?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Treat the capstone as your portfolio of worked examples. Whatever the prompt (events, a warehouse, a feature pipeline), you can say "I built a version of this" and borrow the structure: ingestion, a raw log, current state, a quality gate, reconciliation, observability. That is stronger than abstract diagrams.
**🚧 Roadblock → fix.** Forcing the capstone into every answer. Use it as an example after you have designed from the requirements, not as the design. Second wall: no numbers. Estimate rows, events per second and storage before you pick a tool.
**💡 Key ideas / hints.**
- Use the frame: requirements → entities → interfaces → high-level design → deep dives → trade-offs.
- Deep dives to rotate: late data, idempotency, backfills, partitioning, schema change, quality, cost, access control.
- One sentence of bridge to the capstone, then move on.
**📚 Read (what + how).**
- Your `designs/` folder and your Day 41 and Day 42 mocks — **extract:** what you scored lowest on.
- Your capstone `docs/architecture.md` — **extract:** three components you can borrow as examples.
**🎮 Build & save (the real test).**
**Prompt:** "Design the data platform for a ride-hailing company: trip events at 5,000 per second, driver and rider data, and near-real-time metrics for operations plus daily reporting for finance."
- [ ] 45 minutes, timer on, aloud and written; numbers first; three deep dives; a failure story per component
- [ ] 10 minutes: for each of your three deep dives write the matching capstone component and one sentence on what you learned building it
**Commit** (`day79: mock 2`).
**🧮 Practice reps (15 min).**
- [ ] Closed book, 8 minutes: re-draw your design from memory and add the one box you forgot.
**✅ Done when:**
- [ ] the design has numbers, three deep dives and failure stories
- [ ] three capstone bridges are written
- [ ] the weakest phase is named ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Recite the frame and the time you give each phase.
- [ ] How do you bring up the capstone without sounding scripted?
- [ ] Which deep dive would you pick first for a streaming prompt, and why?
## Day 80 — Mock 3: AI system design and the project deep dive 🎮 Level 80
> 🎯 **Cutoff target:** one 45-minute AI system design, plus a project deep dive on the capstone answered aloud.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 79, yesterday: Recite the frame and the time you give each phase.
- [ ] Day 77, 3 days back: The one number that proves it works.
- [ ] Day 73, a week back: What are the four questions your dashboard answers?
- [ ] Day 66, 2 weeks back: Which tests are critical enough to block, and why?
- [ ] Day 50, a month back: What does an embedding actually encode, and why is cosine-similarity ≠ correctness?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** AI system design rounds ask for a RAG or agent product with quality, cost and safety constraints, and then probe your own project. The shape: requirements (users, quality bar, latency, cost, data sensitivity) → data and ingestion → retrieval → generation → evaluation → serving and observability → security and access → cost levers → failure modes. In the deep dive they look for honest trade-offs and measurements.
**🚧 Roadblock → fix.** Drawing boxes with no quality bar. Fix: start by asking how success is measured, and put an eval plan in the design. Second wall: ignoring access control and cost. Name both early.
**💡 Key ideas / hints.**
- Always include: an eval plan (golden set, metrics, a gate), a guardrail layer, per-stage latency and cost budgets, an access model.
- Failure stages to name: ingestion, chunking, retrieval, reranking, context assembly, generation.
- Deep dive answers use the shape: the choice, the alternative, the measurement, the result.
**📚 Read (what + how).**
- Your Day 54 debugging notes and Day 60–61 notes — **extract:** failure stages, security and cost levers.
- [Hello Interview — system design delivery framework](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery) — **extract:** the phase order.
**🎮 Build & save (the real test).**
**Prompt:** "Design an internal assistant that answers employee questions over company documents (policies, wikis, tickets) for 5,000 employees, with per-team access control, citations, and a measurable quality bar."
- [ ] **Design (35 min):** aloud and written; include the eval plan, the security model and a cost estimate
- [ ] **Deep dive (20 min):** answer five questions aloud, 3 minutes each: what failed in your capstone, your biggest trade-off, how you measured quality, how it behaves when a dependency is down, what you would change with another month
**Commit** (`day80: mock 3`).
**🧮 Practice reps (15 min).**
- [ ] Pick your weakest of the five deep-dive answers and say it again in 90 seconds.
**✅ Done when:**
- [ ] the design includes an eval plan, security and cost
- [ ] five deep-dive answers were said aloud
- [ ] the weakest answer was redone ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What is the first question you ask in an AI design prompt?
- [ ] List the stages where a RAG answer can go wrong.
- [ ] How do you enforce per-team access in retrieval?
## Day 81 — Mock 4: the AI-assisted coding round 🎮 Level 81
> 🎯 **Cutoff target:** complete a small feature with an AI coding assistant in 45 minutes while showing judgment: plan first, read every diff, verify with tests, catch a planted bug.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 80, yesterday: List the stages where a RAG answer can go wrong.
- [ ] Day 78, 3 days back: Say the nine-step coding talk-track from memory.
- [ ] Day 74, a week back: Why freeze features before the README?
- [ ] Day 67, 2 weeks back: How would a false Break cost trust, and how do you prevent it?
- [ ] Day 51, a month back: What metadata do you attach and what does each enable?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Some companies now run a round where you are allowed, or expected, to use an AI assistant. They are not testing typing speed; they are testing judgment. Good signals: you break the task down before prompting, give the tool precise context, read every change, run the tests, catch wrong or unnecessary code, and keep ownership of the design. Bad signals: pasting the whole prompt and accepting the output, never running anything, and being unable to explain the code afterwards.
**🚧 Roadblock → fix.** Over-delegating. If you cannot explain a line, you cannot ship it. Fix: after each generated chunk, say aloud what it does and why it is right, and run a test. Second wall: the tool makes sweeping edits. Ask for small, scoped changes.
**💡 Key ideas / hints.**
- Plan in comments or a checklist before the first prompt.
- Ask for tests first or alongside; run them after every change.
- Review the diff like a pull request: correctness, edge cases, naming, anything extra.
- Say what you are checking and why; the narration is part of the score.
**📚 Read (what + how).**
- Your own Sentinel-Lite repo — **extract:** a codebase you know well enough to review generated changes.
- Your Day 11 tests — **extract:** how you structure fixtures; reuse them.
**🎮 Build & save (the real test).**
Work in a copy of Sentinel-Lite with the tests passing.
- [ ] **Task (45 min):** add pagination and an idempotency key to the batch endpoint (or a similar change of your choice) using an AI assistant. Before you start, have the assistant seed one subtle bug in a helper (or reread its output for one it makes by accident).
- [ ] **Rules you set for yourself:** plan first; small prompts; read each diff aloud; run the tests after every change; do not accept code you cannot explain.
- [ ] **Score (10 min):** 0–2 each on plan, prompt quality, review, testing, bug caught, explanation. Log the weakest. **Commit** (`day81: mock 4`).
**🧮 Practice reps (15 min).**
- [ ] Write the five rules you will follow in a real AI-assisted round on one index card.
**✅ Done when:**
- [ ] the feature works with tests passing
- [ ] you caught or deliberately looked for a planted bug
- [ ] the six-item score is written ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What do interviewers score in an AI-assisted round, and what do they not?
- [ ] How do you keep ownership of the design while using the tool?
- [ ] What do you do when the assistant produces code you cannot explain?
## Day 82 — Behavioral: the STAR bank and impact stories 🎮 Level 82
> 🎯 **Cutoff target:** six STAR stories written with a number each, rehearsed aloud to 90 seconds or less, and tagged by the trait each one shows.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 81, yesterday: What do you do when the assistant produces code you cannot explain?
- [ ] Day 79, 3 days back: How do you bring up the capstone without sounding scripted?
- [ ] Day 75, a week back: What are the known limits, said honestly?
- [ ] Day 68, 2 weeks back: What is the corpus, and why is it a good RAG fit?
- [ ] Day 52, a month back: RAG vs fine-tuning — which for fresh facts, which for behavior, and why?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Behavioral rounds rarely win an offer alone, but a weak one can sink a strong candidate. Build a bank of six stories in **STAR** shape (Situation 15 s, Task 10 s, Action 45 s, Result with a number 20 s) and tag each by trait (ownership, debugging depth, impact, conflict, ambiguity). Cover: a bug you root-caused, an efficiency win with a figure, an incident you owned end to end, a disagreement you handled, something shipped under ambiguity, and the capstone. If you cannot put a number on a story, go back to logs, tickets or dashboards and find one.
**🚧 Roadblock → fix.** Rambling with no result. The STAR timing forces a clean arc: land the number. Second wall: one story for every question. Tag each story with the traits it shows so you pick the right one per question. If you lack work stories, use the capstone, the take-home drill and the incident drill (Day 63): they are real.
**💡 Key ideas / hints.**
- "I" not "we" for your actions; credit the team for the context.
- A good result has a number (time saved, errors cut, cost reduced) and a lesson.
- Prepare one failure story: what you got wrong, what changed after.
**📚 Read (what + how).**
- Your Day 63 post-mortem, Day 77 retro and Day 35 take-home notes — **extract:** raw material and numbers for stories.
**🎮 Build & save (the real test).**
Use the STAR bank in this card to write your six stories, then:
- [ ] write each in 6–8 sentences with the number; trim to 90 seconds
- [ ] tag each with two traits; check that the six cover at least five traits between them
- [ ] say each aloud once against a timer; record two and listen back
- [ ] list five common questions ("tell me about a time you disagreed…") and assign a story to each
**Commit** (`day82: behavioral stories`).
**🧮 Practice reps (15 min).**
- [ ] Say your strongest story to a mirror or a friend and ask: what was the point?
**✅ Done when:**
- [ ] six stories written with numbers and trait tags
- [ ] each is 90 seconds or less when spoken
- [ ] five questions have an assigned story ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] Tell your strongest debugging story in 90 seconds, ending on the number.
- [ ] Which story answers "tell me about a time you owned something end to end"?
- [ ] What is your failure story and what changed because of it?
## Day 83 — Mock 5: the full loop, back to back 🎮 Level 83
> 🎯 **Cutoff target:** a compressed onsite in one session: coding, system design and behavioral rounds with short breaks, then one combined retro on stamina and the weakest round.
**🔁 Review (15 min, from memory).** Answer each aloud or on paper before you look anything up. A miss goes into `error-log.md` with one line of correction.
- [ ] Day 82, yesterday: Tell your strongest debugging story in 90 seconds, ending on the number.
- [ ] Day 80, 3 days back: How do you enforce per-team access in retrieval?
- [ ] Day 76, a week back: What is the money shot of the demo, and why does it come early?
- [ ] Day 69, 2 weeks back: What invariant did your property test state?
- [ ] Day 53, a month back: Why change one variable at a time against a fixed golden set?
- [ ] Open `error-log.md`, pick the oldest unresolved entry and re-answer it cold.
**📖 The concept (what & why engineers use it).** Onsite loops are long and context switching is part of the test. Today you run three rounds back to back with 5-minute resets, and the lesson is as much about energy as content: when does it dip, what resets you, which round is weakest.
**🚧 Roadblock → fix.** An energy crash mid-loop, or whiplash between formats. Fix: a 2-minute reset ritual between rounds (stand, breathe, reread the cheat-sheet header for the next round type). Plan water, food and a break schedule for the real thing.
**💡 Key ideas / hints.**
- Coding: 20 minutes, one medium or two easy problems, narrate throughout.
- System design: 25 minutes, any prompt not yet used (for example "a feature store for an ML team").
- Behavioral: 10 minutes, four questions, different stories.
- 5-minute reset between rounds.
**📚 Read (what + how).**
- Your three cheat sheets (SQL, distributed systems, LLM) — **extract:** one page to skim before each round.
- Your `error-log.md` — **extract:** your five most repeated misses.
**🎮 Build & save (the real test).**
- [ ] run the three rounds back to back with the timings above; record audio if you can
- [ ] after each round write one line: what went well, what you would change
- [ ] **Retro (10 min):** when did your energy dip, which transition hurt most, which round was weakest, and the one change you will make
**Commit** (`day83: full loop`).
**🧮 Practice reps (15 min).**
- [ ] Fix the weakest round: redo its first 10 minutes now with the change you chose.
**✅ Done when:**
- [ ] all three rounds were completed in one session
- [ ] the combined retro is written
- [ ] one specific change is chosen ✅ checkpoint
**🏆 Reward:** review `+20` · read `+30` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **170 XP**. Streak 🔥.
**🔁 Recall (book closed).**
- [ ] What is your reset ritual between rounds?
- [ ] Which round dipped, and what does that tell you to practise?
- [ ] List the three sheets you skim before an onsite.
## Day 84 — Boss: retro, the cadence and the job-description map 🎮 Boss Level
> 🎯 **Cutoff target:** a written 12-week retro, a sustainable weekly cadence, and a method to turn any job description into a two-hour prep plan.
**🔁 Review (15 min, from memory).** Boss day: one question from each day this week, cold. Say each answer aloud before you check it.
- [ ] Day 78: Say the nine-step coding talk-track from memory.
- [ ] Day 79: Which deep dive would you pick first for a streaming prompt, and why?
- [ ] Day 80: List the stages where a RAG answer can go wrong.
- [ ] Day 81: What do interviewers score in an AI-assisted round, and what do they not?
- [ ] Day 82: What is your failure story and what changed because of it?
- [ ] Day 83: Which round dipped, and what does that tell you to practise?
**📖 The concept (what & why engineers use it).** Day 84 is a milestone, not a finish line: interviews will arrive over the next weeks. Lock in what worked, keep skills warm without burning out, and make prep for a specific company fast. The key tool is the **job-description map**: read the posting, pull out the nouns, and map each to a day and a cheat sheet in this program.
**🎮 Build & save (the real test).**
- [ ] **Retro (20 min):** `retro.md`: biggest wins, what you would do differently, what leveled up, what you built (the repos and the capstone).
- [ ] **Cadence (10 min):** for example 3 practice reps and 1 error-log review a week, 1 mock every two weeks, the capstone kept warm; sustainable indefinitely.
- [ ] **JD map (15 min):** take one real job description; list its top eight requirements; map each to a program day and a cheat sheet; mark any that are gaps and plan a two-hour fix for the biggest.
- [ ] **Before each real interview:** skim the relevant cheat sheets, redo one mock, and review the last 14 days of `error-log.md`. **Commit** (`day84: retro + cadence + jd map`).
**🧮 Practice reps (15 min).**
- [ ] Run the review loop once on a topic from Weeks 1–3 you have not touched in a month; if it is rusty, put it in the cadence.
**✅ Done when:**
- [ ] the retro is written
- [ ] a weekly cadence is defined
- [ ] one job description is mapped to program days
- [ ] resume and profile list the capstone ✅ checkpoint
**🏆 Reward:** review `+20` · build `+50` · practice `+20` · recall `+25` · perfect-day `+25` = **140 XP**. 🏆 **12-WEEK PLAN COMPLETE.** Claim the big final reward. 🔥🔥🔥 Streak 🔥.
**🔁 Recall (boss check, book closed).**
- [ ] Your 2-minute "who I am as an engineer" pitch: what you build, how you check it, and the proof.
- [ ] Which three topics will you review first before your first real interview, and why?
## 🎓 You made it. The whole arc:
> **W1** SQL + modeling · **W2** production Python · **W3** DSA patterns · **W4** lakehouse + Spark · **W5** dbt, Airflow, governance, take-home · **W6** data system design · **W7** LLM fundamentals · **W8** RAG + evals · **W9** agents, LLMOps, security, cost · **W10–11** the self-healing AI-ready lakehouse capstone · **W12** mocks + conversion.
> Six public repos, one standout capstone, and a review habit that keeps it all retrievable. Now go convert it. 🚀
</content>
