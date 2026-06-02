import {X} from 'lucide-react';
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {Button} from '../Button';
import {LayoutHeader} from '../Layout';

export interface DialogHeaderProps {
  /**
   * Additional CSS class names applied to the header.
   */
  className?: string;
  /**
   * Test ID applied to the header.
   */
  'data-testid'?: string;
  /**
   * Content rendered after the title, before the close button.
   */
  endContent?: ReactNode;
  /**
   * Called when the close button is clicked.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Ref forwarded to the header element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Content rendered before the title.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the header.
   */
  style?: CSSProperties;
  /**
   * Supporting text displayed below the title.
   */
  subtitle?: string;
  /**
   * Primary header title.
   */
  title: string;
}

/**
 * A standard header for Dialog and Drawer, with title, optional subtitle,
 * and a close button. Composes LayoutHeader internally.
 */
export function DialogHeader({
  title,
  subtitle,
  onOpenChange,
  startContent,
  endContent,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: DialogHeaderProps): React.JSX.Element {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    headerRef.current
      ?.querySelector<HTMLElement>('[data-testid] h4, h1, h2, h3, h4, h5, h6')
      ?.focus();
  }, []);

  const closeButton =
    onOpenChange != null ? (
      <Button
        icon={X}
        isIconOnly
        label="Close"
        onClick={() => onOpenChange(false)}
        tooltip="Close"
        variant="ghost"
      />
    ) : null;

  const combinedEndContent =
    endContent != null || closeButton != null ? (
      <>
        {endContent}
        {closeButton}
      </>
    ) : undefined;

  return (
    <LayoutHeader
      className={className}
      data-testid={dataTestId}
      endContent={combinedEndContent}
      padding={4}
      ref={node => {
        headerRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref != null) {
          ref.current = node;
        }
      }}
      startContent={startContent}
      style={style}
      subtitle={subtitle}
      title={title}
    />
  );
}

DialogHeader.displayName = 'DialogHeader';
