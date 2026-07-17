'use client';

import {ImageIcon} from 'lucide-react';
import {
  useCallback,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {Icon} from 'components/Icon';
import {imageRecipe} from 'components/Image/Image.recipe';
import {Skeleton} from 'components/Skeleton';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

export type ImageObjectFit =
  'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

type NativeImageProps = Omit<
  ComponentPropsWithoutRef<'img'>,
  | 'alt'
  | 'className'
  | 'decoding'
  | 'loading'
  | 'sizes'
  | 'src'
  | 'srcSet'
  | 'style'
>;

/**
 * Props for a responsive image with intrinsic loading and error states.
 *
 * `className`, `style`, `data-testid`, and `ref` are applied to the stable
 * wrapper `<div>`. Remaining native image attributes are forwarded to the
 * inner `<img>`.
 */
export interface ImageProps extends NativeImageProps {
  /**
   * Alternative text describing the image. Use an empty string for a
   * decorative image.
   */
  alt: string;
  /**
   * Additional CSS class names applied to the wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the wrapper.
   */
  'data-testid'?: string;
  /**
   * Browser decoding hint.
   * @default 'async'
   */
  decoding?: ComponentPropsWithoutRef<'img'>['decoding'];
  /**
   * Content displayed if the image fails to load. Defaults to a muted image
   * placeholder.
   */
  fallback?: ReactNode;
  /**
   * Browser loading strategy.
   * @default 'lazy'
   */
  loading?: ComponentPropsWithoutRef<'img'>['loading'];
  /**
   * How the image is resized within its frame.
   * @default 'cover'
   */
  objectFit?: ImageObjectFit;
  /**
   * Ref forwarded to the stable wrapper element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Responsive source-size hints.
   */
  sizes?: string;
  /**
   * Image source.
   */
  src: string;
  /**
   * Responsive image sources.
   */
  srcSet?: string;
  /**
   * Inline styles applied to the wrapper.
   */
  style?: CSSProperties;
}

type ImageState = 'error' | 'loaded' | 'loading';

/**
 * Responsive image with lazy loading, async decoding, and an error fallback.
 * Reserve layout space with native dimensions, wrapper sizing, or
 * `AspectRatio`.
 */
export function Image({
  alt,
  className,
  'data-testid': dataTestId,
  decoding = 'async',
  fallback,
  loading = 'lazy',
  objectFit = 'cover',
  onError,
  onLoad,
  ref,
  sizes,
  src,
  srcSet,
  style,
  ...imageProps
}: ImageProps): React.JSX.Element {
  // `sizes` is intentionally excluded: it tweaks source selection but does not
  // change the underlying resource, so it should not force a reload/reset.
  const sourceKey = JSON.stringify([src, srcSet]);
  const [imageState, setImageState] = useState<ImageState>('loading');
  // Reset to loading when the source changes. The keyed <img> below remounts on
  // the same change, so `imageRef` re-runs and reveals already-cached images
  // synchronously (no skeleton flash).
  const [prevSourceKey, setPrevSourceKey] = useState(sourceKey);
  if (sourceKey !== prevSourceKey) {
    setPrevSourceKey(sourceKey);
    setImageState('loading');
  }

  const classes = imageRecipe({
    isLoaded: imageState === 'loaded',
    objectFit,
  });
  const imageRef = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete === true) {
      setImageState(image.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, []);

  return (
    <div
      aria-busy={imageState === 'loading' || undefined}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <img
        key={sourceKey}
        {...imageProps}
        alt={alt}
        aria-hidden={imageState === 'error' || undefined}
        className={classes.image}
        decoding={decoding}
        loading={loading}
        onError={event => {
          setImageState('error');
          onError?.(event);
        }}
        onLoad={event => {
          setImageState('loaded');
          onLoad?.(event);
        }}
        ref={imageRef}
        sizes={sizes}
        src={src}
        srcSet={srcSet}
      />
      {imageState === 'loading' ? (
        <Skeleton className={classes.loading} radius="none" />
      ) : null}
      {imageState === 'error' ? (
        <div className={classes.fallback}>
          {isReactNode(fallback) ? (
            fallback
          ) : (
            <Icon aria-label={alt || undefined} icon={ImageIcon} size="lg" />
          )}
        </div>
      ) : null}
    </div>
  );
}

Image.displayName = 'Image';
