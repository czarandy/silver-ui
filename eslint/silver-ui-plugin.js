/**
 * Custom ESLint plugin for silver-ui component conventions.
 *
 * Rules:
 * - silver-ui/require-component-props: Components must accept className, style, ref, and data-testid
 * - silver-ui/boolean-prop-naming: Boolean props must start with is or has
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
      description: 'Require boolean props to start with is or has',
    },
    messages: {
      invalidBooleanProp:
        'Boolean prop "{{name}}" must start with "is" or "has".',
    },
    schema: [],
  },
  create(context) {
    return {
      TSPropertySignature(node) {
        const typeName = parentTypeName(node);
        if (typeName == null || !typeName.endsWith('Props')) {
          return;
        }

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
    'require-component-props': requireComponentProps,
  },
};

export default plugin;
