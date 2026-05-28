import type {CSSProperties, Ref} from 'react';
import {css} from 'styled-system/css';
import {Button, type ButtonProps} from '../Button';
import {Dialog} from '../Dialog';
import {HStack, Stack} from '../Stack';
import {Heading, Text} from '../Text';

export type AlertDialogActionVariant = NonNullable<ButtonProps['variant']>;

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
   * Whether to render inline instead of as a modal.
   * @default false
   */
  isInline?: boolean;
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
  ref?: Ref<HTMLElement>;
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

const styles = {
  content: css({p: '4'}),
} as const;

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
  isInline = false,
  isOpen,
  onAction,
  onOpenChange,
  ref,
  style,
  title,
  width = 400,
}: AlertDialogProps): React.JSX.Element | null {
  return (
    <Dialog
      className={className}
      data-testid={dataTestId}
      isInline={isInline}
      isOpen={isOpen}
      label={title}
      onOpenChange={onOpenChange}
      purpose="required"
      ref={ref}
      style={style}
      width={width}>
      <Stack className={styles.content} gap={4}>
        <Stack gap={2}>
          <Heading level={2}>{title}</Heading>
          <Text as="p" color="secondary">
            {description}
          </Text>
        </Stack>
        <HStack gap={2} justify="end">
          <Button
            label={cancelLabel}
            onClick={() => onOpenChange(false)}
            variant="ghost"
          />
          <Button
            isLoading={isActionLoading}
            label={actionLabel}
            onClick={onAction}
            variant={actionVariant}
          />
        </HStack>
      </Stack>
    </Dialog>
  );
}

AlertDialog.displayName = 'AlertDialog';
