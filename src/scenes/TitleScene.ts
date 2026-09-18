import type { Input } from '../core/Input';
import { COLORS, drawSymbol } from '../art/draw';

export class TitleScene {
  private t = 0;
  private selected = 0;
  private readonly items = ['Spiel starten', 'Steuerung', '— Prototype —'];
  showControls = false;

  update(dt: number, input: Input): 'start' | null {
    this.t += dt;
    if (this.showControls) {
      if (input.pressed('Escape') || input.confirmPressed()) {
        this.showControls = false;
      }
      return null;
    }
    if (input.pressed('ArrowDown') || input.pressed('KeyS')) {
      this.selected = Math.min(1, this.selected + 1);
    }
    if (input.pressed('ArrowUp') || input.pressed('KeyW')) {
      this.selected = Math.max(0, this.selected - 1);
    }
    if (input.confirmPressed() || input.pressed('Enter')) {
      if (this.selected === 0) return 'start';
      if (this.selected === 1) this.showControls = true;
    }
    return null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const w = 1280, h = 720;
    // cinematic dark bg
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0c0c10');
    g.addColorStop(0.5, '#121018');
    g.addColorStop(1, '#08060a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // skyline silhouette
    ctx.fillStyle = '#0e1016';
    for (let i = 0; i < 18; i++) {
      const bx = i * 80 - 20;
      const bh = 120 + Math.sin(i * 1.7 + this.t * 0.2) * 40 + (i % 5) * 50;
      ctx.fillRect(bx, h - bh, 60 + (i % 3) * 15, bh);
    }
    // red accent banners
    ctx.fillStyle = COLORS.red;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(200, 280, 18, 160);
    ctx.fillRect(980, 220, 22, 200);
    ctx.globalAlpha = 1;

    // eclipse
    ctx.fillStyle = '#1a1a22';
    ctx.beginPath(); ctx.arc(640, 160, 70, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(640, 160, 78, 0, Math.PI * 2); ctx.stroke();

    // title
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 52px "Segoe UI", sans-serif';
    ctx.fillText('GODS AWAKE', 640, 200);
    ctx.fillStyle = COLORS.redSoft;
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.fillText('ANIMA  /  ANIMUS', 640, 245);

    ctx.fillStyle = 'rgba(200,196,190,0.7)';
    ctx.font = '14px sans-serif';
    ctx.fillText('7 Traumwelt-Regionen von Babylon City', 640, 280);
    ctx.fillText('Two Minds · One World · Follow the White Rabbit', 640, 302);

    // symbols
    drawSymbol(ctx, 'circleDot', 520, 340, 28, COLORS.red);
    drawSymbol(ctx, 'squareDot', 760, 340, 28, COLORS.animusGlow);

    if (this.showControls) {
      this.drawControls(ctx);
      return;
    }

    // menu
    this.items.forEach((item, i) => {
      if (i === 2) {
        ctx.fillStyle = 'rgba(120,120,130,0.6)';
        ctx.font = '12px sans-serif';
        ctx.fillText(item, 640, 520);
        return;
      }
      const y = 400 + i * 48;
      const sel = i === this.selected;
      if (sel) {
        ctx.fillStyle = 'rgba(188,30,34,0.25)';
        ctx.fillRect(440, y - 28, 400, 40);
        ctx.strokeStyle = COLORS.red;
        ctx.strokeRect(440, y - 28, 400, 40);
      }
      ctx.fillStyle = sel ? COLORS.white : COLORS.light;
      ctx.font = sel ? 'bold 22px sans-serif' : '20px sans-serif';
      ctx.fillText(item, 640, y);
    });

    ctx.fillStyle = 'rgba(180,180,180,0.4)';
    ctx.font = '12px sans-serif';
    ctx.fillText('WASD / Pfeile · Enter', 640, 680);
  }

  private drawControls(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(8,8,12,0.92)';
    ctx.fillRect(280, 160, 720, 420);
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 2;
    ctx.strokeRect(280, 160, 720, 420);
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STEUERUNG / CONTROLS', 640, 210);
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.light;
    const lines = [
      'Bewegen / Move          WASD  oder  Pfeiltasten',
      'Springen / Jump         Leertaste / W / ↑',
      'Primärangriff           J  oder  Linksklick',
      'Sekundärangriff         K  oder  Rechtsklick',
      'Form wechseln           F  oder  Tab   (Anima ↔ Animus)',
      'Interagieren / Talk     E',
      'Pause                   Esc',
      '',
      'Anima: Lichtimpuls + Erinnerungsfragmente (Rot/Weiß)',
      'Animus: Energieklinge + Geometrischer Impuls (Blau)',
    ];
    lines.forEach((l, i) => {
      ctx.fillText(l, 340, 260 + i * 28);
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.redSoft;
    ctx.font = '14px sans-serif';
    ctx.fillText('Esc / Enter — zurück', 640, 550);
  }
}
