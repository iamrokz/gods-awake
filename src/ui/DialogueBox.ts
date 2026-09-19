import type { DialogueLine } from '../core/types';
import { COLORS } from '../art/draw';

export class DialogueBox {
  active = false;
  lines: DialogueLine[] = [];
  index = 0;
  charVisible = 0;
  private speed = 42;

  open(lines: DialogueLine[]) {
    this.lines = lines;
    this.index = 0;
    this.charVisible = 0;
    this.active = true;
  }

  close() {
    this.active = false;
    this.lines = [];
  }

  get current(): DialogueLine | null {
    return this.lines[this.index] ?? null;
  }

  update(dt: number) {
    if (!this.active || !this.current) return;
    this.charVisible += this.speed * dt;
  }

  advance(): boolean {
    if (!this.active || !this.current) return false;
    const full = this.current.text.length;
    if (this.charVisible < full) {
      this.charVisible = full;
      return false;
    }
    this.index++;
    this.charVisible = 0;
    if (this.index >= this.lines.length) {
      this.close();
      return true;
    }
    return false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active || !this.current) return;
    const line = this.current;
    const shown = line.text.slice(0, Math.floor(this.charVisible));

    ctx.fillStyle = 'rgba(8,8,12,0.88)';
    ctx.fillRect(80, 520, 1120, 160);
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 520, 1120, 160);

    ctx.fillStyle = COLORS.redSoft;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(line.speaker, 110, 555);

    ctx.fillStyle = COLORS.white;
    ctx.font = '18px sans-serif';
    wrapText(ctx, shown, 110, 590, 1060, 26);

    ctx.fillStyle = 'rgba(232,230,227,0.5)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Enter / E / Space — weiter', 1180, 665);
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number
) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lineH;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}
