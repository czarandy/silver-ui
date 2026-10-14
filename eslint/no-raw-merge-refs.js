const functionTypes = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
]);
const wrapperTypes = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
]);
const reactFunctionName = /^(?:[A-Z]|use[A-Z0-9])/;

function unwrap(node) {
  while (node && wrapperTypes.has(node.type)) {
    node = node.expression;
  }
  return node;
}

function isReactFunction(node) {
  if (node.id?.name && reactFunctionName.test(node.id.name)) {
    return true;
  }
  let owner = node.parent;
  while (
    owner &&
    (wrapperTypes.has(owner.type) || owner.type === 'CallExpression')
  ) {
    owner = owner.parent;
  }
  if (owner?.type === 'VariableDeclarator' && owner.id.type === 'Identifier') {
    return reactFunctionName.test(owner.id.name);
  }
  if (
    owner?.type === 'AssignmentExpression' &&
    owner.left.type === 'Identifier'
  ) {
    return reactFunctionName.test(owner.left.name);
  }
  return owner?.type === 'ExportDefaultDeclaration' && node.id == null;
}

const noRawMergeRefs = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Use useMergeRefs with stable inputs inside components and hooks',
    },
    schema: [],
    messages: {
      useHook:
        'Use useMergeRefs inside components and hooks. Raw mergeRefs creates a new callback on every call.',
      stableInput:
        'Pass a stable ref to useMergeRefs; memoize this callback with useCallback first.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function findVariable(identifier) {
      let scope = sourceCode.getScope(identifier);
      while (scope) {
        const variable = scope.set.get(identifier.name);
        if (variable) {
          return variable;
        }
        scope = scope.upper;
      }
      return null;
    }

    function importKind(identifier, seen) {
      const variable = findVariable(identifier);
      if (!variable || seen.has(variable)) {
        return null;
      }
      seen.add(variable);
      for (const definition of variable.defs) {
        if (definition.type === 'ImportBinding') {
          const specifier = definition.node;
          if (
            specifier.importKind === 'type' ||
            definition.parent.importKind === 'type'
          ) {
            continue;
          }
          if (specifier.type === 'ImportNamespaceSpecifier') {
            return 'namespace';
          }
          const imported =
            specifier.imported?.name ?? specifier.imported?.value;
          if (imported === 'mergeRefs') {
            return 'raw';
          }
          if (imported === 'useMergeRefs') {
            return 'hook';
          }
          if (specifier.type === 'ImportDefaultSpecifier') {
            const path = definition.parent.source.value;
            if (/(?:^|\/)useMergeRefs(?:\.[cm]?[jt]sx?)?$/.test(path)) {
              return 'hook';
            }
            if (/(?:^|\/)mergeRefs(?:\.[cm]?[jt]sx?)?$/.test(path)) {
              return 'raw';
            }
          }
        } else if (definition.type === 'Variable' && definition.node.init) {
          return calleeKind(unwrap(definition.node.init), seen);
        }
      }
      return null;
    }

    function calleeKind(callee, seen = new Set()) {
      callee = unwrap(callee);
      if (callee?.type === 'Identifier') {
        return importKind(callee, seen);
      }
      if (
        callee?.type === 'MemberExpression' &&
        callee.object.type === 'Identifier' &&
        importKind(callee.object, seen) === 'namespace'
      ) {
        const name = callee.computed
          ? callee.property.value
          : callee.property.name;
        if (name === 'mergeRefs') {
          return 'raw';
        }
        if (name === 'useMergeRefs') {
          return 'hook';
        }
      }
      return null;
    }

    function isInsideReactFunction(node) {
      for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
        if (functionTypes.has(ancestor.type) && isReactFunction(ancestor)) {
          return true;
        }
      }
      return false;
    }

    return {
      CallExpression(node) {
        const kind = calleeKind(node.callee);
        if (kind === 'raw' && isInsideReactFunction(node)) {
          context.report({node, messageId: 'useHook'});
        } else if (kind === 'hook') {
          for (const argument of node.arguments) {
            const value = unwrap(argument);
            if (
              value &&
              (value.type === 'ArrowFunctionExpression' ||
                value.type === 'FunctionExpression')
            ) {
              context.report({node: argument, messageId: 'stableInput'});
            }
          }
        }
      },
    };
  },
};

export default noRawMergeRefs;
