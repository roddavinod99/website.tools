/** @type {import('eslint').Rule.RuleModule} */
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
    // Flag any rounded class that uses lg/xl/2xl/3xl (with optional directional prefix)
    // Allowed: rounded, rounded-sm, rounded-md, rounded-full and their directional variants
    // e.g., rounded-t, rounded-t-sm, rounded-b-md, rounded-l-full are allowed
    // Disallowed: rounded-lg, rounded-xl, rounded-2xl, rounded-t-lg, rounded-l-xl, etc.
    const disallowedRe = /\brounded(?:-[tblr]|-(tl|tr|bl|br))?-(lg|xl|2xl|3xl)\b/g;
    const plainDisallowedRe = /\brounded-(lg|xl|2xl|3xl)\b/g;
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        // Check plain
        let m;
        const re1 = new RegExp(plainDisallowedRe.source, 'g');
        while ((m = re1.exec(node.value)) !== null) {
          context.report({ node, messageId: 'radius', data: { cls: m[0] } });
        }
        const re2 = new RegExp(disallowedRe.source, 'g');
        while ((m = re2.exec(node.value)) !== null) {
          // Avoid double-reporting plain ones already reported
          if (/^rounded-(lg|xl|2xl|3xl)$/.test(m[0])) continue;
          context.report({ node, messageId: 'radius', data: { cls: m[0] } });
        }
      },
      TemplateElement(node) {
        const v = node.value && node.value.cooked;
        if (!v) return;
        let m;
        const re1 = new RegExp(plainDisallowedRe.source, 'g');
        while ((m = re1.exec(v)) !== null) {
          context.report({ node, messageId: 'radius', data: { cls: m[0] } });
        }
        const re2 = new RegExp(disallowedRe.source, 'g');
        while ((m = re2.exec(v)) !== null) {
          if (/^rounded-(lg|xl|2xl|3xl)$/.test(m[0])) continue;
          context.report({ node, messageId: 'radius', data: { cls: m[0] } });
        }
      }
    };
  }
};
