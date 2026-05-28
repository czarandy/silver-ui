import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Thumbnail} from './Thumbnail';

describe('Thumbnail', () => {
  it('renders an image thumbnail', () => {
    render(
      <Thumbnail alt="Preview" data-testid="thumbnail" src="/photo.jpg" />,
    );

    expect(screen.getByRole('img', {name: 'Preview'})).toHaveAttribute(
      'src',
      '/photo.jpg',
    );
    expect(screen.getByTestId('thumbnail')).toBeInTheDocument();
  });

  it('calls click and remove handlers', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();

    render(
      <Thumbnail
        alt="Preview"
        label="photo.jpg"
        onClick={onClick}
        onRemove={onRemove}
        src="/photo.jpg"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Open photo.jpg'}));
    expect(onClick).toHaveBeenCalled();

    await user.click(screen.getByRole('button', {name: 'Remove photo.jpg'}));
    expect(onRemove).toHaveBeenCalled();
  });

  it('renders loading placeholder without an image', () => {
    render(<Thumbnail isLoading label="Upload" />);

    expect(screen.getByLabelText('Upload')).toBeInTheDocument();
  });
});
