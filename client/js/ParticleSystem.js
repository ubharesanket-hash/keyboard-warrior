/**
 * High-Performance Particle & Visual Effects Engine
 * Keyboard Warrior: Stickman Typing Battle
 * Manages spark emitters, glowing anime katana slash cuts, floating combat text, and screen-shake.
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.slashTrails = [];
    this.floatingTexts = [];
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.MAX_PARTICLES = 250;
  }

  // Trigger screen vibration on impactful strikes
  triggerScreenShake(intensity = 8) {
    this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 25);
  }

  // Spawn bright red katana slash lines cutting across the target (like reference screenshot)
  spawnSlashCut(startX, startY, endX, endY, color = '#ff1a40', thickness = 6) {
    this.slashTrails.push({
      startX,
      startY,
      endX,
      endY,
      color,
      thickness,
      life: 1.0,
      decay: 0.08
    });
  }

  // Spawn fiery hit sparks on weapon impact
  spawnHitSparks(x, y, count = 12, color = '#ffdd33') {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.MAX_PARTICLES) {
        this.particles.shift(); // Cull oldest to preserve 60 FPS
      }
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 3 + 2,
        color,
        alpha: 1.0,
        decay: Math.random() * 0.04 + 0.03,
        gravity: 0.15
      });
    }
  }

  // Spawn floating combat damage / combo text
  spawnFloatingText(x, y, text, color = '#ff3344', isCrit = false) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      isCrit,
      vy: -2.0,
      alpha: 1.0,
      scale: isCrit ? 1.4 : 1.0,
      life: 1.0,
      decay: 0.025
    });
  }

  update(dt) {
    // 1. Screen Shake decay
    if (this.shakeIntensity > 0.1) {
      this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.shakeIntensity = 0;
    }

    // 2. Update spark particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 3. Update slash lines
    for (let i = this.slashTrails.length - 1; i >= 0; i--) {
      const s = this.slashTrails[i];
      s.life -= s.decay;
      if (s.life <= 0) {
        this.slashTrails.splice(i, 1);
      }
    }

    // 4. Update floating combat text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= ft.decay;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();

    // 1. Draw glowing anime slash lines
    this.slashTrails.forEach(s => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.thickness * s.life;
      ctx.lineCap = 'round';
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(s.startX, s.startY);
      ctx.lineTo(s.endX, s.endY);
      ctx.stroke();

      // White inner core for incandescent anime cut look
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, s.thickness * 0.4 * s.life);
      ctx.stroke();

      ctx.restore();
    });

    // 2. Draw spark particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Draw floating combat numbers
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = `${ft.isCrit ? '900 24px' : 'bold 18px'} 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  }

  reset() {
    this.particles = [];
    this.slashTrails = [];
    this.floatingTexts = [];
    this.shakeIntensity = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }
}

export default new ParticleSystem();
