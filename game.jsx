import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const KB_ROWS = [
  "ABCDEFGHI".split(""),
  "JKLMNOPQR".split(""),
  "STUVWXYZ".split(""),
];

const STORAGE_KEY = "jumping-sheep-v2";

const DEFAULT_DATA = {
  sets: [
    {
      id: "zechariah-default",
      name: "Zechariah",
      words: ["worthless shepherd", "prophecy", "zion"],
    },
  ],
  activeSetId: "zechariah-default",
  difficulty: 6,
};

const uid = () => Math.random().toString(36).slice(2, 9);

const SAFE_X = 90;
const SAFE_Y = 144;

// ═══════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════
async function loadData() {
  try {
    const r = await window.storage.get(STORAGE_KEY, true);
    if (r && r.value) return JSON.parse(r.value);
  } catch {}
  return null;
}

async function saveData(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data), true);
  } catch (e) {
    console.error("Save error:", e);
  }
}

// ═══════════════════════════════════════════════════════════════
// POSITION HELPERS
// ═══════════════════════════════════════════════════════════════
function getPositions(chances) {
  const pathStartX = 180;
  const pathEndX = 790;
  const pathLen = pathEndX - pathStartX;
  const groundY = 182;
  const numRocks = chances - 1;
  const positions = [];
  for (let i = 0; i < chances; i++) {
    const t = numRocks > 0 ? i / numRocks : 0;
    positions.push({
      x: pathStartX + t * pathLen,
      y: groundY + Math.sin(i * 1.3) * 4,
    });
  }
  return positions;
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Nunito:wght@400;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream: #FFF8F0;
  --brown-dark: #2C1810;
  --brown-mid: #5C3D2E;
  --green-safe: #5AAF4A;
  --green-dark: #3D7A30;
  --orange-warm: #F59E42;
  --red-danger: #E05A3A;
  --blue-sky: #7EC8E3;
  --gold: #FFD966;
  --sheep-white: #F5F0E8;
  --rock-gray: #8B8178;
  --cliff-brown: #9B7B5A;
}

