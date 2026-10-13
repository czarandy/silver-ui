import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';
import {Button} from 'components/Button/Button';
import {Theme} from 'components/Theme';

describe('Button outline appearance', () => {
  it.each([
    ['light', 'sm'],
    ['light', 'md'],
    ['light', 'lg'],
    ['dark', 'sm'],
    ['dark', 'md'],
    ['dark', 'lg'],
  ] as const)(
    'uses the primary color and keeps the shared height in %s mode at size %s',
    (mode, size) => {
      render(
        <Theme mode={mode}>
          <Button label="Primary" size={size} variant="primary" />
          <Button label="Your Privacy Choices" size={size} variant="outline" />
        </Theme>,
      );

      const primary = screen.getByRole('button', {name: 'Primary'});
      const outline = screen.getByRole('button', {
        name: 'Your Privacy Choices',
      });
      const primaryStyles = getComputedStyle(primary);
      const outlineStyles = getComputedStyle(outline);

      expect(outlineStyles.color).toBe(primaryStyles.backgroundColor);
      expect(outlineStyles.borderTopColor).toBe(primaryStyles.backgroundColor);
      expect(outlineStyles.borderTopWidth).toBe('1px');
      expect(outlineStyles.borderTopStyle).toBe('solid');
      expect(outlineStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(outline.getBoundingClientRect().height).toBe(
        primary.getBoundingClientRect().height,
      );
      expect(outlineStyles.borderRadius).toBe(primaryStyles.borderRadius);
    },
  );

  it('follows theme and surrounding surface overrides of the primary color', () => {
    const surfaceStyle: React.CSSProperties & {
      '--silver-button-primary-bg': string;
    } = {
      '--silver-button-primary-bg': '#654321',
    };
    const {rerender} = render(
      <Theme tokens={{colors: {primary: '#44666c'}}}>
        <Button label="Primary" variant="primary" />
        <Button label="Outline" variant="outline" />
      </Theme>,
    );

    expect(
      getComputedStyle(screen.getByRole('button', {name: 'Outline'})).color,
    ).toBe('rgb(68, 102, 108)');

    rerender(
      <div style={surfaceStyle}>
        <Button label="Primary" variant="primary" />
        <Button label="Outline" variant="outline" />
      </div>,
    );

    const primaryColor = getComputedStyle(
      screen.getByRole('button', {name: 'Primary'}),
    ).backgroundColor;
    const outlineStyles = getComputedStyle(
      screen.getByRole('button', {name: 'Outline'}),
    );
    expect(outlineStyles.color).toBe(primaryColor);
    expect(outlineStyles.borderTopColor).toBe(primaryColor);
  });

  it('tints the background on hover and shows the keyboard focus ring', async () => {
    render(<Button label="Outline" variant="outline" />);

    const button = screen.getByRole('button', {name: 'Outline'});
    await userEvent.hover(button);

    await expect
      .poll(() => getComputedStyle(button).backgroundColor)
      .not.toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(button).borderTopColor).toBe(
      getComputedStyle(button).color,
    );

    await userEvent.tab();

    expect(button).toHaveFocus();
    expect(getComputedStyle(button).outlineStyle).toBe('solid');
    expect(getComputedStyle(button).outlineWidth).toBe('2px');
    expect(getComputedStyle(button).outlineColor).toBe(
      getComputedStyle(button).color,
    );
  });
});
