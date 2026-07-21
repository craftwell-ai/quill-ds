/**
 * @typedef {{ light: string, dark: string, classicLight: string, classicDark: string }} ModeValue
 * Single source of truth for Quill tokens. Edit here, then run `npm run build:tokens`.
 *
 * Four themes: light (Dawn, the default), dark (Dusk), classicLight (Classic Light,
 * pure white) and classicDark (Classic Dark, pure black). The classic pair runs the
 * same pigment hues pushed +50% chroma in OKLCH (gamut-clamped) on neutral grounds.
 */
export const tokens = {
  font: {
    sans: '"Raleway", -apple-system, BlinkMacSystemFont, sans-serif',
    display: '"Fraunces", Georgia, serif',
    heading: '"Fraunces", Georgia, serif',
    mono: 'ui-monospace, "SF Mono", Menlo, monospace',
  },
  color: {
    paper: {
      base: { light: '#F5EDDD', dark: '#20180E', classicLight: '#FFFFFF', classicDark: '#000000' },
      warm: { light: '#EFE4CE', dark: '#2A2014', classicLight: '#F7F7F7', classicDark: '#111111' },
      deep: { light: '#E8DCC0', dark: '#352A1A', classicLight: '#EFEFEF', classicDark: '#1C1C1C' },
    },
    ink: {
      base: { light: '#2A2622', dark: '#F1E7D3', classicLight: '#171717', classicDark: '#F5F5F5' },
      soft: { light: '#5C524A', dark: '#C8B9A0', classicLight: '#454545', classicDark: '#C9C9C9' },
      muted: { light: '#675F58', dark: '#A89880', classicLight: '#5E5E5E', classicDark: '#A0A0A0' },
    },
    pigment: {
      terracotta: {
        base: { light: '#C4684B', dark: '#DB8568', classicLight: '#DE501B', classicDark: '#F57345' },
        deep: { light: '#8A4530', dark: '#E89A80', classicLight: '#9D3209', classicDark: '#FE8D67' },
      },
      moss: {
        base: { light: '#7A8C5C', dark: '#A2B57E', classicLight: '#758F43', classicDark: '#9DB962' },
        deep: { light: '#5E6E43', dark: '#B6C896', classicLight: '#5A712B', classicDark: '#B1CC7E' },
      },
      indigo: {
        base: { light: '#5B6B8A', dark: '#92A2C2', classicLight: '#536A99', classicDark: '#8AA2D2' },
        deep: { light: '#44516D', dark: '#AAB8D4', classicLight: '#3D507A', classicDark: '#A3B8E2' },
      },
      gold: {
        base: { light: '#B89968', dark: '#D6BA86', classicLight: '#C49544', classicDark: '#E2B764' },
        deep: { light: '#9A7D4E', dark: '#E2CA9E', classicLight: '#A57928', classicDark: '#ECC883' },
        // Gold is the one pigment whose deep cut can't carry TEXT duty on light
        // grounds (3.3:1 on Dawn paper, 3.9:1 on white). This darker text cut
        // clears 4.5:1 there; dark grounds reuse the deep cut (11:1+).
        text: { light: '#826637', dark: '#E2CA9E', classicLight: '#996D18', classicDark: '#ECC883' },
      },
    },
    chart: {
      // Chart-only cuts. The UI pigments can't do series duty: their OKLCH chroma
      // sits below the 0.10 "reads gray" floor for data marks, and terracotta↔moss
      // adjacency fails deuteranopia separation (ΔE 3.2 on Dawn; target ≥8).
      // These re-step the same brand hues (terracotta 35°, indigo 262°, gold 84°,
      // moss 128° + a chart-only plum 335° replacing ink-soft) per ground, validated
      // against all six palette checks per theme. Assign series colors in this fixed
      // order — never cycle or reorder survivors when a filter drops a series.
      series: {
        1: { light: '#BC6751', dark: '#C66F59', classicLight: '#C44829', classicDark: '#D25436' },
        2: { light: '#345799', dark: '#4265A9', classicLight: '#194AAC', classicDark: '#2A5DBF' },
        3: { light: '#A27B1C', dark: '#B58D34', classicLight: '#B18401', classicDark: '#BA8B01' },
        4: { light: '#79376C', dark: '#924E84', classicLight: '#852076', classicDark: '#993588' },
        5: { light: '#688838', dark: '#6C8D3D', classicLight: '#659102', classicDark: '#6D9C03' },
      },
      // Sequential (magnitude): one hue — moss — light→dark on light grounds,
      // dark→light on dark grounds; 1 = low emphasis (near ground), 5 = high.
      seq: {
        1: { light: '#C7D8B5', dark: '#303D20', classicLight: '#CCE0B6', classicDark: '#2A3815' },
        2: { light: '#A1B787', dark: '#475A2E', classicLight: '#A0BC7E', classicDark: '#41591D' },
        3: { light: '#7C975A', dark: '#5F793D', classicLight: '#779A45', classicDark: '#5A7B25' },
        4: { light: '#567428', dark: '#79994D', classicLight: '#527602', classicDark: '#749F2B' },
        5: { light: '#375101', dark: '#97B86B', classicLight: '#375101', classicDark: '#95C352' },
      },
      // Diverging (polarity): terracotta pole ↔ indigo pole (warm/cool — never
      // red/green) around a near-neutral warm-gray midpoint; 1 = strong negative,
      // 3 = midpoint, 5 = strong positive.
      div: {
        1: { light: '#903F2B', dark: '#DC836D', classicLight: '#A22801', classicDark: '#FA7959' },
        2: { light: '#BB8273', dark: '#986153', classicLight: '#C77B68', classicDark: '#A75D4B' },
        3: { light: '#CFC9C5', dark: '#403C39', classicLight: '#D4D0CD', classicDark: '#3A3735' },
        4: { light: '#7993C1', dark: '#59729E', classicLight: '#7092D0', classicDark: '#5474AF' },
        5: { light: '#36589B', dark: '#779EE6', classicLight: '#2253B5', classicDark: '#71A3FF' },
      },
    },
    line: {
      faint: { light: 'rgba(42, 38, 34, 0.08)', dark: 'rgba(241, 231, 211, 0.07)', classicLight: 'rgba(0, 0, 0, 0.07)', classicDark: 'rgba(255, 255, 255, 0.08)' },
      soft: { light: 'rgba(42, 38, 34, 0.12)', dark: 'rgba(241, 231, 211, 0.11)', classicLight: 'rgba(0, 0, 0, 0.11)', classicDark: 'rgba(255, 255, 255, 0.12)' },
      base: { light: 'rgba(42, 38, 34, 0.15)', dark: 'rgba(241, 231, 211, 0.15)', classicLight: 'rgba(0, 0, 0, 0.14)', classicDark: 'rgba(255, 255, 255, 0.16)' },
      strong: { light: 'rgba(42, 38, 34, 0.20)', dark: 'rgba(241, 231, 211, 0.22)', classicLight: 'rgba(0, 0, 0, 0.20)', classicDark: 'rgba(255, 255, 255, 0.24)' },
      // Solid boundary for interactive controls (switch/slider tracks, field & checkbox/radio
      // borders). Alpha lines never reach WCAG 1.4.11 non-text 3:1 on paper; these solids do:
      // 3.38:1 (light) / 3.34:1 (dark) / 3.69:1 (classic light) / 4.56:1 (classic dark)
      // against the page. Used by the shadcn `input` token.
      control: { light: '#8A7F6E', dark: '#746B5D', classicLight: '#858585', classicDark: '#757575' },
    },
  },
  radius: {
    xs: '0.125rem', sm: '0.25rem', md: '0.375rem', lg: '0.5rem',
    xl: '1rem', '2xl': '1.5rem', '3xl': '2rem', '4xl': '2.5rem',
  },
  radiusBase: '0.5rem',
  spacing: {
    // half-steps + control sizes cover component dims (h-7=28, h-9=36, px-2.5=10, gap-1.5=6, py-0.5=2)
    '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem', '2.5': '0.625rem',
    3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 7: '1.75rem', 8: '2rem',
    9: '2.25rem', 10: '2.5rem', 12: '3rem', 16: '4rem', 20: '5rem', 24: '6rem',
  },
  borderWidth: { 0: '0px', 1: '1px', 2: '2px', 3: '3px', 4: '4px' },
  text: {
    '2xs': '0.7rem', xs: '0.75rem', sm: '0.85rem', base: '0.95rem', lg: '1.15rem',
    xl: '1.5rem', '2xl': '2rem', '3xl': '3rem', '4xl': '4rem', '5xl': '5.5rem',
  },
  shadow: {
    // Classic pairs reuse the light/dark recipes with neutral black casts —
    // no warm ink tint on the pure white/black grounds.
    xs: {
      light: '0 1px 2px -1px rgba(42, 38, 34, 0.12), 0 0 0 1px rgba(42, 38, 34, 0.05)',
      dark: '0 1px 2px -1px rgba(8, 5, 3, 0.40), 0 0 0 1px rgba(8, 5, 3, 0.18)',
      classicLight: '0 1px 2px -1px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      classicDark: '0 1px 2px -1px rgba(0, 0, 0, 0.50), 0 0 0 1px rgba(255, 255, 255, 0.06)',
    },
    sm: {
      light: '0 2px 4px -1px rgba(42, 38, 34, 0.14), 0 1px 2px -1px rgba(42, 38, 34, 0.08)',
      dark: '0 2px 4px -1px rgba(8, 5, 3, 0.48), 0 1px 2px -1px rgba(8, 5, 3, 0.30)',
      classicLight: '0 2px 4px -1px rgba(0, 0, 0, 0.14), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
      classicDark: '0 2px 4px -1px rgba(0, 0, 0, 0.55), 0 1px 2px -1px rgba(0, 0, 0, 0.35)',
    },
    base: {
      light: '0 4px 8px -2px rgba(42, 38, 34, 0.16), 0 2px 4px -2px rgba(42, 38, 34, 0.10)',
      dark: '0 4px 8px -2px rgba(8, 5, 3, 0.54), 0 2px 4px -2px rgba(8, 5, 3, 0.36)',
      classicLight: '0 4px 8px -2px rgba(0, 0, 0, 0.16), 0 2px 4px -2px rgba(0, 0, 0, 0.10)',
      classicDark: '0 4px 8px -2px rgba(0, 0, 0, 0.60), 0 2px 4px -2px rgba(0, 0, 0, 0.40)',
    },
    lg: {
      light: '0 12px 20px -4px rgba(42, 38, 34, 0.18), 0 4px 8px -4px rgba(42, 38, 34, 0.10)',
      dark: '0 12px 20px -4px rgba(8, 5, 3, 0.62), 0 4px 8px -4px rgba(8, 5, 3, 0.40)',
      classicLight: '0 12px 20px -4px rgba(0, 0, 0, 0.18), 0 4px 8px -4px rgba(0, 0, 0, 0.10)',
      classicDark: '0 12px 20px -4px rgba(0, 0, 0, 0.68), 0 4px 8px -4px rgba(0, 0, 0, 0.44)',
    },
    pop: {
      light: '0 20px 32px -6px rgba(42, 38, 34, 0.22), 0 8px 12px -6px rgba(42, 38, 34, 0.12)',
      dark: '0 20px 32px -6px rgba(8, 5, 3, 0.72), 0 8px 12px -6px rgba(8, 5, 3, 0.48)',
      classicLight: '0 20px 32px -6px rgba(0, 0, 0, 0.22), 0 8px 12px -6px rgba(0, 0, 0, 0.12)',
      classicDark: '0 20px 32px -6px rgba(0, 0, 0, 0.78), 0 8px 12px -6px rgba(0, 0, 0, 0.52)',
    },
  },
  motion: {
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeSoft: 'cubic-bezier(0.22, 1, 0.36, 1)',
    durFast: '0.2s', dur: '0.3s', durSlow: '0.5s',
    lift: 'translateY(-4px)', liftSm: 'translateY(-2px)',
  },
  fraunces: {
    display: '"opsz" 144, "SOFT" 50, "WONK" 0',
    accent: '"opsz" 144, "SOFT" 100, "WONK" 1',
    text: '"opsz" 24, "SOFT" 50',
    caption: '"opsz" 14, "SOFT" 100',
  },
  // User-selectable accent: which pigment carries the voice (eyebrows, accent
  // italics, links, focus rings). Switched via data-accent="…" on <html>;
  // moss is the default. `base` decorates (accent words, swatches);
  // `text` is the AA-safe cut for text/ring duty — the deep cut everywhere
  // except gold, whose deep cut fails 4.5:1 on light grounds (see gold.text).
  accents: {
    terracotta: { base: 'var(--terracotta)', text: 'var(--terracotta-deep)' },
    moss: { base: 'var(--moss)', text: 'var(--moss-deep)' },
    indigo: { base: 'var(--indigo)', text: 'var(--indigo-deep)' },
    // Gold's base cut is 2.3:1 on light grounds — under even the 3:1 large-text
    // bar — so gold's decorative cut is the deep one (3.3:1+ everywhere).
    gold: { base: 'var(--gold-deep)', text: 'var(--gold-text)' },
  },
  // Aliases → primitives (var references, keyed by CSS var name without `--`).
  semantic: {
    'surface-page': 'var(--paper)',
    'surface-card': 'var(--paper-warm)',
    'surface-well': 'var(--paper-deep)',
    'text-strong': 'var(--ink)',
    'text-body': 'var(--ink-soft)',
    'text-muted-color': 'var(--ink-muted)',
    'text-on-ink': 'var(--paper)',
    'text-accent-color': 'var(--accent-pigment-text)', // follows the chosen accent (default moss-deep)
    'link': 'var(--accent-pigment-text)', // links follow the accent (was fixed indigo pre-accent)
    'border-card': 'var(--line-soft)',
    'border-field': 'var(--line-control)',
    'border-divider': 'var(--line-faint)',
    'success': 'var(--moss-deep)',
    'warning': 'var(--gold-deep)',
    'danger': 'var(--terracotta-deep)',
    'info': 'var(--indigo)',
  },
  shadcn: {
    'background': 'var(--paper)', 'foreground': 'var(--ink)',
    'card': 'var(--paper-warm)', 'card-foreground': 'var(--ink)',
    'popover': 'var(--paper-warm)', 'popover-foreground': 'var(--ink)',
    'primary': 'var(--ink)', 'primary-foreground': 'var(--paper)',
    'secondary': 'var(--paper-deep)', 'secondary-foreground': 'var(--ink)',
    'muted': 'var(--paper-deep)', 'muted-foreground': 'var(--ink-muted)',
    'accent': 'var(--paper-deep)', 'accent-foreground': 'var(--ink)',
    'destructive': 'var(--terracotta-deep)',
    'border': 'var(--line-soft)', 'input': 'var(--line-control)', 'ring': 'var(--accent-pigment-text)',
    'chart-1': 'var(--chart-series-1)', 'chart-2': 'var(--chart-series-2)', 'chart-3': 'var(--chart-series-3)',
    'chart-4': 'var(--chart-series-4)', 'chart-5': 'var(--chart-series-5)',
    'sidebar': 'var(--paper-warm)', 'sidebar-foreground': 'var(--ink)',
    'sidebar-primary': 'var(--ink)', 'sidebar-primary-foreground': 'var(--paper)',
    'sidebar-accent': 'var(--paper-deep)', 'sidebar-accent-foreground': 'var(--ink)',
    'sidebar-border': 'var(--line-faint)', 'sidebar-ring': 'var(--accent-pigment-text)',
  },
}
