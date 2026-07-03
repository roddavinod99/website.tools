"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-ring",
          variant === "primary" && "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
          variant === "secondary" && "bg-surface-100 text-surface-900 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border",
          variant === "ghost" && "text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface",
          variant === "outline" && "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface",
          size === "sm" && "h-8 px-3 text-sm rounded-md",
          size === "md" && "h-10 px-4 text-sm rounded-lg",
          size === "lg" && "h-12 px-6 text-base rounded-lg",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
