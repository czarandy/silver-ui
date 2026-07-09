import ts from 'typescript';

const MAX_SINGLE_LINE = 78;

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Renders one story arg as a JSX attribute (`variant="primary"`, `isDisabled`,
 * `icon={Plus}`), or as element children when the arg is `children`.
 */
function attributeText(name: string, value: ts.Expression): string {
  if (ts.isStringLiteralLike(value)) {
    return `${name}=${JSON.stringify(value.text)}`;
  }
  if (value.kind === ts.SyntaxKind.TrueKeyword) {
    return name;
  }
  return `${name}={${collapse(value.getText())}}`;
}

function childrenText(value: ts.Expression): string {
  if (ts.isStringLiteralLike(value)) {
    return value.text;
  }
  if (
    ts.isJsxElement(value) ||
    ts.isJsxSelfClosingElement(value) ||
    ts.isJsxFragment(value)
  ) {
    return collapse(value.getText());
  }
  return `{${collapse(value.getText())}}`;
}

/**
 * Synthesizes a JSX snippet for an args-only story: the component with the
 * merged meta + story args as attributes. Mirrors what Storybook's docs
 * addon shows for such stories.
 */
export function synthesizeJsx(
  componentName: string,
  args: ReadonlyMap<string, ts.Expression>,
): string {
  const attributes: string[] = [];
  let children: string | undefined;
  for (const [name, value] of args) {
    if (name === 'children') {
      children = childrenText(value);
    } else {
      attributes.push(attributeText(name, value));
    }
  }

  const attrsInline = attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
  const singleLine =
    children == null
      ? `<${componentName}${attrsInline} />`
      : `<${componentName}${attrsInline}>${children}</${componentName}>`;
  if (singleLine.length <= MAX_SINGLE_LINE && !singleLine.includes('\n')) {
    return singleLine;
  }

  const attrLines = attributes.map(attribute => `  ${attribute}`).join('\n');
  if (children == null) {
    return `<${componentName}\n${attrLines}\n/>`;
  }
  const open =
    attributes.length > 0
      ? `<${componentName}\n${attrLines}\n>`
      : `<${componentName}>`;
  return `${open}\n  ${children}\n</${componentName}>`;
}
