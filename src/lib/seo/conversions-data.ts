/**
 * Long-tail conversion dataset for the unit-converter landing pages
 * (PR 2 of the rapidtables-alternative plan: PLAN.md).
 *
 * Each entry is the input shape for a single /convert/<category>/<slug>
 * URL. The generator at the bottom of the file turns the dataset into
 * `LandingPage[]` entries that the engine from PR 1 ingests.
 *
 * The dataset focuses on the highest-volume global search pairs as of
 * 2026-09 (per SimilarWeb/Google Trends data points). Each pair is
 * one URL; we ship pairs bidirectionally so e.g. both
 * /convert/temperature/c-to-f and /convert/temperature/f-to-c exist.
 *
 * Why hand-curated rather than generated?
 *  - Slug strings need to be human-readable (cm-to-feet not cm_2_ft)
 *  - Title/description need to be SEO-tuned and not duplicate each other
 *  - The see-also graph is more useful when each link targets the most
 *    relevant siblings, not "every other unit in the family"
 *  - Conversion tables are educational content; the data needs to be
 *    accurate and labeled
 *
 * The dataset can grow indefinitely; each entry is ~150 bytes so even
 * 1000 entries is 150KB of static data — well under any build concern.
 */

import type { LandingPage } from "./landing-pages";

// ─────────────────────────────────────────────────────────────────────
// Category unit-label map (mirrors src/components/tools/converters/unit-converter.tsx)
// Used for accurate titles, descriptions, and conversion tables.
// ─────────────────────────────────────────────────────────────────────

export const unitLabel: Record<string, string> = {
  // length
  m: "Meters", km: "Kilometers", mi: "Miles", yd: "Yards", ft: "Feet", in: "Inches",
  cm: "Centimeters", mm: "Millimeters", um: "Micrometers", nm: "Nanometers",
  nmi: "Nautical Miles", ly: "Light Years",
  // mass
  kg: "Kilograms", g: "Grams", mg: "Milligrams", t: "Metric Tons",
  lb: "Pounds", oz: "Ounces", st: "Stones",
  // volume
  l: "Liters", ml: "Milliliters", m3: "Cubic Meters", gal: "Gallons (US)",
  qt: "Quarts (US)", cup: "Cups (US)", floz: "Fluid Ounces (US)",
  tsp: "Teaspoons", tbsp: "Tablespoons",
  // temperature
  c: "Celsius", f: "Fahrenheit", k: "Kelvin",
  // area
  m2: "Square Meters", km2: "Square Kilometers", mi2: "Square Miles",
  yd2: "Square Yards", ft2: "Square Feet", ac: "Acres", ha: "Hectares",
  // speed
  ms: "Meters/second", kmh: "Kilometers/hour", mph: "Miles/hour",
  kn: "Knots", mach: "Mach (20°C)",
  // time
  s: "Seconds", ms2: "Milliseconds", us: "Microseconds", ns: "Nanoseconds",
  min: "Minutes", h: "Hours", d: "Days", wk: "Weeks",
  // data
  b: "Bytes", kb: "Kilobytes", mb: "Megabytes", gb: "Gigabytes",
  tb: "Terabytes", pb: "Petabytes", bit: "Bits",
  // pressure
  pa: "Pascals", hpa: "Hectopascals", kpa: "Kilopascals", bar: "Bar",
  psi: "PSI", atm: "Atmospheres", torr: "mmHg (Torr)",
  // energy
  j: "Joules", kj: "Kilojoules", cal: "Calories", kcal: "Kilocalories",
  wh: "Watt-hours", kwh: "Kilowatt-hours", ev: "Electronvolts", btu: "BTU",
  // frequency
  hz: "Hertz", khz: "Kilohertz", mhz: "Megahertz", ghz: "Gigahertz",
  // angle
  deg: "Degrees", rad: "Radians", grad: "Gradians",
  arcmin: "Arcminutes", arcsec: "Arcseconds",
  // fuel economy
  l100: "L/100km", mpg: "mpg (US)", mpguk: "mpg (UK)", kml: "km/L",
  // power
  w: "Watts", kw: "Kilowatts", mw: "Megawatts", hp: "Horsepower", btuh: "BTU/hour",
};

// Map tool-internal category names to URL-friendly category slugs.
export const categorySlugForUrl: Record<string, string> = {
  length: "length",
  mass: "mass",
  volume: "volume",
  temperature: "temperature",
  area: "area",
  speed: "speed",
  time: "time",
  data: "data",
  pressure: "pressure",
  energy: "energy",
  frequency: "frequency",
  angle: "angle",
  fuelEconomy: "fuel-economy",
  power: "power",
};

// Reverse map for resolving a URL category back to the tool's internal key.
export const urlCategoryToToolKey: Record<string, string> = Object.fromEntries(
  Object.entries(categorySlugForUrl).map(([k, v]) => [v, k]),
);

// Canonical tool slug (matches the registry entry for the existing unit-converter).
const TOOL = "unit-converter";

