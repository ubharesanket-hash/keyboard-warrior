/**
 * Core Game Coordinator & Fixed-Timestep Loop
 * Keyboard Warrior: Stickman Typing Battle
 * Unifies typing parser, combat formulas, stickman state machines, audio, and visual FX.
 */

import { CONFIG } from './config.js';
import TypingEngine from './TypingEngine.js';
import StickmanRenderer from './StickmanRenderer.js';
import BackgroundRenderer from './BackgroundRenderer.js';
import AudioEngine from './AudioEngine.js';
import ParticleSystem from './ParticleSystem.js';

class GameManager {
  constructor(canvas, wordBank) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.wordBank = wordBank;

    // Simulation timing
    this.fixedDt = CONFIG.CANVAS.FIXED_DT;
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.isPaused = false;
    this.matchOver = false;

    // Combat Stats
    this.playerHP = CONFIG.COMBAT.PLAYER_MAX_HP;
    this.enemyHP = CONFIG.COMBAT.ENEMY_MAX_HP;
    this.specialMeter = 0;
    this.score = 0;
    this.goodWords = 0;
    this.missWords = 0;
    this.matchStartTime = 0;
    this.elapsedTimeFormatted = '0:00';

    // Stance Cards charges
    this.stances = JSON.parse(JSON.stringify(CONFIG.STANCES));
    this.isGuarding = false;

    // Enemy AI Attack Timer
    this.enemyTimerMax = CONFIG.COMBAT.ENEMY_ATTACK_INTERVAL.easy;
    this.enemyTimer = this.enemyTimerMax;

    // Initialize Entities
    this.initEntities();

    // Wire Event Listeners
    this.wireTypingEvents();
    this.wireInputEvents();

    // Start Loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initEntities() {
    const groundY = this.canvas.height * 0.72;
    // Left stickman: Player (with newsboy flat cap)
    this.player = new StickmanRenderer(this.ctx, 420, groundY, 1, 'cap');
    // Right stickman: Enemy (with combat glasses)
    this.enemy = new StickmanRenderer(this.ctx, 604, groundY, -1, 'glasses');

