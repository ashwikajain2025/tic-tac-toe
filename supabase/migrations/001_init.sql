-- ─────────────────────────────────────────────────────────────────────────────
-- Tic Tac Toe – community multiplayer schema
-- Run this once in your Supabase project:
--   Dashboard → SQL Editor → paste & run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Communities ───────────────────────────────────────────────────────────────
create table if not exists communities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive unique community name (expression index, not inline constraint)
create unique index if not exists communities_name_ci_unique
  on communities (lower(name));

-- ── Players ───────────────────────────────────────────────────────────────────
create table if not exists players (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  community_id uuid not null references communities(id) on delete cascade,
  slot         smallint not null check (slot in (1, 2)),  -- 1 = X, 2 = O
  wins         integer not null default 0,
  losses       integer not null default 0,
  draws        integer not null default 0,
  games_played integer not null default 0,
  -- one player per slot per community
  constraint players_community_slot_unique unique (community_id, slot)
);

-- Case-insensitive unique player name per community (expression index)
create unique index if not exists players_community_name_ci_unique
  on players (community_id, lower(name));

-- ── Game records ──────────────────────────────────────────────────────────────
create table if not exists game_records (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  player_x_id  uuid not null references players(id),
  player_o_id  uuid not null references players(id),
  winner_id    uuid references players(id),  -- null = draw
  played_at    timestamptz not null default now()
);

-- ── Leaderboard view ──────────────────────────────────────────────────────────
create or replace view leaderboard as
  select
    p.id,
    p.name,
    p.community_id,
    c.name  as community_name,
    p.wins,
    p.losses,
    p.draws,
    p.games_played,
    case when p.games_played > 0
         then round((p.wins::numeric / p.games_played) * 100)
         else 0
    end as win_rate
  from players p
  join communities c on c.id = p.community_id
  where p.games_played > 0
  order by win_rate desc, p.wins desc;

-- ── Row-level security (anon users can read/write everything) ─────────────────
alter table communities  enable row level security;
alter table players      enable row level security;
alter table game_records enable row level security;

-- communities
create policy "anon read communities"
  on communities for select using (true);
create policy "anon insert communities"
  on communities for insert with check (true);

-- players
create policy "anon read players"
  on players for select using (true);
create policy "anon insert players"
  on players for insert with check (true);
create policy "anon update players"
  on players for update using (true);

-- game_records
create policy "anon read game_records"
  on game_records for select using (true);
create policy "anon insert game_records"
  on game_records for insert with check (true);

-- leaderboard view inherits the underlying table policies — no extra policy needed.
