/* ============================================================
   Capy — mascot art (inline SVG), sound effects, speech, confetti
   ============================================================ */

const Capy = (() => {

  const C = {
    body:  "#A97C50",
    body2: "#97663F",
    muzzle:"#C9A472",
    dark:  "#6F4E33",
    eye:   "#3B2A1E",
    blush: "#E8A08A",
    orange:"#F59E2D",
    leaf:  "#5F9E4B",
    water: "#A8DEEE",
    water2:"#7CC7E0"
  };

  /* Side-view capybara (the classic loaf). opts: tangerine, water, size */
  function side(opts = {}) {
    const { tangerine = false, water = false, size = 160, flip = false } = opts;
    const legs = water ? "" : `
      <rect x="38" y="112" width="15" height="20" rx="7" fill="${C.body2}"/>
      <rect x="98" y="112" width="15" height="20" rx="7" fill="${C.body2}"/>`;
    const waterShape = water ? `
      <ellipse cx="105" cy="124" rx="102" ry="17" fill="${C.water}"/>
      <path d="M8 122 Q 30 114 55 122 T 105 122 T 155 122 T 202 122" stroke="${C.water2}" stroke-width="4" fill="none" stroke-linecap="round"/>` : "";
    const fruit = tangerine ? `
      <circle cx="128" cy="17" r="12" fill="${C.orange}"/>
      <circle cx="124" cy="13" r="3" fill="#FFC966" opacity="0.8"/>
      <ellipse cx="136" cy="9" rx="6" ry="3.4" fill="${C.leaf}" transform="rotate(-24 136 9)"/>` : "";
    return `<svg viewBox="0 0 210 140" width="${size}" ${flip ? 'style="transform:scaleX(-1)"' : ""} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${water ? "" : `<ellipse cx="100" cy="130" rx="88" ry="8" fill="rgba(111,78,51,.14)"/>`}
      <rect x="14" y="56" width="132" height="68" rx="34" fill="${C.body}"/>
      ${legs}
      <rect x="104" y="28" width="78" height="64" rx="27" fill="${C.body}"/>
      <rect x="144" y="52" width="40" height="40" rx="17" fill="${C.muzzle}"/>
      <circle cx="122" cy="29" r="9" fill="${C.body2}"/>
      <circle cx="122" cy="29" r="4" fill="${C.dark}"/>
      <circle cx="148" cy="25" r="8" fill="${C.body2}"/>
      <circle cx="148" cy="25" r="3.4" fill="${C.dark}"/>
      <circle cx="136" cy="56" r="4.6" fill="${C.eye}"/>
      <circle cx="137.6" cy="54.4" r="1.6" fill="#fff"/>
      <ellipse cx="167" cy="63" rx="3" ry="4" fill="${C.dark}"/>
      <ellipse cx="176" cy="65" rx="3" ry="4" fill="${C.dark}"/>
      <path d="M166 78 q6 5 14 1" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="146" cy="72" rx="6" ry="4" fill="${C.blush}" opacity="0.55"/>
      ${fruit}
      ${waterShape}
    </svg>`;
  }

  /* Front-facing capybara for celebrations. opts: happy (closed ^^ eyes) */
  function front(opts = {}) {
    const { tangerine = true, happy = true, size = 190 } = opts;
    const eyes = happy
      ? `<path d="M70 84 q8 -9 16 0" stroke="${C.eye}" stroke-width="5" fill="none" stroke-linecap="round"/>
         <path d="M114 84 q8 -9 16 0" stroke="${C.eye}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : `<circle cx="78" cy="84" r="6" fill="${C.eye}"/><circle cx="122" cy="84" r="6" fill="${C.eye}"/>`;
    const fruit = tangerine ? `
      <circle cx="100" cy="22" r="14" fill="${C.orange}"/>
      <circle cx="95" cy="17" r="3.6" fill="#FFC966" opacity="0.8"/>
      <ellipse cx="110" cy="12" rx="7" ry="4" fill="${C.leaf}" transform="rotate(-24 110 12)"/>` : "";
    return `<svg viewBox="0 0 200 170" width="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="100" cy="160" rx="72" ry="7" fill="rgba(111,78,51,.14)"/>
      <circle cx="57" cy="42" r="14" fill="${C.body2}"/><circle cx="57" cy="42" r="6" fill="${C.dark}"/>
      <circle cx="143" cy="42" r="14" fill="${C.body2}"/><circle cx="143" cy="42" r="6" fill="${C.dark}"/>
      <rect x="40" y="32" width="120" height="112" rx="46" fill="${C.body}"/>
      ${eyes}
      <rect x="68" y="98" width="64" height="46" rx="21" fill="${C.muzzle}"/>
      <ellipse cx="91" cy="114" rx="3.4" ry="4.6" fill="${C.dark}"/>
      <ellipse cx="109" cy="114" rx="3.4" ry="4.6" fill="${C.dark}"/>
      <path d="M92 130 q8 7 16 0" stroke="${C.dark}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="58" cy="104" rx="8" ry="5.4" fill="${C.blush}" opacity="0.6"/>
      <ellipse cx="142" cy="104" rx="8" ry="5.4" fill="${C.blush}" opacity="0.6"/>
      ${fruit}
    </svg>`;
  }

  /* Tiny capybara used as a counting manipulative */
  function mini(size = 52) {
    return side({ size, tangerine: false, water: false });
  }

  /* ---------------- Sound effects (WebAudio, no files) ---------------- */
  let actx = null;
  function audio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(freq, start, dur, type = "sine", vol = 0.18) {
    const ctx = audio(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    const t = ctx.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function chirp(f1, f2, start, dur, vol = 0.12) {
    const ctx = audio(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    const t = ctx.currentTime + start;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  const Sfx = {
    on: true,
    ding()   { if (this.on) { tone(660, 0, 0.12, "sine", 0.2); tone(880, 0.1, 0.2, "sine", 0.2); } },
    boop()   { if (this.on) tone(200, 0, 0.22, "triangle", 0.12); },
    pop()    { if (this.on) tone(720, 0, 0.06, "square", 0.06); },
    fanfare(){ if (this.on) [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.28, "sine", 0.2)); },
    squeak() { if (this.on) { chirp(600, 1400, 0, 0.09); chirp(750, 1550, 0.13, 0.08); } }
  };

  /* ---------------- Text to speech ---------------- */
  let voice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return null;
    const vs = speechSynthesis.getVoices().filter(v => v.lang && v.lang.startsWith("en"));
    return vs.find(v => /Samantha|Karen|Google US/i.test(v.name)) || vs[0] || null;
  }
  if ("speechSynthesis" in window) {
    speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); };
  }
  function speak(text, rate = 0.92, pitch = 1.05) {
    if (!Sfx.on || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (!voice) voice = pickVoice();
      if (voice) u.voice = voice;
      u.rate = rate; u.pitch = pitch; u.lang = "en-US";
      speechSynthesis.speak(u);
    } catch (e) { /* speech is a nice-to-have */ }
  }

  /* ---------------- Tap-to-talk catchphrases ---------------- */
  const PHRASES = {
    general: [
      "Stay calm and capy on!",
      "Squeak-squeak!",
      "Easy peasy, capy-breezy!",
      "I love yuzu baths!",
      "Splish splash!",
      "Munch, munch… sweet grass!",
      "Capybaras never rush.",
      "You're my favorite study buddy!",
      "Did you know? I can sleep in the water!",
      "Chillin' like a capybara."
    ],
    home: [
      "Pick a game — any game!",
      "Learning time is the best time!",
      "What shall we play today?"
    ],
    writing: [
      "Wiggle those writing fingers!",
      "Capital letters stand tall — like my ears!",
      "Every sentence ends with a splash… I mean, a period!"
    ],
    reading: [
      "Sound it out, super reader!",
      "Once upon a capybara…",
      "Books are ponds — dive right in!"
    ],
    math: [
      "You can count on me!",
      "One yuzu, two yuzus, three!",
      "Numbers are my friends… after ducks."
    ],
    players: [
      "Who's splashing in today?",
      "Hello, new friend!",
      "Welcome to my pond!"
    ],
    report: [
      "Wow, look at all those stars!",
      "I'm so proud of you!",
      "Shiny, shiny stars!"
    ],
    praise: [
      "Capy-tastic!",
      "You did it! Squeak!",
      "Super-duper swimmer!"
    ]
  };
  const lastPhrase = {};

  /* wrap a mascot SVG so tapping it makes Cappy talk */
  function tappable(svg, pool = "general") {
    return `<button class="capy-tap" aria-label="Tap Cappy" onclick="Capy.chat(this, '${pool}')">${svg}</button>`;
  }

  function chat(el, pool = "general") {
    const options = (PHRASES[pool] || []).concat(PHRASES.general);
    let i = (Math.random() * options.length) | 0;
    if (options.length > 1 && i === lastPhrase[pool]) i = (i + 1) % options.length;
    lastPhrase[pool] = i;
    const phrase = options[i];

    Sfx.squeak();
    speak(phrase, 1.0, 1.3);

    el.querySelector(".capy-speech")?.remove();
    const b = document.createElement("div");
    b.className = "capy-speech";
    b.textContent = phrase;
    el.appendChild(b);
    requestAnimationFrame(() => {           // keep the bubble on screen
      const r = b.getBoundingClientRect();
      let shift = 0;
      if (r.left < 8) shift = 8 - r.left;
      if (r.right > innerWidth - 8) shift = innerWidth - 8 - r.right;
      if (shift) b.style.transform = `translateX(calc(-50% + ${shift}px))`;
    });
    setTimeout(() => b.remove(), 2400);

    el.classList.remove("capy-wiggle"); void el.offsetWidth;
    el.classList.add("capy-wiggle");
    setTimeout(() => el.classList.remove("capy-wiggle"), 600);
  }

  /* ---------------- Confetti ---------------- */
  const Confetti = {
    canvas: null, ctx: null, parts: [], raf: null,
    colors: ["#F59E2D", "#5F9E4B", "#7CC7E0", "#E8A08A", "#FFD166", "#A97C50"],
    init(canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext("2d");
      const fit = () => {
        canvas.width = innerWidth * devicePixelRatio;
        canvas.height = innerHeight * devicePixelRatio;
      };
      fit(); addEventListener("resize", fit);
    },
    burst(n = 130) {
      if (!this.ctx) return;
      const W = this.canvas.width;
      for (let i = 0; i < n; i++) {
        this.parts.push({
          x: W * (0.2 + Math.random() * 0.6),
          y: -20 * devicePixelRatio - Math.random() * 120,
          vx: (Math.random() - 0.5) * 7 * devicePixelRatio,
          vy: (2.4 + Math.random() * 3.4) * devicePixelRatio,
          s: (5 + Math.random() * 7) * devicePixelRatio,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.25,
          c: this.colors[(Math.random() * this.colors.length) | 0],
          shape: Math.random() < 0.22 ? "circle" : "rect"
        });
      }
      if (!this.raf) this.tick();
    },
    tick() {
      const { ctx, canvas } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.parts = this.parts.filter(p => p.y < canvas.height + 30);
      for (const p of this.parts) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06 * devicePixelRatio; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 7); ctx.fill(); }
        else ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62);
        ctx.restore();
      }
      if (this.parts.length) this.raf = requestAnimationFrame(() => this.tick());
      else { this.raf = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }
  };

  return { side, front, mini, Sfx, speak, Confetti, tappable, chat, colors: C };
})();
