// WASM module wrapper for website-tools-wasm
// Dynamically imports WASM only on client side to avoid SSR issues

type WasmModule = {
  json_format: (input: string, indent: number) => string;
  json_minify: (input: string) => string;
  json_validate: (input: string) => boolean;
};

let wasmModule: WasmModule | null = null;

async function loadWasm(): Promise<WasmModule> {
  if (wasmModule) return wasmModule;
  
  // Only load WASM on client side
  if (typeof window === 'undefined') {
    throw new Error('WASM can only be loaded on the client side');
  }
  
  const mod = await import('./pkg/website_tools_wasm.js');
  wasmModule = {
    json_format: mod.json_format,
    json_minify: mod.json_minify,
    json_validate: mod.json_validate,
  };
  return wasmModule;
}

export async function jsonFormatWasm(input: string, indent: number): Promise<string> {
  const mod = await loadWasm();
  return mod.json_format(input, indent);
}

export async function jsonMinifyWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.json_minify(input);
}

export async function jsonValidateWasm(input: string): Promise<boolean> {
  const mod = await loadWasm();
  return mod.json_validate(input);
}