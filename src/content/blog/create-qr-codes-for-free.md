## Why QR Codes Are Everywhere (And Why You Need a Generator)

QR codes bridge physical and digital. Restaurant menus, event tickets, WiFi sharing, contact cards, payment links, 2FA setup — all encoded in a 2D matrix that any smartphone camera reads instantly.

But not all QR generators are equal. Most online tools:
- ❌ Track your data (the encoded URL/content)
- ❌ Limit scans or expire codes
- ❌ Add watermarks/branding on free tier
- ❌ Don't support advanced formats (vCard, WiFi, crypto)

DevStackIO's [QR Code Generator](/tools/qr-generator) is different: **100% client-side, unlimited, no tracking, all formats free.**

---

## QR Code Types & When to Use Each

| Type | Data Format | Use Case |
|------|-------------|----------|
| **URL** | `https://example.com` | Marketing, menus, links |
| **Text** | Plain string | Notes, codes, short messages |
| **vCard** | `BEGIN:VCARD...` | Contact sharing, business cards |
| **WiFi** | `WIFI:T:WPA;S:mynet;P:pass;;` | Guest network access |
| **Email** | `mailto:user@domain?subject=Hi` | Contact forms, support |
| **Phone** | `tel:+15551234567` | Click-to-call |
| **SMS** | `sms:+15551234567?body=Hello` | Opt-in campaigns |
| **Calendar** | `BEGIN:VEVENT...` | Event invites |
| **Location** | `geo:37.7749,-122.4194` | Maps navigation |
| **Crypto** | `bitcoin:1A1z...?amount=0.01` | Donations, payments |

DevStackIO supports **all 10 types** with dedicated forms for each.

---

## Step-by-Step: Create a QR Code in 30 Seconds

### 1. Choose Your Content Type
Open [tools.devstackio.com/tools/qr-generator](/tools/qr-generator). Select from the dropdown: URL, Text, vCard, WiFi, Email, Phone, SMS, Calendar, Location, or Crypto.

### 2. Fill the Form
Each type has a tailored form:
- **URL** — Single input + optional UTM parameters
- **vCard** — Name, org, title, phone, email, address, URL, photo URL
- **WiFi** — SSID, password, encryption (WPA/WEP/none), hidden network toggle
- **Calendar** — Title, description, location, start/end time, all-day, timezone

