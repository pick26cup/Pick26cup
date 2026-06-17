'use strict';
/* SmartFin Certificates — achievement certificates with Canvas */

const CERTIFICATE_CONFIGS = {
  'A1': { title: 'English Foundations', level: 'A1 Beginner', color1: '#10B981', color2: '#059669', emoji: '🌱', xpRequired: 500 },
  'A2': { title: 'Elementary English', level: 'A2 Elementary', color1: '#3B82F6', color2: '#2563EB', emoji: '📘', xpRequired: 1500 },
  'B1': { title: 'Intermediate English', level: 'B1 Intermediate', color1: '#8B5CF6', color2: '#7C3AED', emoji: '📗', xpRequired: 4000 },
  'B2': { title: 'Upper-Intermediate', level: 'B2 Upper-Intermediate', color1: '#F59E0B', color2: '#D97706', emoji: '📙', xpRequired: 9000 },
  'C1': { title: 'Advanced English', level: 'C1 Advanced', color1: '#EF4444', color2: '#DC2626', emoji: '📕', xpRequired: 18000 },
  'C2': { title: 'English Mastery', level: 'C2 Proficiency', color1: '#06B6D4', color2: '#0891B2', emoji: '👑', xpRequired: 35000 }
};

function renderCertificatesPage() {
  const page = document.getElementById('page-certificates');
  if (!page || !window.state) return;
  const earned = window.state.certificates || [];
  const xp = window.state.xp || 0;

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🏆 Certificates</h1>
      <p class="page-subtitle">Earn official SmartFin AI English proficiency certificates</p>
    </div>
    <div class="certs-grid">
      ${Object.entries(CERTIFICATE_CONFIGS).map(([level, cfg]) => {
        const isEarned = earned.includes(level);
        const canEarn = xp >= cfg.xpRequired && !isEarned;
        const progress = Math.min(xp / cfg.xpRequired * 100, 100);
        return `
          <div class="cert-card ${isEarned ? 'earned' : ''}" onclick="${isEarned ? `previewCertificate('${level}')` : ''}">
            <div class="cert-level-badge" style="background:linear-gradient(135deg,${cfg.color1},${cfg.color2})">${cfg.emoji} ${level}</div>
            <h3 class="cert-title">${cfg.title}</h3>
            <div class="cert-level-name">${cfg.level}</div>
            <div class="cert-xp-requirement">⚡ ${cfg.xpRequired.toLocaleString()} XP required</div>
            ${isEarned
              ? `<div class="cert-earned-badge">✅ Earned!</div>
                 <button class="btn btn-primary cert-action" onclick="previewCertificate('${level}');event.stopPropagation()">View & Download</button>`
              : `<div class="cert-progress-bar"><div class="cert-progress-fill" style="width:${progress}%;background:linear-gradient(90deg,${cfg.color1},${cfg.color2})"></div></div>
                 <div class="cert-progress-text">${Math.round(progress)}% — ${Math.max(0, cfg.xpRequired - xp).toLocaleString()} XP to go</div>
                 ${canEarn ? `<button class="btn btn-primary cert-action" onclick="claimCertificate('${level}');event.stopPropagation()">Claim Certificate</button>` : ''}`
            }
          </div>`;
      }).join('')}
    </div>`;
}

function claimCertificate(level) {
  if (!window.state) return;
  const cfg = CERTIFICATE_CONFIGS[level];
  if (!cfg) return;
  if ((window.state.xp || 0) < cfg.xpRequired) {
    if (window.showToast) window.showToast(`Need ${cfg.xpRequired.toLocaleString()} XP to earn this certificate.`, 'warning');
    return;
  }
  if (!window.state.certificates) window.state.certificates = [];
  if (window.state.certificates.includes(level)) { previewCertificate(level); return; }
  window.state.certificates.push(level);
  if (window.saveState) window.saveState();
  if (window.showToast) window.showToast(`🎉 ${cfg.title} certificate earned!`, 'success');
  if (window.mascotReact) window.mascotReact('lesson_complete');
  if (window.earnCoins) window.earnCoins(100, 'certificate');
  renderCertificatesPage();
  previewCertificate(level);
}

function previewCertificate(level) {
  const cfg = CERTIFICATE_CONFIGS[level];
  if (!cfg || !window.state) return;
  const modal = document.getElementById('modal-certificate');
  if (!modal) {
    generateCertificateCanvas(level);
    return;
  }
  modal.style.display = 'flex';
  const canvasContainer = document.getElementById('cert-canvas-container');
  if (!canvasContainer) return;
  canvasContainer.innerHTML = '<canvas id="certCanvas" width="800" height="560"></canvas>';
  setTimeout(() => drawCertificate('certCanvas', level), 100);
}

function drawCertificate(canvasId, level) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cfg = CERTIFICATE_CONFIGS[level];
  const user = window.state ? (window.state.user || {}) : {};
  const name = user.name || 'Learner';
  const date = window.state ? (window.state.certificates ? new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '') : '';

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#050510');
  bgGrad.addColorStop(0.5, '#0a0a1a');
  bgGrad.addColorStop(1, '#050510');
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = cfg.color1; ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, W - 32, H - 32);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  // Corner decorations
  [[32,32],[W-32,32],[32,H-32],[W-32,H-32]].forEach(([x,y]) => {
    ctx.fillStyle = cfg.color1;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fill();
  });

  // Header accent line
  const lineGrad = ctx.createLinearGradient(60, 0, W-60, 0);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.5, cfg.color1);
  lineGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = lineGrad; ctx.fillRect(60, 90, W-120, 2);

  // Logo / Brand
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'bold 28px Space Grotesk, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🐬 SmartFin AI', W/2, 70);

  ctx.fillStyle = 'rgba(148,163,184,0.8)';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText('CERTIFICATE OF ENGLISH PROFICIENCY', W/2, 110);

  // Main title
  const titleGrad = ctx.createLinearGradient(W/2 - 200, 0, W/2 + 200, 0);
  titleGrad.addColorStop(0, cfg.color1);
  titleGrad.addColorStop(1, cfg.color2);
  ctx.fillStyle = titleGrad;
  ctx.font = 'bold 38px Space Grotesk, sans-serif';
  ctx.fillText(cfg.title, W/2, 175);

  // Award text
  ctx.fillStyle = 'rgba(226,232,240,0.7)';
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText('This certifies that', W/2, 220);

  // Recipient name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 46px Space Grotesk, sans-serif';
  ctx.fillText(name, W/2, 280);

  // Underline name
  const nameWidth = ctx.measureText(name).width;
  ctx.fillStyle = cfg.color1; ctx.fillRect(W/2 - nameWidth/2, 288, nameWidth, 2);

  ctx.fillStyle = 'rgba(226,232,240,0.7)';
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText('has successfully demonstrated English proficiency at the', W/2, 322);
  ctx.fillText('Common European Framework of Reference (CEFR) level', W/2, 344);

  // Level badge
  const badgeGrad = ctx.createLinearGradient(W/2-80, 360, W/2+80, 400);
  badgeGrad.addColorStop(0, cfg.color1);
  badgeGrad.addColorStop(1, cfg.color2);
  ctx.fillStyle = badgeGrad;
  ctx.beginPath();
  ctx.roundRect(W/2 - 90, 360, 180, 48, 12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Space Grotesk, sans-serif';
  ctx.fillText(`${cfg.emoji} ${cfg.level}`, W/2, 393);

  // Footer line
  ctx.fillStyle = lineGrad; ctx.fillRect(60, 450, W-120, 1);

  ctx.fillStyle = 'rgba(148,163,184,0.6)';
  ctx.font = '13px Inter, sans-serif';
  ctx.fillText(`Issued: ${date}`, W/2 - 160, 480);
  ctx.fillText('smartfin-ai.app', W/2 + 80, 480);
  ctx.fillText('Verified by SmartFin AI Engine', W/2, 510);

  // Seal
  drawSeal(ctx, W - 90, H - 90, 55, cfg.color1);
}

function drawSeal(ctx, cx, cy, r, color) {
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i / 12);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + (r+6)*Math.cos(a), cy + (r+6)*Math.sin(a), 5, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, 'rgba(139,92,246,0.8)'); g.addColorStop(1, 'rgba(59,130,246,0.4)');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('SMARTFIN', cx, cy - 8); ctx.fillText('CERTIFIED', cx, cy + 8);
}

function generateCertificateCanvas(level) {
  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 560;
  drawCertificate(null, level);
}

function downloadCertificate() {
  const canvas = document.getElementById('certCanvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'SmartFin-Certificate.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function checkCertificateEligibility() {
  if (!window.state) return;
  const xp = window.state.xp || 0;
  const earned = window.state.certificates || [];
  Object.entries(CERTIFICATE_CONFIGS).forEach(([level, cfg]) => {
    if (xp >= cfg.xpRequired && !earned.includes(level)) {
      if (window.showToast) window.showToast(`🎓 You've qualified for the ${cfg.title} certificate! Visit Certificates to claim it.`, 'success');
    }
  });
}
