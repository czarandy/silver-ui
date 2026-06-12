import type {ThemeModeTokens, ThemeTokens} from 'components/Theme';

/**
 * A named theme preset containing token overrides for the Silver UI
 * `<Theme>` component.
 */
export interface ThemePreset {
  /**
   * Human-readable label for the preset.
   */
  label: string;
  /**
   * Per-mode token overrides (light and/or dark).
   */
  themes?: ThemeModeTokens;
  /**
   * Mode-agnostic token overrides applied in every mode.
   */
  tokens?: ThemeTokens;
}

/**
 * Material Design 3 inspired theme with purple primary, Roboto typeface,
 * and generous rounding.
 */
export const materialTheme: ThemePreset = {
  label: 'Material',
  themes: {
    dark: {
      colors: {
        bg: '#1c1b1f',
        bgHover: '#36343b',
        bgSelected: '#4f378b',
        bgSubtle: '#2b2930',
        border: '#49454f',
        borderEmphasized: '#79747e',
        destructive: '#f2b8b5',
        destructiveActive: '#f9dedc',
        destructiveFg: '#601410',
        destructiveHover: '#f5ccc9',
        fg: '#e6e1e5',
        fgDisabled: '#49454f',
        fgMuted: '#cac4d0',
        fgOnPrimary: '#381e72',
        primary: '#d0bcff',
        primaryActive: '#eaddff',
        primaryHover: '#dccbff',
        primarySubtle: '#4f378b',
        statusInfoSolid: '#d0bcff',
        statusInfoSolidFg: '#381e72',
        surfaceGray: '#36343b',
        surfaceGrayFg: '#cac4d0',
        surfaceGrayHover: '#49454f',
      },
      fonts: {
        body: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      radii: {
        componentLg: '1rem',
        componentMd: '0.75rem',
        componentSm: '0.5rem',
      },
    },
    light: {
      colors: {
        bg: '#fffbfe',
        bgHover: '#e8def8',
        bgSelected: '#eaddff',
        bgSubtle: '#f4eff4',
        border: '#e7e0ec',
        borderEmphasized: '#79747e',
        destructive: '#b3261e',
        destructiveActive: '#8c1d18',
        destructiveFg: '#ffffff',
        destructiveHover: '#a1211a',
        fg: '#1c1b1f',
        fgDisabled: '#cac4d0',
        fgMuted: '#49454f',
        fgOnPrimary: '#ffffff',
        primary: '#6750a4',
        primaryActive: '#4f378b',
        primaryHover: '#5c4699',
        primarySubtle: '#eaddff',
        statusInfoSolid: '#6750a4',
        statusInfoSolidFg: '#ffffff',
        surfaceGray: '#f4eff4',
        surfaceGrayFg: '#49454f',
        surfaceGrayHover: '#e7e0ec',
      },
      fonts: {
        body: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      radii: {
        componentLg: '1rem',
        componentMd: '0.75rem',
        componentSm: '0.5rem',
      },
    },
  },
};

/**
 * Minimal neutral gray theme with Figtree typeface and subtle rounding.
 */
export const neutralTheme: ThemePreset = {
  label: 'Neutral',
  themes: {
    dark: {
      colors: {
        bg: '#1b1b1b',
        bgHover: '#525252',
        bgSelected: '#262626',
        bgSubtle: '#262626',
        border: '#ffffff1a',
        borderEmphasized: '#525252',
        fg: '#fafafa',
        fgDisabled: '#525252',
        fgMuted: '#a3a3a3',
        fgOnPrimary: '#171717',
        primary: '#ebebeb',
        primaryActive: '#d4d4d4',
        primaryHover: '#f5f5f5',
        primarySubtle: '#262626',
        statusInfoSolid: '#ebebeb',
        statusInfoSolidFg: '#171717',
        surfaceGray: '#ffffff1a',
        surfaceGrayFg: '#e5e5e5',
        surfaceGrayHover: '#262626',
      },
      fonts: {
        body: 'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      radii: {
        componentLg: '0.75rem',
        componentMd: '0.625rem',
        componentSm: '0.375rem',
      },
    },
    light: {
      colors: {
        bg: '#ffffff',
        bgHover: '#f5f5f5',
        bgSelected: '#f1f1f1',
        bgSubtle: '#f1f1f1',
        border: '#ebebeb',
        borderEmphasized: '#d4d4d4',
        fg: '#171717',
        fgDisabled: '#a3a3a3',
        fgMuted: '#737373',
        fgOnPrimary: '#ffffff',
        primary: '#262626',
        primaryActive: '#0a0a0a',
        primaryHover: '#171717',
        primarySubtle: '#f1f1f1',
        statusInfoSolid: '#262626',
        statusInfoSolidFg: '#ffffff',
      },
      fonts: {
        body: 'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      radii: {
        componentLg: '0.75rem',
        componentMd: '0.625rem',
        componentSm: '0.375rem',
      },
    },
  },
};

/**
 * Nord — arctic-inspired cool blue-gray palette with frost-blue primary.
 */
export const nordTheme: ThemePreset = {
  label: 'Nord',
  themes: {
    dark: {
      colors: {
        bg: '#2e3440',
        bgHover: '#434c5e',
        bgSelected: '#3b4252',
        bgSubtle: '#3b4252',
        border: '#3b4252',
        borderEmphasized: '#4c566a',
        destructive: '#bf616a',
        destructiveActive: '#d98e93',
        destructiveFg: '#eceff4',
        destructiveHover: '#c9727a',
        fg: '#eceff4',
        fgDisabled: '#4c566a',
        fgMuted: '#d8dee9',
        fgOnPrimary: '#2e3440',
        primary: '#88c0d0',
        primaryActive: '#b4dae5',
        primaryHover: '#9bceda',
        primarySubtle: '#3b4252',
        statusInfoSolid: '#88c0d0',
        statusInfoSolidFg: '#2e3440',
        surfaceGray: '#3b4252',
        surfaceGrayFg: '#d8dee9',
        surfaceGrayHover: '#434c5e',
      },
      fonts: {
        body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      radii: {
        componentLg: '0.5rem',
        componentMd: '0.375rem',
        componentSm: '0.25rem',
      },
    },
    light: {
      colors: {
        bg: '#eceff4',
        bgHover: '#c9d1dc',
        bgSelected: '#d8dee9',
        bgSubtle: '#d8dee9',
        border: '#c9d1dc',
        borderEmphasized: '#a5b1c0',
        destructive: '#bf616a',
        destructiveActive: '#a54e56',
        destructiveFg: '#eceff4',
        destructiveHover: '#b2575f',
        fg: '#2e3440',
        fgDisabled: '#b4bfcc',
        fgMuted: '#4c566a',
        fgOnPrimary: '#eceff4',
        primary: '#5e81ac',
        primaryActive: '#4a6d98',
        primaryHover: '#5477a2',
        primarySubtle: '#dde4ee',
        statusInfoSolid: '#5e81ac',
        statusInfoSolidFg: '#eceff4',
        surfaceGray: '#d8dee9',
        surfaceGrayFg: '#4c566a',
        surfaceGrayHover: '#c9d1dc',
      },
      fonts: {
        body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      radii: {
        componentLg: '0.5rem',
        componentMd: '0.375rem',
        componentSm: '0.25rem',
      },
    },
  },
};

/**
 * Solarized color scheme — the classic warm-toned palette by Ethan Schoonover,
 * with blue primary and subtle earthy backgrounds.
 */
export const solarizedTheme: ThemePreset = {
  label: 'Solarized',
  themes: {
    dark: {
      colors: {
        bg: '#002b36',
        bgHover: '#164450',
        bgSelected: '#073642',
        bgSubtle: '#073642',
        border: '#164450',
        borderEmphasized: '#586e75',
        destructive: '#dc322f',
        destructiveActive: '#ff6f6b',
        destructiveFg: '#fdf6e3',
        destructiveHover: '#e24b48',
        fg: '#839496',
        fgDisabled: '#586e75',
        fgMuted: '#93a1a1',
        fgOnPrimary: '#002b36',
        primary: '#268bd2',
        primaryActive: '#5aa6da',
        primaryHover: '#3a98d8',
        primarySubtle: '#073642',
        statusInfoSolid: '#268bd2',
        statusInfoSolidFg: '#002b36',
        surfaceGray: '#073642',
        surfaceGrayFg: '#93a1a1',
        surfaceGrayHover: '#0b4652',
      },
      fonts: {
        body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      radii: {
        componentLg: '0.5rem',
        componentMd: '0.375rem',
        componentSm: '0.25rem',
      },
    },
    light: {
      colors: {
        bg: '#fdf6e3',
        bgHover: '#e3dcc3',
        bgSelected: '#d7e9ef',
        bgSubtle: '#eee8d5',
        border: '#d6cfb7',
        borderEmphasized: '#93a1a1',
        destructive: '#dc322f',
        destructiveActive: '#a92826',
        destructiveFg: '#fdf6e3',
        destructiveHover: '#c72d2a',
        fg: '#586e75',
        fgDisabled: '#93a1a1',
        fgMuted: '#657b83',
        fgOnPrimary: '#fdf6e3',
        primary: '#268bd2',
        primaryActive: '#1d6fa7',
        primaryHover: '#217ebf',
        primarySubtle: '#d7e9ef',
        statusInfoSolid: '#268bd2',
        statusInfoSolidFg: '#fdf6e3',
        surfaceGray: '#e7dec3',
        surfaceGrayHover: '#ddd4b9',
      },
      fonts: {
        body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      radii: {
        componentLg: '0.5rem',
        componentMd: '0.375rem',
        componentSm: '0.25rem',
      },
    },
  },
};

/**
 * All bundled theme presets keyed by identifier.
 */
export const themePresets = {
  material: materialTheme,
  neutral: neutralTheme,
  nord: nordTheme,
  solarized: solarizedTheme,
} as const;

export type ThemePresetName = keyof typeof themePresets;
