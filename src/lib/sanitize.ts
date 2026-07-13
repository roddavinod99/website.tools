import DOMPurify from "isomorphic-dompurify";

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6", "code", "pre", "blockquote",
    "hr", "sub", "sup", "span", "div", "table", "thead", "tbody", "tr", "th", "td",
    "img", "svg", "path", "circle", "rect", "line", "polyline", "polygon",
    "g", "defs", "clipPath", "mask", "text", "tspan", "use",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "src", "alt", "class", "id",
    "width", "height", "viewBox", "fill", "stroke", "stroke-width",
    "d", "cx", "cy", "r", "x", "y", "rx", "ry", "points", "xmlns",
    "preserveAspectRatio", "fill-rule", "clip-rule", "transform",
  ],
};

export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty, SANITIZE_CONFIG);
}
