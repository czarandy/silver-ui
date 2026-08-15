import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {Thumbnail} from 'components/Thumbnail/Thumbnail';
import {thumbnailRecipe} from 'components/Thumbnail/Thumbnail.recipe';

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it('exposes the root accessible name on a group role', () => {
    render(
      <Thumbnail
        alt="Quarterly report"
        label="report-q3.pdf"
        src="/thumb.png"
      />,
    );

    expect(
      screen.getByRole('group', {name: 'report-q3.pdf'}),
    ).toBeInTheDocument();
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

  it('shows the placeholder for an already-complete broken cached image', () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(
      true,
    );
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(
      0,
    );

    render(<Thumbnail alt="Preview" label="photo.jpg" src="/broken.jpg" />);

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
    render(<Thumbnail alt="Preview" label="photo.jpg" src="/photo.jpg" />);

    const thumbnail = screen.getByLabelText('photo.jpg');
    // eslint-disable-next-line testing-library/no-node-access -- the tooltip intentionally targets the structural image-area wrapper
    const imageArea = screen.getByRole('img').closest('[aria-describedby]');
    const tooltip = screen.getByRole('tooltip', {hidden: true});

    expect(thumbnail).not.toHaveAttribute('aria-describedby');
    expect(imageArea).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveTextContent('photo.jpg');
  });

  it('keeps the remove button outside the thumbnail tooltip trigger', () => {
    render(
      <Thumbnail
        alt="Preview"
        label="photo.jpg"
        onRemove={() => {}}
        src="/photo.jpg"
      />,
    );

    // eslint-disable-next-line testing-library/no-node-access -- the regression depends on the image area and remove action being sibling tooltip triggers
    const imageArea = screen.getByRole('img').closest('[aria-describedby]');
    const removeButton = screen.getByRole('button', {
      name: 'Remove photo.jpg',
    });
    const tooltips = screen.getAllByRole('tooltip', {hidden: true});
    const imageTooltip = tooltips.find(
      tooltip => tooltip.id === imageArea?.getAttribute('aria-describedby'),
    );
    const removeTooltip = tooltips.find(
      tooltip => tooltip.id === removeButton.getAttribute('aria-describedby'),
    );

    expect(imageArea).not.toContainElement(removeButton);
    expect(tooltips).toHaveLength(2);
    expect(imageTooltip).toHaveTextContent('photo.jpg');
    expect(removeTooltip).toHaveTextContent('Remove photo.jpg');
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

  it('keeps the remove button on a contrast scrim', () => {
    expect(thumbnailRecipe.raw().remove).toMatchObject({
      '& button': {
        w: '7',
        h: '7',
        bg: 'overlay.scrim',
        _hover: {bg: 'overlay.scrim.strong'},
        _active: {bg: 'overlay.scrim.strong'},
      },
    });
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
