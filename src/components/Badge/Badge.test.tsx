import {render, screen} from '@testing-library/react';
import {Check} from 'lucide-react';
import type {SVGProps} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Badge} from 'components/Badge/Badge';
import {badgeRecipe} from 'components/Badge/Badge.recipe';

function BadgeIcon(props: SVGProps<SVGSVGElement>): React.JSX.Element {
  return <Check {...props} data-testid="badge-icon" />;
}

describe('Badge', () => {
  it('renders a label and icon', () => {
    render(<Badge data-testid="badge" icon={BadgeIcon} label="Active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
  });

  it('applies the neutral color by default', () => {
    render(<Badge data-testid="badge" label="Default" />);

    expect(screen.getByTestId('badge')).toHaveClass(
      badgeRecipe({color: 'neutral'}).root!,
    );
  });

  it('applies the specified color', () => {
    render(<Badge color="error" data-testid="badge" label="Error" />);

    expect(screen.getByTestId('badge')).toHaveClass(
      badgeRecipe({color: 'error'}).root!,
    );
  });

  it('applies gray as a named palette color', () => {
    render(<Badge color="gray" data-testid="badge" label="Gray" />);

    expect(screen.getByTestId('badge')).toHaveClass(
      badgeRecipe({color: 'gray'}).root!,
    );
  });

  it('forwards ref to the root span', () => {
    const ref = vi.fn<(element: HTMLSpanElement | null) => void>();

    render(<Badge label="Ref" ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });

  it('applies className, style, and data-testid', () => {
    render(
      <Badge
        className="custom-badge"
        data-testid="badge"
        label="Beta"
        style={{color: 'red'}}
      />,
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('custom-badge');
    expect(badge).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('applies the specified size', () => {
    render(<Badge data-testid="badge" label="Large" size="lg" />);

    expect(screen.getByTestId('badge')).toHaveClass(
      badgeRecipe({size: 'lg'}).root!,
    );
  });

  // Badge text shares the `component.*` ramp with Button and the input family,
  // so a badge never renders larger text than a control of the same size.
  it('takes its font size from the shared control ramp', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    render(
      <>
        {sizes.map(size => (
          <Badge data-testid={size} key={size} label={size} size={size} />
        ))}
      </>,
    );

    for (const size of sizes) {
      expect(screen.getByTestId(size)).toHaveClass(
        `silver-fs_component.${size}`,
      );
    }
  });

  it('does not render an icon when icon is not provided', () => {
    render(<Badge data-testid="badge" label="No icon" />);

    const badge = screen.getByTestId('badge');
    expect(badge.querySelector('svg')).toBeNull(); // eslint-disable-line testing-library/no-node-access -- no role/testid on the optional icon
  });

  it('applies aria-label and role', () => {
    render(
      <Badge
        aria-label="3 notifications"
        data-testid="badge"
        label={3}
        role="status"
      />,
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('aria-label', '3 notifications');
    expect(badge).toHaveAttribute('role', 'status');
  });
});
