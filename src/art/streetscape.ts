import * as THREE from 'three';
import type { LevelDef, PlatformDef, RegionDef } from '../core/types';
import { center3 } from '../core/coords';
import { COLORS, hexToInt } from './colors';
import { createPlatformMesh, mat } from './meshes';

function box(w: number, h: number, d: number, color: string, opts?: Parameters<typeof mat>[1]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function isGround(p: PlatformDef): boolean {
  return p.h >= 80 || p.y >= 700;
}

function isArenaFloor(p: PlatformDef, level: LevelDef): boolean {
  if (p.w < 350 || p.h > 40) return false;
  if (level.elite) {
    const e = level.elite;
    if (e.x >= p.x - 40 && e.x <= p.x + p.w + 40 && e.y <= p.y + 80) return true;
  }
  if (level.boss) {
    const b = level.boss;
    if (b.x >= p.x - 40 && b.x <= p.x + p.w + 40 && b.y <= p.y + 80) return true;
  }
  // Wide raised floors near late level also count as plazas
  return p.w >= 450 && p.y < 700 && p.y > 500;
}

function hash(i: number, salt = 0): number {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Build walkable-looking streets / plazas from level platform defs.
 * Collision remains 2D AABB on the play plane; visual Z can be wider.
 */
export function createStreetscape(level: LevelDef, region: RegionDef): THREE.Group {
  const root = new THREE.Group();
  root.name = 'streetscape';

  const streetDepth = level.streetDepth ?? 100;
  const wallHeight = level.wallHeight ?? 160;
  const half = streetDepth / 2;
  const isMedia = region.id === 3;

  const facadeDark = isMedia ? '#120816' : '#1a1e26';
  const facadeMid = isMedia ? '#1c1024' : '#242830';
  const facadeLite = isMedia ? '#2a1830' : '#323640';
  const curbColor = isMedia ? '#1a1220' : '#3a3e46';
  const railColor = isMedia ? '#4a2040' : '#5a5e66';
  const roadColor = isMedia ? '#0e0a14' : '#181a20';

  // Continuous void / under-street plane so gaps don't show infinite empty
  const under = box(level.width + 600, 6, streetDepth + 80, isMedia ? '#06040a' : '#08080c');
  under.position.set(level.width / 2, -900, 0);
  under.receiveShadow = true;
  under.castShadow = false;
  root.add(under);

  // Visual road strips in gaps (below play height, no collision) — broken asphalt look
  const grounds = level.platforms.filter(isGround).sort((a, b) => a.x - b.x);
  for (let i = 0; i < grounds.length - 1; i++) {
    const a = grounds[i];
    const b = grounds[i + 1];
    const gapX = a.x + a.w;
    const gapW = b.x - gapX;
    if (gapW < 40 || gapW > 280) continue;
    // Thin lowered road remnant in the gap (player still falls — visual only, below spikes)
    const strip = box(gapW - 8, 10, streetDepth * 0.85, roadColor);
    const cy = -(Math.max(a.y, b.y) + 40);
    strip.position.set(gapX + gapW / 2, cy, 0);
    strip.receiveShadow = true;
    root.add(strip);
    // Broken curb lips
    for (const side of [-1, 1] as const) {
      const lip = box(10, 14, streetDepth * 0.9, curbColor);
      lip.position.set(side < 0 ? gapX + 6 : gapX + gapW - 6, cy + 8, 0);
      root.add(lip);
    }
  }

  for (let pi = 0; pi < level.platforms.length; pi++) {
    const p = level.platforms[pi];
    const ground = isGround(p);
    const arena = isArenaFloor(p, level);
    const depth = ground || arena ? streetDepth : Math.max(52, streetDepth * 0.55);
    const c = center3(p.x, p.y, p.w, p.h, 0);

    // Floor slab (deeper than old cardboard)
    const floor = createPlatformMesh(p.w, p.h, depth, region);
    floor.position.set(c.x, c.y, 0);
    root.add(floor);

    // Road surface overlay on top of tall ground blocks (continuous street look)
    if (ground) {
      const road = box(p.w - 4, 4, depth - 8, roadColor);
      road.position.set(c.x, -(p.y) + 2, 0);
      road.receiveShadow = true;
      road.castShadow = false;
      root.add(road);

      // Center dashed line (civic order / media neon)
      const dashColor = isMedia ? COLORS.redSoft : '#6a6e76';
      const dashN = Math.max(1, Math.floor(p.w / 70));
      for (let d = 0; d < dashN; d++) {
        const dash = box(28, 2, 4, dashColor, {
          emissive: isMedia ? COLORS.redSoft : undefined,
          emissiveIntensity: isMedia ? 0.35 : 0,
        });
        dash.position.set(p.x + 40 + d * 70, -(p.y) + 4.5, 0);
        root.add(dash);
      }
    }

    const topY = -(p.y); // Three Y of platform top surface
    const halfD = depth / 2;

    // Curbs along Z edges
    const curbH = ground || arena ? 12 : 8;
    const curbW = p.w;
    for (const zSign of [-1, 1] as const) {
      const curb = box(curbW, curbH, 6, curbColor);
      curb.position.set(c.x, topY + curbH / 2, zSign * (halfD - 3));
      root.add(curb);
    }

    if (ground || arena) {
      // BACK facade (+ enclosure toward backdrop, -Z)
      addBackFacade(root, p, topY, halfD, wallHeight, {
        facadeDark, facadeMid, facadeLite, isMedia, region, pi,
      });

      // FRONT railing / low wall (+Z, camera side) — keep side-view silhouettes readable
      addFrontRail(root, p, topY, halfD, {
        railColor, isMedia, region, arena,
      });

      // Pillars / lamp posts along the path
      addStreetProps(root, p, topY, halfD, {
        isMedia, region, pi, ground, arena,
      });
    } else {
      // Floating ledges: short side rails so they feel like balconies/walkways
      const railH = 18;
      for (const zSign of [-1, 1] as const) {
        const rail = box(p.w, railH, 3, railColor, {
          emissive: isMedia ? region.accent : undefined,
          emissiveIntensity: isMedia ? 0.15 : 0,
        });
        rail.position.set(c.x, topY + railH / 2, zSign * (halfD - 2));
        root.add(rail);
      }
      // Support beams under floating platforms (visual depth)
      if (p.w > 80) {
        const beam = box(Math.min(p.w * 0.6, 80), 8, 8, facadeMid);
        beam.position.set(c.x, c.y - p.h / 2 - 6, 0);
        root.add(beam);
      }
    }

    if (arena) {
      addPlazaPerimeter(root, p, topY, halfD, wallHeight * 0.85, {
        facadeDark, facadeMid, isMedia, region,
      });
    }
  }

  // Soft fill light strips along street for third-person readability
  const fill = new THREE.Group();
  fill.name = 'streetLights';
  const lightColor = isMedia ? hexToInt(COLORS.redSoft) : hexToInt(region.accent);
  for (let x = 200; x < level.width; x += 420) {
    const pl = new THREE.PointLight(lightColor, isMedia ? 0.55 : 0.35, 280, 2);
    pl.position.set(x, -520, half * 0.3);
    fill.add(pl);
  }
  root.add(fill);

  return root;
}

function addBackFacade(
  root: THREE.Group,
  p: PlatformDef,
  topY: number,
  halfD: number,
  wallHeight: number,
  opts: {
    facadeDark: string; facadeMid: string; facadeLite: string;
    isMedia: boolean; region: RegionDef; pi: number;
  }
) {
  const { facadeDark, facadeMid, facadeLite, isMedia, region, pi } = opts;
  const z = -halfD - 8;
  // Segmented building blocks along X for variety
  let x = p.x;
  let seg = 0;
  while (x < p.x + p.w - 10) {
    const hVar = hash(pi * 17 + seg, 1);
    const wVar = hash(pi * 17 + seg, 2);
    const bw = Math.min(70 + wVar * 50, p.x + p.w - x);
    const bh = wallHeight * (0.55 + hVar * 0.55);
    const col = seg % 3 === 0 ? facadeDark : seg % 3 === 1 ? facadeMid : facadeLite;
    const wall = box(bw - 4, bh, 18, col);
    wall.position.set(x + bw / 2, topY + bh / 2, z);
    root.add(wall);

    // Windows / screens
    const rows = Math.max(1, Math.floor(bh / 50));
    const cols = Math.max(1, Math.floor(bw / 36));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (hash(pi + seg * 9 + r * 3 + c, 5) < 0.25) continue;
        const lit = isMedia || hash(pi + seg + r + c, 6) > 0.45;
        const win = box(14, 18, 2, lit ? region.accent : '#0a0a0e', {
          emissive: lit ? (isMedia ? COLORS.redSoft : region.accent) : undefined,
          emissiveIntensity: lit ? (isMedia ? 0.55 : 0.25) : 0,
        });
        win.position.set(
          x + 18 + c * 32,
          topY + 28 + r * 44,
          z + 10
        );
        root.add(win);
      }
    }

    // Doorway every few segments
    if (seg % 3 === 0 && bw > 40) {
      const door = box(22, 36, 4, '#0c0c10');
      door.position.set(x + bw / 2, topY + 18, z + 10);
      root.add(door);
      const frame = box(28, 40, 3, region.accent, {
        emissive: region.accent,
        emissiveIntensity: 0.2,
      });
      frame.position.set(x + bw / 2, topY + 20, z + 9);
      root.add(frame);
    }

    // Civic red banner / Media eye screen accent
    if (seg % 4 === 1) {
      if (isMedia) {
        const screen = box(bw * 0.5, 36, 3, COLORS.red, {
          emissive: COLORS.redSoft,
          emissiveIntensity: 0.6,
        });
        screen.position.set(x + bw / 2, topY + bh * 0.65, z + 11);
        root.add(screen);
        // Eye motif
        const eye = box(16, 10, 2, COLORS.white, {
          emissive: COLORS.redSoft,
          emissiveIntensity: 0.4,
        });
        eye.position.set(x + bw / 2, topY + bh * 0.65, z + 13);
        root.add(eye);
        const pupil = box(6, 6, 2, COLORS.red, {
          emissive: COLORS.red,
          emissiveIntensity: 0.7,
        });
        pupil.position.set(x + bw / 2, topY + bh * 0.65, z + 14);
        root.add(pupil);
      } else {
        const banner = box(10, 50 + hVar * 30, 2, COLORS.red, {
          emissive: COLORS.red,
          emissiveIntensity: 0.35,
        });
        banner.position.set(x + bw / 2, topY + bh * 0.55, z + 11);
        root.add(banner);
      }
    }

    x += bw;
    seg++;
  }
}

