/* eslint-disable silver-ui/require-component-props */
'use client';

import {SearchFilterInputEditPopover} from 'components/SearchFilterInput/SearchFilterInputEditPopover';
import {useInternalSearchFilterInputConfig} from 'components/SearchFilterInput/internalConfig';
import type {SearchFilterInputEditorProps} from 'components/SearchFilterInput/types';

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
