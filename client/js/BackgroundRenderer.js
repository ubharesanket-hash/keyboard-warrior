/**
 * Procedural Background & Environment Renderer
 * Keyboard Warrior: Stickman Typing Battle
 * Features Windows XP "Bliss" green meadow, flying birds, clouds, cracked stone battle altar,
 * and alternate themes (Dojo & Cyberpunk).
 */

class BackgroundRenderer {
  constructor() {
    this.theme = 'FIELDS'; // 'FIELDS' | 'DOJO' | 'CYBER'
    this.clouds = [
      { x: 50, y: 60, scale: 1.1, speed: 0.15 },
      { x: 380, y: 40, scale: 1.4, speed: 0.1 },
      { x: 750, y: 80, scale: 0.9, speed: 0.2 }
    ];
    this.birds = [
      { x: 120, y: 110, vx: 0.35, vy: 0.05, wingPhase: 0 },
      { x: 160, y: 130, vx: 0.4, vy: -0.04, wingPhase: 1.5 },
      { x: 200, y: 105, vx: 0.3, vy: 0.02, wingPhase: 3.0 },
      { x: 680, y: 95, vx: 0.25, vy: 0.01, wingPhase: 0.8 },
      { x: 740, y: 120, vx: 0.28, vy: -0.03, wingPhase: 2.2 }
    ];
    this.stoneCracks = [
      { x1: -60, y1: -40, x2: -30, y2: 10 },
      { x1: -30, y1: 10, x2: -15, y2: 30 },
      { x1: 20, y1: -50, x2: 40, y2: -10 },
      { x1: 40, y1: -10, x2: 30, y2: 35 },
      { x1: -10, y1: -60, x2: 5, y2: -20 }
    ];
    this.time = 0;
  }

  setTheme(themeName) {
    this.theme = themeName;
  }

  update(dt) {
    this.time += dt;

    // Update cloud positions
    this.clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > 1100) c.x = -150;
    });

    // Update birds
    this.birds.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.wingPhase += 0.1;
      if (b.x > 1100) b.x = -60;
      if (b.y < 50 || b.y > 180) b.vy *= -1;
    });
  }

  draw(ctx, width, height) {
    if (this.theme === 'FIELDS') {
      this._drawFieldsTheme(ctx, width, height);
    } else if (this.theme === 'DOJO') {
      this._drawDojoTheme(ctx, width, height);
    } else {
      this._drawCyberTheme(ctx, width, height);
    }

    // Draw central battleground cracked stone altar (matches reference game)
    this._drawStoneAltar(ctx, width / 2, height * 0.72);
  }

  _drawFieldsTheme(ctx, width, height) {
    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGrad.addColorStop(0, '#3a7bd5');
    skyGrad.addColorStop(0.5, '#68a0e8');
    skyGrad.addColorStop(1, '#d8ecf8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Procedural Fluffy Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this.clouds.forEach(c => {
      this._drawPuffyCloud(ctx, c.x, c.y, c.scale);
    });

    // 3. Flying birds in distant sky
    ctx.strokeStyle = 'rgba(30, 40, 50, 0.75)';
    ctx.lineWidth = 2;
    this.birds.forEach(b => {
      const wingY = Math.sin(b.wingPhase) * 3;
      ctx.beginPath();
      ctx.moveTo(b.x - 7, b.y + wingY);
      ctx.quadraticCurveTo(b.x - 3, b.y - 3, b.x, b.y);
      ctx.quadraticCurveTo(b.x + 3, b.y - 3, b.x + 7, b.y + wingY);
      ctx.stroke();
    });

    // 4. Distant Rolling Green Hill
    const hillGradFar = ctx.createLinearGradient(0, height * 0.35, 0, height * 0.7);
    hillGradFar.addColorStop(0, '#4b8c2c');
    hillGradFar.addColorStop(1, '#2f691b');
    ctx.fillStyle = hillGradFar;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.45);
    ctx.bezierCurveTo(width * 0.3, height * 0.38, width * 0.7, height * 0.52, width, height * 0.42);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // 5. Foreground Bliss Vibrant Hill
    const hillGradNear = ctx.createLinearGradient(0, height * 0.48, 0, height);
    hillGradNear.addColorStop(0, '#5ea833');
    hillGradNear.addColorStop(0.35, '#4e9929');
    hillGradNear.addColorStop(1, '#265913');
    ctx.fillStyle = hillGradNear;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.58);
    ctx.bezierCurveTo(width * 0.35, height * 0.46, width * 0.65, height * 0.52, width, height * 0.62);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // 6. Subtle field daisies / grass flowers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 40; i++) {
      const fx = (i * 27) % width;
      const fy = (height * 0.62) + ((i * 19) % (height * 0.35));
      ctx.fillRect(fx, fy, 2, 2);
    }
  }

  _drawPuffyCloud(ctx, x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, 22 * s, 0, Math.PI * 2);
    ctx.arc(x + 18 * s, y - 10 * s, 26 * s, 0, Math.PI * 2);
    ctx.arc(x + 42 * s, y - 5 * s, 20 * s, 0, Math.PI * 2);
    ctx.arc(x + 60 * s, y, 16 * s, 0, Math.PI * 2);
    ctx.arc(x + 30 * s, y + 10 * s, 24 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawDojoTheme(ctx, width, height) {
    // Sunset Dojo
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#801828');
    sky.addColorStop(0.5, '#e06030');
    sky.addColorStop(1, '#ffc060');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Huge sun
    ctx.fillStyle = 'rgba(255, 240, 200, 0.8)';
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.45, 110, 0, Math.PI * 2);
    ctx.fill();

    // Wooden dojo floor
    ctx.fillStyle = '#4a2818';
    ctx.fillRect(0, height * 0.68, width, height * 0.32);
    ctx.strokeStyle = '#2d180d';
    ctx.lineWidth = 3;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, height * 0.68);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }

  _drawCyberTheme(ctx, width, height) {
    // Cyberpunk Neon Grid
    ctx.fillStyle = '#080816';
    ctx.fillRect(0, 0, width, height);

    // Neon horizon
    const horizon = height * 0.65;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1.5;

    // Horizontal perspective grid lines
    for (let y = horizon; y < height; y += (y - horizon) * 0.3 + 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vanishing perspective lines
    for (let x = -width; x < width * 2; x += 90) {
      ctx.beginPath();
      ctx.moveTo(width / 2, horizon);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }

  _drawStoneAltar(ctx, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    // Cast ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 50, 160, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cracked monolith stones (matching itch.io screenshot behind stickmen)
    ctx.fillStyle = '#b0b5ba';
    ctx.strokeStyle = '#3e444a';
    ctx.lineWidth = 3;

    // Left stone pillar
    ctx.beginPath();
    ctx.moveTo(-90, 40);
    ctx.lineTo(-95, -70);
    ctx.lineTo(-65, -95);
    ctx.lineTo(-20, -85);
    ctx.lineTo(-10, 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right stone pillar
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(10, -80);
    ctx.lineTo(55, -90);
    ctx.lineTo(95, -60);
    ctx.lineTo(85, 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stone texture / cracks
    ctx.strokeStyle = '#2d3338';
    ctx.lineWidth = 2;
    this.stoneCracks.forEach(c => {
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.lineTo(c.x2, c.y2);
      ctx.stroke();
    });

    ctx.restore();
  }
}

export default new BackgroundRenderer();