function addFrontRail(
  root: THREE.Group,
  p: PlatformDef,
  topY: number,
  halfD: number,
  opts: { railColor: string; isMedia: boolean; region: RegionDef; arena: boolean }
) {
  const { railColor, isMedia, region, arena } = opts;
  const z = halfD + 2;
  const railH = arena ? 28 : 22;
  // Low wall — does not bury side-camera silhouettes
  const base = box(p.w, railH, 5, railColor, {
    emissive: isMedia ? region.accent : undefined,
    emissiveIntensity: isMedia ? 0.12 : 0,
  });
  base.position.set(p.x + p.w / 2, topY + railH / 2, z);
  root.add(base);

  // Posts + top rail
  const posts = Math.max(2, Math.floor(p.w / 55));
  for (let i = 0; i <= posts; i++) {
    const px = p.x + (i / posts) * p.w;
    const post = box(4, railH + 10, 4, railColor);
    post.position.set(px, topY + (railH + 10) / 2, z + 2);
    root.add(post);
  }
  const topRail = box(p.w, 3, 4, isMedia ? region.accent : '#8a8e96', {
    emissive: isMedia ? COLORS.redSoft : undefined,
    emissiveIntensity: isMedia ? 0.4 : 0,
    metalness: 0.4,
    roughness: 0.4,
  });
  topRail.position.set(p.x + p.w / 2, topY + railH + 8, z + 2);
  root.add(topRail);
}

