import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6", "code", "pre", "blockquote",
  "hr", "sub", "sup", "span", "div", "table", "thead", "tbody", "tr", "th", "td",
  "svg", "path", "circle", "rect", "line", "polyline", "polygon",
  "g", "defs", "clipPath", "mask", "text", "tspan", "use",
];

const ALLOWED_ATTR = [
  "href", "target", "rel", "alt", "class", "id", "tabindex",
  "width", "height", "viewBox", "fill", "stroke", "stroke-width",
  "d", "cx", "cy", "r", "x", "y", "rx", "ry", "points", "xmlns",
  "preserveAspectRatio", "fill-rule", "clip-rule", "transform",
];

const FORBID_TAGS = [
  "style", "script", "iframe", "object", "embed", "form", "input", "textarea", "select", "button", "noscript",
  "img", "video", "audio", "source", "track", "picture", "map", "area",
];

const FORBID_ATTR = [
  "onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "onchange", "onsubmit", "onreset", "onselect", "onscroll", "onabort", "onbeforeunload", "onhashchange", "onpopstate", "onstorage",
  "src", "srcset", "href", "action", "formaction", "xlink:href",
];

const SANITIZE_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS,
  FORBID_ATTR,
  SAFE_FOR_TEMPLATES: true,
  KEEP_CONTENT: true,
};

interface SanitizeConfig extends Record<string, unknown> {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
  SAFE_FOR_TEMPLATES?: boolean;
  KEEP_CONTENT?: boolean;
}

export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty, SANITIZE_CONFIG) as unknown as string;
}

export function sanitizeWithHrefValidation(dirty: string): string {
  const config: SanitizeConfig = {
    ...SANITIZE_CONFIG,
    ALLOWED_ATTR: [...ALLOWED_ATTR, "href"],
    FORBID_ATTR: FORBID_ATTR.filter((attr) => attr !== "href"),
  };
  return DOMPurify.sanitize(dirty, config) as unknown as string;
}