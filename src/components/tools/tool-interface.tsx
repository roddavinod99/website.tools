"use client";

import React from "react";

import { JSONFormatter } from "./json-formatter";
import { JSONToCSV } from "./json-to-csv";
import { JSONToYAML } from "./json-to-yaml";
import { JWTDecoder } from "./jwt-decoder";
import { SQLFormatter } from "./sql-formatter";
import { UUIDGenerator } from "./uuid-generator";
import { QRGenerator } from "./qr-generator";
import { ImageCompressor } from "./image-compressor";
import { PasswordGenerator } from "./password-generator";
import { WordCounter } from "./word-counter";
import { URLEncoder } from "./url-encoder";
import { JSMinifier } from "./js-minifier";
import { DiffChecker } from "./diff-checker";
import { RegexTester } from "./regex-tester";
import { ColorConverter } from "./color-converter";
import { TimestampConverter } from "./timestamp-converter";
import { HashGenerator } from "./hash-generator";

// New Encoders
import { Base64Tool } from "./base64";
import { HtmlEntity } from "./html-entity";
import { Binary } from "./binary";
import { Hex } from "./hex";
import { EscapeUnescape } from "./escape-unescape";
import { ImageToBase64 } from "./image-to-base64";
import { MorseCode } from "./morse-code";

// New Generators
import { RandomData } from "./random-data";
import { AsciiArt } from "./ascii-art";
import { BarcodeGenerator } from "./barcode-generator";
import { LoremIpsum } from "./lorem-ipsum";
import { CronExpression } from "./cron-expression";

// New Converters
import { CsvToJson } from "./csv-to-json";
import { JsonToXml } from "./json-to-xml";
import { XmlToJson } from "./xml-to-json";
import { MarkdownToHtml } from "./markdown-to-html";
import { HtmlToMarkdown } from "./html-to-markdown";
import { TomlConverter } from "./toml-converter";
import { UnitConverter } from "./unit-converter";
import { CaseConverter } from "./case-converter";
import { BaseConverter } from "./base-converter";
import { NumberToWords } from "./number-to-words";
import { JsonToTypescript } from "./json-to-typescript";
import { JsonToGo } from "./json-to-go";

// New Image Tools
import { ImageResizer } from "./image-resizer";
import { FaviconGenerator } from "./favicon-generator";
import { SvgOptimizer } from "./svg-optimizer";
import { PlaceholderImage } from "./placeholder-image";
import { SvgToCss } from "./svg-to-css";
import { ExifReader } from "./exif-reader";
import { ExifTransfer } from "./exif-transfer";
import { ColorEyedropper } from "./color-eyedropper";

// New Formatters
import { CSSFormatter } from "./css-formatter";
import { HTMLFormatter } from "./html-formatter";
import { XMLFormatter } from "./xml-formatter";
import { YAMLFormatter } from "./yaml-formatter";
import { TextAnalyzer } from "./text-analyzer";
import { JSONDiff } from "./json-diff";

// New Security
import { JwtGenerator } from "./jwt-generator";
import { TotpGenerator } from "./totp-generator";
import { SslDecoder } from "./ssl-decoder";
import { CspGenerator } from "./csp-generator";
import { FileChecksum } from "./file-checksum";

// New Utilities
import { TextSorter } from "./text-sorter";
import { HttpHeaderParser } from "./http-header-parser";
import { UrlParser } from "./url-parser";
import { UserAgentParser } from "./user-agent-parser";
import { IpCalculator } from "./ip-calculator";
import { JsonPathFinder } from "./json-path-finder";
import { MarkdownPreview } from "./markdown-preview";
import { SlugGenerator } from "./slug-generator";
import { StringLength } from "./string-length";
import { JsonSchemaGenerator } from "./json-schema-generator";
import { DNSLookup } from "./dns-lookup";
import { IPLookup } from "./ip-lookup";
import { JSONBeautifier } from "./json-beautifier";
import { JSONMinifier } from "./json-minifier";
import { JSONValidator } from "./json-validator";

// Crypto & Security Tools
import { BcryptGenerator } from "./bcrypt-generator";
import { UlidGenerator } from "./ulid-generator";
import { HmacGenerator } from "./hmac-generator";
import { RsaKeyGenerator } from "./rsa-key-generator";
import { PasswordStrength } from "./password-strength";
import { Bip39Generator } from "./bip39-generator";
import { MacAddressLookup } from "./mac-address-lookup";
import { MacAddressGenerator } from "./mac-address-generator";
import { PhoneNumberParser } from "./phone-number-parser";
import { IBANValidator } from "./iban-validator";

