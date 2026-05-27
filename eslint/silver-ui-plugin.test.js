import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import plugin from './silver-ui-plugin.js';

const rule = plugin.rules['require-component-props'];
const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {jsx: true},
    },
  },
});

tester.run('require-component-props', rule, {
  valid: [
    {
      name: 'function declaration with all required props',
      code: 'export function Button({ className, style, ref, ...rest }) { return <button />; }',
      filename: 'src/components/Button/Button.tsx',
    },
    {
      name: 'arrow function with all required props',
      code: 'export const Button = ({ className, style, ref, ...rest }) => <button />;',
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
      ],
    },
    {
      name: 'all three props missing',
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
      ],
    },
  ],
});
