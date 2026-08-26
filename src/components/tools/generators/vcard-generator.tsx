"use client";

import { useState } from "react";

function escapeVcard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildVCard(data: {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  street: string;
  city: string;
  region: string;
  zip: string;
  country: string;
}): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  const fn = `${data.firstName} ${data.lastName}`.trim();
  if (data.lastName || data.firstName) {
    lines.push(`N:${escapeVcard(data.lastName.trim())};${escapeVcard(data.firstName.trim())};;;`);
  }
  if (fn) lines.push(`FN:${escapeVcard(fn)}`);
  if (data.organization) lines.push(`ORG:${escapeVcard(data.organization)}`);
  if (data.title) lines.push(`TITLE:${escapeVcard(data.title)}`);
  if (data.phone) lines.push(`TEL;TYPE=WORK,VOICE:${escapeVcard(data.phone)}`);
  if (data.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVcard(data.email)}`);
  if (data.website) lines.push(`URL:${escapeVcard(data.website)}`);
  const address = [data.street, data.city, data.region, data.zip, data.country]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(";");
  if (address) lines.push(`ADR;TYPE=WORK:;;${address.replace(/;/g, ";")};;;`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

function downloadVCard(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "contact.vcf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function VcardGenerator() {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    street: "",
    city: "",
    region: "",
    zip: "",
    country: "",
  });
  const [copied, setCopied] = useState(false);

  const vcard = buildVCard(data);
  const set = (key: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-2.5 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";
  const labelCls = "block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1";

  const fields: { key: keyof typeof data; label: string; span?: boolean }[] = [
    { key: "firstName", label: "First name" },
    { key: "lastName", label: "Last name" },
    { key: "organization", label: "Organization" },
    { key: "title", label: "Job title" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "website", label: "Website" },
    { key: "street", label: "Street", span: true },
    { key: "city", label: "City" },
    { key: "region", label: "Region/State" },
    { key: "zip", label: "ZIP/Postal" },
    { key: "country", label: "Country" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {fields.map((f) => (
          <div key={f.key} className={f.span ? "sm:col-span-3" : "sm:col-span-1"}>
            <label className={labelCls}>{f.label}</label>
            <input type="text" value={data[f.key]} onChange={set(f.key)} className={inputCls} />
          </div>
        ))}
      </div>

      <textarea
        readOnly
        value={vcard}
        aria-label="Generated VCard output"
        className="h-44 w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(vcard);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
          }}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          {copied ? "Copied!" : "Copy VCard"}
        </button>
        <button
          onClick={() =>
            downloadVCard(vcard, `${(data.firstName || "contact").toLowerCase().replace(/\s+/g, "-")}.vcf`)
          }
          className="rounded-lg border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
        >
          Download .vcf
        </button>
      </div>

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        Generates VCard 3.0 (RFC 2426). All data is processed locally in your browser.
      </p>
    </div>
  );
}