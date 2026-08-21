## Why Minify CSS?

CSS minification removes unnecessary characters — whitespace, comments, newlines, and optional semicolons — from your stylesheets without changing their functionality. A typical stylesheet shrinks by 30% to 60% after minification, which directly reduces download size and improves First Contentful Paint and LCP. Smaller CSS also means fewer bytes for the parser to process, which is especially important on mobile networks. Because minified CSS is functionally identical, it is a safe, high-impact optimization you can apply with a single tool.

## What Minification Removes

Minifiers strip all comments, collapse runs of whitespace, remove unnecessary semicolons and line breaks, and shorten colors where safe, such as converting `#ffffff` to `#fff`. Advanced minifiers also merge duplicate selectors and properties, remove unused rules when used with purge tooling, and compress shorthand properties. The result is a compact file that produces the exact same layout and styling as the original. It is best practice to keep your human-readable source in your repository and only deploy the minified artifact.

## Minification vs Compression

Minification and compression are complementary techniques. Minification reduces the number of characters in your CSS, while HTTP compression such as Gzip or Brotli encodes the data more efficiently at the transport layer. A minified file also compresses more effectively because repeated patterns are shorter, so the two techniques multiply rather than replace each other. Always enable Brotli or Gzip at the web server level and verify that your CSS is served with the correct Content-Encoding header. Use our CSS Minifier to handle the minification step and inspect the size reduction in real time.