import { ImageResponse } from "@vercel/og";
import { allTools } from "@/lib/data";
import { comparisons } from "@/lib/data/comparisons";
import { guidesTopics } from "@/lib/data/guides";
import { blogPosts } from "@/lib/blog";

const FONT_URL = "https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2";

function getToolData(slug: string) {
  const tool = allTools.find((t) => t.slug === slug);
  if (!tool) return null;
  return {
    title: tool.name,
    description: tool.description.slice(0, 100),
    category: tool.category,
    type: "tool",
  };
}

function getComparisonData(slug: string) {
  const comp = comparisons.find((c) => c.slug === slug);
  if (!comp) return null;
  return {
    title: comp.title,
    description: comp.description.slice(0, 100),
    category: comp.category,
    type: "comparison",
  };
}

function getGuideData(slug: string) {
  const guide = guidesTopics.find((g) => g.slug === slug);
  if (!guide) return null;
  return {
    title: guide.title,
    description: guide.description.slice(0, 100),
    category: guide.category,
    type: "guide",
  };
}

function getBlogData(slug: string) {
  const post = blogPosts.find((b) => b.slug === slug);
  if (!post) return null;
  return {
    title: post.title,
    description: post.excerpt.slice(0, 100),
    category: "Blog",
    type: "blog",
  };
}

function getCategoryData(slug: string) {
  const cats: Record<string, { title: string; description: string }> = {
    encoders: { title: "Encoders", description: "Text and data encoding tools" },
    formatters: { title: "Formatters", description: "Code and data formatting tools" },
    generators: { title: "Generators", description: "Generate IDs, passwords, QR codes & more" },
    converters: { title: "Converters", description: "Convert between data formats & units" },
    security: { title: "Security Tools", description: "Security, cryptography & auth tools" },
    "image-tools": { title: "Image Tools", description: "Image processing & optimization tools" },
    utilities: { title: "Utilities", description: "Text analysis & development tools" },
    finance: { title: "Finance", description: "Financial calculators for investing & loans" },
  };
  const cat = cats[slug];
  if (!cat) return null;
  return {
    title: cat.title,
    description: cat.description,
    category: "Category",
    type: "category",
  };
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    tool: "Developer Tool",
    comparison: "Comparison",
    guide: "Guide",
    blog: "Blog Post",
    category: "Category",
  };
  return labels[type] || "Page";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join("/");

  let data = getToolData(path) ||
    getComparisonData(path) ||
    getGuideData(path) ||
    getBlogData(path) ||
    getCategoryData(path);

  if (!data) {
    data = {
      title: "DevStackIO Tools",
      description: "Free online developer tools — privacy first, no uploads",
      category: "Platform",
      type: "home",
    };
  }

  const typeLabel = getTypeLabel(data.type);

  // Try to fetch Inter font, fallback to system fonts on failure
  let fontData: ArrayBuffer | null = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(FONT_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      fontData = await res.arrayBuffer();
    }
  } catch {
    // ignore fetch errors, will use system fonts
  }

  let fonts: Array<{ name: string; data: ArrayBuffer; weight: 400 | 700 | 800; style: "normal" }> = [];

  if (fontData) {
    const data = fontData as ArrayBuffer;
    fonts = [
      { name: "Inter", data, weight: 400 as const, style: "normal" as const },
      { name: "Inter", data, weight: 700 as const, style: "normal" as const },
      { name: "Inter", data, weight: 800 as const, style: "normal" as const },
    ];
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "Inter",
          color: "white",
          padding: "60px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "900px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
              padding: "8px 20px",
              background: "rgba(59, 130, 246, 0.2)",
              borderRadius: "9999px",
              border: "1px solid rgba(59, 130, 246, 0.4)",
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#3b82f6" }}>
              {typeLabel}
            </span>
            <span style={{ fontSize: "14px", color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {data.category}
            </span>
          </div>

          <h1
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "24px",
              textShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
          >
            {data.title}
          </h1>

          <p
            style={{
              fontSize: "28px",
              lineHeight: 1.5,
              color: "#cbd5e1",
              marginBottom: "40px",
              maxWidth: "800px",
            }}
          >
            {data.description}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#94a3b8",
                fontSize: "20px",
              }}
            >
              <span style={{ fontWeight: 700, color: "#3b82f6", fontSize: "28px" }}>DevStack</span>
              <span style={{ fontWeight: 700, color: "white" }}>IO</span>
            </div>
            <span style={{ color: "#475569", fontSize: "16px" }}>Free • Private • Fast</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}