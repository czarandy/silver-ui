import {Filter, X} from 'lucide-react';
import {createContext, use, useMemo, type ReactNode} from 'react';
import {css} from 'styled-system/css';
import {Button} from '../../../Button';
import {createStaticSource, type SearchableItem} from '../../../Combobox';
import {DateInput, type ISODateString} from '../../../DateInput';
import {MultiSelect} from '../../../MultiSelect';
import {NumberInput} from '../../../NumberInput';
import {Popover} from '../../../Popover';
import type {
  FilterValue,
  FloatOperatorValue,
  IntegerOperatorValue,
  OperatorValue,
  SearchFilterInputConfig,
  SearchFilterInputField,
  SearchFilterInputFilter,
  SearchFilterInputOperator,
  StringListOperatorValue,
  EntityListOperatorValue,
  EnumListOperatorValue,
  EnumOperatorValue,
} from '../../../SearchFilterInput';
import {Select} from '../../../Select';
import {TagsInput} from '../../../TagsInput';
import {TextInput} from '../../../TextInput';
import {TimeInput, type ISOTimeString} from '../../../TimeInput';
import type {
  HeaderCellRenderProps,
  TableColumn,
  TablePlugin,
} from '../../types';

export type TableFilterValue = number | string | string[];
export type TableFilterState = Record<string, TableFilterValue | undefined>;
export type TableFilterVariant = 'inline' | 'inline-compact' | 'popover';

export interface TableFilterFieldRef {
  field: string;
  operator?: string;
}

export interface UseTableFilteringConfig {
  filters: TableFilterState;
  onFilterChange: (columnKey: string, value: TableFilterValue | null) => void;
  searchConfig: SearchFilterInputConfig;
  variant?: TableFilterVariant;
}

interface FilterStore {
  getConfig: () => UseTableFilteringConfig;
}

const FilterStoreContext = createContext<FilterStore | null>(null);
FilterStoreContext.displayName = 'TableFilterStoreContext';

const styles = {
  afterInline: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
    mt: '1',
    minW: 0,
  }),
  afterPopover: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  }),
  inlineWrapper: css({
    mt: '1',
  }),
  popoverActions: css({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '2',
    mt: '2',
  }),
  popoverContent: css({
    w: '60',
  }),
} as const;

function useFilterStore(): FilterStore {
  const store = use(FilterStoreContext);
  if (store == null) {
    throw new Error(
      'useFilterStore must be used within a Table filtering plugin',
    );
  }
  return store;
}

function resolveOperator(
  field: SearchFilterInputField,
  operatorKey?: string,
): SearchFilterInputOperator | undefined {
  if (operatorKey != null) {
    return field.operators.find(operator => operator.key === operatorKey);
  }
  if (field.defaultOperator != null) {
    return field.operators.find(
      operator => operator.key === field.defaultOperator,
    );
  }
  return field.operators[0];
}

function resolveFilterConfig(
  filter: string | TableFilterFieldRef,
  searchConfig: SearchFilterInputConfig,
): OperatorValue | undefined {
  const fieldKey = typeof filter === 'string' ? filter : filter.field;
  const operatorKey = typeof filter === 'string' ? undefined : filter.operator;
  const field = searchConfig.fields.find(
    candidate => candidate.key === fieldKey,
  );
  return field == null ? undefined : resolveOperator(field, operatorKey)?.value;
}

function tableValueToFilterValue(
  value: TableFilterValue,
  operatorValue: OperatorValue,
): FilterValue | undefined {
  switch (operatorValue.type) {
    case 'date_absolute':
      return typeof value === 'string'
        ? {
            type: 'date_absolute',
            unixSeconds: Math.floor(new Date(value).getTime() / 1000),
          }
        : undefined;
    case 'enum':
      return typeof value === 'string' ? {type: 'enum', value} : undefined;
    case 'enum_list':
      return Array.isArray(value) ? {type: 'enum_list', value} : undefined;
    case 'entity_list':
      return Array.isArray(value)
        ? {
            type: 'entity_list',
            value: value.map(id => ({id, label: id})),
          }
        : undefined;
    case 'float':
      return typeof value === 'number' ? {type: 'float', value} : undefined;
    case 'integer':
      return typeof value === 'number' ? {type: 'integer', value} : undefined;
    case 'string':
      return typeof value === 'string' ? {type: 'string', value} : undefined;
    case 'string_list':
      return Array.isArray(value) ? {type: 'string_list', value} : undefined;
    case 'time':
      return typeof value === 'string' ? {type: 'time', value} : undefined;
    case 'custom':
    case 'date_range':
    case 'date_relative':
    case 'empty':
    case 'nested':
      return undefined;
  }
}

