-- ============================================================================
-- Problem Workspace: community schema for Supabase (Postgres 15+).
--
-- Run this whole file once in the Supabase SQL editor. It is safe to run again.
-- Everything it makes lives in its own schema, "de". It does not touch the "public" schema,
-- your other tables, or anything on auth.users, so it is safe to run in a project that
-- already has another app in it.
-- What it makes: profiles, progress, submissions, shared_solutions, comments,
-- votes and reports, all with row-level security, plus the rules the page relies on.
--
-- After running it, do one thing by hand: Project Settings -> API -> "Exposed schemas" -> add  de
-- (see supabase/README.md).
--
-- Rules in one place
--   * Nobody who is signed out can read or write anything.
--   * Only the GitHub handle and avatar are stored. There is no email column.
--   * A profile is made the first time someone uses the community on the page (de.ensure_profile()),
--     not by a trigger on sign-up, so another app's users never end up here and nothing here can
--     get in the way of another app's sign-ups.
--   * progress only moves forward: hints never go down and a solve is never undone.
--   * Other people's shared solutions are visible to you only after you solved that
--     question, or opened its full approach (4 reveals). Authors always see their own.
--   * You can share a solution only for a question you solved.
--   * A comment is at most 4000 characters, a title 120, code 20000.
--   * At most 30 comments, 20 solutions and 200 submissions per person per hour.
--   * A moderator can hide a solution or a comment. Hidden items disappear for everyone
--     except their author and moderators. Make someone a moderator by hand:
--         update de.profiles set role = 'moderator' where handle = 'their-github-name';
--   * Deleting a user in Auth deletes everything they made.
-- ============================================================================

create schema if not exists de;

-- ---------------------------------------------------------------- profiles
create table if not exists de.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  handle      text not null check (char_length(handle) between 1 and 39),
  avatar_url  text check (avatar_url is null or avatar_url ~ '^https://'),
  role        text not null default 'member' check (role in ('member', 'moderator')),
  created_at  timestamptz not null default now()
);

-- Called by the page after sign-in. Makes the caller's profile from their GitHub sign-in data the first time,
-- then returns it. It reads auth.users and never writes to it.
create or replace function de.ensure_profile() returns de.profiles
language plpgsql security definer set search_path = de, pg_temp as $$
declare me uuid := auth.uid(); u auth.users%rowtype; p de.profiles;
begin
  if me is null then raise exception 'not signed in' using errcode = '28000'; end if;
  select * into p from de.profiles where id = me;
  if found then return p; end if;
  select * into u from auth.users where id = me;
  if not found then raise exception 'not signed in' using errcode = '28000'; end if;
  insert into de.profiles (id, handle, avatar_url)
  values (
    me,
    left(coalesce(nullif(u.raw_user_meta_data ->> 'user_name', ''),
                  nullif(u.raw_user_meta_data ->> 'preferred_username', ''),
                  'user-' || left(me::text, 6)), 39),
    case when u.raw_user_meta_data ->> 'avatar_url' ~ '^https://' then u.raw_user_meta_data ->> 'avatar_url' end
  )
  on conflict (id) do nothing;
  select * into p from de.profiles where id = me;
  return p;
end $$;

create or replace function de.is_moderator() returns boolean
language sql stable security definer set search_path = de, pg_temp as $$
  select exists (select 1 from de.profiles where id = auth.uid() and role = 'moderator')
$$;

-- ---------------------------------------------------------------- progress
create table if not exists de.progress (
  user_id     uuid not null default auth.uid() references de.profiles (id) on delete cascade,
  problem_id  text not null check (char_length(problem_id) between 1 and 80),
  hints_used  smallint not null default 0 check (hints_used between 0 and 4),
  solved_at   timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, problem_id)
);

