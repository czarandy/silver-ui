import {
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefCallback,
} from 'react';
import {cx} from 'internal/cx';
import {mergeRefs} from 'internal/mergeRefs';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';
import {css} from 'styled-system/css';

export interface HoverLayerTriggerProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  describedBy: string;
  hoverIndication?: 'always' | 'auto' | 'never';
  isNonTextWrapperPropsForwarded?: boolean;
  layer: ReactNode;
  nonTextWrapperElement?: 'div' | 'span';
  style?: CSSProperties;
  triggerRef: RefCallback<HTMLElement>;
  wrapperRef?: Ref<HTMLElement>;
}

const styles = {
  wrapperContents: css({
    display: 'contents',
  }),
  wrapperInline: css({
    display: 'inline',
  }),
  hoverIndication: css({
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: 'fg.muted',
    textUnderlineOffset: '2px',
  }),
} as const;

function isTextOnly(children: ReactNode): boolean {
  return typeof children === 'string' || typeof children === 'number';
}

function mergeIds(...ids: (string | undefined | null)[]): string | undefined {
  const filtered = ids.filter(Boolean);
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

export function HoverLayerTrigger({
  children,
  className,
  'data-testid': dataTestId,
  describedBy,
  hoverIndication = 'auto',
  isNonTextWrapperPropsForwarded = true,
  layer,
  nonTextWrapperElement = 'span',
  style,
  triggerRef,
  wrapperRef,
}: HoverLayerTriggerProps): React.JSX.Element {
  const ownWrapperRef = useRef<HTMLDivElement | HTMLSpanElement>(null);
  const textOnly = isTextOnly(children);
  const showHoverIndication =
    hoverIndication === 'always' || (hoverIndication === 'auto' && textOnly);

  useIsomorphicLayoutEffect(() => {
    if (textOnly) {
      return;
    }

    const firstChild = ownWrapperRef.current?.firstElementChild;
    if (!(firstChild instanceof HTMLElement)) {
      return;
    }

    triggerRef(firstChild);
    const existingDescribedBy = firstChild.getAttribute('aria-describedby');
    firstChild.setAttribute(
      'aria-describedby',
      mergeIds(existingDescribedBy, describedBy) ?? '',
    );

    return () => {
      triggerRef(null);
      if (existingDescribedBy != null) {
        firstChild.setAttribute('aria-describedby', existingDescribedBy);
        return;
      }

      firstChild.removeAttribute('aria-describedby');
    };
  }, [describedBy, textOnly, triggerRef]);

  if (textOnly) {
    return (
      <>
        <span
          aria-describedby={describedBy}
          className={cx(
            styles.wrapperInline,
            showHoverIndication ? styles.hoverIndication : undefined,
            className,
          )}
          data-testid={dataTestId}
          ref={mergeRefs(triggerRef as Ref<HTMLSpanElement>, wrapperRef)}
          style={style}
          tabIndex={0}>
          {children}
        </span>
        {layer}
      </>
    );
  }

  const nonTextWrapperRef = isNonTextWrapperPropsForwarded
    ? mergeRefs(ownWrapperRef, wrapperRef)
    : ownWrapperRef;
  const nonTextWrapperClassName = cx(
    styles.wrapperContents,
    isNonTextWrapperPropsForwarded ? className : undefined,
  );
  const nonTextWrapperTestId = isNonTextWrapperPropsForwarded
    ? dataTestId
    : undefined;
  const nonTextWrapperStyle = isNonTextWrapperPropsForwarded
    ? style
    : undefined;
  const wrappedChildren =
    nonTextWrapperElement === 'div' ? (
      <div
        className={nonTextWrapperClassName}
        data-testid={nonTextWrapperTestId}
        ref={nonTextWrapperRef as Ref<HTMLDivElement>}
        style={nonTextWrapperStyle}>
        {children}
      </div>
    ) : (
      <span
        className={nonTextWrapperClassName}
        data-testid={nonTextWrapperTestId}
        ref={nonTextWrapperRef}
        style={nonTextWrapperStyle}>
        {children}
      </span>
    );

  return (
    <>
      {wrappedChildren}
      {layer}
    </>
  );
}
