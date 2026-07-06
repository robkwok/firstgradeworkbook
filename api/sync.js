/* Family-code profile sync for Cappy's Workbook.
   One endpoint:
     GET  /api/sync?code=CAPY-XXXXXX          -> { players }
     POST /api/sync {code, players, remove[]} -> merge + store -> { players }
   Merging is monotonic (max stars/scores, union of traced letters), so
   concurrent pushes from two devices converge without clobbering.
   Storage: one small JSON blob per family code in Vercel Blob. */

import { put, head } from "@vercel/blob";

const CODE_RE = /^[A-Z0-9][A-Z0-9-]{3,23}$/;
const MAX_BODY = 120_000;   // a family of profiles is ~2KB; this is very generous
const MAX_PLAYERS = 30;

function mergeActivity(x = {}, y = {}) {
  const bestFromX = (x.bestFrac || 0) >= (y.bestFrac || 0);
  return {
    stars: Math.max(x.stars || 0, y.stars || 0),
    plays: Math.max(x.plays || 0, y.plays || 0),
    bestFrac: Math.max(x.bestFrac || 0, y.bestFrac || 0),
    best: bestFromX ? (x.best ?? y.best) : y.best
  };
}

function mergePlayers(a = {}, b = {}) {
  const out = {};
  for (const name of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const pa = a[name], pb = b[name];
    if (!pa || !pb) { out[name] = pa || pb; continue; }
    const acts = {};
    for (const id of new Set([
      ...Object.keys(pa.activities || {}), ...Object.keys(pb.activities || {})
    ])) acts[id] = mergeActivity((pa.activities || {})[id], (pb.activities || {})[id]);
    out[name] = {
      activities: acts,
      yuzus: Math.max(pa.yuzus || 0, pb.yuzus || 0),      // earned: monotonic
      fed: Math.max(pa.fed || 0, pb.fed || 0),            // spent: monotonic
      hat: pb.hat !== undefined ? pb.hat : (pa.hat ?? null), // cosmetic: incoming wins
      storyIdx: Math.max(pa.storyIdx || 0, pb.storyIdx || 0),
      traceDone: { ...(pa.traceDone || {}), ...(pb.traceDone || {}) }
    };
  }
  return out;
}

async function loadFamily(code) {
  try {
    const meta = await head(`families/${code}.json`);
    // private store: content reads require the store token as a bearer header
    const r = await fetch(meta.downloadUrl || meta.url, {
      cache: "no-store",
      headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null; // not found
  }
}

async function saveFamily(code, data) {
  await put(`families/${code}.json`, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 60
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const code = String(req.query.code || "").toUpperCase();
      if (!CODE_RE.test(code)) return res.status(400).json({ error: "bad code" });
      const family = await loadFamily(code);
      if (!family) return res.status(404).json({ error: "unknown code" });
      return res.status(200).json({ players: family.players || {} });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const code = String(body.code || "").toUpperCase();
      if (!CODE_RE.test(code)) return res.status(400).json({ error: "bad code" });
      const players = body.players && typeof body.players === "object" ? body.players : {};
      const remove = Array.isArray(body.remove) ? body.remove.map(String) : [];
      if (JSON.stringify(players).length > MAX_BODY ||
          Object.keys(players).length > MAX_PLAYERS)
        return res.status(413).json({ error: "too large" });

      const existing = (await loadFamily(code)) || { players: {} };
      for (const name of remove) delete existing.players[name];
      const merged = mergePlayers(existing.players, players);
      await saveFamily(code, { players: merged, updated: Date.now() });
      return res.status(200).json({ players: merged });
    }

    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "sync failed" });
  }
}
