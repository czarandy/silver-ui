'use client';

import {use, useCallback} from 'react';
import {Link, type LinkProps} from 'components/Link';
import {TableRowLinkContext} from 'components/Table/TableRowLinkContext';
import useMergeRefs from 'hooks/useMergeRefs';

export interface TableRowLinkProps extends Omit<LinkProps, 'href'> {
  /**
   * Destination for the link and for clicks anywhere on its row.
   */
  href: string;
}

/**
 * A `Link` that makes its whole table row clickable. Clicks on the row surface
 * are forwarded to this link, so router links from `LinkProvider`, modifier
 * clicks, and middle clicks behave exactly as they do on the link itself.
 * Buttons, inputs, and other links in the row keep their own clicks.
 *
 * Render it inside a body `TableRow`, at most once per row. A disabled link
 * leaves its row unclickable.
 */
export function TableRowLink({
  className,
  'data-testid': dataTestId,
  isDisabled = false,
  ref,
  style,
  ...linkProps
}: TableRowLinkProps): React.JSX.Element {
  const registry = use(TableRowLinkContext);

  if (registry == null && process.env.NODE_ENV !== 'production') {
    throw new Error(
      'TableRowLink must be rendered inside a TableRow in a table body.',
    );
  }

  const register = isDisabled ? undefined : registry?.register;
  const registerRef = useCallback(
    (element: HTMLElement | null) =>
      element == null || register == null ? undefined : register(element),
    [register],
  );
  const mergedRef = useMergeRefs(ref, registerRef);

  return (
    <Link
      {...linkProps}
      className={className}
      data-testid={dataTestId}
      isDisabled={isDisabled}
      ref={mergedRef}
      style={style}
    />
  );
}

TableRowLink.displayName = 'TableRowLink';
