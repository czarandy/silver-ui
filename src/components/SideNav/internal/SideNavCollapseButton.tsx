'use client';

import {PanelLeftClose, PanelLeftOpen, type LucideProps} from 'lucide-react';
import {Button} from 'components/Button';
import {useSideNavCollapse} from 'components/SideNav/SideNavContext';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

const mirrorInRtl = css({
  _rtl: {transform: 'scaleX(-1)'},
});

function CollapseIcon({className, ...props}: LucideProps): React.JSX.Element {
  return <PanelLeftClose {...props} className={cx(mirrorInRtl, className)} />;
}

function ExpandIcon({className, ...props}: LucideProps): React.JSX.Element {
  return <PanelLeftOpen {...props} className={cx(mirrorInRtl, className)} />;
}

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
      icon={isCollapsed ? ExpandIcon : CollapseIcon}
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
