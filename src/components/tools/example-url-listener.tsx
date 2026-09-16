"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { dispatchLoadExampleSpec } from "@/lib/load-example";

interface Props {
  slug: string;
  examples: readonly string[];
  /** True once the lazy tool has mounted (the P0 ready-gate). */
  ready: boolean;
}

/**
 * Honors shareable example URLs (`/tools/<slug>?example=<i|key>`) by
 * dispatching through the same load-example path as the example buttons.
 * Renders nothing. Must be rendered inside a Suspense boundary because it
 * reads search params (official Next.js App Router pattern); the boundary
 * wraps only this null component so page SSR/SEO is untouched.
 */
function ExampleUrlListenerInner({ slug, examples, ready }: Props) {
  const searchParams = useSearchParams();
  const done = useRef<string | null>(null);

  useEffect(() => {
    const key = searchParams?.get("example");
    if (!key || !ready) return;
    if (done.current === `${slug}:${key}`) return;
    done.current = `${slug}:${key}`;
    dispatchLoadExampleSpec(slug, examples, key);
  }, [slug, examples, ready, searchParams]);

  return null;
}

export function ExampleUrlListener(props: Props) {
  return (
    <Suspense fallback={null}>
      <ExampleUrlListenerInner {...props} />
    </Suspense>
  );
}
