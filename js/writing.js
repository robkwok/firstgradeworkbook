/* ============================================================
   WRITING activities
   - Letter Tracing (canvas, finger/Apple Pencil, coverage check)
   - Build a Sentence (word order)
   - Fix the Sentence (capitals + end marks)
   - Spell It! (letter tiles)
   ============================================================ */

/* ---------------- Letter Tracing ---------------- */
const Trace = {
  SETS: {
    upper:  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    lower:  "abcdefghijklmnopqrstuvwxyz".split(""),
    digits: "0123456789".split("")
  },
  TAB_LABEL: { upper: "ABC", lower: "abc", digits: "123" },
  mode: "upper",
  idx: 0,
  sessionDone: 0,
  canvas: null, ctx: null, mask: null, ink: null,
  letterPixels: 0, activePointer: null, last: null, done: false,

  key(l) { return (this.mode === "digits" ? "D:" : this.mode === "upper" ? "U:" : "L:") + l; },
  isDone(l) { return !!App.state.traceDone[this.key(l)]; },

  open() {
    this.sessionDone = this.sessionDone || 0;
    const letters = this.SETS[this.mode];
    // start at first untraced letter
    const firstNew = letters.findIndex(l => !this.isDone(l));
    this.idx = firstNew === -1 ? 0 : firstNew;

    App.setScreen(`
      <div class="trace-page">
        <div class="trace-tabs">
          ${Object.keys(this.SETS).map(m =>
            `<button class="tab-btn ${m === this.mode ? "on" : ""}" data-mode="${m}">${this.TAB_LABEL[m]}</button>`).join("")}
        </div>
        <div class="letter-strip" id="letter-strip"></div>
        <div class="trace-prompt" id="trace-prompt"></div>
        <div class="canvas-wrap" id="canvas-wrap">
          <canvas id="trace-canvas"></canvas>
          <div class="trace-flash" id="trace-flash">✨</div>
        </div>
        <div class="trace-meter"><div class="trace-meter-fill" id="trace-meter"></div></div>
        <div class="trace-btns">
          <button class="big-btn tan" id="trace-prev">◀</button>
          <button class="big-btn orange" id="trace-clear">Clear ↺</button>
          <button class="big-btn tan" id="trace-next">▶</button>
        </div>
      </div>
    `, { title: "Letter Tracing ✍️", backTo: () => App.goSubject("writing") });

    document.querySelectorAll(".tab-btn").forEach(b =>
      b.addEventListener("click", () => { Capy.Sfx.pop(); this.mode = b.dataset.mode; this.open(); }));
    document.getElementById("trace-prev").addEventListener("click", () => this.step(-1));
    document.getElementById("trace-next").addEventListener("click", () => this.step(1));
    document.getElementById("trace-clear").addEventListener("click", () => { Capy.Sfx.pop(); this.resetInk(); });

    this.canvas = document.getElementById("trace-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.bindPointer();
    this.renderStrip();

    const ready = (document.fonts && document.fonts.load)
      ? document.fonts.load('400 100px "Patrick Hand"').catch(() => {})
      : Promise.resolve();
    ready.then(() => this.setupCanvas());

    if (!this._resizeBound) {
      this._resizeBound = true;
      let t = null;
      window.addEventListener("resize", () => {
        if (!document.getElementById("trace-canvas")) return;
        clearTimeout(t); t = setTimeout(() => this.setupCanvas(), 200);
      });
    }
  },

  letter() { return this.SETS[this.mode][this.idx]; },

  step(dir) {
    Capy.Sfx.pop();
    const n = this.SETS[this.mode].length;
    this.idx = (this.idx + dir + n) % n;
    this.renderStrip();
    this.setupCanvas();
  },

  renderStrip() {
    const strip = document.getElementById("letter-strip");
    if (!strip) return;
    strip.innerHTML = this.SETS[this.mode].map((l, i) =>
      `<button class="letter-chip ${i === this.idx ? "on" : ""} ${this.isDone(l) ? "chip-done" : ""}" data-i="${i}">${l}${this.isDone(l) ? "<span class='chip-check'>✓</span>" : ""}</button>`
    ).join("");
    strip.querySelectorAll(".letter-chip").forEach(b =>
      b.addEventListener("click", () => { this.idx = +b.dataset.i; Capy.Sfx.pop(); this.renderStrip(); this.setupCanvas(); }));
    const on = strip.querySelector(".letter-chip.on");
    if (on) on.scrollIntoView({ inline: "center", block: "nearest" });
  },

  setupCanvas() {
    const wrap = document.getElementById("canvas-wrap");
    if (!wrap || !this.canvas) return;
    const cssW = wrap.clientWidth;
    const cssH = Math.min(Math.round(cssW * 0.62), Math.round(innerHeight * 0.46));
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.style.height = cssH + "px";
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.dpr = dpr;

    this.mask = document.createElement("canvas");
    this.mask.width = this.canvas.width; this.mask.height = this.canvas.height;
    this.ink = document.createElement("canvas");
    this.ink.width = this.canvas.width; this.ink.height = this.canvas.height;

    this.done = false;
    this.drawBoard();
    this.resetInk();

    const l = this.letter();
    const label = this.mode === "digits" ? "number" : "letter";
    document.getElementById("trace-prompt").innerHTML =
      `Trace the ${label} <b class="trace-target">${l}</b> ${UI.speakerBtn(`Trace the ${label} ${l}!`)}`;
    Capy.speak(`Trace the ${label} ${l}!`);
  },

  /* guides + big pale glyph; also paints the mask used for scoring */
  drawBoard() {
    const { ctx, canvas } = this;
    const W = canvas.width, H = canvas.height;
    const sky = H * 0.16, base = H * 0.70;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#FFFDF6";
    ctx.fillRect(0, 0, W, H);

    // measure font ratios at 100px
    const fam = '"Patrick Hand", "Comic Sans MS", sans-serif';
    ctx.font = `400 100px ${fam}`;
    const capA = ctx.measureText("H").actualBoundingBoxAscent || 70;
    const xA = ctx.measureText("x").actualBoundingBoxAscent || 48;
    const fontSize = (base - sky) / (capA / 100);
    const midY = base - fontSize * (xA / 100);

    // handwriting guides: sky (blue), mid (dashed), grass (green)
    const line = (y, color, dash) => {
      ctx.beginPath();
      ctx.setLineDash(dash || []);
      ctx.strokeStyle = color; ctx.lineWidth = 3 * this.dpr;
      ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.setLineDash([]);
    };
    line(sky, "#BBDEF2");
    line(midY, "#D8CBB6", [12 * this.dpr, 10 * this.dpr]);
    line(base, "#BCD9A9");

    // glyph
    const l = this.letter();
    ctx.font = `400 ${fontSize}px ${fam}`;
    ctx.textBaseline = "alphabetic";
    const w = ctx.measureText(l).width;
    const x = (W - w) / 2;
    ctx.fillStyle = "#EBDFC8";
    ctx.fillText(l, x, base);
    ctx.strokeStyle = "#D9C8A8";
    ctx.lineWidth = 2 * this.dpr;
    ctx.strokeText(l, x, base);

    // mask for scoring
    const m = this.mask.getContext("2d");
    m.clearRect(0, 0, W, H);
    m.font = ctx.font; m.textBaseline = "alphabetic";
    m.fillStyle = "#000";
    m.fillText(l, x, base);
    const md = m.getImageData(0, 0, W, H).data;
    let count = 0;
    for (let i = 3; i < md.length; i += 8) if (md[i] > 40) count++; // sample every other px
    this.letterPixels = Math.max(count, 1);
    this.updateMeter(0);
  },

  resetInk() {
    if (!this.ink) return;
    this.ink.getContext("2d").clearRect(0, 0, this.ink.width, this.ink.height);
    this.drawBoard();
    this.done = false;
    this.updateMeter(0);
  },

  bindPointer() {
    const cv = this.canvas;
    const pos = e => {
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) };
    };
    cv.addEventListener("pointerdown", e => {
      if (this.done || this.activePointer !== null) return;
      this.activePointer = e.pointerId;
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      this.last = pos(e);
      this.dab(this.last);
      e.preventDefault();
    });
    cv.addEventListener("pointermove", e => {
      if (e.pointerId !== this.activePointer) return;
      const p = pos(e);
      this.stroke(this.last, p);
      this.last = p;
      e.preventDefault();
    });
    const up = e => {
      if (e.pointerId !== this.activePointer) return;
      this.activePointer = null;
      this.evaluate();
    };
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
  },

  inkWidth() { return Math.max(16, this.canvas.width * 0.045); },

  dab(p) { this.stroke(p, { x: p.x + 0.1, y: p.y + 0.1 }); },

  stroke(a, b) {
    for (const c of [this.ctx, this.ink.getContext("2d")]) {
      c.strokeStyle = "#F59E2D";
      c.lineWidth = this.inkWidth();
      c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    }
  },

  evaluate() {
    if (this.done) return;
    const W = this.canvas.width, H = this.canvas.height;
    const md = this.mask.getContext("2d").getImageData(0, 0, W, H).data;
    const id = this.ink.getContext("2d").getImageData(0, 0, W, H).data;
    let hit = 0, inkTotal = 0, inkIn = 0;
    for (let i = 3; i < md.length; i += 8) {
      const m = md[i] > 40, k = id[i] > 40;
      if (k) { inkTotal++; if (m) inkIn++; }
      if (m && k) hit++;
    }
    const coverage = hit / this.letterPixels;
    const accuracy = inkTotal ? inkIn / inkTotal : 0;
    this.updateMeter(Math.min(1, coverage / 0.55));

    if (coverage >= 0.55 && accuracy >= 0.28) this.completeLetter();
    else if (coverage >= 0.55) {
      Capy.speak("Try to stay on the letter!");
      Celebrate.toast("🖍️ Try to stay on the letter!");
    }
  },

  updateMeter(frac) {
    const m = document.getElementById("trace-meter");
    if (m) m.style.width = Math.round(frac * 100) + "%";
  },

  completeLetter() {
    this.done = true;
    Capy.Sfx.ding();
    App.state.traceDone[this.key(this.letter())] = true;
    App.save();

    const flash = document.getElementById("trace-flash");
    if (flash) { flash.classList.remove("go"); void flash.offsetWidth; flash.classList.add("go"); }
    UI.praiseFloat(document.getElementById("canvas-wrap"));

    this.sessionDone++;
    this.updateTraceStars();
    if (this.sessionDone % 5 === 0) {
      App.addYuzu(1);
      Capy.Confetti.burst(90);
      Celebrate.toast("🍊 +1 yuzu! Five letters traced!");
      Capy.speak("Five letters! You earned a yuzu!");
    }
    setTimeout(() => { this.renderStrip(); this.step(1); }, 1100);
  },

  updateTraceStars() {
    const total = Object.keys(App.state.traceDone).length;
    const stars = total >= 40 ? 3 : total >= 20 ? 2 : total >= 8 ? 1 : 0;
    if (stars > App.starsFor("write-trace")) App.setStars("write-trace", stars);
  }
};