// ─────────────────────────────────────────────────────────────────────
// Pair dataset: each entry produces 1 URL on the site.
// `{ from, to }` are unit codes from unitLabel above; `category` is
// the tool-internal key (length, mass, temperature, etc.).
// ─────────────────────────────────────────────────────────────────────

interface Pair {
  category: string;
  from: string;
  to: string;
  slug?: string;       // override auto-generated slug
  title?: string;      // override auto-generated title
  desc?: string;       // override auto-generated description
}

const PAIRS: Pair[] = [
  // ───────── LENGTH (~50 pairs) ─────────
  { category: "length", from: "cm", to: "ft" },
  { category: "length", from: "ft", to: "cm" },
  { category: "length", from: "cm", to: "in" },
  { category: "length", from: "in", to: "cm" },
  { category: "length", from: "mm", to: "in" },
  { category: "length", from: "in", to: "mm" },
  { category: "length", from: "mm", to: "cm" },
  { category: "length", from: "cm", to: "mm" },
  { category: "length", from: "m", to: "ft" },
  { category: "length", from: "ft", to: "m" },
  { category: "length", from: "m", to: "in" },
  { category: "length", from: "in", to: "m" },
  { category: "length", from: "m", to: "yd" },
  { category: "length", from: "yd", to: "m" },
  { category: "length", from: "km", to: "mi" },
  { category: "length", from: "mi", to: "km" },
  { category: "length", from: "ft", to: "in" },
  { category: "length", from: "in", to: "ft" },
  { category: "length", from: "ft", to: "yd" },
  { category: "length", from: "yd", to: "ft" },
  { category: "length", from: "ft", to: "mi" },
  { category: "length", from: "mi", to: "ft" },
  { category: "length", from: "m", to: "mi" },
  { category: "length", from: "mi", to: "m" },
  { category: "length", from: "m", to: "km" },
  { category: "length", from: "km", to: "m" },
  { category: "length", from: "m", to: "cm" },
  { category: "length", from: "cm", to: "m" },
  { category: "length", from: "m", to: "mm" },
  { category: "length", from: "mm", to: "m" },
  { category: "length", from: "nmi", to: "km" },
  { category: "length", from: "km", to: "nmi" },
  { category: "length", from: "nmi", to: "mi" },
  { category: "length", from: "mi", to: "nmi" },
  { category: "length", from: "yd", to: "in" },
  { category: "length", from: "in", to: "yd" },
  { category: "length", from: "ly", to: "km" },
  { category: "length", from: "km", to: "ly" },

  // ───────── MASS (16 pairs) ─────────
  { category: "mass", from: "kg", to: "lb" },
  { category: "mass", from: "lb", to: "kg" },
  { category: "mass", from: "kg", to: "g" },
  { category: "mass", from: "g", to: "kg" },
  { category: "mass", from: "oz", to: "g" },
  { category: "mass", from: "g", to: "oz" },
  { category: "mass", from: "lb", to: "oz" },
  { category: "mass", from: "oz", to: "lb" },
  { category: "mass", from: "g", to: "mg" },
  { category: "mass", from: "mg", to: "g" },
  { category: "mass", from: "kg", to: "oz" },
  { category: "mass", from: "oz", to: "kg" },
  { category: "mass", from: "kg", to: "t" },
  { category: "mass", from: "t", to: "kg" },
  { category: "mass", from: "lb", to: "st" },
  { category: "mass", from: "st", to: "lb" },

  // ───────── TEMPERATURE (6 pairs — all combos) ─────────
  { category: "temperature", from: "c", to: "f" },
  { category: "temperature", from: "f", to: "c" },
  { category: "temperature", from: "c", to: "k" },
  { category: "temperature", from: "k", to: "c" },
  { category: "temperature", from: "f", to: "k" },
  { category: "temperature", from: "k", to: "f" },

  // ───────── TIME (12 pairs) ─────────
  { category: "time", from: "h", to: "min" },
  { category: "time", from: "min", to: "h" },
  { category: "time", from: "h", to: "s" },
  { category: "time", from: "s", to: "h" },
  { category: "time", from: "min", to: "s" },
  { category: "time", from: "s", to: "min" },
  { category: "time", from: "d", to: "h" },
  { category: "time", from: "h", to: "d" },
  { category: "time", from: "d", to: "s" },
  { category: "time", from: "s", to: "d" },
  { category: "time", from: "wk", to: "d" },
  { category: "time", from: "d", to: "wk" },

  // ───────── AREA (10 pairs) ─────────
  { category: "area", from: "m2", to: "ft2" },
  { category: "area", from: "ft2", to: "m2" },
  { category: "area", from: "m2", to: "yd2" },
  { category: "area", from: "yd2", to: "m2" },
  { category: "area", from: "ha", to: "ac" },
  { category: "area", from: "ac", to: "ha" },
  { category: "area", from: "km2", to: "mi2" },
  { category: "area", from: "mi2", to: "km2" },
  { category: "area", from: "m2", to: "ac" },
  { category: "area", from: "ac", to: "m2" },

  // ───────── VOLUME (10 pairs) ─────────
  { category: "volume", from: "l", to: "gal" },
  { category: "volume", from: "gal", to: "l" },
  { category: "volume", from: "l", to: "ml" },
  { category: "volume", from: "ml", to: "l" },
  { category: "volume", from: "cup", to: "ml" },
  { category: "volume", from: "ml", to: "cup" },
  { category: "volume", from: "tbsp", to: "tsp" },
  { category: "volume", from: "tsp", to: "tbsp" },
  { category: "volume", from: "l", to: "cup" },
  { category: "volume", from: "cup", to: "l" },

  // ───────── SPEED (8 pairs) ─────────
  { category: "speed", from: "mph", to: "kmh" },
  { category: "speed", from: "kmh", to: "mph" },
  { category: "speed", from: "ms", to: "kmh" },
  { category: "speed", from: "kmh", to: "ms" },
  { category: "speed", from: "kn", to: "mph" },
  { category: "speed", from: "mph", to: "kn" },
  { category: "speed", from: "kn", to: "kmh" },
  { category: "speed", from: "kmh", to: "kn" },

  // ───────── PRESSURE (8 pairs) ─────────
  { category: "pressure", from: "psi", to: "bar" },
  { category: "pressure", from: "bar", to: "psi" },
  { category: "pressure", from: "kpa", to: "psi" },
  { category: "pressure", from: "psi", to: "kpa" },
  { category: "pressure", from: "pa", to: "psi" },
  { category: "pressure", from: "psi", to: "pa" },
  { category: "pressure", from: "atm", to: "pa" },
  { category: "pressure", from: "pa", to: "atm" },

  // ───────── ENERGY (8 pairs) ─────────
  { category: "energy", from: "kwh", to: "btu" },
  { category: "energy", from: "btu", to: "kwh" },
  { category: "energy", from: "j", to: "cal" },
  { category: "energy", from: "cal", to: "j" },
  { category: "energy", from: "kj", to: "kcal" },
  { category: "energy", from: "kcal", to: "kj" },
  { category: "energy", from: "wh", to: "j" },
  { category: "energy", from: "j", to: "wh" },

  // ───────── DATA (10 pairs) ─────────
  { category: "data", from: "mb", to: "kb" },
  { category: "data", from: "kb", to: "mb" },
  { category: "data", from: "gb", to: "mb" },
  { category: "data", from: "mb", to: "gb" },
  { category: "data", from: "tb", to: "gb" },
  { category: "data", from: "gb", to: "tb" },
  { category: "data", from: "kb", to: "b" },
  { category: "data", from: "b", to: "kb" },
  { category: "data", from: "mb", to: "b" },
  { category: "data", from: "b", to: "mb" },

  // ───────── FREQUENCY (6 pairs) ─────────
  { category: "frequency", from: "hz", to: "khz" },
  { category: "frequency", from: "khz", to: "hz" },
  { category: "frequency", from: "mhz", to: "khz" },
  { category: "frequency", from: "khz", to: "mhz" },
  { category: "frequency", from: "ghz", to: "mhz" },
  { category: "frequency", from: "mhz", to: "ghz" },

  // ───────── FUEL ECONOMY (4 pairs) ─────────
  { category: "fuelEconomy", from: "mpg", to: "l100" },
  { category: "fuelEconomy", from: "l100", to: "mpg" },
  { category: "fuelEconomy", from: "mpguk", to: "mpg" },
  { category: "fuelEconomy", from: "mpg", to: "kml" },
];

