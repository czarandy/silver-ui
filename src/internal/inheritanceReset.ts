// Reset default properties to prevent inheritance leak.
//
// Surfaces shown in the top layer (native dialogs, popover layers) remain DOM
// descendants of the subtree that renders them, so inherited text properties
// still cascade in from the trigger's ancestors — e.g. a Dialog launched from
// a centered EmptyState action slot would otherwise center its text.
export const inheritanceReset = {
  textAlign: 'start',
  whiteSpace: 'normal',
} as const;
