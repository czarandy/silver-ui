import {composeStories} from '@storybook/react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import * as stories from 'components/SideNav/SideNav.stories';

const {ResponsiveInitialCollapse, WithActions, WithFooter} =
  composeStories(stories);

describe('SideNav stories', () => {
  it('demonstrates independent action buttons and a menu', async () => {
    const user = userEvent.setup();
    render(<WithActions />);
    await user.click(screen.getByRole('button', {name: 'Edit projects'}));
    expect(screen.getByRole('status', {name: 'Last action'})).toHaveTextContent(
      'Edit projects',
    );
    await user.click(screen.getByRole('button', {name: 'Inbox actions'}));
    await user.click(
      screen.getByRole('menuitem', {name: 'Archive inbox', hidden: true}),
    );
    expect(screen.getByRole('status', {name: 'Last action'})).toHaveTextContent(
      'Archive inbox',
    );
    await user.click(
      screen.getByRole('button', {name: 'Edit archived projects'}),
    );
    expect(screen.getByRole('status', {name: 'Last action'})).toHaveTextContent(
      'Edit archived projects',
    );
  });
  it('shows footer content and footer icons together', () => {
    render(<WithFooter />);

    expect(screen.getByRole('img', {name: 'Ada Lovelace'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Notifications'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Help'})).toBeInTheDocument();
  });

  it('demonstrates responsive initial collapse', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches: true}));

    render(<ResponsiveInitialCollapse />);

    expect(
      screen.getByRole('button', {name: 'Expand sidebar'}),
    ).toBeInTheDocument();
  });
});
