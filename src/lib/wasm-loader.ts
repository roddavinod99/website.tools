"use client";

interface WasmModule {
  json_format: (input: string, indent: number) => string;
  json_minify: (input: string) => string;
  json_validate: (input: string) => boolean;
  default: () => Promise<void>;
}

let wasmModule: WasmModule | null = null;
let wasmLoading = false;
let wasmError = false;

export async function loadWasm(): Promise<WasmModule | null> {
  if (wasmModule) return wasmModule;
  if (wasmError) return null;
  if (wasmLoading) return null;

  wasmLoading = true;
  try {
    // @ts-expect-error - WASM package must be built with `wasm-pack build` first
    const mod: WasmModule = await import("../../wasm/pkg/website_tools_wasm.js");
    await mod.default();
    wasmModule = mod;
    return wasmModule;
  } catch {
    wasmError = true;
    return null;
  } finally {
    wasmLoading = false;
  }
}

export async function wasmJsonFormat(input: string, indent = 2): Promise<string | null> {
  const wasm = await loadWasm();
  if (!wasm) return null;
  return wasm.json_format(input, indent);
}

export async function wasmJsonMinify(input: string): Promise<string | null> {
  const wasm = await loadWasm();
  if (!wasm) return null;
  return wasm.json_minify(input);
}

export async function wasmJsonValidate(input: string): Promise<boolean | null> {
  const wasm = await loadWasm();
  if (!wasm) return null;
  return wasm.json_validate(input);
}
