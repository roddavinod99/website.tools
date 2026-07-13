const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const MAX_FILE_COUNT = 20;
const MAX_DECOMPRESSED_SIZE = 100 * 1024 * 1024;
const MAX_COMPRESSION_RATIO = 10;
const MAX_ENTRY_COUNT = 1000;
const ZIP_SIGNATURES = [
  [0x50, 0x4B, 0x03, 0x04],
  [0x50, 0x4B, 0x05, 0x06],
  [0x50, 0x4B, 0x06, 0x07],
];

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "text/plain",
  "text/csv",
  "text/css",
  "text/html",
  "text/markdown",
  "application/json",
  "application/xml",
  "application/pdf",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const ALLOWED_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "webp", "gif", "svg",
  "txt", "csv", "css", "html", "htm", "md", "markdown",
  "json", "xml", "pdf",
  "zip", "docx", "xlsx", "pptx",
  "pem", "crt", "cert",
  "morse",
]);

const MAGIC_BYTES: Array<{ offset: number; bytes: number[]; mime: string }> = [
  { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47], mime: "image/png" },
  { offset: 0, bytes: [0xFF, 0xD8, 0xFF], mime: "image/jpeg" },
  { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46], mime: "image/webp" },
  { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38], mime: "image/gif" },
  { offset: 0, bytes: [0x50, 0x4B, 0x03, 0x04], mime: "application/zip" },
  { offset: 0, bytes: [0x25, 0x50, 0x44, 0x46], mime: "application/pdf" },
];

const BLOCKED_EXTENSIONS = new Set([
  "exe", "bat", "cmd", "com", "msi", "scr", "pif",
  "sh", "bash", "zsh", "csh", "ksh",
  "php", "php3", "php4", "php5", "php7", "php8", "phtml",
  "jsp", "jspx", "asp", "aspx", "cer", "cfm", "cgi", "pl", "py", "rb",
  "js", "mjs", "cjs", "ts", "jsx", "tsx",
  "vbs", "vbe", "wsf", "wsh",
  "ps1", "psm1", "psd1",
  "dll", "so", "dylib", "bin", "elf", "class",
  "doc", "docm", "xls", "xlsm", "ppt", "pptm",
  "iso", "img", "vmdk", "vdi",
  "jar", "war", "ear", "apk", "deb", "rpm",
]);

export interface FileSecurityResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function validateFileSize(file: File, maxSize: number = MAX_FILE_SIZE): FileSecurityResult {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File exceeds maximum allowed size.",
    };
  }
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty.",
    };
  }
  return { valid: true };
}

export function validateFileType(file: File): FileSecurityResult {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: "File type not allowed.",
    };
  }
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      warning: `File extension ".${ext}" is not in the standard allowlist.`,
      error: "File type not supported.",
    };
  }
  return { valid: true };
}

export async function validateMagicBytes(file: File): Promise<FileSecurityResult> {
  if (file.size < 4) {
    return { valid: true };
  }
  const header = await file.slice(0, 16).arrayBuffer();
  const bytes = new Uint8Array(header);
  for (const sig of MAGIC_BYTES) {
    const match = sig.bytes.every((b, i) => bytes[sig.offset + i] === b);
    if (match && file.type && file.type !== sig.mime && !file.type.startsWith(sig.mime)) {
      return {
        valid: false,
        warning: `File content does not match declared type.`,
      };
    }
  }
  return { valid: true };
}

export function validateMultipleFiles(
  files: File[],
  options: { maxFileSize?: number; maxTotalSize?: number; maxCount?: number } = {}
): FileSecurityResult {
  const { maxFileSize = MAX_FILE_SIZE, maxTotalSize = MAX_TOTAL_SIZE, maxCount = MAX_FILE_COUNT } = options;

  if (files.length === 0) {
    return { valid: false, error: "No files selected." };
  }

  if (files.length > maxCount) {
    return {
      valid: false,
      error: "Too many files selected.",
    };
  }

  let totalSize = 0;
  for (const file of files) {
    const sizeResult = validateFileSize(file, maxFileSize);
    if (!sizeResult.valid) return sizeResult;
    const typeResult = validateFileType(file);
    if (!typeResult.valid) return typeResult;
    totalSize += file.size;
  }

  if (totalSize > maxTotalSize) {
    return {
      valid: false,
      error: "Total file size exceeds the limit.",
    };
  }

  return { valid: true };
}

function hasZipSignature(data: ArrayBuffer): boolean {
  if (data.byteLength < 4) return false;
  const bytes = new Uint8Array(data.slice(0, 4));
  return ZIP_SIGNATURES.some((sig) => sig.every((b, i) => bytes[i] === b));
}

