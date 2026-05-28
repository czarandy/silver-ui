import {useMemo} from 'react';
import {css} from 'styled-system/css';
import {CheckboxInput} from '../../../CheckboxInput';
import {pixel} from '../../columnUtils';
import type {BodyRowRenderProps, TableColumn, TablePlugin} from '../../types';

export interface UseTableSelectionConfig<T extends Record<string, unknown>> {
  getIsAllSelected: () => boolean;
  getIsIndeterminate?: () => boolean;
  getIsItemEnabled?: (item: T) => boolean;
  getIsItemSelectable?: (item: T) => boolean;
  getIsItemSelected: (item: T) => boolean;
  onSelectAll: (event: {isAllSelected: boolean}) => void;
  onSelectItem: (event: {isSelected: boolean; item: T}) => void;
}

const styles = {
  center: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
} as const;

const SELECTION_COLUMN_KEY = '__table_selection';

export function useTableSelection<T extends Record<string, unknown>>(
  config: UseTableSelectionConfig<T>,
): TablePlugin<T> {
  const selectionColumn = useMemo(
    (): TableColumn<T> => ({
      header: (
        <div className={styles.center}>
          <CheckboxInput
            isLabelHidden
            label="Select all rows"
            onChange={() => {
              config.onSelectAll({
                isAllSelected: !config.getIsAllSelected(),
              });
            }}
            size="sm"
            value={
              config.getIsAllSelected()
                ? true
                : config.getIsIndeterminate?.() === true
                  ? 'indeterminate'
                  : false
            }
          />
        </div>
      ),
      key: SELECTION_COLUMN_KEY,
      renderCell: item => {
        const isSelectable = config.getIsItemSelectable?.(item) ?? true;
        if (!isSelectable) {
          return null;
        }
        const isSelected = config.getIsItemSelected(item);
        return (
          <div className={styles.center}>
            <CheckboxInput
              isDisabled={!(config.getIsItemEnabled?.(item) ?? true)}
              isLabelHidden
              label="Select row"
              onChange={() => {
                config.onSelectItem({isSelected: !isSelected, item});
              }}
              size="sm"
              value={isSelected}
            />
          </div>
        );
      },
      resizable: false,
      width: pixel(36),
    }),
    [config],
  );

  return useMemo(
    (): TablePlugin<T> => ({
      transformBodyRow(props: BodyRowRenderProps, item: T): BodyRowRenderProps {
        const isSelected = config.getIsItemSelected(item);
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            'aria-selected': isSelected || undefined,
            style: {
              ...props.htmlProps.style,
              backgroundColor: isSelected
                ? 'var(--silver-colors-primary-50)'
                : props.htmlProps.style?.backgroundColor,
            },
          },
        };
      },
      transformColumns(columns: TableColumn<T>[]): TableColumn<T>[] {
        return [selectionColumn, ...columns];
      },
    }),
    [config, selectionColumn],
  );
}
