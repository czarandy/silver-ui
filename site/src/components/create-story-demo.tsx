import {composeStories} from '@storybook/react';
import type {ComponentType, JSX} from 'react';

export interface StoryDemoProps {
  /**
   * Named export of the story to render, e.g. `Primary`.
   */
  story: string;
}

/**
 * Wraps one of the library's own `*.stories.tsx` modules into a component
 * that renders a single story as a live demo, via Storybook's portable
 * stories API — the docs never duplicate example code.
 *
 * The docgen generates one module per component page that calls this with
 * statically imported story modules, so demos are prerendered at build time
 * and each page's island chunk contains only its own stories.
 */
export function createStoryDemo(
  storyModule: Parameters<typeof composeStories>[0],
): ComponentType<StoryDemoProps> {
  // composeStories applies meta-level args and decorators; project-level
  // annotations from .storybook/preview.tsx are intentionally not applied —
  // its theme decorator touches `document` during render (breaks SSR) and
  // the docs theme comes from Starlight's data-theme attribute instead.
  const composed = composeStories(storyModule) as unknown as Record<
    string,
    ComponentType
  >;
  return function StoryDemo({story}: StoryDemoProps): JSX.Element {
    const Story = composed[story];
    if (Story == null) {
      throw new Error(`StoryDemo: story "${story}" not found in module`);
    }
    return <Story />;
  };
}
