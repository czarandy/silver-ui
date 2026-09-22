import {Spinner} from 'components/Spinner';
import {preloadedSurfaceLoadingFallbackRecipe} from 'relay/PreloadedSurfaceLoadingFallback.recipe';

interface PreloadedSurfaceLoadingFallbackProps {
  surface: 'dialog' | 'drawer' | 'popover';
}

export function PreloadedSurfaceLoadingFallback({
  surface,
}: PreloadedSurfaceLoadingFallbackProps): React.JSX.Element {
  return (
    <div
      className={preloadedSurfaceLoadingFallbackRecipe({surface})}
      data-testid={`preloaded-${surface}-loading`}>
      <Spinner label="Loading..." />
    </div>
  );
}
