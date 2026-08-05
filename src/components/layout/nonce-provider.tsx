"use client";

import { createContext, useContext, useState } from "react";

const NonceContext = createContext<string | null>(null);

function getNonceFromDOM(): string | null {
  if (typeof document === "undefined") return null;
  return document.querySelector('meta[name="csp-nonce"]')?.getAttribute("content") ?? null;
}

export function NonceProvider({ children }: { children: React.ReactNode }) {
  const [nonce] = useState<string | null>(() => getNonceFromDOM());

  return (
    <NonceContext.Provider value={nonce}>
      {children}
    </NonceContext.Provider>
  );
}

export function useNonce(): string | null {
  return useContext(NonceContext);
}