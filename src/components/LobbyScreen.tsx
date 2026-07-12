import { useState } from 'react';
import {
  createCommunity,
  findCommunityByName,
  joinCommunity,
  getCommunityPlayers,
  getAllCommunities,
  getCommunitiesForPlayer,
} from '../store/communityStore';
import type { Community, PlayerProfile } from '../types/game';

type LobbyStep = 'home' | 'my-communities' | 'create' | 'join' | 'waiting';

interface LobbyScreenProps {
  onReady: (community: Community, playerX: PlayerProfile, playerO: PlayerProfile) => void;
  onLeaderboard: () => void;
}

export function LobbyScreen({ onReady, onLeaderboard }: LobbyScreenProps) {
  const [step, setStep]                         = useState<LobbyStep>('home');
  const [myName, setMyName]                     = useState('');
  const [communityName, setCommunityName]       = useState('');
  const [secondName, setSecondName]             = useState('');
  const [error, setError]                       = useState('');
  const [waitingCommunity, setWaitingCommunity] = useState<Community | null>(null);
  const [waitingPlayer, setWaitingPlayer]       = useState<PlayerProfile | null>(null);

  // ── helpers ────────────────────────────────────────────────────────────────
  const resetErrors = () => setError('');

  // ── Step: home — enter your name ───────────────────────────────────────────
  if (step === 'home') {
    const handleContinue = () => {
      resetErrors();
      if (!myName.trim()) { setError('Enter your name to continue.'); return; }
      setStep('my-communities');
    };

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

        <div className="flex flex-col gap-4 w-full">
          <Field
            label="Your name"
            value={myName}
            onChange={(v) => { setMyName(v); resetErrors(); }}
            placeholder="e.g. Alice"
            onEnter={handleContinue}
          />
          {error && <p className="text-xs text-rose-500 font-semibold -mt-2">{error}</p>}

          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-700 text-white active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400"
          >
            Continue →
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

  // ── Step: my communities dashboard ────────────────────────────────────────
  if (step === 'my-communities') {
    const memberships = getCommunitiesForPlayer(myName);

    const handlePlay = (community: Community) => {
      const pair = getCommunityPlayers(community.id);
      if (pair) {
        onReady(community, pair[0], pair[1]);
      } else {
        // Player is member but 2nd hasn't joined yet — go to waiting room
        const membership = memberships.find((m) => m.community.id === community.id);
        if (membership) {
          setWaitingCommunity(community);
          setWaitingPlayer(membership.player);
          setSecondName('');
          setStep('waiting');
        }
      }
    };

    return (
      <div className="flex flex-col gap-5 w-full">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            Hey, <span className="text-violet-600 dark:text-violet-400">{myName.trim()}</span> 👋
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Your communities
          </p>
        </div>

        {/* My communities list */}
        {memberships.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            You haven't joined any communities yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {memberships.map(({ community }) => {
              const pair   = getCommunityPlayers(community.id);
              const isFull = pair !== null;

              return (
                <div
                  key={community.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                      {community.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {isFull
                        ? `${pair![0].name} (X) vs ${pair![1].name} (O)`
                        : 'Waiting for second player…'}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePlay(community)}
                    className={[
                      'shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95',
                      isFull
                        ? 'bg-violet-600 hover:bg-violet-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600',
                    ].join(' ')}
                  >
                    {isFull ? '▶ Play' : '⏳ Waiting'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { resetErrors(); setCommunityName(''); setStep('create'); }}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-700 text-white active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400"
          >
            + Create a Community
          </button>
          <button
            onClick={() => { resetErrors(); setCommunityName(''); setStep('join'); }}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400"
          >
            Join a Community
          </button>
        </div>

        <button
          onClick={() => { resetErrors(); setMyName(''); setStep('home'); }}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-center transition-colors"
        >
          ← Switch player
        </button>
      </div>
    );
  }

  // ── Step: create community ─────────────────────────────────────────────────
  if (step === 'create') {
    const handleCreate = () => {
      resetErrors();
      const name = communityName.trim();
      if (!name) { setError('Enter a community name.'); return; }
      if (findCommunityByName(name)) {
        setError('A community with that name already exists. Try joining it instead.');
        return;
      }

      const community = createCommunity(name);
      const player    = joinCommunity(community.id, myName.trim());
      setWaitingCommunity(community);
      setWaitingPlayer(player);
      setSecondName('');
      setStep('waiting');
    };

    return (
      <FormCard
        title="Create a Community"
        subtitle="Choose a name for your group"
        onBack={() => { resetErrors(); setStep('my-communities'); }}
        onSubmit={handleCreate}
        submitLabel="Create"
        error={error}
      >
        <Field
          label="Community name"
          value={communityName}
          onChange={setCommunityName}
          placeholder="e.g. Weekend Warriors"
          onEnter={handleCreate}
        />
        <div className="px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 text-sm text-violet-700 dark:text-violet-300">
          Playing as <span className="font-bold">{myName.trim()}</span> (Player X)
        </div>
      </FormCard>
    );
  }

  // ── Step: join existing community ─────────────────────────────────────────
  if (step === 'join') {
    const allCommunities = getAllCommunities();
    const filter  = communityName.trim().toLowerCase();
    const visible = filter
      ? allCommunities.filter((c) => c.name.toLowerCase().includes(filter))
      : allCommunities;

    const handleJoin = () => {
      resetErrors();
      const name = communityName.trim();
      if (!name) { setError('Select or type a community name.'); return; }

      const community = findCommunityByName(name);
      if (!community) { setError('Community not found. Ask your friend to create it first.'); return; }

      try {
        const player = joinCommunity(community.id, myName.trim());
        const pair   = getCommunityPlayers(community.id);
        if (pair) {
          onReady(community, pair[0], pair[1]);
        } else {
          setWaitingCommunity(community);
          setWaitingPlayer(player);
          setSecondName('');
          setStep('waiting');
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Could not join.');
      }
    };

    return (
      <div className="flex flex-col gap-5 w-full">
        <div>
          <button
            onClick={() => { resetErrors(); setCommunityName(''); setStep('my-communities'); }}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-3 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Join a Community</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Pick one from the list or type its name
          </p>
        </div>

        {/* Player badge */}
        <div className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 text-sm text-rose-700 dark:text-rose-300">
          Joining as <span className="font-bold">{myName.trim()}</span>
        </div>

        {/* Community list */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">🔍</span>
            <input
              type="text"
              value={communityName}
              onChange={(e) => { setCommunityName(e.target.value); resetErrors(); }}
              placeholder="Search communities…"
              className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-400 focus:border-rose-400 transition text-sm"
            />
          </div>

          {allCommunities.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              No communities yet.<br />Ask your friend to create one first.
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              No communities match "{communityName}"
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-0.5">
              {visible.map((c) => {
                const slots      = (c.playerIds as string[]).length;
                const isFull     = slots >= 2;
                const isSelected = communityName.trim().toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.id}
                    disabled={isFull}
                    onClick={() => { setCommunityName(c.name); resetErrors(); }}
                    className={[
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all duration-150',
                      isFull
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-900/20 cursor-pointer'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-300 dark:hover:border-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 cursor-pointer',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{isFull ? '🔒' : '🎮'}</span>
                      <div className="min-w-0">
                        <p className={[
                          'font-semibold text-sm truncate',
                          isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200',
                        ].join(' ')}>
                          {c.name}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {slots === 0 ? 'Open · 2 spots' : slots === 1 ? 'Waiting · 1 spot left' : 'Full'}
                        </p>
                      </div>
                    </div>
                    {isSelected && !isFull && (
                      <span className="text-rose-500 dark:text-rose-400 text-xs font-bold shrink-0 ml-2">Selected ✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-rose-500 font-semibold -mt-1">{error}</p>}

        <button
          onClick={handleJoin}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400"
        >
          Join
        </button>
      </div>
    );
  }

  // ── Step: waiting for 2nd player ──────────────────────────────────────────
  if (step === 'waiting' && waitingCommunity && waitingPlayer) {
    const handleSecondPlayer = () => {
      resetErrors();
      const pName = secondName.trim();
      if (!pName) { setError("Enter the second player's name."); return; }
      if (pName.toLowerCase() === waitingPlayer.name.toLowerCase()) {
        setError('Both players must have different names.');
        return;
      }
      try {
        joinCommunity(waitingCommunity.id, pName);
        const pair = getCommunityPlayers(waitingCommunity.id);
        if (pair) onReady(waitingCommunity, pair[0], pair[1]);
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
            Share the name{' '}
            <span className="font-bold text-violet-600 dark:text-violet-400">
              "{waitingCommunity.name}"
            </span>{' '}
            with your friend
          </p>
        </div>

        <div className="w-full bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-700 rounded-xl p-4 text-center">
          <p className="text-xs text-violet-500 dark:text-violet-400 font-semibold uppercase tracking-widest mb-1">
            Player 1 (X)
          </p>
          <p className="text-lg font-bold text-violet-700 dark:text-violet-300">
            {waitingPlayer.name}
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Field
            label="Second player's name (O)"
            value={secondName}
            onChange={(v) => { setSecondName(v); resetErrors(); }}
            placeholder="e.g. Bob"
            onEnter={handleSecondPlayer}
          />
          {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
          <button
            onClick={handleSecondPlayer}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-700 text-white active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400"
          >
            Start Game
          </button>
          <button
            onClick={() => { resetErrors(); setStep('my-communities'); }}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-center transition-colors"
          >
            ← Back to my communities
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
  onEnter?: () => void;
}

function Field({ label, value, onChange, placeholder, onEnter }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-400 focus:border-violet-400 transition text-sm"
      />
    </div>
  );
}
