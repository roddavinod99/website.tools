"use client";

import { useEffect } from "react";
import { initCleanupListeners } from "@/lib/file-cleanup";

export function FileCleanupProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initCleanupListeners();
  }, []);

  return <>{children}</>;
}
