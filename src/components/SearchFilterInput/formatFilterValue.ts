import type {
  EnumItem,
  FilterValue,
  OperatorValue,
} from 'components/SearchFilterInput/types';

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1)}...`
    : value;
}

function enumLabel(value: string, values: ReadonlyArray<EnumItem>): string {
  return values.find(item => item.value === value)?.label ?? value;
}

function numberValue(value: number, units?: string): string {
  const formatted = new Intl.NumberFormat().format(value);
  return units == null ? formatted : `${formatted} ${units}`;
}

export function formatFilterValue(
  operatorValue: OperatorValue,
  filterValue: FilterValue,
  maxLength: number,
  timezoneID?: string,
): string {
  switch (filterValue.type) {
    case 'empty':
      return '';
    case 'string':
      return truncate(filterValue.value, maxLength);
    case 'string_list': {
      const joined = filterValue.value.join(', ');
      return joined.length <= maxLength
        ? joined
        : `${filterValue.value.length} items`;
    }
    case 'integer':
      return numberValue(
        filterValue.value,
        operatorValue.type === 'integer' ? operatorValue.units : undefined,
      );
    case 'float':
      return numberValue(
        filterValue.value,
        operatorValue.type === 'float' ? operatorValue.units : undefined,
      );
    case 'time':
      return filterValue.value;
    case 'date_absolute':
      return truncate(
        new Intl.DateTimeFormat(undefined, {
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          month: 'short',
          timeZone: timezoneID,
          year: 'numeric',
        }).format(filterValue.unixSeconds * 1000),
        maxLength,
      );
    case 'date_relative':
      return filterValue.value;
    case 'date_range':
      return 'date range';
    case 'enum':
      return truncate(
        operatorValue.type === 'enum'
          ? enumLabel(filterValue.value, operatorValue.values)
          : filterValue.value,
        maxLength,
      );
    case 'enum_list': {
      const labels =
        operatorValue.type === 'enum_list'
          ? filterValue.value.map(value =>
              enumLabel(value, operatorValue.values),
            )
          : filterValue.value;
      const joined = labels.join(', ');
      return joined.length <= maxLength ? joined : `${labels.length} items`;
    }
    case 'entity_list': {
      const joined = filterValue.value.map(entity => entity.label).join(', ');
      return joined.length <= maxLength
        ? joined
        : `${filterValue.value.length} entities`;
    }
    case 'custom':
      return truncate(
        operatorValue.type === 'custom'
          ? operatorValue.getString(filterValue.value)
          : filterValue.value,
        maxLength,
      );
    case 'nested':
      return filterValue.value.length === 1
        ? '1 filter'
        : `${filterValue.value.length} filters`;
  }
}
