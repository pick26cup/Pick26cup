import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class SceneLoader {
  constructor(scene) {
    this.scene = scene;
    this.objects = {};
    this.loader = new GLTFLoader();
  }

  async load(json) {
    for (const obj of json.objects) {
      if (obj.type === "stadium") {
        const model = await this.loadGLB(obj.model);
        model.position.set(...obj.position);
        model.scale.setScalar(obj.scale);
        this.scene.add(model);
        this.objects["stadium"] = model;
      }

      if (obj.type === "text") {
        const mesh = this.createText(obj.value, obj.style);
        mesh.position.set(...obj.position);
        this.scene.add(mesh);
        this.objects[obj.value] = mesh;
      }
    }
  }

  loadGLB(path) {
    return new Promise((resolve) => {
      this.loader.load(
        path,
        (gltf) => resolve(gltf.scene),
        undefined,
        () => {
          console.warn("GLB no encontrado:", path);
          resolve(new THREE.Group());
        }
      );
    });
  }

  createText(value, style = "gold_glow") {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1024, 128);
    ctx.font = "bold 80px Oswald, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (style === "gold_glow") {
      ctx.shadowColor = "#d4af37";
      ctx.shadowBlur = 30;
      const g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "#ffe066");
      g.addColorStop(0.5, "#d4af37");
      g.addColorStop(1, "#b8860b");
      ctx.fillStyle = g;
    } else {
      ctx.shadowColor = "#aabbff";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#ffffff";
    }
    ctx.fillText(value, 512, 64);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(8, 1, 1);
    return sprite;
  }
}
