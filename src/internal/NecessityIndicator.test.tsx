import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {NecessityIndicator} from 'internal/NecessityIndicator';

describe('NecessityIndicator', () => {
  it('renders nothing when neither optional nor required', () => {
    const {container} = render(<NecessityIndicator />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an Optional indicator with an aria-hidden separator', () => {
    render(<NecessityIndicator isOptional />);

    const indicator = screen.getByText('Optional');
    expect(indicator).toHaveTextContent('· Optional');
    // eslint-disable-next-line testing-library/no-node-access -- the separator is presentational markup inside the indicator
    const separator = indicator.querySelector('[aria-hidden="true"]');
    expect(separator).not.toBeNull();
  });

  it('renders a Required indicator', () => {
    render(<NecessityIndicator isRequired />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders muted supporting text at the requested size', () => {
    render(<NecessityIndicator isRequired size="xs" />);

    const indicator = screen.getByText('Required');
    expect(indicator).toHaveClass('silver-fs_xs');
    expect(indicator).toHaveClass(
      'silver-c_var(--silver-text-color-muted,_var(--silver-colors-fg-muted))',
    );
  });
});
