// WASM module wrapper for website-tools-wasm

import init, { json_format, json_minify, json_validate } from './pkg/website_tools_wasm.js';

let wasmInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initWasm(): Promise<void> {
  if (wasmInitialized) return;
  
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      // Initialize the WASM module
      await init();
      wasmInitialized = true;
    } catch (error) {
      console.error('Failed to initialize WASM module:', error);
      throw error;
    }
  })();
  
  return initPromise;
}

export async function jsonFormatWasm(input: string, indent: number): Promise<string> {
  await initWasm();
  return json_format(input, indent);
}

export async function jsonMinifyWasm(input: string): Promise<string> {
  await initWasm();
  return json_minify(input);
}

export async function jsonValidateWasm(input: string): Promise<boolean> {
  await initWasm();
  return json_validate(input);
}