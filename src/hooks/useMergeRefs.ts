'use client';

import {useMemo, type Ref, type RefCallback} from 'react';
import {mergeRefs} from 'internal/mergeRefs';

/**
 * Combines up to six refs into one callback that remains stable until an input
 * ref changes. Callback cleanup functions are composed using React 19 semantics.
 */
export default function useMergeRefs<T>(
  first?: Ref<T>,
  second?: Ref<T>,
  third?: Ref<T>,
  fourth?: Ref<T>,
  fifth?: Ref<T>,
  sixth?: Ref<T>,
): RefCallback<T> {
  return useMemo(
    () => mergeRefs(first, second, third, fourth, fifth, sixth),
    [first, second, third, fourth, fifth, sixth],
  );
}
