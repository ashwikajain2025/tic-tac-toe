import { useState } from 'react';
import {
  createCommunity,
  findCommunityByName,
  joinCommunity,
  getCommunityPlayers,
} from '../store/communityStore';
import type { Community, PlayerProfile } from '../types/game';

type LobbyStep = 'choose' | 'create' | 'join' | 'waiting';

interface LobbyScreenProps {
  onReady: (community: Community, playerX: PlayerProfile, playerO: PlayerProfile) => void;
  onLeaderboard: () => void;
}

export function LobbyScreen({ onReady, onLeaderboard }: LobbyScreenProps) {
  const [step, setStep]           = useState<LobbyStep>('choose');
  const [communityName, setCommunityName] = useState('');
  const [playerName, setPlayerName]       = useState('');
  const [error, setError]                 = useState('');
  const [createdCommunity, setCreatedCommunity] = useState<Community | null>(null);
  const [joinedPlayer, setJoinedPlayer]         = useState<PlayerProfile | null>(null);

  // ── Step: choose action ──────────────────────────────────────────────────────
  if (step === 'choose') {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Tic Tac Toe
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Community multiplayer
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => setStep('create')}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-700 text-white active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400"
          >
            Create a Community
          </button>
          <button
            onClick={() => setStep('join')}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400"
          >
            Join a Community
          </button>
          <button
            onClick={onLeaderboard}
            className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
          >
            🏆 Leaderboard
          </button>
        </div>
      </div>
    );
  }

  // ── Step: create community ───────────────────────────────────────────────────
  if (step === 'create') {
    const handleCreate = () => {
      setError('');
      const name = communityName.trim();
      const pName = playerName.trim();
      if (!name) { setError('Enter a community name.'); return; }
      if (!pName) { setError('Enter your player name.'); return; }
      if (findCommunityByName(name)) { setError('A community with that name already exists. Try joining it instead.'); return; }

      const community = createCommunity(name);
      const player    = joinCommunity(community.id, pName);
      setCreatedCommunity(community);
      setJoinedPlayer(player);
      setStep('waiting');
    };

    return (
      <FormCard
        title="Create a Community"
        subtitle="Choose a name for your group"
        onBack={() => { setError(''); setStep('choose'); }}
        onSubmit={handleCreate}
        submitLabel="Create"
        error={error}
      >
        <Field label="Community name" value={communityName} onChange={setCommunityName} placeholder="e.g. Weekend Warriors" />
        <Field label="Your name" value={playerName} onChange={setPlayerName} placeholder="e.g. Alice" />
      </FormCard>
    );
  }

  // ── Step: join existing community ────────────────────────────────────────────
  if (step === 'join') {
    const handleJoin = () => {
      setError('');
      const name = communityName.trim();
      const pName = playerName.trim();
      if (!name)  { setError('Enter the community name.'); return; }
      if (!pName) { setError('Enter your player name.');  return; }

      const community = findCommunityByName(name);
      if (!community) { setError('Community not found. Ask your friend to create it first.'); return; }

      try {
        const player = joinCommunity(community.id, pName);
        const communityPlayers = getCommunityPlayers(community.id);
        if (communityPlayers) {
          onReady(community, communityPlayers[0], communityPlayers[1]);
        } else {
          // First person joined, now waiting
          setCreatedCommunity(community);
          setJoinedPlayer(player);
          setStep('waiting');
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Could not join.');
      }
    };

    return (
      <FormCard
        title="Join a Community"
        subtitle="Enter the community your friend created"
        onBack={() => { setError(''); setStep('choose'); }}
        onSubmit={handleJoin}
        submitLabel="Join"
        error={error}
      >
        <Field label="Community name" value={communityName} onChange={setCommunityName} placeholder="e.g. Weekend Warriors" />
        <Field label="Your name" value={playerName} onChange={setPlayerName} placeholder="e.g. Bob" />
      </FormCard>
    );
  }

  // ── Step: waiting for 2nd player ─────────────────────────────────────────────
  if (step === 'waiting' && createdCommunity && joinedPlayer) {
    const handleSecondPlayer = () => {
      setError('');
      const pName = playerName.trim();
      if (!pName) { setError('Enter the second player\'s name.'); return; }
      if (pName.toLowerCase() === joinedPlayer.name.toLowerCase()) {
        setError('Both players must have different names.');
        return;
      }
      try {
        joinCommunity(createdCommunity.id, pName);
        const communityPlayers = getCommunityPlayers(createdCommunity.id);
        if (communityPlayers) {
          onReady(createdCommunity, communityPlayers[0], communityPlayers[1]);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Could not join.');
      }
    };

    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            Community created!
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Share the name <span className="font-bold text-violet-600 dark:text-violet-400">"{createdCommunity.name}"</span> with your friend
          </p>
        </div>

        <div className="w-full bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-700 rounded-xl p-4 text-center">
          <p className="text-xs text-violet-500 dark:text-violet-400 font-semibold uppercase tracking-widest mb-1">Player 1 (X)</p>
          <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{joinedPlayer.name}</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Second player's name (O)
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSecondPlayer()}
            placeholder="e.g. Bob"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-400 focus:border-violet-400 transition text-sm"
          />
          {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
          <button
            onClick={handleSecondPlayer}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-700 text-white active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

interface FormCardProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  onSubmit: () => void;
  submitLabel: string;
  error: string;
  children: React.ReactNode;
}

function FormCard({ title, subtitle, onBack, onSubmit, submitLabel, error, children }: FormCardProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      <div>
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-3 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">{title}</h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-4">{children}</div>

      {error && <p className="text-xs text-rose-500 font-semibold -mt-1">{error}</p>}

      <button
        onClick={onSubmit}
        className="w-full py-3 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-700 text-white active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400"
      >
        {submitLabel}
      </button>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

function Field({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-400 focus:border-violet-400 transition text-sm"
      />
    </div>
  );
}
