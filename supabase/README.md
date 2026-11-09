# Community setup (Supabase, free tier)

The workspace runs fully without this. Do these steps only if you want sign-in, shared solutions,
discussion and progress that follows you to another device. About 15 minutes, once.

Supabase is Postgres plus a small web layer in front of it (the page cannot talk to Postgres directly, because
it runs in a browser). That web layer and the GitHub sign-in are why this guide uses Supabase and not a bare
Postgres: with a bare Postgres you would also have to run and host that layer yourself.

## 0. New project or the one you already have?

The tables live in their own schema, `de`. The file never touches `public`, your other tables, or anything on
`auth.users`, and a test (`tests/schema.coexist.test.js`) installs it next to a stand-in for another app to prove
that. So both ways work. Pick with these two facts in mind:

- **The free plan allows 2 active projects**, and you can have as many paused ones as you like
  ([Supabase pricing](https://supabase.com/pricing.md)). If you have a free slot, or one project you are not
  using (pause it to free its slot), a **new project is the cleaner choice**.
- **If you share a project with another app, anyone who signs in on this page becomes a user of that project.**
  That has two effects. First, the project's public (anon) key is printed in this page, so every table in your
  other app needs row-level security switched on. Second, a signed-in learner holds the `authenticated` role in
  your other app too, so none of its policies may trust "any signed-in user". Run these two queries in the SQL
  editor first. Both should return no rows you did not expect:

  ```sql
  -- tables in public that have row-level security off
  select tablename from pg_tables where schemaname = 'public' and not rowsecurity;
  -- policies that let any signed-in user in (look for "true", or a policy with no auth.uid() check)
  select tablename, policyname, cmd, qual from pg_policies where schemaname = 'public';
  ```

  If you are the only person who will ever sign in, the second point does not matter.

## 1. Create the project (skip this if you reuse one)

1. Go to supabase.com, sign in, and create a new project. The free plan is enough.
2. Pick a region close to you and set a database password. You will not need the password again.

## 2. Create the tables

1. In the project, open **SQL Editor** and make a new query.
2. Paste the whole of `supabase/schema.sql` and press **Run**.
3. It is safe to run again later. It never drops data.

The file turns on row-level security for every table. A signed-out visitor cannot read or write anything.

## 3. Let the API see the `de` schema

Supabase only serves the schemas you list. Open **Project Settings → API** (also called **Data API** in newer
dashboards), find **Exposed schemas**, and **add `de` to the list. Keep what is already there.** Save.

If you skip this the page shows an error and the browser console says the schema must be one of a list that
does not include `de`.

## 4. Turn on GitHub sign-in

If GitHub sign-in is already on in this project, skip to step 4 of this list.

1. On GitHub: Settings → Developer settings → OAuth Apps → **New OAuth App**.
   - Homepage URL: the address of your site, for example `https://narendranathe.github.io/DE/`.
   - Authorization callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
     Supabase shows this exact address on the GitHub provider screen. Copy it from there.
2. Create the app, then generate a client secret.
3. In Supabase: **Authentication → Providers** (newer dashboards call it **Sign In / Providers**) → GitHub.
   Switch it on, paste the Client ID and the Client Secret, and save.
4. In Supabase: **Authentication → URL Configuration**.
   - **Redirect URLs**: add the address of your site. For local tests also add `http://localhost:8000/`.
   - **Site URL**: in a new project set it to your site's address. In a project another app already uses,
     leave it alone. The page tells Supabase where to come back to, so only the Redirect URLs list matters.

## 5. Give the page the project address and key

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

## 6. Make yourself a moderator

Sign in once on the site so your profile exists, then run this in the SQL Editor:

```sql
update de.profiles set role = 'moderator' where handle = 'your-github-name';
```

A moderator sees a Hide button on every solution and comment, and a list of reports. Hidden items disappear
for everyone except the author and moderators.

## What is stored

Your GitHub handle and avatar address, your hint counts and solve times, your submissions, and what you post.
There is no email column anywhere in the schema. A profile row is made the first time someone uses the community
on the page, by `de.ensure_profile()`. There is no trigger on `auth.users`, so another app's sign-ups are never
touched and never slowed down. Deleting a user in **Authentication → Users** deletes all of their rows.

## Limits the database enforces

| What | Limit |
|---|---|
| Comment | 4,000 characters |
| Solution title | 120 characters |
| Solution code and submission code | 20,000 characters |
| Posts per person per hour | 30 comments, 20 solutions, 200 submissions |

## Things to know

- A free project pauses after about a week with no traffic. The first visit afterwards is slow while it
  wakes. The page tells the learner when a call fails. A project that another app keeps busy does not pause.
- The free database is 500 MB per project and 50,000 monthly active users
  ([Supabase pricing](https://supabase.com/pricing.md)). Code and comments are small text, so this is a lot of room.
- The verdict is worked out in the learner's browser. A determined person can fake "Accepted" and unlock other
  people's solutions. The cost is a spoiler, nothing else, so there is no server-side judge.
- Spam is limited by sign-in, the hourly caps, reports and the moderator's Hide button. It is not zero.

## Trying it on your own machine first (optional, not run here)

The Supabase command-line tool runs the same stack locally in Docker, so you can test without a hosted project.
This sandbox has no Docker, so these steps were not run:

```sh
npx supabase init
npx supabase start            # prints a local API URL and a local anon key
```

Then paste `schema.sql` into the local Studio's SQL editor, add `de` to `schemas` under `[api]` in
`supabase/config.toml`, restart, and put the local URL and key into `CONFIG_BLOCK`. GitHub sign-in needs a
public callback address, so locally it is easier to test everything except sign-in.

## What the tests cover, and what they cannot

Tested here, in a real Postgres (PGlite), with Supabase's roles and `auth.uid()` reproduced:
the whole of `schema.sql`, every rule above, the page's community code running against that schema, and an
install next to another app (its tables, its own `profiles` table, its own sign-up trigger, its grants and its
policies come out unchanged).

Not testable from this repository, so check these once by hand after setup:
- The GitHub sign-in round trip and the redirect back to your page.
- The hosted API layer (PostgREST): that `de` is served once it is in Exposed schemas, and that
  `ensure_profile` comes back as one object. The tests use a small stand-in for the Supabase client library.
- Loading the client library from the CDN in a real browser.

Quick manual check: sign in, solve a question, press SHARE, then open the page in a private window with a second
GitHub account and confirm the solution is locked until that account solves the question or opens the full approach.
