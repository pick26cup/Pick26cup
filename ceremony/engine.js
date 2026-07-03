let scene, camera, renderer, particles, cameraCtrl;

function init() {
  try { _init(); } catch(e) {
    document.body.innerHTML = '<div style="color:gold;font:bold 20px Arial;text-align:center;padding:40px">'
      + 'Error loading ceremony:<br>' + e.message + '</div>';
    console.error('[Ceremony] init failed:', e);
  }
}

function _init() {
  /* ── Scene ── */
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  /* ── Camera ── */
  camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 10);

  /* ── Renderer ── */
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.getElementById('webgl').appendChild(renderer.domElement);

  /* ── Light ── */
  const light = new THREE.PointLight(0xffcc88, 2);
  light.position.set(5, 5, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x111122, 1.5));

  /* ── Systems ── */
  particles = new Particles(scene);
  cameraCtrl = new Camera(camera);

  /* ── Audio + start ── */
  Audio.init();
  Audio.play();

  /* ── UI ── */
  UI.init();

  /* ── Sequence ── */
  cameraCtrl.intro();
  runTimeline();

  /* ── Render loop ── */
  animate();
} /* end _init */

function animate() {
  requestAnimationFrame(animate);
  particles.update();
  cameraCtrl.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}, { passive: true });
