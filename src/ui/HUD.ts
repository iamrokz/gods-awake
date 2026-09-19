import type { Form } from '../core/types';
import { COLORS, drawSymbol } from '../art/draw';
import type { RegionDef } from '../core/types';

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  opts: {
    hp: number; maxHp: number; form: Form;
    region: RegionDef;
    primaryCd: number; secondaryCd: number;
    primaryMax: number; secondaryMax: number;
    formFlash: number;
    hint?: string;
  }
) {
  const { hp, maxHp, form, region } = opts;
  // top bar backdrop
  ctx.fillStyle = 'rgba(10,10,12,0.55)';
  ctx.fillRect(0, 0, 1280, 56);

  // hearts
  for (let i = 0; i < maxHp; i++) {
    const hx = 24 + i * 28;
    const hy = 18;
    ctx.fillStyle = i < hp ? COLORS.heart : '#333';
    drawHeart(ctx, hx, hy, 10);
  }

  // form indicator
  const fx = 200;
  ctx.fillStyle = form === 'anima' ? 'rgba(188,30,34,0.35)' : 'rgba(58,122,184,0.35)';
  ctx.fillRect(fx, 10, 140, 36);
  ctx.strokeStyle = form === 'anima' ? COLORS.redSoft : COLORS.animusGlow;
  ctx.lineWidth = 2;
  ctx.strokeRect(fx, 10, 140, 36);
  if (form === 'anima') {
    ctx.fillStyle = COLORS.red;
    ctx.beginPath(); ctx.arc(fx + 24, 28, 10, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = COLORS.animusGlow;
    ctx.strokeRect(fx + 14, 18, 20, 20);
  }
  ctx.fillStyle = COLORS.white;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(form === 'anima' ? 'ANIMA' : 'ANIMUS', fx + 44, 32);

  // ability icons
  drawAbility(ctx, 360, 12, form === 'anima' ? 'Lichtimpuls' : 'Energieklinge', opts.primaryCd, opts.primaryMax, form, true);
  drawAbility(ctx, 520, 12, form === 'anima' ? 'Fragmente' : 'Geo-Impuls', opts.secondaryCd, opts.secondaryMax, form, false);

  // region name
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.light;
  ctx.font = '13px sans-serif';
  ctx.fillText(region.nameDe, 1240, 22);
  ctx.fillStyle = region.accent;
  ctx.font = '11px sans-serif';
  ctx.fillText(region.keywords.join(' · '), 1240, 40);
  drawSymbol(ctx, region.symbol, 1260, 70, 22, region.accent);

  if (opts.hint) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(232,230,227,0.85)';
    ctx.font = '14px sans-serif';
    ctx.fillText(opts.hint, 640, 700);
  }
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.3);
  ctx.bezierCurveTo(x - s, y + s * 0.7, x, y + s * 1.1, x, y + s * 1.3);
  ctx.bezierCurveTo(x, y + s * 1.1, x + s, y + s * 0.7, x + s, y + s * 0.3);
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.3);
  ctx.fill();
}

function drawAbility(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, label: string,
  cd: number, max: number, form: Form, primary: boolean
) {
  const ready = cd <= 0;
  ctx.fillStyle = ready ? 'rgba(40,40,48,0.8)' : 'rgba(20,20,24,0.8)';
  ctx.fillRect(x, y, 140, 36);
  ctx.strokeStyle = form === 'anima' ? COLORS.red : COLORS.animusAccent;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, 140, 36);
  // icon
  if (form === 'anima') {
    if (primary) {
      ctx.fillStyle = COLORS.redSoft;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.fillRect(x + 18 + Math.cos(a) * 8, y + 18 + Math.sin(a) * 8, 3, 3);
      }
    } else {
      ctx.fillStyle = COLORS.redSoft;
      ctx.beginPath();
      ctx.moveTo(x + 18, y + 12); ctx.lineTo(x + 24, y + 18); ctx.lineTo(x + 18, y + 24); ctx.lineTo(x + 12, y + 18);
      ctx.fill();
    }
  } else {
    if (primary) {
      ctx.strokeStyle = COLORS.animusGlow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 12); ctx.lineTo(x + 28, y + 18); ctx.lineTo(x + 12, y + 24);
      ctx.stroke();
    } else {
      ctx.strokeStyle = COLORS.animusGlow;
      ctx.strokeRect(x + 12, y + 12, 16, 16);
    }
  }
  ctx.fillStyle = COLORS.white;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 40, y + 16);
  ctx.fillStyle = COLORS.light;
  ctx.font = '10px sans-serif';
  ctx.fillText(primary ? 'J / LMB' : 'K / RMB', x + 40, y + 30);
  if (!ready) {
    const p = cd / max;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, 140 * p, 36);
  }
}
