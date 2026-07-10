import type { CellValue } from '../types/game';

interface CellProps {
  /** The value currently occupying this cell */
  value: CellValue;
  /** Board index (0-8) used for ARIA labelling */
  index: number;
  /** Whether this cell is part of the winning combination */
  isWinning: boolean;
  /** Whether the game is still ongoing (enables hover effects) */
  isActive: boolean;
  /** Callback fired when the user clicks/activates the cell */
  onClick: () => void;
}

/** Maps a player marker to its display colour classes. */
const PLAYER_COLORS: Record<string, string> = {
  X: 'text-violet-600 dark:text-violet-400',
  O: 'text-rose-500  dark:text-rose-400',
};

/** Human-readable row/column label for screen readers. */
function cellLabel(index: number, value: CellValue): string {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const occupied = value ? `occupied by ${value}` : 'empty';
  return `Row ${row}, Column ${col}, ${occupied}`;
}

export function Cell({ value, index, isWinning, isActive, onClick }: CellProps) {
  const isEmpty = value === null;

  return (
    <button
      onClick={onClick}
      disabled={!isEmpty || !isActive}
      aria-label={cellLabel(index, value)}
      className={[
        // Base layout & shape
        'relative flex items-center justify-center',
        'w-full aspect-square rounded-2xl',
        'text-4xl sm:text-5xl font-extrabold select-none',
        'transition-all duration-200',
        // Border / background
        'border-2',
        isWinning
          ? 'border-amber-400 bg-amber-50  dark:bg-amber-900/30 scale-105 shadow-lg'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
        // Hover — only on empty, active cells
        isEmpty && isActive
          ? 'hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-violet-400 dark:hover:border-violet-500 cursor-pointer hover:scale-105'
          : 'cursor-default',
        // Focus ring for keyboard navigation
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {value && (
        <span className={`animate-pop ${PLAYER_COLORS[value]}`}>
          {value}
        </span>
      )}
    </button>
  );
}
