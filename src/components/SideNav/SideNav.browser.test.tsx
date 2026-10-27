import {fireEvent, render, screen} from '@testing-library/react';
import {Home, Inbox, Settings} from 'lucide-react';
import {describe, expect, it} from 'vitest';
import {SideNav} from 'components/SideNav/SideNav';
import {SideNavItem} from 'components/SideNav/SideNavItem';
import {SideNavSection} from 'components/SideNav/SideNavSection';

function rect(testId: string): DOMRect {
  return screen.getByTestId(testId).getBoundingClientRect();
}

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

  // The nav is rendered without a fixed height so the scrollable area wraps
  // its content, and its edges show any space around the first and last item.
  function renderSectionOnlyNav(): void {
    render(
      <SideNav collapseBreakpoint="none" data-testid="sections" isCollapsible>
        <SideNavSection data-testid="first" isHeaderHidden title="First">
          <SideNavItem data-testid="first-1" icon={Home} label="Home" />
          <SideNavItem data-testid="first-2" icon={Inbox} label="Inbox" />
        </SideNavSection>
        <SideNavSection data-testid="second" isHeaderHidden title="Second">
          <SideNavItem
            data-testid="second-1"
            icon={Settings}
            label="Settings"
          />
        </SideNavSection>
      </SideNav>,
    );
  }

  function renderBareNav(): void {
    render(
      <SideNav collapseBreakpoint="none" data-testid="bare" isCollapsible>
        <SideNavItem data-testid="bare-1" icon={Home} label="Home" />
        <SideNavItem data-testid="bare-2" icon={Inbox} label="Inbox" />
        <SideNavItem data-testid="bare-3" icon={Settings} label="Settings" />
      </SideNav>,
    );
  }

  it('pads a run of items without a section like a section pads its items', () => {
    renderSectionOnlyNav();
    const sectionTop = rect('first-1').top - rect('first').top;
    const sectionBottom = rect('first').bottom - rect('first-2').bottom;
    expect(sectionTop).toBe(4);
    expect(sectionBottom).toBe(4);

    renderBareNav();
    expect(rect('bare-1').top - rect('bare-scrollable').top).toBe(sectionTop);
    expect(rect('bare-scrollable').bottom - rect('bare-3').bottom).toBe(
      sectionBottom,
    );
  });

  it('pads the last item without a section above bottom content', () => {
    render(
      <SideNav bottomContent={<div data-testid="bottom">Help</div>}>
        <SideNavItem data-testid="item-1" icon={Home} label="Home" />
        <SideNavItem data-testid="item-2" icon={Inbox} label="Inbox" />
      </SideNav>,
    );

    expect(gapBetween('item-2', 'bottom')).toBe(4);
  });

  it('leaves a nav built only from sections unchanged', () => {
    renderSectionOnlyNav();

    expect(rect('first').top).toBe(rect('sections-scrollable').top);
    expect(gapBetween('first', 'second')).toBe(0);
    expect(rect('second').bottom).toBe(rect('sections-scrollable').bottom);
  });

  it('adds no padding around items without a section when collapsed', async () => {
    renderBareNav();
    fireEvent.click(screen.getByRole('button', {name: 'Collapse sidebar'}));
    await expect
      .poll(() => screen.queryByRole('button', {name: 'Expand sidebar'}))
      .not.toBeNull();

    // Collapsed mode is unchanged: bare items keep no padding, matching the
    // `py: 0` SideNavSection asks for when collapsed.
    expect(rect('bare-1').top - rect('bare-scrollable').top).toBe(0);
    expect(rect('bare-scrollable').bottom - rect('bare-3').bottom).toBe(0);
  });
});
