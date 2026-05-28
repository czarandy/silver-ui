import {fireEvent, render, screen} from '@testing-library/react';
import {Check} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {Avatar} from './Avatar';
import {AvatarStatusDot} from './AvatarStatusDot';

describe('Avatar', () => {
  it('renders initials from the provided name', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" />);

    expect(screen.getByTestId('avatar')).toHaveAttribute(
      'aria-label',
      'Ada Lovelace',
    );
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('uses alt as the accessible name when provided', () => {
    render(<Avatar alt="Profile photo" name="Ada Lovelace" />);

    expect(
      screen.getByRole('img', {name: 'Profile photo'}),
    ).toBeInTheDocument();
  });

  it('renders an image and falls back to fallbackSrc when it fails', () => {
    render(
      <Avatar
        fallbackSrc="/fallback.png"
        name="Ada Lovelace"
        src="/avatar.png"
      />,
    );

    fireEvent.error(screen.getByAltText('Ada Lovelace'));

    expect(screen.getByAltText('Ada Lovelace')).toHaveAttribute(
      'src',
      '/fallback.png',
    );
  });

  it('renders a default icon when no image or name is provided', () => {
    render(<Avatar data-testid="avatar" />);

    expect(screen.getByTestId('avatar')).toHaveAccessibleName('Avatar');
  });

  it('renders status content positioned on the avatar', () => {
    render(
      <Avatar
        name="Ada Lovelace"
        status={<AvatarStatusDot label="Online" variant="success" />}
      />,
    );

    expect(screen.getByRole('img', {name: 'Online'})).toBeInTheDocument();
  });

  it('renders status dot icons at medium avatar sizes', () => {
    render(
      <Avatar
        name="Ada Lovelace"
        size="medium"
        status={
          <AvatarStatusDot
            data-testid="status"
            icon={<Check data-testid="check" />}
            label="Verified"
          />
        }
      />,
    );

    expect(screen.getByTestId('status')).toHaveStyle({
      height: '20px',
      width: '20px',
    });
    expect(screen.getByTestId('check')).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Avatar
        className="custom-avatar"
        data-testid="avatar"
        name="Ada Lovelace"
        ref={ref}
        style={{color: 'red'}}
      />,
    );

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('custom-avatar');
    expect(avatar).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
