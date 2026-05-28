import type {ComponentType, ReactNode} from 'react';
import type {SearchableItem, SearchSource} from '../Combobox';

export interface EmptyOperatorValue {
  readonly type: 'empty';
}

export interface StringOperatorValue {
  readonly isArbitraryStringAllowed?: boolean;
  readonly searchSource?: SearchSource;
  readonly type: 'string';
}

export interface StringListOperatorValue {
  readonly isArbitraryStringAllowed?: boolean;
  readonly searchSource?: SearchSource;
  readonly type: 'string_list';
}

export interface IntegerOperatorValue {
  readonly maxValue?: number;
  readonly minValue?: number;
  readonly type: 'integer';
  readonly units?: string;
}

export interface FloatOperatorValue {
  readonly maxValue?: number;
  readonly minValue?: number;
  readonly type: 'float';
  readonly units?: string;
}

export interface TimeOperatorValue {
  readonly maxValue?: string;
  readonly minValue?: string;
  readonly type: 'time';
}

export interface DateAbsoluteOperatorValue {
  readonly isDateOnly?: boolean;
  readonly type: 'date_absolute';
}

export interface DateRelativeOperatorValue {
  readonly isFutureAllowed?: boolean;
  readonly isPastAllowed?: boolean;
  readonly type: 'date_relative';
}

export interface DateRangeOperatorValue {
  readonly type: 'date_range';
}

export interface EnumItem {
  readonly icon?: ReactNode;
  readonly label: string;
  readonly value: string;
}

export interface EnumOperatorValue {
  readonly type: 'enum';
  readonly values: ReadonlyArray<EnumItem>;
}

export interface EnumListOperatorValue {
  readonly type: 'enum_list';
  readonly values: ReadonlyArray<EnumItem>;
}

export interface EntityListOperatorValue {
  readonly isArbitraryStringAllowed?: boolean;
  readonly renderItem?: (item: SearchableItem) => ReactNode;
  readonly searchSource?: SearchSource;
  readonly type: 'entity_list';
}

export interface CustomOperatorValue {
  readonly Editor: ComponentType<{
    isDisabled?: boolean;
    onChange: (value: string | null) => void;
    placeholder: string;
    value: string | null;
  }>;
  readonly getString: (value: string) => string;
  readonly type: 'custom';
}

export interface NestedOperatorValue {
  readonly type: 'nested';
}

export type OperatorValue =
  | CustomOperatorValue
  | DateAbsoluteOperatorValue
  | DateRangeOperatorValue
  | DateRelativeOperatorValue
  | EmptyOperatorValue
  | EntityListOperatorValue
  | EnumListOperatorValue
  | EnumOperatorValue
  | FloatOperatorValue
  | IntegerOperatorValue
  | NestedOperatorValue
  | StringListOperatorValue
  | StringOperatorValue
  | TimeOperatorValue;

export interface FilterValueEmpty {
  readonly type: 'empty';
}
export interface FilterValueString {
  readonly type: 'string';
  readonly value: string;
}
export interface FilterValueStringList {
  readonly type: 'string_list';
  readonly value: ReadonlyArray<string>;
}
export interface FilterValueInteger {
  readonly type: 'integer';
  readonly value: number;
}
export interface FilterValueFloat {
  readonly type: 'float';
  readonly value: number;
}
export interface FilterValueTime {
  readonly type: 'time';
  readonly value: string;
}
export interface FilterValueDateAbsolute {
  readonly type: 'date_absolute';
  readonly unixSeconds: number;
}
export interface FilterValueDateRelative {
  readonly type: 'date_relative';
  readonly value: string;
}
export interface DateTimeRangePartAbsolute {
  readonly type: 'ABSOLUTE';
  readonly unixSeconds: number;
}
export interface DateTimeRangePartNow {
  readonly type: 'NOW';
}
export interface DateTimeRangePartRelative {
  readonly anchorKey?: string;
  readonly backValue: number;
  readonly type: 'RELATIVE';
  readonly unit:
    | 'day'
    | 'hour'
    | 'minute'
    | 'month'
    | 'second'
    | 'week'
    | 'year';
}
export type DateTimeRangePart =
  | DateTimeRangePartAbsolute
  | DateTimeRangePartNow
  | DateTimeRangePartRelative;
