/* eslint-disable silver-ui/require-component-props, jsx-a11y-x/no-static-element-interactions, @eslint-react/no-array-index-key */

import {X} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {css} from 'styled-system/css';
import {Button} from '../Button';
import {Select} from '../Select';
import {HStack, VStack} from '../Stack';
import {SearchFilterInputValueEditor} from './SearchFilterInputValueEditor';
import type {InternalSearchFilterInputConfig} from './internalConfig';
import type {
  FilterValue,
  OperatorValue,
  PartialFilter,
  SearchFilterInputFilter,
} from './types';

export interface SearchFilterInputEditPopoverProps {
  /**
   * Internal config lookup helpers.
   */
  config: InternalSearchFilterInputConfig;
  /**
   * Partial filter being created or edited.
   */
  filter: PartialFilter;
  /**
   * Whether controls are read-only.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Maximum number of items shown in the operator dropdown menu.
   */
  maxOperatorMenuItems?: number;
  /**
   * Editor mode.
   */
  mode: 'create' | 'edit';
  /**
   * Called when editing is cancelled.
   */
  onCancel: () => void;
  /**
   * Called with a completed filter, or null to delete.
   */
  onSave: (filter: SearchFilterInputFilter | null) => void;
  /**
   * Save button label.
   * @default 'Apply'
   */
  saveButtonLabel?: string;
}

interface EditablePartialFilter {
  _subFilters?: EditablePartialFilter[];
  field: string;
  operator?: string;
  value?: FilterValue;
}

const styles = {
  root: css({
    overflow: 'hidden',
    minW: '100',
  }),
  content: css({
    p: '4',
  }),
  footer: css({
    px: '3',
    pb: '3',
  }),
  fieldSelector: css({
    flexShrink: 0,
  }),
  operatorSelector: css({
    flex: '1 0 auto',
  }),
  valueEditor: css({
    flex: '2 1 0',
    minW: 0,
  }),
  nestedList: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    w: 'full',
    listStyleType: 'none',
    m: 0,
    p: 0,
  }),
  nestedNode: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    ps: '3',
    borderInlineStartWidth: 'default',
    borderInlineStartStyle: 'solid',
    borderColor: 'border',
  }),
  nestedRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    w: 'full',
  }),
  nestedCell: css({
    minW: 0,
  }),
  nestedField: css({
    flex: '0 0 200px',
  }),
  nestedOperator: css({
    flex: '0 0 180px',
  }),
  nestedValue: css({
    flex: '2 1 0',
  }),
} as const;

function initEditableFilter(
  config: InternalSearchFilterInputConfig,
  filter: SearchFilterInputFilter,
): EditablePartialFilter {
  const operator = config.getOperator(filter.field, filter.operator);
  if (operator?.value.type === 'nested' && filter.value.type === 'nested') {
    return {
      _subFilters: filter.value.value.map(subFilter =>
        initEditableFilter(config, subFilter),
      ),
      field: filter.field,
      operator: filter.operator,
      value: filter.value,
    };
  }
  return {
    field: filter.field,
    operator: filter.operator,
    value: filter.value,
  };
}

function isEditableFilterComplete(
  config: InternalSearchFilterInputConfig,
  filter: EditablePartialFilter,
): boolean {
  if (filter.operator == null) {
    return false;
  }
  const operator = config.getOperator(filter.field, filter.operator);
  if (operator?.value.type === 'nested') {
    const subFilters = filter._subFilters ?? [];
    return (
      subFilters.length > 0 &&
      subFilters.every(subFilter => isEditableFilterComplete(config, subFilter))
    );
  }
  return filter.value != null;
}

function editableToCompleteFilter(
  config: InternalSearchFilterInputConfig,
  filter: EditablePartialFilter,
): SearchFilterInputFilter | null {
  if (filter.operator == null) {
    return null;
  }
  const operator = config.getOperator(filter.field, filter.operator);
  if (operator?.value.type === 'nested') {
    return {
      field: filter.field,
      operator: filter.operator,
      value: {
        type: 'nested',
        value: (filter._subFilters ?? [])
          .map(subFilter => editableToCompleteFilter(config, subFilter))
          .filter(
            (subFilter): subFilter is SearchFilterInputFilter =>
              subFilter != null,
          ),
      },
    };
  }
  if (filter.value == null) {
    return null;
  }
  return {field: filter.field, operator: filter.operator, value: filter.value};
}

