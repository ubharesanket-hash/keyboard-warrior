/**
 * High-Performance Persistent JSON Storage Engine
 * Keyboard Warrior: Stickman Typing Battle
 * Handles atomic file operations and instant top-10 leaderboard indexing.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'scores.json');

// Initial seed leaderboard for presentation/testing
const SEED_SCORES = [
  { id: 'seed-1', playerName: 'Sensei_Sanket', wpm: 124, accuracy: 99, score: 12276, difficulty: 'hard', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'seed-2', playerName: 'Shadow_Fingers', wpm: 108, accuracy: 98, score: 10584, difficulty: 'hard', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'seed-3', playerName: 'Ruparel_Typist', wpm: 92, accuracy: 96, score: 8832, difficulty: 'medium', timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: 'seed-4', playerName: 'Bliss_Warrior', wpm: 84, accuracy: 95, score: 7980, difficulty: 'medium', timestamp: new Date(Date.now() - 28800000).toISOString() },
  { id: 'seed-5', playerName: 'Meme_Slayer', wpm: 76, accuracy: 92, score: 6992, difficulty: 'easy', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'seed-6', playerName: 'Stick_Master', wpm: 68, accuracy: 90, score: 6120, difficulty: 'easy', timestamp: new Date(Date.now() - 172800000).toISOString() }
];

class ScoreStorage {
  constructor() {
    this._initStore();
  }

  _initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_SCORES, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[ScoreStorage] Error initializing storage file:', err);
    }
  }

  _readAll() {
    try {
      if (!fs.existsSync(DATA_FILE)) return [...SEED_SCORES];
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('[ScoreStorage] Error reading scores, returning seed fallback:', err);
      return [...SEED_SCORES];
    }
  }

  _writeAll(scores) {
    try {
      // Atomic write via temp file
      const tempPath = `${DATA_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(scores, null, 2), 'utf-8');
      fs.renameSync(tempPath, DATA_FILE);
      return true;
    } catch (err) {
      console.error('[ScoreStorage] Error writing scores:', err);
      return false;
    }
  }

  async create(scoreData) {
    const scores = this._readAll();
    const newEntry = {
      id: `score-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...scoreData
    };
    scores.push(newEntry);
    this._writeAll(scores);
    return newEntry;
  }

  async getTop(limit = 10) {
    const scores = this._readAll();
    // Sort descending by score, then by WPM, then by accuracy
    scores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    });
    return scores.slice(0, Math.min(limit, 50));
  }
}

export default new ScoreStorage();
