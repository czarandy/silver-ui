import {Moon, Sun} from 'lucide-react';
import {IconButton} from 'storybook/internal/components';

export type ThemeMode = 'dark' | 'light';

export interface ThemeToggleProps {
  /**
   * The currently active color scheme.
   */
  mode: ThemeMode;
  /**
   * Called when the button is pressed, with the opposite mode.
   */
  onToggle: (next: ThemeMode) => void;
}

/**
 * Icon-only dark mode toggle for the Storybook toolbar. Mirrors the marketing
 * site nav control: a single button showing the mode it switches to, rather
 * than a dropdown of the available modes.
 */
export function ThemeToggle({
  mode,
  onToggle,
}: ThemeToggleProps): React.JSX.Element {
  const isDark = mode === 'dark';
  const Icon = isDark ? Sun : Moon;

  return (
    <IconButton
      aria-label="Toggle dark mode"
      key="silver-ui-theme-toggle"
      onClick={() => {
        onToggle(isDark ? 'light' : 'dark');
      }}
      title="Toggle dark mode">
      <Icon
        aria-hidden
        data-testid={isDark ? 'sun-icon' : 'moon-icon'}
        size={16}
        strokeWidth={1.75}
      />
    </IconButton>
  );
}
