# System Architecture & Technical Blueprint
## Keyboard Warrior: Stickman Typing Battle
**Author:** Sanket Ananta Ubhare (CS-9148)  
**Degree:** T.Y.B.Sc. Computer Science (2026–27)  
**Institution:** MES's The D. G. Ruparel College of Arts, Science and Commerce  

---

### 1. Executive Technical Summary
**Keyboard Warrior** is a web-based gamified touch-typing combat engine combining real-time keystroke processing with a deterministic 60 FPS procedural skeletal combat simulation rendered on an HTML5 `<canvas>` and backed by an Express.js anti-cheat leaderboard API.

Unlike conventional browser games that rely on heavy sprite sheets or heavyweight game engines (such as Unity WebGL or Phaser), Keyboard Warrior leverages:
1. **Procedural Skeletal Kinematics:** 12-point vector joint hierarchies calculated with trigonometric functions, producing fluid animations with zero asset download overhead.
2. **Fixed-Timestep Simulation Loop:** Decouples physical logic (`1000/60 = 16.666ms`) from browser render refresh rates, preventing delta-time physics inaccuracies or frame drops on variable refresh rate displays (60Hz, 120Hz, 144Hz).
3. **Pure Web Audio Synthesis:** Real-time waveform generation via oscillators, filters, and gain nodes—providing instant, zero-latency mechanical keyboard clacks and katana slashes without external audio files.
4. **Server-Side Anti-Cheat:** Rigid payload sanitization enforcing biometric human typing limits (WPM $\le$ 250) and authoritative server timestamps.

---

### 2. Unidirectional Data Pipeline

```
+-----------------------------------------------------------------------------------+
|                                CLIENT RUNTIME                                     |
|                                                                                   |
|  [Keystroke Event]                                                                |
|         │                                                                         |
|         ▼                                                                         |
|  [Typing Engine] ──(Metrics: WPM, Accuracy, Streak)──► [Adaptive Difficulty]     |
|         │                                                       │                 |
|         ├─► [Audio Engine] (Mechanical Clicks / Snatches)       ▼                 |
|         │                                              [Tier: Easy/Med/Hard]      |
|         ▼                                                       │                 |
|  [Combat Calculator] ◄──────────────────────────────────────────┘                 |
|         │                                                                         |
|         ├─► Damage = BaseDamage(Tier) × Multiplier × Accuracy%                    |
|         ├─► SpecialMeter += Damage × 0.15                                         |
|         │                                                                         |
|         ▼                                                                         |
|  [Finite State Machine] (Player: LIGHT_ATTACK / HEAVY / SPECIAL / BLOCK)          |
|                         (Enemy: HURT_REACTION / ATTACK / KNOCKOUT)                |
|         │                                                                         |
|         ├─► [Particle System] (Slash Trails, Hit Sparks, Floating Damage)         |
|         ├─► [Web Audio Synthesizer] (Anime Sword Swoosh, Thump, Fanfare)         |
|         │                                                                         |
|         ▼                                                                         |
|  [Canvas 60 FPS Renderer] (Bliss Field + Clouds + Altar + Stickmen + HUD)        |
+-----------------------------------------------------------------------------------+
                                          │
                                 Match Complete Event
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                                SERVER RUNTIME                                     |
|                                                                                   |
|  [HTTP POST /api/score]                                                           |
|         │                                                                         |
|         ▼                                                                         |
|  [Anti-Cheat Middleware] ───► Validates: WPM <= 250, Acc in [0..100], Sanitize   |
|         │                                                                         |
|         ▼                                                                         |
|  [Authoritative Server Timestamp]                                                 |
|         │                                                                         |
|         ▼                                                                         |
|  [Persistent Storage Engine] (Atomic File-Locked JSON Store / MongoDB Cluster)    |
|         │                                                                         |
|         ▼                                                                         |
|  [Leaderboard Query API: GET /api/leaderboard]                                    |
+-----------------------------------------------------------------------------------+
```

---

### 3. Stickman Skeletal Kinematics & State Machine

Each stickman is constructed as a 12-point hierarchical joint tree anchored at the pelvis:
- **Pelvis / Origin**: `(x, y)`
- **Torso**: `(0, 0) -> (torsoEndX, -torsoLen)`
- **Head & Accessories**: Centered above the neck with customizable silhouettes:
  - *Player*: Newsboy flat cap (retro Peaky Blinders aesthetic).
  - *Enemy*: Combat goggles/glasses.
- **Arms (Front & Back)**: 2-segment limbs computed via forward kinematics:
  $$\text{mid}_x = x + \cos(\theta_1) \cdot L_1, \quad \text{mid}_y = y + \sin(\theta_1) \cdot L_1$$
  $$\text{end}_x = \text{mid}_x + \cos(\theta_2) \cdot L_2, \quad \text{end}_y = \text{mid}_y + \sin(\theta_2) \cdot L_2$$
- **Weapon (Ha & Tsuka)**: An illuminated anime katana dynamically oriented with `swordAngle`, rendering bright red slash arcs across the opponent.

#### State Machine Transition Guards
```
      [IDLE] ◄────────────────────────────────────────┐
        │                                             │
        ├── (Correct Keystroke) ──► [LIGHT_ATTACK] ───┤
        ├── (Streak >= 5) ────────► [HEAVY_ATTACK] ───┤ (Animation Finished)
        ├── (Special Meter = 100) ► [SPECIAL_MOVE] ───┤
        ├── (Incoming Attack) ────► [BLOCK / PARRY] ──┤
        ├── (Damage Taken) ───────► [HURT_REACTION] ──┘
        │
        └── (HP <= 0) ────────────► [KNOCKOUT] (Terminal State - Frozen)
```

---

### 4. Mathematical Core Specifications

1. **Words Per Minute (WPM)**:
   $$\text{WPM} = \text{round}\left(\frac{\text{correct\_chars} / 5}{\text{elapsed\_ms} / 60000}\right)$$
   *(Standardizes 1 word = 5 characters per international typing standards).*

2. **Keystroke Accuracy**:
   $$\text{Accuracy (\%)} = \text{round}\left(\frac{\text{correct\_keystrokes}}{\text{total\_keystrokes}} \times 100\right)$$

3. **Combo Multiplier**:
   $$\text{Multiplier} = \min\left(1 + \left\lfloor\frac{\text{streak}}{3}\right\rfloor \times 0.25, 3.0\right)$$
   *(Clamped strictly at 3.0x to avoid runaway scoring at high combos).*

4. **Combat Damage Formula**:
   $$\text{Damage} = \text{base\_damage} \times \text{Multiplier} \times \left(\frac{\text{Accuracy}}{100}\right)$$
   - Easy Tier: Base Damage = 8
   - Medium Tier: Base Damage = 12
   - Hard Tier: Base Damage = 18

5. **Special Super Meter Gain**:
   $$\Delta\text{Special} = \text{damage} \times 0.15 \quad (\text{Cap: } 100)$$

---

### 5. Adaptive Difficulty Scaling & Anti-Flicker Hysteresis
To prevent rapid flip-flopping between difficulty tiers, the system maintains a rolling window of the last 5 words and enforces a **hold counter** (hysteresis debounce):
- **Promotion to Hard**: Accuracy $\ge 92\%$ AND WPM $\ge 70$, locked for 5 consecutive words.
- **Demotion to Easy**: Accuracy $\le 60\%$ across recent window.
- Dynamically scales enemy attack timer:
  - Easy: 4200ms
  - Medium: 3000ms
  - Hard: 2000ms
