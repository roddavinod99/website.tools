import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses: Record<string, string> = {
  default: "rounded-xl border border-surface-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface",
  elevated: "rounded-xl border border-surface-200 bg-white shadow-md dark:border-dark-border dark:bg-dark-surface",
  outlined: "rounded-xl border border-surface-300 bg-white dark:border-dark-border-hover dark:bg-dark-surface",
  interactive: "rounded-xl border border-surface-200 bg-white shadow-sm card-interactive dark:border-dark-border dark:bg-dark-surface",
};

const paddingClasses: Record<string, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  className,
  children,
  variant = "default",
  padding = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}