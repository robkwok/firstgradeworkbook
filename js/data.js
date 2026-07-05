/* ============================================================
   Cappy's Workbook — Curriculum data
   Content follows first-grade best practices:
   - Sight words from the Dolch lists (primer review + grade 1)
   - Phonics progression: CVC -> blends/digraphs -> long vowels
   - Original decodable-leaning stories (narrative + informational)
   - Sentence work: capitals, end marks, word order
   ============================================================ */

const DATA = {

  /* ---- Sight words: level 1 = primer review, 2 & 3 = Dolch grade 1 ---- */
  sightWords: {
    1: ["the","and","see","like","we","go","my","is","you","said","here","look","come","was","to","play"],
    2: ["after","again","an","any","as","ask","by","could","every","fly","from","give","going","had","has","her","him","his","how","just"],
    3: ["know","let","live","may","of","old","once","open","over","put","round","some","stop","take","thank","them","then","think","walk","were","when"]
  },

  /* ---- Picture words for spelling & word-picture matching ----
     level 1: CVC short vowels · level 2: blends & digraphs · level 3: long vowels / tricky */
  words: {
    1: [
      {w:"cat", e:"🐱"}, {w:"dog", e:"🐶"}, {w:"sun", e:"☀️"}, {w:"pig", e:"🐷"},
      {w:"bus", e:"🚌"}, {w:"hat", e:"🎩"}, {w:"cup", e:"☕"}, {w:"bed", e:"🛏️"},
      {w:"hen", e:"🐔"}, {w:"bug", e:"🐛"}, {w:"fox", e:"🦊"}, {w:"pen", e:"🖊️"},
      {w:"map", e:"🗺️"}, {w:"box", e:"📦"}, {w:"bat", e:"🦇"}, {w:"web", e:"🕸️"}
    ],
    2: [
      {w:"fish", e:"🐟"}, {w:"ship", e:"🚢"}, {w:"frog", e:"🐸"}, {w:"crab", e:"🦀"},
      {w:"star", e:"⭐"}, {w:"drum", e:"🥁"}, {w:"duck", e:"🦆"}, {w:"chick", e:"🐤"},
      {w:"sled", e:"🛷"}, {w:"flag", e:"🚩"}, {w:"moon", e:"🌙"}, {w:"tree", e:"🌳"},
      {w:"ring", e:"💍"}, {w:"sock", e:"🧦"}, {w:"crown", e:"👑"}, {w:"clock", e:"🕐"}
    ],
    3: [
      {w:"cake", e:"🎂"}, {w:"bike", e:"🚲"}, {w:"kite", e:"🪁"}, {w:"rose", e:"🌹"},
      {w:"bone", e:"🦴"}, {w:"snake", e:"🐍"}, {w:"whale", e:"🐳"}, {w:"grape", e:"🍇"},
      {w:"mouse", e:"🐭"}, {w:"house", e:"🏠"}, {w:"sheep", e:"🐑"}, {w:"train", e:"🚂"},
      {w:"snail", e:"🐌"}, {w:"cloud", e:"☁️"}, {w:"stone", e:"🪨"}, {w:"queen", e:"👸"}
    ]
  },

  /* ---- Rhyming pairs; "rime" is used to keep distractors honest ---- */
  rhymes: [
    {a:"cat",  b:"hat",   rime:"at"},
    {a:"pig",  b:"wig",   rime:"ig"},
    {a:"sun",  b:"run",   rime:"un"},
    {a:"dog",  b:"log",   rime:"og"},
    {a:"cake", b:"lake",  rime:"ake"},
    {a:"star", b:"car",   rime:"ar"},
    {a:"moon", b:"spoon", rime:"oon"},
    {a:"bug",  b:"rug",   rime:"ug"},
    {a:"hen",  b:"ten",   rime:"en"},
    {a:"king", b:"ring",  rime:"ing"},
    {a:"goat", b:"boat",  rime:"oat"},
    {a:"mouse",b:"house", rime:"ouse"},
    {a:"bee",  b:"tree",  rime:"ee"},
    {a:"fox",  b:"box",   rime:"ox"},
    {a:"snail",b:"whale", rime:"ail"},
    {a:"cap",  b:"map",   rime:"ap"},
    {a:"wet",  b:"net",   rime:"et"},
    {a:"hop",  b:"top",   rime:"op"}
  ],

  /* ---- Sentence scrambles (word-order). Level = length/complexity ---- */
  scrambles: {
    1: [
      ["I","see","a","capybara."],
      ["The","grass","is","green."],
      ["Cappy","can","swim","fast."],
      ["We","like","to","play."],
      ["Cappy","is","my","friend."],
      ["The","pond","is","big."]
    ],
    2: [
      ["The","capybara","eats","green","grass."],
      ["A","bird","sits","on","Cappy."],
      ["Cappy","has","four","webbed","feet."],
      ["The","baby","naps","in","the","sun."],
      ["We","swim","in","the","warm","pond."],
      ["My","dog","runs","to","the","water."]
    ],
    3: [
      ["The","happy","capybara","swims","in","the","pond."],
      ["Birds","like","to","rest","on","soft","capybaras."],
      ["Where","do","capybaras","like","to","sleep?"],
      ["The","little","duck","follows","Cappy","all","day."],
      ["Cappy","and","his","friends","eat","sweet","yuzu."],
      ["Can","you","see","the","baby","capybara?"]
    ]
  },

  /* ---- Fix the sentence: add a capital + end mark.
     caps  = word indexes the child must capitalize
     locked = proper nouns shown capitalized from the start ---- */
  fixSentences: {
    1: [
      {w:["the","capybara","is","wet"],        caps:[0], locked:[],  end:"."},
      {w:["we","swim","in","the","pond"],      caps:[0], locked:[],  end:"."},
      {w:["cappy","eats","green","grass"],     caps:[0], locked:[],  end:"."},
      {w:["my","hat","is","red"],              caps:[0], locked:[],  end:"."},
      {w:["the","baby","naps","now"],          caps:[0], locked:[],  end:"."},
      {w:["a","bird","sits","on","cappy"],     caps:[0], locked:[],  end:".", capName:4}
    ],
    2: [
      {w:["can","a","capybara","swim"],        caps:[0], locked:[],  end:"?"},
      {w:["where","is","the","baby"],          caps:[0], locked:[],  end:"?"},
      {w:["do","you","like","yuzu"],           caps:[0], locked:[],  end:"?"},
      {w:["the","water","is","warm"],          caps:[0], locked:[],  end:"."},
      {w:["cappy","naps","in","the","mud"],    caps:[0], locked:[],  end:"."},
      {w:["is","the","pond","deep"],           caps:[0], locked:[],  end:"?"}
    ],
    3: [
      {w:["what","a","big","splash"],          caps:[0], locked:[],  end:"!"},
      {w:["watch","out","for","the","mud"],    caps:[0], locked:[],  end:"!"},
      {w:["cappy","and","i","swim"],           caps:[0,2], locked:[], end:"."},
      {w:["wow","that","is","a","huge","rodent"], caps:[0], locked:[], end:"!"},
      {w:["may","i","pet","the","capybara"],   caps:[0,1], locked:[], end:"?"},
      {w:["i","love","warm","baths"],          caps:[0], locked:[],  end:"."}
    ]
  },

  /* ---- Writing prompts shown after sentence work (bonus ideas) ---- */
  prompts: [
    "If you had a pet capybara, what would you name it?",
    "Capybaras love warm baths. What do YOU do on a cold day?",
    "Draw and write: Cappy finds a treasure!",
    "What would you show Cappy at your school?"
  ],

  /* ---- Stories: mix of narrative (RL) and informational (RI) ---- */
  stories: [
    {
      level: 1, title: "Cappy Gets Wet", art: "💦",
      text: "Cappy is a capybara. He is big and brown. Cappy likes to swim. He gets in the pond. Splash! The water is warm. A duck swims to Cappy. “Quack!” says the duck. Cappy and the duck swim and swim. Then they nap in the sun. What a fun day!",
      qs: [
        {q:"What is Cappy?", c:["a capybara","a duck","a fish"], a:0},
        {q:"Where does Cappy swim?", c:["in the tub","in the pond","in the sea"], a:1},
        {q:"Who swims with Cappy?", c:["a cat","a frog","a duck"], a:2},
        {q:"How does the story end?", c:["They nap in the sun","They eat cake","They run home"], a:0}
      ]
    },
    {
      level: 1, title: "The Little Bird", art: "🐦",
      text: "A little bird is tired. She wants to rest. She sees Cappy on the grass. Cappy is soft and still. The bird sits on Cappy’s back! Cappy does not mind. “You can rest here,” says Cappy. The bird sings a song. Cappy smiles. Now they are friends.",
      qs: [
        {q:"Who is tired?", c:["Cappy","the little bird","a frog"], a:1},
        {q:"Where does the bird sit?", c:["on a tree","on a rock","on Cappy’s back"], a:2},
        {q:"Why does the bird pick Cappy?", c:["He is soft and still","He is loud","He can fly"], a:0},
        {q:"What happens at the end?", c:["The bird flies away","They become friends","Cappy gets mad"], a:1}
      ]
    },
    {
      level: 2, title: "The Yuzu Bath", art: "🍊",
      text: "It is cold today. Cappy’s family gets in the warm spring. The keeper puts yuzu fruit in the water. Yuzu smells so good! The little fruits bob up and down. One lands on Cappy’s head. It looks like a small hat. Cappy floats and closes his eyes. Warm baths are the best on cold days.",
      qs: [
        {q:"What is the weather like?", c:["hot","cold","rainy"], a:1},
        {q:"What goes in the water?", c:["yuzu fruit","toy boats","leaves"], a:0},
        {q:"Where does one yuzu land?", c:["on the grass","in a cup","on Cappy’s head"], a:2},
        {q:"Why does the family like the bath?", c:["It is warm on a cold day","It is full of fish","It is fast"], a:0}
      ]
    },
    {
      level: 2, title: "All About Capybaras", art: "🌎",
      text: "A capybara is the biggest rodent in the world. Some are as heavy as a grown-up person! Capybaras live near rivers and lakes in South America. They have webbed feet to help them swim. They can even sleep in the water with their noses out. Capybaras eat grass and water plants. They live in big family groups. Many animals like to sit on them. That is why people call them nature’s friendliest animal.",
      qs: [
        {q:"A capybara is the biggest…", c:["bird","rodent","fish"], a:1},
        {q:"What helps capybaras swim?", c:["webbed feet","long tails","big wings"], a:0},
        {q:"What do capybaras eat?", c:["meat and eggs","bugs and worms","grass and water plants"], a:2},
        {q:"Why do people call them friendly?", c:["They bark loudly","Many animals sit on them","They live alone"], a:1}
      ]
    },
    {
      level: 3, title: "The Lost Tangerine", art: "🍊",
      text: "Coco the baby capybara had a small tangerine. She set it down by the pond and went to munch grass. When she came back, it was gone! Coco looked under the leaves. She looked behind the rocks. Then she saw the duck pushing something round and orange. “My tangerine!” said Coco. “I am sorry,” said the duck. “I thought it was a ball.” Coco laughed. “We can share it,” she said. They each had a sweet bite. Sharing made it taste even better.",
      qs: [
        {q:"What did Coco lose?", c:["a tangerine","a hat","a rock"], a:0},
        {q:"Who had the tangerine?", c:["a frog","the duck","her mom"], a:1},
        {q:"Why did the duck take it?", c:["He was hungry","He was mad","He thought it was a ball"], a:2},
        {q:"What is the lesson of the story?", c:["Sharing is sweet","Ducks are fast","Hide your food"], a:0}
      ]
    },
    {
      level: 3, title: "The Rainy Day Plan", art: "🌧️",
      text: "Rain fell on the pond all morning. “We cannot play outside,” sighed Coco. Cappy had an idea. “Capybaras love water. The rain can be our game!” They counted the drips from a big leaf. They raced two little sticks down a stream. They made mud pies and lined them up to dry. When the sun came out, Coco laughed. “That was the best rainy day ever. I hope it rains again soon!”",
      qs: [
        {q:"What was the problem?", c:["The pond was gone","It was raining","Coco was lost"], a:1},
        {q:"Whose idea made the day fun?", c:["Cappy’s","the duck’s","the keeper’s"], a:0},
        {q:"Which game did they play?", c:["hide and seek","racing sticks in a stream","tag with the duck"], a:1},
        {q:"How did Coco feel at the end?", c:["sad and cold","scared","happy"], a:2}
      ]
    }
  ]
};
