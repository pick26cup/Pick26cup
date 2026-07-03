/* ── confetti.js ── HD multi-shape confetti: 6 types · 3-D flip · glitter ── */
(function(g){
  g.WC = g.WC || {};

  const R = (a,b) => WC.Utils.rand(a,b);
  const COLORS = [
    '#FFD700','#FFF176','#FFB300','#FFFFFF',
    '#FF6B35','#FF3366','#00E5FF','#76FF03',
    '#C0C0C0','#E040FB','#FF9100','#69F0AE',
    '#FF4081','#40C4FF','#FFEB3B','#D4AF37',
  ];
  const SHAPES = ['rect','circle','star','ribbon','triangle','square'];

  const Confetti = {
    canvas:null, ctx:null,
    W:0, H:0,
    pieces:[],

    init(){
      this.canvas = WC.Utils.el('confettiCanvas');
      if(!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this._resize();
      window.addEventListener('resize',()=>this._resize());
    },

    _resize(){
      this.W=window.innerWidth; this.H=window.innerHeight;
      if(this.canvas){ this.canvas.width=this.W; this.canvas.height=this.H; }
    },

    _make(x,y,vx,vy){
      return {
        x,y,vx,vy,
        rot: Math.random()*Math.PI*2,
        rotV: R(-0.18,0.18),
        wobble: Math.random()*Math.PI*2,
        wobbleV: R(0.04,0.14),
        w: R(7,18), h: R(4,12),
        color: WC.Utils.pick(COLORS),
        shape: WC.Utils.pick(SHAPES),
        grav: R(0.12,0.22),
        wind: R(-0.05,0.05),
        drag: R(0.97,0.995),
        alpha: 1,
        glitter: Math.random()>.65,
        gPhase: Math.random()*Math.PI*2,
      };
    },

    burst(x,y,count=100){
      if(!this.ctx) return;
      const n = WC.Utils.isMobile() ? Math.floor(count*.55) : count;
      for(let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2, sp=R(3,18);
        this.pieces.push(this._make(
          x??this.W*.5, y??this.H*.4,
          Math.cos(a)*sp, Math.sin(a)*sp - R(2,10)
        ));
      }
    },

    rain(count=10){
      if(!this.ctx) return;
      for(let i=0;i<count;i++){
        const p=this._make(Math.random()*this.W, -20, R(-1.5,1.5), R(2,5));
        p.grav=0.04; p.drag=0.99;
        this.pieces.push(p);
      }
    },

    _star(ctx,r){
      ctx.beginPath();
      for(let i=0;i<5;i++){
        const a=(i*Math.PI*2/5)-Math.PI/2, oa=a+Math.PI/5;
        i===0 ? ctx.moveTo(r*Math.cos(a),r*Math.sin(a))
              : ctx.lineTo(r*Math.cos(a),r*Math.sin(a));
        ctx.lineTo(r*.38*Math.cos(oa),r*.38*Math.sin(oa));
      }
      ctx.closePath();
    },

    _tri(ctx,r){
      ctx.beginPath();
      for(let i=0;i<3;i++){
        const a=(i*Math.PI*2/3)-Math.PI/2;
        i===0 ? ctx.moveTo(r*Math.cos(a),r*Math.sin(a))
              : ctx.lineTo(r*Math.cos(a),r*Math.sin(a));
      }
      ctx.closePath();
    },

    update(){
      if(!this.ctx) return;
      const ctx=this.ctx;
      ctx.clearRect(0,0,this.W,this.H);

      const CAP = WC.Utils.isMobile()?240:500;
      if(this.pieces.length>CAP) this.pieces.splice(0,this.pieces.length-CAP);

      for(let i=this.pieces.length-1;i>=0;i--){
        const p=this.pieces[i];
        p.x+=p.vx; p.y+=p.vy;
        p.vy+=p.grav; p.vx+=p.wind;
        p.vx*=p.drag; p.vy*=p.drag;
        p.rot+=p.rotV; p.wobble+=p.wobbleV;

        if(p.y>this.H+40){ this.pieces.splice(i,1); continue; }
        if(p.y>this.H-60) p.alpha=Math.max(0,p.alpha-0.025);

        let a=p.alpha;
        if(p.glitter){ p.gPhase+=0.18; a=p.alpha*(0.3+0.7*Math.abs(Math.sin(p.gPhase))); }

        ctx.save();
        ctx.globalAlpha=a;
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.wobble)); /* 3-D flip illusion */

        ctx.fillStyle=p.color;
        ctx.strokeStyle=p.color;
        ctx.lineWidth=2.5;

        switch(p.shape){
          case 'rect':
            ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
            break;
          case 'square':{ const s=p.w*.75; ctx.fillRect(-s/2,-s/2,s,s); break; }
          case 'circle':
            ctx.beginPath(); ctx.arc(0,0,p.w/2,0,Math.PI*2); ctx.fill();
            break;
          case 'star':
            this._star(ctx,p.w/2); ctx.fill();
            break;
          case 'triangle':
            this._tri(ctx,p.w/2); ctx.fill();
            break;
          case 'ribbon':
            ctx.beginPath();
            ctx.moveTo(-p.w/2,-p.h/2);
            ctx.bezierCurveTo(-p.w/4,p.h/2, p.w/4,-p.h/2, p.w/2,p.h/2);
            ctx.stroke();
            break;
        }
        ctx.restore();
      }
    },

    clear(){
      this.pieces=[];
      if(this.ctx) this.ctx.clearRect(0,0,this.W,this.H);
    },
  };

  g.WC.Confetti = Confetti;
})(window);
