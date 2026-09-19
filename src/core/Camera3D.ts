import * as THREE from 'three';

export type CameraMode = 'side' | 'third';

/** Cinematic 2.5D side-scroll or true third-person follow camera. */
export class Camera3D {
  camera: THREE.PerspectiveCamera;
  shake = 0;
  mode: CameraMode = 'side';
  private look = new THREE.Vector3();
  private pos = new THREE.Vector3();
  /** Smoothed facing for third-person yaw (avoids hard flips). */
  private facingSmooth = 1;
  private modeSwitchSnap = false;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(42, aspect, 1, 5000);
    this.camera.position.set(0, -400, 520);
    this.pos.set(0, -400, 520);
  }

  setAspect(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  toggleMode(): CameraMode {
    this.mode = this.mode === 'side' ? 'third' : 'side';
    this.modeSwitchSnap = true;
    return this.mode;
  }

  setMode(mode: CameraMode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.modeSwitchSnap = true;
  }

  /**
   * @param targetX player center X (Three space)
   * @param targetY player center Y already in Three.js (negated game Y)
   * @param facing 1 = right, -1 = left
   */
  follow(targetX: number, targetY: number, levelW: number, dt: number, facing: number = 1) {
    if (!Number.isFinite(dt) || dt < 0) dt = 0;
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) return;
    if (!Number.isFinite(facing) || facing === 0) facing = this.facingSmooth || 1;

    // Smooth facing so rapid left/right doesn't whip the third-person cam
    const faceLerp = 1 - Math.pow(0.002, Math.max(dt, 1e-4));
    this.facingSmooth += (facing - this.facingSmooth) * faceLerp;
    if (Math.abs(this.facingSmooth) < 0.05) this.facingSmooth = facing;

    let desiredX: number;
    let desiredY: number;
    let desiredZ: number;
    let lookX: number;
    let lookY: number;
    let lookZ: number;

    if (this.mode === 'third') {
      // Behind player along facing, slight over-the-shoulder on Z
      const behind = 160;
      const height = 55;
      const shoulder = 90;
      const lookAhead = 90;
      const f = this.facingSmooth;
      desiredX = targetX - f * behind;
      desiredY = targetY + height;
      desiredZ = shoulder;
      lookX = targetX + f * lookAhead;
      lookY = targetY + 20;
      lookZ = 0;
    } else {
      desiredX = targetX + 80;
      desiredY = targetY + 60;
      desiredZ = 480;
      // look computed after lerp/clamp (matches original side cam)
      lookX = 0;
      lookY = 0;
      lookZ = 0;
    }

    if (this.modeSwitchSnap) {
      this.pos.set(desiredX, desiredY, desiredZ);
      this.modeSwitchSnap = false;
    } else {
      const lerp = 1 - Math.pow(0.0008, Math.max(dt, 1e-4));
      this.pos.x += (desiredX - this.pos.x) * lerp;
      this.pos.y += (desiredY - this.pos.y) * lerp;
      this.pos.z += (desiredZ - this.pos.z) * lerp;
    }

    // Soft clamp so we don't fly off level ends (side mode tighter)
    const margin = this.mode === 'third' ? 80 : 200;
    if (Number.isFinite(levelW) && levelW > margin * 2) {
      this.pos.x = Math.max(margin, Math.min(levelW - margin, this.pos.x));
    }

    // Guard against any bad accumulation
    if (!Number.isFinite(this.pos.x) || !Number.isFinite(this.pos.y) || !Number.isFinite(this.pos.z)) {
      this.pos.set(desiredX, desiredY, desiredZ);
    }

    if (this.mode === 'side') {
      lookX = this.pos.x - 40;
      lookY = this.pos.y - 20;
      lookZ = 0;
    }

    let ox = 0;
    let oy = 0;
    if (this.shake > 0) {
      ox = (Math.random() - 0.5) * this.shake * 10;
      oy = (Math.random() - 0.5) * this.shake * 8;
      this.shake = Math.max(0, this.shake - dt * 8);
    }

    this.camera.position.set(this.pos.x + ox, this.pos.y + oy, this.pos.z);
    this.look.set(lookX + ox * 0.3, lookY, lookZ);
    this.camera.lookAt(this.look);
    this.camera.up.set(0, 1, 0);
  }

  snapTo(targetX: number, targetY: number, facing: number = 1) {
    if (!Number.isFinite(facing) || facing === 0) facing = 1;
    this.facingSmooth = facing;
    if (this.mode === 'third') {
      this.pos.set(targetX - facing * 160, targetY + 55, 90);
      this.look.set(targetX + facing * 90, targetY + 20, 0);
    } else {
      this.pos.set(targetX + 80, targetY + 60, 480);
      this.look.set(targetX, targetY, 0);
    }
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);
    this.camera.up.set(0, 1, 0);
    this.modeSwitchSnap = false;
  }

  addShake(amount: number) {
    if (!Number.isFinite(amount)) return;
    this.shake = Math.min(2.5, this.shake + amount);
  }
}
