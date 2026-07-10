export const COLOR_NAMES = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
  'pink',
  'gray',
] as const;

export type ColorName = (typeof COLOR_NAMES)[number];

export const COLOR_LABELS: Record<ColorName, string> = {
  red: 'Red',
  orange: 'Orange',
  yellow: 'Yellow',
  green: 'Green',
  teal: 'Teal',
  cyan: 'Cyan',
  blue: 'Blue',
  purple: 'Purple',
  pink: 'Pink',
  gray: 'Gray',
};
