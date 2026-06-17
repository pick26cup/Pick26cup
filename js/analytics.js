'use strict';
/* SmartFin Analytics — Progress charts and insights */

function renderAnalyticsPage() {
  const page = document.getElementById('page-analytics');
  if (!page || !window.state) return;
  const s = window.state;

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">📊 Analytics</h1>
      <p class="page-subtitle">Track your learning progress over time</p>
    </div>

    <div class="analytics-summary">
      <div class="analytics-stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value">${s.lessonsCompleted || 0}</div>
        <div class="stat-label">Lessons</div>
      </div>
      <div class="analytics-stat-card">
        <div class="stat-icon">📖</div>
        <div class="stat-value">${s.vocabularyLearned || 0}</div>
        <div class="stat-label">Words</div>
      </div>
      <div class="analytics-stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">${s.streak || 0}</div>
        <div class="stat-label">Streak</div>
      </div>
      <div class="analytics-stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-value">${s.xp || 0}</div>
        <div class="stat-label">Total XP</div>
      </div>
    </div>

    <div class="analytics-charts">
      <div class="chart-card">
        <h3 class="chart-title">Weekly Activity</h3>
        <canvas id="weeklyChart" width="500" height="160"></canvas>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">Skill Breakdown</h3>
        <canvas id="skillsRadar" width="300" height="300"></canvas>
      </div>
      <div class="chart-card full-width">
        <h3 class="chart-title">Activity Heatmap (Last 30 Days)</h3>
        <div id="activityHeatmap"></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">XP Progress</h3>
        <canvas id="xpProgress" width="500" height="160"></canvas>
      </div>
    </div>`;

  requestAnimationFrame(() => {
    drawWeeklyChart();
    drawSkillsRadar();
    drawActivityHeatmap();
    drawXPProgress();
  });
}

function drawWeeklyChart() {
  const canvas = document.getElementById('weeklyChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const activity = window.state ? (window.state.weekActivity || [0,0,0,0,0,0,0]) : [0,0,0,0,0,0,0];
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const maxVal = Math.max(...activity, 1);
  const barW = (W - 60) / 7;
  const padL = 40, padB = 30, padT = 20;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i <= 4; i++) {
    const y = padT + ((H - padT - padB) / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W-10, y); ctx.stroke();
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.font = '10px Inter';
    ctx.fillText(Math.round(maxVal * (4-i) / 4), 2, y + 4);
  }

  // Bars
  const today = new Date().getDay();
  activity.forEach((val, i) => {
    const x = padL + i * barW + barW * 0.1;
    const h = (val / maxVal) * (H - padT - padB);
    const y = H - padB - h;
    const isToday = (i + 1) % 7 === today % 7;
    const grad = ctx.createLinearGradient(0, y, 0, H - padB);
    grad.addColorStop(0, isToday ? '#8B5CF6' : '#3B82F6');
    grad.addColorStop(1, isToday ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.3)');
    ctx.fillStyle = grad;
    const bw = barW * 0.8;
    roundRect(ctx, x, y, bw, h, 4);
    ctx.fill();
    ctx.fillStyle = isToday ? '#e2e8f0' : '#94a3b8';
    ctx.font = `${isToday ? '600' : '400'} 11px Inter`;
    ctx.textAlign = 'center';
    ctx.fillText(days[i], x + bw/2, H - 8);
  });
}

function drawSkillsRadar() {
  const canvas = document.getElementById('skillsRadar');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, radius = Math.min(W,H)*0.38;

  const skills = window.state ? (window.state.skills || {}) : {};
  const labels = ['Reading','Writing','Listening','Speaking','Grammar','Vocabulary'];
  const values = labels.map(l => (skills[l.toLowerCase()] || 0) / 100);

  ctx.clearRect(0, 0, W, H);

  // Background polygons
  for (let ring = 1; ring <= 5; ring++) {
    const r = radius * ring / 5;
    ctx.beginPath();
    labels.forEach((_, i) => {
      const angle = (Math.PI * 2 * i / labels.length) - Math.PI/2;
      const px = cx + r * Math.cos(angle), py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.stroke();
  }

  // Axis lines
  labels.forEach((_, i) => {
    const angle = (Math.PI * 2 * i / labels.length) - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.stroke();
  });

  // Data polygon
  ctx.beginPath();
  labels.forEach((_, i) => {
    const angle = (Math.PI * 2 * i / labels.length) - Math.PI/2;
    const r = radius * (values[i] || 0.05);
    const px = cx + r * Math.cos(angle), py = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, 'rgba(139,92,246,0.6)');
  grad.addColorStop(1, 'rgba(59,130,246,0.2)');
  ctx.fillStyle = grad; ctx.fill();
  ctx.strokeStyle = '#8B5CF6'; ctx.lineWidth = 2; ctx.stroke();

  // Labels
  labels.forEach((label, i) => {
    const angle = (Math.PI * 2 * i / labels.length) - Math.PI/2;
    const r = radius + 20;
    const px = cx + r * Math.cos(angle), py = cy + r * Math.sin(angle);
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, px, py);
  });
}

function drawActivityHeatmap() {
  const container = document.getElementById('activityHeatmap');
  if (!container) return;
  const heatmap = window.state ? (window.state.activityHeatmap || {}) : {};
  const days = 30;
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    const val = heatmap[key] || 0;
    cells.push({ key, val, label: key.slice(5) });
  }

  container.innerHTML = `
    <div class="heatmap-grid">
      ${cells.map(c => {
        const intensity = Math.min(c.val / 5, 1);
        const alpha = 0.1 + intensity * 0.9;
        return `<div class="heatmap-cell" title="${c.label}: ${c.val} lessons"
          style="background:rgba(139,92,246,${alpha})">
          <span class="heatmap-label">${c.label}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="heatmap-legend">
      <span>Less</span>
      ${[0.1,0.3,0.5,0.7,0.9].map(a => `<div class="heatmap-cell" style="background:rgba(139,92,246,${a});width:16px;height:16px"></div>`).join('')}
      <span>More</span>
    </div>`;
}

function drawXPProgress() {
  const canvas = document.getElementById('xpProgress');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const totalXP = window.state ? (window.state.xp || 0) : 0;
  const xpData = generateXPHistory(totalXP);
  const maxXP = Math.max(...xpData, 1);
  const padL = 45, padB = 30, padT = 20;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.fillRect(0,0,W,H);

  const points = xpData.map((v, i) => ({
    x: padL + (i / (xpData.length - 1)) * (W - padL - 10),
    y: padT + (1 - v / maxXP) * (H - padT - padB)
  }));

  // Fill under line
  ctx.beginPath();
  ctx.moveTo(points[0].x, H - padB);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length-1].x, H - padB);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
  grad.addColorStop(0, 'rgba(139,92,246,0.5)');
  grad.addColorStop(1, 'rgba(139,92,246,0.02)');
  ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const cp = { x: (points[i-1].x + points[i].x)/2, y: (points[i-1].y + points[i].y)/2 };
    ctx.quadraticCurveTo(points[i-1].x, points[i-1].y, cp.x, cp.y);
  }
  ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
  ctx.strokeStyle = '#8B5CF6'; ctx.lineWidth = 2.5; ctx.stroke();

  // Labels
  ['7d ago','6d','5d','4d','3d','2d','Yesterday','Today'].forEach((label, i) => {
    const x = padL + (i / 7) * (W - padL - 10);
    ctx.fillStyle = 'rgba(148,163,184,0.7)'; ctx.font = '10px Inter';
    ctx.textAlign = 'center'; ctx.fillText(label, x, H - 8);
  });
}

function generateXPHistory(totalXP) {
  const data = [];
  let running = Math.max(0, totalXP - 300);
  for (let i = 0; i < 8; i++) {
    data.push(running);
    running += Math.floor(Math.random() * 50 + 20);
  }
  data[data.length - 1] = totalXP;
  return data;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function updateActivityHeatmap() {
  if (!window.state) return;
  if (!window.state.activityHeatmap) window.state.activityHeatmap = {};
  const today = new Date().toISOString().slice(0, 10);
  window.state.activityHeatmap[today] = (window.state.activityHeatmap[today] || 0) + 1;
  if (window.saveState) window.saveState();
}
