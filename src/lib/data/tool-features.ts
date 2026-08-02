import type { ToolContent } from "@/types";
import base64 from "@/content/tools/base64.json";
import urlEncoder from "@/content/tools/url-encoder.json";
import htmlEntity from "@/content/tools/html-entity.json";
import binary from "@/content/tools/binary.json";
import hex from "@/content/tools/hex.json";
import escapeUnescape from "@/content/tools/escape-unescape.json";
import imageToBase64 from "@/content/tools/image-to-base64.json";
import morseCode from "@/content/tools/morse-code.json";
import base64Decoder from "@/content/tools/base64-decoder.json";
import base64Encoder from "@/content/tools/base64-encoder.json";
import jsonFormatter from "@/content/tools/json-formatter.json";
import htmlFormatter from "@/content/tools/html-formatter.json";
import cssFormatter from "@/content/tools/css-formatter.json";
import jsMinifier from "@/content/tools/js-minifier.json";
import sqlFormatter from "@/content/tools/sql-formatter.json";
import xmlFormatter from "@/content/tools/xml-formatter.json";
import yamlFormatter from "@/content/tools/yaml-formatter.json";
import textAnalyzer from "@/content/tools/text-analyzer.json";
import jsonDiff from "@/content/tools/json-diff.json";
import jsonBeautifier from "@/content/tools/json-beautifier.json";
import jsonMinifier from "@/content/tools/json-minifier.json";
import jsonValidator from "@/content/tools/json-validator.json";
import cssMinifier from "@/content/tools/css-minifier.json";
import htmlMinifier from "@/content/tools/html-minifier.json";
import dockerRunToCompose from "@/content/tools/docker-run-to-compose.json";
import yamlViewer from "@/content/tools/yaml-viewer.json";
import benchmarkBuilder from "@/content/tools/benchmark-builder.json";
import uuidGenerator from "@/content/tools/uuid-generator.json";
import passwordGenerator from "@/content/tools/password-generator.json";
import qrGenerator from "@/content/tools/qr-generator.json";
import randomData from "@/content/tools/random-data.json";
import asciiArt from "@/content/tools/ascii-art.json";
import barcodeGenerator from "@/content/tools/barcode-generator.json";
import loremIpsum from "@/content/tools/lorem-ipsum.json";
import cronExpression from "@/content/tools/cron-expression.json";
import promptGenerator from "@/content/tools/prompt-generator.json";
import promptImprover from "@/content/tools/prompt-improver.json";
import randomPortGenerator from "@/content/tools/random-port-generator.json";
import metaTagGenerator from "@/content/tools/meta-tag-generator.json";
import tokenGenerator from "@/content/tools/token-generator.json";
import wifiQrGenerator from "@/content/tools/wifi-qr-generator.json";
import numeronymGenerator from "@/content/tools/numeronym-generator.json";
import jsonToCsv from "@/content/tools/json-to-csv.json";
import csvToJson from "@/content/tools/csv-to-json.json";
import jsonToXml from "@/content/tools/json-to-xml.json";
import xmlToJson from "@/content/tools/xml-to-json.json";
import markdownToHtml from "@/content/tools/markdown-to-html.json";
import htmlToMarkdown from "@/content/tools/html-to-markdown.json";
import jsonToYaml from "@/content/tools/json-to-yaml.json";
import tomlConverter from "@/content/tools/toml-converter.json";
import timestampConverter from "@/content/tools/timestamp-converter.json";
import colorConverter from "@/content/tools/color-converter.json";
import unitConverter from "@/content/tools/unit-converter.json";
import caseConverter from "@/content/tools/case-converter.json";
import baseConverter from "@/content/tools/base-converter.json";
import numberToWords from "@/content/tools/number-to-words.json";
import jsonToTypescript from "@/content/tools/json-to-typescript.json";
import jsonToGo from "@/content/tools/json-to-go.json";
import markdownEditor from "@/content/tools/markdown-editor.json";
import romanNumeralConverter from "@/content/tools/roman-numeral-converter.json";
import natoAlphabet from "@/content/tools/nato-alphabet.json";
import textToUnicode from "@/content/tools/text-to-unicode.json";
import listConverter from "@/content/tools/list-converter.json";
import temperatureConverter from "@/content/tools/temperature-converter.json";
import jwtDecoder from "@/content/tools/jwt-decoder.json";
import jwtGenerator from "@/content/tools/jwt-generator.json";
import hashGenerator from "@/content/tools/hash-generator.json";
import totpGenerator from "@/content/tools/totp-generator.json";
import sslDecoder from "@/content/tools/ssl-decoder.json";
import cspGenerator from "@/content/tools/csp-generator.json";
import fileChecksum from "@/content/tools/file-checksum.json";
import jsonSchemaGenerator from "@/content/tools/json-schema-generator.json";
import bcryptGenerator from "@/content/tools/bcrypt-generator.json";
import ulidGenerator from "@/content/tools/ulid-generator.json";
import hmacGenerator from "@/content/tools/hmac-generator.json";
import rsaKeyGenerator from "@/content/tools/rsa-key-generator.json";
import passwordStrength from "@/content/tools/password-strength.json";
import bip39Generator from "@/content/tools/bip39-generator.json";
import macAddressLookup from "@/content/tools/mac-address-lookup.json";
import macAddressGenerator from "@/content/tools/mac-address-generator.json";
import phoneNumberParser from "@/content/tools/phone-number-parser.json";
import ibanValidator from "@/content/tools/iban-validator.json";
import encryptDecrypt from "@/content/tools/encrypt-decrypt.json";
import imageCompressor from "@/content/tools/image-compressor.json";
import imageResizer from "@/content/tools/image-resizer.json";
import faviconGenerator from "@/content/tools/favicon-generator.json";
import svgOptimizer from "@/content/tools/svg-optimizer.json";
import placeholderImage from "@/content/tools/placeholder-image.json";
import svgToCss from "@/content/tools/svg-to-css.json";
import exifReader from "@/content/tools/exif-reader.json";
import exifTransfer from "@/content/tools/exif-transfer.json";
import colorEyedropper from "@/content/tools/color-eyedropper.json";
import regexTester from "@/content/tools/regex-tester.json";
import diffChecker from "@/content/tools/diff-checker.json";
import wordCounter from "@/content/tools/word-counter.json";
import textSorter from "@/content/tools/text-sorter.json";
import httpHeaderParser from "@/content/tools/http-header-parser.json";
import urlParser from "@/content/tools/url-parser.json";
import userAgentParser from "@/content/tools/user-agent-parser.json";
import ipCalculator from "@/content/tools/ip-calculator.json";
import jsonPathFinder from "@/content/tools/json-path-finder.json";
import markdownPreview from "@/content/tools/markdown-preview.json";
import slugGenerator from "@/content/tools/slug-generator.json";
import stringLength from "@/content/tools/string-length.json";
import dnsLookup from "@/content/tools/dns-lookup.json";
import ipLookup from "@/content/tools/ip-lookup.json";
import basicAuthGenerator from "@/content/tools/basic-auth-generator.json";
import mimeTypes from "@/content/tools/mime-types.json";
import keycodeInfo from "@/content/tools/keycode-info.json";
import slugifyString from "@/content/tools/slugify-string.json";
import safelinkDecoder from "@/content/tools/safelink-decoder.json";
import deviceInformation from "@/content/tools/device-information.json";
import emailNormalizer from "@/content/tools/email-normalizer.json";
import textDiffVisual from "@/content/tools/text-diff-visual.json";
import stringObfuscator from "@/content/tools/string-obfuscator.json";
import mathEvaluator from "@/content/tools/math-evaluator.json";
import chronometer from "@/content/tools/chronometer.json";
import percentageCalculator from "@/content/tools/percentage-calculator.json";
import emojiPicker from "@/content/tools/emoji-picker.json";
import ipv4SubnetCalculator from "@/content/tools/ipv4-subnet-calculator.json";
import ipv4AddressConverter from "@/content/tools/ipv4-address-converter.json";
import ipv4RangeExpander from "@/content/tools/ipv4-range-expander.json";
import ipv6UlaGenerator from "@/content/tools/ipv6-ula-generator.json";
import chmodCalculator from "@/content/tools/chmod-calculator.json";
import etaCalculator from "@/content/tools/eta-calculator.json";
import httpStatusCodes from "@/content/tools/http-status-codes.json";
import gitCheatsheet from "@/content/tools/git-cheatsheet.json";
import regexMemo from "@/content/tools/regex-memo.json";

