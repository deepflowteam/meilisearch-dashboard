export const THEME_COLOR_NAMES = [
  'default',
  'blue',
  'green',
  'red',
  'rose',
  'violet',
  'orange',
  'yellow',
  'teal',
] as const

export type ThemeColorName = (typeof THEME_COLOR_NAMES)[number]

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

type Shade = (typeof SHADES)[number]
type Palette = Record<Shade, string>

// Standard Tailwind CSS palettes, applied over `--ui-color-primary-*` at
// runtime so the primary color can be swapped without a rebuild.
const PALETTES: Record<Exclude<ThemeColorName, 'default'>, Palette> = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
}

// The dot shown next to each option in the theme picker.
export const THEME_COLOR_SWATCH: Record<ThemeColorName, string> = {
  default: '#ea186c', // meili-600, the app's brand color
  blue: PALETTES.blue[600],
  green: PALETTES.green[600],
  red: PALETTES.red[600],
  rose: PALETTES.rose[600],
  violet: PALETTES.violet[600],
  orange: PALETTES.orange[600],
  yellow: PALETTES.yellow[600],
  teal: PALETTES.teal[600],
}

/** Overrides `--ui-color-primary-*` on the root element, or clears the
 * override to fall back to the app's default (meili) brand palette. */
export function applyThemeColor(name: ThemeColorName) {
  const root = document.documentElement
  if (name === 'default') {
    for (const shade of SHADES) {
      root.style.removeProperty(`--ui-color-primary-${shade}`)
    }
    return
  }
  const palette = PALETTES[name]
  if (!palette) {
    return
  }
  for (const shade of SHADES) {
    root.style.setProperty(`--ui-color-primary-${shade}`, palette[shade])
  }
}
