// Auto-update match results from football-data.org → Firebase
// Runs as a GitHub Action every 30 minutes during the World Cup

const fetch = require('node-fetch');
const admin = require('firebase-admin');

// ── Firebase init ────────────────────────────────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-world-cup-prediction-default-rtdb.firebaseio.com'
});
const db = admin.database();

// ── English → Spanish team name map ─────────────────────────
const TEAM_MAP = {
  'Mexico': 'México',
  'South Africa': 'Sudáfrica',
  'Korea Republic': 'Corea del Sur',
  'South Korea': 'Corea del Sur',
  'Czechia': 'República Checa',
  'Czech Republic': 'República Checa',
  'Canada': 'Canadá',
  'Bosnia and Herzegovina': 'Bosnia Herzegovina',
  'Bosnia & Herzegovina': 'Bosnia Herzegovina',
  'Bosnia-Herzegovina': 'Bosnia Herzegovina',
  'Bosnia Herzegovina': 'Bosnia Herzegovina',
  'United States': 'Estados Unidos',
  'USA': 'Estados Unidos',
  'Qatar': 'Qatar',
  'Switzerland': 'Suiza',
  'Brazil': 'Brasil',
  'Morocco': 'Marruecos',
  'Haiti': 'Haití',
  'Scotland': 'Escocia',
  'Australia': 'Australia',
  'Turkey': 'Turquía',
  'Türkiye': 'Turquía',
  'Germany': 'Alemania',
  'Curaçao': 'Curaçao',
  'Curacao': 'Curaçao',
  'Netherlands': 'Países Bajos',
  'Japan': 'Japón',
  "Côte d'Ivoire": 'Costa de Marfil',
  'Ivory Coast': 'Costa de Marfil',
  'Ecuador': 'Ecuador',
  'Sweden': 'Suecia',
  'Tunisia': 'Túnez',
  'Spain': 'España',
  'Cape Verde': 'Cabo Verde',
  'Cape Verde Islands': 'Cabo Verde',
  'Belgium': 'Bélgica',
  'Egypt': 'Egipto',
  'Saudi Arabia': 'Arabia Saudí',
  'Uruguay': 'Uruguay',
  'Iran': 'Irán',
  'IR Iran': 'Irán',
  'New Zealand': 'Nueva Zelanda',
  'France': 'Francia',
  'Senegal': 'Senegal',
  'Iraq': 'Iraq',
  'Norway': 'Noruega',
  'Argentina': 'Argentina',
  'Algeria': 'Argelia',
  'Austria': 'Austria',
  'Jordan': 'Jordania',
  'Portugal': 'Portugal',
  'DR Congo': 'Congo',
  'Congo DR': 'Congo',
  'Democratic Republic of Congo': 'Congo',
  'England': 'Inglaterra',
  'Croatia': 'Croacia',
  'Ghana': 'Ghana',
  'Panama': 'Panamá',
  'Uzbekistan': 'Uzbekistán',
  'Colombia': 'Colombia',
};

