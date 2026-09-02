const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');
const app = express();
require('dotenv').config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ---- Password gate + token metering ------------------------------------
// Two modes, chosen by ANON_ACCESS:
//   'blocked' (default) — the whole site needs the password. No-password
//                         visitors are redirected to /login and can't reach
//                         anything. The token counter still runs (all usage
//                         lands under "password holders") so you can watch
//                         spend at /usage.
//   'metered'           — the site is public; visitors without the password
//                         share ONE daily token pool (ANON_DAILY_TOKEN_LIMIT)
//                         and are asked to log in once it's spent. Password
//                         holders are always unlimited.
// Auth is a cookie whose value is an HMAC keyed by SITE_PASSWORD itself, so
// rotating the password logs everyone out.
const SITE_PASSWORD = process.env.SITE_PASSWORD || '';
const AUTH_COOKIE = 'site_auth';
const AUTH_MAX_AGE_S = 30 * 24 * 60 * 60;
const ANON_ACCESS = (process.env.ANON_ACCESS || 'blocked').toLowerCase() === 'metered' ? 'metered' : 'blocked';
const ANON_DAILY_TOKEN_LIMIT = Math.max(0, parseInt(process.env.ANON_DAILY_TOKEN_LIMIT, 10) || 200000);
const STATS_PATH = process.env.USAGE_STATS_PATH || path.join(__dirname, 'usage-stats.json');

if (!SITE_PASSWORD) {
    console.warn('SITE_PASSWORD is not set — the gate is OFF, everyone is an unlimited password holder (fine for local dev, NOT for a public deploy).');
} else {
    console.log(`Access mode: ${ANON_ACCESS === 'metered'
        ? `metered — public, no-password visitors share ${ANON_DAILY_TOKEN_LIMIT} tokens/day`
        : 'blocked — whole site requires the password'}`);
}

function authToken() {
    return crypto.createHmac('sha256', SITE_PASSWORD).update('earthlopedia-gate-v1').digest('hex');
}

function safeEqual(a, b) {
    const ab = Buffer.from(String(a));
    const bb = Buffer.from(String(b));
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function isAuthed(req) {
    if (!SITE_PASSWORD) return true;
    const cookies = Object.fromEntries(
        (req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0])
    );
    return !!cookies[AUTH_COOKIE] && safeEqual(cookies[AUTH_COOKIE], authToken());
}

// ---- usage stats (the token counter) ----
// In-memory, mirrored to STATS_PATH so it survives process restarts. On
// Render's ephemeral disk it still resets on each redeploy unless STATS_PATH
// points at an attached Disk — the console lines and /usage are the live view.
const utcDay = () => new Date().toISOString().slice(0, 10);
const zeroBucket = () => ({ input: 0, output: 0, requests: 0 });
const emptyDay = () => ({ date: utcDay(), anon: zeroBucket(), auth: zeroBucket(), byEndpoint: {} });

let stats = {
    today: emptyDay(),
    allTime: { anon: zeroBucket(), auth: zeroBucket(), byEndpoint: {}, since: utcDay() },
    history: [],
};
try {
    if (fs.existsSync(STATS_PATH)) {
        const loaded = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));
        if (loaded && loaded.today && loaded.allTime) stats = loaded;
    }
} catch (e) {
    console.warn('Could not read usage stats:', e.message);
}

let statsSaveTimer = null;
function saveStatsSoon() {
    clearTimeout(statsSaveTimer);
    statsSaveTimer = setTimeout(() => {
        try { fs.writeFileSync(STATS_PATH, JSON.stringify(stats)); }
        catch (e) { console.warn('Could not write usage stats:', e.message); }
    }, 2000);
}

function rollDayIfNeeded() {
    if (stats.today.date === utcDay()) return;
    stats.history.unshift(stats.today);
    stats.history = stats.history.slice(0, 60);
    stats.today = emptyDay();
    saveStatsSoon();
}

function anonTokensUsedToday() {
    rollDayIfNeeded();
    return stats.today.anon.input + stats.today.anon.output;
}

function recordUsage(endpoint, authed, usage) {
    rollDayIfNeeded();
    const input = (usage && usage.input_tokens) || 0;
    const output = (usage && usage.output_tokens) || 0;
    const who = authed ? 'auth' : 'anon';
    for (const scope of [stats.today, stats.allTime]) {
        scope[who].input += input;
        scope[who].output += output;
        scope[who].requests += 1;
        const e = scope.byEndpoint[endpoint] || (scope.byEndpoint[endpoint] = zeroBucket());
        e.input += input; e.output += output; e.requests += 1;
    }
    saveStatsSoon();
    console.log(`[usage] ${endpoint} ${who} +${input}in/+${output}out | today: anon ${anonTokensUsedToday()}/${ANON_DAILY_TOKEN_LIMIT}, auth ${stats.today.auth.input + stats.today.auth.output}`);
}

// Guards every AI endpoint. Password holders always pass. In 'metered' mode a
// no-password visitor is refused once the shared daily pool is spent; in
// 'blocked' mode they never reach here (siteGate stops them first). The real
// token spend is booked by recordUsage() after each call returns.
function aiGate(req, res, next) {
    req.authed = isAuthed(req);
    if (!req.authed && ANON_ACCESS === 'metered' && SITE_PASSWORD && anonTokensUsedToday() >= ANON_DAILY_TOKEN_LIMIT) {
        return res.status(429).json({
            error: 'The shared daily free limit has been reached. Enter the password at /login for unlimited access, or try again tomorrow.',
            limitReached: true,
        });
    }
    next();
}

function requireAuth(req, res, next) {
    if (isAuthed(req)) return next();
    if ((req.headers.accept || '').includes('text/html')) return res.redirect('/login');
    res.status(401).json({ error: 'Password required.' });
}

// In 'blocked' mode this locks the entire site behind the password. Only the
// login page, its assets, and /usage's own auth are reachable without a
// session. Inert in 'metered' mode (the site is public there).
const GATE_OPEN_PATH = /^\/(css|img)\//;
function siteGate(req, res, next) {
    if (ANON_ACCESS === 'metered' || isAuthed(req)) return next();
    if (req.method === 'GET' && GATE_OPEN_PATH.test(req.path)) return next();
    if ((req.headers.accept || '').includes('text/html')) return res.redirect('/login');
    res.status(401).json({ error: 'This site is password protected. Visit /login.' });
}

