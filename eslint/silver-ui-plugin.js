import path from 'node:path';
import eslintReact from '@eslint-react/eslint-plugin';

/**
 * Custom ESLint plugin for silver-ui component conventions.
 *
 * Rules:
 * - silver-ui/require-component-props: Components must accept className, style, ref, and data-testid
 * - silver-ui/boolean-prop-naming: Boolean props must start with is or has
 * - silver-ui/no-direct-color-tokens: Source must use semantic color tokens instead of primitive color tokens
 * - silver-ui/exhaustive-deps: React exhaustive deps with silver-ui stable hook support
 * - silver-ui/prefer-is-react-node: ReactNode null checks must use isReactNode
 * - silver-ui/no-recipe-type-imports: Public types must not depend on Panda recipe modules
 */

const reactExhaustiveDeps = eslintReact.rules['exhaustive-deps'];

const exhaustiveDeps = {
  ...reactExhaustiveDeps,
  meta: {
    ...reactExhaustiveDeps.meta,
    schema: [
      {
        ...reactExhaustiveDeps.meta.schema[0],
        properties: {
          ...reactExhaustiveDeps.meta.schema[0].properties,
          stableHooks: {
            type: 'array',
            items: {type: 'string'},
          },
        },
      },
    ],
  },
  create(context) {
    const upstreamVisitors = reactExhaustiveDeps.create(context);
    const callExpressionVisitor = upstreamVisitors.CallExpression;
    const stableHookNames = new Set(
      (context.options?.[0]?.stableHooks ?? []).filter(
        hookName => typeof hookName === 'string',
      ),
    );

    if (stableHookNames.size === 0 || callExpressionVisitor == null) {
      return upstreamVisitors;
    }

    let stableHookCallees = null;

    function withStableHooksAsRefs(callback) {
      const replacements = getStableHookCallees();

      for (const callee of replacements) {
        callee.name = 'useRef';
      }

      try {
        return callback();
      } finally {
        for (const callee of replacements) {
          callee.name = callee.originalName;
        }
      }
    }

    function getStableHookCallees() {
      if (stableHookCallees == null) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        stableHookCallees = collectStableHookCallees(
          sourceCode.ast,
          stableHookNames,
        );
      }

      return stableHookCallees;
    }

    return {
      ...upstreamVisitors,
      CallExpression(node) {
        return withStableHooksAsRefs(() => callExpressionVisitor(node));
      },
    };
  },
};

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

function collectStableHookCallees(root, stableHookNames) {
  const callees = [];
  const seen = new WeakSet();

  function visit(node) {
    if (node == null || typeof node !== 'object' || seen.has(node)) {
      return;
    }

    seen.add(node);

    if (node.type === 'CallExpression') {
      const callee = getStableHookCallee(node.callee, stableHookNames);
      if (callee != null) {
        callees.push(callee);
      }
    }

    for (const [key, value] of Object.entries(node)) {
      if (
        key === 'parent' ||
        key === 'loc' ||
        key === 'range' ||
        key === 'tokens' ||
        key === 'comments'
      ) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const child of value) {
          visit(child);
        }
      } else {
        visit(value);
      }
    }
  }

  visit(root);
  return callees;
}

