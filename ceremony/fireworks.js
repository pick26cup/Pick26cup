/* ── fireworks.js ── Canvas 2D fireworks system ── */
(function(g){
  g.WC = g.WC || {};

  const Fireworks = {
    canvas: null, ctx: null,
    rockets: [], explosions: [],

    init(){
      this.canvas = WC.Utils.el('fireworksCanvas');
      this.ctx    = this.canvas.getContext('2d');
      this._resize();
      window.addEventListener('resize', ()=>this._resize());
    },

    _resize(){
      this.canvas.width  = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    launch(x){
      const W = window.innerWidth, H = window.innerHeight;
      const cx = x ?? WC.Utils.rand(W*.15, W*.85);
      const ty = WC.Utils.rand(H*.05, H*.38);
      const color = WC.Utils.pick(['#FFD700','#FF4136','#7FDBFF','#2ECC40','#FF69B4','#FF8C00','#FFFFFF','#DDA0DD']);
      this.rockets.push({ x:cx, y:H, targetY:ty,
        vx: WC.Utils.rand(-0.8,0.8), vy:-WC.Utils.rand(11,18),
        color, trail:[] });
      WC.Audio.playFirework();
    },

    _explode(x, y, color){
      const n = WC.Utils.randI(70,110);
      const sparks=[];
      for(let i=0;i<n;i++){
        const a=Math.PI*2*i/n + WC.Utils.rand(-0.08,0.08);
        const sp=WC.Utils.rand(2.5,9);
        sparks.push({ x, y,
          vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
          color, alpha:1, life:1,
          decay:WC.Utils.rand(0.013,0.026), grav:0.09,
          trail:[] });
      }
      this.explosions.push({ sparks });
      WC.Audio.playBoom(0.2);
    },

    /* Multiple rockets at once */
    burst(n=5){
      for(let i=0;i<n;i++) setTimeout(()=>this.launch(), i*180);
    },

    update(){
      const { ctx, canvas:cv } = this;
      ctx.clearRect(0,0,cv.width,cv.height);

      /* ── rockets ── */
      this.rockets = this.rockets.filter(r=>{
        r.trail.push({x:r.x,y:r.y});
        if(r.trail.length>10) r.trail.shift();
        r.vy += 0.35; r.x+=r.vx; r.y+=r.vy;

        r.trail.forEach((p,i)=>{
          const a=i/r.trail.length;
          ctx.beginPath(); ctx.arc(p.x,p.y,1.5*a,0,Math.PI*2);
          ctx.fillStyle=r.color; ctx.globalAlpha=a*0.55; ctx.fill();
        });
        ctx.globalAlpha=1;
        ctx.beginPath(); ctx.arc(r.x,r.y,2.5,0,Math.PI*2);
        ctx.fillStyle='#fff'; ctx.fill();

        if(r.y<=r.targetY || r.vy>=0){ this._explode(r.x,r.y,r.color); return false; }
        return true;
      });

      /* ── explosions ── */
      this.explosions = this.explosions.filter(exp=>{
        exp.sparks = exp.sparks.filter(s=>{
          s.trail.push({x:s.x,y:s.y});
          if(s.trail.length>6) s.trail.shift();
          s.vx*=0.967; s.vy+=s.grav; s.x+=s.vx; s.y+=s.vy;
          s.life-=s.decay; s.alpha=s.life;
          if(s.life<=0) return false;

          // trail
          s.trail.forEach((p,i)=>{
            ctx.beginPath(); ctx.arc(p.x,p.y,1.2,0,Math.PI*2);
            ctx.fillStyle=s.color; ctx.globalAlpha=(i/s.trail.length)*s.alpha*.4; ctx.fill();
          });
          // head
          ctx.beginPath(); ctx.arc(s.x,s.y,2.4,0,Math.PI*2);
          ctx.fillStyle='#fff'; ctx.globalAlpha=s.alpha*.9; ctx.fill();
          ctx.beginPath(); ctx.arc(s.x,s.y,1.8,0,Math.PI*2);
          ctx.fillStyle=s.color; ctx.globalAlpha=s.alpha; ctx.fill();
          ctx.globalAlpha=1;
          return true;
        });
        return exp.sparks.length>0;
      });
    },

    autoLaunch(interval=1800){
      this.launch();
      return setInterval(()=>this.launch(), interval);
    },

    clear(){
      this.rockets=[]; this.explosions=[];
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    },
  };

  g.WC.Fireworks = Fireworks;
})(window);
