import * as THREE from 'three';
import type { Form, RegionDef } from '../core/types';
import { COLORS, hexToInt } from './colors';

const matCache = new Map<string, THREE.MeshStandardMaterial>();

export function mat(color: string, opts: { emissive?: string; emissiveIntensity?: number; metalness?: number; roughness?: number } = {}) {
  const key = `${color}|${opts.emissive ?? ''}|${opts.emissiveIntensity ?? 0}|${opts.metalness ?? 0.15}|${opts.roughness ?? 0.75}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: hexToInt(color),
      emissive: opts.emissive ? hexToInt(opts.emissive) : 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0,
      metalness: opts.metalness ?? 0.15,
      roughness: opts.roughness ?? 0.75,
    });
    matCache.set(key, m);
  }
  return m;
}

function box(w: number, h: number, d: number, color: string, opts?: Parameters<typeof mat>[1]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sphere(r: number, color: string, opts?: Parameters<typeof mat>[1]) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat(color, opts));
  mesh.castShadow = true;
  return mesh;
}

function cyl(rTop: number, rBot: number, h: number, color: string, opts?: Parameters<typeof mat>[1]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 8), mat(color, opts));
  mesh.castShadow = true;
  return mesh;
}

/** Anima: soft circle silhouette — cape + sphere emblem + rounded head */
export function createAnimaMesh(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'anima';

  const cape = box(18, 36, 8, COLORS.anima);
  cape.position.set(-2, 0, -4);
  cape.rotation.z = 0.12;
  g.add(cape);

  const body = box(14, 26, 10, '#1a1a1e');
  body.position.set(0, -2, 0);
  g.add(body);

  const emblem = sphere(7, COLORS.animaAccent, { emissive: COLORS.red, emissiveIntensity: 0.35 });
  emblem.position.set(2, 2, 7);
  g.add(emblem);
  const emblemCore = sphere(3.5, COLORS.anima);
  emblemCore.position.set(2, 2, 10);
  g.add(emblemCore);

  const head = sphere(9, '#d4cfc8');
  head.position.set(0, 18, 0);
  g.add(head);

  const hair = sphere(10, '#2a2228');
  hair.scale.set(1.1, 0.7, 1);
  hair.position.set(-1, 24, -2);
  g.add(hair);

  const bootL = box(7, 8, 10, COLORS.animaAccent, { emissive: COLORS.red, emissiveIntensity: 0.15 });
  bootL.position.set(-5, -20, 1);
  g.add(bootL);
  const bootR = box(7, 8, 10, COLORS.animaAccent, { emissive: COLORS.red, emissiveIntensity: 0.15 });
  bootR.position.set(5, -20, 1);
  g.add(bootR);

  return g;
}

/** Animus: angular square silhouette — coat + cube emblem + spiked helm */
export function createAnimusMesh(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'animus';

  const coat = box(22, 40, 12, COLORS.animus);
  coat.position.set(0, -2, -2);
  g.add(coat);

  const body = box(14, 24, 10, '#0e1420');
  body.position.set(0, -2, 2);
  g.add(body);

  const emblem = box(12, 12, 4, COLORS.animusAccent, { emissive: COLORS.animusGlow, emissiveIntensity: 0.45 });
  emblem.position.set(0, 2, 8);
  g.add(emblem);

  const helm = box(18, 14, 14, '#1e2838');
  helm.position.set(0, 20, 0);
  g.add(helm);

  const visor = box(12, 3, 2, COLORS.animusGlow, { emissive: COLORS.animusGlow, emissiveIntensity: 0.8 });
  visor.position.set(0, 20, 8);
  g.add(visor);

  const spikeL = box(3, 12, 3, '#0a1018');
  spikeL.position.set(-6, 30, 0);
  spikeL.rotation.z = 0.25;
  g.add(spikeL);
  const spikeR = box(3, 14, 3, '#0a1018');
  spikeR.position.set(4, 32, 0);
  spikeR.rotation.z = -0.15;
  g.add(spikeR);

  const bootL = box(8, 8, 10, '#0a1018');
  bootL.position.set(-5, -20, 1);
  g.add(bootL);
  const bootR = box(8, 8, 10, '#0a1018');
  bootR.position.set(5, -20, 1);
  g.add(bootR);

  return g;
}

export function createPlayerRoot(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'player';
  const anima = createAnimaMesh();
  const animus = createAnimusMesh();
  animus.visible = false;
  root.add(anima);
  root.add(animus);
  root.userData.anima = anima;
  root.userData.animus = animus;
  return root;
}

export function setPlayerForm(root: THREE.Group, form: Form) {
  const anima = root.userData.anima as THREE.Group;
  const animus = root.userData.animus as THREE.Group;
  anima.visible = form === 'anima';
  animus.visible = form === 'animus';
}

export function createWatcherMesh(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(26, 34, 14, '#2a2a30'));
  const chest = box(16, 10, 4, COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.3 });
  chest.position.set(0, 6, 8);
  g.add(chest);
  const head = box(18, 14, 14, '#1a1a1e');
  head.position.set(0, 22, 0);
  g.add(head);
  const visor = box(10, 3, 2, COLORS.redSoft, { emissive: COLORS.redSoft, emissiveIntensity: 0.6 });
  visor.position.set(0, 22, 8);
  g.add(visor);
  const staff = cyl(1.5, 1.5, 48, '#888888');
  staff.position.set(16, 4, 0);
  g.add(staff);
  const orb = sphere(5, COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.5 });
  orb.position.set(16, 30, 0);
  g.add(orb);
  return g;
}

export function createMaskentraegerMesh(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(22, 32, 12, '#1a1420'));
  const stripe = box(6, 20, 3, COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.25 });
  stripe.position.set(-8, 0, 7);
  g.add(stripe);
  const mask = sphere(11, COLORS.white);
  mask.scale.set(1, 1.15, 0.85);
  mask.position.set(0, 20, 4);
  g.add(mask);
  const eyeL = box(3, 4, 2, '#0a0a0c');
  eyeL.position.set(-4, 22, 12);
  g.add(eyeL);
  const eyeR = box(3, 4, 2, '#0a0a0c');
  eyeR.position.set(4, 22, 12);
  g.add(eyeR);
  const shield = box(8, 22, 4, '#3a3040');
  shield.position.set(-16, 0, 2);
  g.add(shield);
  const blade = box(3, 22, 2, COLORS.light, { metalness: 0.6, roughness: 0.3 });
  blade.position.set(16, 4, 0);
  blade.rotation.z = -0.4;
  g.add(blade);
  return g;
}

export function createEliteMesh(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(40, 48, 20, '#1e2228'));
  const band = box(40, 8, 4, COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.4 });
  band.position.set(0, 18, 11);
  g.add(band);
  const crest = box(10, 18, 6, COLORS.gold, { emissive: COLORS.gold, emissiveIntensity: 0.2 });
  crest.position.set(0, 36, 0);
  crest.rotation.z = Math.PI / 4;
  g.add(crest);
  const visor = box(22, 5, 2, COLORS.redSoft, { emissive: COLORS.redSoft, emissiveIntensity: 0.7 });
  visor.position.set(0, 8, 12);
  g.add(visor);
  const pole = cyl(2, 2, 70, '#aaaaaa', { metalness: 0.5 });
  pole.position.set(24, 10, 0);
  g.add(pole);
  const blade = box(18, 10, 3, COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.35 });
  blade.position.set(34, 40, 0);
  g.add(blade);
  return g;
}

export function createDroneMesh(): THREE.Group {
  const g = new THREE.Group();
  const hex = new THREE.Mesh(
    new THREE.CylinderGeometry(12, 12, 6, 6),
    mat(COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.25, metalness: 0.4 })
  );
  hex.rotation.x = Math.PI / 2;
  g.add(hex);
  const core = sphere(4, COLORS.redSoft, { emissive: COLORS.redSoft, emissiveIntensity: 0.8 });
  g.add(core);
  return g;
}

export function createBossTausendMesh(): THREE.Group {
  const g = new THREE.Group();
  const body = box(50, 64, 24, '#1a1420');
  g.add(body);
  const head = sphere(18, COLORS.white);
  head.position.set(0, 42, 4);
  g.add(head);
  const pupil = sphere(7, COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.6 });
  pupil.position.set(0, 44, 18);
  g.add(pupil);
  const eyeMark = box(28, 4, 2, COLORS.redSoft, { emissive: COLORS.redSoft, emissiveIntensity: 0.4 });
  eyeMark.position.set(0, 4, 14);
  g.add(eyeMark);

  const orbit = new THREE.Group();
  orbit.name = 'screens';
  for (let i = 0; i < 8; i++) {
    const screen = box(20, 28, 4, i % 2 === 0 ? '#2a1830' : '#1a1020', {
      emissive: COLORS.red,
      emissiveIntensity: 0.15,
    });
    const face = sphere(5, COLORS.white);
    face.position.set(0, 2, 4);
    screen.add(face);
    orbit.add(screen);
  }
  g.add(orbit);
  g.userData.orbit = orbit;
  return g;
}

export function createNpcMesh(role: string): THREE.Group {
  const g = new THREE.Group();
  const robe = box(22, 36, 12, '#3a3a42');
  g.add(robe);
  const hood = sphere(12, '#c8c4be');
  hood.position.set(0, 18, 0);
  g.add(hood);
  const face = sphere(8, '#2a2a30');
  face.position.set(0, 16, 6);
  g.add(face);
  const accent =
    role === 'Wahrheit'
      ? sphere(5, COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.4 })
      : box(8, 8, 4, COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.25 });
  accent.position.set(0, 2, 8);
  g.add(accent);
  return g;
}

export function createPlatformMesh(w: number, h: number, depth: number, region: RegionDef): THREE.Group {
  const g = new THREE.Group();
  const body = box(w, h, depth, region.mid);
  g.add(body);
  const top = box(w, 4, depth + 4, region.accent, { emissive: region.accent, emissiveIntensity: 0.18 });
  top.position.y = h / 2 - 2;
  g.add(top);
  // Bevel lip so thick floors read as ledges from third-person
  const lip = box(w + 2, 2, depth + 6, region.mid);
  lip.position.y = h / 2 - 0.5;
  g.add(lip);
  return g;
}

export function createSpikesMesh(w: number, h: number): THREE.Group {
  const g = new THREE.Group();
  const n = Math.max(2, Math.floor(w / 16));
  const sw = w / n;
  // Extra Z rows so pits read as street-wide traps in third-person
  const zRows = [-28, 0, 28];
  for (const zz of zRows) {
    for (let i = 0; i < n; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(sw * 0.35, h, 4),
        mat('#4a4a50', { emissive: COLORS.red, emissiveIntensity: 0.15 })
      );
      spike.position.set(-w / 2 + sw * i + sw / 2, 0, zz);
      spike.castShadow = true;
      g.add(spike);
    }
  }
  return g;
}

export function createLaserMesh(w: number, h: number): THREE.Group {
  const g = new THREE.Group();
  const beam = box(Math.max(w, 8), Math.max(h, 8), 28, COLORS.red, {
    emissive: COLORS.redSoft,
    emissiveIntensity: 0.9,
  });
  beam.material = mat(COLORS.redSoft, { emissive: COLORS.redSoft, emissiveIntensity: 1.2 });
  (beam.material as THREE.MeshStandardMaterial).transparent = true;
  (beam.material as THREE.MeshStandardMaterial).opacity = 0.75;
  g.add(beam);
  g.userData.beam = beam;
  return g;
}

export function createExitMesh(accent: string): THREE.Group {
  const g = new THREE.Group();
  const frame = box(48, 64, 24, accent, { emissive: accent, emissiveIntensity: 0.35 });
  (frame.material as THREE.MeshStandardMaterial).transparent = true;
  (frame.material as THREE.MeshStandardMaterial).opacity = 0.55;
  g.add(frame);
  const inner = box(36, 52, 4, COLORS.white, { emissive: accent, emissiveIntensity: 0.2 });
  (inner.material as THREE.MeshStandardMaterial).transparent = true;
  (inner.material as THREE.MeshStandardMaterial).opacity = 0.25;
  g.add(inner);
  return g;
}

export function createProjectileMesh(kind: 'fragment' | 'geo' | 'enemyShot'): THREE.Group {
  const g = new THREE.Group();
  if (kind === 'fragment') {
    const s = new THREE.Mesh(
      new THREE.OctahedronGeometry(7),
      mat(COLORS.redSoft, { emissive: COLORS.redSoft, emissiveIntensity: 0.8 })
    );
    g.add(s);
  } else if (kind === 'geo') {
    const s = box(18, 18, 18, COLORS.animusAccent, { emissive: COLORS.animusGlow, emissiveIntensity: 0.7 });
    (s.material as THREE.MeshStandardMaterial).transparent = true;
    (s.material as THREE.MeshStandardMaterial).opacity = 0.7;
    g.add(s);
  } else {
    g.add(sphere(5, COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.9 }));
  }
  return g;
}

export function createAttackVfx(form: Form): THREE.Group {
  const g = new THREE.Group();
  if (form === 'anima') {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(18, 2, 6, 16),
      mat(COLORS.redSoft, { emissive: COLORS.redSoft, emissiveIntensity: 1 })
    );
    ring.rotation.y = Math.PI / 2;
    g.add(ring);
  } else {
    const blade = box(40, 8, 4, COLORS.animusGlow, { emissive: COLORS.animusGlow, emissiveIntensity: 1 });
    g.add(blade);
  }
  g.visible = false;
  return g;
}

/** Low-poly city backdrop buildings along X */
export function createCityBackdrop(levelW: number, regionId: number): THREE.Group {
  const g = new THREE.Group();
  g.name = 'backdrop';
  const isMedia = regionId === 3;
  const baseColor = isMedia ? '#140818' : '#12151c';
  const midColor = isMedia ? '#1a1020' : '#1e222c';

  for (let i = 0; i < Math.ceil(levelW / 180) + 4; i++) {
    const bx = i * 180 - 100;
    const bh = 180 + ((i * 47) % 220);
    const bw = 70 + (i % 3) * 25;
    const building = box(bw, bh, 60, i % 2 === 0 ? baseColor : midColor);
    building.position.set(bx, -760 + bh / 2 + 40, -160 - (i % 4) * 40);
    building.receiveShadow = true;
    building.castShadow = false;
    g.add(building);

    if (i % 3 === 0) {
      const banner = box(10, 60 + (i % 2) * 40, 2, COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.3 });
      banner.position.set(bx, -760 + bh - 40, -128);
      g.add(banner);
    }

    if (isMedia && i % 2 === 0) {
      const screen = box(bw * 0.55, 40, 3, COLORS.red, { emissive: COLORS.redSoft, emissiveIntensity: 0.55 });
      screen.position.set(bx, -760 + bh - 80, -128);
      g.add(screen);
    }
  }

  // far layer
  for (let i = 0; i < Math.ceil(levelW / 260) + 2; i++) {
    const bx = i * 260;
    const bh = 280 + ((i * 73) % 200);
    const building = box(120, bh, 40, isMedia ? '#0e0612' : '#0e1016');
    building.position.set(bx, -760 + bh / 2 + 60, -280);
    g.add(building);
  }

  // ground plane strip for visual floor
  const ground = box(levelW + 400, 8, 320, isMedia ? '#0a0810' : '#0a0a0c');
  ground.position.set(levelW / 2, -768, -80);
  ground.receiveShadow = true;
  g.add(ground);

  return g;
}

export function createParticleMesh(color: string): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 4),
    mat(color, { emissive: color, emissiveIntensity: 0.6 })
  );
}
