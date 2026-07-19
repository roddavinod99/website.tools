function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getStorageItem(key: string): string | null {
  if (!isClient()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorageItem(key: string, value: string): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // quota exceeded or other storage error
  }
}

export function removeStorageItem(key: string): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // silently fail
  }
}

export function getStorageJSON<T>(key: string): T | null {
  const raw = getStorageItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStorageJSON(key: string, value: unknown): void {
  try {
    setStorageItem(key, JSON.stringify(value));
  } catch {
    // serialization error
  }
}
