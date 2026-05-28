import {useMemo} from 'react';
import type {
  SearchFilterInputConfig,
  SearchFilterInputField,
  SearchFilterInputOperator,
} from './types';

export interface InternalSearchFilterInputConfig {
  readonly config: SearchFilterInputConfig;
  getDefaultOperator(fieldKey: string): SearchFilterInputOperator | undefined;
  getField(key: string): SearchFilterInputField | undefined;
  getOperator(
    fieldKey: string,
    operatorKey: string,
  ): SearchFilterInputOperator | undefined;
  getVisibleFields(): ReadonlyArray<SearchFilterInputField>;
  getVisibleOperators(
    fieldKey: string,
  ): ReadonlyArray<SearchFilterInputOperator>;
}

export function useInternalSearchFilterInputConfig(
  config: SearchFilterInputConfig,
): InternalSearchFilterInputConfig {
  return useMemo(() => {
    const fieldMap = new Map<string, SearchFilterInputField>();
    const operatorMap = new Map<
      string,
      Map<string, SearchFilterInputOperator>
    >();
    for (const field of config.fields) {
      fieldMap.set(field.key, field);
      operatorMap.set(
        field.key,
        new Map(field.operators.map(operator => [operator.key, operator])),
      );
    }
    return {
      config,
      getDefaultOperator(fieldKey) {
        const field = fieldMap.get(fieldKey);
        if (field == null) {
          return undefined;
        }
        if (field.defaultOperator != null) {
          return operatorMap.get(fieldKey)?.get(field.defaultOperator);
        }
        return field.operators[0];
      },
      getField: key => fieldMap.get(key),
      getOperator: (fieldKey, operatorKey) =>
        operatorMap.get(fieldKey)?.get(operatorKey),
      getVisibleFields: () => config.fields,
      getVisibleOperators(fieldKey) {
        return fieldMap.get(fieldKey)?.operators ?? [];
      },
    };
  }, [config]);
}
