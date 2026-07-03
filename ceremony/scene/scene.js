import * as THREE from 'three';
import { C, Q } from '../config/config.js';

export let scene;
export let trophyGroup;

// ─── PUBLIC HANDLES ───────────────────────────────────────────────────────────
export const lights  = {};
export const mats    = {};
export const objects = {};

export function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x00000a);
  scene.fog = new THREE.FogExp2(0x000008, Q.fog);

  _buildLighting();
  _buildStage();
  _buildStadium();
  _buildTrophy();
  _buildScreens();
  _buildLasers();
  _buildGroundReflection();

  return scene;
}

// ─── LIGHTING ─────────────────────────────────────────────────────────────────
function _buildLighting() {
  scene.add(new THREE.AmbientLight(0x040412, 3));

  // Warm key fill — starts dim, intensifies during trophy reveal
  lights.key = new THREE.PointLight(C.gold, 0, 40);
  lights.key.position.set(0, 18, 0);
  scene.add(lights.key);

  // Blue architectural rim lights
  const r1 = new THREE.PointLight(0x1a3a6c, 8, 100);
  r1.position.set(-40, 25, -30);
  scene.add(r1);

  const r2 = new THREE.PointLight(0x0d2040, 5, 80);
  r2.position.set(40, 18, 30);
  scene.add(r2);

  // Deep rear blue wash
  const wash = new THREE.DirectionalLight(0x0a1428, 0.6);
  wash.position.set(0, 50, -80);
  scene.add(wash);

  // Stage spotlight — narrow, white, activated during champion reveal
  lights.spot = new THREE.SpotLight(0xffffff, 0, 80, Math.PI * 0.09, 0.35, 1.8);
  lights.spot.position.set(0, 45, 0);
  lights.spot.target.position.set(0, 0, 0);
  scene.add(lights.spot);
  scene.add(lights.spot.target);

  // Trophy reveal light
  lights.trophy = new THREE.PointLight(C.goldBright, 0, 20);
  lights.trophy.position.set(0, 8, 2);
  scene.add(lights.trophy);
}

// ─── STAGE ────────────────────────────────────────────────────────────────────
function _buildStage() {
  const g = new THREE.Group();
  g.name = 'stage';
  scene.add(g);
  objects.stage = g;

  // Main disc — black glossy (ultra-high metalness/low roughness for reflections)
  mats.stage = new THREE.MeshStandardMaterial({
    color: 0x040408,
    metalness: 0.98,
    roughness: 0.02,
    envMapIntensity: 1.0,
  });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.14, 96), mats.stage);
  g.add(disc);

  // Step ring 1
  const step1 = new THREE.Mesh(
    new THREE.CylinderGeometry(10.5, 10.5, 0.08, 96),
    new THREE.MeshStandardMaterial({ color:0x06060e, metalness:0.95, roughness:0.06 })
  );
  step1.position.y = -0.11;
  g.add(step1);

  // Step ring 2
  const step2 = new THREE.Mesh(
    new THREE.CylinderGeometry(12.5, 12.5, 0.05, 96),
    new THREE.MeshStandardMaterial({ color:0x050508, metalness:0.9, roughness:0.08 })
  );
  step2.position.y = -0.175;
  g.add(step2);

  // Gold outer ring
  mats.goldRing = new THREE.MeshStandardMaterial({
    color: C.gold, metalness: 1.0, roughness: 0.06,
    emissive: C.gold, emissiveIntensity: 0.5,
  });
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(9, 0.07, 8, 160), mats.goldRing);
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = 0.07;
  g.add(outerRing);

  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(8, 0.035, 6, 160), mats.goldRing);
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.07;
  g.add(innerRing);

  const midRing = new THREE.Mesh(new THREE.TorusGeometry(4, 0.025, 6, 128), mats.goldRing);
  midRing.rotation.x = Math.PI / 2;
  midRing.position.y = 0.07;
  g.add(midRing);

  // Radial gold lines (12 spokes)
  const spokeMat = new THREE.MeshBasicMaterial({ color: C.gold, transparent:true, opacity:0.18 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 4.5), spokeMat);
    spoke.rotation.x = -Math.PI / 2;
    spoke.rotation.z = a;
    spoke.position.set(Math.cos(a)*4.5, 0.072, Math.sin(a)*4.5);
    g.add(spoke);
  }

  // Under-glow disc — activated during trophy reveal
  mats.stageGlow = new THREE.MeshBasicMaterial({
    color: C.gold, transparent:true, opacity:0, side:THREE.DoubleSide, depthWrite:false,
  });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(9.5, 96), mats.stageGlow);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.05;
  g.add(glow);
}

