"use client";

import { ToolkitShell } from "./toolkit-shell";
import { JSONFormatter } from "@/components/tools/formatters/json-formatter";
import { JSONValidator } from "@/components/tools/json/json-validator";
import { JSONMinifier } from "@/components/tools/json/json-minifier";
import { JSONBeautifier } from "@/components/tools/json/json-beautifier";
import { JSONDiff } from "@/components/tools/json/json-diff";
import { JSONToCSV } from "@/components/tools/converters/json-to-csv";
import { JSONToYAML } from "@/components/tools/formatters/json-to-yaml";
import { JsonToXml } from "@/components/tools/json/json-to-xml";
import { XmlToJson } from "@/components/tools/converters/xml-to-json";
import { JsonToTypescript } from "@/components/tools/json/json-to-typescript";
import { JsonToGo } from "@/components/tools/json/json-to-go";
import { JsonSchemaGenerator } from "@/components/tools/json/json-schema-generator";
import { JsonPathFinder } from "@/components/tools/json/json-path-finder";
import {
  Braces,
  CircleCheck,
  Minimize2,
  PanelRightOpen,
  GitCompare,
  Table,
  FileType,
  Code,
  FileCode,
  Files,
  FileStack,
  Search,
  ArrowLeftRight,
} from "lucide-react";

export function JSONToolkit() {
  const tabs = [
    { id: "format", label: "Formatter", icon: <Braces className="h-4 w-4" />, content: <JSONFormatter /> },
    { id: "validate", label: "Validator", icon: <CircleCheck className="h-4 w-4" />, content: <JSONValidator /> },
    { id: "minify", label: "Minifier", icon: <Minimize2 className="h-4 w-4" />, content: <JSONMinifier /> },
    { id: "beautify", label: "Beautifier", icon: <PanelRightOpen className="h-4 w-4" />, content: <JSONBeautifier /> },
    { id: "diff", label: "Diff", icon: <GitCompare className="h-4 w-4" />, content: <JSONDiff /> },
    { id: "csv", label: "JSON to CSV", icon: <Table className="h-4 w-4" />, content: <JSONToCSV /> },
    { id: "yaml", label: "JSON to YAML", icon: <FileType className="h-4 w-4" />, content: <JSONToYAML /> },
    { id: "xml", label: "JSON to XML", icon: <Code className="h-4 w-4" />, content: <JsonToXml /> },
    { id: "xml2json", label: "XML to JSON", icon: <ArrowLeftRight className="h-4 w-4" />, content: <XmlToJson /> },
    { id: "typescript", label: "JSON to TypeScript", icon: <FileCode className="h-4 w-4" />, content: <JsonToTypescript /> },
    { id: "go", label: "JSON to Go", icon: <Files className="h-4 w-4" />, content: <JsonToGo /> },
    { id: "schema", label: "JSON Schema", icon: <FileStack className="h-4 w-4" />, content: <JsonSchemaGenerator /> },
    { id: "path", label: "JSON Path Finder", icon: <Search className="h-4 w-4" />, content: <JsonPathFinder /> },
  ];

  return (
    <ToolkitShell
      title="JSON Toolkit"
      description="Format, validate, diff, convert, and generate code from JSON — all in one place."
      tabs={tabs}
    />
  );
}
