import DOMPurify from "dompurify";

export function sanitize(dirty: string): string {
  if (typeof window === "undefined") return dirty;
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "code", "pre", "blockquote",
      "hr", "sub", "sup", "span", "div", "table", "thead", "tbody", "tr", "th", "td",
      "img", "svg", "path", "circle", "rect", "line", "polyline", "polygon",
      "g", "defs", "clipPath", "mask", "text", "tspan", "use",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "src", "alt", "class", "id", "style",
      "width", "height", "viewBox", "fill", "stroke", "stroke-width",
      "d", "cx", "cy", "r", "x", "y", "rx", "ry", "points", "xmlns",
      "preserveAspectRatio", "fill-rule", "clip-rule", "transform",
    ],
  });
}