function NestedSubFilterRow({
  config,
  isReadOnly,
  onChange,
  onRemove,
  subFilter,
}: {
  config: InternalSearchFilterInputConfig;
  isReadOnly: boolean;
  onChange: (subFilter: EditablePartialFilter) => void;
  onRemove: () => void;
  subFilter: EditablePartialFilter;
}): React.JSX.Element {
  const fieldOptions = useMemo(
    () =>
      config
        .getVisibleFields()
        .map(field => ({label: field.label, value: field.key})),
    [config],
  );
  const operatorOptions = useMemo(
    () =>
      config
        .getVisibleOperators(subFilter.field)
        .map(operator => ({label: operator.label, value: operator.key})),
    [config, subFilter.field],
  );
  const currentOperator =
    subFilter.operator == null
      ? undefined
      : config.getOperator(subFilter.field, subFilter.operator);
  const operatorValue: OperatorValue | undefined = currentOperator?.value;
  const isNested = operatorValue?.type === 'nested';
  const isEmpty = operatorValue?.type === 'empty';

  return (
    <div className={styles.nestedRow}>
      <div className={`${styles.nestedCell} ${styles.nestedField}`}>
        <Select
          isDisabled={isReadOnly}
          isLabelHidden
          label="Field"
          onChange={fieldKey => {
            if (fieldKey == null) {
              return;
            }
            const defaultOperator = config.getDefaultOperator(fieldKey);
            const nextOperator =
              defaultOperator == null
                ? undefined
                : config.getOperator(fieldKey, defaultOperator.key);
            onChange({
              _subFilters:
                nextOperator?.value.type === 'nested' ? [] : undefined,
              field: fieldKey,
              operator: defaultOperator?.key,
              value: undefined,
            });
          }}
          options={fieldOptions}
          value={subFilter.field}
        />
      </div>
      {operatorOptions.length > 0 ? (
        <div className={`${styles.nestedCell} ${styles.nestedOperator}`}>
          <Select
            isDisabled={isReadOnly}
            isLabelHidden
            label="Operator"
            onChange={operatorKey => {
              if (operatorKey == null) {
                return;
              }
              const nextOperator = config.getOperator(
                subFilter.field,
                operatorKey,
              );
              const keepValue =
                nextOperator != null &&
                nextOperator.value.type === currentOperator?.value.type;
              onChange({
                ...subFilter,
                _subFilters:
                  nextOperator?.value.type === 'nested'
                    ? (subFilter._subFilters ?? [])
                    : undefined,
                operator: operatorKey,
                value: keepValue ? subFilter.value : undefined,
              });
            }}
            options={operatorOptions}
            value={subFilter.operator ?? null}
          />
        </div>
      ) : null}
      {operatorValue != null && !isEmpty && !isNested ? (
        <div className={`${styles.nestedCell} ${styles.nestedValue}`}>
          <SearchFilterInputValueEditor
            config={config}
            filterValue={subFilter.value}
            isDisabled={isReadOnly}
            onChange={value => onChange({...subFilter, value})}
            operatorValue={operatorValue}
          />
        </div>
      ) : null}
      {!isReadOnly ? (
        <Button
          icon={X}
          isIconOnly
          label="Remove filter"
          onClick={onRemove}
          size="sm"
          variant="ghost"
        />
      ) : null}
    </div>
  );
}

