"use client";

import { useState, useCallback } from "react";

interface PermissionBits {
  owner: { read: boolean; write: boolean; execute: boolean };
  group: { read: boolean; write: boolean; execute: boolean };
  others: { read: boolean; write: boolean; execute: boolean };
}

function permissionToOctal(p: PermissionBits): string {
  const toNum = (b: { read: boolean; write: boolean; execute: boolean }) =>
    (b.read ? 4 : 0) + (b.write ? 2 : 0) + (b.execute ? 1 : 0);
  return `${toNum(p.owner)}${toNum(p.group)}${toNum(p.others)}`;
}

function permissionToSymbolic(p: PermissionBits): string {
  const toSym = (b: { read: boolean; write: boolean; execute: boolean }) =>
    (b.read ? "r" : "-") + (b.write ? "w" : "-") + (b.execute ? "x" : "-");
  return `${toSym(p.owner)}${toSym(p.group)}${toSym(p.others)}`;
}

function octalToPermission(octal: string): PermissionBits | null {
  if (!/^[0-7]{3}$/.test(octal)) return null;
  const toBits = (n: number) => ({
    read: !!(n & 4),
    write: !!(n & 2),
    execute: !!(n & 1),
  });
  return {
    owner: toBits(parseInt(octal[0])),
    group: toBits(parseInt(octal[1])),
    others: toBits(parseInt(octal[2])),
  };
}

const PRESETS: { label: string; value: string; desc: string }[] = [
  { label: "755", value: "755", desc: "rwxr-xr-x — Executable, readable by all" },
  { label: "644", value: "644", desc: "rw-r--r-- — Readable, writable by owner" },
  { label: "700", value: "700", desc: "rwx------ — Owner only" },
  { label: "600", value: "600", desc: "rw------- — Owner read/write only" },
  { label: "777", value: "777", desc: "rwxrwxrwx — Full access for all" },
  { label: "666", value: "666", desc: "rw-rw-rw- — Read/write for all" },
  { label: "444", value: "444", desc: "r--r--r-- — Read-only for all" },
  { label: "000", value: "000", desc: "--------- — No permissions" },
];

export function ChmodCalculator() {
  const [permissions, setPermissions] = useState<PermissionBits>({
    owner: { read: true, write: true, execute: true },
    group: { read: false, write: false, execute: false },
    others: { read: false, write: false, execute: false },
  });
  const [octalInput, setOctalInput] = useState("700");
  const [copiedField, setCopiedField] = useState("");

  const octal = permissionToOctal(permissions);
  const symbolic = permissionToSymbolic(permissions);
  const chmodCommand = `chmod ${octal} file`;

  const togglePermission = (group: "owner" | "group" | "others", perm: "read" | "write" | "execute") => {
    setPermissions((prev) => ({
      ...prev,
      [group]: { ...prev[group], [perm]: !prev[group][perm] },
    }));
  };

  const applyOctal = useCallback(() => {
    const parsed = octalToPermission(octalInput);
    if (parsed) setPermissions(parsed);
  }, [octalInput]);

  const applyPreset = (value: string) => {
    setOctalInput(value);
    const parsed = octalToPermission(value);
    if (parsed) setPermissions(parsed);
  };

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(""), 3000);
  };

  const groups: { key: "owner" | "group" | "others"; label: string }[] = [
    { key: "owner", label: "Owner" },
    { key: "group", label: "Group" },
    { key: "others", label: "Others" },
  ];

  const perms: { key: "read" | "write" | "execute"; label: string; bit: number }[] = [
    { key: "read", label: "Read (r)", bit: 4 },
    { key: "write", label: "Write (w)", bit: 2 },
    { key: "execute", label: "Execute (x)", bit: 1 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          Octal Input
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={octalInput}
            onChange={(e) => setOctalInput(e.target.value)}
            onBlur={applyOctal}
            onKeyDown={(e) => e.key === "Enter" && applyOctal()}
            maxLength={3}
            placeholder="755"
            className="w-24 rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
          <button
            onClick={applyOctal}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-2">
          Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => applyPreset(p.value)}
              title={p.desc}
              className={`rounded-lg px-3 py-1.5 text-sm font-mono font-medium transition-colors ${
                octal === p.value
                  ? "bg-brand-500 text-white"
                  : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-2">
          Permissions
        </label>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-dark-border">
                <th className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted"></th>
                {perms.map((p) => (
                  <th key={p.key} className="py-2 px-3 text-center text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted">
                    {p.label}
                  </th>
                ))}
                <th className="py-2 px-3 text-center text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted">
                  Octal
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const groupPerms = permissions[g.key];
                const groupOctal = (groupPerms.read ? 4 : 0) + (groupPerms.write ? 2 : 0) + (groupPerms.execute ? 1 : 0);
                return (
                  <tr key={g.key} className="border-b border-surface-100 dark:border-dark-border">
                    <td className="py-3 px-3 font-medium text-surface-700 dark:text-dark-text">{g.label}</td>
                    {perms.map((p) => (
                      <td key={p.key} className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={groupPerms[p.key]}
                          onChange={() => togglePermission(g.key, p.key)}
                          className="accent-brand-500 w-4 h-4"
                        />
                      </td>
                    ))}
                    <td className="py-3 px-3 text-center font-mono text-surface-900 dark:text-dark-text">
                      {groupOctal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => copyValue("octal", octal)}
          className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface text-left"
        >
          <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Octal</span>
          <span className="block text-sm font-mono text-surface-900 dark:text-dark-text">{octal}</span>
          <span className="text-[9px] text-brand-400">{copiedField === "octal" ? "Copied!" : "click to copy"}</span>
        </button>
        <button
          onClick={() => copyValue("symbolic", symbolic)}
          className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface text-left"
        >
          <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Symbolic</span>
          <span className="block text-sm font-mono text-surface-900 dark:text-dark-text">{symbolic}</span>
          <span className="text-[9px] text-brand-400">{copiedField === "symbolic" ? "Copied!" : "click to copy"}</span>
        </button>
        <button
          onClick={() => copyValue("command", chmodCommand)}
          className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface text-left"
        >
          <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Command</span>
          <span className="block text-sm font-mono text-surface-900 dark:text-dark-text">{chmodCommand}</span>
          <span className="text-[9px] text-brand-400">{copiedField === "command" ? "Copied!" : "click to copy"}</span>
        </button>
      </div>

      <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-xs text-surface-500 dark:text-dark-muted">
          <span className="font-medium text-surface-700 dark:text-dark-text">Bit values:</span>{" "}
          Read = 4, Write = 2, Execute = 1. Sum per group gives the octal digit. All three groups combined give the chmod value.
        </p>
      </div>
    </div>
  );
}
