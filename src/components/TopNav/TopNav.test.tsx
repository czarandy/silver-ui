import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {TopNav} from './TopNav';
import {TopNavHeading} from './TopNavHeading';
import {TopNavItem} from './TopNavItem';

describe('TopNav', () => {
  it('renders heading, start content, and end content', () => {
    render(
      <TopNav
        endContent={<button type="button">Settings</button>}
        heading={<TopNavHeading heading="Silver" />}
        label="Main navigation">
        <TopNavItem href="/home" label="Home" />
      </TopNav>,
    );

    expect(
      screen.getByRole('navigation', {name: 'Main navigation'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Silver')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'href',
      '/home',
    );
    expect(screen.getByRole('button', {name: 'Settings'})).toBeInTheDocument();
  });
});