function addStreetProps(
  root: THREE.Group,
  p: PlatformDef,
  topY: number,
  halfD: number,
  opts: { isMedia: boolean; region: RegionDef; pi: number; ground: boolean; arena: boolean }
) {
  const { isMedia, region, pi, ground, arena } = opts;
  if (!ground && !arena) return;

  const spacing = arena ? 90 : 110;
  const n = Math.max(1, Math.floor(p.w / spacing));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const px = p.x + t * p.w;
    const h = hash(pi * 31 + i, 8);

    // Alternate sides near curbs (not on play center)
    const zSide = h > 0.5 ? -halfD + 14 : halfD - 14;

    if (isMedia) {
      // Neon lamp / screen pillar
      const pole = box(5, 70, 5, '#1a1020', { metalness: 0.5, roughness: 0.35 });
      pole.position.set(px, topY + 35, zSide);
      root.add(pole);
      const lamp = box(18, 12, 6, COLORS.redSoft, {
        emissive: COLORS.redSoft,
        emissiveIntensity: 0.75,
      });
      lamp.position.set(px, topY + 72, zSide);
      root.add(lamp);
    } else {
      // Civic column / lamp
      const col = box(10, 64, 10, '#3a3e48', { metalness: 0.25, roughness: 0.55 });
      col.position.set(px, topY + 32, zSide);
      root.add(col);
      const cap = box(14, 6, 14, region.accent, {
        emissive: region.accent,
        emissiveIntensity: 0.2,
      });
      cap.position.set(px, topY + 66, zSide);
      root.add(cap);
      const lamp = box(8, 8, 8, COLORS.light, {
        emissive: COLORS.light,
        emissiveIntensity: 0.45,
      });
      lamp.position.set(px, topY + 76, zSide);
      root.add(lamp);
    }
  }
}

