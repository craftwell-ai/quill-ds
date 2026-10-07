/**
 * Colour parsing for the Paper sync. A browser reports the same colour in several spellings
 * (`rgb()`, `rgba()`, `oklab()` for a `color-mix`, `color(srgb …)`), Paper stores its own
 * (`rgb(42 38 34 / 12%)`, `#F5EDDD`), and the token source uses a third. Everything is
 * compared as sRGB 0–255 plus alpha, so "the same colour" never depends on the spelling.
 */

const clamp = (value, low, high) => Math.min(high, Math.max(low, value))
const number = (text, scale = 1) => (text.endsWith('%') ? (parseFloat(text) / 100) * scale : parseFloat(text))
const gamma = (linear) => (linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055)

/** OKLab → sRGB 0–255 (Björn Ottosson's matrices), clamped into gamut. */
export function oklabToRgb(lightness, a, b) {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => clamp(gamma(channel), 0, 1) * 255)
}

/** Any CSS colour this sync meets → `{ r, g, b, a }` (0–255, alpha 0–1), or null when it is not a plain colour. */
export function parseColor(input) {
  if (typeof input !== 'string') return null
  const text = input.trim().toLowerCase()
  if (text === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
  const hex = text.match(/^#([0-9a-f]{3,8})$/)
  if (hex) {
    let digits = hex[1]
    if (digits.length === 3 || digits.length === 4) digits = [...digits].map((d) => d + d).join('')
    if (digits.length !== 6 && digits.length !== 8) return null
    const at = (i) => parseInt(digits.slice(i, i + 2), 16)
    return { r: at(0), g: at(2), b: at(4), a: digits.length === 8 ? at(6) / 255 : 1 }
  }
  const fn = text.match(/^([a-z]+)\((.*)\)$/)
  if (!fn) return null
  const [, name, body] = fn
  const [channelsPart, alphaPart] = body.split('/')
  let parts = channelsPart.split(/[\s,]+/).filter(Boolean)
  let alpha = alphaPart !== undefined ? number(alphaPart.trim()) : 1
  if (name === 'rgb' || name === 'rgba') {
    // the legacy comma form carries alpha as a fourth channel
    if (parts.length === 4) alpha = number(parts[3])
    if (parts.length < 3) return null
    const [r, g, b] = parts.slice(0, 3).map((part) => number(part, 255))
    return { r, g, b, a: alpha }
  }
  if (name === 'oklab' || name === 'oklch') {
    if (parts.length < 3) return null
    const lightness = number(parts[0])
    let a = number(parts[1], 0.4)
    let b = number(parts[2], 0.4)
    if (name === 'oklch') {
      const hue = (parseFloat(parts[2]) * Math.PI) / 180
      const chroma = number(parts[1], 0.4)
      a = chroma * Math.cos(hue)
      b = chroma * Math.sin(hue)
    }
    const [r, g, blue] = oklabToRgb(lightness, a, b)
    return { r, g, b: blue, a: alpha }
  }
  if (name === 'color' && parts[0] === 'srgb') {
    parts = parts.slice(1)
    if (parts.length < 3) return null
    const [r, g, b] = parts.map((part) => number(part) * 255)
    return { r, g, b, a: alpha }
  }
  return null
}

/**
 * Same colour within rounding: a `color-mix` comes back from the browser as OKLab floats,
 * so one 8-bit step per channel and half a percent of alpha is the honest tolerance.
 */
export function sameColor(first, second, tolerance = 1.01) {
  if (!first || !second) return false
  if (first.a === 0 && second.a === 0) return true
  return Math.abs(first.r - second.r) <= tolerance && Math.abs(first.g - second.g) <= tolerance && Math.abs(first.b - second.b) <= tolerance && Math.abs(first.a - second.a) <= 0.006
}

/** The short spelling written into Paper when no token matches: hex when opaque, `rgba()` when not. */
export function formatColor(color) {
  const channel = (value) => clamp(Math.round(value), 0, 255)
  if (color.a >= 0.999) return '#' + [color.r, color.g, color.b].map((value) => channel(value).toString(16).padStart(2, '0')).join('').toUpperCase()
  return `rgba(${channel(color.r)}, ${channel(color.g)}, ${channel(color.b)}, ${Math.round(color.a * 1000) / 1000})`
}

// A colour function with one level of nested parentheses (`rgb(…)`, `color(srgb …)`), or a hex.
const COLOR_IN_TEXT = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|oklab|oklch|color)\([^()]*\)/g

/** Rewrite every colour inside a longer value (a gradient, a shadow) with `replace(color, original)`. */
export function mapColors(value, replace) {
  return value.replace(COLOR_IN_TEXT, (match) => {
    const color = parseColor(match)
    return color ? replace(color, match) : match
  })
}
