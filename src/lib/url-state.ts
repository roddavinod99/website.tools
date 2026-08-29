import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type ToolState = Record<string, string | number | boolean | null>;

export function serializeState(state: ToolState): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(state)) {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export function deserializeState(searchParams: URLSearchParams): ToolState {
  const state: ToolState = {};
  for (const [key, value] of searchParams.entries()) {
    const lower = value.toLowerCase();
    if (lower === "true") state[key] = true;
    else if (lower === "false") state[key] = false;
    else if (!isNaN(Number(value)) && value.trim() !== "") state[key] = Number(value);
    else state[key] = value;
  }
  return state;
}

export function useToolUrlState(initialState: ToolState = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<ToolState>(() => {
    if (typeof window !== "undefined" && searchParams) {
      return { ...initialState, ...deserializeState(searchParams) };
    }
    return initialState;
  });

  useEffect(() => {
    if (searchParams) {
      const urlState = deserializeState(searchParams);
      setState((prev) => ({ ...prev, ...urlState }));
    }
  }, [searchParams]);

  const updateState = useCallback((updates: Partial<ToolState>) => {
    setState((prev) => {
      const newState: ToolState = { ...prev };
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          delete newState[key];
        } else {
          newState[key] = value;
        }
      }
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(newState)) {
        if (value !== null && value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      }
      const newUrl = `${pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
      return newState;
    });
  }, [router, pathname]);

  const clearState = useCallback(() => {
    setState(initialState);
    router.replace(pathname, { scroll: false });
  }, [router, pathname, initialState]);

  return { state, updateState, clearState };
}

export function createShareableUrl(baseUrl: string, state: ToolState): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(state)) {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}