import type {CSSProperties, ReactNode, Ref} from 'react';
import {AccordionItem} from '../Accordion';

export interface CollapsibleProps {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  isDefaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  trigger: ReactNode;
}

export function Collapsible({
  className,
  'data-testid': dataTestId,
  ref,
  style,
  ...props
}: CollapsibleProps): React.JSX.Element {
  return (
    <AccordionItem
      {...props}
      className={className}
      data-testid={dataTestId}
      ref={ref}
      style={style}
    />
  );
}

Collapsible.displayName = 'Collapsible';
