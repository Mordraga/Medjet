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

// ── Wheel of the Year ─────────────────────────────────────────────────────────

const SABBATS = [
  { name: 'Imbolc',     month: 2,  day: 2,  emoji: '🕯',  short: 'First stirring of spring. Fire, purification, Brigid.' },
  { name: 'Ostara',     month: 3,  day: 21, emoji: '🌱',  short: 'Spring equinox. Balance, new growth, planting intentions.' },
  { name: 'Beltane',    month: 5,  day: 1,  emoji: '🌸',  short: 'Height of spring. Fertility, passion, the May fires.' },
  { name: 'Litha',      month: 6,  day: 21, emoji: '☀️', short: 'Summer solstice. Solar peak, abundance, fae activity.' },
  { name: 'Lughnasadh', month: 8,  day: 1,  emoji: '🌾',  short: 'First harvest. Gratitude, skill, sacrifice of the grain.' },
  { name: 'Mabon',      month: 9,  day: 21, emoji: '🍂',  short: 'Autumn equinox. Second harvest, balance, the descent.' },
  { name: 'Samhain',    month: 10, day: 31, emoji: '🕸',  short: 'The veil thins. Ancestors, death, divination, endings.' },
  { name: 'Yule',       month: 12, day: 21, emoji: '❄️', short: 'Winter solstice. Rebirth of the sun, returning light.' },
]

export function getNextSabbat(date = new Date()) {
  const year = date.getFullYear()
  const todayMidnight = new Date(year, date.getMonth(), date.getDate())
  const candidates = []
  for (const s of SABBATS) {
    for (const y of [year, year + 1]) {
      const d = new Date(y, s.month - 1, s.day)
      if (d >= todayMidnight) { candidates.push({ ...s, date: d }); break }
    }
  }
  candidates.sort((a, b) => a.date - b.date)
  const next = candidates[0]
  const days = Math.round((next.date - todayMidnight) / 86400000)
  return { ...next, days }
}

// ── Planetary hours ───────────────────────────────────────────────────────────

const D2R = Math.PI / 180
const JD_EPOCH = 2440587.5
const MS_PER_DAY = 86400000

function calcJD(date) {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12)
  const y = date.getFullYear() + 4800 - a
  const m = (date.getMonth() + 1) + 12 * a - 3
  return date.getDate()
    + Math.floor((153 * m + 2) / 5)
    + 365 * y
    + Math.floor(y / 4)
    - Math.floor(y / 100)
    + Math.floor(y / 400)
    - 32045
}

function calcSunEvent(date, lat, lon, rising) {
  const jd    = calcJD(date) - 0.5
  const n     = jd - 2451545.0
  const Js    = n - lon / 360
  const M     = ((357.5291 + 0.98560028 * Js) % 360 + 360) % 360
  const C     = 1.9148 * Math.sin(M * D2R) + 0.02 * Math.sin(2 * M * D2R) + 0.0003 * Math.sin(3 * M * D2R)
  const lam   = ((M + C + 282.9372) % 360 + 360) % 360
  const Jt    = 2451545.0 + Js + 0.0053 * Math.sin(M * D2R) - 0.0069 * Math.sin(2 * lam * D2R)
  const sinD  = Math.sin(lam * D2R) * Math.sin(23.4559 * D2R)
  const cosD  = Math.cos(Math.asin(sinD))
  const cosH  = (Math.sin(-0.83333 * D2R) - Math.sin(lat * D2R) * sinD) / (Math.cos(lat * D2R) * cosD)
  if (cosH < -1 || cosH > 1) return null
  const H = Math.acos(cosH) * (180 / Math.PI) / 360
  return new Date(((rising ? Jt - H : Jt + H) - JD_EPOCH) * MS_PER_DAY)
}

const CHALDEAN = [
  { planet: 'Saturn',  symbol: '♄' },
  { planet: 'Jupiter', symbol: '♃' },
  { planet: 'Mars',    symbol: '♂' },
  { planet: 'Sun',     symbol: '☉' },
  { planet: 'Venus',   symbol: '♀' },
  { planet: 'Mercury', symbol: '☿' },
  { planet: 'Moon',    symbol: '☽' },
]
// Chaldean index of the day ruler for each weekday (0=Sun … 6=Sat)
const DAY_RULER_IDX = [3, 6, 2, 5, 1, 4, 0]

export function getPlanetaryHours(date, lat, lon) {
  const sunrise = calcSunEvent(date, lat, lon, true)
  const sunset  = calcSunEvent(date, lat, lon, false)
  if (!sunrise || !sunset) return null

  const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  const nextSunrise = calcSunEvent(tomorrow, lat, lon, true)
  if (!nextSunrise) return null

  const dayMs   = (sunset - sunrise) / 12
  const nightMs = (nextSunrise - sunset) / 12
  const rIdx    = DAY_RULER_IDX[date.getDay()]
  const hours   = []

  for (let i = 0; i < 12; i++) {
    hours.push({
      ...CHALDEAN[(rIdx + i) % 7],
      start: new Date(sunrise.getTime() + i * dayMs),
      end:   new Date(sunrise.getTime() + (i + 1) * dayMs),
      period: 'day', num: i + 1
    })
  }
  for (let i = 0; i < 12; i++) {
    hours.push({
      ...CHALDEAN[(rIdx + 12 + i) % 7],
      start: new Date(sunset.getTime() + i * nightMs),
      end:   new Date(sunset.getTime() + (i + 1) * nightMs),
      period: 'night', num: i + 1
    })
  }
  return { hours, sunrise, sunset }
}
