import {
  Gift, Globe, LogOut, Shield, Zap, Smartphone, Keyboard, Lock,
  type LucideIcon,
} from "lucide-react";
import { benefits } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Gift, Globe, LogOut, Shield, Zap, Smartphone, Keyboard, Lock,
};

export function BenefitsSection() {
  return (
    <section className="border-t border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
            Why Choose DevStackIO
          </h2>
          <p className="mt-2 text-surface-500 dark:text-dark-muted">
            Built for developers who value speed, privacy, and simplicity
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = iconMap[benefit.icon] || Shield;
            return (
              <div
                key={benefit.title}
                className="rounded-xl border border-surface-200 bg-white p-6 dark:border-dark-border dark:bg-dark-bg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-surface-900 dark:text-dark-text">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
