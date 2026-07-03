// ─── CHAMPION DATA ──────────────────────────────────────────────────
const champion = {
  player:  "JOHN ALVARADO",
  country: "COLOMBIA 🇨🇴",
  year:    2026
};

// ─── SCENE ──────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000005, 0.012);

const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0, 4, 22);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById("webgl").appendChild(renderer.domElement);

// ─── LIGHTS ─────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x111122, 2));

const keyLight = new THREE.PointLight(0xffcc88, 4, 60);
keyLight.position.set(0, 10, 5);
scene.add(keyLight);

const blueLight = new THREE.PointLight(0x4488ff, 3, 50);
blueLight.position.set(-8, 6, -5);
scene.add(blueLight);

// ─── FLOOR ──────────────────────────────────────────────────────────
const floorMesh = new THREE.Mesh(
  new THREE.CircleGeometry(40, 64),
  new THREE.MeshStandardMaterial({ color: 0x0a1a0a, roughness: 0.9 })
);
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);

// ─── TROPHY (LatheGeometry cup + handles + pedestal) ────────────────
const trophyGroup = new THREE.Group();
trophyGroup.visible = false;
scene.add(trophyGroup);

(function buildTrophy() {
  const gold = new THREE.MeshStandardMaterial({
    color: 0xffd700, metalness: 0.96, roughness: 0.06,
    emissive: 0xffaa00, emissiveIntensity: 0.18
  });

  // Cup profile (World Cup style silhouette)
  const profile = [
    [0.02, 0.00], [0.52, 0.08], [0.62, 0.18], [0.52, 0.28],
    [0.12, 0.36], [0.10, 0.80], [0.13, 0.88],
    [0.32, 1.05], [0.58, 1.40], [0.78, 1.82],
    [0.74, 2.08], [0.58, 2.20], [0.46, 2.24], [0.02, 2.26]
  ].map(([x,y]) => new THREE.Vector2(x * 1.4, y * 1.4));

  trophyGroup.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 48), gold));

  // Handles
  const handleGeo = new THREE.TorusGeometry(0.30, 0.045, 8, 18, Math.PI);
  [-1, 1].forEach(side => {
    const h = new THREE.Mesh(handleGeo, gold);
    h.position.set(side * 0.72 * 1.4, 1.58 * 1.4, 0);
    h.rotation.z = side * Math.PI / 2;
    h.rotation.y = Math.PI / 2;
    trophyGroup.add(h);
  });

  // Pedestal base
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.22, 32), gold);
  pedestal.position.y = -0.11;
  trophyGroup.add(pedestal);

  // Trophy light (tight gold spot above it)
  const tl = new THREE.PointLight(0xffd700, 0, 12);
  tl.position.set(0, 6, 1);
  scene.add(tl);
  trophyGroup.userData.light = tl;
})();

// ─── STADIUM (ring of crowd lights) ─────────────────────────────────
let stadiumMat;
(function buildStadium() {
  const N = 6000;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r     = 18 + Math.random() * 16;
    const h     = Math.random() * 14 - 2;
    pos[i*3]   = Math.cos(angle) * r;
    pos[i*3+1] = h;
    pos[i*3+2] = Math.sin(angle) * r;

    const warm = Math.random() > 0.5;
    col[i*3]   = warm ? 1.0 : 0.3;
    col[i*3+1] = warm ? 0.9 : 0.6;
    col[i*3+2] = warm ? 0.3 : 1.0;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));

  stadiumMat = new THREE.PointsMaterial({
    size: 0.28, vertexColors: true, sizeAttenuation: true,
    transparent: true, opacity: 0
  });

  const pts = new THREE.Points(geo, stadiumMat);
  scene.add(pts);
  gsap.to(pts.rotation, { y: Math.PI * 2, duration: 20, ease: "none", repeat: -1 });
})();

// ─── CONFETTI ───────────────────────────────────────────────────────
const confN   = 1200;
const confPos = new Float32Array(confN * 3);
const confVel = new Float32Array(confN * 3);
const confCol = new Float32Array(confN * 3);
const CONF_COLORS = [[1,.84,0],[1,.27,.27],[.2,.8,1],[.4,1,.3],[.9,.3,1],[1,.55,0]];

