function runTimeline() {
  const tl = gsap.timeline();

  /* ── Logo appears ── */
  tl.to('#logo', { opacity: 1, duration: 2, ease: 'power2.out' });
  tl.to({}, { duration: 1 });

  /* ── Stadium + fireworks ── */
  tl.call(() => {
    cameraCtrl.stadium();
    particles.showStadium();
    particles.spinStadium();
    _fwLoop = setInterval(() => particles.launchRandom(), 1800);
  });
  tl.to({}, { duration: 3 });

  /* ── Flash + confetti burst ── */
  tl.call(() => {
    clearInterval(_fwLoop);
    _flash();
    Audio.resume();
    Audio.playBoom(0.6);
    cameraCtrl.shake(0.6, 0.8);
    particles.showConfetti();
    for (let i = 0; i < 5; i++) setTimeout(() => particles.launchRandom(), i * 200);
    _fwLoop = setInterval(() => particles.launchRandom(), 1000);
  });
  tl.to({}, { duration: 2 });

  /* ── Trophy camera + fanfare ── */
  tl.call(() => {
    clearInterval(_fwLoop);
    cameraCtrl.trophy();
    Audio.playFanfare();
    Audio.playChord(0.35);
    _fwLoop = setInterval(() => particles.launchRandom(), 2500);
  });
  tl.to({}, { duration: 3 });

  /* ── Logo fades, name types in ── */
  tl.to('#logo', { opacity: 0, duration: 1 });
  tl.call(() => _typeName());
  tl.to({}, { duration: (champion.player.length * 120 + 800) / 1000 });

  /* ── Subtitle ── */
  tl.call(() => {
    Audio.playChord(0.18);
    document.getElementById('subtitle').textContent =
      champion.lang === 'es' ? 'CAMPEÓN DEL MUNDO' : 'CHAMPION OF THE WORLD';
  });
  tl.to('#subtitle', { opacity: 1, duration: 0.8 });
  tl.to({}, { duration: 1.2 });

  /* ── Country ── */
  tl.call(() => {
    document.getElementById('country').textContent = champion.flag + '  ' + champion.country;
  });
  tl.to('#country', { opacity: 1, duration: 0.8 });
  tl.to({}, { duration: 1 });

  /* ── Orbit + final fanfare ── */
  tl.call(() => {
    cameraCtrl.stopOrbit();
    cameraCtrl.orbit(8, 4);
    Audio.playFanfare();
    for (let i = 0; i < 4; i++) setTimeout(() => particles.launchRandom(), i * 300);
  });
  tl.to({}, { duration: 1.5 });

  /* ── Continue button ── */
  tl.to('#btn', { opacity: 1, duration: 1.2, ease: 'back.out(1.7)' });
  tl.call(() => {
    document.getElementById('btn').onclick = () => {
      clearInterval(_fwLoop);
      if (champion.onComplete) champion.onComplete();
      gsap.to('body', {
        opacity: 0, duration: 0.8,
        onComplete: () => { if (history.length > 1) history.back(); }
      });
    };
  });
}

/* ── White flash overlay ── */
function _flash() {
  const fl = document.createElement('div');
  fl.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:9999;pointer-events:none;opacity:0';
  document.body.appendChild(fl);
  gsap.to(fl, { opacity: 1, duration: 0.08, onComplete: () =>
    gsap.to(fl, { opacity: 0, duration: 0.4, onComplete: () => fl.remove() })
  });
}

/* ── Letter-by-letter name type-in ── */
function _typeName() {
  const el = document.getElementById('name');
  el.innerHTML = '';
  el.style.opacity = 1;
  let i = 0;
  const t = setInterval(() => {
    el.innerHTML += champion.player[i];
    i++;
    if (i >= champion.player.length) clearInterval(t);
  }, 120);
}

let _fwLoop = null;
