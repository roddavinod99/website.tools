import { ImageResponse } from "@vercel/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { allTools } from "@/lib/data";
import { comparisons } from "@/lib/data/comparisons";
import { guidesTopics } from "@/lib/data/guides";
import { blogPosts } from "@/lib/blog";

// Load Inter fonts once at module init. Satori requires a font for any text
// rendering; we ship TTFs in public/fonts/ so OG image generation does not
// depend on a network fetch of the gstatic CDN.
const FONT_DIR = join(process.cwd(), "public", "fonts");

async function loadFonts() {
  const [regular, bold, extraBold] = await Promise.all([
    readFile(join(FONT_DIR, "Inter-Regular.ttf")),
    readFile(join(FONT_DIR, "Inter-Bold.ttf")),
    readFile(join(FONT_DIR, "Inter-ExtraBold.ttf")),
  ]);
  return [
    { name: "Inter", data: regular.buffer.slice(regular.byteOffset, regular.byteOffset + regular.byteLength), weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: bold.buffer.slice(bold.byteOffset, bold.byteOffset + bold.byteLength), weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: extraBold.buffer.slice(extraBold.byteOffset, extraBold.byteOffset + extraBold.byteLength), weight: 800 as const, style: "normal" as const },
  ];
}

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
  const isHome = data.type === "home";

  // Pick a category accent color, GitHub-style language dot.
  const CATEGORY_DOT: Record<string, string> = {
    "Developer Tool": "#3b82f6",
    "Comparison": "#a855f7",
    "Guide": "#10b981",
    "Blog Post": "#f97316",
    "Category": "#eab308",
    "Platform": "#64748b",
  };
  const dotColor = CATEGORY_DOT[typeLabel] ?? "#64748b";

  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0d1117",
          fontFamily: "Inter",
          color: "#e6edf3",
          padding: "56px",
          boxSizing: "border-box",
          border: "1px solid #30363d",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background layer 1: subtle dot grid - rendered as positioned elements
            because satori's tiled radial-gradient does not paint reliably. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
            opacity: 0.5,
          }}
        >
          {Array.from({ length: 22 * 11 }, (_, i) => {
            const col = i % 22;
            const row = Math.floor(i / 22);
            return (
              <div
                key={i}
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "#3d444d",
                  marginLeft: `${col * 54 + 30}px`,
                  marginTop: `${row * 56 + 90}px`,
                  position: "absolute",
                }}
              />
            );
          })}
        </div>

        {/* Background layer 2: top-right soft glow */}
        <div
          style={{
            position: "absolute",
            top: "-160px",
            right: "-160px",
            width: "520px",
            height: "520px",
            display: "flex",
            backgroundImage:
              "radial-gradient(circle, rgba(168, 85, 247, 0.28) 0%, rgba(168, 85, 247, 0) 70%)",
          }}
        />

        {/* Background layer 3: bottom-left soft glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-200px",
            left: "-200px",
            width: "560px",
            height: "560px",
            display: "flex",
            backgroundImage:
              "radial-gradient(circle, rgba(31, 111, 235, 0.22) 0%, rgba(31, 111, 235, 0) 70%)",
          }}
        />

        {/* Background layer 4: outlined decorative shapes (Canva-style).
            All shapes are placed in the empty gutters so they do not collide
            with the header / title / footer. */}
        {/* Outlined circle, top-right area */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "200px",
            width: "140px",
            height: "140px",
            display: "flex",
            border: "2px solid rgba(125, 133, 144, 0.22)",
            borderRadius: "50%",
          }}
        />
        {/* Outlined diamond, mid-right */}
        <div
          style={{
            position: "absolute",
            top: "240px",
            right: "150px",
            width: "90px",
            height: "90px",
            display: "flex",
            border: "2px solid rgba(125, 133, 144, 0.18)",
            transform: "rotate(45deg)",
          }}
        />
        {/* Outlined rounded square, bottom-right gutter */}
        <div
          style={{
            position: "absolute",
            bottom: "150px",
            right: "110px",
            width: "100px",
            height: "100px",
            display: "flex",
            border: "2px solid rgba(125, 133, 144, 0.16)",
            borderRadius: "14px",
            transform: "rotate(-12deg)",
          }}
        />
        {/* Small outlined circle, mid-left */}
        <div
          style={{
            position: "absolute",
            top: "300px",
            left: "80px",
            width: "50px",
            height: "50px",
            display: "flex",
            border: "2px solid rgba(125, 133, 144, 0.2)",
            borderRadius: "50%",
          }}
        />

        {/* Background layer 5: floating code-symbol badges (placed in empty
            gutters only). */}
        {/* </> badge, far-right vertical center */}
        <div
          style={{
            position: "absolute",
            top: "380px",
            right: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "60px",
            height: "60px",
            borderRadius: "12px",
            border: "1.5px solid rgba(125, 133, 144, 0.25)",
            background: "rgba(22, 27, 34, 0.6)",
            color: "rgba(125, 133, 144, 0.7)",
            fontSize: "22px",
            fontWeight: 700,
            transform: "rotate(8deg)",
          }}
        >
          {"</>"}
        </div>
        {/* { } badge, mid-left edge */}
        <div
          style={{
            position: "absolute",
            top: "430px",
            left: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "54px",
            height: "54px",
            borderRadius: "12px",
            border: "1.5px solid rgba(125, 133, 144, 0.22)",
            background: "rgba(22, 27, 34, 0.6)",
            color: "rgba(125, 133, 144, 0.65)",
            fontSize: "20px",
            fontWeight: 700,
            transform: "rotate(-6deg)",
          }}
        >
          {"{ }"}
        </div>

        {/* Background layer 6: small floating accent dots */}
        <div
          style={{
            position: "absolute",
            top: "430px",
            right: "260px",
            width: "12px",
            height: "12px",
            display: "flex",
            borderRadius: "50%",
            background: "rgba(168, 85, 247, 0.75)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "180px",
            left: "370px",
            width: "10px",
            height: "10px",
            display: "flex",
            borderRadius: "50%",
            background: "rgba(63, 185, 80, 0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "420px",
            left: "230px",
            width: "9px",
            height: "9px",
            display: "flex",
            borderRadius: "50%",
            background: "rgba(31, 111, 235, 0.7)",
          }}
        />

        {/* Background layer 7: thin diagonal accent line in bottom-right */}
        <div
          style={{
            position: "absolute",
            right: "-100px",
            bottom: "-100px",
            width: "500px",
            height: "3px",
            display: "flex",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(46, 160, 67, 0.45) 50%, transparent 100%)",
            transform: "rotate(-45deg)",
            transformOrigin: "center",
          }}
        />

        {/* Header row: owner / repo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "32px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "#1f6feb",
                color: "white",
                fontWeight: 700,
                fontSize: "20px",
              }}
            >
              D
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ color: "#7d8590", fontWeight: 500 }}>DevStackIO / </span>
              <span style={{ color: "#e6edf3", fontWeight: 700, marginLeft: "6px" }}>
                {isHome ? "tools" : data.title}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "9999px",
              border: "1px solid #30363d",
              background: "rgba(46, 160, 67, 0.12)",
              color: "#3fb950",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3fb950" }} />
            Free
          </div>
        </div>

        {/* Hero / title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            flexGrow: 1,
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
              fontSize: "16px",
              color: "#7d8590",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: dotColor }} />
            {typeLabel}
            {!isHome && data.type !== "category" && data.category && (
              <span style={{ color: "#6e7681", textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>
                · {data.category}
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: "72px",
              fontWeight: 800,
              lineHeight: 1.05,
              margin: 0,
              marginBottom: "20px",
              color: "#f0f6fc",
              letterSpacing: "-0.02em",
            }}
          >
            {isHome ? "Free Developer Tools" : data.title}
          </h1>

          {!isHome && data.description && (
            <p
              style={{
                fontSize: "26px",
                lineHeight: 1.45,
                color: "#9198a1",
                margin: 0,
                maxWidth: "1000px",
              }}
            >
              {data.description}
            </p>
          )}

          {isHome && (
            <p
              style={{
                fontSize: "28px",
                lineHeight: 1.45,
                color: "#9198a1",
                margin: 0,
                maxWidth: "1000px",
              }}
            >
              {data.description}
            </p>
          )}
        </div>

        {/* Footer row: feature checkmarks + website URL (clean, text-style) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "24px",
            borderTop: "1px solid #21262d",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "22px", color: "#9198a1", fontSize: "19px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#3fb950", fontSize: "22px" }}>✓</span> Privacy First
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#3fb950", fontSize: "22px" }}>✓</span> 100% Client-Side
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#3fb950", fontSize: "22px" }}>✓</span> No Sign-up
            </span>
          </div>
          {/* Website URL — sized to be readable but not dominant over the content */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#e6edf3",
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            tools.devstackio.com
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