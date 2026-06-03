import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Theme} from './Theme';

describe('Theme', () => {
  it('renders children and defaults to system mode', () => {
    render(<Theme data-testid="theme">Content</Theme>);

    const theme = screen.getByTestId('theme');
    expect(theme).toHaveTextContent('Content');
    expect(theme).not.toHaveAttribute('data-theme');
  });

  it('sets data-theme for explicit modes', () => {
    render(
      <Theme data-testid="theme" mode="dark">
        Content
      </Theme>,
    );

    expect(screen.getByTestId('theme')).toHaveAttribute('data-theme', 'dark');
  });

  it('maps friendly color tokens to CSS custom properties', () => {
    render(
      <Theme
        data-testid="theme"
        tokens={{
          colors: {
            bgSubtle: 'gray-50',
            fg: '#222222',
            primary: 'purple-500',
            primaryHover: 'purple.600',
            surfaceGray: '#e7dec3',
          },
        }}>
        Content
      </Theme>,
    );

    const style = screen.getByTestId('theme').style;
    expect(style.getPropertyValue('--silver-colors-bg-subtle')).toBe(
      'var(--silver-colors-gray-50)',
    );
    expect(style.getPropertyValue('--silver-colors-fg')).toBe('#222222');
    expect(style.getPropertyValue('--silver-colors-primary')).toBe(
      'var(--silver-colors-purple-500)',
    );
    expect(style.getPropertyValue('--silver-colors-primary-hover')).toBe(
      'var(--silver-colors-purple-600)',
    );
    expect(style.getPropertyValue('--silver-colors-surface-gray')).toBe(
      '#e7dec3',
    );
  });

  it('maps font and radius tokens to CSS custom properties', () => {
    render(
      <Theme
        data-testid="theme"
        tokens={{
          fonts: {
            body: 'Inter, sans-serif',
          },
          radii: {
            componentMd: '12px',
            sm: '2px',
          },
        }}>
        Content
      </Theme>,
    );

    const style = screen.getByTestId('theme').style;
    expect(style.getPropertyValue('--silver-fonts-body')).toBe(
      'Inter, sans-serif',
    );
    expect(style.getPropertyValue('--silver-radii-component-md')).toBe('12px');
    expect(style.getPropertyValue('--silver-radii-sm')).toBe('2px');
  });

  it('maps expanded semantic token groups to CSS custom properties', () => {
    render(
      <Theme
        data-testid="theme"
        tokens={{
          colors: {
            bgGhostHover: 'rgba(0, 0, 0, 0.04)',
            iconInfo: 'blue-700',
            statusInfoSolid: 'purple-500',
            surfaceBlueFg: '#00458c',
            surfaceGrayHover: '#ddd4b9',
            trackEmphasized: '#93a1a1',
          },
          fontSizes: {
            componentMd: '1rem',
          },
          shadows: {
            focus: '0 0 0 2px #268bd2',
          },
          sizes: {
            iconMd: '1.25rem',
          },
          spacing: {
            focusOffsetLoose: '4px',
          },
        }}>
        Content
      </Theme>,
    );

    const style = screen.getByTestId('theme').style;
    expect(style.getPropertyValue('--silver-colors-bg-ghost-hover')).toBe(
      'rgba(0, 0, 0, 0.04)',
    );
    expect(style.getPropertyValue('--silver-colors-icon-info')).toBe(
      'var(--silver-colors-blue-700)',
    );
    expect(style.getPropertyValue('--silver-colors-status-info-solid')).toBe(
      'var(--silver-colors-purple-500)',
    );
    expect(style.getPropertyValue('--silver-colors-surface-blue-fg')).toBe(
      '#00458c',
    );
    expect(style.getPropertyValue('--silver-colors-surface-gray-hover')).toBe(
      '#ddd4b9',
    );
    expect(style.getPropertyValue('--silver-colors-track-emphasized')).toBe(
      '#93a1a1',
    );
    expect(style.getPropertyValue('--silver-font-sizes-component-md')).toBe(
      '1rem',
    );
    expect(style.getPropertyValue('--silver-shadows-focus')).toBe(
      '0 0 0 2px #268bd2',
    );
    expect(style.getPropertyValue('--silver-sizes-icon-md')).toBe('1.25rem');
    expect(style.getPropertyValue('--silver-spacing-focus-offset-loose')).toBe(
      '4px',
    );
  });

  it('uses themes for mode-aware variables', () => {
    render(
      <Theme
        data-testid="theme"
        themes={{
          dark: {
            colors: {
              bg: '#002b36',
              primary: '#268bd2',
            },
          },
          light: {
            colors: {
              bg: '#fdf6e3',
              primary: '#268bd2',
            },
          },
        }}>
        Content
      </Theme>,
    );

    const theme = screen.getByTestId('theme');
    const styleElement = screen.getByTestId('theme-styles');
    expect(theme.style.getPropertyValue('--silver-colors-bg')).toBe('');
    expect(styleElement).toHaveTextContent('--silver-colors-bg: #fdf6e3;');
    expect(styleElement).toHaveTextContent(
      '@media (prefers-color-scheme: dark)',
    );
    expect(styleElement).toHaveTextContent('--silver-colors-bg: #002b36;');
  });

  it('layers universal tokens inline on top of mode-aware themes', () => {
    render(
      <Theme
        data-testid="theme"
        themes={{
          light: {
            colors: {
              bg: '#fdf6e3',
            },
          },
        }}
        tokens={{
          colors: {
            primary: 'purple-500',
          },
        }}>
        Content
      </Theme>,
    );

    const theme = screen.getByTestId('theme');
    expect(theme.style.getPropertyValue('--silver-colors-primary')).toBe(
      'var(--silver-colors-purple-500)',
    );
    expect(screen.getByTestId('theme-styles')).toHaveTextContent(
      '--silver-colors-bg: #fdf6e3;',
    );
  });

  it('supports className, style, data-testid, custom element, and ref', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(
      <Theme
        as="section"
        className="custom-theme"
        data-testid="theme"
        ref={ref}
        style={{color: 'red'}}
        tokens={{colors: {primary: 'teal-500'}}}>
        Content
      </Theme>,
    );

    const theme = screen.getByTestId('theme');
    expect(theme.tagName).toBe('SECTION');
    expect(theme).toHaveClass('custom-theme');
    expect(theme).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(theme.style.getPropertyValue('--silver-colors-primary')).toBe(
      'var(--silver-colors-teal-500)',
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});
