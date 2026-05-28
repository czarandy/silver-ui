import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Skeleton} from './Skeleton';

describe('Skeleton', () => {
  it('applies dimensions and root props', () => {
    render(
      <Skeleton
        className="custom-skeleton"
        data-testid="skeleton"
        height={20}
        width={120}
      />,
    );

    expect(screen.getByTestId('skeleton')).toHaveClass('custom-skeleton');
    expect(screen.getByTestId('skeleton')).toHaveStyle({
      width: '120px',
      height: '20px',
    });
  });
});