// ─── STADIUM CROWD ────────────────────────────────────────────────────────────
function _buildStadium() {
  const N = Q.crowd;
  const pos   = new Float32Array(N * 3);
  const col   = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 24 + Math.random() * 32;         // 24–56 units out
    const h = (r - 24) * 0.50 + Math.random() * 10 - 2;  // bowl rise
    pos[i*3]   = Math.cos(angle) * r;
    pos[i*3+1] = h;
    pos[i*3+2] = Math.sin(angle) * r;

    const t = Math.random();
    if (t < 0.55) {
      // warm white phone light
      col[i*3]=0.94+Math.random()*0.06; col[i*3+1]=0.88+Math.random()*0.08; col[i*3+2]=0.72+Math.random()*0.18;
    } else if (t < 0.78) {
      // cool blue LED
      col[i*3]=0.08+Math.random()*0.15; col[i*3+1]=0.28+Math.random()*0.28; col[i*3+2]=0.85+Math.random()*0.15;
    } else {
      // gold/amber
      col[i*3]=0.98+Math.random()*0.02; col[i*3+1]=0.76+Math.random()*0.18; col[i*3+2]=0.05+Math.random()*0.12;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  mats.crowd = new THREE.PointsMaterial({
    size: 0.26, vertexColors:true, sizeAttenuation:true,
    transparent:true, opacity:0, depthWrite:false,
  });

  objects.crowd = new THREE.Points(geo, mats.crowd);
  objects.crowd.name = 'crowd';
  scene.add(objects.crowd);

  // Stadium skeleton rings (bleacher rows)
  const skelMat = new THREE.MeshBasicMaterial({ color:0x0c0c18, transparent:true, opacity:0.55 });
  for (let i = 0; i < 7; i++) {
    const r = 24 + i * 5;
    const y = i * 3.2 - 1;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.35, 4, 96), skelMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    scene.add(ring);
  }

  // Ground plane (dark green pitch below fog)
  const pitch = new THREE.Mesh(
    new THREE.CircleGeometry(80, 64),
    new THREE.MeshStandardMaterial({ color:0x040c04, roughness:1, metalness:0 })
  );
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.y = -0.25;
  scene.add(pitch);
}

