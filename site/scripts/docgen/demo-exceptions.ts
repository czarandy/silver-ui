/**
 * Stories that cannot be server-rendered at build time (they reach for
 * browser APIs during the initial render). They are still shown as live
 * demos, but hydrate client-only (`client:only`), so the built HTML contains
 * the snippet and an empty demo box instead of prerendered markup.
 *
 * Key format: `<ComponentDir>/<StoriesFile>#<StoryExport>`. Use
 * `<ComponentDir>/<StoriesFile>#*` for every story in a file.
 */
export const clientOnlyStories: ReadonlySet<string> = new Set<string>([]);

export function isClientOnly(
  component: string,
  file: string,
  exportName: string,
): boolean {
  return (
    clientOnlyStories.has(`${component}/${file}#${exportName}`) ||
    clientOnlyStories.has(`${component}/${file}#*`)
  );
}
