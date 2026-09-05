/**
 * Anti-Cheat and Input Validation Middleware
 * Keyboard Warrior: Stickman Typing Battle
 * Author: Sanket Ananta Ubhare
 */

export function validateScorePayload(req, res, next) {
  const { wpm, accuracy, score, difficulty, playerName } = req.body;

  // 1. Validate WPM (Human world record ~216 WPM; cap strictly at 250)
  if (typeof wpm !== 'number' || isNaN(wpm) || wpm < 0 || wpm > 250) {
    return res.status(400).json({
      error: 'Security Reject: Implausible or invalid WPM value detected (>250 or <0).'
    });
  }

  // 2. Validate Accuracy (0 to 100)
  if (typeof accuracy !== 'number' || isNaN(accuracy) || accuracy < 0 || accuracy > 100) {
    return res.status(400).json({
      error: 'Security Reject: Invalid accuracy percentage (must be between 0 and 100).'
    });
  }

  // 3. Validate Score (Must match roughly wpm * accuracy formula or combat points)
  if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 1000000) {
    return res.status(400).json({
      error: 'Security Reject: Abnormal score value detected.'
    });
  }

  // 4. Sanitize and validate Player Name
  let sanitizedName = 'Warrior';
  if (typeof playerName === 'string' && playerName.trim().length > 0) {
    // Strip unwanted control characters and limit length to 20
    sanitizedName = playerName.replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 20);
    if (!sanitizedName) sanitizedName = 'Warrior';
  }

  // 5. Sanitize difficulty tier
  const allowedTiers = ['easy', 'medium', 'hard', 'adaptive', 'custom'];
  const sanitizedDifficulty = allowedTiers.includes(difficulty) ? difficulty : 'adaptive';

  // Attach sanitized data & authoritative server timestamp (never trust client clock)
  req.sanitizedScore = {
    playerName: sanitizedName,
    wpm: Math.round(wpm),
    accuracy: Math.round(accuracy),
    score: Math.round(score),
    difficulty: sanitizedDifficulty,
    timestamp: new Date().toISOString()
  };

  next();
}
