## Why Convert Colors?

Colors appear everywhere in development — CSS, design systems, data visualization, image processing, accessibility compliance. But formats vary: HEX for CSS, RGB for Canvas/WebGL, HSL for design systems, HSV for color pickers, CMYK for print. A color converter translates instantly between all formats with precision.

DevStackIO's [Color Converter](/tools/color-converter) handles HEX, RGB, HSL, HSV, CMYK, LAB, OKLCH — with alpha support, color harmony generation, accessibility contrast checking, and palette export. All client-side.

## Color Formats Compared

| Format | Components | Range | Use Case |
|--------|------------|-------|----------|
| **HEX** | `#RRGGBB` / `#RRGGBBAA` | 00-FF | CSS, web standard |
| **RGB** | `rgb(r,g,b)` / `rgba(r,g,b,a)` | 0-255, 0-1 | Canvas, WebGL, JS |
| **HSL** | `hsl(h,s%,l%)` / `hsla(h,s%,l%,a)` | 0-360, 0-100%, 0-100% | Design systems, theming |
| **HSV/HSB** | `hsv(h,s%,v%)` | 0-360, 0-100%, 0-100% | Color pickers, Photoshop |
| **CMYK** | `cmyk(c%,m%,y%,k%)` | 0-100% | Print design |
| **LAB** | `lab(l,a,b)` | L:0-100, a:-128-127, b:-128-127 | Perceptual uniformity |
| **OKLCH** | `oklch(l,c,h)` | L:0-1, C:0-0.4, H:0-360 | Modern CSS Color 4 |
| **XYZ** | `xyz(x,y,z)` | 0-1 | Color science base |

## Color Space Relationships

```
sRGB (device) → Linear RGB → XYZ → LAB → OKLCH
                    ↓
              HSL/HSV (cylindrical)
                    ↓
              CMYK (subtractive)
```

**Key insight**: HSL/HSV are perceptual transformations of RGB. LAB/OKLCH are perceptually uniform — equal numerical changes = equal perceived changes.

## HEX Format Details

```css
/* 3-digit (shorthand) */
#RGB     → #RRGGBB
#F00     → #FF0000

/* 6-digit (standard) */
#RRGGBB  → Red: RR, Green: GG, Blue: BB
#FF5733  → rgb(255, 87, 51)

/* 8-digit (with alpha) */
#RRGGBBAA → Alpha: AA (00=transparent, FF=opaque)
#FF5733CC → rgba(255, 87, 51, 0.8)
```

## RGB to HSL Conversion

```javascript
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}
```

## HSL to RGB Conversion

```javascript
function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
```

## How to Convert Colors Online (Step by Step)

1. **Open the converter** — [DevStackIO Color Converter](/tools/color-converter)
2. **Input color** — Type HEX, RGB, HSL, HSV, CMYK, or use color picker
3. **Auto-convert** — All formats update instantly
4. **Adjust alpha** — Slider 0-100% for transparency
5. **Generate harmonies** — Complementary, triadic, analogous, monochromatic
6. **Check contrast** — WCAG AA/AAA against white/black/custom background
7. **Export palette** — CSS variables, SCSS map, JSON, Tailwind config
8. **Copy individual** — One-click copy per format

## Color Harmonies (Theory + Generation)

### Color Wheel Relationships

```
          0° (Red)
           │
    300°   │   60°
  (Magenta)│  (Yellow)
           │
240° ──────┼────── 120°
  (Blue)   │   (Cyan)
           │
    180°   │   300°
   (Green) │  (Orange)
           │
          180° (Cyan complement of Red)
```

### Harmony Formulas (Base Hue = H)

| Harmony | Formula | Count | Use Case |
|---------|---------|-------|----------|
| **Complementary** | H + 180° | 2 | High contrast, CTAs |
| **Triadic** | H, H+120°, H+240° | 3 | Balanced, vibrant |
| **Analogous** | H±30°, H±60° | 3-5 | Harmonious, calm |
| **Split-Complementary** | H, H+150°, H+210° | 3 | Contrast + harmony |
| **Tetradic (Rectangle)** | H, H+90°, H+180°, H+270° | 4 | Rich, complex |
| **Square** | H, H+90°, H+180°, H+270° | 4 | Balanced tetradic |
| **Monochromatic** | H, varying S/L | 5+ | Subtle, professional |

```javascript
function generateHarmonies(baseHue, type) {
  const harmonies = {
    complementary: [baseHue, (baseHue + 180) % 360],
    triadic: [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360],
    analogous: [
      (baseHue - 60 + 360) % 360,
      (baseHue - 30 + 360) % 360,
      baseHue,
      (baseHue + 30) % 360,
      (baseHue + 60) % 360
    ],
    splitComplementary: [
      baseHue,
      (baseHue + 150) % 360,
      (baseHue + 210) % 360
    ],
    tetradic: [
      baseHue,
      (baseHue + 90) % 360,
      (baseHue + 180) % 360,
      (baseHue + 270) % 360
    ],
    monochromatic: Array.from({length: 5}, (_, i) => ({
      h: baseHue,
      s: 20 + i * 15,
      l: 15 + i * 15
    }))
  };
  return harmonies[type];
}
```

