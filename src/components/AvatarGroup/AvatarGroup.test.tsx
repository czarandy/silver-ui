import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Avatar, AvatarStatusDot} from '../Avatar';
import {AvatarGroup} from './AvatarGroup';
import {AvatarGroupOverflow} from './AvatarGroupOverflow';

describe('AvatarGroup', () => {
  it('renders a labelled group', () => {
    render(
      <AvatarGroup aria-label="Team">
        <Avatar name="Ada Lovelace" />
      </AvatarGroup>,
    );

    expect(screen.getByRole('group', {name: 'Team'})).toBeInTheDocument();
  });

  it('defaults the group accessible name', () => {
    render(
      <AvatarGroup>
        <Avatar name="Ada Lovelace" />
      </AvatarGroup>,
    );

    expect(screen.getByRole('group', {name: 'Avatars'})).toBeInTheDocument();
  });

  it('applies the group size to child avatars', () => {
    render(
      <AvatarGroup size="medium">
        <Avatar
          name="Ada Lovelace"
          size="tiny"
          status={<AvatarStatusDot data-testid="status" label="Online" />}
        />
      </AvatarGroup>,
    );

    expect(screen.getByTestId('status')).toHaveStyle({
      height: '20px',
      width: '20px',
    });
  });

  it('renders overflow as a static indicator', () => {
    render(
      <AvatarGroup>
        <Avatar name="Ada Lovelace" />
        <AvatarGroupOverflow count={3} />
      </AvatarGroup>,
    );

    expect(screen.getByLabelText('3 more')).toHaveTextContent('+3');
  });

  it('renders overflow as a button when onClick is provided', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <AvatarGroup>
        <Avatar name="Ada Lovelace" />
        <AvatarGroupOverflow count={3} onClick={onClick} />
      </AvatarGroup>,
    );

    await user.click(screen.getByRole('button', {name: '3 more'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('supports custom overflow content', () => {
    render(<AvatarGroupOverflow count={8}>More</AvatarGroupOverflow>);

    expect(screen.getByLabelText('8 more')).toHaveTextContent('More');
  });

  it('applies className, style, data-testid, and ref to the group root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <AvatarGroup
        className="custom-group"
        data-testid="group"
        ref={ref}
        style={{color: 'red'}}>
        <Avatar name="Ada Lovelace" />
      </AvatarGroup>,
    );

    const group = screen.getByTestId('group');
    expect(group).toHaveClass('custom-group');
    expect(group).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
