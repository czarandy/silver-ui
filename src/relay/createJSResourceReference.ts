import type {JSResourceReference} from 'react-relay';

/**
 * Adapts a dynamic import to the resource contract used by Relay EntryPoints.
 * Successful imports stay cached; failed imports are forgotten so a later
 * EntryPoint reference can retry the chunk request.
 */
export function createJSResourceReference<TModule>(
  moduleId: string,
  importModule: () => Promise<{default: TModule}>,
): JSResourceReference<TModule> {
  let loadedModule: TModule | null = null;
  let loadingPromise: Promise<TModule> | null = null;

  return {
    getModuleId: () => moduleId,
    getModuleIfRequired: () => loadedModule,
    load: async () => {
      if (loadedModule !== null) {
        return loadedModule;
      }
      if (loadingPromise !== null) {
        return loadingPromise;
      }

      loadingPromise = importModule().then(
        importedModule => {
          loadedModule = importedModule.default;
          return importedModule.default;
        },
        (error: unknown) => {
          loadingPromise = null;
          throw error;
        },
      );
      return loadingPromise;
    },
  };
}
