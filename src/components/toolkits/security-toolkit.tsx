"use client";

import { Shield, Key, KeyRound, Smartphone, ShieldCheck, ShieldAlert, FileCheck } from "lucide-react";
import { ToolkitShell } from "./toolkit-shell";
import { HashGenerator } from "@/components/tools/crypto/hash-generator";
import { JWTDecoder } from "@/components/tools/crypto/jwt-decoder";
import { JwtGenerator } from "@/components/tools/crypto/jwt-generator";
import { TotpGenerator } from "@/components/tools/crypto/totp-generator";
import { SslDecoder } from "@/components/tools/security/ssl-decoder";
import { CspGenerator } from "@/components/tools/security/csp-generator";
import { FileChecksum } from "@/components/tools/utilities/file-checksum";

export function SecurityToolkit() {
  return (
    <ToolkitShell
      title="Security"
      description="Cryptographic, token, certificate, and policy utilities for security professionals."
      tabs={[
        { id: "hash-generator", label: "Hash Generator", icon: <Shield className="h-4 w-4" />, content: <HashGenerator /> },
        { id: "jwt-decoder", label: "JWT Decoder", icon: <Key className="h-4 w-4" />, content: <JWTDecoder /> },
        { id: "jwt-generator", label: "JWT Generator", icon: <KeyRound className="h-4 w-4" />, content: <JwtGenerator /> },
        { id: "totp-generator", label: "TOTP Generator", icon: <Smartphone className="h-4 w-4" />, content: <TotpGenerator /> },
        { id: "ssl-decoder", label: "SSL Decoder", icon: <ShieldCheck className="h-4 w-4" />, content: <SslDecoder /> },
        { id: "csp-generator", label: "CSP Generator", icon: <ShieldAlert className="h-4 w-4" />, content: <CspGenerator /> },
        { id: "file-checksum", label: "File Checksum", icon: <FileCheck className="h-4 w-4" />, content: <FileChecksum /> },
      ]}
    />
  );
}
