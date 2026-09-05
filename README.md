# ⚔️ Keyboard Warrior: Stickman Typing Battle
### Web-Based Gamified Touch-Typing Combat Engine (HTML5 Canvas)

**Student Name:** Sanket Ananta Ubhare  
**Roll No:** CS-9148  
**Department:** Information Technology & Computer Science  
**Class:** T.Y.B.Sc. Computer Science (Academic Year 2026–27)  
**College:** MES's The D. G. Ruparel College of Arts, Science and Commerce  

---

## 🎮 Overview

**Keyboard Warrior** transforms traditional touch-typing practice into an arcade stickman fighting combat game. Engineered purely on the HTML5 Canvas API and Web Audio API with a Node.js/Express backend, the game delivers deterministic 60 FPS combat, procedural skeletal kinematics, and persistent global leaderboards with anti-cheat protection.

Inspired by the indie title `teamgoodknight.itch.io/keyboardwarriorstickman`, the engine features:
- **Procedural Stickman Kinematics:** 12-point joint hierarchy with custom silhouettes (Player flat cap, Enemy combat goggles) and glowing anime katana slash cuts.
- **Procedural Bliss Landscape:** Classic Windows XP rolling green hills, flocking birds, dynamic clouds, and cracked stone altar.
- **Web Audio Sound Synthesizer:** Zero external audio files—mechanical clicks, blade swooshes, hit impacts, and combo fanfare generated via Web Audio API oscillators.
- **Meme Combo Maker:** Custom phrases, presets, and background theme toggles.
- **Anti-Cheat Express API:** Restricts abnormal WPM ($\le 250$), validates accuracy $[0..100]$, and enforces server-side timestamps.

---

## 🚀 Quick Start

### 1. Requirements
- Node.js (v18.x, v20.x, or v24.x)
- Any modern web browser (Google Chrome, Microsoft Edge, Firefox, Brave)

### 2. Installation
Clone or navigate to the project directory:
```bash
cd "C:\Users\Sanket Ananta Ubhare\.gemini\antigravity\scratch\keyboard-warrior"
npm install
```

### 3. Launching the Game
Start the Express server:
```bash
npm start
```
Or for auto-reloading development mode:
```bash
npm run dev
```

Open your browser and visit:
👉 **`http://localhost:3000`**

### 4. Running Automated Tests
To run the automated API verification and anti-cheat test suite:
```bash
node test_api.js
```

---

## ⌨️ Controls & Combat Mechanics

| Control | Action | Function |
| :--- | :--- | :--- |
| **A – Z** | Standard Typing | Types the target word displayed in the on-screen prompt box. Completing words slashes the opponent! |
| **TAB** | Guard Parry | Activates guard stance for 800ms to block and negate incoming enemy attack. |
| **1** | Swift Katana | Executes a rapid light blade cut (+16 bonus damage). |
| **2** | Rising Strike | Launches a high-damage rising strike (+24 damage). |
| **3** | Heavy Cleave | Triggers a devastating single-target shockwave (+36 damage). |
| **4** | Zen Focus | Temporarily slows down the enemy attack countdown timer. |

---

## 📐 Formulas & Engine Mathematics

1. **Words Per Minute (WPM)**:
   $$\text{WPM} = \text{round}\left(\frac{\text{correct\_chars} / 5}{\text{elapsed\_ms} / 60000}\right)$$

2. **Keystroke Accuracy**:
   $$\text{Accuracy (\%)} = \text{round}\left(\frac{\text{correct\_keystrokes}}{\text{total\_keystrokes}} \times 100\right)$$

3. **Combo Multiplier**:
   $$\text{Multiplier} = \min\left(1 + \left\lfloor\frac{\text{streak}}{3}\right\rfloor \times 0.25, 3.0\right)$$

4. **Combat Damage**:
   $$\text{Damage} = \text{base\_damage} \times \text{Multiplier} \times \left(\frac{\text{Accuracy}}{100}\right)$$

5. **Special Super Meter**:
   $$\Delta\text{Special} = \text{damage} \times 0.15 \quad (\text{Caps at } 100)$$

---

## 📁 Project Directory Structure

```
keyboard-warrior/
├── client/
│   ├── index.html              # Main game HTML with canvas, HUD overlays, and modal views
│   ├── css/
│   │   └── style.css           # Retro arcade styling, keyboard frame, cards, animations
│   ├── js/
│   │   ├── main.js             # Client entry point & state bootstrap
│   │   ├── config.js           # Game constants, difficulty tiers, tuning parameters
│   │   ├── wordBank.js         # Word banks (Easy/Med/Hard) + default meme combos
│   │   ├── TypingEngine.js     # Real-time keystroke parser, accuracy & WPM calculation
│   │   ├── StickmanRenderer.js # Procedural joint hierarchy, hats, glasses, poses & katana slashes
│   │   ├── BackgroundRenderer.js # Bliss hills, dynamic clouds, flying birds, stone altar
│   │   ├── AudioEngine.js      # Web Audio synthesizer (oscillator-based SFX, zero assets)
│   │   ├── ParticleSystem.js   # Sparks, slash trails, screen-shake & floating combat text
│   │   ├── GameManager.js      # 60 FPS fixed-timestep coordinator, enemy AI, match lifecycle
│   │   └── ui.js               # HUD updates, stance cards, combo maker modal, leaderboard view
├── server/
│   ├── server.js               # Express app bootstrap, static server, and error handling
│   ├── routes/
│   │   └── score.js            # POST /api/score and GET /api/leaderboard
│   ├── models/
│   │   ├── ScoreStorage.js     # Fast zero-dependency persistent JSON store
│   │   └── ScoreMongo.js       # Optional Mongoose schema for MongoDB
│   └── middleware/
│       └── antiCheat.js        # Strict payload validation (WPM <= 250, timestamps, score bounds)
├── docs/
│   ├── ARCHITECTURE.md         # Full viva architecture explanation & pipeline diagram
│   ├── VIVA_PREPARATION.md     # 25 expected questions and model answers for external examiners
│   └── DEMO_SCRIPT.md          # 5-minute live demonstration walk-through script
├── test_api.js                 # Verification script for endpoints and anti-cheat
├── package.json                # Dependencies & npm scripts
└── README.md                   # Project documentation
```

---

## 🎓 Academic Presentation Deliverables

For college viva and project demonstration, consult the `docs/` folder:
- [System Architecture Blueprint](docs/ARCHITECTURE.md)
- [Viva Voce Questions & Answers (25 Q&As)](docs/VIVA_PREPARATION.md)
- [5-Minute Live Presentation Script](docs/DEMO_SCRIPT.md)
