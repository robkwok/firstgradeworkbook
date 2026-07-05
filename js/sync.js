/* ============================================================
   Family Sync — share profiles across devices with a family code.
   - No accounts: an unguessable code (CAPY-XXXXXX) is the key.
   - Pushes are debounced and merge on the server (max stars,
     union of traced letters), so devices never clobber each other.
   - Fully optional: without a code the app stays local-only.
   ============================================================ */

const Sync = {
  API: "https://firstgradeworkbook.vercel.app/api/sync",
  timer: null,
  busy: false,

  get code() { return App.store.familyCode || null; },

  newCode() {
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
    let s = "";
    for (let i = 0; i < 6; i++) s += alphabet[(Math.random() * alphabet.length) | 0];
    return "CAPY-" + s;
  },

  /* called from App.save() — batch rapid changes into one push */
  schedulePush() {
    if (!this.code) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.push(), 2500);
  },

  async push() {
    if (!this.code || this.busy) return false;
    this.busy = true;
    try {
      const r = await fetch(this.API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: this.code,
          players: App.store.players,
          remove: App.store.pendingRemove || []
        })
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      App.store.pendingRemove = [];
      this.adopt(data.players);
      App.store.lastSync = Date.now();
      App.saveLocal();
      this.paintStatus();
      return true;
    } catch (e) {
      this.paintStatus(true);
      return false; // offline or server hiccup — next save() retries
    } finally {
      this.busy = false;
    }
  },

  /* take the server-merged set as canonical */
  adopt(players) {
    App.store.players = players;
    if (App.store.current && !players[App.store.current]) App.store.current = null;
    App.saveLocal();
    App.updateYuzu();
    App.updatePlayerChip();
    if (document.querySelector(".players-page")) App.goPlayers();
  },

  async join(codeRaw) {
    let code = codeRaw.trim().toUpperCase().replace(/\s+/g, "");
    if (code && !code.includes("-") && code.length === 6) code = "CAPY-" + code;
    if (!/^[A-Z0-9][A-Z0-9-]{3,23}$/.test(code)) return { ok: false, msg: "That code doesn’t look right." };
    App.store.familyCode = code;
    const ok = await this.push(); // server merges local players with the family’s
    if (!ok) {
      App.store.familyCode = null;
      App.saveLocal();
      return { ok: false, msg: "Couldn’t reach the sync server. Check the code and your internet." };
    }
    return { ok: true };
  },

  stop() {
    App.store.familyCode = null;
    App.store.lastSync = null;
    App.saveLocal();
  },

  agoText() {
    if (!App.store.lastSync) return "not synced yet";
    const s = Math.round((Date.now() - App.store.lastSync) / 1000);
    if (s < 10) return "synced just now";
    if (s < 90) return "synced seconds ago";
    if (s < 3600) return `synced ${Math.round(s / 60)} min ago`;
    return `synced ${Math.round(s / 3600)} h ago`;
  },

  paintStatus(failed) {
    const el = document.getElementById("sync-status");
    if (el) el.textContent = failed ? "⚠️ couldn’t sync — will retry" : "✅ " + this.agoText();
  },

  /* ---------------- Family Sync screen (a grown-up corner) ---------------- */
  screen() {
    const code = this.code;
    const body = code ? `
      <p class="sync-lead">This device is syncing with family code:</p>
      <div class="family-code">${escapeHtml(code)}</div>
      <p id="sync-status" class="sync-status">${this.agoText()}</p>
      <p class="sync-lead">Type this code on another iPad, phone, or computer
        (open the site → 👤 → Family Sync → “I have a code”) and all the
        players, stars, and yuzus will stay in step on both.</p>
      <div class="celebrate-btns">
        <button class="big-btn green" id="sync-now">Sync Now ↻</button>
        <button class="big-btn tan" id="sync-stop">Stop Syncing Here</button>
      </div>` : `
      <p class="sync-lead">Keep the same players, stars, and yuzus on every
        device — no account needed, just a family code.</p>
      <div class="sync-choice">
        <button class="big-btn orange" id="sync-create">✨ Create a family code</button>
        <div class="sync-or">— or —</div>
        <div class="add-player">
          <input id="sync-input" maxlength="12" placeholder="CAPY-······"
            autocapitalize="characters" autocomplete="off" spellcheck="false" enterkeyhint="go">
          <button class="big-btn green" id="sync-join">I have a code →</button>
        </div>
        <p id="sync-msg" class="sync-status"></p>
      </div>`;

    App.setScreen(`
      <div class="players-page sync-page">
        <div class="players-hero">${Capy.tappable(Capy.front({ size: 120, happy: true, tangerine: true }), "players")}</div>
        <h1 class="players-title">Family Sync 🔗</h1>
        ${body}
        <p class="home-tip">Only first names and stars are stored — nothing else.</p>
      </div>
    `, { title: "Family Sync 🔗", backTo: () => App.goPlayers() });

    if (code) {
      document.getElementById("sync-now").addEventListener("click", async () => {
        Capy.Sfx.pop();
        document.getElementById("sync-status").textContent = "syncing…";
        await this.push();
      });
      document.getElementById("sync-stop").addEventListener("click", () => {
        if (!confirm("Stop syncing on this device? Progress stays saved here.")) return;
        this.stop();
        this.screen();
      });
    } else {
      document.getElementById("sync-create").addEventListener("click", async () => {
        Capy.Sfx.pop();
        App.store.familyCode = this.newCode();
        App.saveLocal();
        const ok = await this.push();
        if (!ok) { App.store.familyCode = null; App.saveLocal(); }
        this.screen();
        if (!ok) {
          const m = document.getElementById("sync-msg");
          if (m) m.textContent = "⚠️ Couldn’t reach the sync server — try again.";
        }
      });
      const input = document.getElementById("sync-input");
      const join = async () => {
        Capy.Sfx.pop();
        const msg = document.getElementById("sync-msg");
        msg.textContent = "joining…";
        const r = await this.join(input.value);
        if (r.ok) { Capy.Sfx.ding(); this.screen(); }
        else msg.textContent = "⚠️ " + r.msg;
      };
      document.getElementById("sync-join").addEventListener("click", join);
      input.addEventListener("keydown", e => { if (e.key === "Enter") join(); });
    }
  }
};
