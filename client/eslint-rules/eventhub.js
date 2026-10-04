// Project-specific lint rules.
//
// Both of these guard bugs that shipped to the browser and passed both the
// linter and the production build:
//
//   <HeroRef />          a capitalised element name that is never imported or
//                        declared, so the page crashed on render with
//                        "HeroRef is not defined"
//   orphan reveal class  a `reveal` class on a component that never calls
//                        useReveal, so the node stays at opacity 0 forever and
//                        the content is silently invisible
//
// Neither was caught by the toolchain because eslint-plugin-react is not
// installed, and core no-undef does not help: a JSX element name is a
// JSXIdentifier node, which core no-undef never inspects. So the check is done
// here instead, where it can be parser-aware rather than a regex over source
// text.

/**
 * Every name bound anywhere in the file, at any depth.
 *
 * Deliberately a "declared anywhere" scan rather than a proper scope lookup.
 * Scope analysis would be tighter, but this way a component referenced from a
 * nested scope can never be reported as undefined, and the only class of false
 * positive left is a name that exists in the file but not in the right scope,
 * which would fail at runtime anyway.
 */
const collectDeclaredNames = (program) => {
  const names = new Set();

  const fromPattern = (node) => {
    if (!node) return;
    switch (node.type) {
      case 'Identifier':
        names.add(node.name);
        break;
      case 'ObjectPattern':
        node.properties.forEach((p) =>
          fromPattern(p.type === 'RestElement' ? p.argument : p.value),
        );
        break;
      case 'ArrayPattern':
        node.elements.forEach(fromPattern);
        break;
      case 'RestElement':
        fromPattern(node.argument);
        break;
      case 'AssignmentPattern':
        fromPattern(node.left);
        break;
      default:
        break;
    }
  };

  const walk = (node) => {
    if (!node || typeof node.type !== 'string') return;

    switch (node.type) {
      case 'ImportDeclaration':
        node.specifiers.forEach((s) => names.add(s.local.name));
        return;
      case 'VariableDeclarator':
        fromPattern(node.id);
        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        if (node.id) names.add(node.id.name);
        node.params.forEach(fromPattern);
        break;
      case 'ClassDeclaration':
      case 'ClassExpression':
        if (node.id) names.add(node.id.name);
        break;
      case 'CatchClause':
        fromPattern(node.param);
        break;
      default:
        break;
    }

    // ESLint attaches a `parent` back-reference to every node, so a naive walk
    // over Object.values climbs straight back up the tree and never terminates.
    Object.entries(node).forEach(([key, value]) => {
      if (key === 'parent') return;
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value.type === 'string') walk(value);
    });
  };

  walk(program);
  return names;
};

const defined = {
  // ESLint 9 reads rule metadata from `meta` only. The older flat shape, with
  // type/docs/messages as siblings of create, is ignored, and context.report
  // then throws "no messages were present in the rule metadata" the first time
  // a rule actually has something to report.
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow capitalised JSX elements whose name is never declared or imported.',
    },
    messages: {
      undefinedComponent:
        "'{{name}}' is used as a component but is never imported or declared in this file. This builds and lints cleanly, then throws \"{{name}} is not defined\" in the browser at render time.",
    },
  },
  create(context) {
    const declared = collectDeclaredNames(context.sourceCode.ast);

    return {
      JSXIdentifier(node) {
        // <Foo.Bar /> and <svg:rect /> have their own name shapes; the leading
        // identifier of a member expression is resolved through the object,
        // so it is out of scope here.
        const parentType = node.parent && node.parent.type;
        if (parentType === 'JSXMemberExpression') return;
        if (parentType === 'JSXNamespacedName') return;
        // Lowercase is an intrinsic element such as <div> or <svg>.
        if (!/^[A-Z]/.test(node.name)) return;

        const opening =
          node.parent.parent && node.parent.parent.type === 'JSXOpeningElement'
            ? node.parent.parent
            : null;
        const where = opening && opening.name === node ? opening : node;

        if (declared.has(node.name)) return;

        context.report({
          node: where,
          messageId: 'undefinedComponent',
          data: { name: node.name },
        });
      },
    };
  },
};

// Matches a reveal class as a whole class token, so it cannot fire on the
// --reveal-delay custom property or on a word that merely contains "reveal".
const REVEAL_CLASS = /(^|\s)reveal(-stagger)?(\s|$)/;

const orphanReveal = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the `reveal` class in a component that never calls useReveal, which leaves the node permanently invisible.',
    },
    messages: {
      orphanReveal:
        'This component uses a `reveal` class but never calls useReveal, so the node stays at opacity 0 and its content never appears. Import and call useReveal, or drop the class.',
    },
  },
  create(context) {
    // Scoped per component rather than per file. Two components in one module
    // can each have their own hook call, so a file-wide flag says nothing about
    // whether *this* component is observed, and one hooked component would
    // silence the check for an unhooked sibling in the same file.
    const scopeStack = [];
    const hooked = new Set();
    const offenders = new Map();

    const currentScope = () =>
      scopeStack.length ? scopeStack[scopeStack.length - 1] : null;

    const enterScope = (node) => {
      scopeStack.push(node);
    };
    const exitScope = () => {
      scopeStack.pop();
    };

    // Scopes share a single object so a key can be used for both the "is this
    // component hooked" set and the "which component does this belong to" map.
    const scopeKey = (node) => node || 'module';

    const note = (node) => {
      const key = scopeKey(currentScope());
      if (!offenders.has(key)) offenders.set(key, { node, count: 0 });
      offenders.get(key).count += 1;
    };

    const inspect = (node) => {
      if (node.type === 'Literal' && typeof node.value === 'string') {
        return REVEAL_CLASS.test(node.value);
      }
      if (node.type === 'TemplateElement') {
        return REVEAL_CLASS.test(node.value.raw);
      }
      return false;
    };

    return {
      // Every function is a scope for this purpose, not just capitalised
      // components: the reveal class is sometimes passed to a helper function
      // that renders it, and that helper still needs the hook.
      FunctionDeclaration: enterScope,
      'FunctionDeclaration:exit': exitScope,
      FunctionExpression: enterScope,
      'FunctionExpression:exit': exitScope,
      ArrowFunctionExpression: enterScope,
      'ArrowFunctionExpression:exit': exitScope,

      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useReveal'
        ) {
          hooked.add(scopeKey(currentScope()));
        }
      },

      Literal(node) {
        if (inspect(node)) note(node);
      },

      TemplateElement(node) {
        if (inspect(node)) note(node);
      },

      'Program:exit'() {
        for (const [key, entry] of offenders) {
          if (hooked.has(key)) continue;
          context.report({
            node: entry.node,
            messageId: 'orphanReveal',
            // A component usually puts the class on several nodes with one
            // shared cause, so they are collapsed into a single report.
            data: { count: entry.count },
          });
        }
      },
    };
  },
};

export default {
  rules: {
    'no-undefined-jsx-component': defined,
    'no-orphan-reveal-class': orphanReveal,
  },
};
