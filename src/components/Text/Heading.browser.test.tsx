import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Heading} from 'components/Text/Heading';
import {Text} from 'components/Text/Text';

describe('Heading weight', () => {
  it.each([
    ['normal', '400'],
    ['medium', '500'],
    ['semibold', '600'],
    ['bold', '700'],
    ['inherit', '500'],
  ] as const)(
    'applies the same %s weight as Text without changing heading size',
    (weight, expectedWeight) => {
      render(
        <div style={{fontWeight: 500}}>
          <Text data-testid="text" weight={weight}>
            Text
          </Text>
          <Heading level={2}>Default</Heading>
          <Heading level={2} weight={weight}>
            Explicit
          </Heading>
          <Heading level={2} maxLines={1} weight={weight}>
            Single line
          </Heading>
          <Heading level={2} maxLines={2} weight={weight}>
            Multiple lines
          </Heading>
        </div>,
      );

      const defaultStyles = getComputedStyle(
        screen.getByRole('heading', {name: 'Default'}),
      );
      expect(defaultStyles.fontWeight).toBe('600');
      expect(getComputedStyle(screen.getByTestId('text')).fontWeight).toBe(
        expectedWeight,
      );
      for (const name of ['Explicit', 'Single line', 'Multiple lines']) {
        const styles = getComputedStyle(
          screen.getByRole('heading', {level: 2, name}),
        );
        expect(styles.fontWeight).toBe(expectedWeight);
        expect(styles.fontSize).toBe(defaultStyles.fontSize);
        expect(styles.lineHeight).toBe(defaultStyles.lineHeight);
      }
    },
  );

  it.each([0, 1, 2])(
    'preserves consumer classes and lets inline weight override the prop with maxLines=%i',
    maxLines => {
      render(
        <Heading
          className="custom-heading"
          level={3}
          maxLines={maxLines}
          style={{fontWeight: 400}}
          weight="bold">
          Styled
        </Heading>,
      );

      const heading = screen.getByRole('heading', {level: 3, name: 'Styled'});
      expect(heading).toHaveClass('custom-heading');
      expect(getComputedStyle(heading).fontWeight).toBe('400');
    },
  );
});
