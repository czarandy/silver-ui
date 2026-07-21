export type SizeValue = number | string;

/**
 * Converts numeric sizes to `px` lengths and validates string sizes. A
 * unit-less numeric string (e.g. `"220"`) is not a valid CSS length and would
 * silently disable whatever declaration it lands in, so it is converted to
 * pixels with a dev-only warning.
 */
export function toPixelSize(
  value: SizeValue | undefined,
): string | number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`silver-ui: ignoring non-finite size ${value}.`);
      }
      return undefined;
    }
    return `${value}px`;
  }
  const trimmed = value.trim();
  const numeric = Number(trimmed);
  if (trimmed !== '' && !Number.isNaN(numeric)) {
    if (numeric === 0) {
      // `0` is a valid unit-less CSS length.
      return value;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `silver-ui: size string '${value}' has no unit and is not valid ` +
          `CSS; treating it as ${numeric}px. Pass a number or include a unit.`,
      );
    }
    return `${numeric}px`;
  }
  return value;
}
