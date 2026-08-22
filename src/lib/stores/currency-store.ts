"use client";

import { useSyncExternalStore, useCallback } from "react";
import { DEFAULT_CURRENCY_CODE } from "@/lib/data/currencies";

const GLOBAL_STORAGE_KEY = "finance-currency";
const toolCaches = new Map<string, string>();
const toolListeners = new Map<string, Set<() => void>>();
let globalStorageListenerAttached = false;

function getStorageKey(toolSlug?: string): string {
  return toolSlug ? `finance-currency-${toolSlug}` : GLOBAL_STORAGE_KEY;
}

function readStored(toolSlug?: string): string {
  const key = getStorageKey(toolSlug);
  let cache = toolCaches.get(key);
  if (cache !== undefined) return cache;
  if (typeof window === "undefined") return DEFAULT_CURRENCY_CODE;
  try {
    const stored = localStorage.getItem(key);
    cache = stored ?? (toolSlug ? readStored() : DEFAULT_CURRENCY_CODE);
  } catch {
    cache = toolSlug ? readStored() : DEFAULT_CURRENCY_CODE;
  }
  toolCaches.set(key, cache);
  return cache ?? DEFAULT_CURRENCY_CODE;
}

function writeStored(code: string, toolSlug?: string) {
  const key = getStorageKey(toolSlug);
  toolCaches.set(key, code);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, code);
  } catch {
    // ignore
  }
  const listeners = toolListeners.get(key);
  if (listeners) {
    listeners.forEach((l) => l());
  }
  if (toolSlug) {
    const globalListeners = toolListeners.get(GLOBAL_STORAGE_KEY);
    if (globalListeners) {
      globalListeners.forEach((l) => l());
    }
  }
}

function getListeners(key: string): Set<() => void> {
  if (!toolListeners.has(key)) {
    toolListeners.set(key, new Set());
  }
  return toolListeners.get(key)!;
}

function attachStorageListener() {
  if (globalStorageListenerAttached || typeof window === "undefined") return;
  globalStorageListenerAttached = true;
  window.addEventListener("storage", handleStorage);
}

function handleStorage(event: StorageEvent) {
  if (!event.key?.startsWith("finance-currency")) return;
  const newValue = event.newValue ?? DEFAULT_CURRENCY_CODE;
  toolCaches.set(event.key, newValue);
  const listeners = toolListeners.get(event.key);
  if (listeners) {
    listeners.forEach((l) => l());
  }
}

function subscribe(key: string, listener: () => void) {
  attachStorageListener();
  const listeners = getListeners(key);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(key: string): string {
  return readStored(key === GLOBAL_STORAGE_KEY ? undefined : key.replace("finance-currency-", ""));
}

function getServerSnapshot(): string {
  return DEFAULT_CURRENCY_CODE;
}

export function useCurrency(toolSlug?: string) {
  const storageKey = getStorageKey(toolSlug);
  const currency = useSyncExternalStore(
    (listener) => subscribe(storageKey, listener),
    () => getSnapshot(storageKey),
    getServerSnapshot
  );
  const setCurrency = useCallback((code: string) => writeStored(code, toolSlug), [toolSlug]);
  return { currency, setCurrency };
}