function readZipEntrySizes(data: ArrayBuffer): { uncompressed: number; compressed: number; count: number } {
  const view = new DataView(data);
  let offset = 0;
  let uncompressed = 0;
  let compressed = 0;
  let count = 0;

  while (offset + 30 <= data.byteLength) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034B50) break;

    const compMethod = view.getUint16(offset + 8, true);
    const compSize = view.getUint32(offset + 18, true);
    const uncompSize = view.getUint32(offset + 22, true);
    const fnameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);

    if (compMethod === 0) {
      uncompressed += uncompSize;
      compressed += uncompSize;
    } else {
      uncompressed += uncompSize;
      compressed += compSize;
    }

    count++;
    offset += 30 + fnameLen + extraLen + compSize;

    if (count > MAX_ENTRY_COUNT) {
      return { uncompressed, compressed, count };
    }
  }

  return { uncompressed, compressed, count };
}

export async function detectZipBomb(file: File): Promise<FileSecurityResult> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const isZipLike = ext === "zip" || ext === "jar" || ext === "war" || ext === "ear" || ext === "apk" || ext === "docx" || ext === "xlsx" || ext === "pptx";

  if (!isZipLike) {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: "File exceeds maximum allowed size.",
      };
    }
    return { valid: true };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File exceeds maximum allowed size.",
    };
  }

  const headerBuf = await file.slice(0, Math.min(file.size, 65536)).arrayBuffer();

  if (!hasZipSignature(headerBuf)) {
    return { valid: true };
  }

  const headerBytes = new Uint8Array(headerBuf);
  if (headerBytes.length >= 30) {
    const view = new DataView(headerBuf);
    const version = view.getUint16(4, true);
    if (version > 100) {
      return {
        valid: false,
        error: "Archive format not supported.",
      };
    }
  }

  try {
    const fullBuf = await file.arrayBuffer();
    const { uncompressed, compressed, count } = readZipEntrySizes(fullBuf);

    if (count === 0) {
      return { valid: true };
    }

    if (uncompressed > MAX_DECOMPRESSED_SIZE) {
      return {
        valid: false,
        error: "Archive exceeds maximum decompressed size.",
      };
    }

    if (compressed > 0) {
      const ratio = uncompressed / compressed;
      if (ratio > MAX_COMPRESSION_RATIO) {
        return {
          valid: false,
          error: "Suspicious compression ratio detected.",
        };
      }
    }

    if (count > MAX_ENTRY_COUNT) {
      return {
        valid: false,
        error: "Archive contains too many entries.",
      };
    }
  } catch {
    return {
      warning: "Could not fully analyze archive. Proceeding with caution.",
      valid: true,
    };
  }

  return { valid: true };
}

export async function validateFileUpload(file: File): Promise<FileSecurityResult> {
  if (file.size === 0) {
    return { valid: false, error: "File is empty." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File exceeds maximum allowed size.",
    };
  }
  const typeResult = validateFileType(file);
  if (!typeResult.valid) return typeResult;
  const magicResult = await validateMagicBytes(file);
  if (magicResult.warning) return { valid: false, error: magicResult.warning };
  return detectZipBomb(file);
}

export async function validateFileUploads(
  files: File[],
  options: { maxFileSize?: number; maxTotalSize?: number; maxCount?: number } = {}
): Promise<FileSecurityResult> {
  const { maxFileSize = MAX_FILE_SIZE, maxTotalSize = MAX_TOTAL_SIZE, maxCount = MAX_FILE_COUNT } = options;

  if (files.length === 0) {
    return { valid: false, error: "No files selected." };
  }

  if (files.length > maxCount) {
    return {
      valid: false,
      error: "Too many files selected.",
    };
  }

  let totalSize = 0;
  for (const file of files) {
    if (file.size === 0) {
      return { valid: false, error: "File is empty." };
    }
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: "File exceeds maximum allowed size.",
      };
    }
    const typeResult = validateFileType(file);
    if (!typeResult.valid) return typeResult;
    totalSize += file.size;

    const zipResult = await detectZipBomb(file);
    if (!zipResult.valid) return zipResult;
  }

  if (totalSize > maxTotalSize) {
    return {
      valid: false,
      error: "Total file size exceeds the limit.",
    };
  }

  return { valid: true };
}

export {
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  MAX_FILE_COUNT,
  MAX_DECOMPRESSED_SIZE,
  MAX_COMPRESSION_RATIO,
  MAX_ENTRY_COUNT,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  BLOCKED_EXTENSIONS,
};
