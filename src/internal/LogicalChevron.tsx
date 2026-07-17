import {ChevronLeft, ChevronRight, type LucideProps} from 'lucide-react';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

const mirrorInRtl = css({
  _rtl: {transform: 'scaleX(-1)'},
});

/**
 * A chevron that points toward the logical start of the inline axis.
 */
export function LogicalChevronStart({
  className,
  ...props
}: LucideProps): React.JSX.Element {
  return <ChevronLeft {...props} className={cx(mirrorInRtl, className)} />;
}

/**
 * A chevron that points toward the logical end of the inline axis.
 */
export function LogicalChevronEnd({
  className,
  ...props
}: LucideProps): React.JSX.Element {
  return <ChevronRight {...props} className={cx(mirrorInRtl, className)} />;
}
