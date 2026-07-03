import * as THREE from 'three';
import gsap from 'gsap';
import { Q } from '../config/config.js';
import { shake } from '../camera/camera.js';

const _scene   = { current: null };
export function setFireworkScene(s) { _scene.current = s; }

// ─── SINGLE FIREWORK BURST ────────────────────────────────────────────────────
const N = Q.fireworkParts;

class Firework {
  constructor() {
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    this.vel = [];
    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const spd   = 0.3 + Math.random() * 0.55;
      this.vel.push({
        vx: Math.sin(phi) * Math.cos(theta) * spd,
        vy: Math.sin(phi) * Math.sin(theta) * spd,
        vz: Math.cos(phi)                   * spd,
        drag: 0.93 + Math.random() * 0.04,
      });
      pos[i*3]=0; pos[i*3+1]=0; pos[i*3+2]=0;
      // colour – gold or white or accent
      const r = Math.random();
      if (r < 0.5) {
        col[i*3]=1.0; col[i*3+1]=0.80; col[i*3+2]=0.05;        // gold
      } else if (r < 0.75) {
        col[i*3]=1.0; col[i*3+1]=1.0;  col[i*3+2]=0.95;        // white
      } else {
        col[i*3]=0.5; col[i*3+1]=0.8;  col[i*3+2]=1.0;         // icy blue
      }
    }

    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    this.mat = new THREE.PointsMaterial({
      size: 0.30, vertexColors: true, sizeAttenuation: true,
      transparent: true, opacity: 1, depthWrite: false,
    });
    this.pts = new THREE.Points(this.geo, this.mat);
    this.alive = false;
    this.age   = 0;
  }

  launch(x, y, z) {
    if (!_scene.current) return;
    const pos = this.geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.mat.opacity = 1;
    this.age = 0;
    this.alive = true;
    _scene.current.add(this.pts);
    shake(0.32);
    gsap.to(this.mat, { opacity: 0, duration: 1.8, delay: 0.3, ease: 'power2.in',
      onComplete: () => { this.die(); }
    });
  }

  tick() {
    if (!this.alive) return;
    const pos = this.geo.attributes.position.array;
    this.age++;
    for (let i = 0; i < N; i++) {
      const v = this.vel[i];
      pos[i*3]   += v.vx;
      pos[i*3+1] += v.vy;
      pos[i*3+2] += v.vz;
      v.vx *= v.drag; v.vy = v.vy * v.drag - 0.006; v.vz *= v.drag;
    }
    this.geo.attributes.position.needsUpdate = true;
  }

  die() {
    if (!_scene.current) return;
    _scene.current.remove(this.pts);
    this.alive = false;
  }
}

// ─── POOL ────────────────────────────────────────────────────────────────────
const POOL_SIZE = 10;
const pool = Array.from({ length: POOL_SIZE }, () => new Firework());
let   poolIdx = 0;

export function launchFirework(x, y, z) {
  pool[poolIdx % POOL_SIZE].launch(x, y, z);
  poolIdx++;
}

export function updateFireworks() {
  for (const fw of pool) fw.tick();
}

// ─── BURST SEQUENCES ─────────────────────────────────────────────────────────
let   _burstInterval = null;

export function startBurst(density = 1) {
  stopBurst();
  const interval = 900 / density;
  function fire() {
    const a = Math.random() * Math.PI * 2;
    const r = 18 + Math.random() * 18;
    launchFirework(
      Math.cos(a) * r,
      14 + Math.random() * 22,
      Math.sin(a) * r
    );
  }
  fire();
  _burstInterval = setInterval(fire, interval);
}

export function stopBurst() {
  if (_burstInterval) { clearInterval(_burstInterval); _burstInterval = null; }
}

export function megaBurst() {
  // rapid-fire multiple fireworks for climactic moment
  let i = 0;
  const t = setInterval(() => {
    const a = Math.random() * Math.PI * 2;
    const r = 14 + Math.random() * 22;
    launchFirework(
      Math.cos(a) * r,
      16 + Math.random() * 18,
      Math.sin(a) * r
    );
    i++;
    if (i >= 18) clearInterval(t);
  }, 90);
}
