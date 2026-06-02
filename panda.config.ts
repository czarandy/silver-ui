import {defineConfig} from '@pandacss/dev';
import {generateColorScale} from './src/theme/generate-color-scale';

const primary = generateColorScale('#547A95');
const neutral = generateColorScale('#6A7B8C');
const green = generateColorScale('#65c37e');
const red = {
  50: {value: '#fceef0'},
  100: {value: '#f9d1d8'},
  200: {value: '#f1bcc5'},
  300: {value: '#e28d9b'},
  400: {value: '#da4e65'},
  500: {value: '#d92644'},
  600: {value: '#e31a3b'},
  700: {value: '#842e3d'},
  800: {value: '#6b2e38'},
  900: {value: '#562b32'},
};
const yellow = {
  50: {value: '#fcf8ee'},
  100: {value: '#f9edcc'},
  200: {value: '#efe1be'},
  300: {value: '#dfc990'},
  400: {value: '#d4b054'},
  500: {value: '#d9a626'},
  600: {value: '#ab872b'},
  700: {value: '#846c2e'},
  800: {value: '#6b5a2e'},
  900: {value: '#51461f'},
};
const blue = {
  50: {value: '#eef5fc'},
  100: {value: '#cce6fe'},
  200: {value: '#bed5ef'},
  300: {value: '#90b6df'},
  400: {value: '#5492d4'},
  500: {value: '#267dd9'},
  600: {value: '#2b69ab'},
  700: {value: '#2e5884'},
  800: {value: '#2e4b6b'},
  900: {value: '#1a3d5d'},
};