    this.typing = new TypingEngine(this.wordBank, 'easy');
    this.updateEnemyTimerDuration();
  }

  updateEnemyTimerDuration() {
    this.enemyTimerMax = CONFIG.COMBAT.ENEMY_ATTACK_INTERVAL[this.typing.tier] || 3200;
    this.enemyTimer = this.enemyTimerMax;
  }

  wireTypingEvents() {
    // Correct keystroke
    this.typing.on('char:correct', ({ char, index }) => {
      AudioEngine.playKeystroke(index);
    });

    // Keystroke error
    this.typing.on('char:error', () => {
      AudioEngine.playError();
      ParticleSystem.spawnFloatingText(this.player.origin.x, this.player.origin.y - 70, 'MISS!', '#ff4444');
    });

    // Word completed successfully
    this.typing.on('word:correct', ({ word, streak, wpm, accuracy, tier }) => {
      this.goodWords += 1;
      this.onWordSuccess(streak, tier);
    });

    // Word failed
    this.typing.on('word:error', ({ expected, got }) => {
      this.missWords += 1;
      this.onWordFail();
    });

    // Combo streak milestone
    this.typing.on('combo:milestone', ({ streak }) => {
      AudioEngine.playCombo(streak);
      ParticleSystem.spawnFloatingText(
        (this.player.origin.x + this.enemy.origin.x) / 2,
        this.player.origin.y - 110,
        `COMBO x${streak}!`,
        '#ffd700',
        true
      );
      ParticleSystem.triggerScreenShake(4);
    });

    // Combo break
    this.typing.on('combo:break', () => {
      ParticleSystem.spawnFloatingText(this.player.origin.x, this.player.origin.y - 90, 'COMBO BREAK', '#999999');
    });

    // Tier change
    this.typing.on('tier:change', ({ tier }) => {
      this.updateEnemyTimerDuration();
      ParticleSystem.spawnFloatingText(
        this.canvas.width / 2,
        140,
        `DIFFICULTY: ${tier.toUpperCase()}`,
        '#00ffcc',
        true
      );
    });
  }

  wireInputEvents() {
    this._keydownHandler = (e) => {
      if (this.matchOver || this.isPaused) return;

      // Handle Stance hotkeys: TAB or 1, 2, 3, 4
      if (e.key === 'Tab') {
        e.preventDefault();
        this.triggerStance('TAB');
        return;
      }
      if (['1', '2', '3', '4'].includes(e.key)) {
        this.triggerStance(e.key);
        return;
      }

      // Pass input to TypingEngine
      this.typing.handleKeydown(e.key);

      if (!this.matchStartTime && this.typing.startTime) {
        this.matchStartTime = this.typing.startTime;
      }
    };

    window.addEventListener('keydown', this._keydownHandler);
  }

  triggerStance(key) {
    const stance = this.stances.find(s => s.key.toUpperCase() === key.toUpperCase());
    if (!stance || stance.maxUses <= 0) return;

    if (stance.id === 'defend') {
      stance.maxUses -= 1;
      this.isGuarding = true;
      this.player.setState('BLOCK', 800);
      AudioEngine.playBlock();
      ParticleSystem.spawnFloatingText(this.player.origin.x, this.player.origin.y - 80, 'GUARD UP!', '#00e5ff');
      setTimeout(() => { this.isGuarding = false; }, 800);
    } else if (stance.id === 'slash') {
      stance.maxUses -= 1;
      this.executeAttack(16, false, 'LIGHT_ATTACK');
      ParticleSystem.spawnFloatingText(this.player.origin.x, this.player.origin.y - 80, 'SWIFT KATANA!', '#ff9900');
    } else if (stance.id === 'uppercut') {
      stance.maxUses -= 1;
      this.executeAttack(24, true, 'HEAVY_ATTACK');
      ParticleSystem.spawnFloatingText(this.player.origin.x, this.player.origin.y - 80, 'RISING STRIKE!', '#ff3366');
    } else if (stance.id === 'heavy') {
      stance.maxUses -= 1;
      this.executeAttack(36, true, 'SPECIAL_MOVE');
      ParticleSystem.spawnFloatingText(this.player.origin.x, this.player.origin.y - 80, 'HEAVY CLEAVE!', '#ffff00', true);
    } else if (stance.id === 'focus') {
      stance.maxUses -= 1;
      this.enemyTimer = this.enemyTimerMax + 2000; // Delay enemy
      AudioEngine.playBlock();
      ParticleSystem.spawnFloatingText(this.player.origin.x, this.player.origin.y - 80, 'TIME SLOWED!', '#9966ff');
    }

    if (this.onStanceUpdate) this.onStanceUpdate(this.stances);
  }

  onWordSuccess(streak, tier) {
    // Formula Section 1.3:
    // combo_multiplier = min(1 + floor(streak / 3) * 0.25, 3.0)
    // damage = base_damage * combo_multiplier * (accuracy_pct / 100)
    const baseDamage = CONFIG.COMBAT.BASE_DAMAGE[tier] || 10;
    const comboMultiplier = Math.min(1 + Math.floor(streak / CONFIG.COMBAT.COMBO_STEP) * CONFIG.COMBAT.COMBO_BONUS, CONFIG.COMBAT.MAX_COMBO_MULTIPLIER);
    const accuracyRatio = this.typing.getAccuracy() / 100;
    const damage = Math.round(baseDamage * comboMultiplier * accuracyRatio);

    // Score formula
    const wordScore = Math.round(damage * 10 * (1 + (streak * 0.1)));
    this.score += wordScore;

    // Special meter gain: damage * 0.15
    this.specialMeter = Math.min(CONFIG.COMBAT.SPECIAL_MAX, this.specialMeter + damage * CONFIG.COMBAT.SPECIAL_GAIN_RATE);

    // Determine attack tier
    const isSpecial = (this.specialMeter >= CONFIG.COMBAT.SPECIAL_MAX);
    const isHeavy = (streak >= 5 || streak % 4 === 0);
    const animState = isSpecial ? 'SPECIAL_MOVE' : (isHeavy ? 'HEAVY_ATTACK' : 'LIGHT_ATTACK');

    if (isSpecial) this.specialMeter = 0;

    this.executeAttack(damage, isHeavy || isSpecial, animState);

    // Player success pushes back enemy's attack timer!
    this.enemyTimer = Math.min(this.enemyTimerMax, this.enemyTimer + 1000);
  }

  executeAttack(damage, isHeavy, animState) {
    this.player.setState(animState);
    AudioEngine.playSlash();

    // Damage enemy
    this.enemyHP = Math.max(0, this.enemyHP - damage);

    // Red katana slash cutting through enemy (matching reference screenshot)
    const px = this.player.origin.x + 30;
    const py = this.player.origin.y - 45;
    const ex = this.enemy.origin.x;
    const ey = this.enemy.origin.y - 45;

    ParticleSystem.spawnSlashCut(
      ex - 50, ey - (isHeavy ? 60 : 30),
      ex + 40, ey + (isHeavy ? 50 : 30),
      isHeavy ? '#ff0033' : '#ff2a4b',
      isHeavy ? 8 : 5
    );

    ParticleSystem.spawnHitSparks(ex, ey, isHeavy ? 20 : 10, '#ffcc00');
    ParticleSystem.spawnFloatingText(ex, ey - 50, `-${damage}`, isHeavy ? '#ff1133' : '#ff4455', isHeavy);

    if (isHeavy) {
      ParticleSystem.triggerScreenShake(7);
      AudioEngine.playHit(true);
    } else {
      AudioEngine.playHit(false);
    }

    if (this.enemyHP <= 0) {
      this.enemy.setState('KNOCKOUT');
      this.finishMatch('win');
    } else {
      this.enemy.setState('HURT_REACTION');
    }
  }

  onWordFail() {
    // Enemy counter-attacks immediately on wrong word
    this.executeEnemyAttack();
  }

  executeEnemyAttack() {
    this.enemy.setState('LIGHT_ATTACK');
    AudioEngine.playSlash();

    if (this.isGuarding) {
      // Parry success
      this.player.setState('BLOCK');
      AudioEngine.playBlock();
      ParticleSystem.spawnHitSparks(this.player.origin.x + 20, this.player.origin.y - 40, 15, '#00e5ff');
      ParticleSystem.spawnFloatingText(this.player.origin.x, this.player.origin.y - 60, 'PARRY!', '#00e5ff', true);
      this.isGuarding = false;
      return;
    }

    // Player takes damage
    const damage = CONFIG.COMBAT.ENEMY_DAMAGE[this.typing.tier] || 8;
    this.playerHP = Math.max(0, this.playerHP - damage);

    const px = this.player.origin.x;
    const py = this.player.origin.y - 40;

    ParticleSystem.spawnSlashCut(px - 35, py - 30, px + 35, py + 30, '#ff1a1a', 5);
    ParticleSystem.spawnHitSparks(px, py, 12, '#ff3333');
    ParticleSystem.spawnFloatingText(px, py - 50, `-${damage}`, '#ff2222', false);
    ParticleSystem.triggerScreenShake(5);
    AudioEngine.playHit(false);

    if (this.playerHP <= 0) {
      this.player.setState('KNOCKOUT');
      this.finishMatch('lose');
    } else {
      this.player.setState('HURT_REACTION');
    }
  }

  async finishMatch(result) {
    if (this.matchOver) return;
    this.matchOver = true;

    if (result === 'win') {
      AudioEngine.playVictory();
    } else {
      AudioEngine.playError();
    }

    const payload = {
      result,
      wpm: this.typing.getWPM(),
      accuracy: this.typing.getAccuracy(),
      score: this.score,
      streak: this.typing.maxStreak,
      goodWords: this.goodWords,
      missWords: this.missWords,
      difficulty: this.typing.tier,
      time: this.elapsedTimeFormatted
    };

    if (this.onMatchComplete) {
      this.onMatchComplete(payload);
    }
  }

  update(dt) {
    if (this.matchOver || this.isPaused) return;

    // Update time counter
    if (this.matchStartTime) {
      const elapsedSec = Math.floor((performance.now() - this.matchStartTime) / 1000);
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      this.elapsedTimeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Update stickmen
    this.player.update(dt);
    this.enemy.update(dt);

    // Update environment & particles
    BackgroundRenderer.update(dt);
    ParticleSystem.update(dt);

    // Update enemy AI attack timer
    this.enemyTimer -= dt;
    if (this.enemyTimer <= 0) {
      this.enemyTimer = this.enemyTimerMax;
      this.executeEnemyAttack();
    }
  }

  render() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();

    // Apply screen-shake transform
    if (ParticleSystem.shakeIntensity > 0) {
      ctx.translate(ParticleSystem.shakeOffsetX, ParticleSystem.shakeOffsetY);
    }

    // 1. Draw procedural background (Bliss field, clouds, birds, cracked altar)
    BackgroundRenderer.draw(ctx, w, h);

    // 2. Draw Stickmen characters
    this.player.draw();
    this.enemy.draw();

    // 3. Draw particle FX & slash trails
    ParticleSystem.draw(ctx);

    ctx.restore();
  }

  loop(currentTime) {
    const delta = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Fixed-timestep simulation accumulator
    this.accumulator += delta;
    while (this.accumulator >= this.fixedDt) {
      this.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    this.render();

    requestAnimationFrame(this.loop);
  }

  resetMatch() {
    this.matchOver = false;
    this.playerHP = CONFIG.COMBAT.PLAYER_MAX_HP;
    this.enemyHP = CONFIG.COMBAT.ENEMY_MAX_HP;
    this.specialMeter = 0;
    this.score = 0;
    this.goodWords = 0;
    this.missWords = 0;
    this.matchStartTime = 0;
    this.elapsedTimeFormatted = '0:00';
    this.stances = JSON.parse(JSON.stringify(CONFIG.STANCES));
    this.isGuarding = false;

    this.player.setState('IDLE');
    this.enemy.setState('IDLE');
    this.typing.reset();
    this.updateEnemyTimerDuration();
    ParticleSystem.reset();

    if (this.onStanceUpdate) this.onStanceUpdate(this.stances);
  }

  destroy() {
    if (this._keydownHandler) {
      window.removeEventListener('keydown', this._keydownHandler);
    }
  }
}

export default GameManager;
