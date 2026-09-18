import type { Form } from '../core/types';
import { COLORS } from '../art/draw';

export class Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  form: Form;
  kind: 'fragment' | 'geo' | 'enemyShot';
  damage: number;
  radius: number;
  dead = false;
  fromPlayer: boolean;

  constructor(opts: {
    x: number; y: number; vx: number; vy: number;
    form: Form; kind: 'fragment' | 'geo' | 'enemyShot';
    damage?: number; life?: number; fromPlayer?: boolean;
  }) {
    this.x = opts.x;
    this.y = opts.y;
    this.vx = opts.vx;
    this.vy = opts.vy;
    this.form = opts.form;
    this.kind = opts.kind;
    this.damage = opts.damage ?? 1;
    this.maxLife = opts.life ?? 1.2;
    this.life = this.maxLife;
    this.fromPlayer = opts.fromPlayer ?? true;
    this.radius = opts.kind === 'geo' ? 14 : opts.kind === 'fragment' ? 8 : 6;
  }

  update(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
    const a = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(sx, sy);
    if (this.kind === 'fragment') {
      ctx.fillStyle = COLORS.redSoft;
      ctx.rotate(this.life * 8);
      for (let i = 0; i < 3; i++) {
        const ang = (i / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 10, Math.sin(ang) * 10);
        ctx.lineTo(Math.cos(ang + 0.5) * 4, Math.sin(ang + 0.5) * 4);
        ctx.lineTo(Math.cos(ang - 0.5) * 4, Math.sin(ang - 0.5) * 4);
        ctx.fill();
      }
    } else if (this.kind === 'geo') {
      ctx.strokeStyle = COLORS.animusGlow;
      ctx.lineWidth = 2;
      ctx.strokeRect(-12, -12, 24, 24);
      ctx.fillStyle = 'rgba(94,176,255,0.3)';
      ctx.fillRect(-12, -12, 24, 24);
    } else {
      ctx.fillStyle = COLORS.red;
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
