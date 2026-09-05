/**
 * Score & Leaderboard API Routes
 * Keyboard Warrior: Stickman Typing Battle
 */

import express from 'express';
import ScoreStorage from '../models/ScoreStorage.js';
import { validateScorePayload } from '../middleware/antiCheat.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Keyboard Warrior Combat Engine'
  });
});

// Submit Score (Anti-cheat protected)
router.post('/score', validateScorePayload, async (req, res) => {
  try {
    const savedEntry = await ScoreStorage.create(req.sanitizedScore);
    res.status(201).json({
      success: true,
      message: 'Score successfully recorded on server.',
      data: savedEntry
    });
  } catch (err) {
    console.error('[Route: /api/score] Error saving score:', err);
    res.status(500).json({ error: 'Internal server error saving score.' });
  }
});

// Fetch Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const topScores = await ScoreStorage.getTop(limit);
    res.status(200).json({
      success: true,
      count: topScores.length,
      data: topScores
    });
  } catch (err) {
    console.error('[Route: /api/leaderboard] Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Internal server error fetching leaderboard.' });
  }
});

export default router;
