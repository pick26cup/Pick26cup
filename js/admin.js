'use strict';
/* SmartFin Admin Panel — Platform management & global analytics */

const ADMIN_PASSWORD = 'smartfin2026';

let adminAuthenticated = false;

// ─── SIMULATED PLATFORM DATA ─────────────────────────────────────────────────
function getSimulatedStats() {
  const seed = Date.now();
  const rand = (min, max) => Math.floor(min + (((seed * 9301 + 49297) % 233280) / 233280) * (max - min));
  return {
    totalUsers: 2841327,
    activeToday: 94822,
    activeThisWeek: 412093,
    newUsersToday: 3847,
    newUsersWeek: 21043,
    totalLessonsCompleted: 48291033,
    totalXPAwarded: 9234871200,
    totalCoinsCirculating: 42901882,
    avgSessionMin: 23,
    retentionDay1: 68,
    retentionDay7: 41,
    retentionDay30: 22,
    levelDistribution: { A1: 34, A2: 22, B1: 18, B2: 13, C1: 9, C2: 4 },
    topCountries: [
      { country: 'Brazil', flag: '🇧🇷', users: 412091 },
      { country: 'Mexico', flag: '🇲🇽', users: 389043 },
      { country: 'Colombia', flag: '🇨🇴', users: 271882 },
      { country: 'China', flag: '🇨🇳', users: 198034 },
      { country: 'India', flag: '🇮🇳', users: 176210 },
      { country: 'Germany', flag: '🇩🇪', users: 143092 },
      { country: 'Japan', flag: '🇯🇵', users: 112834 },
      { country: 'France', flag: '🇫🇷', users: 98203 }
    ],
    popularModules: [
      { name: 'AI Conversation', pct: 34 },
      { name: 'Lessons', pct: 28 },
      { name: 'Natural Learning', pct: 12 },
      { name: 'Mini-Games', pct: 11 },
      { name: 'Stories', pct: 8 },
      { name: 'Specializations', pct: 7 }
    ],
    recentUsers: [
      { name: 'Sofia Almeida', email: 's.almeida@mail.com', level: 'B2', joined: '2026-06-19', status: 'active' },
      { name: 'Jae-won Oh', email: 'jaewon@kmail.kr', level: 'A2', joined: '2026-06-19', status: 'active' },
      { name: 'Marco Bianchi', email: 'mbianchi@it.net', level: 'C1', joined: '2026-06-18', status: 'active' },
      { name: 'Priya Nair', email: 'p.nair@india.in', level: 'B1', joined: '2026-06-18', status: 'inactive' },
      { name: 'Ahmed El-Sayed', email: 'ahmed.e@arab.eg', level: 'A1', joined: '2026-06-17', status: 'active' }
    ],
    revenueToday: 4821,
    revenueMonth: 138042,
    revenueYear: 1492033,
    premiumUsers: 94821,
    premiumConversionPct: 3.3
  };
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function renderAdminPage() {
  const page = document.getElementById('page-admin');
  if (!page) return;

  if (!adminAuthenticated) {
    renderAdminLogin(page);
    return;
  }
  renderAdminDashboard(page);
}

function renderAdminLogin(page) {
  page.innerHTML = `
    <div class="admin-login-screen">
      <div class="admin-login-card">
        <div class="admin-login-icon">🛡️</div>
        <h2 class="admin-login-title">Admin Access</h2>
        <p class="admin-login-sub">SmartFin AI Platform Console</p>
        <div class="form-group">
          <input type="password" class="form-control" id="adminPwdInput"
            placeholder="Enter admin password" onkeydown="if(event.key==='Enter')adminLogin()">
        </div>
        <button class="btn btn-primary btn-full" onclick="adminLogin()">🔐 Access Console</button>
        <p style="font-size:11px;color:var(--text-muted);margin-top:12px;text-align:center">Demo password: <code style="color:var(--accent-cyan)">smartfin2026</code></p>
      </div>
    </div>`;
}

function adminLogin() {
  const input = document.getElementById('adminPwdInput');
  if (!input) return;
  if (input.value === ADMIN_PASSWORD) {
    adminAuthenticated = true;
    renderAdminDashboard(document.getElementById('page-admin'));
  } else {
    if (window.showToast) showToast('Incorrect password', 'error');
    input.value = ''; input.focus();
  }
}

function renderAdminDashboard(page) {
  const stats = getSimulatedStats();
  const tabs = ['overview','users','content','revenue','system'];
  const activeTab = window._adminTab || 'overview';

  page.innerHTML = `
    <div class="admin-header">
      <div>
        <h1 class="page-title">🛡️ Admin Console</h1>
        <p class="page-subtitle">SmartFin AI Platform — Live Dashboard</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="admin-live-badge">🟢 LIVE</div>
        <button class="btn btn-secondary btn-sm" onclick="adminAuthenticated=false;renderAdminPage()">Log Out</button>
      </div>
    </div>

    <div class="admin-tabs">
      ${tabs.map(t => `<button class="admin-tab ${t===activeTab?'active':''}" onclick="window._adminTab='${t}';renderAdminDashboard(document.getElementById('page-admin'))">${{overview:'📊 Overview',users:'👥 Users',content:'📚 Content',revenue:'💰 Revenue',system:'⚙️ System'}[t]}</button>`).join('')}
    </div>

    <div class="admin-content">
      ${activeTab === 'overview' ? renderAdminOverview(stats) : ''}
      ${activeTab === 'users' ? renderAdminUsers(stats) : ''}
      ${activeTab === 'content' ? renderAdminContent() : ''}
      ${activeTab === 'revenue' ? renderAdminRevenue(stats) : ''}
      ${activeTab === 'system' ? renderAdminSystem() : ''}
    </div>`;

  if (activeTab === 'overview') {
    requestAnimationFrame(() => drawAdminCharts(stats));
  }
}

function renderAdminOverview(s) {
  return `
    <div class="admin-kpi-grid">
      ${[
        { label: 'Total Users', value: s.totalUsers.toLocaleString(), icon: '👥', color: '#8B5CF6', trend: '+'+s.newUsersToday.toLocaleString()+' today' },
        { label: 'Active Today', value: s.activeToday.toLocaleString(), icon: '🟢', color: '#10B981', trend: s.retentionDay1+'% day-1 retention' },
        { label: 'Lessons Completed', value: (s.totalLessonsCompleted/1e6).toFixed(1)+'M', icon: '📚', color: '#3B82F6', trend: 'All time' },
        { label: 'XP Awarded', value: (s.totalXPAwarded/1e9).toFixed(2)+'B', icon: '⚡', color: '#F59E0B', trend: 'Total platform XP' }
      ].map(k => `
        <div class="admin-kpi-card" style="border-left-color:${k.color}">
          <div class="kpi-icon">${k.icon}</div>
          <div class="kpi-value" style="color:${k.color}">${k.value}</div>
          <div class="kpi-label">${k.label}</div>
          <div class="kpi-trend">${k.trend}</div>
        </div>`).join('')}
    </div>

    <div class="admin-charts-row">
      <div class="admin-chart-card">
        <div class="admin-chart-title">Daily Active Users (last 30 days)</div>
        <canvas id="adminDAUChart" width="500" height="160"></canvas>
      </div>
      <div class="admin-chart-card">
        <div class="admin-chart-title">Module Usage</div>
        <canvas id="adminModuleChart" width="300" height="200"></canvas>
      </div>
    </div>

    <div class="admin-charts-row">
      <div class="admin-chart-card">
        <div class="admin-chart-title">Level Distribution</div>
        <canvas id="adminLevelChart" width="400" height="160"></canvas>
      </div>
      <div class="admin-chart-card">
        <div class="admin-chart-title">Top Countries</div>
        <div class="admin-countries">
          ${s.topCountries.map(c => `
            <div class="admin-country-row">
              <span class="country-flag">${c.flag}</span>
              <span class="country-name">${c.country}</span>
              <div class="country-bar-wrap">
                <div class="country-bar" style="width:${Math.round(c.users/s.topCountries[0].users*100)}%;background:linear-gradient(90deg,#8B5CF6,#3B82F6)"></div>
              </div>
              <span class="country-users">${(c.users/1000).toFixed(0)}K</span>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="admin-retention">
      <div class="admin-chart-title">User Retention</div>
      <div class="retention-bars">
        ${[['Day 1', s.retentionDay1], ['Day 7', s.retentionDay7], ['Day 30', s.retentionDay30]].map(([label, pct]) => `
          <div class="retention-item">
            <div class="retention-label">${label}</div>
            <div class="retention-bar-wrap">
              <div class="retention-bar" style="width:${pct}%;background:${pct>50?'#10B981':pct>30?'#F59E0B':'#EF4444'}"></div>
            </div>
            <div class="retention-pct">${pct}%</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderAdminUsers(s) {
  return `
    <div class="admin-users-header">
      <div class="admin-user-stats">
        <div class="admin-mini-kpi"><span>Total</span><b>${s.totalUsers.toLocaleString()}</b></div>
        <div class="admin-mini-kpi"><span>Premium</span><b style="color:#F59E0B">${s.premiumUsers.toLocaleString()}</b></div>
        <div class="admin-mini-kpi"><span>Conversion</span><b style="color:#10B981">${s.premiumConversionPct}%</b></div>
        <div class="admin-mini-kpi"><span>New Today</span><b style="color:#8B5CF6">+${s.newUsersToday.toLocaleString()}</b></div>
      </div>
      <div style="display:flex;gap:10px">
        <input type="text" class="form-control" placeholder="Search users..." style="max-width:240px">
        <button class="btn btn-secondary btn-sm">Filter</button>
        <button class="btn btn-primary btn-sm">Export CSV</button>
      </div>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>User</th><th>Level</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${s.recentUsers.map(u => `
            <tr>
              <td><div class="table-user"><div class="table-avatar">${u.name[0]}</div><div><div class="table-name">${u.name}</div><div class="table-email">${u.email}</div></div></div></td>
              <td><span class="level-pill">${u.level}</span></td>
              <td><span class="date-pill">${u.joined}</span></td>
              <td><span class="status-pill ${u.status}">${u.status}</span></td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="adminViewUser('${u.email}')">View</button>
                <button class="btn btn-sm" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)" onclick="adminSuspendUser('${u.email}')">Suspend</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="admin-table-note">Showing 5 of ${s.totalUsers.toLocaleString()} users. Connect backend to show all.</div>`;
}

function renderAdminContent() {
  const content = [
    { type: 'Lesson', title: 'Past Perfect in Context', level: 'B2', module: 'Grammar', status: 'published', plays: 94823 },
    { type: 'Story', title: 'Airport Adventure', level: 'A2', module: 'Stories', status: 'published', plays: 41023 },
    { type: 'Story', title: 'Job Interview', level: 'B1', module: 'Stories', status: 'published', plays: 38211 },
    { type: 'Speech', title: 'Martin Luther King Jr.', level: 'C1', module: 'Masters', status: 'published', plays: 22094 },
    { type: 'Game', title: 'Speed Quiz', level: 'All', module: 'Mini-Games', status: 'published', plays: 187033 },
    { type: 'Track', title: 'Aviation English ICAO', level: 'B2+', module: 'Specializations', status: 'published', plays: 9823 }
  ];
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div class="admin-chart-title">Content Library</div>
      <button class="btn btn-primary btn-sm" onclick="if(window.showToast)showToast('Content editor coming soon!','info')">+ New Content</button>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Type</th><th>Title</th><th>Level</th><th>Module</th><th>Status</th><th>Plays</th><th>Actions</th></tr></thead>
        <tbody>
          ${content.map(c => `
            <tr>
              <td><span class="content-type-badge">${c.type}</span></td>
              <td style="font-weight:500;color:var(--text-primary)">${c.title}</td>
              <td><span class="level-pill">${c.level}</span></td>
              <td style="color:var(--text-muted)">${c.module}</td>
              <td><span class="status-pill active">${c.status}</span></td>
              <td style="color:var(--accent-purple-light);font-weight:600">${c.plays.toLocaleString()}</td>
              <td><button class="btn btn-secondary btn-sm">Edit</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderAdminRevenue(s) {
  return `
    <div class="admin-kpi-grid">
      ${[
        { label: 'Revenue Today', value: '$'+s.revenueToday.toLocaleString(), icon: '💵', color: '#10B981' },
        { label: 'Revenue This Month', value: '$'+s.revenueMonth.toLocaleString(), icon: '📈', color: '#3B82F6' },
        { label: 'Revenue This Year', value: '$'+s.revenueYear.toLocaleString(), icon: '🏦', color: '#8B5CF6' },
        { label: 'Premium Users', value: s.premiumUsers.toLocaleString(), icon: '👑', color: '#F59E0B' }
      ].map(k => `
        <div class="admin-kpi-card" style="border-left-color:${k.color}">
          <div class="kpi-icon">${k.icon}</div>
          <div class="kpi-value" style="color:${k.color}">${k.value}</div>
          <div class="kpi-label">${k.label}</div>
        </div>`).join('')}
    </div>
    <div class="admin-chart-card" style="margin-top:16px">
      <div class="admin-chart-title">Monthly Revenue (last 12 months)</div>
      <canvas id="adminRevenueChart" width="700" height="180"></canvas>
    </div>`;
}

function renderAdminSystem() {
  const health = [
    { name: 'API Server', status: 'healthy', latency: '42ms', uptime: '99.98%' },
    { name: 'OpenAI Integration', status: 'healthy', latency: '320ms', uptime: '99.91%' },
    { name: 'Speech Recognition', status: 'healthy', latency: '180ms', uptime: '99.87%' },
    { name: 'CDN / Assets', status: 'healthy', latency: '18ms', uptime: '100%' },
    { name: 'Database', status: 'healthy', latency: '8ms', uptime: '99.99%' },
    { name: 'Service Worker', status: 'healthy', latency: '—', uptime: '100%' }
  ];
  return `
    <div class="admin-system">
      <div class="admin-chart-title" style="margin-bottom:16px">System Health</div>
      <div class="system-health-grid">
        ${health.map(h => `
          <div class="system-health-card">
            <div class="health-dot ${h.status}"></div>
            <div class="health-info">
              <div class="health-name">${h.name}</div>
              <div class="health-meta">${h.latency} · ${h.uptime} uptime</div>
            </div>
            <div class="health-status ${h.status}">${h.status}</div>
          </div>`).join('')}
      </div>
      <div class="admin-system-actions" style="margin-top:24px">
        <div class="admin-chart-title" style="margin-bottom:12px">System Actions</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-secondary" onclick="if(window.showToast)showToast('Cache cleared successfully','success')">🗑️ Clear Cache</button>
          <button class="btn btn-secondary" onclick="if(window.showToast)showToast('Service worker updated','success')">🔄 Update Service Worker</button>
          <button class="btn btn-secondary" onclick="if(window.showToast)showToast('Backup created: smartfin-2026-06-19.json','success')">💾 Export State Backup</button>
          <button class="btn btn-secondary" onclick="adminShowLogs()">📋 View Logs</button>
        </div>
      </div>
      <div id="adminLogs" style="display:none;margin-top:16px">
        <div class="admin-log-box">
          <div class="log-entry info">[2026-06-19 14:32:01] INFO: User session started — Level B2</div>
          <div class="log-entry info">[2026-06-19 14:31:55] INFO: Lesson completed — Grammar B1 (+40 XP)</div>
          <div class="log-entry warn">[2026-06-19 14:28:12] WARN: OpenAI API rate limit approaching (80%)</div>
          <div class="log-entry info">[2026-06-19 14:20:03] INFO: Service Worker updated to v1.0.1</div>
          <div class="log-entry info">[2026-06-19 14:10:44] INFO: Tournament week reset — new bracket generated</div>
          <div class="log-entry error">[2026-06-19 13:58:22] ERROR: Speech recognition unavailable in Firefox (fallback used)</div>
        </div>
      </div>
    </div>`;
}

// ─── CHARTS ──────────────────────────────────────────────────────────────────
function drawAdminCharts(stats) {
  drawDAUChart(stats);
  drawModuleChart(stats);
  drawLevelChart(stats);
}

function drawDAUChart(stats) {
  const canvas = document.getElementById('adminDAUChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const padL = 40, padB = 25, padT = 10;

  // Generate 30-day simulated DAU
  const data = Array.from({length:30}, (_,i) => {
    const base = stats.activeToday;
    const wave = Math.sin(i * 0.4) * base * 0.15;
    const noise = (Math.random() - 0.5) * base * 0.1;
    return Math.round(base + wave + noise);
  });
  const maxVal = Math.max(...data);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.fillRect(0,0,W,H);

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padT + (H-padT-padB)/4 * i;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W-5, y); ctx.stroke();
    ctx.fillStyle = 'rgba(148,163,184,0.5)'; ctx.font = '9px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(((maxVal*(4-i)/4)/1000).toFixed(0)+'K', padL-4, y+3);
  }

  // Area fill
  const pts = data.map((v,i) => ({
    x: padL + i/(data.length-1) * (W-padL-5),
    y: padT + (1 - v/maxVal) * (H-padT-padB)
  }));
  ctx.beginPath();
  ctx.moveTo(pts[0].x, H-padB);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length-1].x, H-padB);
  ctx.closePath();
  const g = ctx.createLinearGradient(0,padT,0,H-padB);
  g.addColorStop(0,'rgba(139,92,246,0.4)'); g.addColorStop(1,'rgba(139,92,246,0.02)');
  ctx.fillStyle = g; ctx.fill();

  // Line
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i=1;i<pts.length;i++) {
    const cp = {x:(pts[i-1].x+pts[i].x)/2, y:(pts[i-1].y+pts[i].y)/2};
    ctx.quadraticCurveTo(pts[i-1].x,pts[i-1].y,cp.x,cp.y);
  }
  ctx.strokeStyle='#8B5CF6'; ctx.lineWidth=2; ctx.stroke();
}

function drawModuleChart(stats) {
  const canvas = document.getElementById('adminModuleChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2 - 10, r = Math.min(W,H)*0.35;
  const colors = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EC4899','#06B6D4'];
  ctx.clearRect(0,0,W,H);
  let start = -Math.PI/2;
  stats.popularModules.forEach((m,i) => {
    const slice = (m.pct/100)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,start,start+slice); ctx.closePath();
    ctx.fillStyle = colors[i]; ctx.fill();
    ctx.strokeStyle = 'rgba(5,5,16,0.8)'; ctx.lineWidth = 2; ctx.stroke();
    const mid = start + slice/2;
    const lx = cx + (r*0.65)*Math.cos(mid), ly = cy + (r*0.65)*Math.sin(mid);
    if (m.pct >= 8) {
      ctx.fillStyle='#fff'; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(m.pct+'%', lx, ly);
    }
    start += slice;
  });
  // Legend
  stats.popularModules.forEach((m,i) => {
    const lx = 10, ly = H - stats.popularModules.length*14 + i*14;
    ctx.fillStyle=colors[i]; ctx.fillRect(lx,ly-5,10,10);
    ctx.fillStyle='rgba(148,163,184,0.8)'; ctx.font='9px Inter'; ctx.textAlign='left';
    ctx.fillText(m.name.slice(0,20), lx+14, ly+2);
  });
}

function drawLevelChart(stats) {
  const canvas = document.getElementById('adminLevelChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const levels = Object.entries(stats.levelDistribution);
  const padL = 35, padB = 25, padT = 10;
  const barW = (W-padL-10) / levels.length;
  const colors = ['#10B981','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#06B6D4'];
  ctx.clearRect(0,0,W,H);
  const maxPct = Math.max(...levels.map(([,v])=>v));
  levels.forEach(([level, pct], i) => {
    const bh = (pct/maxPct)*(H-padT-padB);
    const bx = padL + i*barW + barW*0.1;
    const by = H-padB-bh;
    const bw = barW*0.8;
    const g = ctx.createLinearGradient(0,by,0,H-padB);
    g.addColorStop(0,colors[i]); g.addColorStop(1,colors[i]+'44');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.roundRect(bx,by,bw,bh,4); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='bold 11px Inter'; ctx.textAlign='center';
    ctx.fillText(pct+'%', bx+bw/2, by-5);
    ctx.fillStyle='rgba(148,163,184,0.7)'; ctx.font='11px Inter';
    ctx.fillText(level, bx+bw/2, H-8);
  });
}

// ─── ACTIONS ─────────────────────────────────────────────────────────────────
function adminViewUser(email) {
  if (window.showToast) showToast(`Viewing user: ${email}`, 'info');
}
function adminSuspendUser(email) {
  if (window.showToast) showToast(`User ${email} suspended`, 'warning');
}
function adminShowLogs() {
  const logs = document.getElementById('adminLogs');
  if (logs) logs.style.display = logs.style.display === 'none' ? 'block' : 'none';
}
