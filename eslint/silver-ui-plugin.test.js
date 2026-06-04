import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import plugin from './silver-ui-plugin.js';

const requireComponentPropsRule = plugin.rules['require-component-props'];
const booleanPropNamingRule = plugin.rules['boolean-prop-naming'];
const noDirectColorTokensRule = plugin.rules['no-direct-color-tokens'];
const noRedundantBoxSizingRule = plugin.rules['no-redundant-box-sizing'];
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
      name: 'allows is and has prefixes on non-Props interfaces',
      code: `
        interface TruncationState {
          isTruncated: boolean;
        }
      `,
    },
    {
      name: 'allows getIs and getHas predicate function properties',
      code: `
        interface AccordionContextValue {
          getIsOpen: (value: string) => boolean;
          getHasItem: (value: string) => true | false;
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
    {
      name: 'allows is and has prefixes on function parameters',
      code: `
        function toggle(isOpen: boolean) {}
      `,
    },
    {
      name: 'allows is and has prefixes on arrow function parameters',
      code: `
        const toggle = (hasItems: boolean) => {};
      `,
    },
    {
      name: 'ignores non-boolean function parameters',
      code: `
        function foo(name: string, count: number) {}
      `,
    },
    {
      name: 'ignores destructured function parameters',
      code: `
        function foo({ isDisabled }: { isDisabled: boolean }) {}
      `,
    },
    {
      name: 'ignores untyped prefixed function parameters',
      code: `
        const onOpenChange = isOpen => {};
      `,
    },
    {
      name: 'allows is prefix on parameters with defaults',
      code: `
        function foo(isActive: boolean = true) {}
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
    {
      name: 'reports boolean props on non-Props interfaces',
      code: `
        interface TruncationState {
          truncated: boolean;
        }
      `,
      errors: [
        {
          messageId: 'invalidBooleanProp',
          data: {name: 'truncated'},
        },
      ],
    },
    {
      name: 'reports boolean predicate props without getIs or getHas',
      code: `
        interface AccordionContextValue {
          isOpen: (value: string) => boolean;
          hasItem: (value: string) => true | false;
        }
      `,
      errors: [
        {
          messageId: 'invalidBooleanPredicateProp',
          data: {name: 'isOpen'},
        },
        {
          messageId: 'invalidBooleanPredicateProp',
          data: {name: 'hasItem'},
        },
      ],
    },
    {
      name: 'reports boolean function parameters without is or has',
      code: `
        function foo(foobar: boolean) {}
      `,
      errors: [
        {
          messageId: 'invalidBooleanParam',
          data: {name: 'foobar'},
        },
      ],
    },
    {
      name: 'reports boolean arrow function parameters without is or has',
      code: `
        const check = (valid: boolean) => {};
      `,
      errors: [
        {
          messageId: 'invalidBooleanParam',
          data: {name: 'valid'},
        },
      ],
    },
    {
      name: 'reports boolean parameters with defaults without is or has',
      code: `
        function foo(active: boolean = true) {}
      `,
      errors: [
        {
          messageId: 'invalidBooleanParam',
          data: {name: 'active'},
        },
      ],
    },
    {
      name: 'reports is-prefixed props without boolean types',
      code: `
        interface MeterProps {
          isFoo?: number;
        }
      `,
      errors: [
        {
          messageId: 'invalidPrefixedProp',
          data: {name: 'isFoo'},
        },
      ],
    },
    {
      name: 'reports has-prefixed props without boolean types',
      code: `
        interface CardProps {
          hasTitle?: string;
        }
      `,
      errors: [
        {
          messageId: 'invalidPrefixedProp',
          data: {name: 'hasTitle'},
        },
      ],
    },
    {
      name: 'reports is-prefixed literal props without boolean types',
      code: `
        type BadgeProps = {
          isVariant?: 'success' | 'error';
        };
      `,
      errors: [
        {
          messageId: 'invalidPrefixedProp',
          data: {name: 'isVariant'},
        },
      ],
    },
    {
      name: 'reports is-prefixed function parameters without boolean types',
      code: `
        function foo(isCount: number) {}
      `,
      errors: [
        {
          messageId: 'invalidPrefixedParam',
          data: {name: 'isCount'},
        },
      ],
    },
    {
      name: 'reports has-prefixed parameters with defaults without boolean types',
      code: `
        function foo(hasCount: number = 1) {}
      `,
      errors: [
        {
          messageId: 'invalidPrefixedParam',
          data: {name: 'hasCount'},
        },
      ],
    },
  ],
});

