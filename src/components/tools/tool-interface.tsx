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
import { JsonToTypeScript } from "./json-to-typescript";
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
  "json-to-typescript": JsonToTypeScript,
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