// ─────────────────────────────────────────────────────────────────────
// Pre-filled value dataset: the most-searched "X number Y to Z" queries.
// Each entry produces 1 URL like /convert/temperature/100-c-to-f.
// ─────────────────────────────────────────────────────────────────────

interface PreFill {
  category: string;
  from: string;
  to: string;
  value: string;
  /** Optional title override for SEO */
  title?: string;
}

const PRE_FILLS: PreFill[] = [
  // Temperature — the dominant search cluster globally
  { category: "temperature", from: "c", to: "f", value: "0", title: "0°C to °F (freezing point of water)" },
  { category: "temperature", from: "c", to: "f", value: "100", title: "100°C to °F (boiling point of water)" },
  { category: "temperature", from: "c", to: "f", value: "37", title: "37°C to °F (body temperature)" },
  { category: "temperature", from: "c", to: "f", value: "180", title: "180°C to °F (baking temperature)" },
  { category: "temperature", from: "c", to: "f", value: "200", title: "200°C to °F" },
  { category: "temperature", from: "c", to: "f", value: "-40", title: "-40°C to °F (the crossover)" },
  { category: "temperature", from: "c", to: "f", value: "25", title: "25°C to °F (room temperature)" },
  { category: "temperature", from: "c", to: "f", value: "38", title: "38°C to °F (fever)" },
  { category: "temperature", from: "c", to: "f", value: "350", title: "350°C to °F" },
  { category: "temperature", from: "c", to: "f", value: "40", title: "40°C to °F" },
  { category: "temperature", from: "f", to: "c", value: "32", title: "32°F to °C (freezing point of water)" },
  { category: "temperature", from: "f", to: "c", value: "212", title: "212°F to °C (boiling point of water)" },
  { category: "temperature", from: "f", to: "c", value: "98.6", title: "98.6°F to °C (body temperature)" },
  { category: "temperature", from: "f", to: "c", value: "350", title: "350°F to °C (baking)" },
  { category: "temperature", from: "f", to: "c", value: "100", title: "100°F to °C" },
  { category: "temperature", from: "f", to: "c", value: "70", title: "70°F to °C (room temperature)" },
  { category: "temperature", from: "f", to: "c", value: "0", title: "0°F to °C" },
  { category: "temperature", from: "f", to: "c", value: "40", title: "40°F to °C" },
  { category: "temperature", from: "f", to: "c", value: "60", title: "60°F to °C" },
  { category: "temperature", from: "f", to: "c", value: "72", title: "72°F to °C (comfortable room)" },

  // Length — the next dominant cluster
  { category: "length", from: "cm", to: "in", value: "1", title: "1 cm to inches" },
  { category: "length", from: "in", to: "cm", value: "1", title: "1 inch to cm" },
  { category: "length", from: "cm", to: "ft", value: "180", title: "180 cm to feet (average adult height)" },
  { category: "length", from: "cm", to: "ft", value: "170", title: "170 cm to feet" },
  { category: "length", from: "cm", to: "ft", value: "165", title: "165 cm to feet" },
  { category: "length", from: "cm", to: "ft", value: "160", title: "160 cm to feet" },
  { category: "length", from: "cm", to: "ft", value: "175", title: "175 cm to feet" },
  { category: "length", from: "ft", to: "cm", value: "5", title: "5 feet to cm" },
  { category: "length", from: "ft", to: "cm", value: "5.5", title: "5'5\" to cm" },
  { category: "length", from: "ft", to: "cm", value: "6", title: "6 feet to cm" },
  { category: "length", from: "ft", to: "cm", value: "5.4", title: "5'4\" to cm" },
  { category: "length", from: "ft", to: "cm", value: "5.7", title: "5'7\" to cm" },
  { category: "length", from: "ft", to: "cm", value: "5.8", title: "5'8\" to cm" },
  { category: "length", from: "ft", to: "cm", value: "5.9", title: "5'9\" to cm" },
  { category: "length", from: "ft", to: "cm", value: "4.11", title: "4'11\" to cm" },
  { category: "length", from: "ft", to: "m", value: "6", title: "6 feet to meters" },
  { category: "length", from: "m", to: "ft", value: "1.8", title: "1.8 m to feet" },
  { category: "length", from: "km", to: "mi", value: "5", title: "5 km to miles" },
  { category: "length", from: "km", to: "mi", value: "10", title: "10 km to miles" },
  { category: "length", from: "mi", to: "km", value: "5", title: "5 miles to km" },

  // Mass
  { category: "mass", from: "kg", to: "lb", value: "70", title: "70 kg to lb" },
  { category: "mass", from: "kg", to: "lb", value: "60", title: "60 kg to lb" },
  { category: "mass", from: "kg", to: "lb", value: "80", title: "80 kg to lb" },
  { category: "mass", from: "kg", to: "lb", value: "50", title: "50 kg to lb" },
  { category: "mass", from: "kg", to: "lb", value: "90", title: "90 kg to lb" },
  { category: "mass", from: "lb", to: "kg", value: "150", title: "150 lb to kg" },
  { category: "mass", from: "lb", to: "kg", value: "200", title: "200 lb to kg" },
  { category: "mass", from: "lb", to: "kg", value: "180", title: "180 lb to kg" },
  { category: "mass", from: "lb", to: "kg", value: "130", title: "130 lb to kg" },
  { category: "mass", from: "oz", to: "g", value: "8", title: "8 oz to grams" },
];

