import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Link} from 'components/Link';
import {PasswordInput} from 'components/PasswordInput';

// Real-layout tests for `labelEnd`. jsdom has no layout, so it cannot show
// the content sitting at the inline end of the label row.

function PasswordField({
  isLabelHidden = false,
}: {
  isLabelHidden?: boolean;
}): React.JSX.Element {
  return (
    <div data-testid="container" style={{width: 320}}>
      <PasswordInput
        isLabelHidden={isLabelHidden}
        label="Password"
        labelEnd={
          <Link href="#forgot-password" size="sm">
            Forgot password?
          </Link>
        }
        onChange={() => {}}
        value=""
      />
    </div>
  );
}

describe('Field labelEnd layout', () => {
  it('sits at the end of the label row, on the same line as the label', () => {
    render(<PasswordField />);

    const container = screen.getByTestId('container').getBoundingClientRect();
    const label = screen.getByText('Password').getBoundingClientRect();
    const link = screen
      .getByRole('link', {name: 'Forgot password?'})
      .getBoundingClientRect();
    const input = screen.getByLabelText('Password').getBoundingClientRect();

    expect(Math.abs(link.right - container.right)).toBeLessThan(1);
    expect(label.left).toBeCloseTo(container.left, 0);
    expect(Math.abs(link.bottom - label.bottom)).toBeLessThan(2);
    expect(link.bottom).toBeLessThanOrEqual(input.top);
  });

  it('stays at the inline end above the input when the label is hidden', () => {
    render(<PasswordField isLabelHidden />);

    const container = screen.getByTestId('container').getBoundingClientRect();
    const link = screen
      .getByRole('link', {name: 'Forgot password?'})
      .getBoundingClientRect();
    const input = screen.getByLabelText('Password').getBoundingClientRect();

    expect(Math.abs(link.right - container.right)).toBeLessThan(1);
    expect(link.width).toBeLessThan(container.width / 2);
    expect(link.bottom).toBeLessThanOrEqual(input.top);
  });
});