## Accessibility: Contrast Ratios

### WCAG 2.1 Requirements

| Level | Normal Text | Large Text (≥18pt/14pt bold) | UI Components |
|-------|-------------|------------------------------|---------------|
| **AA** | 4.5:1 | 3:1 | 3:1 |
| **AAA** | 7:1 | 4.5:1 | — |

### Contrast Calculation (Relative Luminance)

```javascript
function getLuminance(r, g, b) {
  // sRGB to linear
  const toLinear = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(fg, bg) {
  const l1 = getLuminance(...fg);
  const l2 = getLuminance(...bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Usage
const ratio = contrastRatio([255,255,255], [0,0,0]); // 21:1 (max)
const ratio = contrastRatio([255,255,255], [0,128,0]); // 3.8:1 (fails AA normal)
```

### APCA (Advanced Perceptual Contrast Algorithm) — WCAG 3
```javascript
// More accurate for modern displays
// Uses lightness contrast (Lc) instead of luminance ratio
// Tool includes both WCAG 2.x and APCA
```

## CSS Color Formats

### Modern CSS (Color Level 4+)
```css
/* OKLCH — perceptually uniform */
color: oklch(0.6 0.2 250);        /* L C H */
color: oklch(60% 0.2 250 / 0.5);  /* with alpha */

/* LAB */
color: lab(60% 20 -40);
color: lab(60 20 -40 / 50%);

/* HWB (Hue-Whiteness-Blackness) */
color: hwb(250 20% 10%);
color: hwb(250 20% 10% / 0.5);

/* color() function — any space */
color: srgb(1 0.3 0.2);
color: display-p3(1 0.5 0);
color: rec2020(0.5 1 0.2);
color: xyz(0.4 0.3 0.2);

/* Relative color syntax */
color: hsl(from var(--brand) h s calc(l + 10%));
color: oklch(from var(--bg) l c h);
```

### CSS Custom Properties (Design System)
```css
:root {
  /* Base */
  --color-primary: #2563eb;
  --color-primary-h: 221;
  --color-primary-s: 83%;
  --color-primary-l: 53%;
  
  /* Generated via converter */
  --color-primary-light: oklch(from var(--color-primary) l c h / 0.8);
  --color-primary-dark: oklch(from var(--color-primary) calc(l - 0.1) c h);
  --color-primary-muted: oklch(from var(--color-primary) l calc(c * 0.5) h);
  
  /* Semantic */
  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-error: #dc2626;
  
  /* Neutrals (OKLCH for consistency) */
  --gray-50: oklch(0.98 0 0);
  --gray-100: oklch(0.95 0 0);
  --gray-900: oklch(0.15 0 0);
}
```

## Common Use Cases

### 1. Design System Creation
```bash
# Input: Brand color #2563eb (Blue 600)
# Output: Complete palette
Primary:     #2563eb (oklch(0.59 0.22 260))
Primary-50:  #eff6ff (oklch(0.97 0.02 260))
Primary-100: #dbeafe (oklch(0.92 0.05 260))
...
Primary-900: #1e3a8a (oklch(0.35 0.18 260))

# Neutral scale (gray with slight blue tint)
Gray-50:  oklch(0.98 0.005 260)
Gray-900: oklch(0.15 0.02 260)
```

### 2. Dark Mode Adaptation
```css
:root {
  --bg: oklch(1 0 0);        /* White */
  --text: oklch(0.15 0 0);   /* Near black */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: oklch(0.15 0 0);   /* Dark */
    --text: oklch(0.98 0 0); /* Near white */
    /* Colors auto-adapt via OKLCH lightness inversion */
  }
}
```

### 3. Data Visualization (Categorical)
```javascript
// 10 distinct colors (colorblind-safe)
const palette = [
  '#0072B2', '#D55E00', '#009E73', '#CC79A7',
  '#F0E442', '#56B4E9', '#E69F00', '#000000',
  '#FFFFFF', '#999999'
];
// Generated via: OKLCH with fixed C, varying H by 360/10
```

### 4. Gradient Generation
```css
/* Perceptually uniform gradients (OKLCH) */
background: linear-gradient(
  90deg,
  oklch(0.6 0.2 250),
  oklch(0.6 0.2 30)
);
/* vs sRGB gradient (muddy middle) */
background: linear-gradient(90deg, #2563eb, #f43f5e);
```

### 5. Print Design (CMYK)
```javascript
// RGB to CMYK (approximate)
function rgbToCmyk(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round((1 - r - k) / (1 - k) * 100),
    m: Math.round((1 - g - k) / (1 - k) * 100),
    y: Math.round((1 - b - k) / (1 - k) * 100),
    k: Math.round(k * 100)
  };
}
// Use case: Send to print shop, verify in InDesign
```

## Programming: Color Conversion

