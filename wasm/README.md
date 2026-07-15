# Website.Tools WASM Modules

This directory contains Rust + WebAssembly modules for performance-critical operations.

## Prerequisites

- [Rust](https://rustup.rs/)
- `wasm-pack`: `cargo install wasm-pack`

## Build

```bash
wasm-pack build --target web --release
```

## Usage

```javascript
import init, { json_format, json_minify } from "./pkg/website_tools_wasm.js";

await init();
const formatted = json_format('{"a":1}', 2);
```

## When to use WASM

Only introduce WASM when profiling demonstrates meaningful improvements over TypeScript for:
- JSON parsing/formatting of very large files (>1MB)
- Image processing operations
- Cryptographic operations
- Compression/decompression

Never rewrite working TypeScript without measurable benchmarks.
