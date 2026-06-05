import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import vitest from '@vitest/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import jestDom from 'eslint-plugin-jest-dom-ya';
import jsdoc from 'eslint-plugin-jsdoc';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import perfectionist from 'eslint-plugin-perfectionist';
import reactCompiler from 'eslint-plugin-react-compiler';
import storybook from 'eslint-plugin-storybook';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import silverUiPlugin from './eslint/silver-ui-plugin.js';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/dist/',
      '**/storybook-static/',
      'styled-system/',
      '*.cjs',
      'eslint/',
    ],
  },
  // TypeScript rules — all source files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {jsx: true},
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': ['error', {allow: ['warn', 'error']}],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useLayoutEffect'],
              message:
                'useLayoutEffect warns during SSR. Import useIsomorphicLayoutEffect from lib/useIsomorphicLayoutEffect instead.',
            },
          ],
        },
      ],
      curly: 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {fixStyle: 'inline-type-imports'},
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
  // Allow useLayoutEffect in the isomorphic wrapper itself
  {
    files: ['src/internal/useIsomorphicLayoutEffect.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  // Date/time — use Temporal instead of raw JavaScript Date
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'Date',
          message:
            'Use Temporal from @js-temporal/polyfill instead of raw JavaScript Date.',
        },
      ],
    },
  },
  // JSDoc formatting — enforce multi-line block style
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      jsdoc,
    },
    rules: {
      'jsdoc/multiline-blocks': ['error', {noSingleLineBlocks: true}],
    },
  },
  // Prop and interface sorting — auto-fixable consistent ordering
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-jsx-props': [
        'error',
        {type: 'alphabetical', order: 'asc'},
      ],
      'perfectionist/sort-interfaces': [
        'error',
        {type: 'alphabetical', order: 'asc'},
      ],
    },
  },
  // Import hygiene — clean module structure for a published library
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'import-x': importX,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      'import-x/no-cycle': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-self-import': 'error',
      'import-x/export': 'error',
      'import-x/no-useless-path-segments': 'error',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          alphabetize: {order: 'asc'},
        },
      ],
    },
  },
  // Type-aware rules — catches async/type bugs that syntax-only lint cannot see
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/array-type': [
        'error',
        {default: 'array', readonly: 'generic'},
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-array-delete': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-invalid-void-type': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-misused-spread': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-conversion': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-useless-default-assignment': 'error',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/promise-function-async': ['error', {allowAny: false}],
      '@typescript-eslint/require-array-sort-compare': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/unbound-method': 'error',
    },
  },
  // React rules — component and source files
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      ...eslintReact.configs.recommended.plugins,
      'react-compiler': reactCompiler,
    },
    rules: {
      // React Compiler compatibility
      'react-compiler/react-compiler': 'error',

      // React fundamentals
      '@eslint-react/rules-of-hooks': 'error',
      '@eslint-react/purity': 'error',
      '@eslint-react/immutability': 'error',
      '@eslint-react/refs': 'error',
      '@eslint-react/unsupported-syntax': 'error',
      '@eslint-react/exhaustive-deps': 'error',

      // Component structure bugs
      '@eslint-react/static-components': 'error',
      '@eslint-react/no-class-component': 'error',
      '@eslint-react/no-nested-component-definitions': 'error',
      '@eslint-react/no-nested-lazy-component-declarations': 'error',
      '@eslint-react/no-unstable-default-props': 'error',
      '@eslint-react/no-unstable-context-value': 'error',
      '@eslint-react/set-state-in-effect': 'error',
      '@eslint-react/set-state-in-render': 'error',
      '@eslint-react/no-missing-component-display-name': 'error',
      '@eslint-react/no-clone-element': 'error',

      // Children API — legacy, breaks React Compiler
      '@eslint-react/no-children-map': 'error',
      '@eslint-react/no-children-count': 'error',
      '@eslint-react/no-children-for-each': 'error',
      '@eslint-react/no-children-only': 'error',
      '@eslint-react/no-children-to-array': 'error',

      // Hooks
      '@eslint-react/use-memo': 'error',
      '@eslint-react/use-state': 'error',
      '@eslint-react/no-unnecessary-use-prefix': 'error',
      '@eslint-react/no-create-ref': 'error',
      '@eslint-react/no-forward-ref': 'error',
      '@eslint-react/no-unused-state': 'error',

      // DOM correctness
      '@eslint-react/dom-no-missing-button-type': 'error',
      '@eslint-react/dom-no-missing-iframe-sandbox': 'error',
      '@eslint-react/dom-no-unsafe-iframe-sandbox': 'error',
      '@eslint-react/dom-no-void-elements-with-children': 'error',
      '@eslint-react/dom-no-dangerously-set-innerhtml': 'error',
      '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'error',
      '@eslint-react/dom-no-find-dom-node': 'error',
      '@eslint-react/dom-no-flush-sync': 'error',
      '@eslint-react/dom-no-script-url': 'error',
      '@eslint-react/dom-no-string-style-prop': 'error',
      '@eslint-react/dom-no-unsafe-target-blank': 'error',
      '@eslint-react/dom-no-unknown-property': 'error',

      // JSX correctness
      '@eslint-react/no-leaked-conditional-rendering': 'error',
      '@eslint-react/no-missing-key': 'error',
      '@eslint-react/no-duplicate-key': 'error',
      '@eslint-react/no-array-index-key': 'error',
      '@eslint-react/jsx-no-comment-textnodes': 'error',
      '@eslint-react/jsx-no-leaked-dollar': 'error',
      '@eslint-react/jsx-no-children-prop': 'error',
      '@eslint-react/jsx-no-children-prop-with-children': 'error',
      '@eslint-react/jsx-no-key-after-spread': 'error',
      '@eslint-react/jsx-no-leaked-semicolon': 'error',
      '@eslint-react/jsx-no-useless-fragment': 'error',

      // Naming conventions
      '@eslint-react/naming-convention-context-name': 'error',
      '@eslint-react/naming-convention-ref-name': 'error',
      '@eslint-react/naming-convention-id-name': 'error',

      // React 19 modernization
      '@eslint-react/no-context-provider': 'error',
      '@eslint-react/no-use-context': 'error',
      '@eslint-react/no-missing-context-display-name': 'error',

      // Resource leak prevention
      '@eslint-react/web-api-no-leaked-event-listener': 'error',
      '@eslint-react/web-api-no-leaked-interval': 'error',
      '@eslint-react/web-api-no-leaked-timeout': 'error',
      '@eslint-react/web-api-no-leaked-resize-observer': 'error',
      '@eslint-react/web-api-no-leaked-fetch': 'error',
    },
  },
  // Accessibility — component libraries must ship accessible primitives
  {
    files: ['src/components/**/*.tsx'],
    ...jsxA11y.configs.strict,
  },
  // silver-ui component conventions — components must accept className, style, ref
  {
    files: ['src/components/**/*.tsx'],
    ignores: ['**/*.test.tsx', '**/*.stories.tsx'],
    plugins: {
      'silver-ui': silverUiPlugin,
    },
    rules: {
      'silver-ui/boolean-prop-naming': 'error',
      'silver-ui/require-component-props': 'error',
    },
  },
  // Color tokens — source must use semantic color tokens for dark-mode support
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}', 'src/themes/**'],
    plugins: {
      'silver-ui': silverUiPlugin,
    },
    rules: {
      'silver-ui/no-direct-color-tokens': 'error',
      'silver-ui/no-redundant-box-sizing': 'error',
    },
  },
  // Recipes are internal — barrel (index) files must not export them
  {
    files: ['src/index.ts', 'src/components/**/index.ts'],
    plugins: {
      'silver-ui': silverUiPlugin,
    },
    rules: {
      'silver-ui/no-recipe-exports': 'error',
    },
  },
  // Testing Library — enforce best practices in test files
  {
    files: ['**/*.test.{ts,tsx}'],
    ...testingLibrary.configs['flat/react'],
  },
  // jest-dom — enforce idiomatic DOM matchers in tests
  {
    files: ['**/*.test.{ts,tsx}'],
    ...jestDom.configs['flat/recommended'],
  },
  // Vitest — catch common test mistakes
  {
    files: ['**/*.test.{ts,tsx}'],
    ...vitest.configs.recommended,
  },
  // Storybook — enforce correct story structure
  ...storybook.configs['flat/recommended'],
);
