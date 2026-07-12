import type { Scores } from '../types/game';

interface ScoreBoardProps {
  scores: Scores;
  onResetScores: () => void;
  /** Named player labels — if provided, shown instead of "X" / "O" */
  playerNames?: { X: string; O: string };
}

interface ScoreCardProps {
  label: string;
  value: number;
  accent: string;
}

function ScoreCard({ label, value, accent }: ScoreCardProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-1',
        'rounded-xl px-3 py-3 flex-1',
        'border-2',
        accent,
      ].join(' ')}
    >
      <span className="text-2xl font-extrabold leading-none">{value}</span>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-75 text-center leading-tight">{label}</span>
    </div>
  );
}

export function ScoreBoard({ scores, onResetScores, playerNames }: ScoreBoardProps) {
  const xLabel = playerNames ? `${playerNames.X}` : 'X Wins';
  const oLabel = playerNames ? `${playerNames.O}` : 'O Wins';

  return (
    <section aria-label="Scoreboard" className="w-full">
      <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
        Scoreboard
      </h2>

      <div className="flex gap-3 mb-4">
        <ScoreCard
          label={xLabel}
          value={scores.X}
          accent="border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
        />
        <ScoreCard
          label="Draws"
          value={scores.draws}
          accent="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800"
        />
        <ScoreCard
          label={oLabel}
          value={scores.O}
          accent="border-rose-300 dark:border-rose-700 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20"
        />
      </div>

      <button
        onClick={onResetScores}
        className={[
          'w-full py-2 rounded-xl text-sm font-semibold',
          'border-2 border-slate-300 dark:border-slate-600',
          'text-slate-500 dark:text-slate-400',
          'hover:bg-slate-100 dark:hover:bg-slate-700',
          'active:scale-95 transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400',
        ].join(' ')}
        aria-label="Reset all scores"
      >
        Reset Scores
      </button>
    </section>
  );
}
