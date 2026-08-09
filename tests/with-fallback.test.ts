import { describe, it, expect } from "vitest";
import { tryWasm } from "@/lib/wasm/with-fallback";

describe("tryWasm fallback", () => {
  it("returns wasm result when wasm succeeds", async () => {
    const result = await tryWasm(async () => "wasm-value", async () => "fallback-value");
    expect(result).toBe("wasm-value");
  });

  it("uses fallback when wasm throws", async () => {
    const result = await tryWasm(
      async () => { throw new Error("wasm unavailable"); },
      async () => "fallback-value",
    );
    expect(result).toBe("fallback-value");
  });

  it("uses fallback when wasm rejects", async () => {
    const result = await tryWasm(
      async () => Promise.reject(new Error("boom")),
      async () => "fallback-value",
    );
    expect(result).toBe("fallback-value");
  });

  it("propagates fallback errors (no double masking)", async () => {
    await expect(
      tryWasm(
        async () => { throw new Error("wasm-error"); },
        async () => { throw new Error("fallback-error"); },
      ),
    ).rejects.toThrow("fallback-error");
  });

  it("does not call fallback when wasm succeeds", async () => {
    let fallbackCalls = 0;
    await tryWasm(
      async () => 1,
      async () => { fallbackCalls += 1; return 2; },
    );
    expect(fallbackCalls).toBe(0);
  });

  it("calls fallback only after wasm failure", async () => {
    let fallbackCalls = 0;
    const result = await tryWasm(
      async () => { throw new Error("no wasm"); },
      async () => { fallbackCalls += 1; return 42; },
    );
    expect(result).toBe(42);
    expect(fallbackCalls).toBe(1);
  });
});