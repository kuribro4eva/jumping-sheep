# Jumping Sheep — Handoff Document

## Project Overview

**Jumping Sheep** is an educational word-guessing game for middle school Bible Study Fellowship (BSF) classes. Students guess letters to spell vocabulary words. Each wrong guess moves a sheep one rock closer to a cliff edge. Correct guesses trigger the sheep to turn toward safety with an "!" thought bubble. Guess the full word and the sheep hops back to the grass ("Good Shepherd!"). Run out of chances and the sheep falls off the cliff ("Bad Shepherd!" + lamb chops illustration).

**Target audience:** Middle school students in a classroom setting, teacher-controlled via projector/screen.

---

## Tech Stack

- **React** (single-file component, `.jsx`)
- **No build tooling currently** — runs as a Claude.ai artifact with built-in React rendering
- **No external dependencies** beyond React and Google Fonts (Luckiest Guy, Nunito)
- **Persistent storage** via `window.storage` API (Claude artifact-specific) — **this will need replacement for GitHub Pages** (see Migration Notes below)

---

## File

- `game.jsx` — the entire application in one file (~940 lines)

---

## Architecture

### State Management
All state lives in the root `JumpingSheep` component via `useState`. No external state library.

**Key state:**
- `data` — persisted app data (word sets, active set ID, difficulty)
- `screen` — "loading" | "title" | "playing"
- `gameState` — "playing" | "won" | "lost"
- `wordIndex` — current word position in the active set (0-based, sequential)
- `wrongCount` — number of wrong guesses this round
- `guessedLetters` — `Set` of letters guessed
- `sheepMood` — "idle" | "listening" | "returning" | "safe" | "falling"
- `sheepPos` — `{x, y}` coordinates in SVG space
- `sheepFlipped` — boolean, sheep faces left when true
- `bubbleVisible`, `bubbleFading`, `bubbleText` — thought bubble state

### Data Model (persisted)
```json
{
  "sets": [
    {
      "id": "zechariah-default",
      "name": "Zechariah",
      "words": ["worthless shepherd", "prophecy", "zion"]
    }
  ],
  "activeSetId": "zechariah-default",
  "difficulty": 6
}
```
- `difficulty` = number of **chances** (wrong guesses allowed). Rocks displayed = chances - 1.
- Words are played sequentially (not random). Teacher navigates with ◀ ▶ arrows.

### Component Tree
```
JumpingSheep (root)
├── Title Screen
├── Game Screen
│   ├── CliffScene (SVG)
│   │   ├── SheepSVG
│   │   └── ThoughtBubble
│   ├── Word Area (letter tiles)
│   ├── Keyboard (A-Z buttons)
│   └── Overlays (win/loss cards)
├── SettingsModal
│   ├── Difficulty slider (3-10 chances)
│   ├── Word set management (CRUD)
│   ├── Apply button (live, no restart)
│   └── Apply & Restart button (back to title)
└── LambChopsSVG (loss overlay illustration)
```

### SVG Scene
- ViewBox: `0 0 1000 300`
- Ground level: y=182
- Grass zone: x=0-170
- Rock path: x=180-790
- Cliff edge: x=870+
- Safe position: `(90, 144)`
- Scene is `flex: 0 0 50%` of the game frame

### Game Flow
1. **Title screen** → PLAY button → starts at word 1 of active set
2. **Correct guess** → sheep flips left, "!" bubble appears (1s hold, 0.8s fade)
3. **Wrong guess** → sheep advances to next rock
4. **All letters guessed (win)** → sheep hops back to grass via arc animation → "Good Shepherd!" overlay
5. **Out of chances (loss)** → sheep falls off current rock → "Bad Shepherd!" + lamb chops overlay
6. **Next Word →** or **◀ ▶ arrows** → reset game state, load next/prev word

### Settings
- **Apply** — changes take effect immediately on current game (set change resets to word 1, difficulty change resets current word)
- **Apply & Restart** — saves and returns to title screen
- Word sets support: add, edit (comma-separated words), delete, select

---

## Migration Notes for GitHub Pages

### 1. Build Setup
Create a standard Vite + React project:
```bash
npm create vite@latest jumping-sheep -- --template react
```
Copy `game.jsx` into `src/` and import it in `App.jsx` (or replace App entirely):
```jsx
import JumpingSheep from './game'
export default function App() {
  return <JumpingSheep />
}
```

### 2. Storage Migration
The current code uses `window.storage.get/set` which is a Claude artifact API. Replace with `localStorage`:

**Replace `loadData()`:**
```javascript
async function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
```

**Replace `saveData()`:**
```javascript
async function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Save error:", e);
  }
}
```

### 3. Fullscreen Button
Add back a fullscreen toggle button in the header. It was removed because it doesn't work in Claude's sandboxed iframe, but will work on GitHub Pages.

**Add state:**
```javascript
const [isFullscreen, setIsFullscreen] = useState(false);
```

**Add effect:**
```javascript
useEffect(() => {
  const handler = () => setIsFullscreen(!!document.fullscreenElement);
  document.addEventListener("fullscreenchange", handler);
  return () => document.removeEventListener("fullscreenchange", handler);
}, []);
```

**Add handler:**
```javascript
const toggleFullscreen = () => {
  if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
  else document.exitFullscreen?.();
};
```

**Add button in header controls (after the settings button):**
```jsx
<button className="hdr-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
  {isFullscreen ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
    </svg>
  )}
</button>
```

**Add fullscreen CSS (in the CSS string, after `.game-frame`):**
```css
.game-root:fullscreen .game-frame,
.game-root:-webkit-full-screen .game-frame {
  border-radius: 0;
  box-shadow: none;
}
```

### 4. GitHub Pages Deployment
In `vite.config.js`:
```javascript
export default {
  base: '/jumping-sheep/', // repo name
}
```

Deploy via GitHub Actions or:
```bash
npm run build
npx gh-pages -d dist
```

### 5. Google Fonts
The CSS imports Google Fonts via `@import url(...)` inside a template literal. This works fine in a browser. No changes needed.

---

## Keyboard Support
Physical keyboard input works during gameplay — pressing A-Z keys triggers guesses. The handler is attached/detached via `useEffect` based on screen and game state.

---

## Known Behaviors / Edge Cases
- **Word navigation wraps around** — going past the last word loops to word 1, and vice versa
- **Arrows snap immediately** — no confirmation dialog, resets all game state
- **Multi-word phrases supported** — spaces render as gaps between tile groups (e.g., "worthless shepherd")
- **Sheep position syncs to wrongCount** — but is skipped during "listening" and "falling" moods to prevent glitches
- **Win animation** — sheep arcs from current position to grass (1.2s cubic ease-out with sine hop)
- **Loss animation** — sheep falls from current rock (no jump to cliff edge), CSS-driven 0.8s animation
- **Thought bubble** — appears instantly (no pop animation), holds 1s, fades 0.8s
