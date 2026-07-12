import type { GameStatus, Player } from '../types/game';

interface StatusProps {
  status: GameStatus;
  currentPlayer: Player;
  winner: Player | null;
  /** Named player labels — if provided, shown instead of "X" / "O" */
  playerNames?: { X: string; O: string };
}

/** Colour accent classes per player. */
const PLAYER_COLORS: Record<Player, string> = {
  X: 'text-violet-600 dark:text-violet-400 font-bold',
  O: 'text-rose-500  dark:text-rose-400  font-bold',
};

export function Status({ status, currentPlayer, winner, playerNames }: StatusProps) {
  const nameOf = (p: Player) => playerNames ? `${playerNames[p]} (${p})` : `Player ${p}`;

  let message: React.ReactNode;

  if (status === 'won' && winner) {
    message = (
      <>
        <span className={PLAYER_COLORS[winner]}>{nameOf(winner)}</span> wins! 🎉
      </>
    );
  } else if (status === 'draw') {
    message = "It's a draw! 🤝";
  } else {
    message = (
      <>
        <span className={PLAYER_COLORS[currentPlayer]}>{nameOf(currentPlayer)}</span>
        's turn
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
