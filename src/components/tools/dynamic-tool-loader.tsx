"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback } from "react";
import type { ComponentType } from "react";
import { scheduleIdlePreload } from "@/lib/preloader";

type ToolLoader = () => Promise<{ default: ComponentType }>;

const toolLoaders: Record<string, ToolLoader> = {
  "json-formatter": () => import("./json-formatter").then((m) => ({ default: m.JSONFormatter })),
  "json-to-csv": () => import("./json-to-csv").then((m) => ({ default: m.JSONToCSV })),
  "json-to-yaml": () => import("./json-to-yaml").then((m) => ({ default: m.JSONToYAML })),
  "jwt-decoder": () => import("./jwt-decoder").then((m) => ({ default: m.JWTDecoder })),
  "sql-formatter": () => import("./sql-formatter").then((m) => ({ default: m.SQLFormatter })),
  "uuid-generator": () => import("./uuid-generator").then((m) => ({ default: m.UUIDGenerator })),
  "qr-generator": () => import("./qr-generator").then((m) => ({ default: m.QRGenerator })),
  "image-compressor": () => import("./image-compressor").then((m) => ({ default: m.ImageCompressor })),
  "password-generator": () => import("./password-generator").then((m) => ({ default: m.PasswordGenerator })),
  "word-counter": () => import("./word-counter").then((m) => ({ default: m.WordCounter })),
  "url-encoder": () => import("./url-encoder").then((m) => ({ default: m.URLEncoder })),
  "js-minifier": () => import("./js-minifier").then((m) => ({ default: m.JSMinifier })),
  "diff-checker": () => import("./diff-checker").then((m) => ({ default: m.DiffChecker })),
  "regex-tester": () => import("./regex-tester").then((m) => ({ default: m.RegexTester })),
  "color-converter": () => import("./color-converter").then((m) => ({ default: m.ColorConverter })),
  "timestamp-converter": () => import("./timestamp-converter").then((m) => ({ default: m.TimestampConverter })),
  "hash-generator": () => import("./hash-generator").then((m) => ({ default: m.HashGenerator })),
  "base64": () => import("./base64").then((m) => ({ default: m.Base64Tool })),
  "html-entity": () => import("./html-entity").then((m) => ({ default: m.HtmlEntity })),
  "binary": () => import("./binary").then((m) => ({ default: m.Binary })),
  "hex": () => import("./hex").then((m) => ({ default: m.Hex })),
  "escape-unescape": () => import("./escape-unescape").then((m) => ({ default: m.EscapeUnescape })),
  "image-to-base64": () => import("./image-to-base64").then((m) => ({ default: m.ImageToBase64 })),
  "morse-code": () => import("./morse-code").then((m) => ({ default: m.MorseCode })),
  "random-data": () => import("./random-data").then((m) => ({ default: m.RandomData })),
  "ascii-art": () => import("./ascii-art").then((m) => ({ default: m.AsciiArt })),
  "barcode-generator": () => import("./barcode-generator").then((m) => ({ default: m.BarcodeGenerator })),
  "lorem-ipsum": () => import("./lorem-ipsum").then((m) => ({ default: m.LoremIpsum })),
  "cron-expression": () => import("./cron-expression").then((m) => ({ default: m.CronExpression })),
  "csv-to-json": () => import("./csv-to-json").then((m) => ({ default: m.CsvToJson })),
  "json-to-xml": () => import("./json-to-xml").then((m) => ({ default: m.JsonToXml })),
  "xml-to-json": () => import("./xml-to-json").then((m) => ({ default: m.XmlToJson })),
  "markdown-to-html": () => import("./markdown-to-html").then((m) => ({ default: m.MarkdownToHtml })),
  "html-to-markdown": () => import("./html-to-markdown").then((m) => ({ default: m.HtmlToMarkdown })),
  "toml-converter": () => import("./toml-converter").then((m) => ({ default: m.TomlConverter })),
  "unit-converter": () => import("./unit-converter").then((m) => ({ default: m.UnitConverter })),
  "case-converter": () => import("./case-converter").then((m) => ({ default: m.CaseConverter })),
  "base-converter": () => import("./base-converter").then((m) => ({ default: m.BaseConverter })),
  "number-to-words": () => import("./number-to-words").then((m) => ({ default: m.NumberToWords })),
  "json-to-typescript": () => import("./json-to-typescript").then((m) => ({ default: m.JsonToTypescript })),
  "json-to-go": () => import("./json-to-go").then((m) => ({ default: m.JsonToGo })),
  "image-resizer": () => import("./image-resizer").then((m) => ({ default: m.ImageResizer })),
  "favicon-generator": () => import("./favicon-generator").then((m) => ({ default: m.FaviconGenerator })),
  "svg-optimizer": () => import("./svg-optimizer").then((m) => ({ default: m.SvgOptimizer })),
  "placeholder-image": () => import("./placeholder-image").then((m) => ({ default: m.PlaceholderImage })),
  "svg-to-css": () => import("./svg-to-css").then((m) => ({ default: m.SvgToCss })),
  "exif-reader": () => import("./exif-reader").then((m) => ({ default: m.ExifReader })),
  "exif-transfer": () => import("./exif-transfer").then((m) => ({ default: m.ExifTransfer })),
  "color-eyedropper": () => import("./color-eyedropper").then((m) => ({ default: m.ColorEyedropper })),
  "css-formatter": () => import("./css-formatter").then((m) => ({ default: m.CSSFormatter })),
  "html-formatter": () => import("./html-formatter").then((m) => ({ default: m.HTMLFormatter })),
  "xml-formatter": () => import("./xml-formatter").then((m) => ({ default: m.XMLFormatter })),
  "yaml-formatter": () => import("./yaml-formatter").then((m) => ({ default: m.YAMLFormatter })),
  "text-analyzer": () => import("./text-analyzer").then((m) => ({ default: m.TextAnalyzer })),
  "json-diff": () => import("./json-diff").then((m) => ({ default: m.JSONDiff })),
  "json-beautifier": () => import("./json-beautifier").then((m) => ({ default: m.JSONBeautifier })),
  "json-minifier": () => import("./json-minifier").then((m) => ({ default: m.JSONMinifier })),
  "json-validator": () => import("./json-validator").then((m) => ({ default: m.JSONValidator })),
  "jwt-generator": () => import("./jwt-generator").then((m) => ({ default: m.JwtGenerator })),
  "totp-generator": () => import("./totp-generator").then((m) => ({ default: m.TotpGenerator })),
  "ssl-decoder": () => import("./ssl-decoder").then((m) => ({ default: m.SslDecoder })),
  "csp-generator": () => import("./csp-generator").then((m) => ({ default: m.CspGenerator })),
  "file-checksum": () => import("./file-checksum").then((m) => ({ default: m.FileChecksum })),
  "text-sorter": () => import("./text-sorter").then((m) => ({ default: m.TextSorter })),
  "http-header-parser": () => import("./http-header-parser").then((m) => ({ default: m.HttpHeaderParser })),
  "url-parser": () => import("./url-parser").then((m) => ({ default: m.UrlParser })),
  "user-agent-parser": () => import("./user-agent-parser").then((m) => ({ default: m.UserAgentParser })),
  "ip-calculator": () => import("./ip-calculator").then((m) => ({ default: m.IpCalculator })),
  "json-path-finder": () => import("./json-path-finder").then((m) => ({ default: m.JsonPathFinder })),
  "markdown-preview": () => import("./markdown-preview").then((m) => ({ default: m.MarkdownPreview })),
  "slug-generator": () => import("./slug-generator").then((m) => ({ default: m.SlugGenerator })),
  "string-length": () => import("./string-length").then((m) => ({ default: m.StringLength })),
  "json-schema-generator": () => import("./json-schema-generator").then((m) => ({ default: m.JsonSchemaGenerator })),
  "dns-lookup": () => import("./dns-lookup").then((m) => ({ default: m.DNSLookup })),
  "ip-lookup": () => import("./ip-lookup").then((m) => ({ default: m.IPLookup })),
  "bcrypt-generator": () => import("./bcrypt-generator").then((m) => ({ default: m.BcryptGenerator })),
  "ulid-generator": () => import("./ulid-generator").then((m) => ({ default: m.UlidGenerator })),
  "hmac-generator": () => import("./hmac-generator").then((m) => ({ default: m.HmacGenerator })),
  "rsa-key-generator": () => import("./rsa-key-generator").then((m) => ({ default: m.RsaKeyGenerator })),
  "password-strength": () => import("./password-strength").then((m) => ({ default: m.PasswordStrength })),
  "bip39-generator": () => import("./bip39-generator").then((m) => ({ default: m.Bip39Generator })),
  "mac-address-lookup": () => import("./mac-address-lookup").then((m) => ({ default: m.MacAddressLookup })),
  "mac-address-generator": () => import("./mac-address-generator").then((m) => ({ default: m.MacAddressGenerator })),
  "phone-number-parser": () => import("./phone-number-parser").then((m) => ({ default: m.PhoneNumberParser })),
  "iban-validator": () => import("./iban-validator").then((m) => ({ default: m.IBANValidator })),
  "roman-numeral-converter": () => import("./roman-numeral-converter").then((m) => ({ default: m.RomanNumeralConverter })),
  "nato-alphabet": () => import("./nato-alphabet").then((m) => ({ default: m.NatoAlphabet })),
  "text-to-unicode": () => import("./text-to-unicode").then((m) => ({ default: m.TextToUnicode })),
  "list-converter": () => import("./list-converter").then((m) => ({ default: m.ListConverter })),
  "temperature-converter": () => import("./temperature-converter").then((m) => ({ default: m.TemperatureConverter })),
  "random-port-generator": () => import("./random-port-generator").then((m) => ({ default: m.RandomPortGenerator })),
  "meta-tag-generator": () => import("./meta-tag-generator").then((m) => ({ default: m.MetaTagGenerator })),
  "docker-run-to-compose": () => import("./docker-run-to-compose").then((m) => ({ default: m.DockerRunToCompose })),
  "yaml-viewer": () => import("./yaml-viewer").then((m) => ({ default: m.YAMLViewer })),
  "benchmark-builder": () => import("./benchmark-builder").then((m) => ({ default: m.BenchmarkBuilder })),
  "basic-auth-generator": () => import("./basic-auth-generator").then((m) => ({ default: m.BasicAuthGenerator })),
  "mime-types": () => import("./mime-types").then((m) => ({ default: m.MimeTypes })),
  "keycode-info": () => import("./keycode-info").then((m) => ({ default: m.KeycodeInfo })),
  "slugify-string": () => import("./slugify-string").then((m) => ({ default: m.SlugifyString })),
  "safelink-decoder": () => import("./safelink-decoder").then((m) => ({ default: m.SafelinkDecoder })),
  "device-information": () => import("./device-information").then((m) => ({ default: m.DeviceInformation })),
  "email-normalizer": () => import("./email-normalizer").then((m) => ({ default: m.EmailNormalizer })),
  "text-diff-visual": () => import("./text-diff-visual").then((m) => ({ default: m.TextDiffVisual })),
  "string-obfuscator": () => import("./string-obfuscator").then((m) => ({ default: m.StringObfuscator })),
  "math-evaluator": () => import("./math-evaluator").then((m) => ({ default: m.MathEvaluator })),
  "chronometer": () => import("./chronometer").then((m) => ({ default: m.Chronometer })),
  "percentage-calculator": () => import("./percentage-calculator").then((m) => ({ default: m.PercentageCalculator })),
  "emoji-picker": () => import("./emoji-picker").then((m) => ({ default: m.EmojiPicker })),
  "ipv4-subnet-calculator": () => import("./ipv4-subnet-calculator").then((m) => ({ default: m.Ipv4SubnetCalculator })),
  "ipv4-address-converter": () => import("./ipv4-address-converter").then((m) => ({ default: m.Ipv4AddressConverter })),
  "ipv4-range-expander": () => import("./ipv4-range-expander").then((m) => ({ default: m.Ipv4RangeExpander })),
  "ipv6-ula-generator": () => import("./ipv6-ula-generator").then((m) => ({ default: m.Ipv6UlaGenerator })),
  "base64-decoder": () => import("./base64-decoder").then((m) => ({ default: m.Base64Decoder })),
  "base64-encoder": () => import("./base64-encoder").then((m) => ({ default: m.Base64Encoder })),
  "css-minifier": () => import("./css-minifier").then((m) => ({ default: m.CSSMinifier })),
  "html-minifier": () => import("./html-minifier").then((m) => ({ default: m.HTMLMinifier })),
  "prompt-generator": () => import("./prompt-generator").then((m) => ({ default: m.PromptGenerator })),
  "prompt-improver": () => import("./prompt-improver").then((m) => ({ default: m.PromptImprover })),
  "markdown-editor": () => import("./markdown-editor").then((m) => ({ default: m.MarkdownEditor })),
  "chmod-calculator": () => import("./chmod-calculator").then((m) => ({ default: m.ChmodCalculator })),
  "eta-calculator": () => import("./eta-calculator").then((m) => ({ default: m.EtaCalculator })),
  "token-generator": () => import("./token-generator").then((m) => ({ default: m.TokenGenerator })),
  "encrypt-decrypt": () => import("./encrypt-decrypt").then((m) => ({ default: m.EncryptDecrypt })),
  "wifi-qr-generator": () => import("./wifi-qr-generator").then((m) => ({ default: m.WifiQRGenerator })),
  "http-status-codes": () => import("./http-status-codes").then((m) => ({ default: m.HTTPStatusCodes })),
  "git-cheatsheet": () => import("./git-cheatsheet").then((m) => ({ default: m.GitCheatsheet })),
  "regex-memo": () => import("./regex-memo").then((m) => ({ default: m.RegexMemo })),
  "numeronym-generator": () => import("./numeronym-generator").then((m) => ({ default: m.NumeronymGenerator })),
};

const toolComponents: Record<string, ComponentType> = {};
for (const [slug, loader] of Object.entries(toolLoaders)) {
  toolComponents[slug] = dynamic(loader, {});
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
