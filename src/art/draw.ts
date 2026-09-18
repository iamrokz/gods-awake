import type { Form, RegionDef } from '../core/types';

export const COLORS = {
  black: '#0a0a0c',
  dark: '#141418',
  mid: '#2a2e36',
  light: '#c8c4be',
  white: '#e8e6e3',
  red: '#bc1e22',
  redSoft: '#e04548',
  anima: '#e8e6e3',
  animaAccent: '#bc1e22',
  animus: '#1a2a44',
  animusAccent: '#3a7ab8',
  animusGlow: '#5eb0ff',
  gold: '#c9a227',
  heart: '#bc1e22',
  ui: '#e8e6e3',
};

export function drawSymbol(
  ctx: CanvasRenderingContext2D,
  symbol: RegionDef['symbol'],
  x: number, y: number, size: number, color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.08);
  const s = size / 2;
  ctx.translate(x, y);
  switch (symbol) {
    case 'squareDot':
      ctx.strokeRect(-s, -s, size, size);
      ctx.beginPath(); ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2); ctx.fill();
      break;
    case 'gear': {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = i % 2 === 0 ? s : s * 0.7;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case 'eye':
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.quadraticCurveTo(0, -s * 0.7, s, 0);
      ctx.quadraticCurveTo(0, s * 0.7, -s, 0);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2); ctx.fill();
      break;
    case 'bars':
      ctx.fillRect(-s * 0.7, -s * 0.3, s * 0.3, s * 0.9);
      ctx.fillRect(-s * 0.15, -s, s * 0.3, s * 1.6);
      ctx.fillRect(s * 0.4, -s * 0.5, s * 0.3, s * 1.1);
      break;
    case 'circleDot':
      ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2); ctx.fill();
      break;
    case 'hex': {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
        ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
      }
      ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'leaf':
      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.quadraticCurveTo(s, 0, 0, -s);
      ctx.quadraticCurveTo(-s, 0, 0, s);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, s * 0.6); ctx.lineTo(0, -s * 0.4); ctx.stroke();
      break;
  }
  ctx.restore();
}