### 3. Customize Appearance (Optional)
| Setting | Options | Recommendation |
|---------|---------|----------------|
| **Foreground color** | Any hex / picker | Dark (#000000) for max contrast |
| **Background color** | Any hex / transparent | White (#FFFFFF) or transparent |
| **Eye color** | Separate from data modules | Match foreground or brand |
| **Logo** | Upload image (PNG/SVG) | Center, auto-sized to 20% |
| **Logo background** | Padding color | White for dark logos |
| **Error correction** | L (7%), M (15%), Q (25%), H (30%) | **H** for logos, **M** standard |
| **Size** | 128px - 2048px | 512px for print, 256px for web |
| **Margin** | 0-10 modules | 4 (quiet zone) |

### 4. Generate & Preview
Real-time preview updates as you type. Scan with your phone to test before downloading.

### 5. Download
- **PNG** — Raster, fixed size, transparent bg supported
- **SVG** — Vector, infinite scaling, ideal for print
- **PDF** — Print-ready with optional label
- **Copy image** — Clipboard for immediate paste

---

## Design Best Practices (So It Actually Scans)

### ✅ Do
- **High contrast** — Dark modules on light background (or vice versa)
- **Quiet zone** — 4-module margin (default). Don't crop it.
- **Error correction H** — If adding a logo. Allows 30% damage.
- **Minimum size** — 2cm × 2cm (0.8in) for print. 240px for screen.
- **Test before deploying** — Scan with 3+ devices (iOS, Android, older phones)

### ❌ Don't
- **Invert colors** — Light on dark *can* work but fails on many scanners
- **Gradient backgrounds** — Breaks module detection
- **Transparent background + dark page** — Invisible to cameras
- **Rounded modules** — Only if error correction H + tested
- **Place over images** — Unless high contrast + error correction H

### Logo Placement Rules
| Logo Size | Max % of QR Area | Required EC Level |
|-----------|------------------|-------------------|
| Small (icon) | 15% | M |
| Medium | 20% | Q |
| Large (brand) | 30% | **H (mandatory)** |

**Always** add white padding behind logo (auto-applied in DevStackIO).

---

## Advanced: Dynamic vs. Static QR Codes

| | Static | Dynamic (Requires Service) |
|--|--------|---------------------------|
| **Data** | Encoded directly | Short URL redirects |
| **Editable** | No — reprint needed | Yes — change destination anytime |
| **Tracking** | None | Scans, location, device, time |
| **Cost** | Free | $5-50/mo |
| **Privacy** | ✅ Zero tracking | ❌ All scans logged |
| **Reliability** | Forever | Depends on provider uptime |

**DevStackIO generates static codes only.** For dynamic needs, use a dedicated service — but know the privacy tradeoff.

---

## Batch Generation (For Developers)

Need 10,000 QR codes for event badges? Don't click "Generate" 10,000 times.

### Option 1: CLI Tool (Node.js)
```bash
npm i -g @devstackio/qr-cli
qr-cli generate --input attendees.csv --output ./codes/ --template badge
```

### Option 2: Batch API (Self-Hosted)
```javascript
import { QRCode } from '@devstackio/qr-core';

const codes = attendees.map(a => QRCode.toDataURL({
  type: 'vcard',
  data: { name: a.name, email: a.email, phone: a.phone },
  options: { width: 512, errorCorrectionLevel: 'M' }
}));

// Save as files, embed in PDF, etc.
```

### Option 3: Browser Automation
```javascript
// Puppeteer script
for (const item of items) {
  await page.goto(`https://tools.devstackio.com/tools/qr-generator?data=${encodeURIComponent(item)}&format=svg`);
  await page.screenshot({ path: `qr-${item.id}.svg` });
}
```

---

## QR Code Security: What You Should Know

### Risks
- **Quishing** (QR phishing) — Malicious URLs in public codes
- **Payment hijacking** — Swapped crypto addresses
- **Malware downloads** — `apk`/`exe` links on Android

### Mitigations
- **Preview URL before opening** — iOS/Android show domain. Check it.
- **Use a QR scanner that shows URL first** — Not auto-open
- **Verify crypto addresses** — Compare first/last 6 chars
- **Don't scan random stickers** — Especially in parking lots, ATMs

### For Creators
- **Use HTTPS only** — Never `http://`
- **Avoid URL shorteners** — Hide destination = suspicious
- **Sign your codes** — Digital signature in payload (advanced)

---

## Creative & Practical Use Cases

| Context | QR Type | Example |
|---------|---------|---------|
| **Conference badge** | vCard | Scan → save contact instantly |
| **Restaurant table** | URL + UTM | `menu.com?table=12&src=qr` |
| **WiFi guest access** | WiFi | No password spelling |
| **Business card** | vCard + URL | Dual: save contact + visit portfolio |
| **Product packaging** | URL | Reorder, manuals, authenticity |
| **Event ticket** | Text (token) | `TICKET:EVT123:SEAT:A4:UID:xyz` |
| **Donation box** | Crypto | `bitcoin:addr?amount=10&label=Donation` |
| **Emergency info** | Text | Medical conditions, ICE contacts |
| **Geo-cache** | Location | `geo:lat,lon?z=15` |
| **2FA setup** | URL (otpauth://) | `otpauth://totp/App?secret=ABC&issuer=App` |

---

## Printing Guidelines

| Material | Min Size | DPI | Format | Notes |
|----------|----------|-----|--------|-------|
| Business card | 2.5cm | 300 | SVG/PDF | Test on card stock |
| Flyer / poster | 3cm | 300 | SVG/PDF | Scale with design |
| Product label | 1.5cm | 600 | SVG | High DPI for small |
| Billboard | 50cm | 150 | SVG | Viewing distance matters |
| Screen (web) | 240px | 72/96 | PNG/SVG | 2x for retina |
| Screen (mobile) | 200px | — | PNG | Test on device |

**Always print a test sheet first.** Scan from intended distance/angle.

---

## FAQ

**Do QR codes expire?**
Static codes never expire. Dynamic codes expire per provider policy.

**Can I track scans with DevStackIO?**
No. Static codes have no tracking. Use a dynamic service if you need analytics.

**What's the maximum data capacity?**
- Numeric: 7,089 chars
- Alphanumeric: 4,296 chars
- Binary: 2,953 bytes
- Kanji: 1,817 chars

**Can I make a QR code for a PDF file?**
Encode the PDF's *URL*, not the file. Host the PDF, link to it.

**Is there an API?**
Not public yet. Self-host from [github.com/roddavinod99](https://github.com/roddavinod99) or use the CLI.

**Can I generate QR codes offline?**
Yes — after first load, the PWA works offline. Or use the CLI.

---

## Related Tools

- [WiFi QR Generator](/tools/wifi-qr-generator) — Specialized WiFi form
- [vCard Generator](/tools/vcard-generator) — Contact QR codes
- [Base64 Image Encoder](/tools/image-to-base64) — Embed logos as data URIs
- [URL Parser](/tools/url-parser) — Validate/clean URLs before encoding

---

*Create your QR code now → [Free QR Code Generator](/tools/qr-generator) — No limits, no tracking, SVG + PNG + PDF, fully customizable.*