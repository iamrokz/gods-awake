import type { Input } from '../core/Input';
import { REGIONS } from '../data/regions';
import { COLORS, drawSymbol } from '../art/draw';

export class RegionSelectScene {
  private selected = 0;
  private t = 0;
  private loreOpen = false;

  update(dt: number, input: Input): { action: 'play' | 'back' | 'lore'; regionId: number } | null {
    this.t += dt;
    if (this.loreOpen) {
      if (input.pressed('Escape') || input.confirmPressed()) {
        this.loreOpen = false;
      }
      return null;
    }

    if (input.pressed('Escape')) return { action: 'back', regionId: 0 };

    const cols = 4;
    if (input.pressed('ArrowRight') || input.pressed('KeyD')) {
      this.selected = (this.selected + 1) % REGIONS.length;
    }
    if (input.pressed('ArrowLeft') || input.pressed('KeyA')) {
      this.selected = (this.selected - 1 + REGIONS.length) % REGIONS.length;
    }
    if (input.pressed('ArrowDown') || input.pressed('KeyS')) {
      this.selected = Math.min(REGIONS.length - 1, this.selected + cols);
    }
    if (input.pressed('ArrowUp') || input.pressed('KeyW')) {
      this.selected = Math.max(0, this.selected - cols);
    }

    if (input.confirmPressed() || input.pressed('Enter')) {
      const r = REGIONS[this.selected];
      if (r.playable) return { action: 'play', regionId: r.id };
      this.loreOpen = true;
    }
    return null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BABYLON CITY — REGIONEN', 640, 60);
    ctx.fillStyle = 'rgba(200,196,190,0.6)';
    ctx.font = '14px sans-serif';
    ctx.fillText('Wähle eine Traumwelt. Nur freigeschaltete Regionen sind spielbar.', 640, 90);

    const cardW = 260, cardH = 200;
    const startX = 80, startY = 130;
    const gapX = 20, gapY = 24;
    const cols = 4;

    REGIONS.forEach((r, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      const sel = i === this.selected;

      ctx.fillStyle = r.bg;
      ctx.fillRect(x, y, cardW, cardH);
      ctx.strokeStyle = sel ? r.accent : '#333';
      ctx.lineWidth = sel ? 3 : 1;
      ctx.strokeRect(x, y, cardW, cardH);

      // number
      ctx.fillStyle = r.accent;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(String(r.id).padStart(2, '0'), x + 16, y + 32);

      drawSymbol(ctx, r.symbol, x + cardW - 36, y + 28, 28, r.accent);

      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(r.nameDe, x + 16, y + 70);

      ctx.fillStyle = 'rgba(200,196,190,0.7)';
      ctx.font = '12px sans-serif';
      ctx.fillText(r.keywords.join(' · '), x + 16, y + 96);

      // mini skyline
      ctx.fillStyle = r.mid;
      for (let b = 0; b < 5; b++) {
        const bh = 30 + ((i * 3 + b * 17) % 50);
        ctx.fillRect(x + 20 + b * 42, y + cardH - 50 - bh + 40, 32, bh);
      }

      if (!r.playable) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(x, y, cardW, cardH);
        ctx.fillStyle = COLORS.light;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GESPERRT', x + cardW / 2, y + cardH / 2);
        ctx.font = '12px sans-serif';
        ctx.fillText('Lore ansehen', x + cardW / 2, y + cardH / 2 + 22);
      } else {
        ctx.fillStyle = r.accent;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▶ SPIELBAR', x + cardW / 2, y + cardH - 16);
      }
    });

    if (this.loreOpen) {
      const r = REGIONS[this.selected];
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = r.bg;
      ctx.fillRect(240, 180, 800, 360);
      ctx.strokeStyle = r.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(240, 180, 800, 360);
      drawSymbol(ctx, r.symbol, 640, 230, 40, r.accent);
      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.nameDe, 640, 290);
      ctx.fillStyle = r.accent;
      ctx.font = '14px sans-serif';
      ctx.fillText(r.keywords.join('  ·  ') + '  —  ' + r.theme, 640, 320);
      ctx.fillStyle = COLORS.light;
      ctx.font = '16px sans-serif';
      wrap(ctx, r.lore, 640, 370, 700, 26);
      ctx.fillStyle = 'rgba(200,196,190,0.5)';
      ctx.font = '13px sans-serif';
      ctx.fillText('Esc / Enter — schließen', 640, 510);
    }

    ctx.fillStyle = 'rgba(180,180,180,0.5)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Esc — Titelbildschirm', 640, 700);
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  ctx.textAlign = 'center';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, cx, yy);
      line = w;
      yy += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, cx, yy);
}
