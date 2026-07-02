'use client';

import {
  createElement,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefCallback,
} from 'react';
import {cx} from 'internal/cx';
import {css} from 'styled-system/css';

export type LayerPlacement = 'above' | 'below' | 'start' | 'end';
export type LayerAlignment = 'start' | 'center' | 'end';

export interface ContextRenderProps {
  /**
   * How the layer aligns along the edge it is placed against. Defaults to
   * `'center'`.
   */
  alignment?: LayerAlignment;
  /**
   * Additional class name merged onto the layer element.
   */
  className?: string;
  /**
   * Gap in pixels along the inline axis, applied as a margin on the edge facing
   * the trigger (for `start`/`end` placements). Flips with the layer when
   * `position-try` reflects it, so the gap stays between the layer and trigger.
   */
  offsetX?: number;
  /**
   * Gap in pixels along the block axis, applied as a margin on the edge facing
   * the trigger (for `above`/`below` placements). Flips with the layer when
   * `position-try` reflects it, so the gap stays between the layer and trigger.
   */
  offsetY?: number;
  /**
   * Which side of the anchor the layer is placed on. Defaults to `'above'`.
   */
  placement?: LayerPlacement;
  /**
   * ARIA role applied to the layer element.
   */
  role?: string;
  /**
   * Additional inline styles merged onto the layer element.
   */
  style?: React.CSSProperties;
}

interface LayerOptions {
  /**
   * Id applied to the layer element. Falls back to a generated id. Supply this
   * when another element needs a stable `aria-controls` reference to the layer.
   */
  id?: string;
  /**
   * When `true`, the layer can be dismissed by clicking outside or pressing
   * Escape (the native `auto` popover behavior). When `false`, it uses `manual`
   * mode and must be hidden programmatically. Defaults to `false`.
   */
  isDismissable?: boolean;
  /**
   * Called after the layer is hidden, including via light dismiss.
   */
  onHide?: () => void;
  /**
   * Called after the layer is shown.
   */
  onShow?: () => void;
}

type PopoverValue = 'auto' | 'manual' | 'hint' | '';

type LayerElementProps = React.HTMLAttributes<HTMLDivElement> & {
  popover: PopoverValue;
  ref: RefCallback<HTMLElement>;
};

export interface LayerReturn {
  /**
   * CSS anchor name tying the layer to the trigger for positioning.
   */
  anchorId: string;
  /**
   * Hides the layer.
   */
  hide: () => void;
  /**
   * Id of the layer element, matching the value to use for `aria-controls`.
   */
  id: string;
  /**
   * Whether the layer is currently open.
   */
  isOpen: boolean;
  /**
   * Ref callback to attach to the trigger element for anchor positioning.
   */
  ref: RefCallback<HTMLElement>;
  /**
   * Renders the given children inside the layer element.
   */
  render: (children: ReactNode, props?: ContextRenderProps) => ReactNode;
  /**
   * Shows the layer.
   */
  show: () => void;
}

const styles = {
  layer: css({
    m: 0,
    p: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: 'transparent',
    overflow: 'visible',
    bg: 'transparent',
  }),
};

function getPositionArea(
  placement: LayerPlacement = 'above',
  alignment: LayerAlignment = 'center',
): string {
  const placementMap: Record<LayerPlacement, string> = {
    above: 'top',
    below: 'bottom',
    start: 'left',
    end: 'right',
  };

  const cssPlacement = placementMap[placement];

  if (placement === 'above' || placement === 'below') {
    if (alignment === 'start') {
      return `${cssPlacement} span-right`;
    }
    if (alignment === 'end') {
      return `${cssPlacement} span-left`;
    }
    return cssPlacement;
  }

  if (alignment === 'start') {
    return `${cssPlacement} span-bottom`;
  }
  if (alignment === 'end') {
    return `${cssPlacement} span-top`;
  }
  return `${cssPlacement} center`;
}

/**
 * Applies the offset as a logical margin on the edge that faces the anchor for
 * the given placement. Using logical margins (rather than `translate`) means the
 * `position-try` flip tactics flip the gap along with the layer, so it stays on
 * the correct side after a flip.
 */
function getOffsetStyle(
  placement: LayerPlacement,
  offsetX?: number,
  offsetY?: number,
): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (offsetY != null) {
    if (placement === 'above') {
      style.marginBlockEnd = `${offsetY}px`;
    } else {
      style.marginBlockStart = `${offsetY}px`;
    }
  }
  if (offsetX != null) {
    if (placement === 'start') {
      style.marginInlineEnd = `${offsetX}px`;
    } else {
      style.marginInlineStart = `${offsetX}px`;
    }
  }
  return style;
}

export function useLayer({
  onShow,
  onHide,
  isDismissable = false,
  id: providedId,
}: LayerOptions = {}): LayerReturn {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const anchorId = `--silver-layer-${id.replace(/:/g, '')}`;
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isOpenRef = useRef(false);

  const show = useCallback(() => {
    if (popoverRef.current == null || isOpenRef.current) {
      return;
    }

    popoverRef.current.showPopover();
    isOpenRef.current = true;
    setIsOpen(true);
    onShow?.();
  }, [onShow]);

  const hide = useCallback(() => {
    if (!isOpenRef.current) {
      return;
    }

    popoverRef.current?.hidePopover();
    isOpenRef.current = false;
    setIsOpen(false);
    onHide?.();
  }, [onHide]);

  const ref: RefCallback<HTMLElement> = useCallback(
    element => {
      if (triggerRef.current != null) {
        (
          triggerRef.current.style as unknown as Record<string, string>
        ).anchorName = '';
      }

      if (element != null) {
        (element.style as unknown as Record<string, string>).anchorName =
          anchorId;
      }

      triggerRef.current = element;
    },
    [anchorId],
  );

  const handleToggle = useCallback(
    (event: Event) => {
      const toggleEvent = event as ToggleEvent;
      if (toggleEvent.newState === 'closed' && isOpenRef.current) {
        isOpenRef.current = false;
        setIsOpen(false);
        onHide?.();
      }
    },
    [onHide],
  );

  const popoverRefCallback = useCallback(
    (element: HTMLElement | null) => {
      if (popoverRef.current != null) {
        popoverRef.current.removeEventListener('toggle', handleToggle);
      }

      popoverRef.current = element;

      if (element != null) {
        element.addEventListener('toggle', handleToggle);
      }
    },
    [handleToggle],
  );

  const render = useCallback(
    (children: ReactNode, props?: ContextRenderProps) => {
      const placement = props?.placement ?? 'above';
      const alignment = props?.alignment ?? 'center';
      const {offsetX, offsetY} = props ?? {};
      const anchorStyle: React.CSSProperties = {
        border: 'none',
        positionAnchor: anchorId,
        positionArea: getPositionArea(placement, alignment),
        positionTryFallbacks: 'flip-block, flip-inline, flip-block flip-inline',
      };
      const offsetStyle = getOffsetStyle(placement, offsetX, offsetY);

      const layerProps: LayerElementProps = {
        ref: popoverRefCallback,
        id,
        role: props?.role,
        popover: isDismissable ? 'auto' : 'manual',
        className: cx(styles.layer, props?.className),
        style: {...anchorStyle, ...offsetStyle, ...props?.style},
      };

      return createElement('div', layerProps, children);
    },
    [anchorId, isDismissable, id, popoverRefCallback],
  );

  return useMemo(
    () => ({
      ref,
      anchorId,
      show,
      hide,
      isOpen,
      id,
      render,
    }),
    [ref, anchorId, show, hide, isOpen, id, render],
  );
}
