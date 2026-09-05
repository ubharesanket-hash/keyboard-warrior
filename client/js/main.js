/**
 * Client Entry Point & Application Bootstrap
 * Keyboard Warrior: Stickman Typing Battle
 * Student: Sanket Ananta Ubhare (CS-9148)
 */

import { WORD_BANK } from './wordBank.js';
import GameManager from './GameManager.js';
import UIController from './ui.js';
import AudioEngine from './AudioEngine.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');

  // Handle high-DPI crisp rendering
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Internal logical resolution is 1024 x 576 (16:9 arcade ratio)
    canvas.width = 1024;
    canvas.height = 576;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize Game Manager & UI
  const game = new GameManager(canvas, WORD_BANK);
  const ui = new UIController(game);

  // Synchronize UI updates on every animation frame
  function uiLoop() {
    ui.update();
    requestAnimationFrame(uiLoop);
  }
  requestAnimationFrame(uiLoop);

  // Audio Context unlock on initial user interaction
  const unlockAudio = () => {
    AudioEngine.init();
    AudioEngine.ensureContext();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // Fullscreen support
  document.getElementById('btnFullscreen')?.addEventListener('click', () => {
    const container = document.getElementById('gameContainer');
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(err => console.warn(err));
    } else {
      document.exitFullscreen?.();
    }
  });

  console.log('⚔️ Keyboard Warrior: Stickman Typing Battle initialized successfully!');
});
