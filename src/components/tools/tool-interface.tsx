"use client";

import React, { Suspense } from "react";

const toolComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "json-formatter": React.lazy(() => import("./json-formatter").then((m) => ({ default: m.JSONFormatter }))),
  "json-to-csv": React.lazy(() => import("./json-to-csv").then((m) => ({ default: m.JSONToCSV }))),
  "json-to-yaml": React.lazy(() => import("./json-to-yaml").then((m) => ({ default: m.JSONToYAML }))),
  "jwt-decoder": React.lazy(() => import("./jwt-decoder").then((m) => ({ default: m.JWTDecoder }))),
  "sql-formatter": React.lazy(() => import("./sql-formatter").then((m) => ({ default: m.SQLFormatter }))),
  "uuid-generator": React.lazy(() => import("./uuid-generator").then((m) => ({ default: m.UUIDGenerator }))),
  "qr-generator": React.lazy(() => import("./qr-generator").then((m) => ({ default: m.QRGenerator }))),
  "image-compressor": React.lazy(() => import("./image-compressor").then((m) => ({ default: m.ImageCompressor }))),
  "password-generator": React.lazy(() => import("./password-generator").then((m) => ({ default: m.PasswordGenerator }))),
  "word-counter": React.lazy(() => import("./word-counter").then((m) => ({ default: m.WordCounter }))),
  "url-encoder": React.lazy(() => import("./url-encoder").then((m) => ({ default: m.URLEncoder }))),
  "js-minifier": React.lazy(() => import("./js-minifier").then((m) => ({ default: m.JSMinifier }))),
  "diff-checker": React.lazy(() => import("./diff-checker").then((m) => ({ default: m.DiffChecker }))),
  "regex-tester": React.lazy(() => import("./regex-tester").then((m) => ({ default: m.RegexTester }))),
  "color-converter": React.lazy(() => import("./color-converter").then((m) => ({ default: m.ColorConverter }))),
  "timestamp-converter": React.lazy(() => import("./timestamp-converter").then((m) => ({ default: m.TimestampConverter }))),
  "hash-generator": React.lazy(() => import("./hash-generator").then((m) => ({ default: m.HashGenerator }))),
  "base64": React.lazy(() => import("./base64").then((m) => ({ default: m.Base64Tool }))),
  "html-entity": React.lazy(() => import("./html-entity").then((m) => ({ default: m.HtmlEntity }))),
  "binary": React.lazy(() => import("./binary").then((m) => ({ default: m.Binary }))),
  "hex": React.lazy(() => import("./hex").then((m) => ({ default: m.Hex }))),
  "escape-unescape": React.lazy(() => import("./escape-unescape").then((m) => ({ default: m.EscapeUnescape }))),
  "image-to-base64": React.lazy(() => import("./image-to-base64").then((m) => ({ default: m.ImageToBase64 }))),
  "morse-code": React.lazy(() => import("./morse-code").then((m) => ({ default: m.MorseCode }))),
  "random-data": React.lazy(() => import("./random-data").then((m) => ({ default: m.RandomData }))),
  "ascii-art": React.lazy(() => import("./ascii-art").then((m) => ({ default: m.AsciiArt }))),
  "barcode-generator": React.lazy(() => import("./barcode-generator").then((m) => ({ default: m.BarcodeGenerator }))),
  "lorem-ipsum": React.lazy(() => import("./lorem-ipsum").then((m) => ({ default: m.LoremIpsum }))),
  "cron-expression": React.lazy(() => import("./cron-expression").then((m) => ({ default: m.CronExpression }))),
  "csv-to-json": React.lazy(() => import("./csv-to-json").then((m) => ({ default: m.CsvToJson }))),
  "json-to-xml": React.lazy(() => import("./json-to-xml").then((m) => ({ default: m.JsonToXml }))),
  "xml-to-json": React.lazy(() => import("./xml-to-json").then((m) => ({ default: m.XmlToJson }))),
  "markdown-to-html": React.lazy(() => import("./markdown-to-html").then((m) => ({ default: m.MarkdownToHtml }))),
  "html-to-markdown": React.lazy(() => import("./html-to-markdown").then((m) => ({ default: m.HtmlToMarkdown }))),
  "toml-converter": React.lazy(() => import("./toml-converter").then((m) => ({ default: m.TomlConverter }))),
  "unit-converter": React.lazy(() => import("./unit-converter").then((m) => ({ default: m.UnitConverter }))),
  "case-converter": React.lazy(() => import("./case-converter").then((m) => ({ default: m.CaseConverter }))),
  "base-converter": React.lazy(() => import("./base-converter").then((m) => ({ default: m.BaseConverter }))),
  "number-to-words": React.lazy(() => import("./number-to-words").then((m) => ({ default: m.NumberToWords }))),
  "json-to-typescript": React.lazy(() => import("./json-to-typescript").then((m) => ({ default: m.JsonToTypescript }))),
  "json-to-go": React.lazy(() => import("./json-to-go").then((m) => ({ default: m.JsonToGo }))),
  "image-resizer": React.lazy(() => import("./image-resizer").then((m) => ({ default: m.ImageResizer }))),
  "favicon-generator": React.lazy(() => import("./favicon-generator").then((m) => ({ default: m.FaviconGenerator }))),
  "svg-optimizer": React.lazy(() => import("./svg-optimizer").then((m) => ({ default: m.SvgOptimizer }))),
  "placeholder-image": React.lazy(() => import("./placeholder-image").then((m) => ({ default: m.PlaceholderImage }))),
  "svg-to-css": React.lazy(() => import("./svg-to-css").then((m) => ({ default: m.SvgToCss }))),
  "exif-reader": React.lazy(() => import("./exif-reader").then((m) => ({ default: m.ExifReader }))),
  "exif-transfer": React.lazy(() => import("./exif-transfer").then((m) => ({ default: m.ExifTransfer }))),
  "color-eyedropper": React.lazy(() => import("./color-eyedropper").then((m) => ({ default: m.ColorEyedropper }))),
  "css-formatter": React.lazy(() => import("./css-formatter").then((m) => ({ default: m.CSSFormatter }))),
  "html-formatter": React.lazy(() => import("./html-formatter").then((m) => ({ default: m.HTMLFormatter }))),
  "xml-formatter": React.lazy(() => import("./xml-formatter").then((m) => ({ default: m.XMLFormatter }))),
  "yaml-formatter": React.lazy(() => import("./yaml-formatter").then((m) => ({ default: m.YAMLFormatter }))),
  "text-analyzer": React.lazy(() => import("./text-analyzer").then((m) => ({ default: m.TextAnalyzer }))),
  "json-diff": React.lazy(() => import("./json-diff").then((m) => ({ default: m.JSONDiff }))),
  "json-beautifier": React.lazy(() => import("./json-beautifier").then((m) => ({ default: m.JSONBeautifier }))),
  "json-minifier": React.lazy(() => import("./json-minifier").then((m) => ({ default: m.JSONMinifier }))),
  "json-validator": React.lazy(() => import("./json-validator").then((m) => ({ default: m.JSONValidator }))),
  "jwt-generator": React.lazy(() => import("./jwt-generator").then((m) => ({ default: m.JwtGenerator }))),
  "totp-generator": React.lazy(() => import("./totp-generator").then((m) => ({ default: m.TotpGenerator }))),
  "ssl-decoder": React.lazy(() => import("./ssl-decoder").then((m) => ({ default: m.SslDecoder }))),
  "csp-generator": React.lazy(() => import("./csp-generator").then((m) => ({ default: m.CspGenerator }))),
  "file-checksum": React.lazy(() => import("./file-checksum").then((m) => ({ default: m.FileChecksum }))),
  "text-sorter": React.lazy(() => import("./text-sorter").then((m) => ({ default: m.TextSorter }))),
  "http-header-parser": React.lazy(() => import("./http-header-parser").then((m) => ({ default: m.HttpHeaderParser }))),
  "url-parser": React.lazy(() => import("./url-parser").then((m) => ({ default: m.UrlParser }))),
  "user-agent-parser": React.lazy(() => import("./user-agent-parser").then((m) => ({ default: m.UserAgentParser }))),
  "ip-calculator": React.lazy(() => import("./ip-calculator").then((m) => ({ default: m.IpCalculator }))),
  "json-path-finder": React.lazy(() => import("./json-path-finder").then((m) => ({ default: m.JsonPathFinder }))),
  "markdown-preview": React.lazy(() => import("./markdown-preview").then((m) => ({ default: m.MarkdownPreview }))),
  "slug-generator": React.lazy(() => import("./slug-generator").then((m) => ({ default: m.SlugGenerator }))),
  "string-length": React.lazy(() => import("./string-length").then((m) => ({ default: m.StringLength }))),
  "json-schema-generator": React.lazy(() => import("./json-schema-generator").then((m) => ({ default: m.JsonSchemaGenerator }))),
  "dns-lookup": React.lazy(() => import("./dns-lookup").then((m) => ({ default: m.DNSLookup }))),
  "ip-lookup": React.lazy(() => import("./ip-lookup").then((m) => ({ default: m.IPLookup }))),
  "bcrypt-generator": React.lazy(() => import("./bcrypt-generator").then((m) => ({ default: m.BcryptGenerator }))),
  "ulid-generator": React.lazy(() => import("./ulid-generator").then((m) => ({ default: m.UlidGenerator }))),
  "hmac-generator": React.lazy(() => import("./hmac-generator").then((m) => ({ default: m.HmacGenerator }))),
  "rsa-key-generator": React.lazy(() => import("./rsa-key-generator").then((m) => ({ default: m.RsaKeyGenerator }))),
  "password-strength": React.lazy(() => import("./password-strength").then((m) => ({ default: m.PasswordStrength }))),
  "bip39-generator": React.lazy(() => import("./bip39-generator").then((m) => ({ default: m.Bip39Generator }))),
  "mac-address-lookup": React.lazy(() => import("./mac-address-lookup").then((m) => ({ default: m.MacAddressLookup }))),
  "mac-address-generator": React.lazy(() => import("./mac-address-generator").then((m) => ({ default: m.MacAddressGenerator }))),
  "phone-number-parser": React.lazy(() => import("./phone-number-parser").then((m) => ({ default: m.PhoneNumberParser }))),
  "iban-validator": React.lazy(() => import("./iban-validator").then((m) => ({ default: m.IBANValidator }))),
  "roman-numeral-converter": React.lazy(() => import("./roman-numeral-converter").then((m) => ({ default: m.RomanNumeralConverter }))),
  "nato-alphabet": React.lazy(() => import("./nato-alphabet").then((m) => ({ default: m.NatoAlphabet }))),
  "text-to-unicode": React.lazy(() => import("./text-to-unicode").then((m) => ({ default: m.TextToUnicode }))),
  "list-converter": React.lazy(() => import("./list-converter").then((m) => ({ default: m.ListConverter }))),
  "temperature-converter": React.lazy(() => import("./temperature-converter").then((m) => ({ default: m.TemperatureConverter }))),
  "random-port-generator": React.lazy(() => import("./random-port-generator").then((m) => ({ default: m.RandomPortGenerator }))),
  "meta-tag-generator": React.lazy(() => import("./meta-tag-generator").then((m) => ({ default: m.MetaTagGenerator }))),
  "docker-run-to-compose": React.lazy(() => import("./docker-run-to-compose").then((m) => ({ default: m.DockerRunToCompose }))),
  "yaml-viewer": React.lazy(() => import("./yaml-viewer").then((m) => ({ default: m.YAMLViewer }))),
  "benchmark-builder": React.lazy(() => import("./benchmark-builder").then((m) => ({ default: m.BenchmarkBuilder }))),
  "basic-auth-generator": React.lazy(() => import("./basic-auth-generator").then((m) => ({ default: m.BasicAuthGenerator }))),
  "mime-types": React.lazy(() => import("./mime-types").then((m) => ({ default: m.MimeTypes }))),
  "keycode-info": React.lazy(() => import("./keycode-info").then((m) => ({ default: m.KeycodeInfo }))),
  "slugify-string": React.lazy(() => import("./slugify-string").then((m) => ({ default: m.SlugifyString }))),
  "safelink-decoder": React.lazy(() => import("./safelink-decoder").then((m) => ({ default: m.SafelinkDecoder }))),
  "device-information": React.lazy(() => import("./device-information").then((m) => ({ default: m.DeviceInformation }))),
  "email-normalizer": React.lazy(() => import("./email-normalizer").then((m) => ({ default: m.EmailNormalizer }))),
  "text-diff-visual": React.lazy(() => import("./text-diff-visual").then((m) => ({ default: m.TextDiffVisual }))),
  "string-obfuscator": React.lazy(() => import("./string-obfuscator").then((m) => ({ default: m.StringObfuscator }))),
  "math-evaluator": React.lazy(() => import("./math-evaluator").then((m) => ({ default: m.MathEvaluator }))),
  "chronometer": React.lazy(() => import("./chronometer").then((m) => ({ default: m.Chronometer }))),
  "percentage-calculator": React.lazy(() => import("./percentage-calculator").then((m) => ({ default: m.PercentageCalculator }))),
  "emoji-picker": React.lazy(() => import("./emoji-picker").then((m) => ({ default: m.EmojiPicker }))),
  "ipv4-subnet-calculator": React.lazy(() => import("./ipv4-subnet-calculator").then((m) => ({ default: m.Ipv4SubnetCalculator }))),
  "ipv4-address-converter": React.lazy(() => import("./ipv4-address-converter").then((m) => ({ default: m.Ipv4AddressConverter }))),
  "ipv4-range-expander": React.lazy(() => import("./ipv4-range-expander").then((m) => ({ default: m.Ipv4RangeExpander }))),
  "ipv6-ula-generator": React.lazy(() => import("./ipv6-ula-generator").then((m) => ({ default: m.Ipv6UlaGenerator }))),
  "base64-decoder": React.lazy(() => import("./base64-decoder").then((m) => ({ default: m.Base64Decoder }))),
  "base64-encoder": React.lazy(() => import("./base64-encoder").then((m) => ({ default: m.Base64Encoder }))),
  "css-minifier": React.lazy(() => import("./css-minifier").then((m) => ({ default: m.CSSMinifier }))),
  "html-minifier": React.lazy(() => import("./html-minifier").then((m) => ({ default: m.HTMLMinifier }))),
  "prompt-generator": React.lazy(() => import("./prompt-generator").then((m) => ({ default: m.PromptGenerator }))),
  "prompt-improver": React.lazy(() => import("./prompt-improver").then((m) => ({ default: m.PromptImprover }))),
  "markdown-editor": React.lazy(() => import("./markdown-editor").then((m) => ({ default: m.MarkdownEditor }))),
  "chmod-calculator": React.lazy(() => import("./chmod-calculator").then((m) => ({ default: m.ChmodCalculator }))),
  "eta-calculator": React.lazy(() => import("./eta-calculator").then((m) => ({ default: m.EtaCalculator }))),
  "token-generator": React.lazy(() => import("./token-generator").then((m) => ({ default: m.TokenGenerator }))),
  "encrypt-decrypt": React.lazy(() => import("./encrypt-decrypt").then((m) => ({ default: m.EncryptDecrypt }))),
  "wifi-qr-generator": React.lazy(() => import("./wifi-qr-generator").then((m) => ({ default: m.WifiQRGenerator }))),
  "http-status-codes": React.lazy(() => import("./http-status-codes").then((m) => ({ default: m.HTTPStatusCodes }))),
  "git-cheatsheet": React.lazy(() => import("./git-cheatsheet").then((m) => ({ default: m.GitCheatsheet }))),
  "regex-memo": React.lazy(() => import("./regex-memo").then((m) => ({ default: m.RegexMemo }))),
  "numeronym-generator": React.lazy(() => import("./numeronym-generator").then((m) => ({ default: m.NumeronymGenerator }))),
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
