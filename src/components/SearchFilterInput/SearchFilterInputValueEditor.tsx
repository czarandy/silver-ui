/* eslint-disable silver-ui/require-component-props */

import {Temporal} from '@js-temporal/polyfill';
import {useCallback, useMemo} from 'react';
import {
  plainDateFromUnixSeconds,
  plainDateToUnixSeconds,
  type PlainDate,
} from '../../internal/plainDate';
import {getBrowserTimezoneID} from '../../internal/time';
import {
  AutocompleteInput,
  createStaticSearchSource,
  type SearchableItem,
  type SearchSource,
} from '../AutocompleteInput';
import {DateInput} from '../DateInput';
import {NumberInput} from '../NumberInput';
import {Select} from '../Select';
import {TagsInput} from '../TagsInput';
import {TextInput} from '../TextInput';
import {TimeInput} from '../TimeInput';
import type {InternalSearchFilterInputConfig} from './internalConfig';
import type {
  EnumItem,
  FilterValue,
  OperatorValue,
  SearchFilterInputEntity,
} from './types';

export interface SearchFilterInputValueEditorProps {
  config: InternalSearchFilterInputConfig;
  filterValue: FilterValue | undefined;
  isDisabled?: boolean;
  onChange: (value: FilterValue, shouldSave?: boolean) => void;
  onEnter?: () => void;
  operatorValue: OperatorValue;
  timezoneID?: string;
}

function enumItemsToSearchableItems(
  values: ReadonlyArray<EnumItem>,
): SearchableItem[] {
  return values.map(item => ({id: item.value, label: item.label}));
}

function emptySource(): SearchSource<SearchableItem> {
  return {bootstrap: () => [], search: () => []};
}

function StringEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue, shouldSave?: boolean) => void;
  operatorValue: OperatorValue & {type: 'string'};
}): React.JSX.Element {
  const currentValue = filterValue?.type === 'string' ? filterValue.value : '';

  if (operatorValue.searchSource != null) {
    const selectedItem: SearchableItem | null =
      currentValue === '' ? null : {id: currentValue, label: currentValue};
    return (
      <AutocompleteInput
        debounceMs={150}
        isLabelHidden
        label="Value"
        onChange={item => {
          onChange({type: 'string', value: item?.label ?? ''}, item != null);
        }}
        placeholder="Search..."
        searchSource={operatorValue.searchSource}
        value={selectedItem}
      />
    );
  }

  return (
    <TextInput
      isLabelHidden
      label="Value"
      onChange={value => onChange({type: 'string', value})}
      placeholder="Enter value..."
      value={currentValue}
    />
  );
}

function StringListEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
  operatorValue: OperatorValue & {type: 'string_list'};
}): React.JSX.Element {
  const currentValue = useMemo<SearchableItem[]>(() => {
    if (filterValue?.type !== 'string_list') {
      return [];
    }
    return filterValue.value.map(value => ({id: value, label: value}));
  }, [filterValue]);
  const source = operatorValue.searchSource ?? emptySource();
  const hasCreate =
    operatorValue.isArbitraryStringAllowed === true ||
    operatorValue.searchSource == null;

  return (
    <TagsInput
      debounceMs={operatorValue.searchSource == null ? 0 : 150}
      hasCreate={hasCreate}
      isLabelHidden
      label="Values"
      onChange={items => {
        onChange({
          type: 'string_list',
          value: items.map(item => item.label),
        });
      }}
      placeholder="Add values..."
      searchSource={source}
      value={currentValue}
    />
  );
}

function IntegerEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
  operatorValue: OperatorValue & {type: 'integer'};
}): React.JSX.Element {
  return (
    <NumberInput
      isIntegerOnly
      isLabelHidden
      label="Value"
      max={operatorValue.maxValue}
      min={operatorValue.minValue}
      onChange={value => onChange({type: 'integer', value})}
      placeholder="Enter number..."
      units={operatorValue.units}
      value={filterValue?.type === 'integer' ? filterValue.value : null}
    />
  );
}

function FloatEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
  operatorValue: OperatorValue & {type: 'float'};
}): React.JSX.Element {
  return (
    <NumberInput
      isLabelHidden
      label="Value"
      max={operatorValue.maxValue}
      min={operatorValue.minValue}
      onChange={value => onChange({type: 'float', value})}
      placeholder="Enter number..."
      units={operatorValue.units}
      value={filterValue?.type === 'float' ? filterValue.value : null}
    />
  );
}

function TimeEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
  operatorValue: OperatorValue & {type: 'time'};
}): React.JSX.Element {
  return (
    <TimeInput
      isLabelHidden
      label="Time"
      max={
        typeof operatorValue.maxValue === 'string'
          ? Temporal.PlainTime.from(operatorValue.maxValue)
          : undefined
      }
      min={
        typeof operatorValue.minValue === 'string'
          ? Temporal.PlainTime.from(operatorValue.minValue)
          : undefined
      }
      onChange={value => {
        if (value != null) {
          onChange({type: 'time', value: value.toString()});
        }
      }}
      value={
        filterValue?.type === 'time'
          ? Temporal.PlainTime.from(filterValue.value)
          : null
      }
    />
  );
}

