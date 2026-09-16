/** @type {import('eslint').Rule.RuleModule} */
const FORBIDDEN = [
  'bg-white',
  'bg-black',
  'bg-gray-',
  'text-white',
  'text-black',
  'dark:bg-',
  'dark:text-'
];
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hard-coded color utility classes outside globals.css'
    },
    schema: [],
    messages: {
      hardcoded: 'Use a CSS variable token (--color-*) instead of "{{cls}}". See design spec §1.3 and §8.6.'
    }
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        for (const f of FORBIDDEN) {
          if (node.value.includes(f)) {
            context.report({ node, messageId: 'hardcoded', data: { cls: f } });
            return;
          }
        }
      },
      TemplateElement(node) {
        const v = node.value && node.value.cooked;
        if (!v) return;
        for (const f of FORBIDDEN) {
          if (v.includes(f)) {
            context.report({ node, messageId: 'hardcoded', data: { cls: f } });
            return;
          }
        }
      }
    };
  }
};