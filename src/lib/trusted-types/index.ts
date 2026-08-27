"use client";

import DOMPurify from "isomorphic-dompurify";

interface TrustedTypes {
  createPolicy(
    policyName: string,
    policyOptions: {
      createHTML?: (input: string) => string;
      createScriptURL?: (input: string) => string;
      createScript?: (input: string) => string;
    }
  ): TrustedTypePolicy;
  getPolicy(policyName: string): TrustedTypePolicy | undefined;
}

interface TrustedTypePolicy {
  createHTML(input: string): string;
  createScriptURL(input: string): string;
  createScript(input: string): string;
}

declare global {
  interface Window {
    trustedTypes: TrustedTypes | undefined;
  }
}

export function initTrustedTypes(): void {
  if (typeof window === "undefined" || typeof window.trustedTypes === "undefined") {
    return;
  }

  if (window.trustedTypes.getPolicy("dompurify")) {
    return;
  }

  window.trustedTypes.createPolicy("dompurify", {
    createHTML: (input: string): string => {
      return DOMPurify.sanitize(input, { RETURN_DOM_FRAGMENT: false });
    },
    createScriptURL: (input: string): string => {
      return DOMPurify.sanitize(input, { ALLOW_UNKNOWN_PROTOCOLS: true });
    },
    createScript: (input: string): string => {
      return DOMPurify.sanitize(input);
    },
  });
}

if (typeof window !== "undefined") {
  initTrustedTypes();
}