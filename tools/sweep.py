"""Personalisation leak scanner. Reports hits with day/section locations."""
import json, os, re, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
PLAN = json.loads(open(os.path.join(HERE, 'assets', 'plan.js')).read()
                  .split('=', 1)[1].rstrip().rstrip(';'))
PAGE = open(os.path.join(HERE, '..', 'docs', 'index.html')).read()

def txt(h):
    h = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', h, flags=re.S)
    h = re.sub(r'<[^>]+>', ' ', h)
    return re.sub(r'\s+', ' ', html.unescape(h)).strip()

# every content unit with a human-readable location
UNITS = []
for w in PLAN['weeks']:
    UNITS.append(('Week %d title' % w['week'], txt(w['title'])))
    UNITS.append(('Week %d goal' % w['week'], txt(w['goal'])))
    for d in w['days']:
        UNITS.append(('Day %d title' % d['day'], txt(d['title'])))
        UNITS.append(('Day %d cutoff target' % d['day'], txt(d['target'])))
        for s in d['sections']:
            UNITS.append(('Day %d · %s' % (d['day'], s['label'] or 'body'), txt(s['html'])))
for c in PLAN['cheats']:
    UNITS.append(('Cheat sheet · %s' % txt(c['title']), txt(c['html'])))
for c in PLAN['resources']:
    UNITS.append(('Resources · %s' % txt(c['title']), txt(c['html'])))

# chrome: everything hand-authored in the page shell, minus the plan payload
shell = re.sub(r'window\.(PLAN|DAYS)=.*?;</script>', ' ', PAGE, flags=re.S)
UNITS.append(('Page chrome (headings, panels, labels)', txt(shell)))

# ---- category 1: proper nouns that are not tools/platforms/resources -------
TOOLS = set("""
Python Iceberg Kafka Flink Spark PySpark dbt Dagster Airflow DuckDB Polars Delta Hudi Trino
Snowflake Databricks BigQuery Redshift Postgres MySQL SQL Server SQLite Redis Docker Kubernetes
Parquet Arrow Avro Protobuf OpenLineage Polaris Nessie Lakekeeper Glue Unity Hive Presto
Pydantic FastAPI Hypothesis pytest mypy MERGE Great Expectations Evidently MLflow Langfuse
Phoenix LangGraph LangChain Ragas OpenTelemetry OTel Prometheus Grafana Loom Substack GitHub
Git Notion Terraform Helm Linux Bash Java Scala Rust Go Node JSON YAML CSV REST gRPC HTTP
LeetCode NeetCode CodeCrafters Exercism DataLemur StrataScratch Pramp CS50P CS50 Harvard
DDIA Kleppmann Alex Xu Petrov Sean Prashad Evan King Stefan Mai Abdul Bari Tushar Roy
Jordan Hello Interview ByteByteGo Real Python PEP Protocol TypedDict NamedTuple Counter
ACID CAP PACELC CDC LSN RAG LLM LLMOps GenAI AI ML CPU RAM GIL API CI CD PR DAG ETL ELT
OLTP OLAP SLO RPO RTO DLQ CRDT LWW SI COW MOR AQE STAR DSA XP W1 W2 W3 W4 W5 W6 W7 W8 W9
W10 W11 W12 Day Week Level Boss Tier README Loom AWS Azure GCP S3 ADLS FINOS Sentinel Lite
Break Breaks Iceberg Substack Monday Friday Situation Task Action Result Recall Concept
Alternatives Roadblock Read Build Save SQL Reps Done When Reward Streak Search Two Sum
Group Anagrams Top Frequent Elements Time Based Key Value Store Combine Tables Employees
Managers Project Rank Scores Consecutive Numbers Delete Duplicate Emails Rising Temperature
Department Highest Salary Three Salaries Daily Leads Partners Total Spent Each Employee
Guido Gorgeous Lasagna Tisbury Treasure Hunt Redis Interview Patterns Roadmap Tools
The This That These Those There When Where What Which Why How If Then Else For While Do
And Or Not But So Now Next First Second Third Fourth Fifth Sixth Every Each Any All One Two
Three Four Five Six Seven Eight Nine Ten Twelve Eighty Four Open Close Point Pick Keep Make
Use Run Write Ship Post Add Set Get Put Send Log Tick Claim Find Fix Name Show Tell Say
Explain Define Design Deploy Commit Push Pull Merge Test Prove Measure Track Watch Learn
Practice Rehearse Record Review Retro Mock Onsite Call Target Contacted Replied Upcoming
Complete Today Progress Locked Unlocked Empty Written Earned Cleared Queued Building Here
Cutoff Ritual Arc Capstone Program Executor Daily Field Manual State Resource Library Cheat
Sheets Position Weeks Status Settings Save Reset Import Export Paste Undo Prev Dark Light
Situation Lakehouse Engineer Data Engineering Staff Platform Sprint Sam
""".split())

