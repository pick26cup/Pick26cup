import * as THREE from 'three';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }      from 'three/addons/postprocessing/OutputPass.js';
import { Q } from '../config/config.js';

export let renderer, composer;

export function initRenderer(scene, camera) {
  renderer = new THREE.WebGLRenderer({
    antialias: Q.bloom,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setPixelRatio(Q.px);
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.getElementById('canvas-wrap').appendChild(renderer.domElement);

  if (Q.bloom) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(innerWidth, innerHeight),
      1.6,  // strength  — more = brighter halos
      0.45, // radius    — spread of glow
      0.18  // threshold — what luminance starts glowing
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }
}

export function renderFrame(scene, camera) {
  if (composer) composer.render();
  else renderer.render(scene, camera);
}

export function onResize(camera) {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  if (composer) composer.setSize(innerWidth, innerHeight);
}
