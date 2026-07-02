import {defineConfig} from 'tsup';
import {getComponentEntries} from './build/componentEntries.mjs';

const componentEntries = getComponentEntries();

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    ...componentEntries,
  },
  format: ['esm', 'cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  splitting: true,
  target: 'es2020',
  outDir: 'dist',
  // Emit metafiles so scripts/preserve-use-client.mjs can map each output
  // chunk back to its source inputs and re-add 'use client' directives that
  // tsup's tree-shaking pass strips. The metafiles are deleted by that script.
  metafile: true,
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
