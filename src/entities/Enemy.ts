import type { EnemyDef } from '../core/types';
import { GRAVITY, MAX_FALL, resolvePlatforms, aabbOverlap, type Body } from '../core/Physics';
import {
  drawWatcher, drawMaskentraeger, drawElite, drawDrone, drawBossTausend,
} from '../art/draw';

export type EnemyType = EnemyDef['type'] | 'gridWarden' | 'tausendGesichter';

let _eid = 1;

export class Enemy implements Body {
  id = _eid++;
  x: number;
  y: number;
  w: number;
  h: number;
  vx = 0;
  vy = 0;
  onGround = false;
  type: EnemyType;
  hp: number;
  maxHp: number;
  dead = false;
  facing: 1 | -1 = -1;
  homeX: number;
  baseY: number;
  patrol: number;
  hurtTimer = 0;
  attackCd = 0;
  state: 'patrol' | 'chase' | 'attack' | 'phase' = 'patrol';
  phase = 0;
  flash = 0;
  private t = 0;
  damage = 1;
  scoreValue = 10;

  constructor(def: { x: number; y: number; type: EnemyType; patrol?: number }) {
    this.x = def.x;
    this.y = def.y;
    this.type = def.type;
    this.homeX = def.x;
    this.baseY = def.y;
    this.patrol = def.patrol ?? 100;

    switch (def.type) {
      case 'watcher':
        this.w = 28; this.h = 44; this.hp = 3; this.damage = 1; break;
      case 'maskentraeger':
        this.w = 30; this.h = 46; this.hp = 4; this.damage = 1; break;
      case 'drone':
        this.w = 28; this.h = 28; this.hp = 2; this.damage = 1; this.scoreValue = 15; break;
      case 'elite':
      case 'gridWarden':
        this.w = 44; this.h = 56; this.hp = 18; this.damage = 2; this.scoreValue = 100; break;
      case 'tausendGesichter':
        this.w = 56; this.h = 70; this.hp = 40; this.damage = 2; this.scoreValue = 250; break;
      default:
        this.w = 28; this.h = 40; this.hp = 3;
    }
    this.maxHp = this.hp;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  update(dt: number, playerX: number, playerY: number, platforms: { x: number; y: number; w: number; h: number }[]) {
    if (this.dead) return;
    this.t += dt;
    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.attackCd > 0) this.attackCd -= dt;
    if (this.flash > 0) this.flash -= dt;

    const dx = playerX - this.cx;
    const dist = Math.abs(dx);

    if (this.type === 'drone') {
      this.x += Math.sin(this.t * 1.5) * 40 * dt * (this.facing);
      this.y += Math.cos(this.t * 2) * 20 * dt;
      if (dist < 280 && this.attackCd <= 0) {
        this.attackCd = 1.8;
        return 'shoot';
      }
      return null;
    }

    if (this.type === 'tausendGesichter') {
      this.vy = 0;
      if (dist > 40) {
        this.vx = Math.sign(dx) * 70;
        this.facing = dx > 0 ? 1 : -1;
      } else this.vx = 0;
      this.x += this.vx * dt;
      // leash in arena
      if (this.x < this.homeX - 220) this.x = this.homeX - 220;
      if (this.x > this.homeX + 220) this.x = this.homeX + 220;
      this.y = this.baseY + Math.sin(this.t * 1.5) * 24;
      // phase up
      const ratio = this.hp / this.maxHp;
      this.phase = ratio < 0.35 ? 2 : ratio < 0.65 ? 1 : 0;
      if (this.attackCd <= 0) {
        this.attackCd = this.phase === 0 ? 1.6 : this.phase === 1 ? 1.1 : 0.75;
        return 'bossVolley';
      }
      return null;
    }

    // grounded enemies
    if (dist < 220 && this.type !== 'elite' && this.type !== 'gridWarden') {
      this.state = 'chase';
      this.facing = dx > 0 ? 1 : -1;
      this.vx = this.facing * (this.type === 'maskentraeger' ? 110 : 90);
    } else if (this.type === 'elite' || this.type === 'gridWarden') {
      if (dist < 360) {
        this.state = 'chase';
        this.facing = dx > 0 ? 1 : -1;
        this.vx = this.facing * 140;
        if (dist < 70 && this.attackCd <= 0) {
          this.attackCd = 1.2;
          this.state = 'attack';
        }
      } else {
        this.state = 'patrol';
        const offset = this.x - this.homeX;
        if (offset > this.patrol) this.facing = -1;
        if (offset < -this.patrol) this.facing = 1;
        this.vx = this.facing * 70;
      }
    } else {
      this.state = 'patrol';
      const offset = this.x - this.homeX;
      if (offset > this.patrol) this.facing = -1;
      if (offset < -this.patrol) this.facing = 1;
      this.vx = this.facing * 70;
    }

    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;
    resolvePlatforms(this, platforms, dt);

    // don't walk off forever — soft leash
    if (Math.abs(this.x - this.homeX) > this.patrol * 2.5 && this.state === 'patrol') {
      this.facing = this.x > this.homeX ? -1 : 1;
    }

    return null;
  }

  takeDamage(amount: number) {
    if (this.dead) return;
    this.hp -= amount;
    this.hurtTimer = 0.15;
    this.flash = 0.12;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }
  }

  hitbox() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  contactDamage(): number {
    if (this.dead || this.hurtTimer > 0.05) return 0;
    return this.damage;
  }

  draw(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
    if (this.dead) return;
    if (this.flash > 0) ctx.globalAlpha = 0.5;
    const cx = sx + this.w / 2;
    const cy = sy + this.h / 2;
    const ratio = this.hp / this.maxHp;
    switch (this.type) {
      case 'watcher':
        drawWatcher(ctx, cx, cy, this.facing, this.t); break;
      case 'maskentraeger':
        drawMaskentraeger(ctx, cx, cy, this.facing, this.t); break;
      case 'drone':
        drawDrone(ctx, cx, cy, this.t); break;
      case 'elite':
      case 'gridWarden':
        drawElite(ctx, cx, cy, this.facing, this.t, ratio); break;
      case 'tausendGesichter':
        drawBossTausend(ctx, cx, cy, this.t, ratio, this.phase); break;
    }
    ctx.globalAlpha = 1;
  }
}

export function enemyHitsPlayer(e: Enemy, px: number, py: number, pw: number, ph: number) {
  return !e.dead && aabbOverlap(e.hitbox(), { x: px, y: py, w: pw, h: ph });
}
