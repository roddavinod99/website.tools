"use client";

import { useState, useMemo } from "react";

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  entropy: number;
  crackTime: string;
  charPool: {
    uppercase: number;
    lowercase: number;
    digits: number;
    symbols: number;
    total: number;
  };
  tips: string[];
}

function getCharPool(password: string): { uppercase: number; lowercase: number; digits: number; symbols: number; total: number } {
  let upper = 0, lower = 0, digits = 0, symbols = 0;
  for (const ch of password) {
    if (/[A-Z]/.test(ch)) upper++;
    else if (/[a-z]/.test(ch)) lower++;
    else if (/[0-9]/.test(ch)) digits++;
    else symbols++;
  }
  return { uppercase: upper, lowercase: lower, digits, symbols, total: password.length };
}

function calculateEntropy(password: string): number {
  const pool = getCharPool(password);
  let charsetSize = 0;
  if (pool.uppercase > 0) charsetSize += 26;
  if (pool.lowercase > 0) charsetSize += 26;
  if (pool.digits > 0) charsetSize += 10;
  if (pool.symbols > 0) charsetSize += 33;
  if (charsetSize === 0) return 0;
  return password.length * Math.log2(charsetSize);
}

function estimateCrackTime(entropy: number): string {
  const guessesPerSecond = 1e10;
  const combinations = Math.pow(2, entropy);
  const seconds = combinations / guessesPerSecond / 2;

  if (seconds < 0.001) return "Instant";
  if (seconds < 1) return "Less than a second";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} years`;
  if (seconds < 86400 * 365 * 1e6) return `${Math.round(seconds / (86400 * 365 * 1000))}k years`;
  if (seconds < 86400 * 365 * 1e9) return `${Math.round(seconds / (86400 * 365 * 1e6))}M years`;
  if (seconds < 86400 * 365 * 1e12) return `${Math.round(seconds / (86400 * 365 * 1e9))}B years`;
  return `${(seconds / (86400 * 365 * 1e12)).toExponential(1)} trillion years`;
}

function getStrength(entropy: number): { score: number; label: string; color: string } {
  if (entropy < 28) return { score: 1, label: "Very Weak", color: "bg-red-500" };
  if (entropy < 36) return { score: 2, label: "Weak", color: "bg-orange-500" };
  if (entropy < 60) return { score: 3, label: "Fair", color: "bg-yellow-500" };
  if (entropy < 80) return { score: 4, label: "Strong", color: "bg-green-500" };
  return { score: 5, label: "Very Strong", color: "bg-emerald-600" };
}

function getTips(password: string, pool: { uppercase: number; lowercase: number; digits: number; symbols: number }, entropy: number): string[] {
  const tips: string[] = [];
  if (password.length < 12) tips.push("Use at least 12 characters for better security");
  if (password.length < 8) tips.push("This password is too short — aim for 16+ characters");
  if (pool.uppercase === 0) tips.push("Add uppercase letters (A-Z) to increase entropy");
  if (pool.lowercase === 0) tips.push("Add lowercase letters (a-z) to increase diversity");
  if (pool.digits === 0) tips.push("Add digits (0-9) to expand the character pool");
  if (pool.symbols === 0) tips.push("Add symbols (!@#$%^&*) for maximum character diversity");
  if (/^[a-zA-Z]+$/.test(password)) tips.push("Avoid using only letters — mix in digits and symbols");
  if (/^[0-9]+$/.test(password)) tips.push("Avoid using only numbers — add letters and symbols");
  if (/(.)\1{2,}/.test(password)) tips.push("Avoid repeating characters (e.g., 'aaa', '111')");
  if (/^(password|123456|qwerty|letmein|admin|welcome)/i.test(password)) tips.push("Avoid common passwords and dictionary words");
  if (password.length >= 16 && entropy >= 80) tips.push("Excellent! This password has strong entropy");
  if (tips.length === 0) tips.push("Good password! Consider adding more length for extra security");
  return tips;
}

export function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const result: StrengthResult = useMemo(() => {
    if (!password) {
      return {
        score: 0, label: "Enter a password", color: "bg-surface-300",
        entropy: 0, crackTime: "N/A",
        charPool: { uppercase: 0, lowercase: 0, digits: 0, symbols: 0, total: 0 },
        tips: ["Type a password to see its strength analysis"],
      };
    }
    const pool = getCharPool(password);
    const entropy = calculateEntropy(password);
    const { score, label, color } = getStrength(entropy);
    const crackTime = estimateCrackTime(entropy);
    const tips = getTips(password, pool, entropy);
    return { score, label, color, entropy, crackTime, charPool: pool, tips };
  }, [password]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password to analyse..."
            className="w-full rounded-lg border border-surface-200 bg-white p-3 pr-16 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-500 hover:text-surface-700 dark:text-dark-muted dark:hover:text-dark-text"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-surface-700 dark:text-dark-text">{result.label}</span>
          <span className="text-xs text-surface-500 dark:text-dark-muted">
            {result.score > 0 ? `${result.score}/5` : ""}
          </span>
        </div>
        <div className="h-3 rounded-full bg-surface-200 dark:bg-dark-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${result.color}`}
            style={{ width: `${(result.score / 5) * 100}%` }}
          />
        </div>
      </div>

      {password && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xs text-surface-500 dark:text-dark-muted mb-0.5">Entropy</p>
            <p className="text-lg font-bold font-mono text-surface-900 dark:text-dark-text">
              {result.entropy.toFixed(1)} <span className="text-xs font-normal">bits</span>
            </p>
          </div>
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xs text-surface-500 dark:text-dark-muted mb-0.5">Est. Crack Time</p>
            <p className="text-lg font-bold text-surface-900 dark:text-dark-text break-words">
              {result.crackTime}
            </p>
          </div>
        </div>
      )}

      {password && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-2">Character Pool</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "A-Z", count: result.charPool.uppercase, color: "text-blue-600 dark:text-blue-400" },
              { label: "a-z", count: result.charPool.lowercase, color: "text-green-600 dark:text-green-400" },
              { label: "0-9", count: result.charPool.digits, color: "text-orange-600 dark:text-orange-400" },
              { label: "!@#", count: result.charPool.symbols, color: "text-purple-600 dark:text-purple-400" },
            ].map((item) => (
              <div key={item.label}>
                <p className={`text-lg font-bold font-mono ${item.color}`}>{item.count}</p>
                <p className="text-[10px] text-surface-500 dark:text-dark-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-2">Tips</p>
        <ul className="space-y-1">
          {result.tips.map((tip, i) => (
            <li key={i} className="text-xs text-surface-600 dark:text-dark-text flex items-start gap-1.5">
              <span className="text-brand-500 mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