// ─────────────────────────────────────────────────────────────────────
// "How to" educational pages for top conversions.
// Each entry produces 1 URL like /convert/length/how-cm-to-feet.
// ─────────────────────────────────────────────────────────────────────

interface HowTo {
  category: string;
  from: string;
  to: string;
  body: string; // 200-300 words explaining the conversion
}

const HOW_TOS: HowTo[] = [
  {
    category: "length",
    from: "cm",
    to: "in",
    body: "Centimeters and inches are both units of length. Inches belong to the Imperial system (used in the United States), while centimeters are part of the metric system (used almost everywhere else). One inch equals exactly 2.54 centimeters, so to convert from centimeters to inches, you divide the number of centimeters by 2.54. To convert the other way, multiply inches by 2.54. For example, 10 cm ÷ 2.54 = 3.937 inches, and 5 inches × 2.54 = 12.7 cm. Quick mental math: divide cm by 2.5 for a rough estimate of inches. This conversion is essential for clothing sizes, screen dimensions, and any product shipped internationally.",
  },
  {
    category: "length",
    from: "ft",
    to: "cm",
    body: "Feet and centimeters are the most common length units used for measuring human height and short distances. One foot equals exactly 30.48 centimeters, so to convert feet to centimeters, you multiply the number of feet by 30.48. For example, 6 feet × 30.48 = 182.88 cm. For heights expressed in feet and inches (e.g. 5'8\"), convert the feet part first, then convert the inches part (1 inch = 2.54 cm), and add them together. The formula is: cm = (feet × 30.48) + (inches × 2.54). This is the conversion used in medical charts, ID documents, and sports statistics.",
  },
  {
    category: "length",
    from: "m",
    to: "ft",
    body: "Meters and feet are the two most-used length units in the world. Meters are metric, used in science, engineering, and most countries. Feet are Imperial, used mainly in the United States for everyday measurements. One meter equals approximately 3.28084 feet, so to convert meters to feet, multiply by 3.28084. For example, 1.8 m × 3.28084 = 5.905 feet (about 5'11\"). To convert feet to meters, divide by 3.28084 or multiply by 0.3048. The exact conversion is: 1 foot = 0.3048 meters.",
  },
  {
    category: "length",
    from: "km",
    to: "mi",
    body: "Kilometers and miles are units for measuring longer distances. Kilometers are used in most countries that use the metric system. Miles are used in the United States, the United Kingdom, and a few other countries for road distances. One mile equals exactly 1.609344 kilometers, so to convert km to miles, divide by 1.609344 (or multiply by 0.621371). For example, 100 km ÷ 1.609344 = 62.137 miles. To convert miles to km, multiply by 1.609344. Quick memory aid: 1 km is roughly ⅔ of a mile, and 1 mile is roughly 1.6 km.",
  },
  {
    category: "length",
    from: "in",
    to: "cm",
    body: "Inches and centimeters measure the same thing — small lengths — in two different systems. The inch is part of the Imperial system used in the United States, while the centimeter is part of the metric system used everywhere else. One inch equals exactly 2.54 centimeters, so to convert inches to centimeters, multiply by 2.54. For example, 12 inches × 2.54 = 30.48 cm (which is exactly 1 foot). To go the other way, divide cm by 2.54. Common uses: screen sizes (TVs, monitors, phones), tire diameters, and paper sizes.",
  },
  {
    category: "length",
    from: "mm",
    to: "in",
    body: "Millimeters and inches are both used for small precision measurements. Millimeters are metric, common in engineering, machining, and most countries. Inches are Imperial, common in the United States. One inch equals exactly 25.4 millimeters. To convert mm to inches, divide by 25.4. For example, 50 mm ÷ 25.4 = 1.969 inches. To convert inches to mm, multiply by 25.4. This conversion comes up frequently in 3D printing, CNC machining, photography filter sizes, and watch face diameters.",
  },
  {
    category: "temperature",
    from: "c",
    to: "f",
    body: "Converting Celsius to Fahrenheit is the most common temperature conversion in the world. The formulas are: F = (C × 9/5) + 32, and the inverse C = (F − 32) × 5/9. Useful reference points: 0°C = 32°F (freezing point of water), 25°C = 77°F (room temperature), 37°C = 98.6°F (body temperature), 100°C = 212°F (boiling point of water). The two scales meet at −40° (i.e. −40°C = −40°F). For quick estimates: double the Celsius and add 30 to get an approximate Fahrenheit value.",
  },
  {
    category: "temperature",
    from: "f",
    to: "c",
    body: "To convert Fahrenheit to Celsius, subtract 32 then multiply by 5/9. The formula is: C = (F − 32) × 5/9. Quick reference points: 32°F = 0°C (freezing point of water), 70°F ≈ 21°C (room temperature), 98.6°F = 37°C (body temperature), 212°F = 100°C (boiling point of water). For a fast mental estimate: subtract 30, then halve. For example, 80°F: 80 − 30 = 50, then 50 ÷ 2 = 25°C (actual: 26.7°C). The estimate gets you close enough for most everyday use.",
  },
  {
    category: "mass",
    from: "kg",
    to: "lb",
    body: "Converting kilograms to pounds is essential for body weight, luggage, and shipping. One kilogram equals 2.20462 pounds, so multiply kg by 2.20462 to get pounds. For example, 70 kg × 2.20462 = 154.32 lb. Quick mental math: multiply kg by 2.2 for an approximate pound value. Common body weight reference: 60 kg ≈ 132 lb, 70 kg ≈ 154 lb, 80 kg ≈ 176 lb, 90 kg ≈ 198 lb. To convert pounds to kg, divide by 2.20462 (or multiply by 0.453592).",
  },
  {
    category: "mass",
    from: "lb",
    to: "kg",
    body: "To convert pounds to kilograms, divide by 2.20462. The formula is: kg = lb ÷ 2.20462. For example, 150 lb ÷ 2.20462 = 68.04 kg. Quick mental math: divide pounds by 2.2 for an approximate kilogram value. Common reference points: 100 lb ≈ 45 kg, 150 lb ≈ 68 kg, 200 lb ≈ 91 kg. The pound is part of the Imperial system, still widely used in the United States for body weight and grocery items.",
  },
  {
    category: "time",
    from: "h",
    to: "min",
    body: "To convert hours to minutes, multiply by 60. The formula is: minutes = hours × 60. For example, 2.5 hours = 150 minutes. One hour contains exactly 60 minutes, so the conversion is straightforward. Common use cases: time tracking, scheduling, payroll calculations, project planning. To convert minutes back to hours, divide by 60. For mixed units like 1 hour 30 minutes, just convert the hour part and add the minutes: 1.5 hours × 60 = 90 minutes total.",
  },
  {
    category: "time",
    from: "min",
    to: "h",
    body: "To convert minutes to hours, divide by 60. The formula is: hours = minutes ÷ 60. For example, 90 minutes = 90 ÷ 60 = 1.5 hours (or 1 hour 30 minutes). One hour equals 60 minutes, so the conversion is just division by 60. Common use cases: time tracking apps, billing, work hours. To convert hours back to minutes, multiply by 60. For decimal hours, you can keep them as decimals (1.5 h) or convert to hours and minutes (1 h 30 min).",
  },
  {
    category: "area",
    from: "m2",
    to: "ft2",
    body: "To convert square meters to square feet, multiply by 10.7639. The formula is: ft² = m² × 10.7639. For example, 100 m² × 10.7639 = 1076.39 ft². One square meter equals approximately 10.764 square feet. This conversion is common in real estate (apartment sizes in international listings), construction, and interior design. To convert square feet to square meters, divide by 10.7639. Note that area conversions use the linear conversion factor squared, which is why the numbers are larger.",
  },
  {
    category: "volume",
    from: "l",
    to: "gal",
    body: "To convert liters to US gallons, divide by 3.78541. The formula is: gallons = liters ÷ 3.78541. For example, 20 liters ÷ 3.78541 = 5.28 US gallons. Note that US gallons are different from UK (imperial) gallons; one UK gallon equals approximately 4.546 liters. Common uses: fuel economy (US MPG vs L/100km), beverage volumes, aquarium sizes, swimming pool capacity. To convert gallons to liters, multiply by 3.78541 (US) or 4.54609 (UK).",
  },
  {
    category: "speed",
    from: "mph",
    to: "kmh",
    body: "To convert miles per hour to kilometers per hour, multiply by 1.609344. The formula is: km/h = mph × 1.609344. For example, 60 mph × 1.609344 = 96.56 km/h. This is the conversion you need when reading speed limit signs while driving abroad, or comparing car specifications between the United States and the rest of the world. Quick memory aid: 60 mph is roughly 100 km/h. To convert the other way, divide km/h by 1.609344.",
  },
  {
    category: "speed",
    from: "kmh",
    to: "mph",
    body: "To convert kilometers per hour to miles per hour, divide by 1.609344. The formula is: mph = km/h ÷ 1.609344. For example, 100 km/h ÷ 1.609344 = 62.14 mph. This conversion is useful for US drivers reading European speed limits, or for international runners and cyclists. The quick mental math: divide km/h by 1.6 for an approximate mph. For reference, 50 km/h ≈ 31 mph, 80 km/h ≈ 50 mph, 120 km/h ≈ 75 mph.",
  },
  {
    category: "pressure",
    from: "psi",
    to: "bar",
    body: "To convert PSI (pounds per square inch) to bar, multiply by 0.0689476. The formula is: bar = PSI × 0.0689476. For example, 30 PSI × 0.0689476 = 2.07 bar. This conversion comes up frequently with tire pressure (car tires are typically 30-35 PSI / 2.0-2.4 bar) and industrial pressure gauges. Quick memory aid: 1 bar ≈ 14.5 PSI, and 1 PSI ≈ 0.069 bar. To convert the other way, divide bar by 0.0689476 (or multiply by 14.5038).",
  },
  {
    category: "energy",
    from: "kwh",
    to: "btu",
    body: "To convert kilowatt-hours to BTU (British Thermal Units), multiply by 3412.14. The formula is: BTU = kWh × 3412.14. For example, 100 kWh × 3412.14 = 341,214 BTU. This conversion is used in HVAC sizing (air conditioners and heaters are often rated in BTU/hour), electricity billing (utilities charge per kWh), and energy efficiency comparisons. One kWh equals exactly 3,412.14 BTU. To convert BTU to kWh, divide by 3412.14.",
  },
  {
    category: "data",
    from: "mb",
    to: "kb",
    body: "To convert megabytes to kilobytes, multiply by 1024. The formula is: KB = MB × 1024. For example, 5 MB × 1024 = 5120 KB. This conversion is used when comparing file sizes, data transfer limits, and memory capacity. Note that these conversions use the binary (1024-based) definition common in computing, not the SI (1000-based) definition that some standards bodies prefer. For SI units: 1 MB = 1000 KB, 1 GB = 1000 MB. Most operating systems and software use the binary definition by default.",
  },
  {
    category: "data",
    from: "gb",
    to: "mb",
    body: "To convert gigabytes to megabytes, multiply by 1024. The formula is: MB = GB × 1024. For example, 1 GB = 1024 MB, 4 GB = 4096 MB, 16 GB = 16384 MB. This conversion is common when comparing RAM, storage capacity, and data plan sizes. Some contexts use the SI definition (1 GB = 1000 MB) — disk drive manufacturers typically use SI, while operating systems and RAM specs use binary. The difference is small (1 GB binary = 1.074 GB SI) but adds up at scale.",
  },
];

