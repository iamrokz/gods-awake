/** Game coords: X right, Y down. Three.js: X right, Y up, Z depth. */
export function gy(gameY: number): number {
  return -gameY;
}

export function center3(x: number, y: number, w: number, h: number, z = 0) {
  return { x: x + w / 2, y: -(y + h / 2), z };
}
