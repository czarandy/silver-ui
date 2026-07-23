import {Info} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {Icon, type IconComponent} from 'components/Icon';
import {Item} from 'components/Item';
import {selectOptionItemRecipe} from 'components/Select/Select.recipe';
import {Tooltip} from 'components/Tooltip';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

const classes = selectOptionItemRecipe();

export interface SelectOptionProps {
  /**
   * Additional CSS class names applied to the option layout.
   */
  className?: string;
  /**
   * Test ID applied to the option layout.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Trailing content.
   */
  endContent?: ReactNode;
  /**
   * Icon displayed before the label.
   */
  icon?: IconComponent;
  /**
   * Primary label.
   */
  label: ReactNode;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Ref forwarded to the layout root.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Inline styles applied to the layout root.
   */
  style?: CSSProperties;
}

/**
 * Helper layout for custom Select option rendering.
 */
export function SelectOption({
  className,
  'data-testid': dataTestId,
  description,
  endContent,
  icon,
  label,
  labelTooltip,
  ref,
  style,
}: SelectOptionProps): React.JSX.Element {
  const tooltip = isNonEmptyReactNode(labelTooltip) ? (
    <Tooltip content={labelTooltip}>
      <span className={classes.tooltipIcon}>
        <Icon icon={Info} size="sm" />
      </span>
    </Tooltip>
  ) : null;

  return (
    <Item
      as="span"
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      description={description}
      endContent={tooltip ?? endContent}
      endContentPosition={tooltip != null ? 'inline' : undefined}
      label={label}
      ref={ref}
      startContent={
        icon != null ? (
          <span className={classes.icon}>
            <Icon color="secondary" icon={icon} size="sm" />
          </span>
        ) : null
      }
      style={style}
      trailingContent={tooltip != null ? endContent : undefined}
    />
  );
}

SelectOption.displayName = 'SelectOption';