// ─────────────────────────────────────────────────────────────────────
// URL slug + title generators
// ─────────────────────────────────────────────────────────────────────

function pairSlug(from: string, to: string): string {
  return `${from}-to-${to}`;
}

function pairTitle(category: string, from: string, to: string): string {
  const fromLabel = unitLabel[from] ?? from.toUpperCase();
  const toLabel = unitLabel[to] ?? to.toUpperCase();
  return `${fromLabel} to ${toLabel} converter`;
}

function pairDescription(category: string, from: string, to: string): string {
  const fromLabel = unitLabel[from] ?? from.toUpperCase();
  const toLabel = unitLabel[to] ?? to.toUpperCase();
  const fromUnit = from;
  const toUnit = to;
  return `Free online ${fromLabel.toLowerCase()} to ${toLabel.toLowerCase()} converter. Convert ${fromUnit} to ${toUnit} instantly in your browser. 100% client-side, no uploads, no account required.`;
}

function prefillSlug(value: string, from: string, to: string): string {
  return `${value}-${from}-to-${to}`;
}

function prefillTitle(category: string, value: string, from: string, to: string, customTitle?: string): string {
  if (customTitle) return customTitle;
  const fromLabel = unitLabel[from] ?? from.toUpperCase();
  const toLabel = unitLabel[to] ?? to.toUpperCase();
  return `${value} ${fromLabel} to ${toLabel}`;
}

