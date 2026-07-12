/**
 * In-memory community database.
 * All data lives in module-level Maps and is shared across the app for the
 * lifetime of the browser session.  Nothing is written to localStorage —
 * truly in-memory as requested.
 */

import type { Community, PlayerProfile, GameRecord, LeaderboardEntry } from '../types/game';

// ─── Storage ─────────────────────────────────────────────────────────────────

const communities = new Map<string, Community>();
const players     = new Map<string, PlayerProfile>();
const gameRecords = new Map<string, GameRecord>();

// ─── Tiny uuid helper (no dependency needed) ─────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── Community operations ────────────────────────────────────────────────────

/** Create a new community and return it. */
export function createCommunity(name: string): Community {
  const id = uid();
  const community: Community = { id, name, createdAt: Date.now(), playerIds: [] as unknown as [string] };
  communities.set(id, community);
  return community;
}

/** Find a community by its name (case-insensitive). Returns undefined if not found. */
export function findCommunityByName(name: string): Community | undefined {
  const lower = name.trim().toLowerCase();
  for (const c of communities.values()) {
    if (c.name.trim().toLowerCase() === lower) return c;
  }
  return undefined;
}

/** Get a community by id. */
export function getCommunity(id: string): Community | undefined {
  return communities.get(id);
}

/** Return all communities. */
export function getAllCommunities(): Community[] {
  return Array.from(communities.values());
}

// ─── Player operations ───────────────────────────────────────────────────────

/**
 * Join (or re-join) a community with a given player name.
 * If a player with that name already exists in the community, returns them.
 * If the community already has 2 members neither of whom matches, throws.
 */
export function joinCommunity(communityId: string, playerName: string): PlayerProfile {
  const community = communities.get(communityId);
  if (!community) throw new Error('Community not found');

  const trimmed = playerName.trim();

  // Check if player already exists in community
  for (const pid of community.playerIds) {
    const p = players.get(pid);
    if (p && p.name.toLowerCase() === trimmed.toLowerCase()) return p;
  }

  if (community.playerIds.length >= 2) {
    throw new Error('Community already has 2 players');
  }

  const id = uid();
  const profile: PlayerProfile = {
    id, name: trimmed, communityId,
    wins: 0, losses: 0, draws: 0, gamesPlayed: 0,
  };
  players.set(id, profile);

  // Append player to community
  (community.playerIds as string[]).push(id);
  communities.set(communityId, community);

  return profile;
}

/** Get players in a community (ordered: first-joined = X, second-joined = O). */
export function getCommunityPlayers(communityId: string): [PlayerProfile, PlayerProfile] | null {
  const community = communities.get(communityId);
  if (!community || community.playerIds.length < 2) return null;
  const ids = community.playerIds as string[];
  const p1 = players.get(ids[0]);
  const p2 = players.get(ids[1]);
  if (!p1 || !p2) return null;
  return [p1, p2];
}

/** Return all communities a player (by name) is a member of, along with their profile. */
export function getCommunitiesForPlayer(
  playerName: string,
): Array<{ community: Community; player: PlayerProfile }> {
  const lower = playerName.trim().toLowerCase();
  const result: Array<{ community: Community; player: PlayerProfile }> = [];

  for (const player of players.values()) {
    if (player.name.toLowerCase() !== lower) continue;
    const community = communities.get(player.communityId);
    if (community) result.push({ community, player });
  }

  return result;
}

// ─── Game record operations ──────────────────────────────────────────────────

/** Record a completed game and update player stats. */
export function recordGame(
  communityId: string,
  playerXId: string,
  playerOId: string,
  winnerId: string | null,
): GameRecord {
  const record: GameRecord = {
    id: uid(),
    communityId,
    playerXId,
    playerOId,
    winnerId,
    playedAt: Date.now(),
  };
  gameRecords.set(record.id, record);

  // Update stats
  const updatePlayer = (id: string, result: 'win' | 'loss' | 'draw') => {
    const p = players.get(id);
    if (!p) return;
    const updated: PlayerProfile = {
      ...p,
      gamesPlayed: p.gamesPlayed + 1,
      wins:   result === 'win'  ? p.wins + 1   : p.wins,
      losses: result === 'loss' ? p.losses + 1 : p.losses,
      draws:  result === 'draw' ? p.draws + 1  : p.draws,
    };
    players.set(id, updated);
  };

  if (winnerId === null) {
    updatePlayer(playerXId, 'draw');
    updatePlayer(playerOId, 'draw');
  } else {
    const loserId = winnerId === playerXId ? playerOId : playerXId;
    updatePlayer(winnerId, 'win');
    updatePlayer(loserId,  'loss');
  }

  return record;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

/** Returns all players across all communities sorted by win-rate desc, then wins desc. */
export function getLeaderboard(): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];

  for (const player of players.values()) {
    if (player.gamesPlayed === 0) continue;
    const community = communities.get(player.communityId);
    const winRate = Math.round((player.wins / player.gamesPlayed) * 100);
    entries.push({
      player,
      communityName: community?.name ?? '—',
      winRate,
    });
  }

  return entries.sort((a, b) =>
    b.winRate - a.winRate || b.player.wins - a.player.wins,
  );
}