const entries: [string, ToolContent][] = [
  ["base64", base64 as unknown as ToolContent],
  ["url-encoder", urlEncoder as unknown as ToolContent],
  ["html-entity", htmlEntity as unknown as ToolContent],
  ["binary", binary as unknown as ToolContent],
  ["hex", hex as unknown as ToolContent],
  ["escape-unescape", escapeUnescape as unknown as ToolContent],
  ["image-to-base64", imageToBase64 as unknown as ToolContent],
  ["morse-code", morseCode as unknown as ToolContent],
  ["base64-decoder", base64Decoder as unknown as ToolContent],
  ["base64-encoder", base64Encoder as unknown as ToolContent],
  ["json-formatter", jsonFormatter as unknown as ToolContent],
  ["html-formatter", htmlFormatter as unknown as ToolContent],
  ["css-formatter", cssFormatter as unknown as ToolContent],
  ["js-minifier", jsMinifier as unknown as ToolContent],
  ["sql-formatter", sqlFormatter as unknown as ToolContent],
  ["xml-formatter", xmlFormatter as unknown as ToolContent],
  ["yaml-formatter", yamlFormatter as unknown as ToolContent],
  ["text-analyzer", textAnalyzer as unknown as ToolContent],
  ["json-diff", jsonDiff as unknown as ToolContent],
  ["json-beautifier", jsonBeautifier as unknown as ToolContent],
  ["json-minifier", jsonMinifier as unknown as ToolContent],
  ["json-validator", jsonValidator as unknown as ToolContent],
  ["css-minifier", cssMinifier as unknown as ToolContent],
  ["html-minifier", htmlMinifier as unknown as ToolContent],
  ["docker-run-to-compose", dockerRunToCompose as unknown as ToolContent],
  ["yaml-viewer", yamlViewer as unknown as ToolContent],
  ["benchmark-builder", benchmarkBuilder as unknown as ToolContent],
  ["uuid-generator", uuidGenerator as unknown as ToolContent],
  ["password-generator", passwordGenerator as unknown as ToolContent],
  ["qr-generator", qrGenerator as unknown as ToolContent],
  ["random-data", randomData as unknown as ToolContent],
  ["ascii-art", asciiArt as unknown as ToolContent],
  ["barcode-generator", barcodeGenerator as unknown as ToolContent],
  ["lorem-ipsum", loremIpsum as unknown as ToolContent],
  ["cron-expression", cronExpression as unknown as ToolContent],
  ["prompt-generator", promptGenerator as unknown as ToolContent],
  ["prompt-improver", promptImprover as unknown as ToolContent],
  ["random-port-generator", randomPortGenerator as unknown as ToolContent],
  ["meta-tag-generator", metaTagGenerator as unknown as ToolContent],
  ["token-generator", tokenGenerator as unknown as ToolContent],
  ["wifi-qr-generator", wifiQrGenerator as unknown as ToolContent],
  ["numeronym-generator", numeronymGenerator as unknown as ToolContent],
  ["json-to-csv", jsonToCsv as unknown as ToolContent],
  ["csv-to-json", csvToJson as unknown as ToolContent],
  ["json-to-xml", jsonToXml as unknown as ToolContent],
  ["xml-to-json", xmlToJson as unknown as ToolContent],
  ["markdown-to-html", markdownToHtml as unknown as ToolContent],
  ["html-to-markdown", htmlToMarkdown as unknown as ToolContent],
  ["json-to-yaml", jsonToYaml as unknown as ToolContent],
  ["toml-converter", tomlConverter as unknown as ToolContent],
  ["timestamp-converter", timestampConverter as unknown as ToolContent],
  ["color-converter", colorConverter as unknown as ToolContent],
  ["unit-converter", unitConverter as unknown as ToolContent],
  ["case-converter", caseConverter as unknown as ToolContent],
  ["base-converter", baseConverter as unknown as ToolContent],
  ["number-to-words", numberToWords as unknown as ToolContent],
  ["json-to-typescript", jsonToTypescript as unknown as ToolContent],
  ["json-to-go", jsonToGo as unknown as ToolContent],
  ["markdown-editor", markdownEditor as unknown as ToolContent],
  ["roman-numeral-converter", romanNumeralConverter as unknown as ToolContent],
  ["nato-alphabet", natoAlphabet as unknown as ToolContent],
  ["text-to-unicode", textToUnicode as unknown as ToolContent],
  ["list-converter", listConverter as unknown as ToolContent],
  ["temperature-converter", temperatureConverter as unknown as ToolContent],
  ["jwt-decoder", jwtDecoder as unknown as ToolContent],
  ["jwt-generator", jwtGenerator as unknown as ToolContent],
  ["hash-generator", hashGenerator as unknown as ToolContent],
  ["totp-generator", totpGenerator as unknown as ToolContent],
  ["ssl-decoder", sslDecoder as unknown as ToolContent],
  ["csp-generator", cspGenerator as unknown as ToolContent],
  ["file-checksum", fileChecksum as unknown as ToolContent],
  ["json-schema-generator", jsonSchemaGenerator as unknown as ToolContent],
  ["bcrypt-generator", bcryptGenerator as unknown as ToolContent],
  ["ulid-generator", ulidGenerator as unknown as ToolContent],
  ["hmac-generator", hmacGenerator as unknown as ToolContent],
  ["rsa-key-generator", rsaKeyGenerator as unknown as ToolContent],
  ["password-strength", passwordStrength as unknown as ToolContent],
  ["bip39-generator", bip39Generator as unknown as ToolContent],
  ["mac-address-lookup", macAddressLookup as unknown as ToolContent],
  ["mac-address-generator", macAddressGenerator as unknown as ToolContent],
  ["phone-number-parser", phoneNumberParser as unknown as ToolContent],
  ["iban-validator", ibanValidator as unknown as ToolContent],
  ["encrypt-decrypt", encryptDecrypt as unknown as ToolContent],
  ["image-compressor", imageCompressor as unknown as ToolContent],
  ["image-resizer", imageResizer as unknown as ToolContent],
  ["favicon-generator", faviconGenerator as unknown as ToolContent],
  ["svg-optimizer", svgOptimizer as unknown as ToolContent],
  ["placeholder-image", placeholderImage as unknown as ToolContent],
  ["svg-to-css", svgToCss as unknown as ToolContent],
  ["exif-reader", exifReader as unknown as ToolContent],
  ["exif-transfer", exifTransfer as unknown as ToolContent],
  ["color-eyedropper", colorEyedropper as unknown as ToolContent],
  ["regex-tester", regexTester as unknown as ToolContent],
  ["diff-checker", diffChecker as unknown as ToolContent],
  ["word-counter", wordCounter as unknown as ToolContent],
  ["text-sorter", textSorter as unknown as ToolContent],
  ["http-header-parser", httpHeaderParser as unknown as ToolContent],
  ["url-parser", urlParser as unknown as ToolContent],
  ["user-agent-parser", userAgentParser as unknown as ToolContent],
  ["ip-calculator", ipCalculator as unknown as ToolContent],
  ["json-path-finder", jsonPathFinder as unknown as ToolContent],
  ["markdown-preview", markdownPreview as unknown as ToolContent],
  ["slug-generator", slugGenerator as unknown as ToolContent],
  ["string-length", stringLength as unknown as ToolContent],
  ["dns-lookup", dnsLookup as unknown as ToolContent],
  ["ip-lookup", ipLookup as unknown as ToolContent],
  ["basic-auth-generator", basicAuthGenerator as unknown as ToolContent],
  ["mime-types", mimeTypes as unknown as ToolContent],
  ["keycode-info", keycodeInfo as unknown as ToolContent],
  ["slugify-string", slugifyString as unknown as ToolContent],
  ["safelink-decoder", safelinkDecoder as unknown as ToolContent],
  ["device-information", deviceInformation as unknown as ToolContent],
  ["email-normalizer", emailNormalizer as unknown as ToolContent],
  ["text-diff-visual", textDiffVisual as unknown as ToolContent],
  ["string-obfuscator", stringObfuscator as unknown as ToolContent],
  ["math-evaluator", mathEvaluator as unknown as ToolContent],
  ["chronometer", chronometer as unknown as ToolContent],
  ["percentage-calculator", percentageCalculator as unknown as ToolContent],
  ["emoji-picker", emojiPicker as unknown as ToolContent],
  ["ipv4-subnet-calculator", ipv4SubnetCalculator as unknown as ToolContent],
  ["ipv4-address-converter", ipv4AddressConverter as unknown as ToolContent],
  ["ipv4-range-expander", ipv4RangeExpander as unknown as ToolContent],
  ["ipv6-ula-generator", ipv6UlaGenerator as unknown as ToolContent],
  ["chmod-calculator", chmodCalculator as unknown as ToolContent],
  ["eta-calculator", etaCalculator as unknown as ToolContent],
  ["http-status-codes", httpStatusCodes as unknown as ToolContent],
  ["git-cheatsheet", gitCheatsheet as unknown as ToolContent],
  ["regex-memo", regexMemo as unknown as ToolContent],
];

const featuresBySlug: Record<string, string[]> = {};
for (const [slug, content] of entries) {
  if (content.features?.length) {
    featuresBySlug[slug] = content.features;
  }
}

export function getToolFeatures(slug: string): string[] {
  return featuresBySlug[slug] ?? [];
}

export { featuresBySlug };
