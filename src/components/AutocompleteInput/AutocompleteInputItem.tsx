/* eslint-disable silver-ui/require-component-props -- discriminated union: custom-element items render item.element directly; passthrough props only apply to standard items */
import type {CSSProperties, ReactNode, Ref} from 'react';
import {autocompleteItemRecipe} from 'components/AutocompleteInput/AutocompleteInput.recipe';
import type {SearchableItem} from 'components/AutocompleteInput/types';
import {Icon, type IconComponent} from 'components/Icon';
import {Text} from 'components/Text';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

/**
 * Props for an item with a custom `element`. The element is rendered
 * directly — layout props like `icon` and `description` do not apply.
 */
interface AutocompleteInputCustomItemProps {
  /**
   * Search result item with custom element content.
   */
  item: SearchableItem & {element: ReactNode};
}

/**
 * Props for a standard item rendered with the default layout.
 */
interface AutocompleteInputStandardItemProps {
  /**
   * Additional CSS class names applied to the item layout.
   */
  className?: string;
  /**
   * Test ID applied to the item layout.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Icon or avatar rendered before the label.
   */
  icon?: IconComponent;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Search result item without a custom element.
   */
  item: SearchableItem & {element?: undefined};
  /**
   * Ref forwarded to the item layout.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the item layout.
   */
  style?: CSSProperties;
}

export type AutocompleteInputItemProps =
  AutocompleteInputCustomItemProps | AutocompleteInputStandardItemProps;

/**
 * Default layout for AutocompleteInput and TagsInput result rows.
 *
 * When the item has a pre-rendered `element`, it is returned directly.
 * Otherwise the component renders a flex row with an optional icon,
 * primary label, and description.
 */
export function AutocompleteInputItem(
  props: AutocompleteInputItemProps,
): React.JSX.Element {
  if (isNonEmptyReactNode(props.item.element)) {
    return <>{props.item.element}</>;
  }

  const {
    className,
    'data-testid': dataTestId,
    description,
    icon,
    isDisabled = false,
    item,
    ref,
    style,
  } = props as AutocompleteInputStandardItemProps;

  const classes = autocompleteItemRecipe({isDisabled});

  return (
    <div
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {icon != null ? (
        <span className={classes.icon}>
          <Icon color="secondary" icon={icon} size="sm" />
        </span>
      ) : null}
      <span className={classes.text}>
        <Text as="span" color="inherit" type="label">
          {item.label}
        </Text>
        {isNonEmptyReactNode(description) ? (
          <Text as="span" color="secondary" type="supporting">
            {description}
          </Text>
        ) : null}
      </span>
    </div>
  );
}

AutocompleteInputItem.displayName = 'AutocompleteInputItem';
