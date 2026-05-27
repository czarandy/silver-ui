type ColorScale = Record<string, {value: string}>;

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r: number, g: number, b: number;
  if (h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  const toHex = (v: number): string =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const shadeLightness: Record<string, number> = {
  50: 96,
  100: 92,
  200: 84,
  300: 72,
  400: 58,
  500: 0, // placeholder, uses the actual base lightness
  600: 0,
  700: 0,
  800: 0,
  900: 0,
};

export function generateColorScale(baseHex: string): ColorScale {
  const [h, s, baseL] = hexToHsl(baseHex);

  const scale: ColorScale = {};

  for (const shade of [50, 100, 200, 300, 400]) {
    const targetL = shadeLightness[shade];
    const l = baseL + (targetL - baseL) * ((targetL - baseL) / (100 - baseL));
    scale[shade] = {value: hslToHex(h, s * 0.9, Math.min(l, targetL))};
  }

  scale[500] = {value: baseHex};

  const darkSteps = [
    {shade: 600, factor: 0.82},
    {shade: 700, factor: 0.65},
    {shade: 800, factor: 0.48},
    {shade: 900, factor: 0.32},
  ];

  for (const {shade, factor} of darkSteps) {
    scale[shade] = {value: hslToHex(h, s, baseL * factor)};
  }

  return scale;
}
