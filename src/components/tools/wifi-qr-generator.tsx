"use client";

import { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";

type Encryption = "nopass" | "WPA" | "WEP" | "WPA2-EAP";

export function WifiQRGenerator() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState<Encryption>("WPA");
  const [hidden, setHidden] = useState(false);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [eapMethod, setEapMethod] = useState("PEAP");
  const [eapPhase2, setEapPhase2] = useState("MSCHAPV2");
  const [identity, setIdentity] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const escapeWifiString = (str: string) => str.replace(/([\\;,:"])/g, "\\$1");

  const buildWifiString = useCallback(() => {
    const escapedSsid = escapeWifiString(ssid);
    let str = `WIFI:S:${escapedSsid};T:${encryption === "nopass" ? "nopass" : encryption};`;
    if (encryption !== "nopass") {
      if (encryption === "WPA2-EAP") {
        if (password) str += `P:${escapeWifiString(password)};`;
        if (eapMethod) str += `E:${eapMethod};`;
        if (eapPhase2 && eapPhase2 !== "None") str += `PH2:${eapPhase2};`;
        if (identity) str += `I:${escapeWifiString(identity)};`;
        if (anonymous) str += "A:anon;";
      } else {
        str += `P:${escapeWifiString(password)};`;
      }
    }
    if (hidden) str += "H:true;";
    str += ";";
    return str;
  }, [ssid, password, encryption, hidden, eapMethod, eapPhase2, identity, anonymous]);

  const generateQR = useCallback(async () => {
    if (!ssid || !canvasRef.current) return;
    const canvas = canvasRef.current;
    try {
      await QRCode.toCanvas(canvas, buildWifiString(), {
        width: 300,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: "M",
      });
    } catch { /* ignore */ }
  }, [ssid, buildWifiString, fgColor, bgColor]);

  const download = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.download = `wifi-${ssid || "network"}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Network Name (SSID)</label>
          <input type="text" value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="MyWiFiNetwork"
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Encryption</label>
          <select value={encryption} onChange={(e) => setEncryption(e.target.value as Encryption)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="nopass">None (Open)</option><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="WPA2-EAP">WPA2-EAP</option>
          </select>
        </div>
        {encryption !== "nopass" && encryption !== "WPA2-EAP" && (
          <div>
            <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Password</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="WiFi password"
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
        )}
        <label className="flex items-center gap-2 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} className="rounded border-surface-300" /> Hidden network
        </label>
      </div>

      {encryption === "WPA2-EAP" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface">
          <div>
            <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">EAP Method</label>
            <select value={eapMethod} onChange={(e) => setEapMethod(e.target.value)}
              className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              {["PEAP","TLS","TTLS","PWD","SIM","AKA","AKA'"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Phase 2</label>
            <select value={eapPhase2} onChange={(e) => setEapPhase2(e.target.value)}
              className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              {["MSCHAPV2","GTC","TLS","MD5","NONE"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Identity</label>
            <input type="text" value={identity} onChange={(e) => setIdentity(e.target.value)}
              className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
          <label className="flex items-center gap-2 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="rounded border-surface-300" /> Anonymous identity
          </label>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Foreground</label>
          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Background</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button onClick={generateQR} disabled={!ssid} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50">Generate QR Code</button>
        <canvas ref={canvasRef} className="rounded-lg border border-surface-200 dark:border-dark-border" />
        <button onClick={download} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download QR Code</button>
      </div>
    </div>
  );
}
