interface HeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
}

/**
 * App header with title and dark-mode toggle button.
 */
export function Header({ isDark, onToggleDark }: HeaderProps) {
  return (
    <header className="flex items-center justify-between w-full mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Tic Tac Toe
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Two-player classic
        </p>
      </div>

      {/* Dark / Light toggle */}
      <button
        onClick={onToggleDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={[
          'w-10 h-10 flex items-center justify-center rounded-xl',
          'border-2 border-slate-200 dark:border-slate-700',
          'bg-white dark:bg-slate-800',
          'text-slate-500 dark:text-slate-300',
          'hover:bg-slate-100 dark:hover:bg-slate-700',
          'active:scale-90 transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400',
        ].join(' ')}
      >
        {/* Sun icon (light mode indicator) */}
        {isDark ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m8.66-9H21M3 12H2m14.95-6.95-.71.71M6.76 17.24l-.71.71M17.66 17.24l-.71-.71M6.76 6.76l-.71-.71M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
            />
          </svg>
        ) : (
          /* Moon icon (dark mode indicator) */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
            />
          </svg>
        )}
      </button>
    </header>
  );
}
