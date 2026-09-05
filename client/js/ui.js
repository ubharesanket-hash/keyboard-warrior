/**
 * UI Controller & HUD Manager
 * Keyboard Warrior: Stickman Typing Battle
 * Manages arcade stats, target word banner, stance cards, Meme Combo Maker,
 * Leaderboard, and Match End summary modals.
 */

import AudioEngine from './AudioEngine.js';
import BackgroundRenderer from './BackgroundRenderer.js';
import { WORD_BANK } from './wordBank.js';

class UIController {
  constructor(game) {
    this.game = game;
    this.fpsCounterEl = document.getElementById('fpsCounter');
    this.targetWordBox = document.getElementById('targetWordBox');
    this.playerHpBar = document.getElementById('playerHpBar');
    this.enemyHpBar = document.getElementById('enemyHpBar');
    this.specialBar = document.getElementById('specialBar');
    this.enemyTimerBar = document.getElementById('enemyTimerBar');

    this.statsLine = document.getElementById('statsLine');
    this.scoreDisplay = document.getElementById('scoreDisplay');
    this.stanceCardsContainer = document.getElementById('stanceCards');

    // Modals
    this.matchEndModal = document.getElementById('matchEndModal');
    this.leaderboardModal = document.getElementById('leaderboardModal');
    this.memeModal = document.getElementById('memeModal');
    this.controlsModal = document.getElementById('controlsModal');

    // FPS Tracking
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.currentFps = 60;

    this.initHUD();
    this.wireButtons();
  }

  initHUD() {
    this.renderStanceCards(this.game.stances);
    this.game.onStanceUpdate = (stances) => this.renderStanceCards(stances);

    this.game.onMatchComplete = (payload) => this.showMatchEnd(payload);

    this.game.typing.on('word:spawn', () => this.updatePrompt());
    this.game.typing.on('char:correct', () => this.updatePrompt());
    this.game.typing.on('char:error', () => this.shakePrompt());

    this.updatePrompt();
  }

