/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow card elements nesting other card elements'
    },
    schema: [],
    messages: {
      nested: 'Card element cannot contain another card element. Remove one of the wrappers (design spec §10 "no card-within-card").'
    }
  },
  create(context) {
    const cardClassRe = /\bcard(-[a-z0-9]+)?\b/;
    function isCard(node) {
      return (
        node.type === 'JSXOpeningElement' &&
        node.name &&
        node.name.type === 'JSXIdentifier' &&
        (node.name.name === 'Card' ||
          (node.attributes || []).some((a) =>
            a.type === 'JSXAttribute' &&
            a.name &&
            a.name.name === 'className' &&
            a.value &&
            a.value.type === 'Literal' &&
            cardClassRe.test(a.value.value)
          ))
      );
    }
    function findCardAncestor(node) {
      const ancestors = context.sourceCode.getAncestors(node);
      for (let i = ancestors.length - 1; i >= 0; i--) {
        if (isCard(ancestors[i])) return ancestors[i];
      }
      return null;
    }
    return {
      JSXOpeningElement(node) {
        if (isCard(node) && findCardAncestor(node)) {
          context.report({ node, messageId: 'nested' });
        }
      }
    };
  }
};