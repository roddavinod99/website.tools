"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback } from "react";
import type { ComponentType } from "react";
import { scheduleIdlePreload } from "@/lib/preloader";

type ToolLoader = () => Promise<{ default: ComponentType }>;

const toolLoaders: Record<string, ToolLoader> = {
  "json-formatter": () => import("./formatters/json-formatter").then((m) => ({ default: m.JSONFormatter })),
  "json-to-csv": () => import("./converters/json-to-csv").then((m) => ({ default: m.JSONToCSV })),
  "json-to-yaml": () => import("./formatters/json-to-yaml").then((m) => ({ default: m.JSONToYAML })),
  "jwt-decoder": () => import("./crypto/jwt-decoder").then((m) => ({ default: m.JWTDecoder })),
  "sql-formatter": () => import("./formatters/sql-formatter").then((m) => ({ default: m.SQLFormatter })),
  "uuid-generator": () => import("./utilities/uuid-generator").then((m) => ({ default: m.UUIDGenerator })),
  "qr-generator": () => import("./generators/qr-generator").then((m) => ({ default: m.QRGenerator })),
  "image-compressor": () => import("./image/image-compressor").then((m) => ({ default: m.ImageCompressor })),
  "password-generator": () => import("./security/password-generator").then((m) => ({ default: m.PasswordGenerator })),
  "word-counter": () => import("./utilities/word-counter").then((m) => ({ default: m.WordCounter })),
  "url-encoder": () => import("./utilities/url-encoder").then((m) => ({ default: m.URLEncoder })),
  "js-minifier": () => import("./formatters/js-minifier").then((m) => ({ default: m.JSMinifier })),
  "diff-checker": () => import("./utilities/diff-checker").then((m) => ({ default: m.DiffChecker })),
  "regex-tester": () => import("./utilities/regex-tester").then((m) => ({ default: m.RegexTester })),
  "color-converter": () => import("./image/color-converter").then((m) => ({ default: m.ColorConverter })),
  "timestamp-converter": () => import("./utilities/timestamp-converter").then((m) => ({ default: m.TimestampConverter })),
  "hash-generator": () => import("./crypto/hash-generator").then((m) => ({ default: m.HashGenerator })),
  "base64": () => import("./encoders/base64").then((m) => ({ default: m.Base64Tool })),
  "html-entity": () => import("./formatters/html-entity").then((m) => ({ default: m.HtmlEntity })),
  "binary": () => import("./utilities/binary").then((m) => ({ default: m.Binary })),
  "hex": () => import("./crypto/hex").then((m) => ({ default: m.Hex })),
  "escape-unescape": () => import("./utilities/escape-unescape").then((m) => ({ default: m.EscapeUnescape })),
  "image-to-base64": () => import("./image/image-to-base64").then((m) => ({ default: m.ImageToBase64 })),
  "morse-code": () => import("./utilities/morse-code").then((m) => ({ default: m.MorseCode })),
  "random-data": () => import("./generators/random-data").then((m) => ({ default: m.RandomData })),
  "ascii-art": () => import("./utilities/ascii-art").then((m) => ({ default: m.AsciiArt })),
  "barcode-generator": () => import("./generators/barcode-generator").then((m) => ({ default: m.BarcodeGenerator })),
  "lorem-ipsum": () => import("./utilities/lorem-ipsum").then((m) => ({ default: m.LoremIpsum })),
  "cron-expression": () => import("./utilities/cron-expression").then((m) => ({ default: m.CronExpression })),
  "csv-to-json": () => import("./converters/csv-to-json").then((m) => ({ default: m.CsvToJson })),
  "json-to-xml": () => import("./json/json-to-xml").then((m) => ({ default: m.JsonToXml })),
  "xml-to-json": () => import("./converters/xml-to-json").then((m) => ({ default: m.XmlToJson })),
  "markdown-to-html": () => import("./formatters/markdown-to-html").then((m) => ({ default: m.MarkdownToHtml })),
  "html-to-markdown": () => import("./formatters/html-to-markdown").then((m) => ({ default: m.HtmlToMarkdown })),
  "toml-converter": () => import("./converters/toml-converter").then((m) => ({ default: m.TomlConverter })),
  "unit-converter": () => import("./converters/unit-converter").then((m) => ({ default: m.UnitConverter })),
  "case-converter": () => import("./utilities/case-converter").then((m) => ({ default: m.CaseConverter })),
  "base-converter": () => import("./converters/base-converter").then((m) => ({ default: m.BaseConverter })),
  "number-to-words": () => import("./utilities/number-to-words").then((m) => ({ default: m.NumberToWords })),
  "json-to-typescript": () => import("./json/json-to-typescript").then((m) => ({ default: m.JsonToTypescript })),
  "json-to-go": () => import("./json/json-to-go").then((m) => ({ default: m.JsonToGo })),
  "image-resizer": () => import("./image/image-resizer").then((m) => ({ default: m.ImageResizer })),
  "favicon-generator": () => import("./image/favicon-generator").then((m) => ({ default: m.FaviconGenerator })),
  "svg-optimizer": () => import("./image/svg-optimizer").then((m) => ({ default: m.SvgOptimizer })),
  "placeholder-image": () => import("./generators/placeholder-image").then((m) => ({ default: m.PlaceholderImage })),
  "svg-to-css": () => import("./image/svg-to-css").then((m) => ({ default: m.SvgToCss })),
  "exif-reader": () => import("./image/exif-reader").then((m) => ({ default: m.ExifReader })),
  "exif-transfer": () => import("./image/exif-transfer").then((m) => ({ default: m.ExifTransfer })),
  "color-eyedropper": () => import("./image/color-eyedropper").then((m) => ({ default: m.ColorEyedropper })),
  "css-formatter": () => import("./formatters/css-formatter").then((m) => ({ default: m.CSSFormatter })),
  "html-formatter": () => import("./formatters/html-formatter").then((m) => ({ default: m.HTMLFormatter })),
  "xml-formatter": () => import("./formatters/xml-formatter").then((m) => ({ default: m.XMLFormatter })),
  "yaml-formatter": () => import("./formatters/yaml-formatter").then((m) => ({ default: m.YAMLFormatter })),
  "text-analyzer": () => import("./text/text-analyzer").then((m) => ({ default: m.TextAnalyzer })),
  "json-diff": () => import("./json/json-diff").then((m) => ({ default: m.JSONDiff })),
  "json-beautifier": () => import("./json/json-beautifier").then((m) => ({ default: m.JSONBeautifier })),
  "json-minifier": () => import("./json/json-minifier").then((m) => ({ default: m.JSONMinifier })),
  "json-validator": () => import("./json/json-validator").then((m) => ({ default: m.JSONValidator })),
  "jwt-generator": () => import("./crypto/jwt-generator").then((m) => ({ default: m.JwtGenerator })),
  "totp-generator": () => import("./crypto/totp-generator").then((m) => ({ default: m.TotpGenerator })),
  "ssl-decoder": () => import("./security/ssl-decoder").then((m) => ({ default: m.SslDecoder })),
  "csp-generator": () => import("./security/csp-generator").then((m) => ({ default: m.CspGenerator })),
  "file-checksum": () => import("./utilities/file-checksum").then((m) => ({ default: m.FileChecksum })),
  "text-sorter": () => import("./text-sorter").then((m) => ({ default: m.TextSorter })),
  "http-header-parser": () => import("./network/http-header-parser").then((m) => ({ default: m.HttpHeaderParser })),
  "url-parser": () => import("./utilities/url-parser").then((m) => ({ default: m.UrlParser })),
  "user-agent-parser": () => import("./network/user-agent-parser").then((m) => ({ default: m.UserAgentParser })),
  "ip-calculator": () => import("./network/ip-calculator").then((m) => ({ default: m.IpCalculator })),
  "json-path-finder": () => import("./json/json-path-finder").then((m) => ({ default: m.JsonPathFinder })),
  "markdown-preview": () => import("./formatters/markdown-preview").then((m) => ({ default: m.MarkdownPreview })),
  "slug-generator": () => import("./utilities/slug-generator").then((m) => ({ default: m.SlugGenerator })),
  "string-length": () => import("./utilities/string-length").then((m) => ({ default: m.StringLength })),
  "json-schema-generator": () => import("./json/json-schema-generator").then((m) => ({ default: m.JsonSchemaGenerator })),
  "dns-lookup": () => import("./network/dns-lookup").then((m) => ({ default: m.DNSLookup })),
  "ip-lookup": () => import("./network/ip-lookup").then((m) => ({ default: m.IPLookup })),
  "bcrypt-generator": () => import("./crypto/bcrypt-generator").then((m) => ({ default: m.BcryptGenerator })),
  "ulid-generator": () => import("./crypto/ulid-generator").then((m) => ({ default: m.UlidGenerator })),
  "hmac-generator": () => import("./crypto/hmac-generator").then((m) => ({ default: m.HmacGenerator })),
  "rsa-key-generator": () => import("./crypto/rsa-key-generator").then((m) => ({ default: m.RsaKeyGenerator })),
  "password-strength": () => import("./security/password-strength").then((m) => ({ default: m.PasswordStrength })),
  "bip39-generator": () => import("./crypto/bip39-generator").then((m) => ({ default: m.Bip39Generator })),
  "mac-address-lookup": () => import("./network/mac-address-lookup").then((m) => ({ default: m.MacAddressLookup })),
  "mac-address-generator": () => import("./network/mac-address-generator").then((m) => ({ default: m.MacAddressGenerator })),
  "phone-number-parser": () => import("./network/phone-number-parser").then((m) => ({ default: m.PhoneNumberParser })),
  "iban-validator": () => import("./finance/iban-validator").then((m) => ({ default: m.IBANValidator })),
  "roman-numeral-converter": () => import("./utilities/roman-numeral-converter").then((m) => ({ default: m.RomanNumeralConverter })),
  "nato-alphabet": () => import("./utilities/nato-alphabet").then((m) => ({ default: m.NatoAlphabet })),
  "text-to-unicode": () => import("./text-to-unicode").then((m) => ({ default: m.TextToUnicode })),
  "list-converter": () => import("./converters/list-converter").then((m) => ({ default: m.ListConverter })),
  "temperature-converter": () => import("./utilities/temperature-converter").then((m) => ({ default: m.TemperatureConverter })),
  "random-port-generator": () => import("./utilities/random-port-generator").then((m) => ({ default: m.RandomPortGenerator })),
  "meta-tag-generator": () => import("./utilities/meta-tag-generator").then((m) => ({ default: m.MetaTagGenerator })),
  "docker-run-to-compose": () => import("./utilities/docker-run-to-compose").then((m) => ({ default: m.DockerRunToCompose })),
  "yaml-viewer": () => import("./converters/yaml-viewer").then((m) => ({ default: m.YAMLViewer })),
  "benchmark-builder": () => import("./utilities/benchmark-builder").then((m) => ({ default: m.BenchmarkBuilder })),
  "basic-auth-generator": () => import("./security/basic-auth-generator").then((m) => ({ default: m.BasicAuthGenerator })),
  "mime-types": () => import("./utilities/mime-types").then((m) => ({ default: m.MimeTypes })),
  "keycode-info": () => import("./utilities/keycode-info").then((m) => ({ default: m.KeycodeInfo })),
  "slugify-string": () => import("./utilities/slugify-string").then((m) => ({ default: m.SlugifyString })),
  "safelink-decoder": () => import("./security/safelink-decoder").then((m) => ({ default: m.SafelinkDecoder })),
  "device-information": () => import("./utilities/device-information").then((m) => ({ default: m.DeviceInformation })),
  "email-normalizer": () => import("./utilities/email-normalizer").then((m) => ({ default: m.EmailNormalizer })),
  "text-diff-visual": () => import("./text-diff-visual").then((m) => ({ default: m.TextDiffVisual })),
  "string-obfuscator": () => import("./utilities/string-obfuscator").then((m) => ({ default: m.StringObfuscator })),
  "math-evaluator": () => import("./utilities/math-evaluator").then((m) => ({ default: m.MathEvaluator })),
  "chronometer": () => import("./utilities/chronometer").then((m) => ({ default: m.Chronometer })),
  "percentage-calculator": () => import("./finance/percentage-calculator").then((m) => ({ default: m.PercentageCalculator })),
  "bmi-calculator": () => import("./health/bmi-calculator").then((m) => ({ default: m.BMICalculator })),
  "age-calculator": () => import("./date/age-calculator").then((m) => ({ default: m.AgeCalculator })),
  "emoji-picker": () => import("./utilities/emoji-picker").then((m) => ({ default: m.EmojiPicker })),
  "ipv4-subnet-calculator": () => import("./network/ipv4-subnet-calculator").then((m) => ({ default: m.Ipv4SubnetCalculator })),
  "ipv4-address-converter": () => import("./network/ipv4-address-converter").then((m) => ({ default: m.Ipv4AddressConverter })),
  "ipv4-range-expander": () => import("./network/ipv4-range-expander").then((m) => ({ default: m.Ipv4RangeExpander })),
  "ipv6-ula-generator": () => import("./network/ipv6-ula-generator").then((m) => ({ default: m.Ipv6UlaGenerator })),
  "base64-decoder": () => import("./encoders/base64-decoder").then((m) => ({ default: m.Base64Decoder })),
  "base64-encoder": () => import("./encoders/base64-encoder").then((m) => ({ default: m.Base64Encoder })),
  "css-minifier": () => import("./formatters/css-minifier").then((m) => ({ default: m.CSSMinifier })),
  "html-minifier": () => import("./formatters/html-minifier").then((m) => ({ default: m.HTMLMinifier })),
  "prompt-generator": () => import("./utilities/prompt-generator").then((m) => ({ default: m.PromptGenerator })),
  "prompt-improver": () => import("./utilities/prompt-improver").then((m) => ({ default: m.PromptImprover })),
  "markdown-editor": () => import("./formatters/markdown-editor").then((m) => ({ default: m.MarkdownEditor })),
  "chmod-calculator": () => import("./utilities/chmod-calculator").then((m) => ({ default: m.ChmodCalculator })),
  "eta-calculator": () => import("./utilities/eta-calculator").then((m) => ({ default: m.EtaCalculator })),
  "token-generator": () => import("./crypto/token-generator").then((m) => ({ default: m.TokenGenerator })),
  "encrypt-decrypt": () => import("./crypto/encrypt-decrypt").then((m) => ({ default: m.EncryptDecrypt })),
  "wifi-qr-generator": () => import("./generators/wifi-qr-generator").then((m) => ({ default: m.WifiQRGenerator })),
  "http-status-codes": () => import("./network/http-status-codes").then((m) => ({ default: m.HTTPStatusCodes })),
  "git-cheatsheet": () => import("./utilities/git-cheatsheet").then((m) => ({ default: m.GitCheatsheet })),
  "regex-memo": () => import("./utilities/regex-memo").then((m) => ({ default: m.RegexMemo })),
  "numeronym-generator": () => import("./utilities/numeronym-generator").then((m) => ({ default: m.NumeronymGenerator })),
  "contrast-checker": () => import("./image/contrast-checker").then((m) => ({ default: m.ContrastChecker })),
  "vcard-generator": () => import("./generators/vcard-generator").then((m) => ({ default: m.VcardGenerator })),
  "date-calculator": () => import("./utilities/date-calculator").then((m) => ({ default: m.DateCalculator })),
  "date-formatter": () => import("./utilities/date-formatter").then((m) => ({ default: m.DateFormatter })),
  "ipv6-calculator": () => import("./network/ipv6-calculator").then((m) => ({ default: m.Ipv6Calculator })),
  "string-comparison": () => import("./utilities/string-comparison").then((m) => ({ default: m.StringComparison })),
  "code-complexity": () => import("./utilities/code-complexity").then((m) => ({ default: m.CodeComplexity })),
  "table-to-json": () => import("./converters/table-to-json").then((m) => ({ default: m.TableToJson })),
  "compound-interest-calculator": () => import("./finance/compound-interest-calculator").then((m) => ({ default: m.CompoundInterestCalculator })),
  "sip-calculator": () => import("./finance/sip-calculator").then((m) => ({ default: m.SipCalculator })),
  "loan-emi-calculator": () => import("./finance/loan-emi-calculator").then((m) => ({ default: m.LoanEmiCalculator })),
  "mortgage-payoff": () => import("./finance/mortgage-payoff").then((m) => ({ default: m.MortgagePayoff })),
  "cagr-calculator": () => import("./finance/cagr-calculator").then((m) => ({ default: m.CagrCalculator })),
  "roi-calculator": () => import("./finance/roi-calculator").then((m) => ({ default: m.RoiCalculator })),
  "profit-margin-calculator": () => import("./finance/profit-margin-calculator").then((m) => ({ default: m.ProfitMarginCalculator })),
  "savings-goal-calculator": () => import("./finance/savings-goal-calculator").then((m) => ({ default: m.SavingsGoalCalculator })),
  "income-tax-calculator": () => import("./finance/income-tax-calculator").then((m) => ({ default: m.IncomeTaxCalculator })),
  "us-income-tax-calculator": () => import("./finance/us-income-tax-calculator").then((m) => ({ default: m.UsIncomeTaxCalculator })),
  "capital-gains-tax": () => import("./finance/capital-gains-calculator").then((m) => ({ default: m.CapitalGainsCalculator })),
  "debt-payoff": () => import("./finance/debt-payoff").then((m) => ({ default: m.DebtPayoff })),
  "credit-card-payoff": () => import("./finance/credit-card-payoff").then((m) => ({ default: m.CreditCardPayoff })),
  "debt-to-income": () => import("./finance/debt-to-income").then((m) => ({ default: m.DebtToIncome })),
  "break-even": () => import("./finance/break-even").then((m) => ({ default: m.BreakEven })),
  "auto-loan": () => import("./finance/auto-loan").then((m) => ({ default: m.AutoLoanCalculator })),
  "student-loan": () => import("./finance/student-loan").then((m) => ({ default: m.StudentLoanCalculator })),
  "home-affordability": () => import("./finance/home-affordability").then((m) => ({ default: m.HomeAffordabilityCalculator })),
  "rent-vs-buy": () => import("./finance/rent-vs-buy").then((m) => ({ default: m.RentVsBuy })),
  "retirement-savings": () => import("./finance/retirement-savings").then((m) => ({ default: m.RetirementSavingsCalculator })),
  "fixed-deposit": () => import("./finance/fixed-deposit").then((m) => ({ default: m.FixedDepositCalculator })),
  "recurring-deposit": () => import("./finance/recurring-deposit").then((m) => ({ default: m.RecurringDepositCalculator })),
  "down-payment-planner": () => import("./finance/down-payment-planner").then((m) => ({ default: m.DownPaymentPlanner })),
  "tip-calculator": () => import("./finance/tip-calculator").then((m) => ({ default: m.TipCalculator })),
  "scientific-calculator": () => import("./math/scientific-calculator").then((m) => ({ default: m.ScientificCalculator })),
  "statistics-calculator": () => import("./math/statistics-calculator").then((m) => ({ default: m.StatisticsCalculator })),
  "discount-calculator": () => import("./math/discount-calculator").then((m) => ({ default: m.DiscountCalculator })),
  "vat-gst": () => import("./finance/vat-gst-calculator").then((m) => ({ default: m.VatGstCalculatorTool })),
  "simple-interest": () => import("./finance/simple-interest").then((m) => ({ default: m.SimpleInterestCalculator })),
  "inflation": () => import("./finance/inflation").then((m) => ({ default: m.InflationCalculator })),
  "net-worth": () => import("./finance/net-worth").then((m) => ({ default: m.NetWorthCalculator })),
  "emergency-fund": () => import("./finance/emergency-fund").then((m) => ({ default: m.EmergencyFundCalculator })),
  "currency-converter": () => import("./finance/currency-converter").then((m) => ({ default: m.CurrencyConverter })),
};

