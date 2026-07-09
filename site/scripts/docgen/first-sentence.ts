/**
 * The first sentence of a JSDoc description, on one line — used where the
 * full (possibly multi-paragraph) text would be too much: the components
 * overview bullets and the SEO meta description.
 */
export function firstSentence(text: string): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  const match = oneLine.match(/^.*?\.(?=\s|$)/);
  return match?.[0] ?? oneLine;
}