export function toSearchFilters<T extends Record<string, unknown>>(
  filters: TableFilterState,
  columns: ReadonlyArray<Pick<TableColumn<T>, 'filter' | 'key'>>,
  searchConfig: SearchFilterInputConfig,
): SearchFilterInputFilter[] {
  const result: SearchFilterInputFilter[] = [];

  for (const column of columns) {
    if (column.filter == null) {
      continue;
    }
    const value = filters[column.key];
    if (value == null) {
      continue;
    }
    const fieldKey =
      typeof column.filter === 'string' ? column.filter : column.filter.field;
    const operatorKey =
      typeof column.filter === 'string' ? undefined : column.filter.operator;
    const field = searchConfig.fields.find(
      candidate => candidate.key === fieldKey,
    );
    const operator =
      field == null ? undefined : resolveOperator(field, operatorKey);
    if (operator == null) {
      continue;
    }
    const filterValue = tableValueToFilterValue(value, operator.value);
    if (filterValue != null) {
      result.push({
        field: fieldKey,
        operator: operator.key,
        value: filterValue,
      });
    }
  }

  return result;
}

function TextFilterControl({
  columnKey,
  hasClear,
  header,
  size,
}: {
  columnKey: string;
  hasClear?: boolean;
  header: string;
  size: 'md' | 'sm';
}): React.JSX.Element {
  const store = useFilterStore();
  const value = store.getConfig().filters[columnKey];
  return (
    <TextInput
      hasClear={hasClear}
      isLabelHidden
      label={`Filter ${header}`}
      onChange={nextValue => {
        store
          .getConfig()
          .onFilterChange(columnKey, nextValue === '' ? null : nextValue);
      }}
      placeholder={`Filter ${header}`}
      size={size}
      value={typeof value === 'string' ? value : ''}
    />
  );
}

function NumberFilterControl({
  columnKey,
  hasClear,
  header,
  operatorValue,
  size,
}: {
  columnKey: string;
  hasClear?: boolean;
  header: string;
  operatorValue: FloatOperatorValue | IntegerOperatorValue;
  size: 'md' | 'sm';
}): React.JSX.Element {
  const store = useFilterStore();
  const value = store.getConfig().filters[columnKey];
  const sharedProps = {
    isIntegerOnly: operatorValue.type === 'integer',
    isLabelHidden: true as const,
    label: `Filter ${header}`,
    max: operatorValue.maxValue ?? null,
    min: operatorValue.minValue ?? null,
    placeholder: `Filter ${header}`,
    size,
    step: operatorValue.type === 'integer' ? 1 : null,
    value: typeof value === 'number' ? value : null,
  };
  if (hasClear === false) {
    return (
      <NumberInput
        {...sharedProps}
        onChange={nextValue => {
          store.getConfig().onFilterChange(columnKey, nextValue);
        }}
      />
    );
  }
  return (
    <NumberInput
      {...sharedProps}
      hasClear
      onChange={nextValue => {
        store.getConfig().onFilterChange(columnKey, nextValue);
      }}
    />
  );
}

function SelectFilterControl({
  columnKey,
  hasClear,
  header,
  operatorValue,
  size,
}: {
  columnKey: string;
  hasClear?: boolean;
  header: string;
  operatorValue: EnumOperatorValue;
  size: 'md' | 'sm';
}): React.JSX.Element {
  const store = useFilterStore();
  const value = store.getConfig().filters[columnKey];
  return (
    <Select
      hasClear={hasClear}
      isLabelHidden
      label={`Filter ${header}`}
      onChange={nextValue => {
        store.getConfig().onFilterChange(columnKey, nextValue);
      }}
      options={operatorValue.values.map(option => ({
        icon: option.icon,
        label: option.label,
        value: option.value,
      }))}
      placeholder="All"
      size={size}
      value={typeof value === 'string' ? value : null}
    />
  );
}

