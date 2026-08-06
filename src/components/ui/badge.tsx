import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "new" | "brand";
  size?: "sm" | "md";
}

const variantClasses: Record<string, string> = {
  default: "bg-[var(--selection-bg)] text-[var(--text)]",
  success: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
  warning: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400",
  error: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400",
  info: "bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400",
  new: "bg-brand-primary text-white dark:bg-brand-bright",
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
};

const sizeClasses: Record<string, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
};

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}