import type {AriaAttributes} from 'react';

/**
 * The identity and description props every Chat container forwards to its root
 * element.
 */
export interface ChatPassthroughProps {
  /**
   * Identifies the element(s) that describe the region.
   */
  'aria-describedby'?: AriaAttributes['aria-describedby'];
  /**
   * Accessible label for the region.
   */
  'aria-label'?: AriaAttributes['aria-label'];
  /**
   * Identifies the element(s) that label the region.
   */
  'aria-labelledby'?: AriaAttributes['aria-labelledby'];
  /**
   * HTML `id` attribute applied to the root element.
   */
  id?: string;
}
