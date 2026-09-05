/**
 * Mongoose Schema for MongoDB Deployment
 * Keyboard Warrior: Stickman Typing Battle
 * Reference implementation for viva evaluation & production clusters.
 */

/*
// Usage with mongoose:
import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 25,
    default: 'Warrior'
  },
  wpm: {
    type: Number,
    required: true,
    min: 0,
    max: 250
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'adaptive', 'custom'],
    default: 'adaptive'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true // Server-controlled timestamp
  }
});

// Index for top score queries
ScoreSchema.index({ score: -1, wpm: -1 });

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema);
*/

export const MongoSchemaDoc = {
  description: "Mongoose Score Schema contract with compound indexes for O(log N) leaderboard lookup",
  collection: "scores",
  indexes: [{ score: -1, wpm: -1 }]
};
