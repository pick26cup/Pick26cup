/* ── fireworks.js ── HD fireworks: rockets · glow · 5 burst types ── */
(function(g){
  g.WC = g.WC || {};

  const R = (a,b) => WC.Utils.rand(a,b);
  const COLORS = [
    '#FFD700','#FFF176','#FF6B35','#FF3366',
    '#00E5FF','#76FF03','#E040FB','#FF9100',
    '#FFFFFF','#FFB300','#F44336','#40C4FF',
    '#FFEB3B','#FF4081','#69F0AE','#FF6D00',
  ];

  const Fireworks = {
    canvas:null, ctx:null,
    W:0, H:0,
    rockets:[], particles:[],

    init(){
      this.canvas = WC.Utils.el('fireworksCanvas');
      if(!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this._resize();
      window.addEventListener('resize', ()=>this._resize());
    },

    _resize(){
      this.W = window.innerWidth;
      this.H = window.innerHeight;
      if(this.canvas){ this.canvas.width=this.W; this.canvas.height=this.H; }
    },

    _color(){ return WC.Utils.pick(COLORS); },

    launch(x){
      if(!this.ctx) return;
      WC.Audio.playFirework();
      this.rockets.push({
        x: x ?? R(this.W*.1, this.W*.9),
        y: this.H + 10,
        vx: R(-1.5,1.5),
        vy: -R(16,24),
        color: this._color(),
        trail:[],
      });
    },

    burst(n=5){
      if(!this.ctx) return;
      for(let i=0;i<n;i++) setTimeout(()=>this.launch(), i*150);
    },

    _explode(x, y, color){
      const m = WC.Utils.isMobile();
      const TYPES = ['peony','chrysanthemum','willow','star','ring'];
      const type = WC.Utils.pick(TYPES);
      const count = WC.Utils.randI(m?50:90, m?90:160);

      for(let i=0;i<count;i++){
        const angle = (i/count)*Math.PI*2 + R(-0.08,0.08);
        let sp=R(2,8), grav=0.065, life=R(55,95), trailLen=5;

        if(type==='willow'){   sp=R(1,6); grav=0.16; life=R(80,150); trailLen=9; }
        else if(type==='chrysanthemum'){ sp=R(3,11); grav=0.03; trailLen=7; }
        else if(type==='star'){ sp = i%5===0 ? R(7,14) : R(0.8,2.2); life=R(50,75); }
        else if(type==='ring'){ sp=R(4.6,5.6); grav=0.02; life=R(40,60); }

        const useGold = Math.random()>.38;
        const c = useGold ? (Math.random()>.5?'#FFD700':'#FFF176') : color;

        this.particles.push({
          x, y,
          vx:Math.cos(angle)*sp, vy:Math.sin(angle)*sp,
          grav, life, maxLife:life,
          color:c, size:R(1.5,3.5),
          trail:[], trailLen,
          twinkle:Math.random()>.55, phase:Math.random()*Math.PI*2,
        });
      }

      /* White flash at center */
      const fc = m?8:18;
      for(let i=0;i<fc;i++){
        const a=Math.random()*Math.PI*2, sp=R(10,24);
        this.particles.push({
          x, y,
          vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
          grav:0.12, life:18, maxLife:18,
          color:'#FFFFFF', size:R(1,2),
          trail:[], trailLen:2,
          twinkle:false, phase:0,
        });
      }

      WC.Audio.playBoom(0.16);
    },

    update(){
      if(!this.ctx) return;
      const ctx=this.ctx, W=this.W, H=this.H;
      ctx.clearRect(0,0,W,H); /* keep canvas transparent — WebGL visible behind */

      /* ── Rockets ── */
      for(let i=this.rockets.length-1;i>=0;i--){
        const r=this.rockets[i];
        r.trail.push({x:r.x,y:r.y});
        if(r.trail.length>14) r.trail.shift();
        r.vy+=0.44; r.x+=r.vx; r.y+=r.vy;

        /* trail */
        for(let ti=0;ti<r.trail.length;ti++){
          const pt=r.trail[ti], a=(ti/r.trail.length);
          ctx.globalAlpha=a*0.65;
          ctx.beginPath(); ctx.arc(pt.x,pt.y,a*2.8,0,Math.PI*2);
          ctx.fillStyle=r.color; ctx.fill();
        }
        /* glow halo */
        ctx.globalAlpha=0.22;
        ctx.beginPath(); ctx.arc(r.x,r.y,9,0,Math.PI*2);
        ctx.fillStyle='#FFD700'; ctx.fill();
        /* bright core */
        ctx.globalAlpha=1;
        ctx.beginPath(); ctx.arc(r.x,r.y,2.5,0,Math.PI*2);
        ctx.fillStyle='#FFFFFF'; ctx.fill();

        if(r.vy>=0){ this._explode(r.x,r.y,r.color); this.rockets.splice(i,1); }
      }

      /* cap particles */
      const CAP = WC.Utils.isMobile()?240:560;
      if(this.particles.length>CAP) this.particles.splice(0,this.particles.length-CAP);

      /* ── Particles ── */
      for(let i=this.particles.length-1;i>=0;i--){
        const p=this.particles[i];
        p.trail.push({x:p.x,y:p.y});
        if(p.trail.length>p.trailLen) p.trail.shift();
        p.x+=p.vx; p.y+=p.vy;
        p.vy+=p.grav; p.vx*=0.968; p.vy*=0.976;
        p.life--;
        if(p.life<=0){ this.particles.splice(i,1); continue; }

        const t=p.life/p.maxLife;
        let alpha=t;
        if(p.twinkle){ p.phase+=0.28; alpha=t*(0.4+0.6*Math.abs(Math.sin(p.phase))); }

        /* trail lines */
        for(let ti=0;ti<p.trail.length-1;ti++){
          const ta=(ti/p.trail.length)*alpha*0.4;
          ctx.globalAlpha=ta;
          ctx.beginPath();
          ctx.moveTo(p.trail[ti].x,p.trail[ti].y);
          ctx.lineTo(p.trail[ti+1].x,p.trail[ti+1].y);
          ctx.strokeStyle=p.color; ctx.lineWidth=p.size*0.8*t; ctx.stroke();
        }

        /* outer glow ring */
        ctx.globalAlpha=alpha*0.28;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*3*t,0,Math.PI*2);
        ctx.fillStyle=p.color; ctx.fill();

        /* mid ring */
        ctx.globalAlpha=alpha*0.55;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*1.6*t,0,Math.PI*2);
        ctx.fillStyle=p.color; ctx.fill();

        /* bright core */
        ctx.globalAlpha=alpha;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*t,0,Math.PI*2);
        ctx.fillStyle=alpha>0.45?'#FFFFFF':p.color; ctx.fill();

        ctx.globalAlpha=1;
      }
    },

    clear(){
      this.rockets=[]; this.particles=[];
      if(this.ctx) this.ctx.clearRect(0,0,this.W,this.H);
    },
  };

  g.WC.Fireworks = Fireworks;
})(window);