export interface DateTimeRange {
  readonly end: DateTimeRangePart;
  readonly start: DateTimeRangePart;
}
export interface FilterValueDateRange {
  readonly type: 'date_range';
  readonly value: DateTimeRange;
}
export interface FilterValueEnum {
  readonly type: 'enum';
  readonly value: string;
}
export interface FilterValueEnumList {
  readonly type: 'enum_list';
  readonly value: ReadonlyArray<string>;
}
export interface SearchFilterInputEntity {
  readonly id: string;
  readonly label: string;
  readonly photo?: string;
}
export interface FilterValueEntityList {
  readonly type: 'entity_list';
  readonly value: ReadonlyArray<SearchFilterInputEntity>;
}
export interface FilterValueCustom {
  readonly type: 'custom';
  readonly value: string;
}
export interface FilterValueNested {
  readonly type: 'nested';
  readonly value: ReadonlyArray<SearchFilterInputFilter>;
}

export type FilterValue =
  | FilterValueCustom
  | FilterValueDateAbsolute
  | FilterValueDateRange
  | FilterValueDateRelative
  | FilterValueEmpty
  | FilterValueEntityList
  | FilterValueEnum
  | FilterValueEnumList
  | FilterValueFloat
  | FilterValueInteger
  | FilterValueNested
  | FilterValueString
  | FilterValueStringList
  | FilterValueTime;

export interface SearchFilterInputOperator {
  readonly key: string;
  readonly label: string;
  readonly value: OperatorValue;
}

export interface SearchFilterInputField {
  readonly comboboxAliases?: ReadonlyArray<string>;
  readonly comboboxMinQueryLength?: number;
  readonly defaultOperator?: string;
  readonly description?: string;
  readonly group?: string;
  readonly icon?: ReactNode;
  readonly isValueMatchAllowed?: boolean;
  readonly key: string;
  readonly label: string;
  readonly operators: ReadonlyArray<SearchFilterInputOperator>;
}

export interface SearchFilterInputConfig {
  readonly contentSearchFieldKey?: string;
  readonly fields: ReadonlyArray<SearchFilterInputField>;
  readonly name: string;
}

export interface SearchFilterInputFilter {
  readonly field: string;
  readonly isReadOnly?: boolean;
  readonly operator: string;
  readonly value: FilterValue;
}

export interface PartialFilter {
  readonly field: string;
  readonly isReadOnly?: boolean;
  readonly operator?: string;
  readonly value?: FilterValue;
}

export type SearchFilterInputChangeType = 'add' | 'edit' | 'remove';

export interface SearchFilterInputHandle {
  blurInput(): void;
  focusInput(): void;
}

export interface SearchFilterInputAuxData {
  readonly fieldKey: string;
  readonly filterIndex?: number;
  readonly filterValue?: FilterValue;
  readonly operatorKey?: string;
}

export type SearchFilterInputItem = SearchableItem<SearchFilterInputAuxData>;

export interface SearchFilterInputTagProps {
  readonly config: SearchFilterInputConfig;
  readonly field: SearchFilterInputField;
  readonly filter: SearchFilterInputFilter;
  readonly isDisabled?: boolean;
  readonly maxLength: number;
  readonly onClick?: () => void;
  readonly onRemove?: () => void;
  readonly operator: SearchFilterInputOperator;
}

export interface SearchFilterInputEditorProps {
  readonly config: SearchFilterInputConfig;
  readonly filter: PartialFilter;
  readonly isReadOnly?: boolean;
  readonly mode: 'create' | 'edit';
  readonly onCancel: () => void;
  readonly onSave: (filter: SearchFilterInputFilter | null) => void;
  readonly saveButtonLabel?: string;
  readonly timezoneID?: string;
}

export interface SearchFilterInputComponentOverride {
  readonly Editor?: ComponentType<SearchFilterInputEditorProps>;
  readonly Tag?: ComponentType<SearchFilterInputTagProps>;
}

export type SearchFilterInputComponents = Partial<
  Record<OperatorValue['type'], SearchFilterInputComponentOverride>
>;
