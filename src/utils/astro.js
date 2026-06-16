const LUNAR_CYCLE = 29.53059
// Verified new moon reference: June 15, 2026 ≈ 00:00 UTC (moongiant.com)
// Working back one cycle gives May 16, 2026 ~11:00 UTC as previous new moon
// Using Jan 6, 2000 18:14 UTC — mean motion approximation, ~1 day error over decades
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z')
const J2000 = new Date('2000-01-01T12:00:00Z')

export function getMoonAge(date = new Date()) {
  const elapsed = (date - KNOWN_NEW_MOON) / 86400000
  return ((elapsed % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE
}

export function getMoonPhaseInfo(age) {
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * age / LUNAR_CYCLE)) / 2 * 100)

  let name, emoji
  if      (age < 1.85)  { name = 'New Moon';        emoji = '🌑' }
  else if (age < 7.38)  { name = 'Waxing Crescent'; emoji = '🌒' }
  else if (age < 9.22)  { name = 'First Quarter';   emoji = '🌓' }
  else if (age < 14.77) { name = 'Waxing Gibbous';  emoji = '🌔' }
  else if (age < 16.61) { name = 'Full Moon';        emoji = '🌕' }
  else if (age < 22.15) { name = 'Waning Gibbous';  emoji = '🌖' }
  else if (age < 24.0)  { name = 'Last Quarter';    emoji = '🌗' }
  else                  { name = 'Waning Crescent';  emoji = '🌘' }

  return { name, emoji, illumination }
}

export function getNextLunarEvent(age) {
  if (age < 14.77) {
    const days = Math.ceil(14.77 - age)
    return { name: 'Full Moon', emoji: '🌕', days }
  } else {
    const days = Math.ceil(LUNAR_CYCLE - age)
    return { name: 'New Moon', emoji: '🌑', days }
  }
}

const SIGNS    = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
const SYMBOLS  = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']

function lonToSign(lon) {
  const idx = Math.floor(((lon % 360) + 360) % 360 / 30)
  return { name: SIGNS[idx], symbol: SYMBOLS[idx] }
}

export function getMoonSign(date = new Date()) {
  const days = (date - J2000) / 86400000
  const lon = ((218.3165 + 13.176396 * days) % 360 + 360) % 360
  return lonToSign(lon)
}

export function getSunSign(date = new Date()) {
  const days = (date - J2000) / 86400000
  const lon = ((280.46 + 0.985647 * days) % 360 + 360) % 360
  return lonToSign(lon)
}

const PLANETARY_DAYS = [
  { planet: 'Sun',     symbol: '☉' },
  { planet: 'Moon',    symbol: '☽' },
  { planet: 'Mars',    symbol: '♂' },
  { planet: 'Mercury', symbol: '☿' },
  { planet: 'Jupiter', symbol: '♃' },
  { planet: 'Venus',   symbol: '♀' },
  { planet: 'Saturn',  symbol: '♄' },
]

export function getPlanetaryDay(date = new Date()) {
  return PLANETARY_DAYS[date.getDay()]
}