.game-root {
  font-family: 'Nunito', sans-serif;
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.game-frame {
  position: relative;
  width: min(100vw, 100vh * 16 / 9);
  height: min(100vh, 100vw * 9 / 16);
  background: var(--cream);
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6% 1.5%;
  background: linear-gradient(135deg, #3D7A30, #2D6420);
  color: white;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}
.game-title {
  font-family: 'Luckiest Guy', cursive;
  font-size: clamp(14px, 2.2vmin, 28px);
  letter-spacing: 1px;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.2);
  color: var(--gold);
}
.header-controls { display: flex; gap: 6px; align-items: center; }
.hdr-btn {
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  border-radius: 8px;
  padding: 4px 10px;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: clamp(10px, 1.4vmin, 16px);
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.hdr-btn:hover { background: rgba(255,255,255,0.25); }
.hdr-btn svg { width: clamp(12px,1.6vmin,20px); height: clamp(12px,1.6vmin,20px); }

/* Word Nav */
.word-nav {
  display: flex;
  align-items: center;
  gap: clamp(4px, 0.6vmin, 8px);
}
.word-nav-label {
  font-size: clamp(10px, 1.4vmin, 16px);
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
}
.nav-arrow {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  border-radius: 6px;
  width: clamp(24px, 3vmin, 36px);
  height: clamp(22px, 2.8vmin, 32px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: clamp(12px, 1.6vmin, 20px);
  font-weight: 800;
  transition: background 0.15s;
  font-family: 'Nunito', sans-serif;
}
.nav-arrow:hover { background: rgba(255,255,255,0.35); }

.scene-wrap { flex: 0 0 50%; min-height: 0; position: relative; overflow: hidden; }

.word-area {
  padding: 1.5% 2%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(5px, 1vmin, 14px);
  flex-wrap: wrap;
  flex-shrink: 0;
}
.letter-tile {
  width: clamp(30px, 4.5vmin, 56px);
  height: clamp(36px, 5.2vmin, 64px);
  background: white;
  border-bottom: 3px solid var(--brown-mid);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Luckiest Guy', cursive;
  font-size: clamp(18px, 3.2vmin, 38px);
  color: var(--brown-dark);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s, background 0.3s;
}
.letter-tile.revealed {
  background: #E8F5E9;
  border-bottom-color: var(--green-safe);
  transform: scale(1.05);
}
.word-spacer { width: clamp(10px, 1.5vmin, 20px); }

.keyboard-area {
  padding: 0 3% 0;
  margin-bottom: clamp(12px, 2.5vmin, 24px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(4px, 0.7vmin, 8px);
  flex: 1 1 0;
  justify-content: center;
}
.kb-row { display: flex; gap: clamp(4px, 0.6vmin, 8px); justify-content: center; }
.kb-key {
  width: clamp(32px, 5vmin, 64px);
  height: clamp(34px, 5vmin, 60px);
  border: none;
  border-radius: 8px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: clamp(14px, 2.4vmin, 26px);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--brown-dark);
  background: #F0E6D6;
  box-shadow: 0 3px 0 #D4C4A8, 0 4px 6px rgba(0,0,0,0.1);
  position: relative;
  top: 0;
}
.kb-key:hover:not(:disabled) { top: -2px; box-shadow: 0 5px 0 #D4C4A8, 0 6px 8px rgba(0,0,0,0.15); }
.kb-key:active:not(:disabled) { top: 2px; box-shadow: 0 1px 0 #D4C4A8; }
.kb-key:disabled { cursor: default; opacity: 0.9; top: 1px; }
.kb-key.correct { background: #66BB6A; color: white; box-shadow: 0 3px 0 #43A047, 0 4px 6px rgba(0,0,0,0.1); }
.kb-key.wrong { background: #BDBDBD; color: #999; box-shadow: 0 2px 0 #9E9E9E; }

.overlay-backdrop {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  z-index: 100; animation: fadeIn 0.3s ease;
}
.overlay-card {
  background: white; border-radius: 20px;
  padding: clamp(16px, 3vmin, 40px) clamp(24px, 4vmin, 56px);
  text-align: center;
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-width: 80%;
}
.overlay-card h2 {
  font-family: 'Luckiest Guy', cursive;
  font-size: clamp(20px, 3.5vmin, 44px);
  margin-bottom: 4px;
}
.overlay-card p {
  font-size: clamp(12px, 1.8vmin, 20px);
  color: #666;
  margin-bottom: clamp(10px, 2vmin, 20px);
}
.overlay-card .answer-reveal {
  font-family: 'Luckiest Guy', cursive;
  font-size: clamp(16px, 2.5vmin, 30px);
  color: var(--brown-dark);
  margin: 8px 0 16px;
  letter-spacing: 2px;
}
.overlay-btn {
  border: none; border-radius: 12px;
  padding: clamp(8px, 1.2vmin, 14px) clamp(20px, 3vmin, 36px);
  font-family: 'Nunito', sans-serif; font-weight: 800;
  font-size: clamp(12px, 1.6vmin, 18px);
  cursor: pointer; margin: 0 6px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.overlay-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.overlay-btn.primary { background: var(--green-safe); color: white; }
.overlay-btn.secondary { background: #E0E0E0; color: #555; }

.title-screen {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: linear-gradient(180deg, #7EC8E3 0%, #B6E8D0 40%, #7ABF5E 60%, #5A9E3F 100%);
  position: relative; overflow: hidden;
}
.title-main {
  font-family: 'Luckiest Guy', cursive;
  font-size: clamp(28px, 6vmin, 72px); color: white;
  text-shadow: 3px 3px 0 rgba(0,0,0,0.15), 0 0 40px rgba(255,255,255,0.3);
  margin-bottom: 8px; animation: titleBounce 2s ease infinite;
}
.title-sub { font-size: clamp(12px, 1.8vmin, 20px); color: rgba(255,255,255,0.9); font-weight: 700; margin-bottom: clamp(16px, 3vmin, 32px); }
.play-btn {
  background: linear-gradient(135deg, var(--orange-warm), #E8872E);
  color: white; border: none; border-radius: 16px;
  padding: clamp(12px, 2vmin, 24px) clamp(32px, 6vmin, 72px);
  font-family: 'Luckiest Guy', cursive; font-size: clamp(18px, 3vmin, 36px);
  cursor: pointer;
  box-shadow: 0 6px 0 #C06A18, 0 8px 24px rgba(0,0,0,0.2);
  transition: all 0.15s; letter-spacing: 2px;
}
.play-btn:hover { transform: translateY(-3px); box-shadow: 0 9px 0 #C06A18, 0 12px 30px rgba(0,0,0,0.25); }
.play-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #C06A18; }
.title-set-name { margin-top: clamp(10px, 1.5vmin, 16px); font-size: clamp(11px, 1.4vmin, 16px); color: rgba(255,255,255,0.75); font-weight: 600; }

.settings-backdrop {
  position: absolute; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.2s ease;
}
.settings-panel {
  background: var(--cream); border-radius: 16px; width: 88%; max-width: 600px; max-height: 85%;
  overflow-y: auto; padding: clamp(14px, 2vmin, 24px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3); animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.settings-panel h2 { font-family: 'Luckiest Guy', cursive; color: var(--brown-dark); font-size: clamp(16px, 2.5vmin, 28px); margin-bottom: clamp(8px, 1.5vmin, 16px); }
.settings-section { margin-bottom: clamp(10px, 1.5vmin, 18px); }
.settings-label { font-weight: 800; font-size: clamp(11px, 1.4vmin, 15px); color: var(--brown-mid); margin-bottom: 4px; display: block; }
.diff-slider-wrap { display: flex; align-items: center; gap: 10px; }
.diff-slider { flex: 1; accent-color: var(--green-safe); height: 6px; }
.diff-val { font-family: 'Luckiest Guy', cursive; font-size: clamp(14px, 2vmin, 22px); color: var(--orange-warm); min-width: 30px; text-align: center; }
.set-card { background: white; border-radius: 10px; padding: clamp(8px, 1vmin, 12px); margin-bottom: 6px; border: 2px solid transparent; transition: border-color 0.2s; }
.set-card.active { border-color: var(--green-safe); }
.set-card-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.set-card-name { font-weight: 800; font-size: clamp(12px, 1.5vmin, 16px); color: var(--brown-dark); flex: 1; }
.set-card-count { font-size: clamp(10px, 1.2vmin, 13px); color: #999; font-weight: 600; }
.set-btn { background: none; border: 1px solid #ddd; border-radius: 6px; padding: 2px 8px; font-size: clamp(9px, 1.1vmin, 12px); font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; color: #777; transition: all 0.15s; }
.set-btn:hover { background: #f5f5f5; border-color: #bbb; }
.set-btn.danger:hover { background: #FFEBEE; color: var(--red-danger); border-color: var(--red-danger); }
.set-btn.select { background: var(--green-safe); color: white; border-color: var(--green-safe); }
.words-reveal { margin-top: 6px; padding: 6px 8px; background: #F5F0E8; border-radius: 6px; font-size: clamp(10px, 1.2vmin, 13px); color: #666; line-height: 1.5; }
.add-set-area { background: white; border-radius: 10px; padding: clamp(8px, 1vmin, 12px); border: 2px dashed #ddd; }
.add-set-area input, .add-set-area textarea { width: 100%; border: 1px solid #ddd; border-radius: 6px; padding: 6px 8px; font-family: 'Nunito', sans-serif; font-size: clamp(10px, 1.3vmin, 14px); margin-bottom: 6px; outline-color: var(--green-safe); }
.add-set-area textarea { min-height: 50px; resize: vertical; }
.settings-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: clamp(8px, 1.5vmin, 16px); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
@keyframes titleBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes sheepBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.sheep-idle { animation: sheepBob 1.5s ease-in-out infinite; }
.sheep-falling { animation: sheepFall 0.8s ease-in forwards; }
.sheep-celebrate { animation: sheepCelebrate 0.6s ease infinite; }
.sheep-listening { animation: sheepBob 1.2s ease-in-out infinite; }
.sheep-returning { animation: sheepBob 0.6s ease-in-out infinite; }
@keyframes sheepFall { 0% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 100% { transform: translate(50px, 120px) rotate(120deg); opacity: 0; } }
@keyframes sheepCelebrate { 0%, 100% { transform: translateY(0) scale(1); } 25% { transform: translateY(-14px) scale(1.05); } 50% { transform: translateY(0) scale(1); } 75% { transform: translateY(-8px) scale(1.03); } }
@keyframes dangerPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
@keyframes bubbleFade { from { opacity: 1; } to { opacity: 0; } }
`;

// ═══════════════════════════════════════════════════════════════
// THOUGHT BUBBLE SVG
// ═══════════════════════════════════════════════════════════════
function ThoughtBubble({ x, y, text, visible, fading }) {
  if (!visible) return null;
  const style = fading
    ? { animation: "bubbleFade 0.8s ease forwards" }
    : { opacity: 1 };
  return (
    <g transform={`translate(${x}, ${y})`} style={style}>
      <circle cx="0" cy="22" r="4" fill="white" stroke="#ccc" strokeWidth="0.5" />
      <circle cx="-6" cy="12" r="7" fill="white" stroke="#ccc" strokeWidth="0.5" />
      <ellipse cx="-10" cy="-10" rx="30" ry="22" fill="white" stroke="#ccc" strokeWidth="1" />
      <text x="-10" y="-3" textAnchor="middle" fontSize="24" fontWeight="bold"
        fontFamily="Luckiest Guy, cursive" fill="#5C3D2E">{text}</text>
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════
// LAMB CHOPS SVG
// ═══════════════════════════════════════════════════════════════
function LambChopsSVG() {
  return (
    <svg viewBox="0 0 120 80" style={{ width: "clamp(80px,12vmin,160px)", height: "auto", margin: "8px auto", display: "block" }}>
      <ellipse cx="60" cy="58" rx="55" ry="18" fill="#F5F0E8" stroke="#D4C4A8" strokeWidth="2" />
      <ellipse cx="60" cy="56" rx="48" ry="14" fill="white" stroke="#E8E0D0" strokeWidth="1" />
      <g transform="translate(35, 30) rotate(-15)">
        <ellipse cx="0" cy="8" rx="14" ry="10" fill="#D4845A" />
        <ellipse cx="0" cy="6" rx="12" ry="8" fill="#E8976A" />
        <line x1="-8" y1="4" x2="8" y2="4" stroke="#C0744A" strokeWidth="1.5" opacity="0.5" />
        <line x1="-6" y1="8" x2="6" y2="8" stroke="#C0744A" strokeWidth="1.5" opacity="0.5" />
        <rect x="-2" y="-18" width="4" height="22" rx="2" fill="#FFF8F0" stroke="#D4C4A8" strokeWidth="0.8" />
        <circle cx="0" cy="-18" r="4" fill="#FFF8F0" stroke="#D4C4A8" strokeWidth="0.8" />
      </g>
      <g transform="translate(75, 28) rotate(12)">
        <ellipse cx="0" cy="8" rx="14" ry="10" fill="#D4845A" />
        <ellipse cx="0" cy="6" rx="12" ry="8" fill="#E8976A" />
        <line x1="-8" y1="4" x2="8" y2="4" stroke="#C0744A" strokeWidth="1.5" opacity="0.5" />
        <line x1="-6" y1="8" x2="6" y2="8" stroke="#C0744A" strokeWidth="1.5" opacity="0.5" />
        <rect x="-2" y="-18" width="4" height="22" rx="2" fill="#FFF8F0" stroke="#D4C4A8" strokeWidth="0.8" />
        <circle cx="0" cy="-18" r="4" fill="#FFF8F0" stroke="#D4C4A8" strokeWidth="0.8" />
      </g>
      <g transform="translate(58, 42)">
        <ellipse cx="-4" cy="0" rx="4" ry="2.5" fill="#6DBF5B" />
        <ellipse cx="4" cy="-1" rx="4" ry="2.5" fill="#5AAF4A" />
        <ellipse cx="0" cy="-3" rx="3" ry="2" fill="#7ACA6A" />
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// SVG SHEEP
// ═══════════════════════════════════════════════════════════════
function SheepSVG({ x, y, mood, flipped, scale = 1.6 }) {
  const animClass =
    mood === "falling" ? "sheep-falling"
    : mood === "safe" ? "sheep-celebrate"
    : mood === "returning" ? "sheep-returning"
    : mood === "listening" ? "sheep-listening"
    : "sheep-idle";
  const flipScale = flipped ? -1 : 1;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <g className={animClass}>
        <g transform={`scale(${flipScale}, 1)`}>
          <ellipse cx="0" cy="28" rx="20" ry="5" fill="rgba(0,0,0,0.15)" />
          <rect x="-12" y="10" width="5" height="16" rx="2.5" fill="#4A4040" />
          <rect x="-3" y="12" width="5" height="14" rx="2.5" fill="#3A3535" />
          <rect x="4" y="10" width="5" height="16" rx="2.5" fill="#4A4040" />
          <rect x="11" y="12" width="5" height="14" rx="2.5" fill="#3A3535" />
          <ellipse cx="2" cy="0" rx="24" ry="17" fill="#F5F0E8" />
          <circle cx="-14" cy="-6" r="9" fill="#FEFCF8" />
          <circle cx="0" cy="-12" r="9" fill="#FBF7F0" />
          <circle cx="14" cy="-6" r="9" fill="#FEFCF8" />
          <circle cx="-8" cy="6" r="8" fill="#F5F0E8" />
          <circle cx="10" cy="6" r="8" fill="#F5F0E8" />
          <circle cx="-18" cy="2" r="7" fill="#FEFCF8" />
          <circle cx="20" cy="0" r="7" fill="#FEFCF8" />
          <circle cx="-24" cy="-2" r="5" fill="#FEFCF8" />
          <circle cx="-27" cy="-5" r="3.5" fill="#F5F0E8" />
          <ellipse cx="26" cy="-4" rx="11" ry="10" fill="#4A4040" />
          <ellipse cx="19" cy="-14" rx="4" ry="7" fill="#5A5252" transform="rotate(-15 19 -14)" />
          <ellipse cx="32" cy="-14" rx="4" ry="6" fill="#5A5252" transform="rotate(10 32 -14)" />
          <circle cx="30" cy="-7" r="3.5" fill="white" />
          <circle cx="31" cy="-7" r="2" fill="#222" />
          <circle cx="31.5" cy="-7.8" r="0.8" fill="white" />
          {mood === "safe" && (
            <>
              <path d="M28,1 Q31,4 34,1" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <circle cx="24" cy="0" r="3" fill="#FFB4B4" opacity="0.5" />
              <circle cx="35" cy="-1" r="2.5" fill="#FFB4B4" opacity="0.5" />
            </>
          )}
        </g>
      </g>
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════
// CLIFF SCENE
// ═══════════════════════════════════════════════════════════════
function CliffScene({ wrongGuesses, maxWrong, sheepMood, sheepX, sheepY, sheepFlipped, bubbleText, bubbleVisible, bubbleFading }) {
  const vb = "0 0 1000 300";
  const positions = getPositions(maxWrong);
  const rocks = positions.slice(1).map((p, i) => ({
    x: p.x, y: p.y, w: 42 + (i % 3) * 8, h: 22 + (i % 2) * 4,
  }));
  const dangerProgress = wrongGuesses / maxWrong;
  const gameIsOver = sheepMood === "falling" || sheepMood === "safe" || sheepMood === "returning";

  return (
    <svg viewBox={vb} style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7EC8E3" /><stop offset="60%" stopColor="#B8E4F0" /><stop offset="100%" stopColor="#FDE8C9" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5AAF4A" /><stop offset="100%" stopColor="#3D7A30" />
        </linearGradient>
        <linearGradient id="cliff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A08060" /><stop offset="50%" stopColor="#7A6040" /><stop offset="100%" stopColor="#5A4530" />
        </linearGradient>
        <linearGradient id="dangerGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" /><stop offset="100%" stopColor="#E05A3A" />
        </linearGradient>
        <filter id="softShadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" /></filter>
      </defs>
      <rect width="1000" height="300" fill="url(#sky)" />
      <g opacity="0.7">
        <ellipse cx="150" cy="60" rx="60" ry="22" fill="white" /><ellipse cx="120" cy="55" rx="35" ry="18" fill="white" />
        <ellipse cx="185" cy="55" rx="30" ry="16" fill="white" /><ellipse cx="600" cy="80" rx="55" ry="20" fill="white" />
        <ellipse cx="560" cy="75" rx="30" ry="15" fill="white" /><ellipse cx="640" cy="73" rx="35" ry="17" fill="white" />
        <ellipse cx="850" cy="45" rx="40" ry="15" fill="white" /><ellipse cx="820" cy="40" rx="25" ry="12" fill="white" />
      </g>
      <circle cx="900" cy="60" r="35" fill="#FFE082" opacity="0.8" /><circle cx="900" cy="60" r="28" fill="#FFD54F" />
      <ellipse cx="300" cy="200" rx="250" ry="60" fill="#8BC88A" opacity="0.4" />
      <ellipse cx="700" cy="210" rx="200" ry="50" fill="#8BC88A" opacity="0.3" />
      <path d="M0,190 Q80,185 170,190 L170,300 L0,300 Z" fill="url(#grass)" />
      <g fill="#4CAF50">
        <path d="M20,188 Q24,178 28,188" /><path d="M60,186 Q64,175 68,186" />
        <path d="M100,188 Q105,176 110,188" /><path d="M140,189 Q144,180 148,189" />
      </g>
      <circle cx="40" cy="185" r="3" fill="#FFD54F" /><circle cx="90" cy="187" r="2.5" fill="#FF8A80" />
      <circle cx="125" cy="186" r="2" fill="#CE93D8" />
      <path d="M170,190 L870,190 L870,300 L170,300 Z" fill="#B09878" />
      <path d="M170,190 Q300,186 500,192 Q700,188 870,190 L870,200 Q700,196 500,200 Q300,195 170,198 Z" fill="#C4A882" />
      <path d="M870,190 L885,190 Q895,192 900,200 L908,220 Q912,235 905,255 L910,280 Q908,295 912,300 L870,300 Z" fill="url(#cliff)" />
      <path d="M885,190 Q892,194 896,205 L904,230 Q907,245 902,265 L906,290 Q905,300 908,300 L896,300 Q900,295 898,275 L893,250 Q896,235 892,215 L887,200 Z" fill="#5A4530" opacity="0.5" />
      <path d="M870,205 Q878,208 882,220 Q886,235 880,250" stroke="#6B5535" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M875,230 Q880,240 878,260" stroke="#5A4530" strokeWidth="1" fill="none" opacity="0.3" />
      <circle cx="890" cy="225" r="5" fill="#8B7355" /><circle cx="900" cy="255" r="3.5" fill="#7A6345" />
      <circle cx="907" cy="285" r="4" fill="#6B5535" opacity="0.6" /><circle cx="882" cy="260" r="2.5" fill="#9B8060" opacity="0.5" />
      <path d="M883,188 Q886,186 889,189" fill="#9B7B5A" /><path d="M893,196 Q896,193 898,198" fill="#8B6B4A" />
      <path d="M868,188 Q875,184 882,188 Q886,185 890,190" fill="#A08060" />
      <path d="M900,200 Q920,210 930,250 Q935,280 940,300 L1000,300 L1000,230 Q990,210 970,205 Q950,202 930,200 Z" fill="#D4C4A0" opacity="0.5" />
      <path d="M940,260 Q960,270 980,280 L1000,290 L1000,300 L930,300 Z" fill="#C4B490" opacity="0.3" />
      <g transform="translate(830, 150)">
        <rect x="-2" y="0" width="4" height="38" rx="2" fill="#8B6914" />
        <polygon points="0,-22 16,6 -16,6" fill="#FFD54F" stroke="#E8A000" strokeWidth="2" />
        <text x="0" y="2" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#6B4000">!</text>
      </g>
      {rocks.map((r, i) => {
        const stepped = wrongGuesses > i + 1;
        const currentRock = wrongGuesses === i + 1;
        const isNext = wrongGuesses === i + 1 && !gameIsOver;
        return (
          <g key={i}>
            <ellipse cx={r.x} cy={r.y + r.h / 2} rx={r.w / 2} ry={r.h / 2}
              fill={stepped ? "#8E7E6E" : currentRock ? "#A09080" : "#A89880"}
              stroke={isNext ? "#FFD54F" : "none"} strokeWidth="2.5"
              strokeDasharray={isNext ? "6 3" : "none"} filter="url(#softShadow)" />
            <ellipse cx={r.x - r.w * 0.1} cy={r.y + r.h * 0.15} rx={r.w * 0.25} ry={r.h * 0.2} fill="rgba(255,255,255,0.18)" />
          </g>
        );
      })}
      <rect x="155" y="168" width="5" height="30" rx="2" fill="#8B6914" />
      <rect x="143" y="172" width="28" height="4" rx="2" fill="#A08040" />
      <rect x="143" y="184" width="28" height="4" rx="2" fill="#A08040" />
      <SheepSVG x={sheepX} y={sheepY} mood={sheepMood} flipped={sheepFlipped} />
      <ThoughtBubble x={sheepFlipped ? sheepX - 30 : sheepX + 50} y={sheepY - 35}
        text={bubbleText} visible={bubbleVisible} fading={bubbleFading} />
      {sheepMood === "safe" && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <text key={i} x={sheepX - 30 + i * 20} y={sheepY - 40 - (i % 2) * 14}
              fontSize="16" fill="#FFD54F" opacity="0.9"
              style={{ animation: `sheepCelebrate ${0.5 + i * 0.1}s ease infinite`, animationDelay: `${i * 0.1}s` }}>★</text>
          ))}
        </g>
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════
function SettingsModal({ data, onApply, onApplyRestart, onClose }) {
  const [sets, setSets] = useState(data.sets);
  const [activeId, setActiveId] = useState(data.activeSetId);
  const [diff, setDiff] = useState(data.difficulty);
  const [revealedId, setRevealedId] = useState(null);
  const [newName, setNewName] = useState("");
  const [newWords, setNewWords] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editWords, setEditWords] = useState("");

  const handleAdd = () => {
    const words = newWords.split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (!newName.trim() || words.length === 0) return;
    setSets((s) => [...s, { id: uid(), name: newName.trim(), words }]);
    setNewName(""); setNewWords("");
  };
  const handleDelete = (id) => {
    setSets((s) => s.filter((x) => x.id !== id));
    if (activeId === id && sets.length > 1) setActiveId(sets.find((x) => x.id !== id)?.id || "");
  };
  const startEdit = (set) => { setEditingId(set.id); setEditWords(set.words.join(", ")); };
  const saveEdit = (id) => {
    const words = editWords.split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (words.length === 0) return;
    setSets((s) => s.map((x) => (x.id === id ? { ...x, words } : x)));
    setEditingId(null);
  };

  const buildData = () => ({ sets, activeSetId: activeId || sets[0]?.id, difficulty: diff });

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <h2>⚙️ Settings</h2>
        <div className="settings-section">
          <label className="settings-label">Chances (wrong guesses allowed)</label>
          <div className="diff-slider-wrap">
            <span style={{ fontSize: "clamp(10px,1.2vmin,13px)", color: "#999" }}>3</span>
            <input type="range" min="3" max="10" value={diff} onChange={(e) => setDiff(Number(e.target.value))} className="diff-slider" />
            <span style={{ fontSize: "clamp(10px,1.2vmin,13px)", color: "#999" }}>10</span>
            <span className="diff-val">{diff}</span>
          </div>
        </div>
        <div className="settings-section">
          <label className="settings-label">Word Sets</label>
          {sets.map((set) => (
            <div key={set.id} className={`set-card ${set.id === activeId ? "active" : ""}`}>
              <div className="set-card-header">
                <span className="set-card-name">{set.id === activeId && "✅ "}{set.name}</span>
                <span className="set-card-count">{set.words.length} words</span>
                {set.id !== activeId && <button className="set-btn select" onClick={() => setActiveId(set.id)}>Select</button>}
                <button className="set-btn" onClick={() => setRevealedId(revealedId === set.id ? null : set.id)}>{revealedId === set.id ? "Hide" : "Show"}</button>
                <button className="set-btn" onClick={() => startEdit(set)}>Edit</button>
                {sets.length > 1 && <button className="set-btn danger" onClick={() => handleDelete(set.id)}>✕</button>}
              </div>
              {revealedId === set.id && <div className="words-reveal">{set.words.map((w, i) => <span key={i}>{w}{i < set.words.length - 1 ? " · " : ""}</span>)}</div>}
              {editingId === set.id && (
                <div style={{ marginTop: 6 }}>
                  <textarea value={editWords} onChange={(e) => setEditWords(e.target.value)} placeholder="word1, word2, phrase three"
                    style={{ width: "100%", border: "1px solid #ddd", borderRadius: 6, padding: "6px 8px", fontFamily: "'Nunito', sans-serif", fontSize: "clamp(10px,1.3vmin,14px)", minHeight: 40, resize: "vertical" }} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="set-btn select" onClick={() => saveEdit(set.id)}>Save</button>
                    <button className="set-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="add-set-area" style={{ marginTop: 8 }}>
            <input placeholder="New set name..." value={newName} onChange={(e) => setNewName(e.target.value)} />
            <textarea placeholder="Words separated by commas: word1, word two, word3..." value={newWords} onChange={(e) => setNewWords(e.target.value)} />
            <button className="overlay-btn primary" style={{ fontSize: "clamp(10px,1.2vmin,13px)", padding: "4px 14px" }} onClick={handleAdd}>+ Add Word Set</button>
          </div>
        </div>
        <div className="settings-footer">
          <button className="overlay-btn secondary" onClick={onClose}>Cancel</button>
          <button className="overlay-btn primary" onClick={() => onApply(buildData())}>Apply</button>
          <button className="overlay-btn secondary" onClick={() => onApplyRestart(buildData())}>Apply & Restart</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function JumpingSheep() {
  const rootRef = useRef();
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState("loading");
  const [gameState, setGameState] = useState("playing");
  const [currentWord, setCurrentWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  // Shepherd feedback states
  const [sheepMood, setSheepMood] = useState("idle");
  const [sheepFlipped, setSheepFlipped] = useState(false);
  const [sheepPos, setSheepPos] = useState({ x: 180, y: 144 });
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleFading, setBubbleFading] = useState(false);
  const [bubbleText, setBubbleText] = useState("!");
  const [showOverlay, setShowOverlay] = useState(false);

  const listenTimerRef = useRef(null);
  const returnAnimRef = useRef(null);

  useEffect(() => {
    (async () => {
      let loaded = await loadData();
      if (!loaded) { loaded = DEFAULT_DATA; await saveData(loaded); }
      setData(loaded); setScreen("title");
    })();
  }, []);

  useEffect(() => {
    if (screen !== "playing" || gameState !== "playing") return;
    const handler = (e) => { const key = e.key.toUpperCase(); if (/^[A-Z]$/.test(key)) handleGuess(key); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, gameState, guessedLetters, currentWord]);

  useEffect(() => {
    if (!data || gameState !== "playing" || sheepMood === "listening" || sheepMood === "falling") return;
    if (wrongCount >= data.difficulty) return;
    const positions = getPositions(data.difficulty);
    const pos = positions[wrongCount];
    setSheepPos({ x: pos.x, y: pos.y - 38 });
  }, [wrongCount, data, gameState, sheepMood]);

  const activeSet = data?.sets.find((s) => s.id === data.activeSetId);
  const totalWords = activeSet?.words.length || 0;

  const resetSheep = useCallback((difficulty) => {
    const positions = getPositions(difficulty);
    setSheepPos({ x: positions[0].x, y: positions[0].y - 38 });
    setSheepMood("idle"); setSheepFlipped(false);
    setBubbleVisible(false); setBubbleFading(false);
    setShowOverlay(false);
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    if (returnAnimRef.current) cancelAnimationFrame(returnAnimRef.current);
  }, []);

  const goToWord = useCallback((index, set, difficulty) => {
    const theSet = set || activeSet;
    const diff = difficulty || data?.difficulty;
    if (!theSet || theSet.words.length === 0) return;
    const wrappedIndex = ((index % theSet.words.length) + theSet.words.length) % theSet.words.length;
    setWordIndex(wrappedIndex);
    setCurrentWord(theSet.words[wrappedIndex]);
    setGuessedLetters(new Set());
    setWrongCount(0);
    setGameState("playing");
    resetSheep(diff);
  }, [activeSet, data, resetSheep]);

  const startGame = useCallback(() => {
    setScreen("playing");
    goToWord(0);
  }, [goToWord]);

  const triggerListen = useCallback(() => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    setSheepFlipped(true); setSheepMood("listening");
    setBubbleText("!"); setBubbleFading(false); setBubbleVisible(true);
    listenTimerRef.current = setTimeout(() => {
      setBubbleFading(true);
      setTimeout(() => {
        setSheepFlipped(false); setSheepMood("idle");
        setBubbleVisible(false); setBubbleFading(false);
      }, 800);
    }, 1000);
  }, []);

  const triggerWin = useCallback(() => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    setSheepFlipped(true); setSheepMood("returning");
    setBubbleText("!"); setBubbleFading(false); setBubbleVisible(true);
    const startX = sheepPos.x; const startY = sheepPos.y;
    const duration = 1200; const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const cx = startX + (SAFE_X - startX) * ease;
      const cy = startY + (SAFE_Y - startY) * ease - Math.sin(t * Math.PI) * 30;
      setSheepPos({ x: cx, y: cy });
      if (t < 1) { returnAnimRef.current = requestAnimationFrame(animate); }
      else { setSheepMood("safe"); setBubbleVisible(false); setTimeout(() => setShowOverlay(true), 600); }
    };
    returnAnimRef.current = requestAnimationFrame(animate);
  }, [sheepPos]);

  const triggerLoss = useCallback(() => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    setSheepMood("falling"); setSheepFlipped(false); setBubbleVisible(false);
    setTimeout(() => setShowOverlay(true), 1000);
  }, []);

  const handleGuess = useCallback(
    (letter) => {
      if (guessedLetters.has(letter) || gameState !== "playing") return;
      const newGuessed = new Set(guessedLetters);
      newGuessed.add(letter);
      setGuessedLetters(newGuessed);
      const wordLetters = currentWord.toUpperCase().replace(/[^A-Z]/g, "");
      if (!wordLetters.includes(letter)) {
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);
        if (newWrong >= data.difficulty) {
          setGameState("lost");
          setSheepMood("falling");
          setSheepFlipped(false);
          setBubbleVisible(false);
          if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
          setTimeout(() => setShowOverlay(true), 1000);
        }
      } else {
        const unique = new Set(wordLetters.split(""));
        const allGuessed = [...unique].every((l) => newGuessed.has(l));
        if (allGuessed) { setGameState("won"); triggerWin(); }
        else { triggerListen(); }
      }
    },
    [guessedLetters, gameState, currentWord, wrongCount, data, triggerListen, triggerWin]
  );

  const nextWord = () => goToWord(wordIndex + 1);
  const prevWord = () => goToWord(wordIndex - 1);

  // Apply settings live (no restart to title)
  const handleApply = async (newData) => {
    const setChanged = newData.activeSetId !== data.activeSetId;
    setData(newData); await saveData(newData);
    setShowSettings(false);
    if (setChanged) {
      const newSet = newData.sets.find((s) => s.id === newData.activeSetId);
      goToWord(0, newSet, newData.difficulty);
    } else {
      // Difficulty may have changed — reset current word
      goToWord(wordIndex, activeSet, newData.difficulty);
    }
  };

  // Apply & Restart (back to title)
  const handleApplyRestart = async (newData) => {
    setData(newData); await saveData(newData);
    setShowSettings(false); setScreen("title");
  };

  if (screen === "loading" || !data) {
    return (
      <div className="game-root" ref={rootRef}>
        <style>{CSS}</style>
        <div className="game-frame" style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: "clamp(18px,3vmin,32px)", color: "#ccc" }}>Loading...</div>
        </div>
      </div>
    );
  }

  const renderWord = () => {
    if (!currentWord) return null;
    return currentWord.toUpperCase().split(" ").map((word, wi) => (
      <span key={wi} style={{ display: "inline-flex", gap: "clamp(2px, 0.4vmin, 5px)" }}>
        {wi > 0 && <span className="word-spacer" />}
        {word.split("").map((ch, ci) => {
          const isLetter = /[A-Z]/.test(ch);
          const revealed = isLetter && guessedLetters.has(ch);
          return (
            <span key={`${wi}-${ci}`} className={`letter-tile ${revealed ? "revealed" : ""}`}>
              {isLetter ? (revealed || gameState === "lost" ? ch : "") : ch}
            </span>
          );
        })}
      </span>
    ));
  };

  const wordLettersSet = new Set(currentWord.toUpperCase().replace(/[^A-Z]/g, "").split(""));

  return (
    <div className="game-root" ref={rootRef}>
      <style>{CSS}</style>
      <div className="game-frame">
        <div className="game-header">
          <span className="game-title">🐑 Jumping Sheep</span>
          <div className="header-controls">
            {screen === "playing" && (
              <div className="word-nav">
                <button className="nav-arrow" onClick={prevWord} title="Previous word">◀</button>
                <span className="word-nav-label">Word {wordIndex + 1} of {totalWords}</span>
                <button className="nav-arrow" onClick={nextWord} title="Next word">▶</button>
              </div>
            )}
            <button className="hdr-btn" onClick={() => setShowSettings(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        {screen === "title" && (
          <div className="title-screen">
            <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%" }} viewBox="0 0 1000 200" preserveAspectRatio="none">
              <ellipse cx="250" cy="200" rx="400" ry="120" fill="#4CAF50" opacity="0.3" />
              <ellipse cx="750" cy="200" rx="350" ry="100" fill="#4CAF50" opacity="0.25" />
            </svg>
            <div className="title-main">🐑 Jumping Sheep</div>
            <div className="title-sub">Stop the sheep before it's too late!</div>
            <button className="play-btn" onClick={startGame}>PLAY</button>
            <div className="title-set-name">Word Set: <strong>{activeSet?.name}</strong> · {activeSet?.words.length} words · {data.difficulty} chances</div>
          </div>
        )}

        {screen === "playing" && (
          <>
            <div className="scene-wrap">
              <CliffScene wrongGuesses={wrongCount} maxWrong={data.difficulty}
                sheepMood={sheepMood} sheepX={sheepPos.x} sheepY={sheepPos.y}
                sheepFlipped={sheepFlipped} bubbleText={bubbleText}
                bubbleVisible={bubbleVisible} bubbleFading={bubbleFading} />
            </div>
            <div className="word-area">{renderWord()}</div>
            <div className="keyboard-area">
              {KB_ROWS.map((row, ri) => (
                <div className="kb-row" key={ri}>
                  {row.map((letter) => {
                    const guessed = guessedLetters.has(letter);
                    const isCorrect = guessed && wordLettersSet.has(letter);
                    const isWrong = guessed && !wordLettersSet.has(letter);
                    return (
                      <button key={letter} className={`kb-key ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                        disabled={guessed || gameState !== "playing"} onClick={() => handleGuess(letter)}>{letter}</button>
                    );
                  })}
                </div>
              ))}
            </div>

            {gameState === "won" && showOverlay && (
              <div className="overlay-backdrop" style={{ background: "rgba(76,175,80,0.3)" }}>
                <div className="overlay-card">
                  <h2 style={{ color: "#2E7D32" }}>🐑 The Sheep Listened!</h2>
                  <div className="answer-reveal">{currentWord.toUpperCase()}</div>
                  <button className="overlay-btn secondary" onClick={() => setScreen("title")}>Back to Title</button>
                  <button className="overlay-btn primary" onClick={nextWord}>Next Word →</button>
                </div>
              </div>
            )}

            {gameState === "lost" && showOverlay && (
              <div className="overlay-backdrop" style={{ background: "rgba(224,90,58,0.25)" }}>
                <div className="overlay-card">
                  <h2 style={{ color: "#C62828" }}>🍖 Bad Shepherd!</h2>
                  <LambChopsSVG />
                  <div className="answer-reveal">{currentWord.toUpperCase()}</div>
                  <button className="overlay-btn secondary" onClick={() => setScreen("title")}>Back to Title</button>
                  <button className="overlay-btn primary" onClick={nextWord}>Next Word →</button>
                </div>
              </div>
            )}
          </>
        )}

        {showSettings && <SettingsModal data={data} onApply={handleApply} onApplyRestart={handleApplyRestart} onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  );
}
