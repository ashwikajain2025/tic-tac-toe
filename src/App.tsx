import { useState, useEffect, useCallback } from 'react';
import { useGame } from './hooks/useGame';
import type { CommunityGameOptions } from './hooks/useGame';
import { GameBoard } from './components/Board';
import { Status } from './components/Status';
import { ScoreBoard } from './components/ScoreBoard';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LobbyScreen } from './components/LobbyScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import type { Community, PlayerProfile } from './types/game';

// ─── Dark-mode helpers ────────────────────────────────────────────────────────

const DARK_KEY = 'ttt_dark';

function getInitialDark(): boolean {
  const stored = localStorage.getItem(DARK_KEY);
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ─── Screen types ─────────────────────────────────────────────────────────────

type Screen = 'lobby' | 'game' | 'leaderboard';

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(getInitialDark);
  const [screen, setScreen] = useState<Screen>('lobby');

  // Community session — set when both players have joined
  const [communitySession, setCommunitySession] = useState<{
    community: Community;
    playerX: PlayerProfile;
    playerO: PlayerProfile;
  } | null>(null);

  const communityOptions: CommunityGameOptions | undefined = communitySession
    ? { communityId: communitySession.community.id, playerX: communitySession.playerX, playerO: communitySession.playerO }
    : undefined;

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
  } = useGame(communityOptions);

  // Apply / remove the Tailwind "dark" class on <html> whenever isDark changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(DARK_KEY, String(isDark));
  }, [isDark]);

  const toggleDark = () => setIsDark((d) => !d);

  // Called by LobbyScreen when both players are ready
  const handleReady = useCallback((community: Community, playerX: PlayerProfile, playerO: PlayerProfile) => {
    setCommunitySession({ community, playerX, playerO });
    setScreen('game');
  }, []);

  // Leave game back to lobby — also resets the game state via newGame
  const handleLeaveCommunity = () => {
    newGame();
    resetScores();
    setCommunitySession(null);
    setScreen('lobby');
  };

  const playerNames = communitySession
    ? { X: communitySession.playerX.name, O: communitySession.playerO.name }
    : undefined;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center px-4 py-10 transition-colors duration-300">
      <main className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* ── Dark-mode toggle (always visible) ──────────────────────────── */}
        <Header isDark={isDark} onToggleDark={toggleDark} />

        {/* ── Lobby ──────────────────────────────────────────────────────── */}
        {screen === 'lobby' && (
          <LobbyScreen
            onReady={handleReady}
            onLeaderboard={() => setScreen('leaderboard')}
          />
        )}

        {/* ── Leaderboard ────────────────────────────────────────────────── */}
        {screen === 'leaderboard' && (
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
            <LeaderboardScreen onBack={() => setScreen(communitySession ? 'game' : 'lobby')} />
          </div>
        )}

        {/* ── Game ───────────────────────────────────────────────────────── */}
        {screen === 'game' && communitySession && (
          <>
            {/* Community banner */}
            <div className="w-full flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl px-4 py-2 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Community</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{communitySession.community.name}</p>
              </div>
              <button
                onClick={() => setScreen('leaderboard')}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
              >
                🏆 Board
              </button>
            </div>

            {/* Status */}
            <Status
              status={status}
              currentPlayer={currentPlayer}
              winner={winner}
              playerNames={playerNames}
            />

            {/* Game board */}
            <GameBoard
              board={board}
              winningLine={winningLine}
              isActive={status === 'playing'}
              onCellClick={handleCellClick}
            />

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={restartGame}
                aria-label="Restart game"
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-sm active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400"
              >
                Restart
              </button>
              <button
                onClick={newGame}
                aria-label="New game"
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white shadow-sm active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400"
              >
                New Game
              </button>
              <button
                onClick={handleLeaveCommunity}
                aria-label="Leave community"
                className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
              >
                Leave
              </button>
            </div>

            {/* Scoreboard */}
            <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <ScoreBoard scores={scores} onResetScores={resetScores} playerNames={playerNames} />
            </div>
          </>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <Footer />
      </main>
    </div>
  );
}
