import {useMemo} from 'react';
import type {
  DateTimeRangePart,
  EnumItem,
  SearchFilterInputConfig,
  SearchFilterInputFilter,
  SearchFilterInputOperator,
} from './types';

type FieldType =
  | 'boolean'
  | 'date'
  | 'enum'
  | 'enum_list'
  | 'number'
  | 'string'
  | 'string_list';

type FieldTypeToJS = {
  boolean: boolean;
  date: Date | number;
  enum: string;
  enum_list: ReadonlyArray<string>;
  number: number;
  string: string;
  string_list: ReadonlyArray<string>;
};

export interface FieldDefinition<
  K extends string = string,
  T extends FieldType = FieldType,
> {
  readonly enumValues?: ReadonlyArray<EnumItem>;
  readonly key: K;
  readonly label?: string;
  readonly type: T;
}

export type InferData<D extends ReadonlyArray<FieldDefinition>> = {
  [F in D[number] as F['key']]: FieldTypeToJS[F['type']];
};

const StringOps = {
  CONTAINS: 'contains',
  ENDS_WITH: 'ends_with',
  IS: 'is',
  IS_NOT: 'is_not',
  NOT_CONTAINS: 'not_contains',
  NOT_ENDS_WITH: 'not_ends_with',
  NOT_STARTS_WITH: 'not_starts_with',
  STARTS_WITH: 'starts_with',
} as const;

const NumberOps = {
  EQUALS: 'equals',
  GREATER_THAN: 'greater_than',
  GREATER_THAN_OR_EQUAL: 'greater_than_or_equal',
  LESS_THAN: 'less_than',
  LESS_THAN_OR_EQUAL: 'less_than_or_equal',
  NOT_EQUALS: 'not_equals',
} as const;

const DateOps = {
  AFTER: 'after',
  BEFORE: 'before',
  BETWEEN: 'between',
} as const;

const BooleanOps = {
  IS_FALSE: 'is_false',
  IS_TRUE: 'is_true',
} as const;

const EnumOps = {
  IS: 'is',
  IS_NOT: 'is_not',
} as const;

const ListOps = {
  IS_ANY_OF: 'is_any_of',
  IS_NONE_OF: 'is_none_of',
} as const;

function stringOperators(): {
  defaultOperator: string;
  operators: ReadonlyArray<SearchFilterInputOperator>;
} {
  return {
    defaultOperator: StringOps.CONTAINS,
    operators: [
      {key: StringOps.CONTAINS, label: 'contains', value: {type: 'string'}},
      {
        key: StringOps.NOT_CONTAINS,
        label: 'does not contain',
        value: {type: 'string'},
      },
      {
        key: StringOps.STARTS_WITH,
        label: 'starts with',
        value: {type: 'string'},
      },
      {
        key: StringOps.NOT_STARTS_WITH,
        label: 'does not start with',
        value: {type: 'string'},
      },
      {key: StringOps.ENDS_WITH, label: 'ends with', value: {type: 'string'}},
      {
        key: StringOps.NOT_ENDS_WITH,
        label: 'does not end with',
        value: {type: 'string'},
      },
      {key: StringOps.IS, label: 'is', value: {type: 'string'}},
      {key: StringOps.IS_NOT, label: 'is not', value: {type: 'string'}},
    ],
  };
}

function numberOperators(): {
  defaultOperator: string;
  operators: ReadonlyArray<SearchFilterInputOperator>;
} {
  return {
    defaultOperator: NumberOps.EQUALS,
    operators: [
      {key: NumberOps.EQUALS, label: 'is', value: {type: 'float'}},
      {key: NumberOps.NOT_EQUALS, label: 'is not', value: {type: 'float'}},
      {
        key: NumberOps.GREATER_THAN,
        label: 'is greater than',
        value: {type: 'float'},
      },
      {
        key: NumberOps.LESS_THAN,
        label: 'is less than',
        value: {type: 'float'},
      },
      {
        key: NumberOps.GREATER_THAN_OR_EQUAL,
        label: 'is greater than or equal to',
        value: {type: 'float'},
      },
      {
        key: NumberOps.LESS_THAN_OR_EQUAL,
        label: 'is less than or equal to',
        value: {type: 'float'},
      },
    ],
  };
}

