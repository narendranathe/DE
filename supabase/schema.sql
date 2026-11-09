-- ============================================================================
-- Problem Workspace: community schema for Supabase (Postgres 15+).
--
-- Run this whole file once in the Supabase SQL editor. It is safe to run again.
-- What it makes: profiles, progress, submissions, shared_solutions, comments,
-- votes and reports, all with row-level security, plus the rules the page relies on.
--
-- Rules in one place
--   * Nobody who is signed out can read or write anything.
--   * Only the GitHub handle and avatar are stored. There is no email column.
--   * progress only moves forward: hints never go down and a solve is never undone.
--   * Other people's shared solutions are visible to you only after you solved that
--     question, or opened its full approach (4 reveals). Authors always see their own.
--   * You can share a solution only for a question you solved.
--   * A comment is at most 4000 characters, a title 120, code 20000.
--   * At most 30 comments, 20 solutions and 200 submissions per person per hour.
--   * A moderator can hide a solution or a comment. Hidden items disappear for everyone
--     except their author and moderators. Make someone a moderator by hand:
--         update public.profiles set role = 'moderator' where handle = 'their-github-name';
--   * Deleting a user in Auth deletes everything they made.
-- ============================================================================

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  handle      text not null check (char_length(handle) between 1 and 39),
  avatar_url  text check (avatar_url is null or avatar_url ~ '^https://'),
  role        text not null default 'member' check (role in ('member', 'moderator')),
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, handle, avatar_url)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'user_name', ''),
                  nullif(new.raw_user_meta_data ->> 'preferred_username', ''),
                  'user-' || left(new.id::text, 6)), 39),
    case when new.raw_user_meta_data ->> 'avatar_url' ~ '^https://' then new.raw_user_meta_data ->> 'avatar_url' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_moderator() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'moderator')
$$;

-- ---------------------------------------------------------------- progress
create table if not exists public.progress (
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  problem_id  text not null check (char_length(problem_id) between 1 and 80),
  hints_used  smallint not null default 0 check (hints_used between 0 and 4),
  solved_at   timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, problem_id)
);

create or replace function public.progress_forward_only() returns trigger
language plpgsql as $$
begin
  new.user_id    := old.user_id;
  new.problem_id := old.problem_id;
  new.hints_used := greatest(old.hints_used, new.hints_used);
  new.solved_at  := coalesce(old.solved_at, new.solved_at);
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists progress_forward_only on public.progress;
create trigger progress_forward_only before update on public.progress
  for each row execute function public.progress_forward_only();

-- ---------------------------------------------------------------- submissions
create table if not exists public.submissions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  problem_id  text not null check (char_length(problem_id) between 1 and 80),
  code        text not null check (char_length(code) <= 20000),
  verdict     text not null check (verdict in ('Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded')),
  passed      int not null check (passed >= 0),
  total       int not null check (total >= 0),
  runtime_ms  int check (runtime_ms is null or runtime_ms >= 0),
  hints_used  smallint not null default 0 check (hints_used between 0 and 4),
  created_at  timestamptz not null default now()
);
create index if not exists submissions_by_user on public.submissions (user_id, problem_id, created_at desc);

-- ---------------------------------------------------------------- shared solutions
create table if not exists public.shared_solutions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  problem_id   text not null check (char_length(problem_id) between 1 and 80),
  title        text not null check (char_length(title) between 1 and 120),
  explanation  text not null default '' check (char_length(explanation) <= 4000),
  code         text not null check (char_length(code) between 1 and 20000),
  score        int not null default 0,
  hidden       boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists solutions_by_problem on public.shared_solutions (problem_id, score desc, created_at desc);
create index if not exists solutions_by_user on public.shared_solutions (user_id, created_at);

create or replace function public.solutions_guard() returns trigger
language plpgsql as $$
begin
  new.id := old.id; new.user_id := old.user_id; new.problem_id := old.problem_id;
  new.code := old.code; new.created_at := old.created_at;
  if pg_trigger_depth() = 1 then new.score := old.score; end if;      -- only the vote trigger moves a score
  if not public.is_moderator() then new.hidden := old.hidden; end if; -- only moderators hide
  if old.user_id is distinct from auth.uid() then                     -- a moderator changes nothing but `hidden`
    new.title := old.title; new.explanation := old.explanation;
  end if;
  return new;
