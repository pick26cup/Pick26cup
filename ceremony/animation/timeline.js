import gsap from 'gsap';
import { CHAMPION, TOP10, STATS, ROUNDS } from '../config/config.js';
import { camera, moves, startDrift, stopDrift } from '../camera/camera.js';
import { scene, lights, mats, objects, trophyGroup } from '../scene/scene.js';
import { confetti, confMat, showConfetti, goldDust, showGoldDust, hideGoldDust } from '../effects/particles.js';
import { launchFirework, startBurst, stopBurst, megaBurst } from '../effects/fireworks.js';
import {
  startCrowd, swellCrowd, quietCrowd, stopCrowd,
  playFanfare, playApplause, playBoom, playShimmer, playSilenceDrop, playOrchHit,
} from '../audio/audio.js';
import {
  showRound, showStat, showTop10,
  buildChampionLetters, revealChampion, hideChampion,
} from '../ui/overlay.js';

// ─── MASTER SEQUENCE ─────────────────────────────────────────────────────────
export function startCeremony() {
  const tl = gsap.timeline();

  // ── Phase 0: GRAND ENTRANCE (0s) ─────────────────────────────────────────
  moves.grandEntrance();
  startCrowd(0.18);

  tl.call(() => {
    // Crowd lights up slowly
    gsap.to(mats.crowd, { opacity: 0.88, duration: 3.5, ease: 'power2.out' });
    // Lasers flicker on one by one
    objects.lasers.forEach((l, i) => {
      gsap.to(l.material, { opacity: 0.28 + Math.random()*0.28, duration: .6, delay: i*0.15, ease:'power2.out' });
    });
  })

  // ── Phase 1: STATISTICS (6s) ───────────────────────────────────────────
  .call(() => {
    moves.wide();
    swellCrowd(0.38, 2.5);
    STATS.forEach((stat, i) => {
      setTimeout(() => showStat(stat.label, stat.value), i * 3600);
    });
  }, [], 6)

  // ── Phase 2: ROUND FLASHBACK (18s) ────────────────────────────────────
  .call(() => {
    moves.orbitStadium();
    ROUNDS.forEach((r, i) => {
      setTimeout(() => showRound(r), i * 1400);
    });
  }, [], 18)

  // ── Phase 3: TOP 10 REVEAL (29s) ──────────────────────────────────────
  .call(() => {
    moves.top10();
    swellCrowd(0.52, 2.0);
    const entries = [...TOP10].sort((a,b) => a.rank - b.rank); // rank 10 → rank 1
    showTop10(entries, null);

    // Each entry gets individual spotlight/applause
    entries.forEach((_, i) => {
      setTimeout(() => {
        playApplause(0.3 + i * 0.03);
        // Light pulse on the key light
        gsap.fromTo(lights.key, { intensity: 0 }, { intensity: 4 + i * 0.4, duration: .3, yoyo:true, repeat:1 });
      }, i * 400);
    });
  }, [], 29)

  // ── Phase 4: BLACKOUT (44s) ───────────────────────────────────────────
  .call(() => {
    stopDrift();
    moves.revealDark();
    playSilenceDrop();
    swellCrowd(0.04, 2.5);

    // Kill crowd lights / lasers
    gsap.to(mats.crowd, { opacity: 0, duration: 2.5, ease: 'power2.in' });
    objects.lasers.forEach(l => gsap.to(l.material, { opacity: 0, duration: 1.8 }));
    gsap.to(mats.stageGlow, { opacity: 0, duration: 1.5 });

    // Tiny key light beats like a heartbeat
    gsap.to(lights.key, { intensity: 1.2, duration: .5, yoyo:true, repeat:5, ease:'sine.inOut' });
  }, [], 44)

  // ── Phase 5: TROPHY RISE (50s) ────────────────────────────────────────
  .call(() => {
    trophyGroup.visible = true;
    trophyGroup.position.y = -4;
    moves.trophyApproach();

    // Spotlight on
    gsap.to(lights.spot, { intensity: 220, duration: 1.8, ease: 'power2.out', delay: 0.5 });
    gsap.to(lights.key,  { intensity: 18,  duration: 2.4, ease: 'power2.out', delay: 0.5 });
    gsap.to(lights.trophy, { intensity: 6, duration: 2.0, ease: 'power2.out', delay: 0.8 });
    gsap.to(mats.stageGlow, { opacity: 0.22, duration: 2.5, delay: 0.6 });
    swellCrowd(0.24, 2.5);

    // Trophy rises from below
    gsap.to(trophyGroup.position, { y: 0.14, duration: 2.5, ease: 'power3.out', delay: 0.4 });
    playFanfare();

    // After rise: gentle float yoyo
    setTimeout(() => {
      gsap.to(trophyGroup.position, { y: 0.38, duration: 2.8, ease: 'sine.inOut', yoyo:true, repeat:-1 });
      gsap.to(trophyGroup.rotation, { y: Math.PI * 2, duration: 18, ease: 'none', repeat:-1 });
    }, 3200);
  }, [], 50)

  // ── Phase 6: TROPHY CLOSE SHOT (57s) ─────────────────────────────────
  .call(() => {
    moves.trophyClose();
    swellCrowd(0.42, 2.0);
    startBurst(0.5);
    setTimeout(() => playBoom(), 400);
    setTimeout(() => playBoom(), 1100);
  }, [], 57)

  // ── Phase 7: CHAMPION REVEAL (66s) ───────────────────────────────────
  .call(() => {
    stopBurst();
    moves.revealDark();
    quietCrowd(0.02, 2.0);

    // Build letter spans
    buildChampionLetters();

    setTimeout(() => {
      showGoldDust();
      playShimmer();
      revealChampion(
        // onNameDone
        () => {
          playOrchHit();
          swellCrowd(0.75, 1.5);
          megaBurst();
          showConfetti();
          gsap.to(lights.key,  { intensity: 40, duration: 1.0, ease:'power2.out' });
          gsap.to(lights.spot, { intensity: 380, duration: 1.0, ease:'power2.out' });
          gsap.to(mats.stageGlow, { opacity: 0.55, duration: 1.2 });
          objects.lasers.forEach((l, i) => gsap.to(l.material, {
            opacity: 0.55, duration:.4, delay:i*0.07, ease:'power2.out',
          }));
        },
        // onComplete (full card shown)
        null,
      );
    }, 1800);
  }, [], 66)

  // ── Phase 8: FINAL GLORY (88s) ───────────────────────────────────────
  .call(() => {
    moves.finalGlory();
    startBurst(2.5);
    swellCrowd(0.9, 3.0);

    // Lights max out
    gsap.to(lights.key,    { intensity: 60, duration: 2.5, ease:'power2.out' });
    gsap.to(lights.spot,   { intensity: 480, duration: 2.0 });
    gsap.to(lights.trophy, { intensity: 12, duration: 2.5 });

    // Extra boom hits
    [400, 900, 1600, 2400].forEach(d => setTimeout(() => playBoom(), d));
  }, [], 88);
}
