/* ============================================================
   App core: navigation, progress, shared question engine, UI kit
   ============================================================ */

/* ---------- tiny utils ---------- */
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function choice(arr) { return arr[(Math.random() * arr.length) | 0]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr, n) { return shuffle(arr).slice(0, n); }
function capWord(w) { return w.charAt(0).toUpperCase() + w.slice(1); }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- activity registry ---------- */
const ACTIVITIES = [];
function registerActivity(a) { ACTIVITIES.push(a); }

const SUBJECTS = {
  writing: { title: "Writing", emoji: "✏️", cls: "sub-writing", blurb: "Trace, build, and fix sentences" },
  reading: { title: "Reading", emoji: "📚", cls: "sub-reading", blurb: "Words, rhymes, and stories" },
  math:    { title: "Math",    emoji: "🧮", cls: "sub-math",    blurb: "Count, add, and tell time" }
};

const PRAISE = ["Yay!", "Woohoo!", "Super!", "Nice one!", "You got it!", "Great job!", "Squeak!", "Amazing!"];
const GENTLE = ["Almost!", "Try again!", "So close!", "Keep going!"];

/* ============================================================ App */
const App = {
  store: null,
  els: {},

  /* progress for the current player (a scratch object before a name is set) */
  get state() {
    return (this.store.current && this.store.players[this.store.current]) ||
      this._nobody || (this._nobody = this.blankPlayer());
  },
  blankPlayer() { return { activities: {}, yuzus: 0, traceDone: {}, storyIdx: 0 }; },

  load() {
    try {
      const raw = localStorage.getItem("capyWorkbookV2");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const store = { players: {}, current: null, sound: true };
    // migrate single-player v1 progress, if any
    try {
      const old = localStorage.getItem("capyWorkbookV1");
      if (old) {
        const v1 = JSON.parse(old);
        store.players["Player 1"] = {
          activities: v1.activities || {}, yuzus: v1.yuzus || 0,
          traceDone: v1.traceDone || {}, storyIdx: v1.storyIdx || 0
        };
        store.sound = v1.sound !== false;
        localStorage.removeItem("capyWorkbookV1");
      }
    } catch (e) {}
    return store;
  },
  saveLocal() { try { localStorage.setItem("capyWorkbookV2", JSON.stringify(this.store)); } catch (e) {} },
  save() {
    this.saveLocal();
    if (window.Sync) Sync.schedulePush(); // no-op unless a family code is set
  },

  init() {
    this.store = this.load();
    this.els.screen = document.getElementById("screen");
    this.els.title = document.getElementById("topbar-title");
    this.els.back = document.getElementById("btn-back");
    this.els.yuzu = document.getElementById("yuzu-count");
    this.els.sound = document.getElementById("btn-sound");
    this.els.playerChip = document.getElementById("player-chip");
    this.els.playerName = document.getElementById("player-name");

    Capy.Sfx.on = this.store.sound !== false;
    this.els.sound.textContent = Capy.Sfx.on ? "🔊" : "🔇";
    this.els.sound.addEventListener("click", () => {
      Capy.Sfx.on = !Capy.Sfx.on;
      this.store.sound = Capy.Sfx.on;
      this.els.sound.textContent = Capy.Sfx.on ? "🔊" : "🔇";
      if (Capy.Sfx.on) Capy.Sfx.pop();
      this.save();
    });
    this.els.back.addEventListener("click", () => {
      Capy.Sfx.pop();
      if (this._backTo) this._backTo(); else this.goHome();
    });
    this.els.playerChip.addEventListener("click", () => {
      Capy.Sfx.pop();
      this.goPlayers();
    });

    Capy.Confetti.init(document.getElementById("confetti"));
    this.updateYuzu();
    this.updatePlayerChip();
    if (this.store.current && this.store.players[this.store.current]) this.goHome();
    else this.goPlayers();

    if (this.store.familyCode && window.Sync) Sync.push(); // pull + merge on launch
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.store.familyCode && window.Sync) Sync.push();
    });
  },

  updateYuzu() { this.els.yuzu.textContent = this.state.yuzus; },
  updatePlayerChip() {
    this.els.playerName.textContent = this.store.current || "Name";
  },

  /* ---------------- player picker ---------------- */
  goPlayers() {
    const names = Object.keys(this.store.players);
    const cards = names.map(n => {
      const p = this.store.players[n];
      const stars = Object.values(p.activities).reduce((s, a) => s + (a.stars || 0), 0);
      return `
        <div class="player-card-wrap">
          <button class="player-card" data-name="${escapeHtml(n)}">
            <span class="player-avatar">${Capy.front({ size: 78, happy: true, tangerine: true })}</span>
            <span class="player-label">${escapeHtml(n)}</span>
            <span class="player-stats">⭐ ${stars} · 🍊 ${p.yuzus}</span>
          </button>
          <button class="player-del" data-del="${escapeHtml(n)}" aria-label="Delete player">✕</button>
        </div>`;
    }).join("");

    const hasCurrent = !!(this.store.current && this.store.players[this.store.current]);
    this.setScreen(`
      <div class="players-page">
        <div class="players-hero">${Capy.side({ tangerine: true, size: 170 })}</div>
        <h1 class="players-title">Who’s learning today?</h1>
        ${names.length ? `<div class="player-grid">${cards}</div>` : ""}
        <div class="add-player">
          <input id="player-input" maxlength="14" placeholder="Type your name…"
            autocapitalize="words" autocomplete="off" spellcheck="false" enterkeyhint="go">
          <button class="big-btn orange" id="player-add">Let’s Go! →</button>
        </div>
        <p class="home-tip">Each name saves its own stars, yuzus, and traced letters.</p>
        <button class="sync-link" onclick="Sync.screen()">🔗 Family Sync${this.store.familyCode ? " · on" : ""}</button>
      </div>
    `, { title: "Who’s playing? 👤", backTo: hasCurrent ? () => this.goHome() : null });

    const input = document.getElementById("player-input");
    const add = () => {
      const name = input.value.trim().slice(0, 14);
      if (!name) {
        input.classList.remove("shake-it"); void input.offsetWidth;
        input.classList.add("shake-it");
        return;
      }
      this.selectPlayer(name);
    };
    document.getElementById("player-add").addEventListener("click", add);
    input.addEventListener("keydown", e => { if (e.key === "Enter") add(); });

    document.querySelectorAll(".player-card").forEach(b =>
      b.addEventListener("click", () => this.selectPlayer(b.dataset.name)));
    document.querySelectorAll(".player-del").forEach(b =>
      b.addEventListener("click", () => this.deletePlayer(b.dataset.del)));
  },

  selectPlayer(name) {
    if (!this.store.players[name]) this.store.players[name] = this.blankPlayer();
    this.store.current = name;
    this.save();
    Capy.Sfx.ding();
    Capy.speak(`Hi ${name}! Let's play!`);
    this.updatePlayerChip();
    this.updateYuzu();
    this.goHome();
  },

  deletePlayer(name) {
    if (!confirm(`Delete ${name}’s saved progress?`)) return;
    delete this.store.players[name];
    if (this.store.current === name) this.store.current = null;
    if (this.store.familyCode)
      (this.store.pendingRemove = this.store.pendingRemove || []).push(name);
    this.save();
    this.updatePlayerChip();
    this.goPlayers();
  },

  /* Screen management: content + topbar title + back target */
  setScreen(html, { title = "Cappy’s Workbook", backTo = null } = {}) {
    this._backTo = backTo;
    this.els.back.textContent = backTo ? "◀" : "🏠";
    this.els.back.style.visibility = backTo ? "visible" : "hidden";
    this.els.title.textContent = title;
    const s = this.els.screen;
    s.classList.remove("fade-in");
    s.innerHTML = html;
    void s.offsetWidth; // restart animation
    s.classList.add("fade-in");
    s.scrollTop = 0;
  },

  starsFor(id) { return (this.state.activities[id] || {}).stars || 0; },
  levelFor(id) { return 1 + Math.min(2, this.starsFor(id)); },
  setStars(id, stars) {
    const rec = this.state.activities[id] || (this.state.activities[id] = { stars: 0, plays: 0 });
    rec.stars = Math.max(rec.stars, stars);
    this.save();
  },
  addYuzu(n = 1) { this.state.yuzus += n; this.save(); this.updateYuzu(); },

  subjectStars(subject) {
    const acts = ACTIVITIES.filter(a => a.subject === subject);
    const got = acts.reduce((s, a) => s + this.starsFor(a.id), 0);
    return { got, max: acts.length * 3 };
  },

  /* ---------------- home screen ---------------- */
  goHome() {
    const cards = Object.entries(SUBJECTS).map(([key, s]) => {
      const st = this.subjectStars(key);
      return `
        <button class="subject-card ${s.cls}" onclick="App.goSubject('${key}')">
          <span class="subject-emoji">${s.emoji}</span>
          <span class="subject-name">${s.title}</span>
          <span class="subject-blurb">${s.blurb}</span>
          <span class="subject-stars">⭐ ${st.got} / ${st.max}</span>
        </button>`;
    }).join("");

    const name = this.store.current;
    this.setScreen(`
      <div class="home">
        <div class="hero">
          <div class="hero-capy bob">${Capy.side({ tangerine: true, water: true, size: 230 })}</div>
          <div class="hero-text">
            <h1>Cappy’s Workbook</h1>
            <p class="tagline">First grade fun with your capybara friend! 🌿</p>
            <p class="bubble">“Hi ${escapeHtml(name)}! Pick a subject and let’s play!”</p>
          </div>
        </div>
        <div class="subject-grid">${cards}</div>
        <div class="home-actions">
          <button class="big-btn tan" onclick="App.goReport()">🌟 My Stars</button>
        </div>
        <p class="home-tip">Finish a round to earn a yuzu orange 🍊 for Cappy’s warm bath!</p>
      </div>
    `);
  },

  /* ---------------- subject menu ---------------- */
  goSubject(key) {
    const s = SUBJECTS[key];
    const acts = ACTIVITIES.filter(a => a.subject === key);
    const cards = acts.map(a => {
      const stars = this.starsFor(a.id);
      const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
      const lvl = this.levelFor(a.id);
      return `
        <button class="activity-card ${s.cls}" onclick="App.openActivity('${a.id}')">
          <span class="act-emoji">${a.emoji}</span>
          <span class="act-title">${a.title}</span>
          <span class="act-blurb">${a.blurb}</span>
          <span class="act-meta">
            <span class="act-stars">${starStr}</span>
            <span class="act-level">${["🌱", "🌿", "🌳"][lvl - 1]} Level ${lvl}</span>
          </span>
        </button>`;
    }).join("");

    this.setScreen(`
      <div class="subject-page">
        <div class="subject-banner ${s.cls}">
          <span class="banner-emoji">${s.emoji}</span>
          <div><h2>${s.title}</h2><p>${s.blurb}</p></div>
          <div class="banner-capy">${Capy.side({ size: 110, flip: true })}</div>
        </div>
        <div class="activity-grid">${cards}</div>
      </div>
    `, { title: s.title + " " + s.emoji, backTo: () => this.goHome() });
  },

  openActivity(id) {
    const act = ACTIVITIES.find(a => a.id === id);
    if (!act) return;
    Capy.Sfx.pop();
    if (act.custom) act.open();
    else Engine.start(act);
  },

  /* Round complete → record + celebrate */
  completeRound(act, score, total) {
    const frac = score / total;
    const stars = frac >= 0.9 ? 3 : frac >= 0.65 ? 2 : 1;
    this.setStars(act.id, stars);
    const rec = this.state.activities[act.id];
    rec.plays = (rec.plays || 0) + 1;
    if (!(rec.bestFrac >= frac)) { rec.bestFrac = frac; rec.best = `${score}/${total}`; }
    this.addYuzu(1);
    Celebrate.show({ act, stars, score, total });
  },

  /* ---------------- report card ---------------- */
  goReport() {
    const name = this.store.current;
    const sections = Object.entries(SUBJECTS).map(([key, s]) => {
      const rows = ACTIVITIES.filter(a => a.subject === key).map(a => {
        const rec = this.state.activities[a.id] || {};
        const stars = rec.stars || 0;
        const info = a.id === "write-trace"
          ? `${Object.keys(this.state.traceDone).length} letters traced`
          : rec.plays ? `Played ${rec.plays}× · Best ${rec.best || "—"}` : "Not played yet";
        return `
          <div class="report-row">
            <span class="report-emoji">${a.emoji}</span>
            <span class="report-title">${a.title}</span>
            <span class="report-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</span>
            <span class="report-info">${info}</span>
          </div>`;
      }).join("");
      return `<div class="report-section ${s.cls}"><h3>${s.emoji} ${s.title}</h3>${rows}</div>`;
    }).join("");
    const totalStars = Object.values(this.state.activities).reduce((n, a) => n + (a.stars || 0), 0);

    this.setScreen(`
      <div class="report-page">
        <div class="report-head">
          ${Capy.front({ size: 108, happy: true, tangerine: true })}
          <div>
            <h2>${escapeHtml(name)}’s Report Card</h2>
            <p class="report-totals">⭐ ${totalStars} stars &nbsp;·&nbsp; 🍊 ${this.state.yuzus} yuzus</p>
          </div>
        </div>
        ${sections}
      </div>
    `, { title: "My Stars 🌟", backTo: () => this.goHome() });
  }
};

