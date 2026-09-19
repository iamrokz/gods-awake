import * as THREE from 'three';
import type { LevelDef, RegionDef, Form } from '../core/types';
import { Camera3D } from '../core/Camera3D';
import {
  createPlayerRoot, setPlayerForm, createPlatformMesh, createSpikesMesh,
  createLaserMesh, createExitMesh, createNpcMesh, createWatcherMesh,
  createMaskentraegerMesh, createEliteMesh, createDroneMesh,
  createBossTausendMesh, createProjectileMesh, createAttackVfx,
  createCityBackdrop, createParticleMesh,
} from '../art/meshes';
import { COLORS, hexToInt } from '../art/colors';
import { center3 } from '../core/coords';

export class GameWorld {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  cam: Camera3D;
  root: THREE.Group;
  playerMesh: THREE.Group;
  attackVfxAnima: THREE.Group;
  attackVfxAnimus: THREE.Group;
  private enemyMeshes = new Map<number, THREE.Group>();
  private projectileMeshes = new Map<object, THREE.Group>();
  private particleMeshes: THREE.Mesh[] = [];
  private laserMeshes: { mesh: THREE.Group; hazard: { kind: string } }[] = [];
  private npcLabels: { el: HTMLDivElement; x: number; y: number }[] = [];
  private bossOrbits: THREE.Group[] = [];
  private overlayHost: HTMLElement;
  private clock = 0;
  region: RegionDef;
  level: LevelDef;