end $$;

drop trigger if exists solutions_guard on public.shared_solutions;
create trigger solutions_guard before update on public.shared_solutions
  for each row execute function public.solutions_guard();

-- ---------------------------------------------------------------- comments
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  problem_id  text not null check (char_length(problem_id) between 1 and 80),
  parent_id   uuid references public.comments (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 4000),
  is_spoiler  boolean not null default false,
  score       int not null default 0,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now(),
  edited_at   timestamptz
);
create index if not exists comments_by_problem on public.comments (problem_id, created_at);
create index if not exists comments_by_user on public.comments (user_id, created_at);

-- one level of replies: a reply's parent must be a top-level comment on the same question
create or replace function public.comments_thread() returns trigger
language plpgsql as $$
declare p record;
begin
  if new.parent_id is null then return new; end if;
  select c.problem_id, c.parent_id into p from public.comments c where c.id = new.parent_id;
  if not found or p.problem_id <> new.problem_id or p.parent_id is not null then
    raise exception 'invalid_parent';
  end if;
  return new;
end $$;

drop trigger if exists comments_thread on public.comments;
create trigger comments_thread before insert on public.comments
  for each row execute function public.comments_thread();

create or replace function public.comments_guard() returns trigger
language plpgsql as $$
begin
  new.id := old.id; new.user_id := old.user_id; new.problem_id := old.problem_id;
  new.parent_id := old.parent_id; new.created_at := old.created_at;
  if pg_trigger_depth() = 1 then new.score := old.score; end if;
  if not public.is_moderator() then new.hidden := old.hidden; end if;
  if old.user_id is distinct from auth.uid() then
    new.body := old.body; new.is_spoiler := old.is_spoiler;
  end if;
  if new.body is distinct from old.body then new.edited_at := now(); end if;
  return new;
end $$;

drop trigger if exists comments_guard on public.comments;
create trigger comments_guard before update on public.comments
  for each row execute function public.comments_guard();

-- ---------------------------------------------------------------- votes
create table if not exists public.votes (
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind        text not null check (kind in ('solution', 'comment')),
  target_id   uuid not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, kind, target_id)
);

create or replace function public.votes_apply() returns trigger
language plpgsql security definer set search_path = public as $$
declare v public.votes; d int;
begin
  if tg_op = 'INSERT' then v := new; d := 1; else v := old; d := -1; end if;
  if v.kind = 'solution' then
    update public.shared_solutions set score = score + d where id = v.target_id;
  else
    update public.comments set score = score + d where id = v.target_id;
  end if;
  return null;
end $$;

drop trigger if exists votes_apply on public.votes;
create trigger votes_apply after insert or delete on public.votes
  for each row execute function public.votes_apply();

-- ---------------------------------------------------------------- reports
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind         text not null check (kind in ('solution', 'comment')),
  target_id    uuid not null,
  reason       text not null check (char_length(reason) between 1 and 500),
  created_at   timestamptz not null default now(),
  unique (reporter_id, kind, target_id)
);

-- ---------------------------------------------------------------- hourly limits
create or replace function public.enforce_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  execute format('select count(*) from public.%I where user_id = $1 and created_at > now() - interval ''1 hour''', tg_table_name)
    into n using new.user_id;
  if n >= tg_argv[0]::int then
    raise exception 'rate_limit';
  end if;
  return new;
end $$;

drop trigger if exists rate_limit on public.comments;
create trigger rate_limit before insert on public.comments for each row execute function public.enforce_rate_limit(30);
drop trigger if exists rate_limit on public.shared_solutions;
create trigger rate_limit before insert on public.shared_solutions for each row execute function public.enforce_rate_limit(20);
drop trigger if exists rate_limit on public.submissions;
create trigger rate_limit before insert on public.submissions for each row execute function public.enforce_rate_limit(200);

-- ---------------------------------------------------------------- row-level security
alter table public.profiles          enable row level security;
alter table public.progress          enable row level security;
alter table public.submissions       enable row level security;
alter table public.shared_solutions  enable row level security;
alter table public.comments          enable row level security;
alter table public.votes             enable row level security;
alter table public.reports           enable row level security;