function MultiSelectFilterControl({
  columnKey,
  hasClear,
  header,
  operatorValue,
  size,
}: {
  columnKey: string;
  hasClear?: boolean;
  header: string;
  operatorValue: EnumListOperatorValue;
  size: 'md' | 'sm';
}): React.JSX.Element {
  const store = useFilterStore();
  const value = store.getConfig().filters[columnKey];
  return (
    <MultiSelect
      hasClear={hasClear}
      hasSearch={false}
      hasSelectAll
      isLabelHidden
      label={`Filter ${header}`}
      onChange={nextValue => {
        store
          .getConfig()
          .onFilterChange(columnKey, nextValue.length === 0 ? null : nextValue);
      }}
      options={operatorValue.values.map(option => ({
        icon: option.icon,
        label: option.label,
        value: option.value,
      }))}
      placeholder="All"
      size={size}
      value={Array.isArray(value) ? value : []}
    />
  );
}

function DateFilterControl({
  columnKey,
  hasClear,
  header,
  size,
}: {
  columnKey: string;
  hasClear?: boolean;
  header: string;
  size: 'md' | 'sm';
}): React.JSX.Element {
  const store = useFilterStore();
  const value = store.getConfig().filters[columnKey];
  return (
    <DateInput
      hasClear={hasClear}
      isLabelHidden
      label={`Filter ${header}`}
      onChange={nextValue => {
        store.getConfig().onFilterChange(columnKey, nextValue ?? null);
      }}
      placeholder={`Filter ${header}`}
      size={size}
      value={typeof value === 'string' ? (value as ISODateString) : undefined}
    />
  );
}

function TimeFilterControl({
  columnKey,
  hasClear,
  header,
  size,
}: {
  columnKey: string;
  hasClear?: boolean;
  header: string;
  size: 'md' | 'sm';
}): React.JSX.Element {
  const store = useFilterStore();
  const value = store.getConfig().filters[columnKey];
  return (
    <TimeInput
      hasClear={hasClear}
      isLabelHidden
      label={`Filter ${header}`}
      onChange={nextValue => {
        store.getConfig().onFilterChange(columnKey, nextValue ?? null);
      }}
      placeholder={`Filter ${header}`}
      size={size}
      value={typeof value === 'string' ? (value as ISOTimeString) : undefined}
    />
  );
}

function ListFilterControl({
  columnKey,
  hasClear,
  header,
  operatorValue,
  size,
}: {
  columnKey: string;
  hasClear?: boolean;
  header: string;
  operatorValue: EntityListOperatorValue | StringListOperatorValue;
  size: 'md' | 'sm';
}): React.JSX.Element {
  const store = useFilterStore();
  const value = store.getConfig().filters[columnKey];
  const items = Array.isArray(value) ? value.map(id => ({id, label: id})) : [];
  const source =
    operatorValue.searchSource ??
    createStaticSource<SearchableItem>(items, {keywords: item => [item.id]});

  return (
    <TagsInput
      hasClear={hasClear}
      hasCreate={operatorValue.isArbitraryStringAllowed ?? true}
      isLabelHidden
      label={`Filter ${header}`}
      onChange={nextItems => {
        const ids = nextItems.map(item => item.id);
        store
          .getConfig()
          .onFilterChange(columnKey, ids.length === 0 ? null : ids);
      }}
      placeholder={`Filter ${header}`}
      renderItem={
        operatorValue.type === 'entity_list'
          ? operatorValue.renderItem
          : undefined
      }
      searchSource={source}
      size={size}
      value={items}
    />
  );
}

function getHeaderText<T extends Record<string, unknown>>(
  column: TableColumn<T>,
): string {
  return typeof column.header === 'string' ? column.header : column.key;
}

