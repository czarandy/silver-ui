'use client';

import {useMemo} from 'react';
import type {SearchSource} from 'components/AutocompleteInput';
import type {InternalSearchFilterInputConfig} from 'components/SearchFilterInput/internalConfig';
import type {
  FilterValue,
  SearchFilterInputItem,
  SearchFilterInputOperator,
} from 'components/SearchFilterInput/types';

export function useSearchFilterInputSource(
  config: InternalSearchFilterInputConfig,
): SearchSource<SearchFilterInputItem> {
  return useMemo(() => {
    const allItems = buildFieldItems(config);

    return {
      bootstrap: () => allItems,
      search(query: string): SearchFilterInputItem[] {
        const lower = query.toLowerCase().trim();
        if (lower === '') {
          return allItems;
        }

        const results: SearchFilterInputItem[] = [];
        const seen = new Set<string>();

        for (const field of config.getVisibleFields()) {
          if (
            field.comboboxMinQueryLength != null &&
            lower.length < field.comboboxMinQueryLength
          ) {
            continue;
          }

          const fieldMatches =
            field.label.toLowerCase().includes(lower) ||
            field.comboboxAliases?.some(alias =>
              alias.toLowerCase().includes(lower),
            ) === true;

          if (fieldMatches) {
            const defaultOperator = config.getDefaultOperator(field.key);
            if (!seen.has(field.key)) {
              seen.add(field.key);
              results.push({
                auxiliaryData: {
                  fieldKey: field.key,
                  operatorKey: defaultOperator?.key,
                },
                id: field.key,
                label: field.label,
              });
            }
          }

          for (const operator of field.operators) {
            const combinedLabel =
              `${field.label} ${operator.label}`.toLowerCase();
            if (combinedLabel.includes(lower)) {
              const id = `${field.key}:${operator.key}`;
              if (!seen.has(id)) {
                seen.add(id);
                results.push({
                  auxiliaryData: {
                    fieldKey: field.key,
                    operatorKey: operator.key,
                  },
                  id,
                  label: `${field.label} ${operator.label}`,
                });
              }
            }
          }
        }

        for (const field of config.getVisibleFields()) {
          if (field.isValueMatchAllowed === false) {
            continue;
          }

          const fieldLabel = field.label.toLowerCase();
          let hasExactOperatorMatch = false;

          for (const operator of field.operators) {
            const prefix = `${fieldLabel} ${operator.label.toLowerCase()} `;
            if (lower.startsWith(prefix) && lower.length > prefix.length) {
              const rawValue = query.slice(prefix.length);
              const matches = resolveValueMatches(operator, rawValue);
              if (matches.length > 0) {
                hasExactOperatorMatch = true;
              }
              for (const match of matches) {
                const id = `${field.key}:${operator.key}:value:${match.displayValue}`;
                if (!seen.has(id)) {
                  seen.add(id);
                  results.push({
                    auxiliaryData: {
                      fieldKey: field.key,
                      filterValue: match.filterValue,
                      operatorKey: operator.key,
                    },
                    id,
                    label: `${field.label} ${operator.label} ${
                      match.quoted
                        ? `"${match.displayValue}"`
                        : match.displayValue
                    }`,
                  });
                }
              }
            }
          }

          const fieldPrefix = `${fieldLabel} `;
          if (
            !hasExactOperatorMatch &&
            lower.startsWith(fieldPrefix) &&
            lower.length > fieldPrefix.length
          ) {
            const remainder = lower.slice(fieldPrefix.length);
            const isOperatorPrefix = field.operators.some(operator =>
              operator.label.toLowerCase().startsWith(remainder),
            );
            if (!isOperatorPrefix) {
              const rawValue = query.slice(fieldPrefix.length);
              for (const operator of field.operators) {
                const matches = resolveValueMatches(operator, rawValue);
                for (const match of matches) {
                  const id = `${field.key}:${operator.key}:value:${match.displayValue}`;
                  if (!seen.has(id)) {
                    seen.add(id);
                    results.push({
                      auxiliaryData: {
                        fieldKey: field.key,
                        filterValue: match.filterValue,
                        operatorKey: operator.key,
                      },
                      id,
                      label: `${field.label} ${operator.label} ${
                        match.quoted
                          ? `"${match.displayValue}"`
                          : match.displayValue
                      }`,
                    });
                  }
                }
              }
            }
          }
        }

        const contentFieldKey = config.config.contentSearchFieldKey;
        const hasExactMatch = config
          .getVisibleFields()
          .some(
            field =>
              field.label.toLowerCase() === lower ||
              field.operators.some(
                operator =>
                  `${field.label} ${operator.label}`.toLowerCase() === lower,
              ),
          );
        if (contentFieldKey != null && !hasExactMatch) {
          const contentField = config.getField(contentFieldKey);
          const contentOperator = config.getDefaultOperator(contentFieldKey);
          if (contentField != null && contentOperator != null) {
            results.unshift({
              auxiliaryData: {
                fieldKey: contentFieldKey,
                filterValue: {type: 'string', value: query},
                operatorKey: contentOperator.key,
              },
              id: `__content_search__:${query}`,
              label: `"${query}"`,
            });
          }
        }

        return results;
      },
    };
  }, [config]);
}

interface ValueMatch {
  displayValue: string;
  filterValue: FilterValue;
  quoted: boolean;
}

function resolveValueMatches(
  operator: SearchFilterInputOperator,
  rawValue: string,
): ValueMatch[] {
  if (operator.value.type === 'string') {
    return [
      {
        displayValue: rawValue,
        filterValue: {type: 'string', value: rawValue},
        quoted: true,
      },
    ];
  }

  if (operator.value.type === 'string_list') {
    return [
      {
        displayValue: rawValue,
        filterValue: {type: 'string_list', value: [rawValue]},
        quoted: true,
      },
    ];
  }

  if (operator.value.type === 'enum') {
    const lower = rawValue.toLowerCase();
    return operator.value.values
      .filter(item => item.label.toLowerCase().includes(lower))
      .map(item => ({
        displayValue: item.label,
        filterValue: {type: 'enum', value: item.value},
        quoted: false,
      }));
  }

  if (operator.value.type === 'enum_list') {
    const lower = rawValue.toLowerCase();
    return operator.value.values
      .filter(item => item.label.toLowerCase().includes(lower))
      .map(item => ({
        displayValue: item.label,
        filterValue: {type: 'enum_list', value: [item.value]},
        quoted: false,
      }));
  }

  return [];
}

function buildFieldItems(
  config: InternalSearchFilterInputConfig,
): SearchFilterInputItem[] {
  return config.getVisibleFields().map(field => {
    const defaultOperator = config.getDefaultOperator(field.key);
    return {
      auxiliaryData: {
        fieldKey: field.key,
        operatorKey: defaultOperator?.key,
      },
      id: field.key,
      label: field.label,
    };
  });
}