function operatorsFor(definition: FieldDefinition): {
  defaultOperator: string;
  operators: ReadonlyArray<SearchFilterInputOperator>;
} {
  switch (definition.type) {
    case 'string':
      return stringOperators();
    case 'number':
      return numberOperators();
    case 'date':
      return {
        defaultOperator: DateOps.AFTER,
        operators: [
          {
            key: DateOps.BEFORE,
            label: 'is before',
            value: {type: 'date_absolute'},
          },
          {
            key: DateOps.AFTER,
            label: 'is after',
            value: {type: 'date_absolute'},
          },
          {
            key: DateOps.BETWEEN,
            label: 'is between',
            value: {type: 'date_range'},
          },
        ],
      };
    case 'boolean':
      return {
        defaultOperator: BooleanOps.IS_TRUE,
        operators: [
          {key: BooleanOps.IS_TRUE, label: 'is true', value: {type: 'empty'}},
          {key: BooleanOps.IS_FALSE, label: 'is false', value: {type: 'empty'}},
        ],
      };
    case 'enum':
      return {
        defaultOperator: EnumOps.IS,
        operators: [
          {
            key: EnumOps.IS,
            label: 'is',
            value: {type: 'enum', values: definition.enumValues ?? []},
          },
          {
            key: EnumOps.IS_NOT,
            label: 'is not',
            value: {type: 'enum', values: definition.enumValues ?? []},
          },
          {
            key: ListOps.IS_ANY_OF,
            label: 'is any of',
            value: {type: 'enum_list', values: definition.enumValues ?? []},
          },
          {
            key: ListOps.IS_NONE_OF,
            label: 'is none of',
            value: {type: 'enum_list', values: definition.enumValues ?? []},
          },
        ],
      };
    case 'enum_list':
      return {
        defaultOperator: ListOps.IS_ANY_OF,
        operators: [
          {
            key: ListOps.IS_ANY_OF,
            label: 'is any of',
            value: {type: 'enum_list', values: definition.enumValues ?? []},
          },
          {
            key: ListOps.IS_NONE_OF,
            label: 'is none of',
            value: {type: 'enum_list', values: definition.enumValues ?? []},
          },
        ],
      };
    case 'string_list':
      return {
        defaultOperator: ListOps.IS_ANY_OF,
        operators: [
          {
            key: ListOps.IS_ANY_OF,
            label: 'is any of',
            value: {type: 'string_list'},
          },
          {
            key: ListOps.IS_NONE_OF,
            label: 'is none of',
            value: {type: 'string_list'},
          },
        ],
      };
  }
}

function toUnixSeconds(value: Date | number): number {
  return value instanceof Date ? Math.floor(value.getTime() / 1000) : value;
}

function toStringArray(value: unknown): string[] | null {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return value;
  }
  return null;
}

function resolveRangePart(part: DateTimeRangePart): number {
  switch (part.type) {
    case 'NOW':
      return Math.floor(Date.now() / 1000);
    case 'ABSOLUTE':
      return part.unixSeconds;
    case 'RELATIVE': {
      const multipliers = {
        day: 86400,
        hour: 3600,
        minute: 60,
        month: 2592000,
        second: 1,
        week: 604800,
        year: 31536000,
      } satisfies Record<
        Extract<DateTimeRangePart, {type: 'RELATIVE'}>['unit'],
        number
      >;
      return Math.floor(
        Date.now() / 1000 - part.backValue * multipliers[part.unit],
      );
    }
  }
}

