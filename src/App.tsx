import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { GameBoard } from './components/Board';
import { Status } from './components/Status';
import { ScoreBoard } from './components/ScoreBoard';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// ─── Dark-mode helpers ────────────────────────────────────────────────────────

const DARK_KEY = 'ttt_dark';

function getInitialDark(): boolean {
  const stored = localStorage.getItem(DARK_KEY);
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(getInitialDark);

  const {
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
  } = useGame();

  // Apply / remove the Tailwind "dark" class on <html> whenever isDark changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(DARK_KEY, String(isDark));
  }, [isDark]);

  const toggleDark = () => setIsDark((d) => !d);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center px-4 py-10 transition-colors duration-300">
      <main className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Header isDark={isDark} onToggleDark={toggleDark} />

        {/* ── Status message ──────────────────────────────────────────────── */}
        <Status
          status={status}
          currentPlayer={currentPlayer}
          winner={winner}
        />

        {/* ── Game board ──────────────────────────────────────────────────── */}
        <GameBoard
          board={board}
          winningLine={winningLine}
          isActive={status === 'playing'}
          onCellClick={handleCellClick}
        />

        {/* ── Action buttons ──────────────────────────────────────────────── */}
        <div className="flex gap-3 w-full">
          <button
            onClick={restartGame}
            aria-label="Restart game"
            className={[
              'flex-1 py-3 rounded-xl font-semibold text-sm',
              'bg-violet-600 hover:bg-violet-700 active:bg-violet-800',
              'text-white shadow-sm',
              'active:scale-95 transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400',
            ].join(' ')}
          >
            Restart
          </button>

          <button
            onClick={newGame}
            aria-label="New game"
            className={[
              'flex-1 py-3 rounded-xl font-semibold text-sm',
              'bg-rose-500 hover:bg-rose-600 active:bg-rose-700',
              'text-white shadow-sm',
              'active:scale-95 transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400',
            ].join(' ')}
          >
            New Game
          </button>
        </div>

        {/* ── Scoreboard ──────────────────────────────────────────────────── */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <ScoreBoard scores={scores} onResetScores={resetScores} />
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <Footer />
      </main>
    </div>
  );
}
