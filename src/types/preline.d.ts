// Preline UI — global types for the imperative HSStaticMethods API.
// Preline's open-source distribution is HTML+data-attributes + a single
// JS bootstrap (window.HSStaticMethods), not a React component library.
// We do not re-export any Preline symbols here; the provider component
// uses `window.HSStaticMethods.autoInit()` to wire up the data-attribute
// behaviour for dropdowns, modals, tabs, etc.

export {};

declare global {
  interface Window {
    HSStaticMethods?: {
      autoInit: (collection?: string) => void;
    };
  }
}