  constructor(canvas: HTMLCanvasElement, overlayHost: HTMLElement, region: RegionDef, level: LevelDef) {
    this.overlayHost = overlayHost;
    this.region = region;
    this.level = level;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(1280, 720, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(hexToInt(region.bg), 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(hexToInt(region.bg), 0.00115);

    this.cam = new Camera3D(1280 / 720);
    this.root = new THREE.Group();
    this.scene.add(this.root);

    // lights — noir with red accent
    const amb = new THREE.AmbientLight(0x404050, 0.55);
    this.scene.add(amb);
    const hemi = new THREE.HemisphereLight(0x8890a0, 0x1a1018, 0.45);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffe8e0, 1.1);
    key.position.set(200, 400, 300);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 50;
    key.shadow.camera.far = 2000;
    key.shadow.camera.left = -400;
    key.shadow.camera.right = 400;
    key.shadow.camera.top = 400;
    key.shadow.camera.bottom = -400;
    this.scene.add(key);

    const rim = new THREE.PointLight(hexToInt(COLORS.red), 1.4, 900, 2);
    rim.position.set(400, -300, 120);
    this.scene.add(rim);
    this.root.userData.rim = rim;

    const fill = new THREE.PointLight(
      region.id === 3 ? hexToInt('#9b1b5e') : hexToInt(COLORS.animusGlow),
      0.6,
      700
    );
    fill.position.set(800, -500, 80);
    this.scene.add(fill);

    // backdrop
    this.root.add(createCityBackdrop(level.width, region.id));

    // platforms
    for (const p of level.platforms) {
      const depth = Math.min(56, 28 + p.h * 0.4);
      const mesh = createPlatformMesh(p.w, p.h, depth, region);
      const c = center3(p.x, p.y, p.w, p.h, 0);
      mesh.position.set(c.x, c.y, c.z);
      this.root.add(mesh);
    }

    // hazards
    for (const h of level.hazards) {
      if (h.kind === 'spikes') {
        const mesh = createSpikesMesh(h.w, h.h);
        const c = center3(h.x, h.y, h.w, h.h, 8);
        mesh.position.set(c.x, c.y, c.z);
        this.root.add(mesh);
      } else if (h.kind === 'laser') {
        const mesh = createLaserMesh(h.w, h.h);
        const c = center3(h.x, h.y, h.w, h.h, 6);
        mesh.position.set(c.x, c.y, c.z);
        this.root.add(mesh);
        this.laserMeshes.push({ mesh, hazard: h });
      }
    }

    // exit
    {
      const mesh = createExitMesh(region.accent);
      mesh.position.set(level.exit.x, -level.exit.y, 0);
      this.root.add(mesh);
      this.root.userData.exit = mesh;
    }

    // NPCs
    for (const npc of level.npcs) {
      const mesh = createNpcMesh(npc.role);
      mesh.position.set(npc.x, -npc.y + 10, 0);
      this.root.add(mesh);
      const el = document.createElement('div');
      el.className = 'world-label';
      el.textContent = npc.name;
      this.overlayHost.appendChild(el);
      this.npcLabels.push({ el, x: npc.x, y: npc.y - 55 });
    }

    // player
    this.playerMesh = createPlayerRoot();
    this.root.add(this.playerMesh);
    this.attackVfxAnima = createAttackVfx('anima');
    this.attackVfxAnimus = createAttackVfx('animus');
    this.root.add(this.attackVfxAnima);
    this.root.add(this.attackVfxAnimus);

    // subtle vignette via dark side planes optional — skip, CSS handles HUD
  }

  ensureEnemyMesh(id: number, type: string): THREE.Group {
    let m = this.enemyMeshes.get(id);
    if (m) return m;
    switch (type) {
      case 'watcher': m = createWatcherMesh(); break;
      case 'maskentraeger': m = createMaskentraegerMesh(); break;
      case 'drone': m = createDroneMesh(); break;
      case 'elite':
      case 'gridWarden': m = createEliteMesh(); break;
      case 'tausendGesichter':
        m = createBossTausendMesh();
        if (m.userData.orbit) this.bossOrbits.push(m.userData.orbit);
        break;
      default: m = createWatcherMesh();
    }
    // Clone materials so per-enemy hurt/telegraph flash does not tint shared cache
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const cloneOne = (mat: THREE.Material) => {
        const c = (mat as THREE.MeshStandardMaterial).clone();
        if (c.color) c.userData.baseColor = c.color.clone();
        if (c.emissive) c.userData.baseEmissive = c.emissive.clone();
        c.userData.baseEmissiveIntensity = c.emissiveIntensity ?? 0;
        return c;
      };
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(cloneOne);
      } else {
        mesh.material = cloneOne(mesh.material);
      }
    });
    this.root.add(m);
    this.enemyMeshes.set(id, m);
    return m;
  }

  syncEnemy(
    id: number, type: string, x: number, y: number, w: number, h: number,
    facing: number, dead: boolean, t: number, flash = 0, telegraph = 0
  ) {
    const m = this.ensureEnemyMesh(id, type);
    if (dead) {
      m.visible = false;
      return;
    }
    m.visible = true;
    const c = center3(x, y, w, h, 0);
    m.position.set(c.x, c.y, c.z);
    const face = facing >= 0 ? 1 : -1;
    // Telegraph: brief scale pulse + flash cue
    const pulse = telegraph > 0 ? 1 + 0.12 + Math.sin(t * 28) * 0.08 : 1;
    m.scale.set(face * pulse, pulse, pulse);
    if (type === 'drone') m.rotation.z = t * 2;
    if (type === 'tausendGesichter' && m.userData.orbit) {
      const orbit = m.userData.orbit as THREE.Group;
      orbit.rotation.y = t * 0.8;
      orbit.children.forEach((ch, i) => {
        const a = (i / orbit.children.length) * Math.PI * 2;
        const r = 70 + Math.sin(t * 2 + i) * 8;
        ch.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.45 + 10, Math.sin(a) * 20);
      });
    }

    // Hurt / telegraph flash: white-red tint on cloned materials
    const flashing = flash > 0 || telegraph > 0;
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const raw of mats) {
        const mat = raw as THREE.MeshStandardMaterial;
        if (!mat.color || !mat.userData.baseColor) continue;
        if (flashing) {
          const hurt = flash > 0;
          mat.color.set(hurt ? 0xffffff : 0xff6666);
          if (mat.emissive) mat.emissive.set(hurt ? 0xffffff : 0xff2222);
          mat.emissiveIntensity = hurt ? 1.4 : 0.9;
        } else {
          mat.color.copy(mat.userData.baseColor);
          if (mat.emissive && mat.userData.baseEmissive) mat.emissive.copy(mat.userData.baseEmissive);
          mat.emissiveIntensity = mat.userData.baseEmissiveIntensity ?? 0;
        }
      }
    });
  }

  syncPlayer(
    x: number, y: number, w: number, h: number,
    form: Form, facing: number, attacking: boolean, attackKind: string | null,
    invuln: number, dead: boolean, t: number
  ) {
    setPlayerForm(this.playerMesh, form);
    const c = center3(x, y, w, h, 0);
    this.playerMesh.position.set(c.x, c.y, c.z);
    this.playerMesh.scale.x = facing >= 0 ? 1 : -1;
    this.playerMesh.visible = !dead;
    if (!dead && invuln > 0 && Math.floor(invuln * 12) % 2 === 0) {
      this.playerMesh.visible = false;
    } else if (!dead) {
      this.playerMesh.visible = true;
    }
    // bob
    this.playerMesh.position.y += Math.sin(t * 6) * 0.8;

    const vfx = form === 'anima' ? this.attackVfxAnima : this.attackVfxAnimus;
    const other = form === 'anima' ? this.attackVfxAnimus : this.attackVfxAnima;
    other.visible = false;
    if (attacking && (attackKind === 'primary' || attackKind === 'secondary')) {
      vfx.visible = true;
      const secondary = attackKind === 'secondary';
      const ox = facing * (form === 'anima' ? (secondary ? 48 : 36) : (secondary ? 52 : 40));
      vfx.position.set(c.x + ox, c.y, 8);
      const sx = (facing >= 0 ? 1 : -1) * (secondary ? 1.35 : 1);
      const sy = secondary ? 1.25 : 1;
      vfx.scale.set(sx, sy, 1);
      vfx.rotation.z = form === 'anima' ? t * (secondary ? 14 : 8) : 0;
    } else {
      vfx.visible = false;
    }
  }

  syncProjectile(key: object, kind: 'fragment' | 'geo' | 'enemyShot', x: number, y: number, alive: boolean) {
    let m = this.projectileMeshes.get(key);
    if (!alive) {
      if (m) {
        m.visible = false;
        this.root.remove(m);
        this.projectileMeshes.delete(key);
      }
      return;
    }
    if (!m) {
      m = createProjectileMesh(kind);
      this.root.add(m);
      this.projectileMeshes.set(key, m);
    }
    m.visible = true;
    m.position.set(x, -y, 10);
    m.rotation.z += 0.15;
  }

  pruneProjectiles(alive: Set<object>) {
    for (const [k, m] of this.projectileMeshes) {
      if (!alive.has(k)) {
        this.root.remove(m);
        this.projectileMeshes.delete(k);
      }
    }
  }

  syncParticles(list: { x: number; y: number; color: string; size: number; life: number; max: number }[]) {
    while (this.particleMeshes.length < list.length) {
      const mesh = createParticleMesh(COLORS.redSoft);
      this.root.add(mesh);
      this.particleMeshes.push(mesh);
    }
    for (let i = 0; i < this.particleMeshes.length; i++) {
      const mesh = this.particleMeshes[i];
      if (i >= list.length) {
        mesh.visible = false;
        continue;
      }
      const p = list[i];
      mesh.visible = true;
      mesh.position.set(p.x, -p.y, 12);
      const s = p.size * 0.35 * (p.life / p.max);
      mesh.scale.setScalar(Math.max(0.2, s));
      const matRef = mesh.material as THREE.MeshStandardMaterial;
      matRef.color.set(p.color);
      matRef.emissive.set(p.color);
      matRef.opacity = Math.max(0, p.life / p.max);
      matRef.transparent = true;
    }
  }

  update(dt: number, playerCx: number, playerCy: number, facing: number = 1) {
    this.clock += dt;
    // rim light follows roughly
    const rim = this.root.userData.rim as THREE.PointLight | undefined;
    if (rim) {
      rim.position.x = playerCx + 120;
      rim.position.y = -playerCy + 40;
    }
    const exit = this.root.userData.exit as THREE.Group | undefined;
    if (exit) {
      const pulse = 0.5 + Math.sin(this.clock * 3) * 0.3;
      exit.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (m.emissiveIntensity !== undefined) m.emissiveIntensity = 0.2 + pulse * 0.4;
        }
      });
    }
    for (const { mesh } of this.laserMeshes) {
      const on = Math.sin(this.clock * 3) > -0.3;
      mesh.visible = true;
      const beam = mesh.userData.beam as THREE.Mesh;
      if (beam) {
        const m = beam.material as THREE.MeshStandardMaterial;
        m.opacity = on ? 0.8 : 0.12;
        m.emissiveIntensity = on ? 1.2 : 0.1;
      }
    }

    this.cam.follow(playerCx, -playerCy, this.level.width, dt, facing);
    this.updateLabels();
  }

  private updateLabels() {
    const cam = this.cam.camera;
    const w = 1280;
    const h = 720;
    for (const lab of this.npcLabels) {
      const v = new THREE.Vector3(lab.x, -lab.y, 0);
      v.project(cam);
      const sx = (v.x * 0.5 + 0.5) * w;
      const sy = (-v.y * 0.5 + 0.5) * h;
      if (v.z > 1 || sx < 0 || sx > w || sy < 0 || sy > h) {
        lab.el.style.display = 'none';
      } else {
        lab.el.style.display = 'block';
        lab.el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -100%)`;
      }
    }
  }

  render() {
    this.renderer.render(this.scene, this.cam.camera);
  }

  resize(cssW: number, cssH: number) {
    this.renderer.setSize(1280, 720, false);
    this.cam.setAspect(1280 / 720);
    void cssW; void cssH;
  }

  dispose() {
    for (const lab of this.npcLabels) lab.el.remove();
    this.npcLabels = [];
    this.renderer.dispose();
  }
}
