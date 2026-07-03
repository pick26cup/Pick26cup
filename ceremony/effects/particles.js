import * as THREE from 'three';
import gsap from 'gsap';
import { Q } from '../config/config.js';

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
const CONF_N = Q.crowd < 4000 ? 600 : 1400;
const confPos = new Float32Array(CONF_N * 3);
const confVel = new Float32Array(CONF_N * 3);
const confCol = new Float32Array(CONF_N * 3);

const CONF_PALETTE = [
  [1,.84,0],[1,.84,0],[.95,.95,.95],[1,.27,.22],[.22,.60,1],[.4,.95,.3],[.9,.3,.9]
];

for (let i=0;i<CONF_N;i++) {
  confPos[i*3]   = (Math.random()-0.5)*60;
  confPos[i*3+1] = 15 + Math.random()*25;
  confPos[i*3+2] = (Math.random()-0.5)*30;
  confVel[i*3]   = (Math.random()-0.5)*0.022;
  confVel[i*3+1] = -0.028 - Math.random()*0.042;
  confVel[i*3+2] = (Math.random()-0.5)*0.022;
  const c = CONF_PALETTE[i % CONF_PALETTE.length];
  confCol[i*3]=c[0]; confCol[i*3+1]=c[1]; confCol[i*3+2]=c[2];
}

const confGeo = new THREE.BufferGeometry();
confGeo.setAttribute('position', new THREE.BufferAttribute(confPos, 3));
confGeo.setAttribute('color',    new THREE.BufferAttribute(confCol, 3));
export const confMat = new THREE.PointsMaterial({
  size:0.22, vertexColors:true, sizeAttenuation:true,
  transparent:true, opacity:0, depthWrite:false,
});
export const confetti = new THREE.Points(confGeo, confMat);
confetti.name = 'confetti';

export function updateConfetti() {
  if (confMat.opacity < 0.01) return;
  for (let i=0;i<CONF_N;i++) {
    confPos[i*3]   += confVel[i*3];
    confPos[i*3+1] += confVel[i*3+1];
    confPos[i*3+2] += confVel[i*3+2];
    if (confPos[i*3+1] < -8) {
      confPos[i*3+1] = 22 + Math.random()*12;
      confPos[i*3]   = (Math.random()-0.5)*60;
      confPos[i*3+2] = (Math.random()-0.5)*30;
    }
  }
  confGeo.attributes.position.needsUpdate = true;
}

export function showConfetti() {
  gsap.to(confMat, { opacity:1, duration:2.0, ease:'power2.out' });
}

// ─── GOLDEN DUST PARTICLES (around champion name) ─────────────────────────────
const GOLD_N = 300;
const goldPos  = new Float32Array(GOLD_N * 3);
const goldCol  = new Float32Array(GOLD_N * 3);
const goldVels = [];

for (let i=0;i<GOLD_N;i++) {
  const a = Math.random()*Math.PI*2;
  const r = Math.random()*0.5;
  goldPos[i*3]   = Math.cos(a)*r;
  goldPos[i*3+1] = (Math.random()-0.5)*0.6;
  goldPos[i*3+2] = Math.sin(a)*r;
  const bright = 0.75 + Math.random()*0.25;
  goldCol[i*3]=bright; goldCol[i*3+1]=bright*0.8; goldCol[i*3+2]=0;
  goldVels.push({
    vx:(Math.random()-0.5)*0.012,
    vy: 0.005 + Math.random()*0.008,
    vz:(Math.random()-0.5)*0.012,
    life:Math.random(),
    maxLife:0.6+Math.random()*1.2,
  });
}

const goldGeo = new THREE.BufferGeometry();
goldGeo.setAttribute('position', new THREE.BufferAttribute(goldPos,3));
goldGeo.setAttribute('color',    new THREE.BufferAttribute(goldCol,3));
export const goldMat = new THREE.PointsMaterial({
  size:0.055, vertexColors:true, sizeAttenuation:true,
  transparent:true, opacity:0, depthWrite:false,
});
export const goldDust = new THREE.Points(goldGeo, goldMat);
goldDust.name = 'goldDust';
goldDust.position.set(0, 2, -1.5); // positions in front of camera, near text

export function updateGoldDust() {
  if (goldMat.opacity < 0.01) return;
  for (let i=0;i<GOLD_N;i++) {
    const v = goldVels[i];
    goldPos[i*3]   += v.vx;
    goldPos[i*3+1] += v.vy;
    goldPos[i*3+2] += v.vz;
    v.life += 0.016;
    if (v.life > v.maxLife) {
      const a = Math.random()*Math.PI*2;
      const r = Math.random()*0.8;
      goldPos[i*3]   = Math.cos(a)*r;
      goldPos[i*3+1] = (Math.random()-0.5)*0.8;
      goldPos[i*3+2] = Math.sin(a)*r;
      v.vx=(Math.random()-0.5)*0.012;
      v.vy=0.005+Math.random()*0.008;
      v.life=0; v.maxLife=0.6+Math.random()*1.2;
    }
  }
  goldGeo.attributes.position.needsUpdate = true;
}

export function showGoldDust() {
  gsap.to(goldMat, { opacity:0.9, duration:1.5, ease:'power2.out' });
}
export function hideGoldDust() {
  gsap.to(goldMat, { opacity:0, duration:1.0 });
}
