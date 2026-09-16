import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses: Record<string, string> = {
  default: "rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] dark:bg-[var(--color-surface)]",
  elevated: "rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm dark:bg-[var(--color-surface)]",
  outlined: "rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] dark:bg-[var(--color-surface)]",
  interactive:
    "rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] card-interactive dark:bg-[var(--color-surface)]",
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