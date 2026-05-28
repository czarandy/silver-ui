import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Settings} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {Badge} from '../Badge';
import {Tab} from './Tab';
import {Tabs} from './Tabs';

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

    await user.click(screen.getByRole('button', {name: 'Settings'}));
    expect(onChange).toHaveBeenCalledWith('settings');
  });

  it('marks the selected tab as current', () => {
    render(
      <Tabs onChange={() => {}} value="settings">
        <Tab label="Overview" value="overview" />
        <Tab
          endContent={<Badge label="New" />}
          icon={<Settings />}
          label="Settings"
          value="settings"
        />
      </Tabs>,
    );

    expect(screen.getByRole('button', {name: /Settings/})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
