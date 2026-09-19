import type { Form, RegionDef } from '../core/types';

export class HUD {
  el: HTMLElement;
  private hearts: HTMLElement;
  private formBadge: HTMLElement;
  private formName: HTMLElement;
  private primary: HTMLElement;
  private secondary: HTMLElement;
  private regionName: HTMLElement;
  private keywords: HTMLElement;
  private hint: HTMLElement;
  private toast: HTMLElement;
  private bossEl: HTMLElement;
  private bossName: HTMLElement;
  private bossFill: HTMLElement;
  private toastTimer = 0;

  constructor(host: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'hud';
    this.el.innerHTML = `
      <div class="hud-top">
        <div class="hud-hearts" id="hud-hearts"></div>
        <div class="hud-form" id="hud-form">
          <span class="hud-form-icon" id="hud-form-icon"></span>
          <span id="hud-form-name">ANIMA</span>
        </div>
        <div class="hud-ability" id="hud-primary"><span class="ab-label"></span><span class="ab-key">J</span><div class="ab-cd"></div></div>
        <div class="hud-ability" id="hud-secondary"><span class="ab-label"></span><span class="ab-key">K</span><div class="ab-cd"></div></div>
        <div class="hud-region">
          <div id="hud-region-name"></div>
          <div id="hud-keywords"></div>
        </div>
      </div>
      <div class="hud-boss" id="hud-boss" hidden>
        <div class="hud-boss-label">BOSS</div>
        <div class="hud-boss-name" id="hud-boss-name">Tausend Gesichter</div>
        <div class="hud-boss-bar"><div class="hud-boss-fill" id="hud-boss-fill"></div></div>
        <div class="hud-boss-hp" id="hud-boss-hp"></div>
      </div>
      <div class="hud-toast" id="hud-toast" aria-live="polite"></div>
      <div class="hud-hint" id="hud-hint"></div>
    `;
    host.appendChild(this.el);
    this.hearts = this.el.querySelector('#hud-hearts')!;
    this.formBadge = this.el.querySelector('#hud-form')!;
    this.formName = this.el.querySelector('#hud-form-name')!;
    this.primary = this.el.querySelector('#hud-primary')!;
    this.secondary = this.el.querySelector('#hud-secondary')!;
    this.regionName = this.el.querySelector('#hud-region-name')!;
    this.keywords = this.el.querySelector('#hud-keywords')!;
    this.hint = this.el.querySelector('#hud-hint')!;
    this.toast = this.el.querySelector('#hud-toast')!;
    this.bossEl = this.el.querySelector('#hud-boss')!;
    this.bossName = this.el.querySelector('#hud-boss-name')!;
    this.bossFill = this.el.querySelector('#hud-boss-fill')!;
  }

  setRegion(region: RegionDef) {
    this.regionName.textContent = region.nameDe;
    this.keywords.textContent = region.keywords.join(' · ');
    this.keywords.style.color = region.accent;
  }

  /** Short German HUD toast (e.g. camera mode). Does not block interact hints. */
  showToast(text: string, duration = 1.6) {
    this.toast.textContent = text;
    this.toast.classList.add('show');
    this.toastTimer = duration;
  }

  update(opts: {
    hp: number; maxHp: number; form: Form;
    primaryCd: number; secondaryCd: number;
    primaryMax: number; secondaryMax: number;
    hint?: string;
    dt?: number;
    boss?: { name: string; hp: number; maxHp: number } | null;
  }) {
    const dt = opts.dt ?? 0;
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) {
        this.toast.classList.remove('show');
        this.toast.textContent = '';
      }
    }

    let hearts = '';
    for (let i = 0; i < opts.maxHp; i++) {
      hearts += `<span class="heart ${i < opts.hp ? 'on' : 'off'}">♥</span>`;
    }
    this.hearts.innerHTML = hearts;

    this.formBadge.className = `hud-form ${opts.form}`;
    this.formName.textContent = opts.form === 'anima' ? 'ANIMA' : 'ANIMUS';
    const icon = this.el.querySelector('#hud-form-icon')!;
    icon.textContent = opts.form === 'anima' ? '●' : '■';

    const pLabel = this.primary.querySelector('.ab-label')!;
    const sLabel = this.secondary.querySelector('.ab-label')!;
    pLabel.textContent = opts.form === 'anima' ? 'Lichtimpuls' : 'Energieklinge';
    sLabel.textContent = opts.form === 'anima' ? 'Fragmente' : 'Geo-Impuls';

    const pCd = this.primary.querySelector('.ab-cd') as HTMLElement;
    const sCd = this.secondary.querySelector('.ab-cd') as HTMLElement;
    pCd.style.width = opts.primaryCd > 0 ? `${(opts.primaryCd / opts.primaryMax) * 100}%` : '0%';
    sCd.style.width = opts.secondaryCd > 0 ? `${(opts.secondaryCd / opts.secondaryMax) * 100}%` : '0%';
    this.primary.classList.toggle('ready', opts.primaryCd <= 0);
    this.secondary.classList.toggle('ready', opts.secondaryCd <= 0);
    this.primary.classList.remove("anima","animus"); this.primary.classList.add(opts.form);
    this.secondary.classList.remove("anima","animus"); this.secondary.classList.add(opts.form);

    this.hint.textContent = opts.hint ?? '';
    this.hint.style.opacity = opts.hint ? '1' : '0';

    if (opts.boss && opts.boss.hp > 0) {
      this.bossEl.hidden = false;
      this.bossName.textContent = opts.boss.name;
      const pct = Math.max(0, Math.min(1, opts.boss.hp / opts.boss.maxHp)) * 100;
      this.bossFill.style.width = `${pct}%`;
      const hpEl = this.el.querySelector('#hud-boss-hp')!;
      hpEl.textContent = `TP ${Math.ceil(opts.boss.hp)} / ${opts.boss.maxHp}`;
    } else {
      this.bossEl.hidden = true;
    }
  }

  show(v: boolean) {
    this.el.style.display = v ? 'block' : 'none';
  }

  destroy() {
    this.el.remove();
  }
}
