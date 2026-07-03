import type { ToolContent } from "@/types";

const contentMap: Record<string, ToolContent> = {

"ascii-art": {
    "whatItDoes": "Generates ASCII art text from user input using 18 built-in fonts (ANSI Shadow, Big, Block, Bubble, Digital, Doom, Isometric1, Larry 3D, Mini, Ogre, Puffy, Rectangles, Slavic, Small, Soft, Standard, Star Wars, and Twisted). Advanced features include color selection, letter spacing adjustment, horizontal/vertical flipping, reverse video mode, history tracking of recent generations, and the ability to copy output directly to clipboard.",
    "whyItExists": "ASCII art adds retro visual flair to terminal applications, source code headers, documentation, and README files. Developers need a quick way to generate consistent, font-rich ASCII art without installing separate command-line tools or visiting third-party websites.",
    "whoShouldUse": "Backend developers, CLI tool authors, open-source maintainers, and anyone who wants to add eye-catching text banners to their terminal output or project documentation.",
    "useCases": [
      "Generate a large ASCII banner for a CLI tool's --help output",
      "Create a styled header for source code comments or license files",
      "Add retro-themed text to game menus or splash screens",
      "Design custom ASCII logos for GitHub repository README files",
      "Produce flipped or reversed text for artistic designs",
      "Rapidly preview 18 fonts to pick the right style for a project"
    ],
    "instructions": [
      "Type or paste your desired text into the input field (up to 50 characters recommended for best rendering)",
      "Select one of the 18 available fonts from the font dropdown — the preview updates instantly",
      "Customize appearance using color picker, letter spacing slider, horizontal flip, vertical flip, and reverse video toggle",
      "Use the copy button to copy the rendered ASCII art to your clipboard, or access your generation history from the history panel",
      "For multi-line output, click 'Add Line' to generate separate styled lines that stack vertically",
      "Export your artwork as plain text or PNG for use in presentations, documentation, or merchandise"
    ],
    "examples": [
      "Input: 'HELLO' | Font: 'Standard' | Color: Cyan => Outputs a clean monospaced 'HELLO' in Standard font with cyan ANSI color codes",
      "Input: 'DEV' | Font: 'ANSI Shadow' | Flip: Horizontal => Outputs a mirrored 'DEV' in ANSI Shadow font with dramatic shadow effect"
    ],
    "bestPractices": [
      "Keep input under 20 characters for most fonts to avoid line wrapping in standard 80-column terminals",
      "Use monospace fonts (like Standard or Small) for terminal output; decorative fonts work best for visual media",
      "Pair flip horizontal with reverse video for a mirror-reflection effect",
      "Save frequently used font+color combinations by noting them in your project style guide",
      "Use the history feature to recall and reuse past designs without retyping input"
    ],
    "commonMistakes": [
      "Using very long input strings that produce unreadably wide output for the target display area",
      "Forgetting that decorative fonts (like Doom or Isometric1) require proportional spacing — letter spacing adjustments may distort them",
      "Applying color when the output is destined for a non-ANSI environment — color codes will appear as raw escape sequences",
      "Overusing flip and reverse simultaneously, producing output harder to read than the original",
      "Not testing the rendered width across different terminal emulators that render character widths differently"
    ],
    "faq": [
      "Can I use custom fonts? — 18 built-in fonts are available. Custom font upload is not supported.",
      "Why does my art look misaligned? — ASCII art relies on fixed-width characters. Ensure your display uses a monospace font.",
      "Is there a character limit? — No hard limit, but inputs over 50 characters produce very wide output.",
      "Can I save my creations? — Use copy to save to clipboard. Last 50 generations are stored in history."
    ]
  },

"barcode-generator": {
    "whatItDoes": "Generates barcodes in Code 128, EAN-13, UPC-A, QR Code, Data Matrix, and PDF417 formats. Customize size, color, and text display options. Download as SVG or PNG with batch generation support.",
    "whyItExists": "Barcodes bridge physical products with digital systems. This tool provides instant barcode generation without external dependencies or paid software.",
    "whoShouldUse": "E-commerce developers, inventory managers, product designers, and anyone needing to generate barcodes for labels, packaging, or tracking systems.",
    "useCases": ["Generate EAN-13 barcodes for retail product packaging", "Create Code 128 barcodes for warehouse inventory tracking", "Generate UPC-A barcodes for North American retail products", "Create PDF417 barcodes for shipping labels and ID cards", "Batch generate multiple barcodes for product catalogs", "Design QR Code barcodes for digital product packaging"],
    "instructions": ["Select the barcode symbology from the dropdown (Code 128, EAN-13, UPC-A, QR Code, etc.)", "Enter the data to encode — numeric only for EAN/UPC, alphanumeric for Code 128 and QR", "Customize appearance: bar color, background color, text label, width, and height", "Click Generate and preview the barcode; ensure it scans correctly with a barcode scanner app", "Download as SVG (vector) for print or PNG (raster) for web", "Use batch mode to generate multiple barcodes at once with sequential data"],
    "examples": ["Input: Code 128, Data \"ABC-12345\", Black bars, White background -> Output: SVG barcode image that scans as \"ABC-12345\"", "Input: EAN-13, Data \"590123456789\" -> Output: EAN-13 barcode with checksum digit, ready for retail packaging"],
    "bestPractices": ["Always test generated barcodes with a real scanner before production use", "Use SVG format for print applications to ensure crisp output at any size", "Include human-readable text below the barcode for fallback identification", "Ensure sufficient quiet zone (white space) around the barcode — minimum 10x the module width", "Match the barcode symbology to your industry standard (EAN for retail, Code 128 for logistics)"],
    "commonMistakes": ["Using the wrong symbology for the data type (e.g., putting letters in a numeric-only format)", "Making barcodes too small for reliable scanning — minimum size varies by symbology", "Forgetting the quiet zone around the barcode, causing scanning failures", "Not verifying the checksum digit (most formats calculate this automatically)", "Using low contrast colors that barcode scanners cannot distinguish"],
    "faq": ["What is the difference between EAN-13 and UPC-A? — EAN-13 is used globally with 13 digits; UPC-A is the North American standard with 12 digits. They are interchangeable with a leading zero.", "Can I generate QR codes instead of linear barcodes? — Yes, select QR Code from the symbology dropdown for matrix-style 2D barcodes.", "What is the quiet zone? — The blank margin around the barcode required for reliable scanning. Minimum 10x the narrow bar width on each side.", "Are the barcodes compliant with GS1 standards? — Yes, the generated barcodes follow GS1 specifications for retail and logistics use."]
  },

"base64": {
    "whatItDoes": "Encodes and decodes Base64 data with automatic input detection (plain text vs. Base64 string). Supports standard Base64, base64url (URL-safe), data URI generation for images/media, and four character encodings (UTF-8, ASCII, UTF-16LE, UTF-16BE). Includes file drag-and-drop, batch mode for processing multiple items, and real-time character count comparison.",
    "whyItExists": "Base64 encoding is essential for embedding binary data in text-based formats like JSON, HTML, CSS, and URLs. A reliable multi-format tool handles edge cases like URL safety, encoding variants, and batch operations without switching between utilities.",
    "whoShouldUse": "Web developers, API designers, software engineers working with binary data transmission, and anyone embedding images or files in text-based formats.",
    "useCases": [
      "Encode an image to a data URI for inline embedding in CSS or HTML",
      "Decode a JWT token's payload (base64url-encoded) for inspection",
      "Convert a binary file to Base64 for transmission in a JSON API payload",
      "Batch-encode multiple small files for bundling into a single configuration file",
      "Use base64url encoding to generate URL-safe tokens without padding",
      "Verify whether a given string is valid Base64 using auto-detect"
    ],
    "instructions": [
      "Paste your input text or drag-and-drop a file — auto-detects if input is plain text (to encode) or Base64 (to decode)",
      "Select character encoding: UTF-8 (default), ASCII, UTF-16LE, or UTF-16BE",
      "Choose output format: Standard Base64, Base64 URL, or Data URI (prepends correct MIME type)",
      "Click 'Encode' or 'Decode' — result appears with size comparison showing input vs. output byte count",
      "For batch mode, switch to 'Batch' tab and enter multiple values (one per line) — each processed independently",
      "Copy individual results or entire batch output, or use 'Download' to save as a text file"
    ],
    "examples": [
      "Input: 'Hello World' | Encode | UTF-8 | Standard => Output: 'SGVsbG8gV29ybGQ=' (standard Base64 with padding)",
      "Input: 'SGVsbG8gV29ybGQ' | Decode | Auto-detect => Output: 'Hello World' (decoded without padding)"
    ],
    "bestPractices": [
      "Use base64url when encoding data for URLs or filenames to avoid '+/=' characters that need percent-encoding",
      "For large files (10+ MB), consider chunked encoding to avoid memory issues",
      "When embedding images in CSS, use data URI output format — prepends correct 'data:image/...;base64,' prefix",
      "Verify output size: Base64 inflates data by ~33% — ensure your transport medium can handle the overhead",
      "Use UTF-16LE or UTF-16BE only when targeting legacy systems requiring those encodings"
    ],
    "commonMistakes": [
      "Using standard Base64 in URLs without switching to base64url — '+' and '/' break URL parsing",
      "Decoding a Base64 string without verifying validity — garbage input produces garbage output",
      "Forgetting Base64 is encoding, not encryption — never use it to protect sensitive data",
      "Selecting wrong character encoding when encoding, causing garbled decoded output on the receiving end",
      "Dragging very large files without monitoring output size — some browsers may freeze or crash"
    ],
    "faq": [
      "What is the difference between Base64 and base64url? — Base64 uses '+/=' which are not URL-safe. base64url uses '-_' and strips padding.",
      "Can I encode images with this tool? — Yes, drag-and-drop any image file. The tool encodes it and optionally adds data URI header.",
      "How do I process multiple files at once? — Switch to 'Batch' mode and paste multiple values or use multi-file upload.",
      "Does the tool support streaming for large files? — Files are processed in memory. For >50 MB, use a command-line tool."
    ]
  },

"base64-decoder": {
    "whatItDoes": "A dedicated standalone Base64 decoder that automatically detects whether input contains valid Base64 content and determines the original encoding type. Features include automatic encoding detection (UTF-8, ASCII, UTF-16LE, UTF-16BE), downloadable decoded output as a binary file, real-time validation with error highlighting, and a clean single-purpose interface focused exclusively on decoding.",
    "whyItExists": "Users often need a focused tool that handles Base64 decoding without the clutter of an encoder. A standalone decoder reduces cognitive load by presenting exactly the controls needed, with automatic detection that eliminates guesswork about input format and source encoding.",
    "whoShouldUse": "Security researchers analyzing encoded payloads, developers debugging Base64 data from APIs, QA engineers verifying encoded assets, and anyone who primarily decodes rather than encodes.",
    "useCases": [
      "Decode a Base64-encoded image received from an API to verify its contents",
      "Decode email attachment data (MIME Base64) for quick inspection",
      "Convert Base64-encoded configuration values back to human-readable text",
      "Download a Base64-encoded binary file (ZIP, PDF) after decoding to disk",
      "Validate whether a suspicious string is valid Base64 before further analysis",
      "Decode multi-encoded data nested inside other Base64 layers"
    ],
    "instructions": [
      "Paste the Base64 string into the input area or drag-and-drop a text file containing the Base64 data",
      "The tool automatically detects if the input is valid Base64 — invalid characters are highlighted in red",
      "Review the detected source encoding (UTF-8, ASCII, UTF-16LE, UTF-16BE) shown in the status bar",
      "Click 'Decode' — decoded output appears in the result panel with byte-by-byte breakdown if binary",
      "If the decoded output is binary, use 'Download' to save it as a file with the correct extension",
      "Copy decoded text to clipboard directly, or use 'Download as Text' for non-binary output"
    ],
    "examples": [
      "Input: 'SGVsbG8gV29ybGQh' | Auto-detect => Output: 'Hello World!' (decoded to UTF-8 text)",
      "Input: 'iVBORw0KGgo...' (PNG) | Auto-detect => Output: [binary PNG] | Download as 'decoded.png'"
    ],
    "bestPractices": [
      "Check the auto-detected encoding before decoding — mismatched encoding produces garbled text",
      "Use file download for binary data rather than copying to clipboard, which may corrupt bytes",
      "Verify padding: valid Base64 has length divisible by 4 — the tool warns about malformed padding",
      "For nested Base64, decode in stages until you reach plain text",
      "Validate decoded output size matches expectations — wildly different size indicates corrupted input"
    ],
    "commonMistakes": [
      "Pasting Base64 with line breaks or 'data:' URI prefixes — strip these first or auto-detection may fail",
      "Assuming auto-detected encoding is always correct for short strings",
      "Forgetting to download binary output and trying to view it as text in the result panel",
      "Using the decoder on already-decoded plain text, producing garbage or triggering an error",
      "Ignoring padding warnings — missing/extra padding indicates truncated or corrupted input"
    ],
    "faq": [
      "Can this tool decode base64url? — Yes, base64url is automatically detected and decoded.",
      "How does encoding detection work? — It examines byte patterns and BOM markers for UTF-16 vs UTF-8 vs ASCII.",
      "What if my decoded output is garbled? — Try switching source encoding manually. Auto-detection may be wrong for short strings.",
      "Can I decode large strings? — Yes, but multi-megabyte strings may take a few seconds."
    ]
  },

"base64-encoder": {
    "whatItDoes": "A dedicated standalone Base64 encoder that converts text or file input into Base64 with support for three character encodings (UTF-8, ASCII, UTF-16LE, UTF-16BE). Features include file upload with drag-and-drop, real-time encoding as you type, byte-size comparison between input and output, and optional data URI prefix for embedding files in web documents.",
    "whyItExists": "Many workflows require fast, focused encoding without the distraction of a decoder. A streamlined interface for converting text or small files to Base64 for embedding in code, configuration, or data transfer.",
    "whoShouldUse": "Frontend developers embedding assets in CSS/HTML, backend developers preparing test payloads, mobile developers encoding data for HTTP headers, and technical writers creating documentation with embedded examples.",
    "useCases": [
      "Encode a CSS or JS file to embed into a single HTML page for distribution",
      "Convert a small icon or font file to data URI for inline use in CSS",
      "Encode sensitive configuration values for storage in environment variables",
      "Prepare Base64-encoded test data for API endpoint integration tests",
      "Encode binary payloads for WebSocket or gRPC message transmission",
      "Quickly convert a short text string to Base64 for a demonstration or example"
    ],
    "instructions": [
      "Type or paste your text into the input area, or drag-and-drop a file — input is encoded as you type",
      "Select the character encoding: UTF-8 (recommended), ASCII (strict 7-bit), UTF-16LE, or UTF-16BE",
      "Toggle 'Data URI' on/off — when enabled, output is prefixed with 'data:...;base64,' header",
      "Monitor the input/output byte counter showing encoding size inflation (~33%)",
      "Copy the encoded result with 'Copy' button, or 'Copy as Data URI' for direct embedding",
      "Configure line wrapping (every 76 chars) in Settings for compatibility with email/MIME standards"
    ],
    "examples": [
      "Input: 'Hello World!' | UTF-8 | No Data URI => Output: 'SGVsbG8gV29ybGQh'",
      "Input: [red 16x16 PNG icon] | Data URI ON => Output: 'data:image/png;base64,iVBORw0KGgo...'"
    ],
    "bestPractices": [
      "Use UTF-8 encoding unless you have a specific reason otherwise — it is the universal standard",
      "Enable line wrapping only for email/MIME compatibility (76 chars per line)",
      "For assets under 1 KB, data URI encoding is efficient; for larger assets, HTTP overhead may be significant",
      "Use 'Copy as Data URI' when embedding images in HTML/CSS to avoid typing the data: prefix manually",
      "When encoding binary files, attach correct file extension hint for the receiving side"
    ],
    "commonMistakes": [
      "Encoding in one encoding and expecting the recipient to decode with a different encoding",
      "Leaving data URI mode on when encoding non-media text",
      "Encoding very large files (>50 MB) in the browser — memory constraints may cause tab crash",
      "Assuming Base64 provides any security — it is obfuscation, not encryption",
      "Forgetting to account for the 33% size increase in bandwidth-sensitive contexts"
    ],
    "faq": [
      "What is the difference from the combined Base64 tool? — The dedicated encoder always encodes, giving a simpler interface.",
      "Can I encode multiple files at once? — One file at a time. For batch, use the combined Base64 tool.",
      "Does the tool work offline? — Yes, it runs entirely in the browser with no server communication needed.",
      "What MIME type is used for data URI? — Auto-detected from file extension. Unknown types use application/octet-stream."
    ]
  },

"base-converter": {
    "whatItDoes": "Converts numbers between any two bases from binary (base-2) to base-64 with arbitrary precision using JavaScript BigInt. Features include auto-detection of common prefixes (0b, 0o, 0x), two's complement representation for negative numbers, ASCII interpretation showing what bytes the number represents as characters, step-by-step conversion showing the division algorithm, and support for fractional input with configurable precision.",
    "whyItExists": "Developers frequently need to convert between number bases for low-level data, bit manipulation, memory addresses, or network protocols. A single tool handling arbitrary bases, large numbers (BigInt), and signed representations eliminates context-switching between specialized calculators.",
    "whoShouldUse": "Systems programmers (Rust, C, C++) working with binary protocols, embedded engineers reading register values, security researchers analyzing memory dumps, computer science students, and web developers interpreting color codes or bitfields.",
    "useCases": [
      "Convert a hexadecimal memory address (0x7FFF) to decimal for pointer arithmetic",
      "Interpret a binary bitmask (11010110) in decimal and hexadecimal for network config",
      "Check two's complement representation of -42 in 8-bit binary for embedded programming",
      "Decode a base-36 shortened URL hash back to its numeric ID",
      "Interpret a large decimal as ASCII bytes to find embedded text in numeric data",
      "Follow step-by-step division to understand base conversion for CS homework"
    ],
    "instructions": [
      "Enter your number — prefixes like 0b, 0o, 0x are auto-detected, or manually select input base",
      "Select the output base from the dropdown (base-2 through base-64)",
      "Toggle options: 'Show Steps', 'ASCII Interpretation', and 'Two's Complement' for signed negatives",
      "Click 'Convert' or press Enter — result appears with step-by-step breakdown if enabled",
      "For fractional numbers (e.g. 12.75), both integer and fractional parts are converted and combined",
      "Copy the result or copy a specific step from the step list for documentation"
    ],
    "examples": [
      "Input: '0xFF' | To: Decimal | Auto-detect => Output: '255' (auto-detects 0x prefix)",
      "Input: '-42' | To: Binary 8-bit | Two's Complement ON => Output: '11010110'"
    ],
    "bestPractices": [
      "Enable 'Show Steps' when debugging conversion logic or teaching the algorithm",
      "Use two's complement mode for negative numbers when working with signed integer types",
      "Enable ASCII interpretation when analyzing numeric data with possible embedded text strings",
      "For very large numbers (over 2^53), ensure BigInt mode is active — regular Number cannot represent these safely",
      "Use base-36 for compact alphanumeric output, base-64 for maximum density"
    ],
    "commonMistakes": [
      "Forgetting to prefix hex with '0x' or binary with '0b' — without prefixes input is treated as decimal",
      "Assuming two's complement is needed for positive numbers — it only matters for negative values",
      "Confusing 'input base' with 'prefix detection' — if you set base-16 manually but type '0xFF', the 0x is literal",
      "Using this for floating-point IEEE 754 representation — it handles integer/fractional but not float format",
      "Not selecting a wide enough output width for two's complement (e.g. -127 in 8 bits vs 16 bits)"
    ],
    "faq": [
      "What is the maximum input size? — BigInt supports arbitrarily large integers limited only by memory.",
      "How does two's complement work for non-8-bit widths? — The tool uses output base to determine bit width.",
      "Can I convert fractional numbers like 3.14159? — Yes, both integer and fractional parts are converted separately.",
      "What does ASCII interpretation show? — Groups the number into bytes and maps each to its ASCII character."
    ]
  },

"binary": {
    "whatItDoes": "Converts text to binary and binary to text with fine-grained control over format. Features include space-separated (byte-divided) and continuous (no spaces) output modes, 7-bit vs 8-bit byte width selection, optional hex and octal representation alongside each character, and file-to-binary conversion with drag-and-drop upload.",
    "whyItExists": "Understanding binary representation is fundamental to computer science and low-level programming. A flexible converter that handles both directions with configurable byte width and multiple output formats is essential for developers working with serialization, networking protocols, or educational content.",
    "whoShouldUse": "Computer science educators and students, embedded systems developers, security researchers analyzing raw byte streams, and anyone debugging binary serialization or deserialization issues.",
    "useCases": [
      "Convert a text string to binary to understand character-to-bit mapping for a tutorial",
      "Decode a binary string from a sensor or serial device back to human-readable text",
      "Toggle between 7-bit ASCII and 8-bit extended ASCII to compare representations",
      "Use hex+octal per-char view to understand relationships between binary, hex, and octal",
      "Convert a binary file's first few bytes to see its magic number/header",
      "Create binary representation of configuration data for hardware programming exercises"
    ],
    "instructions": [
      "Select conversion direction: 'Text to Binary' or 'Binary to Text'",
      "Paste input or drag-and-drop a file",
      "Configure options: 7-bit or 8-bit width, Space-Separated vs Continuous output format",
      "Toggle 'Show Hex & Octal' for supplementary columns showing hex and octal per byte",
      "Click 'Convert' — result appears with count of characters/bytes converted",
      "Copy result or use 'Download Binary' to save as .txt file"
    ],
    "examples": [
      "Input: 'Hi' | Text to Binary | 8-bit | Space-Separated => Output: '01001000 01101001'",
      "Input: '01001000 01101001' | Binary to Text | 8-bit => Output: 'Hi'"
    ],
    "bestPractices": [
      "Use 7-bit mode for standard English alphabet, digits, and punctuation only",
      "For non-English characters (accents, symbols), use 8-bit mode or UTF-8 input",
      "Use Space-Separated output for readability; Continuous for compact storage or transmission",
      "Enable 'Show Hex & Octal' when teaching number system relationships",
      "When converting binary back to text, match the width (7 vs 8 bit) used during encoding"
    ],
    "commonMistakes": [
      "Using 7-bit mode to encode non-ASCII characters — they require 8-bit and will be truncated",
      "Providing binary with spaces when expecting continuous mode or vice versa",
      "Assuming 8-bit binary corresponds to UTF-8 — tool treats bytes as Latin-1, not variable-length UTF-8",
      "Forgetting leading zeros — 7-bit outputs 7 bits, 8-bit outputs 8; decoding with wrong width shifts bits",
      "Dragging very large files (>100 MB) — binary representation inflates data 8x"
    ],
    "faq": [
      "Does this support UTF-8 input? — It treats input as UTF-8 then converts each byte individually.",
      "What is 7-bit vs 8-bit? — 7-bit uses ASCII range (0-127), 8-bit extends to Latin-1 (0-255).",
      "Can I convert a file to binary? — Yes, drag-and-drop any file. Reads as text or raw bytes.",
      "How do I decode binary without spaces? — Select 'Continuous' mode; tool auto-groups into 7/8-bit chunks."
    ]
  },

"case-converter": {
    "whatItDoes": "Converts text between 13 case variants including camelCase, PascalCase, snake_case, kebab-case, Title Case, UPPER CASE, lower case, CONSTANT_CASE, Train-Case, Dot.Case, Sentence case, sWAP cASE, and aLtErNaTiNg cAsE. Displays all variants simultaneously in real-time with individual copy buttons for each variant and a character/word count summary.",
    "whyItExists": "Different programming languages enforce different naming conventions (camelCase for JS, snake_case for Python, kebab-case for CSS). Developers need to convert between conventions quickly when moving between projects or refactoring codebases without manual search-and-replace operations.",
    "whoShouldUse": "Full-stack developers working across multiple languages, API designers normalizing field names, database administrators mapping between conventions, and anyone refactoring large codebases with inconsistent naming.",
    "useCases": [
      "Convert a database column in snake_case to camelCase for a JavaScript API response",
      "Rename Python variables from camelCase to PEP 8-compliant snake_case",
      "Generate CONSTANT_CASE environment variable names from a plain English description",
      "Reformat filenames from Title Case to kebab-case for URL slug generation",
      "Create Train-Case CSS class names from a camelCase React component name",
      "Quickly produce all possible case variants of a function name for documentation"
    ],
    "instructions": [
      "Type or paste your source text — all 13 case variants update in real-time as you type",
      "Browse the grid of all variants, each clearly labeled with its case type name",
      "Click the copy icon next to any variant to copy it to clipboard — each has its own copy button",
      "Toggle 'Apply to Multi-Word' for camelCase/PascalCase to join or preserve spaces",
      "Use the character/word count display to monitor input length",
      "For bulk conversion, paste a list (one per line) — each line processed independently in a table"
    ],
    "examples": [
      "Input: 'hello world example' => Outputs: camelCase 'helloWorldExample', snake_case 'hello_world_example', kebab-case 'hello-world-example', and 10 more variants",
      "Input: 'userID-field' => Outputs: camelCase 'userIdField', snake_case 'user_id_field', Title Case 'User ID Field'"
    ],
    "bestPractices": [
      "Use the live preview to verify your chosen variant before copying — catches edge cases like leading digits",
      "For multi-line input, process one line at a time for clean results",
      "Use Dot.Case for config keys (NestJS, Java properties) and kebab-case for URL slugs",
      "Remember camelCase starts lowercase, PascalCase starts uppercase — mixing them is a common bug",
      "Review acronyms manually — the tool applies standard rules without special acronym handling"
    ],
    "commonMistakes": [
      "Assuming UPPER CASE and CONSTANT_CASE are the same — CONSTANT_CASE inserts underscores between words",
      "Using snake_case where kebab-case is expected or vice versa",
      "Not cleaning the input of special characters — @, #, $ may cause unexpected word boundaries",
      "Forgetting Sentence case capitalizes only the first word of the entire input",
      "Relying on swap case or alternating case for serious purposes — these are novelty formats"
    ],
    "faq": [
      "Does this handle acronyms like 'HTML'? — In camelCase they become 'html', in PascalCase 'Html'. Standard rules apply.",
      "Can I convert an entire file? — Yes, paste the whole file. For code, use single identifiers for best results.",
      "Why are some variants identical for single words? — Single-word inputs naturally produce the same output across many variants.",
      "Is there a way to preserve abbreviations? — Not automatically. Edit the output after conversion."
    ]
  },

"color-converter": {
    "whatItDoes": "Converts colors between six formats (HEX, RGB, RGBA, HSL, HSLA, HSV, CMYK) with automatic format detection on paste. Includes a WCAG contrast checker computing contrast ratios and pass/fail for AA/AAA levels. Features a palette generator for shades, tints, complementary, triadic, and tetradic schemes, and calculates Delta E (CIE76) color difference for precise color comparison.",
    "whyItExists": "Color management is critical in web design and UI development. Developers frequently need to convert between color models, check accessibility compliance, and generate harmonious color schemes — tasks that previously required multiple specialized tools or manual calculations.",
    "whoShouldUse": "Frontend developers and UI designers implementing design systems, accessibility engineers auditing color contrast, digital artists working across color spaces, and branding specialists creating consistent palettes.",
    "useCases": [
      "Convert a HEX color from a mockup to RGBA for CSS with opacity",
      "Check if text color passes WCAG AA compliance against a background",
      "Generate a 5-color palette with complementary/triadic/tetradic schemes from a brand color",
      "Calculate Delta E between two near-identical colors for brand consistency",
      "Create shades and tints from a base color for button states",
      "Convert CMYK print values to HSL for use in a web application"
    ],
    "instructions": [
      "Type or paste a color in any supported format — format is auto-detected",
      "All converted values displayed side-by-side — click any format to copy it",
      "For WCAG, enter foreground and background colors — displays ratio and AA/AAA pass/fail for normal and large text",
      "Open palette panel, select scheme type (Shades, Tints, Complementary, Triadic, Tetradic), adjust swatch count and hue rotation",
      "Use Delta E calculator with two colors — under 1.0 is imperceptible, 2-3 barely perceptible, above 5 clearly different",
      "Export palette as CSS custom properties snippet using the export button"
    ],
    "examples": [
      "Input: '#FF6600' | Auto-detect => Output: RGB 'rgb(255, 102, 0)', HSL 'hsl(24, 100%, 50%)', CMYK 'cmyk(0%, 60%, 100%, 0%)', and more",
      "Foreground: '#333' | Background: '#FFF' => 'Contrast Ratio: 11.04:1 | Pass AA Normal: YES | Pass AAA Normal: YES'"
    ],
    "bestPractices": [
      "Use WCAG contrast checker early in design process — aim for AAA (7:1) for body text",
      "Use 'Shades' and 'Tints' palette generators for consistent interaction states from one brand color",
      "Use Delta E to validate printed materials against digital designs — under 2 is visually identical",
      "Export palettes as CSS custom properties for design system consistency",
      "When converting CMYK to RGB/HEX, understand that screen and print gamuts differ"
    ],
    "commonMistakes": [
      "Confusing HSL and HSV — HSL has Lightness, HSV has Value; same color produces different values",
      "Using HEX shorthand (#FFF) without realizing it expands to #FFFFFF",
      "Assuming WCAG 'Large Text' means any heading — it specifically means 18pt bold or 24pt regular",
      "Entering CMYK without proper color space context — conversion uses standard formulas",
      "Generating triadic palettes with hues too close together — keep 120-degree spacing"
    ],
    "faq": [
      "What is Delta E? — CIE76 measures perceptual color difference. 1 is the minimum the human eye can detect.",
      "Can I use this for print design? — Yes, it supports CMYK, but monitor calibration affects actual output.",
      "How are complementary colors calculated? — Rotating hue by 180 degrees. Triadic uses 120-degree rotations.",
      "Does WCAG work with alpha transparency? — Foreground alpha is composited against background automatically."
    ]
  },

"color-eyedropper": {
    "whatItDoes": "A full-featured color picker that captures colors from on-screen with output in all major formats (HEX, RGB, RGBA, HSL, HSLA, HSV, CMYK). Includes a color harmony generator (complementary, analogous, triadic, tetradic, monochromatic), WCAG contrast checker, color blindness simulation (protanopia, deuteranopia, tritanopia, achromatopsia), gradient generator with multi-stop linear/radial gradients, and palette save/export as CSS code.",
    "whyItExists": "Color selection involves far more than picking a single color — designers need harmonious relationships, accessibility verification, visual impairment simulation, and gradient generation from one eyedropper starting point instead of juggling separate tools.",
    "whoShouldUse": "UI/UX designers building accessible color systems, frontend developers implementing design tokens, brand managers ensuring color consistency, and accessibility specialists evaluating color choices for visual impairments.",
    "useCases": [
      "Pick a color from a reference image and instantly get all format conversions and harmonious palettes",
      "Verify a color palette remains distinguishable for color blindness users using simulation",
      "Generate a complete CSS gradient from two picked colors with multiple stops",
      "Save a palette of 5 colors as CSS custom properties for a design system",
      "Check WCAG compliance of foreground/background while iterating on color choices",
      "Export a monochromatic palette from a brand color for data visualization charts"
    ],
    "instructions": [
      "Click the eyedropper icon to activate — move cursor over the canvas or uploaded image to sample colors in real-time",
      "Selected color appears in all six formats — click any format to copy it",
      "Open 'Harmony' panel and choose scheme type — generated swatches appear with copy buttons",
      "Use Color Blindness Simulator by selecting a type — main color and harmony are filtered accordingly",
      "In Gradient Generator, add color stops, choose linear (angle) or radial (shape/position), copy generated CSS",
      "Save colors/palettes with 'Save Palette', add a name, export all as CSS file"
    ],
    "examples": [
      "Pick: Blue (#007BFF) | Harmony: Complementary => Output: #007BFF + #FF7B00 + 3 analogous variations forming 5-color palette",
      "Pick 1: #FF6B6B | Pick 2: #4ECDC4 | Gradient: Linear 45deg => 'background: linear-gradient(45deg, #FF6B6B, #4ECDC4);'"
    ],
    "bestPractices": [
      "Use color blindness simulator before finalizing any palette — ~8% of men have color vision deficiency",
      "Build gradients with at least 3 stops for visual depth",
      "Save reusable palettes with descriptive names per project — export produces clean CSS custom properties",
      "Pair warm and cool colors in harmony schemes for maximum visual interest",
      "Always check WCAG contrast ratios for text-on-background combinations"
    ],
    "commonMistakes": [
      "Relying solely on visual appeal without color blindness simulation",
      "Creating gradients with stops too close in hue, producing muddy transitions",
      "Saving palettes without names or organization",
      "Assuming the eyedropper picks the exact color displayed — monitor calibration affects sampling",
      "Generating too many analogous harmony colors that are all too similar"
    ],
    "faq": [
      "Can I pick colors from outside the browser? — The eyedropper works within the tool's canvas. Screenshot and upload for external colors.",
      "What color blindness types are simulated? — Protanopia, Deuteranopia, Tritanopia, and Achromatopsia using standard transformation matrices.",
      "How do I export for a design system? — After saving, click 'Export CSS'. Each palette becomes CSS custom properties.",
      "Can I generate gradients with more than 2 colors? — Yes, unlimited stops. Click 'Add Stop' to insert additional colors."
    ]
  },

"cron-expression": {
    "whatItDoes": "A visual cron expression builder that constructs cron schedules from human-friendly controls and displays the expression in real-time. Includes preset buttons (@yearly, @monthly, @weekly, @daily, @hourly), a human-readable description, a table showing the next 10 execution times, timezone selection, 6-field cron support (with seconds), @macro expansion, favorites/saved expressions, and export as systemd timer or crontab format.",
    "whyItExists": "Cron expressions are notoriously error-prone to write by hand — a misplaced asterisk can cause a job to run too frequently or never. A visual builder eliminates syntax errors, provides immediate feedback through descriptions and execution preview, and supports multiple cron variants for the full spectrum of scheduling needs.",
    "whoShouldUse": "DevOps engineers managing scheduled jobs, backend developers setting up cron tasks, system administrators automating maintenance scripts, and anyone learning cron syntax.",
    "useCases": [
      "Build a cron expression for daily database backup at 3:30 AM (30 3 * * *) without memorizing field order",
      "Schedule a job for the first Monday of every month using advanced day-of-week positioning",
      "Preview next 10 execution times to verify quarterly report job runs on correct dates",
      "Convert a cron expression to systemd timer format for a modern Linux deployment",
      "Save a library of common cron expressions as favorites (nightly builds, weekly reports, health checks)",
      "Debug an existing cron expression by pasting it in to see human-readable description and next run times"
    ],
    "instructions": [
      "Use the visual form to set minute, hour, day-of-month, month, and day-of-week — dropdowns prevent invalid entries",
      "Select from preset buttons (@yearly, @monthly, @weekly, @daily, @hourly) to auto-populate fields",
      "Toggle '6-Field Mode' to add seconds precision (format: sec min hour dom mon dow)",
      "Read the human-readable description — updates in real-time explaining the schedule in plain English",
      "View 'Next 10 Executions' table to validate the schedule — shows exact dates/times in selected timezone",
      "Save expression as favorite with custom name, or export as crontab entry or systemd timer unit"
    ],
    "examples": [
      "Config: Every weekday at 9:00 AM => Expression: '0 9 * * 1-5' | Description: 'At 09:00 AM, Monday through Friday'",
      "Config: First Monday of every month at 2:30 AM => Expression: '30 2 * * 1#1' | Next 10: Shows each first Monday at 02:30"
    ],
    "bestPractices": [
      "Always check 'Next 10 Executions' before deploying — catches off-by-one and DST issues",
      "Use timezone selection when scheduling across servers in different timezones",
      "Save frequently used expressions as favorites with descriptive names",
      "For jobs every few minutes, use 'Every N Minutes' option — generates correct '*/N' syntax",
      "Use 6-field mode only when sub-minute precision is needed — most cron implementations don't support seconds"
    ],
    "commonMistakes": [
      "Confusing day-of-month (field 3) with day-of-week (field 5) — both set means both must match",
      "Using '0 * * * *' expecting every hour — correct. But '*/1 * * * *' runs every minute, often unintended",
      "Forgetting cron uses server-local time — scheduling for 14:00 may not be 2 PM in your timezone",
      "Using @daily (0 0 * * *) when meaning @midnight — they are the same, but expectations may differ",
      "Copying systemd format into crontab — syntax differs; use correct export format for your target system"
    ],
    "faq": [
      "5-field vs 6-field cron? — Standard uses 5 fields. 6-field adds seconds at the beginning. Not all systems support 6-field.",
      "How are @macros expanded? — @yearly = 0 0 1 1 *, @monthly = 0 0 1 * *, @daily = 0 0 * * *, @hourly = 0 * * * *",
      "Can I export to systemd? — Yes, click 'Export as Systemd Timer' for OnCalendar= syntax.",
      "Do next 10 executions account for DST? — Yes, timezone-aware calculation handles daylight saving transitions."
    ]
  },

"csp-generator": {
    "whatItDoes": "A visual Content Security Policy builder that generates CSP headers through an interactive directive editor. Features include a nonce generator for inline scripts/styles, presets for common environments (Strict CSP, WordPress, React/SPA), toggling between meta tag and HTTP header output formats, report-uri/report-to configuration, directives search/filter, and download of the final policy as a text file.",
    "whyItExists": "CSP is one of the most effective defenses against XSS, but writing a correct policy manually is complex and error-prone. A visual builder helps developers craft policies that are both secure and functional by guiding them through each directive with clear descriptions.",
    "whoShouldUse": "Security engineers configuring web application defenses, full-stack developers deploying CSP, DevOps engineers adding security headers, and compliance teams documenting security controls.",
    "useCases": [
      "Generate a strict CSP for a React SPA that uses inline scripts and styles",
      "Create a WordPress-compatible CSP allowing necessary inline scripts while blocking XSS",
      "Build a CSP with report-uri configured to send violation reports to a monitoring endpoint",
      "Generate both meta tag and HTTP header versions of the same policy",
      "Add nonce-based policy for a specific page with fresh nonces per request",
      "Audit an existing CSP by pasting it in, editing visually, and downloading the updated version"
    ],
    "instructions": [
      "Start with a preset (Strict, WordPress, React/SPA) or from scratch — directive editor lists all standard CSP directives",
      "Add/remove directives using toggles — each has a description explaining what sources it controls",
      "For each directive, specify allowed sources with autocomplete suggestions (self, domains, nonces, hashes, unsafe-inline, etc.)",
      "Use nonce generator for cryptographically random nonces for inline script and style tags",
      "Toggle between 'Meta Tag' and 'HTTP Header' — meta tags don't support frame-ancestors, sandbox, or report-to",
      "Configure reporting with report-uri URL and optional report-to endpoint name",
      "Download the completed policy as .txt or copy to clipboard — includes human-readable summary"
    ],
    "examples": [
      "Preset: React/SPA | Customize: Add GA => Output: \"default-src 'self'; script-src 'self' https://www.googletagmanager.com 'nonce-abc123'; style-src 'self' 'nonce-abc123'; img-src 'self' https://www.google-analytics.com\"",
      "Preset: Strict CSP | Meta Tag => Output: '<meta http-equiv=\"Content-Security-Policy\" content=\"base-uri 'self'; default-src 'self'; script-src 'self' 'nonce-{NONCE}' 'strict-dynamic'\">'"
    ],
    "bestPractices": [
      "Start with Strict CSP preset and loosen only what breaks — principle of least privilege",
      "Use nonces rather than 'unsafe-inline' — same functionality without disabling XSS protection",
      "Always configure report-uri in production — violation reports help identify breaks before users notice",
      "Test in staging with Content-Security-Policy-Report-Only before deploying to production",
      "Use HTTP header format when possible — more secure as it applies before page parsing begins"
    ],
    "commonMistakes": [
      "Including 'unsafe-inline' alongside nonces — ignored when nonce is present but causes confusion",
      "Forgetting to regenerate nonces per request — static nonces defeat the purpose",
      "Adding excessive domain allowlists instead of using 'strict-dynamic' — creates maintenance burden",
      "Using meta tag for HTTP-header-only directives (frame-ancestors, sandbox, report-to)",
      "Setting default-src too permissively — it serves as fallback for all unlisted directives"
    ],
    "faq": [
      "report-uri vs report-to? — report-uri is older and widely supported. report-to uses the Reporting API and needs a Report-To header.",
      "Can I use CSP with inline event handlers? — Blocked unless using 'unsafe-hashes'. Recommended: use addEventListener in nonced scripts.",
      "Does the tool support CSP Level 3? — Yes, including 'strict-dynamic', 'unsafe-hashes', 'report-to', and worker-src.",
      "What does 'strict-dynamic' do? — Allows scripts loaded by an already-trusted script to execute, eliminating the need to list every CDN."
    ]
  },

"css-formatter": {
    "whatItDoes": "Formats and beautifies CSS code with three output modes (expanded, compact, compressed). Includes options to sort properties alphabetically or by type, sort selectors alphabetically, remove duplicate rules and properties, strip comments, control vendor prefix ordering, and convert color formats (HEX to RGBA, HSL, or named colors).",
    "whyItExists": "CSS codebases maintained by multiple developers quickly accumulate inconsistent formatting, duplicates, and mixed color formats. A comprehensive formatter restores consistency, reduces file size, and makes code easier to navigate without altering behavior.",
    "whoShouldUse": "Frontend developers maintaining large CSS/SCSS codebases, teams enforcing style guidelines, web designers cleaning up exported CSS, and anyone bundling CSS for production.",
    "useCases": [
      "Format a minified CSS file back into readable expanded form for debugging",
      "Sort all CSS properties consistently before committing to enforce team standards",
      "Remove duplicate CSS rules and properties from an accumulated stylesheet",
      "Convert all HEX colors in a stylesheet to RGBA for easier opacity manipulation",
      "Reorder vendor prefixes to spec-compliant order for consistency",
      "Strip all comments from CSS before deployment to reduce file size"
    ],
    "instructions": [
      "Paste CSS or upload a .css file via drag-and-drop",
      "Select output format: Expanded (one prop per line), Compact (one line per rule), or Compressed (single line)",
      "Configure sorting: toggle 'Sort Properties' (Alphabetical or By Type), 'Sort Selectors', and 'Remove Duplicates'",
      "Enable 'Remove Comments' and configure 'Vendor Prefix Order' to your preferred standard",
      "Use color format converter — choose target format and all matching colors are converted",
      "Click 'Format' — output appears with summary of changes (sorted, comments removed, duplicates eliminated)",
      "Copy formatted CSS or download as .css file"
    ],
    "examples": [
      "Input: 'a{color:#ff6600;margin:0;padding:0;color:#f60}' | Expanded + Sort + Remove Dupes => Output: 'a {\\n  color: #ff6600;\\n  margin: 0;\\n  padding: 0;\\n}'",
      "Input: '/* comment */ .foo{background:red}' | Compressed + Strip Comments => Output: '.foo{background:red}'"
    ],
    "bestPractices": [
      "Use Expanded mode during dev, Compressed for production",
      "Enable 'Remove Duplicates' to catch copy-paste errors — the tool logs each removal",
      "Sort properties 'By Type' for logical grouping matching how developers read CSS",
      "Convert all colors to consistent format before committing",
      "Run formatter as part of CI pipeline"
    ],
    "commonMistakes": [
      "Removing comments from stylesheets that rely on section markers",
      "Sorting alphabetically when team convention is type-based grouping",
      "Assuming compressed output is always smaller — gzip often compresses expanded CSS better",
      "Converting RGBA to HEX without verifying alpha is 1 — transparency is lost",
      "Using formatter on minified frameworks — may trigger browser bugs if prefixes are reordered"
    ],
    "faq": [
      "Does this handle SCSS? — Standard CSS only. Pre-compile SCSS first.",
      "What order are vendor prefixes sorted in? — Spec-Compliant: -webkit-, -moz-, -ms-, -o-. Alphabetical: -moz-, -ms-, -o-, -webkit-.",
      "Can I convert colors conditionally? — No, applies to ALL matching colors. Edit manually for selective conversion.",
      "Does it fix invalid CSS? — Valid CSS is preserved. Invalid CSS may be dropped."
    ]
  },

"css-minifier": {
    "whatItDoes": "Minifies CSS with five configurable options: color compression (shortening #FF6600 to #f60), merging identical rules, merging adjacent identical selectors, removing unnecessary quotes, and clearing empty rules. Displays live size comparison with original vs minified byte count and percentage savings, plus side-by-side visual diff of before/after content.",
    "whyItExists": "CSS file size directly impacts page load performance. A dedicated minifier with granular control over optimizations lets developers balance compression ratio against readability for their specific deployment scenario.",
    "whoShouldUse": "Web performance engineers optimizing Core Web Vitals, frontend developers bundling assets for production, CMS developers minifying user-submitted CSS, and anyone deploying CSS to bandwidth-constrained environments.",
    "useCases": [
      "Minify a 50 KB design system CSS before deploying to production for ~25% size reduction",
      "Enable color compression on a stylesheet with longhand hex colors",
      "Merge adjacent identical selectors duplicated during development",
      "Use size comparison to report CSS budget compliance in a performance audit",
      "Minify user-submitted CSS in a CMS before saving to database",
      "Remove empty rules and unnecessary quotes from generated CSS"
    ],
    "instructions": [
      "Paste CSS or upload a .css file — minified output updates in real-time",
      "Toggle options: 'Compress Colors', 'Merge Rules', 'Merge Adjacent', 'Remove Quotes', 'Clear Empty Rules'",
      "Monitor the size comparison bar — updates with each toggle change",
      "Review side-by-side diff view to see exactly what changed",
      "Click 'Copy Minified' or 'Download' to save as .min.css",
      "Use 'Copy Stats' to copy size comparison data for reporting"
    ],
    "examples": [
      "Input: 'a { color: #ff6600; background: #ffffff; }' | Compress Colors ON => Output: 'a{color:#f60;background:#fff}'",
      "Input: '.foo { color: red; } .bar { color: red; }' | Merge Rules ON => Output: '.foo,.bar{color:red}'"
    ],
    "bestPractices": [
      "Enable all optimizations for maximum compression — none change CSS behavior",
      "Use size comparison to track CSS budget over time — aim for under 100 KB critical CSS",
      "Run test suite after minifying to verify no selectors were incorrectly merged",
      "Keep original unminified source in repo — minify during build, never edit minified files directly",
      "Combine minification with gzip for 70-80% total reduction"
    ],
    "commonMistakes": [
      "Assuming minified CSS is always smaller — extremely short CSS may be same size",
      "Using minified output as source of truth for further edits",
      "Enabling 'Merge Rules' on CSS with complex media queries — verify output carefully",
      "Forgetting color compression only works on colors with exact shorthand equivalents",
      "Relying solely on minification — also consider code splitting and critical CSS extraction"
    ],
    "faq": [
      "Typical compression ratio? — 60-70% of original size. With gzip, 70-80% total.",
      "Does color compression change appearance? — No. #FF6600 and #f60 are identical in every browser.",
      "Can I reverse minification? — No, it's lossy for formatting. Use CSS Formatter to beautify but comments are lost.",
      "Does this handle @import and url()? — Yes, preserves them. 'Remove Quotes' strips unnecessary url() quotes."
    ]
  },

"csv-to-json": {
    "whatItDoes": "Converts CSV data to JSON with automatic delimiter detection (comma, tab, semicolon, pipe). Supports four JSON output formats: array of objects, array of arrays, column-oriented (object of arrays), and pretty-printed. Features configurable quote character handling, drag-and-drop file upload, a preview table showing the first 5 rows, and size comparison between CSV input and JSON output.",
    "whyItExists": "CSV is the most common data exchange format from spreadsheets, databases, and analytics tools, but most APIs consume JSON. A reliable, format-flexible converter that handles embedded commas, custom delimiters, and large files saves developers from writing one-off parsing scripts.",
    "whoShouldUse": "Data engineers transforming CSV exports, backend developers ingesting spreadsheet data into APIs, data scientists converting survey results, and anyone migrating from legacy CSV to modern JSON APIs.",
    "useCases": [
      "Convert an Excel-exported CSV of customer data to array-of-objects JSON for a REST API",
      "Transform a tab-separated TSV from a database export to JSON for a web dashboard",
      "Convert semicolon-separated CSV (common in European locales) to column-oriented JSON",
      "Preview first 5 rows of a large CSV to verify column mapping before full conversion",
      "Convert pipe-delimited CSV from a mainframe export to pretty-printed JSON",
      "Parse CSV with quoted fields containing embedded commas and newlines"
    ],
    "instructions": [
      "Paste CSV text or drag-and-drop a .csv file — delimiter is auto-detected and displayed",
      "Review 'Preview' table showing first 5 rows — verify columns/data types before full conversion",
      "Select JSON output format: 'Array of Objects', 'Array of Arrays', 'Column-Oriented', or 'Pretty-Printed'",
      "Configure options: quote character (double/single), header row (first row as keys or key0,key1...), encoding",
      "Click 'Convert' — JSON output appears with size comparison (CSV vs JSON byte count)",
      "Copy JSON or download as .json — use streaming mode for large datasets to avoid memory limits"
    ],
    "examples": [
      "Input CSV: 'name,age,city\\nAlice,30,NYC\\nBob,25,LA' | Array of Objects => '[{\"name\":\"Alice\",\"age\":\"30\",\"city\":\"NYC\"},{\"name\":\"Bob\",\"age\":\"25\",\"city\":\"LA\"}]'",
      "Input: 'product\\tprice\\tstock\\nWidget\\t9.99\\t42' | Tab delimiter | Column-Oriented => '{\"product\":[\"Widget\"],\"price\":[\"9.99\"],\"stock\":[\"42\"]}'"
    ],
    "bestPractices": [
      "Always check preview before converting — catches delimiter detection errors",
      "Use 'Array of Objects' for REST APIs; 'Column-Oriented' for large datasets where only some columns are needed",
      "Check for BOM in Excel-exported CSVs — tool handles BOM but verify first column name",
      "For very large files (>100 MB), use streaming or split into smaller chunks",
      "Specify correct quote character — wrong setting causes incorrect parsing of quoted fields"
    ],
    "commonMistakes": [
      "Assuming auto-detected delimiter is always correct for short files",
      "Using 'Array of Arrays' when CSV has headers — headers become first data row",
      "Forgetting all CSV values are strings in JSON — no auto type coercion",
      "Parsing CSVs with inconsistent quote characters — pre-normalize first",
      "Converting CSV with empty trailing rows — produces null JSON entries; trim first"
    ],
    "faq": [
      "Can this handle commas inside quoted fields? — Yes, correctly handles commas, newlines, and escaped quotes within quoted fields.",
      "Does it convert data types? — No, all values remain as strings. Use JSON.parse() after conversion.",
      "Maximum file size? — ~200 MB browser-based. For larger files, use command-line tool or split CSV.",
      "Can I use custom column names? — Yes, disable 'First Row as Headers' to get key0, key1, key2... names."
    ]
  },

"diff-checker": {
    "whatItDoes": "Compares two text inputs highlighting differences in side-by-side or unified view at word, line, or character granularity. Supports ignoring whitespace and case differences, file upload for both inputs, downloading the diff as a .patch file, and line numbering with added/removed/modified counts in a summary bar.",
    "whyItExists": "Comparing text versions is a fundamental development task that extends beyond version control. A standalone diff checker with configurable granularity and exportable patches handles arbitrary text comparison without committing.",
    "whoShouldUse": "Software developers reviewing code changes, writers comparing document revisions, data engineers verifying transformations, QA engineers comparing API responses, and anyone tracking changes between file versions.",
    "useCases": [
      "Compare two versions of a config file to understand deployment changes",
      "Diff the output of two API endpoints to verify identical data after refactoring",
      "Compare a student's code submission against the original template",
      "Review changes between document drafts at character level for proofreading",
      "Download a .patch file of changes for sharing with a colleague",
      "Compare minified vs original CSS to verify no functional changes"
    ],
    "instructions": [
      "Paste original text into left panel and modified text into right panel — or upload files via drag-and-drop",
      "Select granularity: 'Word' (default), 'Line', or 'Character'",
      "Configure options: 'Ignore Whitespace', 'Ignore Case', 'Trim Lines'",
      "Choose view mode: 'Side-by-Side' or 'Unified' (single view with inline changes)",
      "Review summary bar — shows added, removed, and unchanged counts",
      "Click 'Download Patch' for .patch file compatible with git apply, or 'Swap' to exchange inputs"
    ],
    "examples": [
      "Original: 'Hello World' | Changed: 'Hello Earth' | Word => Shows 'World' deleted, 'Earth' inserted",
      "Original: 'function add(a,b){return a+b}' | Changed: 'function add(a, b) { return a + b; }' | Ignore Whitespace ON => 'No differences'"
    ],
    "bestPractices": [
      "Use Line granularity for code diffs, Word for prose, Character for exact string debugging",
      "Enable 'Ignore Whitespace' when comparing refactored code with only indentation changes",
      "Download .patch files for sharing changes outside version control",
      "Use 'Swap' to reverse comparison direction without re-pasting",
      "For very large files (>10 MB), stick to line-level diff to avoid performance issues"
    ],
    "commonMistakes": [
      "Using line-level diff on minified single-line code — switch to word or character level",
      "Forgetting to enable 'Ignore Whitespace' for cross-OS file comparisons (CRLF vs LF)",
      "Relying on diff checker for binary files — designed for text only",
      "Pasting very large inputs (>100 MB) — browser may freeze",
      "Assuming 'No differences' with Ignore Case means strings are identical — case may still matter in your context"
    ],
    "faq": [
      "What algorithm is used? — Myers diff algorithm, the same algorithm used by Git.",
      "Can I compare cross-OS files? — Yes, but enable 'Ignore Whitespace' for CRLF vs LF.",
      "How to apply a .patch file? — 'git apply <file>.patch' or 'patch -p0 < <file>.patch'.",
      "Character limit? — ~500,000 chars in line mode. Character-level diff has ~50,000 char limit."
    ]
  },

"dns-lookup": {
    "whatItDoes": "Performs DNS lookups across 11 record types (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, PTR, CAA, ANY). Results displayed in an organized table with TTL values, raw DNS response data for advanced analysis, and a WHOIS summary showing domain registration status. Includes a history feature saving recent lookups for quick re-querying.",
    "whyItExists": "Debugging DNS issues is a common task for developers and system administrators. A unified visual DNS tool provides clear organized views of all record types, TTLs, and registration data in one interface with accessible history.",
    "whoShouldUse": "DevOps engineers troubleshooting DNS propagation, system administrators managing domain configurations, web developers diagnosing connectivity issues, and anyone maintaining domain records.",
    "useCases": [
      "Look up A and AAAA records to verify DNS resolution points to correct IPs",
      "Check MX records to confirm email routing after a mail server migration",
      "Examine TXT records for SPF, DKIM, and DMARC email authentication",
      "Perform reverse DNS (PTR) lookup on an IP to find associated hostname",
      "Check CAA records for authorized SSL certificate issuers",
      "View WHOIS summary for domain expiry and registrar info before renewal"
    ],
    "instructions": [
      "Enter a domain name or IP address (for PTR) into the search field",
      "Select record types: A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, PTR, CAA, or ALL",
      "Click 'Lookup' — results in a table sorted by type with name, type, value, and TTL columns",
      "Click 'Raw' toggle on any result for full DNS response packet data (flags, rcode, EDNS)",
      "Switch to 'WHOIS' tab for registration summary: registrar, dates, name servers, status",
      "Use 'History' tab for previous lookups — each shows domain, timestamp, and 'Re-lookup' button"
    ],
    "examples": [
      "Input: 'google.com' | ALL => Table: A (multiple IPs), AAAA (IPv6), MX (5 servers with priorities), NS (4 servers), TXT (SPF/DKIM/DMARC), SOA (primary NS, serial, timers)",
      "Input: '8.8.8.8' | PTR => Output: 'dns.google'"
    ],
    "bestPractices": [
      "Use ALL sparingly — many queries may trigger authoritative server rate limiting",
      "Check TTL values to estimate DNS propagation time — 86400 = up to 24 hours",
      "Combine MX and TXT lookups for email delivery diagnosis (mail servers + auth records)",
      "Use WHOIS to verify domain ownership before making DNS changes",
      "Check SOA refresh/retry/expire values when troubleshooting slow resolution"
    ],
    "commonMistakes": [
      "Using ANY on production servers — modern DNS servers restrict ANY responses",
      "Confusing TTL (remaining seconds) with absolute expiration",
      "Forgetting trailing dot in FQDNs — tool handles it but raw responses show dots",
      "Assuming WHOIS is always accurate — privacy services may mask true registrant",
      "Running too many lookups rapidly — DNS rate limiting may block your IP"
    ],
    "faq": [
      "How are lookups performed? — Using DNS-over-HTTPS (DoH) through the browser, bypassing local DNS.",
      "What does TTL mean? — Seconds a resolver should cache the record. Lower TTL = faster propagation.",
      "Can I query specific DNS servers? — Not directly. Use command-line dig for specific servers.",
      "Why do some records return nothing? — Not all domains have all record types (e.g. SRV is service-specific)."
    ]
  },

"escape-unescape": {
    "whatItDoes": "Escapes and unescapes strings across 7 modes: JavaScript, JSON, HTML, URL, SQL (single quote), SQL (double quote), and CSV. Provides three character targeting options (all special chars, only quotes, only backslashes). Includes a character map display showing each character's transformation side-by-side and real-time input vs output length preview.",
    "whyItExists": "Injection attacks (XSS, SQL injection, CSV injection) are often caused by improper string escaping. A dedicated tool covering multiple contexts helps developers understand and apply correct escaping for their specific use case.",
    "whoShouldUse": "Web developers sanitizing user input, security engineers auditing code for injection vulnerabilities, QA testers crafting injection test cases, and anyone debugging encoding issues in data pipelines.",
    "useCases": [
      "Escape a user string for safe insertion into a JavaScript string literal",
      "Unescape HTML entities ('&lt;' back to '<') from scraped web content",
      "Escape values for safe SQL query inclusion to prevent SQL injection",
      "URL-encode query parameters containing &, =, and spaces",
      "Use character map to understand how each character transforms across modes",
      "Escape a string for CSV output containing commas, quotes, or newlines"
    ],
    "instructions": [
      "Paste your input string into the text area",
      "Select escape/unescape mode from 7 options: JavaScript, JSON, HTML, URL, SQL (single/double quote), CSV",
      "Choose character targeting: 'All Special Characters', 'Only Quotes', or 'Only Backslashes'",
      "Click 'Escape' or 'Unescape' — result appears with size comparison",
      "Open 'Character Map' panel for a table showing each character's escaped counterpart",
      "Copy result to clipboard or use 'Swap' for iterative escaping/unescaping"
    ],
    "examples": [
      "Input: 'Hello \"World\" & <test>' | HTML | Escape => Output: 'Hello &quot;World&quot; &amp; &lt;test&gt;'",
      "Input: 'Hello%20World%21' | URL | Unescape => Output: 'Hello World!'"
    ],
    "bestPractices": [
      "Always match escape mode to the target context — HTML for HTML, JS for JavaScript, SQL for SQL queries",
      "Use character map to audit escaped output when debugging injection issues",
      "Use parameterized queries instead of manual SQL escaping in production",
      "Use 'Only Quotes' targeting for minimal escaping of known-safe strings with quotes",
      "When unescaping, ensure source uses the same mode you are unescaping with"
    ],
    "commonMistakes": [
      "HTML-escaping a string for <script> context — HTML escaping doesn't prevent XSS in JS context",
      "Using URL escape when URL component escape is needed — URL mode handles all special chars",
      "Double-escaping an already-escaped string",
      "Using SQL escape as substitute for parameterized queries in production",
      "CSV-escaping unnecessarily — only needed when value contains delimiter, quote, or newlines"
    ],
    "faq": [
      "Difference between JavaScript and JSON escaping? — JSON also escapes slash (/) and uses strict double quotes. JS mode allows both quote types.",
      "Can this help prevent XSS? — Yes, with correct context matching. But sanitization libraries are recommended for comprehensive XSS prevention.",
      "What is CSV injection? — When a cell starts with =, +, -, or @, interpreted as formulas. CSV escape prevents this.",
      "SQL double-quote mode? — Escapes double quotes by doubling them. For identifier quoting (table/column names) in double quotes."
    ]
  },

"exif-reader": {
    "whatItDoes": "Extracts EXIF metadata from images (JPEG, TIFF, WebP, PNG) organized into four categories: Camera (make, model, lens, software), Photo Settings (aperture, shutter speed, ISO, focal length, flash), GPS (latitude, longitude, altitude, direction), and Image Info (resolution, file size, color space, date taken). Supports copying full EXIF as JSON or CSV, stripping EXIF from images, and anonymizing GPS coordinates to configurable precision.",
    "whyItExists": "EXIF data contains valuable information for photographers and forensic analysis but also poses privacy risks. A tool that both extracts and selectively removes EXIF gives users control over what metadata they share while providing organized access to technical photo details.",
    "whoShouldUse": "Photographers auditing camera settings, digital forensics investigators examining image provenance, web developers building photo management tools, privacy-conscious users sanitizing images before sharing, and QA engineers verifying image metadata.",
    "useCases": [
      "Extract camera/lens info from a JPEG to document equipment used for a shoot",
      "Check GPS coordinates embedded in a photo to verify geotagging accuracy",
      "Strip all EXIF data before uploading to a public website for privacy",
      "Export EXIF as JSON for automated ingestion into a photo management database",
      "Anonymize GPS to nearest 0.1 degrees (~11 km) for approximate location sharing",
      "Review photo settings (aperture, shutter, ISO) to understand capture technique"
    ],
    "instructions": [
      "Drag-and-drop an image (JPEG, TIFF, WebP, PNG) or click to browse",
      "EXIF data is automatically extracted into collapsible category panels: Camera, Photo Settings, GPS, Image Info",
      "Browse extracted data — each category shows labeled fields. GPS includes a map link if available",
      "Click 'Copy as JSON' or 'Copy as CSV' for structured export",
      "Click 'Strip EXIF' to generate a modified copy with all metadata removed",
      "For GPS anonymization, set precision (0.01, 0.1, 1.0 degrees) and click 'Anonymize GPS'"
    ],
    "examples": [
      "Input: 'DSC_1234.jpg' (Nikon D850) => Camera: 'NIKON D850, 24-70mm f/2.8E' | Settings: 'f/2.8, 1/125s, ISO 400, 50mm' | GPS: '40.7484° N, 73.9857° W'",
      "Input: Image with GPS | Anonymize 0.1° => Original '40.7484, -73.9857' → Anonymized '40.7, -74.0'"
    ],
    "bestPractices": [
      "Always strip EXIF before uploading to public websites unless intentionally sharing metadata",
      "Use GPS anonymization at 0.1° for social media — gives city-level area without exact location",
      "Export EXIF as JSON for automated photo management workflows",
      "Check 'Date Taken' to verify camera clock accuracy — incorrect clocks produce misleading timestamps",
      "Use CSV export for spreadsheet-based data analysis across multiple photos"
    ],
    "commonMistakes": [
      "Assuming PNG files contain EXIF — many don't. JPEGs have the most comprehensive support.",
      "Trusting GPS without checking accuracy — consumer GPS is accurate to 5-15 meters",
      "Forgetting stripped EXIF cannot be recovered — always keep original files backed up",
      "Using anonymization on already-shared images — original GPS may already be scraped",
      "Overlooking 'Software' field — reveals editing software used (Photoshop, Lightroom, GIMP)"
    ],
    "faq": [
      "What EXIF tags are not shown? — Private maker notes and proprietary manufacturer tags are not displayed but are stripped.",
      "Can I edit EXIF instead of just reading/stripping? — Use the EXIF Transfer tool for editing. This tool focuses on reading and removal.",
      "Does this support RAW files (NEF, CR2, ARW)? — No, only JPEG, TIFF, WebP, and PNG. Convert RAW first.",
      "Is stripping 100% effective? — Standard EXIF, IPTC, and XMP are removed. Some proprietary formats may remain."
    ]
  },

"exif-transfer": {
    "whatItDoes": "Transfers EXIF metadata from a source image to a target image with selective field inclusion. Users can transfer all metadata, filter by category (Camera info, Date/Time stamps, GPS coordinates), or select individual custom fields. The transferred metadata is applied to a copy of the target image, preserving both originals.",
    "whyItExists": "When editing images in software that strips or alters EXIF, original metadata is lost. A dedicated transfer tool allows restoring EXIF from the original to the edited version, or selectively copying metadata between images for batch organization.",
    "whoShouldUse": "Photographers editing in software that strips EXIF, photo archivists standardizing metadata across collections, web developers batch-processing images for e-commerce, and forensic analysts transferring verified timestamps.",
    "useCases": [
      "Transfer camera/lens metadata from original JPEG to retouched version after editing software stripped EXIF",
      "Copy GPS coordinates from one geotagged image to others taken at the same location",
      "Transfer date/time stamps from originals to batch-processed versions for correct chronological sorting",
      "Restore camera settings (aperture, shutter, ISO) to derivative images saved without metadata",
      "Selectively copy only Copyright and Artist fields for consistent attribution",
      "Transfer ALL metadata from source to batch of edited images for consistent archives"
    ],
    "instructions": [
      "Upload 'Source' image (with EXIF data to copy) by dragging to Source area",
      "Upload 'Target' image (to receive metadata) by dragging to Target area",
      "Choose scope: 'All Fields', 'By Category' (Camera, Date/Time, GPS, Image Info), or 'Custom' (select specific EXIF tags)",
      "Click 'Preview Transfer' to see which fields will be transferred — shows source vs target diff",
      "Click 'Execute Transfer' — new image file is generated and downloaded automatically",
      "Verify with EXIF Reader tool to confirm metadata was applied correctly"
    ],
    "examples": [
      "Source: 'original.jpg' (Make=NIKON, Model=D850, Lens=24-70mm) | Target: 'edited.jpg' (no EXIF) | Scope: All Fields => Output: 'edited_with_exif.jpg' with source metadata",
      "Source: 'geotagged.jpg' (GPS: 40.7484, -73.9857) | Target: ['batch1.jpg', 'batch2.jpg'] | Scope: GPS Only => Outputs with GPS from source, original other metadata preserved"
    ],
    "bestPractices": [
      "Always preview before executing — verify which fields will be overwritten vs retained",
      "Test on a single file pair first before batch operations",
      "Use 'Custom' to copy specific settings without overwriting target's date or GPS",
      "Keep source images backed up for recovery if transfer corrupts metadata",
      "Verify with EXIF Reader after transfer — different formats have different EXIF tag support"
    ],
    "commonMistakes": [
      "Transferring GPS from a source taken at a different location",
      "Assuming 'All Fields' transfers every possible tag — proprietary maker notes are skipped",
      "Using JPEG source with PNG target — PNGs have limited EXIF support",
      "Overwriting target's date/time stamps without checking first",
      "Transferring to a target edited on a different camera — creates confusing metadata trails"
    ],
    "faq": [
      "Does this modify original files? — No. Original files are never modified. A new file is generated.",
      "Can I transfer between different formats? — Yes (JPEG to PNG, TIFF to JPEG, etc.), but target must support the tags being transferred.",
      "What if a field exists on both? — Source value overwrites target for fields in selected scope. Others remain unchanged.",
      "Can I transfer to multiple files at once? — One target at a time. Source stays uploaded while swapping targets."
    ]
  },

"favicon-generator": {
    "whatItDoes": "Generates complete favicon sets from text/emoji input or uploaded images. Creates 13 standard sizes (16x16 through 512x512) plus platform-specific icons for iOS (apple-touch-icon), Android (manifest icons), and Windows (tile images). Outputs ICO file (multi-size), individual PNGs, SVG, HTML snippet for embedding, and a complete manifest.json for progressive web apps.",
    "whyItExists": "Modern web applications require a complex set of favicon sizes across platforms, browsers, and devices. An all-in-one generator handles every size, format, and configuration file needed for comprehensive favicon coverage without manual image editing.",
    "whoShouldUse": "Web developers launching new sites needing complete favicon packages, PWA developers configuring manifest icons, designers generating favicons from logos, and anyone needing favicons without image editing software.",
    "useCases": [
      "Generate a full favicon set from a text letter for a new personal website",
      "Convert a company logo into all required favicon sizes for a business site",
      "Create iOS apple-touch-icon and Android manifest icons for a PWA",
      "Generate SVG favicon from a text-based design for modern browsers",
      "Produce complete HTML snippet and manifest.json for PWA submission",
      "Create Windows tile icons for a Microsoft Edge pinned site"
    ],
    "instructions": [
      "Choose input type: 'Text' (type word/letter/emoji) or 'Image' (upload PNG/JPG/SVG). For text, select bg/text color and font",
      "Preview generated favicons in a grid showing all 13 sizes — click any for full resolution",
      "Toggle platform sections: 'Standard Web' (16-512 PNG + ICO), 'iOS', 'Android', 'Windows'",
      "Click 'Generate ICO' for multi-size .ico file (16, 32, 48)",
      "Click 'Generate HTML' for complete <head> snippet with all <link> tags, theme-color, and manifest reference",
      "Click 'Download All' for ZIP archive containing PNGs, ICO, SVG, HTML snippet, and manifest.json"
    ],
    "examples": [
      "Input: Text 'M' | BG: #3498db | White text | Bold => Output: ZIP with 13 PNGs, ICO, apple-touch-icon, HTML snippet, manifest.json",
      "Input: 'logo.png' (500x500) | All platforms => Output: 13 PNG sizes, ICO, apple-touch-icon (180x180), Android (192+512), Windows tiles, HTML, manifest.json"
    ],
    "bestPractices": [
      "Use image input at least 512x512 for best quality — smaller images are upscaled with pixelation",
      "For text favicons, use a single character for max clarity at 16x16 and 32x32",
      "Always include ICO file for legacy browser support (IE, older browsers)",
      "Add theme-color meta tag (in generated HTML) for mobile browser chrome color",
      "Host manifest.json at domain root or ensure start_url scope is correct for PWA compliance"
    ],
    "commonMistakes": [
      "Using complex detailed images — at 16x16, intricate logos become unrecognizable blobs",
      "Forgetting to include ICO — some browsers still request /favicon.ico at root",
      "Using SVG without PNG fallbacks — Safari supports SVG favicons, Chrome/Firefox may not in all contexts",
      "Generating manifest.json with incorrect icon paths — paths are relative to manifest.json location",
      "Ignoring apple-mobile-web-app-capable meta tag for iOS — without it, apple-touch-icon is ignored on home screen"
    ],
    "faq": [
      "How many icons do I actually need? — Minimum: favicon.ico (16+32), 192x192 (Android), 180x180 (iOS). Generator creates all 13.",
      "Can I use emoji as favicons? — Yes. Emoji render colorfully at all sizes, looking great at 16x16 on retina displays.",
      "What format is the ICO? — Contains embedded PNGs at 16, 32, and 48 pixels. Modern browsers read the 32x32 PNG from within.",
      "Do I need dark mode favicons? — Not from this generator, but you can add prefers-color-scheme media queries to the HTML manually."
    ]
  },

"file-checksum": {
    "whatItDoes": "Computes file checksums using MD5, SHA-1, SHA-256, SHA-384, SHA-512, and SHA-224 algorithms. Supports drag-and-drop for quick file loading, a compare mode to verify checksums against expected values, and a real-time progress bar for large files. Batch processing handles multiple files simultaneously, and results can be saved as CSV or JSON.",
    "whyItExists": "Verifying file integrity is critical when downloading software, transferring data, or storing backups, but doing it manually with command-line tools is cumbersome and error-prone. This tool provides a visual interface with batch support, making it easy to generate and verify checksums for multiple files at once without memorizing terminal commands.",
    "whoShouldUse": "Software developers verifying downloads, system administrators auditing file integrity, and anyone who needs to quickly generate or verify checksums across multiple files.",
    "useCases": [
      "Verify a downloaded ISO or installer against its published SHA-256 hash",
      "Generate checksums for all files in a release directory before distribution",
      "Compare two directories of files to check for differences using hash comparison",
      "Audit backup integrity by generating checksums before and after archival",
      "Use text mode to hash raw strings rather than files for quick verification",
      "Export a batch of file hashes to CSV for documentation or compliance reporting"
    ],
    "instructions": [
      "Drag and drop files onto the upload area, or click to browse and select multiple files",
      "Choose the hash algorithm from the dropdown (MD5, SHA-1, SHA-256, SHA-384, SHA-512, or SHA-224)",
      "Click the hash button to start processing; observe the progress bar for large files",
      "Enable compare mode by pasting an expected hash value to instantly match against results",
      "Switch to text mode to hash raw input strings instead of files",
      "Click Save to export all checksums as CSV or JSON for record-keeping"
    ],
    "examples": [
      "Input: Drag file 'ubuntu.iso' and select SHA-256. Output: 'ubuntu.iso | SHA-256 | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'",
      "Input: Drag 5 files in batch mode with SHA-512 selected. Output: Table with 5 rows showing filename and corresponding hash, saved as CSV."
    ],
    "bestPractices": [
      "Always use SHA-256 or SHA-512 for security-critical verification; avoid MD5 for integrity checks",
      "Use batch mode when distributing multiple files so users can verify all at once",
      "Export results as JSON when you need machine-readable output for CI/CD pipelines",
      "Use compare mode by pasting hashes from the publisher's website to automate verification"
    ],
    "commonMistakes": [
      "Using MD5 for security-sensitive verification where collision resistance is required",
      "Forgetting to select the same algorithm that the publisher used for their published hash",
      "Overlooking the progress bar thinking the tool hung on very large files",
      "Comparing mixed-case hashes when the tool outputs lowercase; use case-insensitive comparison"
    ],
    "faq": [
      "Can I hash files larger than 2GB? Yes, the tool streams the file and handles large files with a progress bar.",
      "Does the tool compare hashes automatically? Yes, enable compare mode and paste the expected hash for instant matching.",
      "What format does CSV export use? Each row is filename, algorithm, hash, and timestamp.",
      "Can I hash text instead of files? Yes, switch to text mode and type or paste the string."
    ]
  },

"hash-generator": {
    "whatItDoes": "Generates cryptographic hashes for strings using MD5, SHA-1, SHA-256, SHA-384, SHA-512, SHA-224, RIPEMD-160, CRC32, and CRC32C. Supports HMAC generation with a secret key, salted hashing, and file drag-and-drop input. Features real-time debounced output as you type, a compare mode, and bulk per-line hashing for processing multiple inputs at once.",
    "whyItExists": "Developers frequently need to hash passwords, verify data integrity, or compute HMACs for API authentication, but switching between different command-line tools for each algorithm is slow. This tool consolidates all major hash algorithms with real-time feedback and bulk processing in one interface.",
    "whoShouldUse": "Backend developers implementing authentication, API developers needing HMAC signatures, and security engineers testing hash behavior across algorithms.",
    "useCases": [
      "Generate an HMAC-SHA256 signature for an API request using a secret key",
      "Hash a list of passwords or tokens in bulk using per-line mode for migration scripts",
      "Compute CRC32 checksums for network packets or file verification in legacy systems",
      "Compare two strings by enabling compare mode and pasting an expected hash to verify instantly",
      "Generate salted hashes for storing user credentials in a database",
      "Use RIPEMD-160 for applications requiring a different cryptographic primitive than SHA"
    ],
    "instructions": [
      "Type or paste the input string in the text area; the hash updates in real time with debounce",
      "Select the desired algorithm from the list: MD5, SHA-1, SHA-256, SHA-384, SHA-512, SHA-224, RIPEMD-160, CRC32, or CRC32C",
      "For HMAC, toggle HMAC mode, enter your secret key, and observe the authenticated hash output",
      "Enable salted hash mode and enter a salt value to generate a salt-appended hash",
      "Use bulk per-line mode to paste multiple lines and generate a hash for each individually",
      "Activate compare mode, paste an expected hash, and the tool highlights match or mismatch in real time"
    ],
    "examples": [
      "Input: 'hello' with SHA-256. Output: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'",
      "Input: HMAC-SHA1 with key='secret' and message='test'. Output: '6c3b4d50f9a0c3f5b8c9e1d2a3b4c5d6e7f8a9b0'"
    ],
    "bestPractices": [
      "Use HMAC-SHA256 for API authentication rather than plain hashing of secrets",
      "Use salted hashes for password storage, never plain hashes without a unique salt per user",
      "CRC32 is for error-checking only, not cryptographic security; use SHA-256 for security",
      "In bulk mode, prefix each input line with a label for easier identification in results"
    ],
    "commonMistakes": [
      "Using CRC32 for cryptographic purposes when it is only suitable for checksums",
      "Forgetting to apply a salt before hashing passwords, making them vulnerable to rainbow table attacks",
      "Using HMAC mode but leaving the secret key empty, which produces a different result than expected",
      "Copying the hash output with extra whitespace, causing compare mode to show a mismatch"
    ],
    "faq": [
      "What is HMAC and when should I use it? HMAC uses a secret key to produce an authenticated hash, ideal for API signatures and message verification.",
      "Does the tool support Unicode characters? Yes, it handles UTF-8 input strings correctly.",
      "How does bulk per-line mode work? Each line of input is hashed independently with the selected algorithm.",
      "Can I hash a file by dragging it in? Yes, drag-and-drop a file and its content will be hashed."
    ]
  },

"hex": {
    "whatItDoes": "Converts text to hexadecimal and hex back to text with multiple formatting options including lowercase, uppercase, space-separated, continuous, and 0x-prefixed. Shows binary and decimal values per byte alongside the hex output, displays byte offsets for file analysis, converts files to hex, and supports XOR operations with a key for basic encryption.",
    "whyItExists": "Developers working with binary data, network protocols, or low-level debugging often need to inspect or manipulate hex representations, but existing tools are too simple or CLI-based. This tool provides a complete hex workspace with multiple views and XOR operations in a visual interface.",
    "whoShouldUse": "Embedded systems engineers, network protocol developers, reverse engineers, and anyone working with binary file formats or low-level data inspection.",
    "useCases": [
      "Convert a binary file to hex for manual inspection of magic bytes or headers",
      "Decode a hex string from a network protocol dump back into readable text",
      "Analyze byte-by-byte with the binary and decimal column to understand flag bits in a protocol",
      "Apply XOR with a key to obfuscated data in a CTF challenge or malware analysis",
      "View byte offsets while inspecting a file to identify specific positions in the data structure"
    ],
    "instructions": [
      "Type or paste text in the input area to see its hex representation update in real time",
      "Choose output format: lowercase, uppercase, space-separated, continuous (no spaces), or 0x-prefixed (e.g. 0xFF)",
      "Toggle the binary and decimal column to see per-byte values in both binary and decimal formats",
      "Enable byte offsets to see the position of each byte in the sequence for file analysis",
      "Switch to file-to-hex mode by dragging a file onto the area to convert its entire content",
      "Enter a XOR key value to apply bitwise XOR to each byte for basic obfuscation or deobfuscation"
    ],
    "examples": [
      "Input: 'Hello' with uppercase space-separated. Output: '48 65 6C 6C 6F' with binary column showing '01001000 01100101 01101100 01101100 01101111'",
      "Input: '48656C6C6F' (continuous mode) with hex-to-text. Output: 'Hello'"
    ],
    "bestPractices": [
      "Use 0x-prefixed format when writing C/C++ byte arrays or embedded firmware constants",
      "Enable binary column when analyzing protocol flag bytes to see individual bit values",
      "Use XOR with care; repeat the key length across data and use the same key to reverse",
      "File-to-hex mode is ideal for inspecting file headers without needing a full hex editor"
    ],
    "commonMistakes": [
      "Confusing the hex-to-text direction; always confirm which conversion mode is active",
      "Applying XOR with a key that contains non-hex characters without proper encoding",
      "Using continuous mode output to paste into a tool that expects space-separated hex bytes",
      "Not accounting for byte order (endianness) when interpreting multi-byte hex values"
    ],
    "faq": [
      "Can I convert large files to hex? Yes, but very large files may take time; the tool processes in chunks.",
      "What does XOR with a key do? It applies a bitwise exclusive-or of each byte with the key byte for obfuscation.",
      "Does the tool handle UTF-8 characters? Yes, multi-byte UTF-8 characters are properly encoded to hex.",
      "Can I switch between text-to-hex and hex-to-text without clearing input? Yes, the conversion is bidirectional."
    ]
  },

"html-entity": {
    "whatItDoes": "Encodes and decodes HTML entities with named, numeric, and hex reference modes. Provides body and attribute content presets that follow HTML spec escaping rules, a searchable entity reference table, and quick-insert buttons for common entities like &amp; &lt; &gt; &quot; &apos;.",
    "whyItExists": "Handling HTML entities manually leads to XSS vulnerabilities and rendering bugs when user-generated content contains special characters. This tool ensures proper encoding based on context (body vs attribute) and makes it easy to look up or insert any HTML entity.",
    "whoShouldUse": "Frontend developers sanitizing user input, content authors preparing HTML with special characters, and security engineers auditing XSS prevention in templates.",
    "useCases": [
      "Encode user-submitted content before rendering in HTML to prevent XSS attacks",
      "Decode HTML entity strings from an API response back to readable text",
      "Use body preset for content inside <div> tags and attribute preset for values in href=\"...\"",
      "Look up the entity reference for a specific Unicode character like a copyright symbol",
      "Use quick-insert buttons to add common entities while editing HTML content"
    ],
    "instructions": [
      "Type or paste text in the input area; the encoded/decoded output updates in real time",
      "Select encoding mode: named (&amp;), numeric (&#38;), or hex (&#x26;) reference style",
      "Choose a preset: Body (encodes < > &) or Attribute (encodes < > & \" ') for context-appropriate escaping",
      "Use the entity reference table to search for any Unicode character by name, code point, or entity",
      "Click quick-insert buttons to instantly insert common entities like &copy; or &mdash;",
      "Use the decode mode to convert entity-encoded text back to plain characters"
    ],
    "examples": [
      "Input: '<script>alert(1)</script>' with body preset. Output: '&lt;script&gt;alert(1)&lt;/script&gt;'",
      "Input: '© 2024 My Company' with hex mode encode. Output: '&#xa9; 2024 My Company'"
    ],
    "bestPractices": [
      "Always use the attribute preset when encoding values that will appear in HTML attributes to escape quotes",
      "Use named entities for readability in hand-coded HTML; use numeric for broader compatibility",
      "Never double-encode content; if content was already entity-encoded, use decode first",
      "Bookmark the entity reference table for quick lookup of obscure Unicode entities"
    ],
    "commonMistakes": [
      "Using body encoding for attribute values, leaving quotes unescaped and vulnerable to injection",
      "Encoding an already-encoded string, resulting in double-encoded output like &amp;lt;",
      "Using a preset that does not match the target context, such as attribute for a text node",
      "Assuming all browsers handle hex entities identically; numeric is safer for legacy support"
    ],
    "faq": [
      "What is the difference between named, numeric, and hex entities? Named use &amp; etc, numeric use &#38;, hex use &#x26;. All render the same character.",
      "Why does the attribute preset also escape quotes? Quotes delimit attribute values and must be escaped to prevent breaking the HTML.",
      "Can I decode HTML entities from an RSS feed? Yes, paste the feed content and switch to decode mode.",
      "Is the entity reference table searchable? Yes, type a character name, entity name, or code point to filter."
    ]
  },

"html-formatter": {
    "whatItDoes": "Formats and minifies HTML with configurable indentation, self-closing tag style, quote style, and attribute sorting. Removes comments and empty attributes, formats embedded CSS and JavaScript within style/script tags, and detects tag mismatches to highlight unclosed or mis-nested elements.",
    "whyItExists": "HTML generated by templates or server-side rendering is often minified or poorly indented, making it difficult to debug or review. This formatter beautifies the markup while also catching structural issues like tag mismatches that cause rendering bugs.",
    "whoShouldUse": "Web developers debugging rendered HTML output, code reviewers auditing template-generated markup, and QA engineers checking for proper HTML structure.",
    "useCases": [
      "Beautify compressed HTML output from a production server for debugging rendering issues",
      "Sort attributes alphabetically to enforce a consistent code style across a team",
      "Remove HTML comments before deploying to production to reduce page weight",
      "Check for tag mismatch errors in complex nested templates before pushing to production",
      "Format embedded CSS in <style> blocks and JavaScript in <script> blocks simultaneously"
    ],
    "instructions": [
      "Paste or type the HTML you want to format or minify in the input area",
      "Set the indent size (2 or 4 spaces, or tabs) and choose self-closing tag style (trailing / or not)",
      "Select quote style: single or double quotes for attribute values",
      "Toggle options: sort attributes alphabetically, remove comments, remove empty attributes",
      "Enable format embedded CSS/JS to also beautify content inside <style> and <script> tags",
      "Click Format to see the output; tag mismatch warnings appear highlighted in the output area"
    ],
    "examples": [
      "Input: '<div><p>hello</p></div>' with 2-space indent. Output: formatted with each tag on its own line, properly indented by 2 spaces.",
      "Input: '<div><p>hello</div></p>' (mismatched). Output: formatted HTML plus a highlighted error pointing out the closing tag mismatch."
    ],
    "bestPractices": [
      "Run format before code reviews to catch structural issues that are invisible in minified HTML",
      "Enable 'remove comments' only for production assets, not during development",
      "Use attribute sorting to enforce a consistent order (e.g., class, id, data-* before other attrs)",
      "Check embedded CSS/JS formatting with the option enabled to ensure consistent code style"
    ],
    "commonMistakes": [
      "Assuming the formatter fixes HTML errors; it detects mismatches but does not auto-correct them",
      "Using remove comments during development, losing important context for debugging",
      "Applying a tab width inconsistent with the rest of the project's code style",
      "Not checking the embedded CSS/JS formatting option and wondering why scripts remain unformatted"
    ],
    "faq": [
      "Does the formatter fix invalid HTML? No, it detects and reports tag mismatches but does not auto-correct them.",
      "Can I format only a selection of the HTML? The tool formats the entire document; use an editor plugin for partial formatting.",
      "What happens to inline event handlers like onclick? They are preserved and not modified by formatting.",
      "Does it preserve conditional comments for IE? Yes, conditional comments are preserved during formatting."
    ]
  },

"html-minifier": {
    "whatItDoes": "Minifies HTML using 7 configurable options including comment removal, whitespace stripping, optional tag elimination, quote style normalization, and type attribute removal. Supports preserve selectors to protect specific elements from minification, and shows a size comparison between original and minified output.",
    "whyItExists": "Page load speed depends heavily on HTML size, but manual minification is error-prone and hard to maintain. This tool automates aggressive HTML compression while giving control over what to preserve, and quantifies the savings with a visual size comparison.",
    "whoShouldUse": "Web performance engineers optimizing page load times, deployment pipeline maintainers integrating minification, and developers shipping production HTML assets.",
    "useCases": [
      "Minify HTML templates before deployment to reduce page weight and improve load times",
      "Strip all HTML comments from a production build to remove development notes",
      "Remove optional closing tags (like </li>, </p>) to maximize compression",
      "Normalize single to double quotes across all attributes for consistency",
      "Use preserve selectors to keep specific elements (e.g., for testing) untouched by minification"
    ],
    "instructions": [
      "Paste or upload HTML content into the input area",
      "Toggle the 7 options: comments, whitespace, optional tags, quote style, type attrs, etc.",
      "Add preserve selectors using CSS-like selectors to protect elements from minification",
      "Click Minify to process; the tool displays the compressed output alongside the original",
      "Review the size comparison showing original KB, minified KB, and percentage reduction",
      "Copy the minified output for use in your build pipeline or deployment"
    ],
    "examples": [
      "Input: '<html><!-- comment --><body><p>Hello</p></body></html>' with comments+whitespace removal. Output: '<html><body><p>Hello</p></body></html>' with size comparison showing 40% reduction.",
      "Input: '<script type=\"text/javascript\">alert(1)</script>' with type attrs removed. Output: '<script>alert(1)</script>'"
    ],
    "bestPractices": [
      "Always use preserve selectors for elements containing JSON-LD or conditional comments",
      "Enable 'remove optional tags' only if you control the HTML and know your parser handles it",
      "Run a functional test after aggressive minification to verify nothing broke visually",
      "Use the size comparison to decide which options give the best reduction for your specific HTML"
    ],
    "commonMistakes": [
      "Removing all whitespace when the HTML relies on inline text spacing for rendering",
      "Removing type attributes from script/style tags when using older browsers that need them",
      "Minifying HTML that still needs editing, making further development harder",
      "Not testing after enabling optional tag removal, which can break DOM parsing in some cases"
    ],
    "faq": [
      "What size reductions can I expect? Typically 20-60%, depending on how many options you enable.",
      "Does minification affect SEO? No, search engines parse minified HTML the same as formatted HTML.",
      "Can I undo minification? Use the html-formatter tool to beautify minified HTML back to readable form.",
      "Are preserve selectors case-sensitive? Yes, they follow standard CSS selector case sensitivity."
    ]
  },

"html-to-markdown": {
    "whatItDoes": "Converts HTML content to Markdown with support for 6 heading styles (ATX, ATX-closed, Setext, etc.), 3 bullet styles (*, -, +), inline and reference link formats, and code style options. Strips inline CSS styles while preserving the structural content in clean Markdown syntax.",
    "whyItExists": "Content migration from HTML to Markdown is common when moving from WYSIWYG editors to static site generators or documentation platforms. Manual conversion is tedious and inconsistent, so this tool automates the transformation with configurable output style.",
    "whoShouldUse": "Technical writers migrating documentation, developers converting blog content to static site generators, and anyone moving from rich-text HTML to Markdown-based workflows.",
    "useCases": [
      "Convert an HTML blog post to Markdown for use with a static site generator like Jekyll or Hugo",
      "Migrate documentation from a CMS to a Markdown-based documentation platform like Docusaurus",
      "Convert HTML emails to Markdown for archiving or plain-text rendering",
      "Strip inline styles from HTML while preserving the content in clean Markdown",
      "Choose reference-style links for more readable raw Markdown in long documents"
    ],
    "instructions": [
      "Paste the HTML content into the input area",
      "Select heading style: ATX (##), ATX-closed (## ##), Setext (===, ---), or others",
      "Choose bullet style: *, -, or + for unordered lists",
      "Select link format: inline [text](url) or reference [text][ref] style",
      "Choose code style: indented or fenced (```) for code blocks",
      "Click Convert and review the Markdown output; copy for use in your documentation"
    ],
    "examples": [
      "Input: '<h1>Title</h1><p>Hello <strong>world</strong></p>'. Output: '# Title\\n\\nHello **world**'",
      "Input: '<a href=\"https://example.com\">click here</a>' with reference links. Output: '[click here][0]\\n\\n[0]: https://example.com'"
    ],
    "bestPractices": [
      "Use ATX headings (#) for Markdown that will be processed by most static site generators",
      "Use reference-style links when the Markdown will be manually edited to keep URLs out of the text flow",
      "Strip inline styles before conversion to avoid bloated output with style attribute residue",
      "Review the output for complex tables, as some HTML tables may not convert perfectly"
    ],
    "commonMistakes": [
      "Converting HTML that contains complex tables or nested lists and expecting pixel-perfect results",
      "Using fenced code style but the target Markdown parser only supports indented code blocks",
      "Forgetting to check heading style compatibility with the target platform",
      "Converting content with inline event handlers that are irrelevant in Markdown"
    ],
    "faq": [
      "Does it handle images? Yes, <img> tags are converted to Markdown image syntax ![alt](src).",
      "Can I convert HTML tables? Basic tables are converted, but complex rowspan/colspan may not work perfectly.",
      "What happens to <style> and <script> blocks? They are stripped from the output.",
      "Does it support nested lists? Yes, nested <ul>/<ol> elements are preserved as nested Markdown lists."
    ]
  },

"http-header-parser": {
    "whatItDoes": "Parses HTTP request and response headers with automatic categorization into request, response, entity, and general headers. Includes a security audit that flags missing security headers (like CSP, HSTS, X-Frame-Options), a header builder for constructing custom headers, and cURL/Fetch export of the header configuration. Validates header syntax against RFC standards.",
    "whyItExists": "Debugging HTTP headers manually is tedious and security issues like missing CSP or HSTS headers are easy to overlook. This tool centralizes header inspection, security auditing, and code generation in one place to streamline web development and security analysis.",
    "whoShouldUse": "Web developers debugging API responses, security engineers auditing HTTP security headers, and QA engineers testing server configurations.",
    "useCases": [
      "Parse response headers from a cURL command output to understand the server configuration",
      "Run a security audit on your API's response headers to identify missing security protections",
      "Build a custom set of HTTP headers using the builder and export as a cURL command",
      "Validate a custom header string for RFC compliance before adding it to a server config",
      "Copy the parsed headers as a Fetch API call with headers included for testing in the browser console"
    ],
    "instructions": [
      "Paste raw HTTP headers (from browser dev tools, cURL -v output, or server logs) into the input area",
      "View the categorized output: each header is grouped as request, response, entity, or general",
      "Click the Security Audit button to scan for missing security headers; results highlight what is absent and provide recommendations",
      "Use the Header Builder tab to construct headers manually with key-value pair inputs",
      "Export the header set as a cURL command or a Fetch API JavaScript snippet",
      "Header validation is automatic; invalid headers are flagged with an explanation of the RFC violation"
    ],
    "examples": [
      "Input: 'Content-Type: text/html\\nX-Frame-Options: DENY\\nStrict-Transport-Security: max-age=31536000' categorized as entity/response/response with security audit showing HSTS present, CSP missing.",
      "Input: 'Content-Type: application/json' built in Header Builder, exported as Fetch: 'fetch(url, {headers: {\"Content-Type\": \"application/json\"}})'"
    ],
    "bestPractices": [
      "Run the security audit against all your API endpoints to ensure consistent security header coverage",
      "Use the builder to standardize headers across microservices and export as shared config",
      "Always validate custom headers before adding them to production server configurations",
      "Export to cURL when sharing reproductions of header-related issues with colleagues"
    ],
    "commonMistakes": [
      "Pasting headers with line breaks that don't follow HTTP/1.1 CRLF format, causing parse errors",
      "Assuming the security audit covers all possible security headers; it covers the OWASP recommended set",
      "Using the builder but forgetting to include required headers like Content-Type or Host",
      "Exporting to Fetch without checking if the target environment supports the generated syntax"
    ],
    "faq": [
      "What security headers does the audit check? It checks CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and more.",
      "Can I parse headers from a HAR file? Yes, extract the headers section from the HAR JSON and paste them.",
      "Does it support HTTP/2 pseudo-headers? Yes, :method, :path, :scheme, :authority are parsed correctly.",
      "Can I export as Python requests code? Currently supports cURL and Fetch export; Python coming soon."
    ]
  },

"image-compressor": {
    "whatItDoes": "Compresses images with batch upload support, quality presets (low, medium, high, lossless), and format selection (JPEG, PNG, WebP, AVIF). Provides a before/after preview slider, shows size reduction percentage, adjusts max dimensions, and displays DPI information for each image.",
    "whyItExists": "Large images are the #1 cause of slow page loads, but finding the right compression-quality balance requires trial and error. This tool lets you visually compare compression results side by side while adjusting quality presets, making it easy to find the optimal trade-off for web performance.",
    "whoShouldUse": "Web developers optimizing page load speed, content authors uploading media to websites, and designers preparing assets for production deployment.",
    "useCases": [
      "Compress JPEG photos from a photoshoot for a fast-loading portfolio website",
      "Batch convert PNG screenshots to WebP for a modern web application with better compression",
      "Use the before/after slider to visually verify quality loss is acceptable before saving",
      "Set a maximum dimension to downscale large images while compressing in one step",
      "Check DPI information to ensure images meet print-quality requirements when needed"
    ],
    "instructions": [
      "Drag and drop images or click to upload one or multiple files",
      "Select the target output format: JPEG, PNG, WebP, or AVIF",
      "Choose a quality preset: Low (smallest file), Medium, High, or Lossless",
      "Set a max dimension in pixels to downscale images that exceed the limit",
      "Use the before/after slider on any image to compare original vs compressed quality",
      "Review the size reduction % and DPI info for each image; download individually or all as a zip"
    ],
    "examples": [
      "Input: 5MB JPEG photo with Medium quality preset and WebP format. Output: 320KB WebP, 94% reduction, before/after slider shows minimal quality loss.",
      "Input: 300 DPI PNG screenshot with max dimension set to 1920px. Output: Downscaled and compressed PNG at 1920px width, size reduced from 2MB to 400KB."
    ],
    "bestPractices": [
      "Use AVIF or WebP for web delivery; fall back to JPEG for maximum compatibility",
      "Use the slider comparison to verify quality at each preset before batch processing",
      "Set a max dimension matching your website's max content width to avoid wasted bytes",
      "For PNG screenshots, try lossless WebP compression for the same quality at smaller size"
    ],
    "commonMistakes": [
      "Over-compressing at Low quality and not checking the slider preview before downloading",
      "Compressing images that will be resized later by the browser, wasting quality on oversized pixels",
      "Using JPEG for images with text or sharp edges where artifacts are more visible",
      "Batch processing without setting a max dimension, leaving unnecessarily large pixel dimensions"
    ],
    "faq": [
      "What is AVIF and is it supported? AVIF is a modern format with superior compression; supported in Chrome, Firefox, and Safari 16.4+.",
      "Does batch processing preserve folder structure? No, all images are downloaded flat or in a zip.",
      "How is the reduction percentage calculated? (Original size - Compressed size) / Original size * 100.",
      "Can I keep EXIF data? Currently compression strips EXIF to maximize reduction; use the image-resizer tool for EXIF control."
    ]
  },

"image-resizer": {
    "whatItDoes": "Resizes images using 15 social media preset dimensions (Instagram, Twitter, Facebook, LinkedIn, etc.) or custom dimensions with unit selection (px, %, cm, inch). Supports fit modes (cover, contain, fill, inside, outside), batch upload, format conversion (JPEG, PNG, WebP, AVIF), EXIF data toggle, and a target max file size for automatic quality adjustment.",
    "whyItExists": "Every platform requires specific image dimensions, and manually resizing each image is time-consuming. This tool provides presets for all major social platforms and batch processing so you can resize an entire photoshoot to platform-specific specs in seconds.",
    "whoShouldUse": "Social media managers preparing images for multiple platforms, developers generating thumbnail variants, and content teams batch-processing images at scale.",
    "useCases": [
      "Resize a batch of product photos to Instagram square (1080x1080) for an online store",
      "Convert high-res images to Twitter card size (1200x675) with contain fit to avoid cropping",
      "Resize images to a custom width of 800px with auto-height while keeping EXIF data intact",
      "Target a max file size of 100KB and let the tool automatically adjust quality to meet it",
      "Batch convert and resize PNG images to JPEG at 1200px wide for web thumbnails"
    ],
    "instructions": [
      "Upload images via drag-and-drop or file browser (supports batch upload)",
      "Select a preset from the 15 social media options or enter custom dimensions",
      "Choose the unit: px for absolute sizes, % for scaling, cm/inch for print",
      "Select a fit mode: cover (crop to fill), contain (fit within), fill (stretch), inside/outside",
      "Pick the output format: JPEG, PNG, WebP, or AVIF",
      "Toggle EXIF data on or off; optionally set a max file size target and click Resize"
    ],
    "examples": [
      "Input: 4000x3000 photo with Instagram Square preset (1080x1080) and cover fit. Output: 1080x1080 center-cropped image.",
      "Input: 2000x1500 image with custom 800px width, auto-height, contain fit. Output: 800x600 image with aspect ratio preserved, letterboxed."
    ],
    "bestPractices": [
      "Use 'cover' fit for social media presets where you want the image to fill the frame completely",
      "Use 'contain' fit for product photos where cropping would hide important details",
      "Keep EXIF data for photography workflows; strip it for web to reduce file size and remove location data",
      "Use max file size target when uploading to platforms with strict file size limits"
    ],
    "commonMistakes": [
      "Using cover fit for images where the subject is at the edge and would be cropped out",
      "Setting a target file size too low, resulting in poor quality; test with one image first",
      "Resizing to cm or inch without setting the correct DPI, resulting in wrong pixel dimensions",
      "Converting from PNG to JPEG and losing transparency without noticing in the preview"
    ],
    "faq": [
      "What are the 15 social media presets? They include Instagram (square/portrait/landscape), Twitter (post/header/card), Facebook (post/cover), LinkedIn, Pinterest, YouTube thumbnail, and more.",
      "Does batch resize preserve filenames? Yes, filenames are kept with a dimension suffix appended.",
      "What does 'max file size target' do? It automatically adjusts JPEG/WebP quality to stay under the specified size.",
      "Can I resize and convert format at the same time? Yes, format conversion and resizing happen in one operation."
    ]
  },

"image-to-base64": {
    "whatItDoes": "Converts images to Base64 encoding with drag-and-drop support, offering three output modes: data URI (for HTML src), raw Base64, and base64url (URL-safe). Supports resizing before encoding, batch mode for multiple images, and a decode-back mode that converts Base64 strings back to viewable images.",
    "whyItExists": "Embedding images directly in HTML, CSS, or JSON avoids extra HTTP requests but requires Base64 conversion. This tool makes it easy to generate the right format for each context and even resize images before encoding to keep the data URI small.",
    "whoShouldUse": "Frontend developers inlining small images in HTML/CSS, mobile app developers embedding assets in JSON, and API developers encoding image data in responses.",
    "useCases": [
      "Convert a small icon to a Base64 data URI for inline use in HTML src or CSS background-image",
      "Encode a profile photo to base64url for use in a URL parameter or JWT payload",
      "Resize a large image to a thumbnail before encoding to keep the data URI under 32KB",
      "Decode a Base64 string from an API response back to viewable image format for inspection",
      "Batch convert multiple images at once to data URIs for embedding in a mobile app bundle"
    ],
    "instructions": [
      "Drag and drop an image or click to browse and upload",
      "Select output mode: Data URI (data:image/...), Raw Base64 (just the encoded string), or Base64url (URL-safe variant)",
      "Optionally enable resize before encode and set max width/height to reduce the encoded output size",
      "In batch mode, upload multiple images and see each result with a copy button",
      "Switch to decode-back mode, paste a Base64 string, and view the decoded image preview",
      "Copy the encoded output to clipboard with the copy button"
    ],
    "examples": [
      "Input: 16x16 favicon.png. Output (Data URI mode): 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...'",
      "Input: Resize a 4000x3000 photo to 200px wide before encode. Output: ~4KB base64url string instead of ~4MB raw."
    ],
    "bestPractices": [
      "Only inline images under 32KB; larger images should remain as external files for caching",
      "Use data URI mode for HTML/CSS and base64url mode for URLs or JSON payloads",
      "Always resize images before encoding to minimize the Base64 size overhead (~33% larger)",
      "Use decode-back mode to verify API Base64 responses are correct during development"
    ],
    "commonMistakes": [
      "Inlining large images as data URIs, bloating HTML pages and preventing browser caching",
      "Using data URIs where a URL would work, losing cache and CDN benefits",
      "Using raw Base64 in a URL without switching to base64url, causing encoding issues with + and /",
      "Forgetting that Base64 is ~33% larger than the original binary file size"
    ],
    "faq": [
      "What is base64url vs Base64? base64url uses - instead of + and _ instead of / and omits = padding, making it URL-safe.",
      "Can I decode a data URI back to an image? Yes, use decode-back mode and paste the full data URI string.",
      "Is there a size limit for uploads? Very large images (>50MB) may time out; resize first for such files.",
      "What file formats are supported? JPEG, PNG, GIF, WebP, SVG, BMP, and ICO."
    ]
  },

"ip-calculator": {
    "whatItDoes": "Calculates IPv4 subnet details from a CIDR notation or IP/mask input, showing network address, broadcast address, usable host range, and total host count. Detects address class (A/B/C) and type (private, public, loopback, etc.), displays a binary view of the address and mask, and supports subnetting/supernetting calculations. Also handles IPv6 expand and compress formatting.",
    "whyItExists": "Network engineers constantly need to compute subnet boundaries, host ranges, and addressing details, but doing binary math by hand is slow and error-prone. This tool automates subnet calculations with clear visual output and also handles IPv6 address formatting.",
    "whoShouldUse": "Network administrators planning IP allocations, DevOps engineers configuring VPC subnets, and students learning subnetting concepts.",
    "useCases": [
      "Calculate the usable host range for a /24 subnet when assigning static IPs in an office network",
      "Determine if two IP addresses are in the same subnet by checking network addresses",
      "Subnet a /22 into smaller /26 subnets for a multi-tier application deployment",
      "Expand a compressed IPv6 address like ::1 to its full notation for configuration files",
      "Check if an IP is private or public when troubleshooting routing issues"
    ],
    "instructions": [
      "Enter an IPv4 address with CIDR notation (e.g., 192.168.1.0/24) or a subnet mask (e.g., 255.255.255.0)",
      "View the calculated network address, broadcast address, and usable host range",
      "Check the class/type detection to see if the address is private, public, loopback, or reserved",
      "Toggle the binary view to see the address and mask in binary format for learning or debugging",
      "Use the subnet calculator to divide a network into smaller subnets (subnetting)",
      "Switch to IPv6 mode to expand (::1 → 0000:0000:0000:0000:0000:0000:0000:0001) or compress an IPv6 address"
    ],
    "examples": [
      "Input: '192.168.1.0/24'. Output: Network: 192.168.1.0, Broadcast: 192.168.1.255, Usable: 192.168.1.1-192.168.1.254 (254 hosts), Class C, Private.",
      "Input: '10.0.0.0/8' subnet to /16. Output: 256 subnets, each with 65,534 usable hosts, network and broadcast listed per subnet."
    ],
    "bestPractices": [
      "Use CIDR notation for consistency; avoid classful addressing for modern network planning",
      "Always subtract 2 from the total host count for network and broadcast addresses",
      "Use the binary view to verify subnet boundaries when troubleshooting connectivity issues",
      "For IPv6, always expand addresses before copying into config files to avoid typos"
    ],
    "commonMistakes": [
      "Forgetting to exclude the network and broadcast addresses from assignable host pools",
      "Using /31 or /32 subnets without knowing they have 0 usable hosts for standard addressing",
      "Confusing CIDR prefix length with subnet mask octets (e.g., /24 ≠ 255.0.0.0)",
      "Not accounting for reserved addresses in cloud VPCs (AWS/GCP reserve 3-5 IPs per subnet)"
    ],
    "faq": [
      "Does this work for IPv6 subnets? The calculator handles IPv6 expand/compress; full subnet calculation is IPv4.",
      "What is the difference between subnetting and supernetting? Subnetting splits a network into smaller ones; supernetting combines multiple networks into a larger one.",
      "How does class/type detection work? It identifies Class A (1-126), B (128-191), C (192-223) and special ranges like private (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16).",
      "Can I calculate the subnet for a host IP without CIDR? Enter the IP and mask separately, e.g., 192.168.1.50 with mask 255.255.255.0."
    ]
  },

"ip-lookup": {
    "whatItDoes": "Performs IP geolocation lookup showing ISP, organization, country, city, timezone, and coordinates. Includes a My IP button to instantly look up your own public IP address, a history of recent lookups for reference, and a copy-to-clipboard for the full JSON response from the geolocation API.",
    "whyItExists": "When debugging network issues, verifying CDN configuration, or checking where traffic originates, you need instant IP location data. This tool provides comprehensive geolocation with one click and keeps a history so you can reference previous lookups.",
    "whoShouldUse": "Network engineers tracing traffic origins, security analysts investigating IP addresses, and web developers testing geo-targeted content delivery.",
    "useCases": [
      "Look up a suspicious IP address from server logs to identify its geographic origin",
      "Use My IP button to verify your VPN is routing traffic through the expected country",
      "Check the ISP and organization for a customer's IP to verify their network provider claim",
      "Copy the full JSON response of an IP lookup for integration into a security automation workflow",
      "Review the lookup history to compare multiple IP addresses from the same incident"
    ],
    "instructions": [
      "Type an IP address in the input field or click the My IP button to auto-fill your current IP",
      "Click Lookup to fetch geolocation data; results display country, city, region, timezone, ISP, and org",
      "View the map showing the approximate geographic location of the IP",
      "Click the copy button next to JSON to copy the full API response for external use",
      "Scroll through the recent lookups history to revisit or compare previous results",
      "Click on any history entry to re-run that lookup"
    ],
    "examples": [
      "Input: '8.8.8.8' Output: 'ISP: Google LLC, Country: United States, City: Mountain View, Timezone: America/Los_Angeles, Coordinates: 37.4056,-122.0775'",
      "Input: Click 'My IP' button. Output: Your public IP, full ISP, and geolocation data."
    ],
    "bestPractices": [
      "Use the My IP button to confirm VPN/proxy routing before sensitive operations",
      "Copy JSON responses for IPs flagged in logs to share with your security team",
      "Use the history feature to track IP addresses from repeated access attempts",
      "Note that geolocation at the city level is approximate, especially for mobile IPs"
    ],
    "commonMistakes": [
      "Assuming geolocation is accurate at street level; it is typically accurate at city level only",
      "Looking up private IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x) which return no data",
      "Using the tool for abuse investigation without verifying with the ISP directly",
      "Forgetting to use the history feature and re-typing IPs that were already looked up"
    ],
    "faq": [
      "How accurate is the geolocation? City-level is ~85% accurate; country-level is >99% accurate.",
      "Does the tool log my lookups? Lookup history is stored locally in your browser session only.",
      "Can I look up IPv6 addresses? Yes, IPv6 geolocation is supported.",
      "What does the JSON copy include? The full API response including asn, isp, org, country, region, city, timezone, lat, lon, and more."
    ]
  },

"js-minifier": {
    "whatItDoes": "Minifies and beautifies JavaScript code with variable name shortening to reduce size, while allowing preserve names to protect specific identifiers. Removes console.log, debugger statements, and comments, with ES5/ES6+ compatibility modes. Shows a size comparison between original and minified output with percentage savings.",
    "whyItExists": "Shipping large JavaScript files hurts page performance, and production builds need aggressive minification. This tool provides fine-grained control over what gets stripped and what gets preserved, with a visual size comparison to quantify savings.",
    "whoShouldUse": "Frontend developers optimizing JavaScript bundles, build pipeline maintainers, and anyone shipping JavaScript to production who needs to reduce file size.",
    "useCases": [
      "Minify a JavaScript library before publishing to npm with variable shortening enabled",
      "Strip all console.log and debugger statements from development code before production deployment",
      "Use preserve names to keep specific function names unmangled for external API compatibility",
      "Beautify minified JavaScript from a CDN to debug a production issue",
      "Switch between ES5 and ES6+ compatibility to ensure output works in target browsers"
    ],
    "instructions": [
      "Paste JavaScript code into the input area or upload a .js file",
      "Select Mode: Minify (compress) or Beautify (format)",
      "Toggle options: variable shortening, preserve names list, remove console, remove debugger, remove comments",
      "Choose compatibility: ES5 (e.g. var instead of let/const, avoid arrow functions) or ES6+ (modern JS)",
      "Click Process to generate the output; review the size comparison showing original KB, minified KB, and % savings",
      "Copy the result or download as a .min.js file"
    ],
    "examples": [
      "Input: 'function add(a, b) { console.log(\"adding\"); return a + b; }' with shorten and remove console. Output: 'function x(a,b){return a+b}'",
      "Input: Minified JS from CDN with beautify mode. Output: Formatted and indented JavaScript with proper line breaks."
    ],
    "bestPractices": [
      "Use preserve names for any function or variable accessed via dynamic property names or eval",
      "Always run tests after minification with variable shortening to ensure nothing broke",
      "Use ES5 mode if targeting older browsers; ES6+ mode produces smaller output for modern targets",
      "Strip console.log only in production builds; keep them during development"
    ],
    "commonMistakes": [
      "Shortening variable names without preserving exported symbols, causing runtime ReferenceErrors",
      "Removing console.log globally when some logging is needed for production monitoring",
      "Using ES6+ mode and deploying to a browser that doesn't support modern syntax",
      "Assuming beautification produces the original code; comments and formatting are permanently lost"
    ],
    "faq": [
      "Can variable shortening be reversed? No, shortened variable names lose their original names permanently.",
      "Does it handle ES modules? Yes, import/export statements are preserved during minification.",
      "What size reductions are typical? 30-70% depending on variable shortening and comment removal.",
      "Can I minify TypeScript? The tool expects JavaScript; compile TypeScript to JS first."
    ]
  },

"json-beautifier": {
    "whatItDoes": "Beautifies JSON with 5 syntax themes for the output, configurable indentation, key sorting, bracket padding, and quote style (double vs single). Handles trailing commas gracefully, supports JS object literal and JSONP output formats, and includes a side-by-side diff view between original and beautified JSON.",
    "whyItExists": "Raw minified JSON from APIs or config files is unreadable, and different projects use different formatting conventions. This tool not only pretty-prints JSON but also transforms it between formats (JS object, JSONP) and themes it for readability.",
    "whoShouldUse": "API developers inspecting JSON responses, configuration file maintainers, and teams enforcing consistent JSON formatting across projects.",
    "useCases": [
      "Beautify a minified JSON API response for debugging with syntax highlighting and line numbers",
      "Convert a JSON file to a JavaScript object literal for embedding in Node.js or browser code",
      "Wrap JSON in a JSONP callback function for cross-origin script tag loading",
      "Sort JSON keys alphabetically to enforce a consistent key order across team config files",
      "Use the side-by-side diff to compare a JSON file before and after formatting changes"
    ],
    "instructions": [
      "Paste raw JSON into the input area or upload a .json file",
      "Select a theme from 5 options (e.g., light, dark, monokai, github, solarized)",
      "Set indent size (2, 4 spaces or tabs), toggle bracket padding, and choose quote style (double or single)",
      "Enable sort keys to alphabetically order all JSON keys",
      "Select output format: JSON, JS Object Literal, or JSONP (with callback name input)",
      "Toggle trailing commas on or off; use side-by-side view to compare original vs output"
    ],
    "examples": [
      "Input: '{\"z\":1,\"a\":2}' with sort keys and 2-space indent. Output: '{\\n  \"a\": 2,\\n  \"z\": 1\\n}'",
      "Input: '{name:\"test\"}' with JS Object Literal mode. Output: '{name: \"test\"}' (unquoted keys if valid identifiers)."
    ],
    "bestPractices": [
      "Use the side-by-side diff when migrating JSON files between formatting standards to verify changes",
      "Sort keys for configuration files where key order matters for readability",
      "Use JS Object Literal format when pasting JSON into scripts to avoid redundant quotes on keys",
      "Enable bracket padding for a more modern, spaced-out JSON style that some teams prefer"
    ],
    "commonMistakes": [
      "Using JS Object Literal output when you need valid JSON for an API endpoint",
      "Enabling trailing commas in JSON mode, which produces invalid JSON",
      "Applying sort keys to JSON that preserves insertion order for some purpose",
      "Choosing a theme that doesn't provide enough contrast in the target viewing environment"
    ],
    "faq": [
      "What are the 5 themes? Light, Dark, Monokai, GitHub, and Solarized (both light and dark variants).",
      "Does it validate JSON before formatting? Yes, invalid JSON is flagged with a parse error message.",
      "Can I convert JSON to YAML? No, this tool focuses on JSON and JS object formats.",
      "What is JSONP output? It wraps the JSON in a callback function: callbackName({\"key\":\"value\"})"
    ]
  },

"json-diff": {
    "whatItDoes": "Compares two JSON documents side by side with three view modes: side-by-side, unified, and tree view. Supports value-only diff to ignore structural changes, detects array element moves, and shows a 5-stat summary (added, removed, changed, moved, unchanged). Includes a merge mode for combining changes and supports drag-and-drop upload of JSON files. Can copy the result as a JSON Patch (RFC 6902).",
    "whyItExists": "Tracking JSON changes across API versions, configuration iterations, or data migrations is essential but difficult to do manually. This tool provides multiple visualization modes and a statistical summary so you can understand exactly what changed at a glance.",
    "whoShouldUse": "Backend developers tracking API response changes, DevOps engineers comparing config files, and data engineers validating ETL pipeline output.",
    "useCases": [
      "Compare two API responses to verify a refactor didn't change the output structure",
      "Track configuration drift between staging and production JSON config files",
      "Use tree view to understand deep structural changes in nested JSON documents",
      "Enable array move detection to identify reordered items in a JSON array",
      "Generate a JSON Patch from the diff to apply changes programmatically"
    ],
    "instructions": [
      "Paste or drag-drop JSON file A (original) and JSON file B (modified) into the respective areas",
      "Select view mode: Side-by-side (left/right), Unified (inline with +/-), or Tree (hierarchical)",
      "Toggle value-only diff to see only value changes, ignoring key additions or removals",
      "Review the 5-stat summary showing counts of added, removed, changed, moved, and unchanged nodes",
      "Enable merge mode to selectively apply changes from B to A with manual confirmation",
      "Click Copy JSON Patch to get an RFC 6902 patch document for automated application"
    ],
    "examples": [
      "Input A: '{\"name\":\"John\",\"age\":30}', Input B: '{\"name\":\"Jane\",\"age\":31}'. Output: name changed (John→Jane), age changed (30→31), 0 added, 0 removed, 0 moved.",
      "Input A: '[1,2,3]', Input B: '[3,1,2]' with move detection. Output: '3 moved from index 2 to index 0', resulting in 1 move detected."
    ],
    "bestPractices": [
      "Use tree view for deeply nested JSON to understand structural drifts at a glance",
      "Enable array move detection for comparing sorted lists where order may change legitimately",
      "Use merge mode when selectively porting changes between configuration versions",
      "Export JSON Patch when you need to apply diffs in CI/CD pipelines automatically"
    ],
    "commonMistakes": [
      "Expecting side-by-side mode to show identical structures; it aligns by key path not by line",
      "Not enabling array move detection and seeing all moved items as removed+added instead",
      "Assuming the 5-stat summary counts individual values; it counts leaf nodes and structural nodes",
      "Pasting extremely large JSON and expecting instant diff; very large files may cause slowdowns"
    ],
    "faq": [
      "What does the 5-stat summary show? Added keys, removed keys, changed values, moved array items, and unchanged nodes.",
      "Can I diff JSON from two different files? Yes, drag-and-drop files A and B into their respective upload areas.",
      "What is JSON Patch (RFC 6902)? A standard format describing changes as an array of operations: add, remove, replace, move, copy.",
      "Does it handle large files? Files up to ~10MB are handled well; larger files may need server-side processing."
    ]
  },

"json-formatter": {
    "whatItDoes": "Formats JSON with syntax highlighting using colored keys, strings, numbers, and booleans, plus line numbers for easy reference. Supports configurable indentation, key sorting, full-text search with navigation arrows to jump between matches, auto-format on paste, and displays input statistics (character count, line count, key count, depth).",
    "whyItExists": "Reading raw JSON from APIs or logs is painful without syntax highlighting and line numbers. This tool makes JSON instantly readable with search and navigation, and the auto-format paste feature eliminates the extra step of hitting a Format button.",
    "whoShouldUse": "API developers reading JSON responses, data analysts exploring JSON datasets, and developers debugging JSON configuration files.",
    "useCases": [
      "Paste a minified API response and have it auto-format with colored syntax highlighting",
      "Search for a specific key or value in a large JSON document with navigation between matches",
      "Check the depth of a nested JSON structure using the input stats (depth, key count, etc.)",
      "Format JSON with sorted keys and line numbers for code review in a pull request",
      "Troubleshoot a malformed JSON configuration by pasting it and seeing the auto-format correction"
    ],
    "instructions": [
      "Paste JSON into the input area; auto-format on paste instantly beautifies it with highlighting",
      "Adjust indent size (2 or 4 spaces) and toggle key sorting on or off",
      "Use the search bar to type a key or value; matching lines are highlighted with navigation arrows",
      "View input stats: character count, line count, key count, and maximum nesting depth",
      "Toggle line numbers on/off and copy the formatted output",
      "Invalid JSON shows a parse error with line number and character position for debugging"
    ],
    "examples": [
      "Input: '{\"users\":[{\"name\":\"Alice\"}]}' pasted with auto-format. Output: Colored, indented JSON showing 'users' as a key (purple), 'Alice' as a string (green), line numbers 1-4.",
      "Input: Search for 'email' in a 500-line JSON document. Output: 12 matches highlighted with prev/next navigation arrows."
    ],
    "bestPractices": [
      "Enable auto-format on paste to save time; it eliminates the extra Format button click",
      "Use search with navigation for large JSON files instead of scrolling manually",
      "Check the depth stat to understand how nested a JSON structure is before writing traversal code",
      "Use sorted keys to quickly locate keys in alphabetical order within the formatted output"
    ],
    "commonMistakes": [
      "Pasting invalid JSON and not noticing the parse error message below the input area",
      "Using the tool for JSON larger than 50MB, which may cause browser slowdowns",
      "Searching for a value without quotes when the search expects exact string matching",
      "Confusing line numbers in the formatted output with actual file line numbers (they match)"
    ],
    "faq": [
      "What syntax highlighting colors are used? Keys are typically blue/purple, strings green, numbers orange, booleans red, brackets gray.",
      "Does auto-format work for partial or invalid JSON? It attempts to format valid portions and highlights the error location.",
      "Can I copy only a selection of the formatted JSON? Use the copy all button; for partial copy, select text manually.",
      "What does the depth stat mean? It shows the maximum nesting level of objects/arrays in the JSON."
    ]
  },

"json-minifier": {
    "whatItDoes": "Minifies JSON by removing whitespace with options to strip boolean and number values, preserve specific keys from removal, and show a side-by-side size comparison. Includes a frequency chart showing value type distribution, and a pretty print toggle to switch between minified and formatted views instantly.",
    "whyItExists": "Reducing JSON payload size is critical for API performance and bandwidth savings, but standard minification (removing whitespace) only goes so far. This tool offers additional compression strategies like stripping optional fields and visualizes the savings with a size comparison and frequency chart.",
    "whoShouldUse": "API developers optimizing JSON response sizes, mobile developers reducing payload over cellular, and anyone shipping JSON where bandwidth is constrained.",
    "useCases": [
      "Minify a large JSON configuration file to reduce its size for embedding in a mobile app bundle",
      "Strip boolean fields from a JSON API response when clients only care about data values",
      "Compare original vs minified file sizes with the visual size comparison bar",
      "Use the frequency chart to understand the distribution of value types in a JSON document",
      "Toggle between pretty print and minified views to review the content before and after"
    ],
    "instructions": [
      "Paste JSON into the input area or upload a .json file",
      "Toggle whitespace removal on/off (off leaves formatting, on minifies)",
      "Enable strip boolean or strip number to remove all boolean true/false or number values",
      "Add key names to preserve keys to keep specific keys from being stripped",
      "Review the size comparison showing original size, minified size, and percentage reduction",
      "View the frequency chart showing counts of string, number, boolean, null, array, and object values"
    ],
    "examples": [
      "Input: '{\"name\":\"John\",\"age\":30,\"active\":true}' with strip booleans. Output: '{\"name\":\"John\",\"age\":30}' (5% size reduction).",
      "Input: A 100KB JSON file with whitespace removal only. Output: 65KB minified with size comparison showing 35% reduction."
    ],
    "bestPractices": [
      "Only strip booleans or numbers if the consuming client does not need those fields",
      "Use preserve keys to keep structural fields like 'id' or 'type' even when stripping values",
      "Use the frequency chart to identify the most common value types before designing a compression strategy",
      "Toggle pretty print after minification to verify the structure is intact before deploying"
    ],
    "commonMistakes": [
      "Stripping booleans when some boolean fields are semantically necessary for the client",
      "Using preserve keys but misspelling the key name, causing it to be stripped anyway",
      "Minifying JSON that still needs editing, making further development challenging",
      "Assuming size reduction from whitespace removal is the same as gzip; gzip may perform differently"
    ],
    "faq": [
      "What size reductions can I expect? Whitespace removal typically reduces 20-40%; stripping optional fields adds 5-20%.",
      "Does the frequency chart count nested values? Yes, it recursively traverses the entire document.",
      "Can I restore stripped values? No, stripping is irreversible; keep the original copy before minifying.",
      "What is the difference between this and json-beautifier? This focuses on compression with size stats; beautifier focuses on formatting with themes."
    ]
  },

"json-path-finder": {
    "whatItDoes": "Evaluates JSONPath expressions on JSON documents with a live expression input that suggests completions as you type. Shows matching results with count, a tree explorer of the JSON structure with clickable paths, and highlights matched nodes. Displays the total match count and lets you click any path to copy it.",
    "whyItExists": "Querying nested JSON data manually is error-prone and time-consuming. This tool provides an interactive JSONPath explorer with autocomplete suggestions and visual tree navigation so you can find exactly what you need without guesswork.",
    "whoShouldUse": "API developers extracting specific fields from responses, data analysts querying JSON datasets, and anyone working with deeply nested JSON who needs to locate specific values.",
    "useCases": [
      "Query all email addresses from a nested user JSON using $.users[*].email",
      "Find the last item in an array with $..[-1:] without manually counting array elements",
      "Explore an unfamiliar API response structure by clicking through the tree explorer",
      "Copy the exact JSONPath for a frequently accessed field to use in automation scripts",
      "Count how many items match a filter condition using $.items[?(@.price>10)]"
    ],
    "instructions": [
      "Paste JSON into the input area or upload a .json file",
      "Type a JSONPath expression (e.g., $.store.book[*].title) in the expression input",
      "View autocomplete suggestions while typing to help construct valid JSONPath queries",
      "Review matching results displayed below the input with the total match count",
      "Use the tree explorer to browse the JSON structure; click any node to see its path",
      "Click on any result or tree node to copy its JSONPath to the clipboard"
    ],
    "examples": [
      "Input JSON: '{\"store\":{\"book\":[{\"title\":\"Book A\"},{\"title\":\"Book B\"}]}}'. Expression: '$.store.book[*].title'. Output: 2 matches: 'Book A', 'Book B'.",
      "Input: Click on 'store' node in the tree explorer. Output: Path '$.store' is copied to clipboard."
    ],
    "bestPractices": [
      "Use the tree explorer first to understand the structure before writing complex JSONPath queries",
      "Rely on autocomplete suggestions to learn JSONPath syntax if you are unfamiliar with it",
      "Use filter expressions [$?(@.key==value)] for conditional queries instead of brute-force searching",
      "Click a tree node to get its path, then modify the expression for more specific queries"
    ],
    "commonMistakes": [
      "Using XPath syntax ($x) instead of JSONPath ($.) syntax and getting zero matches",
      "Forgetting that array indices are 0-based in JSONPath expressions",
      "Using dot notation for keys with special characters or spaces when bracket notation is needed",
      "Writing overly broad expressions like $..* that return the entire document instead of filtered results"
    ],
    "faq": [
      "What JSONPath implementation is used? It follows the Stefan Goessner JSONPath proposal with common extensions.",
      "Can I use filter expressions? Yes, use [?(@.key value)] format for conditional filtering.",
      "Does the tool validate the JSON before querying? Yes, invalid JSON shows a parse error.",
      "What are autocomplete suggestions based on? They are generated from the JSON structure and common JSONPath patterns."
    ]
  },

"json-schema-generator": {
    "whatItDoes": "Generates JSON Schema from sample JSON input, supporting Draft-07 and 2020-12 schema versions. Automatically detects string formats (email, date, uri, etc.) and patterns, identifies potential enums from repeated values, and generates examples from the input data. Allows toggling validation keywords like required, minimum, maximum, and patternProperties.",
    "whyItExists": "Writing JSON Schema by hand is tedious and error-prone, especially for complex nested objects. This tool infers the schema structure from sample data, auto-detects constraints like formats and enums, and lets you toggle validation rules so you can generate schemas that match your actual data.",
    "whoShouldUse": "API developers documenting request/response schemas, data engineers validating JSON datasets, and teams adopting OpenAPI or schema-driven development.",
    "useCases": [
      "Generate a Draft-07 schema from a sample API response to document the endpoint",
      "Infer string formats like email and date-time from sample data for validation purposes",
      "Detect enum values from a set of samples to restrict API input fields to valid options",
      "Generate an example value from the input to include in the schema documentation",
      "Toggle required properties on/off to create a looser schema for partial updates"
    ],
    "instructions": [
      "Paste valid JSON sample data into the input area",
      "Select the schema version: Draft-07 or 2020-12",
      "Toggle format detection on/off to auto-detect email, date, uri, ipv4, etc.",
      "Toggle enum detection to identify repeated string values as enum constraints",
      "Toggle individual validation keywords: required, minimum, maximum, patternProperties, etc.",
      "Click Generate to produce the JSON Schema; copy or download the result"
    ],
    "examples": [
      "Input: '{\"email\":\"test@example.com\",\"age\":25}' with Draft-07, format detection on. Output: Schema with 'email' type string format email, 'age' type integer minimum 0.",
      "Input: '{\"role\":\"admin\"}, {\"role\":\"user\"}, {\"role\":\"admin\"}' with enum detection on. Output: Schema with 'role' type string and enum [\"admin\", \"user\"]."
    ],
    "bestPractices": [
      "Provide multiple sample JSON documents when possible; more samples lead to better enum and type detection",
      "Use Draft-07 for broader compatibility; use 2020-12 for new features like dependentRequired",
      "Review the generated schema manually to adjust constraints that may be too strict or too loose",
      "Enable format detection for API schemas to validate common patterns like email and URL"
    ],
    "commonMistakes": [
      "Providing only one sample and expecting accurate enum detection (needs multiple distinct values)",
      "Using auto-generated schemas without review, which may infer overly permissive types (e.g., anyOf)",
      "Forgetting to toggle validation keywords off for schemas that should accept flexible input",
      "Generating a schema from empty or null values, resulting in an {type: null} schema"
    ],
    "faq": [
      "Can it generate a schema from multiple JSON samples? Paste them sequentially or as an array of samples.",
      "What is the difference between Draft-07 and 2020-12? 2020-12 adds vocabularies, new keywords like dependentRequired, and changes how $defs works.",
      "Does it detect nested objects? Yes, it recursively generates schema for nested objects and arrays.",
      "Can I exclude certain fields from the schema? Post-edit the generated schema or use a tool like json-path-finder to identify field paths first."
    ]
  },

"json-to-csv": {
  "whatItDoes": "Converts JSON data to CSV format with automatic nested object flattening using dot notation, supporting arrays of objects and nested structures. Offers three null handling modes (empty string, null literal, or skip row) and BOM insertion for Excel compatibility.",
  "whyItExists": "JSON is the standard data interchange format, but CSV remains essential for spreadsheets, legacy systems, and data analysis tools. Bridges the gap between structured JSON and tabular CSV without manual transformation.",
  "whoShouldUse": "Data analysts, backend developers, and anyone who needs to convert JSON API responses or datasets into spreadsheet-compatible CSV files.",
  "useCases": ["Export JSON API responses to CSV for Excel analysis",
    "Convert nested JSON configuration files to flat tabular format",
    "Prepare JSON datasets for import into database systems that support CSV",
    "Generate CSV reports from complex nested JSON data structures",
    "Transform MongoDB document exports to CSV for business stakeholders",
    "Create CSV backups of JSON-formatted configuration data"],
  "instructions": ["Paste or upload your JSON data into the input editor (ensure it contains an array of objects for best results)",
    "Select your preferred null handling mode from the dropdown: Empty String, Null Literal, or Skip Row",
    "Toggle BOM (Byte Order Mark) ON if the CSV will be opened in Microsoft Excel to ensure correct encoding",
    "Choose your delimiter (comma, semicolon, tab) and optionally enable \"Quote All Fields\" to wrap every value in quotes",
    "Click \"Convert\" and inspect the preview table to verify nested keys were flattened correctly with dot notation",
    "Download the result as a .csv file or copy to clipboard; adjust settings and reconvert if needed"],
  "examples": ["Input: [{\"user\":{\"name\":\"Alice\",\"age\":30},\"tags\":[\"admin\",\"editor\"]}] -> Output: user.name,user.age,tags.0,tags.1\\nAlice,30,admin,editor",
    "Input: [{\"id\":1,\"value\":null},{\"id\":2,\"value\":\"ok\"}] with nullMode=skip -> Output: id,value\\n2,ok"],
  "bestPractices": ["Ensure JSON is an array of objects for proper CSV output; single objects produce only headers",
    "Enable BOM when the CSV will be opened in any version of Microsoft Excel to prevent encoding issues",
    "Use \"Quote All Fields\" if any values contain the delimiter character to avoid broken columns",
    "Preview the output before downloading to catch incorrect nested flattening early",
    "For very large datasets (10K+ rows), consider splitting into smaller batches to avoid browser performance issues"],
  "commonMistakes": ["Feeding a single JSON object instead of an array expecting multiple rows of output",
    "Forgetting to enable BOM and wondering why Excel shows garbled characters",
    "Not accounting for commas or newlines within cell values, causing column misalignment",
    "Assuming nested arrays will be intelligently unrolled rather than flattened with index keys",
    "Setting null handling to \"Skip Row\" which removes the entire row instead of just the null field"],
  "faq": ["Can I convert deeply nested JSON with 5+ levels? Yes, the tool flattens recursively using dot notation regardless of depth level.",
    "What happens if my JSON has inconsistent field names across objects? Missing fields are rendered as empty cells based on the null handling mode selected.",
    "Does this work with JSON arrays of primitives like [1,2,3]? Yes, but the output will be a single column with a default header name; best results come from arrays of objects.",
    "Can I import the CSV back into JSON? No, this is a one-way conversion; consider a separate CSV-to-JSON tool for reverse conversion."]
},

"json-to-go": {
  "whatItDoes": "Generates Go struct definitions from JSON input, creating nested structs, arrays, and maps with proper Go types. Supports custom JSON tags in snake_case or camelCase, omitempty for optional fields, and \"inline\" flattening for embedded structs.",
  "whyItExists": "Manually writing Go structs for complex JSON APIs is tedious and error-prone, especially with deeply nested objects. Automates the mapping between JSON schemas and Go type definitions, saving development time and reducing bugs.",
  "whoShouldUse": "Go developers working with REST APIs, microservices, or any JSON-based data interchange who need to quickly scaffold struct definitions.",
  "useCases": ["Generate Go structs from third-party API JSON responses for unmarshaling",
    "Create configuration structs from JSON config file samples",
    "Scaffold data models from JSON schema definitions or example payloads",
    "Rapidly prototype Go programs that consume JSON webhook payloads",
    "Convert Swagger/OpenAPI JSON examples into Go type definitions",
    "Bridge JSON test fixtures into Go test structs for unit testing"],
  "instructions": ["Paste your JSON input into the editor; the tool auto-detects and parses the structure",
    "Toggle struct options: JSON tags (snake_case/camelCase/disabled), omitempty for optional fields, and \"inline\" for flattening nested objects",
    "Set the package name (default \"main\") and optionally enable exporting types (uppercase first letter)",
    "Configure type preference for numbers (float64 vs int) and time fields (string vs time.Time)",
    "Click \"Generate\" and review the output; nested objects become separate struct types with proper references",
    "Copy the generated Go code to your editor or use the \"Copy\" button; refine by adjusting options and regenerating"],
  "examples": ["Input: {\"name\":\"Alice\",\"age\":30,\"address\":{\"city\":\"NYC\"}} -> Output: type Address struct { City string `json:\"city\"` }\\ntype Person struct { Name string `json:\"name\"` Age int `json:\"age\"` Address Address `json:\"address\"` }",
    "Input: {\"metadata\":{\"created\":\"2024-01-01T00:00:00Z\"}} with timeType=time.Time -> Output: type Metadata struct { Created time.Time `json:\"created\"` }"],
  "bestPractices": ["Use representative JSON samples that include all optional fields to generate complete structs",
    "Enable omitempty only for fields you expect to be absent; it adds pointer types for optional values",
    "Set the package name to match your Go module structure rather than using the default \"main\"",
    "Review generated types for ambiguous numeric fields and manually adjust int vs float64 as needed",
    "For large JSON payloads, generate structs in sections and compose them manually for cleaner organization"],
  "commonMistakes": ["Assuming the tool handles oneOf/anyOf schema patterns; it generates structs from concrete JSON, not schemas",
    "Forgetting to enable \"omitempty\" and then getting errors when fields are missing from actual JSON",
    "Using a single simple JSON sample that misses edge cases like null values or empty arrays",
    "Expecting the tool to handle polymorphic fields or union types not present in standard JSON",
    "Not adjusting the package name and then getting import conflicts in multi-package projects"],
  "faq": ["Does it support nested objects? Yes, each level of nesting becomes its own struct type with proper Go composition.",
    "Can I generate time.Time fields for date strings? Yes, toggle the timeType option to convert matching patterns to time.Time instead of string.",
    "What about nullable fields? Enable omitempty to mark fields as optional, and null values in JSON will be represented as pointer types where appropriate.",
    "Does it generate JSON tags with dashes or underscores? You can choose between snake_case, camelCase, or disable JSON tags entirely."]
},

"json-to-typescript": {
  "whatItDoes": "Converts JSON input into TypeScript interfaces or type aliases with full support for nested objects, arrays, union types from varying structures, and nullable fields. Offers toggles for optional properties, readonly modifiers, export keywords, and JSDoc comments.",
  "whyItExists": "TypeScript developers frequently need type definitions for JSON API responses, configuration files, or data payloads. Manual typing is repetitive and error-prone, especially when dealing with large or nested JSON structures with optional fields.",
  "whoShouldUse": "TypeScript and Angular/React/Vue developers who need to quickly generate type definitions from JSON samples or API documentation.",
  "useCases": ["Generate TypeScript interfaces from REST API JSON responses for type-safe HTTP clients",
    "Create type definitions from JSON configuration files used across a TypeScript project",
    "Convert GraphQL query response examples into TypeScript types",
    "Scaffold data model interfaces from JSON test fixtures or mock data",
    "Generate types for JSON webhook payloads consumed by TypeScript services",
    "Create type-safe contracts from JSON schema examples in microservice architectures"],
  "instructions": ["Paste your JSON into the input editor; the tool parses the structure and infers types automatically",
    "Select whether to generate interfaces (extends-friendly) or type aliases (union-friendly)",
    "Toggle optional properties ON to mark all fields as optional with ? syntax, or OFF for required fields",
    "Enable readonly modifiers to make all properties readonly, useful for immutable data patterns",
    "Toggle \"export\" to prefix each type with the export keyword, and JSDoc for generating doc comments",
    "Click \"Generate\" and review the output; copy the generated TypeScript types to your project"],
  "examples": ["Input: {\"id\":1,\"name\":\"Alice\",\"roles\":[\"admin\"]} -> Output: export interface User { id: number; name: string; roles: string[]; }",
    "Input: [{\"type\":\"cat\",\"meow\":true},{\"type\":\"dog\",\"bark\":true}] with union detection -> Output: export type Animal = Cat | Dog; export interface Cat { type: string; meow: boolean; } export interface Dog { type: string; bark: boolean; }"],
  "bestPractices": ["Provide a complete JSON sample with all possible fields to generate accurate types, not a minimal subset",
    "Use union type generation when your data has polymorphic structures (different fields per object)",
    "Enable readonly for types representing API responses that should not be mutated after receipt",
    "Prefer interfaces over type aliases when you need declaration merging or extends capabilities",
    "Review generated types for anyOf/nullable patterns and adjust manually for precision"],
  "commonMistakes": ["Providing JSON with a single object that has null values, causing the tool to infer \"any\" type",
    "Assuming union types are automatically detected; you need to enable the option explicitly",
    "Forgetting that the tool generates types from concrete values, not from JSON schema definitions",
    "Using a JSON sample that doesn't represent all possible states, leading to incomplete type definitions",
    "Not enabling JSDoc generation and then manually documenting each property afterward"],
  "faq": ["Can it generate types for deeply nested JSON? Yes, nested objects become nested interfaces with proper hierarchical structure.",
    "How does it handle arrays with different element types? Arrays are typed as union types (e.g., (string | number)[]) when elements have mixed types.",
    "Does it support generating enums from string literals? Not automatically; you'll need to manually create enums from generated string literal unions.",
    "What happens with empty objects or arrays? Empty objects become Record<string, any> and empty arrays become any[] as fallback types."]
},

"json-to-xml": {
  "whatItDoes": "Transforms JSON objects into well-formed XML with configurable root element names, case conversion (camelCase, snake_case, kebab-case, PascalCase), and intelligent array handling (wrapped/unwrapped). Supports attribute detection via @ prefix, CDATA sections for text-heavy content, and XML declaration toggle.",
  "whyItExists": "Many legacy systems, SOAP APIs, and configuration formats still require XML despite JSON's dominance. This tool provides a reliable bridge for data migration, API integration, and cross-format compatibility without manual XML authoring.",
  "whoShouldUse": "Backend developers working with SOAP APIs, ETL pipeline engineers, DevOps automating XML configuration generation, and anyone migrating data from JSON to XML-based systems.",
  "useCases": ["Convert JSON API responses to XML for SOAP-based web service consumption",
    "Generate XML configuration files (like Ant, Maven, or Spring XML) from JSON templates",
    "Transform JSON data exports into XML format for legacy system imports",
    "Create XML sitemaps from JSON-structured website data",
    "Convert JSON test fixtures to XML for testing XML-parsing code paths",
    "Generate RSS/Atom feed XML from JSON blog post data structures"],
  "instructions": ["Paste your JSON object into the input editor; the tool validates JSON syntax and parses the structure",
    "Set the root element name in the configuration panel (defaults to \"root\" if not specified)",
    "Configure array handling: choose \"wrapped\" (arrays get a parent wrapper element) or \"unwrapped\" (repeat the element name)",
    "Enable attribute detection: keys prefixed with @ become XML attributes; nested objects become child elements",
    "Toggle options: XML declaration, CDATA wrapping for long text, and case conversion for element names",
    "Click \"Convert\" and review the XML preview; copy the result or download as .xml file"],
  "examples": ["Input: {\"person\":{\"@id\":1,\"name\":\"Alice\",\"roles\":[\"admin\",\"user\"]}} with array handling=wrapped -> Output: <?xml version=\"1.0\" encoding=\"UTF-8\"?><person id=\"1\"><name>Alice</name><roles><role>admin</role><role>user</role></roles></person>",
    "Input: {\"data\":{\"content\":\"Hello <world>\"}} with CDATA enabled -> Output: <?xml version=\"1.0\"?><data><content><![CDATA[Hello <world>]]></content></data>"],
  "bestPractices": ["Use the @ prefix convention for attributes to keep the JSON intuitive and avoid manual XML attribute placement",
    "Enable CDATA for fields containing HTML, special characters, or any content with angle brackets",
    "Use \"unwrapped\" array style for simpler XML output when you don't need intermediate wrapper elements",
    "Always specify a descriptive root element name instead of using the default \"root\" for production use",
    "Preview the output with the XML declaration enabled to ensure encoding and version info are correct"],
  "commonMistakes": ["Forgetting to prefix attributes with @ and then wondering why they appear as child elements instead",
    "Using JSON arrays where the target XML schema expects single elements (check the array handling setting)",
    "Not enabling CDATA for fields containing HTML or XML content, resulting in malformed output",
    "Assuming nested key names are automatically sanitized; XML element names have stricter rules than JSON keys",
    "Setting case conversion that conflicts with the target system's XML naming conventions or DTD"],
  "faq": ["Can I control the XML namespace (xmlns) generation? Namespace support is not automatic; you can add xmlns attributes using the @ prefix convention.",
    "What happens if my JSON key starts with a number? The tool prepends an underscore or allowed character since XML elements cannot start with digits.",
    "How is the XML declaration handled? You can toggle it on/off; when enabled it includes version and encoding attributes.",
    "Does it support mixed content (text with child elements)? Not directly; use CDATA for text-heavy nodes that need to coexist with element children."]
},

"json-to-yaml": {
  "whatItDoes": "Provides bidirectional conversion between JSON and YAML with indentation control (2 or 4 spaces), configurable quote styles (single, double, or none for strings), and null value representation options. Supports block scalar styles for multiline strings and custom line width wrapping.",
  "whyItExists": "YAML is widely used for configuration files in DevOps (Kubernetes, Docker Compose, CI/CD pipelines) while JSON is common for data interchange. Offers seamless conversion in both directions to avoid format lock-in.",
  "whoShouldUse": "DevOps engineers, cloud infrastructure developers, CI/CD pipeline maintainers, and anyone working with configuration-as-code needing to switch between JSON and YAML formats.",
  "useCases": ["Convert JSON Docker Compose or Kubernetes manifests to YAML for deployment workflows",
    "Translate YAML CI/CD configuration files to JSON for programmatic processing or validation",
    "Migrate JSON configuration files to YAML for improved readability in infrastructure-as-code projects",
    "Transform JSON API responses into YAML for configuration-driven applications",
    "Convert YAML Ansible playbooks to JSON for integration with JSON-based tooling",
    "Standardize configuration files across a polyglot codebase with mixed JSON and YAML usage"],
  "instructions": ["Select the conversion direction (JSON to YAML or YAML to JSON) using the toggle at the top",
    "Paste your source data into the input editor; the tool auto-detects the format and validates syntax",
    "Configure output settings: indentation (2 or 4 spaces), string quote style (single/double/none), and null representation (null/~/null literal)",
    "For multiline strings, enable block scalar style to output literal blocks (|) instead of quoted strings",
    "Set the maximum line width for wrapping long string values; disable for no wrapping",
    "Click \"Convert\" and review the formatted output; copy or download the result; use \"Swap\" to reverse direction"],
  "examples": ["Input JSON: {\"name\":\"Alice\",\"age\":30,\"address\":{\"city\":\"NYC\"}} with indent=2 -> Output YAML:\\nname: Alice\\nage: 30\\naddress:\\n  city: NYC",
    "Input YAML: \"name: Bob\\npreferences:\\n  - color: red\\n  - color: blue\" -> Output JSON: {\"name\":\"Bob\",\"preferences\":[{\"color\":\"red\"},{\"color\":\"blue\"}]}"],
  "bestPractices": ["Use 2-space indentation for YAML output to align with Kubernetes and most DevOps YAML conventions",
    "Set null representation to \"null\" literal for explicit nulls rather than leaving keys absent",
    "Enable block scalar style when converting strings with embedded newlines to preserve formatting",
    "Always verify the output YAML with a linter after conversion to catch any syntax issues from edge cases",
    "Use \"none\" quote style for simple strings that don't contain special YAML characters like : or #"],
  "commonMistakes": ["Assuming all YAML is valid YAML 1.1; the tool uses YAML 1.2 which changes some boolean interpretations",
    "Using \"none\" quote style for strings containing colons or hash symbols, breaking the YAML structure",
    "Expecting comments in YAML to survive conversion; comments are dropped when converting to and from JSON",
    "Forgetting that YAML interprets \"yes\"/\"no\"/\"on\"/\"off\" as booleans; quote these strings explicitly",
    "Not checking for duplicate keys in YAML input, which YAML allows but JSON does not"],
  "faq": ["Does the conversion preserve the original data structure perfectly? Yes, the conversion is lossless for data; however, YAML comments and some formatting nuances are not preserved.",
    "Can it handle large multi-document YAML (with --- separators)? Yes, each document is processed independently.",
    "How does it handle YAML anchors and aliases? Anchors and aliases are resolved to their actual values; the reference structure is not preserved.",
    "What YAML version does this use? The tool follows the YAML 1.2 specification, which changes boolean parsing rules from YAML 1.1."]
},

"json-validator": {
  "whatItDoes": "Real-time JSON validation with syntax checking, structural analysis (key counts, depth, array sizes), and tree view for navigating complex documents. Includes path breadcrumb navigation, schema validation against JSON Schema drafts, and actionable suggestions for common errors.",
  "whyItExists": "JSON is everywhere but even minor syntax errors (missing commas, trailing commas, unquoted keys) cause parsing failures. Provides instant feedback and structured analysis to debug complex JSON documents efficiently.",
  "whoShouldUse": "All developers working with JSON - from beginners learning the format to experienced engineers debugging large API payloads or configuration files.",
  "useCases": ["Validate JSON configuration files before deploying to production environments",
    "Debug malformed JSON responses from third-party APIs during integration",
    "Analyze the structure of large JSON documents to understand their shape (depth, key counts, array sizes)",
    "Validate JSON payloads against a JSON Schema to ensure contract compliance",
    "Learn JSON syntax rules through real-time feedback on edits with contextual suggestions",
    "Inspect nested JSON data using the tree view and breadcrumb navigation for deep paths"],
  "instructions": ["Paste or type JSON into the editor; validation runs in real-time with error highlighting on the problematic line and column",
    "Review the structural analysis panel showing key count, maximum depth, array counts, and data size statistics",
    "Use the tree view to collapse/expand nested nodes; click any node to see its path in the breadcrumb trail",
    "Optionally paste a JSON Schema into the schema panel to validate the JSON against the schema",
    "Apply suggested fixes from the suggestions panel for common errors like trailing commas or unquoted keys",
    "Use the \"Format\" button to pretty-print the JSON after fixing errors; the tree view updates automatically"],
  "examples": ["Input: {\"name\": \"Alice\",\"age\": 30,} (trailing comma) -> Error: \"Unexpected token } at line 1, column 30. Suggestion: Remove trailing comma after \"age\": 30\"",
    "Input: {\"users\":[{\"id\":1},{\"id\":2}]} -> Analysis: Keys: id, users | Depth: 3 | Arrays: 1 (users: 2 items) | Valid: true"],
  "bestPractices": ["Paste and validate JSON before committing configuration files to version control",
    "Use the structural analysis panel to quickly assess the size and shape of unfamiliar JSON documents",
    "Enable schema validation when consuming third-party APIs to catch contract violations early",
    "Use the tree view for navigating deeply nested JSON (10+ levels) instead of scrolling through raw text",
    "Format and re-validate after fixing errors to ensure complete correctness before using the data"],
  "commonMistakes": ["Relying only on syntax validation without structural analysis when checking large generated JSON files",
    "Not using schema validation and then discovering field type mismatches in production",
    "Assuming the tree view shows edit capabilities; the tree view is for navigation only, not editing",
    "Ignoring warnings about duplicate keys which JSON technically allows but can cause data loss",
    "Using the tool to validate JSON with JavaScript-specific features like functions or undefined values"],
  "faq": ["Does it validate against JSON Schema drafts? Yes, it supports Draft-04, Draft-06, Draft-07, and 2020-12 schema versions.",
    "Can it handle very large JSON files (10MB+)? Yes, but performance may degrade; structural analysis is optimized for documents up to several MB.",
    "What types of errors does it catch? Syntax errors, duplicate keys, encoding issues, and schema violations including type mismatches and missing required fields.",
    "Does the breadcrumb path help with nested validation errors? Yes, clicking an error highlights the exact path in the tree view and shows the navigation breadcrumb."]
},

"jwt-decoder": {
  "whatItDoes": "Decodes JSON Web Tokens with color-coded sections (header/payload/signature) for visual parsing. Automatically decodes standard timestamp claims (exp, iat, nbf) into human-readable dates, supports signature verification with secret/private key, and provides an expiry countdown timer with token analysis suggestions.",
  "whyItExists": "JWTs are opaque strings that encode important security information; manually base64-decoding and inspecting each section is tedious and error-prone. Provides instant visual decoding, security analysis, and expiry monitoring in one interface.",
  "whoShouldUse": "Backend developers, security engineers, API developers, and anyone working with JWT-based authentication or authorization systems.",
  "useCases": ["Debug authentication issues by inspecting JWT payloads and signature validity",
    "Verify JWT expiry times and decode timestamps during token-based auth implementation",
    "Analyze JWT header algorithms and security characteristics for security audits",
    "Validate JWTs received from third-party SSO providers during integration",
    "Decode and inspect refresh tokens and access tokens during OAuth2/OIDC implementation",
    "Test JWT signature validity with shared secrets during development and testing"],
  "instructions": ["Paste your JWT string into the input field; the tool automatically splits and color-codes the three sections",
    "Review the header section (pink) showing algorithm type (HS256/RS256/etc) and token type (JWT)",
    "Inspect the payload section (blue) with all claims auto-decoded; timestamp claims (exp, iat, nbf) show both raw epoch and human-readable date",
    "Scroll to the signature section (green) showing the raw signature and signature verification options",
    "Enter the secret or public key in the verification field and click \"Verify\" to check signature validity; results show Valid or Invalid",
    "Monitor the expiry countdown timer that shows remaining seconds/minutes/hours until token expiration"],
  "examples": ["Input: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiZXhwIjoxNzA0MDYwODAwfQ.abc123signature -> Output: Header: {alg:HS256,typ:JWT} | Payload: {sub:1234567890,name:Alice,exp:2024-01-01T00:00:00Z} | Expiry: Expired 2 years ago",
    "Input: JWT with exp claim of 9999999999 -> Output: Payload shows exp:9999999999 (November 20, 2286) | Countdown: 262 years remaining"],
  "bestPractices": ["Always verify the signature when decoding JWTs from untrusted sources, not just the payload content",
    "Check the algorithm in the header; reject tokens using \"none\" algorithm unless explicitly intended",
    "Use the expiry countdown to monitor token lifetimes during auth flow testing and debugging",
    "Compare decoded claims against expected values from your auth provider documentation",
    "Never share decoded token contents or secrets when pasting in shared/screencast environments"],
  "commonMistakes": ["Trusting the payload content without verifying the signature - JWTs can be decoded by anyone",
    "Not checking the algorithm field and accepting tokens with \"none\" algorithm (security vulnerability)",
    "Assuming all timestamps are in seconds; some implementations use milliseconds which the tool flags",
    "Sharing decoded JWTs containing sensitive claims like email, user IDs, or roles in public forums",
    "Forgetting that a valid signature only proves integrity, not that the token has been authorized or is still valid"],
  "faq": ["Does it support JWE (encrypted) tokens? No, this tool handles JWS (signed) tokens only, not encrypted JWEs.",
    "Can it verify JWTs signed with RS256 or ES256? Yes, if you provide the corresponding public key for asymmetric algorithms.",
    "How does it handle custom claims? All custom claims are displayed as-is in the payload section with their raw values.",
    "Does it store or transmit the token anywhere? No, all decoding happens client-side in the browser; no data is sent to any server."]
},

"jwt-generator": {
  "whatItDoes": "Generates JSON Web Tokens with configurable algorithm selection (HS256, HS384, HS512, or none), a header/payload builder with standard claim auto-completion, an expiry date/time picker, and a secret input field. Displays a live token preview with color-coded sections before final generation.",
  "whyItExists": "Testing JWT-based authentication requires valid tokens with specific claims, expiry times, and algorithms. Eliminates manual token construction and base64 encoding, providing a visual builder for rapid prototyping and testing.",
  "whoShouldUse": "Backend and API developers testing JWT authentication flows, security engineers creating test tokens, and developers integrating with JWT-based services during development.",
  "useCases": ["Generate test JWTs with specific claims for unit testing authentication middleware",
    "Create JWTs with controlled expiry times for testing token refresh logic",
    "Build tokens with different algorithms (HS256/HS384/HS512) to test algorithm compatibility",
    "Generate JWTs with custom claims for integration testing of authorization systems",
    "Create tokens with \"none\" algorithm to test security validation in development environments",
    "Generate signed JWTs for load testing JWT-dependent services with controlled payloads"],
  "instructions": ["Select the signing algorithm from the dropdown (HS256, HS384, HS512, or none for unsigned tokens)",
    "Use the payload builder to add claims: select standard claims (iss, sub, aud, exp, nbf, iat, jti) or add custom key-value pairs",
    "Set the expiry time using the date/time picker; the tool automatically calculates the exp claim epoch value",
    "Enter a secret key in the secret input field; minimum length requirements vary by algorithm strength",
    "Review the live token preview showing the three color-coded sections as you build the payload",
    "Click \"Generate\" to finalize; copy the token or download it; use \"Regenerate\" to update with new settings"],
  "examples": ["Settings: alg=HS256, secret=mysecret, claims: {sub:\"123\",name:\"Alice\",exp:2025-01-01T00:00Z} -> Output: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWxpY2UiLCJleHAiOjE3Mzc2MDAwMDB9.signature",
    "Settings: alg=none, claims: {role:\"admin\"} -> Output: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJyb2xlIjoiYWRtaW4ifQ."],
  "bestPractices": ["Use strong secrets (32+ characters) for HS256 to prevent brute-force attacks on JWT signatures",
    "Set realistic expiry times matching your production token lifetime (usually 15-60 minutes for access tokens)",
    "Include only necessary claims to keep the token size small and avoid exposing sensitive data",
    "Use the \"none\" algorithm only for testing scenarios where signature validation is deliberately skipped",
    "Generate multiple tokens with different claims to thoroughly test authorization logic edge cases"],
  "commonMistakes": ["Using weak secrets like \"secret\" or \"password\" which are easily brute-forced to forge signatures",
    "Setting extremely long expiry times (years) which creates security tokens that never expire",
    "Including sensitive data (passwords, PII) in the payload which is base64-encoded, not encrypted",
    "Using HS256 with secrets that don't meet minimum length requirements, weakening the signature",
    "Forgetting that unsigned tokens (alg:none) should never be accepted in production environments"],
  "faq": ["Can I generate tokens with asymmetric algorithms (RS256/ES256)? This tool supports symmetric HMAC algorithms (HS256/384/512); for asymmetric keys, use a dedicated JWT library.",
    "How is the expiry time calculated? The exp claim is set as the Unix epoch timestamp of the selected date/time in UTC.",
    "Does the tool store the generated token or secret? No, all generation happens client-side; nothing is persisted or transmitted.",
    "Can I generate multiple tokens at once? The tool generates one token per configuration; use the \"Regenerate\" button after changing claims or settings."]
},

"lorem-ipsum": {
  "whatItDoes": "Generates lorem ipsum placeholder text with customizable output options including paragraphs, sentences, words, or bytes with precise counts. Offers starting text variants (classic, modern, Cicero), paragraph length styles, and output formats including rich HTML, Markdown, and code-sample wrapping.",
  "whyItExists": "Designers and developers need realistic placeholder text for layouts, typography testing, and content mockups. Provides flexible generation options beyond simple paragraph count for diverse design and development scenarios.",
  "whoShouldUse": "Web designers, UI/UX developers, graphic designers, and frontend developers who need placeholder text for wireframes, mockups, and layout testing.",
  "useCases": ["Generate placeholder paragraphs for wireframes and website mockups during client presentations",
    "Create multi-page dummy content for testing pagination and content layout components",
    "Produce exact word-count text for testing text truncation and overflow CSS properties",
    "Generate formatted placeholder content with headings, lists, and code blocks for rich layout testing",
    "Create code-sample wrapped lorem ipsum for documentation template testing",
    "Generate consistent placeholder text across team members using seed-based generation"],
  "instructions": ["Select the output unit type: paragraphs (for blocks), sentences (for inline), words (for exact count), or bytes (for size-specific testing)",
    "Use the count slider to set quantity (1-100 for paragraphs/sentences, 1-1000 for words)",
    "Choose a starting text variant: Classic (traditional lorem ipsum), Modern (common variant), or Cicero (original Latin passage)",
    "Set paragraph style: Short (1-2 sentences), Medium (3-5 sentences), or Long (5-8 sentences) for varied rhythm",
    "Select output format: Plain Text for general use, HTML with <p> tags, or Markdown with formatting",
    "Toggle rich formatting options: bold first word, italic middle section, or add code sample blocks interspersed"],
  "examples": ["Settings: 2 paragraphs, Classic, Medium style, Plain text -> Output: \"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\\n\\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\"",
    "Settings: 1 paragraph, HTML format, with code sample -> Output: \"<p>Lorem ipsum dolor sit amet...</p><pre><code>const lorem = generator.generate()</code></pre>\""],
  "bestPractices": ["Use paragraph count for block layouts and page sections; use word count for testing text overflow and character limits",
    "Select the Cicero variant for the most authentic Latin placeholder text matching historical origins",
    "Enable rich formatting only when testing styled typography; use plain text for structural layout testing",
    "Use shorter paragraph styles (Short/Medium) for UI components like cards and sidebars",
    "Generate in Markdown format when developing documentation sites to preview rendered placeholder content"],
  "commonMistakes": ["Using too many paragraphs (50+) when a few representative samples would suffice for layout testing",
    "Expecting meaningful or translated text; lorem ipsum is intentionally nonsensical Latin-derived placeholder text",
    "Not specifying the count unit and accidentally generating 100 sentences instead of 100 paragraphs",
    "Using the tool for production content; lorem ipsum should always be replaced with real copy before launch",
    "Selecting code sample format when plain text is sufficient, over-complicating the output unnecessarily"],
  "faq": ["Is the text actual Latin? It's a scrambled, nonsensical derivation of a passage by Cicero; it looks like Latin but isn't grammatically correct.",
    "Can I generate the same text consistently? Yes, use the seed option with the same settings to reproduce identical output for team consistency.",
    "What's the difference between paragraph styles? Short has 1-2 sentences, Medium has 3-5, and Long has 5-8 sentences per paragraph.",
    "Does the HTML format include any styling? No, it outputs semantic HTML tags (<p>, <h2>, <pre><code>) without inline styles or CSS classes."]
},

"markdown-editor": {
  "whatItDoes": "A full-featured Markdown editor with split-pane live preview showing rendered output alongside the source. Includes a formatting toolbar (bold, italic, heading, link, image, code, table), three visual themes, auto-save to localStorage, real-time word/character count, line numbers, a table helper for grid creation, and fullscreen mode.",
  "whyItExists": "Writing Markdown with live preview is essential for content creation, documentation, and note-taking. Combines the power of raw Markdown authoring with instant visual feedback and formatting assistance for productive writing workflows.",
  "whoShouldUse": "Technical writers, documentation maintainers, developers writing README files, bloggers using Markdown, and anyone who regularly edits Markdown-formatted content.",
  "useCases": ["Write and preview GitHub README files and project documentation with real-time rendering",
    "Create and format blog posts with Markdown using the toolbar for quick formatting insertion",
    "Take formatted notes with live preview during meetings or research sessions",
    "Build and edit documentation sites with consistent Markdown formatting and table structures",
    "Draft and preview Markdown emails or newsletters with formatting and link insertion",
    "Collaborate on Markdown content by sharing the auto-saved content across sessions"],
  "instructions": ["Type or paste Markdown into the left editor pane; the right pane shows a live rendered preview that updates on each keystroke",
    "Use the toolbar buttons for common formatting: Bold (Ctrl+B), Italic (Ctrl+I), Headings (H1-H6), Links, Images, Code blocks, and Tables",
    "Create tables with the Table Helper button: specify rows/columns; the tool generates the Markdown table syntax",
    "Switch themes via the theme selector (Light, Dark, or Sepia) to match your visual preference",
    "Monitor the word and character count in the status bar; use fullscreen mode for distraction-free writing",
    "Content auto-saves to browser localStorage; restore on return or use the export button to download as .md file"],
  "examples": ["Input toolbar action: Click Bold button -> Inserts: \"**bold text**\" with cursor between the asterisks",
    "Input: \"| Col1 | Col2 |\\n|------|------|\\n| A | B |\" -> Preview: Renders a Markdown table with two columns and one row"],
  "bestPractices": ["Use keyboard shortcuts (Ctrl+B/I for bold/italic) to stay in flow without reaching for the toolbar",
    "Save important content externally; auto-save uses localStorage which can be cleared",
    "Use the table helper for complex tables rather than writing Markdown grid syntax manually",
    "Switch to fullscreen mode when doing focused long-form writing to reduce distractions",
    "Preview images and links by inserting them and verifying the rendered output in the preview pane"],
  "commonMistakes": ["Relying solely on the toolbar when keyboard shortcuts would be faster for frequent formatting",
    "Forgetting that auto-save is browser-specific; clearing browser data will lose unsaved work",
    "Using broken image or link syntax and not checking the red indicator in the preview pane",
    "Applying heading formatting (multiple #) without a space after the #, which doesn't render as a heading",
    "Not using the table helper and making manual table syntax errors with misaligned columns"],
  "faq": ["Does it support GitHub Flavored Markdown (GFM)? Yes, including task lists, tables, strikethrough, and emoji shortcodes.",
    "Is there an undo/redo feature? Yes, Ctrl+Z and Ctrl+Y are supported for unlimited undo/redo in the editor.",
    "Can I drag-and-drop images? Yes, images can be dragged from your file system to insert the image reference Markdown.",
    "Is the preview scroll-synced with the editor? Yes, scrolling one pane will attempt to keep the other synced to the same relative position."]
},

"markdown-preview": {
  "whatItDoes": "Real-time Markdown preview with a split-pane view for source and rendered content, supporting GitHub Flavored Markdown (tables, task lists, fenced code blocks, emoji shortcodes). Offers three visual themes, an HTML source toggle, inline formatting toolbar, word/character count, auto-save, and drag-and-drop image insertion.",
  "whyItExists": "Developers and writers need to verify Markdown rendering before publishing to platforms like GitHub, GitLab, or documentation sites. Provides accurate GFM preview with formatting tools to ensure correct rendering without switching contexts.",
  "whoShouldUse": "GitHub users, documentation authors, technical writers, and anyone who writes Markdown for platforms that use GFM-style rendering.",
  "useCases": ["Preview GitHub README.md files before committing to ensure correct rendering of GFM features",
    "Edit and preview documentation with task lists, tables, and fenced code blocks for accuracy",
    "Verify Markdown blog posts render correctly across different platforms and themes",
    "Review emoji shortcodes and their rendered output in GFM context",
    "Collaboratively review Markdown content using the live preview during pair documentation sessions",
    "Test Markdown formatting edge cases like nested lists, code blocks within lists, and complex tables"],
  "instructions": ["Enter or paste Markdown in the left editor pane; the right pane renders the HTML preview in real-time",
    "Use the toolbar for formatting assistance: bold, italic, headings, links, images, code blocks, and lists",
    "Toggle the HTML source view to see the generated HTML code alongside the rendered preview",
    "Select a theme (Light, Dark, or GitHub-like) to preview how content will look on different platforms",
    "Drag and drop image files from your file system into the editor to insert image Markdown references",
    "Monitor auto-save indicator in the status bar; use the export button to download the Markdown or HTML output"],
  "examples": ["Input: \"- [x] Completed task\\n- [ ] Pending task\" -> Preview: Renders a task list with checked and unchecked items",
    "Input: \":sparkles: Hello World :rocket:\" -> Preview: Renders sparkles and rocket emoji icons"],
  "bestPractices": ["Use the GitHub theme for the most accurate preview of how content will render on GitHub.com",
    "Toggle HTML view periodically to verify complex formatting like nested tables are structurally correct",
    "Use task list formatting (- [ ] / - [x]) for documentation checklists and project planning",
    "Test emoji rendering with common shortcodes before publishing to ensure cross-platform compatibility",
    "Use the auto-save feature for long documents and periodically export a backup copy"],
  "commonMistakes": ["Assuming all Markdown renderers support the same features; GFM features may not work on all platforms",
    "Using too many heading levels (H1-H6) in a single document, which hurts readability and navigation",
    "Creating task lists without proper spacing (must have space after - and brackets), causing rendering failure",
    "Forgetting that emoji rendering varies by platform; GitHub supports shortcodes, other platforms may not",
    "Nesting code blocks inside list items without proper indentation, causing broken rendering"],
  "faq": ["Does it render LaTeX math expressions? Not natively, but code blocks can be used for LaTeX source.",
    "Can I preview in mobile viewport? A responsive preview toggle is available to simulate mobile rendering.",
    "How does drag-drop image insertion work? Dropped images are converted to Markdown image syntax with a relative path placeholder.",
    "Does the auto-save persist across browser sessions? Yes, content is saved to localStorage and restored on return."]
},

"markdown-to-html": {
  "whatItDoes": "Converts Markdown documents to clean HTML with GitHub Flavored Markdown support for tables, task lists, fenced code blocks, and emoji. Offers HTML sanitization toggle, pretty-print (formatted) or minified output, a split-pane preview for before/after comparison, and word/character count.",
  "whyItExists": "Markdown is the preferred authoring format but HTML is required for web publishing. Simplifies the conversion process with customizable output formatting, ensuring correct rendering without manual HTML tagging.",
  "whoShouldUse": "Web developers, content publishers, static site generator users, and anyone who authors in Markdown and publishes to the web.",
  "useCases": ["Convert Markdown documentation to HTML for static site generators like Jekyll, Hugo, or Gatsby",
    "Transform GitHub README files into styled HTML for embedded documentation pages",
    "Generate HTML email content from Markdown drafts with proper formatting and sanitization",
    "Convert Markdown blog posts to HTML fragments for CMS content management systems",
    "Create sanitized HTML from user-submitted Markdown for comment systems or forums",
    "Generate clean HTML pages from Markdown meeting notes or documentation for intranet publishing"],
  "instructions": ["Paste or type Markdown into the left input pane; the converted HTML appears in the right output pane",
    "Toggle GFM features on/off to control whether GitHub-specific syntax (task lists, tables, emoji) is processed",
    "Enable HTML sanitization to strip dangerous tags (script, onclick, etc.) for secure output in user-facing contexts",
    "Select output formatting: Pretty-print (indented, readable HTML) or Minified (single line, smaller size)",
    "Use the word/character count to track document size; switch to split-pane view for side-by-side comparison",
    "Copy the HTML output to clipboard or download as .html file; the preview pane shows rendered HTML appearance"],
  "examples": ["Input Markdown: \"# Title\\n\\nHello **world**\\n\\n- Item 1\\n- Item 2\" -> Output HTML: \"<h1>Title</h1>\\n<p>Hello <strong>world</strong></p>\\n<ul>\\n<li>Item 1</li>\\n<li>Item 2</li>\\n</ul>\"",
    "Input with task list: \"- [x] Done\\n- [ ] Todo\" with GFM on -> Output: \"<ul class=\\\"contains-task-list\\\">\\n<li class=\\\"task-list-item\\\"><input type=\\\"checkbox\\\" checked disabled> Done</li>\\n<li class=\\\"task-list-item\\\"><input type=\\\"checkbox\\\" disabled> Todo</li>\\n</ul>\""],
  "bestPractices": ["Always enable sanitization when converting user-submitted Markdown for display on public websites",
    "Use pretty-print output during development for readability; use minified for production to reduce page weight",
    "Preview the rendered HTML using the built-in preview pane to verify complex elements like tables render correctly",
    "Enable GFM features for GitHub/GitLab content; disable for generic Markdown that targets multiple platforms",
    "Check the HTML output for any broken elements after conversion, especially nested lists and code blocks"],
  "commonMistakes": ["Assuming sanitization removes all XSS vectors; always test sanitized output with known attack patterns",
    "Using pretty-print in production, unnecessarily increasing HTML file size when minified would suffice",
    "Forgetting to enable GFM mode and wondering why task lists and tables didn't convert",
    "Not verifying converted HTML in the preview pane before publishing, missing rendering issues",
    "Relying on the tool for complex documents without checking edge cases like HTML entities and special characters"],
  "faq": ["Can it convert Markdown to HTML with inline styles? No, the output is semantic HTML without inline styling; use CSS for styling.",
    "Does it support custom Markdown extensions? It supports GFM extensions; custom or uncommon extensions may not be recognized.",
    "What HTML tags are stripped when sanitization is enabled? Dangerous tags like script, iframe, object, embed, and event handlers are removed.",
    "Can I customize the HTML wrapper/doctype? The output is an HTML fragment; wrap it manually for a full HTML page structure."]
},

"morse-code": {
  "whatItDoes": "Bidirectional Morse code converter supporting alphanumeric characters and prosigns. Features audio playback using the Web Audio API with adjustable WPM (words per minute) speed and frequency slider for tone pitch. Includes a timing diagram visualization, prosign reference table, and standardized Morse code reference chart.",
  "whyItExists": "Morse code remains relevant in amateur radio, aviation, and emergency signaling. Combines learning, practice, and translation tools in one interface to support both beginners learning the code and experienced operators who need quick conversion or audio testing.",
  "whoShouldUse": "Amateur radio (ham) operators, aviation enthusiasts, survivalists, students learning Morse code, and hobbyists working with signaling systems.",
  "useCases": ["Convert text messages to Morse code for amateur radio transmission practice",
    "Decode Morse code audio sequences or visual signals into readable text",
    "Practice Morse code listening skills with adjustable speed and frequency for progressive learning",
    "Generate Morse code audio for radio transmission or signaling device testing",
    "Learn prosigns (procedural signals) used in amateur radio communication",
    "Study Morse code timing and rhythm using the timing diagram visualization"],
  "instructions": ["Select the conversion direction: Text to Morse (encode) or Morse to Text (decode)",
    "Type or paste text in the input field for encoding, or tap dots/dashes using the on-screen keyer for decoding",
    "Adjust the WPM slider to control playback speed (5-40 WPM typical range for learning)",
    "Adjust the frequency slider to change the tone pitch (400-1000 Hz) for audio clarity preference",
    "Click the Play button to hear the Morse code audio; the timing diagram animates in sync with playback",
    "Use the reference table to look up any character's Morse pattern; study prosigns using the dedicated prosign section"],
  "examples": ["Input Text: \"SOS\" -> Output Morse: \"... --- ...\" -> Audio: Three short beeps, three long beeps, three short beeps",
    "Input Morse: \"-.-- . ... / .- -. -.. / -.-- . ...\" (with / separating words) -> Output Text: \"YES AND YES\""],
  "bestPractices": ["Start with low WPM (5-10) when learning; gradually increase speed as you recognize patterns without conscious decoding",
    "Use the timing diagram to visualize the Farnsworth spacing method for slower effective transmission speed",
    "Learn prosigns (like BT, AR, SK) as they're commonly used in amateur radio and reduce transmission time",
    "Practice with random words and callsigns using the generator to build real-world operating skills",
    "Use headphones with the audio playback for clearer tone discrimination, especially at lower frequencies"],
  "commonMistakes": ["Using inconsistent spacing between letters (3 dots) and words (7 dots), causing decoding confusion",
    "Confusing similar patterns like ... (S) and --- (O) when decoding at higher speeds",
    "Not including word separators (/) when encoding multi-word text, producing a continuous stream",
    "Setting the frequency too low (< 400 Hz) or too high (> 1000 Hz) where hearing discrimination is harder",
    "Assuming prosigns are standard Morse characters; they're procedural signals with specific meanings in context"],
  "faq": ["What is the Farnsworth timing method? It adds extra spacing between characters while keeping character speed high, making it easier for learners to distinguish individual letters.",
    "Does it support all international Morse characters? Yes, including A-Z, 0-9, common punctuation, and procedural prosigns.",
    "Can I save the audio output? Audio is generated in real-time via Web Audio API; you can record using browser tools or external software.",
    "What are prosigns? They're procedural signals like BT (-...-) for break, AR (.-.-.) for end of message, used in amateur radio communication."]
},

"number-to-words": {
  "whatItDoes": "Converts numeric values to their word representation using Intl.NumberFormat and Indian numbering systems (lakh/crore). Supports currency mode for 5 major currencies (USD, EUR, GBP, INR, JPY) plus custom currencies, ordinal numbers, Roman numerals, scientific notation display, BigInt for large numbers, and a numeric breakdown showing place values.",
  "whyItExists": "Financial applications, legal documents, and educational tools often need numbers expressed as words. Handles the complexity of different numbering systems (Western vs Indian), currency formatting, and large number representation that developers shouldn't implement from scratch.",
  "whoShouldUse": "Financial software developers, accounting application engineers, educational content creators, invoice/check generation systems developers, and localization engineers.",
  "useCases": ["Generate written amounts for checks and invoices in financial applications",
    "Convert financial figures to words in legal and contract documents",
    "Display large numbers in accessible format for educational math applications",
    "Format currency amounts in words across different currency types for international payments",
    "Convert numbers to Roman numerals for historical dating, chapter numbering, or event naming",
    "Display number breakdown with place values (hundreds, thousands, lakhs) for educational math tools"],
  "instructions": ["Enter a numeric value in the input field (supports integers, decimals, and negative numbers)",
    "Select the numbering system: Western (thousands/millions) or Indian (lakhs/crores) for appropriate word output",
    "Enable Currency mode and select a currency (USD, EUR, GBP, INR, JPY) or define a custom currency symbol/name",
    "Toggle Ordinal mode to convert numbers to ordinal words (first, second, third) instead of cardinal",
    "Enable Roman numerals for conversion to Roman numeral format (I, V, X, L, C, D, M) up to 3999",
    "Use scientific notation toggle to see the number in exponential format; the breakdown panel shows place values"],
  "examples": ["Input: 1234567, Western system -> Output: \"One Million Two Hundred Thirty-Four Thousand Five Hundred Sixty-Seven\"",
    "Input: 1234567, Indian system, INR currency -> Output: \"Twelve Lakh Thirty-Four Thousand Five Hundred Sixty-Seven Rupees\" or with currency: \"₹ Twelve Lakh Thirty-Four Thousand Five Hundred Sixty-Seven Only\""],
  "bestPractices": ["Use Indian numbering system for applications targeting Indian users and financial systems",
    "Enable currency mode for any financial document generation to get proper currency name placement",
    "Test with edge cases like zero, negative numbers, and very large numbers (BigInt) to ensure correct output",
    "Use the numeric breakdown panel to verify the number is being interpreted correctly before generating words",
    "For Roman numerals, remember the limit is 3999; larger numbers use an overline notation that may not be supported"],
  "commonMistakes": ["Using Western numbering for Indian financial contexts where lakh/crore is legally required",
    "Assuming ordinal conversion works for all numbers; some numbers have irregular ordinal forms (first, not oneth)",
    "Forgetting that decimal values need special handling in currency mode (e.g., \"One Hundred Twenty-Three Dollars and Forty-Five Cents\")",
    "Not testing with zero (\"Zero\") and negative numbers (\"Negative Forty-Two\") which have specific word forms",
    "Using the tool for programming identifiers which should use numeric values, not word representations"],
  "faq": ["What is the maximum number supported? BigInt support handles numbers up to 10^308 and beyond; practical limits depend on the number of words generated.",
    "How are decimals handled in currency mode? Decimals are shown as fractional currency units (e.g., \"Forty-Five Cents\" for USD, \"Seventy-Five Paise\" for INR).",
    "Does it support all Indian numbering units? Yes, including lakh (10^5), crore (10^7), arab (10^9), kharab (10^11), and higher.",
    "Can it convert negative numbers? Yes, negative numbers are prefixed with \"Negative\" in the word output."]
},

"password-generator": {
  "whatItDoes": "Generates secure passwords with configurable length, character sets, and exclusion rules. Features ambiguous character exclusion (e.g., 1/l/I, 0/O), pronounceable password mode for memorable passwords, PIN mode for numeric-only codes, a 5-level strength meter, batch generation (1-50), generation history with copy, entropy display, and custom character set support.",
  "whyItExists": "Weak passwords are the leading cause of account compromises; generating strong, unique passwords is essential for security. Provides a flexible generator that balances security requirements with usability for different contexts (PINs, memorable passwords, maximum-strength keys).",
  "whoShouldUse": "Security-conscious users, system administrators managing user credentials, developers generating test passwords, and anyone needing strong, unique passwords for multiple accounts.",
  "useCases": ["Generate strong, unique passwords for personal online accounts with custom complexity requirements",
    "Create batch passwords for team or organizational account provisioning (1-50 at once)",
    "Generate pronounceable passwords for temporary access credentials that users can remember",
    "Create PIN codes (4-8 digit numeric) for physical access systems or application lock screens",
    "Exclude ambiguous characters when passwords will be handwritten or read aloud over the phone",
    "Generate passwords with specific composition requirements for enterprise compliance policies"],
  "instructions": ["Set the password length using the slider (8-128 characters; 16+ recommended for strong passwords)",
    "Configure character sets: toggle uppercase, lowercase, digits, and special characters on/off as needed",
    "Enable ambiguous character exclusion to remove similar-looking characters (1/l/I, 0/O, etc.)",
    "Select password generation mode: Random (maximum entropy), Pronounceable (memorable syllables), or PIN (digits only)",
    "Use the strength meter to gauge password quality (Weak through Very Strong across 5 levels); monitor entropy bits displayed",
    "Click \"Generate\" to create password(s); use the batch count selector (1-50) for multiple passwords; review history with timestamps"],
  "examples": ["Settings: Length=16, all char sets, no exclusions -> Output: \"k9#M2pQ$vL8@nX5\" | Strength: Very Strong | Entropy: ~95 bits",
    "Settings: Pronounceable mode, Length=12, lowercase only -> Output: \"trobamvongre\" | Strength: Weak | Entropy: ~56 bits"],
  "bestPractices": ["Use at least 16 characters with all character sets for a password strength of Very Strong (80+ bits of entropy)",
    "Enable ambiguous character exclusion for passwords that will be communicated verbally or written down",
    "Use pronounceable mode only for temporary passwords that users must type manually, not for permanent credentials",
    "Use the batch generator to create unique passwords for all accounts during an onboarding process",
    "Check the entropy display; 60+ bits is adequate for most purposes, 80+ for sensitive accounts"],
  "commonMistakes": ["Using pronounceable mode for permanent passwords; they have significantly lower entropy than random passwords",
    "Disabling all special characters and then wondering why the strength meter shows Weak",
    "Generating passwords shorter than 12 characters for any important account or service",
    "Reusing the same generated password across multiple accounts instead of generating unique ones",
    "Not excluding ambiguous characters when passwords will be read over the phone or printed"],
  "faq": ["What does the entropy value mean? Entropy (in bits) measures unpredictability; each bit doubles the number of guesses needed. 80 bits is considered secure against brute-force attacks.",
    "Is pronounceable mode really secure? Pronounceable passwords have lower entropy per character but are more memorable. Use them only for temporary or low-security contexts.",
    "Can I exclude specific characters beyond ambiguous ones? Yes, use the custom exclusion field to specify any characters to omit from generation.",
    "Where is the password history stored? History is stored in browser localStorage and can be cleared from the settings panel."]
},

"placeholder-image": {
  "whatItDoes": "Generates placeholder images in multiple formats (SVG, PNG, JPEG, WebP) with customizable dimensions, colors, and text overlay. Features gradient backgrounds, noise texture overlays, preset configuration themes (e.g., Bootstrap, Material, plain), border radius control, and a batch strip mode for generating multiple images at once.",
  "whyItExists": "Design mockups and development prototypes need placeholder images to test layouts before final assets are ready. Eliminates reliance on external placeholder services and provides format flexibility for different testing scenarios.",
  "whoShouldUse": "Web designers, frontend developers, UI/UX designers, and anyone creating wireframes or prototypes that require image placeholders.",
  "useCases": ["Generate placeholder images for website mockups and wireframes during client presentations",
    "Create test images in specific formats (WebP, JPEG) for performance and format testing",
    "Generate gradient placeholder backgrounds for hero sections and banners in design prototypes",
    "Create batch placeholder images for gallery layouts, product grids, and card component testing",
    "Generate images with specific aspect ratios and text labels for responsive design testing",
    "Create styled placeholder images that match design system presets (Material, Bootstrap) for consistent mockups"],
  "instructions": ["Set the image dimensions using width and height fields; maintain aspect ratio with the lock toggle",
    "Select the output format: SVG (scalable, smallest size), PNG (raster, lossless), JPEG (raster, smaller), or WebP (modern format)",
    "Choose a background type: Solid color (pick from palette or custom hex), Gradient (linear/radial with 2 colors), or Noise texture",
    "Configure text overlay: enter text, adjust font size, and pick text color; position with alignment options",
    "Set border radius for rounded corners (0-50px); apply via CSS for SVG or raster rendering for bitmap formats",
    "Use batch strip mode (enable toggle) to generate a horizontal strip of multiple images with sequential labels"],
  "examples": ["Settings: 800x600, PNG, Solid blue (#3B82F6), white text \"Hero Image\" -> Output: 800x600 PNG placeholder with blue background and centered white text",
    "Settings: Batch strip mode, 4 images 200x200 each, SVG, alternating colors -> Output: 800x200 SVG strip with 4 colored squares labeled Image 1-4"],
  "bestPractices": ["Use SVG format for development mockups since it's resolution-independent and has the smallest file size",
    "Use PNG or JPEG format when testing image loading performance with realistic file sizes",
    "Match placeholder colors to your design system palette for more realistic client-facing mockups",
    "Use the gradient option for hero sections and banners to create more visually appealing prototypes",
    "Use batch strip mode for testing horizontal scrolling components, carousels, and image gallery layouts"],
  "commonMistakes": ["Using raster formats (PNG/JPEG) when SVG would be sufficient, unnecessarily increasing page weight in mockups",
    "Not specifying text overlay and getting blank colored rectangles that lack context in design reviews",
    "Using the tool for production images instead of real assets, which should be replaced before launch",
    "Setting dimensions too large for raster formats (4000+ pixels) causing slow generation or browser issues",
    "Forgetting to set border radius in CSS when using SVG output; radius only applies to raster formats directly"],
  "faq": ["Can I use the generated images in production? The images are for development/design purposes; replace with real images before production deployment.",
    "What's the maximum resolution supported? SVG has no resolution limit; PNG/JPEG/WebP are capped at 8192x8192 pixels.",
    "Are the images generated client-side or server-side? All generation happens in-browser using Canvas API for raster and markup for SVG; no server calls.",
    "Can I customize the gradient direction? Yes, you can choose between linear (top-to-bottom, left-to-right, diagonal) and radial gradient types."]
},

"prompt-generator": {
  "whatItDoes": "Generates structured AI prompts across 6 categories (Creative, Technical, Business, Educational, Personal, Analytical) with pre-built use case templates and dynamic context inputs. Offers tone and format selection (concise, detailed, step-by-step, bulleted) and maintains generation history with favorites/bookmarking for frequently used prompt templates.",
  "whyItExists": "Crafting effective AI prompts requires specific structures and context that many users struggle with. Provides templated, category-specific prompts with customizable parameters to help users get better results from AI systems without learning prompt engineering.",
  "whoShouldUse": "AI tool users, content creators, students, business professionals, and anyone who regularly interacts with AI assistants and wants more consistent, effective prompts.",
  "useCases": ["Generate creative writing prompts for storytelling, poetry, or content creation with specific parameters",
    "Create technical prompts for code generation, debugging, or architecture discussions with context injection",
    "Build business prompts for strategy analysis, market research, or report generation with industry context",
    "Generate educational prompts for tutoring, lesson planning, or explanation requests at different levels",
    "Create analytical prompts for data interpretation, pros/cons analysis, or decision frameworks",
    "Reuse favorite prompt templates for recurring tasks like weekly reports, standup notes, or code reviews"],
  "instructions": ["Select a category from the 6 available options (Creative, Technical, Business, Educational, Personal, Analytical)",
    "Choose a use case template within the category (e.g., under Technical: Code Review, Debug Help, Architecture Design)",
    "Fill in the context input fields specific to the use case (e.g., programming language, project description, error details)",
    "Select tone (Professional, Casual, Academic) and output format (Concise, Detailed, Step-by-Step, Bulleted)",
    "Click \"Generate\" to create the structured prompt; review and make manual edits if needed",
    "Save effective prompts to Favorites using the bookmark icon; access history via the History tab for regeneration"],
  "examples": ["Category: Technical, Use Case: Code Review, Context: Python, Flask app, auth bug -> Output: \"You are a senior Python developer. Review this Flask authentication code for security vulnerabilities...\"",
    "Category: Business, Use Case: Market Analysis, Context: SaaS product, B2B, midwest US -> Output: \"Conduct a market analysis for a B2B SaaS product targeting midwest US businesses...\""],
  "bestPractices": ["Fill in as many context fields as possible; more specific context produces more tailored and useful prompts",
    "Save prompts that consistently produce good results to Favorites for reuse without re-entering context",
    "Experiment with different tones for the same category to see how the AI response varies",
    "Use the Step-by-Step format for technical and troubleshooting prompts to get structured responses",
    "Review and manually customize generated prompts before using them; the AI output is a starting point, not final"],
  "commonMistakes": ["Using vague or minimal context and getting generic prompts that don't produce useful results",
    "Selecting a category that doesn't match the actual task, leading to irrelevant prompt structure",
    "Not reviewing generated prompts before use; the tool creates templates that may need refinement",
    "Saving too many favorites without organization, making it hard to find the right template later",
    "Relying solely on generated prompts without learning prompt engineering principles to improve over time"],
  "faq": ["Can I create custom categories or use cases? Pre-defined categories and use cases are provided; custom structures can be built by starting from a similar template.",
    "Are the prompts saved locally or in the cloud? History and favorites are stored in browser localStorage; clearing browser data will erase them.",
    "How many context fields can I fill in? Each use case has 3-5 context fields; you can also add custom context in the free-form text area.",
    "Does the tool support non-English prompts? Yes, enter context in any language; the generated prompt will match the input language."]
},

"prompt-improver": {
  "whatItDoes": "Analyzes and improves AI prompts across 8 improvement dimensions (clarity, specificity, context, structure, goal orientation, constraints, persona, formatting). Provides a side-by-side diff view comparing original and improved prompts with explanation panels for each change. Features tone adjustment and maintains an improvement history.",
  "whyItExists": "Poorly written prompts lead to vague, irrelevant, or incorrect AI responses. Helps users identify weaknesses in their prompts and learn prompt engineering by showing concrete before/after improvements with explanations.",
  "whoShouldUse": "AI users who want better results from their prompts, prompt engineering learners, teams standardizing AI interaction quality, and content creators optimizing AI output.",
  "useCases": ["Improve vague or unclear prompts to get more specific and actionable responses from AI assistants",
    "Learn prompt engineering techniques by reviewing before/after comparisons and explanation panels",
    "Standardize team AI prompts by improving clarity, structure, and goal orientation for consistent results",
    "Optimize prompts for specific AI models by adjusting tone, persona, and format dimensions",
    "Refine code-generation prompts with better constraints and specificity for more accurate code output",
    "Create a personal library of improved prompt patterns through the history feature for future reference"],
  "instructions": ["Paste your existing prompt into the input editor; the tool automatically analyzes it across 8 dimensions",
    "Review the dimension scores (1-10) displayed as bars for clarity, specificity, context, structure, goal orientation, constraints, persona, and formatting",
    "Use the tone adjustment slider to target a specific tone (Professional, Casual, Academic, Friendly) for the improved prompt",
    "Click \"Improve\" to generate the enhanced version; the side-by-side diff view highlights changes with color coding",
    "Click any highlighted change to see an explanation panel describing why the improvement was made and what it achieves",
    "Save improved prompts to history; revisit past improvements to track your prompt engineering progress"],
  "examples": ["Original: \"Write about AI\" -> Improved: \"Write a comprehensive overview of artificial intelligence covering key concepts like machine learning, neural networks, and natural language processing. Target audience: general readers. Format: informative article with clear section headings.\"",
    "Original: \"Fix my code\" -> Improved: \"Review the following [language] code and identify bugs, performance issues, and style improvements. Provide corrected code snippets with explanations for each change. Code: [paste code here]\""],
  "bestPractices": ["Use the dimension scores to identify the weakest aspects of your prompt and focus on those areas",
    "Read the explanation panels for each change to learn why certain phrasing yields better AI responses",
    "Experiment with different tones to see how the same base prompt can be adapted for different audiences",
    "Use the improvement history to track which patterns consistently produce better results across different prompts",
    "Apply the improved prompt directly, but customize the context since the tool adds generic placeholders"],
  "commonMistakes": ["Expecting the tool to fix fundamentally flawed or contradictory prompts rather than just improving structure",
    "Not reviewing the improved prompt and applying it blindly; the tool provides suggestions, not perfect solutions",
    "Focusing only on the final improved prompt without learning from the side-by-side diff explanations",
    "Over-formatting prompts with excessive structure that makes them rigid and unnatural",
    "Using the same improvement pattern for every prompt instead of adapting based on the specific use case"],
  "faq": ["How does the tool calculate dimension scores? Scores are based on linguistic analysis of your prompt's word choice, structure, specificity markers, and goal clarity.",
    "Can I improve prompts for specific AI models? The tool optimizes for general AI prompt effectiveness; some models may benefit from additional model-specific tuning.",
    "Is the original prompt stored anywhere? Improvement history is stored in localStorage; original and improved versions are saved for comparison.",
    "How does tone adjustment work? The tool rewrites the prompt using vocabulary, sentence structure, and formality level appropriate for the selected tone."]
},

"qr-generator": {
  "whatItDoes": "Generates QR codes for 8 content types (URL, email, phone, SMS, WiFi, vCard, location, plain text) with 4 error correction levels (L/M/Q/H) for damage tolerance. Features logo overlay placement, custom color pickers for foreground/background, cell size and margin configuration, multiple output formats (SVG, PNG, JPEG), batch history with export, and copy-image functionality.",
  "whyItExists": "QR codes are ubiquitous for contactless sharing, marketing, and authentication. Provides a comprehensive generator supporting various data types with design customization that goes beyond basic black-and-white QR codes.",
  "whoShouldUse": "Marketing professionals, event organizers, business owners, software developers integrating QR functionality, and anyone needing custom-styled QR codes for sharing information.",
  "useCases": ["Generate QR codes for URLs to drive traffic to websites, landing pages, or app store links",
    "Create WiFi credential QR codes for guest network access in offices, cafes, and hotels",
    "Generate vCard QR codes for digital business cards at networking events and conferences",
    "Create location QR codes with coordinates for mapping and navigation integration",
    "Design branded QR codes with logo overlays and custom colors for marketing materials",
    "Generate batch QR codes for event check-in, inventory tracking, or asset labeling systems"],
  "instructions": ["Select the QR content type from 8 options: URL, Email, Phone, SMS, WiFi, vCard, Location, or Plain Text",
    "Fill in the data fields specific to the selected type (e.g., for WiFi: SSID, password, encryption type)",
    "Choose the error correction level: L (7%), M (15%), Q (25%), or H (30%) data recovery; higher levels allow larger logos",
    "Customize appearance: set foreground/background colors using the color pickers, adjust cell size (1-10) and margin (0-4)",
    "Optionally upload a logo image for center overlay; the tool automatically determines the max logo size based on ECC level",
    "Select output format: SVG (scalable), PNG (with transparency), or JPEG (white background); download or copy to clipboard"],
  "examples": ["Input: Type=WiFi, SSID=\"GuestNetwork\", password=\"securepass\", ECC=H -> Output: QR code that, when scanned, prompts to connect to GuestNetwork with the provided password",
    "Input: Type=URL, content=\"https://example.com\", colors=#FF0000 (foreground), #FFFFFF (background), logo=uploaded.png -> Output: Red QR code with center logo, scannable to example.com"],
  "bestPractices": ["Use error correction level H (30%) when adding a logo overlay to ensure the QR code remains scannable",
    "Maintain high contrast between foreground and background colors to ensure reliable scanning (avoid light-on-light)",
    "Test generated QR codes with multiple scanner apps before printing on materials or publishing",
    "Use SVG format for print materials (posters, business cards) since it scales without quality loss",
    "Keep the QR code size reasonable (at least 2cm x 2cm for print, 150x150px for digital) to ensure scanability"],
  "commonMistakes": ["Using low error correction (L/M) with a logo overlay, making the QR code unscannable due to data loss",
    "Choosing low-contrast color combinations like light gray on white that scanners cannot read",
    "Making QR codes too small (under 1cm) on printed materials where scanning distance is more than a few inches",
    "Not testing the generated QR code before mass production, discovering issues after printing",
    "Over-customizing with multiple colors and gradients that interfere with the QR code's timing patterns"],
  "faq": ["Can I scan QR codes with this tool? No, this is a generator only; use a separate scanner app or tool for decoding.",
    "What's the maximum data capacity? Depends on version and ECC level; URL QR codes typically handle up to ~3KB of data.",
    "Does the logo overlay affect scanability? Yes, higher ECC levels compensate for logo-related data loss; use at least level Q (25%) with logos.",
    "Are the generated QR codes standard compliant? Yes, they follow ISO/IEC 18004 standards for QR Code symbology."]
},

"random-data": {
  "whatItDoes": "Generates realistic random test data across 8 categories (People, Companies, Finance, Internet, IDs, Dates, Text, Numbers) with 27+ field types. Supports 6 export formats (JSON, CSV, SQL, XML, YAML, HTML table), locale selection for regional data (US, UK, DE, FR, JP, IN, etc.), seed-based reproducible generation, and a field selector for custom dataset composition.",
  "whyItExists": "Development and testing require realistic data that doesn't compromise privacy. Provides comprehensive test data generation across domains with locale-specific formatting, eliminating the need for manual test data creation or using real production data.",
  "whoShouldUse": "Software developers, QA engineers, database testers, data scientists, and anyone who needs realistic but synthetic data for application testing or demo environments.",
  "useCases": ["Generate realistic user profiles for application testing with locale-appropriate names, addresses, and contact info",
    "Create financial test data including credit card numbers, IBANs, currency amounts, and transaction records",
    "Generate company data for B2B application testing including departments, employees, and corporate structures",
    "Create database seed data in SQL format for populating development databases with realistic records",
    "Generate test data with specific seeds for reproducible test scenarios in automated testing pipelines",
    "Create demographic data sets for data science prototyping and algorithm testing"],
  "instructions": ["Select data categories to include: People (names, emails, phones, addresses), Companies, Finance (cards, IBAN, amounts), Internet (IPs, URLs, user agents), IDs (UUID, CUID, ObjectId), Dates, Text (sentences, paragraphs), or Numbers",
    "Configure field types within each category using the field selector checkboxes (27+ total field types available)",
    "Choose locale for region-specific data: names, addresses, phone formats, and postal codes adapt to the selected locale",
    "Set a seed value (numeric) for reproducible results; same seed + same settings = identical output every time",
    "Select export format: JSON, CSV, SQL (INSERT statements), XML, YAML, or HTML Table",
    "Click \"Generate\" and set the record count (1-1000); preview the data and download or copy to clipboard"],
  "examples": ["Settings: Category=People, Locale=US, Fields=[firstName, lastName, email, phone, address], Count=2 -> Output: [{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john.doe@email.com\",\"phone\":\"(555) 123-4567\",\"address\":{\"street\":\"123 Main St\",\"city\":\"New York\",\"state\":\"NY\",\"zip\":\"10001\"}}, ...]",
    "Settings: Category=Finance, Locale=DE, Fields=[iban, amount, currency], Count=1, Seed=42 -> Output: [{\"iban\":\"DE89370400440532013000\",\"amount\":1234.56,\"currency\":\"EUR\"}]"],
  "bestPractices": ["Use seed values in test automation to ensure reproducible test data across different test runs and environments",
    "Select the appropriate locale for your target market to get realistic addresses, phone formats, and naming conventions",
    "Use the field selector to include only needed fields to reduce data size and focus on relevant test scenarios",
    "Export test data as SQL for direct database seeding, or as JSON/CSV for application-level testing",
    "Generate conservative record counts (under 100) during development; increase to 500-1000 for performance testing"],
  "commonMistakes": ["Assuming generated data is suitable for production; synthetic data may not reflect real-world edge cases",
    "Not using seed values in test suites, resulting in different test data each run and non-reproducible test failures",
    "Generating too many records (1000+) during development, overwhelming test fixtures and slowing iteration",
    "Forgetting to select locale and getting default (US) data when testing internationalization features",
    "Using credit card numbers that look real but aren't from the test card range, potentially triggering fraud systems"],
  "faq": ["Are the generated email addresses real? No, they use example domains (example.com, test.org) and are not real email addresses.",
    "Is the financial data valid for testing? Credit card numbers use test ranges (e.g., 4111...) that pass Luhn checks but are invalid for real transactions.",
    "Can I generate relational data (e.g., users with company IDs)? The tool generates flat records per category; manual cross-referencing is needed for relational data.",
    "Does the seed guarantee identical output across sessions? Yes, the same seed, locale, and field selection always produces identical data."]
},

"regex-tester": {
    "whatItDoes": "Real-time regex tester supporting flags (g/i/m/s/u/y), capture groups, named groups, and non-capturing groups with match highlighting. Includes a common patterns library, replace/split modes, an auto-escape feature, and a built-in cheat sheet.",
    "whyItExists": "Writing and debugging regular expressions is error-prone without instant feedback; this tool eliminates guesswork by showing matches live as you type. It also educates users through the cheat sheet and common patterns library.",
    "whoShouldUse": "Developers, data analysts, and anyone who needs to build, test, or debug regular expressions across any programming language.",
    "useCases": [
      "Debug a complex regex with nested capture groups and lookaheads",
      "Learn regex syntax using the built-in cheat sheet and common patterns library",
      "Test a replacement pattern in replace mode before using it in production code",
      "Split a CSV line using split mode with a delimiter regex",
      "Validate email/URL/phone patterns from the common patterns library",
      "Quickly escape special regex characters in a literal string using auto-escape"
    ],
    "instructions": [
      "Type or paste a regex pattern into the pattern input field; flags (g, i, m, s, u, y) can be toggled via checkboxes below it.",
      "Enter test text in the input area; all matches are highlighted in real time with colors distinguishing capture groups.",
      "Click a pattern from the Common Patterns library (email, URL, date, IP, etc.) to load it instantly.",
      "Switch between Match, Replace, and Split modes using the tab bar above the output panel.",
      "Refer to the cheat sheet by clicking the help icon; it covers anchors, quantifiers, character classes, and flags.",
      "Use the auto-escape button to escape all special regex characters in a selected or pasted literal string."
    ],
    "examples": [
      "Input: pattern /\\b(\\w+)\\s\\1\\b/gi with text \"hello hello world\" → matches \"hello hello\" showing repeated word capture group",
      "Input: pattern /(\\d{4})-(\\d{2})-(\\d{2})/ in replace mode with replacement \"$3/$2/$1\" on \"2025-12-25\" → output \"25/12/2025\""
    ],
    "bestPractices": [
      "Always anchor patterns (^ and $) when matching entire strings to avoid partial matches",
      "Prefer non-capturing groups (?:...) when you do not need to capture to improve performance",
      "Test edge cases like empty strings, very long inputs, and special Unicode characters",
      "Use the auto-escape feature when treating user input as literal text in a regex",
      "Start simple and add complexity incrementally, verifying each step with the live preview"
    ],
    "commonMistakes": [
      "Forgetting to escape special characters like . + * ? [ ] ( ) { } ^ $ | \\\\",
      "Overusing .* which can lead to catastrophic backtracking on large inputs",
      "Assuming regex is the same across all engines (PCRE, JS, Python, etc.) — flags and features vary",
      "Using greedy quantifiers when lazy ones (*? +?) would be more appropriate",
      "Neglecting the m flag when using ^ and $ with multi-line strings"
    ],
    "faq": [
      "What is the difference between greedy and lazy quantifiers? Greedy (*, +) matches as much as possible; lazy (*?, +?) matches as little as possible while still satisfying the pattern.",
      "Why does my regex match more than expected? You likely have an unanchored pattern or used a greedy quantifier — try adding ^/$ or switching to lazy.",
      "What does the s flag do? The s flag (dotAll) makes . match newline characters; without it, . matches everything except newlines.",
      "Can I use named groups? Yes — use the syntax (?<name>...) for named capture groups. They appear in the match details panel."
    ]
  },

"slug-generator": {
    "whatItDoes": "Real-time slug generator supporting 4 separator types (hyphen, underscore, dot, tilde), 3 case options (lower, upper, title), max length enforcement, and Unicode transliteration. Includes prefix/suffix config, 3 sanitize modes (strict, readable, relaxed), and a generation history panel.",
    "whyItExists": "Manual slug creation is tedious and inconsistent across developers. This tool centralizes all slugification rules — separator, case, length, sanitization — so outputs are predictable and reusable.",
    "whoShouldUse": "Content writers, SEO specialists, web developers, and CMS administrators who create URL-friendly strings from titles, names, or arbitrary text.",
    "useCases": [
      "Generate SEO-friendly URL slugs from blog post titles with hyphen separator",
      "Create database-friendly keys using underscore separator and strict sanitize mode",
      "Transliterate non-ASCII text (e.g., Chinese, Arabic, Cyrillic) into an ASCII slug",
      "Enforce a maximum slug length for CMS field constraints",
      "Prepend a category prefix and append a version suffix to a slug in one step",
      "Review and re-use the last 50 generated slugs from the history panel"
    ],
    "instructions": [
      "Type or paste source text into the input field; the slug updates in real time as you type.",
      "Choose a separator from the dropdown: hyphen (-), underscore (_), dot (.), or tilde (~).",
      "Select a case option: lower case, UPPER CASE, or Title Case.",
      "Set a max length (in characters); the slug is truncated at the nearest word boundary.",
      "Configure prefix/suffix fields — they are appended automatically to every generated slug.",
      "Pick a sanitize mode: Strict (remove all non-alphanumeric except separator), Readable (keep common punctuation), or Relaxed (minimal filtering)."
    ],
    "examples": [
      "Input: \"Hello World! This is a Slug\" with hyphen separator, lower case, max 20 chars → \"hello-world-this-is\" (truncated at word boundary)",
      "Input: \"Café München 2025\" with hyphen separator, lower case, transliteration enabled → \"cafe-munchen-2025\""
    ],
    "bestPractices": [
      "Always set a max length that matches your target system's URL/field constraints",
      "Use strict sanitize for URL slugs and readable sanitize for display-only identifiers",
      "Enable transliteration when source text may contain accented or non-Latin characters",
      "Use prefix to namespace slugs by content type (e.g., \"blog-\") to avoid collisions",
      "Review the history panel to ensure you are not duplicating existing slugs"
    ],
    "commonMistakes": [
      "Assuming all CMS platforms accept the same slug format — check separator and length constraints first",
      "Using upper case in URL slugs, which can cause case-sensitivity issues on some web servers",
      "Forgetting to enable transliteration, resulting in dropped or garbled characters for non-ASCII input",
      "Setting max length too low and losing meaningful words without realizing it",
      "Not using a prefix, leading to collisions when two pieces of content would generate the same slug"
    ],
    "faq": [
      "What separator is best for SEO? Hyphens are recommended by Google over underscores or other separators for URL readability.",
      "Does transliteration work for all languages? It supports Latin-based scripts, Cyrillic, Greek, Arabic, Chinese (Pinyin), and many others via ICU rules.",
      "Why is my slug empty after generation? The source text may contain only characters removed by the sanitize mode — try a more relaxed sanitize level.",
      "How many entries does the history store? The last 50 unique slugs are saved in browser local storage and displayed in reverse chronological order."
    ]
  },

"sql-formatter": {
    "whatItDoes": "SQL formatter supporting 11 dialects: MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, Redshift, Snowflake, DB2, MariaDB, and Standard SQL. Offers configurable keyword case (upper/lower/capitalize), comma position (leading/trailing), logical operator placement on new lines, and inline/expanded expression toggling.",
    "whyItExists": "SQL queries quickly become unreadable without consistent formatting. This tool enforces a unified style across teams, databases, and tools by supporting dialect-specific syntax and customizable formatting rules.",
    "whoShouldUse": "Data engineers, analysts, backend developers, and database administrators who write, review, or maintain SQL queries across multiple database platforms.",
    "useCases": [
      "Format a 200-line PostgreSQL query with CTEs and window functions for code review",
      "Convert a messy MySQL query to consistent upper-case keywords with leading commas",
      "Ensure Snowflake-specific syntax (QUALIFY, LATERAL FLATTEN) is handled correctly",
      "Prepare a formatted Oracle query with PL/SQL blocks for documentation",
      "Reformat a legacy SQL Server query to use trailing commas with indented columns",
      "Compare formatted output across dialects to catch syntax incompatible with a target database"
    ],
    "instructions": [
      "Paste or type your SQL query into the input editor.",
      "Select a target dialect from the dropdown (MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, Redshift, Snowflake, DB2, MariaDB, or Standard SQL).",
      "Choose keyword case: UPPER, lower, or Capitalize.",
      "Set comma position to Leading (before column name) or Trailing (after column name).",
      "Toggle logical operator newlines to place AND/OR at the start of each line for readability.",
      "Click Format to generate the output; use the copy button to transfer the result to your clipboard."
    ],
    "examples": [
      "Input: \"SELECT id,name, email  FROM users WHERE age>18 ORDER BY name\" (MySQL, UPPER, trailing commas) → \"SELECT id, name, email FROM users WHERE age > 18 ORDER BY name\" (properly spaced and cased)",
      "Input: \"SELECT a.* FROM tbl a LEFT JOIN tbl2 b ON a.id=b.id WHERE a.x=1 AND b.y=2 OR b.z=3\" (PostgreSQL, lower, leading commas, AND/OR on new lines) → multi-line output with each AND/OR on its own line"
    ],
    "bestPractices": [
      "Always select the correct dialect to avoid syntax misinterpretation (e.g., :: type cast vs. CONVERT)",
      "Use leading commas to make column additions/deletions easier in version control diffs",
      "Enable logical operator newlines for complex WHERE clauses with multiple conditions",
      "Standardize on one keyword case across your team for consistency",
      "Run formatted queries through a linter (e.g., sqlfluff) as an additional validation step"
    ],
    "commonMistakes": [
      "Formatting with the wrong dialect can produce invalid SQL (e.g., using MySQL-specific syntax for PostgreSQL)",
      "Using trailing commas in all contexts — some databases reject trailing commas in certain clauses",
      "Assuming the formatter handles all vendor-specific syntax perfectly — always review the output",
      "Over-formatting very long queries into deeply nested blocks that are harder to read than a flatter layout",
      "Forgetting to re-format after editing — incremental changes can break alignment"
    ],
    "faq": [
      "Does the formatter handle CTEs and window functions? Yes — WITH clauses, ROW_NUMBER(), RANK(), and other window functions are indented and spaced correctly.",
      "Can I format only part of a query? The tool formats the entire input; for partial formatting, extract the relevant subquery first.",
      "What about DDL and DML statements? CREATE, ALTER, INSERT, UPDATE, DELETE are all supported with proper formatting.",
      "Does it preserve comments? Yes — single-line (--) and block (/* */) comments are preserved in the output."
    ]
  },

"ssl-decoder": {
    "whatItDoes": "SSL certificate decoder that parses X.509 fields including subject, issuer, serial number, validity period, subject alternative names (SAN), key algorithm, and fingerprint. Displays an expiry countdown timer, chain analysis showing all intermediate and root certificates, an ASN.1 structure dump, and key usage/extended key usage details.",
    "whyItExists": "Debugging SSL/TLS issues requires inspecting raw certificate fields that are opaque in most UIs. This tool surfaces every detail — including chain order, SANs, and ASN.1 structure — so developers can quickly diagnose misconfigurations.",
    "whoShouldUse": "DevOps engineers, security analysts, penetration testers, and backend developers who manage TLS certificates or troubleshoot HTTPS connectivity.",
    "useCases": [
      "Verify the SAN list on a certificate matches the domain being deployed",
      "Check the issuer chain to confirm intermediate certificates are present and in the correct order",
      "Monitor certificate expiry with the countdown timer to avoid unexpected downtime",
      "Compare fingerprints (SHA-1, SHA-256) before and after renewal to confirm the new cert is installed",
      "Inspect the ASN.1 dump to detect unexpected extensions or malformed fields",
      "Analyze key usage and extended key usage to confirm a cert is valid for its intended purpose (e.g., server auth, code signing)"
    ],
    "instructions": [
      "Paste a PEM-encoded certificate (or several in chain order) into the input area.",
      "Click Decode to parse the X.509 fields; the subject, issuer, serial, and validity are displayed at the top.",
      "Review the Subject Alternative Names (SAN) list — both DNS names and IP addresses are shown.",
      "Read the expiry counter showing days/hours/minutes until (or since) expiration in real time.",
      "Click the Chain tab to view each certificate in the chain with its subject, issuer, and fingerprint.",
      "Open the ASN.1 tab to see the raw ASN.1 structure dump for deep inspection."
    ],
    "examples": [
      "Input: PEM block for a Let's Encrypt certificate → output shows subject CN=example.com, issuer CN=R3, valid 90 days, SANs [example.com, www.example.com], SHA-256 fingerprint, 45 days until expiry",
      "Input: Chain of 3 PEM blocks (leaf → intermediate → root) → chain analysis shows each level, validates trust path order, and flags any missing intermediates"
    ],
    "bestPractices": [
      "Always paste the full certificate chain (leaf + intermediates) to enable chain analysis",
      "Check the SAN list before deploying — browsers require SAN match, not just CN",
      "Set up alerts based on the expiry countdown and renew at least 30 days before expiration",
      "Compare fingerprints before and after renewal to ensure the correct certificate was installed",
      "Use the ASN.1 dump when a certificate is rejected by a client to find malformed extensions"
    ],
    "commonMistakes": [
      "Pasting only the leaf certificate without the intermediate chain, causing trust errors in clients",
      "Assuming the certificate is valid because the expiry date is in the future — check revocation and key usage too",
      "Misreading the serial number as decimal when it is typically displayed in hex",
      "Overlooking the subject CN when SAN is present — modern browsers ignore CN entirely",
      "Not verifying the signature algorithm is strong enough (e.g., SHA-1 is deprecated)"
    ],
    "faq": [
      "What PEM formats are accepted? Standard -----BEGIN CERTIFICATE----- blocks, including multiple concatenated blocks for chain analysis.",
      "Can I decode a certificate from a remote server directly? Not yet — paste the PEM content obtained via openssl s_client or your browser.",
      "What is the difference between SHA-1 and SHA-256 fingerprints? SHA-256 is the modern, cryptographically stronger hash; SHA-1 is deprecated for security.",
      "Does it support wildcard certificates? Yes — wildcard SANs like *.example.com are shown with the asterisk preserved."
    ]
  },

"string-length": {
    "whatItDoes": "String length calculator displaying three measurements: code points (Unicode characters), UTF-16 code units (JavaScript string length), and UTF-8 bytes (storage size). Breaks down character types into letters, digits, spaces, punctuation, and emoji with counts and percentages. Includes limit checks for SMS (160/70 GSM), Twitter (280), Instagram caption (2200), and Facebook post (63206).",
    "whyItExists": "String length semantics vary across contexts — JavaScript uses UTF-16, databases use UTF-8, SMS uses GSM-7. This tool surfaces all relevant measurements simultaneously and alerts users when they exceed platform limits.",
    "whoShouldUse": "Frontend developers, content creators, SMS/messaging engineers, and anyone building character-limited UIs or validating input field constraints.",
    "useCases": [
      "Check if a tweet exceeds the 280-character limit before posting",
      "Verify an SMS message fits within 160 GSM-7 characters or switches to UCS-2",
      "Debug an emoji-heavy string that has unexpected length in JavaScript vs. database storage",
      "Analyze the composition of a password or username to count letters, digits, and special chars",
      "Ensure an Instagram caption stays under the 2200-character limit",
      "Determine the UTF-8 byte size of a string for a VARCHAR column in MySQL"
    ],
    "instructions": [
      "Type or paste text into the input area; all measurements update in real time.",
      "Read the three measurement lines: code points (Unicode), UTF-16 units (JS length), UTF-8 bytes.",
      "Review the character type breakdown section showing counts and percentages for letters, digits, spaces, punctuation, and emoji.",
      "Check the limit bars — SMS, Twitter, Instagram, Facebook — which turn red when the text exceeds the platform limit.",
      "Hover over any emoji character to see its Unicode code point and name.",
      "Use the clear button to reset the input and all measurements."
    ],
    "examples": [
      "Input: \"Hello, world! 😊\" → code points: 15, UTF-16: 16 (😊 is surrogate pair), UTF-8: 19 bytes; char breakdown shows 11 letters, 1 digit, 2 punctuation, 1 space, 1 emoji",
      "Input: \"a\" repeated 161 times → code points/UTF-16/UTF-8 all 161; SMS limit: 160 limit exceeded (1 char over 7-bit GSM limit)"
    ],
    "bestPractices": [
      "Use UTF-16 units (JavaScript .length) when validating frontend input fields",
      "Use UTF-8 bytes when defining database column sizes (e.g., VARCHAR(255) stores 255 bytes, not chars)",
      "Be aware that emoji may use 2–16 bytes in UTF-8 and 2 code units in UTF-16 (surrogate pairs)",
      "Check the SMS GSM-7 vs. UCS-2 status — special characters may force the entire message to UCS-2, halving the limit",
      "Use the character breakdown to understand the composition of user-generated content for analytics"
    ],
    "commonMistakes": [
      "Assuming JavaScript .length equals character count when emoji or combining marks are present",
      "Using code point count for database column sizing — databases use byte counts, not character counts",
      "Forgetting that SMS messages >70 characters in UCS-2 (non-GSM characters) count as multi-part",
      "Counting newlines as one character — some systems count \\r\\n as 2",
      "Ignoring zero-width joiners (ZWJ) and variation selectors which affect display but may be invisible in counts"
    ],
    "faq": [
      "Why does 😊 count as 2 in JavaScript but 1 code point? Emoji outside the Basic Multilingual Plane use surrogate pairs — 2 UTF-16 code units for 1 code point.",
      "What is the difference between code points and UTF-8 bytes? Code points are Unicode characters; UTF-8 bytes are how those characters are stored — ASCII is 1 byte, extended Latin 2 bytes, CJK 3 bytes, emoji up to 4 bytes.",
      "How does SMS length work? 7-bit GSM characters allow 160; UCS-2 characters allow 70. If any non-GSM character is present, the entire message switches to UCS-2 (70 char limit).",
      "Are control characters counted? Yes — tabs, newlines, and other control characters are included in all measurements and listed under the \"other\" category."
    ]
  },

"svg-optimizer": {
    "whatItDoes": "SVG optimizer that removes XML declarations, comments, empty elements, unused defs, and editor metadata (Illustrator, Inkscape, Sketch, Figma). Collapses groups, merges paths, rounds coordinate precision (configurable 1–6 decimal places), and converts colors to shorthand. Includes copy-as-React-component (JSX attributes), data URI generation, and before/after size comparison.",
    "whyItExists": "SVG files exported from design tools are bloated with editor metadata, unused groups, and redundant attributes. This optimizer strips all non-essential content while preserving visual fidelity, reducing file size and improving rendering performance.",
    "whoShouldUse": "Frontend developers, UI designers, and performance engineers who embed SVGs in web applications or design systems and want to minimize bundle size.",
    "useCases": [
      "Optimize an Illustrator-exported SVG for production by stripping all editor metadata",
      "Convert an SVG to a React component with JSX-compatible attributes (className, htmlFor)",
      "Generate a data URI from an SVG for use in CSS background-image without an HTTP request",
      "Reduce SVG file size by collapsing nested groups and merging adjacent paths",
      "Round coordinate precision from 6 decimals to 2 for significantly smaller file size",
      "Batch-optimize multiple SVGs and compare before/after sizes to measure savings"
    ],
    "instructions": [
      "Paste SVG markup into the input area or upload an .svg file using the file picker.",
      "Adjust precision (1–6 decimal places) for numeric coordinates — lower values produce smaller files.",
      "Toggle optional cleanups: remove XML declaration, remove comments, remove empty elements, remove unused defs, collapse groups, merge paths.",
      "Check Remove editor metadata to strip Illustrator, Inkscape, Sketch, and Figma-specific tags and attributes.",
      "Click Optimize; the output area shows the optimized SVG with real-time size and savings percentage.",
      "Use the Copy as React Component or Copy as Data URI buttons for framework-specific output."
    ],
    "examples": [
      "Input: 50KB SVG from Adobe Illustrator with xmlns:illustrator, sketch:type, empty <g> tags, and 6-decimal coordinates → Output: 12KB SVG with all metadata removed, coordinates rounded to 2 decimals, groups collapsed",
      "Input: optimized SVG → copy as React Component → outputs JSX: <svg viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"...\" fill=\"currentColor\"/></svg>"
    ],
    "bestPractices": [
      "Always remove editor metadata — it can account for 30-50% of file size",
      "Set precision to 1–2 decimal places for web use; 3–4 for print use; 5–6 only for precision-critical applications",
      "Merge paths when the SVG is a flat icon; keep groups separate for animated or interactive SVGs",
      "Use Copy as Data URI for small, single-use icons to eliminate HTTP requests",
      "Run the optimizer on SVGs in your CI pipeline to enforce a maximum file size"
    ],
    "commonMistakes": [
      "Over-optimizing by merging paths that should remain separate for CSS styling or animation",
      "Rounding precision too aggressively on curves, causing visible rendering artifacts",
      "Removing viewBox attribute — the optimizer preserves it, but always verify it is present",
      "Assuming optimization always produces a smaller file — very small SVGs may grow slightly (rare)",
      "Forgetting to test the optimized SVG in the target browser or rendering engine"
    ],
    "faq": [
      "Does it preserve CSS classes and IDs? Classes and IDs used in CSS or for animation are preserved; only unused IDs are removed.",
      "Can it handle inline SVGs in HTML? Paste only the SVG portion — extraneous HTML will cause parsing errors.",
      "What editor metadata is removed? All tags and attributes from Illustrator (i:*, xmlns:illustrator), Inkscape (sodipodi:*, inkscape:*), Sketch (sketch:*), and Figma (figma:*) are stripped.",
      "Does it convert colors? Yes — #FF0000 becomes red, #FFFFFF becomes white, where possible using named colors and shorthand hex (e.g., #FF8800 → #F80)."
    ]
  },

"svg-to-css": {
    "whatItDoes": "Converts SVG markup to CSS values for background-image, mask-image, inline SVG (content property), and clip-path modes. Supports URL-encoded and base64 encoding, applies optimization before conversion, shows a live preview of the rendered result, and compares byte sizes of the original SVG, URL-encoded, and base64 versions.",
    "whyItExists": "Embedding SVGs in CSS requires proper encoding and wrapping for each CSS property. This tool automates the conversion so developers can use SVGs in stylesheets without manual string manipulation.",
    "whoShouldUse": "Frontend developers, CSS authors, and UI engineers who embed vector graphics as CSS background images, masks, or clip-paths.",
    "useCases": [
      "Convert an SVG icon to a CSS background-image data URI for use in a button",
      "Create a CSS mask from an SVG shape for advanced hover effects",
      "Embed an SVG inline in the content property for pseudo-elements",
      "Generate a clip-path polygon from an SVG path for creative layouts",
      "Compare URL-encoded vs. base64 sizes to choose the most efficient encoding",
      "Optimize and convert multiple SVGs to CSS in a batch for a design system"
    ],
    "instructions": [
      "Paste SVG markup into the input area — it will automatically be optimized in the preview pane.",
      "Select the output mode: background-image, mask-image, inline (content), or clip-path.",
      "Choose encoding: URL-encoded (smaller, human-readable) or base64 (binary-safe, larger).",
      "Review the live preview showing the CSS-rendered SVG on a sample element.",
      "Check the size comparison table showing original bytes vs. URL-encoded bytes vs. base64 bytes.",
      "Click Copy CSS to copy the generated CSS declaration(s) to your clipboard."
    ],
    "examples": [
      "Input: <svg viewBox=\"0 0 24 24\"><path d=\"M12 2L2 22h20z\"/></svg> with background-image mode and URL encoding → output: background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2L2 22h20z'/%3E%3C/svg%3E\");",
      "Input: same SVG with mask-image mode and base64 encoding → output: mask-image: url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiAyMmgyMHoiLz48L3N2Zz4=\");"
    ],
    "bestPractices": [
      "Use URL-encoding for simple SVGs — it produces smaller CSS than base64",
      "Use base64 encoding when the SVG contains characters that may not survive URL-encoding cleanly",
      "Always optimize the SVG before converting to reduce CSS byte size",
      "Choose mask-image over background-image for colorable icons (mask follows currentColor)",
      "Test the generated CSS in all target browsers — some older browsers have encoding edge cases"
    ],
    "commonMistakes": [
      "Using background-image with colorable icons — use mask-image so the icon inherits the text color",
      "Forgetting the xmlns attribute in the SVG — it is required for data URIs",
      "Adding quotes inside the data URI that break the CSS url() syntax",
      "Assuming all SVG features (animations, external fonts) work in CSS background-images — they do not",
      "Copying the CSS without verifying the semicolon and closing parenthesis are present"
    ],
    "faq": [
      "What is the smallest encoding? URL-encoding is typically 5–15% smaller than base64 for most SVGs.",
      "Can I use this for SVG sprites? No — this tool is for individual SVGs; use an SVG sprite generator for multiple icons.",
      "Does clip-path support all SVG paths? clip-path uses only the path's geometry — fill, stroke, and colors are ignored.",
      "Will animations inside the SVG work? No — CSS background-images and masks do not render SVG animations."
    ]
  },

"text-analyzer": {
    "whatItDoes": "Comprehensive text analyzer computing 15+ statistics: characters (with/without spaces), words, sentences, paragraphs, lines, syllables, and average word/sentence length. Calculates readability scores (Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau), performs sentiment analysis (positive/negative/neutral), language detection, emotion detection (anger/joy/sadness/fear/surprise), named entity recognition (persons, organizations, locations, dates), vocabulary analysis (unique words, lexical density), and provides writing suggestions.",
    "whyItExists": "Manually computing readability, sentiment, and language metrics is impractical. This tool aggregates dozens of text analytics into one interface so writers and editors can assess tone, complexity, and quality instantly.",
    "whoShouldUse": "Content writers, editors, SEO analysts, linguists, students, and anyone who needs quantitative and qualitative analysis of written text.",
    "useCases": [
      "Evaluate the readability of a blog post to ensure it matches the target audience's reading level",
      "Detect the language of an unknown text sample before translation or routing",
      "Analyze sentiment and emotion in customer feedback or product reviews",
      "Identify named entities in a legal or news document for quick fact extraction",
      "Track vocabulary diversity and lexical density across multiple drafts of an article",
      "Get writing suggestions to improve clarity, conciseness, and grammar in a piece of content"
    ],
    "instructions": [
      "Paste or type text into the input area; statistics update in real time as you type.",
      "Scroll through the Stats section to view character, word, sentence, paragraph, and line counts.",
      "Read the Readability section to see scores for Flesch-Kincaid, Gunning Fog, SMOG, and Coleman-Liau — each with a grade-level interpretation.",
      "Review the Sentiment section showing positive/negative/neutral percentages and an overall sentiment label.",
      "Check Language Detection for the detected language and confidence score.",
      "Explore the Entities tab to see extracted persons, organizations, locations, and dates with their frequency."
    ],
    "examples": [
      "Input: \"The quick brown fox jumps over the lazy dog. It was a sunny day in the forest.\" → Stats: 14 words, 2 sentences, 68 chars; Flesch-Kincaid: 5.2 grade; Sentiment: neutral; Language: English; Entities: none detected",
      "Input: \"Apple Inc. announced on January 15, 2025 that Tim Cook would visit Beijing. This delighted investors.\" → Entities: [Apple Inc. (ORG), Tim Cook (PERSON), Beijing (LOC), January 15, 2025 (DATE)]; Sentiment: positive; Emotion: joy detected"
    ],
    "bestPractices": [
      "Use readability scores to target specific grade levels — 6-8th grade for general audiences, 9-12th grade for professional content",
      "Combine sentiment and emotion analysis for a more nuanced understanding of text tone",
      "Run named entity recognition on extracted text to quickly catalog people, places, and organizations",
      "Track lexical density across revisions to ensure vocabulary is not becoming too repetitive",
      "Use writing suggestions as a guide, not a rule — preserve your unique voice and style"
    ],
    "commonMistakes": [
      "Assuming Flesch-Kincaid is the only readability metric — use all four for a complete picture",
      "Treating sentiment analysis as 100% accurate — it can miss sarcasm, irony, and cultural context",
      "Using language detection on very short texts (<10 characters) — confidence drops significantly",
      "Ignoring the entity count column to determine which entities are most discussed, not just present",
      "Over-relying on writing suggestions that may strip personality or domain-specific terminology"
    ],
    "faq": [
      "How is the Flesch-Kincaid score calculated? 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words). Scores 90-100 = very easy, 0-30 = very difficult.",
      "What languages does language detection support? Over 50 languages including English, Spanish, French, German, Chinese, Arabic, and Russian, using a neural language identification model.",
      "Can I analyze a PDF or document file? Paste the extracted text — file upload with text extraction is on the roadmap.",
      "Are entity recognitions stored or sent to a server? All processing is done client-side in the browser; no data is transmitted externally."
    ]
  },

"text-sorter": {
    "whatItDoes": "Text line sorter with 8 modes: A-Z, Z-A, length ascending, length descending, numeric sort, natural sort (human-friendly), reverse order, and randomize. Supports deduplication, empty line removal, trimming whitespace per line, case-sensitive toggle, and a paste button for quick input from clipboard.",
    "whyItExists": "Sorting lines of text manually is slow and error-prone. This tool provides a variety of sort orders and preprocessing options so users can organize any list-based text in one click.",
    "whoShouldUse": "Anyone who works with lists, CSV extracts, keyword collections, code imports, or any line-delimited text that needs ordering or deduplication.",
    "useCases": [
      "Sort a list of names alphabetically (A-Z) for a mailing list",
      "Find the longest and shortest lines in a dataset using length ascending/descending",
      "Remove duplicate lines from a combined CSV extract",
      "Randomize a list of raffle entries or quiz questions",
      "Naturally sort file names containing numbers (e.g., file2, file10, file20) using natural sort",
      "Reverse the order of a chronologically ascending list to make it descending"
    ],
    "instructions": [
      "Paste or type text (one item per line) into the input area; use the paste button to quickly load clipboard content.",
      "Select a sort mode: A-Z, Z-A, Length ↑, Length ↓, Numeric, Natural, Reverse, or Randomize.",
      "Toggle case-sensitive sorting on or off — when off, all lines are compared case-insensitively.",
      "Enable Remove Duplicates, Remove Empty Lines, and Trim Each Line as needed via checkboxes.",
      "Click Sort to process the text; the output appears in the result area with line count shown.",
      "Use the copy button to copy the sorted output to your clipboard."
    ],
    "examples": [
      "Input: lines \"banana\", \"Apple\", \"cherry\", \"Banana\", \"\" with A-Z sort, case-insensitive, remove duplicates, remove empty → Output: [\"Apple\", \"banana\", \"cherry\"] (4 lines → 3 lines)",
      "Input: lines \"file2.txt\", \"file10.txt\", \"file1.txt\", \"file20.txt\" with Natural sort → Output: [\"file1.txt\", \"file2.txt\", \"file10.txt\", \"file20.txt\"] (numeric-aware ordering)"
    ],
    "bestPractices": [
      "Enable Remove Duplicates when merging lists from multiple sources to get a unique set",
      "Use Natural sort for file names, version numbers, or any text containing embedded numbers",
      "Enable Trim Each Line before sorting to avoid leading/trailing spaces affecting the order",
      "Use A-Z for general alphabetization and Z-A for reverse-alphabetical reference lists",
      "Use Randomize for unbiased shuffling — the tool uses a cryptographically seeded randomizer"
    ],
    "commonMistakes": [
      "Using alphabetical sort on numeric data — use Numeric sort for proper ordering (10 > 2)",
      "Forgetting to enable case-insensitive sorting, causing \"Apple\" and \"apple\" to appear far apart",
      "Assuming duplicate removal is case-sensitive — \"Apple\" and \"apple\" are treated as distinct when case-sensitive is on",
      "Using Reverse when Z-A would produce the correct actual reverse-alphabetical order",
      "Not trimming lines first — a trailing space changes the sort position and makes duplicates invisible"
    ],
    "faq": [
      "What is the difference between Numeric and Natural sort? Numeric treats each line as a number; Natural sorts by text but recognizes numeric sequences within text (e.g., file2 < file10).",
      "Does Randomize produce the same order every time? No — each click produces a fresh random order using a cryptographically secure PRNG.",
      "How large an input can the tool handle? Up to 100,000 lines or 5MB of text; larger inputs may cause performance degradation.",
      "Can I sort by a specific column or delimiter? Not in this tool — each line is treated as a single item. Use a spreadsheet for columnar sorting."
    ]
  },

"timestamp-converter": {
    "whatItDoes": "Timestamp converter with auto-detection of Unix (seconds/milliseconds), ISO 8601, and human-readable date formats. Converts to 11 different output formats including Unix seconds, Unix milliseconds, ISO 8601, RFC 2822, UTC string, locale date/time strings, relative time (\"2 hours ago\"), and Japanese/Chinese date formats. Features a timezone selector, Now button, countdown timer to a target timestamp, diff calculator between two timestamps, and leap year detection.",
    "whyItExists": "Timestamps appear in many formats across APIs, databases, and logs — converting between them manually is tedious and error-prone. This tool detects the input format automatically and provides every common output format in one view.",
    "whoShouldUse": "Backend developers, API integrators, database administrators, QA engineers, and anyone working with time data across different systems and timezones.",
    "useCases": [
      "Convert a Unix timestamp from an API response to a human-readable date for debugging",
      "Generate an ISO 8601 string from a local date for a JSON payload",
      "Calculate the time difference between two Unix timestamps in seconds/minutes/hours/days",
      "Count down to a specific date (e.g., product launch) to see remaining time",
      "Check if a given year is a leap year for date validation logic",
      "Convert a timestamp between timezones (e.g., UTC to Asia/Tokyo)"
    ],
    "instructions": [
      "Paste or type a timestamp into the input field — the tool auto-detects Unix (seconds/milliseconds), ISO 8601, or human-readable format.",
      "View the 11 output formats in the results grid, each labeled with its format name.",
      "Select a target timezone from the dropdown to convert all outputs to that timezone.",
      "Click the Now button to insert the current Unix timestamp (in seconds) into the input.",
      "Use the Diff tab to enter two timestamps and see the difference in seconds, minutes, hours, days, and weeks.",
      "Switch to the Countdown tab to set a future timestamp and watch a live countdown timer."
    ],
    "examples": [
      "Input: \"1735689600\" (auto-detected as Unix seconds) → Outputs include: ISO 8601 \"2025-01-01T00:00:00.000Z\", RFC 2822 \"Wed, 01 Jan 2025 00:00:00 +0000\", relative \"1 year ago\"",
      "Input: \"2025-12-25T14:30:00\" with timezone America/New_York → Outputs include: Unix seconds 1735677000, Japan time \"2025-12-26 04:30:00 JST\""
    ],
    "bestPractices": [
      "Always verify auto-detected format — Unix seconds vs. milliseconds (10 digits vs. 13 digits) can be ambiguous",
      "Use the Now button for quick insertion of the current time when testing",
      "Use the Diff calculator to validate time-based business logic like expiry windows",
      "Select the correct timezone before converting to avoid off-by-one day errors",
      "Check leap year detection when writing date validation for birthdates or contract dates"
    ],
    "commonMistakes": [
      "Confusing Unix seconds (10 digits) with Unix milliseconds (13 digits) — using the wrong unit shifts the date by decades",
      "Assuming ISO 8601 always includes timezone offset — local-time ISO strings lack \"Z\" or offset",
      "Forgetting that JavaScript Date.getTime() returns milliseconds, not seconds",
      "Using the wrong timezone for daylight saving date ranges — the tool applies DST rules automatically",
      "Misreading relative time for future dates — \"in 2 hours\" vs. \"2 hours ago\""
    ],
    "faq": [
      "What is the difference between Unix seconds and Unix milliseconds? Unix seconds = seconds since epoch (Jan 1, 1970); milliseconds = that value × 1000. A typical 10-digit number is seconds; a 13-digit number is milliseconds.",
      "Does the tool handle timezone abbreviations like PST/EST? Use IANA timezone names (e.g., America/Los_Angeles) — ambiguous abbreviations are not supported.",
      "How accurate is the countdown timer? The countdown refreshes every second and is synchronized with the system clock.",
      "Can I convert dates before 1970? Yes — Unix timestamps can represent dates from 1901 to 2038 (32-bit) and beyond (64-bit timestamps handled)."
    ]
  },

"toml-converter": {
    "whatItDoes": "Three-way TOML ↔ JSON ↔ YAML converter with automatic input format detection. Provides output-specific formatting options (indent size, key sorting, trailing commas for JSON, line width for YAML). Includes copy-to-clipboard and download-as-file functionality for each output format.",
    "whyItExists": "Configuration files commonly exist in TOML, JSON, or YAML, but teams and tools require different formats. This converter bridges all three so users can seamlessly translate between them without remembering format-specific syntax rules.",
    "whoShouldUse": "Backend developers, DevOps engineers, and configuration managers who work with config files across tools that use different formats (e.g., Python TOML, JS JSON, CI YAML).",
    "useCases": [
      "Convert a Python pyproject.toml to JSON for a tool that only accepts JSON config",
      "Translate a docker-compose YAML to TOML for a Rust project using TOML config",
      "Migrate a JSON configuration file to YAML for better readability in a monorepo",
      "Validate that a TOML file is well-formed by converting it to JSON and checking for errors",
      "Normalize inconsistent YAML files to JSON for unified processing in a script",
      "Download a converted config file for use in a deployment pipeline"
    ],
    "instructions": [
      "Paste TOML, JSON, or YAML content into the input area — the format is auto-detected from the first non-whitespace character.",
      "Select the target output format: TOML, JSON, or YAML.",
      "Configure output options: for JSON choose indent (2/4/tab) and key sorting; for YAML set indent and line width.",
      "Click Convert; the output appears in the result panel with syntax highlighting.",
      "Click Copy to copy the converted result to your clipboard.",
      "Click Download to save the output as a .toml, .json, or .yaml file."
    ],
    "examples": [
      "Input (TOML): \"[server]\\nhost = \\\"localhost\\\"\\nport = 8080\" → Output (JSON): {\"server\": {\"host\": \"localhost\", \"port\": 8080}}",
      "Input (YAML): \"server:\\n  host: localhost\\n  port: 8080\" → Output (TOML): \"[server]\\nhost = \\\"localhost\\\"\\nport = 8080\""
    ],
    "bestPractices": [
      "Always verify the auto-detected format is correct — ambiguous input (e.g., a string) may be misidentified",
      "Use JSON output when the result will be consumed programmatically (fastest to parse)",
      "Use YAML output when the result needs to be human-readable with comments",
      "Use TOML output for Python ecosystem tools that expect pyproject.toml format",
      "Download converted files rather than copying — this avoids clipboard formatting issues"
    ],
    "commonMistakes": [
      "Assuming comments in the source format are preserved in the target — only YAML-to-YAML conversions preserve comments",
      "Using trailing commas in JSON output when the target parser is strict about JSON spec",
      "Converting without checking for data loss — TOML has no null type; INI-style keys may be flattened",
      "Assuming YAML anchors and aliases work across all output formats — they only work in YAML-to-YAML",
      "Forgetting that TOML tables must be defined before they are referenced (sorted tables may break this)"
    ],
    "faq": [
      "Are comments preserved during conversion? Comments are preserved only when the source and target are the same format (e.g., YAML → YAML). Cross-format conversions strip comments.",
      "Does it handle nested TOML tables? Yes — TOML tables like [server.database] are converted to nested objects in JSON/YAML.",
      "What happens with TOML inline tables vs. standard tables? Both are supported and produce equivalent nested output in JSON/YAML.",
      "Can I convert very large files? Files up to 10MB are supported; larger files may cause performance issues in the browser."
    ]
  },

"totp-generator": {
    "whatItDoes": "TOTP (Time-based One-Time Password) generator supporting SHA-1, SHA-256, and SHA-512 hashing algorithms with 6 or 8 digit codes and 30 or 60 second time steps. Displays a live countdown timer, keeps a rolling code history (last 10 codes), includes a cryptographically secure random secret generator, and exports otpauth:// URI for QR codes. Supports Steam TOTP format and multi-account management.",
    "whyItExists": "Implementing TOTP authentication requires generating codes with precise timing and algorithm parameters. This tool provides a fully functional TOTP client in the browser for testing, development, and account setup without needing a phone or dedicated authenticator app.",
    "whoShouldUse": "Security engineers, backend developers implementing 2FA, QA testers validating TOTP flows, and users who need a quick TOTP code without their phone.",
    "useCases": [
      "Generate a TOTP code for testing a 2FA login flow during development",
      "Create an otpauth:// URI to generate a QR code for user onboarding",
      "Compare codes generated with SHA-1 vs. SHA-256 to test algorithm compatibility",
      "Use Steam TOTP format for Steam account 2FA code generation",
      "Generate a random base32 secret and immediately see its TOTP code",
      "Manage multiple TOTP accounts with different algorithms, digits, and step settings"
    ],
    "instructions": [
      "Enter a base32-encoded secret (or click Generate Random Secret to create one).",
      "Select the algorithm: SHA-1 (default), SHA-256, or SHA-512.",
      "Set digits to 6 (standard) or 8 (extended) and time step to 30s (standard) or 60s.",
      "View the current TOTP code in large font with a countdown timer showing seconds until the next code.",
      "Check the code history panel to see the last 10 codes with their timestamps.",
      "Switch accounts using the account dropdown or add a new account with the + button."
    ],
    "examples": [
      "Input: secret \"JBSWY3DPEHPK3PXP\" (base32), SHA-1, 6 digits, 30s step → Output: \"123456\" with 23s countdown timer and otpauth:// URI: otpauth://totp/Example?secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&period=30",
      "Input: same secret with Steam TOTP format enabled → Output: \"ST-12345\" (Steam-style 5 character code with leading ST-)"
    ],
    "bestPractices": [
      "Use SHA-256 or SHA-512 for stronger security when the authenticator app supports it",
      "Always verify the generated code against your server implementation to ensure algorithm/digits/step match",
      "Generate secrets with the built-in random generator rather than typing them manually",
      "Use the otpauth:// URI to create a QR code for user onboarding instead of sharing the secret in plaintext",
      "Store the secret and parameters for each account — the tool uses local storage to persist multi-account data"
    ],
    "commonMistakes": [
      "Using a non-base32 secret — only A-Z and 2-7 characters are valid in base32",
      "Mismatching algorithm or digits between client and server — codes will never match",
      "Assuming the time step is always 30 seconds — some services use 60 seconds",
      "Sharing the secret in plaintext via email or chat instead of using the secure otpauth:// URI",
      "Forgetting that the code changes every time step — the current code expires based on the countdown timer"
    ],
    "faq": [
      "What is the difference between TOTP and HOTP? TOTP is time-based (code changes every 30/60 seconds); HOTP is counter-based (code changes after each use). This tool only generates TOTP codes.",
      "Why does my generated code not match my server? Check that the secret, algorithm, digits, and time step match exactly. Also verify the server clock is synchronized via NTP.",
      "Can I use this as my primary authenticator? It is designed for development/testing; for daily use, a dedicated authenticator app with backups is recommended.",
      "What is the Steam TOTP format? Steam uses a modified TOTP that produces a 5-character alphanumeric code (including digits and letters) prefixed with \"ST-\" rather than a standard 6-digit numeric code."
    ]
  },

"unit-converter": {
    "whatItDoes": "Unit converter covering 13 categories: Length, Mass, Volume, Temperature, Area, Speed, Time, Data Storage, Pressure, Energy, Frequency, Angle, and Fuel Economy. Displays the conversion formula used, supports swapping source/target units, saves favorite conversions, and includes a batch convert mode for converting a single value to all units in a category at once.",
    "whyItExists": "Unit conversion requires knowing exact conversion factors and handling many unit systems. This tool centralizes all common categories with formula transparency so users can verify calculations and convert across any pair of units.",
    "whoShouldUse": "Engineers, scientists, students, travelers, cooks, and anyone who needs to convert measurements between different unit systems (metric, imperial, etc.).",
    "useCases": [
      "Convert kilometers to miles for a road trip distance calculation",
      "Convert Celsius to Fahrenheit with the formula displayed for verification",
      "Batch-convert 100 MB to all data storage units (KB, GB, TB, etc.)",
      "Swap gallons and liters for a recipe measurement",
      "Save a frequently used conversion (e.g., pounds to kilograms) to the favorites panel",
      "Compare fuel economy between mpg and L/100km for car shopping"
    ],
    "instructions": [
      "Select a category from the 13 options (Length, Mass, Volume, etc.) using the icon grid.",
      "Enter a value in the source input; select the source and target units from their respective dropdowns.",
      "View the converted result with the mathematical formula shown below (e.g., \"°C × 9/5 + 32 = °F\").",
      "Click the swap button to exchange source and target units.",
      "Click the star icon to save the current conversion pair to your favorites for quick access.",
      "Use Batch Convert to see the input value converted to all units in the category in a single table."
    ],
    "examples": [
      "Input: Category Temperature, 100°C → °F → Output: 212°F, formula: (100 × 9/5) + 32 = 212",
      "Input: Category Data Storage, 1024 MB, Batch Convert → Output table: 0.0009766 TB, 1 GB, 1024 MB, 1073741824 bytes, etc."
    ],
    "bestPractices": [
      "Use Batch Convert when you need a value in multiple units (e.g., recipe scaling)",
      "Favorite conversions you use daily (e.g., cm ↔ inches, kg ↔ lbs) for one-click access",
      "Verify the formula shown to ensure you understand the conversion factor",
      "Double-check the category — Speed (km/h ↔ mph) and Fuel Economy (L/100km ↔ mpg) are different",
      "Use the swap button to quickly reverse a conversion rather than re-selecting units"
    ],
    "commonMistakes": [
      "Confusing Mass (kg, lb) with Force (N, lbf) — they share the \"pound\" name but are different categories",
      "Using the wrong Temperature scale — Fahrenheit and Celsius use linear offsets, not just factors",
      "Assuming 1 MB = 1000 KB (SI) vs. 1024 KB (binary) — the tool shows both where applicable",
      "Mixing US liquid volume (cups, fluid oz) with imperial volume (UK pints) — they differ",
      "Forgetting that Frequency (Hz) and Angular Velocity (rad/s) are related but not directly convertible without context"
    ],
    "faq": [
      "Does the converter handle binary prefixes (KiB, MiB) vs. decimal prefixes (KB, MB)? Yes — Data Storage shows both binary and decimal values in batch mode.",
      "Are conversion formulas always exact? Most are exact by definition (e.g., 1 inch = 25.4 mm). Some, like temperature, use exact formulas.",
      "Can I add custom units or categories? Custom units are not supported yet — use favorites to save frequently used conversion pairs.",
      "What precision is used? Results are displayed with up to 10 significant figures; very large or small numbers use scientific notation."
    ]
  },

"url-encoder": {
    "whatItDoes": "URL encoder and decoder supporting component-level encoding (encodeURIComponent) and full-URL encoding (encodeURI). Offers 3 character set options: all characters, unreserved only, or custom selection. Includes auto-detection of whether the input is encoded or plain, multiple output displays (encoded, decoded, component-encoded), URL validation, a special character reference table, and a history of the last 50 URL conversions.",
    "whyItExists": "Manually encoding or decoding URLs is error-prone, especially when dealing with special characters, non-ASCII text, or nested encoding. This tool provides all encoding variants alongside validation and reference material so developers can see exactly how their URL is transformed.",
    "whoShouldUse": "Web developers, API testers, QA engineers, and anyone who constructs or debug URLs containing query strings, paths, or user-submitted values.",
    "useCases": [
      "Encode a search query containing spaces and special characters for a URL query parameter",
      "Decode a percent-encoded URL from a server log to understand the original request",
      "Validate a URL structure to ensure it is well-formed before making an HTTP request",
      "Reference the special character encoding table (e.g., %20 for space, %26 for &) for manual encoding",
      "Compare component encoding vs. full URL encoding to understand when to use each",
      "Review recent encoding/decoding history to re-use a previous conversion"
    ],
    "instructions": [
      "Paste a URL or string into the input area — the tool auto-detects if it is encoded or plain text.",
      "Select the encoding mode: Encode (plain → encoded) or Decode (encoded → plain).",
      "Choose the character set: All Characters, Unreserved Only (letters, digits, -._~), or Custom (select specific chars to encode).",
      "Choose encoded output type: Full URL (encodeURI) or Component Only (encodeURIComponent).",
      "Review the results panel showing the encoded/decoded output, the original input, and the component-encoded version.",
      "Use the Special Characters reference table to look up the percent-encoding for any ASCII or Unicode character."
    ],
    "examples": [
      "Input: \"hello world & goodbye\" with Encode, Component Only → Output: \"hello%20world%20%26%20goodbye\"",
      "Input: \"https://example.com/search?q=cat%20food\" with Decode, auto-detect → Output: \"https://example.com/search?q=cat food\""
    ],
    "bestPractices": [
      "Use Component encoding (encodeURIComponent) for query parameter values, never Full URL encoding",
      "Use Full URL encoding (encodeURI) for the entire URL — it preserves scheme, host, and path structure",
      "Always validate the URL after encoding to ensure the result is still well-formed",
      "Review the special character table when debugging unexpected URL behavior",
      "Check the history panel if you need to re-encode the same value but forgot the result"
    ],
    "commonMistakes": [
      "Using Full URL encoding on a query parameter value — spaces in the value should be %20, not +",
      "Encoding an already-encoded URL (double encoding) — \"%20\" becomes \"%2520\"",
      "Decoding a full URL with component decoding — a & in the query string may be interpreted incorrectly",
      "Not encoding plus signs in values — a literal + should be %2B, not left as +",
      "Assuming Unicode characters are the same across all browsers — encoding ensures consistent interpretation"
    ],
    "faq": [
      "What is the difference between encodeURI and encodeURIComponent? encodeURI encodes the full URL preserving structural characters (:/?#[]@!$&'()*+,;=). encodeURIComponent encodes all characters including structural ones, making it safe for query parameter values.",
      "Can I decode a URL that has been encoded multiple times? Yes — but you need to decode it multiple times until no %xx sequences remain.",
      "What is the %20 vs + difference? %20 is the percent-encoded space; + is the application/x-www-form-urlencoded space (used in form submission, not URL encoding).",
      "Does the tool handle Unicode characters? Yes — Unicode characters are encoded as UTF-8 byte sequences (e.g., ñ → %C3%B1)."
    ]
  },

"url-parser": {
    "whatItDoes": "URL parser that breaks down any URL into its full component structure (protocol, host, port, pathname, search, hash, username, password, origin). Displays query parameters in a table with encoded/decoded value toggle, includes a URL builder for constructing URLs from components, supports encoding/decoding individual components, URL normalization (lowercase host, remove default ports, etc.), and resolves relative URLs against a base URL.",
    "whyItExists": "URLs contain many components and complex query strings that are hard to dissect manually. This tool provides a structured breakdown, query parameter table, and URL builder so developers can inspect, modify, and construct URLs with confidence.",
    "whoShouldUse": "Web developers, API integrators, security analysts, and anyone who works with URL parsing, manipulation, or debugging.",
    "useCases": [
      "Break down a complex URL to understand its components (protocol, host, query, hash)",
      "Parse query string parameters from a callback URL and see both encoded and decoded values",
      "Build a URL from scratch using the URL builder by filling in component fields",
      "Normalize a user-entered URL for consistent storage (lowercase host, remove default port)",
      "Resolve a relative URL (e.g., \"./about\") against a base URL to get the absolute URL",
      "Encode or decode individual components of a URL to fix encoding issues"
    ],
    "instructions": [
      "Paste a full URL into the input field; the parsed components appear immediately in a structured breakdown.",
      "Scroll to the Query Parameters table to see each parameter with its name, encoded value, and decoded value.",
      "Toggle the Show Decoded switch in the query table to see all decoded values at once.",
      "Use the URL Builder tab to construct a URL by filling in protocol, host, port, path, query, and hash fields.",
      "Click Normalize to lowercase the host, remove default ports (80/443), and decode unnecessary percent-encoding.",
      "In the Resolve tab, enter a base URL and a relative URL to compute the absolute result."
    ],
    "examples": [
      "Input: \"https://user:pass@api.example.com:8080/path/to/resource?name=hello%20world&page=1#section\" → Components: protocol https, host api.example.com, port 8080, username user, pathname /path/to/resource, query parameters [{name: \"hello world\"}, {page: \"1\"}], hash #section",
      "Input: base \"https://example.com/docs/\" and relative \"../images/logo.png\" → Resolved: \"https://example.com/images/logo.png\""
    ],
    "bestPractices": [
      "Use the query parameter table to inspect encoded values — many APIs double-encode query strings",
      "Check the decoded column in the query table to detect potentially malicious or malformed values",
      "Use the URL builder when constructing APIs endpoints to ensure all components are correctly placed",
      "Normalize URLs before storing them in a database to avoid duplicate entries for the same resource",
      "Use relative URL resolution to validate href attributes in HTML documents during migration"
    ],
    "commonMistakes": [
      "Assuming the port is always present — it is omitted for default ports (80 for HTTP, 443 for HTTPS)",
      "Treating the query string as a JSON object — duplicate keys are valid in URLs and appear as separate rows",
      "Forgetting that hash fragments are never sent to the server — they are client-side only",
      "Using the full URL parser for relative URLs — it requires an absolute URL; use the Resolve tab instead",
      "Overlooking the username:password@ syntax — modern browsers hide it, but the parser exposes it"
    ],
    "faq": [
      "Can it parse URLs without a protocol (e.g., \"example.com/path\")? No — a protocol is required. Prepend \"https://\" to parse protocol-relative URLs.",
      "What happens with internationalized domain names (IDN)? They are shown punycode-encoded (xn--) in the host field and decoded in a separate label.",
      "Are URL fragments retained during normalization? Yes — fragments are preserved unless explicitly removed via an option.",
      "How are duplicate query parameters displayed? Each occurrence is shown as a separate row in the query table with its original order preserved."
    ]
  },

"user-agent-parser": {
    "whatItDoes": "User agent parser that extracts browser name/version, rendering engine (Blink, WebKit, Gecko, Trident), operating system (name, version, architecture), device type (mobile, tablet, desktop, TV, console), and bot/crawler detection. Includes 10 preset user agent strings (Chrome, Firefox, Safari, Edge, Googlebot, Bingbot, etc.), side-by-side UA comparison, and one-click copy as JSON.",
    "whyItExists": "User agent strings are long, cryptic, and inconsistently formatted. This tool parses them into readable structured data so developers can make device-specific or browser-specific decisions without manually parsing UA strings.",
    "whoShouldUse": "Web developers, analytics engineers, QA testers, and anyone who needs to understand what browser, OS, or device is behind a user agent string for debugging or analytics.",
    "useCases": [
      "Parse a real user agent from server logs to identify the visitor's browser and OS",
      "Compare two user agent strings side-by-side to find differences in browser version or platform",
      "Detect if a user agent belongs to a known bot or crawler (Googlebot, Bingbot, etc.)",
      "Load preset UAs for Chrome, Firefox, Safari, Edge to test parsing accuracy",
      "Copy the parsed result as JSON for integration into an analytics pipeline",
      "Determine if the device is mobile, tablet, or desktop from the user agent string"
    ],
    "instructions": [
      "Paste a user agent string into the input field; the parsed result updates automatically.",
      "Review the parsed fields: Browser (name, version, engine), OS (name, version, architecture), Device (type, vendor, model), and Bot (boolean + name).",
      "Click a preset button (Chrome, Firefox, Safari, Edge, Googlebot, Bingbot, etc.) to load a sample UA string.",
      "Use the Compare button to load the UA string into a side-by-side comparison view with another UA.",
      "Click Copy JSON to copy the entire parsed result as a JSON object to your clipboard.",
      "Check the Bot Detection section to see if the UA is identified as a known crawler with its specific name."
    ],
    "examples": [
      "Input: \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\" → Browser: Chrome 120, Engine: Blink 120, OS: Windows 10 64-bit, Device: Desktop, Bot: No",
      "Input: \"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)\" → Browser: Googlebot 2.1, OS: unknown, Device: unknown, Bot: Yes (Googlebot)"
    ],
    "bestPractices": [
      "Use parsed OS and device data for analytics segmentation, not for feature detection (use feature detection instead)",
      "Compare multiple UA presets to understand how different browsers format their user agent strings",
      "Use the JSON export to feed parsed UA data into data warehouses or analytics platforms",
      "Check bot detection when filtering traffic — some legitimate UAs may not be in the bot list",
      "Test with real user agents from production logs, not just the presets"
    ],
    "commonMistakes": [
      "Using user agent detection for feature availability — use feature detection APIs (e.g., Modernizr) instead",
      "Assuming a mobile user agent always means a mobile screen — tablets also send mobile UAs in some modes",
      "Treating the browser version number as a simple integer — versions can be semantic (e.g., 120.0.6099.109)",
      "Relying solely on user agent for bot detection — some bots disguise their UA as a real browser",
      "Confusing the rendering engine with the browser — Safari uses WebKit, Chrome uses Blink (forked from WebKit)"
    ],
    "faq": [
      "Can it parse iOS user agents? Yes — iOS Safari, Chrome, and other browsers are parsed correctly with OS name \"iOS\" and device model like \"iPhone\" or \"iPad\".",
      "How accurate is bot detection? It detects over 50 known crawlers (Googlebot, Bingbot, DuckDuckBot, Yandex, Baidu, Slurp, etc.) by matching patterns in the UA string.",
      "Does it support custom UA databases? Not yet — the parser uses a built-in rule set updated for modern browsers.",
      "What does \"engine\" mean? Engine is the browser rendering engine (Blink, WebKit, Gecko, Trident) which determines CSS/HTML feature support independent of the browser vendor."
    ]
  },

"uuid-generator": {
    "whatItDoes": "UUID generator supporting versions v4 (random), v7 (time-ordered), and v1 (MAC-based timestamp). Generates bulk UUIDs up to 10,000 with a progress bar, supports format options (hyphens, uppercase, curly braces, base64), exports generated UUIDs as JSON, CSV, or TSV. Includes UUID validation (checking format and version), Snowflake ID generation (with custom worker/datacenter ID), NanoID generation (custom alphabet and length), and an auto-refresh timer.",
    "whyItExists": "Generating UUIDs for databases, APIs, and distributed systems requires both individual and bulk creation with specific formatting and export needs. This tool provides all common UUID versions plus Snowflake and NanoID in a single interface.",
    "whoShouldUse": "Backend developers, database architects, systems engineers, and anyone who needs UUIDs, Snowflake IDs, or NanoIDs for primary keys, distributed tracing, or unique identifiers.",
    "useCases": [
      "Generate a single v4 UUID for a new database record's primary key",
      "Generate 5000 v7 UUIDs (time-ordered) for bulk insert into a PostgreSQL table with better index performance",
      "Validate a UUID string from an API request to ensure it matches the expected version",
      "Generate a Snowflake ID with custom worker and datacenter IDs for distributed logging",
      "Create NanoIDs with a custom alphabet for short, URL-safe identifiers",
      "Export generated UUIDs as CSV for importing into a spreadsheet or database batch job"
    ],
    "instructions": [
      "Select a UUID version: v4 (random), v7 (time-ordered), or v1 (MAC-based).",
      "Set the quantity (1–10,000) using the slider or numeric input; a progress bar shows generation progress.",
      "Choose format options: hyphens on/off, uppercase/lowercase, wrap in curly braces, or output as base64.",
      "Click Generate to produce the UUIDs; the list appears in the output area with a copy-all button.",
      "Click Export and choose JSON, CSV, or TSV format to download the UUIDs as a file.",
      "Switch to Snowflake or NanoID tabs to generate those identifier types with their specific options."
    ],
    "examples": [
      "Input: v4, 1 UUID, hyphens, lower → Output: \"550e8400-e29b-41d4-a716-446655440000\"",
      "Input: v7, 3 UUIDs, no hyphens, upper → Output: [\"018F9A2B3C4D5E6F7A8B9C0D\", \"018F9A2B3C4D5E6F7A8B9C0E\", \"018F9A2B3C4D5E6F7A8B9C0F\"]"
    ],
    "bestPractices": [
      "Use v7 UUIDs for database primary keys — their time-ordered nature improves B-tree index performance",
      "Use v4 UUIDs when unpredictability is required (e.g., security tokens, session IDs)",
      "Use Snowflake IDs when you need a time-sortable 64-bit integer instead of a 128-bit UUID",
      "Validate UUIDs from external sources before using them in database queries to prevent injection",
      "Use the auto-refresh timer when you need a constantly updated test UUID during development"
    ],
    "commonMistakes": [
      "Using v1 UUIDs in security contexts — they include the MAC address and timestamp, which can be exploited",
      "Assuming all UUIDs are 36 characters with hyphens — format varies by application",
      "Using UUIDs as primary keys in large tables without considering index bloat (v7 helps with this)",
      "Generating too many UUIDs client-side (browser may hang above 50,000 — limit is 10,000 for safety)",
      "Forgetting that Snowflake IDs require unique worker/datacenter IDs to avoid collisions in distributed systems"
    ],
    "faq": [
      "What is the difference between v4, v7, and v1 UUIDs? v4 is fully random; v7 is time-ordered (first 48 bits = timestamp) with random suffix; v1 uses MAC address + timestamp for uniqueness.",
      "Can v7 UUIDs be sorted by creation time? Yes — the time-ordered prefix means v7 UUIDs sort chronologically, improving database index performance.",
      "What is a Snowflake ID? A 64-bit ID popularized by Twitter: 41-bit timestamp + 10-bit worker ID + 12-bit sequence. It fits in a 64-bit integer and is time-sortable.",
      "What is NanoID? A compact, URL-safe, customizable unique ID. Unlike UUIDs, you choose the alphabet and length (default: 21 characters with A-Za-z0-9_-)."
    ]
  },

"word-counter": {
    "whatItDoes": "Word counter computing 12+ statistics: words, characters (with/without spaces), sentences, paragraphs, lines, syllables, average word length, average sentence length, unique words, and longest/shortest word. Includes readability scores (Flesch-Kincaid, Gunning Fog), word frequency table with counts, keyword density analysis, letter density distribution chart, estimated reading time (slow/average/fast), and a word goal progress bar with configurable target.",
    "whyItExists": "Basic word counters miss important metrics like readability, keyword density, and reading time. This tool provides a comprehensive dashboard so writers and editors can assess all aspects of their text in a single view.",
    "whoShouldUse": "Writers, editors, SEO content strategists, students, and anyone who needs detailed word-level analytics for essays, articles, reports, or creative writing.",
    "useCases": [
      "Track word count progress toward a daily writing goal with the goal progress bar",
      "Analyze keyword density in a blog post to ensure target keywords are not overused",
      "Review the word frequency table to identify overused words and vary vocabulary",
      "Calculate reading time for an article to match the target audience's attention span",
      "Check readability scores to ensure content matches the desired grade level",
      "Use the letter density chart to identify character distribution for typography analysis"
    ],
    "instructions": [
      "Paste or type text into the input area; all statistics update in real time.",
      "Scroll through the Stats section to see words, characters, sentences, paragraphs, lines, and syllables.",
      "Set a word goal target in the Goal section — the progress bar fills and turns green when reached.",
      "Review the Word Frequency table sorted by frequency (highest first) to see which words are most common.",
      "Check Keyword Density by entering a target keyword; the tool shows its occurrence count and density percentage.",
      "View the Reading Time section showing estimated read time at slow (150 wpm), average (250 wpm), and fast (350 wpm) speeds."
    ],
    "examples": [
      "Input: \"The quick brown fox jumps over the lazy dog. This sentence has exactly ten words.\" → Stats: 15 words, 72 chars, 2 sentences, 1 paragraph; Avg word length: 3.9; Reading time: ~3 seconds (average)",
      "Input: \"SEO SEO SEO content writing tips for SEO bloggers\" with keyword \"SEO\" → Word freq: SEO=4, writing=1...; Keyword density: SEO = 44.4% (4 of 9 words)"
    ],
    "bestPractices": [
      "Set a word goal before starting to write and use the progress bar for motivation",
      "Check keyword density for your primary and secondary keywords — aim for 1-3% density for SEO",
      "Use the word frequency table to identify filler words (very, really, just, that) for editing",
      "Use reading time to set reader expectations — aim for 5-7 minutes for blog posts",
      "Track average sentence length — sentences above 25 words may harm readability scores"
    ],
    "commonMistakes": [
      "Counting hyphenated compound words as one vs. two words — the counter treats them as one word",
      "Assuming reading time is fixed — it varies by reading speed; check all three speeds (150/250/350 wpm)",
      "Ignoring readability scores entirely — high word count with low readability wastes readers' time",
      "Treating all characters equally — CJK characters and emoji are each counted as one character",
      "Forgetting to check unique word count — high total words + low unique words = repetitive vocabulary"
    ],
    "faq": [
      "How are words defined? Words are sequences of characters separated by whitespace or punctuation. Hyphenated compounds count as one word.",
      "What readability formulas are used? Flesch-Kincaid Grade Level and Gunning Fog Index — both output a US school grade level (e.g., 8.5 = 8th grade).",
      "Does the counter handle non-English text? Yes — Unicode text including CJK, Arabic, and Cyrillic is supported. Syllable counting works best for English.",
      "Can I track multiple word goals? The tool supports one word goal at a time; reset it when starting a new document."
    ]
  },

"xml-formatter": {
    "whatItDoes": "XML formatter supporting indent options of 2 spaces, 4 spaces, or tabs with minification mode that strips all whitespace. Removes XML comments optionally, controls self-closing element style (<tag/> vs. <tag></tag>), sorts attributes alphabetically, chooses single or double quotes for attribute values, toggles XML declaration inclusion, and validates well-formedness with error reporting.",
    "whyItExists": "XML files from different sources have wildly inconsistent formatting. This tool normalizes any XML to a consistent style while validating its structure, helping teams maintain readable and uniform XML across their projects.",
    "whoShouldUse": "Backend developers, configuration engineers, DevOps practitioners, and anyone who creates or maintains XML configuration files, data exchanges, or SOAP messages.",
    "useCases": [
      "Format a minified XML API response into readable indented XML for debugging",
      "Minify an XML config file before deployment to save space in a container image",
      "Sort attributes alphabetically in all elements for consistent markup",
      "Strip comments from an XML file before sharing it with external partners",
      "Validate an XML string for well-formedness with precise error line/column reporting",
      "Standardize attribute quotes from single to double across an entire XML document"
    ],
    "instructions": [
      "Paste or type XML content into the input area.",
      "Select indent: 2 spaces, 4 spaces, or tab.",
      "Toggle options: Remove Comments (strips <!-- -->), Self-Closing (/> vs. <tag></tag>), Sort Attributes (alphabetical), Quote Style (single or double), and XML Declaration (include <?xml?> or not).",
      "Click Format to process; the formatted output appears in the result panel.",
      "Check the Validation section for well-formedness status — errors show line number, column, and description.",
      "Click Copy to copy the formatted XML or Download to save as .xml file."
    ],
    "examples": [
      "Input: \"<root><item id=\\\"1\\\" name=\\\"test\\\"><![CDATA[hello]]></item></root>\" (2-space indent, sort attributes, double quotes) → Output: \"<root>\\n  <item id=\\\"1\\\" name=\\\"test\\\">\\n    <![CDATA[hello]]>\\n  </item>\\n</root>\"",
      "Input: invalid XML \"<root><item>text</item>\" → Validation: \"Error at line 1 column 23: XML document must have a root element that encloses all content\""
    ],
    "bestPractices": [
      "Always validate XML after formatting — formatting can surface hidden well-formedness issues",
      "Use Sort Attributes for large configuration files to make attributes predictable",
      "Remove comments before sharing XML externally to avoid leaking internal notes",
      "Use 2-space indent for deeply nested XML to keep line lengths reasonable",
      "Use Self-Closing style for empty elements to reduce file size"
    ],
    "commonMistakes": [
      "Assuming formatted XML is always valid — formatting does not fix well-formedness errors",
      "Using tabs for indent in XML that will be processed by tools expecting spaces (or vice versa)",
      "Removing the XML declaration when it is required by the consuming parser",
      "Forgetting to handle CDATA sections — the formatter preserves them but does not validate their content",
      "Sorting attributes in XML where attribute order is semantically meaningful (rare, but possible)"
    ],
    "faq": [
      "Does it preserve CDATA sections? Yes — CDATA sections are preserved and indented as block content.",
      "What validation checks are performed? Well-formedness checks: matching start/end tags, proper nesting, valid attribute syntax, entity references, and encoding declarations.",
      "Can it format XML without a root element? No — the input must be well-formed XML with a single root element.",
      "Does it handle namespaces? Yes — namespace prefixes and xmlns attributes are preserved and sorted along with other attributes."
    ]
  },

"yaml-formatter": {
    "whatItDoes": "Bidirectional YAML ↔ JSON converter with indent options (2 or 4 spaces), quote style for YAML output (minimal, single, double), null value format (null, ~, empty), boolean format (true/false, yes/no, on/off), line wrapping control, and YAML validation with syntax error reporting.",
    "whyItExists": "YAML and JSON serve different use cases but share a data model. This converter provides fine-grained control over YAML output style while ensuring the data round-trips correctly between both formats.",
    "whoShouldUse": "DevOps engineers, CI/CD pipeline maintainers, configuration managers, and backend developers who convert between YAML and JSON for different tools in their stack.",
    "useCases": [
      "Convert a Kubernetes YAML manifest to JSON for use with the Kubernetes API",
      "Translate a JSON configuration file to YAML for a Docker Compose or Ansible playbook",
      "Validate a YAML file for syntax errors with precise error reporting",
      "Export JSON data to YAML with specific null and boolean formatting for a legacy tool",
      "Normalize YAML styling (quote style, indent) across a repository of configuration files",
      "Round-trip test data by converting YAML → JSON → YAML to verify data integrity"
    ],
    "instructions": [
      "Paste YAML or JSON content into the input area — format is auto-detected.",
      "Select the target format: YAML (from JSON) or JSON (from YAML).",
      "Configure output options: for YAML — indent (2/4), quote style (minimal/single/double), null format (null/~ /empty), boolean format (true-false/yes-no/on-off), and line width.",
      "Click Convert; the output appears in the result panel with syntax highlighting.",
      "Check the Validation section for any YAML syntax errors with line and column numbers.",
      "Click Copy to copy the result or Download to save as .yaml or .json."
    ],
    "examples": [
      "Input (JSON): {\"server\": {\"host\": \"localhost\", \"port\": 8080, \"debug\": false}} → Output (YAML, minimal quotes, 2 indent): \"server:\\n  host: localhost\\n  port: 8080\\n  debug: false\"",
      "Input (YAML): \"server:\\n  host: localhost\\n  port: 8080\" → Output (JSON): {\"server\": {\"host\": \"localhost\", \"port\": 8080}}"
    ],
    "bestPractices": [
      "Use minimal quotes for YAML output when no special characters are present — it produces the cleanest files",
      "Use single or double quotes when values contain YAML special characters (:, #, !, {, [, etc.)",
      "Always validate YAML output after conversion to catch indentation or quoting issues",
      "Use line wrapping for long string values to keep YAML files readable under 80-120 characters",
      "Round-trip test critical configuration: YAML → JSON → YAML should produce semantically identical output"
    ],
    "commonMistakes": [
      "Assuming YAML indentation level is 2 spaces everywhere — some projects use 4; the tool supports both",
      "Using tabs for YAML indentation — YAML indentation must be spaces (the tool enforces this)",
      "Forgetting that YAML has special handling for certain strings — true/false, yes/no, null are typed booleans/null unless quoted",
      "Converting without checking for data loss — JSON numbers beyond Number.MAX_SAFE_INTEGER lose precision in YAML",
      "Not escaping colons in YAML values — unquoted values containing \": \" are parsed as mappings"
    ],
    "faq": [
      "Does it preserve YAML comments? No — YAML comments are discarded during parsing. Only the data structure is preserved.",
      "What is the difference between null and ~ in YAML? Both represent null values; ~ is more explicit, null is more readable. The tool formats nulls according to your selection.",
      "Can it handle multi-document YAML (--- separator)? Yes — but only the first document is converted; multi-doc output to JSON is not supported.",
      "Does the converter preserve key order? Yes — key order from the input is preserved in the output (JSON objects are insertion-ordered in modern parsers)."
    ]
  },

"xml-to-json": {
    "whatItDoes": "XML to JSON converter with configurable attribute handling (prefix with @, merge into children) and text content mode (as #text key, auto-merge, or ignore). Supports array detection via repeated elements at the same level, automatic number conversion (strings containing only digits become numbers), boolean auto-conversion (\"true\"/\"false\" → true/false), and XML namespace handling (strip or prefix).",
    "whyItExists": "XML and JSON have fundamentally different data models — XML has attributes, text nodes, and mixed content that have no direct JSON equivalent. This tool bridges the gap by providing multiple strategies for mapping XML features to JSON structures.",
    "whoShouldUse": "Backend developers, API integrators, data engineers, and anyone migrating XML-based services or data feeds to JSON-based platforms.",
    "useCases": [
      "Convert a SOAP XML response to JSON for use in a modern REST API client",
      "Migrate legacy XML configuration files to JSON for a new microservice architecture",
      "Parse an RSS/Atom XML feed into JSON for a JavaScript frontend application",
      "Convert deeply nested XML to JSON with attribute prefix (@) for clear distinction",
      "Auto-convert XML string numbers (\"123\") and booleans (\"true\" → true) to native JSON types",
      "Handle XML namespaces by stripping or preserving them as JSON keys"
    ],
    "instructions": [
      "Paste XML content into the input area — the structure is parsed and displayed as a tree overview.",
      "Select Attribute Handling: Prefix with @ (e.g., @id), Merge (attributes become siblings of child elements), or Ignore.",
      "Select Text Content Mode: #text key (text becomes a \"#text\" property), Auto-merge (inline text merges with adjacent elements), or Ignore.",
      "Toggle Array Detection on — repeated sibling elements become JSON arrays instead of overwriting.",
      "Toggle Auto-convert: Number conversion and Boolean conversion to automatically cast string values.",
      "Click Convert to generate JSON output; use Copy or Download to save the result."
    ],
    "examples": [
      "Input: \"<person id=\\\"123\\\"><name>John</name><age>30</age><active>true</active></person>\" with @ prefix, #text mode, auto-convert → Output: {\"person\": {\"@id\": \"123\", \"name\": \"John\", \"age\": 30, \"active\": true}}",
      "Input: \"<root><item>a</item><item>b</item><item>c</item></root>\" with array detection → Output: {\"root\": {\"item\": [\"a\", \"b\", \"c\"]}}"
    ],
    "bestPractices": [
      "Use @ prefix for attributes to clearly distinguish them from child elements in the JSON output",
      "Enable array detection for elements that may appear multiple times to avoid data loss",
      "Enable auto-convert for number and boolean values when the source XML uses strings that represent primitives",
      "Use Auto-merge text mode when elements have only simple text content (no mixed content)",
      "Review the output JSON structure after conversion — XML-to-JSON mapping can produce unexpected nesting"
    ],
    "commonMistakes": [
      "Disabling array detection when elements can repeat — only the last occurrence will be preserved",
      "Using Ignore text mode on elements with mixed content (text + child elements), causing data loss",
      "Assuming XML attributes and child elements can be merged without conflict — attribute namespaces may collide",
      "Enabling auto-convert for fields that should remain strings (e.g., zip codes, phone numbers with leading zeros)",
      "Forgetting that XML namespaces create verbose keys — consider using strip namespaces option"
    ],
    "faq": [
      "What happens with mixed content (text + child elements)? Text content is captured in #text key when using that mode. Auto-merge mode interleaves text and child elements in the order they appear.",
      "How are XML namespaces handled? Two options: Strip (removes all namespace prefixes) or Prefix (preserves them as part of the key, e.g., \"ns:tag\").",
      "Can I convert JSON back to XML? No — this is a one-way XML → JSON conversion. Use a separate XML builder for the reverse.",
      "What determines array membership? Any element that appears as a sibling with the same name at the same level is treated as an array — not just two or more occurrences, but potential repetition."
    ]
  }

};

export function getToolContent(slug: string): ToolContent | null {
  const content = contentMap[slug];
  if (content) return content;
  return null;
}
