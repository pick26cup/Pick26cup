/* ── confetti.js ── Canvas 2D confetti system ── */
(function(g){
  g.WC = g.WC || {};

  const Confetti = {
    canvas: null, ctx: null,
    particles: [],

    init(){
      this.canvas = WC.Utils.el('confettiCanvas');
      this.ctx    = this.canvas.getContext('2d');
      this._resize();
      window.addEventListener('resize', ()=>this._resize());
    },

    _resize(){
      this.canvas.width  = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    /* Burst from a point */
    burst(x, y, count=100, spread=360){
      const cx = x ?? window.innerWidth*.5;
      const cy = y ?? window.innerHeight*.4;
      for(let i=0;i<count;i++){
        const angle = WC.Utils.rand(0, Math.PI * 2);
        const speed = WC.Utils.rand(4, 14);
        this.particles.push({
          x:cx, y:cy,
          vx: Math.cos(angle)*speed,
          vy: Math.sin(angle)*speed - WC.Utils.rand(2,7),
          color: WC.Utils.pick(WC.Utils.CONFETTI),
          w: WC.Utils.rand(7,15), h: WC.Utils.rand(4,9),
          rot: WC.Utils.rand(0, Math.PI*2),
          rs:  WC.Utils.rand(-0.18, 0.18),
          grav: WC.Utils.rand(0.12, 0.22),
          drag: WC.Utils.rand(0.97, 0.995),
          life: 1, decay: WC.Utils.rand(0.006, 0.012),
        });
      }
    },

    /* Gentle rain from top */
    rain(count=6){
      for(let i=0;i<count;i++){
        this.particles.push({
          x: WC.Utils.rand(0, window.innerWidth),
          y: -20,
          vx: WC.Utils.rand(-1.5, 1.5),
          vy: WC.Utils.rand(2, 5),
          color: WC.Utils.pick(WC.Utils.CONFETTI),
          w: WC.Utils.rand(7,14), h: WC.Utils.rand(4,9),
          rot: WC.Utils.rand(0, Math.PI*2),
          rs:  WC.Utils.rand(-0.08, 0.08),
          grav: 0.04, drag: 0.99,
          life: 1, decay: 0.002,
          _rain: true,
        });
      }
    },

    update(){
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      this.particles = this.particles.filter(p=>{
        p.vx *= p.drag; p.vy += p.grav;
        p.x  += p.vx;  p.y  += p.vy;
        p.rot += p.rs;
        p.life -= p.decay;
        if(p.life<=0 || p.y>this.canvas.height+60) return false;

        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
        return true;
      });
    },

    clear(){
      this.particles=[];
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    },
  };

  g.WC.Confetti = Confetti;
})(window);
