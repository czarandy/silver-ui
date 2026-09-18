import {render, screen} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';
import {featuredIconRecipe} from 'components/FeaturedIcon/FeaturedIcon.recipe';
import {NavIcon} from 'components/NavIcon/NavIcon';

describe('NavIcon', () => {
  it('renders the provided icon content', () => {
    render(
      <NavIcon data-testid="nav-icon" icon={<svg data-testid="glyph" />} />,
    );

    expect(screen.getByTestId('nav-icon')).toContainElement(
      screen.getByTestId('glyph'),
    );
  });

  it('is the solid primary, sm FeaturedIcon treatment', () => {
    render(<NavIcon data-testid="nav-icon" icon={<svg />} />);

    const root = screen.getByTestId('nav-icon');
    expect(root).toHaveClass(
      ...featuredIconRecipe({size: 'sm', variant: 'solid'}).split(' '),
    );
    expect(root).toHaveClass('silver-bg_primary');
    expect(root).toHaveClass('silver-c_fg.onPrimary');
    expect(root).toHaveClass('silver-w_component.sm');
    expect(root).toHaveClass('silver-bdr_full');
  });

  it('forwards ref, className, and style', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <NavIcon
        className="custom"
        data-testid="nav-icon"
        icon={<svg />}
        ref={ref}
        style={{marginTop: 4}}
      />,
    );

    const root = screen.getByTestId('nav-icon');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('custom');
    expect(root).toHaveStyle({marginTop: '4px'});
  });
});
