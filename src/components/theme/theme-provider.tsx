"use client";

import { useLayoutEffect, type ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      if (theme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (theme === "dark") {
        document.documentElement.classList.add("dark");
      }
    } catch {}
  }, []);

  return <>{children}</>;
}
