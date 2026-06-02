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
      },
      semanticTokens: {
        colors: {
          primary: {
            DEFAULT: {value: '{colors.silver-primary.500}'},
            hover: {value: '{colors.silver-primary.600}'},
            active: {value: '{colors.silver-primary.700}'},
            subtle: {value: '{colors.silver-primary.100}'},
          },
          success: {
            fg: {value: '#108627'},
          },
          error: {
            fg: {value: '#d92644'},
          },
          warning: {
            fg: {value: '#e8b00a'},
          },
          info: {
            fg: {value: '#0164e0'},
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
            hover: {
              value: {
                base: '{colors.silver-neutral.100}',
                _dark: '{colors.silver-neutral.700}',
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
            },
            gray: {
              DEFAULT: {
                value: {
                  base: '{colors.silver-neutral.100}',
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
                  base: '{colors.silver-neutral.200}',
                  _dark: '{colors.silver-neutral.700}',
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
            success: {value: '{colors.success.fg}'},
            error: {value: '{colors.error.fg}'},
            warning: {value: '{colors.warning.fg}'},
            info: {value: '{colors.info.fg}'},
            blue: {value: '{colors.blue.600}'},
            red: {value: '{colors.red.600}'},
            green: {value: '{colors.green.600}'},
            gray: {value: '{colors.silver-neutral.600}'},
            cyan: {value: '{colors.cyan.600}'},
            teal: {value: '{colors.teal.600}'},
            yellow: {value: '{colors.yellow.600}'},
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
      },
    },
  },
});
