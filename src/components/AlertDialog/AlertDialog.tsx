import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type Ref,
} from 'react';
import {Button} from '../Button';
import {Dialog} from '../Dialog';
import {Layout, LayoutContent, LayoutFooter, LayoutHeader} from '../Layout';
import {Text} from '../Text';

export type AlertDialogActionVariant = 'destructive' | 'primary';

export interface AlertDialogProps {
  /**
   * Action button label.
   */
  actionLabel: string;
  /**
   * Visual variant for the action button.
   * @default 'destructive'
   */
  actionVariant?: AlertDialogActionVariant;
  /**
   * Cancel button label.
   * @default 'Cancel'
   */
  cancelLabel?: string;
  /**
   * Additional CSS class names applied to the dialog.
   */
  className?: string;
  /**
   * Test ID applied to the dialog.
   */
  'data-testid'?: string;
  /**
   * Consequence description.
   */
  description: string;
  /**
   * Whether the action button is loading.
   * @default false
   */
  isActionLoading?: boolean;
  /**
   * Whether the dialog is open.
   */
  isOpen: boolean;
  /**
   * Called when the primary action is clicked.
   */
  onAction: () => void;
  /**
   * Called when the dialog requests an open-state change.
   */
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Ref forwarded to the dialog element.
   */
  ref?: Ref<HTMLDialogElement>;
  /**
   * Inline styles applied to the dialog.
   */
  style?: CSSProperties;
  /**
   * Dialog title.
   */
  title: string;
  /**
   * Dialog width. Numbers are treated as pixels.
   * @default 400
   */
  width?: number | string;
}

/**
 * A modal confirmation dialog for destructive or irreversible actions.
 */
export function AlertDialog({
  actionLabel,
  actionVariant = 'destructive',
  cancelLabel = 'Cancel',
  className,
  'data-testid': dataTestId,
  description,
  isActionLoading = false,
  isOpen,
  onAction,
  onOpenChange,
  ref,
  style,
  title,
  width = 400,
}: AlertDialogProps): React.JSX.Element | null {
  /**
   * Synchronous guard against rapid double-invocation of onAction.
   * The ref flips immediately on the first call — before React can
   * re-render with `isActionLoading=true` — so a second Enter/click
   * in the same event-loop tick is ignored.
   */
  const actionFiredRef = useRef(false);

  useEffect(() => {
    if (!isActionLoading) {
      actionFiredRef.current = false;
    }
  }, [isActionLoading]);

  useEffect(() => {
    if (!isOpen) {
      actionFiredRef.current = false;
    }
  }, [isOpen]);

  const handleAction = useCallback(() => {
    if (actionFiredRef.current) {
      return;
    }
    actionFiredRef.current = true;
    onAction();
  }, [onAction]);

  return (
    <Dialog
      className={className}
      data-testid={dataTestId}
      dismissBehavior={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      ref={ref}
      role="alertdialog"
      style={style}
      width={width}>
      <Layout
        content={
          <LayoutContent>
            <Text as="p" color="secondary">
              {description}
            </Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter
            primaryButton={
              <Button
                isLoading={isActionLoading}
                label={actionLabel}
                onClick={handleAction}
                variant={actionVariant}
              />
            }
            secondaryButton={
              <Button
                label={cancelLabel}
                onClick={() => onOpenChange(false)}
                variant="ghost"
              />
            }
          />
        }
        hasDividers
        header={<LayoutHeader title={title} />}
      />
    </Dialog>
  );
}

AlertDialog.displayName = 'AlertDialog';