  wireButtons() {
    // Top Bar Buttons
    document.getElementById('btnMemeMaker')?.addEventListener('click', () => this.openMemeModal());
    document.getElementById('btnLeaderboard')?.addEventListener('click', () => this.openLeaderboard());
    document.getElementById('btnControls')?.addEventListener('click', () => this.openControlsModal());
    document.getElementById('btnSoundToggle')?.addEventListener('click', (e) => {
      const isMuted = AudioEngine.toggleMute();
      e.target.innerText = isMuted ? '🔇 Muted' : '🔊 Sound';
    });

    // Meme Modal Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.preset, 10);
        const preset = WORD_BANK.memePresets[idx];
        if (preset) {
          document.getElementById('customComboInput').value = preset.join('\n');
        }
      });
    });

    // Theme selector button in Meme modal
    const themeBtn = document.getElementById('btnThemeCycle');
    if (themeBtn) {
      const themes = ['FIELDS', 'DOJO', 'CYBER'];
      let themeIdx = 0;
      themeBtn.addEventListener('click', () => {
        themeIdx = (themeIdx + 1) % themes.length;
        const newTheme = themes[themeIdx];
        BackgroundRenderer.setTheme(newTheme);
        themeBtn.innerText = `⚡ BACKGROUND: ${newTheme}`;
      });
    }

    // Difficulty selector in Meme modal
    const diffBtn = document.getElementById('btnDiffCycle');
    if (diffBtn) {
      const diffs = ['easy', 'medium', 'hard'];
      let diffIdx = 0;
      diffBtn.addEventListener('click', () => {
        diffIdx = (diffIdx + 1) % diffs.length;
        const newDiff = diffs[diffIdx];
        this.game.typing.setTier(newDiff);
        diffBtn.innerText = `⚡ DIFFICULTY: ${newDiff.toUpperCase()}`;
      });
    }

    // Play Custom Meme Combo
    document.getElementById('btnStartMemeCombo')?.addEventListener('click', () => {
      const text = document.getElementById('customComboInput').value;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) {
        this.game.typing.setCustomPlaylist(lines);
      }
      this.closeModals();
      this.game.resetMatch();
      this.updatePrompt();
    });

    // Submit Score Button
    document.getElementById('btnSubmitScore')?.addEventListener('click', () => this.submitScore());

    // Play Again Button
    document.getElementById('btnPlayAgain')?.addEventListener('click', () => {
      this.closeModals();
      this.game.resetMatch();
      this.updatePrompt();
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });
  }

  updatePrompt() {
    const prompt = this.game.typing.getPromptData();
    if (!prompt.full) return;

    // Formatting target box: [CURRENT_CHAR] REST OF WORD (matching reference screenshot)
    const currentChar = prompt.current === ' ' ? '␣' : (prompt.current || '');
    this.targetWordBox.innerHTML = `
      <span class="prompt-typed">${this._escape(prompt.typed)}</span>
      <span class="prompt-current">${this._escape(currentChar)}</span>
      <span class="prompt-remaining">${this._escape(prompt.remaining)}</span>
    `;
  }

  shakePrompt() {
    this.targetWordBox.classList.remove('shake');
    void this.targetWordBox.offsetWidth; // Trigger reflow
    this.targetWordBox.classList.add('shake');
  }

  renderStanceCards(stances) {
    if (!this.stanceCardsContainer) return;
    this.stanceCardsContainer.innerHTML = stances.map(s => `
      <div class="stance-card ${s.maxUses <= 0 ? 'depleted' : ''}" data-key="${s.key}">
        <div class="card-uses">${s.maxUses}</div>
        <div class="card-icon">${s.icon}</div>
        <div class="card-key">${s.key}</div>
      </div>
    `).join('');

    // Clicking stance card triggers stance
    this.stanceCardsContainer.querySelectorAll('.stance-card').forEach(card => {
      card.addEventListener('click', () => {
        this.game.triggerStance(card.dataset.key);
      });
    });
  }

  update() {
    // 1. Update FPS Counter
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.fpsCounterEl.innerText = `${this.currentFps} FPS`;
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    // 2. Update HP Bars
    if (this.playerHpBar) {
      const pPct = Math.max(0, (this.game.playerHP / this.game.player.origin ? 100 : 100) * (this.game.playerHP / 100));
      this.playerHpBar.style.width = `${Math.max(0, this.game.playerHP)}%`;
    }
    if (this.enemyHpBar) {
      this.enemyHpBar.style.width = `${Math.max(0, this.game.enemyHP)}%`;
    }

    // 3. Update Special Gauge
    if (this.specialBar) {
      this.specialBar.style.width = `${Math.min(100, this.game.specialMeter)}%`;
    }

    // 4. Update Enemy Attack Timer Gauge
    if (this.enemyTimerBar) {
      const threatPct = Math.max(0, (this.game.enemyTimer / this.game.enemyTimerMax) * 100);
      this.enemyTimerBar.style.width = `${threatPct}%`;
      this.enemyTimerBar.style.background = threatPct < 30 ? '#ff1a1a' : '#ffaa00';
    }

    // 5. Update Bottom Stats Overlay (11 GOOD / 0 MISS / 100% / 0:09)
    if (this.statsLine) {
      const acc = this.game.typing.getAccuracy();
      this.statsLine.innerText = `${this.game.goodWords} GOOD / ${this.game.missWords} MISS / ${acc}% / ${this.game.elapsedTimeFormatted} (${this.game.typing.getWPM()} WPM)`;
    }

    // 6. Update Big Arcade Score Counter (Formatted with leading zeros: 000,792)
    if (this.scoreDisplay) {
      const formatted = String(this.game.score).padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      this.scoreDisplay.innerText = formatted;
    }
  }

  showMatchEnd(payload) {
    this.lastPayload = payload;
    const isWin = payload.result === 'win';
    document.getElementById('matchResultTitle').innerText = isWin ? '🏆 VICTORY! ENEMY KNOCKED OUT' : '💀 DEFEAT! FALLEN IN BATTLE';
    document.getElementById('matchResultTitle').className = isWin ? 'result-win' : 'result-lose';

    document.getElementById('summaryWpm').innerText = `${payload.wpm} WPM`;
    document.getElementById('summaryAccuracy').innerText = `${payload.accuracy}%`;
    document.getElementById('summaryScore').innerText = payload.score.toLocaleString();
    document.getElementById('summaryStreak').innerText = payload.streak;
    document.getElementById('summaryTime').innerText = payload.time;
    document.getElementById('summaryTier').innerText = payload.difficulty.toUpperCase();

    this.matchEndModal.style.display = 'flex';
  }

  async submitScore() {
    const nameInput = document.getElementById('playerNameInput');
    const name = nameInput.value.trim() || 'Warrior';
    const btn = document.getElementById('btnSubmitScore');
    btn.disabled = true;
    btn.innerText = 'Submitting...';

    const payload = {
      playerName: name,
      wpm: this.lastPayload.wpm,
      accuracy: this.lastPayload.accuracy,
      score: this.lastPayload.score,
      difficulty: this.lastPayload.difficulty
    };

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        btn.innerText = '✅ Recorded!';
        setTimeout(() => {
          this.closeModals();
          this.openLeaderboard();
        }, 600);
      } else {
        btn.innerText = '❌ Error';
        alert(data.error || 'Failed to submit score');
      }
    } catch (err) {
      console.error('Score submit error:', err);
      btn.innerText = '❌ Offline';
    } finally {
      setTimeout(() => { btn.disabled = false; btn.innerText = 'Submit Score'; }, 2000);
    }
  }

  async openLeaderboard() {
    this.closeModals();
    const listBody = document.getElementById('leaderboardList');
    listBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading scores...</td></tr>';
    this.leaderboardModal.style.display = 'flex';

    try {
      const res = await fetch('/api/leaderboard?limit=10');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        listBody.innerHTML = json.data.map((entry, idx) => `
          <tr class="${idx === 0 ? 'gold-rank' : idx === 1 ? 'silver-rank' : idx === 2 ? 'bronze-rank' : ''}">
            <td>#${idx + 1}</td>
            <td><strong>${this._escape(entry.playerName)}</strong></td>
            <td>${entry.score.toLocaleString()}</td>
            <td>${entry.wpm}</td>
            <td>${entry.accuracy}%</td>
            <td><span class="badge badge-${entry.difficulty}">${entry.difficulty.toUpperCase()}</span></td>
          </tr>
        `).join('');
      } else {
        listBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No high scores yet!</td></tr>';
      }
    } catch (err) {
      listBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ff4444;">Failed to load leaderboard.</td></tr>';
    }
  }

  openMemeModal() {
    this.closeModals();
    this.memeModal.style.display = 'flex';
  }

  openControlsModal() {
    this.closeModals();
    this.controlsModal.style.display = 'flex';
  }

  closeModals() {
    [this.matchEndModal, this.leaderboardModal, this.memeModal, this.controlsModal].forEach(m => {
      if (m) m.style.display = 'none';
    });
  }

  _escape(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

export default UIController;