create or replace function de.progress_forward_only() returns trigger
language plpgsql as $$
begin
  new.user_id    := old.user_id;
  new.problem_id := old.problem_id;
  new.hints_used := greatest(old.hints_used, new.hints_used);
  new.solved_at  := coalesce(old.solved_at, new.solved_at);
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists progress_forward_only on de.progress;
create trigger progress_forward_only before update on de.progress
  for each row execute function de.progress_forward_only();

-- ---------------------------------------------------------------- submissions
create table if not exists de.submissions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references de.profiles (id) on delete cascade,
  problem_id  text not null check (char_length(problem_id) between 1 and 80),
  code        text not null check (char_length(code) <= 20000),
  verdict     text not null check (verdict in ('Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded')),
  passed      int not null check (passed >= 0),
  total       int not null check (total >= 0),
  runtime_ms  int check (runtime_ms is null or runtime_ms >= 0),
  hints_used  smallint not null default 0 check (hints_used between 0 and 4),
  created_at  timestamptz not null default now()
);
create index if not exists submissions_by_user on de.submissions (user_id, problem_id, created_at desc);

-- ---------------------------------------------------------------- shared solutions
create table if not exists de.shared_solutions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references de.profiles (id) on delete cascade,
  problem_id   text not null check (char_length(problem_id) between 1 and 80),
  title        text not null check (char_length(title) between 1 and 120),
  explanation  text not null default '' check (char_length(explanation) <= 4000),
  code         text not null check (char_length(code) between 1 and 20000),
  score        int not null default 0,
  hidden       boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists solutions_by_problem on de.shared_solutions (problem_id, score desc, created_at desc);
create index if not exists solutions_by_user on de.shared_solutions (user_id, created_at);

create or replace function de.solutions_guard() returns trigger
language plpgsql as $$
begin
  new.id := old.id; new.user_id := old.user_id; new.problem_id := old.problem_id;
  new.code := old.code; new.created_at := old.created_at;
  if pg_trigger_depth() = 1 then new.score := old.score; end if;      -- only the vote trigger moves a score
  if not de.is_moderator() then new.hidden := old.hidden; end if; -- only moderators hide
  if old.user_id is distinct from auth.uid() then                     -- a moderator changes nothing but `hidden`
    new.title := old.title; new.explanation := old.explanation;
  end if;
  return new;
end $$;

drop trigger if exists solutions_guard on de.shared_solutions;
create trigger solutions_guard before update on de.shared_solutions
  for each row execute function de.solutions_guard();

-- ---------------------------------------------------------------- comments
create table if not exists de.comments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references de.profiles (id) on delete cascade,
  problem_id  text not null check (char_length(problem_id) between 1 and 80),
  parent_id   uuid references de.comments (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 4000),
  is_spoiler  boolean not null default false,
  score       int not null default 0,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now(),
  edited_at   timestamptz
);
create index if not exists comments_by_problem on de.comments (problem_id, created_at);
create index if not exists comments_by_user on de.comments (user_id, created_at);

-- one level of replies: a reply's parent must be a top-level comment on the same question
create or replace function de.comments_thread() returns trigger
language plpgsql as $$
declare p record;
begin
  if new.parent_id is null then return new; end if;
  select c.problem_id, c.parent_id into p from de.comments c where c.id = new.parent_id;
  if not found or p.problem_id <> new.problem_id or p.parent_id is not null then
    raise exception 'invalid_parent';
  end if;
  return new;
end $$;

drop trigger if exists comments_thread on de.comments;
create trigger comments_thread before insert on de.comments
  for each row execute function de.comments_thread();

create or replace function de.comments_guard() returns trigger
language plpgsql as $$
begin
  new.id := old.id; new.user_id := old.user_id; new.problem_id := old.problem_id;
  new.parent_id := old.parent_id; new.created_at := old.created_at;
  if pg_trigger_depth() = 1 then new.score := old.score; end if;
  if not de.is_moderator() then new.hidden := old.hidden; end if;
  if old.user_id is distinct from auth.uid() then
    new.body := old.body; new.is_spoiler := old.is_spoiler;
  end if;
  if new.body is distinct from old.body then new.edited_at := now(); end if;
  return new;
