/**
 * jscodeshift codemod – wrap every tool component's JSX return with <UtilityShell>.
 * Idempotent: skips files already wrapped.
 *
 * Run:
 *   npx jscodeshift src/components/tools --parser=tsx --transform=scripts/add-utility-shell.codemod.js --run-in-band
 */

const IMPORT_SOURCE = '@/components/UtilityShell';
const IMPORT_NAME   = 'UtilityShell';

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // ------------------------------------------------------------------
  // Helper: extract real JSX node from ReturnStatement argument
  // ------------------------------------------------------------------
  function getRealJSX(arg) {
    if (!arg) return null;
    if (arg.type === 'JSXElement' || arg.type === 'JSXFragment') return arg;
    if (arg.type === 'ParenthesizedExpression') return getRealJSX(arg.expression);
    return null;
  }

  // Helper: check if a JSX node (element or fragment) already has UtilityShell as outermost element
  function isWrappedWithUtilityShell(jsxNode) {
    if (!jsxNode) return false;
    // If fragment, check its children for a single UtilityShell element
    if (jsxNode.type === 'JSXFragment') {
      const children = jsxNode.children.filter(c => c.type === 'JSXElement');
      return children.length === 1 && children[0].openingElement.name.name === IMPORT_NAME;
    }
    // If element, check its name
    if (jsxNode.type === 'JSXElement') {
      return jsxNode.openingElement.name.name === IMPORT_NAME;
    }
    return false;
  }

  // ------------------------------------------------------------------
  // 1️⃣ Ensure the import exists
  // ------------------------------------------------------------------
  const hasImport = root
    .find(j.ImportDeclaration, {
      source: { value: IMPORT_SOURCE },
      specifiers: [{ type: 'ImportSpecifier', imported: { name: IMPORT_NAME } }],
    })
    .size();

  if (!hasImport) {
    const lastImport = root.find(j.ImportDeclaration).at(-1);
    const importDecl = j.importDeclaration(
      [j.importSpecifier(j.identifier(IMPORT_NAME))],
      j.literal(IMPORT_SOURCE)
    );
    if (lastImport.size()) {
      lastImport.insertAfter(importDecl);
    } else {
      root.get().node.program.body.unshift(importDecl);
    }
  }

  // ------------------------------------------------------------------
  // 2️⃣ Find the exported component (named or default function declaration)
  // ------------------------------------------------------------------
  const namedExports = root
    .find(j.ExportNamedDeclaration, {
      declaration: { type: 'FunctionDeclaration' },
    })
    .filter(p => p.node.declaration.id)
    .paths();

  const defaultExports = root
    .find(j.ExportDefaultDeclaration, {
      declaration: { type: 'FunctionDeclaration' },
    })
    .paths();

  const componentPaths = namedExports.concat(defaultExports);

  // ------------------------------------------------------------------
  // 3️⃣ Process each component
  // ------------------------------------------------------------------
  componentPaths.forEach(path => {
    const func = path.node.declaration; // FunctionDeclaration
    const body = func.body; // BlockStatement

    // Find candidate ReturnStatements that are direct children of the component's block body
    // (i.e., top-level returns, not inside nested functions)
    const returnStmts = j(body).find(j.ReturnStatement).filter(r => {
      // r.parentPath is the BlockStatement; ensure it's the component's body
      return r.parentPath.node === body;
    });

    // Locate the first return that yields JSX (element or fragment) possibly parenthesized
    let targetReturn = null;
    let realJSX = null;
    let argNode = null; // the original argument node (could be ParenthesizedExpression)

    returnStmts.forEach(r => {
      if (targetReturn) return; // already found
      const arg = r.node.argument;
      const jsx = getRealJSX(arg);
      if (jsx) {
        // Skip if already wrapped
        if (isWrappedWithUtilityShell(jsx)) return;
        targetReturn = r;
        realJSX = jsx;
        argNode = arg;
      }
    });

    if (!targetReturn) return; // nothing to wrap (no JSX return or already wrapped)

    // ------------------------------------------------------------------
    // 4️⃣ Build wrapped JSX
    // ------------------------------------------------------------------
    const wrapped = j.jsxElement(
      j.jsxOpeningElement(j.jsxIdentifier(IMPORT_NAME), []),
      j.jsxClosingElement(j.jsxIdentifier(IMPORT_NAME)),
      [realJSX],
      false
    );

    // Replace the argument, preserving parentheses if they existed
    if (argNode.type === 'ParenthesizedExpression') {
      argNode.expression = wrapped;
    } else {
      targetReturn.node.argument = wrapped;
    }
  });

  return root.toSource({ quote: 'single', trailingComma: true });
};