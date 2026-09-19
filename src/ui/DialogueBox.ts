import type { DialogueLine } from '../core/types';

export class DialogueBox {
  active = false;
  lines: DialogueLine[] = [];
  index = 0;
  charVisible = 0;
  private speed = 42;
  el: HTMLElement;
  private speakerEl: HTMLElement;
  private textEl: HTMLElement;

  constructor(host: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'dialogue';
    this.el.innerHTML = `
      <div class="dlg-speaker"></div>
      <div class="dlg-text"></div>
      <div class="dlg-hint">Enter / E / Space — weiter</div>
    `;
    this.el.style.display = 'none';
    host.appendChild(this.el);
    this.speakerEl = this.el.querySelector('.dlg-speaker')!;
    this.textEl = this.el.querySelector('.dlg-text')!;
  }

  open(lines: DialogueLine[]) {
    this.lines = lines;
    this.index = 0;
    this.charVisible = 0;
    this.active = true;
    this.el.style.display = 'block';
    this.render();
  }

  close() {
    this.active = false;
    this.lines = [];
    this.el.style.display = 'none';
  }

  get current(): DialogueLine | null {
    return this.lines[this.index] ?? null;
  }

  update(dt: number) {
    if (!this.active || !this.current) return;
    this.charVisible += this.speed * dt;
    this.render();
  }

  advance(): boolean {
    if (!this.active || !this.current) return false;
    const full = this.current.text.length;
    if (this.charVisible < full) {
      this.charVisible = full;
      this.render();
      return false;
    }
    this.index++;
    this.charVisible = 0;
    if (this.index >= this.lines.length) {
      this.close();
      return true;
    }
    this.render();
    return false;
  }

  private render() {
    if (!this.current) return;
    this.speakerEl.textContent = this.current.speaker;
    this.textEl.textContent = this.current.text.slice(0, Math.floor(this.charVisible));
  }

  destroy() {
    this.el.remove();
  }
}
