"use client";

import { useState, useMemo, useCallback } from "react";

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
const BASE32_MAP: Record<string, number> = {};
for (let i = 0; i < BASE32.length; i++) BASE32_MAP[BASE32[i]!] = i;

function encodeGeohash(lat: number, lng: number, precision: number): string {
  let idx = 0;
  let bit = 0;
  let even = true;
  let hash = "";
  let latMin = -90, latMax = 90;
  let lngMin = -180, lngMax = 180;

  while (hash.length < precision) {
    let mid: number;
    if (even) {
      mid = (lngMin + lngMax) / 2;
      if (lng >= mid) {
        idx = idx * 2 + 1;
        lngMin = mid;
      } else {
        idx = idx * 2;
        lngMax = mid;
      }
    } else {
      mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        idx = idx * 2 + 1;
        latMin = mid;
      } else {
        idx = idx * 2;
        latMax = mid;
      }
    }
    even = !even;
    bit++;
    if (bit === 5) {
      hash += BASE32[idx]!;
      bit = 0;
      idx = 0;
    }
  }
  return hash;
}

interface Decoded {
  lat: number;
  lng: number;
  latErr: number;
  lngErr: number;
  bounds: { latMin: number; latMax: number; lngMin: number; lngMax: number };
}

function decodeGeohash(hash: string): Decoded | null {
  let even = true;
  let latMin = -90, latMax = 90;
  let lngMin = -180, lngMax = 180;

  for (const ch of hash.toLowerCase()) {
    const cd = BASE32_MAP[ch];
    if (cd === undefined) return null;
    for (let mask = 16; mask !== 0; mask >>= 1) {
      if (even) {
        const mid = (lngMin + lngMax) / 2;
        if (cd & mask) lngMin = mid; else lngMax = mid;
      } else {
        const mid = (latMin + latMax) / 2;
        if (cd & mask) latMin = mid; else latMax = mid;
      }
      even = !even;
    }
  }
  const lat = (latMin + latMax) / 2;
  const lng = (lngMin + lngMax) / 2;
  return {
    lat,
    lng,
    latErr: (latMax - latMin) / 2,
    lngErr: (lngMax - lngMin) / 2,
    bounds: { latMin, latMax, lngMin, lngMax },
  };
}

function neighbors(hash: string): Record<string, string> {
  const decoded = decodeGeohash(hash);
  if (!decoded) return {};
  const { lat, lng, latErr, lngErr } = decoded;
  const latStep = latErr * 2;
  const lngStep = lngErr * 2;
  const dirs: Record<string, [number, number]> = {
    n: [lat + latStep, lng],
    s: [lat - latStep, lng],
    e: [lat, lng + lngStep],
    w: [lat, lng - lngStep],
    ne: [lat + latStep, lng + lngStep],
    nw: [lat + latStep, lng - lngStep],
    se: [lat - latStep, lng + lngStep],
    sw: [lat - latStep, lng - lngStep],
  };
  const precision = hash.length;
  const result: Record<string, string> = {};
  for (const [k, [la, lo]] of Object.entries(dirs)) {
    // clamp lat
    const clampedLat = Math.max(-90, Math.min(90, la));
    let clampedLng = lo;
    if (clampedLng > 180) clampedLng -= 360;
    if (clampedLng < -180) clampedLng += 360;
    result[k] = encodeGeohash(clampedLat, clampedLng, precision);
  }
  return result;
}

