import type { ReactNode } from "react";
import "@/styles/highlight-theme.css";

export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`prose ${className}`}>{children}</article>;
}
