import {Text} from 'components/Text';
import {necessityIndicatorRecipe} from 'internal/NecessityIndicator.recipe';

const indicatorClass = necessityIndicatorRecipe();

interface NecessityIndicatorProps {
  /**
   * Whether the field or group is explicitly optional.
   */
  isOptional?: boolean;
  /**
   * Whether the field or group is explicitly required.
   */
  isRequired?: boolean;
  /**
   * Text size of the indicator. Omit to use the supporting-text default.
   */
  size?: 'xs';
}

/**
 * The " · Optional" / " · Required" necessity indicator rendered inside a
 * label or legend. Shared by Field, CheckboxInput, and Fieldset so the
 * wording, separator, and muted styling cannot drift between them.
 */
export function NecessityIndicator({
  isOptional = false,
  isRequired = false,
  size,
}: NecessityIndicatorProps): React.JSX.Element | null {
  const statusText = isOptional ? 'Optional' : isRequired ? 'Required' : null;
  if (statusText == null) {
    return null;
  }
  return (
    <Text
      as="span"
      className={indicatorClass}
      color="secondary"
      size={size}
      type="supporting">
      <span aria-hidden="true"> · </span>
      {statusText}
    </Text>
  );
}

NecessityIndicator.displayName = 'NecessityIndicator';
