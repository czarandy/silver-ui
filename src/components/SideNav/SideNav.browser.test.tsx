import {render, screen} from '@testing-library/react';
import {Home, Inbox, Settings} from 'lucide-react';
import {describe, expect, it} from 'vitest';
import {SideNav} from 'components/SideNav/SideNav';
import {SideNavItem} from 'components/SideNav/SideNavItem';
import {SideNavSection} from 'components/SideNav/SideNavSection';

function gapBetween(upperTestId: string, lowerTestId: string): number {
  return (
    screen.getByTestId(lowerTestId).getBoundingClientRect().top -
    screen.getByTestId(upperTestId).getBoundingClientRect().bottom
  );
}

describe('SideNav spacing', () => {
  it('spaces items placed directly in the nav like items in a section', () => {
    render(
      <div style={{height: 600}}>
        <SideNav>
          <SideNavItem data-testid="direct-1" icon={Home} label="Home" />
          <SideNavItem data-testid="direct-2" icon={Inbox} label="Inbox" />
          <SideNavSection title="Section">
            <SideNavItem data-testid="section-1" icon={Home} label="Home" />
            <SideNavItem data-testid="section-2" icon={Inbox} label="Inbox" />
          </SideNavSection>
        </SideNav>
      </div>,
    );

    const sectionGap = gapBetween('section-1', 'section-2');
    expect(sectionGap).toBe(2);
    expect(gapBetween('direct-1', 'direct-2')).toBe(sectionGap);
  });

  it('keeps sections and bottom content spaced as before', () => {
    render(
      <div style={{height: 600}}>
        <SideNav bottomContent={<div data-testid="bottom">Help</div>}>
          <SideNavSection data-testid="first" title="First">
            <SideNavItem icon={Home} label="Home" />
          </SideNavSection>
          <SideNavSection data-testid="second" title="Second">
            <SideNavItem icon={Settings} label="Settings" />
          </SideNavSection>
          <SideNavItem data-testid="last-item" icon={Inbox} label="Inbox" />
        </SideNav>
      </div>,
    );

    // Adjacent sections touch; their own padding spaces them.
    expect(gapBetween('first', 'second')).toBe(0);
    // An item after a section gets no extra space.
    expect(gapBetween('second', 'last-item')).toBe(0);
    // Bottom content is still pushed to the bottom of the nav.
    expect(gapBetween('last-item', 'bottom')).toBeGreaterThan(300);
  });
});