function DateAbsoluteEditor({
  filterValue,
  onChange,
  timezoneID,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
  timezoneID: string;
}): React.JSX.Element {
  return (
    <DateInput
      isLabelHidden
      label="Date"
      onChange={value => {
        if (value != null) {
          onChange({
            type: 'date_absolute',
            unixSeconds: plainDateToUnixSeconds(value, timezoneID),
          });
        }
      }}
      value={
        filterValue?.type === 'date_absolute'
          ? plainDateFromUnixSeconds(filterValue.unixSeconds, timezoneID)
          : null
      }
    />
  );
}

function DateRelativeEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue, shouldSave?: boolean) => void;
  operatorValue: OperatorValue & {type: 'date_relative'};
}): React.JSX.Element {
  const options = useMemo(() => {
    const result: {label: string; value: string}[] = [];
    const units = [
      {plural: 'days', unit: 'day'},
      {plural: 'weeks', unit: 'week'},
      {plural: 'months', unit: 'month'},
    ];
    for (const {plural, unit} of units) {
      const amounts =
        unit === 'day'
          ? [1, 3, 7, 14, 30]
          : unit === 'week'
            ? [1, 2, 4]
            : [1, 3, 6, 12];
      for (const amount of amounts) {
        if (operatorValue.isPastAllowed !== false) {
          result.push({
            label: `${amount} ${amount === 1 ? unit : plural} ago`,
            value: `${amount}${unit[0]}_ago`,
          });
        }
        if (operatorValue.isFutureAllowed !== false) {
          result.push({
            label: `${amount} ${amount === 1 ? unit : plural} from now`,
            value: `${amount}${unit[0]}_from_now`,
          });
        }
      }
    }
    return result;
  }, [operatorValue.isFutureAllowed, operatorValue.isPastAllowed]);

  return (
    <Select
      isLabelHidden
      label="Relative date"
      onChange={value => {
        if (value != null) {
          onChange({type: 'date_relative', value}, true);
        }
      }}
      options={options}
      value={filterValue?.type === 'date_relative' ? filterValue.value : null}
    />
  );
}

function DateRangeEditor({
  filterValue,
  onChange,
  timezoneID,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
  timezoneID: string;
}): React.JSX.Element {
  const startValue =
    filterValue?.type === 'date_range' &&
    filterValue.value.start.type === 'ABSOLUTE'
      ? plainDateFromUnixSeconds(
          filterValue.value.start.unixSeconds,
          timezoneID,
        )
      : null;
  const endValue =
    filterValue?.type === 'date_range' &&
    filterValue.value.end.type === 'ABSOLUTE'
      ? plainDateFromUnixSeconds(filterValue.value.end.unixSeconds, timezoneID)
      : null;
  const handleStartChange = useCallback(
    (value: PlainDate | null) => {
      const existingEnd =
        filterValue?.type === 'date_range'
          ? filterValue.value.end
          : {type: 'NOW' as const};
      onChange({
        type: 'date_range',
        value: {
          end: existingEnd,
          start: {
            type: 'ABSOLUTE',
            unixSeconds:
              value == null ? 0 : plainDateToUnixSeconds(value, timezoneID),
          },
        },
      });
    },
    [filterValue, onChange, timezoneID],
  );
  const handleEndChange = useCallback(
    (value: PlainDate | null) => {
      const existingStart =
        filterValue?.type === 'date_range'
          ? filterValue.value.start
          : {type: 'NOW' as const};
      onChange({
        type: 'date_range',
        value: {
          end: {
            type: 'ABSOLUTE',
            unixSeconds:
              value == null ? 0 : plainDateToUnixSeconds(value, timezoneID),
          },
          start: existingStart,
        },
      });
    },
    [filterValue, onChange, timezoneID],
  );
  return (
    <>
      <DateInput
        isLabelHidden
        label="Start date"
        onChange={handleStartChange}
        value={startValue}
      />
      <DateInput
        isLabelHidden
        label="End date"
        onChange={handleEndChange}
        value={endValue}
      />
    </>
  );
}

function EnumEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue, shouldSave?: boolean) => void;
  operatorValue: OperatorValue & {type: 'enum'};
}): React.JSX.Element {
  return (
    <Select
      isLabelHidden
      label="Value"
      onChange={value => {
        if (value != null) {
          onChange({type: 'enum', value}, true);
        }
      }}
      options={operatorValue.values.map(item => ({
        icon: item.icon,
        label: item.label,
        value: item.value,
      }))}
      value={filterValue?.type === 'enum' ? filterValue.value : null}
    />
  );
}

function EnumListEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
  operatorValue: OperatorValue & {type: 'enum_list'};
}): React.JSX.Element {
  const items = useMemo(
    () => enumItemsToSearchableItems(operatorValue.values),
    [operatorValue.values],
  );
  const source = useMemo(() => createStaticSearchSource(items), [items]);
  const currentValue = useMemo<SearchableItem[]>(() => {
    if (filterValue?.type !== 'enum_list') {
      return [];
    }
    return filterValue.value.map(value => ({
      id: value,
      label:
        operatorValue.values.find(item => item.value === value)?.label ?? value,
    }));
  }, [filterValue, operatorValue.values]);

  return (
    <TagsInput
      debounceMs={0}
      hasEntriesOnFocus
      isLabelHidden
      label="Values"
      onChange={items => {
        onChange({type: 'enum_list', value: items.map(item => item.id)});
      }}
      placeholder="Select values..."
      searchSource={source}
      value={currentValue}
    />
  );
}

function EntityListEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
  operatorValue: OperatorValue & {type: 'entity_list'};
}): React.JSX.Element {
  const source = operatorValue.searchSource ?? emptySource();
  const currentValue = useMemo<SearchableItem[]>(() => {
    if (filterValue?.type !== 'entity_list') {
      return [];
    }
    return filterValue.value.map((entity: SearchFilterInputEntity) => ({
      auxiliaryData: entity.photo == null ? undefined : {photo: entity.photo},
      id: entity.id,
      label: entity.label,
    }));
  }, [filterValue]);

  return (
    <TagsInput
      debounceMs={operatorValue.searchSource == null ? 0 : 150}
      isLabelHidden
      label="Entities"
      onChange={items => {
        onChange({
          type: 'entity_list',
          value: items.map(item => ({
            id: item.id,
            label: item.label,
            ...(typeof item.auxiliaryData === 'object' &&
            item.auxiliaryData != null &&
            'photo' in item.auxiliaryData
              ? {photo: String(item.auxiliaryData.photo)}
              : {}),
          })),
        });
      }}
      placeholder="Search..."
      renderItem={operatorValue.renderItem}
      searchSource={source}
      value={currentValue}
    />
  );
}

function CustomEditor({
  operatorValue,
  filterValue,
  isDisabled,
  onChange,
}: {
  filterValue: FilterValue | undefined;
  isDisabled?: boolean;
  onChange: (value: FilterValue) => void;
  operatorValue: OperatorValue & {type: 'custom'};
}): React.JSX.Element {
  const EditorComponent = operatorValue.Editor;
  return (
    <EditorComponent
      isDisabled={isDisabled}
      onChange={value => {
        if (value != null) {
          onChange({type: 'custom', value});
        }
      }}
      placeholder="Enter value..."
      value={filterValue?.type === 'custom' ? filterValue.value : null}
    />
  );
}

export function SearchFilterInputValueEditor({
  filterValue,
  isDisabled,
  onChange,
  onEnter,
  operatorValue,
  timezoneID,
}: SearchFilterInputValueEditorProps): React.JSX.Element | null {
  const effectiveTimezoneID = timezoneID ?? getBrowserTimezoneID();

  switch (operatorValue.type) {
    case 'empty':
    case 'nested':
      return null;
    case 'string':
      return (
        <StringEditor
          filterValue={filterValue}
          onChange={onChange}
          operatorValue={operatorValue}
        />
      );
    case 'string_list':
      return (
        <StringListEditor
          filterValue={filterValue}
          onChange={onChange}
          operatorValue={operatorValue}
        />
      );
    case 'integer':
      return (
        <IntegerEditor
          filterValue={filterValue}
          onChange={onChange}
          operatorValue={operatorValue}
        />
      );
    case 'float':
      return (
        <FloatEditor
          filterValue={filterValue}
          onChange={onChange}
          operatorValue={operatorValue}
        />
      );
    case 'time':
      return (
        <TimeEditor
          filterValue={filterValue}
          onChange={onChange}
          operatorValue={operatorValue}
        />
      );
    case 'date_absolute':
      return (
        <DateAbsoluteEditor
          filterValue={filterValue}
          onChange={onChange}
          timezoneID={effectiveTimezoneID}
        />
      );
    case 'date_relative':
      return (
        <DateRelativeEditor
          filterValue={filterValue}
          onChange={onChange}
          operatorValue={operatorValue}
        />
      );
    case 'date_range':
      return (
        <DateRangeEditor
          filterValue={filterValue}
          onChange={onChange}
          timezoneID={effectiveTimezoneID}
        />
      );
    case 'enum':
      return (
        <EnumEditor
          filterValue={filterValue}
          onChange={onChange}
          operatorValue={operatorValue}
        />
      );
    case 'enum_list':
      return (
        <EnumListEditor
          filterValue={filterValue}
          onChange={onChange}
          operatorValue={operatorValue}
        />
      );
    case 'entity_list':
      return (
        <EntityListEditor
          filterValue={filterValue}
          onChange={onChange}
          operatorValue={operatorValue}
        />
      );
    case 'custom':
      return (
        <CustomEditor
          filterValue={filterValue}
          isDisabled={isDisabled}
          onChange={onChange}
          operatorValue={operatorValue}
        />
      );
  }
  void onEnter;
}
