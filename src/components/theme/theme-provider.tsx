"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { getStorageItem } from "@/lib/client-storage";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const theme = getStorageItem("theme");
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return <>{children}</>;
}
