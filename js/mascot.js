'use strict';
/* SmartFin Mascot — animated dolphin companion */

window.SmartFinMascot = (function () {
  const MESSAGES = {
    idle: ["Keep going — you've got this!", "Every word learned is progress!", "SmartFin believes in you!", "Consistency is the key to fluency!"],
    correct: ["Excellent work! 🎉", "That's right! You're on fire!", "Perfect! Keep it up!", "Brilliant answer!"],
    wrong: ["Almost there — try again!", "No worries, mistakes help you learn!", "You'll get it next time!", "Learning takes practice — keep going!"],
    lesson_complete: ["Lesson complete! You're amazing!", "Another lesson conquered!", "SmartFin is so proud of you!", "Fantastic progress today!"],
    streak: ["Streak power! You're unstoppable!", "On a roll! Keep that streak alive!", "Daily dedication — respect!", "Your streak is legendary!"],
    level_up: ["LEVEL UP! You're incredible!", "A new level awaits you!", "You've leveled up — SmartFin celebrates!"]
  };

  let container, svg, bubble, bubbleText, currentState = 'idle', hideTimer;

  function init() {
    injectStyles();
    container = document.createElement('div');
    container.id = 'smartfin-mascot';
    container.innerHTML = buildSVG();
    container.title = 'Click me for motivation!';
    document.body.appendChild(container);
    svg = container.querySelector('svg');
    bubble = container.querySelector('.mascot-bubble');
    bubbleText = container.querySelector('.mascot-bubble-text');
    container.addEventListener('click', () => {
      const msgs = MESSAGES.idle;
      speak(msgs[Math.floor(Math.random() * msgs.length)]);
    });
    setState('idle');
  }

  function buildSVG() {
    return `
      <div class="mascot-bubble"><span class="mascot-bubble-text"></span></div>
      <svg width="90" height="80" viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dolphinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#06B6D4"/>
            <stop offset="100%" style="stop-color:#3B82F6"/>
          </linearGradient>
          <linearGradient id="dolphinBelly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#E0F7FF"/>
            <stop offset="100%" style="stop-color:#BAE6FD"/>
          </linearGradient>
        </defs>
        <!-- Body -->
        <ellipse cx="42" cy="45" rx="34" ry="18" fill="url(#dolphinGrad)"/>
        <!-- Belly -->
        <ellipse cx="42" cy="48" rx="22" ry="10" fill="url(#dolphinBelly)" opacity="0.7"/>
        <!-- Dorsal fin -->
        <path d="M38 27 L48 40 L32 40 Z" fill="url(#dolphinGrad)"/>
        <!-- Tail left -->
        <path d="M8 42 Q2 30 10 38" fill="url(#dolphinGrad)"/>
        <!-- Tail right -->
        <path d="M8 48 Q2 60 10 52" fill="url(#dolphinGrad)"/>
        <path d="M10 38 Q6 45 10 52" fill="url(#dolphinGrad)"/>
        <!-- Snout -->
        <ellipse cx="74" cy="45" rx="10" ry="6" fill="url(#dolphinGrad)"/>
        <!-- Eye -->
        <circle cx="66" cy="40" r="4" fill="white"/>
        <circle cx="67" cy="40" r="2.5" fill="#0F172A"/>
        <circle cx="68" cy="39" r="0.8" fill="white"/>
        <!-- Smile -->
        <path d="M68 46 Q73 50 78 46" stroke="#0F172A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <!-- Pectoral fin -->
        <path d="M50 50 Q55 62 42 58" fill="url(#dolphinGrad)" opacity="0.8"/>
      </svg>`;
  }

  function injectStyles() {
    if (document.getElementById('mascot-styles')) return;
    const s = document.createElement('style');
    s.id = 'mascot-styles';
    s.textContent = `
      #smartfin-mascot {
        position: fixed; bottom: 20px; right: 20px; z-index: 45;
        cursor: pointer; user-select: none; transition: transform 0.3s;
        filter: drop-shadow(0 4px 12px rgba(6,182,212,0.4));
      }
      #smartfin-mascot:hover { transform: scale(1.08); }
      .mascot-bubble {
        position: absolute; bottom: 85px; right: 5px;
        background: rgba(15,20,40,0.95); border: 1px solid rgba(6,182,212,0.5);
        border-radius: 16px 16px 4px 16px; padding: 10px 14px;
        max-width: 200px; min-width: 120px; opacity: 0;
        transform: translateY(8px) scale(0.9);
        transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        pointer-events: none; backdrop-filter: blur(8px);
      }
      .mascot-bubble.visible { opacity: 1; transform: translateY(0) scale(1); }
      .mascot-bubble-text { color: #e2e8f0; font-size: 12px; font-family: Inter, sans-serif; line-height: 1.4; }
      @keyframes mascotBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes mascotJump { 0%,100%{transform:translateY(0) scaleY(1)} 30%{transform:translateY(-25px) scaleY(1.1)} 60%{transform:translateY(-15px)} }
      @keyframes mascotSpin { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.2)} 100%{transform:rotate(360deg) scale(1)} }
      @keyframes mascotWiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-10deg)} 75%{transform:rotate(10deg)} }
      .mascot-idle svg { animation: mascotBob 2.5s ease-in-out infinite; }
      .mascot-happy svg { animation: mascotJump 0.8s ease-in-out; }
      .mascot-excited svg { animation: mascotSpin 0.6s ease-in-out; }
      .mascot-thinking svg { animation: mascotWiggle 0.5s ease-in-out 3; }
      .mascot-celebrating svg { animation: mascotJump 0.5s ease-in-out 3; }
      .mascot-hidden { display: none !important; }
    `;
    document.head.appendChild(s);
  }

  function setState(newState) {
    if (!container) return;
    container.className = 'mascot-' + newState;
    currentState = newState;
    if (newState !== 'idle') {
      setTimeout(() => setState('idle'), 2000);
    }
  }

  function speak(text) {
    if (!bubble || !bubbleText) return;
    bubbleText.textContent = text;
    bubble.classList.add('visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bubble.classList.remove('visible'), 4000);
  }

  function celebrate() {
    setState('celebrating');
    const msgs = MESSAGES.lesson_complete;
    speak(msgs[Math.floor(Math.random() * msgs.length)]);
    spawnConfetti();
  }

  function spawnConfetti() {
    const colors = ['#8B5CF6','#3B82F6','#06B6D4','#10B981','#F59E0B','#EF4444'];
    for (let i = 0; i < 18; i++) {
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;width:8px;height:8px;border-radius:2px;
        background:${colors[i%colors.length]};
        left:${Math.random()*100}vw;top:${Math.random()*60+20}vh;
        pointer-events:none;z-index:9999;
        animation:confettiFall 1.5s ease-out forwards;
        animation-delay:${Math.random()*0.5}s;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    }
    if (!document.getElementById('confetti-kf')) {
      const s = document.createElement('style');
      s.id = 'confetti-kf';
      s.textContent = '@keyframes confettiFall{0%{opacity:1;transform:translateY(0) rotate(0)}100%{opacity:0;transform:translateY(80px) rotate(360deg)}}';
      document.head.appendChild(s);
    }
  }

  function mascotReact(event) {
    if (!container) return;
    switch (event) {
      case 'correct': setState('happy'); speak(MESSAGES.correct[Math.floor(Math.random()*MESSAGES.correct.length)]); break;
      case 'wrong': setState('thinking'); speak(MESSAGES.wrong[Math.floor(Math.random()*MESSAGES.wrong.length)]); break;
      case 'lesson_complete': celebrate(); break;
      case 'streak': setState('excited'); speak(MESSAGES.streak[Math.floor(Math.random()*MESSAGES.streak.length)]); break;
      case 'level_up': celebrate(); speak(MESSAGES.level_up[Math.floor(Math.random()*MESSAGES.level_up.length)]); break;
    }
  }

  function mascotGreet() {
    if (!window.state) return;
    const level = window.state.level || 1;
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = `Good morning! Level ${level} — let's learn something new!`;
    else if (hour < 17) greeting = `Good afternoon! Ready for today's lesson?`;
    else greeting = `Good evening! Perfect time to practice English!`;
    setTimeout(() => speak(greeting), 800);
  }

  function hide() { if (container) container.classList.add('mascot-hidden'); }
  function show() { if (container) container.classList.remove('mascot-hidden'); }

  return { init, setState, speak, celebrate, hide, show, mascotReact, mascotGreet };
})();

function mascotReact(event) { if (window.SmartFinMascot) window.SmartFinMascot.mascotReact(event); }
function mascotGreet() { if (window.SmartFinMascot) window.SmartFinMascot.mascotGreet(); }
