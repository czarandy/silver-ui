// Reset default properties to prevent inheritance leak.
//
// Surfaces shown in the top layer (native dialogs, popover layers) remain DOM
// descendants of the subtree that renders them, so inherited text properties
// still cascade in from the trigger's ancestors — e.g. a Dialog launched from
// a centered EmptyState action slot would otherwise center its text, and a
// HoverCard in an italic table row would render italic.
export const inheritanceReset = {
  fontStyle: 'normal',
  fontWeight: 'normal',
  textAlign: 'start',
  textTransform: 'none',
  whiteSpace: 'normal',
} as const;
