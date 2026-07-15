"use client";

import dynamic from "next/dynamic";

const toolkitLoaders = {
  "json-toolkit": dynamic(() => import("@/components/toolkits/json-toolkit").then((m) => ({ default: m.JSONToolkit })), { ssr: false }),
  "encoder-toolkit": dynamic(() => import("@/components/toolkits/encoder-toolkit").then((m) => ({ default: m.EncoderToolkit })), { ssr: false }),
  "generator-toolkit": dynamic(() => import("@/components/toolkits/generator-toolkit").then((m) => ({ default: m.GeneratorToolkit })), { ssr: false }),
  "security-toolkit": dynamic(() => import("@/components/toolkits/security-toolkit").then((m) => ({ default: m.SecurityToolkit })), { ssr: false }),
  "image-toolkit": dynamic(() => import("@/components/toolkits/image-toolkit").then((m) => ({ default: m.ImageToolkit })), { ssr: false }),
  "text-toolkit": dynamic(() => import("@/components/toolkits/text-toolkit").then((m) => ({ default: m.TextToolkit })), { ssr: false }),
  "dev-toolkit": dynamic(() => import("@/components/toolkits/dev-toolkit").then((m) => ({ default: m.DevToolkit })), { ssr: false }),
};

export type ToolkitSlug = keyof typeof toolkitLoaders;

interface DynamicToolkitLoaderProps {
  slug: ToolkitSlug;
}

export function DynamicToolkitLoader({ slug }: DynamicToolkitLoaderProps) {
  const Component = toolkitLoaders[slug];
  if (!Component) return null;
  return <Component />;
}

export const toolkitSlugs = Object.keys(toolkitLoaders) as ToolkitSlug[];
