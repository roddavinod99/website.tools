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
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-ring select-none border",
          variant === "primary" &&
            "bg-success-600 border-success-600 text-white shadow-sm hover:bg-success-700 hover:border-success-700 active:bg-success-800 dark:bg-success-600 dark:border-success-600 dark:text-white dark:hover:bg-success-700",
          variant === "secondary" &&
            "bg-surface-100 border-surface-300 text-surface-800 hover:bg-surface-200 hover:border-surface-400 dark:bg-dark-surface dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-border dark:hover:border-dark-border-hover",
          variant === "ghost" &&
            "bg-transparent border-transparent text-surface-700 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface dark:hover:text-dark-text",
          variant === "outline" &&
            "bg-transparent border-surface-300 text-brand-600 hover:bg-brand-50 hover:border-brand-300 dark:border-dark-border dark:text-brand-400 dark:hover:bg-dark-surface",
          size === "sm" && "h-7 px-3 text-xs rounded-md",
          size === "md" && "h-8 px-4 text-sm rounded-md",
          size === "lg" && "h-10 px-5 text-sm rounded-md",
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
