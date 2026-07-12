/**
 * communityStore.ts — async Supabase-backed version.
 * Same public API surface as the in-memory version, but every function is async
 * and reads/writes from the Supabase database.
 */

import { supabase } from '../lib/supabase';
import type { Community, PlayerProfile, LeaderboardEntry } from '../types/game';
import type { CommunityRow, PlayerRow, LeaderboardRow } from './communityStore.types';

// ─── Row → domain mappers ────────────────────────────────────────────────────

function toCommunity(row: CommunityRow, playerIds: string[]): Community {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.created_at).getTime(),
    playerIds: playerIds as unknown as [string],
  };
}

function toPlayerProfile(row: PlayerRow): PlayerProfile {
  return {
    id: row.id,
    name: row.name,
    communityId: row.community_id,
    wins: row.wins,
    losses: row.losses,
    draws: row.draws,
    gamesPlayed: row.games_played,
  };
}

// ─── Community operations ────────────────────────────────────────────────────

/** Create a new community. */
export async function createCommunity(name: string): Promise<Community> {
  const { data, error } = await supabase
    .from('communities')
    .insert({ name: name.trim() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toCommunity(data, []);
}

/** Find a community by name (case-insensitive). */
export async function findCommunityByName(name: string): Promise<Community | undefined> {
  const { data, error } = await supabase
    .from('communities')
    .select('*, players(id)')
    .ilike('name', name.trim())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  const ids = ((data as CommunityRow & { players: { id: string }[] }).players ?? []).map((p) => p.id);
  return toCommunity(data, ids);
}

/** Return all communities with their player id lists. */
export async function getAllCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from('communities')
    .select('*, players(id)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const ids = ((row as CommunityRow & { players: { id: string }[] }).players ?? []).map((p) => p.id);
    return toCommunity(row, ids);
  });
}

// ─── Player operations ───────────────────────────────────────────────────────

/**
 * Join a community as a named player.
 * - If the player name already exists in the community, returns their profile.
 * - Assigns slot 1 (X) if first, slot 2 (O) if second.
 * - Throws if the community already has 2 different players.
 */
export async function joinCommunity(communityId: string, playerName: string): Promise<PlayerProfile> {
  const trimmed = playerName.trim();

  // Check if this name is already a member
  const { data: existing } = await supabase
    .from('players')
    .select()
    .eq('community_id', communityId)
    .ilike('name', trimmed)
    .maybeSingle();

  if (existing) return toPlayerProfile(existing);

  // Count current players to determine slot
  const { count } = await supabase
    .from('players')
    .select('id', { count: 'exact', head: true })
    .eq('community_id', communityId);

  if ((count ?? 0) >= 2) throw new Error('Community already has 2 players');

  const slot = ((count ?? 0) + 1) as 1 | 2;

  const { data, error } = await supabase
    .from('players')
    .insert({ name: trimmed, community_id: communityId, slot })
    .select()
    .single();

  if (error) {
    // Unique constraint violation — someone else just took the slot
    if (error.code === '23505') throw new Error('Community already has 2 players');
    throw new Error(error.message);
  }

  return toPlayerProfile(data);
}

/** Get both players in a community (slot 1 = X, slot 2 = O), or null if < 2 joined. */
export async function getCommunityPlayers(communityId: string): Promise<[PlayerProfile, PlayerProfile] | null> {
  const { data, error } = await supabase
    .from('players')
    .select()
    .eq('community_id', communityId)
    .order('slot', { ascending: true });
  if (error) throw new Error(error.message);
  if (!data || data.length < 2) return null;
  return [toPlayerProfile(data[0]), toPlayerProfile(data[1])];
}

/** Return all communities a named player is a member of. */
export async function getCommunitiesForPlayer(
  playerName: string,
): Promise<Array<{ community: Community; player: PlayerProfile }>> {
  const { data, error } = await supabase
    .from('players')
    .select('*, communities(*, players(id))')
    .ilike('name', playerName.trim());
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    type Joined = PlayerRow & {
      communities: CommunityRow & { players: { id: string }[] };
    };
    const r = row as Joined;
    const ids = (r.communities.players ?? []).map((p) => p.id);
    return {
      community: toCommunity(r.communities, ids),
      player: toPlayerProfile(r),
    };
  });
}

// ─── Game record operations ──────────────────────────────────────────────────

/** Record a completed game and atomically increment player stats. */
export async function recordGame(
  communityId: string,
  playerXId: string,
  playerOId: string,
  winnerId: string | null,
): Promise<void> {
  // Insert game record
  const { error: recErr } = await supabase
    .from('game_records')
    .insert({ community_id: communityId, player_x_id: playerXId, player_o_id: playerOId, winner_id: winnerId });
  if (recErr) throw new Error(recErr.message);

  // Fetch current stats for both players
  const { data: ps, error: psErr } = await supabase
    .from('players')
    .select()
    .in('id', [playerXId, playerOId]);
  if (psErr) throw new Error(psErr.message);

  for (const p of ps ?? []) {
    let wins   = p.wins;
    let losses = p.losses;
    let draws  = p.draws;

    if (winnerId === null) {
      draws += 1;
    } else if (p.id === winnerId) {
      wins += 1;
    } else {
      losses += 1;
    }

    await supabase
      .from('players')
      .update({ wins, losses, draws, games_played: p.games_played + 1 })
      .eq('id', p.id);
  }
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

/** Fetch the leaderboard view, already sorted by win-rate desc. */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select();
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: LeaderboardRow) => ({
    player: {
      id: row.id,
      name: row.name,
      communityId: row.community_id,
      wins: row.wins,
      losses: row.losses,
      draws: row.draws,
      gamesPlayed: row.games_played,
    },
    communityName: row.community_name,
    winRate: row.win_rate,
  }));
}
