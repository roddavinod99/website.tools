# Image Optimization Best Practices

## Why Image Optimization Matters

Images account for over 50% of the typical webpage's total byte weight (roughly 900 KB out of 1.8 MB), making them the single biggest contributor to slow load times. Optimizing images improves Core Web Vitals scores such as LCP and CLS, reduces bandwidth costs, and dramatically improves the experience for users on slow or mobile connections. Even small savings per image compound quickly on pages with many visuals, galleries, or product catalogs. Search engines also reward faster pages with better rankings, so image optimization is both a performance and an SEO concern.

## Choosing the Right Image Format

| Format | Best For | Compression | Transparency | Animation |
|--------|----------|-------------|--------------|-----------|
| **WebP** | Default raster choice | 25-35% smaller than JPEG | ✅ | ✅ |
| **AVIF** | Cutting-edge, HDR | 50% smaller than JPEG | ✅ | ✅ |
| **JPEG** | Photos, legacy support | Lossy | ❌ | ❌ |
| **PNG** | Screenshots, diagrams, text | Lossless | ✅ | ❌ |
| **GIF** | Legacy animation only | Poor | ❌ | ✅ |
| **SVG** | Icons, logos, illustrations | Vector | ✅ | CSS/JS |

**Strategy**: Use WebP as default, AVIF as enhancement via `<picture>`, SVG for vectors, PNG for transparency/lossless needs.

## Lossy vs Lossless Compression

**Lossy** (JPEG, WebP, AVIF): Permanently removes data eye won't notice. Quality 75-85 typical. For photos and complex images.

**Lossless** (PNG, lossless WebP): No data discarded. 5-20% savings. For screenshots, diagrams, logos, sharp edges.

## Responsive Images with `srcset` and `sizes`

```html
<img
  src="photo-800.jpg"
  srcset="
    photo-400.jpg 400w,
    photo-800.jpg 800w,
    photo-1200.jpg 1200w,
    photo-2000.jpg 2000w
  "
  sizes="
    (max-width: 600px) 100vw,
    (max-width: 1200px) 80vw,
    60vw
  "
  alt="A mountain landscape at sunset"
>
```

- `srcset`: Image candidates with intrinsic widths (`w` descriptor)
- `sizes`: Viewport occupancy at breakpoints
- Browser picks smallest candidate fitting device pixel ratio

## Art Direction & Format Fallback with `<picture>`

### Art Direction (different crops per screen)

```html
<picture>
  <source media="(max-width: 600px)" srcset="photo-mobile.jpg">
  <source media="(max-width: 1200px)" srcset="photo-tablet.jpg">
  <img src="photo-desktop.jpg" alt="A mountain landscape at sunset">
</picture>
```

### Format Fallback (AVIF → WebP → JPEG)

```html
<picture>
  <source type="image/avif" srcset="photo.avif">
  <source type="image/webp" srcset="photo.webp">
  <img src="photo.jpg" alt="A mountain landscape at sunset">
</picture>
```

## Lazy Loading

**Native** (simplest):
```html
<img src="photo.jpg" loading="lazy" alt="...">
```

**Intersection Observer** (more control):
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});
document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
```

**Best practice**: Use `loading="eager"` for above-fold/LCP images, `loading="lazy"` for below-fold.

## Image CDNs for Automatic Optimization

Services like Cloudinary, Imgix, Cloudflare Images provide on-the-fly transformation via URL parameters:

```
https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v1/photo.jpg
```

- `f_auto` — Best format browser supports (WebP/AVIF)
- `q_auto` — Optimal compression
- `w_800` — Resize to 800px wide
- Cached at edge, lightning fast

## Real-World Workflow

1. **Compress** — Lossy at quality 80 (Sharp/Squoosh), cuts 60-80%
2. **Resize** — Scale to max display size (2000px hero, 800px content, 400px thumb)
3. **Convert** — WebP + AVIF, use `<picture>` for fallback
3. **Serve via CDN** — Long cache headers (1 year for versioned filenames)
4. **Lazy load** — `loading="lazy"` + low-quality placeholder to prevent CLS

**Result**: 5 MB JPEG → 60 KB WebP at perfect resolution = 98% reduction

## Tools

- [Image Compressor](/tools/image-compressor) — In-browser lossy compression with preview
- [Image Resizer](/tools/image-resizer) — Batch dimension scaling
- [Squoosh](https://squoosh.app/) — Google's open-source web app + CLI
- [Sharp](https://sharp.pixelplumbing.com/) — Node.js library (used by Next.js, Gatsby)
- [libvips](https://libvips.github.io/) — Underlying C library, CLI available

## Accessibility

- **Alt text**: Every image needs meaningful `alt` describing content/function
- **Decorative**: Use `alt=""` (empty) so screen readers skip
- **Filenames**: Rename `IMG_4923.JPG` → `mountain-landscape-sunset.jpg` (hyphens)
- **Contrast**: Ensure text-over-image readability (shadows, overlay gradients)

## Core Web Vitals Impact

| Metric | Target | Image Impact |
|--------|--------|--------------|
| **LCP** | < 2.5s | Hero images often LCP element; optimize first |
| **CLS** | < 0.1 | Reserve space with placeholders/aspect-ratio |
| **INP** | < 200ms | Avoid blocking main thread with decoding |

## Quick Checklist

- [ ] WebP/AVIF via `<picture>` with JPEG fallback
- [ ] `srcset` with 3-4 widths per image
- [ ] `loading="lazy"` on below-fold images
- [ ] `loading="eager"` on LCP hero image
- [ ] Image CDN for automatic format/size optimization
- [ ] Meaningful alt text on all images
- [ ] Descriptive, hyphenated filenames
- [ ] Compression quality 75-85 for photos
- [ ] Strip EXIF/metadata (unless needed)
- [ ] Test with Lighthouse / PageSpeed Insights

## Related Guides

- [WebP vs AVIF Comparison](/guides/comparisons/webp-vs-avif) — Format deep dive
- [Lazy Loading Patterns](/guides/tutorials/lazy-loading) — Implementation details
- [Image CDN Selection](/guides/comparisons/image-cdns) — Cloudinary vs Imgix vs Cloudflare

## Tools

- [Image Compressor](/tools/image-compressor) — Client-side lossy compression
- [Image Resizer](/tools/image-resizer) — Batch resize in browser
- [Image to WebP](/tools/image-to-webp) — Format conversion
- [Image to AVIF](/tools/image-to-avif) — Next-gen format conversion
- [SVG Optimizer](/tools/svg-optimizer) — Vector cleanup

## References

- [Core Web Vitals](https://web.dev/vitals/)
- [WebP Documentation](https://developers.google.com/speed/webp)
- [AVIF Specification](https://aomediacodec.github.io/av1-avif/)
- [MDN: Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Image CDN Comparison](https://css-tricks.com/image-cdn-comparison/)
---

## Related Resources

## Related Guides

- [Password Security](/guides/best-practices/password-security)
- [SQL Formatting](/guides/best-practices/sql-formatting)
- [JWT Security](/guides/best-practices/jwt-security)
- [bcrypt Hashing](/guides/best-practices/bcrypt-hashing)
- [HMAC Authentication](/guides/best-practices/hmac-authentication)

## Related Tools

- [image-compressor](/tools/image-compressor)
- [image-resizer](/tools/image-resizer)

