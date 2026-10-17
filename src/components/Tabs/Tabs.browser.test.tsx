import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import {Tab} from 'components/Tabs/Tab';
import {TabMenu} from 'components/Tabs/TabMenu';
import {Tabs} from 'components/Tabs/Tabs';

// Real-layout tests for tabs wider than their container. jsdom has no layout,
// so it cannot show whether the row overflows, scrolls, or clips.

function renderInWidth(width: number): void {
  render(
    <div data-testid="container" style={{width, overflow: 'visible'}}>
      <Tabs hasDivider onChange={() => {}} value="upcoming">
        <Tab label="Upcoming (12)" value="upcoming" />
        <Tab label="Past" value="past" />
        <Tab label="Canceled" value="canceled" />
        <TabMenu
          label="More"
          options={[{label: 'Archived', value: 'archived'}]}
        />
      </Tabs>
    </div>,
  );
}

describe('Tabs wider than their container', () => {
  it('scroll inside the tab row instead of overflowing it', () => {
    renderInWidth(200);

    const tablist = screen.getByRole('tablist');
    const container = screen.getByTestId('container');
    expect(tablist.scrollWidth).toBeGreaterThan(tablist.clientWidth);
    expect(tablist.getBoundingClientRect().right).toBeLessThanOrEqual(
      container.getBoundingClientRect().right,
    );
    // Only sideways: the underline and divider fit without a vertical scroll.
    expect(tablist.scrollHeight).toBe(tablist.clientHeight);
  });

  it('keep the selected underline inside the row, where it is not clipped', () => {
    renderInWidth(200);

    const tablist = screen.getByRole('tablist').getBoundingClientRect();
    const selected = screen
      .getByRole('tab', {name: 'Upcoming (12)'})
      .getBoundingClientRect();
    expect(selected.bottom).toBeCloseTo(tablist.bottom, 0);
  });

  it('take the same space without a divider, the underline hanging below', () => {
    render(
      <div>
        <Tabs onChange={() => {}} value="past">
          <Tab label="Past" value="past" />
        </Tabs>
        <p>Next</p>
      </div>,
    );

    const tab = screen.getByRole('tab', {name: 'Past'}).getBoundingClientRect();
    const next = screen.getByText('Next').getBoundingClientRect();
    // As before the row could scroll: the underline overlaps what follows.
    expect(next.top - tab.top).toBeCloseTo(tab.height - 2, 0);
  });

  it('open a tab menu above the scrolling row rather than clipped by it', async () => {
    renderInWidth(200);

    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', {name: /More/}));
    const item = await screen.findByRole('menuitem', {name: 'Archived'});
    const box = item.getBoundingClientRect();
    expect(
      document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2,
      ),
    ).toSatisfy(element => item.contains(element as Node));
  });
});