end $$;

drop trigger if exists comments_guard on de.comments;
create trigger comments_guard before update on de.comments
  for each row execute function de.comments_guard();

-- ---------------------------------------------------------------- votes
create table if not exists de.votes (
  user_id     uuid not null default auth.uid() references de.profiles (id) on delete cascade,
  kind        text not null check (kind in ('solution', 'comment')),
  target_id   uuid not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, kind, target_id)
);

create or replace function de.votes_apply() returns trigger
language plpgsql security definer set search_path = de, pg_temp as $$
declare v de.votes; d int;
begin
  if tg_op = 'INSERT' then v := new; d := 1; else v := old; d := -1; end if;
  if v.kind = 'solution' then
    update de.shared_solutions set score = score + d where id = v.target_id;
  else
    update de.comments set score = score + d where id = v.target_id;
  end if;
  return null;
end $$;

drop trigger if exists votes_apply on de.votes;
create trigger votes_apply after insert or delete on de.votes
  for each row execute function de.votes_apply();

-- ---------------------------------------------------------------- reports
create table if not exists de.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null default auth.uid() references de.profiles (id) on delete cascade,
  kind         text not null check (kind in ('solution', 'comment')),
  target_id    uuid not null,
  reason       text not null check (char_length(reason) between 1 and 500),
  created_at   timestamptz not null default now(),
  unique (reporter_id, kind, target_id)
);

-- ---------------------------------------------------------------- hourly limits
create or replace function de.enforce_rate_limit() returns trigger
language plpgsql security definer set search_path = de, pg_temp as $$
declare n int;
begin
  execute format('select count(*) from de.%I where user_id = $1 and created_at > now() - interval ''1 hour''', tg_table_name)
    into n using new.user_id;
  if n >= tg_argv[0]::int then
    raise exception 'rate_limit';
  end if;
  return new;
end $$;

drop trigger if exists rate_limit on de.comments;
create trigger rate_limit before insert on de.comments for each row execute function de.enforce_rate_limit(30);
drop trigger if exists rate_limit on de.shared_solutions;
create trigger rate_limit before insert on de.shared_solutions for each row execute function de.enforce_rate_limit(20);
drop trigger if exists rate_limit on de.submissions;
create trigger rate_limit before insert on de.submissions for each row execute function de.enforce_rate_limit(200);

-- ---------------------------------------------------------------- row-level security
alter table de.profiles          enable row level security;
alter table de.progress          enable row level security;
alter table de.submissions       enable row level security;
alter table de.shared_solutions  enable row level security;
alter table de.comments          enable row level security;
alter table de.votes             enable row level security;
alter table de.reports           enable row level security;

-- profiles: everyone signed in can read; nobody can write (the sign-up trigger does it)
drop policy if exists profiles_read on de.profiles;
create policy profiles_read on de.profiles for select to authenticated using (true);

-- progress: private to its owner
drop policy if exists progress_select on de.progress;
create policy progress_select on de.progress for select to authenticated using (user_id = auth.uid());
drop policy if exists progress_insert on de.progress;
create policy progress_insert on de.progress for insert to authenticated with check (user_id = auth.uid());
drop policy if exists progress_update on de.progress;
create policy progress_update on de.progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- submissions: private to their owner
drop policy if exists submissions_select on de.submissions;
create policy submissions_select on de.submissions for select to authenticated using (user_id = auth.uid());
drop policy if exists submissions_insert on de.submissions;
create policy submissions_insert on de.submissions for insert to authenticated with check (user_id = auth.uid());
drop policy if exists submissions_delete on de.submissions;
create policy submissions_delete on de.submissions for delete to authenticated using (user_id = auth.uid());