registerActivity({
  id: "write-trace", subject: "writing", custom: true,
  emoji: "✍️", title: "Letter Tracing",
  blurb: "Trace letters and numbers with your finger",
  open: () => Trace.open()
});

/* ---------------- Build a Sentence ---------------- */
registerActivity({
  id: "write-scramble", subject: "writing",
  emoji: "🧩", title: "Build a Sentence",
  blurb: "Put the words in the right order",
  buildRound(level) {
    return sample(DATA.scrambles[level], 5).map(words => ({
      render(area) {
        const target = words.join(" ");
        const spoken = target.replace(/[.?!]/g, "");
        area.innerHTML = `
          <div class="prompt-bar">🧩 Put the words in order! ${UI.speakerBtn(spoken)}</div>
          <div class="slot-row" id="sc-row"></div>
          <div class="tile-tray" id="sc-tray"></div>`;
        const row = area.querySelector("#sc-row");
        const tray = area.querySelector("#sc-tray");

        let order = shuffle(words);
        if (order.join(" ") === target) order = order.slice().reverse();
        order.forEach(w => {
          const t = document.createElement("button");
          t.className = "word-tile";
          t.textContent = w;
          t.dataset.w = w;
          t.addEventListener("click", () => {
            if (row.dataset.done) return;
            Capy.Sfx.pop();
            (t.parentElement === tray ? row : tray).appendChild(t);
            if (row.children.length === words.length) {
              const built = [...row.children].map(x => x.dataset.w).join(" ");
              if (built === target) {
                row.dataset.done = "1";
                [...row.children].forEach(x => x.classList.add("tile-good"));
                Engine.submit(true);
              } else Engine.submit(false);
            }
          });
          tray.appendChild(t);
        });

        Engine.currentReveal = () => {
          row.dataset.done = "1";
          row.innerHTML = words.map(w => `<span class="word-tile tile-good">${w}</span>`).join("");
          tray.innerHTML = "";
        };
      }
    }));
  }
});

