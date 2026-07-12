// Core type for a board cell value
export type Player = 'X' | 'O';

// A cell can be occupied by a player or empty
export type CellValue = Player | null;

// The board is a flat array of 9 cells (indices 0-8)
export type Board = [
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
];

// Result returned by the winner-checking utility
export interface WinnerResult {
  /** The player who won */
  winner: Player;
  /** The three cell indices that form the winning line */
  line: [number, number, number];
}

// All possible game-end states
export type GameStatus = 'playing' | 'won' | 'draw';

// Persisted score counters stored in localStorage
export interface Scores {
  X: number;
  O: number;
  draws: number;
}

// ─── Community / multiplayer types ────────────────────────────────────────────

/** A named player who has joined a community. */
export interface PlayerProfile {
  id: string;           // unique uuid
  name: string;
  communityId: string;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
}

/** A community that two players join to play together. */
export interface Community {
  id: string;           // unique uuid
  name: string;
  createdAt: number;    // timestamp
  playerIds: [string, string] | [string]; // 1 or 2 members
}

/** A single completed game record. */
export interface GameRecord {
  id: string;
  communityId: string;
  playerXId: string;
  playerOId: string;
  winnerId: string | null; // null = draw
  playedAt: number;
}

/** Entry for the global leaderboard. */
export interface LeaderboardEntry {
  player: PlayerProfile;
  communityName: string;
  winRate: number;      // 0-100
}