for (let i = 0; i < confN; i++) {
  confPos[i*3]   = (Math.random()-0.5)*30;
  confPos[i*3+1] = Math.random()*20 + 5;
  confPos[i*3+2] = (Math.random()-0.5)*15;
  confVel[i*3]   = (Math.random()-0.5)*0.018;
  confVel[i*3+1] = -0.025 - Math.random()*0.035;
  confVel[i*3+2] = (Math.random()-0.5)*0.018;
  const c = CONF_COLORS[i % CONF_COLORS.length];
  confCol[i*3]=c[0]; confCol[i*3+1]=c[1]; confCol[i*3+2]=c[2];
}

const confGeo = new THREE.BufferGeometry();
confGeo.setAttribute("position", new THREE.BufferAttribute(confPos, 3));
confGeo.setAttribute("color",    new THREE.BufferAttribute(confCol, 3));
const confMat = new THREE.PointsMaterial({
  size: 0.2, vertexColors: true, sizeAttenuation: true,
  transparent: true, opacity: 0
});
scene.add(new THREE.Points(confGeo, confMat));

function updateConfetti() {
  for (let i = 0; i < confN; i++) {
    confPos[i*3]   += confVel[i*3];
    confPos[i*3+1] += confVel[i*3+1];
    confPos[i*3+2] += confVel[i*3+2];
    if (confPos[i*3+1] < -5) {
      confPos[i*3+1] = 20;
      confPos[i*3]   = (Math.random()-0.5)*30;
      confPos[i*3+2] = (Math.random()-0.5)*15;
    }
  }
  confGeo.attributes.position.needsUpdate = true;
}

// ─── FIREWORKS ──────────────────────────────────────────────────────
const FW_COLORS = [0xffd700, 0xff4444, 0x44aaff, 0x44ff88, 0xff88ff, 0xffaa00];
const fwParticles = [];

function fwExplode(x, y, z) {
  const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
  for (let i = 0; i < 100; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 4, 4),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 })
    );
    m.position.set(x, y, z);
    scene.add(m);
    const speed = 0.05 + Math.random() * 0.18;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.random() * Math.PI;
    fwParticles.push({
      m, life: 1,
      v: new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      )
    });
  }
  Snd.boom(0.45);
}

function updateFireworks() {
  for (let i = fwParticles.length - 1; i >= 0; i--) {
    const p = fwParticles[i];
    p.m.position.add(p.v);
    p.v.y -= 0.004;
    p.life -= 0.012;
    p.m.material.opacity = Math.max(0, p.life);
    if (p.life <= 0) {
      scene.remove(p.m);
      p.m.geometry.dispose();
      p.m.material.dispose();
      fwParticles.splice(i, 1);
    }
  }
}

function fwRandom() {
  fwExplode(
    (Math.random()-0.5)*10,
    4 + Math.random()*5,
    (Math.random()-0.5)*6
  );
}

// ─── CAMERA DIRECTOR ────────────────────────────────────────────────
const cam = {
  intro()  { gsap.to(camera.position, { z:12, y:3, duration:4, ease:"power4.out" }); },
  wide()   { gsap.to(camera.position, { x:6, z:10, y:5, duration:5, ease:"sine.inOut" }); },
  trophy() { gsap.to(camera.position, { y:2.5, z:5.5, x:0, duration:5, ease:"power3.inOut" }); },
  zoomTrophy() { gsap.to(camera.position, { y:2.0, z:3.5, x:0, duration:3, ease:"power2.inOut" }); }
};

