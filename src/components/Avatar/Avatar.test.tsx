import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Check} from 'lucide-react';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {Avatar} from 'components/Avatar/Avatar';
import {AvatarStatusDot} from 'components/Avatar/AvatarStatusDot';
import {AvatarGroup} from 'components/AvatarGroup';
import {assertNonNull, createPopoverFocusShim} from 'internal/testHelpers';

const shim = createPopoverFocusShim();

beforeAll(shim.install);
afterAll(shim.uninstall);
beforeEach(shim.reset);

describe('Avatar', () => {
  it('renders initials from the provided name', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" />);

    expect(screen.getByTestId('avatar')).toHaveAttribute(
      'aria-label',
      'Ada Lovelace',
    );
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it.each([
    ['a surrogate-pair emoji', '😀 Rivera', '😀R'],
    ['a zero-width joiner emoji', '🧑‍🚀 Alice Smith', '🧑‍🚀S'],
    ['a decomposed character', 'N\u0303oño', 'N\u0303'],
  ])('keeps %s intact in initials', (_description, name, expectedInitials) => {
    render(<Avatar name={name} />);

    expect(screen.getByText(expectedInitials)).toBeInTheDocument();
  });

  it('nudges initials up with bottom padding', () => {
    render(<Avatar name="Ada Lovelace" />);

    expect(screen.getByText('AL')).toHaveClass('silver-pb_1px');
  });

  it('increases initials bottom padding at 96px and larger', () => {
    render(
      <>
        <Avatar name="Ada Lovelace" size={72} />
        <Avatar name="Grace Hopper" size={96} />
        <Avatar name="Katherine Johnson" size="large" />
      </>,
    );

    expect(screen.getByText('AL')).toHaveClass('silver-pb_1px');
    expect(screen.getByText('GH')).toHaveClass('silver-pb_2px');
    expect(screen.getByText('KJ')).toHaveClass('silver-pb_2px');
  });

  it('adds top padding to the content at exactly 24px', () => {
    render(
      <>
        <Avatar data-testid="numeric-24" name="Ada Lovelace" size={24} />
        <Avatar data-testid="xsmall" name="Grace Hopper" size="xsmall" />
        <Avatar data-testid="numeric-20" name="Katherine Johnson" size={20} />
        <Avatar data-testid="numeric-32" name="Alan Turing" size={32} />
      </>,
    );

    const getContent = (testId: string): Element => {
      // eslint-disable-next-line testing-library/no-node-access -- content is an intentionally private, presentational element
      return assertNonNull(screen.getByTestId(testId).firstElementChild);
    };

    expect(getContent('numeric-24')).toHaveClass('silver-pt_1px');
    expect(getContent('xsmall')).toHaveClass('silver-pt_1px');
    expect(getContent('numeric-20')).not.toHaveClass('silver-pt_1px');
    expect(getContent('numeric-32')).not.toHaveClass('silver-pt_1px');
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

    expect(screen.getByTestId('status')).toHaveClass(
      'silver---status-dot-size_20px',
    );
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

  it('forwards unrecognized props to the root element', async () => {
    const user = userEvent.setup();
    const onMouseEnter = vi.fn();

    render(
      <Avatar
        data-analytics="avatar"
        data-testid="avatar"
        id="user-ada"
        name="Ada Lovelace"
        onMouseEnter={onMouseEnter}
        tabIndex={0}
        title="Ada Lovelace"
      />,
    );

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-analytics', 'avatar');
    expect(avatar).toHaveAttribute('id', 'user-ada');
    expect(avatar).toHaveAttribute('tabindex', '0');
    expect(avatar).toHaveAttribute('title', 'Ada Lovelace');

    await user.hover(avatar);
    expect(onMouseEnter).toHaveBeenCalledOnce();
  });

  it('does not let forwarded props clobber the semantic role', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" role="button" />);

    expect(screen.getByTestId('avatar')).toHaveAttribute('role', 'img');
  });

  it('resets image error state when src changes', () => {
    const {rerender} = render(<Avatar data-testid="avatar" src="/old.png" />);

    const avatar = screen.getByTestId('avatar');
    // eslint-disable-next-line testing-library/no-node-access -- presentational img (alt="") has no accessible role
    const img = assertNonNull(avatar.querySelector('img'));
    fireEvent.error(img);
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

  it('applies the surface color from an explicit color prop', () => {
    render(<Avatar color="blue" name="Ada Lovelace" />);

    expect(screen.getByText('AL')).toHaveClass('silver-bg_surface.blue');
  });

  it('derives a deterministic surface color from the name', () => {
    const {rerender} = render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText('AL')).toHaveClass('silver-bg_surface.pink');

    // Same name resolves to the same color on re-render.
    rerender(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText('AL')).toHaveClass('silver-bg_surface.pink');

    // A different name resolves to a different, stable color.
    rerender(<Avatar name="Katherine Johnson" />);
    expect(screen.getByText('KJ')).toHaveClass('silver-bg_surface.blue');
  });

  it('uses gray when there are no initials to color', () => {
    render(<Avatar data-testid="avatar" />);

    // eslint-disable-next-line testing-library/no-node-access -- inner content div has no role or testid
    expect(screen.getByTestId('avatar').firstElementChild).toHaveClass(
      'silver-bg_surface.gray',
    );
  });

  it('lets an explicit color override the name-derived color', () => {
    render(<Avatar color="green" name="Ada Lovelace" />);

    const fallback = screen.getByText('AL');
    expect(fallback).toHaveClass('silver-bg_surface.green');
    expect(fallback).not.toHaveClass('silver-bg_surface.pink');
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

  describe('hasTooltip', () => {
    it('renders no tooltip by default', () => {
      render(<Avatar data-testid="avatar" name="Ada Lovelace" />);

      expect(
        screen.queryByRole('tooltip', {hidden: true}),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar')).not.toHaveAttribute('tabindex');
      expect(screen.getByTestId('avatar')).not.toHaveAttribute(
        'aria-describedby',
      );
    });

    it('describes the avatar with a tooltip holding the name', () => {
      render(<Avatar data-testid="avatar" hasTooltip name="Ada Lovelace" />);

      const tooltip = screen.getByRole('tooltip', {hidden: true});
      expect(tooltip).toHaveTextContent('Ada Lovelace');
      expect(screen.getByTestId('avatar')).toHaveAttribute(
        'aria-describedby',
        tooltip.getAttribute('id'),
      );
    });

    it('shows the tooltip on hover', async () => {
      render(<Avatar data-testid="avatar" hasTooltip name="Ada Lovelace" />);

      const avatar = screen.getByTestId('avatar');
      const tooltip = screen.getByRole('tooltip', {hidden: true});
      fireEvent.mouseEnter(avatar);

      await waitFor(() => {
        expect(shim.isPopoverOpen(tooltip)).toBe(true);
      });

      fireEvent.mouseLeave(avatar);

      await waitFor(() => {
        expect(shim.isPopoverOpen(tooltip)).toBe(false);
      });
    });

    it('makes the avatar focusable and opens the tooltip on keyboard focus', async () => {
      const user = userEvent.setup();

      render(<Avatar data-testid="avatar" hasTooltip name="Ada Lovelace" />);

      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('tabindex', '0');

      await user.tab();
      expect(avatar).toHaveFocus();

      await waitFor(() => {
        expect(
          shim.isPopoverOpen(screen.getByRole('tooltip', {hidden: true})),
        ).toBe(true);
      });
    });

    it('ignores pointer focus that is not focus-visible', () => {
      shim.setFocusVisible(false);

      render(<Avatar data-testid="avatar" hasTooltip name="Ada Lovelace" />);

      fireEvent.focusIn(screen.getByTestId('avatar'));

      expect(
        shim.isPopoverOpen(screen.getByRole('tooltip', {hidden: true})),
      ).toBe(false);
    });

    it.each([
      ['no name', undefined],
      ['a whitespace-only name', '   '],
    ])('ignores hasTooltip with %s', (_label, name) => {
      render(<Avatar data-testid="avatar" hasTooltip name={name} />);

      expect(
        screen.queryByRole('tooltip', {hidden: true}),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar')).not.toHaveAttribute('tabindex');
    });

    it('keeps a consumer tabIndex and aria-describedby', () => {
      render(
        <Avatar
          aria-describedby="external-help"
          data-testid="avatar"
          hasTooltip
          name="Ada Lovelace"
          tabIndex={-1}
        />,
      );

      const avatar = screen.getByTestId('avatar');
      const tooltipId = screen
        .getByRole('tooltip', {hidden: true})
        .getAttribute('id');
      expect(avatar).toHaveAttribute('tabindex', '-1');
      expect(avatar).toHaveAttribute(
        'aria-describedby',
        `external-help ${tooltipId}`,
      );
    });

    it('keeps grouped avatars as siblings so the overlap selector still matches', () => {
      render(
        <AvatarGroup>
          <Avatar data-testid="first" hasTooltip name="Ada Lovelace" />
          <Avatar data-testid="second" hasTooltip name="Grace Hopper" />
        </AvatarGroup>,
      );

      const first = screen.getByTestId('first');
      const second = screen.getByTestId('second');
      expect(first.matches(':first-child')).toBe(true);
      expect(second.matches(':not(:first-child)')).toBe(true);
      // eslint-disable-next-line testing-library/no-node-access -- the overlap margin depends on avatars being direct children of the group
      expect(first.parentElement).toBe(second.parentElement);
    });
  });
});
