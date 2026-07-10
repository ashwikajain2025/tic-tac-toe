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
