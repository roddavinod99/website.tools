"use client";

import { Shield, Key, KeyRound, Smartphone, ShieldCheck, ShieldAlert, FileCheck } from "lucide-react";
import { ToolkitShell } from "./toolkit-shell";
import { HashGenerator } from "../tools/hash-generator";
import { JWTDecoder } from "../tools/jwt-decoder";
import { JwtGenerator } from "../tools/jwt-generator";
import { TotpGenerator } from "../tools/totp-generator";
import { SslDecoder } from "../tools/ssl-decoder";
import { CspGenerator } from "../tools/csp-generator";
import { FileChecksum } from "../tools/file-checksum";

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
