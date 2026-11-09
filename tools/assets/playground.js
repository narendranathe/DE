/* Playground: Python (Pyodide) and SQL (DuckDB-WASM), both free and both run in the browser.
   Nothing here talks to a server of ours. Runtimes load from jsDelivr the first time you press RUN.
   Edit PY_VER / DUCK_VER to change versions (check the new version still has pyodide.mjs and the DuckDB bundles).
   Python runs in a module Web Worker, so STOP can end a runaway loop. */
(function () {
  'use strict';

  var PY_VER = '314.0.7', DUCK_VER = '1.32.0';
  var PY_BASE = 'https://cdn.jsdelivr.net/pyodide/v' + PY_VER + '/full/';
  var DUCK_ESM = 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@' + DUCK_VER + '/+esm';
  var KEY = 'daily-executor.playground';
  var ROW_CAP = 500;

  var $ = function (id) { return document.getElementById(id); };
  if (!$('playground')) return;

  /* ------------------------------------------------------------ examples */
  var SEED_SQL = [
    "SELECT setseed(0.42)",
    // customers: NULL regions on purpose, plus newer duplicate rows for about 4% of keys
    "CREATE OR REPLACE TABLE customers AS " +
    "SELECT i AS customer_id, 'customer_' || i AS name, " +
    "CASE WHEN random() < 0.05 THEN NULL ELSE ['NA','EU','APAC','LATAM'][1 + CAST(floor(random()*4) AS INTEGER)] END AS region, " +
    "TIMESTAMP '2025-01-01' + to_days(CAST(random()*300 AS INTEGER)) AS updated_at " +
    "FROM range(1, 2001) t(i)",
    "INSERT INTO customers SELECT customer_id, name, " +
    "CASE WHEN random() < 0.5 THEN 'EU' ELSE region END, updated_at + to_days(20) FROM customers WHERE random() < 0.04",
    // orders: about 1% point at a customer that does not exist
    "CREATE OR REPLACE TABLE orders AS " +
    "SELECT i AS order_id, " +
    "CASE WHEN random() < 0.01 THEN 5000 + CAST(floor(random()*500) AS INTEGER) ELSE 1 + CAST(floor(random()*2000) AS INTEGER) END AS customer_id, " +
    "TIMESTAMP '2025-01-01' + to_minutes(CAST(random()*525600 AS BIGINT)) AS order_ts, " +
    "CAST(round(5 + random()*295, 2) AS DECIMAL(10,2)) AS amount " +
    "FROM range(1, 20001) t(i)",
    "CREATE OR REPLACE TABLE order_items AS " +
    "SELECT o.order_id, n AS line_no, 'sku_' || (1 + CAST(floor(random()*50) AS INTEGER)) AS sku, " +
    "1 + CAST(floor(random()*4) AS INTEGER) AS qty, CAST(round(2 + random()*98, 2) AS DECIMAL(10,2)) AS unit_price " +
    "FROM orders o, range(1, 4) t(n) WHERE n = 1 OR random() < 0.6",
    // events: visits of 1 to 8 events, a few minutes apart, for sessionizing
    "CREATE OR REPLACE TABLE events AS " +
    "WITH visits AS (SELECT u AS user_id, TIMESTAMP '2025-03-01' + to_minutes(CAST(random()*43200 AS BIGINT)) AS visit_start, " +
    "1 + CAST(floor(random()*8) AS INTEGER) AS n_events FROM range(1, 201) a(u), range(1, 6) b(v)), " +
    "ev AS (SELECT user_id, visit_start + to_minutes(CAST(e * random()*12 AS BIGINT)) AS ts FROM visits, range(0, 8) c(e) WHERE e < n_events) " +
    "SELECT row_number() OVER (ORDER BY user_id, ts) AS event_id, user_id, ts, " +
    "['view','click','add_to_cart','purchase'][1 + CAST(floor(random()*4) AS INTEGER)] AS event FROM ev",
    // activity: one row per user per active day, for gaps and islands
    "CREATE OR REPLACE TABLE activity AS " +
    "SELECT u AS user_id, CAST(DATE '2025-03-01' + CAST(d AS INTEGER) AS DATE) AS d FROM range(1, 51) a(u), range(0, 60) b(d) WHERE random() < 0.7"
  ];

  var TABLES_SQL = 'SELECT table_name AS "table", estimated_size AS "rows", column_count AS "columns" FROM duckdb_tables() ORDER BY 1';

  var EX = {
    sql: [
      { label: 'Day 1 · Dedup: latest row per key (ROW_NUMBER)', code:
"-- customers has planted duplicate rows with different updated_at.\n" +
"-- If updated_at can tie, add a unique column to the ORDER BY, or the row you keep is arbitrary.\n" +
"WITH ranked AS (\n" +
"  SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn\n" +
"  FROM customers\n" +
")\n" +
"SELECT customer_id, name, region, updated_at\n" +
"FROM ranked\n" +
"WHERE rn = 1\n" +
"ORDER BY customer_id\n" +
"LIMIT 20;" },
      { label: 'Day 1 · Dedup with QUALIFY', code:
"-- QUALIFY filters on a window function. DuckDB, Snowflake and BigQuery have it; SQL Server and MySQL do not.\n" +
"SELECT customer_id, name, region, updated_at\n" +
"FROM customers\n" +
"QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1\n" +
"ORDER BY customer_id\n" +
"LIMIT 20;" },
      { label: 'Day 1 · Orphan orders: NOT EXISTS vs NOT IN', code:
"-- Three safe ways agree. NOT IN returns 0 as soon as the list holds one NULL.\n" +
"SELECT\n" +
"  (SELECT count(*) FROM orders o WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.customer_id = o.customer_id)) AS not_exists,\n" +
"  (SELECT count(*) FROM orders o LEFT JOIN customers c USING (customer_id) WHERE c.customer_id IS NULL)           AS anti_join,\n" +
"  (SELECT count(*) FROM orders WHERE customer_id NOT IN (SELECT customer_id FROM customers))                     AS not_in,\n" +
"  (SELECT count(*) FROM orders WHERE customer_id NOT IN (SELECT customer_id FROM customers UNION ALL SELECT NULL)) AS not_in_with_a_null;" },
      { label: 'Day 1 · Revenue per region without fan-out', code:
"-- Dedup customers first, then join. Aggregate at the grain the measure lives at.\n" +
"WITH latest AS (\n" +
"  SELECT * FROM customers\n" +
"  QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1\n" +
")\n" +
"SELECT coalesce(c.region, 'UNKNOWN') AS region, count(*) AS orders, sum(o.amount) AS revenue\n" +
"FROM orders o JOIN latest c USING (customer_id)\n" +
"GROUP BY 1\n" +
"ORDER BY revenue DESC;\n" +
"\n" +
"-- Then join order_items as well and SUM(o.amount) again: every order is counted once per item." },
      { label: 'Day 2 · Top 3 per group: ROW_NUMBER vs RANK vs DENSE_RANK', code:
"WITH latest AS (\n" +
"  SELECT * FROM customers\n" +
"  QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1\n" +
"), rev AS (\n" +
"  SELECT coalesce(l.region, 'UNKNOWN') AS region, o.customer_id, sum(o.amount) AS revenue\n" +
"  FROM orders o JOIN latest l USING (customer_id)\n" +
"  GROUP BY 1, 2\n" +
")\n" +
"SELECT region, customer_id, revenue,\n" +
"       ROW_NUMBER() OVER w AS row_num,\n" +
"       RANK()       OVER w AS rnk,\n" +
"       DENSE_RANK() OVER w AS dense_rnk\n" +
"FROM rev\n" +
"WINDOW w AS (PARTITION BY region ORDER BY revenue DESC)\n" +
"QUALIFY rnk <= 3\n" +
"ORDER BY region, revenue DESC;" },
      { label: 'Day 2 · Running total with an explicit ROWS frame', code:
"-- Write the frame. The default (RANGE ... CURRENT ROW) gives tied timestamps the same total.\n" +
"SELECT order_id, order_ts, amount,\n" +
"       SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_ts, order_id\n" +
"                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total\n" +
"FROM orders\n" +
"WHERE customer_id = 42\n" +
"ORDER BY order_ts, order_id;" },
      { label: 'Day 2 · 7-day moving average over a date spine', code:
"WITH spine AS (\n" +
"  SELECT CAST(d AS DATE) AS day\n" +
"  FROM generate_series(DATE '2025-01-01', DATE '2025-12-31', INTERVAL 1 DAY) t(d)\n" +
"), daily AS (\n" +
"  SELECT CAST(order_ts AS DATE) AS day, sum(amount) AS revenue FROM orders GROUP BY 1\n" +
")\n" +
"SELECT s.day, coalesce(d.revenue, 0) AS revenue,\n" +
"       round(avg(coalesce(d.revenue, 0)) OVER (ORDER BY s.day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS avg_7d\n" +
"FROM spine s LEFT JOIN daily d USING (day)\n" +
"ORDER BY s.day\n" +
"LIMIT 30;" },
      { label: 'Day 3 · Sessions with LAG (30-minute timeout)', code:
"WITH flagged AS (\n" +
"  SELECT *, CASE WHEN LAG(ts) OVER w IS NULL OR ts - LAG(ts) OVER w > INTERVAL 30 MINUTE THEN 1 ELSE 0 END AS new_session\n" +
"  FROM events\n" +
"  WINDOW w AS (PARTITION BY user_id ORDER BY ts, event_id)\n" +
"), sessions AS (\n" +
"  SELECT *, SUM(new_session) OVER (PARTITION BY user_id ORDER BY ts, event_id) AS session_id FROM flagged\n" +
")\n" +
"SELECT user_id, session_id, min(ts) AS session_start, max(ts) AS session_end, count(*) AS events\n" +
"FROM sessions\n" +
"GROUP BY 1, 2\n" +
"ORDER BY user_id, session_id\n" +
"LIMIT 30;" },
      { label: 'Day 3 · Gaps and islands: consecutive active days', code:
"-- date minus row_number is constant inside an unbroken run, so group by it.\n" +
"SELECT user_id, min(d) AS streak_start, max(d) AS streak_end, count(*) AS days\n" +
"FROM (\n" +
"  SELECT user_id, d, d - CAST(ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY d) AS INTEGER) AS grp\n" +
"  FROM activity\n" +
")\n" +
"GROUP BY user_id, grp\n" +
"HAVING count(*) >= 3\n" +
"ORDER BY days DESC, user_id\n" +
"LIMIT 20;" },
      { label: 'Day 4 · Idempotent upsert: apply the same batch twice', code:
"CREATE OR REPLACE TABLE dim_customer (\n" +
"  customer_id INTEGER PRIMARY KEY, name VARCHAR, region VARCHAR, updated_at TIMESTAMP\n" +
");\n" +
"\n" +
"-- Dedup the batch first, then upsert. Run this whole script twice: the counts must not change.\n" +
"INSERT INTO dim_customer\n" +
"SELECT customer_id, name, region, updated_at FROM customers\n" +
"QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1\n" +
"ON CONFLICT (customer_id) DO UPDATE SET\n" +
"  name = EXCLUDED.name, region = EXCLUDED.region, updated_at = EXCLUDED.updated_at\n" +
"WHERE EXCLUDED.updated_at > dim_customer.updated_at;\n" +
"\n" +
"SELECT count(*) AS row_count, count(DISTINCT customer_id) AS keys FROM dim_customer;" },
      { label: 'Day 4 · Idempotent upsert with MERGE INTO', code:
"-- MERGE is the form Snowflake, Delta, Iceberg and BigQuery use. Run this twice: nothing changes the second time.\n" +
"CREATE TABLE IF NOT EXISTS dim_customer_m (customer_id INTEGER, name VARCHAR, region VARCHAR, updated_at TIMESTAMP);\n" +
"\n" +
"MERGE INTO dim_customer_m AS t\n" +
"USING (\n" +
"  SELECT customer_id, name, region, updated_at FROM customers\n" +
"  QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1\n" +
") AS s\n" +
"ON t.customer_id = s.customer_id\n" +
"WHEN MATCHED AND s.updated_at > t.updated_at THEN\n" +
"  UPDATE SET name = s.name, region = s.region, updated_at = s.updated_at\n" +
"WHEN NOT MATCHED THEN\n" +
"  INSERT VALUES (s.customer_id, s.name, s.region, s.updated_at);\n" +
"\n" +
"SELECT count(*) AS row_count, count(DISTINCT customer_id) AS keys FROM dim_customer_m;" },
      { label: 'Day 5 · Star schema: state the grain, build the fact', code:
"-- Grain: one row per order line.\n" +
"CREATE OR REPLACE TABLE fact_order_line AS\n" +
"SELECT oi.order_id, oi.line_no, o.customer_id, CAST(o.order_ts AS DATE) AS order_date,\n" +
"       oi.sku, oi.qty, oi.unit_price, oi.qty * oi.unit_price AS line_amount\n" +
"FROM order_items oi JOIN orders o USING (order_id);\n" +
"\n" +
"SELECT order_date, count(*) AS lines, sum(line_amount) AS revenue\n" +
"FROM fact_order_line\n" +
"GROUP BY 1\n" +
"ORDER BY 1\n" +
"LIMIT 10;" },
      { label: 'Day 6 · SCD2 validity windows with LEAD', code:
"-- Customers with more than one version: valid_from, valid_to and an is_current flag.\n" +
"SELECT customer_id, region, updated_at AS valid_from,\n" +
"       coalesce(LEAD(updated_at) OVER w, TIMESTAMP '9999-12-31') AS valid_to,\n" +
"       LEAD(updated_at) OVER w IS NULL AS is_current\n" +
"FROM customers\n" +
"WHERE customer_id IN (SELECT customer_id FROM customers GROUP BY 1 HAVING count(*) > 1)\n" +
"WINDOW w AS (PARTITION BY customer_id ORDER BY updated_at)\n" +
"ORDER BY customer_id, valid_from\n" +
"LIMIT 20;" },
      { label: 'Day 6 · Read a query plan (EXPLAIN ANALYZE)', code:
"-- Compare estimated and actual rows. Look at join type, scans and where the time goes.\n" +
"EXPLAIN ANALYZE\n" +
"SELECT c.region, sum(o.amount)\n" +
"FROM orders o JOIN customers c USING (customer_id)\n" +
"GROUP BY 1;" }
    ],
    py: [
      { label: 'Day 8 · Pydantic: validate at the boundary', code:
"from pydantic import BaseModel, Field, ValidationError\n\n" +
"class Order(BaseModel):\n" +
"    order_id: int\n" +
"    customer_id: int\n" +
"    amount: float = Field(gt=0)\n" +
"    currency: str = \"USD\"\n\n" +
"rows = [\n" +
"    {\"order_id\": 1, \"customer_id\": 7, \"amount\": 19.99},\n" +
"    {\"order_id\": \"2\", \"customer_id\": 8, \"amount\": \"5.5\"},   # strings are coerced\n" +
"    {\"order_id\": 3, \"customer_id\": 9, \"amount\": -4},          # fails: amount must be > 0\n" +
"]\n" +
"for r in rows:\n" +
"    try:\n" +
"        print(\"ok  \", Order(**r))\n" +
"    except ValidationError as e:\n" +
"        print(\"fail\", r[\"order_id\"], \"->\", e.errors()[0][\"msg\"])\n" },
      { label: 'Day 9 · Value object, Protocol, dependency inversion', code:
"from dataclasses import dataclass\n" +
"from typing import Protocol\n\n" +
"@dataclass(frozen=True)\n" +
"class Money:\n" +
"    cents: int\n" +
"    currency: str = \"USD\"\n" +
"    def __add__(self, other: \"Money\") -> \"Money\":\n" +
"        assert self.currency == other.currency\n" +
"        return Money(self.cents + other.cents, self.currency)\n\n" +
"class Fetcher(Protocol):\n" +
"    def fetch(self) -> list[Money]: ...\n\n" +
"class FakeFetcher:\n" +
"    def fetch(self) -> list[Money]:\n" +
"        return [Money(500), Money(250)]\n\n" +
"def total(f: Fetcher) -> Money:\n" +
"    out = Money(0)\n" +
"    for m in f.fetch():\n" +
"        out = out + m\n" +
"    return out\n\n" +
"print(total(FakeFetcher()))   # the code depends on the Protocol, so a test passes a fake\n" },
      { label: 'Day 10 · Decorator, context manager, generator', code:
"import time, functools, contextlib\n\n" +
"def timed(fn):\n" +
"    @functools.wraps(fn)\n" +
"    def wrapper(*a, **k):\n" +
"        t0 = time.perf_counter()\n" +
"        try:\n" +
"            return fn(*a, **k)\n" +
"        finally:\n" +
"            print(f\"{fn.__name__}: {(time.perf_counter() - t0) * 1000:.1f} ms\")\n" +
"    return wrapper\n\n" +
"@contextlib.contextmanager\n" +
"def stage(name):\n" +
"    print(\"start\", name)\n" +
"    try:\n" +
"        yield\n" +
"    finally:\n" +
"        print(\"end  \", name)\n\n" +
"def chunks(it, n):\n" +
"    buf = []\n" +
"    for x in it:\n" +
"        buf.append(x)\n" +
"        if len(buf) == n:\n" +
"            yield buf\n" +
"            buf = []\n" +
"    if buf:\n" +
"        yield buf\n\n" +
"@timed\n" +
"def run():\n" +
"    with stage(\"batch\"):\n" +
"        return sum(sum(c) for c in chunks(range(1_000_000), 10_000))\n\n" +
"print(run())\n" },
      { label: 'Day 11 · pytest: fixtures and parametrize, in the browser', code:
"import pathlib, textwrap\n" +
"import pytest\n\n" +
"pathlib.Path(\"/tmp/test_demo.py\").write_text(textwrap.dedent('''\n" +
"    import pytest\n\n" +
"    def dedup(rows):\n" +
"        latest = {}\n" +
"        for r in rows:\n" +
"            k = r[\"id\"]\n" +
"            if k not in latest or r[\"ts\"] > latest[k][\"ts\"]:\n" +
"                latest[k] = r\n" +
"        return sorted(latest.values(), key=lambda r: r[\"id\"])\n\n" +
"    @pytest.fixture\n" +
"    def rows():\n" +
"        return [{\"id\": 1, \"ts\": 1}, {\"id\": 1, \"ts\": 3}, {\"id\": 2, \"ts\": 2}]\n\n" +
"    def test_keeps_latest(rows):\n" +
"        assert [r[\"ts\"] for r in dedup(rows)] == [3, 2]\n\n" +
"    @pytest.mark.parametrize(\"rows, expected\", [([], []), ([{\"id\": 5, \"ts\": 1}], [5])])\n" +
"    def test_edge_cases(rows, expected):\n" +
"        assert [r[\"id\"] for r in dedup(rows)] == expected\n" +
"'''))\n\n" +
"exit_code = pytest.main([\"-q\", \"-p\", \"no:cacheprovider\", \"/tmp/test_demo.py\"])\n" },
      { label: 'Day 12 · asyncio: sequential vs gather', code:
"import asyncio, time\n\n" +
"async def fetch(i):\n" +
"    await asyncio.sleep(0.2)      # stands in for a network call\n" +
"    return i * i\n\n" +
"async def main():\n" +
"    t0 = time.perf_counter()\n" +
"    seq = [await fetch(i) for i in range(5)]\n" +
"    t1 = time.perf_counter()\n" +
"    par = await asyncio.gather(*(fetch(i) for i in range(5)))\n" +
"    t2 = time.perf_counter()\n" +
"    print(seq == par, f\"sequential {t1 - t0:.2f}s, gather {t2 - t1:.2f}s\")\n\n" +
"await main()\n" },
      { label: 'Day 13 · Retry with exponential backoff and jitter', code:
"import random, time\n\n" +
"def retry(attempts=4, base=0.05):\n" +
"    def deco(fn):\n" +
"        def wrapper(*a, **k):\n" +
"            for n in range(attempts):\n" +
"                try:\n" +
"                    return fn(*a, **k)\n" +
"                except ConnectionError as e:\n" +
"                    if n == attempts - 1:\n" +
"                        raise\n" +
"                    delay = base * 2 ** n * random.uniform(0.5, 1.5)\n" +
"                    print(f\"attempt {n + 1} failed ({e}); sleeping {delay:.3f}s\")\n" +
"                    time.sleep(delay)\n" +
"        return wrapper\n" +
"    return deco\n\n" +
"calls = {\"n\": 0}\n\n" +
"@retry()\n" +
"def flaky():\n" +
"    calls[\"n\"] += 1\n" +
"    if calls[\"n\"] < 3:\n" +
"        raise ConnectionError(\"upstream reset\")\n" +
"    return f\"ok after {calls['n']} calls\"\n\n" +
"print(flaky())\n" },
      { label: 'Day 15 · Hashmap: Two Sum, trigger to approach', code:
"def two_sum(nums, target):\n" +
"    seen = {}                         # value -> index\n" +
"    for i, x in enumerate(nums):\n" +
"        if target - x in seen:        # check the map first, then insert\n" +
"            return seen[target - x], i\n" +
"        seen[x] = i\n\n" +
"print(two_sum([2, 7, 11, 15], 9))     # (0, 1)\n" +
"# trigger: \"two numbers that add to\" -> look for the complement. O(n) time, O(n) space.\n" },
      { label: 'Day 19 · Heap: top-k frequent', code:
"import heapq\n" +
"from collections import Counter\n\n" +
"def top_k(words, k):\n" +
"    counts = Counter(words)\n" +
"    return heapq.nlargest(k, counts.items(), key=lambda kv: (kv[1], kv[0]))\n\n" +
"print(top_k(\"a b a c b a d\".split(), 2))   # [('a', 3), ('b', 2)]\n" +
"# trigger: \"k most / least\" -> heap of size k. O(n log k).\n" },
      { label: 'Day 47 · LLM API contract: validate, repair once, give up', code:
"from pydantic import BaseModel, ValidationError\n\n" +
"class Ticket(BaseModel):\n" +
"    category: str\n" +
"    urgency: int\n" +
"    summary: str\n\n" +
"def fake_model(attempt):                 # stands in for a real model call\n" +
"    return ['{\"category\": \"billing\", \"urgency\": \"high\"}',\n" +
"            '{\"category\": \"billing\", \"urgency\": 3, \"summary\": \"double charge\"}'][attempt]\n\n" +
"def get_ticket(max_repairs=1):\n" +
"    for attempt in range(max_repairs + 1):\n" +
"        raw = fake_model(attempt)\n" +
"        try:\n" +
"            return Ticket.model_validate_json(raw)\n" +
"        except ValidationError as e:\n" +
"            print(f\"attempt {attempt}: invalid ->\", [err[\"loc\"] for err in e.errors()])\n" +
"    raise RuntimeError(\"gave up after repair\")\n\n" +
"print(get_ticket())\n" },
      { label: 'Scratch: install a pure-Python package with a pip line', code:
"# pip: pluggy\n" +
"# A first-line comment of the form  # pip: name1, name2  installs from PyPI with micropip.\n" +
"# (pluggy is bundled, so this one resolves without PyPI. Swap in any pure-Python package.)\n" +
"import pluggy\n" +
"print(pluggy.__name__, pluggy.__version__)\n" }
    ]
  };

  /* ------------------------------------------------------------ state */
  var S = { lang: 'py', code: { py: '', sql: '' }, ex: { py: 0, sql: 0 } };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.code) { S.lang = saved.lang === 'sql' ? 'sql' : 'py'; S.code.py = saved.code.py || ''; S.code.sql = saved.code.sql || ''; }
  } catch (e) {}
  var saveT = null;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify({ lang: S.lang, code: S.code })); } catch (e) {} }, 400);
  }

  var ed = $('pgEd'), out = $('pgOut'), statusEl = $('pgStatus');
  var btnRun = $('pgRun'), btnStop = $('pgStop'), btnSeed = $('pgSeed'), btnTables = $('pgTables');
  var tabPy = $('pgTabPy'), tabSql = $('pgTabSql'), exSel = $('pgEx');
  var busy = false;

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = 'pg-status mono' + (kind ? ' ' + kind : '');
  }

  /* ------------------------------------------------------------ output helpers */
  function clearOut() { resetRaw(); out.innerHTML = ''; }
  // Streamed Python output arrives in small chunks. They are joined here and painted at most every 30 ms.
  var MAX_OUT = 200000, rawEl = null, rawCls = '', rawText = '', rawLen = 0, rawTimer = 0, rawCut = false;
  function paintRaw() {
    if (rawTimer) { clearTimeout(rawTimer); rawTimer = 0; }
    if (rawEl) { rawEl.textContent = rawText.replace(/\n+$/, ''); out.scrollTop = out.scrollHeight; }
  }
  function resetRaw() { paintRaw(); rawEl = null; rawCls = ''; rawText = ''; rawLen = 0; rawCut = false; }
  function addRaw(cls, text) {
    if (rawLen >= MAX_OUT) {
      if (!rawCut) { rawCut = true; paintRaw(); addMeta('OUTPUT CUT OFF AFTER ' + MAX_OUT + ' CHARACTERS'); rawEl = null; }
      return;
    }
    rawLen += text.length;
    if (!rawEl || rawCls !== cls || out.lastElementChild !== rawEl) {
      paintRaw();
      var empty = out.querySelector('.pg-empty'); if (empty) empty.remove();
      rawEl = document.createElement('pre');
      rawEl.className = 'pg-pre' + (cls ? ' ' + cls : '');
      rawCls = cls; rawText = '';
      out.appendChild(rawEl);
    }
    rawText += text;
    if (!rawTimer) rawTimer = setTimeout(paintRaw, 30);
  }
  function placeholder() {
    clearOut();
    var p = document.createElement('div');
    p.className = 'pg-empty';
    p.textContent = 'OUTPUT SHOWS HERE. PRESS RUN OR CTRL/⌘ + ENTER.';
    out.appendChild(p);
  }
  function addPre(cls, text) {
    var empty = out.querySelector('.pg-empty'); if (empty) empty.remove();
    var last = out.lastElementChild;
    if (last && last.tagName === 'PRE' && last.className === 'pg-pre' + (cls ? ' ' + cls : '')) {
      last.textContent += '\n' + text;
    } else {
      var pre = document.createElement('pre');
      pre.className = 'pg-pre' + (cls ? ' ' + cls : '');
      pre.textContent = text;
      out.appendChild(pre);
    }
    out.scrollTop = out.scrollHeight;
  }
  function addMeta(text) {
    var empty = out.querySelector('.pg-empty'); if (empty) empty.remove();
    var m = document.createElement('div');
    m.className = 'pg-meta mono';
    m.textContent = text;
    out.appendChild(m);
  }
  function fmtMs(ms) { return ms < 1000 ? Math.round(ms) + ' MS' : (ms / 1000).toFixed(2) + ' S'; }

  /* ------------------------------------------------------------ tabs, examples, editor */
  function fillExamples() {
    exSel.innerHTML = '';
    var o0 = document.createElement('option');
    o0.value = ''; o0.textContent = 'LOAD AN EXAMPLE…';
    exSel.appendChild(o0);
    EX[S.lang].forEach(function (x, i) {
      var o = document.createElement('option');
      o.value = String(i); o.textContent = x.label;
      exSel.appendChild(o);
    });
    exSel.value = '';
  }
  function setLang(l, keepOut, init) {
    if (!init) S.code[S.lang] = ed.value;      // at boot the editor is still empty, so there is nothing to store
    S.lang = l;
    tabPy.setAttribute('aria-selected', String(l === 'py'));
    tabSql.setAttribute('aria-selected', String(l === 'sql'));
    tabPy.tabIndex = l === 'py' ? 0 : -1;
    tabSql.tabIndex = l === 'sql' ? 0 : -1;
    ed.value = S.code[l] || EX[l][0].code;
    ed.setAttribute('aria-label', (l === 'py' ? 'Python' : 'SQL') + ' code editor');
    btnSeed.hidden = btnTables.hidden = l !== 'sql';
    fillExamples();
    updateButtons();
    if (!keepOut) placeholder();
    save();
  }
  function updateButtons() {
    btnRun.disabled = busy && S.lang === 'sql';
    btnStop.hidden = S.lang !== 'py';
    btnStop.textContent = busy ? '■ STOP' : 'RESET PYTHON';
    btnStop.title = busy ? 'End the running code' : 'Forget every variable and start fresh';
    btnSeed.disabled = btnTables.disabled = busy;
  }
  tabPy.addEventListener('click', function () { if (S.lang !== 'py') setLang('py'); });
  tabSql.addEventListener('click', function () { if (S.lang !== 'sql') setLang('sql'); });
  [tabPy, tabSql].forEach(function (t) {
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        var to = S.lang === 'py' ? tabSql : tabPy; to.click(); to.focus(); e.preventDefault();
      }
    });
  });
  exSel.addEventListener('change', function () {
    if (exSel.value === '') return;
    ed.value = EX[S.lang][+exSel.value].code;
    S.code[S.lang] = ed.value;
    save(); placeholder();
  });
  ed.addEventListener('input', function () { S.code[S.lang] = ed.value; save(); });
  var noTab = false;
  ed.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); return; }
    if (e.key === 'Escape') { noTab = true; return; }          // Esc, then Tab, leaves the editor
    if (e.key === 'Tab' && !noTab && !e.shiftKey) {
      e.preventDefault();
      var s = ed.selectionStart, t = ed.selectionEnd;
      ed.value = ed.value.slice(0, s) + '    ' + ed.value.slice(t);
      ed.selectionStart = ed.selectionEnd = s + 4;
      S.code[S.lang] = ed.value; save();
      return;
    }
    if (e.key !== 'Tab' && e.key !== 'Shift') noTab = false;
  });
  $('pgClear').addEventListener('click', placeholder);

  /* ------------------------------------------------------------ Python (Pyodide in a worker) */
  var PY_WORKER_SRC = '(' + function () {
    var py = null;
    function post(m) { self.postMessage(m); }
    // Output is queued and sent at most every 10 ms, in order, so a tight print loop cannot flood the page.
    var q = [], lastSend = 0, timer = 0;
    function send() {
      if (timer) { clearTimeout(timer); timer = 0; }
      if (q.length) { post({ type: 'chunks', parts: q }); q = []; }
      lastSend = Date.now();
    }
    function emit(kind, text) {
      if (q.length && q[q.length - 1].k === kind) q[q.length - 1].t += text; else q.push({ k: kind, t: text });
      if (Date.now() - lastSend >= 10) send(); else if (!timer) timer = setTimeout(send, 10);
    }
    function cleanTb(t) {
      var ls = String(t).split('\n'), i = -1;
      for (var k = 0; k < ls.length; k++) { if (ls[k].indexOf('File "<exec>"') >= 0) { i = k; break; } }
      if (i > 0 && /^Traceback/.test(ls[0])) return ['Traceback (most recent call last):'].concat(ls.slice(i)).join('\n');
      return String(t);
    }
    function flush() {        // a last line with no newline stays buffered until something flushes it
      try { py.runPython('import sys\nsys.stdout.flush()\nsys.stderr.flush()'); } catch (e) {}
    }
    async function run(code) {
      try {
        var pip = [];
        code.split('\n').forEach(function (l) {
          var x = l.match(/^#\s*pip:\s*(.+)$/i);
          if (x) x[1].split(/[\s,]+/).forEach(function (p) { if (p) pip.push(p); });
        });
        if (pip.length) {
          post({ type: 'status', text: 'INSTALLING ' + pip.join(', ').toUpperCase() + '…' });
          var quiet = { messageCallback: function () {}, errorCallback: function (s) { emit('err', String(s) + '\n'); } };
          await py.loadPackage('micropip', quiet);
          await py.pyimport('micropip').install(pip);
        }
        await py.loadPackagesFromImports(code, {
          messageCallback: function (s) { post({ type: 'status', text: String(s).toUpperCase() }); },
          errorCallback: function (s) { emit('err', String(s) + '\n'); }
        });
        post({ type: 'status', text: 'RUNNING…' });
        var res = await py.runPythonAsync(code);
        flush(); send();
        var shown = null;
        if (res !== undefined && res !== null) {
          shown = py.runPython('repr')(res);
          if (res && res.destroy) res.destroy();
        }
        post({ type: 'done', value: shown });
      } catch (err) {
        flush(); send();
        post({ type: 'fail', text: cleanTb(err && err.message ? err.message : err) });
      }
    }
    self.onmessage = function (e) {
      var m = e.data;
      if (m.type === 'init') {
        // Pyodide 314 only runs in a module worker, so it is pulled in with import(), not importScripts().
        import(m.base + 'pyodide.mjs').then(function (mod) {
          return mod.loadPyodide({ indexURL: m.base });
        }).then(function (p) {
          py = p;
          // Raw writers stream every chunk, including a last line with no newline (batched mode holds that back).
          var decO = new TextDecoder(), decE = new TextDecoder();
          py.setStdout({ write: function (b) { emit('out', decO.decode(b, { stream: true })); return b.length; } });
          py.setStderr({ write: function (b) { emit('err', decE.decode(b, { stream: true })); return b.length; } });
          try { py.runPython('import sys\nsys.stdout.reconfigure(line_buffering=True)\nsys.stderr.reconfigure(line_buffering=True)'); } catch (e) {}
          post({ type: 'ready' });
        }).catch(function (err) { post({ type: 'fatal', text: String(err && err.message ? err.message : err) }); });
      } else if (m.type === 'run') {
        run(m.code);
      }
    };
  }.toString() + ')()';

  var pyW = null, pyReady = null, curRun = null, workerUrl = null;
  function startPy() {
    if (pyReady) return pyReady;
    setStatus('LOADING PYTHON · ABOUT 10 MB THE FIRST TIME, THEN CACHED', 'busy');
    pyReady = new Promise(function (resolve, reject) {
      // A Blob worker is the best-supported route on http(s). A page opened straight from disk (file://)
      // blocks Blob module workers, so if that one cannot start we retry from a data: URL.
      function launch(kind) {
        var w;
        try {
          if (kind === 'blob') {
            workerUrl = URL.createObjectURL(new Blob([PY_WORKER_SRC], { type: 'text/javascript' }));
            w = new Worker(workerUrl, { type: 'module' });
          } else {
            w = new Worker('data:text/javascript;charset=utf-8,' + encodeURIComponent(PY_WORKER_SRC), { type: 'module' });
          }
        } catch (err) {
          if (kind === 'blob') return launch('data');
          return reject(err);
        }
        pyW = w;
        var started = false;
        w.onmessage = function (e) {
          started = true;
          var m = e.data;
          if (m.type === 'ready') resolve();
          else if (m.type === 'fatal') reject(new Error(m.text));
          else onPyMsg(m);
        };
        w.onerror = function (e) {
          if (e && e.preventDefault) e.preventDefault();
          if (!started && kind === 'blob') {
            w.terminate();
            if (workerUrl) { URL.revokeObjectURL(workerUrl); workerUrl = null; }
            launch('data');
          } else if (curRun) {
            var r = curRun; curRun = null; r({ type: 'fail', text: (e && e.message) || 'The Python worker stopped unexpectedly.' });
          } else {
            reject(new Error((e && e.message) || 'The Python worker failed to start.'));
          }
        };
        w.postMessage({ type: 'init', base: PY_BASE });
      }
      launch('blob');
    });
    pyReady.catch(function () { dropPy(); });
    return pyReady;
  }
  function dropPy() {
    if (pyW) { pyW.onmessage = null; pyW.onerror = null; pyW.terminate(); pyW = null; }
    if (workerUrl) { URL.revokeObjectURL(workerUrl); workerUrl = null; }
    pyReady = null;
  }
  function onPyMsg(m) {
    if (m.type === 'chunks') m.parts.forEach(function (p) { addRaw(p.k === 'err' ? 'err' : '', p.t); });
    else if (m.type === 'status') setStatus(m.text, 'busy');
    else if ((m.type === 'done' || m.type === 'fail') && curRun) {
      paintRaw();
      var r = curRun; curRun = null; r(m);
    }
  }
  function runPy(code) {
    return startPy().then(function () {
      return new Promise(function (resolve) { curRun = resolve; pyW.postMessage({ type: 'run', code: code }); });
    });
  }
  btnStop.addEventListener('click', function () {
    if (busy) {
      var r = curRun; curRun = null;
      dropPy();
      if (r) r({ type: 'stopped' });
    } else {
      dropPy();
      clearOut();
      addMeta('PYTHON SESSION RESET · VARIABLES CLEARED');
      setStatus('PYTHON RESET · THE NEXT RUN STARTS FRESH');
    }
  });

  /* ------------------------------------------------------------ SQL (DuckDB-WASM) */
  var duckP = null, conn = null, seeded = false;
  function startDuck() {
    if (duckP) return duckP;
    setStatus('LOADING DUCKDB · ABOUT 10 MB THE FIRST TIME, THEN CACHED', 'busy');
    duckP = (async function () {
      var duckdb = await import(DUCK_ESM);
      var bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
      var url = URL.createObjectURL(new Blob(['importScripts("' + bundle.mainWorker + '");'], { type: 'text/javascript' }));
      var worker = new Worker(url);
      var db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(url);
      conn = await db.connect();
      return conn;
    })();
    duckP.catch(function () { duckP = null; });
    return duckP;
  }

  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  function isoDate(ms) { var d = new Date(ms); return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); }
  function isoTs(ms) { var d = new Date(ms); return isoDate(ms) + ' ' + pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()) + ':' + pad2(d.getUTCSeconds()); }
  function fmtCell(v, type) {
    var ts = String(type || '');
    if (v === null || v === undefined) return { t: 'NULL', c: 'nul' };
    if (/^Decimal/.test(ts)) {
      // DuckDB hands back the unscaled integer; put the decimal point back using the column's scale
      var scale = type && typeof type.scale === 'number' ? type.scale : 0, s = String(v);
      if (/^-?\d+$/.test(s) && scale > 0) {
        var neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
        while (s.length <= scale) s = '0' + s;
        s = (neg ? '-' : '') + s.slice(0, s.length - scale) + '.' + s.slice(s.length - scale);
      }
      return { t: s, c: 'num' };
    }
    if (typeof v === 'bigint') return { t: v.toString(), c: 'num' };
    if (typeof v === 'number') {
      if (/^Date/.test(ts)) return { t: isoDate(v), c: '' };
      if (/^Timestamp/.test(ts)) return { t: isoTs(v), c: '' };
      return { t: Number.isInteger(v) ? String(v) : String(+v.toFixed(6)), c: 'num' };
    }
    if (v instanceof Date) return { t: /^Date/.test(ts) ? isoDate(v.getTime()) : isoTs(v.getTime()), c: '' };
    if (typeof v === 'boolean') return { t: String(v), c: '' };
    if (typeof v === 'string') return { t: v, c: v.indexOf('\n') >= 0 ? 'ml' : '' };
    try { return { t: JSON.stringify(v, function (k, x) { return typeof x === 'bigint' ? x.toString() : x; }), c: '' }; }
    catch (e) { return { t: String(v), c: '' }; }
  }
  function showTable(res, ms) {
    var fields = res.schema.fields;
    var total = res.numRows;
    var shown = Math.min(total, ROW_CAP);
    addMeta(total + (total === 1 ? ' ROW' : ' ROWS') + ' · ' + fields.length + (fields.length === 1 ? ' COLUMN' : ' COLUMNS') +
            (total > shown ? ' · SHOWING THE FIRST ' + shown : '') + (ms ? ' · ' + fmtMs(ms) : ''));
    if (!fields.length) return;
    var wrap = document.createElement('div');
    wrap.className = 'pg-tblwrap';
    var tbl = document.createElement('table');
    tbl.className = 'pg-tbl';
    var cols = fields.map(function (f, j) { return res.getChildAt(j); });
    var numCol = fields.map(function () { return false; }), seen = fields.map(function () { return false; });
    var body = '<tbody>';
    for (var i = 0; i < shown; i++) {
      var cells = '';
      for (var j = 0; j < fields.length; j++) {
        var c = fmtCell(cols[j].get(i), fields[j].type);
        if (!seen[j] && c.c !== 'nul') { seen[j] = true; numCol[j] = c.c === 'num'; }
        cells += '<td' + (c.c ? ' class="' + c.c + '"' : '') + '>' + esc(c.t) + '</td>';
      }
      body += '<tr>' + cells + '</tr>';
    }
    var head = '<thead><tr>' + fields.map(function (f, j) {
      return '<th' + (numCol[j] ? ' class="num"' : '') + '>' + esc(f.name) + '</th>';
    }).join('') + '</tr></thead>';
    tbl.innerHTML = head + body + '</tbody>';
    wrap.appendChild(tbl);
    out.appendChild(wrap);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  async function runSql(sql, quiet) {
    var c = await startDuck();
    setStatus('RUNNING…', 'busy');
    var t0 = performance.now();
    try {
      var res = await c.query(sql);
      if (!quiet) showTable(res, performance.now() - t0);
      return res;
    } catch (e) {
      addPre('err', String(e && e.message ? e.message : e).replace(/^Error: /, ''));
      return null;
    }
  }
  async function seed() {
    busy = true; updateButtons(); clearOut();
    var c;
    try { c = await startDuck(); }
    catch (e) {
      addPre('err', String(e && e.message ? e.message : e));
      setStatus('COULD NOT LOAD DUCKDB · CHECK YOUR CONNECTION AND TRY AGAIN', 'bad');
      busy = false; updateButtons(); return;
    }
    try {
      var t0 = performance.now();
      for (var i = 0; i < SEED_SQL.length; i++) {
        setStatus('BUILDING SAMPLE WAREHOUSE · STEP ' + (i + 1) + ' OF ' + SEED_SQL.length, 'busy');
        await c.query(SEED_SQL[i]);
      }
      seeded = true;
      addMeta('SAMPLE WAREHOUSE READY · ' + fmtMs(performance.now() - t0));
      showTable(await c.query(TABLES_SQL), 0);
      addPre('', 'customers: NULL regions and about 4% duplicate keys with newer updated_at\norders: about 1% point at a customer that does not exist\norder_items: one to three lines per order\nevents: visits of 1–8 events, for sessions\nactivity: one row per user per active day, for streaks\n\nThis is a smaller copy of the Day 1 sql-lab seed. Your real work stays in your sql-lab repo with pytest.');
      setStatus('DUCKDB READY · SAMPLE DATA LOADED', 'ok');
    } catch (e) {
      addPre('err', String(e && e.message ? e.message : e).replace(/^Error: /, ''));
      setStatus('SQL ERROR WHILE BUILDING THE SAMPLE DATA · RELOAD THE PAGE AND TRY AGAIN', 'bad');
    }
    busy = false; updateButtons();
  }
  btnSeed.addEventListener('click', seed);
  btnTables.addEventListener('click', async function () {
    busy = true; updateButtons(); clearOut();
    try {
      await runSql(TABLES_SQL);
      setStatus('DUCKDB READY', 'ok');
    } catch (e) { addPre('err', String(e && e.message ? e.message : e)); setStatus('COULD NOT LOAD DUCKDB', 'bad'); }
    busy = false; updateButtons();
  });

  /* ------------------------------------------------------------ run */
  async function run() {
    if (busy && S.lang === 'sql') return;
    if (busy && S.lang === 'py') return;
    var code = ed.value;
    if (!code.trim()) return;
    S.code[S.lang] = code; save();
    busy = true; updateButtons(); clearOut();
    var t0 = performance.now();
    if (S.lang === 'py') {
      try {
        var r = await runPy(code);
        if (r.type === 'fail') { addPre('err', r.text); setStatus('PYTHON ERROR · ' + fmtMs(performance.now() - t0), 'bad'); }
        else if (r.type === 'stopped') { addPre('err', 'Stopped.'); setStatus('STOPPED · THE NEXT RUN STARTS FRESH'); }
        else {
          if (r.value !== null && r.value !== undefined) addPre('val', r.value);
          if (!out.children.length) addMeta('FINISHED WITH NO OUTPUT · USE print() TO SEE VALUES');
          setStatus('PYTHON READY · RAN IN ' + fmtMs(performance.now() - t0), 'ok');
        }
      } catch (e) {
        addPre('err', String(e && e.message ? e.message : e));
        setStatus('COULD NOT LOAD PYTHON · CHECK YOUR CONNECTION AND TRY AGAIN', 'bad');
      }
    } else {
      try {
        var res = await runSql(code);
        if (res) setStatus('DUCKDB READY · RAN IN ' + fmtMs(performance.now() - t0), 'ok');
        else setStatus('SQL ERROR · ' + fmtMs(performance.now() - t0), 'bad');
      } catch (e) {
        addPre('err', String(e && e.message ? e.message : e));
        setStatus('COULD NOT LOAD DUCKDB · CHECK YOUR CONNECTION AND TRY AGAIN', 'bad');
      }
    }
    busy = false; updateButtons();
  }
  btnRun.addEventListener('click', run);

  /* ------------------------------------------------------------ "try it" buttons on code blocks */
  function addTryButtons() {
    document.querySelectorAll('pre.code').forEach(function (pre) {
      var lang = (pre.getAttribute('data-lang') || '').toLowerCase();
      var l = lang === 'sql' ? 'sql' : (lang === 'python' || lang === 'py') ? 'py' : null;
      if (!l || (pre.previousElementSibling && pre.previousElementSibling.className === 'pg-try-row')) return;
      var row = document.createElement('div');
      row.className = 'pg-try-row';
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'pg-try mono';
      b.textContent = '▶ TRY IN PLAYGROUND';
      b.addEventListener('click', function () {
        var code = pre.textContent.replace(/\s+$/, '') + '\n';
        if (S.lang !== l) setLang(l, true);
        ed.value = code; S.code[l] = code; save(); placeholder();
        var sec = $('playground');
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function () { try { ed.focus({ preventScroll: true }); } catch (e) { ed.focus(); } }, 350);
      });
      row.appendChild(b);
      pre.parentNode.insertBefore(row, pre);
    });
  }

  /* ------------------------------------------------------------ boot */
  setLang(S.lang === 'sql' ? 'sql' : 'py', false, true);
  addTryButtons();
  setStatus('RUNTIME NOT LOADED · IT LOADS WHEN YOU PRESS RUN');

  // small test hook, not part of the page's contract
  window.__pg = { run: run, seed: seed, setLang: setLang };
})();
