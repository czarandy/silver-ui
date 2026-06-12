import {render, screen} from '@testing-library/react';
import {Home} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {Icon, type IconColor, type IconSize} from 'components/Icon/Icon';

describe('Icon', () => {
  it('renders a lucide icon as an SVG', () => {
    render(<Icon data-testid="icon" icon={Home} />);

    expect(screen.getByTestId('icon').tagName.toLowerCase()).toBe('svg');
  });

  it('is decorative by default', () => {
    render(<Icon data-testid="icon" icon={Home} />);

    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('can render as an image when labelled', () => {
    render(<Icon aria-label="Home" data-testid="icon" icon={Home} />);

    expect(screen.getByTestId('icon')).toHaveAttribute('role', 'img');
    expect(screen.getByTestId('icon')).not.toHaveAttribute('aria-hidden');
  });

  it('supports the standard size variants', () => {
    const sizes: IconSize[] = ['sm', 'md', 'lg'];
    const {rerender} = render(
      <Icon data-testid="icon" icon={Home} size={sizes[0]} />,
    );

    for (const size of sizes) {
      rerender(<Icon data-testid="icon" icon={Home} size={size} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    }
  });

  it('supports XDS color variants', () => {
    const colors: IconColor[] = [
      'primary',
      'secondary',
      'tertiary',
      'disabled',
      'accent',
      'success',
      'error',
      'warning',
      'inherit',
      'blue',
      'red',
      'green',
      'gray',
      'cyan',
      'teal',
      'yellow',
      'orange',
      'pink',
      'purple',
    ];
    const {rerender} = render(
      <Icon color={colors[0]} data-testid="icon" icon={Home} />,
    );

    for (const color of colors) {
      rerender(<Icon color={color} data-testid="icon" icon={Home} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    }
  });

  it('applies the correct size class for each variant', () => {
    const {rerender} = render(
      <Icon data-testid="icon" icon={Home} size="sm" />,
    );

    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('silver-w_icon.sm');
    expect(icon).toHaveClass('silver-h_icon.sm');

    rerender(<Icon data-testid="icon" icon={Home} size="md" />);
    expect(icon).toHaveClass('silver-w_icon.md');
    expect(icon).toHaveClass('silver-h_icon.md');

    rerender(<Icon data-testid="icon" icon={Home} size="lg" />);
    expect(icon).toHaveClass('silver-w_icon.lg');
    expect(icon).toHaveClass('silver-h_icon.lg');
  });

  it('forwards className, style, ref, and SVG props', () => {
    const ref = vi.fn<(element: SVGSVGElement | null) => void>();

    render(
      <Icon
        className="custom-icon"
        data-testid="icon"
        icon={Home}
        ref={ref}
        strokeWidth={1.5}
        style={{color: 'red'}}
      />,
    );

    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('custom-icon');
    expect(icon).toHaveAttribute('stroke-width', '1.5');
    expect(icon).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(SVGSVGElement));
  });
});
