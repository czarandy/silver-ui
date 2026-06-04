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
        data-testid="avatar"
        fallbackSrc="/fallback.png"
        name="Ada Lovelace"
        src="/avatar.png"
      />,
    );

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
    const img = screen.getByAltText('');
    expect(img).toHaveAttribute('src', '/avatar.png');
    fireEvent.error(img);

    const fallbackImg = screen.getByAltText('');
    expect(fallbackImg).toHaveAttribute('src', '/fallback.png');
  });

  it('renders a default icon when no image or name is provided', () => {
    render(<Avatar data-testid="avatar" />);

    expect(screen.getByTestId('avatar')).toHaveAccessibleName('Avatar');
  });

  it('falls back to the default icon when name is only whitespace', () => {
    render(<Avatar data-testid="avatar" name="   " />);

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

  it('resets image error state when src changes', () => {
    const {rerender} = render(<Avatar data-testid="avatar" src="/old.png" />);

    const avatar = screen.getByTestId('avatar');
    // eslint-disable-next-line testing-library/no-node-access -- presentational img (alt="") has no accessible role
    const img = avatar.querySelector('img');
    fireEvent.error(img!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    // eslint-disable-next-line testing-library/no-node-access
    expect(avatar.querySelector('img')).toBeNull();

    rerender(<Avatar data-testid="avatar" src="/new.png" />);

    // eslint-disable-next-line testing-library/no-node-access
    expect(avatar.querySelector('img')).toHaveAttribute('src', '/new.png');
  });

  it('applies numeric size as pixel dimensions', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" size={64} />);

    // eslint-disable-next-line testing-library/no-node-access -- inner content div has no role or testid
    expect(screen.getByTestId('avatar').firstElementChild).toHaveStyle({
      width: '64px',
      height: '64px',
    });
  });

  it('warns in development when AvatarStatusDot icon is not visible at small sizes', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <Avatar
        name="Ada Lovelace"
        size="small"
        status={<AvatarStatusDot icon={<Check />} label="Verified" />}
      />,
    );

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('icon'));

    warnSpy.mockRestore();
  });
});