/* ---------------- Fix the Sentence ---------------- */
registerActivity({
  id: "write-fix", subject: "writing",
  emoji: "🛠️", title: "Fix the Sentence",
  blurb: "Add capitals and the right end mark",
  buildRound(level) {
    return sample(DATA.fixSentences[level], 6).map(item => ({
      render(area) {
        const req = item.caps.concat(item.capName != null ? [item.capName] : []);
        const spoken = item.w.join(" ");
        area.innerHTML = `
          <div class="prompt-bar">🛠️ Fix the sentence! ${UI.speakerBtn(spoken)}</div>
          <p class="hint-line">Tap a word to make it a capital. Then pick an end mark.</p>
          <div class="fix-row" id="fix-row"></div>
          <div class="mark-row" id="mark-row">
            ${[".","?","!"].map(m => `<button class="mark-btn" data-m="${m}">${m}</button>`).join("")}
          </div>
          <button class="big-btn orange check-btn" id="fix-check">Check ✓</button>`;

        const rowEl = area.querySelector("#fix-row");
        const state = { caps: new Set(item.locked), mark: null };

        item.w.forEach((w, i) => {
          const b = document.createElement("button");
          b.className = "fix-word";
          const locked = item.locked.includes(i);
          if (locked) { b.classList.add("locked"); b.disabled = true; }
          const paint = () => { b.textContent = state.caps.has(i) ? capWord(w) : w; };
          paint();
          b.addEventListener("click", () => {
            if (rowEl.dataset.done) return;
            Capy.Sfx.pop();
            state.caps.has(i) ? state.caps.delete(i) : state.caps.add(i);
            b.classList.toggle("capped", state.caps.has(i));
            paint();
          });
          rowEl.appendChild(b);
        });
        const endSlot = document.createElement("span");
        endSlot.className = "end-slot";
        endSlot.textContent = "＿";
        rowEl.appendChild(endSlot);

        area.querySelectorAll(".mark-btn").forEach(mb =>
          mb.addEventListener("click", () => {
            if (rowEl.dataset.done) return;
            Capy.Sfx.pop();
            state.mark = mb.dataset.m;
            area.querySelectorAll(".mark-btn").forEach(x => x.classList.toggle("on", x === mb));
            endSlot.textContent = state.mark;
            endSlot.classList.add("filled");
          }));

        area.querySelector("#fix-check").addEventListener("click", () => {
          if (rowEl.dataset.done) return;
          const capsOk = item.w.every((w, i) => {
            const need = req.includes(i) || item.locked.includes(i);
            return state.caps.has(i) === need;
          });
          const ok = capsOk && state.mark === item.end;
          if (ok) rowEl.dataset.done = "1";
          Engine.submit(ok);
        });

        Engine.currentReveal = () => {
          rowEl.dataset.done = "1";
          const fixed = item.w.map((w, i) =>
            (req.includes(i) || item.locked.includes(i)) ? capWord(w) : w).join(" ") + item.end;
          rowEl.innerHTML = `<span class="fixed-sentence">${fixed}</span>`;
        };
      }
    }));
  }
});

