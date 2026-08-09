export async function tryWasm<T>(wasm: () => T | Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  try {
    return await wasm();
  } catch {
    return await fallback();
  }
}