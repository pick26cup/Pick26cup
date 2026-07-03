import * as THREE from 'three';
import gsap from 'gsap';
import { initRenderer, renderFrame, onResize } from './renderer/renderer.js';
import { camera, initCamera, tickCamera }       from './camera/camera.js';
import { initScene }                            from './scene/scene.js';
import { initAudio }                            from './audio/audio.js';
import { initOverlay, getStartScreen }          from './ui/overlay.js';
import { updateConfetti, confetti }             from './effects/particles.js';
import { goldDust, updateGoldDust }             from './effects/particles.js';
import { updateFireworks, setFireworkScene }    from './effects/fireworks.js';
import { startCeremony }                        from './animation/timeline.js';

// ─── BOOT ────────────────────────────────────────────────────────────────────
const _scene = initScene();
initCamera();
initRenderer(_scene, camera);
initOverlay();
setFireworkScene(_scene);

_scene.add(confetti);
_scene.add(goldDust);

window.addEventListener('resize', () => onResize(camera));

// ─── RENDER LOOP ─────────────────────────────────────────────────────────────
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt  = Math.min((now - lastTime) / 1000, 0.05);
  lastTime  = now;

  tickCamera(dt);
  updateConfetti();
  updateGoldDust();
  updateFireworks();
  renderFrame(_scene, camera);
}
animate();

// ─── START SCREEN ─────────────────────────────────────────────────────────────
const startScreen = getStartScreen();

function _launch() {
  initAudio();
  startScreen.style.pointerEvents = 'none';
  gsap.to(startScreen, {
    opacity: 0, duration: 1.2, ease: 'power2.in',
    onComplete: () => {
      startScreen.style.display = 'none';
      startCeremony();
    },
  });
}

document.addEventListener('click', function _once(e) {
  const btn = e.target.closest('#start-btn, #start-screen');
  if (!btn) return;
  document.removeEventListener('click', _once);
  _launch();
});
