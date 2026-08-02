import { useEffect } from "react";

export type ToolShortcutAction = "run" | "copy" | "minify" | "validate";

const EVENTS: Record<ToolShortcutAction, string> = {
  run: "tool:run",
  copy: "tool:copy",
  minify: "tool:minify",
  validate: "tool:validate",
};

/**
 * Subscribe a tool component to a global keyboard shortcut dispatched from the
 * tool page wrapper (Cmd/Ctrl+Enter, Cmd/Ctrl+Shift+C/M/V). Tools that do not
 * subscribe simply ignore the event, so the shortcut is always safe.
 */
export function useToolShortcut(
  action: ToolShortcutAction,
  handler: () => void
): void {
  useEffect(() => {
    const listener = () => handler();
    window.addEventListener(EVENTS[action], listener);
    return () => window.removeEventListener(EVENTS[action], listener);
  }, [action, handler]);
}

/**
 * Fired from the tool page wrapper when a registered shortcut is pressed.
 * Components that support the action subscribe via `useToolShortcut`.
 */
export function dispatchToolShortcut(action: ToolShortcutAction): void {
  window.dispatchEvent(new CustomEvent(EVENTS[action]));
}

export function isToolShortcutEvent(
  e: KeyboardEvent,
  key: string,
  shift: boolean
): boolean {
  if (!(e.metaKey || e.ctrlKey)) return false;
  if (e.altKey) return false;
  return e.shiftKey === shift && e.key === key;
}