function prefillDescription(category: string, value: string, from: string, to: string): string {
  const fromLabel = unitLabel[from] ?? from.toUpperCase();
  const toLabel = unitLabel[to] ?? to.toUpperCase();
  return `Convert ${value} ${fromLabel.toLowerCase()} to ${toLabel.toLowerCase()} instantly. Free, accurate, browser-based, 100% client-side.`;
}

function howToSlug(from: string, to: string): string {
  return `how-${from}-to-${to}`;
}

function howToTitle(category: string, from: string, to: string): string {
  const fromLabel = unitLabel[from] ?? from.toUpperCase();
  const toLabel = unitLabel[to] ?? to.toUpperCase();
  return `How to convert ${fromLabel.toLowerCase()} to ${toLabel.toLowerCase()}`;
}

function howToDescription(category: string, from: string, to: string): string {
  const fromLabel = unitLabel[from] ?? from.toUpperCase();
  const toLabel = unitLabel[to] ?? to.toUpperCase();
  return `Step-by-step explanation of how to convert ${fromLabel.toLowerCase()} to ${toLabel.toLowerCase()}, with formulas, worked examples, and a free online calculator.`;
}

// For each pair, compute the canonical sibling slugs (for see-also cross-linking).
// We link to the 4 most related pairs in the same category.
function computeSeeAlso(category: string, currentSlug: string, currentFrom: string, currentTo: string): string[] {
  const siblings = PAIRS.filter((p) => p.category === category && pairSlug(p.from, p.to) !== currentSlug)
    .map((p) => pairSlug(p.from, p.to));
  // Prefer pairs that share a unit with the current pair
  const related = siblings.filter((s) => {
    const [f, , t] = s.split("-to-");
    return f === currentFrom || f === currentTo || t === currentFrom || t === currentTo;
  });
  // Pad with other siblings if we don't have 4 related
  const others = siblings.filter((s) => !related.includes(s));
  return [...related, ...others].slice(0, 4);
}

