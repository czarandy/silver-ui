import {defineConfig} from '@pandacss/dev';

export default defineConfig({
  preflight: false,
  prefix: 'silver',
  include: ['./src/**/*.{ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  outExtension: 'js',
  jsxFramework: 'react',
  cssVarRoot: ':where(:root, :host)',
  conditions: {
    extend: {
      dark: '@media (prefers-color-scheme: dark)',
    },
  },
  theme: {
    extend: {
      tokens: {
        colors: {
          'silver-primary': {
            50: {value: '#eff6ff'},
            100: {value: '#dbeafe'},
            200: {value: '#bfdbfe'},
            300: {value: '#93c5fd'},
            400: {value: '#60a5fa'},
            500: {value: '#3b82f6'},
            600: {value: '#2563eb'},
            700: {value: '#1d4ed8'},
            800: {value: '#1e40af'},
            900: {value: '#1e3a8a'},
          },
          'silver-neutral': {
            50: {value: '#fafafa'},
            100: {value: '#f5f5f5'},
            200: {value: '#e5e5e5'},
            300: {value: '#d4d4d4'},
            400: {value: '#a3a3a3'},
            500: {value: '#737373'},
            600: {value: '#525252'},
            700: {value: '#404040'},
            800: {value: '#262626'},
            900: {value: '#171717'},
          },
        },
        fonts: {
          body: {value: 'system-ui, -apple-system, sans-serif'},
          mono: {value: 'ui-monospace, monospace'},
        },
        radii: {
          sm: {value: '0.25rem'},
          md: {value: '0.375rem'},
          lg: {value: '0.5rem'},
          full: {value: '9999px'},
        },
      },
      semanticTokens: {
        colors: {
          primary: {
            DEFAULT: {value: '{colors.silver-primary.500}'},
            hover: {value: '{colors.silver-primary.600}'},
            active: {value: '{colors.silver-primary.700}'},
            subtle: {value: '{colors.silver-primary.100}'},
          },
          fg: {
            DEFAULT: {
              value: {
                base: '{colors.silver-neutral.900}',
                _dark: '{colors.silver-neutral.50}',
              },
            },
            muted: {
              value: {
                base: '{colors.silver-neutral.600}',
                _dark: '{colors.silver-neutral.400}',
              },
            },
          },
          bg: {
            DEFAULT: {
              value: {base: '#ffffff', _dark: '{colors.silver-neutral.900}'},
            },
            subtle: {
              value: {
                base: '{colors.silver-neutral.50}',
                _dark: '{colors.silver-neutral.800}',
              },
            },
          },
        },
      },
    },
  },
});
