"use client";

import { FingerprintPattern, Lock, QrCode, Barcode, Type, Shuffle, TextCursor, Clock } from "lucide-react";
import { ToolkitShell, type Tab } from "./toolkit-shell";
import { UUIDGenerator } from "../tools/uuid-generator";
import { PasswordGenerator } from "../tools/password-generator";
import { QRGenerator } from "../tools/qr-generator";
import { BarcodeGenerator } from "../tools/barcode-generator";
import { LoremIpsum } from "../tools/lorem-ipsum";
import { RandomData } from "../tools/random-data";
import { AsciiArt } from "../tools/ascii-art";
import { CronExpression } from "../tools/cron-expression";

const tabs: Tab[] = [
  { id: "uuid", label: "UUID", icon: <FingerprintPattern className="h-4 w-4" />, content: <UUIDGenerator /> },
  { id: "password", label: "Password", icon: <Lock className="h-4 w-4" />, content: <PasswordGenerator /> },
  { id: "qr-code", label: "QR Code", icon: <QrCode className="h-4 w-4" />, content: <QRGenerator /> },
  { id: "barcode", label: "Barcode", icon: <Barcode className="h-4 w-4" />, content: <BarcodeGenerator /> },
  { id: "lorem-ipsum", label: "Lorem Ipsum", icon: <Type className="h-4 w-4" />, content: <LoremIpsum /> },
  { id: "random-data", label: "Random Data", icon: <Shuffle className="h-4 w-4" />, content: <RandomData /> },
  { id: "ascii-art", label: "ASCII Art", icon: <TextCursor className="h-4 w-4" />, content: <AsciiArt /> },
  { id: "cron-expression", label: "Cron Expression", icon: <Clock className="h-4 w-4" />, content: <CronExpression /> },
];

export function GeneratorToolkit() {
  return (
    <ToolkitShell
      title="Generators"
      description="Generate unique identifiers, passwords, codes, and sample data."
      tabs={tabs}
      defaultTab="uuid"
    />
  );
}
