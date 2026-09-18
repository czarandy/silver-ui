import {render, screen} from '@testing-library/react';
import {X} from 'lucide-react';
import {createRef, type SVGProps} from 'react';
import {describe, expect, it} from 'vitest';
import {
  FeaturedIcon,
  type FeaturedIconColor,
  type FeaturedIconSize,
} from 'components/FeaturedIcon/FeaturedIcon';
import {featuredIconRecipe} from 'components/FeaturedIcon/FeaturedIcon.recipe';
import {iconRecipe} from 'components/Icon/Icon.recipe';

function Glyph(props: SVGProps<SVGSVGElement>): React.JSX.Element {
  return <svg {...props} data-testid="featured-glyph" />;
}

describe('FeaturedIcon', () => {
  it('renders the icon inside a circular container', () => {
    render(<FeaturedIcon data-testid="featured" icon={Glyph} />);

    const root = screen.getByTestId('featured');
    expect(root.tagName.toLowerCase()).toBe('span');
    expect(root).toHaveClass('silver-bdr_full');
    expect(screen.getByTestId('featured-glyph').tagName.toLowerCase()).toBe(
      'svg',
    );
  });

  it('is decorative by default', () => {
    render(<FeaturedIcon data-testid="featured" icon={X} />);

    const root = screen.getByTestId('featured');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role');
  });

  it('renders as a labelled image when aria-label is set', () => {
    render(<FeaturedIcon aria-label="Link unavailable" icon={X} />);

    const image = screen.getByRole('img', {name: 'Link unavailable'});
    expect(image).not.toHaveAttribute('aria-hidden');
  });

  it('defaults to the accent color and md size', () => {
    render(<FeaturedIcon data-testid="featured" icon={X} />);

    expect(screen.getByTestId('featured')).toHaveClass(
      ...featuredIconRecipe({color: 'accent', size: 'md'}).split(' '),
    );
  });

  it.each<FeaturedIconColor>([
    'accent',
    'success',
    'error',
    'warning',
    'info',
    'blue',
    'cyan',
    'gray',
    'green',
    'orange',
    'pink',
    'purple',
    'red',
    'teal',
    'yellow',
  ])('applies the %s tint', color => {
    render(<FeaturedIcon color={color} data-testid="featured" icon={X} />);

    expect(screen.getByTestId('featured')).toHaveClass(
      ...featuredIconRecipe({color}).split(' '),
    );
  });

  it('pairs the error tint with the red surface tokens', () => {
    render(<FeaturedIcon color="error" data-testid="featured" icon={X} />);

    const root = screen.getByTestId('featured');
    expect(root).toHaveClass('silver-bg_surface.red');
    expect(root).toHaveClass('silver-c_surface.red.fg');
  });

  it.each<FeaturedIconSize>(['sm', 'md', 'lg'])(
    'scales the circle and icon together at %s',
    size => {
      render(<FeaturedIcon data-testid="featured" icon={Glyph} size={size} />);

      const root = screen.getByTestId('featured');
      expect(root).toHaveClass(`silver-w_component.${size}`);
      expect(root).toHaveClass(`silver-h_component.${size}`);
      expect(screen.getByTestId('featured-glyph')).toHaveClass(
        ...iconRecipe({size}).split(' '),
      );
    },
  );

  it('forwards ref, className, style, and native attributes', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <FeaturedIcon
        className="custom"
        data-testid="featured"
        icon={X}
        id="featured-id"
        ref={ref}
        style={{marginTop: 4}}
      />,
    );

    const root = screen.getByTestId('featured');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('custom');
    expect(root).toHaveAttribute('id', 'featured-id');
    expect(root).toHaveStyle({marginTop: '4px'});
  });
});

describe('featuredIconRecipe', () => {
  it('lets the solid variant override the color tint', () => {
    const className = featuredIconRecipe({color: 'error', variant: 'solid'});

    expect(className).toContain('silver-bg_primary');
    expect(className).toContain('silver-c_fg.onPrimary');
    expect(className).not.toContain('surface.red');
  });
});
