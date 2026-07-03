class Camera {
  constructor(cam) {
    this.cam = cam;
    this._orbitId = null;
    this._shakeX = 0;
    this._shakeY = 0;
  }

  intro() {
    gsap.to(this.cam.position, { z: 8, y: 2, duration: 4, ease: 'power4.out' });
  }

  stadium() {
    gsap.to(this.cam.position, { x: 5, z: 6, duration: 6, ease: 'sine.inOut' });
  }

  trophy() {
    gsap.to(this.cam.position, { y: 3, z: 4, x: 0, duration: 5, ease: 'power3.inOut' });
  }

  orbit(radius = 8, height = 4) {
    let angle = 0;
    this._orbitId = setInterval(() => {
      angle += 0.004;
      this.cam.position.x = Math.sin(angle) * radius;
      this.cam.position.z = Math.cos(angle) * radius;
      this.cam.position.y = height;
      this.cam.lookAt(0, 2, 0);
    }, 16);
  }

  stopOrbit() { clearInterval(this._orbitId); this._orbitId = null; }

  shake(intensity = 0.3, duration = 0.6) {
    const start = performance.now();
    const go = () => {
      const e = (performance.now() - start) / 1000;
      if (e > duration) { this._shakeX = this._shakeY = 0; return; }
      const d = 1 - e / duration;
      this._shakeX = (Math.random() - 0.5) * intensity * d;
      this._shakeY = (Math.random() - 0.5) * intensity * d * 0.5;
      requestAnimationFrame(go);
    };
    go();
  }

  update() {
    if (this._shakeX || this._shakeY) {
      this.cam.position.x += this._shakeX;
      this.cam.position.y += this._shakeY;
    }
    if (!this._orbitId) this.cam.lookAt(0, 2, 0);
  }
}
