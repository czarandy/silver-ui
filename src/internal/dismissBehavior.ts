/**
 * Controls whether Escape and backdrop clicks request dismissal of an overlay
 * surface. Pass a boolean to enable or disable both behaviors together, or an
 * object to configure each independently.
 */
export type DismissBehavior =
  | boolean
  | {
      isBackdropDismissEnabled?: boolean;
      isEscapeDismissEnabled?: boolean;
    };

/**
 * Resolves a {@link DismissBehavior} value into explicit flags. Both behaviors
 * default to enabled when unspecified.
 */
export function resolveDismissBehavior(
  dismissBehavior: DismissBehavior | undefined,
): {isBackdropDismissEnabled: boolean; isEscapeDismissEnabled: boolean} {
  if (dismissBehavior == null) {
    return {isBackdropDismissEnabled: true, isEscapeDismissEnabled: true};
  }

  if (typeof dismissBehavior === 'boolean') {
    return {
      isBackdropDismissEnabled: dismissBehavior,
      isEscapeDismissEnabled: dismissBehavior,
    };
  }

  return {
    isBackdropDismissEnabled: dismissBehavior.isBackdropDismissEnabled ?? true,
    isEscapeDismissEnabled: dismissBehavior.isEscapeDismissEnabled ?? true,
  };
}
