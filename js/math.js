/* ============================================================
   MATH activities (1.OA, 1.NBT, 1.MD alignment)
   - Count with Cappy        (counting to 20)
   - Adding Pond             (addition within 20, visual counters)
   - Take Away Splash        (subtraction within 20)
   - Mystery Number          (missing addends: 3 + ▢ = 8)
   - More or Less            (compare with <, =, >)
   - Tens & Ones             (place value with blocks)
   - Cappy Clock             (time to hour and half hour)
   ============================================================ */

/* Ten-frames: the standard grade-1 counting grid (5 columns x 2 rows).
   Filling rows of five builds subitizing — kids see 7 as "5 and 2"
   instead of counting one by one. */
function tenFrames(n, itemHtml) {
  const frames = Math.max(1, Math.ceil(n / 10));
  let html = `<div class="tf-wrap">`;
  for (let f = 0; f < frames; f++) {
    html += `<div class="ten-frame">`;
    for (let c = 0; c < 10; c++) {
      const idx = f * 10 + c;
      html += `<div class="tf-cell">${idx < n ? itemHtml() : ""}</div>`;
    }
    html += `</div>`;
  }
  return html + `</div>`;
}

/* counters used as visual manipulatives */
function chipRow(n, cls, crossFrom = -1) {
  let html = `<div class="chip-box ${cls}">`;
  for (let i = 0; i < n; i++) {
    const out = crossFrom >= 0 && i >= crossFrom;
    html += `<span class="chip ${cls}${out ? " chip-out" : ""}">${out ? "✕" : ""}</span>`;
  }
  return html + "</div>";
}

function uniqueChoices(correct, makeDistractor, n = 4) {
  const set = new Set([correct]);
  let guard = 0;
  while (set.size < n && guard++ < 200) {
    const d = makeDistractor();
    if (d >= 0) set.add(d);
  }
  return shuffle([...set]);
}

/* ---------------- Count with Cappy ---------------- */
registerActivity({
  id: "math-count", subject: "math",
  emoji: "🔢", title: "Count with Cappy",
  blurb: "How many can you count?",
  buildRound(level) {
    const max = [10, 15, 20][level - 1];
    const items = [
      { html: () => `<span class="count-capy">${Capy.mini(54)}</span>`, name: "capybaras" },
      { html: () => `<span class="count-emoji">🍊</span>`, name: "yuzus" },
      { html: () => `<span class="count-emoji">🦆</span>`, name: "ducks" },
      { html: () => `<span class="count-emoji">🌿</span>`, name: "leaves" }
    ];
    return Array.from({ length: 10 }, () => {
      const n = rnd(3, max);
      const item = choice(items);
      return {
        render(area) {
          area.innerHTML = `
            <div class="prompt-bar">🔢 How many ${item.name}? ${UI.speakerBtn("How many " + item.name + "?")}</div>
            <p class="hint-line">Each row holds five — count by fives!</p>
            ${tenFrames(n, item.html)}`;
          const opts = uniqueChoices(n, () => Math.max(1, n + rnd(-3, 3)));
          UI.choices(area, opts.map(o => ({ html: o })), opts.indexOf(n), { cls: "num-grid", big: true });
        }
      };
    });
  }
});

/* ---------------- Adding Pond ---------------- */
registerActivity({
  id: "math-add", subject: "math",
  emoji: "➕", title: "Adding Pond",
  blurb: "Add the groups together",
  buildRound(level) {
    const maxSum = [10, 15, 20][level - 1];
    return Array.from({ length: 10 }, () => {
      const a = rnd(1, maxSum - 1);
      const b = rnd(1, maxSum - a);
      return {
        render(area) {
          area.innerHTML = `
            <div class="prompt-bar">➕ Add them up! ${UI.speakerBtn(`What is ${a} plus ${b}?`)}</div>
            <div class="chip-scene">${chipRow(a, "teal")}<span class="op-sign">+</span>${chipRow(b, "orange")}</div>
            <div class="equation">${a} + ${b} = <span class="num-display eq-box" id="eq-ans"></span></div>`;
          UI.numberPad(area, a + b, { display: area.querySelector("#eq-ans") });
        }
      };
    });
  }
});

/* ---------------- Take Away Splash ---------------- */
registerActivity({
  id: "math-sub", subject: "math",
  emoji: "➖", title: "Take Away Splash",
  blurb: "Some swim away — how many are left?",
  buildRound(level) {
    const max = [10, 15, 20][level - 1];
    return Array.from({ length: 10 }, () => {
      const a = rnd(3, max);
      const b = rnd(1, a - 1);
      return {
        render(area) {
          area.innerHTML = `
            <div class="prompt-bar">➖ ${b} swim away! How many are left? ${UI.speakerBtn(`What is ${a} minus ${b}?`)}</div>
            <div class="chip-scene">${chipRow(a, "teal", a - b)}</div>
            <div class="equation">${a} − ${b} = <span class="num-display eq-box" id="eq-ans"></span></div>`;
          UI.numberPad(area, a - b, { display: area.querySelector("#eq-ans") });
        }
      };
    });
  }
});