### JavaScript (culori library)
```javascript
import { formatHex, formatRgb, formatHsl, formatCss, parse, oklch, srgb } from 'culori';

// Parse any format
const color = parse('#2563eb');
const color2 = parse('rgb(37, 99, 235)');
const color3 = parse('hsl(221, 83%, 53%)');
const color4 = parse('oklch(0.59 0.22 260)');

// Convert
formatHex(color);        // "#2563eb"
formatRgb(color);        // "rgb(37, 99, 235)"
formatHsl(color);        // "hsl(221, 83%, 53%)"
formatCss(oklch(color)); // "oklch(59% 0.22 260)"

// Color math
import { interpolate } from 'culori';
const gradient = interpolate([color1, color2], 'oklch');
```

### Python (colorspacious / coloraide)
```python
from coloraide import Color

c = Color("#2563eb")
print(c.convert("hsl"))      # hsl(221, 83%, 53%)
print(c.convert("oklch"))    # oklch(0.59 0.22 260)
print(c.convert("cmyk"))     # cmyk(84%, 58%, 0%, 8%)

# Contrast
from wcag_contrast_ratio import contrast
ratio = contrast("#ffffff", "#2563eb")  # 4.5:1
```

### Go (github.com/lucasb-eyer/go-colorful)
```go
import "github.com/lucasb-eyer/go-colorful"

c, _ := colorful.Hex("#2563EB")
h, s, l := c.Hsl()
fmt.Printf("HSL: %.0f, %.0f%%, %.0f%%\n", h, s*100, l*100)

cmyk := c.Cmyk()
fmt.Printf("CMYK: %.0f%%, %.0f%%, %.0f%%, %.0f%%\n", cmyk[0]*100, cmyk[1]*100, cmyk[2]*100, cmyk[3]*100)

// Contrast
ratio := c.ContrastLab(colorful.White)
```

### Rust (palette crate)
```rust
use palette::{Srgb, Hsl, Oklch, IntoColor};

let rgb = Srgb::new(0.145, 0.388, 0.922); // #2563eb
let hsl: Hsl = rgb.into_color();
let oklch: Oklch = rgb.into_color();
println!("HSL: {:.0}, {:.0}%, {:.0}%", hsl.hue.into_positive_degrees(), hsl.saturation * 100.0, hsl.lightness * 100.0);
```

### CSS-in-JS / Tailwind
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'oklch(0.97 0.02 260)',
          100: 'oklch(0.92 0.05 260)',
          // ... generated via converter
          900: 'oklch(0.35 0.18 260)',
        },
      },
    },
  },
};
```

## FAQ

**Why do HSL and HSV give different results?**
HSL: Lightness = (max+min)/2. HSV: Value = max. HSL 100% lightness = white. HSV 100% value = full color.

**Which format for CSS custom properties?**
OKLCH (modern) or HSL (widely supported). OKLCH enables perceptual lightness adjustments.

**How accurate is RGB↔CMYK?**
Approximate. CMYK depends on ink, paper, profile (FOGRA39, SWOP, etc.). Use converter for estimation, verify in InDesign.

**What's the difference between LAB and OKLCH?**
OKLCH is LAB in polar coordinates (Lightness, Chroma, Hue). More intuitive for design. OKLCH fixes LAB's hue linearity issues.

**Can I convert from Pantone?**
Tool doesn't have Pantone library (licensed). Use Pantone Connect or find closest HEX match.

**Why does my gradient look muddy in the middle?**
sRGB interpolation crosses through gray. Use OKLCH or HSL interpolation for vibrant gradients.

**Does the tool support color() function / display-p3 / rec2020?**
Yes — wide gamut spaces. Output as `color(display-p3 1 0.5 0)`.

**What about color blindness simulation?**
Tool includes protanopia/deuteranopia/tritanopia simulation. Use for accessibility testing.

## Related Tools

- [Color Eyedropper](/tools/color-eyedropper) — Pick colors from screen
- [Image Compressor](/tools/image-compressor) — Optimize images
- [SVG Optimizer](/tools/svg-optimizer) — Clean SVG colors
- [Placeholder Image Generator](/tools/placeholder-image) — Colored placeholders
- [Contrast Checker](/tools/contrast-checker) — Dedicated WCAG testing

## References

- [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/)
- [CSS Color Module Level 5](https://www.w3.org/TR/css-color-5/)
- [OKLCH Color Space](https://bottosson.github.io/posts/oklab/)
- [WCAG 2.1 Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [APCA — WCAG 3 Contrast](https://github.com/Myndex/APCA)
- [culori — JavaScript Color Library](https://culori.dev/)
- [Color Theory — Adobe](https://color.adobe.com/create/color-wheel)
- [ColorBrewer — Palettes for Maps](https://colorbrewer2.org/)

---

*Convert colors now → [Free Color Converter](/tools/color-converter) — HEX, RGB, HSL, HSV, CMYK, LAB, OKLCH. Alpha, harmonies, contrast, palette export. Client-side, instant.*