export default defineConfig({
  preflight: true,
  prefix: 'silver',
  include: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  outExtension: 'js',
  jsxFramework: 'react',
  cssVarRoot: ':where(:root, :host)',
  conditions: {
    extend: {
      dark: [
        '@media (prefers-color-scheme: dark)',
        '&:is([data-theme=dark] *, [data-theme=dark])',
      ],
    },
  },
  theme: {
    extend: {
      tokens: {
        colors: {
          'silver-primary': primary,
          'silver-neutral': neutral,
          green,
          red,
          yellow,
          blue,
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
        borderWidths: {
          default: {value: '1px'},
          emphasized: {value: '2px'},
          focus: {value: '2px'},
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
          destructive: {
            DEFAULT: {
              value: {base: '{colors.red.600}', _dark: '{colors.red.500}'},
            },
            hover: {
              value: {base: '{colors.red.700}', _dark: '{colors.red.400}'},
            },
            active: {
              value: {base: '{colors.red.800}', _dark: '{colors.red.300}'},
            },
            fg: {value: '{colors.white}'},
          },
          status: {
            success: {
              fg: {value: '#108627'},
              border: {
                value: {
                  base: '{colors.green.600}',
                  _dark: '{colors.green.400}',
                },
              },
              borderHover: {
                value: {
                  base: '{colors.green.700}',
                  _dark: '{colors.green.300}',
                },
              },
              solid: {
                value: {
                  base: '{colors.green.600}',
                  _dark: '{colors.green.500}',
                },
              },
              solidFg: {value: '{colors.white}'},
            },
            error: {
              fg: {value: '#d92644'},
              border: {
                value: {base: '{colors.red.600}', _dark: '{colors.red.400}'},
              },
              borderHover: {
                value: {base: '{colors.red.700}', _dark: '{colors.red.300}'},
              },
              solid: {
                value: {base: '{colors.red.600}', _dark: '{colors.red.500}'},
              },
              solidFg: {value: '{colors.white}'},
            },
            warning: {
              fg: {value: '{colors.yellow.500}'},
              border: {
                value: {
                  base: '{colors.yellow.500}',
                  _dark: '{colors.yellow.400}',
                },
              },
              borderHover: {
                value: {
                  base: '{colors.yellow.600}',
                  _dark: '{colors.yellow.300}',
                },
              },
              solid: {
                value: {
                  base: '{colors.yellow.400}',
                  _dark: '{colors.yellow.300}',
                },
              },
              solidFg: {
                value: {
                  base: '{colors.yellow.950}',
                  _dark: '{colors.yellow.950}',
                },
              },
            },
            info: {
              fg: {value: '#0164e0'},
              solid: {value: '{colors.primary}'},
              solidFg: {value: '{colors.fg.onPrimary}'},
            },
            neutral: {
              solid: {
                value: {
                  base: '{colors.silver-neutral.500}',
                  _dark: '{colors.silver-neutral.400}',
                },
              },
              solidFg: {value: '{colors.white}'},
            },
            disabled: {
              solid: {
                value: {
                  base: '{colors.silver-neutral.400}',
                  _dark: '{colors.silver-neutral.600}',
                },
              },
              solidFg: {value: '{colors.white}'},
            },
          },
          presence: {
            success: {
              value: {base: '{colors.green.500}', _dark: '{colors.green.400}'},
            },
            neutral: {
              value: {
                base: '{colors.silver-neutral.500}',
                _dark: '{colors.silver-neutral.400}',
              },
            },
            error: {
              value: {base: '{colors.red.600}', _dark: '{colors.red.400}'},
            },
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
            disabled: {
              value: {
                base: '{colors.silver-neutral.400}',
                _dark: '{colors.silver-neutral.600}',
              },
            },
            onPrimary: {value: '{colors.white}'},
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
            hover: {
              value: {
                base: '{colors.silver-neutral.100}',
                _dark: '{colors.silver-neutral.700}',
              },
            },
            selected: {value: '{colors.primary.subtle}'},
            ghost: {
              hover: {
                value: {
                  base: 'rgba(0, 0, 0, 0.06)',
                  _dark: 'rgba(255, 255, 255, 0.08)',
                },
              },
              active: {
                value: {
                  base: 'rgba(0, 0, 0, 0.1)',
                  _dark: 'rgba(255, 255, 255, 0.12)',
                },
              },
            },
          },
          border: {
            DEFAULT: {
              value: {
                base: '{colors.silver-neutral.100}',
                _dark: '{colors.silver-neutral.700}',
              },
            },
            emphasized: {
              value: {
                base: '{colors.silver-neutral.200}',
                _dark: '{colors.silver-neutral.600}',
              },
            },
          },
          track: {
            DEFAULT: {
              value: {
                base: '{colors.silver-neutral.200}',
                _dark: '{colors.silver-neutral.700}',
              },
            },
            emphasized: {
              value: {
                base: '{colors.silver-neutral.300}',
                _dark: '{colors.silver-neutral.600}',
              },
            },
            disabled: {
              value: {
                base: '{colors.silver-neutral.300}',
                _dark: '{colors.silver-neutral.700}',
              },
            },
          },
          overlay: {
            scrim: {
              DEFAULT: {value: 'rgba(0, 0, 0, 0.45)'},
              subtle: {value: 'rgba(0, 0, 0, 0.35)'},
              strong: {value: 'rgba(0, 0, 0, 0.76)'},
            },
          },
          skeleton: {
            DEFAULT: {
              value: {
                base: '{colors.silver-neutral.200}',
                _dark: '{colors.silver-neutral.700}',
              },
            },
            shimmer: {
              value: {
                base: '{colors.silver-neutral.100}',
                _dark: '{colors.silver-neutral.600}',
              },
            },
          },
          surface: {
            blue: {
              DEFAULT: {
                value: {base: '{colors.blue.100}', _dark: '{colors.blue.900}'},
              },
              fg: {
                value: {base: '{colors.blue.800}', _dark: '{colors.blue.200}'},
              },
              hover: {
                value: {base: '{colors.blue.200}', _dark: '{colors.blue.800}'},
              },
              accent: {
                value: {base: '{colors.blue.600}', _dark: '{colors.blue.400}'},
              },
            },
            cyan: {
              DEFAULT: {
                value: {base: '{colors.cyan.100}', _dark: '{colors.cyan.900}'},
              },
              fg: {
                value: {base: '{colors.cyan.800}', _dark: '{colors.cyan.200}'},
              },
              hover: {
                value: {base: '{colors.cyan.200}', _dark: '{colors.cyan.800}'},
              },
              accent: {
                value: {base: '{colors.cyan.600}', _dark: '{colors.cyan.400}'},
              },
            },
            gray: {
              DEFAULT: {
                value: {
                  base: '{colors.silver-neutral.50}',
                  _dark: '{colors.silver-neutral.800}',
                },
              },
              fg: {
                value: {
                  base: '{colors.silver-neutral.900}',
                  _dark: '{colors.silver-neutral.100}',
                },
              },
              hover: {
                value: {
                  base: '{colors.silver-neutral.100}',
                  _dark: '{colors.silver-neutral.700}',
                },
              },
              accent: {
                value: {
                  base: '{colors.silver-neutral.600}',
                  _dark: '{colors.silver-neutral.400}',
                },
              },
            },
            green: {
              DEFAULT: {
                value: {
                  base: '{colors.green.100}',
                  _dark: '{colors.green.900}',
                },
              },
              fg: {
                value: {
                  base: '{colors.green.800}',
                  _dark: '{colors.green.200}',
                },
              },
              hover: {
                value: {
                  base: '{colors.green.200}',
                  _dark: '{colors.green.800}',
                },
              },
              accent: {
                value: {
                  base: '{colors.green.600}',
                  _dark: '{colors.green.400}',
                },
              },
            },
            orange: {
              DEFAULT: {
                value: {
                  base: '{colors.orange.100}',
                  _dark: '{colors.orange.900}',
                },
              },
              fg: {
                value: {
                  base: '{colors.orange.800}',
                  _dark: '{colors.orange.200}',
                },
              },
              hover: {
                value: {
                  base: '{colors.orange.200}',
                  _dark: '{colors.orange.800}',
                },
              },
              accent: {
                value: {
                  base: '{colors.orange.600}',
                  _dark: '{colors.orange.400}',
                },
              },
            },
            pink: {
              DEFAULT: {
                value: {base: '{colors.pink.100}', _dark: '{colors.pink.900}'},
              },
              fg: {
                value: {
                  base: '{colors.pink.800}',
                  _dark: '{colors.pink.200}',
                },
              },
              hover: {
                value: {
                  base: '{colors.pink.200}',
                  _dark: '{colors.pink.800}',
                },
              },
              accent: {
                value: {
                  base: '{colors.pink.600}',
                  _dark: '{colors.pink.400}',
                },
              },
            },
            purple: {
              DEFAULT: {
                value: {
                  base: '{colors.purple.100}',
                  _dark: '{colors.purple.900}',
                },
              },
              fg: {
                value: {
                  base: '{colors.purple.800}',
                  _dark: '{colors.purple.200}',
                },
              },
              hover: {
                value: {
                  base: '{colors.purple.200}',
                  _dark: '{colors.purple.800}',
                },
              },
              accent: {
                value: {
                  base: '{colors.purple.600}',
                  _dark: '{colors.purple.400}',
                },
              },
            },
            red: {
              DEFAULT: {
                value: {base: '{colors.red.100}', _dark: '{colors.red.900}'},
              },
              fg: {
                value: {base: '{colors.red.800}', _dark: '{colors.red.200}'},
              },
              hover: {
                value: {base: '{colors.red.200}', _dark: '{colors.red.800}'},
              },
              accent: {
                value: {base: '{colors.red.600}', _dark: '{colors.red.400}'},
              },
            },
            teal: {
              DEFAULT: {
                value: {base: '{colors.teal.100}', _dark: '{colors.teal.900}'},
              },
              fg: {
                value: {
                  base: '{colors.teal.800}',
                  _dark: '{colors.teal.200}',
                },
              },
              hover: {
                value: {
                  base: '{colors.teal.200}',
                  _dark: '{colors.teal.800}',
                },
              },
              accent: {
                value: {base: '{colors.teal.600}', _dark: '{colors.teal.400}'},
              },
            },
            yellow: {
              DEFAULT: {
                value: {
                  base: '{colors.yellow.100}',
                  _dark: '{colors.yellow.900}',
                },
              },
              fg: {
                value: {
                  base: '{colors.yellow.800}',
                  _dark: '{colors.yellow.200}',
                },
              },
              hover: {
                value: {
                  base: '{colors.yellow.200}',
                  _dark: '{colors.yellow.800}',
                },
              },
              accent: {
                value: {
                  base: '{colors.yellow.600}',
                  _dark: '{colors.yellow.400}',
                },
              },
            },
          },
          icon: {
            primary: {value: '{colors.fg}'},
            secondary: {value: '{colors.fg.muted}'},
            tertiary: {
              value: {
                base: '{colors.silver-neutral.500}',
                _dark: '{colors.silver-neutral.500}',
              },
            },
            disabled: {
              value: {
                base: '{colors.silver-neutral.400}',
                _dark: '{colors.silver-neutral.600}',
              },
            },
            accent: {value: '{colors.primary}'},
            success: {value: '{colors.status.success.fg}'},
            error: {value: '{colors.status.error.fg}'},
            warning: {value: '{colors.status.warning.fg}'},
            info: {value: '{colors.status.info.fg}'},
            blue: {value: '{colors.blue.600}'},
            red: {value: '{colors.red.600}'},
            green: {value: '{colors.green.600}'},
            gray: {value: '{colors.silver-neutral.600}'},
            cyan: {value: '{colors.cyan.600}'},
            teal: {value: '{colors.teal.600}'},
            yellow: {value: '{colors.yellow.500}'},
            orange: {value: '{colors.orange.600}'},
            pink: {value: '{colors.pink.600}'},
            purple: {value: '{colors.purple.600}'},
          },
        },
        sizes: {
          component: {
            sm: {value: '{sizes.8}'},
            md: {value: '{sizes.10}'},
            lg: {value: '{sizes.12}'},
          },
          icon: {
            sm: {value: '{sizes.4}'},
            md: {value: '{sizes.5}'},
            lg: {value: '{sizes.6}'},
          },
        },
        spacing: {
          component: {
            sm: {value: '{spacing.3}'},
            md: {value: '{spacing.4}'},
            lg: {value: '{spacing.5}'},
          },
          focusOffset: {value: '2px'},
          focusOffsetTight: {value: '1px'},
          focusOffsetLoose: {value: '3px'},
        },
        fontSizes: {
          component: {
            sm: {value: '14px'},
            md: {value: '14px'},
            lg: {value: '14px'},
          },
          icon: {
            sm: {value: '{sizes.icon.sm}'},
            md: {value: '{sizes.icon.md}'},
            lg: {value: '{sizes.icon.lg}'},
          },
        },
        radii: {
          component: {
            sm: {value: '{radii.sm}'},
            md: {value: '{radii.md}'},
            lg: {value: '{radii.lg}'},
          },
        },
        shadows: {
          focus: {
            value: '0 0 0 {borderWidths.focus} {colors.primary.subtle}',
          },
          'focus.error': {
            value: '0 0 0 {borderWidths.focus} {colors.red.100}',
          },
          'focus.warning': {
            value: '0 0 0 {borderWidths.focus} {colors.yellow.100}',
          },
          'focus.success': {
            value: '0 0 0 {borderWidths.focus} {colors.green.100}',
          },
        },
      },
      keyframes: {
        'skeleton-shimmer': {
          '0%': {backgroundPosition: '200% 0'},
          '100%': {backgroundPosition: '-200% 0'},
        },
      },
    },
  },
});
