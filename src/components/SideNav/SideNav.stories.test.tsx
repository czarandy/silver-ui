import {composeStories} from '@storybook/react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import * as stories from 'components/SideNav/SideNav.stories';

const {WithFooter} = composeStories(stories);

describe('SideNav stories', () => {
  it('shows footer content and footer icons together', () => {
    render(<WithFooter />);

    expect(screen.getByRole('img', {name: 'Ada Lovelace'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Notifications'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Help'})).toBeInTheDocument();
  });
});
