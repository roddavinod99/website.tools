"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { ComponentType } from "react";

const toolComponents: Record<string, ComponentType> = {
  "json-formatter": dynamic(() => import("./json-formatter").then((m) => m.JSONFormatter)),
  "json-to-csv": dynamic(() => import("./json-to-csv").then((m) => m.JSONToCSV)),
  "json-to-yaml": dynamic(() => import("./json-to-yaml").then((m) => m.JSONToYAML)),
  "jwt-decoder": dynamic(() => import("./jwt-decoder").then((m) => m.JWTDecoder)),
  "sql-formatter": dynamic(() => import("./sql-formatter").then((m) => m.SQLFormatter)),
  "uuid-generator": dynamic(() => import("./uuid-generator").then((m) => m.UUIDGenerator)),
  "qr-generator": dynamic(() => import("./qr-generator").then((m) => m.QRGenerator)),
  "image-compressor": dynamic(() => import("./image-compressor").then((m) => m.ImageCompressor)),
  "password-generator": dynamic(() => import("./password-generator").then((m) => m.PasswordGenerator)),
  "word-counter": dynamic(() => import("./word-counter").then((m) => m.WordCounter)),
  "url-encoder": dynamic(() => import("./url-encoder").then((m) => m.URLEncoder)),
  "js-minifier": dynamic(() => import("./js-minifier").then((m) => m.JSMinifier)),
  "diff-checker": dynamic(() => import("./diff-checker").then((m) => m.DiffChecker)),
  "regex-tester": dynamic(() => import("./regex-tester").then((m) => m.RegexTester)),
  "color-converter": dynamic(() => import("./color-converter").then((m) => m.ColorConverter)),
  "timestamp-converter": dynamic(() => import("./timestamp-converter").then((m) => m.TimestampConverter)),
  "hash-generator": dynamic(() => import("./hash-generator").then((m) => m.HashGenerator)),
  "base64": dynamic(() => import("./base64").then((m) => m.Base64Tool)),
  "html-entity": dynamic(() => import("./html-entity").then((m) => m.HtmlEntity)),
  "binary": dynamic(() => import("./binary").then((m) => m.Binary)),
  "hex": dynamic(() => import("./hex").then((m) => m.Hex)),
  "escape-unescape": dynamic(() => import("./escape-unescape").then((m) => m.EscapeUnescape)),
  "image-to-base64": dynamic(() => import("./image-to-base64").then((m) => m.ImageToBase64)),
  "morse-code": dynamic(() => import("./morse-code").then((m) => m.MorseCode)),
  "random-data": dynamic(() => import("./random-data").then((m) => m.RandomData)),
  "ascii-art": dynamic(() => import("./ascii-art").then((m) => m.AsciiArt)),
  "barcode-generator": dynamic(() => import("./barcode-generator").then((m) => m.BarcodeGenerator)),
  "lorem-ipsum": dynamic(() => import("./lorem-ipsum").then((m) => m.LoremIpsum)),
  "cron-expression": dynamic(() => import("./cron-expression").then((m) => m.CronExpression)),
  "csv-to-json": dynamic(() => import("./csv-to-json").then((m) => m.CsvToJson)),
  "json-to-xml": dynamic(() => import("./json-to-xml").then((m) => m.JsonToXml)),
  "xml-to-json": dynamic(() => import("./xml-to-json").then((m) => m.XmlToJson)),
  "markdown-to-html": dynamic(() => import("./markdown-to-html").then((m) => m.MarkdownToHtml)),
  "html-to-markdown": dynamic(() => import("./html-to-markdown").then((m) => m.HtmlToMarkdown)),
  "toml-converter": dynamic(() => import("./toml-converter").then((m) => m.TomlConverter)),
  "unit-converter": dynamic(() => import("./unit-converter").then((m) => m.UnitConverter)),
  "case-converter": dynamic(() => import("./case-converter").then((m) => m.CaseConverter)),
  "base-converter": dynamic(() => import("./base-converter").then((m) => m.BaseConverter)),
  "number-to-words": dynamic(() => import("./number-to-words").then((m) => m.NumberToWords)),
  "json-to-typescript": dynamic(() => import("./json-to-typescript").then((m) => m.JsonToTypescript)),
  "json-to-go": dynamic(() => import("./json-to-go").then((m) => m.JsonToGo)),
  "image-resizer": dynamic(() => import("./image-resizer").then((m) => m.ImageResizer)),
  "favicon-generator": dynamic(() => import("./favicon-generator").then((m) => m.FaviconGenerator)),
  "svg-optimizer": dynamic(() => import("./svg-optimizer").then((m) => m.SvgOptimizer)),
  "placeholder-image": dynamic(() => import("./placeholder-image").then((m) => m.PlaceholderImage)),
  "svg-to-css": dynamic(() => import("./svg-to-css").then((m) => m.SvgToCss)),
  "exif-reader": dynamic(() => import("./exif-reader").then((m) => m.ExifReader)),
  "exif-transfer": dynamic(() => import("./exif-transfer").then((m) => m.ExifTransfer)),
  "color-eyedropper": dynamic(() => import("./color-eyedropper").then((m) => m.ColorEyedropper)),
  "css-formatter": dynamic(() => import("./css-formatter").then((m) => m.CSSFormatter)),
  "html-formatter": dynamic(() => import("./html-formatter").then((m) => m.HTMLFormatter)),
  "xml-formatter": dynamic(() => import("./xml-formatter").then((m) => m.XMLFormatter)),
  "yaml-formatter": dynamic(() => import("./yaml-formatter").then((m) => m.YAMLFormatter)),
  "text-analyzer": dynamic(() => import("./text-analyzer").then((m) => m.TextAnalyzer)),
  "json-diff": dynamic(() => import("./json-diff").then((m) => m.JSONDiff)),
  "json-beautifier": dynamic(() => import("./json-beautifier").then((m) => m.JSONBeautifier)),
  "json-minifier": dynamic(() => import("./json-minifier").then((m) => m.JSONMinifier)),
  "json-validator": dynamic(() => import("./json-validator").then((m) => m.JSONValidator)),
  "jwt-generator": dynamic(() => import("./jwt-generator").then((m) => m.JwtGenerator)),
  "totp-generator": dynamic(() => import("./totp-generator").then((m) => m.TotpGenerator)),
  "ssl-decoder": dynamic(() => import("./ssl-decoder").then((m) => m.SslDecoder)),
  "csp-generator": dynamic(() => import("./csp-generator").then((m) => m.CspGenerator)),
  "file-checksum": dynamic(() => import("./file-checksum").then((m) => m.FileChecksum)),
  "text-sorter": dynamic(() => import("./text-sorter").then((m) => m.TextSorter)),
  "http-header-parser": dynamic(() => import("./http-header-parser").then((m) => m.HttpHeaderParser)),
  "url-parser": dynamic(() => import("./url-parser").then((m) => m.UrlParser)),
  "user-agent-parser": dynamic(() => import("./user-agent-parser").then((m) => m.UserAgentParser)),
  "ip-calculator": dynamic(() => import("./ip-calculator").then((m) => m.IpCalculator)),
  "json-path-finder": dynamic(() => import("./json-path-finder").then((m) => m.JsonPathFinder)),
  "markdown-preview": dynamic(() => import("./markdown-preview").then((m) => m.MarkdownPreview)),
  "slug-generator": dynamic(() => import("./slug-generator").then((m) => m.SlugGenerator)),
  "string-length": dynamic(() => import("./string-length").then((m) => m.StringLength)),
  "json-schema-generator": dynamic(() => import("./json-schema-generator").then((m) => m.JsonSchemaGenerator)),
  "dns-lookup": dynamic(() => import("./dns-lookup").then((m) => m.DNSLookup)),
  "ip-lookup": dynamic(() => import("./ip-lookup").then((m) => m.IPLookup)),
  "bcrypt-generator": dynamic(() => import("./bcrypt-generator").then((m) => m.BcryptGenerator)),
  "ulid-generator": dynamic(() => import("./ulid-generator").then((m) => m.UlidGenerator)),
  "hmac-generator": dynamic(() => import("./hmac-generator").then((m) => m.HmacGenerator)),
  "rsa-key-generator": dynamic(() => import("./rsa-key-generator").then((m) => m.RsaKeyGenerator)),
  "password-strength": dynamic(() => import("./password-strength").then((m) => m.PasswordStrength)),
  "bip39-generator": dynamic(() => import("./bip39-generator").then((m) => m.Bip39Generator)),
  "mac-address-lookup": dynamic(() => import("./mac-address-lookup").then((m) => m.MacAddressLookup)),
  "mac-address-generator": dynamic(() => import("./mac-address-generator").then((m) => m.MacAddressGenerator)),
  "phone-number-parser": dynamic(() => import("./phone-number-parser").then((m) => m.PhoneNumberParser)),
  "iban-validator": dynamic(() => import("./iban-validator").then((m) => m.IBANValidator)),
  "roman-numeral-converter": dynamic(() => import("./roman-numeral-converter").then((m) => m.RomanNumeralConverter)),
  "nato-alphabet": dynamic(() => import("./nato-alphabet").then((m) => m.NatoAlphabet)),
  "text-to-unicode": dynamic(() => import("./text-to-unicode").then((m) => m.TextToUnicode)),
  "list-converter": dynamic(() => import("./list-converter").then((m) => m.ListConverter)),
  "temperature-converter": dynamic(() => import("./temperature-converter").then((m) => m.TemperatureConverter)),
  "random-port-generator": dynamic(() => import("./random-port-generator").then((m) => m.RandomPortGenerator)),
  "meta-tag-generator": dynamic(() => import("./meta-tag-generator").then((m) => m.MetaTagGenerator)),
  "docker-run-to-compose": dynamic(() => import("./docker-run-to-compose").then((m) => m.DockerRunToCompose)),
  "yaml-viewer": dynamic(() => import("./yaml-viewer").then((m) => m.YAMLViewer)),
  "benchmark-builder": dynamic(() => import("./benchmark-builder").then((m) => m.BenchmarkBuilder)),
  "basic-auth-generator": dynamic(() => import("./basic-auth-generator").then((m) => m.BasicAuthGenerator)),
  "mime-types": dynamic(() => import("./mime-types").then((m) => m.MimeTypes)),
  "keycode-info": dynamic(() => import("./keycode-info").then((m) => m.KeycodeInfo)),
  "slugify-string": dynamic(() => import("./slugify-string").then((m) => m.SlugifyString)),
  "safelink-decoder": dynamic(() => import("./safelink-decoder").then((m) => m.SafelinkDecoder)),
  "device-information": dynamic(() => import("./device-information").then((m) => m.DeviceInformation)),
  "email-normalizer": dynamic(() => import("./email-normalizer").then((m) => m.EmailNormalizer)),
  "text-diff-visual": dynamic(() => import("./text-diff-visual").then((m) => m.TextDiffVisual)),
  "string-obfuscator": dynamic(() => import("./string-obfuscator").then((m) => m.StringObfuscator)),
  "math-evaluator": dynamic(() => import("./math-evaluator").then((m) => m.MathEvaluator)),
  "chronometer": dynamic(() => import("./chronometer").then((m) => m.Chronometer)),
  "percentage-calculator": dynamic(() => import("./percentage-calculator").then((m) => m.PercentageCalculator)),
  "emoji-picker": dynamic(() => import("./emoji-picker").then((m) => m.EmojiPicker)),
  "ipv4-subnet-calculator": dynamic(() => import("./ipv4-subnet-calculator").then((m) => m.Ipv4SubnetCalculator)),
  "ipv4-address-converter": dynamic(() => import("./ipv4-address-converter").then((m) => m.Ipv4AddressConverter)),
  "ipv4-range-expander": dynamic(() => import("./ipv4-range-expander").then((m) => m.Ipv4RangeExpander)),
  "ipv6-ula-generator": dynamic(() => import("./ipv6-ula-generator").then((m) => m.Ipv6UlaGenerator)),
  "base64-decoder": dynamic(() => import("./base64-decoder").then((m) => m.Base64Decoder)),
  "base64-encoder": dynamic(() => import("./base64-encoder").then((m) => m.Base64Encoder)),
  "css-minifier": dynamic(() => import("./css-minifier").then((m) => m.CSSMinifier)),
  "html-minifier": dynamic(() => import("./html-minifier").then((m) => m.HTMLMinifier)),
  "prompt-generator": dynamic(() => import("./prompt-generator").then((m) => m.PromptGenerator)),
  "prompt-improver": dynamic(() => import("./prompt-improver").then((m) => m.PromptImprover)),
  "markdown-editor": dynamic(() => import("./markdown-editor").then((m) => m.MarkdownEditor)),
  "chmod-calculator": dynamic(() => import("./chmod-calculator").then((m) => m.ChmodCalculator)),
  "eta-calculator": dynamic(() => import("./eta-calculator").then((m) => m.EtaCalculator)),
  "token-generator": dynamic(() => import("./token-generator").then((m) => m.TokenGenerator)),
  "encrypt-decrypt": dynamic(() => import("./encrypt-decrypt").then((m) => m.EncryptDecrypt)),
  "wifi-qr-generator": dynamic(() => import("./wifi-qr-generator").then((m) => m.WifiQRGenerator)),
  "http-status-codes": dynamic(() => import("./http-status-codes").then((m) => m.HTTPStatusCodes)),
  "git-cheatsheet": dynamic(() => import("./git-cheatsheet").then((m) => m.GitCheatsheet)),
  "regex-memo": dynamic(() => import("./regex-memo").then((m) => m.RegexMemo)),
  "numeronym-generator": dynamic(() => import("./numeronym-generator").then((m) => m.NumeronymGenerator)),
};

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