function FilterControl<T extends Record<string, unknown>>({
  column,
  hasClear,
  operatorValue,
  size,
}: {
  column: TableColumn<T>;
  hasClear?: boolean;
  operatorValue: OperatorValue;
  size: 'md' | 'sm';
}): React.JSX.Element | null {
  const header = getHeaderText(column);
  switch (operatorValue.type) {
    case 'date_absolute':
      return (
        <DateFilterControl
          columnKey={column.key}
          hasClear={hasClear}
          header={header}
          size={size}
        />
      );
    case 'enum':
      return (
        <SelectFilterControl
          columnKey={column.key}
          hasClear={hasClear}
          header={header}
          operatorValue={operatorValue}
          size={size}
        />
      );
    case 'enum_list':
      return (
        <MultiSelectFilterControl
          columnKey={column.key}
          hasClear={hasClear}
          header={header}
          operatorValue={operatorValue}
          size={size}
        />
      );
    case 'entity_list':
    case 'string_list':
      return (
        <ListFilterControl
          columnKey={column.key}
          hasClear={hasClear}
          header={header}
          operatorValue={operatorValue}
          size={size}
        />
      );
    case 'float':
    case 'integer':
      return (
        <NumberFilterControl
          columnKey={column.key}
          hasClear={hasClear}
          header={header}
          operatorValue={operatorValue}
          size={size}
        />
      );
    case 'string':
      return (
        <TextFilterControl
          columnKey={column.key}
          hasClear={hasClear}
          header={header}
          size={size}
        />
      );
    case 'time':
      return (
        <TimeFilterControl
          columnKey={column.key}
          hasClear={hasClear}
          header={header}
          size={size}
        />
      );
    case 'custom':
    case 'date_range':
    case 'date_relative':
    case 'empty':
    case 'nested':
      return null;
  }
}

function PopoverFilterTrigger<T extends Record<string, unknown>>({
  column,
  operatorValue,
}: {
  column: TableColumn<T>;
  operatorValue: OperatorValue;
}): React.JSX.Element {
  const store = useFilterStore();
  const isActive = store.getConfig().filters[column.key] != null;
  return (
    <Popover
      content={
        <div className={styles.popoverContent}>
          <FilterControl
            column={column}
            hasClear
            operatorValue={operatorValue}
            size="md"
          />
          {isActive ? (
            <div className={styles.popoverActions}>
              <Button
                icon={X}
                label="Clear"
                onClick={() => {
                  store.getConfig().onFilterChange(column.key, null);
                }}
                size="sm"
                variant="ghost"
              />
            </div>
          ) : null}
        </div>
      }
      label={`Filter ${getHeaderText(column)}`}
      placement="below">
      <Button
        icon={Filter}
        isIconOnly
        label={`Filter ${getHeaderText(column)}`}
        size="sm"
        variant={isActive ? 'primary' : 'ghost'}
      />
    </Popover>
  );
}

export function useTableFiltering<T extends Record<string, unknown>>(
  config: UseTableFilteringConfig,
): TablePlugin<T> {
  const {variant = 'popover'} = config;

  const store = useMemo<FilterStore>(
    () => ({
      getConfig: () => config,
    }),
    [config],
  );

  return useMemo(
    (): TablePlugin<T> => ({
      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: TableColumn<T>,
      ): HeaderCellRenderProps {
        if (column.filter == null) {
          return props;
        }
        const operatorValue = resolveFilterConfig(
          column.filter,
          config.searchConfig,
        );
        if (operatorValue == null) {
          return props;
        }

        if (variant === 'popover') {
          return {
            ...props,
            after: (
              <span className={styles.afterPopover}>
                <PopoverFilterTrigger
                  column={column}
                  operatorValue={operatorValue}
                />
              </span>
            ),
          };
        }

        return {
          ...props,
          below: (
            <div className={styles.inlineWrapper}>
              <FilterControl
                column={column}
                hasClear
                operatorValue={operatorValue}
                size={variant === 'inline-compact' ? 'sm' : 'md'}
              />
            </div>
          ),
          className: styles.afterInline,
        };
      },
      transformTableContext(children: ReactNode): ReactNode {
        return (
          <FilterStoreContext value={store}>{children}</FilterStoreContext>
        );
      },
    }),
    [config.searchConfig, store, variant],
  );
}
