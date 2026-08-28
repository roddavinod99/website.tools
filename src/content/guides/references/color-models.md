# Color Models & Conversion: Complete Reference

## Why Color Conversion Matters

Color is specified differently across contexts: HEX for CSS and design tools, RGB for screens, HSL for intuitive adjustments, CMYK for print, and modern perceptual spaces like OKLCH for design systems. Converting between formats is essential whenever you take a color from a design file, browser inspector, or brand guide and need it in a different representation. Getting the conversion right avoids mismatched branding, broken stylesheets, and time wasted eyeballing "close enough" values.

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

## RGB ↔ HSL Conversion

### RGB to HSL

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

### HSL to RGB

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

## RGB → CMYK Conversion (Approximate)

```javascript
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
// Note: CMYK depends on ink, paper, profile (FOGRA39, SWOP, etc.). Verify in InDesign.
```

## Modern CSS Color Formats

### CSS Color Level 4+

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

## Color Harmonies

### Harmony Formulas (Base Hue = H)

| Harmony | Formula | Count | Use Case |
|---------|---------|-------|----------|
| **Complementary** | H + 180° | 2 | High contrast, CTAs |
| **Triadic** | H, H+120°, H+240° | 3 | Balanced, vibrant |
| **Analogous** | H±30°, H±60° | 3-5 | Harmonious, calm |
| **Split-Complementary** | H, H+150°, H+210° | 3 | Contrast + harmony |
| **Tetradic** | H, H+90°, H+180°, H+270° | 4 | Rich, complex |
| **Square** | H, H+90°, H+180°, H+270° | 4 | Balanced tetradic |
| **Monochromatic** | H, varying S/L | 5+ | Subtle, professional |

## Accessibility: Contrast Ratios

### WCAG 2.1 Requirements

| Level | Normal Text | Large Text (≥18pt/14pt bold) | UI Components |
|-------|-------------|------------------------------|---------------|
| **AA** | 4.5:1 | 3:1 | 3:1 |
| **AAA** | 7:1 | 4.5:1 | — |

### Contrast Calculation

```javascript
function getLuminance(r, g, b) {
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

More accurate for modern displays. Uses lightness contrast (Lc) instead of luminance ratio. Tool includes both WCAG 2.x and APCA.

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

### Python (coloraide)

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

### Go (go-colorful)

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

## Common Mistakes

- Mixing color spaces: treating HEX shorthand as full HEX
- Forgetting that HSL saturation and lightness are percentages
- Assuming CMYK conversion is lossless (it is device-dependent and often involves gamut clipping)
- Confusing HSL lightness with HSV value
- Not handling alpha/opacity as a separate channel

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

## Related Tools

- [Color Converter](/tools/color-converter) — HEX, RGB, HSL, HSV, CMYK, LAB, OKLCH with alpha, harmonies, contrast
- [Color Eyedropper](/tools/color-eyedropper) — Pick colors from screen
- [Contrast Checker](/tools/contrast-checker) — Dedicated WCAG testing
- [Image Compressor](/tools/image-compressor) — Optimize images
- [SVG Optimizer](/tools/svg-optimizer) — Clean SVG colors

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

## Related Resources

## Related Guides

- [Case Conversion](/guides/references/case-conversion)
- [JSON to CSV](/guides/references/json-to-csv)
- [HTML to Markdown](/guides/references/html-to-markdown)
- [JSON Schema](/guides/references/json-schema)
- [URL Components](/guides/references/url-components)

## Related Tools

- [color-converter](/tools/color-converter)
- [color-eyedropper](/tools/color-eyedropper)