function loginPage({ error } = {}) {
    // Shares the app's real stylesheet + logo lockup so the gate reads as the
    // same product. Always dark, over a blurred blue-green "Earth from space"
    // backdrop painted with layered CSS gradients (no image asset).
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Earthlopedia</title>
<link rel="icon" type="image/svg+xml" href="/img/favicon.svg">
<link rel="stylesheet" href="/css/styles.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jeju+Myeongjo&display=swap" rel="stylesheet">
<style>
  /* Override the app's orange accent with purple, just on the gate. */
  :root {
      --accent: #9333ea; --accent-light: #a855f7; --accent-dark: #7e22ce;
      --accent-rgb: 147,51,234; --accent-light-rgb: 168,85,247;
  }
  body { overflow: auto; display: flex; align-items: center; justify-content: center;
         min-height: 100vh; padding: 24px; background: #061019; }
  /* Blurred blue-green Earth-from-space backdrop — oversized so the blur
     doesn't reveal soft edges. */
  body::before {
      content: ""; position: fixed; inset: -25%; z-index: -1;
      background:
          radial-gradient(38% 48% at 22% 32%, #2f9e6b 0%, transparent 60%),
          radial-gradient(32% 42% at 74% 22%, #2b8f7d 0%, transparent 58%),
          radial-gradient(44% 52% at 68% 82%, #1c6f9c 0%, transparent 62%),
          radial-gradient(30% 40% at 12% 78%, #34b39a 0%, transparent 55%),
          radial-gradient(28% 36% at 88% 62%, #256c8c 0%, transparent 55%),
          linear-gradient(160deg, #0b3b5e 0%, #0e5568 45%, #0a4f57 100%);
      filter: blur(90px) saturate(135%);
  }
  .login-shell { width: 100%; max-width: 460px; position: relative; }
  .login-card {
      padding: 30px 26px 24px; border-radius: 20px;
      background: var(--top-search-bg); border: 1px solid var(--top-search-border);
      box-shadow: var(--panel-shadow);
      backdrop-filter: blur(40px) saturate(180%);
      -webkit-backdrop-filter: blur(40px) saturate(180%);
  }
  .login-card .earth-title { display: flex; font-size: 28px; margin-bottom: 20px; }
  .login-card .earth-logo { width: 50px; height: 50px; }
  .login-card .earth-title-wordmark { height: 38px; }
  .login-input-wrap { position: relative; flex: 1; min-width: 0; display: flex; }
  .login-card .search-row input {
      flex: 1; min-width: 0; padding: 12px 44px 12px 15px; border-radius: 12px; font-size: 15px;
      border: 1px solid var(--input-border); background: var(--input-bg);
      color: var(--input-text); outline: none; transition: border-color 0.2s;
  }
  .login-card .search-row input::placeholder { color: var(--input-placeholder); }
  .login-card .search-row input:focus { border-color: rgba(var(--accent-rgb), 0.55); }
  .login-eye {
      position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
      width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
      border: 0; background: transparent; cursor: pointer; padding: 0;
      color: var(--text-secondary); border-radius: 8px;
  }
  .login-eye:hover { color: var(--text-primary); }
  .login-eye svg { width: 19px; height: 19px; display: block; }
  .login-eye .eye-off { display: none; }
  .login-eye.revealed .eye-on { display: none; }
  .login-eye.revealed .eye-off { display: block; }
  .login-card .ask-btn { padding: 12px 18px; font-size: 15px; }
  .login-err { margin: 14px 2px 0; font-size: 13px; color: var(--accent); text-align: center; }
</style>
</head>
<body>
  <div class="login-shell">
    <form class="login-card" method="POST" action="/login">
      <div class="earth-title">
        <span class="earth-logo" aria-hidden="true"><span class="earth-logo-inner"></span></span>
        <img class="earth-title-wordmark" src="/img/LogoBoldWiggle.svg" alt="Earthlopedia">
      </div>
      <div class="search-row">
        <div class="login-input-wrap">
          <input id="pw" type="password" name="password" placeholder="Password" autofocus autocomplete="current-password" required>
          <button type="button" id="pwToggle" class="login-eye" aria-label="Show password" title="Show password">
            <svg class="eye-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg class="eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.16 2.94M6.06 6.06A13.2 13.2 0 0 0 2 11s3.5 7 10 7a9.1 9.1 0 0 0 4-.94"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m2 2 20 20"/></svg>
          </button>
        </div>
        <button type="submit" class="ask-btn">Enter</button>
      </div>
      ${error ? `<div class="login-err">${error}</div>` : ''}
    </form>
  </div>
  <script>
    (function () {
      var pw = document.getElementById('pw'), t = document.getElementById('pwToggle');
      t.addEventListener('click', function () {
        var show = pw.type === 'password';
        pw.type = show ? 'text' : 'password';
        t.classList.toggle('revealed', show);
        t.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        t.setAttribute('title', show ? 'Hide password' : 'Show password');
        pw.focus();
      });
    })();
  </script>
</body>
</html>`;
}

// Password-only dashboard for the token counter. Same look as the login page.
function usagePage() {
    rollDayIfNeeded();
    const n = x => (x || 0).toLocaleString('en-US');
    const t = stats.today, a = stats.allTime;
    const anonToday = t.anon.input + t.anon.output;
    const authToday = t.auth.input + t.auth.output;
    const pct = ANON_DAILY_TOKEN_LIMIT ? Math.min(100, Math.round(anonToday / ANON_DAILY_TOKEN_LIMIT * 100)) : 0;

    const endpointRows = Object.entries(t.byEndpoint)
        .sort((x, y) => (y[1].input + y[1].output) - (x[1].input + x[1].output))
        .map(([name, e]) => `<tr><td>${name}</td><td>${n(e.requests)}</td><td>${n(e.input)}</td><td>${n(e.output)}</td><td>${n(e.input + e.output)}</td></tr>`)
        .join('') || '<tr><td colspan="5" class="muted">No calls yet today.</td></tr>';

    const historyRows = stats.history.slice(0, 14)
        .map(d => `<tr><td>${d.date}</td><td>${n(d.anon.input + d.anon.output)}</td><td>${n(d.auth.input + d.auth.output)}</td><td>${n(d.anon.requests + d.auth.requests)}</td></tr>`)
        .join('') || '<tr><td colspan="4" class="muted">No previous days recorded.</td></tr>';

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="30">
<title>Earthlopedia · Usage</title>
<link rel="icon" type="image/svg+xml" href="/img/favicon.svg">
<link rel="stylesheet" href="/css/styles.css">
<link href="https://fonts.googleapis.com/css2?family=Jeju+Myeongjo&display=swap" rel="stylesheet">
<style>
  :root { --accent: #9333ea; --accent-rgb: 147,51,234; }
  body { overflow: auto; display: flex; justify-content: center; min-height: 100vh; padding: 32px 24px; background: #061019; }
  body::before {
      content: ""; position: fixed; inset: -25%; z-index: -1;
      background:
          radial-gradient(38% 48% at 22% 32%, #2f9e6b 0%, transparent 60%),
          radial-gradient(44% 52% at 68% 82%, #1c6f9c 0%, transparent 62%),
          radial-gradient(30% 40% at 12% 78%, #34b39a 0%, transparent 55%),
          linear-gradient(160deg, #0b3b5e 0%, #0e5568 45%, #0a4f57 100%);
      filter: blur(90px) saturate(135%);
  }
  .u-shell { width: 100%; max-width: 640px; }
  .u-card {
      padding: 26px 26px 22px; border-radius: 20px; margin-bottom: 18px;
      background: var(--top-search-bg); border: 1px solid var(--top-search-border);
      box-shadow: var(--panel-shadow);
      backdrop-filter: blur(40px) saturate(180%); -webkit-backdrop-filter: blur(40px) saturate(180%);
  }
  .u-card .earth-title { display: flex; font-size: 24px; margin: 0 0 4px; }
  .u-card .earth-logo { width: 40px; height: 40px; }
  .u-card .earth-title-wordmark { height: 30px; }
  .u-tag { text-align: center; color: var(--text-secondary); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-secondary); margin: 0 0 12px; }
  .u-stat-row { display: flex; gap: 14px; flex-wrap: wrap; }
  .u-stat { flex: 1; min-width: 150px; background: var(--facts-bg); border: 1px solid var(--facts-border); border-radius: 12px; padding: 12px 14px; }
  .u-stat .k { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }
  .u-stat .v { font-size: 20px; font-weight: 600; margin-top: 3px; }
  .u-stat .sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
  .u-bar { height: 8px; border-radius: 5px; background: var(--facts-bg); overflow: hidden; margin: 10px 0 4px; }
  .u-bar > span { display: block; height: 100%; background: var(--accent); width: ${pct}%; }
  .u-bar-label { font-size: 12px; color: var(--text-secondary); }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: right; padding: 7px 8px; border-bottom: 1px solid var(--divider); }
  th:first-child, td:first-child { text-align: left; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 600; }
  .muted { color: var(--text-muted); text-align: center; }
  .u-foot { text-align: center; font-size: 12px; color: var(--text-secondary); }
  .u-foot a { color: var(--accent-light, var(--accent)); }
</style>
</head>
<body>
  <div class="u-shell">
    <div class="u-card">
      <div class="earth-title">
        <span class="earth-logo" aria-hidden="true"><span class="earth-logo-inner"></span></span>
        <img class="earth-title-wordmark" src="/img/LogoBoldWiggle.svg" alt="Earthlopedia">
      </div>
      <p class="u-tag">Token usage</p>
    </div>

    <div class="u-card">
      <h2>Today · ${t.date} (UTC)</h2>
      <div class="u-stat-row">
        <div class="u-stat">
          <div class="k">Free pool (no password)</div>
          <div class="v">${n(anonToday)} / ${n(ANON_DAILY_TOKEN_LIMIT)}</div>
          <div class="u-bar"><span></span></div>
          <div class="u-bar-label">${pct}% used · ${n(t.anon.requests)} requests</div>
        </div>
        <div class="u-stat">
          <div class="k">Password holders</div>
          <div class="v">${n(authToday)}</div>
          <div class="sub">tokens · ${n(t.auth.requests)} requests · unlimited</div>
        </div>
      </div>
    </div>

    <div class="u-card">
      <h2>All time · since ${a.since || t.date}</h2>
      <div class="u-stat-row">
        <div class="u-stat"><div class="k">No-password tokens</div><div class="v">${n(a.anon.input + a.anon.output)}</div><div class="sub">${n(a.anon.requests)} requests</div></div>
        <div class="u-stat"><div class="k">Password tokens</div><div class="v">${n(a.auth.input + a.auth.output)}</div><div class="sub">${n(a.auth.requests)} requests</div></div>
        <div class="u-stat"><div class="k">Total tokens</div><div class="v">${n(a.anon.input + a.anon.output + a.auth.input + a.auth.output)}</div><div class="sub">in ${n(a.anon.input + a.auth.input)} · out ${n(a.anon.output + a.auth.output)}</div></div>
      </div>
    </div>

    <div class="u-card">
      <h2>By endpoint · today</h2>
      <table>
        <thead><tr><th>Endpoint</th><th>Reqs</th><th>Input</th><th>Output</th><th>Total</th></tr></thead>
        <tbody>${endpointRows}</tbody>
      </table>
    </div>

    <div class="u-card">
      <h2>Last 14 days</h2>
      <table>
        <thead><tr><th>Date (UTC)</th><th>No-pw tokens</th><th>Pw tokens</th><th>Reqs</th></tr></thead>
        <tbody>${historyRows}</tbody>
      </table>
    </div>

    <p class="u-foot">Auto-refreshes every 30s · <a href="/usage?format=json">JSON</a> · <a href="/">back to Earthlopedia</a></p>
  </div>
</body>
</html>`;
}

app.get('/usage', requireAuth, (req, res) => {
    rollDayIfNeeded();
    if (req.query.format === 'json') {
        return res.json({ anonDailyTokenLimit: ANON_DAILY_TOKEN_LIMIT, anonTokensUsedToday: anonTokensUsedToday(), ...stats });
    }
    res.type('html').send(usagePage());
});

// Tiny aggregate for the in-app counter in the search box. Public (no
// password) so it also works for metered-mode visitors; only ever exposes
// today's rolled-up totals, never per-visitor or historical data.
app.get('/usage-summary', (req, res) => {
    const authed = isAuthed(req);
    if (ANON_ACCESS === 'blocked' && !authed) return res.status(401).json({ error: 'Password required.' });
    rollDayIfNeeded();
    const t = stats.today;
    const out = {
        mode: ANON_ACCESS,
        authed,
        today: {
            tokens: t.anon.input + t.anon.output + t.auth.input + t.auth.output,
            requests: t.anon.requests + t.auth.requests,
        },
    };
    if (ANON_ACCESS === 'metered') {
        out.anon = { used: t.anon.input + t.anon.output, limit: ANON_DAILY_TOKEN_LIMIT };
    }
    res.json(out);
});

app.get('/login', (req, res) => {
    if (isAuthed(req)) return res.redirect('/');
    res.type('html').send(loginPage());
});

app.post('/login', (req, res) => {
    const password = (req.body && req.body.password) || '';
    if (SITE_PASSWORD && safeEqual(password, SITE_PASSWORD)) {
        const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
        res.setHeader('Set-Cookie',
            `${AUTH_COOKIE}=${authToken()}; Max-Age=${AUTH_MAX_AGE_S}; Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`);
        return res.redirect('/');
    }
    res.status(401).type('html').send(loginPage({ error: 'Incorrect password.' }));
});

app.post('/logout', (req, res) => {
    res.setHeader('Set-Cookie', `${AUTH_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
    res.redirect('/login');
});

// Everything below this line is behind the gate in 'blocked' mode.
app.use(siteGate);

// ---- end password + metering setup ------------------------------------------

app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/tools', express.static(path.join(__dirname, 'tools')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.post('/ask', aiGate, async (req, res) => {
    try {
        const question = req.body.question;
        const detailLevel = Math.min(5, Math.max(1, parseInt(req.body.detailLevel) || 4));

        const detailConfigs = {
            1: { words: '50–80',   facts: '2–3', maxTokens: 1400 },
            2: { words: '90–130',  facts: '3',   maxTokens: 1600 },
            3: { words: '150–190', facts: '4–5', maxTokens: 1900 },
            4: { words: '200–280', facts: '4–6', maxTokens: 2400 },
            5: { words: '300–400', facts: '6–8', maxTokens: 3000 },
        };
        const cfg = detailConfigs[detailLevel];
        // The data/periods/related/wikipedia blocks scale with location count,
        // not detail level — enumeration prompts ("every Greek colony") can
        // produce 30-40+ locations, which was blowing past the summary-sized
        // budget above and truncating the JSON mid-array.
        const maxTokens = cfg.maxTokens + 2200;

        const today = new Date().toISOString().split('T')[0];
        const system = `You are Earthlopedia, an interactive educational map of Earth. Today's date is ${today}. Your knowledge has a cutoff of approximately August 2025, so for topics involving recent records, current champions, or fast-changing statistics, note that figures may be outdated and more recent developments have likely occurred.

Your job is to take any topic — a war, an invention, a species, a person, a sport, a concept — and tell its story through LOCATIONS and TIME.

For every query, write a summary then output location data.

## Factual accuracy:
If the question contains a false premise or misconception (e.g. "how are humans dinosaurs" — humans are NOT dinosaurs, but birds are), open by clearly but briefly correcting it, then pivot to the fascinating true story. Never validate a false claim to seem agreeable.

## Summary format (use markdown):
- Start with a one-sentence hook that states the most striking educational fact about the topic — direct, specific, and grounded. Write it as a plain declarative sentence: what happened, where, when, and why it matters. NEVER use the "X didn't just A — it B" contrast construction (e.g. "Sugar plantations didn't just reshape economies — they physically relocated millions of people") or its variants ("not just blank, its blank", "changed everything", "front-row seat", "from scratch", "would never be the same", "entirely new"). If you notice the sentence you're about to write contains an em-dash setting up a contrast/escalation, rewrite it as a single flat factual statement instead. The hook should read like a knowledgeable person cutting straight to the most interesting point, e.g. "Sugar plantations relied on forced labor shipped from Africa, and that migration reshaped the demographics of the Americas for centuries."
- If the query is a generic/category term rather than a specific named subject (e.g. "archipelago", "volcano", "glacier" — as opposed to "Indonesian Archipelago" or "Mount Vesuvius"), the hook must first give a brief general definition of the term before pivoting to a striking specific example
- Use **bold** for key names, places, dates
- For historical topics (wars, empires, migrations, discoveries, political events), include a "## Context" section (2-3 sentences) explaining WHY it happened — the preceding causes, tensions, or developments — and how it connects to other events happening concurrently elsewhere in the world at that time. Name at least one specific contemporaneous event, trend, or power struggle happening elsewhere, not just background on the topic itself. Omit this section for topics where "why" doesn't apply (species, geographic features, sports records, inventions without political causes).
- Include a "## Key Facts" section with ${cfg.facts} bullet points. For competitive/historical topics always include: first occurrence, most recent, record holders or dominant nations/people, a lesser-known fact (label this bullet "**Little-known:**", not "Surprising fact")
- Include a "## Geographic Story" section (2-3 sentences) explaining how the topic spread or shifted across the world over time
- Keep total summary to ${cfg.words} words (the Context section, when included, adds roughly 40-60 words on top of this budget)

## Data block:
After the summary, output all locations in chronological order. Each entry name should be: "City/Place — brief event (Winner/detail if relevant)".

ALWAYS produce the data block. For "world cup winners" → each tournament's host city final venue. For "dinosaurs" → major fossil sites. For "internet" → cities of key milestones. Always find the geographic angle.

If the question is about a specific place, landmark, or singular subject (e.g. "the island that legally belongs to no country", "the lost city of Petra", "Taj Mahal"), add "main": true to that subject's entry. Only one entry should have "main": true. Do NOT add "main": true for survey/list questions (e.g. "World Cup winners", "major volcanoes"). The one exception is a two-subject COMPARISON query (see below), where exactly two entries have "main": true, one per subject.

## Direct vs. journey queries — this changes how many locations you output:
First judge the query itself. A DIRECT query names one specific place, landmark, building, or singular subject and is really asking "tell me about this place" (e.g. "Taj Mahal", "Eiffel Tower", "the Great Barrier Reef", "Area 51"). A JOURNEY/STORY query asks about something that inherently moves or spans many places over time (a war, a migration, an invention's spread, a species' range, a sport's history, an empire).

- For a DIRECT query: the map view must read, at a glance, as being about that ONE place. Output the main location plus only 2–6 tightly-relevant supporting locations — places directly and specifically tied to that subject's own story (e.g. where its architect trained, where its materials were quarried, its UNESCO listing year, a twin/sister site). Do NOT invent a sprawling multi-stop world tour, and do NOT make the main subject a mid-journey stop (e.g. the 4th location chronologically) — it should anchor the set both narratively and geographically. If you genuinely can't find several tightly-relevant supporting locations, it's fine to output just the main location plus 1–2, or the main location alone.
- For a JOURNEY/STORY query: keep the full narrative sweep — this is where the 8–22 location range below applies.
- When in doubt whether a query is direct or a journey, prefer treating it as direct — a focused answer beats a padded one.

If the subject with "main": true is a country, sovereign state, overseas territory, or named political region (e.g. "France", "Japan", "Greenland", "Patagonia"), also add "country": "<English name suitable for geocoding>" to that same entry. Do not add "country" for cities, landmarks, or non-political geographic features.

If the subject with "main": true is a historical empire, kingdom, or multi-country political entity (e.g. "the Roman Empire", "the British Empire", "the Mongol Empire"), instead add "region_countries": ["Country1", "Country2", ...] listing up to 8 modern countries whose territory significantly overlapped with that entity at its peak. Use standard English country names suitable for geocoding. Do not add both "country" and "region_countries" to the same entry.

## Comparison queries:
When the query explicitly asks to compare two named subjects (e.g. "Compare the empires of Rome and Han China", "Aztecs vs Incas", "the Ottoman and Byzantine empires"), treat it as a comparison rather than a single journey:
- Pick one representative anchor location for EACH subject and tag both "main": true (an exception to the "only one main" rule above).
- Add "compare_group": "A" to the first subject's main entry and every other location that belongs to the first subject, and "compare_group": "B" to the second subject's main entry and its locations. Every location in the data block should carry a compare_group.
- Independently give each subject's main entry its own "country" or "region_countries" exactly as described above — one subject might get "country" while the other gets "region_countries", or both might get the same kind.
- Aim for roughly balanced coverage — a similar number of locations for each subject — so neither side dominates the map.
- Do NOT add "compare_group" for non-comparison queries, even ones that happen to mention two places in passing.

## Multiple routes:
Most topics describe a single path and need nothing extra. But when a topic genuinely contains two or more distinct, separately-traceable journeys — e.g. "Columbus's four voyages", "Cook's three Pacific voyages", separate invasion routes of the same campaign, parallel migration branches — add "route": <integer> (1, 2, 3, ...) to each location marking which journey it belongs to. Use the same route number for every stop on the same journey, in chronological order within that route. Only do this when the routes are genuinely distinct and each has 2+ of its own stops; do not fragment a single continuous journey into artificial routes, and omit "route" entirely for single-path topics (the default case).

For a single-path journey (no "route" field), the map draws one line connecting every location strictly in the order you list them — so that order must trace the physical path traveled, not just increasing year. Do not append a later "epilogue" or "consequence" location (e.g. where the journey's outcome played out, a site tied to the story's aftermath) to the end of an otherwise-geographic list if it sits far off that physical path — doing so draws a stray line backtracking across the map. Either weave such a location into its correct position along the path, give it its own "route" number so it isn't connected to the main line, or omit it.

Format exactly — "data:" on its own line:

data:
[
  {"name": "Bir Tawil — unclaimed territory", "latitude": 21.9, "longitude": 33.7, "year": 1899, "main": true},
  {"name": "Cairo — Egypt's claim origin", "latitude": 30.0, "longitude": 31.2, "year": 1906}
]

Example with multiple routes (only use "route" like this when the topic truly has separate journeys):

data:
[
  {"name": "Palos de la Frontera — departure, 1st voyage", "latitude": 37.2, "longitude": -6.9, "year": 1492, "route": 1},
  {"name": "San Salvador — first landfall, 1st voyage", "latitude": 24.0, "longitude": -74.5, "year": 1492, "route": 1},
  {"name": "Cádiz — departure, 2nd voyage", "latitude": 36.5, "longitude": -6.3, "year": 1493, "route": 2},
  {"name": "Hispaniola — colonization, 2nd voyage", "latitude": 19.0, "longitude": -70.7, "year": 1493, "route": 2}
]

Example with a two-subject comparison (only use "compare_group" like this for an explicit "compare X and Y" query):

data:
[
  {"name": "Rome — founding of the Republic", "latitude": 41.9, "longitude": 12.5, "year": -509, "main": true, "region_countries": ["Italy", "Spain", "France", "Greece", "Egypt", "Turkey", "Tunisia", "United Kingdom"], "compare_group": "A"},
  {"name": "Carthage — destroyed after the Third Punic War", "latitude": 36.85, "longitude": 10.32, "year": -146, "compare_group": "A"},
  {"name": "Chang'an — Han capital", "latitude": 34.27, "longitude": 108.9, "year": -202, "main": true, "country": "China", "compare_group": "B"},
  {"name": "Ferghana Valley — source of the 'heavenly horses'", "latitude": 40.4, "longitude": 71.8, "year": -104, "compare_group": "B"}
]

Rules:
- latitude/longitude are numbers not strings
- year is a number (negative = BCE)
- Do NOT include locations dated after today (${today}) unless the query itself explicitly asks about future predictions, forecasts, or projections (e.g. "when will the Amazon disappear", "future sea level rise") — in that rare case, future-dated entries are fine and expected.
- Include every significant location for this topic. For specific routes, voyages, or journeys include every known stop. For broad survey topics include all major sites. For JOURNEY/STORY queries (see above), aim for 8–22 locations; never omit known stops to save space. For DIRECT queries (see above), use the smaller, tightly-relevant count described above instead — do not pad to reach 8
- Valid JSON, no trailing commas, nothing after the closing ]

If the topic spans recognizable named time periods or eras (e.g. geological periods for dinosaurs/evolution, dynasties for ancient Egypt, eras for the Roman Empire, centuries for the Silk Road), output an optional periods block BEFORE the related block:

periods:
[
  {"name": "Triassic", "start": -252000000, "end": -201000000},
  {"name": "Jurassic", "start": -201000000, "end": -145000000},
  {"name": "Cretaceous", "start": -145000000, "end": -66000000}
]

Rules for periods:
- start and end are numbers (negative = BCE, same convention as year)
- 2–8 periods max
- Only include when the topic genuinely has named, widely-recognized time divisions
- Do NOT include for general modern geography, sports records, or topics that don't span distinct named eras
- Periods should together span roughly the same range as the locations' years

After the data block (and optional periods block), add a related searches section exactly like this:

related:
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]

These should be 4 short, specific, interesting follow-up searches a curious person would want to explore next — related but distinct angles on the topic.

After the related block, output the single best Wikipedia article title for the main image of this topic:

wikipedia: "Exact Wikipedia Article Title"

Use the precise Wikipedia article title (with disambiguation if needed), e.g. "Ratatouille (film)", "Mongol Empire", "FIFA World Cup". This must match the actual topic being discussed — not a similarly-named person, place, or thing. If the query is about a fictional character, use the work they appear in (e.g. "Ratatouille (film)" not "Remy Ma"). Output null if no single Wikipedia article fits well.`;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullText = '';
        const stream = anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: maxTokens,
            temperature: 0,
            system: system,
            messages: [{ role: 'user', content: question }],
        });

        stream.on('text', (text) => {
            fullText += text;
            res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        });

        const finalMessage = await stream.finalMessage();
        recordUsage('ask', req.authed, finalMessage.usage);
        const answer = fullText.trim();
        console.log("=== RAW ANSWER ===\n", answer, "\n==================");
        res.write(`data: ${JSON.stringify({ done: true, answer })}\n\n`);
        res.end();
    } catch (error) {
        console.error("Error in /ask route:", error.message);
        res.write(`data: ${JSON.stringify({ error: 'Error querying Anthropic' })}\n\n`);
        res.end();
    }
});

app.post('/location-summary', aiGate, async (req, res) => {
    try {
        const { question, locationName, event, year } = req.body;
        const yearStr = year != null ? (year < 0 ? `${Math.abs(year)} BCE` : String(year)) : null;
        const context = [locationName, yearStr, event].filter(Boolean).join(' — ');

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 400,
            messages: [{
                role: 'user',
                content: `Topic: "${question}"\nLocation: ${context}\n\nWrite 2–3 sentences explaining this location's specific role or significance in the context of "${question}". Be vivid and specific. No bullet points, just flowing prose. Use **bold** for key names, places, and dates so they stick out.\n\nThen on a new line output exactly:\nfollow_ups:\n["question 1", "question 2", "question 3"]\n\nThese should be 3 short, specific follow-up questions a curious person would ask about this specific location.`
            }],
        });

        recordUsage('location-summary', req.authed, response.usage);
        const raw = response.content[0].text.trim();
        let summary = raw;
        let followUps = [];
        const fuIdx = raw.indexOf('follow_ups:');
        if (fuIdx !== -1) {
            summary = raw.slice(0, fuIdx).trim();
            const fuText = raw.slice(fuIdx + 11).trim();
            const arrStart = fuText.indexOf('[');
            const arrEnd = fuText.lastIndexOf(']');
            if (arrStart !== -1 && arrEnd !== -1) {
                try { followUps = JSON.parse(fuText.slice(arrStart, arrEnd + 1)); } catch (e) {}
            }
        }

        res.json({ summary, followUps });
    } catch (error) {
        console.error("Error in /location-summary:", error.message);
        res.status(500).json({ summary: null });
    }
});

// Lightweight cross-check: compares just the summary's opening claim against
// the Wikipedia extract already fetched client-side for the topic image.
// Deliberately narrow — only flags a clear, specific contradiction (a
// conflicting date/name/place/number for the same fact), never omissions or
// differing detail, so it stays a rare, trustworthy signal rather than noise.
app.post('/fact-check', aiGate, async (req, res) => {
    try {
        const { summary, extract } = req.body || {};
        if (typeof summary !== 'string' || typeof extract !== 'string' || !summary.trim() || !extract.trim()) {
            return res.json({ flag: false });
        }

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 150,
            temperature: 0,
            messages: [{
                role: 'user',
                content: `You are a careful, conservative fact-checker. Compare CLAIM against REFERENCE (a Wikipedia summary of the same topic).

CLAIM:
"""${summary.slice(0, 1200)}"""

REFERENCE (Wikipedia):
"""${extract.slice(0, 1200)}"""

Only flag a clear, specific factual contradiction between the two — e.g. a conflicting date, name, location, or number given for the same fact. Do NOT flag omissions, differing emphasis, differing level of detail, broader/narrower framing, or anything the reference simply doesn't mention. When in doubt, do not flag.

Reply with ONLY JSON, nothing else:
{"flag": false}
or
{"flag": true, "note": "<under 14 words, plainly naming the contradiction>"}`
            }],
        });

        recordUsage('fact-check', req.authed, response.usage);
        const raw = response.content[0].text.trim();
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        if (start === -1 || end === -1) return res.json({ flag: false });
        const parsed = JSON.parse(raw.slice(start, end + 1));
        res.json({
            flag: !!parsed.flag,
            note: typeof parsed.note === 'string' ? parsed.note.trim() : null,
        });
    } catch (error) {
        console.error('Error in /fact-check:', error.message);
        res.json({ flag: false });
    }
});

