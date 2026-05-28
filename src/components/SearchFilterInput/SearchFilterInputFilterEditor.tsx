/* eslint-disable silver-ui/require-component-props */

import {SearchFilterInputEditPopover} from './SearchFilterInputEditPopover';
import {useInternalSearchFilterInputConfig} from './internalConfig';
import type {SearchFilterInputEditorProps} from './types';

/**
 * Default public filter editor used by SearchFilterInput.
 */
export function SearchFilterInputFilterEditor({
  config,
  filter,
  isReadOnly,
  mode,
  onCancel,
  onSave,
  saveButtonLabel,
}: SearchFilterInputEditorProps): React.JSX.Element {
  const internalConfig = useInternalSearchFilterInputConfig(config);
  return (
    <SearchFilterInputEditPopover
      config={internalConfig}
      filter={filter}
      isReadOnly={isReadOnly}
      mode={mode}
      onCancel={onCancel}
      onSave={onSave}
      saveButtonLabel={saveButtonLabel}
    />
  );
}

SearchFilterInputFilterEditor.displayName = 'SearchFilterInputFilterEditor';