// ─── WEB AUDIO ──────────────────────────────────────────────────────
const Snd = (() => {
  let ctx, master, comp, reverb, boomCount = 0;

  function noise(dur = 0.5) {
    const sz = ~~(ctx.sampleRate * dur);
    const b  = ctx.createBuffer(1, sz, ctx.sampleRate);
    const d  = b.getChannelData(0);
    for (let i = 0; i < sz; i++) d[i] = Math.random()*2-1;
    return b;
  }

  function buildReverb() {
    const wet = ctx.createGain(); wet.gain.value = 0.26; wet.connect(comp);
    [0.037,0.043,0.053,0.061].forEach(dt => {
      const delay = ctx.createDelay(0.1); delay.delayTime.value = dt;
      const fb = ctx.createGain(); fb.gain.value = 0.46;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
      delay.connect(lp); lp.connect(fb); fb.connect(delay); delay.connect(wet);
    });
    return wet;
  }

  function brass(freq, t0, dur, vol = 0.14) {
    [0, 5].forEach(dc => {
      const osc = ctx.createOscillator(); osc.type = "sawtooth";
      osc.frequency.value = freq; osc.detune.value = dc;
      const lp  = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2100;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime(vol, t0+0.07);
      env.gain.setValueAtTime(vol*0.72, t0+0.14);
      env.gain.setValueAtTime(vol*0.72, t0+dur-0.08);
      env.gain.linearRampToValueAtTime(0, t0+dur);
      osc.connect(lp); lp.connect(env); env.connect(master); env.connect(reverb);
      osc.start(t0); osc.stop(t0+dur+0.05);
    });
  }

  function timp(t0, pitch = 110, vol = 0.7) {
    const osc = ctx.createOscillator(); osc.type = "sine";
    osc.frequency.setValueAtTime(pitch*1.6, t0);
    osc.frequency.exponentialRampToValueAtTime(pitch, t0+0.04);
    osc.frequency.exponentialRampToValueAtTime(pitch*0.55, t0+0.4);
    const env = ctx.createGain();
    env.gain.setValueAtTime(vol, t0); env.gain.exponentialRampToValueAtTime(0.001, t0+0.52);
    osc.connect(env); env.connect(master); env.connect(reverb);
    osc.start(t0); osc.stop(t0+0.55);
  }

  return {
    init() {
      try {
        ctx    = new (window.AudioContext || window.webkitAudioContext)();
        comp   = ctx.createDynamicsCompressor();
        comp.threshold.value = -14; comp.knee.value = 8;
        comp.ratio.value = 6; comp.attack.value = 0.002; comp.release.value = 0.15;
        master = ctx.createGain(); master.gain.value = 0.78;
        master.connect(comp); comp.connect(ctx.destination);
        reverb = buildReverb();
        // resume immediately — called from user gesture handler
        if (ctx.state === "suspended") ctx.resume();
      } catch(e) { ctx = null; }
    },

    resume() { try { if (ctx && ctx.state === "suspended") ctx.resume(); } catch(e){} },

    crowd() {
      if (!ctx) return;
      const SR = ctx.sampleRate, len = SR * 25;
      const buf = ctx.createBuffer(2, len, SR);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for (let i = 0; i < len; i++) {
          const w = Math.random()*2-1;
          b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
          b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
          b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
          d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
        }
      }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1000; bp.Q.value = 0.4;
      const g = ctx.createGain(); g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.18, ctx.currentTime+3);
      src.connect(bp); bp.connect(g); g.connect(master); src.start();
    },

    boom(vol = 0.45) {
      if (!ctx || boomCount >= 4) return;
      boomCount++; setTimeout(() => boomCount--, 900);
      const t = ctx.currentTime, v = vol * 0.88;

      const c1 = ctx.createBufferSource(); c1.buffer = noise(0.07);
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
      const cg = ctx.createGain(); cg.gain.setValueAtTime(v*2.2,t); cg.gain.exponentialRampToValueAtTime(0.001,t+0.09);
      c1.connect(hp); hp.connect(cg); cg.connect(master); c1.start(t);

      const bass = ctx.createOscillator(); bass.type = "sine";
      bass.frequency.setValueAtTime(90,t); bass.frequency.exponentialRampToValueAtTime(22,t+0.5);
      const bg = ctx.createGain(); bg.gain.setValueAtTime(v*1.2,t); bg.gain.exponentialRampToValueAtTime(0.001,t+0.55);
      bass.connect(bg); bg.connect(master); bass.start(t); bass.stop(t+0.6);

      const r1 = ctx.createBufferSource(); r1.buffer = noise(1.2);
      const rbp = ctx.createBiquadFilter(); rbp.type = "bandpass"; rbp.frequency.value = 320; rbp.Q.value = 0.55;
      const rg = ctx.createGain(); rg.gain.setValueAtTime(v*0.48,t+0.03); rg.gain.exponentialRampToValueAtTime(0.001,t+1.2);
      r1.connect(rbp); rbp.connect(rg); rg.connect(master); r1.start(t);
    },

    fanfare() {
      if (!ctx) return;
      const t = ctx.currentTime;
      timp(t+0.0,  108, 0.7);
      timp(t+0.35, 96,  0.45);
      timp(t+1.1,  108, 0.6);
      timp(t+1.8,  72,  0.85);
      [196,246.9,293.7,392].forEach(f => brass(f, t+0.0,  0.28, 0.14));
      [196,246.9,293.7,392].forEach(f => brass(f, t+0.35, 0.28, 0.12));
      [220,261.6,329.6,440].forEach(f => brass(f, t+0.72, 0.35, 0.13));
      [130.8,164.8,196,261.6,329.6,392,523.3].forEach(f => brass(f, t+1.8, 1.2, 0.13));
      [[392,1.8,.22],[440,2.1,.22],[493.9,2.35,.22],[587.3,2.6,.38],[784,3.0,.9]]
        .forEach(([f,d,dur]) => brass(f, t+d, dur, 0.15));
    },

    chord(vol = 0.28) {
      if (!ctx) return;
      const t = ctx.currentTime;
      timp(t, 92, vol*1.1);
      [130.8,164.8,196,261.6,329.6,392,523.3].forEach(f => brass(f, t, 2.0, vol*0.55));
    }
  };
})();

