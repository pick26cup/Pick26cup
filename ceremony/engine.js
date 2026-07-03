/* ── engine.js ── WebGL core, Three.js scene, render loop ── */

let scene, camera, renderer, particles, cameraCtrl;
let trophy = null, spotLight = null, glowLight = null;

function init(){
  /* ── Renderer ── */
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  document.getElementById('webgl').appendChild(renderer.domElement);

  /* ── Scene ── */
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020408);
  scene.fog = new THREE.FogExp2(0x030810, 0.006);

  /* ── Camera ── */
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 25);

  /* ── Ambient light ── */
  scene.add(new THREE.AmbientLight(0x1a1a2e, 1.2));

  /* ── Point light (warm fill) ── */
  const fill = new THREE.PointLight(0xffcc88, 2, 80);
  fill.position.set(5, 5, 5);
  scene.add(fill);

  /* ── Trophy spot ── */
  spotLight = new THREE.SpotLight(0xffd700, 0, 60, Math.PI / 5, 0.4, 1.2);
  spotLight.position.set(0, 20, 4);
  spotLight.target.position.set(0, 0, 0);
  scene.add(spotLight);
  scene.add(spotLight.target);

  /* ── Glow (blue-ish underlight) ── */
  glowLight = new THREE.PointLight(0x4488ff, 0, 30);
  glowLight.position.set(0, -1, 2);
  scene.add(glowLight);

  /* ── Trophy mesh (procedural gold chalice) ── */
  _buildTrophy();

  /* ── Particle system ── */
  particles = new Particles(scene);

  /* ── Camera controller ── */
  cameraCtrl = new Camera(camera);

  /* ── Audio init ── */
  Audio.init();

  /* ── Skip: S key or triple-tap ── */
  let _tapCount = 0;
  window.addEventListener('keydown', e => {
    if(e.key === 's' || e.key === 'S') _fastForward();
  });
  window.addEventListener('pointerdown', () => {
    _tapCount++;
    setTimeout(() => _tapCount = 0, 500);
    if(_tapCount >= 3) _fastForward();
  }, { passive: true });

  /* ── Resize ── */
  window.addEventListener('resize', _onResize, { passive: true });

  /* ── Kick off ── */
  cameraCtrl.intro();
  _hideLoader();
  runTimeline();
  _animate();
}

/* ── Procedural trophy: lathe geometry chalice ── */
function _buildTrophy(){
  const pts = [
    new THREE.Vector2(0.0,  0.0),
    new THREE.Vector2(0.6,  0.1),
    new THREE.Vector2(0.8,  0.4),
    new THREE.Vector2(0.55, 0.8),
    new THREE.Vector2(0.25, 1.0),
    new THREE.Vector2(0.18, 1.6),
    new THREE.Vector2(0.32, 2.1),
    new THREE.Vector2(0.7,  2.6),
    new THREE.Vector2(1.0,  3.0),
    new THREE.Vector2(1.1,  3.4),
    new THREE.Vector2(1.0,  3.8),
    new THREE.Vector2(0.85, 4.2),
    new THREE.Vector2(1.05, 4.6),
    new THREE.Vector2(1.25, 5.0),
    new THREE.Vector2(1.2,  5.4),
    new THREE.Vector2(0.8,  5.5),
    new THREE.Vector2(0.6,  5.6),
  ];

  const geo = new THREE.LatheGeometry(pts, 48);
  const mat = new THREE.MeshStandardMaterial({
    color:     0xD4AF37,
    metalness: 0.95,
    roughness: 0.12,
    envMapIntensity: 1.4,
  });

  trophy = new THREE.Mesh(geo, mat);
  trophy.visible = false;
  trophy.scale.setScalar(0.55);
  trophy.position.set(0, 0.3, 0);
  scene.add(trophy);

  /* Base disc */
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.8, 0.18, 40),
    mat.clone()
  );
  base.position.y = -0.1;
  trophy.add(base);
}

/* ── Render loop ── */
function _animate(){
  requestAnimationFrame(_animate);
  particles.update();
  cameraCtrl.update();
  renderer.render(scene, camera);
}

/* ── Fast-forward to champion reveal ── */
function _fastForward(){
  try { Audio.playFanfare(); } catch(_){}
  UI.showChampion();
}

/* ── Hide loading overlay ── */
function _hideLoader(){
  const loader = document.getElementById('loadScreen');
  if(loader) gsap.to(loader, { opacity: 0, duration: 0.6, onComplete: () => loader.remove() });
}

/* ── Window resize ── */
function _onResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
