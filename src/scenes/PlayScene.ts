import type { Input } from '../core/Input';
import { aabbOverlap } from '../core/Physics';
import type { LevelDef, RegionDef } from '../core/types';
import { getRegion } from '../data/regions';
import { getLevel } from '../data/levels';
import { DIALOGUES } from '../data/dialogue';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { ParticleSystem } from '../entities/Particles';
import { DialogueBox } from '../ui/DialogueBox';
import { HUD } from '../ui/HUD';
import { GameWorld } from '../world/GameWorld';
import { COLORS } from '../art/colors';

export type PlayResult = 'quit' | 'complete' | 'dead' | null;

export class PlayScene {
  region: RegionDef;
  level: LevelDef;
  player: Player;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  particles = new ParticleSystem();
  dialogue: DialogueBox;
  hud: HUD;
  world: GameWorld;
  platforms: { x: number; y: number; w: number; h: number }[] = [];
  private t = 0;
  private paused = false;
  private secondaryFired = false;
  private erzahlerTriggered = false;
  private completeTimer = -1;
  private deathTimer = -1;
  private message = '';
  private messageTimer = 0;
  private pauseEl: HTMLElement;
  private deathEl: HTMLElement;
  private host: HTMLElement;

  constructor(regionId: number, canvas: HTMLCanvasElement, overlay: HTMLElement) {
    this.host = overlay;
    this.region = getRegion(regionId);
    const level = getLevel(regionId);
    if (!level) throw new Error('Level not playable');
    this.level = level;
    this.player = new Player(level.spawn.x, level.spawn.y);
    this.platforms = level.platforms.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h }));

    for (const e of level.enemies) {
      this.enemies.push(new Enemy(e));
    }
    if (level.elite) {
      this.enemies.push(new Enemy({ ...level.elite, type: 'elite' }));
    }
    if (level.boss) {
      const boss = new Enemy({ x: level.boss.x, y: level.boss.y, type: level.boss.type });
      boss.homeX = level.boss.x;
      this.enemies.push(boss);
    }

    this.world = new GameWorld(canvas, overlay, this.region, level);
    this.world.cam.snapTo(this.player.cx, -this.player.cy, this.player.facing);
    this.hud = new HUD(overlay);
    this.hud.setRegion(this.region);
    this.dialogue = new DialogueBox(overlay);

    this.pauseEl = document.createElement('div');
    this.pauseEl.className = 'overlay-panel';
    this.pauseEl.hidden = true;
    this.pauseEl.innerHTML = `<h2>PAUSE</h2><p>Esc — weiter</p><p>Q — Region wählen</p>`;
    overlay.appendChild(this.pauseEl);

    this.deathEl = document.createElement('div');
    this.deathEl.className = 'overlay-panel death';
    this.deathEl.hidden = true;
    this.deathEl.innerHTML = `<h2>NIEDERLAGE</h2><p>Enter — neu starten</p>`;
    overlay.appendChild(this.deathEl);
  }

  update(dt: number, input: Input): PlayResult {
    this.t += dt;

    if (this.completeTimer >= 0) {
      this.completeTimer -= dt;
      this.dialogue.update(dt);
      if (input.confirmPressed()) this.dialogue.advance();
      this.syncWorld(dt);
      if (this.completeTimer <= 0 && !this.dialogue.active) return 'complete';
      return null;
    }

    if (this.deathTimer >= 0) {
      this.deathTimer -= dt;
      this.deathEl.hidden = false;
      this.syncWorld(dt);
      if (this.deathTimer <= 0 || input.confirmPressed()) return 'dead';
      return null;
    }

    if (input.pausePressed() && !this.dialogue.active) {
      this.paused = !this.paused;
      this.pauseEl.hidden = !this.paused;
    }
    if (this.paused) {
      if (input.pressed('KeyQ')) return 'quit';
      this.syncWorld(dt);
      return null;
    }

    if (this.dialogue.active) {
      this.dialogue.update(dt);
      if (input.confirmPressed() || input.interactPressed()) {
        this.dialogue.advance();
      }
      this.syncWorld(dt);
      return null;
    }

    if (this.messageTimer > 0) this.messageTimer -= dt;

    if (input.cameraTogglePressed()) {
      const mode = this.world.cam.toggleMode();
      this.hud.showToast(mode === 'third' ? 'Kamera: Third-Person' : 'Kamera: Seite');
    }

    this.player.update(input, this.platforms, dt);

    if (this.player.attacking && this.player.attackKind === 'secondary') {
      if (!this.secondaryFired && this.player.attackTimer < 0.32) {
        this.secondaryFired = true;
        this.spawnSecondary();
      }
    } else {
      this.secondaryFired = false;
    }

    const hit = this.player.getAttackHitbox();
    if (hit) {
      for (const e of this.enemies) {
        if (e.dead) continue;
        if (aabbOverlap(hit, e.hitbox()) && !this.player.hitIds.has(e.id)) {
          this.player.hitIds.add(e.id);
          const dmg = this.player.form === 'anima' ? 1 : 2;
          e.takeDamage(dmg);
          this.particles.burst(
            e.cx, e.cy,
            this.player.form === 'anima' ? COLORS.redSoft : COLORS.animusGlow,
            8, 160
          );
          this.world.cam.addShake(0.3);
        }
      }
    }

    if (input.formSwitchPressed() && this.player.formCooldown > 0.3) {
      this.particles.formSwitch(this.player.cx, this.player.cy, this.player.form === 'anima');
    }

    for (const e of this.enemies) {
      if (e.dead) continue;
      const action = e.update(dt, this.player.cx, this.player.cy, this.platforms);
      if (action === 'shoot') {
        const dx = this.player.cx - e.cx;
        const dy = this.player.cy - e.cy;
        const len = Math.hypot(dx, dy) || 1;
        this.projectiles.push(new Projectile({
          x: e.cx, y: e.cy,
          vx: (dx / len) * 280, vy: (dy / len) * 280,
          form: 'anima', kind: 'enemyShot', damage: 1, fromPlayer: false, life: 2,
        }));
      }
      if (action === 'bossVolley') {
        const n = 3 + e.phase * 2;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + this.t;
          this.projectiles.push(new Projectile({
            x: e.cx, y: e.cy,
            vx: Math.cos(a) * 200, vy: Math.sin(a) * 160,
            form: 'anima', kind: 'enemyShot', damage: 1, fromPlayer: false, life: 2.5,
          }));
        }
        const dx = this.player.cx - e.cx;
        const dy = this.player.cy - e.cy;
        const len = Math.hypot(dx, dy) || 1;
        this.projectiles.push(new Projectile({
          x: e.cx, y: e.cy,
          vx: (dx / len) * 260, vy: (dy / len) * 260,
          form: 'anima', kind: 'enemyShot', damage: 2, fromPlayer: false, life: 2,
        }));
      }

      if (aabbOverlap(
        { x: this.player.x + 4, y: this.player.y + 4, w: this.player.w - 8, h: this.player.h - 8 },
        e.hitbox()
      )) {
        if (this.player.takeDamage(e.contactDamage() || e.damage)) {
          this.world.cam.addShake(0.8);
          this.player.vx = Math.sign(this.player.cx - e.cx) * 280;
          this.player.vy = -320;
        }
      }
    }

    for (const p of this.projectiles) {
      p.update(dt);
      if (p.dead) continue;
      if (p.fromPlayer) {
        for (const e of this.enemies) {
          if (e.dead) continue;
          if (aabbOverlap(
            { x: p.x - p.radius, y: p.y - p.radius, w: p.radius * 2, h: p.radius * 2 },
            e.hitbox()
          )) {
            e.takeDamage(p.damage);
            p.dead = true;
            this.particles.burst(p.x, p.y, p.kind === 'geo' ? COLORS.animusGlow : COLORS.redSoft, 6);
            break;
          }
        }
      } else {
        if (aabbOverlap(
          { x: p.x - p.radius, y: p.y - p.radius, w: p.radius * 2, h: p.radius * 2 },
          { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h }
        )) {
          if (this.player.takeDamage(p.damage)) {
            this.world.cam.addShake(0.5);
          }
          p.dead = true;
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.dead);

    for (const h of this.level.hazards) {
      let active = true;
      if (h.kind === 'laser') active = Math.sin(this.t * 3) > -0.3;
      if (!active) continue;
      if (aabbOverlap(
        { x: this.player.x + 6, y: this.player.y + 6, w: this.player.w - 12, h: this.player.h - 12 },
        h
      )) {
        if (this.player.takeDamage(h.damage ?? 1)) {
          this.world.cam.addShake(0.6);
          this.player.vy = -400;
        }
      }
    }

    if (this.player.y > this.level.height + 80) {
      this.player.takeDamage(99);
    }

    if (input.interactPressed()) {
      for (const npc of this.level.npcs) {
        const dx = this.player.cx - npc.x;
        const dy = this.player.cy - npc.y;
        if (Math.hypot(dx, dy) < 70) {
          const tree = DIALOGUES[npc.id];
          if (tree) this.dialogue.open(tree.lines);
          break;
        }
      }
      const ex = this.level.exit;
      if (Math.hypot(this.player.cx - ex.x, this.player.cy - ex.y) < 60) {
        this.tryComplete();
      }
    }

    if (this.region.id === 3 && !this.erzahlerTriggered && this.player.x > 3300) {
      this.erzahlerTriggered = true;
      this.dialogue.open(DIALOGUES.media_erzahler_tease.lines);
    }

    this.particles.update(dt);
    this.syncWorld(dt);

    if (this.player.dead) {
      this.deathTimer = 2.5;
      this.message = 'Du bist gefallen. Enter — erneut.';
      this.messageTimer = 3;
    }

    return null;
  }

  private syncWorld(dt: number) {
    this.world.syncPlayer(
      this.player.x, this.player.y, this.player.w, this.player.h,
      this.player.form, this.player.facing,
      this.player.attacking, this.player.attackKind,
      this.player.invuln, this.player.dead, this.t
    );

    for (const e of this.enemies) {
      this.world.syncEnemy(e.id, e.type, e.x, e.y, e.w, e.h, e.facing, e.dead, e.time);
    }

    const alive = new Set<object>();
    for (const p of this.projectiles) {
      alive.add(p);
      this.world.syncProjectile(p, p.kind, p.x, p.y, !p.dead);
    }
    this.world.pruneProjectiles(alive);
    this.world.syncParticles(this.particles.list);
    this.world.update(dt, this.player.cx, this.player.cy, this.player.facing);

    this.hud.update({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      form: this.player.form,
      primaryCd: this.player.attackCooldown,
      secondaryCd: this.player.secondaryCooldown,
      primaryMax: this.player.form === 'anima' ? 0.4 : 0.32,
      secondaryMax: this.player.form === 'anima' ? 1.2 : 1.0,
      hint: this.messageTimer > 0 ? this.message : nearHint(this),
      dt,
    });
  }

  render() {
    this.world.render();
  }

  private spawnSecondary() {
    const f = this.player.facing;
    if (this.player.form === 'anima') {
      for (let i = -1; i <= 1; i++) {
        this.projectiles.push(new Projectile({
          x: this.player.cx + f * 20,
          y: this.player.cy + i * 12,
          vx: f * 420, vy: i * 80,
          form: 'anima', kind: 'fragment', damage: 1, life: 0.9,
        }));
      }
    } else {
      this.projectiles.push(new Projectile({
        x: this.player.cx + f * 30,
        y: this.player.cy,
        vx: f * 380, vy: 0,
        form: 'animus', kind: 'geo', damage: 2, life: 0.7,
      }));
    }
  }

  private tryComplete() {
    const eliteAlive = this.enemies.some(
      (e) => !e.dead && (e.type === 'elite' || e.type === 'gridWarden' || e.type === 'tausendGesichter')
    );
    if (eliteAlive) {
      this.message = this.region.id === 3
        ? 'Besiege die Tausend Gesichter, bevor du gehst.'
        : 'Besiege den Elite-Wächter, bevor du gehst.';
      this.messageTimer = 3;
      return;
    }
    const key = this.region.id === 1 ? 'level_complete_civic' : 'level_complete_media';
    this.dialogue.open(DIALOGUES[key].lines);
    this.completeTimer = 0.5;
  }

  dispose() {
    this.world.dispose();
    this.hud.destroy();
    this.dialogue.destroy();
    this.pauseEl.remove();
    this.deathEl.remove();
  }
}

function nearHint(scene: PlayScene): string | undefined {
  const p = scene.player;
  for (const npc of scene.level.npcs) {
    if (Math.hypot(p.cx - npc.x, p.cy - npc.y) < 70) {
      return `E — mit ${npc.name} sprechen`;
    }
  }
  const ex = scene.level.exit;
  if (Math.hypot(p.cx - ex.x, p.cy - ex.y) < 80) {
    return 'E — Ausgang benutzen';
  }
  return undefined;
}
