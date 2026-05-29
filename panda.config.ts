import {defineConfig} from '@pandacss/dev';
import {generateColorScale} from './src/theme/generate-color-scale';

const primary = generateColorScale('#547A95');
const neutral = generateColorScale('#6A7B8C');

export default defineConfig({
  preflight: false,
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
              value: {base: '{colors.blue.100}', _dark: '{colors.blue.900}'},
            },
            cyan: {
              value: {base: '{colors.cyan.100}', _dark: '{colors.cyan.900}'},
            },
            gray: {
              value: {
                base: '{colors.silver-neutral.100}',
                _dark: '{colors.silver-neutral.800}',
              },
            },
            green: {
              value: {base: '{colors.green.100}', _dark: '{colors.green.900}'},
            },
            orange: {
              value: {
                base: '{colors.orange.100}',
                _dark: '{colors.orange.900}',
              },
            },
            pink: {
              value: {base: '{colors.pink.100}', _dark: '{colors.pink.900}'},
            },
            purple: {
              value: {
                base: '{colors.purple.100}',
                _dark: '{colors.purple.900}',
              },
            },
            red: {
              value: {base: '{colors.red.100}', _dark: '{colors.red.900}'},
            },
            teal: {
              value: {base: '{colors.teal.100}', _dark: '{colors.teal.900}'},
            },
            yellow: {
              value: {
                base: '{colors.yellow.100}',
                _dark: '{colors.yellow.900}',
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
            success: {value: '{colors.green.600}'},
            error: {value: '{colors.red.600}'},
            warning: {value: '{colors.yellow.600}'},
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
