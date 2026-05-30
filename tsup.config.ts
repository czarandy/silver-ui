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
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