-- profiles: everyone signed in can read; nobody can write (the sign-up trigger does it)
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);

-- progress: private to its owner
drop policy if exists progress_select on public.progress;
create policy progress_select on public.progress for select to authenticated using (user_id = auth.uid());
drop policy if exists progress_insert on public.progress;
create policy progress_insert on public.progress for insert to authenticated with check (user_id = auth.uid());
drop policy if exists progress_update on public.progress;
create policy progress_update on public.progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- submissions: private to their owner
drop policy if exists submissions_select on public.submissions;
create policy submissions_select on public.submissions for select to authenticated using (user_id = auth.uid());
drop policy if exists submissions_insert on public.submissions;
create policy submissions_insert on public.submissions for insert to authenticated with check (user_id = auth.uid());
drop policy if exists submissions_delete on public.submissions;
create policy submissions_delete on public.submissions for delete to authenticated using (user_id = auth.uid());

-- shared solutions
drop policy if exists solutions_select on public.shared_solutions;
create policy solutions_select on public.shared_solutions for select to authenticated using (
  user_id = auth.uid()
  or public.is_moderator()
  or (
    not hidden
    and exists (
      select 1 from public.progress p
      where p.user_id = auth.uid()
        and p.problem_id = shared_solutions.problem_id
        and (p.solved_at is not null or p.hints_used >= 4)
    )
  )
);
drop policy if exists solutions_insert on public.shared_solutions;
create policy solutions_insert on public.shared_solutions for insert to authenticated with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.progress p
    where p.user_id = auth.uid() and p.problem_id = shared_solutions.problem_id and p.solved_at is not null
  )
);
drop policy if exists solutions_update on public.shared_solutions;
create policy solutions_update on public.shared_solutions for update to authenticated
  using (user_id = auth.uid() or public.is_moderator())
  with check (user_id = auth.uid() or public.is_moderator());
drop policy if exists solutions_delete on public.shared_solutions;
create policy solutions_delete on public.shared_solutions for delete to authenticated
  using (user_id = auth.uid() or public.is_moderator());

-- comments
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments for select to authenticated
  using (not hidden or user_id = auth.uid() or public.is_moderator());
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists comments_update on public.comments;
create policy comments_update on public.comments for update to authenticated
  using (user_id = auth.uid() or public.is_moderator())
  with check (user_id = auth.uid() or public.is_moderator());
drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments for delete to authenticated
  using (user_id = auth.uid() or public.is_moderator());

-- votes: you see and change only your own, and only on things you can see that are not yours
drop policy if exists votes_select on public.votes;
create policy votes_select on public.votes for select to authenticated using (user_id = auth.uid());
drop policy if exists votes_insert on public.votes;
create policy votes_insert on public.votes for insert to authenticated with check (
  user_id = auth.uid()
  and (
    (kind = 'solution' and exists (select 1 from public.shared_solutions s where s.id = votes.target_id and s.user_id <> auth.uid()))
    or (kind = 'comment' and exists (select 1 from public.comments c where c.id = votes.target_id and c.user_id <> auth.uid()))
  )
);
drop policy if exists votes_delete on public.votes;
create policy votes_delete on public.votes for delete to authenticated using (user_id = auth.uid());

-- reports: anyone signed in can file one; only moderators can read them
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports for select to authenticated using (public.is_moderator());
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert to authenticated with check (reporter_id = auth.uid());

-- ---------------------------------------------------------------- grants
-- Supabase gives new tables to anon and authenticated by default. Take it all back, then give only what is needed.
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant usage on schema public to authenticated;
grant select                         on public.profiles         to authenticated;
grant select, insert, update         on public.progress         to authenticated;
grant select, insert, delete         on public.submissions      to authenticated;
grant select, insert, update, delete on public.shared_solutions to authenticated;
grant select, insert, update, delete on public.comments         to authenticated;
grant select, insert, delete         on public.votes            to authenticated;
grant select, insert                 on public.reports          to authenticated;

-- trigger functions are not meant to be called from the API
revoke execute on function public.handle_new_user()    from public, anon, authenticated;
revoke execute on function public.votes_apply()        from public, anon, authenticated;
revoke execute on function public.enforce_rate_limit() from public, anon, authenticated;
