export type SizeValue = number | string;

export function toPixelSize(
  value: SizeValue | undefined,
): string | number | undefined {
  return typeof value === 'number' ? `${value}px` : value;
}
