import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Rating} from './Rating';

describe('Rating', () => {
  describe('read-only', () => {
    it('renders filled stars matching the value', () => {
      render(<Rating isReadOnly value={3} />);

      const img = screen.getByRole('img', {name: 'Rating: 3 out of 5'});
      expect(img).toBeInTheDocument();
    });

    it('renders custom count', () => {
      render(<Rating count={10} isReadOnly value={7} />);

      expect(
        screen.getByRole('img', {name: 'Rating: 7 out of 10'}),
      ).toBeInTheDocument();
    });

    it('applies disabled styling', () => {
      render(<Rating data-testid="rating" isDisabled value={2} />);

      const el = screen.getByTestId('rating');
      expect(el).toHaveAttribute('role', 'img');
    });
  });

  describe('interactive', () => {
    it('renders as a radiogroup', () => {
      const onChange = vi.fn();
      render(<Rating onChange={onChange} value={3} />);

      expect(
        screen.getByRole('radiogroup', {name: 'Rating'}),
      ).toBeInTheDocument();
    });

    it('calls onChange when a star is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Rating onChange={onChange} value={2} />);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(5);

      await user.click(radios[3]);
      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('selects via keyboard', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Rating onChange={onChange} value={1} />);

      const radios = screen.getAllByRole('radio');
      radios[2].focus();
      await user.keyboard(' ');
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('has accessible labels for each star', () => {
      const onChange = vi.fn();
      render(<Rating onChange={onChange} value={0} />);

      expect(screen.getByText('1 star')).toBeInTheDocument();
      expect(screen.getByText('2 stars')).toBeInTheDocument();
      expect(screen.getByText('5 stars')).toBeInTheDocument();
    });

    it('does not render radiogroup when isReadOnly is true with onChange', () => {
      render(<Rating isReadOnly onChange={vi.fn()} value={3} />);

      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  it('applies className, style, ref, and data-testid', () => {
    const ref = vi.fn();
    render(
      <Rating
        className="custom"
        data-testid="rating"
        isReadOnly
        ref={ref}
        style={{color: 'red'}}
        value={3}
      />,
    );

    const el = screen.getByTestId('rating');
    expect(el).toHaveClass('custom');
    expect(el).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(el);
  });
});
