import type {ComponentDocData} from '../../scripts/docgen/types';

const modules = import.meta.glob<{default: ComponentDocData}>(
  '../generated/props/*.json',
  {eager: true},
);

/**
 * Loads the generated docs data for a component, failing loudly if stale.
 */
export function componentDocData(name: string): ComponentDocData {
  const module = modules[`../generated/props/${name}.json`];
  if (module == null) {
    throw new Error(
      `No generated docs data for "${name}" — run the docgen (pnpm -C site docgen)`,
    );
  }
  return module.default;
}
