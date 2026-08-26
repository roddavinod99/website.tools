"use client";

import { ToolkitShell, type Tab } from "./toolkit-shell";
import { Palette, Code, Database, FileX, FileType, FileText, Network, Globe, Monitor, SearchCode, Hash, FileStack, Clock, Binary, Ruler, ArrowUpDown } from "lucide-react";
import { CSSFormatter } from "@/components/tools/formatters/css-formatter";
import { HTMLFormatter } from "@/components/tools/formatters/html-formatter";
import { SQLFormatter } from "@/components/tools/formatters/sql-formatter";
import { XMLFormatter } from "@/components/tools/formatters/xml-formatter";
import { YAMLFormatter } from "@/components/tools/formatters/yaml-formatter";
import { JSMinifier } from "@/components/tools/formatters/js-minifier";
import { IpCalculator } from "@/components/tools/network/ip-calculator";
import { UrlParser } from "@/components/tools/utilities/url-parser";
import { HttpHeaderParser } from "@/components/tools/network/http-header-parser";
import { UserAgentParser } from "@/components/tools/network/user-agent-parser";
import { RegexTester } from "@/components/tools/utilities/regex-tester";
import { MarkdownPreview } from "@/components/tools/formatters/markdown-preview";
import { TimestampConverter } from "@/components/tools/utilities/timestamp-converter";
import { ColorConverter } from "@/components/tools/image/color-converter";
import { UnitConverter } from "@/components/tools/converters/unit-converter";
import { BaseConverter } from "@/components/tools/converters/base-converter";

export function DevToolkit() {
  const tabs: Tab[] = [
    { id: "css-formatter", label: "CSS Formatter", icon: <Palette className="h-4 w-4" />, content: <CSSFormatter /> },
    { id: "html-formatter", label: "HTML Formatter", icon: <Code className="h-4 w-4" />, content: <HTMLFormatter /> },
    { id: "sql-formatter", label: "SQL Formatter", icon: <Database className="h-4 w-4" />, content: <SQLFormatter /> },
    { id: "xml-formatter", label: "XML Formatter", icon: <FileX className="h-4 w-4" />, content: <XMLFormatter /> },
    { id: "yaml-formatter", label: "YAML Formatter", icon: <FileType className="h-4 w-4" />, content: <YAMLFormatter /> },
    { id: "js-minifier", label: "JS Minifier", icon: <FileText className="h-4 w-4" />, content: <JSMinifier /> },
    { id: "ip-calculator", label: "IP Calculator", icon: <Network className="h-4 w-4" />, content: <IpCalculator /> },
    { id: "url-parser", label: "URL Parser", icon: <Globe className="h-4 w-4" />, content: <UrlParser /> },
    { id: "http-header-parser", label: "HTTP Header Parser", icon: <Monitor className="h-4 w-4" />, content: <HttpHeaderParser /> },
    { id: "user-agent-parser", label: "User Agent Parser", icon: <SearchCode className="h-4 w-4" />, content: <UserAgentParser /> },
    { id: "regex-tester", label: "Regex Tester", icon: <Hash className="h-4 w-4" />, content: <RegexTester /> },
    { id: "markdown-preview", label: "Markdown Preview", icon: <FileStack className="h-4 w-4" />, content: <MarkdownPreview /> },
    { id: "timestamp-converter", label: "Timestamp Converter", icon: <Clock className="h-4 w-4" />, content: <TimestampConverter /> },
    { id: "color-converter", label: "Color Converter", icon: <Binary className="h-4 w-4" />, content: <ColorConverter /> },
    { id: "unit-converter", label: "Unit Converter", icon: <Ruler className="h-4 w-4" />, content: <UnitConverter /> },
    { id: "base-converter", label: "Base Converter", icon: <ArrowUpDown className="h-4 w-4" />, content: <BaseConverter /> },
  ];

  return (
    <ToolkitShell
      title="Dev Toolkit"
      description="A comprehensive collection of developer utilities for formatting, converting, parsing, and analyzing code and data."
      tabs={tabs}
    />
  );
}
