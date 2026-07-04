import * as THREE from "three";
import { gsap } from "gsap";

export class CameraSystem {
  constructor(camera) {
    this.camera = camera;
  }

  setup(config) {
    this.camera.position.set(...config.start);
    this.camera.fov = config.fov || 60;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(0, 0, 0);
  }

  moveTo(to, duration, ease) {
    gsap.to(this.camera.position, {
      x: to[0],
      y: to[1],
      z: to[2],
      duration,
      ease: ease || "power2.out",
    });
  }
}
