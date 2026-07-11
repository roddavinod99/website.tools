"use client";

import { useState, useCallback, useMemo } from "react";

interface ParsedDockerRun {
  image: string;
  ports: string[];
  volumes: string[];
  envVars: string[];
  network: string;
  restartPolicy: string;
  containerName: string;
  command: string;
  detached: boolean;
  removeOnExit: boolean;
}

function parseDockerRun(input: string): ParsedDockerRun {
  const result: ParsedDockerRun = {
    image: "",
    ports: [],
    volumes: [],
    envVars: [],
    network: "",
    restartPolicy: "",
    containerName: "",
    command: "",
    detached: false,
    removeOnExit: false,
  };

  const tokens = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i].replace(/^"|"$/g, "");

    if (token === "docker" || token === "run") {
      i++;
      continue;
    }

    if (token === "-d" || token === "--detach") {
      result.detached = true;
      i++;
      continue;
    }

    if (token === "--rm") {
      result.removeOnExit = true;
      i++;
      continue;
    }

    if ((token === "-p" || token === "--publish") && i + 1 < tokens.length) {
      result.ports.push(tokens[i + 1].replace(/^"|"$/g, ""));
      i += 2;
      continue;
    }

    if ((token === "-v" || token === "--volume") && i + 1 < tokens.length) {
      result.volumes.push(tokens[i + 1].replace(/^"|"$/g, ""));
      i += 2;
      continue;
    }

    if ((token === "-e" || token === "--env") && i + 1 < tokens.length) {
      result.envVars.push(tokens[i + 1].replace(/^"|"$/g, ""));
      i += 2;
      continue;
    }

    if ((token === "--name") && i + 1 < tokens.length) {
      result.containerName = tokens[i + 1].replace(/^"|"$/g, "");
      i += 2;
      continue;
    }

    if ((token === "--network" || token === "--net") && i + 1 < tokens.length) {
      result.network = tokens[i + 1].replace(/^"|"$/g, "");
      i += 2;
      continue;
    }

    if ((token === "--restart") && i + 1 < tokens.length) {
      result.restartPolicy = tokens[i + 1].replace(/^"|"$/g, "");
      i += 2;
      continue;
    }

    if (token === "-it" || token === "-i" || token === "-t" || token === "--interactive" || token === "--tty") {
      i++;
      continue;
    }

    if (!token.startsWith("-") && !result.image) {
      result.image = token;
      i++;
      continue;
    }

    if (result.image && i === tokens.findIndex((t) => t === result.image) + 1) {
      result.command = tokens.slice(i).join(" ");
      break;
    }

    i++;
  }

  return result;
}

function generateCompose(parsed: ParsedDockerRun): string {
  const lines: string[] = ["version: \"3.8\"", "services:", "  app:"];

  if (parsed.image) lines.push(`    image: ${parsed.image}`);

  if (parsed.containerName) lines.push(`    container_name: ${parsed.containerName}`);

  if (parsed.ports.length > 0) {
    lines.push("    ports:");
    parsed.ports.forEach((p) => {
      lines.push(`      - "${p}"`);
    });
  }

  if (parsed.volumes.length > 0) {
    lines.push("    volumes:");
    parsed.volumes.forEach((v) => {
      lines.push(`      - "${v}"`);
    });
  }

  if (parsed.envVars.length > 0) {
    lines.push("    environment:");
    parsed.envVars.forEach((e) => {
      const [key, ...rest] = e.split("=");
      const val = rest.join("=");
      if (val) {
        lines.push(`      ${key}: ${val}`);
      } else {
        lines.push(`      - ${key}`);
      }
    });
  }

  if (parsed.network) {
    lines.push(`    networks:`);
    lines.push(`      - ${parsed.network}`);
  }

  if (parsed.restartPolicy) {
    lines.push(`    restart: ${parsed.restartPolicy}`);
  }

  if (parsed.command) {
    lines.push(`    command: ${parsed.command}`);
  }

  if (parsed.network) {
    lines.push("");
    lines.push("networks:");
    lines.push(`  ${parsed.network}:`);
    lines.push("    driver: bridge");
  }

  return lines.join("\n");
}

export function DockerRunToCompose() {
  const [input, setInput] = useState("docker run -d --name my-app -p 8080:80 -v /data:/app/data -e NODE_ENV=production --network my-network --restart unless-stopped nginx:latest");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseDockerRun(input), [input]);
  const output = useMemo(() => generateCompose(parsed), [parsed]);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Docker Run Command</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="docker run -d --name my-app -p 8080:80 nginx:latest"
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      {parsed.image && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-2">Parsed Components</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-white dark:bg-dark-bg p-2">
              <span className="text-surface-500 dark:text-dark-muted">Image:</span>{" "}
              <span className="font-mono text-surface-900 dark:text-dark-text">{parsed.image}</span>
            </div>
            {parsed.containerName && (
              <div className="rounded bg-white dark:bg-dark-bg p-2">
                <span className="text-surface-500 dark:text-dark-muted">Name:</span>{" "}
                <span className="font-mono text-surface-900 dark:text-dark-text">{parsed.containerName}</span>
              </div>
            )}
            {parsed.ports.length > 0 && (
              <div className="rounded bg-white dark:bg-dark-bg p-2">
                <span className="text-surface-500 dark:text-dark-muted">Ports:</span>{" "}
                <span className="font-mono text-surface-900 dark:text-dark-text">{parsed.ports.join(", ")}</span>
              </div>
            )}
            {parsed.volumes.length > 0 && (
              <div className="rounded bg-white dark:bg-dark-bg p-2">
                <span className="text-surface-500 dark:text-dark-muted">Volumes:</span>{" "}
                <span className="font-mono text-surface-900 dark:text-dark-text">{parsed.volumes.join(", ")}</span>
              </div>
            )}
            {parsed.envVars.length > 0 && (
              <div className="rounded bg-white dark:bg-dark-bg p-2">
                <span className="text-surface-500 dark:text-dark-muted">Env:</span>{" "}
                <span className="font-mono text-surface-900 dark:text-dark-text">{parsed.envVars.join(", ")}</span>
              </div>
            )}
            {parsed.network && (
              <div className="rounded bg-white dark:bg-dark-bg p-2">
                <span className="text-surface-500 dark:text-dark-muted">Network:</span>{" "}
                <span className="font-mono text-surface-900 dark:text-dark-text">{parsed.network}</span>
              </div>
            )}
            {parsed.restartPolicy && (
              <div className="rounded bg-white dark:bg-dark-bg p-2">
                <span className="text-surface-500 dark:text-dark-muted">Restart:</span>{" "}
                <span className="font-mono text-surface-900 dark:text-dark-text">{parsed.restartPolicy}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">docker-compose.yml</label>
          <button
            onClick={copy}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy YAML"}
          </button>
        </div>
        <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-sm text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap">
          {output}
        </pre>
      </div>

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        All parsing is done client-side. Your data never leaves your browser.
      </p>
    </div>
  );
}
