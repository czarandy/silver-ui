import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Tag} from './Tag';

describe('Tag', () => {
  it('renders a label', () => {
    render(<Tag label="Urgent" />);

    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('calls onRemove from the remove button', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<Tag label="Urgent" onRemove={onRemove} />);

    await user.click(screen.getByRole('button', {name: 'Remove Urgent'}));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('renders as a link when href is provided', () => {
    render(<Tag href="/filters/open" label="Open" />);

    expect(screen.getByRole('link', {name: 'Open'})).toHaveAttribute(
      'href',
      '/filters/open',
    );
  });
});
