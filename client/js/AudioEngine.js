/**
 * High-Performance Web Audio API Sound Synthesizer
 * Keyboard Warrior: Stickman Typing Battle
 * 100% Asset-free: Synthesizes mechanical clicks, sword slashes, impact thuds, and victory stingers.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this._initialized = false;
  }

  init() {
    if (this._initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this._initialized = true;
    } catch (e) {
      console.warn('[AudioEngine] Web Audio not supported or blocked:', e);
    }
  }

  ensureContext() {
    if (!this._initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Mechanical switch click on keypress
  playKeystroke(pitchOffset = 0) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + pitchOffset * 40, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Swift anime sword slash swoosh
  playSlash() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, t);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Heavy blade/fist impact thud
  playHit(isHeavy = false) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isHeavy ? 180 : 120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + (isHeavy ? 0.25 : 0.15));

    gain.gain.setValueAtTime(isHeavy ? 0.6 : 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isHeavy ? 0.25 : 0.15));

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + (isHeavy ? 0.25 : 0.15));
  }

  // Metallic sword parry / block ping
  playBlock() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Ascending combo milestone chime
  playCombo(streak) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = 440 * Math.pow(1.059463, Math.min(streak, 24));

    [0, 4, 7].forEach((semi, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteFreq = baseFreq * Math.pow(1.059463, semi);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.15, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.25);
    });
  }

  // Mistyped key error buzzer
  playError() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.1);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Victory Fanfare
  playVictory() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.12);

      gain.gain.setValueAtTime(0.25, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.45);
    });
  }
}

export default new AudioEngine();
