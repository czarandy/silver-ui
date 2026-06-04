/**
 * Custom ESLint plugin for silver-ui component conventions.
 *
 * Rules:
 * - silver-ui/require-component-props: Components must accept className, style, ref, and data-testid
 * - silver-ui/boolean-prop-naming: Boolean props must start with is or has
 * - silver-ui/no-direct-color-tokens: Source must use semantic color tokens instead of primitive color tokens
 */

const requireComponentProps = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require silver-ui components to accept className, style, ref, and data-testid props',
    },
    messages: {
      missingPropDestructure:
        'Component "{{name}}" must destructure "{{prop}}" from props and pass it to the root element.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    const isComponentFile =
      /src\/components\/[^/]+\/[A-Z][^/]*\.tsx$/.test(filename) &&
      !filename.includes('src/components/internal/') &&
      !filename.includes('/internal/') &&
      !filename.includes('.test.') &&
      !filename.includes('.stories.') &&
      !filename.includes('.recipe.') &&
      !filename.endsWith('Provider.tsx');

    if (!isComponentFile) {
      return {};
    }

    let destructuredProps = new Set();
    let componentName = null;

    return {
      // Named function component: export function Button({ ... })
      FunctionDeclaration(node) {
        if (node.id && /^[A-Z]/.test(node.id.name)) {
          componentName = node.id.name;
          const propsParam = node.params[0];
          if (propsParam && propsParam.type === 'ObjectPattern') {
            for (const prop of propsParam.properties) {
              const propName = getDestructuredPropertyName(prop);
              if (propName != null) {
                destructuredProps.add(propName);
              }
            }
          }
        }
      },
      // Arrow function component: export const Button = ({ ... }) => ...
      VariableDeclarator(node) {
        if (
          node.id.type === 'Identifier' &&
          /^[A-Z]/.test(node.id.name) &&
          node.init &&
          (node.init.type === 'ArrowFunctionExpression' ||
            node.init.type === 'FunctionExpression')
        ) {
          componentName = node.id.name;
          const propsParam = node.init.params[0];
          if (propsParam && propsParam.type === 'ObjectPattern') {
            for (const prop of propsParam.properties) {
              const propName = getDestructuredPropertyName(prop);
              if (propName != null) {
                destructuredProps.add(propName);
              }
            }
          }
        }
      },
      'Program:exit'() {
        if (!componentName) {
          return;
        }

        for (const prop of ['className', 'style', 'ref', 'data-testid']) {
          if (!destructuredProps.has(prop)) {
            context.report({
              loc: {line: 1, column: 0},
              messageId: 'missingPropDestructure',
              data: {name: componentName, prop},
            });
          }
        }
      },
    };
  },
};

function getDestructuredPropertyName(prop) {
  if (prop.type !== 'Property') {
    return null;
  }

  if (prop.key.type === 'Identifier') {
    return prop.key.name;
  }

  if (prop.key.type === 'Literal' && typeof prop.key.value === 'string') {
    return prop.key.value;
  }

  return null;
}

function getPropertyName(node) {
  if (node.key.type === 'Identifier') {
    return node.key.name;
  }

  if (node.key.type === 'Literal' && typeof node.key.value === 'string') {
    return node.key.value;
  }

  return null;
}

function includesBooleanType(typeAnnotation) {
  if (!typeAnnotation) {
    return false;
  }

  const typeNode =
    typeAnnotation.type === 'TSTypeAnnotation'
      ? typeAnnotation.typeAnnotation
      : typeAnnotation;

  if (typeNode.type === 'TSBooleanKeyword') {
    return true;
  }

  if (typeNode.type === 'TSUnionType') {
    return typeNode.types.some(includesBooleanType);
  }

  if (typeNode.type === 'TSFunctionType') {
    return includesBooleanType(typeNode.returnType);
  }

  if (
    typeNode.type === 'TSLiteralType' &&
    typeof typeNode.literal.value === 'boolean'
  ) {
    return true;
  }

  return false;
}

function isBooleanFunctionType(typeAnnotation) {
  if (!typeAnnotation) {
    return false;
  }

  const typeNode =
    typeAnnotation.type === 'TSTypeAnnotation'
      ? typeAnnotation.typeAnnotation
      : typeAnnotation;

  return (
    typeNode.type === 'TSFunctionType' && includesBooleanType(typeNode.returnType)
  );
}

