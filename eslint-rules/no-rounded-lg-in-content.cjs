/** @type {import('eslint').Rule.RuleModule} */
const ALLOWED = new Set(['rounded-sm', 'rounded-md', 'rounded', 'rounded-full']);
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Cap content UI radius at 6px (rounded-sm, rounded-md, or rounded-full only)'
    },
    schema: [],
    messages: {
      radius: 'Radius class "{{cls}}" exceeds the 6px cap for content UI. Use rounded-sm (4px) or rounded-md (6px).'
    }
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        const re = /\brounded(-[a-z0-9]+)?\b/g;
        let m;
        while ((m = re.exec(node.value)) !== null) {
          if (!ALLOWED.has(m[0])) {
            context.report({ node, messageId: 'radius', data: { cls: m[0] } });
          }
        }
      },
      TemplateElement(node) {
        const v = node.value && node.value.cooked;
        if (!v) return;
        const re = /\brounded(-[a-z0-9]+)?\b/g;
        let m;
        while ((m = re.exec(v)) !== null) {
          if (!ALLOWED.has(m[0])) {
            context.report({ node, messageId: 'radius', data: { cls: m[0] } });
          }
        }
      }
    };
  }
};