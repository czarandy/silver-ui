import {render, screen} from '@testing-library/react';
import {Home} from 'lucide-react';
import {describe, expect, it} from 'vitest';
import {SideNav} from './SideNav';
import {SideNavHeading} from './SideNavHeading';
import {SideNavItem} from './SideNavItem';
import {SideNavSection} from './SideNavSection';

describe('SideNav', () => {
  it('renders a navigation landmark with sections and items', () => {
    render(
      <SideNav header={<SideNavHeading heading="Silver" />}>
        <SideNavSection title="Main">
          <SideNavItem href="/home" icon={<Home />} label="Home" />
        </SideNavSection>
      </SideNav>,
    );

    expect(
      screen.getByRole('navigation', {name: 'Side navigation'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'href',
      '/home',
    );
  });

  it('marks selected items with aria-current', () => {
    render(
      <SideNav>
        <SideNavItem href="/home" isSelected label="Home" />
      </SideNav>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