/* ---------------- Mystery Number ---------------- */
registerActivity({
  id: "math-missing", subject: "math",
  emoji: "🎯", title: "Mystery Number",
  blurb: "What number is hiding in the box?",
  buildRound(level) {
    const maxSum = [10, 20, 20][level - 1];
    return Array.from({ length: 10 }, () => {
      const useSub = level >= 3 && Math.random() < 0.4;
      if (useSub) {
        const a = rnd(5, maxSum), ans = rnd(1, a - 1);
        return {
          render(area) {
            area.innerHTML = `
              <div class="prompt-bar">🎯 What number is hiding? ${UI.speakerBtn(`${a} minus what equals ${a - ans}?`)}</div>
              <div class="equation">${a} − <span class="num-display eq-box mystery" id="eq-ans"></span> = ${a - ans}</div>`;
            UI.numberPad(area, ans, { display: area.querySelector("#eq-ans") });
          }
        };
      }
      const sum = rnd(4, maxSum);
      const a = rnd(1, sum - 1);
      const first = Math.random() < 0.5;
      const ans = sum - a;
      return {
        render(area) {
          const eq = first
            ? `${a} + <span class="num-display eq-box mystery" id="eq-ans"></span> = ${sum}`
            : `<span class="num-display eq-box mystery" id="eq-ans"></span> + ${a} = ${sum}`;
          area.innerHTML = `
            <div class="prompt-bar">🎯 What number is hiding? ${UI.speakerBtn(`What plus ${a} equals ${sum}?`)}</div>
            <div class="equation">${eq}</div>`;
          UI.numberPad(area, ans, { display: area.querySelector("#eq-ans") });
        }
      };
    });
  }
});

/* ---------------- More or Less ---------------- */
registerActivity({
  id: "math-compare", subject: "math",
  emoji: "⚖️", title: "More or Less",
  blurb: "Pick the right sign: <, =, or >",
  buildRound(level) {
    const max = [20, 50, 99][level - 1];
    return Array.from({ length: 10 }, () => {
      let a = rnd(1, max), b;
      if (Math.random() < 0.15) b = a;                       // sometimes equal
      else if (level >= 2) {                                  // close numbers are trickier
        b = Math.max(1, Math.min(max, a + choice([-1, 1]) * rnd(1, 9)));
        if (b === a) b = a + 1;
      } else { b = rnd(1, max); if (b === a) b = Math.max(1, a - 1); }
      const ans = a < b ? "<" : a > b ? ">" : "=";
      return {
        render(area) {
          area.innerHTML = `
            <div class="prompt-bar">⚖️ Pick the sign! ${UI.speakerBtn(`Which is right? ${a}, and ${b}.`)}</div>
            <div class="compare-row">
              <span class="num-card">${a}</span>
              <span class="compare-slot" id="cmp-slot">?</span>
              <span class="num-card">${b}</span>
            </div>`;
          const signs = ["<", "=", ">"];
          const grid = UI.choices(area, signs.map(s => ({ html: s })), signs.indexOf(ans),
            { cls: "sign-grid", big: true });
          grid.querySelectorAll("button").forEach((btn, i) =>
            btn.addEventListener("click", () => {
              const slot = document.getElementById("cmp-slot");
              if (slot && !slot.dataset.set) slot.textContent = signs[i];
              if (i === signs.indexOf(ans)) slot.dataset.set = "1";
            }));
        }
      };
    });
  }
});

/* ---------------- Tens & Ones ---------------- */
function blocksSVG(tens, ones) {
  const u = 20, gap = 6;
  const tensW = tens * (u + gap);
  const onesCols = Math.ceil(ones / 5) || 0;
  const w = Math.max(tensW + (onesCols ? 30 + onesCols * (u + gap) : 0), u * 2);
  const h = 10 * u + 30;
  let rects = "";
  for (let t = 0; t < tens; t++)
    for (let r = 0; r < 10; r++)
      rects += `<rect x="${t * (u + gap)}" y="${r * u}" width="${u - 2}" height="${u - 2}" rx="3" fill="#7CC7E0" stroke="#4E9FBB" stroke-width="1.5"/>`;
  for (let o = 0; o < ones; o++) {
    const col = Math.floor(o / 5), row = o % 5;
    rects += `<rect x="${tensW + 30 + col * (u + gap)}" y="${(10 - 5) * u / 2 + row * u}" width="${u - 2}" height="${u - 2}" rx="3" fill="#F59E2D" stroke="#C77F1E" stroke-width="1.5"/>`;
  }
  const labels = `
    ${tens ? `<text x="${tensW / 2 - 2}" y="${10 * u + 22}" class="blk-label" text-anchor="middle">tens</text>` : ""}
    ${ones ? `<text x="${tensW + 30 + (onesCols * (u + gap)) / 2}" y="${10 * u + 22}" class="blk-label" text-anchor="middle">ones</text>` : ""}`;
  return `<svg viewBox="-2 -2 ${w + 4} ${h}" class="blocks-svg" xmlns="http://www.w3.org/2000/svg">${rects}${labels}</svg>`;
}

