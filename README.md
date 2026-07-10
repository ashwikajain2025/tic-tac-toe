# Tic Tac Toe

A production-ready, fully accessible Tic Tac Toe web application built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## ✨ Features

- 3×3 interactive game board
- Two-player turns (X and O)
- Winner detection with highlighted winning cells
- Draw detection
- Animated cell selection and status messages
- **Scoreboard** — tracks X Wins, O Wins, and Draws
- **LocalStorage persistence** — scores survive page refreshes
- **Dark / Light mode toggle** — respects `prefers-color-scheme` by default
- Restart Game and New Game buttons
- Reset Scores button
- Fully responsive — works on mobile and desktop
- Keyboard accessible with ARIA labels
- Focus-visible outlines for keyboard navigation

## 🛠 Tech Stack

| Tool | Version |
|---|---|
| React | 19 |
| Vite | 6 |
| TypeScript | 5.8 |
| Tailwind CSS | 3.4 |
| ESLint | 9 |

## 📁 Project Structure

```
src/
 ├── components/
 │   ├── Board.tsx        # 3×3 grid container
 │   ├── Cell.tsx         # Individual cell with animations
 │   ├── ScoreBoard.tsx   # Persistent score display
 │   ├── Status.tsx       # Current turn / winner / draw message
 │   ├── Header.tsx       # Title + dark-mode toggle
 │   └── Footer.tsx       # Attribution footer
 │
 ├── hooks/
 │   └── useGame.ts       # All game logic (state, moves, scores)
 │
 ├── utils/
 │   └── checkWinner.ts   # Pure winner/draw detection functions
 │
 ├── types/
 │   └── game.ts          # Shared TypeScript interfaces & types
 │
 ├── App.tsx              # Root layout, dark-mode wiring
 └── main.tsx             # React entry point
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Navigate to the project directory
cd tic-tac-toe

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## 🎮 How to Play

1. Player **X** always goes first.
2. Click any empty cell to place your marker.
3. The first player to fill a row, column, or diagonal **wins**.
4. If all 9 cells are filled with no winner, the game is a **draw**.
5. Press **Restart** to clear the board (scores are kept).
6. Press **New Game** to start a fresh round (scores are kept).
7. Press **Reset Scores** to zero out all scores and start over.

## ♿ Accessibility

- All interactive elements have descriptive `aria-label` attributes.
- Status messages use `aria-live="polite"` for screen-reader announcements.
- The board has `role="grid"` for assistive technology context.
- Full keyboard navigation — Tab to move focus, Enter/Space to select a cell.
- High-contrast focus rings on all focusable elements.

## 📜 License

MIT
