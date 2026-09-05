/**
 * Game Configuration & Mathematical Tuning Parameters
 * Keyboard Warrior: Stickman Typing Battle
 */

export const CONFIG = {
  CANVAS: {
    WIDTH: 1024,
    HEIGHT: 576,
    TARGET_FPS: 60,
    FIXED_DT: 1000 / 60 // ~16.666ms
  },
  COMBAT: {
    PLAYER_MAX_HP: 100,
    ENEMY_MAX_HP: 100,
    SPECIAL_MAX: 100,
    SPECIAL_GAIN_RATE: 0.15, // special_meter_gain = damage_dealt * 0.15
    MAX_COMBO_MULTIPLIER: 3.0,
    COMBO_STEP: 3,           // Every 3 streak grants +0.25x
    COMBO_BONUS: 0.25,
    BASE_DAMAGE: {
      easy: 8,
      medium: 12,
      hard: 18
    },
    ENEMY_DAMAGE: {
      easy: 6,
      medium: 10,
      hard: 14
    },
    ENEMY_ATTACK_INTERVAL: {
      easy: 4200,   // ms
      medium: 3000,
      hard: 2000
    }
  },
  STANCES: [
    { key: 'TAB', id: 'defend', name: 'Guard Parry', icon: '🛡️', maxUses: 10, cost: 0, desc: 'Negates incoming enemy hit' },
    { key: '1', id: 'slash', name: 'Swift Katana', icon: '⚔️', maxUses: 3, cost: 20, desc: 'Deals 15 bonus instant damage' },
    { key: '2', id: 'uppercut', name: 'Rising Strike', icon: '🌪️', maxUses: 3, cost: 35, desc: 'Launches enemy into air' },
    { key: '3', id: 'heavy', name: 'Heavy Cleave', icon: '💥', maxUses: 1, cost: 50, desc: 'Massive single-target shockwave' },
    { key: '4', id: 'focus', name: 'Zen Stance', icon: '⚡', maxUses: 3, cost: 30, desc: 'Temporarily slows enemy timer' }
  ],
  ADAPTIVE_THRESHOLD: {
    PROMOTE_WPM: 50,
    PROMOTE_ACCURACY: 94,
    DEMOTE_WPM: 30,
    DEMOTE_ACCURACY: 80,
    WINDOW_SIZE: 5 // Evaluate last 5 words
  }
};