// ── Match data (rounds 1-3, group stage) ─────────────────────
const MATCHES = {
  1: [
    {id:'1_1',home:'México',away:'Sudáfrica'},
    {id:'1_2',home:'Corea del Sur',away:'República Checa'},
    {id:'1_3',home:'Canadá',away:'Bosnia Herzegovina'},
    {id:'1_4',home:'Estados Unidos',away:'Paraguay'},
    {id:'1_5',home:'Qatar',away:'Suiza'},
    {id:'1_6',home:'Brasil',away:'Marruecos'},
    {id:'1_7',home:'Haití',away:'Escocia'},
    {id:'1_8',home:'Australia',away:'Turquía'},
    {id:'1_9',home:'Alemania',away:'Curaçao'},
    {id:'1_10',home:'Países Bajos',away:'Japón'},
    {id:'1_11',home:'Costa de Marfil',away:'Ecuador'},
    {id:'1_12',home:'Suecia',away:'Túnez'},
    {id:'1_13',home:'España',away:'Cabo Verde'},
    {id:'1_14',home:'Bélgica',away:'Egipto'},
    {id:'1_15',home:'Arabia Saudí',away:'Uruguay'},
    {id:'1_16',home:'Irán',away:'Nueva Zelanda'},
    {id:'1_17',home:'Francia',away:'Senegal'},
    {id:'1_18',home:'Iraq',away:'Noruega'},
    {id:'1_19',home:'Argentina',away:'Argelia'},
    {id:'1_20',home:'Austria',away:'Jordania'},
    {id:'1_21',home:'Portugal',away:'Congo'},
    {id:'1_22',home:'Inglaterra',away:'Croacia'},
    {id:'1_23',home:'Ghana',away:'Panamá'},
    {id:'1_24',home:'Uzbekistán',away:'Colombia'},
  ],
  2: [
    {id:'2_1',home:'República Checa',away:'Sudáfrica'},
    {id:'2_2',home:'Suiza',away:'Bosnia Herzegovina'},
    {id:'2_3',home:'Canadá',away:'Qatar'},
    {id:'2_4',home:'México',away:'Corea del Sur'},
    {id:'2_5',home:'Estados Unidos',away:'Australia'},
    {id:'2_6',home:'Escocia',away:'Marruecos'},
    {id:'2_7',home:'Brasil',away:'Haití'},
    {id:'2_8',home:'Turquía',away:'Paraguay'},
    {id:'2_9',home:'Países Bajos',away:'Suecia'},
    {id:'2_10',home:'Alemania',away:'Costa de Marfil'},
    {id:'2_11',home:'Ecuador',away:'Curaçao'},
    {id:'2_12',home:'Túnez',away:'Japón'},
    {id:'2_13',home:'España',away:'Arabia Saudí'},
    {id:'2_14',home:'Bélgica',away:'Irán'},
    {id:'2_15',home:'Uruguay',away:'Cabo Verde'},
    {id:'2_16',home:'Nueva Zelanda',away:'Egipto'},
    {id:'2_17',home:'Argentina',away:'Austria'},
    {id:'2_18',home:'Francia',away:'Iraq'},
    {id:'2_19',home:'Noruega',away:'Senegal'},
    {id:'2_20',home:'Jordania',away:'Argelia'},
    {id:'2_21',home:'Portugal',away:'Uzbekistán'},
    {id:'2_22',home:'Inglaterra',away:'Ghana'},
    {id:'2_23',home:'Panamá',away:'Croacia'},
    {id:'2_24',home:'Colombia',away:'Congo'},
  ],
  3: [
    {id:'3_1',home:'Bosnia Herzegovina',away:'Qatar'},
    {id:'3_2',home:'Suiza',away:'Canadá'},
    {id:'3_3',home:'Marruecos',away:'Haití'},
    {id:'3_4',home:'Escocia',away:'Brasil'},
    {id:'3_5',home:'República Checa',away:'México'},
    {id:'3_6',home:'Sudáfrica',away:'Corea del Sur'},
    {id:'3_7',home:'Curaçao',away:'Costa de Marfil'},
    {id:'3_8',home:'Ecuador',away:'Alemania'},
    {id:'3_9',home:'Japón',away:'Suecia'},
    {id:'3_10',home:'Túnez',away:'Países Bajos'},
    {id:'3_11',home:'Australia',away:'Paraguay'},
    {id:'3_12',home:'Turquía',away:'Estados Unidos'},
    {id:'3_13',home:'Noruega',away:'Francia'},
    {id:'3_14',home:'Senegal',away:'Iraq'},
    {id:'3_15',home:'Cabo Verde',away:'Arabia Saudí'},
    {id:'3_16',home:'Uruguay',away:'España'},
    {id:'3_17',home:'Egipto',away:'Irán'},
    {id:'3_18',home:'Nueva Zelanda',away:'Bélgica'},
    {id:'3_19',home:'Croacia',away:'Ghana'},
    {id:'3_20',home:'Panamá',away:'Inglaterra'},
    {id:'3_21',home:'Portugal',away:'Colombia'},
    {id:'3_22',home:'Congo',away:'Uzbekistán'},
    {id:'3_23',home:'Argelia',away:'Austria'},
    {id:'3_24',home:'Jordania',away:'Argentina'},
  ],
};

// ── Helpers ──────────────────────────────────────────────────
function norm(name) {
  return (name || '').toLowerCase()
    .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e')
    .replace(/[íìï]/g,'i').replace(/[óòö]/g,'o')
    .replace(/[úùü]/g,'u').replace(/[ñ]/g,'n');
}

function findMatchId(homeEn, awayEn) {
  const homeEs = norm(TEAM_MAP[homeEn] || homeEn);
  const awayEs = norm(TEAM_MAP[awayEn] || awayEn);
  for (const round of [1,2,3]) {
    for (const m of (MATCHES[round] || [])) {
      if (norm(m.home) === homeEs && norm(m.away) === awayEs) return m.id;
    }
  }
  return null;
}

