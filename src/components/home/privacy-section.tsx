import { ShieldCheck, Zap, UserX, Wifi, CheckCircle } from "lucide-react";
import type { Tool } from "@/types";

export function PrivacySection({ allTools }: { allTools: Tool[] }) {
  const serverTools = allTools.filter((t) => t.processing === "server");
  const clientTools = allTools.filter((t) => t.processing !== "server");

  return (
    <section className="border-t border-[var(--color-border)]" aria-labelledby="privacy-heading">
      <div className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              Privacy
            </p>
            <h2 id="privacy-heading" className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
              Built with Privacy in Mind
            </h2>
            <p className="mt-3 text-base text-[var(--color-text-muted)] text-pretty">
              Many DevStackIO tools process your data directly in your browser.
              When a tool supports client-side processing, your input does not
              need to be uploaded to our servers.
            </p>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              Of the {allTools.length} tools on the platform, {clientTools.length} run
              their core logic entirely in your browser.{" "}
              {serverTools.length > 0 && (
                <>
                  A small set ({serverTools.map((t) => t.name).join(", ")}) rely on
                  server-side lookups to function, because they need network data
                  that cannot be computed locally.
                </>
              )}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "No account required for core tools",
                "Fast browser-based processing",
                "Privacy-focused design",
                "Free to use",
              ].map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm text-[var(--color-text)]">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: "Client-side processing",
                text: `${clientTools.length} tools run their logic in your browser — your data never needs to leave your device.`,
              },
              {
                icon: Zap,
                title: "Fast by design",
                text: "No upload round-trips means instant results, even for large inputs.",
              },
              {
                icon: UserX,
                title: "No account, no tracking of content",
                text: "Core tools work without sign-up, and we never inspect the content you process.",
              },
              {
                icon: Wifi,
                title: "Server lookups are explicit",
                text: serverTools.length > 0
                  ? `Only ${serverTools.map((t) => t.name).join(", ")} fetch network data server-side, and only the public records you ask for.`
                  : "No tools rely on our servers to compute your data.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-[var(--color-text)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