export function GeohashTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [latStr, setLatStr] = useState("37.7749");
  const [lngStr, setLngStr] = useState("-122.4194");
  const [precision, setPrecision] = useState(7);
  const [hashInput, setHashInput] = useState("9q8yyk8");
  const [copied, setCopied] = useState("");

  const lat = useMemo(() => parseFloat(latStr), [latStr]);
  const lng = useMemo(() => parseFloat(lngStr), [lngStr]);
  const isValidLatLng = useMemo(() => !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180, [lat, lng]);

  const encoded = useMemo(() => {
    if (!isValidLatLng) return "";
    try {
      return encodeGeohash(lat, lng, precision);
    } catch {
      return "";
    }
  }, [lat, lng, precision, isValidLatLng]);

  const decoded = useMemo(() => {
    if (!hashInput.trim()) return null;
    return decodeGeohash(hashInput.trim());
  }, [hashInput]);

  const neighborMap = useMemo(() => {
    if (!hashInput.trim() || !decoded) return null;
    return neighbors(hashInput.trim());
  }, [hashInput, decoded]);

  const copy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const errorEncode = useMemo(() => {
    if (!latStr || !lngStr) return "";
    if (isNaN(lat) || isNaN(lng)) return "Latitude and longitude must be numbers";
    if (lat < -90 || lat > 90) return "Latitude must be between -90 and 90";
    if (lng < -180 || lng > 180) return "Longitude must be between -180 and 180";
    return "";
  }, [lat, lng, latStr, lngStr]);

  const errorDecode = useMemo(() => {
    if (!hashInput.trim()) return "";
    if (!decoded) return "Invalid geohash — must contain only base32 chars: 0-9, b-h, j-k, m-n, p-z (no a,i,l,o)";
    return "";
  }, [hashInput, decoded]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("encode")}
          aria-label="Switch to encode mode"
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${mode === "encode" ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text"}`}
        >
          Encode
        </button>
        <button
          onClick={() => setMode("decode")}
          aria-label="Switch to decode mode"
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${mode === "decode" ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text"}`}
        >
          Decode
        </button>
      </div>

      {mode === "encode" ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-700 dark:text-dark-text mb-1">Latitude (-90 to 90)</label>
              <input value={latStr} onChange={(e) => setLatStr(e.target.value)} aria-label="Latitude" placeholder="37.7749" className="w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-700 dark:text-dark-text mb-1">Longitude (-180 to 180)</label>
              <input value={lngStr} onChange={(e) => setLngStr(e.target.value)} aria-label="Longitude" placeholder="-122.4194" className="w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 dark:text-dark-text mb-1">Precision: {precision} (1–12)</label>
            <input type="range" min={1} max={12} value={precision} onChange={(e) => setPrecision(parseInt(e.target.value, 10))} aria-label="Precision" className="w-full accent-brand-500" />
            <div className="flex justify-between text-[11px] text-surface-400 dark:text-dark-muted"><span>1 (±2500km)</span><span>12 (±0.04m)</span></div>
          </div>

          {errorEncode && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">{errorEncode}</div>}

          {encoded && (
            <div data-testid="tool-output" className="rounded-md border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Geohash</span>
                <button onClick={() => copy(encoded, "hash")} aria-label="Copy geohash" className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600">{copied === "hash" ? "Copied!" : "Copy"}</button>
              </div>
              <code className="block text-lg font-mono font-bold text-surface-900 dark:text-dark-text select-all">{encoded}</code>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="rounded bg-white p-2 dark:bg-dark-bg"><span className="text-surface-500 dark:text-dark-muted">Lat</span><br /><span className="text-surface-900 dark:text-dark-text">{lat.toFixed(6)}</span></div>
                <div className="rounded bg-white p-2 dark:bg-dark-bg"><span className="text-surface-500 dark:text-dark-muted">Lng</span><br /><span className="text-surface-900 dark:text-dark-text">{lng.toFixed(6)}</span></div>
              </div>
              {/* map placeholder */}
              <div className="rounded-md border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-bg">
                <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-1">Map placeholder</p>
                <div className="flex items-center justify-center rounded bg-surface-100 p-6 dark:bg-dark-surface">
                  <div className="text-center">
                    <div className="mx-auto h-3 w-3 rounded-full bg-brand-500" />
                    <p className="mt-1 text-xs font-mono text-surface-600 dark:text-dark-muted">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
                    <p className="text-[11px] text-surface-400 dark:text-dark-muted">{encoded}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-1">
                  <button onClick={() => copy(`${lat}, ${lng}`, "coords")} aria-label="Copy coordinates" className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">Copy lat,lng</button>
                  <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`} target="_blank" rel="noopener noreferrer" className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">Open OSM</a>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-surface-700 dark:text-dark-text mb-1">Geohash</label>
            <input value={hashInput} onChange={(e) => setHashInput(e.target.value)} aria-label="Geohash input" placeholder="9q8yyk8" className="w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>

          {errorDecode && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">{errorDecode}</div>}

          {decoded && neighborMap && (
            <div data-testid="tool-output" className="space-y-3 rounded-md border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="rounded bg-white p-2 dark:bg-dark-bg space-y-1">
                  <p className="text-surface-500 dark:text-dark-muted">Center</p>
                  <p className="text-surface-900 dark:text-dark-text font-bold">{decoded.lat.toFixed(6)}, {decoded.lng.toFixed(6)}</p>
                  <p className="text-surface-500 dark:text-dark-muted">± {decoded.latErr.toFixed(6)} lat, ± {decoded.lngErr.toFixed(6)} lng</p>
                  <button onClick={() => copy(`${decoded.lat}, ${decoded.lng}`, "center")} aria-label="Copy center coordinates" className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">{copied === "center" ? "Copied!" : "Copy"}</button>
                </div>
                <div className="rounded bg-white p-2 dark:bg-dark-bg space-y-1">
                  <p className="text-surface-500 dark:text-dark-muted">Bounds</p>
                  <p className="text-surface-900 dark:text-dark-text">Lat {decoded.bounds.latMin.toFixed(6)} → {decoded.bounds.latMax.toFixed(6)}</p>
                  <p className="text-surface-900 dark:text-dark-text">Lng {decoded.bounds.lngMin.toFixed(6)} → {decoded.bounds.lngMax.toFixed(6)}</p>
                </div>
              </div>

              <div className="rounded bg-white p-3 dark:bg-dark-bg">
                <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-2">Neighbors (8)</p>
                <div className="grid grid-cols-3 gap-1 text-xs font-mono">
                  <button onClick={() => copy(neighborMap.nw ?? "", "nw")} aria-label="Copy nw neighbor" className="rounded border border-surface-200 p-1.5 hover:bg-surface-50 dark:border-dark-border dark:hover:bg-dark-surface" title={neighborMap.nw}><span className="text-surface-500 dark:text-dark-muted">NW</span><br /><span className="text-surface-900 dark:text-dark-text">{neighborMap.nw}</span></button>
                  <button onClick={() => copy(neighborMap.n ?? "", "n")} aria-label="Copy n neighbor" className="rounded border border-surface-200 p-1.5 hover:bg-surface-50 dark:border-dark-border dark:hover:bg-dark-surface" title={neighborMap.n}><span className="text-surface-500 dark:text-dark-muted">N</span><br /><span className="text-surface-900 dark:text-dark-text">{neighborMap.n}</span></button>
                  <button onClick={() => copy(neighborMap.ne ?? "", "ne")} aria-label="Copy ne neighbor" className="rounded border border-surface-200 p-1.5 hover:bg-surface-50 dark:border-dark-border dark:hover:bg-dark-surface" title={neighborMap.ne}><span className="text-surface-500 dark:text-dark-muted">NE</span><br /><span className="text-surface-900 dark:text-dark-text">{neighborMap.ne}</span></button>
                  <button onClick={() => copy(neighborMap.w ?? "", "w")} aria-label="Copy w neighbor" className="rounded border border-surface-200 p-1.5 hover:bg-surface-50 dark:border-dark-border dark:hover:bg-dark-surface" title={neighborMap.w}><span className="text-surface-500 dark:text-dark-muted">W</span><br /><span className="text-surface-900 dark:text-dark-text">{neighborMap.w}</span></button>
                  <div className="rounded bg-brand-50 p-1.5 text-center dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800"><span className="text-brand-600 dark:text-brand-400">● Center</span><br /><span className="text-surface-900 dark:text-dark-text">{hashInput}</span></div>
                  <button onClick={() => copy(neighborMap.e ?? "", "e")} aria-label="Copy e neighbor" className="rounded border border-surface-200 p-1.5 hover:bg-surface-50 dark:border-dark-border dark:hover:bg-dark-surface" title={neighborMap.e}><span className="text-surface-500 dark:text-dark-muted">E</span><br /><span className="text-surface-900 dark:text-dark-text">{neighborMap.e}</span></button>
                  <button onClick={() => copy(neighborMap.sw ?? "", "sw")} aria-label="Copy sw neighbor" className="rounded border border-surface-200 p-1.5 hover:bg-surface-50 dark:border-dark-border dark:hover:bg-dark-surface" title={neighborMap.sw}><span className="text-surface-500 dark:text-dark-muted">SW</span><br /><span className="text-surface-900 dark:text-dark-text">{neighborMap.sw}</span></button>
                  <button onClick={() => copy(neighborMap.s ?? "", "s")} aria-label="Copy s neighbor" className="rounded border border-surface-200 p-1.5 hover:bg-surface-50 dark:border-dark-border dark:hover:bg-dark-surface" title={neighborMap.s}><span className="text-surface-500 dark:text-dark-muted">S</span><br /><span className="text-surface-900 dark:text-dark-text">{neighborMap.s}</span></button>
                  <button onClick={() => copy(neighborMap.se ?? "", "se")} aria-label="Copy se neighbor" className="rounded border border-surface-200 p-1.5 hover:bg-surface-50 dark:border-dark-border dark:hover:bg-dark-surface" title={neighborMap.se}><span className="text-surface-500 dark:text-dark-muted">SE</span><br /><span className="text-surface-900 dark:text-dark-text">{neighborMap.se}</span></button>
                </div>
              </div>

              <div className="rounded-md border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-bg">
                <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-1">Map placeholder</p>
                <div className="flex items-center justify-center rounded bg-surface-100 p-4 dark:bg-dark-surface">
                  <div className="text-center">
                    <div className="mx-auto h-3 w-3 rounded-full bg-brand-500" />
                    <p className="mt-1 text-xs font-mono text-surface-600 dark:text-dark-muted">{decoded.lat.toFixed(4)}, {decoded.lng.toFixed(4)}</p>
                    <p className="text-[11px] text-surface-400 dark:text-dark-muted">{hashInput}</p>
                    <p className="text-[11px] text-surface-400 dark:text-dark-muted">±{decoded.latErr.toFixed(4)}°, ±{decoded.lngErr.toFixed(4)}°</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <p className="text-[11px] text-surface-400 dark:text-dark-muted">Geohash base32 encoding — all calculations done client-side. Precision controls cell size (1 = world /32, 12 = ±0.04m).</p>
    </div>
  );
}
