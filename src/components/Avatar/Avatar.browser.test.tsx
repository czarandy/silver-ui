import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Avatar, AvatarStatusDot} from 'components/Avatar';
import {AvatarGroup} from 'components/AvatarGroup';
import {Theme} from 'components/Theme';
import {assertNonNull} from 'internal/testHelpers';

const imageSrc =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="16"%3E%3Crect width="16" height="16" fill="teal"/%3E%3C/svg%3E';
const shapes = [
  ['circle', '9999px'],
  ['rounded', '8px'],
  ['square', '0px'],
] as const;

describe.each(shapes)('Avatar %s shape', (shape, radius) => {
  it.each([
    ['tiny', 20],
    ['xsmall', 24],
    ['small', 36],
    ['medium', 48],
    ['large', 128],
    [16, 16],
    [20, 20],
    [24, 24],
    [32, 32],
    [36, 36],
    [40, 40],
    [48, 48],
    [60, 60],
    [64, 64],
    [72, 72],
    [96, 96],
    [128, 128],
    [144, 144],
    [180, 180],
  ] as const)(
    'clips image, initials, and icon content at size %s without changing dimensions',
    async (size, pixels) => {
      render(
        <>
          <Avatar
            name="Image avatar"
            shape={shape}
            size={size}
            src={imageSrc}
          />
          <Avatar name="Ada Lovelace" shape={shape} size={size} />
          <Avatar alt="Default icon" shape={shape} size={size} />
        </>,
      );

      const image = screen.getByAltText<HTMLImageElement>('');
      await expect.poll(() => image.naturalWidth).toBe(16);
      expect(screen.getByText('AL')).toBeInTheDocument();

      for (const name of ['Image avatar', 'Ada Lovelace', 'Default icon']) {
        const avatar = screen.getByRole('img', {name});
        // eslint-disable-next-line testing-library/no-node-access -- content is the private clipping surface
        const content = assertNonNull(avatar.firstElementChild);
        expect(getComputedStyle(avatar).borderRadius).toBe(radius);
        expect(getComputedStyle(content).borderRadius).toBe(radius);
        expect(getComputedStyle(content).overflow).toBe('hidden');
        expect(content.getBoundingClientRect().width).toBe(pixels);
        expect(content.getBoundingClientRect().height).toBe(pixels);
        expect(avatar.getBoundingClientRect().width).toBe(pixels);
        expect(avatar.getBoundingClientRect().height).toBe(pixels);
        expect(avatar).not.toHaveAttribute('shape');
      }
    },
  );

  it('keeps the shape and separator border inside AvatarGroup', () => {
    render(
      <AvatarGroup size="medium">
        <Avatar name="Ada Lovelace" shape={shape} size="tiny" />
        <Avatar name="Grace Hopper" shape={shape} />
      </AvatarGroup>,
    );

    for (const name of ['Ada Lovelace', 'Grace Hopper']) {
      const avatar = screen.getByRole('img', {name});
      const styles = getComputedStyle(avatar);
      expect(styles.borderRadius).toBe(radius);
      expect(styles.borderTopWidth).toBe('2px');
      expect(styles.borderTopStyle).toBe('solid');
      expect(avatar.getBoundingClientRect().width).toBe(52);
      // eslint-disable-next-line testing-library/no-node-access -- content is the private clipping surface
      const content = assertNonNull(avatar.firstElementChild);
      expect(content.getBoundingClientRect().width).toBe(48);
    }
    expect(
      getComputedStyle(screen.getByRole('img', {name: 'Grace Hopper'}))
        .marginInlineStart,
    ).toBe('-12px');
  });

  it('positions status at the visible edge of the shape', () => {
    render(
      <Avatar
        name="Ada Lovelace"
        shape={shape}
        size="medium"
        status={<AvatarStatusDot label="Online" />}
      />,
    );
    const avatarBox = screen
      .getByRole('img', {name: 'Ada Lovelace'})
      .getBoundingClientRect();
    const statusBox = screen
      .getByRole('img', {name: 'Online'})
      .getBoundingClientRect();
    const expectedInset =
      shape === 'circle' ? (48 * (1 - 1 / Math.SQRT2)) / 2 : 0;

    expect(
      avatarBox.right - (statusBox.left + statusBox.width / 2),
    ).toBeCloseTo(expectedInset, 1);
    expect(
      avatarBox.bottom - (statusBox.top + statusBox.height / 2),
    ).toBeCloseTo(expectedInset, 1);
  });
});

describe('Avatar themed shapes', () => {
  it('uses the theme radius for rounded avatars', () => {
    render(
      <Theme tokens={{radii: {lg: '12px'}}}>
        <Avatar name="Silver Labs" shape="rounded" />
      </Theme>,
    );
    const avatar = screen.getByRole('img', {name: 'Silver Labs'});
    expect(getComputedStyle(avatar).borderRadius).toBe('12px');
    // eslint-disable-next-line testing-library/no-node-access -- content is the private clipping surface
    const content = assertNonNull(avatar.firstElementChild);
    expect(getComputedStyle(content).borderRadius).toBe('12px');
  });

  it.each(['light', 'dark'] as const)('keeps every shape in %s mode', mode => {
    render(
      <Theme mode={mode}>
        {shapes.map(([shape]) => (
          <Avatar key={shape} name={shape} shape={shape} />
        ))}
      </Theme>,
    );
    for (const [shape, radius] of shapes) {
      expect(
        getComputedStyle(screen.getByRole('img', {name: shape})).borderRadius,
      ).toBe(radius);
    }
  });
});
