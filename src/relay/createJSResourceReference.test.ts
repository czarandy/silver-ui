import {describe, expect, it, vi} from 'vitest';
import {createJSResourceReference} from 'relay/createJSResourceReference';

describe('createJSResourceReference', () => {
  it('shares an import and caches its default export', async () => {
    const root = (): null => null;
    const importModule = vi.fn(async () => {
      await Promise.resolve();
      return {default: root};
    });
    const resource = createJSResourceReference('TestRoot', importModule);

    expect(resource.getModuleId()).toBe('TestRoot');
    expect(resource.getModuleIfRequired()).toBeNull();

    const [first, second] = await Promise.all([
      resource.load(),
      resource.load(),
    ]);

    expect(importModule).toHaveBeenCalledOnce();
    expect(first).toBe(root);
    expect(second).toBe(root);
    expect(resource.getModuleIfRequired()).toBe(root);

    await expect(resource.load()).resolves.toBe(root);
    expect(importModule).toHaveBeenCalledOnce();
  });

  it('forgets a failed import so a later load can retry', async () => {
    const root = (): null => null;
    const importModule = vi
      .fn<() => Promise<{default: typeof root}>>()
      .mockRejectedValueOnce(new Error('chunk failed'))
      .mockResolvedValueOnce({default: root});
    const resource = createJSResourceReference('RetryRoot', importModule);

    await expect(resource.load()).rejects.toThrow('chunk failed');
    expect(resource.getModuleIfRequired()).toBeNull();
    await expect(resource.load()).resolves.toBe(root);
    expect(importModule).toHaveBeenCalledTimes(2);
  });
});
