/* eslint-disable silver-ui/require-component-props */
'use client';

import {formatFilterValue} from 'components/SearchFilterInput/formatFilterValue';
import type {SearchFilterInputTagProps} from 'components/SearchFilterInput/types';
import {Tag} from 'components/Tag';
import {css} from 'styled-system/css';

const styles = {
  value: css({
    fontWeight: 'bold',
  }),
  entityPhoto: css({
    width: '16px',
    height: '16px',
    borderRadius: 'full',
    objectFit: 'cover',
    flexShrink: 0,
  }),
} as const;

/**
 * Returns the entity photo URL when the filter value is an entity_list
 * with exactly one entity that has a photo.
 */
function getSingleEntityPhoto(
  value: SearchFilterInputTagProps['filter']['value'],
): string | undefined {
  if (value.type !== 'entity_list') {
    return undefined;
  }
  const entities = value.value;
  if (entities.length === 1 && entities[0].photo != null) {
    return entities[0].photo;
  }
  return undefined;
}

/**
 * Default tag renderer for a SearchFilterInput filter.
 */
export function SearchFilterInputTag({
  field,
  filter,
  isDisabled,
  maxLength,
  onClick,
  onRemove,
  operator,
}: SearchFilterInputTagProps): React.JSX.Element {
  const tagLabel = `${field.label}${operator.label ? ` ${operator.label}` : ''}`;
  const adjustedMaxLength = Math.max(
    maxLength - field.label.length - operator.label.length,
    10,
  );
  const value = formatFilterValue(
    operator.value,
    filter.value,
    adjustedMaxLength,
  );

  const entityPhoto = getSingleEntityPhoto(filter.value);

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
      startContent={
        entityPhoto != null ? (
          <img alt="" className={styles.entityPhoto} src={entityPhoto} />
        ) : undefined
      }
    />
  );
}

SearchFilterInputTag.displayName = 'SearchFilterInputTag';
