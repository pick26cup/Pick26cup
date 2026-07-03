// ---------------- CHAMPION DATA ----------------
const champion = {
  player:  "JOHN ALVARADO",
  country: "COLOMBIA 🇨🇴",
  year:    2026
};

// ---------------- SCENE ----------------
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);

const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0, 2, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.getElementById("webgl").appendChild(renderer.domElement);

// ---------------- LIGHTS ----------------
scene.add(new THREE.AmbientLight(0x222222));

const key = new THREE.PointLight(0xffcc88, 3);
key.position.set(5, 5, 5);
scene.add(key);

const stadiumLight = new THREE.PointLight(0x4488ff, 2);
stadiumLight.position.set(-5, 4, -5);
scene.add(stadiumLight);

// ---------------- FLOOR ----------------
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(30, 64),
  new THREE.MeshStandardMaterial({ color: 0x111111 })
);
floor.rotation.x = -Math.PI/2;
scene.add(floor);

// ---------------- CROWD PARTICLES ----------------
const crowdGeo = new THREE.BufferGeometry();
const crowdCount = 2000;
const crowdPos = new Float32Array(crowdCount * 3);
for (let i = 0; i < crowdCount; i++) {
  crowdPos[i*3]   = (Math.random()-0.5)*40;
  crowdPos[i*3+1] = Math.random()*8;
  crowdPos[i*3+2] = (Math.random()-0.5)*40;
}
crowdGeo.setAttribute("position", new THREE.BufferAttribute(crowdPos, 3));
const crowd = new THREE.Points(crowdGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 }));
scene.add(crowd);

// ---------------- FIREWORKS ----------------
class Fireworks {
  constructor() { this.particles = []; }

  explode(x, y, z) {
    const colors = [0xffaa00, 0xff4444, 0x44aaff, 0xffd700, 0x44ff88];
    for (let i = 0; i < 120; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.04),
        new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
      );
      m.position.set(x, y, z);
      scene.add(m);
      this.particles.push({
        m,
        life: 1,
        v: new THREE.Vector3(
          (Math.random()-0.5) * 0.22,
          Math.random() * 0.22,
          (Math.random()-0.5) * 0.22
        )
      });
    }
  }

  update() {
    this.particles = this.particles.filter(p => {
      p.m.position.add(p.v);
      p.v.y -= 0.004;
      p.life -= 0.008;
      p.m.material.opacity = p.life;
      if (p.life <= 0) { scene.remove(p.m); return false; }
      return true;
    });
  }
}

const fireworks = new Fireworks();

// ---------------- CAMERA DIRECTOR ----------------
const cam = {
  intro() {
    gsap.to(camera.position, { z: 8, y: 2, duration: 4, ease: "power4.out" });
  },
  tunnel() {
    gsap.to(camera.position, { x: 3, z: 6, duration: 5, ease: "sine.inOut" });
  },
  trophy() {
    gsap.to(camera.position, { y: 3, z: 4, x: 0, duration: 5, ease: "power3.inOut" });
  }
};

// ---------------- AUDIO (Howler — silent if CDN fails) ----------------
const audio = {
  _stadium: null, _crowd: null, _horn: null,

  init() {
    if (typeof Howl === "undefined") return;
    try {
      this._stadium = new Howl({
        src: ["https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b5c1b.mp3"],
        loop: true, volume: 0.6, html5: true,
        onloaderror: () => {}
      });
      this._crowd = new Howl({
        src: ["https://cdn.pixabay.com/audio/2021/09/06/audio_2d1b5b1c4f.mp3"],
        loop: true, volume: 0.9, html5: true,
        onloaderror: () => {}
      });
      this._horn = new Howl({
        src: ["https://cdn.pixabay.com/audio/2022/03/10/audio_7b2c1b.mp3"],
        html5: true, onloaderror: () => {}
      });
    } catch(e) {}
  },

  play() {
    try { this._stadium && this._stadium.play(); } catch(e) {}
    try { this._crowd   && this._crowd.play();   } catch(e) {}
    setTimeout(() => { try { this._horn && this._horn.play(); } catch(e) {} }, 3000);
  }
};

// ---------------- UI ----------------
const ui = {
  init() {
    this.logo    = document.getElementById("logo");
    this.player  = document.getElementById("player");
    this.title   = document.getElementById("title");
    this.country = document.getElementById("country");
    this.btn     = document.getElementById("btn");
  }
};

// ---------------- TYPE EFFECT ----------------
function typeName() {
  const el = document.getElementById("player");
  el.innerHTML = "";
  el.style.opacity = "1";
  let i = 0;
  const t = setInterval(() => {
    el.innerHTML += champion.player[i];
    i++;
    if (i >= champion.player.length) clearInterval(t);
  }, 120);
}

// ---------------- TIMELINE ----------------
function timeline() {
  const tl = gsap.timeline();
  const typeDelay = (champion.player.length * 120 + 900) / 1000;

  // Pick26 logo appears
  tl.to({}, { duration: 1.5 });
  tl.to("#logo", { opacity: 1, duration: 2 });
  tl.call(() => { audio.play(); cam.tunnel(); });
  tl.to({}, { duration: 3 });

  // Logo fades, camera moves to trophy position
  tl.to("#logo", { opacity: 0, duration: 1 });
  tl.call(() => cam.trophy());
  tl.to({}, { duration: 2 });

  // Player name types in
  tl.call(() => typeName());
  tl.to({}, { duration: typeDelay });

  // Champion title
  tl.call(() => { document.getElementById("title").textContent = "CHAMPION OF THE WORLD"; });
  tl.to("#title", { opacity: 1, duration: 1 });
  tl.to({}, { duration: 1 });

  // Country
  tl.call(() => { document.getElementById("country").textContent = champion.country; });
  tl.to("#country", { opacity: 1, duration: 1 });
  tl.to({}, { duration: 1 });

  // Continue button + fireworks
  tl.to("#btn", { opacity: 1, duration: 1.5, ease: "back.out(1.7)" });
  tl.call(() => {
    fireworks.explode(0, 3, 0);
    setTimeout(() => fireworks.explode(-4, 5, -2), 350);
    setTimeout(() => fireworks.explode(4, 6, -1), 650);
    setTimeout(() => fireworks.explode(-2, 7, 1), 950);

    document.getElementById("btn").onclick = () => {
      gsap.to("body", { opacity: 0, duration: 0.8,
        onComplete: () => { if (history.length > 1) history.back(); }
      });
    };
  });
}

// ---------------- RENDER LOOP ----------------
function animate() {
  requestAnimationFrame(animate);
  fireworks.update();
  camera.lookAt(0, 2, 0);
  renderer.render(scene, camera);
}

// ---------------- START ----------------
ui.init();
audio.init();
cam.intro();
timeline();
animate();

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}, { passive: true });