function NestedEditor({
  config,
  isReadOnly,
  onPartialFilterChange,
  onOperatorChange,
  operatorOptions,
  partialFilter,
}: {
  config: InternalSearchFilterInputConfig;
  isReadOnly: boolean;
  onOperatorChange: (operatorKey: string) => void;
  onPartialFilterChange: Dispatch<SetStateAction<PartialFilter>>;
  operatorOptions: {label: string; value: string}[];
  partialFilter: PartialFilter;
}): React.JSX.Element {
  const [subFilters, setSubFilters] = useState<EditablePartialFilter[]>(() => {
    if (partialFilter.value?.type === 'nested') {
      return partialFilter.value.value.map(filter =>
        initEditableFilter(config, filter),
      );
    }
    return [];
  });

  // Pushes the edited sub-filter list back up to the parent. Uses the
  // functional updater form so it always merges into the *latest* parent state
  // (preserving field/operator) rather than a value captured at render time,
  // and is invoked as a sibling of setSubFilters — never inside its updater —
  // to keep both state updaters pure.
  const syncToParent = useCallback(
    (nextSubFilters: EditablePartialFilter[]) => {
      const isComplete =
        nextSubFilters.length > 0 &&
        nextSubFilters.every(filter =>
          isEditableFilterComplete(config, filter),
        );
      onPartialFilterChange(previous => ({
        ...previous,
        value: isComplete
          ? {
              type: 'nested',
              value: nextSubFilters
                .map(filter => editableToCompleteFilter(config, filter))
                .filter(
                  (filter): filter is SearchFilterInputFilter => filter != null,
                ),
            }
          : undefined,
      }));
    },
    [config, onPartialFilterChange],
  );

  const addSubFilter = () => {
    const fields = config.getVisibleFields();
    if (fields.length === 0) {
      return;
    }
    const field = fields[0];
    const operator = config.getDefaultOperator(field.key);
    const next: EditablePartialFilter = {
      field: field.key,
      operator: operator?.key,
      value: undefined,
      _subFilters: operator?.value.type === 'nested' ? [] : undefined,
    };
    const updated = [...subFilters, next];
    setSubFilters(updated);
    syncToParent(updated);
  };

  const updateSubFilter = (
    index: number,
    nextSubFilter: EditablePartialFilter,
  ) => {
    const updated = subFilters.map((subFilter, i) =>
      i === index ? nextSubFilter : subFilter,
    );
    setSubFilters(updated);
    syncToParent(updated);
  };

  const removeSubFilter = (index: number) => {
    const updated = subFilters.filter((_, i) => i !== index);
    setSubFilters(updated);
    syncToParent(updated);
  };

  return (
    <VStack gap={2}>
      {operatorOptions.length > 1 ? (
        <Select
          isDisabled={isReadOnly}
          isLabelHidden
          label="Group operator"
          onChange={operatorKey => {
            if (operatorKey != null) {
              onOperatorChange(operatorKey);
            }
          }}
          options={operatorOptions}
          value={partialFilter.operator ?? null}
        />
      ) : null}
      <ul className={styles.nestedList} role="group">
        {subFilters.map((subFilter, index) => (
          <li className={styles.nestedNode} key={`${subFilter.field}-${index}`}>
            <NestedSubFilterRow
              config={config}
              isReadOnly={isReadOnly}
              onChange={nextSubFilter => updateSubFilter(index, nextSubFilter)}
              onRemove={() => removeSubFilter(index)}
              subFilter={subFilter}
            />
          </li>
        ))}
      </ul>
      {!isReadOnly ? (
        <Button
          label="+ Add filter"
          onClick={addSubFilter}
          size="sm"
          variant="ghost"
        />
      ) : null}
    </VStack>
  );
}