function matchesFilter(
  row: Record<string, unknown>,
  filter: SearchFilterInputFilter,
): boolean {
  const fieldValue = row[filter.field];
  const {operator, value} = filter;

  switch (value.type) {
    case 'empty':
      return operator === BooleanOps.IS_TRUE
        ? Boolean(fieldValue) === true
        : operator === BooleanOps.IS_FALSE
          ? Boolean(fieldValue) === false
          : true;
    case 'string': {
      if (typeof fieldValue !== 'string') {
        return false;
      }
      const source = fieldValue.toLowerCase();
      const target = value.value.toLowerCase();
      switch (operator) {
        case StringOps.CONTAINS:
          return source.includes(target);
        case StringOps.NOT_CONTAINS:
          return !source.includes(target);
        case StringOps.STARTS_WITH:
          return source.startsWith(target);
        case StringOps.NOT_STARTS_WITH:
          return !source.startsWith(target);
        case StringOps.ENDS_WITH:
          return source.endsWith(target);
        case StringOps.NOT_ENDS_WITH:
          return !source.endsWith(target);
        case StringOps.IS:
          return source === target;
        case StringOps.IS_NOT:
          return source !== target;
        default:
          return true;
      }
    }
    case 'float':
    case 'integer': {
      if (typeof fieldValue !== 'number') {
        return false;
      }
      switch (operator) {
        case NumberOps.EQUALS:
          return fieldValue === value.value;
        case NumberOps.NOT_EQUALS:
          return fieldValue !== value.value;
        case NumberOps.GREATER_THAN:
          return fieldValue > value.value;
        case NumberOps.LESS_THAN:
          return fieldValue < value.value;
        case NumberOps.GREATER_THAN_OR_EQUAL:
          return fieldValue >= value.value;
        case NumberOps.LESS_THAN_OR_EQUAL:
          return fieldValue <= value.value;
        default:
          return true;
      }
    }
    case 'date_absolute': {
      if (!(fieldValue instanceof Date) && typeof fieldValue !== 'number') {
        return false;
      }
      const unixSeconds = toUnixSeconds(fieldValue);
      return operator === DateOps.BEFORE
        ? unixSeconds < value.unixSeconds
        : operator === DateOps.AFTER
          ? unixSeconds > value.unixSeconds
          : true;
    }
    case 'date_range': {
      if (!(fieldValue instanceof Date) && typeof fieldValue !== 'number') {
        return false;
      }
      const unixSeconds = toUnixSeconds(fieldValue);
      return (
        unixSeconds >= resolveRangePart(value.value.start) &&
        unixSeconds <= resolveRangePart(value.value.end)
      );
    }
    case 'enum':
      return typeof fieldValue === 'string'
        ? operator === EnumOps.IS
          ? fieldValue === value.value
          : operator === EnumOps.IS_NOT
            ? fieldValue !== value.value
            : true
        : false;
    case 'enum_list':
    case 'string_list': {
      const values = toStringArray(fieldValue);
      if (values == null) {
        return false;
      }
      return operator === ListOps.IS_ANY_OF
        ? values.some(item => value.value.includes(item))
        : operator === ListOps.IS_NONE_OF
          ? values.every(item => !value.value.includes(item))
          : true;
    }
    case 'custom':
    case 'date_relative':
    case 'entity_list':
    case 'nested':
    case 'time':
      return true;
  }
}

export function createSearchFilterInputConfig<
  const D extends ReadonlyArray<FieldDefinition>,
>(
  definitions: D,
  configName?: string,
): {
  applyFilters: <T extends InferData<D>>(
    filters: ReadonlyArray<SearchFilterInputFilter>,
    data: ReadonlyArray<T>,
  ) => T[];
  config: SearchFilterInputConfig;
} {
  const config: SearchFilterInputConfig = {
    fields: definitions.map(definition => ({
      key: definition.key,
      label: definition.label ?? definition.key,
      ...operatorsFor(definition),
    })),
    name: configName ?? 'SearchFilterInputConfig',
  };

  return {
    applyFilters(filters, data) {
      return filters.length === 0
        ? [...data]
        : data.filter(row =>
            filters.every(filter =>
              matchesFilter(row as Record<string, unknown>, filter),
            ),
          );
    },
    config,
  };
}

export function useSearchFilterInputConfig<
  const D extends ReadonlyArray<FieldDefinition>,
>(
  definitions: D,
  configName?: string,
): {
  applyFilters: <T extends InferData<D>>(
    filters: ReadonlyArray<SearchFilterInputFilter>,
    data: ReadonlyArray<T>,
  ) => T[];
  config: SearchFilterInputConfig;
} {
  return useMemo(
    () => createSearchFilterInputConfig(definitions, configName),
    [configName, definitions],
  );
}