/* ---------------- Spell It! ---------------- */
registerActivity({
  id: "write-spell", subject: "writing",
  emoji: "🔤", title: "Spell It!",
  blurb: "Spell the word with letter tiles",
  buildRound(level) {
    return sample(DATA.words[level], 8).map(({ w, e }) => ({
      render(area) {
        area.innerHTML = `
          <div class="prompt-bar">🔤 Spell the word! ${UI.speakerBtn(w)}</div>
          <div class="spell-pic">${e}</div>
          <div class="slot-row spell-slots" id="sp-slots"></div>
          <div class="tile-tray" id="sp-tray"></div>`;
        Capy.speak(w);

        const slotsEl = area.querySelector("#sp-slots");
        const tray = area.querySelector("#sp-tray");
        const letters = w.split("");

        letters.forEach((_, i) => {
          const s = document.createElement("button");
          s.className = "letter-slot";
          s.dataset.i = i;
          s.addEventListener("click", () => {
            if (slotsEl.dataset.done || !s.dataset.tile) return;
            Capy.Sfx.pop();
            const tile = tray.querySelector(`[data-id="${s.dataset.tile}"]`);
            if (tile) tile.classList.remove("used");
            s.textContent = ""; delete s.dataset.tile;
          });
          slotsEl.appendChild(s);
        });

        const pool = "abcdefghijklmnoprstuw".split("").filter(c => !letters.includes(c));
        const tiles = shuffle(letters.concat(sample(pool, 2)));
        tiles.forEach((c, id) => {
          const t = document.createElement("button");
          t.className = "word-tile letter-tile";
          t.textContent = c;
          t.dataset.id = id;
          t.addEventListener("click", () => {
            if (slotsEl.dataset.done || t.classList.contains("used")) return;
            const empty = [...slotsEl.children].find(s => !s.dataset.tile);
            if (!empty) return;
            Capy.Sfx.pop();
            empty.textContent = c;
            empty.dataset.tile = t.dataset.id;
            t.classList.add("used");
            if ([...slotsEl.children].every(s => s.dataset.tile)) {
              const built = [...slotsEl.children].map(s => s.textContent).join("");
              if (built === w) {
                slotsEl.dataset.done = "1";
                [...slotsEl.children].forEach(s => s.classList.add("slot-good"));
                Engine.submit(true);
              } else Engine.submit(false);
            }
          });
          tray.appendChild(t);
        });

        Engine.currentReveal = () => {
          slotsEl.dataset.done = "1";
          [...slotsEl.children].forEach((s, i) => {
            s.textContent = letters[i];
            s.classList.add("slot-good");
          });
        };
      }
    }));
  }
});
