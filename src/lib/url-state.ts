import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

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

  const state = useMemo(() => {
    if (searchParams) {
      return { ...initialState, ...deserializeState(searchParams) };
    }
    return initialState;
  }, [searchParams, initialState]);

  const updateState = useCallback((updates: Partial<ToolState>) => {
    const currentParams = new URLSearchParams(searchParams?.toString() || "");
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined || value === "") {
        currentParams.delete(key);
      } else {
        currentParams.set(key, String(value));
      }
    }
    const newUrl = `${pathname}?${currentParams.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [router, pathname, searchParams]);

  const clearState = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

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