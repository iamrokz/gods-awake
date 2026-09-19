import { REGIONS } from '../data/regions';
import type { Input } from '../core/Input';

export class TitleMenu {
  el: HTMLElement;
  private selected = 0;
  private showControls = false;
  private itemsEl: HTMLElement;
  private controlsEl: HTMLElement;

  constructor(host: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'title-menu';
    this.el.className = 'menu-screen';
    this.el.innerHTML = `
      <div class="title-skyline"></div>
      <div class="title-eclipse"></div>
      <h1 class="title-main">GODS AWAKE</h1>
      <h2 class="title-sub">ANIMA  /  ANIMUS</h2>
      <p class="title-tag">7 Traumwelt-Regionen von Babylon City</p>
      <p class="title-tag dim">Two Minds · One World · Follow the White Rabbit</p>
      <div class="title-symbols"><span class="sym-anima">●</span><span class="sym-animus">■</span></div>
      <div class="menu-items" id="title-items">
        <button class="menu-btn selected" data-i="0">Spiel starten</button>
        <button class="menu-btn" data-i="1">Steuerung</button>
        <div class="menu-proto">— Prototype 3D —</div>
      </div>
      <div class="controls-panel" id="title-controls" hidden>
        <h3>STEUERUNG / CONTROLS</h3>
        <pre>
Bewegen / Move          WASD  oder  Pfeiltasten
Springen / Jump         Leertaste / W / ↑
Primärangriff           J  oder  Linksklick
Sekundärangriff         K  oder  Rechtsklick
Form wechseln           F  oder  Tab   (Anima ↔ Animus)
Kamera Seite/Third      V
Interagieren / Talk     E
Pause                   Esc

Anima: Lichtimpuls + Erinnerungsfragmente (Rot/Weiß)
Animus: Energieklinge + Geometrischer Impuls (Blau)
        </pre>
        <p class="menu-hint">Esc / Enter — zurück</p>
      </div>
      <p class="menu-footer">WASD / Pfeile · Enter</p>
    `;
    host.appendChild(this.el);
    this.itemsEl = this.el.querySelector('#title-items')!;
    this.controlsEl = this.el.querySelector('#title-controls')!;
  }

  update(input: Input): 'start' | null {
    if (this.showControls) {
      if (input.pressed('Escape') || input.confirmPressed()) {
        this.showControls = false;
        this.controlsEl.hidden = true;
        this.itemsEl.hidden = false;
      }
      return null;
    }
    if (input.pressed('ArrowDown') || input.pressed('KeyS')) {
      this.selected = Math.min(1, this.selected + 1);
      this.refresh();
    }
    if (input.pressed('ArrowUp') || input.pressed('KeyW')) {
      this.selected = Math.max(0, this.selected - 1);
      this.refresh();
    }
    if (input.confirmPressed() || input.pressed('Enter')) {
      if (this.selected === 0) return 'start';
      if (this.selected === 1) {
        this.showControls = true;
        this.controlsEl.hidden = false;
        this.itemsEl.hidden = true;
      }
    }
    return null;
  }

  private refresh() {
    this.el.querySelectorAll('.menu-btn').forEach((btn, i) => {
      btn.classList.toggle('selected', i === this.selected);
    });
  }

  show(v: boolean) {
    this.el.style.display = v ? 'flex' : 'none';
  }

  destroy() { this.el.remove(); }
}

export class RegionSelectMenu {
  el: HTMLElement;
  private selected = 0;
  private loreOpen = false;
  private grid: HTMLElement;
  private lore: HTMLElement;

  constructor(host: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'region-menu';
    this.el.className = 'menu-screen';
    this.el.innerHTML = `
      <h1 class="region-title">BABYLON CITY — REGIONEN</h1>
      <p class="title-tag">Wähle eine Traumwelt. Nur freigeschaltete Regionen sind spielbar.</p>
      <div class="region-grid" id="region-grid"></div>
      <div class="lore-panel" id="lore-panel" hidden></div>
      <p class="menu-footer">Esc — Titelbildschirm</p>
    `;
    host.appendChild(this.el);
    this.grid = this.el.querySelector('#region-grid')!;
    this.lore = this.el.querySelector('#lore-panel')!;
    this.buildGrid();
  }

  private buildGrid() {
    this.grid.innerHTML = '';
    REGIONS.forEach((r, i) => {
      const card = document.createElement('div');
      card.className = `region-card ${r.playable ? 'playable' : 'locked'} ${i === this.selected ? 'selected' : ''}`;
      card.style.setProperty('--accent', r.accent);
      card.style.setProperty('--bg', r.bg);
      card.innerHTML = `
        <div class="rc-num">${String(r.id).padStart(2, '0')}</div>
        <div class="rc-name">${r.nameDe}</div>
        <div class="rc-keys">${r.keywords.join(' · ')}</div>
        <div class="rc-status">${r.playable ? '▶ SPIELBAR' : 'GESPERRT — Lore'}</div>
      `;
      this.grid.appendChild(card);
    });
  }

  update(input: Input): { action: 'play' | 'back'; regionId: number } | null {
    if (this.loreOpen) {
      if (input.pressed('Escape') || input.confirmPressed()) {
        this.loreOpen = false;
        this.lore.hidden = true;
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
    this.refresh();

    if (input.confirmPressed() || input.pressed('Enter')) {
      const r = REGIONS[this.selected];
      if (r.playable) return { action: 'play', regionId: r.id };
      this.loreOpen = true;
      this.lore.hidden = false;
      this.lore.innerHTML = `
        <div class="lore-inner" style="border-color:${r.accent};background:${r.bg}">
          <h2 style="color:${r.accent}">${r.nameDe}</h2>
          <p class="lore-keys">${r.keywords.join(' · ')} — ${r.theme}</p>
          <p class="lore-text">${r.lore}</p>
          <p class="menu-hint">Esc / Enter — schließen</p>
        </div>
      `;
    }
    return null;
  }

  private refresh() {
    this.grid.querySelectorAll('.region-card').forEach((c, i) => {
      c.classList.toggle('selected', i === this.selected);
    });
  }

  show(v: boolean) {
    this.el.style.display = v ? 'flex' : 'none';
  }

  destroy() { this.el.remove(); }
}
