"use client";

import { useEffect, useRef, useState } from "react";
import { dispatchLoadExampleSpec } from "@/lib/load-example";

type Props = {
  slug: string;
  examples: ReadonlyArray<string> | Record<string, string>;
  autoRun?: boolean;
  computeActive?: boolean;
};

type Item =
  | { kind: "index"; index: number; text: string }
  | { kind: "key"; key: string; text: string };

function examplesToList(examples: Props["examples"]): Item[] {
  if (Array.isArray(examples)) return examples.map((text, index) => ({ kind: "index", index, text }));
  return Object.entries(examples).map(([key, text]) => ({ kind: "key", key, text }));
}

export function ExamplesRow({ slug, examples, autoRun = true, computeActive = false }: Props) {
  const list = examplesToList(examples);
  const [busy, setBusy] = useState(false);
  const [lastClicked, setLastClicked] = useState<number | null>(null);
  const cooling = useRef(false);

  useEffect(() => {
    function onComputeStart() { setBusy(true); }
    function onComputeEnd() { setBusy(false); }
    window.addEventListener("devstackio:compute-start", onComputeStart);
    window.addEventListener("devstackio:compute-end", onComputeEnd);
    return () => {
      window.removeEventListener("devstackio:compute-start", onComputeStart);
      window.removeEventListener("devstackio:compute-end", onComputeEnd);
    };
  }, []);

  const disabled = busy || computeActive;

  function handle(item: Item, position: number) {
    if (disabled || cooling.current) return;
    // 200ms debounce: ignore accidental double-clicks while keeping the
    // button honest (it stays enabled, it just drops the duplicate).
    cooling.current = true;
    window.setTimeout(() => { cooling.current = false; }, 200);
    setLastClicked(position);
    if (item.kind === "index") dispatchLoadExampleSpec(slug, examples, item.index);
    else dispatchLoadExampleSpec(slug, examples, item.key);
    window.dispatchEvent(new CustomEvent("devstackio:example-clicked", { detail: { slug, index: position, autoRun } }));
  }

  if (list.length === 0) return null;

  return (
    <ul data-testid="examples-row" aria-label="Load an example" className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {list.map((item, i) => {
        const key = item.kind === "index" ? String(item.index) : item.key;
        return (
          <li key={key}>
            <button
              type="button"
              aria-label={`Load example ${i + 1}: ${item.text}`}
              title={item.text.length > 60 ? item.text.slice(0, 60) + "…" : item.text}
              aria-current={lastClicked === i ? "true" : undefined}
              disabled={disabled}
              aria-busy={disabled}
              onClick={() => handle(item, i)}
              className="text-sm font-mono text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-b hover:border-[var(--color-border-strong)] disabled:opacity-50 disabled:pointer-events-none transition-colors pb-0.5"
            >
              Example {i + 1}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
