import type { GameStatus, Player } from '../types/game';

interface StatusProps {
  status: GameStatus;
  currentPlayer: Player;
  winner: Player | null;
}

/** Colour accent classes per player. */
const PLAYER_COLORS: Record<Player, string> = {
  X: 'text-violet-600 dark:text-violet-400 font-bold',
  O: 'text-rose-500  dark:text-rose-400  font-bold',
};

/**
 * Displays a one-line message describing the current game state:
 * whose turn it is, who won, or that the game ended in a draw.
 */
export function Status({ status, currentPlayer, winner }: StatusProps) {
  let message: React.ReactNode;

  if (status === 'won' && winner) {
    message = (
      <>
        Player{' '}
        <span className={PLAYER_COLORS[winner]}>{winner}</span> wins! 🎉
      </>
    );
  } else if (status === 'draw') {
    message = "It's a draw! 🤝";
  } else {
    message = (
      <>
        Player{' '}
        <span className={PLAYER_COLORS[currentPlayer]}>{currentPlayer}</span>'s
        turn
      </>
    );
  }

  return (
    <p
      role="status"
      aria-live="polite"
      className="text-center text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200 animate-fade-in min-h-[1.75rem]"
    >
      {message}
    </p>
  );
}
