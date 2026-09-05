/**
 * Procedural 2D Skeletal Stickman Renderer & Combat State Machine
 * Keyboard Warrior: Stickman Typing Battle
 * Features 12-point joint hierarchy, accessories (Newsboy flat cap for player,
 * combat goggles for enemy), glowing katana rendering, and anime sword slashes.
 */

class StickmanRenderer {
  constructor(ctx, originX, originY, facing = 1, accessoryType = 'cap') {
    this.ctx = ctx;
    this.baseOrigin = { x: originX, y: originY };
    this.origin = { x: originX, y: originY };
    this.facing = facing; // 1 = right (Player), -1 = left (Enemy)
    this.accessory = accessoryType; // 'cap' | 'glasses'
    this.state = 'IDLE';
    this.frameTime = 0;
    this.stateDuration = 0;
    this.hitFlashTimer = 0;
    this.color = '#111111';
    this.bladeColor = '#ff2a4b';
    this.lungeOffset = 0;
  }

  setState(newState, customDuration = null) {
    if (this.state === 'KNOCKOUT') return; // Terminal state guard

    // Legal transitions check
    this.state = newState;
    this.frameTime = 0;

    if (newState === 'LIGHT_ATTACK') {
      this.stateDuration = customDuration || 280; // ms
    } else if (newState === 'HEAVY_ATTACK') {
      this.stateDuration = customDuration || 450;
    } else if (newState === 'SPECIAL_MOVE') {
      this.stateDuration = customDuration || 650;
    } else if (newState === 'HURT_REACTION') {
      this.stateDuration = customDuration || 250;
      this.hitFlashTimer = 120; // ms white silhouette flash
    } else if (newState === 'BLOCK') {
      this.stateDuration = customDuration || 350;
    } else if (newState === 'KNOCKOUT') {
      this.stateDuration = Infinity;
    } else {
      this.stateDuration = 0; // IDLE
    }
  }

  update(dt) {
    this.frameTime += dt;

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }

    // Auto-return to IDLE when attack/hurt finishes
    if (this.state !== 'IDLE' && this.state !== 'KNOCKOUT') {
      if (this.frameTime >= this.stateDuration) {
        this.setState('IDLE');
      }
    }
  }

  draw() {
    const { ctx, facing } = this;
    const pose = this._computeCurrentPose();

    ctx.save();
    ctx.translate(this.origin.x + this.lungeOffset * facing, this.origin.y);
    ctx.scale(facing, 1);

    // Hit flash effect: render bright white silhouette on damage
    const isFlashing = this.hitFlashTimer > 0;
    ctx.strokeStyle = isFlashing ? '#ffffff' : this.color;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Draw Legs (back leg first)
    this._drawLimb(0, 0, pose.legBack, isFlashing ? '#ffffff' : '#2c333a');
    this._drawLimb(0, 0, pose.legFront, ctx.strokeStyle);

    // 2. Draw Torso
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(pose.torsoEndX, -pose.torsoLen);
    ctx.stroke();

    const neckX = pose.torsoEndX;
    const neckY = -pose.torsoLen;

    // 3. Draw Back Arm
    this._drawLimb(neckX, neckY + 8, pose.armBack, isFlashing ? '#ffffff' : '#2c333a');

    // 4. Draw Head
    const headRadius = 14;
    const headCenterY = neckY - headRadius - 2;
    ctx.beginPath();
    ctx.arc(neckX, headCenterY, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = isFlashing ? '#ffffff' : '#f5f5f7';
    ctx.fill();
    ctx.stroke();

    // 5. Draw Accessories (Cap or Glasses)
    if (!isFlashing) {
      if (this.accessory === 'cap') {
        this._drawNewsboyCap(ctx, neckX, headCenterY, headRadius);
      } else if (this.accessory === 'glasses') {
        this._drawCombatGlasses(ctx, neckX, headCenterY, headRadius);
      }
    }

    // 6. Draw Eyes
    if (!isFlashing) {
      if (this.state === 'KNOCKOUT') {
        // X eyes for KO
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(neckX + 3, headCenterY - 3); ctx.lineTo(neckX + 9, headCenterY + 3);
        ctx.moveTo(neckX + 9, headCenterY - 3); ctx.lineTo(neckX + 3, headCenterY + 3);
        ctx.stroke();
      } else {
        // Focused combat eye
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(neckX + 6, headCenterY - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 7. Draw Front Arm + Katana Sword
    const handPos = this._drawLimb(neckX, neckY + 8, pose.armFront, ctx.strokeStyle);
    this._drawKatana(ctx, handPos.x, handPos.y, pose.swordAngle, isFlashing);

    ctx.restore();
  }

  _drawLimb(x, y, limb, strokeColor = null) {
    const { ctx } = this;
    if (strokeColor) ctx.strokeStyle = strokeColor;

    const midX = x + Math.cos(limb.angle1) * limb.len1;
    const midY = y + Math.sin(limb.angle1) * limb.len1;
    const endX = midX + Math.cos(limb.angle2) * limb.len2;
    const endY = midY + Math.sin(limb.angle2) * limb.len2;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(midX, midY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    return { x: endX, y: endY };
  }

  // Draw newsboy flat cap (Player signature style from reference image)
  _drawNewsboyCap(ctx, hx, hy, r) {
    ctx.save();
    ctx.fillStyle = '#2b2f38';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;

    // Cap crown
    ctx.beginPath();
    ctx.ellipse(hx - 2, hy - r + 3, r + 3, 7, -0.2, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cap brim pointing forward
    ctx.beginPath();
    ctx.moveTo(hx + 3, hy - r + 5);
    ctx.lineTo(hx + r + 8, hy - r + 8);
    ctx.lineTo(hx + r - 1, hy - r + 13);
    ctx.closePath();
    ctx.fillStyle = '#1a1d24';
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Draw combat glasses / nerd goggles (Enemy signature style from reference image)
  _drawCombatGlasses(ctx, hx, hy, r) {
    ctx.save();
    ctx.strokeStyle = '#111111';
    ctx.fillStyle = 'rgba(180, 240, 255, 0.9)';
    ctx.lineWidth = 2.5;

    // Rectangular frame
    ctx.fillRect(hx + 2, hy - 4, 11, 7);
    ctx.strokeRect(hx + 2, hy - 4, 11, 7);

    // Temple arm to ear
    ctx.beginPath();
    ctx.moveTo(hx + 2, hy - 1);
    ctx.lineTo(hx - 4, hy - 2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw glowing anime katana
  _drawKatana(ctx, hx, hy, angle, isFlashing) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(angle);

    // Handle (Tsuka)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-14, 0);
    ctx.stroke();

    // Guard (Tsuba)
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 6);
    ctx.stroke();

    // Glowing Blade (Ha)
    ctx.strokeStyle = isFlashing ? '#ffffff' : this.bladeColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = this.bladeColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(44, -2);
    ctx.stroke();

    // Blade highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(2, -1);
    ctx.lineTo(42, -2);
    ctx.stroke();

    ctx.restore();
  }

  _computeCurrentPose() {
    const t = this.frameTime;
    const progress = this.stateDuration > 0 ? Math.min(1.0, t / this.stateDuration) : 0;

    switch (this.state) {
      case 'LIGHT_ATTACK': {
        const swing = Math.sin(progress * Math.PI);
        this.lungeOffset = swing * 28;
        return {
          torsoLen: 46,
          torsoEndX: swing * 10,
          swordAngle: -1.2 + swing * 2.8,
          armFront: { angle1: 1.2 - swing * 1.6, len1: 20, angle2: 1.8 - swing * 1.2, len2: 18 },
          armBack:  { angle1: 1.8, len1: 18, angle2: 2.2, len2: 16 },
          legFront: { angle1: 1.1 + swing * 0.4, len1: 24, angle2: 1.6, len2: 24 },
          legBack:  { angle1: 1.9, len1: 24, angle2: 1.4, len2: 24 }
        };
      }

      case 'HEAVY_ATTACK': {
        const leap = Math.sin(progress * Math.PI);
        this.lungeOffset = leap * 42;
        return {
          torsoLen: 48,
          torsoEndX: leap * 16,
          swordAngle: -2.0 + leap * 3.6,
          armFront: { angle1: 0.6 - leap * 2.2, len1: 22, angle2: 0.9 - leap * 1.8, len2: 20 },
          armBack:  { angle1: 2.2, len1: 20, angle2: 2.4, len2: 18 },
          legFront: { angle1: 0.9 + leap * 0.6, len1: 26, angle2: 1.8, len2: 24 },
          legBack:  { angle1: 2.3, len1: 24, angle2: 1.3, len2: 24 }
        };
      }

      case 'SPECIAL_MOVE': {
        const spin = progress * Math.PI * 2;
        this.lungeOffset = Math.sin(progress * Math.PI) * 50;
        return {
          torsoLen: 46,
          torsoEndX: Math.sin(spin) * 12,
          swordAngle: spin * 2,
          armFront: { angle1: spin, len1: 22, angle2: spin + 0.5, len2: 20 },
          armBack:  { angle1: spin + Math.PI, len1: 20, angle2: spin + Math.PI + 0.3, len2: 18 },
          legFront: { angle1: 1.2, len1: 24, angle2: 1.7, len2: 24 },
          legBack:  { angle1: 1.9, len1: 24, angle2: 1.5, len2: 24 }
        };
      }

      case 'HURT_REACTION': {
        const flinch = Math.sin(progress * Math.PI);
        this.lungeOffset = -flinch * 24;
        return {
          torsoLen: 44,
          torsoEndX: -flinch * 18,
          swordAngle: 1.4 + flinch * 0.5,
          armFront: { angle1: 2.4 + flinch * 0.4, len1: 18, angle2: 2.6, len2: 16 },
          armBack:  { angle1: 2.2, len1: 18, angle2: 2.5, len2: 16 },
          legFront: { angle1: 1.3, len1: 22, angle2: 1.4, len2: 22 },
          legBack:  { angle1: 2.0, len1: 22, angle2: 2.1, len2: 20 }
        };
      }

      case 'BLOCK': {
        this.lungeOffset = -4;
        return {
          torsoLen: 44,
          torsoEndX: -4,
          swordAngle: -0.6, // Vertical blade parry
          armFront: { angle1: 0.8, len1: 19, angle2: -0.5, len2: 18 },
          armBack:  { angle1: 1.2, len1: 18, angle2: 0.2, len2: 16 },
          legFront: { angle1: 1.2, len1: 22, angle2: 1.8, len2: 22 },
          legBack:  { angle1: 2.1, len1: 24, angle2: 1.4, len2: 22 }
        };
      }

      case 'KNOCKOUT': {
        this.lungeOffset = -15;
        // Collapsed on ground
        return {
          torsoLen: 38,
          torsoEndX: 28, // Horizontal flat torso
          swordAngle: 2.8,
          armFront: { angle1: 2.8, len1: 18, angle2: 2.9, len2: 16 },
          armBack:  { angle1: 2.5, len1: 18, angle2: 2.7, len2: 16 },
          legFront: { angle1: 2.7, len1: 20, angle2: 2.8, len2: 20 },
          legBack:  { angle1: 2.6, len1: 20, angle2: 2.9, len2: 20 }
        };
      }

      case 'IDLE':
      default: {
        this.lungeOffset = 0;
        const sway = Math.sin(t / 380) * 0.08;
        return {
          torsoLen: 46 + Math.sin(t / 380) * 1.5,
          torsoEndX: 2,
          swordAngle: 1.1 + sway * 0.5,
          armFront: { angle1: 1.5 + sway, len1: 20, angle2: 1.7 + sway, len2: 18 },
          armBack:  { angle1: 1.4 - sway, len1: 20, angle2: 1.3 - sway, len2: 18 },
          legFront: { angle1: 1.35, len1: 24, angle2: 1.6, len2: 24 },
          legBack:  { angle1: 1.75, len1: 24, angle2: 1.45, len2: 24 }
        };
      }
    }
  }
}

export default StickmanRenderer;
