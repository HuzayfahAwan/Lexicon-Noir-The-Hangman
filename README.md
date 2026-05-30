# Lexicon Noir — The Hangman

A noir-themed hangman game built with vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies, no build step.

---

## Features

- **SVG Hangman** — 8 body parts with animated stroke-draw on reveal; turns red on loss
- **7 Word Categories** — Random, Animals, Countries, Technology, Movies, Science, Sports (~20 words each)
- **3 Difficulty Levels** — Easy (8 lives), Normal (6 lives), Hard (4 lives)
- **~360 Word Local Bank** — no external word API
- **Alphabet Grid** — clickable and fully keyboard-driven; mobile-friendly
- **Hint System** — press `H` to reveal a random letter (costs 1 life, 1 hint per game)
- **Sound Effects** — generated via Web Audio API (no audio files)
- **Confetti** — canvas particle burst on win
- **Screen Shake** — CSS animation on loss
- **Win Animation** — letters bounce sequentially on correct guess
- **Toast Notifications** — replaces all `alert()` calls (4 color types)
- **Animated Score Counters** — numbers tick up on change
- **Share Result** — copies a text-based game summary to clipboard
- **Word Definition on Loss** — fetches definition from the Free Dictionary API
- **Smooth Play Again** — in-place reset, no page reload
- **Daily Challenge** — seeded RNG by date, one play per day
- **Timed Mode** — 90-second countdown; wrong guesses cost 8 seconds
- **Two-Player Mode** — Player 1 enters a word (password input), Player 2 guesses
- **Stats Modal** — overall + per-category win rates, records (longest word, fastest win, fewest wrong)
- **Game History** — last 100 games stored locally
- **Responsive Layout** — mobile-first, stacks vertically below 768px

---

## Getting Started

No install or build step required. Open `index.html` in any modern browser.

```
index.html   ← start here
```

---

## File Structure

```
├── index.html   # Homepage: mode/category/difficulty selection, stats modal
├── style.css    # Homepage styles
├── script.js    # Homepage logic; launches game via sessionStorage
├── game.html    # Game page: SVG, alphabet grid, timer, confetti
├── game.css     # Game styles: animations, toast, timer bar
└── game.js      # All game logic (word bank, scoring, sounds, modes)
```

---

## Keyboard Shortcuts

| Key     | Action        |
|---------|---------------|
| `A`–`Z` | Guess a letter |
| `H`     | Use hint      |
| `Enter` | Play again    |

---

## Local Storage

| Key                   | Contents                                              |
|-----------------------|-------------------------------------------------------|
| `lexicon-noir-score`  | `{ wins, losses, streak, best }`                     |
| `lexicon-noir-history`| Array of last 100 game objects                       |
| `lexicon-noir-daily`  | `{ date, completed, won, wrongCount, word }`         |

---

## Browser Support

Any modern browser with support for Web Audio API and Canvas. No polyfills included.