// ─────────────────────────────────────────────────────────────────────
// Generator
// ─────────────────────────────────────────────────────────────────────

export function buildUnitConversionLandingPages(): LandingPage[] {
  const out: LandingPage[] = [];

  // 1. Pair pages
  for (const pair of PAIRS) {
    const urlCategory = categorySlugForUrl[pair.category]!;
    const slug = pair.slug ?? pairSlug(pair.from, pair.to);
    const seeAlso = computeSeeAlso(pair.category, slug, pair.from, pair.to);
    out.push({
      canonicalSlug: TOOL,
      category: urlCategory,
      slug,
      intent: "convert",
      title: pair.title ?? pairTitle(pair.category, pair.from, pair.to),
      description: pair.desc ?? pairDescription(pair.category, pair.from, pair.to),
      prefill: { category: pair.category, fromUnit: pair.from, toUnit: pair.to, value: "1" },
      content: {
        formula: getFormulaForCategory(pair.category, pair.from, pair.to),
        seeAlso: seeAlso.map((s) => `${urlCategory}/${s}`),
      },
      faq: getFaqForPair(pair.category, pair.from, pair.to),
    });
  }

  // 2. Pre-filled value pages
  for (const pf of PRE_FILLS) {
    const urlCategory = categorySlugForUrl[pf.category]!;
    const slug = prefillSlug(pf.value, pf.from, pf.to);
    out.push({
      canonicalSlug: TOOL,
      category: urlCategory,
      slug,
      intent: "compute",
      title: prefillTitle(pf.category, pf.value, pf.from, pf.to, pf.title),
      description: prefillDescription(pf.category, pf.value, pf.from, pf.to),
      prefill: { category: pf.category, fromUnit: pf.from, toUnit: pf.to, value: pf.value },
      content: {
        formula: getFormulaForCategory(pf.category, pf.from, pf.to),
        seeAlso: computeSeeAlso(pf.category, prefillSlug(pf.value, pf.from, pf.to), pf.from, pf.to).map((s) => `${urlCategory}/${s}`),
      },
    });
  }

  // 3. "How to" educational pages
  for (const ht of HOW_TOS) {
    const urlCategory = categorySlugForUrl[ht.category]!;
    const slug = howToSlug(ht.from, ht.to);
    out.push({
      canonicalSlug: TOOL,
      category: urlCategory,
      slug,
      intent: "learn",
      title: howToTitle(ht.category, ht.from, ht.to),
      description: howToDescription(ht.category, ht.from, ht.to),
      prefill: { category: ht.category, fromUnit: ht.from, toUnit: ht.to, value: "1" },
      content: {
        intro: ht.body,
        formula: getFormulaForCategory(ht.category, ht.from, ht.to),
        seeAlso: computeSeeAlso(ht.category, slug, ht.from, ht.to).map((s) => `${urlCategory}/${s}`),
      },
    });
  }

  return out;
}