function getStableHookCallee(callee, stableHookNames) {
  if (callee.type === 'Identifier' && stableHookNames.has(callee.name)) {
    return {
      originalName: callee.name,
      set name(value) {
        callee.name = value;
      },
    };
  }

  if (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    stableHookNames.has(callee.property.name)
  ) {
    return {
      name: callee.property.name,
      originalName: callee.property.name,
      set name(value) {
        callee.property.name = value;
      },
    };
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

function isNullishType(typeNode) {
  return (
    typeNode.type === 'TSUndefinedKeyword' ||
    typeNode.type === 'TSNullKeyword' ||
    typeNode.type === 'TSVoidKeyword'
  );
}

function isBooleanLiteralType(typeNode) {
  return (
    typeNode.type === 'TSLiteralType' &&
    typeof typeNode.literal.value === 'boolean'
  );
}

function isPureBooleanType(typeAnnotation) {
  if (!typeAnnotation) {
    return false;
  }

  const typeNode =
    typeAnnotation.type === 'TSTypeAnnotation'
      ? typeAnnotation.typeAnnotation
      : typeAnnotation;

  if (typeNode.type === 'TSBooleanKeyword' || isBooleanLiteralType(typeNode)) {
    return true;
  }

  if (typeNode.type === 'TSUnionType') {
    const semanticTypes = typeNode.types.filter(type => !isNullishType(type));

    return (
      semanticTypes.length > 0 &&
      semanticTypes.every(
        type => type.type === 'TSBooleanKeyword' || isBooleanLiteralType(type),
      )
    );
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
    typeNode.type === 'TSFunctionType' && isPureBooleanType(typeNode.returnType)
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

        const isBoolean = isPureBooleanType(identifier.typeAnnotation);
        const isBooleanCompatible = includesBooleanType(
          identifier.typeAnnotation,
        );
        const isPrefixed = hasBooleanPrefix(identifier.name);

        if (isBoolean && !isPrefixed) {
          context.report({
            node: identifier,
            messageId: 'invalidBooleanParam',
            data: {name: identifier.name},
          });
        }

        if (isPrefixed && !isBooleanCompatible) {
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

        const isBoolean = isPureBooleanType(node.typeAnnotation);
        const isBooleanCompatible = includesBooleanType(node.typeAnnotation);
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

        if (isPrefixed && !isBooleanCompatible) {
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
  if (services?.program == null || services.esTreeNodeToTSNodeMap == null) {
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
  const imports = program.body.filter(
    node => node.type === 'ImportDeclaration',
  );
  const importSource = getImportSource(
    context.filename || context.getFilename(),
  );
  const importText = `import isReactNode from '${importSource}';\n`;

  if (imports.length === 0) {
    return [fixer.insertTextBeforeRange([0, 0], importText)];
  }

  const lastImport = imports.at(-1);
  const tokenAfter = sourceCode.getTokenAfter(lastImport, {
    includeComments: true,
  });
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
    if (
      /src\/internal\/isReactNode\.ts$/.test(filename.replaceAll('\\', '/'))
    ) {
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
        const isPositiveCheck =
          node.operator === '!=' || node.operator === '!==';
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
            fixes.push(
              ...getImportFix(fixer, context, programNode, shouldAddImport),
            );
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
        "Redundant boxSizing: 'border-box' — already set by the Panda CSS preflight reset.",
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
            while (
              start > 0 &&
              (text[start - 1] === ' ' || text[start - 1] === '\t')
            ) {
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

/**
 * Disallow importing types from Panda recipe modules.
 *
 * Component implementation files may import the recipe value, e.g.
 * `import {buttonRecipe} from './Button.recipe'`, because value-only imports do
 * not appear in generated declaration files. Type imports from recipe modules
 * are different: they pull `*.recipe.d.ts` into the public declaration graph,
 * which exposes Panda's generated `styled-system/*` types to package
 * consumers.
 */
const noRecipeTypeImports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow type imports from Panda recipe modules; public component types should live in plain *.types modules.',
    },
    messages: {
      recipeTypeImport:
        'Do not import types from recipe module "{{source}}". Move public variant types to a plain "*.types" module instead.',
    },
    schema: [],
  },
  create(context) {
    const recipeSourcePattern = /\.recipe(?:\.[cm]?[jt]sx?)?$/;

    function isRecipeSource(source) {
      return typeof source === 'string' && recipeSourcePattern.test(source);
    }

    function report(node, source) {
      context.report({
        node,
        messageId: 'recipeTypeImport',
        data: {source},
      });
    }

    return {
      ExportNamedDeclaration(node) {
        if (node.source == null || !isRecipeSource(node.source.value)) {
          return;
        }

        if (node.exportKind === 'type') {
          report(node, node.source.value);
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.exportKind === 'type') {
            report(specifier, node.source.value);
          }
        }
      },
      ImportDeclaration(node) {
        if (!isRecipeSource(node.source.value)) {
          return;
        }

        if (node.importKind === 'type') {
          report(node, node.source.value);
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.importKind === 'type') {
            report(specifier, node.source.value);
          }
        }
      },
    };
  },
};

/**
 * Disallow fragments whose only renderable child is a single element but that
 * also contain JSX comments.
 *
 * `@eslint-react/jsx-no-useless-fragment` (and the eslint-plugin-react rule it
 * descends from) treats a JSX comment as a real child, so a single-element
 * fragment escapes detection the moment a JSX comment is added. The fragment is
 * still useless — the comment can live as a plain JS comment instead.
 *
 * The autofix peels the opening/closing fragment tags away. When the fragment
 * sits in expression position (return value, assignment, ternary, ...) each JSX
 * comment is converted to a bare block comment by removing its braces, since a
 * JSX comment is only valid as a JSX child. When the fragment is itself a JSX
 * child the comment braces are kept so the comment stays a JSX comment in its
 * new home.
 */
const noUselessFragmentWithComment = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow fragments that wrap a single element alongside only comments; the fragment is unnecessary.',
    },
    fixable: 'code',
    messages: {
      uselessFragment:
        'Fragment wraps a single element and only comments — remove the fragment.',
    },
    schema: [],
  },
  create(context) {
    function isCommentContainer(child) {
      return (
        child.type === 'JSXExpressionContainer' &&
        child.expression.type === 'JSXEmptyExpression'
      );
    }

    return {
      JSXFragment(node) {
        const renderableChildren = [];
        const commentContainers = [];
        let hasOtherChild = false;

        for (const child of node.children) {
          if (child.type === 'JSXText') {
            if (child.value.trim() !== '') {
              hasOtherChild = true;
            }
          } else if (isCommentContainer(child)) {
            commentContainers.push(child);
          } else if (
            child.type === 'JSXElement' ||
            child.type === 'JSXFragment'
          ) {
            renderableChildren.push(child);
          } else {
            // Expression containers with a value, spreads, etc. The fragment may
            // be load-bearing (e.g. a keyed list) — leave it alone.
            hasOtherChild = true;
          }
        }

        if (
          hasOtherChild ||
          renderableChildren.length !== 1 ||
          commentContainers.length === 0
        ) {
          return;
        }

        const isJsxChild =
          node.parent != null &&
          (node.parent.type === 'JSXElement' ||
            node.parent.type === 'JSXFragment');

        context.report({
          node,
          messageId: 'uselessFragment',
          fix(fixer) {
            const sourceCode = context.sourceCode || context.getSourceCode();
            const innerStart = node.openingFragment.range[1];
            let text = sourceCode
              .getText()
              .slice(innerStart, node.closingFragment.range[0]);

            // In expression position a JSX comment is invalid, so unwrap each
            // comment container by removing its surrounding braces, turning the
            // JSX comment into a plain block comment. Remove from right to left
            // so earlier offsets stay valid.
            if (!isJsxChild) {
              const bracePositions = [];
              for (const container of commentContainers) {
                bracePositions.push(container.range[1] - 1 - innerStart);
                bracePositions.push(container.range[0] - innerStart);
              }
              bracePositions.sort((a, b) => b - a);
              for (const position of bracePositions) {
                text = text.slice(0, position) + text.slice(position + 1);
              }
            }

            return fixer.replaceText(node, text.trim());
          },
        });
      },
    };
  },
};

/**
 * Disallow JSX props explicitly set to the bare identifier `undefined`, e.g.
 * `bar={undefined}`.
 *
 * In React, passing `undefined` is equivalent to omitting the prop: it does not
 * distinguish "present but undefined" from "absent" when rendering, and default
 * parameter values treat both the same. So a literal `bar={undefined}` is just
 * noise — omit it.
 *
 * Two intentional patterns are left alone:
 * - An expression result, e.g. `bar={cond ? value : undefined}`, where a branch
 *   genuinely needs to evaluate to undefined and omitting is not an option.
 * - An override after a spread, e.g. `<Foo {...props} bar={undefined} />`, which
 *   force-clears a value that the spread might otherwise supply.
 *
 * The autofix removes the attribute (and its leading whitespace).
 */
const noUselessUndefinedProp = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow JSX props set to a bare `undefined`; omit the prop instead (unless it follows a spread).',
    },
    fixable: 'code',
    messages: {
      uselessUndefinedProp:
        'Prop "{{name}}" is set to `undefined`, which is the same as omitting it. Remove it.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.value == null ||
          node.value.type !== 'JSXExpressionContainer' ||
          node.value.expression.type !== 'Identifier' ||
          node.value.expression.name !== 'undefined'
        ) {
          return;
        }

        // Allow overriding a spread: `<Foo {...props} bar={undefined} />`.
        const attributes = node.parent.attributes;
        const index = attributes.indexOf(node);
        const hasSpreadBefore = attributes
          .slice(0, index)
          .some(attribute => attribute.type === 'JSXSpreadAttribute');
        if (hasSpreadBefore) {
          return;
        }

        const name =
          node.name.type === 'JSXIdentifier' ? node.name.name : 'prop';

        context.report({
          node,
          messageId: 'uselessUndefinedProp',
          data: {name},
          fix(fixer) {
            const sourceCode = context.sourceCode || context.getSourceCode();
            const tokenBefore = sourceCode.getTokenBefore(node);
            return fixer.removeRange([tokenBefore.range[1], node.range[1]]);
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
    'exhaustive-deps': exhaustiveDeps,
    'no-direct-color-tokens': noDirectColorTokens,
    'no-recipe-exports': noRecipeExports,
    'no-recipe-type-imports': noRecipeTypeImports,
    'no-redundant-box-sizing': noRedundantBoxSizing,
    'no-useless-fragment-with-comment': noUselessFragmentWithComment,
    'no-useless-undefined-prop': noUselessUndefinedProp,
    'prefer-is-react-node': preferIsReactNode,
    'require-component-props': requireComponentProps,
  },
};

export default plugin;
