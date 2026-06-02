export function getMaxLinesVariant(
  maxLines: number,
): 'none' | 'one' | 'multiple' {
  if (maxLines === 1) {
    return 'one';
  }

  if (maxLines > 1) {
    return 'multiple';
  }

  return 'none';
}
