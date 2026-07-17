"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useToolPreload } from "@/components/tools/dynamic-tool-loader";

interface Props extends Omit<ComponentProps<typeof Link>, "href"> {
  slug: string;
  children: React.ReactNode;
}

export function ToolLink({ slug, children, ...props }: Props) {
  const handlers = useToolPreload(slug);
  return (
    <Link href={`/tools/${slug}`} {...handlers} {...props}>
      {children}
    </Link>
  );
}
