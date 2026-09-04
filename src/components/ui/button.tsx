import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "subtle";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)] active:bg-[var(--color-accent-hover)] dark:bg-[var(--color-accent)] dark:border-[var(--color-accent)] dark:hover:bg-[var(--color-accent-hover)]",
  secondary:
    "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)] dark:bg-[var(--color-surface)] dark:border-[var(--color-border)] dark:hover:bg-[var(--color-surface-2)]",
  ghost:
    "bg-transparent border-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-2)] dark:hover:bg-[var(--color-surface-2)]",
  outline:
    "bg-transparent border-[var(--color-border)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] hover:border-[var(--color-accent)] dark:border-[var(--color-border)] dark:text-[var(--color-accent)]",
  subtle:
    "bg-[var(--color-accent-soft)] border-transparent text-[var(--color-accent-hover)] hover:bg-[color-mix(in_oklab,var(--color-accent)_15%,transparent)] dark:bg-[var(--color-accent-soft)] dark:text-[var(--color-accent)]",
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