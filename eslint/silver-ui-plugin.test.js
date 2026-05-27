import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import plugin from './silver-ui-plugin.js';

const requireComponentPropsRule = plugin.rules['require-component-props'];
const booleanPropNamingRule = plugin.rules['boolean-prop-naming'];
const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {jsx: true},
    },
  },
});

tester.run('require-component-props', requireComponentPropsRule, {
  valid: [
    {
      name: 'function declaration with all required props',
      code: 'export function Button({ className, style, ref, "data-testid": dataTestId, ...rest }) { return <button />; }',
      filename: 'src/components/Button/Button.tsx',
    },
    {
      name: 'arrow function with all required props',
      code: 'export const Button = ({ className, style, ref, "data-testid": dataTestId, ...rest }) => <button />;',
      filename: 'src/components/Button/Button.tsx',
    },
    {
      name: 'non-component file is ignored',
      code: 'export function helper() { return null; }',
      filename: 'src/lib/utils.ts',
    },
    {
      name: 'test file is ignored',
      code: 'export function Button({ children }) { return <button />; }',
      filename: 'src/components/Button/Button.test.tsx',
    },
    {
      name: 'story file is ignored',
      code: 'export function Button({ children }) { return <button />; }',
      filename: 'src/components/Button/Button.stories.tsx',
    },
    {
      name: 'recipe file is ignored',
      code: 'export const buttonRecipe = cva({});',
      filename: 'src/components/Button/Button.recipe.ts',
    },
    {
      name: 'internal components are ignored',
      code: 'export function VisuallyHidden({ children, ref }) { return <span ref={ref}>{children}</span>; }',
      filename: 'src/components/internal/VisuallyHidden.tsx',
    },
  ],
  invalid: [
    {
      name: 'missing className',
      code: 'export function Button({ style, ref }) { return <button />; }',
      filename: 'src/components/Button/Button.tsx',
      errors: [
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Button', prop: 'className'},
        },
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Button', prop: 'data-testid'},
        },
      ],
    },
    {
      name: 'missing style',
      code: 'export function Button({ className, ref }) { return <button />; }',
      filename: 'src/components/Button/Button.tsx',
      errors: [
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Button', prop: 'style'},
        },
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Button', prop: 'data-testid'},
        },
      ],
    },
    {
      name: 'missing ref',
      code: 'export function Button({ className, style }) { return <button />; }',
      filename: 'src/components/Button/Button.tsx',
      errors: [
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Button', prop: 'ref'},
        },
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Button', prop: 'data-testid'},
        },
      ],
    },
    {
      name: 'all required props missing',
      code: 'export function Button({ children }) { return <button />; }',
      filename: 'src/components/Button/Button.tsx',
      errors: [
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Button', prop: 'className'},
        },
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Button', prop: 'style'},
        },
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Button', prop: 'ref'},
        },
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Button', prop: 'data-testid'},
        },
      ],
    },
    {
      name: 'arrow function missing all props',
      code: 'export const Card = ({ children }) => <div />;',
      filename: 'src/components/Card/Card.tsx',
      errors: [
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Card', prop: 'className'},
        },
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Card', prop: 'style'},
        },
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Card', prop: 'ref'},
        },
        {
          messageId: 'missingPropDestructure',
          data: {name: 'Card', prop: 'data-testid'},
        },
      ],
    },
  ],
});

tester.run('boolean-prop-naming', booleanPropNamingRule, {
  valid: [
    {
      name: 'allows is and has boolean prop prefixes',
      code: `
        interface ButtonProps {
          isDisabled?: boolean;
          hasIcon?: boolean;
          label: string;
        }
      `,
    },
    {
      name: 'allows boolean unions with is and has prefixes',
      code: `
        type TooltipProps = {
          isOpen?: boolean | undefined;
          hasHoverIndication?: 'auto' | boolean;
        };
      `,
    },
    {
      name: 'ignores non-Props type names',
      code: `
        interface TruncationState {
          truncated: boolean;
        }
      `,
    },
    {
      name: 'ignores non-boolean props',
      code: `
        interface LinkProps {
          target?: string;
          label: string;
        }
      `,
    },
  ],
  invalid: [
    {
      name: 'reports boolean interface props without is or has',
      code: `
        interface ButtonProps {
          disabled?: boolean;
        }
      `,
      errors: [
        {
          messageId: 'invalidBooleanProp',
          data: {name: 'disabled'},
        },
      ],
    },
    {
      name: 'reports boolean type literal props without is or has',
      code: `
        type LinkProps = {
          external?: boolean | undefined;
        };
      `,
      errors: [
        {
          messageId: 'invalidBooleanProp',
          data: {name: 'external'},
        },
      ],
    },
    {
      name: 'reports boolean literal unions without is or has',
      code: `
        interface ToggleProps {
          selected?: true | false;
        }
      `,
      errors: [
        {
          messageId: 'invalidBooleanProp',
          data: {name: 'selected'},
        },
      ],
    },
  ],
});
