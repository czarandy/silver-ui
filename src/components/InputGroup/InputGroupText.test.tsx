import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {InputGroupText} from 'components/InputGroup/InputGroupText';

describe('InputGroupText', () => {
  it('renders its children', () => {
    render(<InputGroupText>https://</InputGroupText>);

    expect(screen.getByText('https://')).toBeInTheDocument();
  });

  it('marks the element with the data-silver-input-group-text attribute', () => {
    render(<InputGroupText data-testid="addon">$</InputGroupText>);

    expect(screen.getByTestId('addon')).toHaveAttribute(
      'data-silver-input-group-text',
      '',
    );
  });

  it('forwards data-testid, className, and style to the wrapper', () => {
    render(
      <InputGroupText
        className="custom-addon"
        data-testid="addon"
        style={{maxWidth: 120}}>
        $
      </InputGroupText>,
    );

    const addon = screen.getByTestId('addon');
    expect(addon).toHaveClass('custom-addon');
    expect(addon).toHaveStyle({maxWidth: '120px'});
  });

  it('forwards a ref to the wrapper element', () => {
    const ref = vi.fn<(el: HTMLDivElement | null) => void>();

    render(
      <InputGroupText data-testid="addon" ref={ref}>
        $
      </InputGroupText>,
    );

    expect(ref).toHaveBeenCalledWith(screen.getByTestId('addon'));
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
