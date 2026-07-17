import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {AspectRatio} from 'components/AspectRatio/AspectRatio';
import {Image, type ImageObjectFit} from 'components/Image/Image';
import {imageRecipe} from 'components/Image/Image.recipe';
import {assertNonNull} from 'internal/testHelpers';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Image', () => {
  it('renders the required source and alternative text', () => {
    render(<Image alt="Mountain landscape" src="/landscape.jpg" />);

    const image = screen.getByRole('img', {name: 'Mountain landscape'});
    expect(image).toHaveAttribute('src', '/landscape.jpg');
    expect(image).toHaveAttribute('alt', 'Mountain landscape');
  });

  it('uses lazy loading and async decoding by default', () => {
    render(<Image alt="Landscape" src="/landscape.jpg" />);

    const image = screen.getByRole('img', {name: 'Landscape'});
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
  });

  it('honors loading and decoding overrides', () => {
    render(
      <Image alt="Hero" decoding="sync" loading="eager" src="/hero.jpg" />,
    );

    const image = screen.getByRole('img', {name: 'Hero'});
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('decoding', 'sync');
  });

  it('forwards responsive sources and native image attributes', () => {
    render(
      <>
        <span id="image-description">Product detail</span>
        <Image
          alt="Product"
          aria-describedby="image-description"
          crossOrigin="anonymous"
          draggable={false}
          fetchPriority="high"
          height={400}
          referrerPolicy="no-referrer"
          sizes="(max-width: 600px) 100vw, 600px"
          src="/product.jpg"
          srcSet="/product-small.jpg 400w, /product-large.jpg 800w"
          width={600}
        />
      </>,
    );

    const image = screen.getByRole('img', {name: 'Product'});
    expect(image).toHaveAttribute(
      'srcset',
      '/product-small.jpg 400w, /product-large.jpg 800w',
    );
    expect(image).toHaveAttribute('sizes', '(max-width: 600px) 100vw, 600px');
    expect(image).toHaveAttribute('crossorigin', 'anonymous');
    expect(image).toHaveAttribute('draggable', 'false');
    expect(image).toHaveAttribute('fetchpriority', 'high');
    expect(image).toHaveAttribute('height', '400');
    expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(image).toHaveAttribute('width', '600');
    expect(image).toHaveAccessibleDescription('Product detail');
  });

  it('tracks the intrinsic loading state', () => {
    render(
      <Image alt="Landscape" data-testid="image-root" src="/landscape.jpg" />,
    );

    const root = screen.getByTestId('image-root');
    const image = screen.getByRole('img', {name: 'Landscape'});
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
    expect(image).toHaveClass('silver-vis_hidden');

    fireEvent.load(image);

    expect(root).not.toHaveAttribute('aria-busy');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(image).toHaveClass('silver-vis_visible');
  });

  it('wraps the image in a single element', () => {
    render(
      <Image alt="Landscape" data-testid="image-root" src="/landscape.jpg" />,
    );

    const root = screen.getByTestId('image-root');
    const image = screen.getByRole('img', {name: 'Landscape'});
    // eslint-disable-next-line testing-library/no-node-access -- pinning that the image is a direct child (no intermediate wrapper) is the point of this test
    expect(image.parentElement).toBe(root);
  });

  it('calls onLoad while updating internal state', () => {
    const onLoad = vi.fn();
    render(<Image alt="Landscape" onLoad={onLoad} src="/landscape.jpg" />);

    fireEvent.load(screen.getByRole('img', {name: 'Landscape'}));

    expect(onLoad).toHaveBeenCalledOnce();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the labeled default fallback and calls onError', () => {
    const onError = vi.fn();
    render(
      <Image alt="Unavailable product" onError={onError} src="/missing.jpg" />,
    );

    const failedImage = screen.getByRole('img', {
      name: 'Unavailable product',
    });
    fireEvent.error(failedImage);

    expect(onError).toHaveBeenCalledOnce();
    expect(failedImage).toHaveAttribute('aria-hidden', 'true');
    expect(
      screen.getByRole('img', {name: 'Unavailable product'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders a custom fallback instead of the default placeholder', () => {
    render(
      <Image
        alt="Product"
        fallback={<p role="alert">Image unavailable</p>}
        src="/missing.jpg"
      />,
    );

    fireEvent.error(screen.getByRole('img', {name: 'Product'}));

    expect(screen.getByRole('alert')).toHaveTextContent('Image unavailable');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('keeps the default fallback decorative when alt is empty', () => {
    render(<Image alt="" src="/decorative.jpg" />);

    fireEvent.error(screen.getByAltText(''));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('resets an error to loading when src changes', () => {
    const {rerender} = render(
      <Image alt="Product" data-testid="image-root" src="/old.jpg" />,
    );

    fireEvent.error(screen.getByRole('img', {name: 'Product'}));
    rerender(<Image alt="Product" data-testid="image-root" src="/new.jpg" />);

    const image = screen.getByRole('img', {name: 'Product'});
    expect(image).toHaveAttribute('src', '/new.jpg');
    expect(screen.getByTestId('image-root')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
  });

  it('resets an error to loading when srcSet changes', () => {
    const {rerender} = render(
      <Image
        alt="Product"
        data-testid="image-root"
        src="/product.jpg"
        srcSet="/old-large.jpg 2x"
      />,
    );

    fireEvent.error(screen.getByRole('img', {name: 'Product'}));
    rerender(
      <Image
        alt="Product"
        data-testid="image-root"
        src="/product.jpg"
        srcSet="/new-large.jpg 2x"
      />,
    );

    const image = screen.getByRole('img', {name: 'Product'});
    expect(image).toHaveAttribute('srcset', '/new-large.jpg 2x');
    expect(screen.getByTestId('image-root')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
  });

  it('does not reset the loaded state when only sizes changes', () => {
    const {rerender} = render(
      <Image
        alt="Product"
        data-testid="image-root"
        sizes="(max-width: 600px) 100vw, 600px"
        src="/product.jpg"
        srcSet="/product-small.jpg 400w, /product-large.jpg 800w"
      />,
    );

    fireEvent.load(screen.getByRole('img', {name: 'Product'}));
    rerender(
      <Image
        alt="Product"
        data-testid="image-root"
        sizes="(max-width: 900px) 100vw, 900px"
        src="/product.jpg"
        srcSet="/product-small.jpg 400w, /product-large.jpg 800w"
      />,
    );

    const image = screen.getByRole('img', {name: 'Product'});
    expect(image).toHaveAttribute('sizes', '(max-width: 900px) 100vw, 900px');
    expect(image).toHaveClass('silver-vis_visible');
    expect(screen.getByTestId('image-root')).not.toHaveAttribute('aria-busy');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('reveals an already-complete cached image', () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(
      true,
    );
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(
      640,
    );

    render(
      <Image
        alt="Cached landscape"
        data-testid="image-root"
        src="/cached.jpg"
      />,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByTestId('image-root')).not.toHaveAttribute('aria-busy');
    expect(screen.getByRole('img', {name: 'Cached landscape'})).toHaveClass(
      'silver-vis_visible',
    );
  });

  it('shows the fallback for an already-complete broken cached image', () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(
      true,
    );
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(
      0,
    );

    render(
      <Image alt="Broken product" data-testid="image-root" src="/broken.jpg" />,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByTestId('image-root')).not.toHaveAttribute('aria-busy');
    expect(screen.getByAltText('Broken product')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(
      screen.getByRole('img', {name: 'Broken product'}),
    ).toBeInTheDocument();
  });

  it('applies all object-fit variants and defaults to cover', () => {
    const {rerender} = render(<Image alt="Product" src="/product.jpg" />);
    const defaultClasses = assertNonNull(imageRecipe().image).split(' ');
    expect(screen.getByRole('img', {name: 'Product'})).toHaveClass(
      ...defaultClasses,
    );

    const objectFits: ImageObjectFit[] = [
      'contain',
      'cover',
      'fill',
      'none',
      'scale-down',
    ];
    for (const objectFit of objectFits) {
      rerender(
        <Image alt="Product" objectFit={objectFit} src="/product.jpg" />,
      );
      const expectedClasses = assertNonNull(
        imageRecipe({objectFit}).image,
      ).split(' ');
      expect(screen.getByRole('img', {name: 'Product'})).toHaveClass(
        ...expectedClasses,
      );
    }
  });

  it('routes wrapper props and native image props to their documented elements', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();
    render(
      <Image
        alt="Product"
        className="custom-image"
        data-testid="image-root"
        ref={ref}
        src="/product.jpg"
        style={{color: 'red'}}
        title="Native image title"
      />,
    );

    const root = screen.getByTestId('image-root');
    const image = screen.getByRole('img', {name: 'Product'});
    expect(root).toHaveClass('custom-image');
    expect(root).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    expect(image).not.toHaveClass('custom-image');
    expect(image).not.toHaveAttribute('data-testid');
    expect(image).not.toHaveAttribute('style');
    expect(image).toHaveAttribute('title', 'Native image title');
  });

  it('composes with AspectRatio without owning the ratio', () => {
    render(
      <AspectRatio data-testid="ratio" ratio={16 / 9}>
        <Image alt="Hero" data-testid="image-root" src="/hero.jpg" />
      </AspectRatio>,
    );

    expect(screen.getByTestId('ratio')).toHaveStyle({
      aspectRatio: String(16 / 9),
    });
    expect(screen.getByTestId('image-root')).not.toHaveAttribute('style');
    expect(screen.getByRole('img', {name: 'Hero'})).toBeInTheDocument();
  });
});
