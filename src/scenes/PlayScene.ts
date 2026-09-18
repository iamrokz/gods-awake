import type { Input } from '../core/Input';
import { Camera } from '../core/Camera';
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
import { drawHUD } from '../ui/HUD';
import {
  COLORS, drawNpc, drawSpikes, drawLaser, drawExit,
  drawBackgroundCivic, drawBackgroundMedia,
} from '../art/draw';

export type PlayResult = 'quit' | 'complete' | 'dead' | null;

export class PlayScene {
  region: RegionDef;
  level: LevelDef;
  player: Player;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  particles = new ParticleSystem();
  camera: Camera;
  dialogue = new DialogueBox();
  platforms: { x: number; y: number; w: number; h: number }[] = [];
  private t = 0;
  private paused = false;
  private secondaryFired = false;
  private erzahlerTriggered = false;
  private completeTimer = -1;
  private deathTimer = -1;
  private message = '';
  private messageTimer = 0;
  private interacted = new Set<string>();

  constructor(regionId: number) {
    this.region = getRegion(regionId);
    const level = getLevel(regionId);
    if (!level) throw new Error('Level not playable');
    this.level = level;
    this.player = new Player(level.spawn.x, level.spawn.y);
    this.camera = new Camera(1280, 720);
    this.platforms = level.platforms.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h }));

    for (const e of level.enemies) {
      this.enemies.push(new Enemy(e));
    }
    if (level.elite) {
      this.enemies.push(new Enemy({ ...level.elite, type: 'elite' }));
    }
    if (level.boss) {
      const boss = new Enemy({ x: level.boss.x, y: level.boss.y, type: level.boss.type });
      // store base Y in homeX for bob reference — keep y as spawn
      boss.homeX = level.boss.x;
      this.enemies.push(boss);
    }
  }

  update(dt: number, input: Input): PlayResult {
    this.t += dt;

    if (this.completeTimer >= 0) {
      this.completeTimer -= dt;
      this.dialogue.update(dt);
      if (input.confirmPressed()) this.dialogue.advance();
      if (this.completeTimer <= 0 && !this.dialogue.active) return 'complete';
      return null;
    }

    if (this.deathTimer >= 0) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0 || input.confirmPressed()) return 'dead';
      return null;
    }

    if (input.pausePressed() && !this.dialogue.active) {
      this.paused = !this.paused;
    }
    if (this.paused) {
      if (input.pressed('KeyQ')) return 'quit';
      return null;
    }

    if (this.dialogue.active) {
      this.dialogue.update(dt);
      if (input.confirmPressed() || input.interactPressed()) {
        this.dialogue.advance();
      }
      return null;
    }

    if (this.messageTimer > 0) this.messageTimer -= dt;

    this.player.update(input, this.platforms, dt);

    // secondary projectile spawn (once per attack)
    if (this.player.attacking && this.player.attackKind === 'secondary') {
      if (!this.secondaryFired && this.player.attackTimer < 0.32) {
        this.secondaryFired = true;
        this.spawnSecondary();
      }
    } else {
      this.secondaryFired = false;
    }

    // primary melee hits
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
          this.camera.addShake(0.3);
        }
      }
    }

    // form switch particles
    if (input.formSwitchPressed() && this.player.formCooldown > 0.3) {
      this.particles.formSwitch(this.player.cx, this.player.cy, this.player.form === 'anima');
    }

    // enemies
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
        // also spawn a screen face projectile toward player
        const dx = this.player.cx - e.cx;
        const dy = this.player.cy - e.cy;
        const len = Math.hypot(dx, dy) || 1;
        this.projectiles.push(new Projectile({
          x: e.cx, y: e.cy,
          vx: (dx / len) * 260, vy: (dy / len) * 260,
          form: 'anima', kind: 'enemyShot', damage: 2, fromPlayer: false, life: 2,
        }));
      }

      // contact
      if (aabbOverlap(
        { x: this.player.x + 4, y: this.player.y + 4, w: this.player.w - 8, h: this.player.h - 8 },
        e.hitbox()
      )) {
        if (this.player.takeDamage(e.contactDamage() || e.damage)) {
          this.camera.addShake(0.8);
          this.player.vx = Math.sign(this.player.cx - e.cx) * 280;
          this.player.vy = -320;
        }
      }
    }

    // projectiles
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
            this.camera.addShake(0.5);
          }
          p.dead = true;
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.dead);

    // hazards
    for (const h of this.level.hazards) {
      let active = true;
      if (h.kind === 'laser') active = Math.sin(this.t * 3) > -0.3;
      if (!active) continue;
      if (aabbOverlap(
        { x: this.player.x + 6, y: this.player.y + 6, w: this.player.w - 12, h: this.player.h - 12 },
        h
      )) {
        if (this.player.takeDamage(h.damage ?? 1)) {
          this.camera.addShake(0.6);
          this.player.vy = -400;
        }
      }
    }

    // fall death
    if (this.player.y > this.level.height + 80) {
      this.player.takeDamage(99);
    }

    // NPC interact
    if (input.interactPressed()) {
      for (const npc of this.level.npcs) {
        const dx = this.player.cx - npc.x;
        const dy = this.player.cy - npc.y;
        if (Math.hypot(dx, dy) < 70) {
          const tree = DIALOGUES[npc.id];
          if (tree) {
            this.dialogue.open(tree.lines);
            this.interacted.add(npc.id);
          }
          break;
        }
      }
      // exit
      const ex = this.level.exit;
      if (Math.hypot(this.player.cx - ex.x, this.player.cy - ex.y) < 60) {
        this.tryComplete();
      }
    }

    // auto exit proximity hint + Media Erzähler tease
    if (this.region.id === 3 && !this.erzahlerTriggered && this.player.x > 3300) {
      this.erzahlerTriggered = true;
      this.dialogue.open(DIALOGUES.media_erzahler_tease.lines);
    }

    // elite/boss gate for exit: must defeat elite or boss
    this.particles.update(dt);
    this.camera.follow({ x: this.player.cx, y: this.player.cy }, this.level.width, this.level.height, dt);

    if (this.player.dead) {
      this.deathTimer = 2.5;
      this.message = 'Du bist gefallen. Enter — erneut.';
      this.messageTimer = 3;
    }

    return null;
  }

  private spawnSecondary() {
    const f = this.player.facing;
    if (this.player.form === 'anima') {
      // Erinnerungsfragmente — 3 diamond shards
      for (let i = -1; i <= 1; i++) {
        this.projectiles.push(new Projectile({
          x: this.player.cx + f * 20,
          y: this.player.cy + i * 12,
          vx: f * 420, vy: i * 80,
          form: 'anima', kind: 'fragment', damage: 1, life: 0.9,
        }));
      }
    } else {
      // Geometrischer Impuls — square blast
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

  draw(ctx: CanvasRenderingContext2D) {
    // background
    if (this.region.id === 3) {
      drawBackgroundMedia(ctx, this.camera.x, 1280, 720, this.t);
    } else {
      drawBackgroundCivic(ctx, this.camera.x, 1280, 720, this.t);
    }

    // platforms
    for (const p of this.platforms) {
      const s = this.camera.worldToScreen(p.x, p.y);
      ctx.fillStyle = this.region.mid;
      ctx.fillRect(s.x, s.y, p.w, p.h);
      ctx.fillStyle = this.region.accent;
      ctx.fillRect(s.x, s.y, p.w, 3);
      // subtle edge
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(s.x, s.y + p.h - 4, p.w, 4);
    }

    // hazards
    for (const h of this.level.hazards) {
      const s = this.camera.worldToScreen(h.x, h.y);
      if (h.kind === 'spikes') drawSpikes(ctx, s.x, s.y, h.w, h.h);
      else if (h.kind === 'laser') drawLaser(ctx, s.x, s.y, h.w, h.h, this.t);
    }

    // exit
    {
      const ex = this.level.exit;
      const s = this.camera.worldToScreen(ex.x, ex.y);
      drawExit(ctx, s.x, s.y, this.t, this.region.accent);
    }

    // NPCs
    for (const npc of this.level.npcs) {
      const s = this.camera.worldToScreen(npc.x, npc.y);
      drawNpc(ctx, s.x, s.y, npc.role, this.t);
      ctx.fillStyle = COLORS.light;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(npc.name, s.x, s.y - 52);
    }

    // enemies
    for (const e of this.enemies) {
      if (e.dead) continue;
      const s = this.camera.worldToScreen(e.x, e.y);
      e.draw(ctx, s.x, s.y);
    }

    // player
    {
      const s = this.camera.worldToScreen(this.player.x, this.player.y);
      this.player.draw(ctx, s.x, s.y, this.t);
      // attack VFX
      if (this.player.attacking && this.player.attackKind === 'primary') {
        const hb = this.player.getAttackHitbox();
        if (hb) {
          const hs = this.camera.worldToScreen(hb.x, hb.y);
          ctx.strokeStyle = this.player.form === 'anima' ? COLORS.redSoft : COLORS.animusGlow;
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 2;
          if (this.player.form === 'anima') {
            ctx.beginPath();
            ctx.arc(hs.x + hb.w / 2, hs.y + hb.h / 2, hb.w / 2, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.strokeRect(hs.x, hs.y, hb.w, hb.h);
          }
          ctx.globalAlpha = 1;
        }
      }
    }

    // projectiles
    for (const p of this.projectiles) {
      const s = this.camera.worldToScreen(p.x, p.y);
      p.draw(ctx, s.x, s.y);
    }

    this.particles.draw(ctx, this.camera.x, this.camera.y);

    // vignette
    const vg = ctx.createRadialGradient(640, 360, 200, 640, 360, 700);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, 1280, 720);

    drawHUD(ctx, {
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      form: this.player.form,
      region: this.region,
      primaryCd: this.player.attackCooldown,
      secondaryCd: this.player.secondaryCooldown,
      primaryMax: this.player.form === 'anima' ? 0.4 : 0.32,
      secondaryMax: this.player.form === 'anima' ? 1.2 : 1.0,
      formFlash: this.player.formCooldown,
      hint: this.messageTimer > 0 ? this.message : nearHint(this),
    });

    this.dialogue.draw(ctx);

    if (this.paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSE', 640, 300);
      ctx.font = '18px sans-serif';
      ctx.fillStyle = COLORS.light;
      ctx.fillText('Esc — weiter', 640, 360);
      ctx.fillText('Q — Region wählen', 640, 400);
    }

    if (this.deathTimer >= 0) {
      ctx.fillStyle = 'rgba(20,0,0,0.55)';
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = COLORS.redSoft;
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NIEDERLAGE', 640, 340);
      ctx.fillStyle = COLORS.light;
      ctx.font = '16px sans-serif';
      ctx.fillText('Enter — neu starten', 640, 390);
    }
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