// New Converters
import { RomanNumeralConverter } from "./roman-numeral-converter";
import { NatoAlphabet } from "./nato-alphabet";
import { TextToUnicode } from "./text-to-unicode";
import { ListConverter } from "./list-converter";
import { TemperatureConverter } from "./temperature-converter";

// New Generators
import { RandomPortGenerator } from "./random-port-generator";
import { MetaTagGenerator } from "./meta-tag-generator";

// New Formatters
import { DockerRunToCompose } from "./docker-run-to-compose";
import { YAMLViewer } from "./yaml-viewer";
import { BenchmarkBuilder } from "./benchmark-builder";

// New Utilities
import { BasicAuthGenerator } from "./basic-auth-generator";
import { MimeTypes } from "./mime-types";
import { KeycodeInfo } from "./keycode-info";
import { SlugifyString } from "./slugify-string";
import { SafelinkDecoder } from "./safelink-decoder";
import { DeviceInformation } from "./device-information";
import { EmailNormalizer } from "./email-normalizer";
import { TextDiffVisual } from "./text-diff-visual";
import { StringObfuscator } from "./string-obfuscator";
import { MathEvaluator } from "./math-evaluator";
import { Chronometer } from "./chronometer";
import { PercentageCalculator } from "./percentage-calculator";
import { EmojiPicker } from "./emoji-picker";
import { Ipv4SubnetCalculator } from "./ipv4-subnet-calculator";
import { Ipv4AddressConverter } from "./ipv4-address-converter";
import { Ipv4RangeExpander } from "./ipv4-range-expander";
import { Ipv6UlaGenerator } from "./ipv6-ula-generator";

// Dedicated tool components (previously missing)
import { Base64Decoder } from "./base64-decoder";
import { Base64Encoder } from "./base64-encoder";
import { CSSMinifier } from "./css-minifier";
import { HTMLMinifier } from "./html-minifier";
import { PromptGenerator } from "./prompt-generator";
import { PromptImprover } from "./prompt-improver";
import { MarkdownEditor } from "./markdown-editor";

// Orphaned tools (components existed but were not registered)
import { ChmodCalculator } from "./chmod-calculator";
import { EtaCalculator } from "./eta-calculator";

// New IT-Tools parity tools
import { TokenGenerator } from "./token-generator";
import { EncryptDecrypt } from "./encrypt-decrypt";
import { WifiQRGenerator } from "./wifi-qr-generator";
import { HTTPStatusCodes } from "./http-status-codes";
import { GitCheatsheet } from "./git-cheatsheet";
import { RegexMemo } from "./regex-memo";
import { NumeronymGenerator } from "./numeronym-generator";

