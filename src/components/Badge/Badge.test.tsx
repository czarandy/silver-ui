import {render, screen} from '@testing-library/react';
import {Check} from 'lucide-react';
import {describe, expect, it} from 'vitest';
import {Badge} from './Badge';

describe('Badge', () => {
  it('renders a label and optional icon', () => {
    render(<Badge icon={<Check />} label="Active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies root props', () => {
    render(
      <Badge
        className="custom-badge"
        data-testid="badge"
        label="Beta"
        style={{color: 'red'}}
      />,
    );

    expect(screen.getByTestId('badge')).toHaveClass('custom-badge');
    expect(screen.getByTestId('badge')).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });
});
