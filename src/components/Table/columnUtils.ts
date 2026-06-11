import {Temporal} from '@js-temporal/polyfill';
import type {CSSProperties, ReactNode} from 'react';
import type {PixelWidth, ProportionalWidth, TableColumn} from './types';

export const DEFAULT_MIN_COLUMN_WIDTH = 120;

export interface ResolvedColumnWidth {
  style: CSSProperties;
}

export interface ResolvedColumnWidths {
  columns: Map<string, ResolvedColumnWidth>;
  tableMinWidth: number;
}

export function proportional(
  value: number = 1,
  options?: {minWidth?: number},
): ProportionalWidth {
  return {
    minWidth: options?.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH,
    type: 'proportional',
    value,
  };
}

export function pixel(value: number): PixelWidth {
  return {type: 'pixel', value};
}

export function resolveColumnWidths<T extends Record<string, unknown>>(
  columns: TableColumn<T>[],
): ResolvedColumnWidths {
  let totalProportion = 0;
  let pixelTotal = 0;
  const proportionalColumns: {
    key: string;
    minWidth: number;
    proportion: number;
  }[] = [];

  for (const column of columns) {
    const width = column.width;
    if (width?.type === 'pixel') {
      pixelTotal += width.value;
    } else {
      const proportion = width?.value ?? 1;
      const minWidth =
        width == null ? 0 : (width.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH);
      totalProportion += proportion;
      proportionalColumns.push({key: column.key, minWidth, proportion});
    }
  }

  let proportionalMinSpace = 0;
  if (totalProportion > 0) {
    for (const column of proportionalColumns) {
      proportionalMinSpace = Math.max(
        proportionalMinSpace,
        (column.minWidth * totalProportion) / column.proportion,
      );
    }
  }

  const resolved = new Map<string, ResolvedColumnWidth>();
  for (const column of columns) {
    const width = column.width;
    const style: CSSProperties = {};

    if (width?.type === 'pixel') {
      style.minWidth = `${width.value}px`;
      style.width = `${width.value}px`;
    } else {
      const proportion = width?.value ?? 1;
      if (totalProportion > 0) {
        style.width = `${(proportion / totalProportion) * 100}%`;
      }
      if (width != null) {
        style.minWidth = `${width.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH}px`;
      }
    }

    resolved.set(column.key, {style});
  }

  return {
    columns: resolved,
    tableMinWidth: pixelTotal + proportionalMinSpace,
  };
}

export function capitalize(value: string): string {
  return value.length === 0
    ? value
    : value.charAt(0).toUpperCase() + value.slice(1);
}

const warnedUnsupportedCellKeys = new Set<string>();

export function defaultCellRenderer<T extends Record<string, unknown>>(
  item: T,
  key: string,
): ReactNode {
  const value = item[key];
  if (value == null) {
    return '';
  }
  // Default rendering intentionally supports Temporal date/time values only.
  // Use renderCell for native Date instances or other object values.
  if (
    value instanceof Temporal.Instant ||
    value instanceof Temporal.PlainDate ||
    value instanceof Temporal.PlainDateTime ||
    value instanceof Temporal.PlainTime ||
    value instanceof Temporal.ZonedDateTime
  ) {
    return value.toString();
  }
  if (
    typeof value === 'bigint' ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return String(value);
  }
  // Unsupported type (object, array, native Date, function, …). This renders an
  // empty cell, which usually means a `renderCell` is missing for the column.
  if (
    process.env.NODE_ENV !== 'production' &&
    !warnedUnsupportedCellKeys.has(key)
  ) {
    warnedUnsupportedCellKeys.add(key);
    const typeName =
      typeof value === 'object'
        ? Object.prototype.toString.call(value).slice(8, -1)
        : typeof value;
    console.warn(
      `[Table] Column "${key}" has a value of unsupported type ${typeName} and ` +
        'rendered as an empty cell. Provide a `renderCell` for this column.',
    );
  }
  return '';
}

function estimateContentLength(value: unknown): number {
  if (value == null) {
    return 0;
  }
  if (
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return String(value).length;
  }
  return 0;
}

function longestWord(value: unknown): number {
  if (
    value == null ||
    (typeof value !== 'boolean' &&
      typeof value !== 'number' &&
      typeof value !== 'string')
  ) {
    return 0;
  }
  return String(value)
    .split(/\s+/)
    .reduce((max, word) => Math.max(max, word.length), 0);
}

export function generateColumns<T extends Record<string, unknown>>(
  data: T[],
): TableColumn<T>[] {
  if (data.length === 0) {
    return [];
  }

  const sampleRows = data.slice(0, Math.min(5, data.length));
  return Object.keys(data[0]).map(key => {
    const header = capitalize(key);
    let maxContentLength = header.length;
    let maxWordLength = header.length;

    for (const row of sampleRows) {
      maxContentLength = Math.max(
        maxContentLength,
        estimateContentLength(row[key]),
      );
      maxWordLength = Math.max(maxWordLength, longestWord(row[key]));
    }

    const proportion =
      maxContentLength <= 6 ? 1 : maxContentLength <= 15 ? 2 : 3;
    const minWidth = Math.max(Math.max(header.length, maxWordLength) * 8, 60);

    return {
      header,
      key,
      width: proportional(proportion, {minWidth}),
    };
  });
}
