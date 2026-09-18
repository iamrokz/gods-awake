import type { AABB, Rect } from './types';

export function aabbOverlap(a: AABB, b: AABB): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pointInRect(px: number, py: number, r: Rect): boolean {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export interface Body {
  x: number; y: number; w: number; h: number;
  vx: number; vy: number;
  onGround: boolean;
}

export function resolvePlatforms(body: Body, platforms: AABB[], dt: number) {
  body.onGround = false;
  body.x += body.vx * dt;
  for (const p of platforms) {
    if (!aabbOverlap(body, p)) continue;
    if (body.vx > 0) body.x = p.x - body.w;
    else if (body.vx < 0) body.x = p.x + p.w;
    body.vx = 0;
  }
  body.y += body.vy * dt;
  for (const p of platforms) {
    if (!aabbOverlap(body, p)) continue;
    if (body.vy > 0) {
      body.y = p.y - body.h;
      body.vy = 0;
      body.onGround = true;
    } else if (body.vy < 0) {
      body.y = p.y + p.h;
      body.vy = 0;
    }
  }
}

export const GRAVITY = 2200;
export const MAX_FALL = 1400;
