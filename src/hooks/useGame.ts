import { useState, useCallback } from 'react';
import type { Board, GameStatus, Player, Scores } from '../types/game';
import type { PlayerProfile } from '../types/game';
import { checkWinner, checkDraw } from '../utils/checkWinner';
import { recordGame } from '../store/communityStore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function emptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningLine: [number, number, number] | null;
  scores: Scores;
  handleCellClick: (index: number) => void;
  restartGame: () => void;
  newGame: () => void;
  resetScores: () => void;
}

export interface CommunityGameOptions {
  communityId: string;
  playerX: PlayerProfile;
  playerO: PlayerProfile;
}

export function useGame(community?: CommunityGameOptions): GameState {
  const [board, setBoard]               = useState<Board>(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [status, setStatus]             = useState<GameStatus>('playing');
  const [winner, setWinner]             = useState<Player | null>(null);
  const [winningLine, setWinningLine]   = useState<[number, number, number] | null>(null);
  const [scores, setScores]             = useState<Scores>({ X: 0, O: 0, draws: 0 });

  // ── Cell click ──────────────────────────────────────────────────────────────
  const handleCellClick = useCallback(
    (index: number) => {
      if (board[index] !== null || status !== 'playing') return;

      const nextBoard = board.slice() as Board;
      nextBoard[index] = currentPlayer;

      const result = checkWinner(nextBoard);

      if (result) {
        setBoard(nextBoard);
        setStatus('won');
        setWinner(result.winner);
        setWinningLine(result.line);

        const updated: Scores = { ...scores, [result.winner]: scores[result.winner] + 1 };
        setScores(updated);

        // Record result in community store
        if (community) {
          const winnerId = result.winner === 'X' ? community.playerX.id : community.playerO.id;
          recordGame(community.communityId, community.playerX.id, community.playerO.id, winnerId);
        }
      } else if (checkDraw(nextBoard)) {
        setBoard(nextBoard);
        setStatus('draw');

        const updated: Scores = { ...scores, draws: scores.draws + 1 };
        setScores(updated);

        if (community) {
          recordGame(community.communityId, community.playerX.id, community.playerO.id, null);
        }
      } else {
        setBoard(nextBoard);
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      }
    },
    [board, currentPlayer, status, scores, community],
  );

  // ── Restart (keep scores) ───────────────────────────────────────────────────
  const restartGame = useCallback(() => {
    setBoard(emptyBoard());
    setCurrentPlayer('X');
    setStatus('playing');
    setWinner(null);
    setWinningLine(null);
  }, []);

  const newGame = restartGame;

  // ── Reset scores ────────────────────────────────────────────────────────────
  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0, draws: 0 });
    restartGame();
  }, [restartGame]);

  return {
    board, currentPlayer, status, winner, winningLine, scores,
    handleCellClick, restartGame, newGame, resetScores,
  };
}