const booleanPropNaming = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require boolean props and parameters to start with is or has, and require is/has-prefixed props and parameters to be boolean-compatible',
    },
    messages: {
      invalidBooleanProp:
        'Boolean prop "{{name}}" must start with "is" or "has".',
      invalidBooleanPredicateProp:
        'Boolean predicate prop "{{name}}" must start with "getIs" or "getHas".',
      invalidBooleanParam:
        'Boolean parameter "{{name}}" must start with "is" or "has".',
      invalidPrefixedProp:
        'Prop "{{name}}" starts with "is" or "has" and must include a boolean type.',
      invalidPrefixedParam:
        'Parameter "{{name}}" starts with "is" or "has" and must include a boolean type.',
    },
    schema: [],
  },
  create(context) {
    function hasBooleanPrefix(name) {
      return /^(is|has)[A-Z]/.test(name);
    }

    function hasBooleanPredicatePrefix(name) {
      return /^get(Is|Has)[A-Z]/.test(name);
    }

    function checkFunctionParams(node) {
      for (const param of node.params) {
        const identifier =
          param.type === 'Identifier'
            ? param
            : param.type === 'AssignmentPattern' &&
                param.left.type === 'Identifier'
              ? param.left
              : null;

        if (identifier == null || identifier.typeAnnotation == null) {
          continue;
        }

        const isBoolean = includesBooleanType(identifier.typeAnnotation);
        const isPrefixed = hasBooleanPrefix(identifier.name);

        if (isBoolean && !isPrefixed) {
          context.report({
            node: identifier,
            messageId: 'invalidBooleanParam',
            data: {name: identifier.name},
          });
        }

        if (isPrefixed && !isBoolean) {
          context.report({
            node: identifier,
            messageId: 'invalidPrefixedParam',
            data: {name: identifier.name},
          });
        }
      }
    }

    return {
      TSPropertySignature(node) {
        const name = getPropertyName(node);
        if (name == null || name.startsWith('aria-')) {
          return;
        }

        const isBoolean = includesBooleanType(node.typeAnnotation);
        const isBooleanFunction = isBooleanFunctionType(node.typeAnnotation);
        const isPrefixed = hasBooleanPrefix(name);
        const isPredicatePrefixed = hasBooleanPredicatePrefix(name);

        if (isBooleanFunction && !isPredicatePrefixed) {
          context.report({
            node: node.key,
            messageId: 'invalidBooleanPredicateProp',
            data: {name},
          });
          return;
        }

        if (isBoolean && !isBooleanFunction && !isPrefixed) {
          context.report({
            node: node.key,
            messageId: 'invalidBooleanProp',
            data: {name},
          });
        }

        if (isPrefixed && !isBoolean) {
          context.report({
            node: node.key,
            messageId: 'invalidPrefixedProp',
            data: {name},
          });
        }
      },
      FunctionDeclaration: checkFunctionParams,
      FunctionExpression: checkFunctionParams,
      ArrowFunctionExpression: checkFunctionParams,
    };
  },
};

const primitiveColorFamilies = [
  'silver-neutral',
  'silver-primary',
  'red',
  'green',
  'yellow',
  'blue',
  'cyan',
  'teal',
  'orange',
  'pink',
  'purple',
].join('|');

const primitiveColorTokenPattern = new RegExp(
  `(?:^|[^A-Za-z0-9_-])((?:${primitiveColorFamilies})\\.(?:50|[1-9][0-9]{2}))(?:$|[^A-Za-z0-9_-])`,
);
const primitiveColorCssVarPattern = /var\(--silver-colors-[^)]+\)/;
const rawColorPattern = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/;
const namedColorPattern = /^(?:white|black)$/;
const namedColorReferencePattern = /\bcolors\.(?:white|black)\b/;

function findDirectColor(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const primitiveColorTokenMatch = primitiveColorTokenPattern.exec(value);
  if (primitiveColorTokenMatch != null) {
    return primitiveColorTokenMatch[1];
  }

  const primitiveColorCssVarMatch = primitiveColorCssVarPattern.exec(value);
  if (primitiveColorCssVarMatch != null) {
    return primitiveColorCssVarMatch[0];
  }

  const rawColorMatch = rawColorPattern.exec(value);
  if (rawColorMatch != null) {
    return rawColorMatch[0];
  }

  if (namedColorPattern.test(value)) {
    return value;
  }

  const namedColorReferenceMatch = namedColorReferencePattern.exec(value);
  if (namedColorReferenceMatch != null) {
    return namedColorReferenceMatch[0];
  }

  return null;
}

const noDirectColorTokens = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow primitive or raw color values in source; use semantic color tokens instead',
    },
    messages: {
      directColor:
        'Use a semantic color token instead of direct color "{{color}}".',
    },
    schema: [],
  },
  create(context) {
    function checkString(node, value) {
      const color = findDirectColor(value);
      if (color == null) {
        return;
      }

      context.report({
        node,
        messageId: 'directColor',
        data: {color},
      });
    }

    return {
      Literal(node) {
        checkString(node, node.value);
      },
      TemplateElement(node) {
        checkString(node, node.value.cooked);
      },
    };
  },
};

/**
 * Disallow redundant boxSizing: 'border-box' declarations.
 *
 * The Panda CSS preflight resets all elements to border-box, so explicit
 * declarations are unnecessary. Non-border-box values (e.g. content-box) are
 * still allowed as intentional overrides.
 */
const noRedundantBoxSizing = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow redundant boxSizing: border-box (already set by preflight). ' +
        'Allows non-border-box values like content-box.',
    },
    fixable: 'code',
    messages: {
      redundant:
        'Redundant boxSizing: \'border-box\' — already set by the Panda CSS preflight reset.',
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node) {
        // Match boxSizing: 'border-box'
        if (
          getPropertyName(node) !== 'boxSizing' ||
          node.value.type !== 'Literal' ||
          node.value.value !== 'border-box'
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'redundant',
          fix(fixer) {
            const sourceCode = context.sourceCode || context.getSourceCode();
            const text = sourceCode.getText();
            const tokenAfter = sourceCode.getTokenAfter(node);

            // Determine the range to remove: the whole line including the
            // trailing comma and surrounding whitespace/newlines.
            let start = node.range[0];
            let end = node.range[1];

            // Include trailing comma
            if (tokenAfter && tokenAfter.value === ',') {
              end = tokenAfter.range[1];
            }

            // Extend backward to consume leading whitespace up to (and
            // including) the preceding newline so the entire line vanishes.
            while (start > 0 && (text[start - 1] === ' ' || text[start - 1] === '\t')) {
              start--;
            }
            if (start > 0 && text[start - 1] === '\n') {
              start--;
            }

            return fixer.removeRange([start, end]);
          },
        });
      },
    };
  },
};

const plugin = {
  meta: {
    name: 'eslint-plugin-silver-ui',
    version: '0.1.0',
  },
  rules: {
    'boolean-prop-naming': booleanPropNaming,
    'no-direct-color-tokens': noDirectColorTokens,
    'no-redundant-box-sizing': noRedundantBoxSizing,
    'require-component-props': requireComponentProps,
  },
};

export default plugin;
