import type { Vec2 } from './types';

export class Camera {
  x = 0;
  y = 0;
  w: number;
  h: number;
  shake = 0;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  follow(target: Vec2, levelW: number, levelH: number, dt: number) {
    const tx = target.x - this.w * 0.4;
    const ty = target.y - this.h * 0.55;
    const lerp = 1 - Math.pow(0.001, dt);
    this.x += (tx - this.x) * lerp;
    this.y += (ty - this.y) * lerp;
    this.x = Math.max(0, Math.min(levelW - this.w, this.x));
    this.y = Math.max(0, Math.min(Math.max(0, levelH - this.h), this.y));
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 8);
  }

  worldToScreen(wx: number, wy: number): Vec2 {
    const ox = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 6 : 0;
    const oy = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 6 : 0;
    return { x: wx - this.x + ox, y: wy - this.y + oy };
  }

  addShake(amount: number) {
    this.shake = Math.min(2.5, this.shake + amount);
  }
}
