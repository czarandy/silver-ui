import {
  createElement,
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefCallback,
} from 'react';
import {css, cx} from 'styled-system/css';

export type LayerPlacement = 'above' | 'below' | 'start' | 'end';
export type LayerAlignment = 'start' | 'center' | 'end';

export interface ContextRenderProps {
  alignment?: LayerAlignment;
  className?: string;
  placement?: LayerPlacement;
  role?: string;
  style?: React.CSSProperties;
}

interface LayerOptions {
  hasLightDismiss?: boolean;
  onHide?: () => void;
  onShow?: () => void;
}

type PopoverValue = 'auto' | 'manual' | 'hint' | '';

type LayerElementProps = React.HTMLAttributes<HTMLDivElement> & {
  popover: PopoverValue;
  ref: RefCallback<HTMLElement>;
};

export interface LayerReturn {
  anchorId: string;
  hide: () => void;
  id: string;
  isOpen: boolean;
  ref: RefCallback<HTMLElement>;
  render: (children: ReactNode, props?: ContextRenderProps) => ReactNode;
  show: () => void;
}

const layerClassName = css({
  m: 0,
  p: 0,
  borderWidth: 0,
  borderStyle: 'none',
  overflow: 'visible',
  bg: 'transparent',
});

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

export function useLayer({
  onShow,
  onHide,
  hasLightDismiss = false,
}: LayerOptions = {}): LayerReturn {
  const id = useId();
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
      const anchorStyle: React.CSSProperties = {
        positionAnchor: anchorId,
        positionArea: getPositionArea(placement, alignment),
        positionTryFallbacks: 'flip-block, flip-inline, flip-block flip-inline',
      };

      const layerProps: LayerElementProps = {
        ref: popoverRefCallback,
        id,
        role: props?.role,
        popover: hasLightDismiss ? 'auto' : 'manual',
        className: cx(layerClassName, props?.className),
        style: {...anchorStyle, ...props?.style},
      };

      return createElement('div', layerProps, children);
    },
    [anchorId, hasLightDismiss, id, popoverRefCallback],
  );

  return {
    ref,
    anchorId,
    show,
    hide,
    isOpen,
    id,
    render,
  };
}
