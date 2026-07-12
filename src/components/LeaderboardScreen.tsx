import { useState, useEffect } from 'react';
import { getLeaderboard } from '../store/communityStore';
import type { LeaderboardEntry } from '../types/game';

interface LeaderboardScreenProps {
  onBack: () => void;
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div>
        <button onClick={onBack}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-3 flex items-center gap-1 transition-colors">
          ← Back
        </button>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">🏆 Leaderboard</h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Top players across all communities</p>
      </div>

      {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-violet-500 animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
          No games played yet.<br />Start a community to get on the board!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => (
            <div key={entry.player.id}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors',
                i === 0 ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                  : i === 1 ? 'border-slate-300 dark:border-slate-500 bg-slate-50 dark:bg-slate-800'
                  : i === 2 ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
              ].join(' ')}>
              <span className="text-lg font-black w-7 text-center shrink-0">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{entry.player.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{entry.communityName}</p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400">
                  {entry.winRate}% WR
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {entry.player.wins}W · {entry.player.losses}L · {entry.player.draws}D
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
