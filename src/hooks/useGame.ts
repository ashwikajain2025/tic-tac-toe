import { useState, useCallback } from 'react';
import type { Board, GameStatus, Player, Scores } from '../types/game';
import { checkWinner, checkDraw } from '../utils/checkWinner';

// ─── localStorage key ────────────────────────────────────────────────────────
const SCORES_KEY = 'ttt_scores';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a blank 9-cell board. */
function emptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}

/** Reads scores from localStorage, falling back to zeroes. */
function loadScores(): Scores {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (raw) return JSON.parse(raw) as Scores;
  } catch {
    // Corrupted storage — start fresh
  }
  return { X: 0, O: 0, draws: 0 };
}

/** Persists scores to localStorage. */
function saveScores(scores: Scores): void {
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningLine: [number, number, number] | null;
  scores: Scores;
  /** Handle a player clicking a board cell. */
  handleCellClick: (index: number) => void;
  /** Reset the board for another round (scores are preserved). */
  restartGame: () => void;
  /** Alias for restartGame — semantically a "new game" for the UI. */
  newGame: () => void;
  /** Zero out all scores and start a fresh game. */
  resetScores: () => void;
}

export function useGame(): GameState {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [status, setStatus] = useState<GameStatus>('playing');
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<[number, number, number] | null>(null);
  const [scores, setScores] = useState<Scores>(loadScores);

  // ── Cell click ──────────────────────────────────────────────────────────────
  const handleCellClick = useCallback(
    (index: number) => {
      // Guard: ignore clicks on occupied cells or after the game ends
      if (board[index] !== null || status !== 'playing') return;

      const nextBoard = board.slice() as Board;
      nextBoard[index] = currentPlayer;

      // Check outcome of this move
      const result = checkWinner(nextBoard);

      if (result) {
        // Someone won
        setBoard(nextBoard);
        setStatus('won');
        setWinner(result.winner);
        setWinningLine(result.line);

        const updated: Scores = {
          ...scores,
          [result.winner]: scores[result.winner] + 1,
        };
        setScores(updated);
        saveScores(updated);
      } else if (checkDraw(nextBoard)) {
        // All cells filled, no winner
        setBoard(nextBoard);
        setStatus('draw');

        const updated: Scores = { ...scores, draws: scores.draws + 1 };
        setScores(updated);
        saveScores(updated);
      } else {
        // Game continues — swap player
        setBoard(nextBoard);
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      }
    },
    [board, currentPlayer, status, scores],
  );

  // ── Restart (keep scores) ───────────────────────────────────────────────────
  const restartGame = useCallback(() => {
    setBoard(emptyBoard());
    setCurrentPlayer('X');
    setStatus('playing');
    setWinner(null);
    setWinningLine(null);
  }, []);

  // ── New game is functionally identical to restart for this feature set ───────
  const newGame = restartGame;

  // ── Reset scores ────────────────────────────────────────────────────────────
  const resetScores = useCallback(() => {
    const fresh: Scores = { X: 0, O: 0, draws: 0 };
    setScores(fresh);
    saveScores(fresh);
    restartGame();
  }, [restartGame]);

  return {
    board,
    currentPlayer,
    status,
    winner,
    winningLine,
    scores,
    handleCellClick,
    restartGame,
    newGame,
    resetScores,
  };
}
