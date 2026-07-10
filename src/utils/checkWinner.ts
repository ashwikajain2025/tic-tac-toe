import type { Board, WinnerResult } from '../types/game';

/**
 * All eight winning combinations (row, column, diagonal).
 * Each triplet holds the three board indices that must match.
 */
const WINNING_LINES: [number, number, number][] = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Inspects the current board and returns a WinnerResult when a player
 * has filled one of the eight winning lines, or null otherwise.
 */
export function checkWinner(board: Board): WinnerResult | null {
  for (const [a, b, c] of WINNING_LINES) {
    const cellA = board[a];
    if (cellA && cellA === board[b] && cellA === board[c]) {
      return { winner: cellA, line: [a, b, c] };
    }
  }
  return null;
}

/**
 * Returns true when every cell is occupied (no null values remain).
 * Call this only after confirming there is no winner.
 */
export function checkDraw(board: Board): boolean {
  return board.every((cell) => cell !== null);
}
