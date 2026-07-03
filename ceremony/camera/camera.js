import * as THREE from 'three';
import gsap from 'gsap';

export const camera = new THREE.PerspectiveCamera(58, innerWidth/innerHeight, 0.1, 2000);
camera.position.set(0, 18, 55);

// ─── INTERNAL STATE ───────────────────────────────────────────────────────────
const lookTarget  = new THREE.Vector3(0, 4, 0);
const lookCurrent = new THREE.Vector3(0, 4, 0);
let   shakeAmt    = 0;
let   driftAngle  = 0;
let   driftActive = false;
let   driftR      = 0;
let   driftH      = 0;

export function initCamera() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });
}

// Called every frame from the render loop
export function tickCamera(dt) {
  // Smooth look-at
  lookCurrent.lerp(lookTarget, 0.04);
  camera.lookAt(lookCurrent);

  // Slow ambient drift around the scene (orbit)
  if (driftActive) {
    driftAngle += dt * 0.06;
    camera.position.x += (Math.cos(driftAngle) * driftR - camera.position.x) * 0.005;
    camera.position.z += (Math.sin(driftAngle) * driftR - camera.position.z) * 0.005;
  }

  // Camera shake decay
  if (shakeAmt > 0.002) {
    camera.position.x += (Math.random() - 0.5) * shakeAmt;
    camera.position.y += (Math.random() - 0.5) * shakeAmt * 0.5;
    shakeAmt *= 0.84;
  }
}

export function shake(strength = 0.35) {
  shakeAmt = Math.max(shakeAmt, strength);
}

export function look(x, y, z) {
  lookTarget.set(x, y, z);
}

export function startDrift(radius = 32, height = 8) {
  driftR = radius; driftH = height; driftActive = true;
}
export function stopDrift() { driftActive = false; }

// ─── NAMED CINEMATIC MOVES ────────────────────────────────────────────────────
export const moves = {
  grandEntrance() {
    stopDrift();
    gsap.to(camera.position, { x:0, y:32, z:70, duration:0.01 });
    gsap.to(camera.position, { x:4, y:14, z:46, duration:7, ease:'power3.out' });
    look(0, 5, 0);
  },
  wide() {
    gsap.to(camera.position, { x:18, y:10, z:36, duration:7, ease:'sine.inOut' });
    look(0, 3, 0);
    startDrift(38, 10);
  },
  orbitStadium() {
    gsap.to(camera.position, { x:-14, y:9, z:30, duration:8, ease:'sine.inOut' });
    look(0, 2, 0);
    startDrift(34, 9);
  },
  trophyApproach() {
    stopDrift();
    gsap.to(camera.position, { x:0, y:7, z:18, duration:6, ease:'power3.inOut' });
    look(0, 3.5, 0);
  },
  trophyClose() {
    stopDrift();
    gsap.to(camera.position, { x:2, y:4, z:9, duration:5, ease:'power2.inOut' });
    look(0, 3, 0);
  },
  revealDark() {
    stopDrift();
    gsap.to(camera.position, { x:0, y:3.5, z:8, duration:3, ease:'power2.inOut' });
    look(0, 2, 0);
  },
  pullBack() {
    stopDrift();
    gsap.to(camera.position, { x:0, y:20, z:50, duration:6, ease:'power3.out' });
    look(0, 5, 0);
    startDrift(48, 18);
  },
  top10() {
    stopDrift();
    gsap.to(camera.position, { x:-8, y:5, z:14, duration:4, ease:'power2.inOut' });
    look(0, 2, 0);
    startDrift(14, 5);
  },
  finalGlory() {
    stopDrift();
    gsap.to(camera.position, { x:0, y:6, z:14, duration:5, ease:'power3.inOut' });
    look(0, 3, 0);
    startDrift(16, 6);
  },
};
