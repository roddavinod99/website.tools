export interface DpiInfo {
  dpi: number;
  units: "inch" | "cm" | "meter" | "none";
}

function readU16BE(view: DataView, offset: number): number {
  return view.getUint16(offset, false);
}

function readU32BE(view: DataView, offset: number): number {
  return view.getUint32(offset, false);
}

export function detectDpiFromBuffer(buffer: ArrayBuffer): DpiInfo {
  const view = new DataView(buffer);
  if (buffer.byteLength < 12) return { dpi: 72, units: "none" };

  if (view.getUint8(0) === 0xff && view.getUint8(1) === 0xd8) {
    let offset = 2;
    while (offset + 4 <= buffer.byteLength) {
      if (view.getUint8(offset) !== 0xff) break;
      const marker = view.getUint8(offset + 1);
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      if (offset + 4 > buffer.byteLength) break;
      const length = readU16BE(view, offset + 2);
      if (marker === 0xe0 && length >= 16 && offset + 16 <= buffer.byteLength) {
        const jfif = String.fromCharCode(
          view.getUint8(offset + 4),
          view.getUint8(offset + 5),
          view.getUint8(offset + 6),
          view.getUint8(offset + 7),
          view.getUint8(offset + 8)
        );
        if (jfif === "JFIF") {
          const units = view.getUint8(offset + 9);
          const x = readU16BE(view, offset + 10);
          const y = readU16BE(view, offset + 12);
          if (units === 1 && x > 0 && y > 0) return { dpi: Math.round((x + y) / 2), units: "inch" };
          if (units === 2 && x > 0 && y > 0) {
            return { dpi: Math.round((x + y) / 2 * 2.54), units: "cm" };
          }
        }
        return { dpi: 72, units: "none" };
      }
      offset += 2 + length;
    }
    return { dpi: 72, units: "none" };
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  let isPng = true;
  for (let i = 0; i < 8; i++) {
    if (view.getUint8(i) !== pngSignature[i]) { isPng = false; break; }
  }
  if (isPng) {
    let offset = 8;
    while (offset + 8 <= buffer.byteLength) {
      const length = readU32BE(view, offset);
      const type = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7)
      );
      if (type === "pHYs" && length >= 9 && offset + 8 + length <= buffer.byteLength) {
        const ppuX = readU32BE(view, offset + 8);
        const unit = view.getUint8(offset + 8 + 8);
        if (unit === 1 && ppuX > 0) {
          const dpi = ppuX * 0.0254;
          if (dpi >= 1 && dpi <= 100000) return { dpi: Math.round(dpi), units: "meter" };
        }
        break;
      }
      offset += 12 + length;
    }
    return { dpi: 72, units: "none" };
  }

  return { dpi: 72, units: "none" };
}

export async function setJpegDpi(blob: Blob, dpi: number): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  const view = new DataView(buffer);
  if (buffer.byteLength < 4 || view.getUint8(0) !== 0xff || view.getUint8(1) !== 0xd8) {
    return blob;
  }
  let offset = 2;
  while (offset + 4 <= buffer.byteLength) {
    if (view.getUint8(offset) !== 0xff) return blob;
    const marker = view.getUint8(offset + 1);
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = readU16BE(view, offset + 2);
    if (marker === 0xe0 && length >= 16) {
      const jfif = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7),
        view.getUint8(offset + 8)
      );
      if (jfif === "JFIF") {
        view.setUint8(offset + 9, 1);
        view.setUint16(offset + 10, dpi, false);
        view.setUint16(offset + 12, dpi, false);
        return new Blob([buffer], { type: "image/jpeg" });
      }
    }
    offset += 2 + length;
  }
  return blob;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function deflateRaw(data: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream === "undefined") return null;
  try {
    const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream("deflate-raw"));
    const result = await new Response(stream).arrayBuffer();
    return new Uint8Array(result);
  } catch {
    return null;
  }
}

export async function buildZip(files: { name: string; data: Uint8Array }[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    let compData = await deflateRaw(file.data);
    let method = 8;
    if (!compData || compData.length >= file.data.length) {
      compData = file.data;
      method = 0;
    }
    const crc = crc32(file.data);

    const localHeader = new DataView(new ArrayBuffer(30));
    localHeader.setUint32(0, 0x04034b50, true);
    localHeader.setUint16(4, 20, true);
    localHeader.setUint16(6, 0, true);
    localHeader.setUint16(8, method, true);
    localHeader.setUint16(10, 0, true);
    localHeader.setUint16(12, 0, true);
    localHeader.setUint32(14, crc, true);
    localHeader.setUint32(18, compData.length, true);
    localHeader.setUint32(22, file.data.length, true);
    localHeader.setUint16(26, nameBytes.length, true);
    localHeader.setUint16(28, 0, true);

    chunks.push(new Uint8Array(localHeader.buffer), nameBytes, compData);

    const centralHeader = new DataView(new ArrayBuffer(46));
    centralHeader.setUint32(0, 0x02014b50, true);
    centralHeader.setUint16(4, 20, true);
    centralHeader.setUint16(6, 20, true);
    centralHeader.setUint16(8, 0, true);
    centralHeader.setUint16(10, method, true);
    centralHeader.setUint16(12, 0, true);
    centralHeader.setUint16(14, 0, true);
    centralHeader.setUint32(16, crc, true);
    centralHeader.setUint32(20, compData.length, true);
    centralHeader.setUint32(24, file.data.length, true);
    centralHeader.setUint16(28, nameBytes.length, true);
    centralHeader.setUint16(30, 0, true);
    centralHeader.setUint16(32, 0, true);
    centralHeader.setUint16(34, 0, true);
    centralHeader.setUint16(36, 0, true);
    centralHeader.setUint32(38, 0, true);
    centralHeader.setUint32(42, offset, true);

    central.push(new Uint8Array(centralHeader.buffer), nameBytes);
    offset += 30 + nameBytes.length + compData.length;
  }

  let centralSize = 0;
  for (const c of central) centralSize += c.length;

  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(4, 0, true);
  eocd.setUint16(6, 0, true);
  eocd.setUint16(8, files.length, true);
  eocd.setUint16(10, files.length, true);
  eocd.setUint32(12, centralSize, true);
  eocd.setUint32(16, offset, true);
  eocd.setUint16(20, 0, true);

  const all: Uint8Array[] = [...chunks, ...central, new Uint8Array(eocd.buffer)];
  const total = all.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const c of all) {
    out.set(c, pos);
    pos += c.length;
  }
  return new Blob([out], { type: "application/zip" });
}
