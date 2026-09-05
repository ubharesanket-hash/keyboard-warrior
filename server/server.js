/**
 * Express Server Entry Point
 * Keyboard Warrior: Stickman Typing Battle
 * College: MES's The D. G. Ruparel College of Arts, Science and Commerce
 * Student: Sanket Ananta Ubhare (CS-9148)
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import scoreRouter from './routes/score.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security and middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

// API routes
app.use('/api', scoreRouter);

// Fallback to index.html for SPA/client-side navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚔️  KEYBOARD WARRIOR: STICKMAN TYPING BATTLE SERVER  ⚔️`);
  console.log(`   Student: Sanket Ananta Ubhare | Roll: CS-9148    `);
  console.log(`   Listening at: http://localhost:${PORT}           `);
  console.log(`   Healthcheck:  http://localhost:${PORT}/api/health`);
  console.log(`   Leaderboard:  http://localhost:${PORT}/api/leaderboard`);
  console.log(`====================================================`);
});
