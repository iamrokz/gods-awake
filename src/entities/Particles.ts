import { COLORS } from '../art/draw';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; color: string; size: number;
}

export class ParticleSystem {
  list: Particle[] = [];

  burst(x: number, y: number, color: string, n = 12, speed = 180) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      this.list.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 60,
        life: 0.3 + Math.random() * 0.5,
        max: 0.8,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  formSwitch(x: number, y: number, toAnima: boolean) {
    this.burst(x, y, toAnima ? COLORS.redSoft : COLORS.animusGlow, 20, 220);
  }

  update(dt: number) {
    for (const p of this.list) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 400 * dt;
      p.life -= dt;
    }
    this.list = this.list.filter((p) => p.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    for (const p of this.list) {
      ctx.globalAlpha = p.life / p.max;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - camX, p.y - camY, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}
