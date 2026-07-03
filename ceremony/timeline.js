/* ── timeline.js ── ceremony sequence ── */

async function runTimeline(){
  await wait(300);
  Audio.resume();
  Audio.playCrowd(0.4);
  await wait(600);

  Audio.speak('Ladies and gentlemen… welcome. Tonight, history is made.',{rate:.82,pitch:.94});
  await wait(2200);

  /* ── Logo phase ── */
  await _showLogo();
  await wait(1300);

  /* ── Stadium ── */
  await _showStadium();
  await wait(2400);

  /* ── Tunnel / approach ── */
  await _showTunnel();
  await wait(1700);

  /* ── Flash explosion ── */
  await _showExplosion();
  await wait(2600);

  /* ── Crowd surge ── */
  await _showCrowdSurge();
  await wait(3600);

  /* ── Trophy reveal ── */
  await _showTrophy();
  await wait(4000);

  /* ── Orbit + rain ── */
  await _showOrbit();
  await wait(2000);

  /* ── Champion reveal ── */
  await UI.showChampion();
}

/* ── Logo ── */
async function _showLogo(){
  const ph=document.getElementById('logoPhase');
  ph.style.display='flex'; ph.style.opacity=0;
  gsap.to(ph,{opacity:1,duration:1.8,ease:'power2.out'});
  await wait(350);
  gsap.from('#logoFifa',{y:-50,opacity:0,duration:1,ease:'back.out(1.7)'});
  await wait(160);
  gsap.from('#logoWC',{y:-50,opacity:0,duration:1,ease:'back.out(1.7)'});
  await wait(160);
  gsap.from('#logoYear',{scale:.3,opacity:0,duration:1.2,ease:'back.out(1.4)'});
  await wait(700);
  Audio.playChord(.14);
  particles.launchRandom();
}

/* ── Aerial stadium ── */
async function _showStadium(){
  gsap.to('#logoPhase',{opacity:0,duration:1.2});
  particles.showStadium();
  particles.spinStadium();
  cameraCtrl.aerial();
  scene.fog.density=0.006;
  _fwInterval=setInterval(()=>particles.launchRandom(),1800);
}

/* ── Tunnel ── */
async function _showTunnel(){
  clearInterval(_fwInterval);
  scene.fog.density=0.04;
  cameraCtrl.tunnel();
  Audio.playBoom(0.28);
  await wait(600);
  scene.fog.density=0.003;
}

/* ── White flash explosion ── */
async function _showExplosion(){
  const fl=document.createElement('div');
  fl.style.cssText='position:fixed;inset:0;background:#fff;z-index:9999;opacity:0;pointer-events:none';
  document.body.appendChild(fl);
  await new Promise(r=>gsap.to(fl,{opacity:1,duration:.1,onComplete:r}));
  Audio.playBoom(0.65);
  cameraCtrl.shake(0.7,.9);
  for(let i=0;i<4;i++) particles.launchRandom();
  particles.showConfetti();
  gsap.to(fl,{opacity:0,duration:.5,delay:.06,onComplete:()=>fl.remove()});
  scene.fog.density=0.004;
}

/* ── Crowd surge + fanfare ── */
async function _showCrowdSurge(){
  Audio.setCrowdVol(.55,1.5);
  Audio.playFanfare();
  for(let i=0;i<5;i++) setTimeout(()=>particles.launchRandom(),i*200);
  clearInterval(_fwInterval);
  _fwInterval=setInterval(()=>particles.launchRandom(),1000);
}

/* ── Trophy reveal ── */
async function _showTrophy(){
  clearInterval(_fwInterval);
  _fwInterval=setInterval(()=>particles.launchRandom(),2600);
  Audio.playChord(.42);
  Audio.playFanfare();
  cameraCtrl.shake(.35);
  cameraCtrl.trophy();
  if(trophy){
    trophy.visible=true; trophy.scale.setScalar(0); trophy.position.y=-3;
    gsap.to(trophy.scale,{x:.55,y:.55,z:.55,duration:2.2,ease:'back.out(1.5)'});
    gsap.to(trophy.position,{y:.3,duration:2.2,ease:'back.out(1.4)'});
    gsap.to(trophy.rotation,{y:Math.PI*2,duration:8,ease:'none',repeat:-1});
    if(spotLight) gsap.to(spotLight,{intensity:10,duration:1.8});
    if(glowLight) gsap.to(glowLight,{intensity:5,duration:2});
  }
  for(let i=0;i<4;i++) setTimeout(()=>particles.launchRandom(),i*300);
  setTimeout(()=>Audio.playFanfare(),700);
}

/* ── Orbit ── */
async function _showOrbit(){
  cameraCtrl.stopOrbit();
  cameraCtrl.orbit(10,5);
}

let _fwInterval=null;