export function SearchFilterInputEditPopover({
  config,
  filter: initialFilter,
  isReadOnly = false,
  maxOperatorMenuItems,
  mode,
  onCancel,
  onSave,
  saveButtonLabel = 'Apply',
}: SearchFilterInputEditPopoverProps): React.JSX.Element {
  const [partialFilter, setPartialFilter] =
    useState<PartialFilter>(initialFilter);
  const valueEditorRef = useRef<HTMLDivElement>(null);
  const currentOperator =
    partialFilter.operator == null
      ? undefined
      : config.getOperator(partialFilter.field, partialFilter.operator);
  const operatorValue = currentOperator?.value;
  const isEmptyType = operatorValue?.type === 'empty';
  const isNestedType = operatorValue?.type === 'nested';

  useEffect(() => {
    let innerFrame: number | undefined;
    const frame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        valueEditorRef.current
          ?.querySelector<HTMLElement>(
            'input:not([disabled]), button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          )
          ?.focus();
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (innerFrame != null) {
        cancelAnimationFrame(innerFrame);
      }
    };
  }, []);

  useEffect(() => {
    if (isEmptyType && partialFilter.operator != null) {
      onSave({
        field: partialFilter.field,
        operator: partialFilter.operator,
        value: {type: 'empty'},
      });
    }
  }, [isEmptyType, onSave, partialFilter.field, partialFilter.operator]);

  const fieldOptions = useMemo(
    () =>
      config
        .getVisibleFields()
        .map(field => ({label: field.label, value: field.key})),
    [config],
  );
  const operatorOptions = useMemo(() => {
    const allOptions = config
      .getVisibleOperators(partialFilter.field)
      .map(operator => ({label: operator.label, value: operator.key}));
    return maxOperatorMenuItems != null
      ? allOptions.slice(0, maxOperatorMenuItems)
      : allOptions;
  }, [config, maxOperatorMenuItems, partialFilter.field]);
  const isSaveDisabled =
    partialFilter.operator == null || partialFilter.value == null;

  const handleSave = () => {
    if (partialFilter.operator != null && partialFilter.value != null) {
      onSave({
        field: partialFilter.field,
        operator: partialFilter.operator,
        value: partialFilter.value,
      });
    }
  };

  const handleFieldChange = (fieldKey: string | null) => {
    if (fieldKey == null) {
      return;
    }
    const defaultOperator = config.getDefaultOperator(fieldKey);
    setPartialFilter({
      field: fieldKey,
      operator: defaultOperator?.key,
      value: undefined,
    });
  };

  const handleOperatorChange = (operatorKey: string | null) => {
    if (operatorKey == null) {
      return;
    }
    const nextOperator = config.getOperator(partialFilter.field, operatorKey);
    const keepValue =
      nextOperator != null &&
      nextOperator.value.type === currentOperator?.value.type;
    setPartialFilter(previous => ({
      ...previous,
      operator: operatorKey,
      value: keepValue ? previous.value : undefined,
    }));
  };

  const footer = !isEmptyType ? (
    <div className={styles.footer}>
      <HStack gap={2} hAlign="between">
        {!isReadOnly && mode === 'edit' ? (
          <Button
            label="Delete"
            onClick={() => onSave(null)}
            size="sm"
            variant="ghost"
          />
        ) : (
          <div />
        )}
        <HStack gap={2}>
          <Button label="Cancel" onClick={onCancel} size="sm" variant="ghost" />
          <Button
            isDisabled={isSaveDisabled}
            label={saveButtonLabel}
            onClick={handleSave}
            size="sm"
            variant="primary"
          />
        </HStack>
      </HStack>
    </div>
  ) : null;

  return (
    <div
      className={styles.root}
      onKeyDown={event => {
        if (event.key === 'Enter' && !isSaveDisabled) {
          const target = event.target as HTMLElement;
          const isInsideSelect =
            target.closest('[role="listbox"]') != null ||
            target.closest('[role="option"]') != null ||
            target.getAttribute('aria-expanded') === 'true';
          if (!isInsideSelect) {
            event.preventDefault();
            handleSave();
          }
        } else if (event.key === 'Escape' && !event.defaultPrevented) {
          event.preventDefault();
          onCancel();
        }
      }}>
      <div className={styles.content}>
        <VStack gap={2}>
          <HStack gap={2}>
            <div className={styles.fieldSelector}>
              <Select
                isDisabled={isReadOnly}
                isLabelHidden
                label="Field"
                onChange={handleFieldChange}
                options={fieldOptions}
                value={partialFilter.field}
              />
            </div>
            {!isNestedType && operatorOptions.length > 0 ? (
              <div className={styles.operatorSelector}>
                <Select
                  isDisabled={isReadOnly}
                  isLabelHidden
                  label="Operator"
                  onChange={handleOperatorChange}
                  options={operatorOptions}
                  value={partialFilter.operator ?? null}
                />
              </div>
            ) : null}
            {operatorValue != null && !isEmptyType && !isNestedType ? (
              <div className={styles.valueEditor} ref={valueEditorRef}>
                <SearchFilterInputValueEditor
                  config={config}
                  filterValue={partialFilter.value}
                  isDisabled={isReadOnly}
                  onChange={(value, shouldSave) => {
                    const updated = {...partialFilter, value};
                    setPartialFilter(updated);
                    if (shouldSave === true && updated.operator != null) {
                      onSave({
                        field: updated.field,
                        operator: updated.operator,
                        value: updated.value,
                      });
                    }
                  }}
                  operatorValue={operatorValue}
                />
              </div>
            ) : null}
          </HStack>
          {isNestedType ? (
            <NestedEditor
              config={config}
              isReadOnly={isReadOnly}
              onOperatorChange={operatorKey =>
                setPartialFilter(previous => ({
                  ...previous,
                  operator: operatorKey,
                }))
              }
              onPartialFilterChange={setPartialFilter}
              operatorOptions={operatorOptions}
              partialFilter={partialFilter}
            />
          ) : null}
        </VStack>
      </div>
      {footer}
    </div>
  );
}

SearchFilterInputEditPopover.displayName = 'SearchFilterInputEditPopover';