registerActivity({
  id: "math-place", subject: "math",
  emoji: "🧱", title: "Tens & Ones",
  blurb: "What number do the blocks show?",
  buildRound(level) {
    const maxTens = [4, 9, 9][level - 1];
    return Array.from({ length: 10 }, () => {
      const t = rnd(1, maxTens), o = rnd(0, 9);
      const n = t * 10 + o;
      return {
        render(area) {
          const hint = level === 1 ? `<p class="hint-line">${t} tens and ${o} ones</p>` : "";
          area.innerHTML = `
            <div class="prompt-bar">🧱 What number do the blocks show? ${UI.speakerBtn(`${t} tens and ${o} ones make what number?`)}</div>
            <div class="blocks-wrap">${blocksSVG(t, o)}</div>
            ${hint}
            <div class="equation"><span class="num-display eq-box" id="eq-ans"></span></div>`;
          UI.numberPad(area, n, { display: area.querySelector("#eq-ans") });
        }
      };
    });
  }
});

/* ---------------- Cappy Clock ---------------- */
function clockSVG(h, m, size = 210) {
  const cx = 100, cy = 100;
  const nums = Array.from({ length: 12 }, (_, i) => {
    const a = (i + 1) * 30 * Math.PI / 180;
    const x = cx + Math.sin(a) * 74, y = cy - Math.cos(a) * 74;
    return `<text x="${x}" y="${y + 7}" text-anchor="middle" class="clock-num">${i + 1}</text>`;
  }).join("");
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30 * Math.PI / 180;
    return `<line x1="${cx + Math.sin(a) * 86}" y1="${cy - Math.cos(a) * 86}" x2="${cx + Math.sin(a) * 90}" y2="${cy - Math.cos(a) * 90}" stroke="#8A6240" stroke-width="3" stroke-linecap="round"/>`;
  }).join("");
  const hourA = (h % 12) * 30 + m / 2;
  const minA = m * 6;
  return `<svg viewBox="0 0 200 200" width="${size}" class="clock-svg" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="94" fill="#FFFDF6" stroke="#A97C50" stroke-width="8"/>
    ${ticks}${nums}
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 44}" stroke="#6F4E33" stroke-width="9" stroke-linecap="round" transform="rotate(${hourA} ${cx} ${cy})"/>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 66}" stroke="#F59E2D" stroke-width="6" stroke-linecap="round" transform="rotate(${minA} ${cx} ${cy})"/>
    <circle cx="${cx}" cy="${cy}" r="7" fill="#6F4E33"/>
  </svg>`;
}

registerActivity({
  id: "math-time", subject: "math",
  emoji: "🕐", title: "Cappy Clock",
  blurb: "What time is it?",
  buildRound(level) {
    const minOptions = level === 1 ? [0] : level === 2 ? [30] : [0, 30];
    return Array.from({ length: 10 }, () => {
      const h = rnd(1, 12), m = choice(minOptions);
      const fmt = (hh, mm) => `${hh}:${mm === 0 ? "00" : mm}`;
      const correct = fmt(h, m);
      const say = m === 0 ? `${h} o'clock` : `${h} thirty`;
      return {
        render(area) {
          area.innerHTML = `
            <div class="prompt-bar">🕐 What time is it? ${UI.speakerBtn("What time is it?")}</div>
            <div class="clock-wrap">${clockSVG(h, m)}</div>`;
          const distractors = () => {
            const dh = Math.max(1, ((h + rnd(-3, 3) - 1) % 12) + 1);
            const dm = choice(minOptions.length > 1 ? [0, 30] : minOptions);
            return fmt(dh === h && dm === m ? (h % 12) + 1 : dh, dm);
          };
          const set = new Set([correct]);
          let guard = 0;
          while (set.size < 4 && guard++ < 100) set.add(distractors());
          const opts = shuffle([...set]);
          UI.choices(area, opts.map(o => ({ html: o })), opts.indexOf(correct), { cls: "num-grid", big: true });
          Capy.speak("What time is it?");
          void say;
        }
      };
    });
  }
});