function addPlazaPerimeter(
  root: THREE.Group,
  p: PlatformDef,
  topY: number,
  halfD: number,
  wallH: number,
  opts: { facadeDark: string; facadeMid: string; isMedia: boolean; region: RegionDef }
) {
  const { facadeDark, facadeMid, isMedia, region } = opts;
  // End walls (left / right) — enclose the arena like a room/plaza
  for (const end of [-1, 1] as const) {
    const x = end < 0 ? p.x - 8 : p.x + p.w + 8;
    const wall = box(16, wallH, halfD * 2 + 20, end < 0 ? facadeDark : facadeMid);
    wall.position.set(x, topY + wallH / 2, 0);
    root.add(wall);

    // Accent band
    const band = box(4, 12, halfD * 2 + 16, region.accent, {
      emissive: region.accent,
      emissiveIntensity: isMedia ? 0.5 : 0.3,
    });
    band.position.set(x + end * 6, topY + wallH * 0.55, 0);
    root.add(band);

    if (isMedia) {
      const eye = box(20, 14, 3, COLORS.white, {
        emissive: COLORS.redSoft,
        emissiveIntensity: 0.45,
      });
      eye.position.set(x + end * 10, topY + wallH * 0.4, 0);
      root.add(eye);
    }
  }

  // Corner pillars
  for (const sx of [-1, 1] as const) {
    for (const sz of [-1, 1] as const) {
      const pillar = box(14, wallH * 1.05, 14, facadeMid, { metalness: 0.3, roughness: 0.5 });
      pillar.position.set(
        p.x + p.w / 2 + sx * (p.w / 2 + 4),
        topY + wallH * 0.52,
        sz * (halfD + 4)
      );
      root.add(pillar);
    }
  }
}