// Pre-create dynamic components at module level (singletons)
const toolComponents: Record<string, ComponentType> = {};
for (const [slug, loader] of Object.entries(toolLoaders)) {
  toolComponents[slug] = dynamic(loader, {
    loading: () => (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-sm text-surface-400 dark:text-dark-muted">Loading tool...</div>
      </div>
    ),
  });
}

export function preloadTool(slug: string) {
  const loader = toolLoaders[slug];
  if (loader) loader().catch(() => {});
}

export function useToolPreload(slug: string) {
  const preload = useCallback(() => preloadTool(slug), [slug]);
  return { onMouseEnter: preload, onFocus: preload };
}

export function preloadPopularTools(slugs: string[]) {
  for (const slug of slugs) {
    const loader = toolLoaders[slug];
    if (loader) {
      scheduleIdlePreload(() => loader());
    }
  }
}

interface Props {
  slug: string;
  name: string;
}

export function ToolInterface({ slug, name }: Props) {
  const Component = toolComponents[slug];

  if (!Component) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-surface-400 dark:text-dark-muted">
        <div className="text-center">
          <p className="text-lg font-medium">Interactive {name}</p>
          <p className="mt-1 text-sm">Tool interface coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-sm text-surface-400 dark:text-dark-muted">Loading tool...</div>
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
}