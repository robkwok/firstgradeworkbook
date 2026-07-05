/* ============================================================
   READING activities
   - Sight Word Pond (find the word on a lily pad)
   - Read & Match (decode a word, pick the picture)
   - Rhyme Time
   - Story Time (passage + comprehension questions)
   ============================================================ */

/* ---------------- Sight Word Pond ---------------- */
registerActivity({
  id: "read-sight", subject: "reading",
  emoji: "🪷", title: "Sight Word Pond",
  blurb: "Find the sight word on a lily pad",
  buildRound(level) {
    const pool = DATA.sightWords[level];
    const all = DATA.sightWords[1].concat(DATA.sightWords[2], DATA.sightWords[3]);
    return sample(pool, 10).map(word => ({
      render(area) {
        area.innerHTML = `
          <div class="prompt-bar">🪷 Find the word:
            <span class="target-word">${word}</span> ${UI.speakerBtn(word)}
          </div>`;
        Capy.speak(word);
        const distract = sample(all.filter(w => w !== word), 5);
        const opts = shuffle([word].concat(distract));
        UI.choices(area, opts.map(w => ({ html: w })), opts.indexOf(word), { cls: "lily-grid" });
      }
    }));
  }
});

/* ---------------- Read & Match ---------------- */
registerActivity({
  id: "read-match", subject: "reading",
  emoji: "🖼️", title: "Read & Match",
  blurb: "Read the word, tap its picture",
  buildRound(level) {
    const pool = DATA.words[level];
    return sample(pool, 10).map(item => ({
      render(area) {
        area.innerHTML = `
          <div class="prompt-bar">🖼️ Read the word. Tap its picture!</div>
          <div class="read-word">${item.w} ${UI.speakerBtn(item.w)}</div>`;
        const others = sample(pool.filter(x => x.w !== item.w), 3);
        const opts = shuffle([item].concat(others));
        UI.choices(area, opts.map(o => ({ html: `<span class="pic-emoji">${o.e}</span>` })),
          opts.indexOf(item), { cls: "pic-grid" });
      }
    }));
  }
});

/* ---------------- Rhyme Time ---------------- */
registerActivity({
  id: "read-rhyme", subject: "reading",
  emoji: "🎵", title: "Rhyme Time",
  blurb: "Which word rhymes?",
  buildRound() {
    return sample(DATA.rhymes, 10).map(pair => ({
      render(area) {
        area.innerHTML = `
          <div class="prompt-bar">🎵 Which word rhymes with
            <span class="target-word">${pair.a}</span>? ${UI.speakerBtn("Which word rhymes with " + pair.a + "?")}
          </div>`;
        Capy.speak("Which word rhymes with " + pair.a + "?");
        // distractors must not share the rime (so there is exactly one rhyme)
        const pool = DATA.rhymes.filter(r => r.rime !== pair.rime);
        const distract = sample(pool, 3).map(r => choice([r.a, r.b]));
        const opts = shuffle([pair.b].concat(distract));
        UI.choices(area, opts.map(w => ({ html: w })), opts.indexOf(pair.b), { cls: "word-grid" });
      }
    }));
  }
});

/* ---------------- Story Time ---------------- */
registerActivity({
  id: "read-story", subject: "reading",
  emoji: "📖", title: "Story Time",
  blurb: "Read a capybara story, answer questions",
  buildRound(level) {
    // rotate through stories at or below the child's level
    const pool = DATA.stories.filter(s => s.level <= level);
    const story = pool[App.state.storyIdx % pool.length];
    App.state.storyIdx++;
    App.save();

    return story.qs.map((q, qi) => ({
      render(area) {
        area.innerHTML = `
          <div class="story-card">
            <div class="story-head">
              <span class="story-art">${story.art}</span>
              <h3>${story.title}</h3>
              ${UI.speakerBtn(story.title + ". " + story.text, { big: true })}
            </div>
            <p class="story-text">${story.text}</p>
          </div>
          <div class="prompt-bar">❓ Question ${qi + 1}: ${q.q} ${UI.speakerBtn(q.q)}</div>`;
        UI.choices(area, q.c.map(c => ({ html: c })), q.a, { cls: "word-grid answers" });
      }
    }));
  }
});
