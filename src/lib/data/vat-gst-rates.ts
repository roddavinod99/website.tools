export interface VatGstRate {
  countryCode: string;
  countryName: string;
  taxName: string; // "VAT", "GST", "Sales Tax"
  standardRate: number; // e.g., 0.18
  reducedRates: number[]; // e.g., [0.05, 0.12]
  zeroRate: boolean; // whether a 0% rate exists
  defaultInclusive: boolean; // true for inclusive-by-default countries
  currencyCode: string; // ISO 4217 currency code
  // For Canada: provincial breakdown
  provinces?: {
    code: string;
    name: string;
    rate: number; // combined federal+provincial (HST) or provincial only (PST)
    type: "HST" | "GST+PST" | "GST+QST" | "GST"; // tax type
  }[];
}

export const VAT_GST_RATES = [
  // --- European Union (27) ---
  { countryCode: "AT", countryName: "Austria", taxName: "VAT", standardRate: 0.20, reducedRates: [0.10, 0.13], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "BE", countryName: "Belgium", taxName: "VAT", standardRate: 0.21, reducedRates: [0.06, 0.12], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "BG", countryName: "Bulgaria", taxName: "VAT", standardRate: 0.20, reducedRates: [0.09], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "HR", countryName: "Croatia", taxName: "VAT", standardRate: 0.25, reducedRates: [0.05, 0.13], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "CY", countryName: "Cyprus", taxName: "VAT", standardRate: 0.19, reducedRates: [0.05, 0.09], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "CZ", countryName: "Czechia", taxName: "VAT", standardRate: 0.21, reducedRates: [0.10, 0.15], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "DK", countryName: "Denmark", taxName: "VAT", standardRate: 0.25, reducedRates: [], zeroRate: true, defaultInclusive: true, currencyCode: "DKK" },
  { countryCode: "EE", countryName: "Estonia", taxName: "VAT", standardRate: 0.20, reducedRates: [0.09], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "FI", countryName: "Finland", taxName: "VAT", standardRate: 0.24, reducedRates: [0.10, 0.14], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "FR", countryName: "France", taxName: "VAT", standardRate: 0.20, reducedRates: [0.055, 0.10], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "DE", countryName: "Germany", taxName: "VAT", standardRate: 0.19, reducedRates: [0.07], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "GR", countryName: "Greece", taxName: "VAT", standardRate: 0.24, reducedRates: [0.06, 0.13], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "HU", countryName: "Hungary", taxName: "VAT", standardRate: 0.27, reducedRates: [0.05, 0.18], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "IE", countryName: "Ireland", taxName: "VAT", standardRate: 0.23, reducedRates: [0.09, 0.135], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "IT", countryName: "Italy", taxName: "VAT", standardRate: 0.22, reducedRates: [0.04, 0.05, 0.10], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "LV", countryName: "Latvia", taxName: "VAT", standardRate: 0.21, reducedRates: [0.12], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "LT", countryName: "Lithuania", taxName: "VAT", standardRate: 0.21, reducedRates: [0.09, 0.05], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "LU", countryName: "Luxembourg", taxName: "VAT", standardRate: 0.17, reducedRates: [0.08, 0.14], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "MT", countryName: "Malta", taxName: "VAT", standardRate: 0.18, reducedRates: [0.05, 0.07], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "NL", countryName: "Netherlands", taxName: "VAT", standardRate: 0.21, reducedRates: [0.09], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "PL", countryName: "Poland", taxName: "VAT", standardRate: 0.23, reducedRates: [0.05, 0.08], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "PT", countryName: "Portugal", taxName: "VAT", standardRate: 0.23, reducedRates: [0.06, 0.13], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "RO", countryName: "Romania", taxName: "VAT", standardRate: 0.19, reducedRates: [0.05, 0.09], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "SK", countryName: "Slovakia", taxName: "VAT", standardRate: 0.20, reducedRates: [0.10], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "SI", countryName: "Slovenia", taxName: "VAT", standardRate: 0.22, reducedRates: [0.095], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "ES", countryName: "Spain", taxName: "VAT", standardRate: 0.21, reducedRates: [0.04, 0.10], zeroRate: true, defaultInclusive: true, currencyCode: "EUR" },
  { countryCode: "SE", countryName: "Sweden", taxName: "VAT", standardRate: 0.25, reducedRates: [0.06, 0.12], zeroRate: true, defaultInclusive: true, currencyCode: "SEK" },

  // --- Other major countries ---
  { countryCode: "US", countryName: "United States", taxName: "Sales Tax", standardRate: 0.0, reducedRates: [], zeroRate: true, defaultInclusive: false, currencyCode: "USD" },
  { countryCode: "GB", countryName: "United Kingdom", taxName: "VAT", standardRate: 0.20, reducedRates: [0.05], zeroRate: true, defaultInclusive: true, currencyCode: "GBP" },
  { countryCode: "IN", countryName: "India", taxName: "GST", standardRate: 0.18, reducedRates: [0.05, 0.12], zeroRate: true, defaultInclusive: true, currencyCode: "INR" },
  {
    countryCode: "CA",
    countryName: "Canada",
    taxName: "GST/HST",
    standardRate: 0.05,
    reducedRates: [],
    zeroRate: true,
    defaultInclusive: false,
    currencyCode: "CAD",
    provinces: [
      { code: "AB", name: "Alberta", rate: 0.05, type: "GST" },
      { code: "BC", name: "British Columbia", rate: 0.12, type: "GST+PST" },
      { code: "MB", name: "Manitoba", rate: 0.12, type: "GST+PST" },
      { code: "NB", name: "New Brunswick", rate: 0.15, type: "HST" },
      { code: "NL", name: "Newfoundland and Labrador", rate: 0.15, type: "HST" },
      { code: "NS", name: "Nova Scotia", rate: 0.15, type: "HST" },
      { code: "NT", name: "Northwest Territories", rate: 0.05, type: "GST" },
      { code: "NU", name: "Nunavut", rate: 0.05, type: "GST" },
      { code: "ON", name: "Ontario", rate: 0.13, type: "HST" },
      { code: "PE", name: "Prince Edward Island", rate: 0.15, type: "HST" },
      { code: "QC", name: "Quebec", rate: 0.14975, type: "GST+QST" },
      { code: "SK", name: "Saskatchewan", rate: 0.11, type: "GST+PST" },
      { code: "YT", name: "Yukon", rate: 0.05, type: "GST" },
    ],
  },
  { countryCode: "AU", countryName: "Australia", taxName: "GST", standardRate: 0.10, reducedRates: [], zeroRate: true, defaultInclusive: true, currencyCode: "AUD" },
  { countryCode: "SG", countryName: "Singapore", taxName: "GST", standardRate: 0.09, reducedRates: [], zeroRate: true, defaultInclusive: true, currencyCode: "SGD" },
];

export function getVatGstRate(countryCode: string) {
  return VAT_GST_RATES.find((r) => r.countryCode === countryCode);
}

export function getAllCountries() {
  return VAT_GST_RATES.map((r) => ({ code: r.countryCode, name: r.countryName, taxName: r.taxName }));
}