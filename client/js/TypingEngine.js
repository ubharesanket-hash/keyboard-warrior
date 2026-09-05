/**
 * Real-Time Typing Engine & Keystroke Parser
 * Keyboard Warrior: Stickman Typing Battle
 * Features exact WPM, keystroke accuracy, combo tracking, adaptive difficulty scaling,
 * and custom Meme Combo playlist support.
 */

class TypingEngine {
  constructor(wordBank, initialTier = 'easy') {
    this.wordBank = wordBank;
    this.tier = initialTier;
    this.customPlaylist = null;
    this.playlistIndex = 0;

    this.currentWord = '';
    this.typedIndex = 0;
    this.startTime = null;

    // Metrics
    this.correctChars = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.streak = 0;
    this.maxStreak = 0;

    // Performance window for adaptive scaling
    this.recentWordsHistory = [];
    this.tierHoldCounter = 0; // Hysteresis debounce

    this.listeners = {};
    this.nextWord();
  }

  on(event, cb) {
    (this.listeners[event] ||= []).push(cb);
  }

  emit(event, payload) {
    (this.listeners[event] || []).forEach(cb => {
      try { cb(payload); } catch (e) { console.error(`[TypingEngine Event Error: ${event}]`, e); }
    });
  }

  setTier(newTier) {
    this.tier = newTier;
    this.emit('tier:change', { tier: newTier });
  }

  setCustomPlaylist(lines) {
    if (Array.isArray(lines) && lines.length > 0) {
      this.customPlaylist = lines.map(l => l.trim()).filter(l => l.length > 0);
      this.playlistIndex = 0;
      this.nextWord();
    } else {
      this.customPlaylist = null;
      this.nextWord();
    }
  }

  nextWord() {
    if (this.customPlaylist && this.customPlaylist.length > 0) {
      this.currentWord = this.customPlaylist[this.playlistIndex];
      this.playlistIndex = (this.playlistIndex + 1) % this.customPlaylist.length;
    } else {
      const pool = this.wordBank[this.tier] || this.wordBank.easy;
      let next;
      // Prevent consecutive identical words
      do {
        next = pool[Math.floor(Math.random() * pool.length)];
      } while (next === this.currentWord && pool.length > 1);
      this.currentWord = next;
    }

    this.typedIndex = 0;
    this.emit('word:spawn', { word: this.currentWord, tier: this.tier });
  }

  handleKeydown(key) {
    // Ignore control, alt, shift, meta, etc. (only 1-char inputs)
    if (key.length !== 1) return;

    if (!this.startTime) {
      this.startTime = performance.now();
    }

    this.totalKeystrokes += 1;
    const expected = this.currentWord[this.typedIndex];

    // Case-insensitive matching for responsive arcade feel, but exact if required
    const isMatch = (key.toLowerCase() === expected.toLowerCase());

    if (isMatch) {
      this.correctKeystrokes += 1;
      this.correctChars += 1;
      this.typedIndex += 1;

      this.emit('char:correct', {
        char: expected,
        index: this.typedIndex,
        total: this.currentWord.length
      });

      // Check if word completed
      if (this.typedIndex >= this.currentWord.length) {
        this.streak += 1;
        if (this.streak > this.maxStreak) this.maxStreak = this.streak;

        const completedWord = this.currentWord;
        this._recordWordHistory(true);

        this.emit('word:correct', {
          word: completedWord,
          streak: this.streak,
          wpm: this.getWPM(),
          accuracy: this.getAccuracy(),
          tier: this.tier
        });

        if (this.streak % 3 === 0) {
          this.emit('combo:milestone', { streak: this.streak });
        }

        this._evaluateAdaptiveScaling();
        this.nextWord();
      }
    } else {
      const prevStreak = this.streak;
      this.streak = 0;
      this._recordWordHistory(false);

      this.emit('char:error', {
        expected,
        got: key,
        index: this.typedIndex
      });

      this.emit('word:error', {
        expected,
        got: key,
        word: this.currentWord
      });

      if (prevStreak > 0) {
        this.emit('combo:break', { previousStreak: prevStreak });
      }

      this._evaluateAdaptiveScaling();
    }
  }

  _recordWordHistory(success) {
    this.recentWordsHistory.push({
      success,
      wpm: this.getWPM(),
      timestamp: performance.now()
    });
    if (this.recentWordsHistory.length > 8) {
      this.recentWordsHistory.shift();
    }
  }

  // Adaptive scaling with hysteresis debounce
  _evaluateAdaptiveScaling() {
    if (this.customPlaylist) return; // In custom meme mode, honor user selection

    if (this.tierHoldCounter > 0) {
      this.tierHoldCounter -= 1;
      return;
    }

    if (this.recentWordsHistory.length < 5) return;

    const correctCount = this.recentWordsHistory.filter(h => h.success).length;
    const recentAccuracy = (correctCount / this.recentWordsHistory.length) * 100;
    const currentWPM = this.getWPM();

    // Promotion condition: sustained high accuracy and brisk speed
    if (recentAccuracy >= 90 && currentWPM >= 45 && this.tier === 'easy') {
      this.setTier('medium');
      this.tierHoldCounter = 4; // Lock tier for next 4 words
    } else if (recentAccuracy >= 92 && currentWPM >= 70 && this.tier === 'medium') {
      this.setTier('hard');
      this.tierHoldCounter = 5;
    }
    // Demotion condition: sustained errors
    else if (recentAccuracy <= 70 && this.tier === 'hard') {
      this.setTier('medium');
      this.tierHoldCounter = 4;
    } else if (recentAccuracy <= 60 && this.tier === 'medium') {
      this.setTier('easy');
      this.tierHoldCounter = 4;
    }
  }

  getWPM() {
    if (!this.startTime) return 0;
    const elapsedMinutes = (performance.now() - this.startTime) / 60000;
    if (elapsedMinutes <= 0) return 0;
    return Math.round((this.correctChars / 5) / elapsedMinutes);
  }

  getAccuracy() {
    if (this.totalKeystrokes === 0) return 100;
    return Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100);
  }

  getPromptData() {
    const word = this.currentWord;
    const typed = word.substring(0, this.typedIndex);
    const current = word.charAt(this.typedIndex) || '';
    const remaining = word.substring(this.typedIndex + 1);

    return {
      full: word,
      typed,
      current,
      remaining,
      progress: word.length > 0 ? this.typedIndex / word.length : 0
    };
  }

  reset() {
    this.typedIndex = 0;
    this.startTime = null;
    this.correctChars = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.recentWordsHistory = [];
    this.tierHoldCounter = 0;
    this.playlistIndex = 0;
    this.nextWord();
  }
}

export default TypingEngine;