// ─── TROPHY ───────────────────────────────────────────────────────────────────
function _buildTrophy() {
  trophyGroup = new THREE.Group();
  trophyGroup.visible = false;
  trophyGroup.position.y = 0.14;
  scene.add(trophyGroup);
  objects.trophy = trophyGroup;

  const S = 1.2;
  const gold = new THREE.MeshStandardMaterial({
    color:0xf0b800, metalness:0.95, roughness:0.10,
    emissive:0xaa7000, emissiveIntensity:0.08,
  });
  const goldShine = new THREE.MeshStandardMaterial({
    color:0xffd740, metalness:0.90, roughness:0.14,
    emissive:0xcc8800, emissiveIntensity:0.16,
  });
  const malachite = new THREE.MeshStandardMaterial({ color:0x1a6b35, metalness:0.12, roughness:0.78 });

  // Octagonal base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.46*S,0.48*S,0.06*S,8), gold);
  base.position.y = 0.03*S; trophyGroup.add(base);

  // Malachite band
  const green = new THREE.Mesh(new THREE.CylinderGeometry(0.41*S,0.42*S,0.24*S,48), malachite);
  green.position.y = 0.18*S; trophyGroup.add(green);
  [0.06,0.18,0.30].forEach(y => {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.425*S,0.425*S,0.013*S,48), gold);
    r.position.y = y*S; trophyGroup.add(r);
  });

  // Body (FIFA WC silhouette)
  const profile = [
    [0.02,0.00],[0.43,0.00],[0.44,0.04],[0.44,0.30],
    [0.34,0.40],[0.24,0.52],[0.16,0.66],
    [0.20,0.82],[0.30,1.00],[0.44,1.24],[0.57,1.50],
    [0.66,1.74],[0.70,1.96],[0.67,2.14],[0.61,2.32],
    [0.53,2.50],[0.42,2.64],[0.28,2.74],[0.10,2.79],[0.02,2.80]
  ].map(([x,y]) => new THREE.Vector2(x*S,y*S));
  trophyGroup.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 80), gold));

  // Gold globe
  const gR = 0.56*S, gY = (2.80+0.05+gR)*S;
  const globe = new THREE.Mesh(new THREE.SphereGeometry(gR,48,32), goldShine);
  globe.position.y = gY; trophyGroup.add(globe);

  const ridgeMat = new THREE.MeshStandardMaterial({ color:0x966000, metalness:0.55, roughness:0.55 });
  const eq = new THREE.Mesh(new THREE.TorusGeometry(gR+0.01,0.022*S,6,64), ridgeMat);
  eq.position.y = gY; trophyGroup.add(eq);
  for (let i=0;i<4;i++){
    const m = new THREE.Mesh(new THREE.TorusGeometry(gR+0.01,0.016*S,4,40), ridgeMat);
    m.position.y = gY; m.rotation.y=(i/4)*Math.PI*2; m.rotation.x=Math.PI/2;
    trophyGroup.add(m);
  }
}

// ─── LED SCREENS (4 cardinal positions) ───────────────────────────────────────
function _buildScreens() {
  objects.screens = [];
  for (let i=0;i<4;i++) {
    const a = (i/4)*Math.PI*2;
    const d = 48;
    const scrMat = new THREE.MeshBasicMaterial({ color:0x060612, transparent:true, opacity:0.88 });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(20,11), scrMat);
    scr.position.set(Math.cos(a)*d, 13, Math.sin(a)*d);
    scr.lookAt(0, 13, 0);
    scene.add(scr);

    // Gold border
    const edgeMat = new THREE.LineBasicMaterial({ color:C.gold, transparent:true, opacity:0.25 });
    const edgeGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(20.3,11.3));
    const edge = new THREE.LineSegments(edgeGeo, edgeMat);
    edge.position.copy(scr.position);
    edge.rotation.copy(scr.rotation);
    scene.add(edge);

    objects.screens.push(scr);
  }
}

// ─── LASER BEAMS ──────────────────────────────────────────────────────────────
function _buildLasers() {
  objects.lasers = [];
  const laserColors = [0x4466ee, 0x2255dd, 0x8899ff, 0xaabbff, 0x3344cc, 0x6677ee];
  for (let i=0;i<8;i++) {
    const a = (i/8)*Math.PI*2 + 0.2;
    const r = 38;
    const mat = new THREE.LineBasicMaterial({
      color: laserColors[i % laserColors.length],
      transparent:true, opacity:0, linewidth:1,
    });
    const pts = [
      new THREE.Vector3(Math.cos(a)*r, 2.5, Math.sin(a)*r),
      new THREE.Vector3(Math.cos(a+0.4)*r*0.15, 65, Math.sin(a+0.4)*r*0.15),
    ];
    const laser = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    scene.add(laser);
    objects.lasers.push(laser);
  }
}

// ─── GROUND REFLECTION FOG LAYER ──────────────────────────────────────────────
function _buildGroundReflection() {
  // Faint volumetric-look ground haze disc
  const mat = new THREE.MeshBasicMaterial({
    color:0x0a1428, transparent:true, opacity:0.35,
    side:THREE.DoubleSide, depthWrite:false,
  });
  const haze = new THREE.Mesh(new THREE.CircleGeometry(70, 64), mat);
  haze.rotation.x = -Math.PI/2;
  haze.position.y = 0.8;
  scene.add(haze);
}
