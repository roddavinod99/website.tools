import type { Metadata } from "next";
import { allTools, siteConfig } from "@/lib/data";
import { breadcrumbList, itemList, jsonLdScriptBody } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "Popular Tools",
  description: "Most used free developer tools on DevStackIO — JSON formatter, JWT decoder, UUID generator, Base64 encoder, and more. Rated by the community.",
  alternates: { canonical: `${siteConfig.url}/popular` },
};

export default function PopularPage() {
  const tools = [...allTools].sort((a, b) => b.popularity - a.popularity);
  const url = `${siteConfig.url}/popular`;
  const description =
    "Most used free developer tools on DevStackIO — JSON formatter, JWT decoder, UUID generator, Base64 encoder, and more.";

  const breadcrumb = breadcrumbList([{ name: "Home", url: siteConfig.url }, { name: "Popular Tools" }]);
  const list = itemList({
    name: "Popular Developer Tools",
    description,
    url,
    items: tools.map((t) => ({ name: t.name, url: `${siteConfig.url}/tools/${t.slug}` })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(list) }}
      />
      <div className="border-b border-[var(--color-border)]">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
              Popular Tools
            </h1>
            <p className="mt-2 text-lg text-[var(--color-text-muted)]">
              The most used tools by our community
            </p>
            <p className="mt-4 text-[var(--color-text-muted)]">
              The developer tools our community reaches for most. These utilities cover the everyday
              workflow &mdash; formatting JSON, decoding JWTs, generating UUIDs, encoding with Base64, and
              more. Each tool runs entirely in your browser, which means your data never leaves your device.
              Rankings reflect real usage across the platform, so this list shows you what other developers
              actually rely on.
            </p>
          </div>
        </div>
      </div>
      <section className="bg-[var(--color-surface)]">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl">
            <ul className="space-y-3">
              {tools.map((tool) => (
                <li key={tool.id}>
                  <a
                    href={`/tools/${tool.slug}`}
                    className="group block rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                        {tool.category}
                      </span>
                      {tool.popularity >= 90 && (
                        <span className="rounded-full bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                          Most used
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                      {tool.description}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
