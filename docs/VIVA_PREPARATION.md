# Viva Voce & Technical Evaluation Guide
## Keyboard Warrior: Stickman Typing Battle
**Student Name:** Sanket Ananta Ubhare  
**Roll No:** CS-9148  
**Class:** T.Y.B.Sc. Computer Science (2026–27)  
**College:** MES's The D. G. Ruparel College of Arts, Science and Commerce  

---

### Key Technical Questions & Examiner Discussion Points

#### Q1. Why choose HTML5 Canvas API over modern game engines like Unity WebGL or Phaser?
**Answer:**
- **Zero Asset Overhead & Instant Load Time:** Unity WebGL builds typically produce 15MB to 50MB of WebAssembly and compressed assets. Our procedural Canvas engine loads in under 50 milliseconds with total assets under 50KB.
- **Pure JavaScript Control & Native Integration:** Directly integrates with DOM UI elements, modern CSS overlays, and browser APIs (Web Audio, Fetch, Fullscreen) without WebAssembly bridge latency.
- **Low Memory Footprint:** Canvas vector rendering uses minimal heap allocation and does not require extensive GPU texture memory.

---

#### Q2. What is a "Fixed-Timestep Loop" and why is it superior to a simple `requestAnimationFrame` update?
**Answer:**
- `requestAnimationFrame` fires at the display's variable refresh rate (e.g., 60Hz, 120Hz, 144Hz).
- If simulation logic runs directly in `requestAnimationFrame` using delta-time, variations in frame rate can cause physics drift, collision misses (tunneling), or inconsistent gameplay.
- A **fixed-timestep accumulator loop** decouples simulation from rendering:
  ```javascript
  accumulator += delta;
  while (accumulator >= FIXED_DT) { // FIXED_DT = 1000 / 60 = 16.666ms
    update(FIXED_DT);
    accumulator -= FIXED_DT;
  }
  render();
  ```
  This guarantees deterministic simulation logic and consistent damage calculation across any monitor refresh rate.

---

#### Q3. How does the Procedural Skeletal Animation system work without sprite sheets?
**Answer:**
- Each stickman model is mathematically represented as a hierarchical tree of joints (torso, arms, legs, head).
- Limbs are positioned using **forward kinematics** with trigonometry:
  $$\text{Joint}_X = \text{Origin}_X + \cos(\theta) \times \text{Length}$$
- Poses (IDLE, LIGHT_ATTACK, HEAVY_ATTACK, BLOCK, KNOCKOUT) are computed via mathematical sine curves and interpolations based on the state's elapsed duration.
- This eliminates all sprite sheet downloading, allows dynamic color/silhouette swapping, and renders smoothly at any display resolution.

---

#### Q4. Explain the formula used for Words Per Minute (WPM) calculation.
**Answer:**
$$\text{WPM} = \text{round}\left(\frac{\text{correct\_characters} / 5}{\text{elapsed\_time\_in\_minutes}}\right)$$
- According to international typing standards, 1 standard typing word is defined as **5 keystrokes** (including spaces).
- Elapsed time is measured using high-resolution browser timestamps (`performance.now()`), beginning on the user's first keystroke so idle pre-match time does not distort the player's WPM.

---

#### Q5. How does the Anti-Cheat mechanism protect the server leaderboard?
**Answer:**
1. **Biometric Speed Sanity Check:** The highest verified human typing speed in history is ~216 WPM. Our Express middleware rejects any score submission with $\text{WPM} > 250$ or $\text{WPM} < 0$.
2. **Accuracy Bounds Check:** Rejects accuracy values outside $[0, 100]$.
3. **Score Range Validation:** Rejects anomalous scores.
4. **Server-Side Timestamping:** Never trusts client clocks. The server generates an authoritative ISO-8601 timestamp at the exact millisecond the payload is accepted.
5. **Input Sanitization:** Strips script tags and special characters from player codenames to prevent XSS.

---

#### Q6. How is audio handled without external MP3 or WAV audio files?
**Answer:**
- We utilize the browser's native **Web Audio API**.
- Sounds are synthesized mathematically in real-time:
  - **Keystroke Click:** High-frequency triangle wave (800Hz) dropped rapidly through an exponential gain decay.
  - **Katana Slash:** Sawtooth oscillator (950Hz to 80Hz) filtered through a resonant bandpass filter to create an anime blade swoosh.
  - **Hit Impact:** Low-frequency sine wave (120Hz to 30Hz) for deep physical bass impact.
  - **Combo Fanfare:** Ascending major triad arpeggio synthesized mathematically.
- Benefits: 100% offline capability, zero network latency, zero licensing issues.

---

#### Q7. How does the Adaptive Difficulty engine prevent rapid tier flickering?
**Answer:**
- A naive adaptive algorithm changes difficulty immediately after a single correct or missed word, which causes rapid "flickering" between tiers.
- We resolve this using a **rolling performance window (last 5-8 words)** combined with **hysteresis debounce**:
  - Once promoted or demoted, a hold-counter locks the tier for at least 4 subsequent words before another evaluation can occur.
  - Promotion requires sustained accuracy ($\ge 92\%$) and WPM ($\ge 70$ for hard, $\ge 45$ for medium).

---

#### Q8. What design pattern does the Combat System follow?
**Answer:**
- **Finite State Machine (FSM):** Characters transition between distinct states (`IDLE`, `LIGHT_ATTACK`, `HEAVY_ATTACK`, `HURT_REACTION`, `BLOCK`, `SPECIAL_MOVE`, `KNOCKOUT`).
- **Observer / Pub-Sub Pattern:** The `TypingEngine` emits events (`char:correct`, `word:correct`, `word:error`, `combo:break`) via an `EventEmitter`. The `GameManager` subscribes to these events and translates them into combat state transitions, completely decoupling typing logic from physics and rendering.

---

#### Q9. How do you prevent garbage collection lag spikes during high-speed typing?
**Answer:**
- **Particle Capping & Pooling:** Active particles are strictly capped at 250. When full, older particles are recycled or shifted rather than causing heap allocation spikes.
- **Fixed Memory Allocations:** Audio oscillator nodes are created and terminated cleanly.
- Canvas clear and draw cycles reuse existing context transformations without creating intermediate canvas buffers.

---

#### Q10. What future extensions can be added to this architecture?
**Answer:**
1. **Real-time WebSocket Multiplayer:** Using `socket.io` to sync state between two live human players in a 1v1 typing arena.
2. **Custom Word Pack Importer:** Allowing teachers to upload CSV/JSON study decks (e.g., Computer Science terms, foreign language vocabulary).
3. **PWA (Progressive Web App):** Service Worker caching for offline installation on mobile/desktop.
