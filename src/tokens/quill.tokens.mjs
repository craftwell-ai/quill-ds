/**
 * @typedef {{ light: string, dark: string }} ModeValue
 * Single source of truth for Quill tokens. Edit here, then run `npm run build:tokens`.
 */
export const tokens = {
  font: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    display: '"Fraunces", Georgia, serif',
    heading: '"Fraunces", Georgia, serif',
    mono: 'ui-monospace, "SF Mono", Menlo, monospace',
  },
  color: {
    paper: {
      base: { light: '#F5EDDD', dark: '#20180E' },
      warm: { light: '#EFE4CE', dark: '#2A2014' },
      deep: { light: '#E8DCC0', dark: '#352A1A' },
    },
    ink: {
      base: { light: '#2A2622', dark: '#F1E7D3' },
      soft: { light: '#5C524A', dark: '#C8B9A0' },
      muted: { light: '#675F58', dark: '#A89880' },
    },
    pigment: {
      terracotta: { base: { light: '#C4684B', dark: '#DB8568' }, deep: { light: '#944A33', dark: '#E89A80' } },
      moss: { base: { light: '#7A8C5C', dark: '#A2B57E' }, deep: { light: '#5E6E43', dark: '#B6C896' } },
      indigo: { base: { light: '#5B6B8A', dark: '#92A2C2' }, deep: { light: '#44516D', dark: '#AAB8D4' } },
      gold: { base: { light: '#B89968', dark: '#D6BA86' }, deep: { light: '#9A7D4E', dark: '#E2CA9E' } },
    },
    line: {
      faint: { light: 'rgba(42, 38, 34, 0.08)', dark: 'rgba(241, 231, 211, 0.07)' },
      soft: { light: 'rgba(42, 38, 34, 0.12)', dark: 'rgba(241, 231, 211, 0.11)' },
      base: { light: 'rgba(42, 38, 34, 0.15)', dark: 'rgba(241, 231, 211, 0.15)' },
      strong: { light: 'rgba(42, 38, 34, 0.20)', dark: 'rgba(241, 231, 211, 0.22)' },
    },
  },
  radius: {
    xs: '0.125rem', sm: '0.25rem', md: '0.375rem', lg: '0.5rem',
    xl: '1rem', '2xl': '1.5rem', '3xl': '2rem', '4xl': '2.5rem',
  },
  radiusBase: '0.5rem',
  spacing: {
    1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem',
    8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem', 20: '5rem', 24: '6rem',
  },
  borderWidth: { 0: '0px', 1: '1px', 2: '2px', 3: '3px', 4: '4px' },
  text: {
    '2xs': '0.7rem', xs: '0.75rem', sm: '0.85rem', base: '0.95rem', lg: '1.15rem',
    xl: '1.5rem', '2xl': '2rem', '3xl': '3rem', '4xl': '4rem', '5xl': '5.5rem',
  },
  shadow: {
    xs: {
      light: '0 1px 2px -1px rgba(42, 38, 34, 0.12), 0 0 0 1px rgba(42, 38, 34, 0.05)',
      dark: '0 1px 2px -1px rgba(8, 5, 3, 0.40), 0 0 0 1px rgba(8, 5, 3, 0.18)',
    },
    sm: {
      light: '0 2px 4px -1px rgba(42, 38, 34, 0.14), 0 1px 2px -1px rgba(42, 38, 34, 0.08)',
      dark: '0 2px 4px -1px rgba(8, 5, 3, 0.48), 0 1px 2px -1px rgba(8, 5, 3, 0.30)',
    },
    base: {
      light: '0 4px 8px -2px rgba(42, 38, 34, 0.16), 0 2px 4px -2px rgba(42, 38, 34, 0.10)',
      dark: '0 4px 8px -2px rgba(8, 5, 3, 0.54), 0 2px 4px -2px rgba(8, 5, 3, 0.36)',
    },
    lg: {
      light: '0 12px 20px -4px rgba(42, 38, 34, 0.18), 0 4px 8px -4px rgba(42, 38, 34, 0.10)',
      dark: '0 12px 20px -4px rgba(8, 5, 3, 0.62), 0 4px 8px -4px rgba(8, 5, 3, 0.40)',
    },
    pop: {
      light: '0 20px 32px -6px rgba(42, 38, 34, 0.22), 0 8px 12px -6px rgba(42, 38, 34, 0.12)',
      dark: '0 20px 32px -6px rgba(8, 5, 3, 0.72), 0 8px 12px -6px rgba(8, 5, 3, 0.48)',
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
  // Aliases → primitives (var references, keyed by CSS var name without `--`).
  semantic: {
    'surface-page': 'var(--paper)',
    'surface-card': 'var(--paper-warm)',
    'surface-well': 'var(--paper-deep)',
    'text-strong': 'var(--ink)',
    'text-body': 'var(--ink-soft)',
    'text-muted-color': 'var(--ink-muted)',
    'text-on-ink': 'var(--paper)',
    'text-accent-color': 'var(--terracotta-deep)', // fixed: was var(--terracotta) — see spec
    'link': 'var(--indigo)',
    'border-card': 'var(--line-soft)',
    'border-field': 'var(--line)',
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
    'border': 'var(--line-soft)', 'input': 'var(--line)', 'ring': 'var(--ink)',
    'chart-1': 'var(--terracotta)', 'chart-2': 'var(--moss)', 'chart-3': 'var(--indigo)',
    'chart-4': 'var(--gold)', 'chart-5': 'var(--ink-soft)',
    'sidebar': 'var(--paper-warm)', 'sidebar-foreground': 'var(--ink)',
    'sidebar-primary': 'var(--ink)', 'sidebar-primary-foreground': 'var(--paper)',
    'sidebar-accent': 'var(--paper-deep)', 'sidebar-accent-foreground': 'var(--ink)',
    'sidebar-border': 'var(--line-faint)', 'sidebar-ring': 'var(--ink)',
  },
  manager: {
    // Storybook chrome needs stronger non-text contrast than the app hairline.
    controlBorder: 'rgba(42,38,34,0.32)',
  },
}
