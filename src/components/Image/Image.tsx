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
type ImageEventHandler = ComponentPropsWithoutRef<'img'>['onLoad'];
type ImageErrorEventHandler = ComponentPropsWithoutRef<'img'>['onError'];
type ForwardedImageProps = Omit<NativeImageProps, 'onError' | 'onLoad'>;

interface ImageMediaProps extends ForwardedImageProps {
  alt: string;
  decoding: NonNullable<ImageProps['decoding']>;
  fallback?: ReactNode;
  loading: NonNullable<ImageProps['loading']>;
  objectFit: ImageObjectFit;
  onError?: ImageErrorEventHandler;
  onLoad?: ImageEventHandler;
  sizes?: string;
  src: string;
  srcSet?: string;
}

function ImageMedia({
  alt,
  decoding,
  fallback,
  loading,
  objectFit,
  onError,
  onLoad,
  sizes,
  src,
  srcSet,
  ...imageProps
}: ImageMediaProps): React.JSX.Element {
  const [imageState, setImageState] = useState<ImageState>('loading');
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
      className={classes.media}>
      <img
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
  const classes = imageRecipe();
  const sourceKey = JSON.stringify([src, srcSet, sizes]);

  return (
    <div
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <ImageMedia
        key={sourceKey}
        {...imageProps}
        alt={alt}
        decoding={decoding}
        fallback={fallback}
        loading={loading}
        objectFit={objectFit}
        onError={onError}
        onLoad={onLoad}
        sizes={sizes}
        src={src}
        srcSet={srcSet}
      />
    </div>
  );
}

Image.displayName = 'Image';
