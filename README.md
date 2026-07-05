# 🦫 Cappy's Workbook — First Grade Fun

A capybara-themed first grade workbook website with **Writing**, **Reading**, and **Math**
activities, designed touch-first for iPad. No build step, no dependencies — plain HTML,
CSS, and JavaScript.

## Run it

```bash
cd firstgradeworkbook
python3 -m http.server 4173
```

Then open `http://localhost:4173`. To use it on an iPad on the same Wi-Fi network, open
`http://<your-mac-ip>:4173` in Safari, then **Share → Add to Home Screen** for a
full-screen, kid-proof app experience (no browser chrome). You can also deploy the folder
as-is to any static host (Vercel, Netlify, GitHub Pages).

## The activities

| Subject | Activity | Skill (Common Core) |
|---|---|---|
| ✏️ Writing | Letter Tracing | Letter/number formation with sky–mid–grass guides (L.1.1a) |
| ✏️ Writing | Build a Sentence | Word order, sentence sense (L.1.1j) |
| ✏️ Writing | Fix the Sentence | Capitalization & end punctuation (L.1.2a,b) |
| ✏️ Writing | Spell It! | Phonetic spelling with letter tiles (L.1.2d,e) |
| 📚 Reading | Sight Word Pond | Dolch sight words, primer + grade 1 (RF.1.3g) |
| 📚 Reading | Read & Match | Decoding CVC → blends → long vowels (RF.1.2, RF.1.3) |
| 📚 Reading | Rhyme Time | Phonological awareness, rimes (RF.1.2a) |
| 📚 Reading | Story Time | Comprehension of stories & nonfiction (RL.1.1–3, RI.1.1–2) |
| 🧮 Math | Count with Cappy | Counting to 20 (1.NBT.A.1) |
| 🧮 Math | Adding Pond | Addition within 20 with counters (1.OA.C.6) |
| 🧮 Math | Take Away Splash | Subtraction within 20 (1.OA.C.6) |
| 🧮 Math | Mystery Number | Missing addends / unknowns (1.OA.D.8) |
| 🧮 Math | More or Less | Comparing with <, =, > (1.NBT.B.3) |
| 🧮 Math | Tens & Ones | Place value with base-ten blocks (1.NBT.B.2) |
| 🧮 Math | Cappy Clock | Time to the hour & half hour (1.MD.B.3) |

## Learning design

- **Leveling tied to mastery.** Each activity has 3 levels; earning stars unlocks harder
  content (e.g. sums within 10 → 20, CVC words → long vowels, o'clock → half past).
- **Short rounds.** 5–10 questions per round keeps sessions in a first grader's
  attention span, with a celebration + reward loop at the end.
- **Positive reinforcement only.** Wrong answers get a gentle shake and a retry; after
  two misses the answer is revealed and the round moves on. No penalties, ever.
- **Multisensory.** Tap-to-hear text-to-speech on words, stories, and prompts (audio),
  counters/blocks/clock manipulatives (visual), and finger/Apple Pencil letter tracing
  (kinesthetic).
- **Readable type for early readers.** Reading content uses Andika, a font designed for
  literacy learners; tracing glyphs use a school-style handwriting font.
- **Reward system.** Rounds earn yuzu oranges 🍊 for Cappy's warm bath (a real capybara
  thing!) and stars track per-activity mastery. Progress persists in `localStorage`.
- **Player profiles.** Kids pick or type their name on launch; each name saves its own
  stars, yuzus, best scores, and traced letters — great for siblings or a classroom
  sharing one iPad. The 👤 chip in the header switches players, and the **🌟 My Stars**
  report card shows saved results per activity.

## iPad specifics

- Touch targets ≥ 56 px, no hover-dependent UI, tap-highlight and double-tap zoom disabled.
- The tracing canvas uses Pointer Events (`touch-action: none`), so it works with a
  finger or Apple Pencil and never scrolls the page mid-stroke.
- Works in portrait and landscape; standalone web-app metas + icons for Add to Home Screen.
- Sound (chimes + speech) can be toggled with the 🔊 button; all audio is synthesized or
  spoken on-device — there are no audio files.

## Files

```
index.html            app shell
css/styles.css        all styling
js/data.js            curriculum content (words, stories, sentences)
js/capy.js            capybara SVG art, sounds, speech, confetti
js/app.js             navigation, progress, shared question engine
js/writing.js         tracing + writing activities
js/reading.js         reading activities
js/math.js            math activities
```