app.post('/followup-quick-answer', aiGate, async (req, res) => {
    try {
        const { question, locationName, event, year, followUp } = req.body;
        const yearStr = year != null ? (year < 0 ? `${Math.abs(year)} BCE` : String(year)) : null;
        const context = [locationName, yearStr, event].filter(Boolean).join(' — ');

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 150,
            messages: [{
                role: 'user',
                content: `Topic: "${question}"\nLocation: ${context}\n\nAnswer this follow-up question in 1-2 short, direct sentences: "${followUp}"\n\nPlain prose only — no markdown headers, no bullet points, no bold, no preamble. Just the answer sentences.`
            }],
        });

        recordUsage('followup-quick-answer', req.authed, response.usage);
        const answer = response.content[0].text.trim();
        res.json({ answer });
    } catch (error) {
        console.error("Error in /followup-quick-answer:", error.message);
        res.status(500).json({ answer: null });
    }
});

const EXPLORE_CATEGORIES = ['history', 'nature', 'culture', 'oddity'];

// Turns the Explore "Curate" panel's free-text focus + category subset into
// prompt fragments shared by /explore-nearby and /explore-related, plus the
// validated category allow-list to filter the model's output against.
// `allowedCats` is null when the user hasn't constrained categories.
function buildExploreCuration(focus, categories) {
    const cleanFocus = typeof focus === 'string' ? focus.trim().slice(0, 120) : '';
    // A focus is a hard filter, not a nudge — the model otherwise pads the
    // list back up to five with famous-but-unrelated nearby places (ask for
    // "volcanoes" in Croatia and get Dubrovnik's old town). Spell out that a
    // short list, or none at all, is the correct answer.
    const focusBlock = cleanFocus
        ? `\n\nHARD REQUIREMENT — the wanderer only wants places about: ${cleanFocus}
- Every place you return must genuinely, specifically be about "${cleanFocus}". Not loosely adjacent — actually about it.
- Do NOT include a place just to reach five. Returning three, one, or an empty array [] is correct and expected when the visible area has little to do with "${cleanFocus}".
- Never substitute a famous nearby landmark that isn't about "${cleanFocus}".
- Never relocate a matching place from elsewhere in the world into this area, and never invent one. If a place's real location is outside the given bounds, leave it out.
- Set "match" to true only if you are confident the place is really about "${cleanFocus}"; the server drops any place with "match": false.`
        : '';
    const focusMatchField = cleanFocus ? ', "match": true' : '';

    let allowedCats = Array.isArray(categories)
        ? categories.filter(c => EXPLORE_CATEGORIES.includes(c))
        : null;
    if (allowedCats && (allowedCats.length === 0 || allowedCats.length === EXPLORE_CATEGORIES.length)) {
        allowedCats = null; // no real constraint
    }
    const categoryLine = allowedCats
        ? `Only include places whose category is one of: ${allowedCats.join(', ')}. Each place's "category" field must be exactly one of those.`
        : `Also give each place a category: exactly one of "history", "nature", "culture", "oddity".`;

    return { cleanFocus, focusBlock, focusMatchField, categoryLine, allowedCats };
}