/* ============================================================ UI kit */
const UI = {
  /* Answer choice grid. items: [{html, label}] — wires itself to Engine. */
  choices(container, items, correctIdx, opts = {}) {
    const grid = document.createElement("div");
    grid.className = "choice-grid " + (opts.cls || "");
    items.forEach((it, i) => {
      const b = document.createElement("button");
      b.className = "choice-btn" + (opts.big ? " big" : "");
      b.innerHTML = it.html || it;
      b.addEventListener("click", () => {
        if (grid.dataset.done) return;
        if (i === correctIdx) {
          b.classList.add("correct");
          grid.dataset.done = "1";
          grid.querySelectorAll("button").forEach(x => x.disabled = true);
          Engine.submit(true);
        } else {
          b.classList.add("wrong");
          b.disabled = true;
          Engine.submit(false);
        }
      });
      grid.appendChild(b);
    });
    Engine.currentReveal = () => {
      grid.dataset.done = "1";
      grid.querySelectorAll("button").forEach((x, i) => {
        x.disabled = true;
        if (i === correctIdx) x.classList.add("correct");
      });
    };
    container.appendChild(grid);
    return grid;
  },

  /* On-screen number pad writing into a display box. */
  numberPad(container, answer, opts = {}) {
    const wrap = document.createElement("div");
    wrap.className = "numpad-wrap";
    const display = opts.display || (() => {
      const d = document.createElement("div");
      d.className = "num-display";
      wrap.appendChild(d);
      return d;
    })();
    display.textContent = "";
    display.classList.add("num-display-live");

    const pad = document.createElement("div");
    pad.className = "numpad";
    const keys = ["1","2","3","4","5","6","7","8","9","⌫","0","✓"];
    let val = "";
    const setVal = v => { val = v; display.textContent = v; display.classList.toggle("empty", !v); };
    setVal("");

    keys.forEach(k => {
      const b = document.createElement("button");
      b.className = "pad-key" + (k === "✓" ? " pad-go" : k === "⌫" ? " pad-del" : "");
      b.textContent = k;
      b.addEventListener("click", () => {
        if (wrap.dataset.done) return;
        Capy.Sfx.pop();
        if (k === "⌫") setVal(val.slice(0, -1));
        else if (k === "✓") {
          if (!val) return;
          const ok = parseInt(val, 10) === answer;
          if (ok) {
            wrap.dataset.done = "1";
            display.classList.add("good");
            Engine.submit(true);
          } else {
            display.classList.add("shake-it");
            setTimeout(() => display.classList.remove("shake-it"), 500);
            setVal("");
            Engine.submit(false);
          }
        } else if (val.length < 3) setVal(val + k);
      });
      pad.appendChild(b);
    });
    Engine.currentReveal = () => {
      wrap.dataset.done = "1";
      display.textContent = answer;
      display.classList.add("good");
    };
    wrap.appendChild(pad);
    container.appendChild(wrap);
    return wrap;
  },

  speakerBtn(text, opts = {}) {
    return `<button class="speaker-btn${opts.big ? " big" : ""}" onclick="Capy.speak(${JSON.stringify(text).replace(/"/g, "&quot;")})" aria-label="Hear it">🔊</button>`;
  },

  praiseFloat(target) {
    const p = document.createElement("div");
    p.className = "praise-float";
    p.textContent = choice(PRAISE) + " " + choice(["✨", "🎉", "🌟", "🍊", "💛"]);
    (target || document.getElementById("screen")).appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
};

/* ============================================================ Engine
   Shared flow for quiz-style rounds:
   - correct → chime, praise, auto-advance
   - wrong → gentle shake, retry; after 2 misses reveal answer & move on
*/
const Engine = {
  act: null, qs: [], i: 0, score: 0, tries: 0, locked: false,
  currentReveal: null,

  start(act) {
    this.act = act;
    this.level = App.levelFor(act.id);
    this.qs = act.buildRound(this.level);
    this.i = 0; this.score = 0;
    App.setScreen(`
      <div class="round">
        <div class="round-head">
          <span class="round-emoji">${act.emoji}</span>
          <div class="round-titles">
            <h2>${act.title}</h2>
            <span class="act-level">${["🌱","🌿","🌳"][this.level - 1]} Level ${this.level}</span>
          </div>
          <div class="qdots" id="qdots"></div>
        </div>
        <div class="qcard" id="qarea"></div>
      </div>
    `, { title: act.title, backTo: () => App.goSubject(act.subject) });
    this.renderDots();
    this.show();
  },

  renderDots() {
    const dots = document.getElementById("qdots");
    if (!dots) return;
    dots.innerHTML = this.qs.map((q, idx) => {
      let cls = "dot";
      if (idx < this.i) cls += q._got ? " good" : " miss";
      else if (idx === this.i) cls += " now";
      return `<span class="${cls}"></span>`;
    }).join("");
  },

  show() {
    this.tries = 0; this.locked = false; this.currentReveal = null;
    this.renderDots();
    const area = document.getElementById("qarea");
    if (!area) return;
    area.innerHTML = "";
    area.classList.remove("shake-it");
    this.qs[this.i].render(area);
  },

  submit(ok) {
    if (this.locked) return;
    const q = this.qs[this.i];
    if (ok) {
      this.locked = true;
      if (this.tries === 0) { this.score++; q._got = true; }
      Capy.Sfx.ding();
      UI.praiseFloat(document.getElementById("qarea"));
      setTimeout(() => this.advance(), 950);
    } else {
      this.tries++;
      Capy.Sfx.boop();
      const area = document.getElementById("qarea");
      if (area) {
        area.classList.remove("shake-it"); void area.offsetWidth;
        area.classList.add("shake-it");
      }
      if (this.tries >= 2) {
        this.locked = true;
        if (this.currentReveal) this.currentReveal();
        if (q.reveal) q.reveal();
        setTimeout(() => this.advance(), 1700);
      }
    }
  },

  advance() {
    this.i++;
    if (this.i >= this.qs.length) {
      App.completeRound(this.act, this.score, this.qs.length);
    } else this.show();
  }
};

/* ============================================================ Celebrate */
const Celebrate = {
  show({ act, stars, score, total }) {
    const ov = document.getElementById("overlay");
    let headline = choice(["Amazing work!", "Way to go!", "Capy-tastic!", "You did it!", "Super swimmer!"]);
    const name = App.store.current;
    if (name) headline = headline.replace(/!$/, `, ${escapeHtml(name)}!`);
    ov.innerHTML = `
      <div class="celebrate-card pop-in">
        <div class="celebrate-capy">${Capy.front({ tangerine: true, happy: true, size: 170 })}</div>
        <h2>${headline}</h2>
        <div class="star-row">
          ${[0,1,2].map(i => `<span class="big-star ${i < stars ? "lit" : ""}" style="animation-delay:${0.25 + i * 0.28}s">★</span>`).join("")}
        </div>
        <p class="score-line">You got <b>${score}</b> out of <b>${total}</b> right!</p>
        <p class="yuzu-line">+1 🍊 for Cappy’s bath!</p>
        <div class="celebrate-btns">
          <button class="big-btn orange" id="cel-again">Play Again ↻</button>
          <button class="big-btn green" id="cel-menu">More Games ✓</button>
        </div>
      </div>`;
    ov.hidden = false;
    Capy.Sfx.fanfare();
    Capy.Confetti.burst(150);
    Capy.speak(headline + " You earned a yuzu!");
    document.getElementById("cel-again").addEventListener("click", () => {
      ov.hidden = true; Engine.start(act);
    });
    document.getElementById("cel-menu").addEventListener("click", () => {
      ov.hidden = true; App.goSubject(act.subject);
    });
  },

  /* small mid-activity toast (used by letter tracing milestones) */
  toast(msg) {
    const t = document.createElement("div");
    t.className = "toast pop-in";
    t.innerHTML = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2100);
  }
};

window.addEventListener("DOMContentLoaded", () => App.init());
