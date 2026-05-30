import {ChevronLeft, ChevronRight} from 'lucide-react';
import {css} from 'styled-system/css';
import {Button} from '../../Button';
import {useSideNavCollapse} from '../SideNavContext';

const styles = {
  expanded: css({
    ms: '-2',
  }),
};

/**
 * Toggle button for collapsing and expanding the SideNav.
 * Reads collapse state from context when placed inside a SideNav.
 */
export function SideNavCollapseButton(): React.JSX.Element | null {
  const {isCollapsed, isCollapsible, toggle} = useSideNavCollapse();

  if (!isCollapsible) {
    return null;
  }

  const tooltipLabel = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <Button
      className={isCollapsed ? undefined : styles.expanded}
      icon={isCollapsed ? ChevronRight : ChevronLeft}
      isIconOnly
      label={tooltipLabel}
      onClick={toggle}
      size="sm"
      tooltip={tooltipLabel}
      variant="ghost"
    />
  );
}

SideNavCollapseButton.displayName = 'SideNavCollapseButton';