app.post('/explore-nearby', aiGate, async (req, res) => {
    try {
        const { lat, lng, north, south, east, west, exclude, focus, categories } = req.body || {};
        if ([lat, lng, north, south, east, west].some(n => typeof n !== 'number' || Number.isNaN(n))) {
            return res.status(400).json({ error: 'Missing or invalid bounds', discoveries: [] });
        }
        const excludeList = Array.isArray(exclude) ? exclude.filter(s => typeof s === 'string').slice(-40) : [];
        const excludeBlock = excludeList.length
            ? `\n\nSkip these — already shown to this person:\n${excludeList.map(n => `- ${n}`).join('\n')}`
            : '';
        // User-set curation from the Explore "Curate" panel (see js/main.js).
        const { cleanFocus, focusBlock, focusMatchField, categoryLine, allowedCats } = buildExploreCuration(focus, categories);
        const varietyClause = cleanFocus
            ? `that are genuinely about "${cleanFocus}"`
            : 'that would delight a curious wanderer — mix historical sites, natural features, cultural landmarks, and interesting oddities';

        // Factor the zoom level into the search: a viewport showing most of a
        // country is a "find the best across this whole region" request, not a
        // "what's near this point" one. Size the ask (and how the model is told
        // to spread its picks) to the span actually on screen rather than
        // always anchoring on the centre coordinate.
        const midLatRad = ((north + south) / 2) * Math.PI / 180;
        const latSpanKm = Math.abs(north - south) * 111;
        const lngSpanKm = Math.abs(east - west) * 111 * Math.max(Math.cos(midLatRad), 0.02);
        const longSideKm = Math.max(latSpanKm, lngSpanKm);
        const maxPlaces = longSideKm > 1500 ? 8 : longSideKm > 500 ? 7 : longSideKm > 150 ? 6 : 5;
        const wideView = longSideKm > 150;
        const areaLine = wideView
            ? `That visible area is large — roughly ${Math.round(latSpanKm)} km north–south by ${Math.round(lngSpanKm)} km east–west, so it covers a whole region rather than a single locality.`
            : `That visible area spans roughly ${Math.round(latSpanKm)} km north–south by ${Math.round(lngSpanKm)} km east–west, centred near ${lat}, ${lng}.`;
        const spreadLine = wideView
            ? `\n\nBecause this is a wide, zoomed-out view, do NOT cluster your picks near the centre point (${lat}, ${lng}). Choose the most remarkable places from ACROSS the entire visible area — different cities, provinces, and edges of the box — so the results represent the whole region on screen, not just its middle. If the single best example of what's wanted sits near an edge of the box, that's the one to return.`
            : '';

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 900,
            temperature: 1,
            messages: [{
                role: 'user',
                content: `You are picking real points of interest for someone casually wandering an interactive map with no destination in mind. They're currently looking at the map area bounded by latitude ${south} to ${north} and longitude ${west} to ${east}. ${areaLine}${spreadLine}

Name up to ${maxPlaces} real, specific, verifiable places inside (or very close to) that visible area ${varietyClause}. Only include places you're confident are real and can place accurately; skip a place entirely rather than guess at its coordinates. If you can't confidently find ${maxPlaces}, give fewer.${excludeBlock}${focusBlock}

For each place give: its exact name, precise latitude/longitude (must fall within the given bounds), and a one-sentence hook (12–22 words, plain declarative statement of the single most interesting fact — never use the "X isn't just Y — it Z" contrast construction or variants like "not just blank, its blank"). ${categoryLine}

Reply with ONLY a JSON array, nothing else — no preamble, no markdown fences:
[{"name": "...", "lat": 0.0, "lng": 0.0, "teaser": "...", "category": "history"${focusMatchField}}]`
            }],
        });
        recordUsage('explore-nearby', req.authed, response.usage);

        const raw = response.content[0].text.trim();
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start === -1 || end === -1) throw new Error('No JSON array in response');
        const parsed = JSON.parse(raw.slice(start, end + 1));

        const CATEGORIES = new Set(['history', 'nature', 'culture', 'oddity']);
        // Small, fixed-range tolerance for "very close to" the requested
        // bounds — NOT proportional to the viewport itself. The old margin
        // (a full extra viewport, floored at 0.5°) meant a zoomed-in view of
        // e.g. Washington DC would still accept a pick ~35+ miles away (like
        // Richmond, VA): the model would return something plausible-but-wrong
        // for the neighborhood, it'd sail through validation, and fitBounds
        // would then stretch the map to include it — reading as pins landing
        // "between" the old and new area, or not at the new area at all.
        // Clamping to a fixed 0.02°–0.15° (~1.5–10mi) range keeps the slack
        // sane at every zoom level.
        const latMargin = Math.min(Math.max((north - south) * 0.15, 0.02), 0.15);
        const lngMargin = Math.min(Math.max((east - west) * 0.15, 0.02), 0.15);
        const discoveries = parsed.filter(d =>
            d && typeof d.name === 'string' && d.name.trim() &&
            typeof d.lat === 'number' && typeof d.lng === 'number' &&
            d.lat >= south - latMargin && d.lat <= north + latMargin &&
            d.lng >= west - lngMargin && d.lng <= east + lngMargin &&
            // Focus mode asks for a self-assessed "match" flag — drop anything
            // the model itself wasn't willing to vouch for.
            (!cleanFocus || d.match === true)
        ).map(d => ({
            name: d.name.trim(),
            lat: d.lat,
            lng: d.lng,
            teaser: typeof d.teaser === 'string' ? d.teaser.trim() : '',
            category: CATEGORIES.has(d.category) ? d.category : 'oddity',
        })).filter(d => !allowedCats || allowedCats.includes(d.category));

        res.json({ discoveries });
    } catch (error) {
        console.error('Error in /explore-nearby:', error.message);
        res.status(500).json({ error: 'Failed to find nearby places', discoveries: [] });
    }
});

