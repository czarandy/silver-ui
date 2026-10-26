import type {ReactNode} from 'react';
import {defaultCellRenderer} from 'components/Table/columnUtils';
import type {TableTextOverflow} from 'components/Table/types';
import {Text} from 'components/Text';

/**
 * Renders a cell from its column key when the column has no `renderCell`,
 * truncating plain text to one line when the table truncates.
 */
export function renderDefaultCellContent<T extends Record<string, unknown>>(
  item: T,
  key: string,
  textOverflow: TableTextOverflow,
): ReactNode {
  const content = defaultCellRenderer(item, key);
  return textOverflow === 'truncate' &&
    typeof content === 'string' &&
    content.length > 0 ? (
    <Text maxLines={1} type="body">
      {content}
    </Text>
  ) : (
    content
  );
}
