"use client";

import { ToolkitShell } from "./toolkit-shell";
import { JSONFormatter } from "../tools/json-formatter";
import { JSONValidator } from "../tools/json-validator";
import { JSONMinifier } from "../tools/json-minifier";
import { JSONBeautifier } from "../tools/json-beautifier";
import { JSONDiff } from "../tools/json-diff";
import { JSONToCSV } from "../tools/json-to-csv";
import { JSONToYAML } from "../tools/json-to-yaml";
import { JsonToXml } from "../tools/json-to-xml";
import { XmlToJson } from "../tools/xml-to-json";
import { JsonToTypescript } from "../tools/json-to-typescript";
import { JsonToGo } from "../tools/json-to-go";
import { JsonSchemaGenerator } from "../tools/json-schema-generator";
import { JsonPathFinder } from "../tools/json-path-finder";
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
