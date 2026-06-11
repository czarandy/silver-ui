import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Settings} from 'lucide-react';
import type {ComponentPropsWithRef, SVGProps} from 'react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Badge} from '../Badge';
import {Tab} from './Tab';
import {TabMenu} from './TabMenu';
import {Tabs} from './Tabs';

function RouterLink({
  children,
  ref,
  to,
  ...props
}: ComponentPropsWithRef<'a'> & {to?: string}): React.JSX.Element {
  return (
    <a data-to={to} ref={ref} {...props}>
      {children}
    </a>
  );
}

function DefaultIcon(props: SVGProps<SVGSVGElement>): React.JSX.Element {
  return <svg {...props} data-testid="default-icon" />;
}

function SelectedIcon(props: SVGProps<SVGSVGElement>): React.JSX.Element {
  return <svg {...props} data-testid="selected-icon" />;
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.setAttribute('popover-open', '');
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.removeAttribute('popover-open');
    },
  });
});

describe('Tabs', () => {
  it('calls onChange when a tab is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Tabs onChange={onChange} value="overview">
        <Tab label="Overview" value="overview" />
        <Tab label="Settings" value="settings" />
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', {name: 'Settings'}));
    expect(onChange).toHaveBeenCalledWith('settings');
  });

  it('uses tablist and tab semantics', () => {
    render(
      <Tabs onChange={() => {}} value="settings">
        <Tab label="Overview" value="overview" />
        <Tab
          endContent={<Badge label="New" />}
          icon={Settings}
          label="Settings"
          value="settings"
        />
      </Tabs>,
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /Settings/})).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', {name: 'Overview'})).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.getByRole('tab', {name: /Settings/})).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('sets the tablist label and forwards test IDs', () => {
    render(
      <Tabs
        data-testid="tabs"
        label="Project sections"
        onChange={() => {}}
        value="overview">
        <Tab data-testid="overview-tab" label="Overview" value="overview" />
      </Tabs>,
    );

    expect(screen.getByRole('tablist')).toHaveAttribute(
      'aria-label',
      'Project sections',
    );
    expect(screen.getByTestId('tabs')).toBe(screen.getByRole('tablist'));
    expect(screen.getByTestId('overview-tab')).toBe(
      screen.getByRole('tab', {name: 'Overview'}),
    );
  });

  it('applies divider, fill layout, and size styling', () => {
    render(
      <>
        <Tabs onChange={() => {}} value="default">
          <Tab data-testid="default-tab" label="Default" value="default" />
        </Tabs>
        <Tabs
          data-testid="styled-tabs"
          hasDivider
          layout="fill"
          onChange={() => {}}
          size="lg"
          value="styled">
          <Tab data-testid="styled-tab" label="Styled" value="styled" />
        </Tabs>
      </>,
    );

    expect(screen.getByTestId('styled-tabs')).not.toHaveAttribute(
      'class',
      screen.getAllByRole('tablist')[0]?.getAttribute('class') ?? '',
    );
    expect(screen.getByTestId('styled-tab')).not.toHaveAttribute(
      'class',
      screen.getByTestId('default-tab').getAttribute('class') ?? '',
    );
  });

  it('links tabs to consumer-rendered panels with controls', () => {
    render(
      <>
        <Tabs onChange={() => {}} value="settings">
          <Tab
            controls="overview-panel"
            id="overview-tab"
            label="Overview"
            value="overview"
          />
          <Tab
            controls="settings-panel"
            id="settings-tab"
            label="Settings"
            value="settings"
          />
        </Tabs>
        <div
          aria-labelledby="overview-tab"
          hidden
          id="overview-panel"
          role="tabpanel">
          Overview content
        </div>
        <div aria-labelledby="settings-tab" id="settings-panel" role="tabpanel">
          Settings content
        </div>
      </>,
    );

    const tab = screen.getByRole('tab', {name: 'Settings'});
    const panel = screen.getByRole('tabpanel', {name: 'Settings'});

    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', 'settings-tab');
    expect(screen.getByText('Overview content')).not.toBeVisible();
    expect(screen.getByText('Settings content')).toBeVisible();
  });

  it('uses the selected tab as the only tab stop', () => {
    render(
      <Tabs onChange={() => {}} value="settings">
        <Tab label="Overview" value="overview" />
        <Tab label="Settings" value="settings" />
      </Tabs>,
    );

    expect(screen.getByRole('tab', {name: 'Overview'})).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(screen.getByRole('tab', {name: 'Settings'})).toHaveAttribute(
      'tabindex',
      '0',
    );
  });

  it('renders href tabs as anchors', () => {
    render(
      <Tabs onChange={() => {}} value="docs">
        <Tab href="/docs" label="Docs" value="docs" />
      </Tabs>,
    );

    const tab = screen.getByRole('tab', {name: 'Docs'});
    expect(tab.tagName).toBe('A');
    expect(tab).toHaveAttribute('href', '/docs');
  });

  it('uses a custom link component for href tabs', () => {
    render(
      <Tabs onChange={() => {}} value="docs">
        <Tab as={RouterLink} href="/docs" label="Docs" value="docs" />
      </Tabs>,
    );

    expect(screen.getByRole('tab', {name: 'Docs'})).toHaveAttribute(
      'data-to',
      '/docs',
    );
  });

  it('renders end content and swaps to the selected icon', () => {
    render(
      <Tabs onChange={() => {}} value="settings">
        <Tab
          endContent={<Badge label="New" />}
          icon={DefaultIcon}
          label="Settings"
          selectedIcon={SelectedIcon}
          value="settings"
        />
      </Tabs>,
    );

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByTestId('selected-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('default-icon')).not.toBeInTheDocument();
  });

  it('supports arrow, home, and end keyboard navigation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Tabs onChange={onChange} value="overview">
        <Tab label="Overview" value="overview" />
        <Tab label="Activity" value="activity" />
        <Tab label="Settings" value="settings" />
      </Tabs>,
    );

    screen.getByRole('tab', {name: 'Overview'}).focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', {name: 'Activity'})).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('activity');

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', {name: 'Settings'})).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('settings');

    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', {name: 'Overview'})).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('overview');
  });

  it('prevents selecting disabled tabs and skips them during keyboard navigation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Tabs onChange={onChange} value="overview">
        <Tab label="Overview" value="overview" />
        <Tab isDisabled label="Activity" value="activity" />
        <Tab label="Settings" value="settings" />
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', {name: 'Activity'}));
    expect(onChange).not.toHaveBeenCalled();

    screen.getByRole('tab', {name: 'Overview'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', {name: 'Settings'})).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('settings');
  });

  it('adds menu trigger state and keyboard navigation for TabMenu', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Tabs onChange={onChange} value="overview">
        <Tab label="Overview" value="overview" />
        <TabMenu
          label="More"
          options={[
            {label: 'Analytics', value: 'analytics'},
            {label: 'Reports', value: 'reports'},
          ]}
        />
      </Tabs>,
    );

    const trigger = screen.getByRole('tab', {name: /More/});
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    const analytics = screen.getByRole('menuitem', {
      hidden: true,
      name: 'Analytics',
    });
    const reports = screen.getByRole('menuitem', {
      hidden: true,
      name: 'Reports',
    });
    analytics.focus();

    fireEvent.keyDown(analytics, {key: 'ArrowDown'});
    expect(reports).toHaveFocus();

    fireEvent.keyDown(reports, {key: 'Escape'});
    expect(trigger).toHaveFocus();
  });

  it('moves to the first and last TabMenu items with Home and End', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Tabs onChange={onChange} value="overview">
        <Tab label="Overview" value="overview" />
        <TabMenu
          label="More"
          options={[
            {label: 'Analytics', value: 'analytics'},
            {label: 'Reports', value: 'reports'},
            {label: 'Audience', value: 'audience'},
          ]}
        />
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', {name: /More/}));

    const analytics = screen.getByRole('menuitem', {
      hidden: true,
      name: 'Analytics',
    });
    const audience = screen.getByRole('menuitem', {
      hidden: true,
      name: 'Audience',
    });
    analytics.focus();

    fireEvent.keyDown(analytics, {key: 'End'});
    expect(audience).toHaveFocus();

    fireEvent.keyDown(audience, {key: 'Home'});
    expect(analytics).toHaveFocus();
  });

  it('selects a TabMenu option and closes the menu', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Tabs onChange={onChange} value="overview">
        <Tab label="Overview" value="overview" />
        <TabMenu
          label="More"
          options={[
            {label: 'Analytics', value: 'analytics'},
            {label: 'Reports', value: 'reports'},
          ]}
        />
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', {name: /More/}));
    await user.click(
      screen.getByRole('menuitem', {hidden: true, name: 'Analytics'}),
    );

    expect(onChange).toHaveBeenCalledWith('analytics');
    await waitFor(() => {
      expect(screen.getByRole('tab', {name: /More/})).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });
  });

  it('marks a TabMenu trigger selected when its current option is selected', () => {
    render(
      <Tabs onChange={() => {}} value="analytics">
        <Tab label="Overview" value="overview" />
        <TabMenu
          label="More"
          options={[
            {label: 'Analytics', value: 'analytics'},
            {label: 'Reports', value: 'reports'},
          ]}
        />
      </Tabs>,
    );

    const trigger = screen.getByRole('tab', {name: /Analytics/});
    expect(trigger).toHaveAttribute('aria-selected', 'true');
    expect(trigger).toHaveAttribute('tabindex', '0');
    expect(trigger).not.toHaveAttribute('aria-current');
  });

  it('disables TabMenu triggers', async () => {
    const user = userEvent.setup();

    render(
      <Tabs onChange={() => {}} value="overview">
        <Tab label="Overview" value="overview" />
        <TabMenu
          isDisabled
          label="More"
          options={[{label: 'Analytics', value: 'analytics'}]}
        />
      </Tabs>,
    );

    const trigger = screen.getByRole('tab', {name: /More/});
    expect(trigger).toHaveAttribute('aria-disabled', 'true');

    await user.click(trigger);
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('forwards refs for Tabs, Tab, and TabMenu', () => {
    const tabsRef = {current: null as HTMLDivElement | null};
    const tabRef = {current: null as HTMLElement | null};
    const tabMenuRef = {current: null as HTMLButtonElement | null};

    render(
      <Tabs onChange={() => {}} ref={tabsRef} value="overview">
        <Tab label="Overview" ref={tabRef} value="overview" />
        <TabMenu
          label="More"
          options={[{label: 'Analytics', value: 'analytics'}]}
          ref={tabMenuRef}
        />
      </Tabs>,
    );

    expect(tabsRef.current).toBe(screen.getByRole('tablist'));
    expect(tabRef.current).toBe(screen.getByRole('tab', {name: 'Overview'}));
    expect(tabMenuRef.current).toBe(screen.getByRole('tab', {name: /More/}));
  });

  it('throws when a tab child is used outside Tabs', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => render(<Tab label="Overview" value="overview" />)).toThrow(
      'Tabs children must be used within a Tabs.',
    );

    consoleError.mockRestore();
  });

  it('fires onChange when the selected tab is clicked again', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Tabs onChange={onChange} value="overview">
        <Tab label="Overview" value="overview" />
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', {name: 'Overview'}));
    await user.click(screen.getByRole('tab', {name: 'Overview'}));

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 'overview');
    expect(onChange).toHaveBeenNthCalledWith(2, 'overview');
  });
});