tester.run('no-direct-color-tokens', noDirectColorTokensRule, {
  valid: [
    {
      name: 'allows semantic color tokens',
      code: `
        const styles = {
          root: css({
            bg: 'bg.selected',
            color: 'status.error.fg',
            borderColor: 'surface.red.fg',
            boxShadow: '0 0 0 2px token(colors.primary.subtle)',
          }),
        };
      `,
    },
    {
      name: 'allows semantic color token references in token helpers',
      code: `
        const style = {
          backgroundColor: 'token(colors.bg.selected)',
          color: 'token(colors.fg.onPrimary)',
        };
      `,
    },
    {
      name: 'allows non-color strings',
      code: `
        const label = 'red alert';
        const icon = 'icon.md';
      `,
    },
  ],
  invalid: [
    {
      name: 'reports primitive palette tokens',
      code: `
        const styles = {
          root: css({
            bg: 'red.600',
            color: 'silver-neutral.200',
          }),
        };
      `,
      errors: [
        {
          messageId: 'directColor',
          data: {color: 'red.600'},
        },
        {
          messageId: 'directColor',
          data: {color: 'silver-neutral.200'},
        },
      ],
    },
    {
      name: 'reports primitive token helper references',
      code: `
        const style = {
          backgroundColor: 'token(colors.blue.100)',
        };
      `,
      errors: [
        {
          messageId: 'directColor',
          data: {color: 'blue.100'},
        },
      ],
    },
    {
      name: 'reports primitive css variable references',
      code: `
        const style = {
          backgroundColor: 'var(--silver-colors-primary-50)',
        };
      `,
      errors: [
        {
          messageId: 'directColor',
          data: {color: 'var(--silver-colors-primary-50)'},
        },
      ],
    },
    {
      name: 'reports raw color literals',
      code: `
        const styles = {
          root: css({
            bg: '#fff',
            color: 'rgba(0, 0, 0, 0.4)',
          }),
        };
      `,
      errors: [
        {
          messageId: 'directColor',
          data: {color: '#fff'},
        },
        {
          messageId: 'directColor',
          data: {color: 'rgba('},
        },
      ],
    },
    {
      name: 'reports named primitive colors',
      code: `
        const styles = {
          root: css({
            bg: 'white',
            color: '{colors.black}',
          }),
        };
      `,
      errors: [
        {
          messageId: 'directColor',
          data: {color: 'white'},
        },
        {
          messageId: 'directColor',
          data: {color: 'colors.black'},
        },
      ],
    },
  ],
});

tester.run('no-redundant-box-sizing', noRedundantBoxSizingRule, {
  valid: [
    {
      name: 'allows boxSizing: content-box (intentional override)',
      code: `
        const styles = css({
          boxSizing: 'content-box',
        });
      `,
    },
    {
      name: 'allows non-boxSizing properties',
      code: `
        const styles = css({
          display: 'flex',
          position: 'relative',
        });
      `,
    },
  ],
  invalid: [
    {
      name: 'reports standalone boxSizing: border-box',
      code: `
        const styles = css({
          boxSizing: 'border-box',
          display: 'flex',
        });
      `,
      output: `
        const styles = css({
          display: 'flex',
        });
      `,
      errors: [{messageId: 'redundant'}],
    },
    {
      name: 'reports boxSizing: border-box as the only property',
      code: `
        const styles = css({
          boxSizing: 'border-box',
        });
      `,
      output: `
        const styles = css({
        });
      `,
      errors: [{messageId: 'redundant'}],
    },
    {
      name: 'reports boxSizing: border-box at the end of object',
      code: `
        const styles = css({
          display: 'flex',
          boxSizing: 'border-box',
        });
      `,
      output: `
        const styles = css({
          display: 'flex',
        });
      `,
      errors: [{messageId: 'redundant'}],
    },
    {
      name: 'reports boxSizing: border-box even with all: unset',
      code: `
        const styles = css({
          all: 'unset',
          boxSizing: 'border-box',
          display: 'flex',
        });
      `,
      output: `
        const styles = css({
          all: 'unset',
          display: 'flex',
        });
      `,
      errors: [{messageId: 'redundant'}],
    },
  ],
});
