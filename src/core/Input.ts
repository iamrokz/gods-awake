export class Input {
  private keys = new Set<string>();
  private justPressed = new Set<string>();
  private justReleased = new Set<string>();
  mouse = { x: 0, y: 0, down: false, justDown: false, justUp: false, button: 0 };
  private target: HTMLElement;

  constructor(target: HTMLElement) {
    this.target = target;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    target.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    target.addEventListener('mousemove', this.onMouseMove);
    target.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.target.removeEventListener('mousemove', this.onMouseMove);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
      e.preventDefault();
    }
    if (!this.keys.has(e.code)) this.justPressed.add(e.code);
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
    this.justReleased.add(e.code);
  };

  private onMouseDown = (e: MouseEvent) => {
    this.mouse.down = true;
    this.mouse.justDown = true;
    this.mouse.button = e.button;
    this.updateMousePos(e);
  };

  private onMouseUp = (e: MouseEvent) => {
    this.mouse.down = false;
    this.mouse.justUp = true;
    this.updateMousePos(e);
  };

  private onMouseMove = (e: MouseEvent) => this.updateMousePos(e);

  private updateMousePos(e: MouseEvent) {
    const r = this.target.getBoundingClientRect();
    const sx = 1280 / r.width;
    const sy = 720 / r.height;
    this.mouse.x = (e.clientX - r.left) * sx;
    this.mouse.y = (e.clientY - r.top) * sy;
  }

  endFrame() {
    this.justPressed.clear();
    this.justReleased.clear();
    this.mouse.justDown = false;
    this.mouse.justUp = false;
  }

  down(code: string) { return this.keys.has(code); }
  pressed(code: string) { return this.justPressed.has(code); }
  released(code: string) { return this.justReleased.has(code); }

  axisX() {
    let v = 0;
    if (this.down('KeyA') || this.down('ArrowLeft')) v -= 1;
    if (this.down('KeyD') || this.down('ArrowRight')) v += 1;
    return v;
  }

  jumpPressed() {
    return this.pressed('Space') || this.pressed('KeyW') || this.pressed('ArrowUp');
  }

  jumpReleased() {
    return this.released('Space') || this.released('KeyW') || this.released('ArrowUp');
  }

  primaryPressed() {
    return this.pressed('KeyJ') || (this.mouse.justDown && this.mouse.button === 0);
  }

  secondaryPressed() {
    return this.pressed('KeyK') || (this.mouse.justDown && this.mouse.button === 2);
  }

  interactPressed() { return this.pressed('KeyE'); }
  formSwitchPressed() { return this.pressed('KeyF') || this.pressed('Tab'); }
  cameraTogglePressed() { return this.pressed('KeyV'); }
  pausePressed() { return this.pressed('Escape'); }
  confirmPressed() {
    return this.pressed('Enter') || this.pressed('Space') || this.pressed('KeyE');
  }
}
