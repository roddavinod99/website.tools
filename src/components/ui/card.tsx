import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-200 bg-white p-6 shadow-sm transition-all duration-150 dark:border-dark-border dark:bg-dark-surface",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
