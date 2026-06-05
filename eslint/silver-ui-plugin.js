import path from 'node:path';

/**
 * Custom ESLint plugin for silver-ui component conventions.
 *
 * Rules:
 * - silver-ui/require-component-props: Components must accept className, style, ref, and data-testid
 * - silver-ui/boolean-prop-naming: Boolean props must start with is or has
 * - silver-ui/no-direct-color-tokens: Source must use semantic color tokens instead of primitive color tokens
 * - silver-ui/prefer-is-react-node: ReactNode null checks must use isReactNode
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

function isNullLiteral(node) {
  return node.type === 'Literal' && node.value === null;
}

function hasReactNodeType(context, node) {
  const services = context.sourceCode.parserServices;
  if (
    services?.program == null ||
    services.esTreeNodeToTSNodeMap == null
  ) {
    return false;
  }

  const checker = services.program.getTypeChecker();
  const tsNode = services.esTreeNodeToTSNodeMap.get(node);
  const type = checker.getTypeAtLocation(tsNode);

  return isReactNodeType(type, checker);
}

function isReactNodeType(type, checker) {
  if (type.aliasSymbol?.escapedName === 'ReactNode') {
    return true;
  }

  if (checker.typeToString(type) === 'ReactNode') {
    return true;
  }

  return false;
}

function getImportSource(filename) {
  const normalized = filename.replaceAll('\\', '/');
  const srcRoot = normalized.includes('/src/')
    ? normalized.slice(0, normalized.lastIndexOf('/src/') + '/src'.length)
    : normalized.startsWith('src/')
      ? 'src'
      : null;

  if (srcRoot == null) {
    return '../../internal/isReactNode';
  }

  const fromDirectory = path.posix.dirname(normalized);
  const target = `${srcRoot}/internal/isReactNode`;
  const relativePath = path.posix.relative(fromDirectory, target);

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

function hasIsReactNodeImport(program) {
  return program.body.some(
    node =>
      node.type === 'ImportDeclaration' &&
      node.specifiers.some(
        specifier =>
          specifier.type === 'ImportDefaultSpecifier' &&
          specifier.local.name === 'isReactNode',
      ),
  );
}

function hasIsReactNodeBinding(program) {
  return program.body.some(node => {
    if (
      node.type === 'FunctionDeclaration' &&
      node.id?.name === 'isReactNode'
    ) {
      return true;
    }

    if (node.type !== 'VariableDeclaration') {
      return false;
    }

    return node.declarations.some(
      declaration =>
        declaration.id.type === 'Identifier' &&
        declaration.id.name === 'isReactNode',
    );
  });
}

function getImportFix(fixer, context, program, shouldAddImport) {
  if (!shouldAddImport) {
    return [];
  }

  const sourceCode = context.sourceCode || context.getSourceCode();
  const imports = program.body.filter(node => node.type === 'ImportDeclaration');
  const importSource = getImportSource(context.filename || context.getFilename());
  const importText = `import isReactNode from '${importSource}';\n`;

  if (imports.length === 0) {
    return [fixer.insertTextBeforeRange([0, 0], importText)];
  }

  const lastImport = imports.at(-1);
  const tokenAfter = sourceCode.getTokenAfter(lastImport, {includeComments: true});
  if (tokenAfter == null) {
    return [fixer.insertTextAfter(lastImport, `\n${importText}`)];
  }

  return [
    fixer.replaceTextRange(
      [lastImport.range[1], tokenAfter.range[0]],
      `\n${importText}\n`,
    ),
  ];
}

const preferIsReactNode = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require isReactNode for ReactNode null checks so boolean values are excluded from JSX rendering branches',
    },
    fixable: 'code',
    messages: {
      preferIsReactNode:
        'Use isReactNode({{name}}) instead of comparing a ReactNode value to null.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (/src\/internal\/isReactNode\.ts$/.test(filename.replaceAll('\\', '/'))) {
      return {};
    }

    let programNode = null;
    let needsImport = false;
    let canAddImport = false;

    return {
      Program(node) {
        programNode = node;
        const alreadyImported = hasIsReactNodeImport(node);
        canAddImport = alreadyImported || !hasIsReactNodeBinding(node);
        needsImport = !alreadyImported && canAddImport;
      },
      BinaryExpression(node) {
        if (!['!=', '!==', '==', '==='].includes(node.operator)) {
          return;
        }

        const comparedNode = isNullLiteral(node.left)
          ? node.right
          : isNullLiteral(node.right)
            ? node.left
            : null;

        if (comparedNode == null || !hasReactNodeType(context, comparedNode)) {
          return;
        }

        const sourceCode = context.sourceCode || context.getSourceCode();
        const comparedText = sourceCode.getText(comparedNode);
        const isPositiveCheck = node.operator === '!=' || node.operator === '!==';
        const replacement = isPositiveCheck
          ? `isReactNode(${comparedText})`
          : `!isReactNode(${comparedText})`;
        const shouldAddImport = needsImport && canAddImport;

        context.report({
          node,
          messageId: 'preferIsReactNode',
          data: {name: comparedText},
          fix(fixer) {
            const fixes = [fixer.replaceText(node, replacement)];
            fixes.push(...getImportFix(fixer, context, programNode, shouldAddImport));
            needsImport = false;
            return fixes;
          },
        });
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

/**
 * Disallow exporting Panda recipes (and their *Variants types) from barrel
 * files. Recipes are an internal implementation detail — components import them
 * directly from their "*.recipe" module. Re-exporting them from an index.ts
 * leaks them into the public API.
 *
 * Flags:
 * - Re-exporting from a "*.recipe" module: `export { x } from './X.recipe'`
 * - Exporting any name ending in `Recipe` or `Variants` (plural): the recipe
 *   function and its `RecipeVariantProps` type. Singular `*Variant` union types
 *   (e.g. `DividerVariant`) are intentionally allowed.
 */
const noRecipeExports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow exporting Panda recipes or their *Variants types from barrel (index) files; they are an internal implementation detail.',
    },
    messages: {
      recipeModuleReexport:
        'Do not re-export from a recipe module ("{{source}}"). Recipes are internal — import them directly from the "*.recipe" file where needed.',
      recipeNamedExport:
        'Do not export "{{name}}" from a barrel. Recipes and their *Variants types are an internal implementation detail; keep them out of index.ts.',
    },
    schema: [],
  },
  create(context) {
    const recipeSourcePattern = /\.recipe(\.[cm]?[jt]s)?$/;
    const recipeNamePattern = /(Recipe|Variants)$/;

    function reportRecipeSource(node) {
      if (node.source != null && recipeSourcePattern.test(node.source.value)) {
        context.report({
          node,
          messageId: 'recipeModuleReexport',
          data: {source: node.source.value},
        });
        return true;
      }
      return false;
    }

    return {
      ExportAllDeclaration(node) {
        reportRecipeSource(node);
      },
      ExportNamedDeclaration(node) {
        // `export ... from './X.recipe'` — flag the whole statement.
        if (reportRecipeSource(node)) {
          return;
        }
        // `export { fooRecipe, type FooVariants }` (with or without `from`).
        for (const specifier of node.specifiers) {
          const name = specifier.exported?.name;
          if (name != null && recipeNamePattern.test(name)) {
            context.report({
              node: specifier,
              messageId: 'recipeNamedExport',
              data: {name},
            });
          }
        }
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
    'no-recipe-exports': noRecipeExports,
    'no-redundant-box-sizing': noRedundantBoxSizing,
    'prefer-is-react-node': preferIsReactNode,
    'require-component-props': requireComponentProps,
  },
};

export default plugin;
