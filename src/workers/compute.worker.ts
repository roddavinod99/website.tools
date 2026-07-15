type ComputeMessage = {
  id: string;
  type: string;
  data: unknown;
};

self.onmessage = async (e: MessageEvent<ComputeMessage>) => {
  const { id, type, data } = e.data;
  try {
    let result: unknown;
    switch (type) {
      case 'json-format': {
        const { input, indent } = data as { input: string; indent?: number };
        result = JSON.stringify(JSON.parse(input), null, indent ?? 2);
        break;
      }
      case 'json-validate': {
        const { input } = data as { input: string };
        try { JSON.parse(input); result = { valid: true }; }
        catch (err) { result = { valid: false, error: (err as Error).message }; }
        break;
      }
      case 'json-minify': {
        const { input } = data as { input: string };
        result = JSON.stringify(JSON.parse(input));
        break;
      }
      case 'csv-parse': {
        const { input, delimiter } = data as { input: string; delimiter?: string };
        const d = delimiter || ',';
        const lines = input.split('\n').filter(l => l.trim());
        if (lines.length === 0) { result = []; break; }
        const headers = parseCSVLine(lines[0], d);
        const rows = lines.slice(1).map(line => {
          const values = parseCSVLine(line, d);
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => obj[h] = values[i] || '');
          return obj;
        });
        result = rows;
        break;
      }
      case 'hash': {
        const { input, algorithm } = data as { input: string; algorithm: string };
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(input);
        const algoMap: Record<string, string> = { 'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-384': 'SHA-384', 'SHA-512': 'SHA-512' };
        const hashBuffer = await crypto.subtle.digest(algoMap[algorithm] || 'SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        result = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        break;
      }
      case 'text-sort': {
        const { input, options } = data as { input: string; options: { sort: boolean; deduplicate: boolean; removeEmpty: boolean; reverse: boolean } };
        let lines = input.split('\n');
        if (options.removeEmpty) lines = lines.filter(l => l.trim());
        if (options.deduplicate) lines = [...new Set(lines)];
        if (options.sort) lines.sort((a, b) => a.localeCompare(b));
        if (options.reverse) lines.reverse();
        result = lines.join('\n');
        break;
      }
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
    self.postMessage({ id, type, result });
  } catch (err) {
    self.postMessage({ id, type, result: null, error: (err as Error).message });
  }
};

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') inQuotes = false;
      else current += char;
    } else {
      if (char === '"') inQuotes = true;
      else if (char === delimiter) { result.push(current); current = ''; }
      else current += char;
    }
  }
  result.push(current);
  return result;
}
