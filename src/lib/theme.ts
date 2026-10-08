export const colors = {
  background: '#142C3F',
  surface: 'rgba(255,255,255,0.05)',
  surfaceSolid: '#203749',
  tabBar: '#0e2030',
  border: 'rgba(255,255,255,0.08)',
  bodyText: '#c3ccd3',
  text: '#ffffff',
  muted: '#72808b',
  yellow: '#f9d75f',
  red: '#f95f81',
  green: '#91c5a9',
  purple: '#775ba3',
  orange: '#f98a5f',
  up: '#63B35F',
  down: '#d14b4b',
} as const;

export type Accent = 'purple' | 'red' | 'green' | 'orange' | 'yellow';

export const accentColors: Record<Accent, string> = {
  purple: colors.purple,
  red: colors.red,
  green: colors.green,
  orange: colors.orange,
  yellow: colors.yellow,
};

export const fonts = {
  heading: 'FjallaOne_400Regular',
  body: 'NotoSans_400Regular',
  bodyBold: 'NotoSans_700Bold',
} as const;

export const rgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};
