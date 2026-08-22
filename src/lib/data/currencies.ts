export interface Currency {
  code: string;
  name: string;
  symbol: string;
  symbolNative: string;
  decimals: number;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", symbolNative: "$", decimals: 2, locale: "en-US" },
  { code: "EUR", name: "Euro", symbol: "€", symbolNative: "€", decimals: 2, locale: "de-DE" },
  { code: "GBP", name: "British Pound", symbol: "£", symbolNative: "£", decimals: 2, locale: "en-GB" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", symbolNative: "₹", decimals: 2, locale: "en-IN" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", symbolNative: "$", decimals: 2, locale: "en-AU" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", symbolNative: "$", decimals: 2, locale: "en-CA" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", symbolNative: "￥", decimals: 0, locale: "ja-JP" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", symbolNative: "¥", decimals: 2, locale: "zh-CN" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", symbolNative: "CHF", decimals: 2, locale: "de-CH" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", symbolNative: "$", decimals: 2, locale: "en-SG" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", symbolNative: "$", decimals: 2, locale: "zh-HK" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", symbolNative: "$", decimals: 2, locale: "en-NZ" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", symbolNative: "kr", decimals: 2, locale: "sv-SE" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", symbolNative: "kr", decimals: 2, locale: "nb-NO" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", symbolNative: "kr", decimals: 2, locale: "da-DK" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", symbolNative: "zł", decimals: 2, locale: "pl-PL" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", symbolNative: "د.إ", decimals: 2, locale: "ar-AE" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", symbolNative: "﷼", decimals: 2, locale: "ar-SA" },
  { code: "ZAR", name: "South African Rand", symbol: "R", symbolNative: "R", decimals: 2, locale: "en-ZA" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "₨", symbolNative: "₨", decimals: 2, locale: "si-LK" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", symbolNative: "R$", decimals: 2, locale: "pt-BR" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", symbolNative: "$", decimals: 2, locale: "es-MX" },
];

export const DEFAULT_CURRENCY_CODE = "USD";

export function getCurrency(code: string): Currency {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? SUPPORTED_CURRENCIES[0];
}

export function getCurrencyLocale(code: string): string {
  return getCurrency(code).locale;
}

export function getCurrencySymbol(code: string): string {
  return getCurrency(code).symbolNative;
}

export function getCurrencyDecimals(code: string): number {
  return getCurrency(code).decimals;
}

export const POPULAR_CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "AUD",
  "CAD",
  "JPY",
  "CNY",
  "CHF",
  "SGD",
  "HKD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "AED",
  "SAR",
  "ZAR",
  "LKR",
  "BRL",
  "MXN",
];

export function getPopularCurrencies(): Currency[] {
  return POPULAR_CURRENCY_CODES.map((code) => getCurrency(code)).filter(Boolean);
}