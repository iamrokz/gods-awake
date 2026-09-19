import type { Form, Facing } from '../core/types';
import { GRAVITY, MAX_FALL, resolvePlatforms, type Body } from '../core/Physics';
import type { Input } from '../core/Input';

export class Player implements Body {
  x: number;
  y: number;
  w = 28;
  h = 48;
  vx = 0;
  vy = 0;
  onGround = false;
  form: Form = 'anima';
  facing: Facing = 1;
  hp = 5;
  maxHp = 5;
  invuln = 0;
  attackTimer = 0;
  attackCooldown = 0;
  secondaryCooldown = 0;
  formCooldown = 0;
  dead = false;
  attacking = false;
  attackKind: 'primary' | 'secondary' | null = null;
  hitIds = new Set<number>();

  private jumpBuffer = 0;
  private coyote = 0;
  readonly speed = 320;
  readonly jumpForce = -720;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  update(input: Input, platforms: { x: number; y: number; w: number; h: number }[], dt: number) {
    if (this.dead) return;

    if (this.invuln > 0) this.invuln -= dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.secondaryCooldown > 0) this.secondaryCooldown -= dt;
    if (this.formCooldown > 0) this.formCooldown -= dt;
    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.attacking = false;
        this.attackKind = null;
      }
    }

    if (input.formSwitchPressed() && this.formCooldown <= 0) {
      this.form = this.form === 'anima' ? 'animus' : 'anima';
      this.formCooldown = 0.35;
    }

    const ax = input.axisX();
    this.vx = ax * this.speed;
    if (ax !== 0) this.facing = ax > 0 ? 1 : -1;

    if (this.onGround) this.coyote = 0.1;
    else this.coyote -= dt;

    if (input.jumpPressed()) this.jumpBuffer = 0.12;
    else this.jumpBuffer -= dt;

    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.vy = this.jumpForce;
      this.jumpBuffer = 0;
      this.coyote = 0;
      this.onGround = false;
    }

    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    resolvePlatforms(this, platforms, dt);

    if (input.primaryPressed() && this.attackCooldown <= 0) {
      this.attacking = true;
      this.attackKind = 'primary';
      this.attackTimer = this.form === 'anima' ? 0.28 : 0.22;
      this.attackCooldown = this.form === 'anima' ? 0.4 : 0.32;
      this.hitIds.clear();
    }
    if (input.secondaryPressed() && this.secondaryCooldown <= 0) {
      this.attacking = true;
      this.attackKind = 'secondary';
      this.attackTimer = 0.35;
      this.secondaryCooldown = this.form === 'anima' ? 1.2 : 1.0;
      this.hitIds.clear();
    }
  }

  getAttackHitbox(): { x: number; y: number; w: number; h: number } | null {
    if (!this.attacking || this.attackKind !== 'primary') return null;
    if (this.form === 'anima') {
      const r = 36;
      return {
        x: this.cx + this.facing * 28 - r / 2,
        y: this.cy - r / 2,
        w: r,
        h: r,
      };
    }
    return {
      x: this.facing > 0 ? this.x + this.w : this.x - 48,
      y: this.y + 4,
      w: 48,
      h: 40,
    };
  }

  takeDamage(amount: number) {
    if (this.invuln > 0 || this.dead) return false;
    this.hp -= amount;
    this.invuln = 1.1;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }
    return true;
  }

  heal(n: number) {
    this.hp = Math.min(this.maxHp, this.hp + n);
  }
}
