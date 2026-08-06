import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-success-600 border-success-600 text-white shadow-sm hover:bg-success-700 hover:border-success-700 active:bg-success-800 dark:bg-success-600 dark:border-success-600 dark:text-white dark:hover:bg-success-700",
  secondary:
    "bg-surface-100 border-surface-300 text-surface-800 hover:bg-surface-200 hover:border-surface-400 dark:bg-dark-surface dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-border dark:hover:border-dark-border-hover",
  ghost:
    "bg-transparent border-transparent text-surface-700 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface dark:hover:text-dark-text",
  outline:
    "bg-transparent border-surface-300 text-brand-600 hover:bg-brand-50 hover:border-brand-300 dark:border-dark-border dark:text-brand-400 dark:hover:bg-dark-surface",
};

const sizeClasses: Record<string, string> = {
  sm: "btn-sm px-3 text-xs rounded-md",
  md: "btn-md px-4 text-sm rounded-md",
  lg: "btn-lg px-5 text-sm rounded-md",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, loading = false, leftIcon, rightIcon, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-ring select-none border",
          variantClasses[variant],
          sizeClasses[size],
          loading && "state-loading",
          isDisabled && "state-disabled",
          className,
        )}
        {...props}
      >
        {!loading && leftIcon}
        {loading ? <span className="sr-only">Loading</span> : children}
        {!loading && rightIcon}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };