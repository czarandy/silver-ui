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

  if (
    typeNode.type === 'TSLiteralType' &&
    typeof typeNode.literal.value === 'boolean'
  ) {
    return true;
  }

  return false;
}

function parentTypeName(node) {
  const parent = node.parent;

  if (parent?.type === 'TSInterfaceBody') {
    return parent.parent?.id?.name ?? null;
  }

  if (
    parent?.type === 'TSTypeLiteral' &&
    parent.parent?.type === 'TSTypeAliasDeclaration'
  ) {
    return parent.parent.id.name;
  }

  return null;
}

const booleanPropNaming = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require boolean props and parameters to start with is or has',
    },
    messages: {
      invalidBooleanProp:
        'Boolean prop "{{name}}" must start with "is" or "has".',
      invalidBooleanParam:
        'Boolean parameter "{{name}}" must start with "is" or "has".',
    },
    schema: [],
  },
  create(context) {
    function checkFunctionParams(node) {
      for (const param of node.params) {
        const identifier =
          param.type === 'Identifier'
            ? param
            : param.type === 'AssignmentPattern' &&
                param.left.type === 'Identifier'
              ? param.left
              : null;

        if (
          identifier == null ||
          !includesBooleanType(identifier.typeAnnotation) ||
          /^(is|has)[A-Z]/.test(identifier.name)
        ) {
          continue;
        }

        context.report({
          node: identifier,
          messageId: 'invalidBooleanParam',
          data: {name: identifier.name},
        });
      }
    }

    return {
      TSPropertySignature(node) {
        const name = getPropertyName(node);
        if (
          name == null ||
          !includesBooleanType(node.typeAnnotation) ||
          /^(is|has)[A-Z]/.test(name) ||
          name.startsWith('aria-')
        ) {
          return;
        }

        context.report({
          node: node.key,
          messageId: 'invalidBooleanProp',
          data: {name},
        });
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

const plugin = {
  meta: {
    name: 'eslint-plugin-silver-ui',
    version: '0.1.0',
  },
  rules: {
    'boolean-prop-naming': booleanPropNaming,
    'no-direct-color-tokens': noDirectColorTokens,
    'require-component-props': requireComponentProps,
  },
};

export default plugin;
