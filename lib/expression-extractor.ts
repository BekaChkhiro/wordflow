/**
 * Expression Extractor
 * Specifically designed to extract idioms, phrasal verbs, and expressions
 */

export interface Expression {
  id: string
  english: string              // Full expression: "blow one's mind"
  georgian: string             // Georgian translation
  pattern: string              // With blank: "blow one's ___"
  answer: string               // The missing word: "mind"
  definition?: string          // English definition
  example?: string             // Example sentence
  category: 'mind' | 'eye' | 'phrasal' | 'idiom' | 'general'
}

/**
 * Extract expressions from text content
 */
export function extractExpressions(textContent: string): Expression[] {
  const expressions: Expression[] = []
  let idCounter = 0

  // Mind expressions patterns
  const mindExpressions = [
    {
      pattern: /to see smth in your mind's eye\s*[-–]\s*([^;]+);?\s*([\u10A0-\u10FF][^e]*?)(?:e\.g\.|E\.g\.)\s*([^.]+\.)/i,
      english: "see something in your mind's eye",
      patternText: "see smth in your mind's ___",
      answer: "eye",
      category: 'mind' as const,
    },
    {
      pattern: /put your mind to smth\s*[-–]\s*([\u10A0-\u10FF][^.]+)\.\s*([^:]+):\s*([^.]+\.)/i,
      english: "put your mind to something",
      patternText: "put your ___ to smth",
      answer: "mind",
      category: 'mind' as const,
    },
    {
      pattern: /bear in\/on mind\s*[-–]\s*([\u10A0-\u10FF][^b]+)/i,
      english: "bear in mind",
      patternText: "bear in/on ___",
      answer: "mind",
      category: 'mind' as const,
    },
    {
      pattern: /be in two minds\s*[-–]\s*([\u10A0-\u10FF][^b]+)/i,
      english: "be in two minds",
      patternText: "be in two ___",
      answer: "minds",
      category: 'mind' as const,
    },
    {
      pattern: /blow one's mind\s*[-–]\s*([\u10A0-\u10FF][^.]*)\.\s*([^E]*?)(?:E\.g\.\s*)?([^.]*\.?)/i,
      english: "blow one's mind",
      patternText: "blow one's ___",
      answer: "mind",
      category: 'mind' as const,
    },
    {
      pattern: /keep an open mind\s*[-–]\s*([\u10A0-\u10FF][^.]*)\.\s*([^E]*?)(?:E\.g\.\s*)?([^.]*\.?)/i,
      english: "keep an open mind",
      patternText: "keep an open ___",
      answer: "mind",
      category: 'mind' as const,
    },
    {
      pattern: /has smth on (?:her|his|one's) mind\s*[-–]\s*([\u10A0-\u10FF][^p]+)/i,
      english: "have something on one's mind",
      patternText: "have smth on one's ___",
      answer: "mind",
      category: 'mind' as const,
    },
  ]

  // Eye expressions patterns
  const eyeExpressions = [
    {
      pattern: /keep an eye on\s*[-–]\s*([\u10A0-\u10FF][^;]+)/i,
      english: "keep an eye on",
      patternText: "keep an ___ on",
      answer: "eye",
      category: 'eye' as const,
    },
    {
      pattern: /be up to one's eyes in\s*[-–]?\s*([\u10A0-\u10FF][^t]+)/i,
      english: "be up to one's eyes in",
      patternText: "be up to one's ___ in",
      answer: "eyes",
      category: 'eye' as const,
    },
    {
      pattern: /see smth with the naked eye\s*[-–]\s*([\u10A0-\u10FF][^t]+)/i,
      english: "see with the naked eye",
      patternText: "see with the naked ___",
      answer: "eye",
      category: 'eye' as const,
    },
    {
      pattern: /open one's eyes to\s*[-–]\s*([\u10A0-\u10FF][^t]+)/i,
      english: "open one's eyes to",
      patternText: "open one's ___ to",
      answer: "eyes",
      category: 'eye' as const,
    },
    {
      pattern: /be eye catching\s*[-–]\s*([\u10A0-\u10FF][^t]+)/i,
      english: "be eye-catching",
      patternText: "be ___-catching",
      answer: "eye",
      category: 'eye' as const,
    },
    {
      pattern: /do smth with your eyes shut\s*[-–]\s*([\u10A0-\u10FF][^,]+)/i,
      english: "do something with your eyes shut",
      patternText: "do smth with your ___ shut",
      answer: "eyes",
      category: 'eye' as const,
    },
  ]

  // Extract mind expressions
  mindExpressions.forEach((expr) => {
    const match = textContent.match(expr.pattern)
    if (match) {
      idCounter++
      expressions.push({
        id: `expr_${idCounter}`,
        english: expr.english,
        georgian: match[1]?.trim().replace(/[,;:.]+$/, '') || '',
        pattern: expr.patternText,
        answer: expr.answer,
        definition: match[2]?.trim(),
        example: match[3]?.trim(),
        category: expr.category,
      })
    }
  })

  // Extract eye expressions
  eyeExpressions.forEach((expr) => {
    const match = textContent.match(expr.pattern)
    if (match) {
      idCounter++
      expressions.push({
        id: `expr_${idCounter}`,
        english: expr.english,
        georgian: match[1]?.trim().replace(/[,;:.]+$/, '') || '',
        pattern: expr.patternText,
        answer: expr.answer,
        category: expr.category,
      })
    }
  })

  // Extract phrasal verbs
  const phrasalPatterns = [
    { pattern: /go missing\s*[-–]\s*([\w\s]+)/i, english: 'go missing', answer: 'missing', particle: 'go ___' },
    { pattern: /go off\s*[-–]\s*([^;]+)/i, english: 'go off', answer: 'off', particle: 'go ___' },
    { pattern: /turn off\s*[-–]\s*/i, english: 'turn off', answer: 'off', particle: 'turn ___' },
    { pattern: /bring about\s*[-–]\s*([\u10A0-\u10FF][^.]+)/i, english: 'bring about', answer: 'about', particle: 'bring ___' },
    { pattern: /bring up\s*[-–a-z\s]*([\u10A0-\u10FF][^.]+)/i, english: 'bring up', answer: 'up', particle: 'bring ___' },
    { pattern: /drop off\s*[-–]\s*/i, english: 'drop off', answer: 'off', particle: 'drop ___' },
    { pattern: /pop into one's head\s*[-–]\s*/i, english: "pop into one's head", answer: 'into', particle: 'pop ___ one\'s head' },
    { pattern: /dream up\s*[-–a-z\s]*([\u10A0-\u10FF][^.]+)/i, english: 'dream up', answer: 'up', particle: 'dream ___' },
  ]

  phrasalPatterns.forEach((pv) => {
    const match = textContent.match(pv.pattern)
    if (match) {
      idCounter++
      const georgian = typeof match[1] === 'string' && /[\u10A0-\u10FF]/.test(match[1])
        ? match[1].trim().replace(/[,;:.]+$/, '')
        : ''

      expressions.push({
        id: `expr_${idCounter}`,
        english: pv.english,
        georgian: georgian,
        pattern: pv.particle,
        answer: pv.answer,
        category: 'phrasal',
      })
    }
  })

  return expressions
}

/**
 * Extract context sentences for Context Mode
 */
export interface ContextSentence {
  id: string
  sentence: string           // Full sentence
  sentenceWithBlank: string  // Sentence with ___ for the word
  answer: string             // The word to guess
  georgian: string           // Georgian translation hint
  word: string               // The vocabulary word
}

export function extractContextSentences(textContent: string): ContextSentence[] {
  const sentences: ContextSentence[] = []
  let idCounter = 0

  // Find E.g. patterns
  const egPattern = /(\w[\w\s''-]+)\s*\[[^\]]*\]\s*([\u10A0-\u10FF][^.]*)[^E]*E\.g\.\s*([^.!?]+[.!?])/gi

  let match
  while ((match = egPattern.exec(textContent)) !== null) {
    const word = match[1].trim().toLowerCase()
    const georgian = match[2].trim()
    const example = match[3].trim()

    // Check if the word appears in the example
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i')
    if (wordRegex.test(example)) {
      idCounter++
      sentences.push({
        id: `ctx_${idCounter}`,
        sentence: example,
        sentenceWithBlank: example.replace(wordRegex, '___'),
        answer: word,
        georgian: georgian.replace(/[,;:.]+$/, ''),
        word: word,
      })
    }
  }

  // Also find sentences in quotes
  const quotePattern = /(\w[\w\s''-]+)\s*[-–]\s*([\u10A0-\u10FF][^"]*)"([^"]+)"/gi

  while ((match = quotePattern.exec(textContent)) !== null) {
    const word = match[1].trim().toLowerCase()
    const georgian = match[2].trim()
    const example = match[3].trim()

    const wordRegex = new RegExp(`\\b${word}\\b`, 'i')
    if (wordRegex.test(example) && example.length > 20) {
      idCounter++
      sentences.push({
        id: `ctx_${idCounter}`,
        sentence: example,
        sentenceWithBlank: example.replace(wordRegex, '___'),
        answer: word,
        georgian: georgian.replace(/[,;:.]+$/, ''),
        word: word,
      })
    }
  }

  return sentences
}

/**
 * Get hardcoded expressions for demo (fallback)
 */
export function getHardcodedExpressions(): Expression[] {
  return [
    // ==================== MIND EXPRESSIONS ====================
    {
      id: 'mind_1',
      english: "see something in your mind's eye",
      georgian: 'წარმოდგენა, წარმოსახვა',
      pattern: "see smth in your mind's ___",
      answer: 'eye',
      definition: 'to imagine or remember what someone or something looks like',
      example: "In my mind's eye, I saw him coming down the path to meet me.",
      category: 'mind',
    },
    {
      id: 'mind_2',
      english: 'put your mind to something',
      georgian: 'გააზრება ძალისხმევით, მტკიცე გადაწყვეტილების მიღება',
      pattern: 'put your ___ to smth',
      answer: 'mind',
      definition: 'to decide to do something and put a lot of effort into it',
      example: "If you'd just put your mind to it, I'm sure you could do it.",
      category: 'mind',
    },
    {
      id: 'mind_3',
      english: 'bear in mind',
      georgian: 'მთელი ყურადღების რაიმეზე მიმართვა, კონცენტრირება',
      pattern: 'bear in/on ___',
      answer: 'mind',
      definition: 'to remember or consider something',
      category: 'mind',
    },
    {
      id: 'mind_4',
      english: 'be in two minds',
      georgian: 'მერყეობს, ორჭოფობს, ვერ გადაუწყვეტია',
      pattern: 'be in two ___',
      answer: 'minds',
      definition: 'to be unable to decide about something',
      category: 'mind',
    },
    {
      id: 'mind_5',
      english: "blow one's mind",
      georgian: 'განცვიფრება',
      pattern: "blow one's ___",
      answer: 'mind',
      definition: 'to extremely impress, overwhelm, or excite someone',
      example: 'The show of support from everyone just blew my mind.',
      category: 'mind',
    },
    {
      id: 'mind_6',
      english: 'keep an open mind',
      georgian: 'დაუფიქრებლად ნუ გადაწყვეტ',
      pattern: 'keep an open ___',
      answer: 'mind',
      definition: 'avoid making a judgment without full knowledge',
      example: "Try to keep an open mind—once you get to know him better, you'll find that he's really quite funny.",
      category: 'mind',
    },
    {
      id: 'mind_7',
      english: "have something on one's mind",
      georgian: 'რამეზე ფიქრობს, რაღაც აწუხებს',
      pattern: "have smth on one's ___",
      answer: 'mind',
      definition: 'to be thinking or worrying about something',
      category: 'mind',
    },

    // Eye expressions
    {
      id: 'eye_1',
      english: 'keep an eye on',
      georgian: 'თვალყურის ჭერა, ყურადღების მიქცევა',
      pattern: 'keep an ___ on',
      answer: 'eye',
      definition: 'to watch someone or something carefully',
      category: 'eye',
    },
    {
      id: 'eye_2',
      english: "be up to one's eyes in",
      georgian: 'ყელამდე (საქმეში)',
      pattern: "be up to one's ___ in",
      answer: 'eyes',
      definition: 'to be very busy with something',
      category: 'eye',
    },
    {
      id: 'eye_3',
      english: 'see with the naked eye',
      georgian: 'შეუიარაღებელი თვალით დანახვა',
      pattern: 'see with the naked ___',
      answer: 'eye',
      definition: 'to see without using any special equipment',
      category: 'eye',
    },
    {
      id: 'eye_4',
      english: "open one's eyes to",
      georgian: 'მიხვდე სიმართლეს, შეიგნო',
      pattern: "open one's ___ to",
      answer: 'eyes',
      definition: 'to make someone realize the truth about something',
      category: 'eye',
    },
    {
      id: 'eye_5',
      english: 'be eye-catching',
      georgian: 'მიმზიდველი',
      pattern: 'be ___-catching',
      answer: 'eye',
      definition: 'to be very attractive or noticeable',
      category: 'eye',
    },
    {
      id: 'eye_6',
      english: 'do something with your eyes shut',
      georgian: 'რაიმეს თვალდახუჭული გაკეთება, ადვილად გაკეთება',
      pattern: 'do smth with your ___ shut',
      answer: 'eyes',
      definition: 'to be able to do something very easily',
      category: 'eye',
    },

    // ==================== PHRASAL VERBS ====================
    {
      id: 'phrasal_1',
      english: 'go missing',
      georgian: 'გაქრობა, დაკარგვა',
      pattern: 'go ___',
      answer: 'missing',
      definition: 'to disappear',
      category: 'phrasal',
    },
    {
      id: 'phrasal_2',
      english: 'bring about',
      georgian: 'გამოწვევა',
      pattern: 'bring ___',
      answer: 'about',
      definition: 'to cause something to happen',
      category: 'phrasal',
    },
    {
      id: 'phrasal_3',
      english: 'bring up',
      georgian: 'საკითხის დასმა',
      pattern: 'bring ___',
      answer: 'up',
      definition: 'to introduce a topic into a discussion',
      category: 'phrasal',
    },
    {
      id: 'phrasal_4',
      english: 'drop off',
      georgian: 'შემცირება',
      pattern: 'drop ___',
      answer: 'off',
      definition: 'to become less',
      category: 'phrasal',
    },
    {
      id: 'phrasal_5',
      english: "pop into one's head",
      georgian: 'უეცრად მოსვლა თავში',
      pattern: "pop ___ one's head",
      answer: 'into',
      definition: "to occur suddenly in someone's mind",
      category: 'phrasal',
    },
    {
      id: 'phrasal_6',
      english: 'dream up',
      georgian: 'მოგონება, გონებაში შექმნა',
      pattern: 'dream ___',
      answer: 'up',
      definition: 'to think of or create something in your mind',
      category: 'phrasal',
    },
    {
      id: 'phrasal_7',
      english: 'go off',
      georgian: 'აფეთქება, გააქტიურება',
      pattern: 'go ___',
      answer: 'off',
      definition: 'to explode or be activated',
      category: 'phrasal',
    },
    {
      id: 'phrasal_8',
      english: 'turn off',
      georgian: 'გამორთვა',
      pattern: 'turn ___',
      answer: 'off',
      definition: 'to switch off',
      category: 'phrasal',
    },
    {
      id: 'phrasal_9',
      english: 'come into being',
      georgian: 'წარმოშობა, დაბადება',
      pattern: 'come ___ being',
      answer: 'into',
      definition: 'to begin to exist',
      category: 'phrasal',
    },
    {
      id: 'phrasal_10',
      english: 'call in sick',
      georgian: 'ავადმყოფობის გამო გამოუცხადებლობა',
      pattern: 'call ___ sick',
      answer: 'in',
      definition: 'to phone work to say you are ill',
      category: 'phrasal',
    },
    {
      id: 'phrasal_11',
      english: 'stem from',
      georgian: 'წარმოშობა, გამომდინარეობა',
      pattern: 'stem ___',
      answer: 'from',
      definition: 'to originate from or be caused by',
      category: 'phrasal',
    },
    {
      id: 'phrasal_12',
      english: 'fade into',
      georgian: 'ნელ-ნელა გადასვლა',
      pattern: 'fade ___',
      answer: 'into',
      definition: 'to slowly transition from one thing to another',
      category: 'phrasal',
    },

    // ==================== IDIOMS ====================
    {
      id: 'idiom_1',
      english: 'tie the knot',
      georgian: 'დაქორწინება',
      pattern: 'tie the ___',
      answer: 'knot',
      definition: 'to get married',
      category: 'idiom',
    },
    {
      id: 'idiom_2',
      english: 'go the extra mile',
      georgian: 'განსაკუთრებული ძალისხმევა',
      pattern: 'go the extra ___',
      answer: 'mile',
      definition: 'to make a special effort to achieve something',
      category: 'idiom',
    },
    {
      id: 'idiom_3',
      english: 'up the ante',
      georgian: 'მოთხოვნების გაზრდა',
      pattern: 'up the ___',
      answer: 'ante',
      definition: 'to increase demands or risks to achieve a better result',
      category: 'idiom',
    },
    {
      id: 'idiom_4',
      english: 'strike a balance',
      georgian: 'ბალანსის დაცვა',
      pattern: 'strike a ___',
      answer: 'balance',
      definition: 'to choose a moderate course or compromise',
      category: 'idiom',
    },
    {
      id: 'idiom_5',
      english: "keep one's cool",
      georgian: 'სიმშვიდის შენარჩუნება',
      pattern: "keep one's ___",
      answer: 'cool',
      definition: 'to remain calm',
      category: 'idiom',
    },
    {
      id: 'idiom_6',
      english: 'warts and all',
      georgian: 'ნაკლოვანებებითურთ',
      pattern: '___ and all',
      answer: 'warts',
      definition: 'including unattractive features or qualities',
      example: 'Philip must learn to accept me, warts and all.',
      category: 'idiom',
    },
    {
      id: 'idiom_7',
      english: 'push boundaries',
      georgian: 'საზღვრების გაფართოება',
      pattern: 'push ___',
      answer: 'boundaries',
      definition: 'to try to expand beyond current limits',
      category: 'idiom',
    },
    {
      id: 'idiom_8',
      english: 'pull a sickie',
      georgian: 'მოტყუებით გაცდენა',
      pattern: 'pull a ___',
      answer: 'sickie',
      definition: 'to take a day off pretending to be ill',
      category: 'idiom',
    },
    {
      id: 'idiom_9',
      english: 'be a team player',
      georgian: 'გუნდური მოთამაშე',
      pattern: 'be a ___ player',
      answer: 'team',
      definition: 'to work well with others to achieve goals',
      category: 'idiom',
    },
    {
      id: 'idiom_10',
      english: 'share the load',
      georgian: 'ტვირთის გაზიარება',
      pattern: 'share the ___',
      answer: 'load',
      definition: 'to distribute work among people',
      category: 'idiom',
    },
    {
      id: 'idiom_11',
      english: 'build rapport',
      georgian: 'კონტაქტის დამყარება',
      pattern: 'build ___',
      answer: 'rapport',
      definition: 'to establish a good relationship',
      category: 'idiom',
    },
    {
      id: 'idiom_12',
      english: 'keep a straight face',
      georgian: 'სიცილის შეკავება',
      pattern: 'keep a ___ face',
      answer: 'straight',
      definition: 'to look serious although you want to laugh',
      category: 'idiom',
    },
  ]
}

/**
 * Get hardcoded context sentences for demo
 */
export function getHardcodedContextSentences(): ContextSentence[] {
  return [
    // ==================== VOCABULARY WORDS ====================
    {
      id: 'ctx_1',
      sentence: 'She emerged as one of the great, idiosyncratic talents of the 90s.',
      sentenceWithBlank: 'She emerged as one of the great, ___ talents of the 90s.',
      answer: 'idiosyncratic',
      georgian: 'თავისებური, უნიკალური',
      word: 'idiosyncratic',
    },
    {
      id: 'ctx_2',
      sentence: 'These paintings are in some ways a reminder that earthly pleasures are ephemeral.',
      sentenceWithBlank: 'These paintings are in some ways a reminder that earthly pleasures are ___.',
      answer: 'ephemeral',
      georgian: 'ხანმოკლე',
      word: 'ephemeral',
    },
    {
      id: 'ctx_3',
      sentence: 'The music was so compelling that I could not stop listening.',
      sentenceWithBlank: 'The music was so ___ that I could not stop listening.',
      answer: 'compelling',
      georgian: 'მიმზიდველი, დამაინტერესებელი',
      word: 'compelling',
    },
    {
      id: 'ctx_4',
      sentence: 'He is an avid reader of science fiction novels.',
      sentenceWithBlank: 'He is an ___ reader of science fiction novels.',
      answer: 'avid',
      georgian: 'მგზნებარე, მოტრფიალე',
      word: 'avid',
    },
    {
      id: 'ctx_5',
      sentence: 'The volcano has been dormant for over a hundred years.',
      sentenceWithBlank: 'The volcano has been ___ for over a hundred years.',
      answer: 'dormant',
      georgian: 'მთვლემარე, არააქტიური',
      word: 'dormant',
    },
    {
      id: 'ctx_6',
      sentence: 'We watched the wondrous sunset over the ocean.',
      sentenceWithBlank: 'We watched the ___ sunset over the ocean.',
      answer: 'wondrous',
      georgian: 'სასწაულებრივი, მშვენიერი',
      word: 'wondrous',
    },
    {
      id: 'ctx_7',
      sentence: 'The building suffered tremendous damage during the storm.',
      sentenceWithBlank: 'The building suffered ___ damage during the storm.',
      answer: 'tremendous',
      georgian: 'უზარმაზარი, საშინელი',
      word: 'tremendous',
    },
    {
      id: 'ctx_8',
      sentence: 'His arrogance made him unpopular with his colleagues.',
      sentenceWithBlank: 'His ___ made him unpopular with his colleagues.',
      answer: 'arrogance',
      georgian: 'ქედმაღლობა, ამპარტავნობა',
      word: 'arrogance',
    },
    {
      id: 'ctx_9',
      sentence: 'The audience was mesmerized by the magic show.',
      sentenceWithBlank: 'The audience was ___ by the magic show.',
      answer: 'mesmerized',
      georgian: 'მოჯადოებული, დაჰიპნოზებული',
      word: 'mesmerized',
    },
    {
      id: 'ctx_10',
      sentence: 'The porous material allows water to pass through.',
      sentenceWithBlank: 'The ___ material allows water to pass through.',
      answer: 'porous',
      georgian: 'ფოროვანი',
      word: 'porous',
    },

    // ==================== MIND/EYE EXPRESSIONS ====================
    {
      id: 'ctx_11',
      sentence: 'The show of support from everyone just blew my mind.',
      sentenceWithBlank: 'The show of support from everyone just ___ my mind.',
      answer: 'blew',
      georgian: 'განცვიფრება',
      word: "blow one's mind",
    },
    {
      id: 'ctx_12',
      sentence: "If you'd just put your mind to it, I'm sure you could do it.",
      sentenceWithBlank: "If you'd just ___ your mind to it, I'm sure you could do it.",
      answer: 'put',
      georgian: 'გააზრება ძალისხმევით',
      word: 'put your mind to',
    },
    {
      id: 'ctx_13',
      sentence: "In my mind's eye, I saw him coming down the path to meet me.",
      sentenceWithBlank: "In my mind's ___, I saw him coming down the path to meet me.",
      answer: 'eye',
      georgian: 'წარმოდგენა, წარმოსახვა',
      word: "mind's eye",
    },
    {
      id: 'ctx_14',
      sentence: 'Try to keep an open mind—once you get to know him better.',
      sentenceWithBlank: 'Try to keep an ___ mind—once you get to know him better.',
      answer: 'open',
      georgian: 'მიკერძოებულობის გარეშე',
      word: 'keep an open mind',
    },
    {
      id: 'ctx_15',
      sentence: 'Please keep an eye on my bag while I go to the restroom.',
      sentenceWithBlank: 'Please keep an ___ on my bag while I go to the restroom.',
      answer: 'eye',
      georgian: 'თვალყურის ჭერა',
      word: 'keep an eye on',
    },
    {
      id: 'ctx_16',
      sentence: "I'm up to my eyes in work this week.",
      sentenceWithBlank: "I'm up to my ___ in work this week.",
      answer: 'eyes',
      georgian: 'ყელამდე ჩაფლობა',
      word: "up to one's eyes",
    },

    // ==================== PHRASAL VERBS ====================
    {
      id: 'ctx_17',
      sentence: 'The alarm went off at 6 AM and woke everyone up.',
      sentenceWithBlank: 'The alarm went ___ at 6 AM and woke everyone up.',
      answer: 'off',
      georgian: 'ჩართვა, გააქტიურება',
      word: 'go off',
    },
    {
      id: 'ctx_18',
      sentence: 'A brilliant idea just popped into my head.',
      sentenceWithBlank: 'A brilliant idea just popped ___ my head.',
      answer: 'into',
      georgian: 'უეცრად მოსვლა თავში',
      word: 'pop into',
    },
    {
      id: 'ctx_19',
      sentence: 'Many health problems stem from poor diet.',
      sentenceWithBlank: 'Many health problems ___ from poor diet.',
      answer: 'stem',
      georgian: 'გამომდინარეობა',
      word: 'stem from',
    },
    {
      id: 'ctx_20',
      sentence: 'He called in sick because he had a high fever.',
      sentenceWithBlank: 'He called ___ sick because he had a high fever.',
      answer: 'in',
      georgian: 'ავადმყოფობის შეტყობინება',
      word: 'call in sick',
    },

    // ==================== IDIOMS ====================
    {
      id: 'ctx_21',
      sentence: 'After dating for five years, they finally decided to tie the knot.',
      sentenceWithBlank: 'After dating for five years, they finally decided to tie the ___.',
      answer: 'knot',
      georgian: 'დაქორწინება',
      word: 'tie the knot',
    },
    {
      id: 'ctx_22',
      sentence: 'She always goes the extra mile to help her students succeed.',
      sentenceWithBlank: 'She always goes the extra ___ to help her students succeed.',
      answer: 'mile',
      georgian: 'განსაკუთრებული ძალისხმევა',
      word: 'go the extra mile',
    },
    {
      id: 'ctx_23',
      sentence: 'Philip must learn to accept me, warts and all.',
      sentenceWithBlank: 'Philip must learn to accept me, ___ and all.',
      answer: 'warts',
      georgian: 'ნაკლოვანებებითურთ',
      word: 'warts and all',
    },
    {
      id: 'ctx_24',
      sentence: 'It was so funny, but I managed to keep a straight face.',
      sentenceWithBlank: 'It was so funny, but I managed to keep a ___ face.',
      answer: 'straight',
      georgian: 'სიცილის შეკავება',
      word: 'keep a straight face',
    },
    {
      id: 'ctx_25',
      sentence: 'Good managers know how to build rapport with their teams.',
      sentenceWithBlank: 'Good managers know how to build ___ with their teams.',
      answer: 'rapport',
      georgian: 'კარგი ურთიერთობა',
      word: 'build rapport',
    },
  ]
}