const toolComponents: Record<string, React.ComponentType> = {
  // Existing
  "json-formatter": JSONFormatter,
  "json-to-csv": JSONToCSV,
  "json-to-yaml": JSONToYAML,
  "jwt-decoder": JWTDecoder,
  "sql-formatter": SQLFormatter,
  "uuid-generator": UUIDGenerator,
  "qr-generator": QRGenerator,
  "image-compressor": ImageCompressor,
  "password-generator": PasswordGenerator,
  "word-counter": WordCounter,
  "url-encoder": URLEncoder,
  "js-minifier": JSMinifier,
  "diff-checker": DiffChecker,
  "regex-tester": RegexTester,
  "color-converter": ColorConverter,
  "timestamp-converter": TimestampConverter,
  "hash-generator": HashGenerator,

  // New Encoders
  "base64": Base64Tool,
  "html-entity": HtmlEntity,
  "binary": Binary,
  "hex": Hex,
  "escape-unescape": EscapeUnescape,
  "image-to-base64": ImageToBase64,
  "morse-code": MorseCode,

  // New Generators
  "random-data": RandomData,
  "ascii-art": AsciiArt,
  "barcode-generator": BarcodeGenerator,
  "lorem-ipsum": LoremIpsum,
  "cron-expression": CronExpression,

  // New Converters
  "csv-to-json": CsvToJson,
  "json-to-xml": JsonToXml,
  "xml-to-json": XmlToJson,
  "markdown-to-html": MarkdownToHtml,
  "html-to-markdown": HtmlToMarkdown,
  "toml-converter": TomlConverter,
  "unit-converter": UnitConverter,
  "case-converter": CaseConverter,
  "base-converter": BaseConverter,
  "number-to-words": NumberToWords,
  "json-to-typescript": JsonToTypescript,
  "json-to-go": JsonToGo,

  // New Image Tools
  "image-resizer": ImageResizer,
  "favicon-generator": FaviconGenerator,
  "svg-optimizer": SvgOptimizer,
  "placeholder-image": PlaceholderImage,
  "svg-to-css": SvgToCss,
  "exif-reader": ExifReader,
  "exif-transfer": ExifTransfer,
  "color-eyedropper": ColorEyedropper,

  // New Formatters
  "css-formatter": CSSFormatter,
  "html-formatter": HTMLFormatter,
  "xml-formatter": XMLFormatter,
  "yaml-formatter": YAMLFormatter,
  "text-analyzer": TextAnalyzer,
  "json-diff": JSONDiff,
  "json-beautifier": JSONBeautifier,
  "json-minifier": JSONMinifier,
  "json-validator": JSONValidator,

  // New Security
  "jwt-generator": JwtGenerator,
  "totp-generator": TotpGenerator,
  "ssl-decoder": SslDecoder,
  "csp-generator": CspGenerator,
  "file-checksum": FileChecksum,

  // New Utilities
  "text-sorter": TextSorter,
  "http-header-parser": HttpHeaderParser,
  "url-parser": UrlParser,
  "user-agent-parser": UserAgentParser,
  "ip-calculator": IpCalculator,
  "json-path-finder": JsonPathFinder,
  "markdown-preview": MarkdownPreview,
  "slug-generator": SlugGenerator,
  "string-length": StringLength,
  "json-schema-generator": JsonSchemaGenerator,
  "dns-lookup": DNSLookup,
  "ip-lookup": IPLookup,

  // Crypto & Security Tools
  "bcrypt-generator": BcryptGenerator,
  "ulid-generator": UlidGenerator,
  "hmac-generator": HmacGenerator,
  "rsa-key-generator": RsaKeyGenerator,
  "password-strength": PasswordStrength,
  "bip39-generator": Bip39Generator,
  "mac-address-lookup": MacAddressLookup,
  "mac-address-generator": MacAddressGenerator,
  "phone-number-parser": PhoneNumberParser,
  "iban-validator": IBANValidator,

  // New Converters
  "roman-numeral-converter": RomanNumeralConverter,
  "nato-alphabet": NatoAlphabet,
  "text-to-unicode": TextToUnicode,
  "list-converter": ListConverter,
  "temperature-converter": TemperatureConverter,

  // New Generators
  "random-port-generator": RandomPortGenerator,
  "meta-tag-generator": MetaTagGenerator,

  // New Formatters
  "docker-run-to-compose": DockerRunToCompose,
  "yaml-viewer": YAMLViewer,
  "benchmark-builder": BenchmarkBuilder,

  // New Utilities
  "basic-auth-generator": BasicAuthGenerator,
  "mime-types": MimeTypes,
  "keycode-info": KeycodeInfo,
  "slugify-string": SlugifyString,
  "safelink-decoder": SafelinkDecoder,
  "device-information": DeviceInformation,
  "email-normalizer": EmailNormalizer,
  "text-diff-visual": TextDiffVisual,
  "string-obfuscator": StringObfuscator,
  "math-evaluator": MathEvaluator,
  "chronometer": Chronometer,
  "percentage-calculator": PercentageCalculator,
  "emoji-picker": EmojiPicker,
  "ipv4-subnet-calculator": Ipv4SubnetCalculator,
  "ipv4-address-converter": Ipv4AddressConverter,
  "ipv4-range-expander": Ipv4RangeExpander,
  "ipv6-ula-generator": Ipv6UlaGenerator,

  // Dedicated tool components
  "base64-decoder": Base64Decoder,
  "base64-encoder": Base64Encoder,
  "css-minifier": CSSMinifier,
  "html-minifier": HTMLMinifier,
  "prompt-generator": PromptGenerator,
  "prompt-improver": PromptImprover,
  "markdown-editor": MarkdownEditor,

  // Orphaned tools now registered
  "chmod-calculator": ChmodCalculator,
  "eta-calculator": EtaCalculator,

  // New IT-Tools parity tools
  "token-generator": TokenGenerator,
  "encrypt-decrypt": EncryptDecrypt,
  "wifi-qr-generator": WifiQRGenerator,
  "http-status-codes": HTTPStatusCodes,
  "git-cheatsheet": GitCheatsheet,
  "regex-memo": RegexMemo,
  "numeronym-generator": NumeronymGenerator,
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
      <Component />
    </div>
  );
}