// ─── TYPE EFFECT ────────────────────────────────────────────────────
function typeName(cb) {
  const el = document.getElementById("player");
  el.innerHTML = "";
  el.style.opacity = "1";
  let i = 0;
  const t = setInterval(() => {
    el.innerHTML += champion.player[i++];
    if (i >= champion.player.length) { clearInterval(t); if (cb) setTimeout(cb, 300); }
  }, 120);
}

// ─── FLASH ──────────────────────────────────────────────────────────
function _flash() {
  const fl = document.createElement("div");
  fl.style.cssText = "position:fixed;inset:0;background:#fff;z-index:9999;pointer-events:none;opacity:0";
  document.body.appendChild(fl);
  gsap.to(fl, { opacity: 1, duration: 0.08,
    onComplete: () => gsap.to(fl, { opacity: 0, duration: 0.5,
      onComplete: () => fl.remove() })
  });
}

// ─── TIMELINE ───────────────────────────────────────────────────────
let _fwAuto = null;

function startTimeline() {
  // Fade in stadium
  gsap.to(stadiumMat, { opacity: 0.9, duration: 3 });

  const tl = gsap.timeline();

  // Logo in
  tl.to({}, { duration: 1 });
  tl.to("#logo", { opacity: 1, duration: 2 });

  // Crowd + wide shot + fireworks begin
  tl.call(() => {
    Snd.crowd();
    cam.wide();
    _fwAuto = setInterval(fwRandom, 1800);
  });
  tl.to({}, { duration: 3.5 });

  // Big boom + confetti + trophy cam
  tl.call(() => {
    _flash();
    Snd.boom(0.7);
    clearInterval(_fwAuto);
    for (let i = 0; i < 4; i++) setTimeout(fwRandom, i*180);
    gsap.to(confMat, { opacity: 1, duration: 1.5 });
    cam.trophy();
    _fwAuto = setInterval(fwRandom, 1000);
  });
  tl.to("#logo", { opacity: 0, duration: 1 });
  tl.to({}, { duration: 1.5 });

  // TROPHY REVEAL — rises from below with golden light
  tl.call(() => {
    trophyGroup.visible = true;
    trophyGroup.scale.set(0, 0, 0);
    trophyGroup.position.y = -3;
    const tl2 = gsap.timeline();
    tl2.to(trophyGroup.scale, { x:1, y:1, z:1, duration:1.2, ease:"back.out(1.4)" });
    tl2.to(trophyGroup.position, { y:0, duration:1.2, ease:"power2.out" }, 0);
    // Light up the trophy
    gsap.to(trophyGroup.userData.light, { intensity: 6, duration: 1.0 });
    // Fireworks burst on trophy reveal
    for (let i = 0; i < 6; i++) setTimeout(fwRandom, i * 220);
    Snd.boom(0.8);
  });
  tl.to({}, { duration: 1.8 });

  // Zoom in close on trophy
  tl.call(() => { cam.zoomTrophy(); });
  tl.to({}, { duration: 1.2 });

  // Fanfare + player name type-in
  tl.call(() => { Snd.fanfare(); });
  tl.call(() => typeName());
  tl.to({}, { duration: (champion.player.length * 120 + 900) / 1000 });

  // Champion title
  tl.call(() => {
    Snd.chord(0.22);
    document.getElementById("title").textContent = "CHAMPION OF THE WORLD";
  });
  tl.to("#title", { opacity: 1, duration: 1 });
  tl.to({}, { duration: 1.2 });

  // Country
  tl.call(() => { document.getElementById("country").textContent = champion.country; });
  tl.to("#country", { opacity: 1, duration: 1 });
  tl.to({}, { duration: 1 });

  // Final burst + button
  tl.call(() => {
    Snd.fanfare();
    clearInterval(_fwAuto);
    _fwAuto = setInterval(fwRandom, 600);
  });
  tl.to("#btn", { opacity: 1, duration: 1.5, ease: "back.out(1.7)" });
  tl.call(() => {
    const btn = document.getElementById("btn");
    btn.style.pointerEvents = "all";
    btn.onclick = () => {
      clearInterval(_fwAuto);
      gsap.to("body", { opacity: 0, duration: 0.8,
        onComplete: () => { if (history.length > 1) history.back(); }
      });
    };
  });
}