export function drawAnima(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, facing: number, t: number, attacking = false
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  // cape
  ctx.fillStyle = COLORS.anima;
  ctx.beginPath();
  ctx.moveTo(-6, -18);
  ctx.quadraticCurveTo(-22 - Math.sin(t * 4) * 3, 10, -14, 28);
  ctx.lineTo(8, 28);
  ctx.lineTo(10, -14);
  ctx.closePath();
  ctx.fill();
  // circle emblem
  ctx.fillStyle = COLORS.animaAccent;
  ctx.beginPath();
  ctx.arc(2, 2, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.anima;
  ctx.beginPath();
  ctx.arc(2, 2, 5, 0, Math.PI * 2);
  ctx.fill();
  // body
  ctx.fillStyle = '#1a1a1e';
  ctx.fillRect(-8, -8, 16, 28);
  // head
  ctx.fillStyle = '#d4cfc8';
  ctx.beginPath();
  ctx.arc(0, -18, 10, 0, Math.PI * 2);
  ctx.fill();
  // hair
  ctx.fillStyle = '#2a2228';
  ctx.beginPath();
  ctx.ellipse(-2, -24, 12, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // boots
  ctx.fillStyle = COLORS.animaAccent;
  ctx.fillRect(-10, 18, 8, 10);
  ctx.fillRect(2, 18, 8, 10);
  if (attacking) {
    ctx.strokeStyle = COLORS.redSoft;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(18, 0, 16 + Math.sin(t * 30) * 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawAnimus(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, facing: number, t: number, attacking = false
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  // coat
  ctx.fillStyle = COLORS.animus;
  ctx.beginPath();
  ctx.moveTo(-10, -16);
  ctx.lineTo(-16, 28);
  ctx.lineTo(14, 28);
  ctx.lineTo(12, -16);
  ctx.closePath();
  ctx.fill();
  // square emblem
  ctx.fillStyle = COLORS.animusAccent;
  ctx.fillRect(-6, -6, 14, 14);
  ctx.strokeStyle = COLORS.animusGlow;
  ctx.lineWidth = 2;
  ctx.strokeRect(-6, -6, 14, 14);
  // body
  ctx.fillStyle = '#0e1420';
  ctx.fillRect(-8, -8, 16, 26);
  // helmet head
  ctx.fillStyle = '#1e2838';
  ctx.fillRect(-11, -28, 22, 16);
  ctx.fillStyle = COLORS.animusGlow;
  ctx.fillRect(-6, -22, 12, 4);
  // spikes
  ctx.fillStyle = '#0a1018';
  ctx.beginPath();
  ctx.moveTo(-10, -28); ctx.lineTo(-14, -38); ctx.lineTo(-4, -28);
  ctx.moveTo(4, -28); ctx.lineTo(0, -40); ctx.lineTo(10, -28);
  ctx.fill();
  if (attacking) {
    ctx.strokeStyle = COLORS.animusGlow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, -4);
    ctx.lineTo(36 + Math.sin(t * 40) * 4, 2);
    ctx.lineTo(14, 8);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  form: Form, x: number, y: number, facing: number, t: number, attacking = false
) {
  if (form === 'anima') drawAnima(ctx, x, y, facing, t, attacking);
  else drawAnimus(ctx, x, y, facing, t, attacking);
}

export function drawWatcher(ctx: CanvasRenderingContext2D, x: number, y: number, facing: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.fillStyle = '#2a2a30';
  ctx.fillRect(-14, -10, 28, 36);
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(-8, -4, 16, 10);
  // staff
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(16, -20); ctx.lineTo(16, 24);
  ctx.stroke();
  ctx.fillStyle = COLORS.red;
  ctx.beginPath(); ctx.arc(16, -24, 6, 0, Math.PI * 2); ctx.fill();
  // head
  ctx.fillStyle = '#1a1a1e';
  ctx.fillRect(-10, -26, 20, 16);
  ctx.fillStyle = COLORS.redSoft;
  ctx.fillRect(-4, -20, 8, 4);
  // legs bob
  const bob = Math.sin(t * 6) * 2;
  ctx.fillStyle = '#1a1a1e';
  ctx.fillRect(-12, 24, 8, 8 + bob);
  ctx.fillRect(4, 24, 8, 8 - bob);
  ctx.restore();
}

export function drawMaskentraeger(ctx: CanvasRenderingContext2D, x: number, y: number, facing: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.fillStyle = '#1a1420';
  ctx.fillRect(-12, -8, 24, 34);
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(-12, 0, 6, 20);
  // mask
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.ellipse(0, -20, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(-6, -24, 4, 6);
  ctx.fillRect(2, -24, 4, 6);
  // shield
  ctx.fillStyle = '#3a3040';
  ctx.fillRect(-22, -4, 10, 22);
  ctx.strokeStyle = COLORS.red;
  ctx.strokeRect(-22, -4, 10, 22);
  // blade
  ctx.strokeStyle = COLORS.light;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, 0); ctx.lineTo(28, -8 + Math.sin(t * 8) * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawElite(ctx: CanvasRenderingContext2D, x: number, y: number, facing: number, t: number, hpRatio: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  const pulse = 1 + Math.sin(t * 5) * 0.04;
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#1e2228';
  ctx.fillRect(-22, -16, 44, 50);
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(-22, -16, 44, 8);
  // diamond crest
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.moveTo(0, -40); ctx.lineTo(14, -20); ctx.lineTo(0, -8); ctx.lineTo(-14, -20);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = COLORS.red;
  ctx.beginPath(); ctx.arc(0, -22, 4, 0, Math.PI * 2); ctx.fill();
  // visor
  ctx.fillStyle = COLORS.redSoft;
  ctx.fillRect(-12, -4, 24, 6);
  // halberd
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(24, -50); ctx.lineTo(24, 30); ctx.stroke();
  ctx.fillStyle = COLORS.red;
  ctx.beginPath();
  ctx.moveTo(24, -50); ctx.lineTo(40, -30); ctx.lineTo(24, -20);
  ctx.fill();
  // hp bar
  ctx.restore();
  ctx.fillStyle = '#222';
  ctx.fillRect(x - 30, y - 60, 60, 6);
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(x - 30, y - 60, 60 * hpRatio, 6);
}

export function drawDrone(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 4) * 6);
  ctx.rotate(t * 2);
  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = COLORS.redSoft;
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawBossTausend(
  ctx: CanvasRenderingContext2D, x: number, y: number, t: number, hpRatio: number, phase: number
) {
  ctx.save();
  // floating screens
  const n = 6 + phase * 2;
  for (let i = 0; i < n; i++) {
    const a = t * 0.8 + (i / n) * Math.PI * 2;
    const r = 70 + Math.sin(t * 2 + i) * 10;
    const sx = x + Math.cos(a) * r;
    const sy = y + Math.sin(a) * r * 0.5 - 20;
    ctx.fillStyle = i % 2 === 0 ? '#2a1830' : '#1a1020';
    ctx.fillRect(sx - 18, sy - 24, 36, 48);
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - 18, sy - 24, 36, 48);
    // face fragment
    ctx.fillStyle = COLORS.white;
    ctx.beginPath();
    ctx.arc(sx, sy - 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(sx - 5, sy - 8, 3, 4);
    ctx.fillRect(sx + 2, sy - 8, 3, 4);
  }
  // core body
  ctx.fillStyle = '#1a1420';
  ctx.fillRect(x - 28, y - 40, 56, 70);
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.ellipse(x, y - 50, 22, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.red;
  ctx.beginPath();
  ctx.ellipse(x, y - 48, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // eye symbol on chest
  ctx.strokeStyle = COLORS.redSoft;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 16, y); ctx.quadraticCurveTo(x, y - 12, x + 16, y);
  ctx.quadraticCurveTo(x, y + 12, x - 16, y);
  ctx.stroke();
  ctx.fillStyle = COLORS.red;
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // hp
  ctx.fillStyle = '#222';
  ctx.fillRect(x - 50, y - 100, 100, 8);
  ctx.fillStyle = '#9b1b5e';
  ctx.fillRect(x - 50, y - 100, 100 * hpRatio, 8);
  ctx.fillStyle = COLORS.white;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DIE TAUSEND GESICHTER', x, y - 108);
}

export function drawNpc(ctx: CanvasRenderingContext2D, x: number, y: number, role: string, t: number) {
  ctx.save();
  ctx.translate(x, y);
  const bob = Math.sin(t * 2) * 2;
  ctx.fillStyle = '#3a3a42';
  ctx.beginPath();
  ctx.moveTo(-12, 28);
  ctx.lineTo(-16, -10 + bob);
  ctx.lineTo(16, -10 + bob);
  ctx.lineTo(12, 28);
  ctx.closePath();
  ctx.fill();
  // hood
  ctx.fillStyle = '#c8c4be';
  ctx.beginPath();
  ctx.ellipse(0, -18 + bob, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2a30';
  ctx.beginPath();
  ctx.ellipse(0, -14 + bob, 10, 10, 0, 0, Math.PI);
  ctx.fill();
  // accent by role
  ctx.fillStyle = COLORS.red;
  if (role === 'Wahrheit') {
    drawSymbol(ctx, 'eye', 0, 0 + bob, 14, COLORS.red);
  } else if (role === 'Verbreitung') {
    ctx.fillRect(-6, -2 + bob, 12, 2);
    ctx.fillRect(-6, 2 + bob, 12, 2);
    ctx.fillRect(-6, 6 + bob, 12, 2);
  } else if (role === 'Darstellung') {
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(-4, 2 + bob, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(4, 2 + bob, 6, 0, Math.PI * 2); ctx.stroke();
  } else {
    ctx.fillRect(-4, 4 + bob, 8, 8);
  }
  // interact hint
  ctx.fillStyle = 'rgba(232,230,227,0.7)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('[E]', 0, -40 + bob);
  ctx.restore();
}

export function drawSpikes(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#4a4a50';
  const n = Math.max(2, Math.floor(w / 16));
  const sw = w / n;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * sw, y + h);
    ctx.lineTo(x + i * sw + sw / 2, y);
    ctx.lineTo(x + (i + 1) * sw, y + h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = COLORS.red;
  for (let i = 0; i < n; i++) {
    ctx.fillRect(x + i * sw + sw / 2 - 1, y, 2, 4);
  }
}

export function drawLaser(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number) {
  const on = Math.sin(t * 3) > -0.3;
  if (!on) {
    ctx.fillStyle = 'rgba(188,30,34,0.15)';
    ctx.fillRect(x, y, w, h);
    return;
  }
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, 'rgba(188,30,34,0.1)');
  g.addColorStop(0.5, 'rgba(224,69,72,0.7)');
  g.addColorStop(1, 'rgba(188,30,34,0.1)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(x + w / 2 - 1, y, 2, h);
}

export function drawExit(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, accent: string) {
  ctx.save();
  const pulse = 0.5 + Math.sin(t * 3) * 0.3;
  ctx.strokeStyle = accent;
  ctx.globalAlpha = pulse;
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 24, y - 48, 48, 64);
  ctx.fillStyle = accent;
  ctx.globalAlpha = pulse * 0.3;
  ctx.fillRect(x - 24, y - 48, 48, 64);
  ctx.globalAlpha = 1;
  ctx.fillStyle = COLORS.white;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AUSGANG', x, y - 56);
  ctx.restore();
}

export function drawBackgroundCivic(ctx: CanvasRenderingContext2D, camX: number, w: number, h: number, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1a1e28');
  g.addColorStop(1, '#0a0a0c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // far buildings
  const ox = -((camX * 0.15) % 200);
  ctx.fillStyle = '#12151c';
  for (let i = -1; i < 10; i++) {
    const bx = ox + i * 200;
    const bh = 200 + ((i * 47) % 180);
    ctx.fillRect(bx, h - bh - 80, 120 + (i % 3) * 20, bh);
  }
  // mid buildings with banners
  const ox2 = -((camX * 0.35) % 280);
  for (let i = -1; i < 8; i++) {
    const bx = ox2 + i * 280;
    const bh = 280 + ((i * 73) % 200);
    ctx.fillStyle = '#1e222c';
    ctx.fillRect(bx, h - bh - 40, 160, bh);
    // red banner
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(bx + 40, h - bh + 40, 24, 80 + (i % 2) * 40);
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(bx + 20, h - bh + 20, 30, 40);
    ctx.fillRect(bx + 90, h - bh + 60, 40, 50);
  }
  // wet ground reflection hint
  ctx.fillStyle = 'rgba(188,30,34,0.04)';
  ctx.fillRect(0, h - 100, w, 100);
}

export function drawBackgroundMedia(ctx: CanvasRenderingContext2D, camX: number, w: number, h: number, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#18081c');
  g.addColorStop(1, '#0a0810');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const ox = -((camX * 0.2) % 240);
  for (let i = -1; i < 9; i++) {
    const bx = ox + i * 240;
    const bh = 220 + ((i * 59) % 200);
    ctx.fillStyle = '#140818';
    ctx.fillRect(bx, h - bh - 60, 140, bh);
    // glowing screens
    const flicker = 0.5 + Math.sin(t * 4 + i) * 0.3;
    ctx.fillStyle = `rgba(188,30,34,${0.35 * flicker})`;
    ctx.fillRect(bx + 20, h - bh + 30, 80, 60);
    ctx.fillStyle = `rgba(232,230,227,${0.15 * flicker})`;
    // face on screen
    ctx.beginPath();
    ctx.arc(bx + 60, h - bh + 50, 16, 0, Math.PI * 2);
    ctx.fill();
    if (i % 3 === 0) {
      ctx.fillStyle = COLORS.red;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('LÜGE', bx + 30, h - bh + 120);
    }
  }
  // hanging screens mid
  const ox2 = -((camX * 0.45) % 320);
  for (let i = -1; i < 6; i++) {
    const sx = ox2 + i * 320 + 40;
    ctx.fillStyle = '#2a1830';
    ctx.fillRect(sx, 80 + (i % 2) * 40, 100, 70);
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, 80 + (i % 2) * 40, 100, 70);
    drawSymbol(ctx, 'eye', sx + 50, 115 + (i % 2) * 40, 28, COLORS.redSoft);
  }
}
