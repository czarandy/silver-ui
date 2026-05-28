/* eslint-disable silver-ui/require-component-props */

import {css} from 'styled-system/css';
import {Tag} from '../Tag';
import {formatFilterValue} from './formatFilterValue';
import {useInternalSearchFilterInputConfig} from './internalConfig';
import type {SearchFilterInputTagProps} from './types';

const styles = {
  value: css({
    fontWeight: 'bold',
  }),
} as const;

/**
 * Default tag renderer for a SearchFilterInput filter.
 */
export function SearchFilterInputTag({
  config: configFromProps,
  field,
  filter,
  isDisabled,
  maxLength,
  onClick,
  onRemove,
  operator,
}: SearchFilterInputTagProps): React.JSX.Element {
  const config = useInternalSearchFilterInputConfig(configFromProps);
  const tagLabel = `${field.label}${operator.label ? `: ${operator.label}` : ''}`;
  const adjustedMaxLength = Math.max(
    maxLength - field.label.length - operator.label.length,
    10,
  );
  const value = formatFilterValue(
    config,
    operator.value,
    filter.value,
    adjustedMaxLength,
  );

  return (
    <Tag
      endContent={
        value === '' ? undefined : <span className={styles.value}>{value}</span>
      }
      isDisabled={isDisabled}
      label={tagLabel}
      onClick={
        onClick == null
          ? undefined
          : event => {
              event.stopPropagation();
              onClick();
            }
      }
      onRemove={onRemove}
    />
  );
}

SearchFilterInputTag.displayName = 'SearchFilterInputTag';
