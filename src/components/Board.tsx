import { Cell } from './Cell';
import type { Board } from '../types/game';

interface BoardProps {
  board: Board;
  winningLine: [number, number, number] | null;
  isActive: boolean;
  onCellClick: (index: number) => void;
}

/**
 * Renders the 3×3 grid.  Each Cell is independently animated and coloured
 * based on whether it belongs to the winning combination.
 */
export function GameBoard({ board, winningLine, isActive, onCellClick }: BoardProps) {
  return (
    <div
      role="grid"
      aria-label="Tic Tac Toe board"
      className="grid grid-cols-3 gap-3 w-full max-w-xs sm:max-w-sm mx-auto"
    >
      {board.map((cell, idx) => (
        <Cell
          key={idx}
          index={idx}
          value={cell}
          isWinning={winningLine?.includes(idx) ?? false}
          isActive={isActive}
          onClick={() => onCellClick(idx)}
        />
      ))}
    </div>
  );
}