// ─── RENDER LOOP ────────────────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  updateFireworks();
  updateConfetti();
  // Trophy slow spin + gentle float
  if (trophyGroup.visible) {
    trophyGroup.rotation.y += 0.005;
    trophyGroup.position.y = Math.sin(t * 0.8) * 0.06;
  }
  camera.lookAt(0, 2, 0);
  renderer.render(scene, camera);
}

// ─── RESIZE ─────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}, { passive: true });

// ─── START SCREEN ────────────────────────────────────────────────────
// Show logo + tap button immediately; this also handles AudioContext autoplay policy
// (AudioContext must be created/resumed inside a user gesture handler)
const startOverlay = document.createElement("div");
startOverlay.style.cssText = [
  "position:fixed", "inset:0", "z-index:9999",
  "display:flex", "flex-direction:column", "align-items:center", "justify-content:center",
  "background:rgba(0,0,0,0.95)", "cursor:pointer"
].join(";");
startOverlay.innerHTML = `
  <img src="logo.jpg" style="width:min(280px,65vw);border-radius:20px;margin-bottom:36px;filter:drop-shadow(0 0 32px rgba(255,215,0,0.7))"/>
  <div style="font-size:clamp(16px,4vw,26px);letter-spacing:8px;color:gold;font-weight:900;font-family:Arial,sans-serif;text-shadow:0 0 30px gold;">▶ PLAY</div>
  <div style="margin-top:16px;font-size:clamp(11px,2.5vw,15px);letter-spacing:3px;color:rgba(255,255,255,0.45);font-family:Arial,sans-serif;">TAP TO START</div>
`;
document.body.appendChild(startOverlay);

startOverlay.addEventListener("click", () => {
  startOverlay.remove();
  // Init audio INSIDE user gesture — this is the only way to un-suspend AudioContext
  Snd.init();
  // Start 3D scene animations
  cam.intro();
  startTimeline();
}, { once: true });

// Render loop starts immediately so the WebGL canvas is alive
animate();
