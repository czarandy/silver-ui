import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Thumbnail} from 'components/Thumbnail/Thumbnail';

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

    expect(screen.getByLabelText('Upload')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders a placeholder when the image fails to load', () => {
    render(<Thumbnail alt="Preview" label="photo.jpg" src="/broken.jpg" />);

    fireEvent.error(screen.getByRole('img', {name: 'Preview'}));

    expect(
      screen.queryByRole('img', {name: 'Preview'}),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('photo.jpg')).toBeInTheDocument();
  });

  it('resets image error state when src changes', () => {
    const {rerender} = render(<Thumbnail alt="Preview" src="/broken.jpg" />);

    fireEvent.error(screen.getByRole('img', {name: 'Preview'}));
    expect(
      screen.queryByRole('img', {name: 'Preview'}),
    ).not.toBeInTheDocument();

    rerender(<Thumbnail alt="Preview" src="/photo.jpg" />);

    expect(screen.getByRole('img', {name: 'Preview'})).toHaveAttribute(
      'src',
      '/photo.jpg',
    );
  });

  it('does not render interactive buttons when disabled', () => {
    render(
      <Thumbnail
        isDisabled
        label="photo.jpg"
        onClick={() => {}}
        onRemove={() => {}}
        src="/photo.jpg"
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Open photo.jpg'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Remove photo.jpg'}),
    ).not.toBeInTheDocument();
  });

  it('renders a loading overlay when loading with an image', () => {
    render(<Thumbnail alt="Preview" isLoading src="/photo.jpg" />);

    expect(screen.getByRole('img', {name: 'Preview'})).toBeInTheDocument();
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
  });

  it('renders tooltip wiring when label is provided', () => {
    render(<Thumbnail label="photo.jpg" src="/photo.jpg" />);

    const thumbnail = screen.getByLabelText('photo.jpg');
    const tooltip = screen.getByRole('tooltip', {hidden: true});

    expect(thumbnail).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveTextContent('photo.jpg');
  });

  it('does not trigger thumbnail click when removing', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();

    render(
      <Thumbnail
        label="photo.jpg"
        onClick={onClick}
        onRemove={onRemove}
        src="/photo.jpg"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Remove photo.jpg'}));

    expect(onRemove).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards className, style, and ref to the root element', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Thumbnail
        className="custom-thumbnail"
        data-testid="thumbnail"
        ref={ref}
        src="/photo.jpg"
        style={{marginTop: 12}}
      />,
    );

    const thumbnail = screen.getByTestId('thumbnail');
    expect(thumbnail).toHaveClass('custom-thumbnail');
    expect(thumbnail).toHaveStyle({marginTop: '12px'});
    expect(ref).toHaveBeenCalledWith(thumbnail);
  });
});
