# Community setup (Supabase, free tier)

The workspace runs fully without this. Do these steps only if you want sign-in, shared solutions,
discussion and progress that follows you to another device. About 15 minutes, once.

## 1. Create the project

1. Go to supabase.com, sign in, and create a new project. The free plan is enough.
2. Pick a region close to you and set a database password. You will not need the password again.

## 2. Create the tables

1. In the project, open **SQL Editor** and make a new query.
2. Paste the whole of `supabase/schema.sql` and press **Run**.
3. It is safe to run again later. It never drops data.

The file turns on row-level security for every table. A signed-out visitor cannot read or write anything.

## 3. Turn on GitHub sign-in

1. On GitHub: Settings → Developer settings → OAuth Apps → **New OAuth App**.
   - Homepage URL: the address of your site, for example `https://narendranathe.github.io/DE/`.
   - Authorization callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
     Supabase shows this exact address on the GitHub provider screen. Copy it from there.
2. Create the app, then generate a client secret.
3. In Supabase: **Authentication → Providers** (newer dashboards call it **Sign In / Providers**) → GitHub.
   Switch it on, paste the Client ID and the Client Secret, and save.
4. In Supabase: **Authentication → URL Configuration**.
   - Site URL: the address of your site.
   - Redirect URLs: add the same address. For local tests also add `http://localhost:8000/`.

## 4. Give the page the project address and key

1. In Supabase: **Project Settings → API**. Copy the **Project URL** and the **anon** public key.
   Never use the `service_role` key anywhere in this repo. It bypasses every rule.
2. Paste them into `CONFIG_BLOCK` in `tools/render_site.py`:

   ```
   supabaseUrl: "https://abcdefgh.supabase.co",
   supabaseKey: "eyJ...",
   ```

3. Run `python3 tools/render_site.py` and publish `docs/index.html`.

The anon key is meant to be public. What protects the data is the row-level security in `schema.sql`,
and the tests in `tests/schema.rls.test.js` check those rules against a real Postgres.

## 5. Make yourself a moderator

Sign in once on the site so your profile exists, then run this in the SQL Editor:

```sql
update public.profiles set role = 'moderator' where handle = 'your-github-name';
```

A moderator sees a Hide button on every solution and comment, and a list of reports. Hidden items disappear
for everyone except the author and moderators.

## What is stored

Your GitHub handle and avatar address, your hint counts and solve times, your submissions, and what you post.
There is no email column anywhere in the schema. Deleting a user in **Authentication → Users** deletes all of
their rows.

## Limits the database enforces

| What | Limit |
|---|---|
| Comment | 4,000 characters |
| Solution title | 120 characters |
| Solution code and submission code | 20,000 characters |
| Posts per person per hour | 30 comments, 20 solutions, 200 submissions |

## Things to know

- A free project pauses after about a week with no traffic. The first visit afterwards is slow while it
  wakes. The page tells the learner when a call fails.
- The verdict is worked out in the learner's browser. A determined person can fake "Accepted" and unlock other
  people's solutions. The cost is a spoiler, nothing else, so there is no server-side judge.
- Spam is limited by sign-in, the hourly caps, reports and the moderator's Hide button. It is not zero.

## What the tests cover, and what they cannot

Tested here, in a real Postgres (PGlite), with Supabase's roles and `auth.uid()` reproduced:
the whole of `schema.sql`, every rule above, and the page's community code running against that schema.

Not testable from this repository, so check these once by hand after setup:
- The GitHub sign-in round trip and the redirect back to your page.
- The hosted API layer (PostgREST). The tests use a small stand-in for the Supabase client library.
- Loading the client library from the CDN in a real browser.

Quick manual check: sign in, solve a question, press SHARE, then open the page in a private window with a second
GitHub account and confirm the solution is locked until that account solves the question or opens the full approach.
