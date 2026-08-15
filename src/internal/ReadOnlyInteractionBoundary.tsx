'use client';

import type {ReactNode} from 'react';
import {
  blurReadOnlyInteraction,
  preventReadOnlyInteraction,
} from 'internal/readOnlyInteraction';
import {css} from 'styled-system/css';

const displayContents = css({display: 'contents'});

export interface ReadOnlyInteractionBoundaryProps {
  children: ReactNode;
  isReadOnly: boolean;
}

/**
 * Keeps custom control content visible while making it inert when read-only.
 */
export function ReadOnlyInteractionBoundary({
  children,
  isReadOnly,
}: ReadOnlyInteractionBoundaryProps): React.JSX.Element {
  return (
    <span
      className={displayContents}
      onClickCapture={isReadOnly ? preventReadOnlyInteraction : undefined}
      onFocusCapture={isReadOnly ? blurReadOnlyInteraction : undefined}
      onKeyDownCapture={isReadOnly ? preventReadOnlyInteraction : undefined}
      onPointerDownCapture={
        isReadOnly ? preventReadOnlyInteraction : undefined
      }>
      {children}
    </span>
  );
}