// ── Main ─────────────────────────────────────────────────────
async function run() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) { console.error('Missing FOOTBALL_DATA_API_KEY'); process.exit(1); }

  console.log('Fetching finished World Cup 2026 matches...');

  let matches = [];
  try {
    const res = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED&season=2026',
      { headers: { 'X-Auth-Token': apiKey }, timeout: 15000 }
    );
    if (!res.ok) {
      const txt = await res.text();
      console.warn(`API ${res.status}: ${txt} — skipping finished matches fetch`);
    } else {
      const data = await res.json();
      matches = data.matches || [];
      console.log(`API returned ${matches.length} finished match(es)`);
    }
  } catch (fetchErr) {
    console.warn(`Network error fetching finished matches: ${fetchErr.message} — skipping`);
  }

  let updated = 0;
  const notFound = [];

  for (const match of matches) {
    const scoreH = match.score?.fullTime?.home;
    const scoreA = match.score?.fullTime?.away;
    if (scoreH === null || scoreH === undefined || scoreA === null || scoreA === undefined) continue;

    const homeEn = match.homeTeam?.name || '';
    const awayEn = match.awayTeam?.name || '';
    const matchId = findMatchId(homeEn, awayEn);

    if (!matchId) {
      notFound.push(`${homeEn} vs ${awayEn}`);
      continue;
    }

    // Skip if already stored with same score
    const snap = await db.ref(`results/${matchId}`).once('value');
    const existing = snap.val();
    if (existing && existing.scoreH === scoreH && existing.scoreA === scoreA) continue;

    await db.ref(`results/${matchId}`).set({ scoreH, scoreA, updatedAt: Date.now() });
    updated++;
    console.log(`✅ ${matchId}: ${homeEn} ${scoreH}-${scoreA} ${awayEn}`);
  }

  if (notFound.length) console.log('⚠️  No ID found for:', notFound.join(' | '));
  console.log(`Finished. ${updated} result(s) updated.`);

  // ── Fetch IN_PLAY matches → write/clear liveScores/ ─────────────────────
  const rapidKey = process.env.RAPIDAPI_KEY;
  const liveMatchIds = new Set();

  if (rapidKey) {
    // ── API-Football (RapidAPI) — provides lineups + events on free tier ──
    console.log('Fetching live data from API-Football...');
    try {
      const RAPID_HOST = 'api-football-v1.p.rapidapi.com';
      const rapidHeaders = { 'X-RapidAPI-Key': rapidKey, 'X-RapidAPI-Host': RAPID_HOST };

      const liveRes = await fetch(
        'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all&league=1&season=2026',
        { headers: rapidHeaders }
      );

      if (liveRes.ok) {
        const liveData = await liveRes.json();
        const fixtures = liveData.response || [];
        console.log(`API-Football: ${fixtures.length} live fixture(s)`);

        for (const f of fixtures) {
          const homeEn = f.teams?.home?.name || '';
          const awayEn = f.teams?.away?.name || '';
          const matchId = findMatchId(homeEn, awayEn);
          if (!matchId) { console.log(`⚠️  No ID: ${homeEn} vs ${awayEn}`); continue; }

          const fixtureId = f.fixture?.id;
          const scoreH   = f.goals?.home ?? 0;
          const scoreA   = f.goals?.away ?? 0;
          const minute   = f.fixture?.status?.elapsed ?? null;
          const homeId   = f.teams?.home?.id;

          liveMatchIds.add(matchId);
          const payload = { scoreH, scoreA, homeEn, awayEn, updatedAt: Date.now() };
          if (minute !== null) payload.minute = minute;

          // Lineups
          try {
            const linRes = await fetch(
              `https://api-football-v1.p.rapidapi.com/v3/fixtures/lineups?fixture=${fixtureId}`,
              { headers: rapidHeaders }
            );
            if (linRes.ok) {
              const linData = await linRes.json();
              const lineups = linData.response || [];
              const homeL = lineups.find(l => l.team?.id === homeId) || lineups[0] || {};
              const awayL = lineups.find(l => l.team?.id !== homeId) || lineups[1] || {};
              payload.homeFormation = homeL.formation || '';
              payload.awayFormation = awayL.formation || '';
              payload.homeXI    = (homeL.startXI    || []).map(p => ({ n: p.player?.name || '', num: p.player?.number || '' }));
              payload.homeBench = (homeL.substitutes || []).map(p => ({ n: p.player?.name || '', num: p.player?.number || '' }));
              payload.awayXI    = (awayL.startXI    || []).map(p => ({ n: p.player?.name || '', num: p.player?.number || '' }));
              payload.awayBench = (awayL.substitutes || []).map(p => ({ n: p.player?.name || '', num: p.player?.number || '' }));
              console.log(`  📋 ${homeL.formation||'?'} vs ${awayL.formation||'?'} | ${(homeL.startXI||[]).length + (awayL.startXI||[]).length} players`);
            }
          } catch (e) { console.warn('  Lineup error:', e.message); }

          // Events (goals, cards, substitutions)
          try {
            const evRes = await fetch(
              `https://api-football-v1.p.rapidapi.com/v3/fixtures/events?fixture=${fixtureId}`,
              { headers: rapidHeaders }
            );
            if (evRes.ok) {
              const evData = await evRes.json();
              const events = [];
              for (const e of (evData.response || [])) {
                const side = e.team?.id === homeId ? 'h' : 'a';
                const min  = e.time?.elapsed ?? 0;
                if (e.type === 'Goal') {
                  events.push({ min, type: 'goal', side, player: e.player?.name || '' });
                } else if (e.type === 'Card') {
                  events.push({ min, type: e.detail === 'Red Card' ? 'red' : 'yellow', side, player: e.player?.name || '' });
                } else if (e.type === 'subst') {
                  events.push({ min, type: 'sub', side, out: e.player?.name || '', in: e.assist?.name || '' });
                }
              }
              events.sort((a, b) => (a.min || 0) - (b.min || 0));
              payload.events = events;
              console.log(`  📅 ${events.length} event(s)`);
            }
          } catch (e) { console.warn('  Events error:', e.message); }

          await db.ref(`liveScores/${matchId}`).set(payload);
          console.log(`⚽ LIVE ${matchId}: ${homeEn} ${scoreH}-${scoreA} ${awayEn}${minute ? ` (${minute}')` : ''}`);
        }
      } else {
        const txt = await liveRes.text();
        console.warn(`API-Football ${liveRes.status}: ${txt}`);
      }
    } catch (err) {
      console.warn('API-Football error:', err.message);
    }

  } else {
    // ── Fallback: football-data.org (score only, no lineups) ──────────────
    console.log('Fetching IN_PLAY World Cup 2026 matches (football-data.org)...');
    try {
      const liveRes = await fetch(
        'https://api.football-data.org/v4/competitions/WC/matches?status=IN_PLAY&season=2026',
        { headers: { 'X-Auth-Token': apiKey } }
      );
      if (liveRes.ok) {
        const liveData = await liveRes.json();
        const liveMatches = liveData.matches || [];
        console.log(`API returned ${liveMatches.length} live match(es)`);
        for (const match of liveMatches) {
          const homeEn = match.homeTeam?.name || '';
          const awayEn = match.awayTeam?.name || '';
          const matchId = findMatchId(homeEn, awayEn);
          if (!matchId) { console.log(`⚠️  No ID found: ${homeEn} vs ${awayEn}`); continue; }
          const s = match.score || {};
          const scoreH = s.fullTime?.home ?? s.halfTime?.home ?? 0;
          const scoreA = s.fullTime?.away ?? s.halfTime?.away ?? 0;
          const minute = match.minute ?? null;
          liveMatchIds.add(matchId);
          const payload = { scoreH, scoreA, homeEn, awayEn, updatedAt: Date.now() };
          if (minute !== null) payload.minute = minute;
          await db.ref(`liveScores/${matchId}`).set(payload);
          console.log(`⚽ LIVE ${matchId}: ${homeEn} ${scoreH}-${scoreA} ${awayEn}${minute ? ` (${minute}')` : ''}`);
        }
      }
    } catch (e) { console.warn('Live fetch error:', e.message); }
  }

  // Clear matches that are no longer IN_PLAY
  const liveSnap = await db.ref('liveScores').once('value');
  const existingLive = liveSnap.val() || {};
  for (const matchId of Object.keys(existingLive)) {
    if (!liveMatchIds.has(matchId)) {
      await db.ref(`liveScores/${matchId}`).remove();
      console.log(`🏁 Cleared live: ${matchId}`);
    }
  }

  // ── Fetch ALL matches → store utcDate in schedules/ (for narrator) ──────────
  console.log('Fetching match schedule...');
  try {
    const schedRes = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
      { headers: { 'X-Auth-Token': apiKey } }
    );
    if (schedRes.ok) {
      const schedData = await schedRes.json();
      const allMatches = schedData.matches || [];
      console.log(`Schedule: ${allMatches.length} match(es) found`);
      let schedUpdated = 0;
      for (const match of allMatches) {
        const utcDate = match.utcDate;
        if (!utcDate) continue;
        const homeEn = match.homeTeam?.name || '';
        const awayEn = match.awayTeam?.name || '';
        const matchId = findMatchId(homeEn, awayEn);
        if (!matchId) continue;
        const snap = await db.ref(`schedules/${matchId}`).once('value');
        if (snap.val()?.utcDate !== utcDate) {
          await db.ref(`schedules/${matchId}`).set({ utcDate });
          schedUpdated++;
        }
      }
      console.log(`Schedule: ${schedUpdated} entry(s) updated.`);
    } else {
      const txt = await schedRes.text();
      console.warn(`Schedule API ${schedRes.status}: ${txt}`);
    }
  } catch (schedErr) {
    console.warn('Schedule fetch error:', schedErr.message);
  }

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