// Follow-up places for the Explore detail panel — related to the given place
// by history, theme, or story rather than by proximity, so (unlike
// /explore-nearby) these are free to be anywhere on the map. Each one quick-
// loads into the same lightweight detail view client-side; see
// renderExploreFollowUps/quickLoadExploreFollowUp in js/main.js.
app.post('/explore-related', aiGate, async (req, res) => {
    try {
        const { name, teaser, exclude, focus, categories } = req.body || {};
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Missing name', related: [] });
        }
        const excludeList = Array.isArray(exclude) ? exclude.filter(s => typeof s === 'string').slice(-40) : [];
        const excludeBlock = excludeList.length
            ? `\n\nSkip these — already shown to this person:\n${excludeList.map(n => `- ${n}`).join('\n')}`
            : '';
        // Same Explore "Curate" lens as /explore-nearby, but applied softly
        // here — a themed "where to next" jump shouldn't be dropped just for
        // sitting outside the chosen categories.
        const { focusBlock, allowedCats } = buildExploreCuration(focus, categories);
        const relatedPrefBlock = [
            focusBlock,
            allowedCats ? `\n\nWhere there's a genuine choice, lean toward places in these categories: ${allowedCats.join(', ')}.` : '',
        ].join('');

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 700,
            temperature: 1,
            messages: [{
                role: 'user',
                content: `A curious wanderer just looked at this place on an interactive map:\n\nPlace: ${name}\n${teaser ? `Context: ${teaser}\n` : ''}\nSuggest up to 4 real, specific, verifiable places worth going to next — connected to this one by history, theme, story, or comparison (a related event, a shared figure, a counterpart elsewhere, the next chapter of the same story). They do NOT need to be nearby — anywhere in the world is fine, and scattering them geographically is good. Only include places you're confident are real and can place accurately; skip a place entirely rather than guess at its coordinates. If you can't confidently find 4, give fewer.${excludeBlock}${relatedPrefBlock}

For each place give: its exact name, precise latitude/longitude, a one-sentence hook (12–22 words, plain declarative statement of the single most interesting fact and, where natural, how it connects back to "${name}" — never use the "X isn't just Y — it Z" contrast construction or variants like "not just blank, its blank"), and a category: exactly one of "history", "nature", "culture", "oddity".

Reply with ONLY a JSON array, nothing else — no preamble, no markdown fences:
[{"name": "...", "lat": 0.0, "lng": 0.0, "teaser": "...", "category": "history"}]`
            }],
        });
        recordUsage('explore-related', req.authed, response.usage);

        const raw = response.content[0].text.trim();
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start === -1 || end === -1) throw new Error('No JSON array in response');
        const parsed = JSON.parse(raw.slice(start, end + 1));

        const CATEGORIES = new Set(['history', 'nature', 'culture', 'oddity']);
        const related = parsed.filter(d =>
            d && typeof d.name === 'string' && d.name.trim() &&
            typeof d.lat === 'number' && typeof d.lng === 'number' &&
            d.lat >= -90 && d.lat <= 90 && d.lng >= -180 && d.lng <= 180 &&
            d.name.trim().toLowerCase() !== name.trim().toLowerCase()
        ).map(d => ({
            name: d.name.trim(),
            lat: d.lat,
            lng: d.lng,
            teaser: typeof d.teaser === 'string' ? d.teaser.trim() : '',
            category: CATEGORIES.has(d.category) ? d.category : 'oddity',
        }));

        res.json({ related });
    } catch (error) {
        console.error('Error in /explore-related:', error.message);
        res.status(500).json({ error: 'Failed to find related places', related: [] });
    }
});