-- shared solutions
drop policy if exists solutions_select on de.shared_solutions;
create policy solutions_select on de.shared_solutions for select to authenticated using (
  user_id = auth.uid()
  or de.is_moderator()
  or (
    not hidden
    and exists (
      select 1 from de.progress p
      where p.user_id = auth.uid()
        and p.problem_id = shared_solutions.problem_id
        and (p.solved_at is not null or p.hints_used >= 4)
    )
  )
);
drop policy if exists solutions_insert on de.shared_solutions;
create policy solutions_insert on de.shared_solutions for insert to authenticated with check (
  user_id = auth.uid()
  and exists (
    select 1 from de.progress p
    where p.user_id = auth.uid() and p.problem_id = shared_solutions.problem_id and p.solved_at is not null
  )
);
drop policy if exists solutions_update on de.shared_solutions;
create policy solutions_update on de.shared_solutions for update to authenticated
  using (user_id = auth.uid() or de.is_moderator())
  with check (user_id = auth.uid() or de.is_moderator());
drop policy if exists solutions_delete on de.shared_solutions;
create policy solutions_delete on de.shared_solutions for delete to authenticated
  using (user_id = auth.uid() or de.is_moderator());

-- comments
drop policy if exists comments_select on de.comments;
create policy comments_select on de.comments for select to authenticated
  using (not hidden or user_id = auth.uid() or de.is_moderator());
drop policy if exists comments_insert on de.comments;
create policy comments_insert on de.comments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists comments_update on de.comments;
create policy comments_update on de.comments for update to authenticated
  using (user_id = auth.uid() or de.is_moderator())
  with check (user_id = auth.uid() or de.is_moderator());
drop policy if exists comments_delete on de.comments;
create policy comments_delete on de.comments for delete to authenticated
  using (user_id = auth.uid() or de.is_moderator());

-- votes: you see and change only your own, and only on things you can see that are not yours
drop policy if exists votes_select on de.votes;
create policy votes_select on de.votes for select to authenticated using (user_id = auth.uid());
drop policy if exists votes_insert on de.votes;
create policy votes_insert on de.votes for insert to authenticated with check (
  user_id = auth.uid()
  and (
    (kind = 'solution' and exists (select 1 from de.shared_solutions s where s.id = votes.target_id and s.user_id <> auth.uid()))
    or (kind = 'comment' and exists (select 1 from de.comments c where c.id = votes.target_id and c.user_id <> auth.uid()))
  )
);
drop policy if exists votes_delete on de.votes;
create policy votes_delete on de.votes for delete to authenticated using (user_id = auth.uid());

-- reports: anyone signed in can file one; only moderators can read them
drop policy if exists reports_select on de.reports;
create policy reports_select on de.reports for select to authenticated using (de.is_moderator());
drop policy if exists reports_insert on de.reports;
create policy reports_insert on de.reports for insert to authenticated with check (reporter_id = auth.uid());

-- ---------------------------------------------------------------- grants
-- A new schema gets no grants for the API roles. Give authenticated exactly what it needs, and anon nothing.
revoke all on all tables in schema de from anon, authenticated;
revoke all on schema de from anon;
grant usage on schema de to authenticated;
grant select                         on de.profiles         to authenticated;
grant select, insert, update         on de.progress         to authenticated;
grant select, insert, delete         on de.submissions      to authenticated;
grant select, insert, update, delete on de.shared_solutions to authenticated;
grant select, insert, update, delete on de.comments         to authenticated;
grant select, insert, delete         on de.votes            to authenticated;
grant select, insert                 on de.reports          to authenticated;

-- functions: trigger functions are not meant to be called from the API; the two helpers are for signed-in people only
revoke execute on function de.votes_apply()        from public, anon, authenticated;
revoke execute on function de.enforce_rate_limit() from public, anon, authenticated;
revoke execute on function de.ensure_profile()     from public, anon;
revoke execute on function de.is_moderator()       from public, anon;
grant  execute on function de.ensure_profile()     to authenticated;
grant  execute on function de.is_moderator()       to authenticated;