function getFormulaForCategory(category: string, from: string, to: string): string {
  if (category === "temperature") {
    if (from === "c" && to === "f") return "F = (C × 9/5) + 32";
    if (from === "f" && to === "c") return "C = (F − 32) × 5/9";
    if (from === "c" && to === "k") return "K = C + 273.15";
    if (from === "k" && to === "c") return "C = K − 273.15";
    if (from === "f" && to === "k") return "K = (F − 32) × 5/9 + 273.15";
    if (from === "k" && to === "f") return "F = (K − 273.15) × 9/5 + 32";
  }
  if (category === "fuelEconomy") {
    if (from === "mpg" && to === "l100") return "L/100km = 235.215 ÷ mpg";
    if (from === "l100" && to === "mpg") return "mpg = 235.215 ÷ (L/100km)";
  }
  return `${unitLabel[to] ?? to} = ${unitLabel[from] ?? from} × conversion factor`;
}

function getFaqForPair(category: string, from: string, to: string): { question: string; answer: string }[] {
  const fromLabel = unitLabel[from] ?? from.toUpperCase();
  const toLabel = unitLabel[to] ?? to.toUpperCase();
  return [
    {
      question: `How do I convert ${fromLabel.toLowerCase()} to ${toLabel.toLowerCase()}?`,
      answer: `Use the calculator on this page. Enter any value in ${fromLabel.toLowerCase()} and the equivalent in ${toLabel.toLowerCase()} is computed instantly. The conversion uses the exact factor: 1 ${from.toUpperCase()} = ${to.toUpperCase()} × factor. The full formula is shown in the "Formula" section above.`,
    },
    {
      question: `Is the ${fromLabel.toLowerCase()} to ${toLabel.toLowerCase()} conversion exact?`,
      answer: `Yes, the conversion is computed with full floating-point precision and rounded to 10 significant digits by default. All math runs in your browser — your input is never uploaded, never stored, and never logged. The result is reproducible and matches standard reference values.`,
    },
    {
      question: `Can I convert in batch?`,
      answer: `Yes. The Unit Converter on this site has a batch mode: paste one value per line and click "Convert Batch" to get every result in one go. The batch output is plain text you can copy.`,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────
// Final landing-page dataset. Other modules (the engine, the sitemap
// emitter, the cross-link graph) walk this list. New long-tail URL
// sources (PR 3+ for BMI, age, mortgage upgrades) append their own
// builders here.
// ─────────────────────────────────────────────────────────────────────

export function buildAllLandingPages(): LandingPage[] {
  return buildUnitConversionLandingPages();
}