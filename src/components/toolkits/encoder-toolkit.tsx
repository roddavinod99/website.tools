"use client";

import { FileCode, Link, Code, Binary, Hash, Quote, Image as ImageIcon, Circle } from "lucide-react";
import { ToolkitShell, type Tab } from "./toolkit-shell";
import { Base64Tool } from "@/components/tools/encoders/base64";
import { URLEncoder } from "@/components/tools/utilities/url-encoder";
import { HtmlEntity } from "@/components/tools/formatters/html-entity";
import { Binary as BinaryTool } from "@/components/tools/utilities/binary";
import { Hex } from "@/components/tools/crypto/hex";
import { EscapeUnescape } from "@/components/tools/utilities/escape-unescape";
import { ImageToBase64 } from "@/components/tools/image/image-to-base64";
import { MorseCode } from "@/components/tools/utilities/morse-code";

const tabs: Tab[] = [
  { id: "base64", label: "Base64", icon: <FileCode className="h-4 w-4" />, content: <Base64Tool /> },
  { id: "url", label: "URL", icon: <Link className="h-4 w-4" />, content: <URLEncoder /> },
  { id: "html-entities", label: "HTML Entities", icon: <Code className="h-4 w-4" />, content: <HtmlEntity /> },
  { id: "binary", label: "Binary", icon: <Binary className="h-4 w-4" />, content: <BinaryTool /> },
  { id: "hex", label: "Hex", icon: <Hash className="h-4 w-4" />, content: <Hex /> },
  { id: "escape-unescape", label: "Escape/Unescape", icon: <Quote className="h-4 w-4" />, content: <EscapeUnescape /> },
  { id: "image-to-base64", label: "Image to Base64", icon: <ImageIcon className="h-4 w-4" />, content: <ImageToBase64 /> },
  { id: "morse-code", label: "Morse Code", icon: <Circle className="h-4 w-4" />, content: <MorseCode /> },
];

export function EncoderToolkit() {
  return (
    <ToolkitShell
      title="Encoder / Decoder"
      description="Convert and transform text between different encoding formats."
      tabs={tabs}
      defaultTab="base64"
    />
  );
}
