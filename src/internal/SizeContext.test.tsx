import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {
  SizeContext,
  type ComponentSize,
  useResolvedSize,
} from 'internal/SizeContext';

function SizeProbe({
  overrides,
}: {
  overrides?: ReadonlyArray<ComponentSize | null | undefined>;
}): React.JSX.Element {
  const size = useResolvedSize(...(overrides ?? []));
  return <output>{size}</output>;
}

describe('useResolvedSize', () => {
  it('defaults to md without overrides or an ambient size', () => {
    render(<SizeProbe />);

    expect(screen.getByText('md')).toBeInTheDocument();
  });

  it('uses the ambient size when no override is provided', () => {
    render(
      <SizeContext value="lg">
        <SizeProbe />
      </SizeContext>,
    );

    expect(screen.getByText('lg')).toBeInTheDocument();
  });

  it('uses the first defined override before the ambient size', () => {
    render(
      <SizeContext value="lg">
        <SizeProbe overrides={[undefined, null, 'sm', 'md']} />
      </SizeContext>,
    );

    expect(screen.getByText('sm')).toBeInTheDocument();
  });
});
