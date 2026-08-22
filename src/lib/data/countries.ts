export interface Country {
  code: string;
  name: string;
  flag: string;
  currencyCode: string;
  taxYearLabel?: string;
  regions?: string[];
}

export const SUPPORTED_COUNTRIES: Country[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currencyCode: "USD",
    taxYearLabel: "Tax Year 2025",
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currencyCode: "INR",
    taxYearLabel: "FY 2024–25 / 2025–26",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currencyCode: "GBP",
    taxYearLabel: "Tax Year 2024–25",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currencyCode: "CAD",
    taxYearLabel: "Tax Year 2024",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currencyCode: "AUD",
    taxYearLabel: "FY 2024–25",
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    currencyCode: "EUR",
    taxYearLabel: "Tax Year 2024",
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    currencyCode: "EUR",
    taxYearLabel: "Tax Year 2024",
  },
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    currencyCode: "SGD",
    taxYearLabel: "Year of Assessment 2025",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    currencyCode: "AED",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    currencyCode: "SAR",
  },
  {
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    currencyCode: "ZAR",
    taxYearLabel: "Tax Year 2025",
  },
  {
    code: "LK",
    name: "Sri Lanka",
    flag: "🇱🇰",
    currencyCode: "LKR",
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    currencyCode: "BRL",
  },
  {
    code: "MX",
    name: "Mexico",
    flag: "🇲🇽",
    currencyCode: "MXN",
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    currencyCode: "JPY",
    taxYearLabel: "Tax Year 2024",
  },
  {
    code: "CN",
    name: "China",
    flag: "🇨🇳",
    currencyCode: "CNY",
  },
  {
    code: "HK",
    name: "Hong Kong",
    flag: "🇭🇰",
    currencyCode: "HKD",
  },
  {
    code: "NZ",
    name: "New Zealand",
    flag: "🇳🇿",
    currencyCode: "NZD",
    taxYearLabel: "Tax Year 2024–25",
  },
  {
    code: "CH",
    name: "Switzerland",
    flag: "🇨🇭",
    currencyCode: "CHF",
  },
];

export const TAX_CALCULATOR_COUNTRIES = ["US", "IN", "GB", "CA", "AU", "DE", "FR", "SG", "ZA", "JP", "NZ"];

export function getCountry(code: string): Country | undefined {
  return SUPPORTED_COUNTRIES.find((c) => c.code === code);
}

export function getCountryByCurrency(currencyCode: string): Country | undefined {
  return SUPPORTED_COUNTRIES.find((c) => c.currencyCode === currencyCode);
}

export function getCountriesForTaxCalculator(): Country[] {
  return SUPPORTED_COUNTRIES.filter((c) => TAX_CALCULATOR_COUNTRIES.includes(c.code));
}

export const DEFAULT_COUNTRY_CODE = "US";