app.get('/random-topic', aiGate, async (req, res) => {
    const type = req.query.type || 'route';
    const prompts = {
        route:     'Name one specific historical journey, migration, trade route, or expedition that can be traced on a map (e.g. "Marco Polo from Venice to Beijing", "the Polynesian migration across the Pacific"). Reply with only the topic phrase, no punctuation at the end, nothing else.',
        timeline:  'Name one specific historical empire, dynasty, war, civilization, or event that has a clear start and end (e.g. "the fall of the Roman Empire", "the Mongol conquests across Eurasia"). Reply with only the topic phrase, nothing else.',
        battle:    'Name one specific historical military commander, war, or conflict whose battles can be mapped (e.g. "Alexander the Great", "the Punic Wars"). Reply with only the name or phrase, nothing else.',
        spread:    'Name one specific historical phenomenon, religion, disease, idea, or people that spread geographically (e.g. "the Black Death", "Islam after Muhammad\'s death"). Reply with only the subject name, nothing else. It will be used in "Where did ___ spread?"',
        geography: 'Name one specific river, mountain range, desert, sea, strait, or trade route that has historical significance (e.g. "the Nile River and ancient Egypt", "the Silk Road terrain"). Reply with only the topic phrase, nothing else.',
        compare:   'Name two historical empires, civilizations, or powers that can be interestingly compared (e.g. "Rome and Han China at their peak", "the Aztecs and Incas"). Reply in the format "X and Y", nothing else.',
    };
    try {
        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 60,
            temperature: 1,
            messages: [{ role: 'user', content: prompts[type] || prompts.route }],
        });
        recordUsage('random-topic', req.authed, response.usage);
        res.json({ topic: response.content[0].text.trim() });
    } catch {
        res.status(500).json({ topic: null });
    }
});

