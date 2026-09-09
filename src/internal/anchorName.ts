/**
 * Add one CSS anchor name without replacing anchors owned by other layers.
 */
export function addAnchorName(element: HTMLElement, anchorName: string): void {
  const anchorNames = readAnchorNames(element);
  if (!anchorNames.includes(anchorName)) {
    writeAnchorNames(element, [...anchorNames, anchorName]);
  }
}

/**
 * Remove one CSS anchor name without disturbing anchors owned by other layers.
 */
export function removeAnchorName(
  element: HTMLElement,
  anchorName: string,
): void {
  writeAnchorNames(
    element,
    readAnchorNames(element).filter(value => value !== anchorName),
  );
}

function readAnchorNames(element: HTMLElement): string[] {
  const value = (element.style as unknown as Record<string, string | undefined>)
    .anchorName;
  return (value ?? '')
    .split(',')
    .map(anchorName => anchorName.trim())
    .filter(Boolean);
}

function writeAnchorNames(element: HTMLElement, anchorNames: string[]): void {
  (element.style as unknown as Record<string, string>).anchorName =
    anchorNames.join(', ');
}
