import type { Form } from '../core/types';

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
}
