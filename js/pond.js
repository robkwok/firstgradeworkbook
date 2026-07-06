/* ============================================================
   Cappy's Pond — spend earned yuzus by feeding Cappy.
   Each feeding = 1 heart. Hearts unlock wearable accessories
   that Cappy wears on every screen.
   Economy: `yuzus` = total earned (monotonic), `fed` = total
   spent (monotonic) — both merge with max() in Family Sync, so
   balance (yuzus - fed) stays correct across devices.
   ============================================================ */

const Pond = {
  FEED_PHRASES: ["Yum yum!", "So sweet!", "Munch munch!", "Delicious!", "My favorite!", "More, please!"],

  hearts() { return App.state.fed || 0; },
  unlocked(id) { return this.hearts() >= Capy.HATS[id].at; },
  nextHat() {
    return Object.entries(Capy.HATS)
      .map(([id, h]) => ({ id, ...h }))
      .find(h => this.hearts() < h.at) || null;
  },

  open() {
    if (!App.store.current) return App.goPlayers();
    App.updateYuzu();
    const balance = App.balance();
    const hearts = this.hearts();
    const next = this.nextHat();

    const meter = next
      ? `<div class="heart-meter">
           <div class="heart-meter-text">❤️ ${hearts} hearts — ${next.at - hearts} more for the ${next.label} ${next.name}!</div>
           <div class="trace-meter"><div class="trace-meter-fill heart-fill" style="width:${Math.round(hearts / next.at * 100)}%"></div></div>
         </div>`
      : `<div class="heart-meter"><div class="heart-meter-text">❤️ ${hearts} hearts — Cappy has every accessory! 🎉</div></div>`;

    const shown = Math.min(balance, 10);
    let feedRow = "";
    for (let i = 0; i < shown; i++) feedRow += `<button class="feed-yuzu" aria-label="Feed a yuzu">🍊</button>`;
    if (balance > shown) feedRow += `<span class="feed-more">+${balance - shown}</span>`;
    if (!balance) feedRow = `<p class="sync-lead">No yuzus right now — finish a round of any game to earn one! 🍊</p>`;

    App.setScreen(`
      <div class="pond-page">
        <div class="pond-stats">
          <span class="pond-stat">🍊 ${balance} yuzus</span>
          <span class="pond-stat">❤️ ${hearts} hearts</span>
        </div>
        <div class="pond-scene" id="pond-scene">
          ${Capy.tappable(Capy.side({ water: true, tangerine: true, hat: App.state.hat, size: 250 }), "pond")}
        </div>
        <p class="pond-hint">${balance ? "Tap a yuzu to feed Cappy!" : ""}</p>
        <div class="feed-row" id="feed-row">${feedRow}</div>
        ${meter}
        <h3 class="wardrobe-title">Cappy’s Wardrobe</h3>
        <div class="wardrobe" id="wardrobe">${this.wardrobeHtml()}</div>
      </div>
    `, { title: "Cappy’s Pond 🍊", backTo: () => App.goHome() });

    document.querySelectorAll(".feed-yuzu").forEach(b =>
      b.addEventListener("click", () => this.feed(b)));
    this.wireWardrobe();
  },

  wardrobeHtml() {
    const worn = App.state.hat || null;
    const chips = [{ id: null, name: "Tangerine", label: "🍊", at: 0 }]
      .concat(Object.entries(Capy.HATS).map(([id, h]) => ({ id, ...h })));
    return chips.map(c => {
      const has = c.at <= this.hearts();
      const isWorn = worn === c.id;
      return `<button class="hat-chip ${isWorn ? "worn" : ""} ${has ? "" : "locked"}" data-hat="${c.id ?? ""}" ${has ? "" : "disabled"}>
        <span class="hat-emoji">${has ? c.label : "🔒"}</span>
        <span class="hat-name">${c.name}</span>
        <span class="hat-req">${has ? (isWorn ? "wearing" : "tap to wear") : `❤️ ${c.at}`}</span>
      </button>`;
    }).join("");
  },

  wireWardrobe() {
    document.querySelectorAll(".hat-chip:not(.locked)").forEach(b =>
      b.addEventListener("click", () => {
        Capy.Sfx.pop();
        App.state.hat = b.dataset.hat || null;
        App.save();
        this.refreshScene();
        document.getElementById("wardrobe").innerHTML = this.wardrobeHtml();
        this.wireWardrobe();
        Capy.speak("How do I look?", 1.0, 1.3);
      }));
  },

  refreshScene() {
    const scene = document.getElementById("pond-scene");
    if (scene) scene.innerHTML = Capy.tappable(
      Capy.side({ water: true, tangerine: true, hat: App.state.hat, size: 250 }), "pond");
  },

  feed(btn) {
    if (btn.dataset.eaten || App.balance() <= 0) return;
    btn.dataset.eaten = "1";
    const scene = document.getElementById("pond-scene");
    const capy = scene.querySelector(".capy-tap");

    // fly the yuzu to Cappy's mouth
    const from = btn.getBoundingClientRect();
    const to = capy.getBoundingClientRect();
    btn.style.transition = "transform 0.55s cubic-bezier(.4,-0.2,.6,1), opacity 0.55s ease";
    btn.style.transform =
      `translate(${to.left + to.width * 0.62 - from.left}px, ${to.top + to.height * 0.45 - from.top}px) scale(0.25)`;
    btn.style.opacity = "0";

    const before = this.nextHat();
    setTimeout(() => {
      btn.remove();
      App.state.fed = (App.state.fed || 0) + 1;
      App.save();
      App.updateYuzu();

      Capy.Sfx.chomp();
      const phrase = choice(this.FEED_PHRASES);
      Capy.speak(phrase, 1.0, 1.3);
      capy.querySelector(".capy-speech")?.remove();
      const bubble = document.createElement("div");
      bubble.className = "capy-speech";
      bubble.textContent = phrase;
      capy.appendChild(bubble);
      setTimeout(() => bubble.remove(), 1600);
      capy.classList.remove("capy-wiggle"); void capy.offsetWidth;
      capy.classList.add("capy-wiggle");

      for (let i = 0; i < 3; i++) {
        const h = document.createElement("span");
        h.className = "heart-pop";
        h.textContent = "❤️";
        h.style.left = 38 + Math.random() * 24 + "%";
        h.style.animationDelay = i * 0.16 + "s";
        scene.appendChild(h);
        setTimeout(() => h.remove(), 1400 + i * 160);
      }

      const after = this.nextHat();
      const unlockedNow = before && this.hearts() >= before.at;
      if (unlockedNow) {
        Capy.Sfx.fanfare();
        Capy.Confetti.burst(110);
        Celebrate.toast(`${before.label} Unlocked: ${before.name}!`);
        Capy.speak(`You unlocked my ${before.name}!`);
        setTimeout(() => this.open(), 1400);
      } else if (after !== before || !document.querySelector(".feed-yuzu")) {
        // refresh counts/meter without a full re-render mid-animation
        setTimeout(() => this.open(), 1100);
      } else {
        const stats = document.querySelectorAll(".pond-stat");
        if (stats[0]) stats[0].textContent = `🍊 ${App.balance()} yuzus`;
        if (stats[1]) stats[1].textContent = `❤️ ${this.hearts()} hearts`;
        const fill = document.querySelector(".heart-fill");
        const nxt = this.nextHat();
        if (fill && nxt) fill.style.width = Math.round(this.hearts() / nxt.at * 100) + "%";
        const txt = document.querySelector(".heart-meter-text");
        if (txt && nxt) txt.textContent = `❤️ ${this.hearts()} hearts — ${nxt.at - this.hearts()} more for the ${nxt.label} ${nxt.name}!`;
      }
    }, 560);
  }
};
