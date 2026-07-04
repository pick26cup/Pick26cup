import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";

export class AAACinematicEngine {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.loader = new GLTFLoader();

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  async loadScene(json) {
    this.sceneConfig = json;

    // Camera setup
    this.camera.position.set(...json.camera.start);

    // Lights
    if (json.lights) {
      json.lights.forEach(l => {
        if (l.type === "ambient") {
          this.scene.add(new THREE.AmbientLight(0xffffff, l.intensity));
        } else if (l.type === "directional") {
          const d = new THREE.DirectionalLight(0xffffff, l.intensity);
          d.position.set(5, 10, 5);
          this.scene.add(d);
        }
      });
    }

    // Load objects
    for (const obj of json.objects) {
      if (obj.type === "stadium") {
        const model = await this.loadGLB(obj.model);
        model.position.set(...obj.position);
        model.scale.setScalar(obj.scale);
        this.scene.add(model);
      }

      if (obj.type === "text") {
        const textMesh = this.createText(obj.value, obj.style);
        textMesh.position.set(...obj.position);
        this.scene.add(textMesh);
      }
    }

    this.runAnimations(json.animations);
  }

  loadGLB(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => resolve(gltf.scene),
        undefined,
        (err) => {
          console.warn("GLB no encontrado, usando placeholder:", path);
          resolve(new THREE.Group()); // fallback vacío
        }
      );
    });
  }

  createText(value, style = "gold_glow") {
    // Sprite billboard como placeholder (TextGeometry requiere font async)
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, 1024, 128);
    ctx.font = "bold 80px Oswald, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (style === "gold_glow") {
      ctx.shadowColor = "#d4af37";
      ctx.shadowBlur = 30;
      const grad = ctx.createLinearGradient(0, 0, 0, 128);
      grad.addColorStop(0, "#ffe066");
      grad.addColorStop(0.5, "#d4af37");
      grad.addColorStop(1, "#b8860b");
      ctx.fillStyle = grad;
    } else {
      ctx.shadowColor = "#aabbff";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#ffffff";
    }
    ctx.fillText(value, 512, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(8, 1, 1);
    return sprite;
  }

  runAnimations(anims) {
    anims.forEach(anim => {
      if (anim.target === "camera") {
        gsap.to(this.camera.position, {
          x: anim.to[0],
          y: anim.to[1],
          z: anim.to[2],
          duration: anim.duration,
          ease: anim.ease
        });
      }
    });
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.renderer.render(this.scene, this.camera);
  }
}