CAP = re.compile(r'\b([A-Z][a-zA-Z0-9&.\-]{1,}(?:\s+[A-Z][a-zA-Z0-9&.\-]{1,}){0,3})\b')
def cat1(t):
    out = []
    for m in CAP.finditer(t):
        phrase = m.group(1)
        words = [w.strip('.-&') for w in phrase.split()]
        if all(w in TOOLS or w.isdigit() or len(w) < 2 for w in words):
            continue
        out.append(phrase)
    return out

ORGS = re.compile(r'\b(Goldman(?:\s+Sachs)?|GS\s+ETO|Morgan\s+Stanley|JPMorgan|JP\s+Morgan|'
 r'Citadel|Two\s+Sigma|Jane\s+Street|Bloomberg|BlackRock|Barclays|Deutsche|Wells\s+Fargo|'
 r'ExponentHR|Infosys|TCS|Wipro|Cognizant|Accenture|Capgemini|Deloitte|EY|KPMG|PwC|'
 r'Amazon|Google|Meta|Facebook|Microsoft|Apple|Netflix|Uber|Lyft|Airbnb|Stripe|Shopify|'
 r'Salesforce|Oracle|IBM|Intel|Nvidia|Tesla|Walmart|Target\s+Corp|Optum|UnitedHealth|'
 r'Cerner|Epic\s+Systems|Missouri\s+S&T|FINOS|Legend)\b')

MULTICAP = re.compile(r'(?<![.!?]\s)(?<!^)\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){1,3})\b')

DETECT = [
 ('1 · organisation names',  ORGS),
 ('2 · resume metrics',
  re.compile(r'\$\s?[\d,.]+\s?[kKmM]?\b|\b\d+\s?%\s?(?:→|->|to\b)|\b\d+%→|\b\d+\s+(?:people|engineers|devs|reports|headcount)\b|\b\d+\s?(?:min|hrs?|hours|months|days)\s*(?:→|->)\s*<?\s?\d+')),
 ('3 · first-person career claim',
  re.compile(r"\b(?:I|I'(?:ve|d|m|ll))\s+[a-z]+(?:ed|t)\b|\bI\s+(?:build|ship|lead|own|run|made|make|got|use)\b|\bmy\s+(?:manager|team|company|employer|hackathon|targets?|role|job|resume|CV|stack)\b")),
 ('4 · visa / location / university',
  re.compile(r"\b(?:H-?1B|H1B|visa transfer|lottery[- ]exempt|green card|OPT|CPT|sponsorship required|alumni of|alma mater|Missouri|S&T|relocat\w+ to [A-Z])\b", re.I)),
 ('5 · assumes the reader',
  re.compile(r"\byou'?ve (?:lived|done|built|seen|already)\b|\bas you know\b|\bremember when you\b|\byour (?:mastery|superpower|current employer|company|manager|old team|previous role|favou?rite mode)\b|\byou master\b|\byou dominate\b", re.I)),
]

hits = {}
for loc, t in UNITS:
    if not t: continue
    for name, rx in DETECT:
        for m in rx.finditer(t):
            a = max(0, m.start()-90); b = min(len(t), m.end()+90)
            hits.setdefault(name, []).append((loc, m.group(0), '…'+t[a:b]+'…'))
    for m in MULTICAP.finditer(t):
        phrase = m.group(1)
        if all(w in TOOLS for w in phrase.split()):
            continue
        hits.setdefault('1b · multi-word capitalised (review)', []).append((loc, phrase, ''))

for name in sorted(hits):
    rows = hits[name]
    if name.startswith('1'):
        from collections import Counter
        c = Counter(h[1] for h in rows)
        where = {}
        for loc, p, _ in rows: where.setdefault(p, set()).add(loc)
        print('\n### %s — %d distinct' % (name, len(c)))
        for p, k in c.most_common():
            locs = sorted(where[p])[:3]
            print('  %-38s x%-3d %s' % (p[:38], k, ', '.join(locs)[:80]))
    else:
        print('\n### %s — %d hits' % (name, len(rows)))
        for loc, m, ctx in rows:
            print('  [%s] %r' % (loc, m))
            if ctx: print('      %s' % ctx[:190])
if not hits: print('no hits')