app.get('/getGoogleMapsApiKey', (req, res) => {
    res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
});

// Dev-only: lets tools/globe-editor.html write its generated globe CSS
// straight into css/styles.css, between the GLOBE:START/GLOBE:END markers.
if (process.env.NODE_ENV !== 'production') {
    app.post('/tools/save-globe-css', (req, res) => {
        try {
            const block = req.body && req.body.css;
            if (!block || typeof block !== 'string') {
                return res.status(400).json({ error: 'Missing css string in body' });
            }
            const cssPath = path.join(__dirname, 'css', 'styles.css');
            const original = fs.readFileSync(cssPath, 'utf8');
            const start = '/* GLOBE:START — generated by tools/globe-editor.html, do not hand-edit between markers */';
            const end = '/* GLOBE:END */';
            const startIdx = original.indexOf(start);
            const endIdx = original.indexOf(end);
            if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
                return res.status(500).json({ error: 'GLOBE markers not found in styles.css' });
            }
            const updated =
                original.slice(0, startIdx) +
                start + '\n' +
                block.trim() + '\n' +
                end +
                original.slice(endIdx + end.length);
            fs.writeFileSync(cssPath, updated, 'utf8');
            res.json({ ok: true });
        } catch (error) {
            console.error('Error in /tools/save-globe-css:', error.message);
            res.status(500).json({ error: 'Failed to write styles.css' });
        }
    });
}

