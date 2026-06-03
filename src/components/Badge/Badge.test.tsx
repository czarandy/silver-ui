import {render, screen} from '@testing-library/react';
import {Check} from 'lucide-react';
import type {SVGProps} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Badge} from './Badge';
import {badgeRecipe} from './Badge.recipe';

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
      badgeRecipe({color: 'neutral'}),
    );
  });

  it('applies the specified color', () => {
    render(<Badge color="error" data-testid="badge" label="Error" />);

    expect(screen.getByTestId('badge')).toHaveClass(
      badgeRecipe({color: 'error'}),
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

    expect(screen.getByTestId('badge')).toHaveClass(badgeRecipe({size: 'lg'}));
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
