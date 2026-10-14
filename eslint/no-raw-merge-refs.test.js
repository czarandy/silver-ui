import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import plugin from './silver-ui-plugin.js';

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});
const rawImport = "import {mergeRefs} from 'internal/mergeRefs';";
const hookImport = "import useMergeRefs from 'hooks/useMergeRefs';";

tester.run('no-raw-merge-refs', plugin.rules['no-raw-merge-refs'], {
  valid: [
    `${rawImport} const composed = mergeRefs(a, b);`,
    `${rawImport} function createRowRef(a, b) { return mergeRefs(a, b); }`,
    `${hookImport} function Input() { const ref = useMergeRefs(a, b); return <input ref={ref} />; }`,
    `${hookImport} function useInputRef() { return useMergeRefs(a, b); }`,
    `${rawImport} function Input(mergeRefs) { return <input ref={mergeRefs(a)} />; }`,
    `${rawImport} function useSomething() { const mergeRefs = other; return mergeRefs(a); }`,
    `function mergeRefs() {} function Input() { return mergeRefs(); }`,
    `${hookImport} function Input() { const callback = useCallback(node => action(node), []); return useMergeRefs(callback, a); }`,
    `import type {mergeRefs} from 'internal/mergeRefs'; function Input() { return mergeRefs(a); }`,
    `import {other as mergeRefs} from 'utils'; function Input() { return mergeRefs(a); }`,
  ],
  invalid: [
    {
      code: `${rawImport} function Input() { return <input ref={mergeRefs(a, b)} />; }`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `${rawImport} const Input = () => { const ref = mergeRefs(a, b); return <input ref={ref} />; };`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `${rawImport} function useInputRef() { return mergeRefs(a, b); }`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `${rawImport} const useInputRef = function() { return mergeRefs(a, b); };`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `${rawImport} function Input() { return useMemo(() => mergeRefs(a, b), [a, b]); }`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `${rawImport} function usePlugin() { return {row() { return mergeRefs(a, b); }}; }`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `import {mergeRefs as compose} from 'internal/mergeRefs'; function Input() { return compose(a, b); }`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `${rawImport} const compose = mergeRefs; function Input() { return compose(a, b); }`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `import * as refs from 'internal/mergeRefs'; function Input() { return refs.mergeRefs(a, b); }`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `import * as refs from 'internal/mergeRefs'; function useInputRef() { return refs['mergeRefs'](a, b); }`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `${rawImport} const Input = React.memo(() => <input ref={mergeRefs(a, b)} />);`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `${rawImport} const Input = React.forwardRef(function render() { return <input ref={mergeRefs(a, b)} />; });`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `${rawImport} export default () => <input ref={mergeRefs(a, b)} />;`,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `${hookImport} function Input() { return useMergeRefs(node => action(node), a); }`,
      errors: [{messageId: 'stableInput'}],
    },
    {
      code: `import {useMergeRefs as compose} from 'hooks'; function Input() { return compose(function(node) { action(node); }); }`,
      errors: [{messageId: 'stableInput'}],
    },
    {
      code: `import * as hooks from 'hooks'; function Input() { return hooks.useMergeRefs((node => action(node)) as RefCallback<HTMLElement>); }`,
      errors: [{messageId: 'stableInput'}],
    },
  ],
});
