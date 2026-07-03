"use client";

import { ToolkitShell, type Tab } from "./toolkit-shell";
import { Hash, SearchCode, CaseSensitive, ArrowUpDown, GitCompare, Link, Ruler, Heading } from "lucide-react";
import { WordCounter } from "../tools/word-counter";
import { TextAnalyzer } from "../tools/text-analyzer";
import { CaseConverter } from "../tools/case-converter";
import { TextSorter } from "../tools/text-sorter";
import { DiffChecker } from "../tools/diff-checker";
import { SlugGenerator } from "../tools/slug-generator";
import { StringLength } from "../tools/string-length";
import { NumberToWords } from "../tools/number-to-words";

export function TextToolkit() {
  const tabs: Tab[] = [
    { id: "word-counter", label: "Word Counter", icon: <Hash className="h-4 w-4" />, content: <WordCounter /> },
    { id: "text-analyzer", label: "Text Analyzer", icon: <SearchCode className="h-4 w-4" />, content: <TextAnalyzer /> },
    { id: "case-converter", label: "Case Converter", icon: <CaseSensitive className="h-4 w-4" />, content: <CaseConverter /> },
    { id: "text-sorter", label: "Text Sorter", icon: <ArrowUpDown className="h-4 w-4" />, content: <TextSorter /> },
    { id: "diff-checker", label: "Diff Checker", icon: <GitCompare className="h-4 w-4" />, content: <DiffChecker /> },
    { id: "slug-generator", label: "Slug Generator", icon: <Link className="h-4 w-4" />, content: <SlugGenerator /> },
    { id: "string-length", label: "String Length", icon: <Ruler className="h-4 w-4" />, content: <StringLength /> },
    { id: "number-to-words", label: "Number to Words", icon: <Heading className="h-4 w-4" />, content: <NumberToWords /> },
  ];

  return (
    <ToolkitShell
      title="Text Toolkit"
      description="A collection of text processing utilities including counting, analysis, conversion, sorting, and more."
      tabs={tabs}
    />
  );
}
