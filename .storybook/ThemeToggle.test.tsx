import {render as rtlRender, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ReactElement} from 'react';
import {ThemeProvider, ensure, themes} from 'storybook/theming';
import {describe, expect, it, vi} from 'vitest';
import {ThemeToggle} from './ThemeToggle';

/**
 * Storybook's `IconButton` is an emotion component that reads from the manager
 * theme, so it has to render inside a `ThemeProvider`.
 */
function render(ui: ReactElement) {
  return rtlRender(
    <ThemeProvider theme={ensure(themes.light)}>{ui}</ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  it('shows the moon icon in light mode', () => {
    render(<ThemeToggle mode="light" onToggle={vi.fn()} />);

    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
  });

  it('shows the sun icon in dark mode', () => {
    render(<ThemeToggle mode="dark" onToggle={vi.fn()} />);

    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('has an accessible label', () => {
    render(<ThemeToggle mode="light" onToggle={vi.fn()} />);

    expect(
      screen.getByRole('button', {name: 'Toggle dark mode'}),
    ).toBeInTheDocument();
  });

  it('toggles from light to dark', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<ThemeToggle mode="light" onToggle={onToggle} />);

    await user.click(screen.getByRole('button', {name: 'Toggle dark mode'}));

    expect(onToggle).toHaveBeenCalledExactlyOnceWith('dark');
  });

  it('toggles from dark to light', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<ThemeToggle mode="dark" onToggle={onToggle} />);

    await user.click(screen.getByRole('button', {name: 'Toggle dark mode'}));

    expect(onToggle).toHaveBeenCalledExactlyOnceWith('light');
  });
});