// Dev-only: lets tools/prompts-editor.html read and rewrite the example-prompt
// data (RANDOM_QUESTIONS, the template topic pools, and the compare pairs)
// straight into js/main.js, between the PROMPTS:START/PROMPTS:END markers.
if (process.env.NODE_ENV !== 'production') {
    const mainJsPath = path.join(__dirname, 'js', 'main.js');
    const START = '// PROMPTS:START — managed by tools/prompts-editor.html, do not hand-edit structure between markers';
    const END = '// PROMPTS:END';

    function readPromptsBlock() {
        const original = fs.readFileSync(mainJsPath, 'utf8');
        const startIdx = original.indexOf(START);
        const endIdx = original.indexOf(END);
        if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
            throw new Error('PROMPTS markers not found in js/main.js');
        }
        return {
            original,
            startIdx,
            endIdx,
            block: original.slice(startIdx + START.length, endIdx),
        };
    }

    function quoteList(arr, indent) {
        return arr.map(s => `${indent}${JSON.stringify(s)},`).join('\n');
    }

    app.get('/tools/load-prompts-js', (req, res) => {
        try {
            const { block } = readPromptsBlock();
            // The block only ever contains plain data literals (arrays/objects of
            // strings) between the markers, so evaluating it locally to recover
            // the structured data is safe — it's our own source file, not
            // user-supplied input.
            const data = new Function(`${block}\nreturn { RANDOM_QUESTIONS, FAVORITE_QUESTIONS, POOL: _POOL, COMPARE_A: _COMPARE_A, COMPARE_B: _COMPARE_B };`)();
            res.json(data);
        } catch (error) {
            console.error('Error in /tools/load-prompts-js:', error.message);
            res.status(500).json({ error: 'Failed to read js/main.js' });
        }
    });

    app.post('/tools/save-prompts-js', (req, res) => {
        try {
            const { RANDOM_QUESTIONS, FAVORITE_QUESTIONS, POOL, COMPARE_A, COMPARE_B } = req.body || {};
            const lists = { RANDOM_QUESTIONS, FAVORITE_QUESTIONS, route: POOL && POOL.route, timeline: POOL && POOL.timeline,
                battle: POOL && POOL.battle, spread: POOL && POOL.spread, geography: POOL && POOL.geography,
                COMPARE_A, COMPARE_B };
            for (const [name, list] of Object.entries(lists)) {
                if (!Array.isArray(list) || !list.every(s => typeof s === 'string')) {
                    return res.status(400).json({ error: `Missing or invalid list: ${name}` });
                }
            }
            const randomSet = new Set(RANDOM_QUESTIONS);
            if (!FAVORITE_QUESTIONS.every(q => randomSet.has(q))) {
                return res.status(400).json({ error: 'FAVORITE_QUESTIONS must be a subset of RANDOM_QUESTIONS' });
            }

            const generated = `
const RANDOM_QUESTIONS = [
${quoteList(RANDOM_QUESTIONS, '    ')}
];

// Pinned/preferred prompts — curated in tools/prompts-editor.html. These are
// favored as landing-page suggestion chips over the general random pool.
const FAVORITE_QUESTIONS = [
${quoteList(FAVORITE_QUESTIONS, '    ')}
];

// Per-template topic pools
const _POOL = {
    route: [
${quoteList(POOL.route, '        ')}
    ],
    timeline: [
${quoteList(POOL.timeline, '        ')}
    ],
    battle: [
${quoteList(POOL.battle, '        ')}
    ],
    spread: [
${quoteList(POOL.spread, '        ')}
    ],
    geography: [
${quoteList(POOL.geography, '        ')}
    ],
};

// Compare template uses pairs drawn from two separate pools
const _COMPARE_A = [
${quoteList(COMPARE_A, '    ')}
];
const _COMPARE_B = [
${quoteList(COMPARE_B, '    ')}
];
`;

            const { original, startIdx, endIdx } = readPromptsBlock();
            const updated = original.slice(0, startIdx) + START + generated + END + original.slice(endIdx + END.length);
            fs.writeFileSync(mainJsPath, updated, 'utf8');
            res.json({ ok: true });
        } catch (error) {
            console.error('Error in /tools/save-prompts-js:', error.message);
            res.status(500).json({ error: 'Failed to write js/main.js' });
        }
    });
}

// Dev-only: lets tools/prompts-editor.html manage draft "custom lists" of
// candidate prompts — separate from the live js/main.js data — plus an AI
// generator for filling a list with candidates for a given description.
if (process.env.NODE_ENV !== 'production') {
    const customListsPath = path.join(__dirname, 'tools', 'custom-prompt-lists.json');

    function readCustomLists() {
        try {
            const raw = fs.readFileSync(customListsPath, 'utf8');
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed.lists) ? parsed : { lists: [] };
        } catch {
            return { lists: [] };
        }
    }

    app.get('/tools/load-custom-lists', (req, res) => {
        res.json(readCustomLists());
    });

    app.post('/tools/save-custom-lists', (req, res) => {
        try {
            const { lists } = req.body || {};
            if (!Array.isArray(lists)) {
                return res.status(400).json({ error: 'Missing or invalid lists array' });
            }
            for (const l of lists) {
                if (typeof l.id !== 'string' || typeof l.name !== 'string' ||
                    !Array.isArray(l.prompts) || !l.prompts.every(p => typeof p === 'string')) {
                    return res.status(400).json({ error: 'Malformed list entry' });
                }
            }
            fs.writeFileSync(customListsPath, JSON.stringify({ lists }, null, 2), 'utf8');
            res.json({ ok: true });
        } catch (error) {
            console.error('Error in /tools/save-custom-lists:', error.message);
            res.status(500).json({ error: 'Failed to write custom-prompt-lists.json' });
        }
    });

    app.post('/tools/generate-prompts', aiGate, async (req, res) => {
        try {
            const { description, count, existing } = req.body || {};
            if (!description || typeof description !== 'string') {
                return res.status(400).json({ error: 'Missing description' });
            }
            const n = Math.min(Math.max(parseInt(count, 10) || 5, 1), 15);
            const avoidList = Array.isArray(existing) ? existing.slice(0, 200) : [];
            const avoidBlock = avoidList.length
                ? `\n\nDo not repeat or closely rephrase any of these already-used prompts:\n${avoidList.map(q => `- ${q}`).join('\n')}`
                : '';

            const response = await anthropic.messages.create({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1000,
                temperature: 1,
                messages: [{
                    role: 'user',
                    content: `You are writing example prompts for a history/geography exploration app called Earthlopedia. Each prompt is a short, punchy, specific question or command about a real historical journey, empire, battle, migration, place, or geographic phenomenon — written to make someone curious enough to click it. Examples of the house style:\n- "Trace every stop on Marco Polo's 24-year journey from Venice to Beijing"\n- "Map exactly where the Black Death spread year by year from 1347 to 1353"\n- "Why does Africa have so many suspiciously straight borders?"\n- "How Polynesian sailors navigated by stars and waves to find every Pacific island"\n\nWrite ${n} new prompts matching that style, all specifically about: "${description}"${avoidBlock}\n\nReply with ONLY a JSON array of ${n} strings, nothing else — no preamble, no markdown fences.`
                }],
            });

            recordUsage('tools/generate-prompts', req.authed, response.usage);
            const raw = response.content[0].text.trim();
            const start = raw.indexOf('[');
            const end = raw.lastIndexOf(']');
            if (start === -1 || end === -1) throw new Error('No JSON array in response');
            const prompts = JSON.parse(raw.slice(start, end + 1)).filter(p => typeof p === 'string' && p.trim());
            res.json({ prompts });
        } catch (error) {
            console.error('Error in /tools/generate-prompts:', error.message);
            res.status(500).json({ error: 'Failed to generate prompts' });
        }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`);
});
