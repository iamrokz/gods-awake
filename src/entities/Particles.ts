import { COLORS } from '../art/colors';

export interface Particle {
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

  /** Stronger hit spark for melee / projectile impact juice. */
  hitBurst(x: number, y: number, color: string, heavy = false) {
    const n = heavy ? 22 : 16;
    const speed = heavy ? 320 : 260;
    this.burst(x, y, color, n, speed);
    // Secondary white flash sparks
    this.burst(x, y, '#ffffff', heavy ? 8 : 5, speed * 0.7);
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
}
