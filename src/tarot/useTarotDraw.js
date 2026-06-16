import tarotData from '../hooks/tarot-images.json'

// import.meta.glob must be at module scope for Vite static analysis
const cardImages = import.meta.glob('../assets/cards/*.jpg', { eager: true, import: 'default' })

export function resolveCardImage(img) {
  return cardImages[`../assets/cards/${img}`]
}

const YES_NO_TABLE = {
  // Major Arcana
  'The Fool': 'yes', 'The Magician': 'yes', 'The High Priestess': 'maybe',
  'The Empress': 'yes', 'The Emperor': 'yes', 'The Hierophant': 'no',
  'The Lovers': 'yes', 'The Chariot': 'yes', 'Strength': 'yes',
  'The Hermit': 'no', 'Wheel of Fortune': 'yes', 'Justice': 'maybe',
  'The Hanged Man': 'no', 'Death': 'no', 'Temperance': 'maybe',
  'The Devil': 'no', 'The Tower': 'no', 'The Star': 'yes',
  'The Moon': 'no', 'The Sun': 'yes', 'Judgement': 'maybe', 'The World': 'yes',
  // Wands
  'Ace of Wands': 'yes', 'Two of Wands': 'maybe', 'Three of Wands': 'yes',
  'Four of Wands': 'yes', 'Five of Wands': 'no', 'Six of Wands': 'yes',
  'Seven of Wands': 'maybe', 'Eight of Wands': 'yes', 'Nine of Wands': 'maybe',
  'Ten of Wands': 'no', 'Page of Wands': 'maybe', 'Knight of Wands': 'yes',
  'Queen of Wands': 'yes', 'King of Wands': 'yes',
  // Cups
  'Ace of Cups': 'yes', 'Two of Cups': 'yes', 'Three of Cups': 'yes',
  'Four of Cups': 'no', 'Five of Cups': 'no', 'Six of Cups': 'maybe',
  'Seven of Cups': 'maybe', 'Eight of Cups': 'no', 'Nine of Cups': 'yes',
  'Ten of Cups': 'yes', 'Page of Cups': 'maybe', 'Knight of Cups': 'yes',
  'Queen of Cups': 'yes', 'King of Cups': 'yes',
  // Swords
  'Ace of Swords': 'yes', 'Two of Swords': 'maybe', 'Three of Swords': 'no',
  'Four of Swords': 'no', 'Five of Swords': 'no', 'Six of Swords': 'maybe',
  'Seven of Swords': 'no', 'Eight of Swords': 'no', 'Nine of Swords': 'no',
  'Ten of Swords': 'no', 'Page of Swords': 'maybe', 'Knight of Swords': 'maybe',
  'Queen of Swords': 'maybe', 'King of Swords': 'yes',
  // Pentacles
  'Ace of Pentacles': 'yes', 'Two of Pentacles': 'maybe', 'Three of Pentacles': 'yes',
  'Four of Pentacles': 'no', 'Five of Pentacles': 'no', 'Six of Pentacles': 'yes',
  'Seven of Pentacles': 'maybe', 'Eight of Pentacles': 'yes', 'Nine of Pentacles': 'yes',
  'Ten of Pentacles': 'yes', 'Page of Pentacles': 'maybe', 'Knight of Pentacles': 'maybe',
  'Queen of Pentacles': 'yes', 'King of Pentacles': 'yes'
}

const FLIP = { yes: 'no', no: 'yes', maybe: 'maybe' }

export function drawSpread(spread) {
  const deck = [...tarotData.cards]

  // Fisher-Yates shuffle — guarantees no duplicate cards in a spread
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }

  const isSingle = spread.positions.length === 1

  return spread.positions.map((position, idx) => {
    const reversed = Math.random() < 0.5
    const drawn = {
      position,
      name: deck[idx].name,
      arcana: deck[idx].arcana,
      suit: deck[idx].suit,
      img: deck[idx].img,
      keywords: deck[idx].keywords,
      reversed
    }

    if (isSingle) {
      const base = YES_NO_TABLE[deck[idx].name] ?? 'maybe'
      drawn.yesNoMaybe = reversed ? FLIP[base] : base
    }

    return drawn
  })
}
