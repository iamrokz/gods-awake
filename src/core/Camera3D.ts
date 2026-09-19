import * as THREE from 'three';

/** Cinematic 2.5D side-scroll camera — follows X, slight perspective on Z. */
export class Camera3D {
  camera: THREE.PerspectiveCamera;
  shake = 0;
  private look = new THREE.Vector3();
  private pos = new THREE.Vector3();

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(42, aspect, 1, 5000);
    this.camera.position.set(0, -400, 520);
  }

  setAspect(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  follow(targetX: number, targetY: number, levelW: number, dt: number) {
    // targetY is already Three.js Y (negated game Y of player center)
    const desiredX = targetX + 80;
    const desiredY = targetY + 60;
    const desiredZ = 480;

    const lerp = 1 - Math.pow(0.0008, dt);
    this.pos.x += (desiredX - this.pos.x) * lerp;
    this.pos.y += (desiredY - this.pos.y) * lerp;
    this.pos.z += (desiredZ - this.pos.z) * lerp;

    // soft clamp so we don't fly off level ends
    this.pos.x = Math.max(200, Math.min(levelW - 200, this.pos.x));

    let ox = 0;
    let oy = 0;
    if (this.shake > 0) {
      ox = (Math.random() - 0.5) * this.shake * 10;
      oy = (Math.random() - 0.5) * this.shake * 8;
      this.shake = Math.max(0, this.shake - dt * 8);
    }

    this.camera.position.set(this.pos.x + ox, this.pos.y + oy, this.pos.z);
    this.look.set(this.pos.x - 40 + ox * 0.3, this.pos.y - 20, 0);
    this.camera.lookAt(this.look);
  }

  snapTo(targetX: number, targetY: number) {
    this.pos.set(targetX + 80, targetY + 60, 480);
    this.camera.position.copy(this.pos);
    this.look.set(targetX, targetY, 0);
    this.camera.lookAt(this.look);
  }

  addShake(amount: number) {
    this.shake = Math.min(2.5, this.shake + amount);
  }
}
