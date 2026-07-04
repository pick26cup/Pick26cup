import { gsap } from "gsap";

export class AnimationController {
  constructor(camera, objects) {
    this.camera = camera;
    this.objects = objects;
    this.timeline = gsap.timeline();
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
}
