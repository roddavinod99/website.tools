"use client";

import { useState, useMemo, useCallback } from "react";

const CATEGORIES: Record<string, string[]> = {
  Smileys: [
    "\u{1F600}", "\u{1F603}", "\u{1F604}", "\u{1F601}", "\u{1F606}",
    "\u{1F605}", "\u{1F602}", "\u{1F923}", "\u{1F60A}", "\u{1F607}",
    "\u{1F642}", "\u{1F643}", "\u{1F609}", "\u{1F608}", "\u{1F60E}",
    "\u{1F917}", "\u{1F914}", "\u{1F610}", "\u{1F611}", "\u{1F636}",
    "\u{1F60F}", "\u{1F62C}", "\u{1F912}", "\u{1F92D}", "\u{1F911}",
    "\u{1F61B}", "\u{1F61C}", "\u{1F92A}", "\u{1F61D}", "\u{1F910}",
    "\u{1F928}", "\u{1F612}", "\u{1F644}", "\u{1F62E}", "\u{1F62F}",
    "\u{1F632}", "\u{1F633}", "\u{1F970}", "\u{1F60B}", "\u{1F61E}",
    "\u{1F614}", "\u{1F61A}", "\u{1F620}", "\u{1F621}", "\u{1F624}",
    "\u{1F625}", "\u{1F622}", "\u{1F62D}", "\u{1F631}", "\u{1F630}",
    "\u{1F628}", "\u{1F623}", "\u{1F629}", "\u{1F62A}", "\u{1F62B}",
    "\u{1F634}", "\u{1F63A}", "\u{1F975}", "\u{1F976}", "\u{1F97A}",
    "\u{1F973}", "\u{1F60C}", "\u{1F913}", "\u{1F618}", "\u{1F619}",
    "\u{1F61F}", "\u{1F91D}", "\u{1F616}", "\u{1F626}", "\u{1F627}",
  ],
  People: [
    "\u{1F44D}", "\u{1F44E}", "\u{1F44B}", "\u{1F44F}", "\u{1F64C}",
    "\u{1F450}", "\u{1F64F}", "\u{1F44C}", "\u{1F90C}", "\u{1F90F}",
    "\u{270A}", "\u{1F44A}", "\u{1F91C}", "\u{1F91B}", "\u{1F448}",
    "\u{1F449}", "\u{1F446}", "\u{1F447}", "\u{1F440}", "\u{1F443}",
    "\u{1F445}", "\u{1F444}", "\u{1F911}", "\u{1F48B}", "\u{1F48C}",
    "\u{1F590}", "\u{1FA71}", "\u{1FA72}", "\u{1FA70}", "\u{1F9B4}",
    "\u{1F9B5}", "\u{1F9B6}", "\u{1F9B7}", "\u{1F9B8}", "\u{1F9B9}",
    "\u{1F9BA}", "\u{1F9BB}", "\u{1F91E}", "\u{1F91F}", "\u{1FAF0}",
    "\u{1FAF1}", "\u{1FAF2}", "\u{1FAF3}", "\u{1FAF4}", "\u{1FAF5}",
  ],
  Animals: [
    "\u{1F436}", "\u{1F431}", "\u{1F42D}", "\u{1F439}", "\u{1F430}",
    "\u{1F43B}", "\u{1F437}", "\u{1F428}", "\u{1F42F}", "\u{1F43E}",
    "\u{1F437}", "\u{1F42A}", "\u{1F42B}", "\u{1F40D}", "\u{1F422}",
    "\u{1F400}", "\u{1F43F}", "\u{1F407}", "\u{1F408}", "\u{1F42F}",
    "\u{1F43C}", "\u{1F43D}", "\u{1F42E}", "\u{1F417}", "\u{1F434}",
    "\u{1F984}", "\u{1F41D}", "\u{1F41B}", "\u{1F40C}", "\u{1F98B}",
    "\u{1F41A}", "\u{1F419}", "\u{1F420}", "\u{1F41F}", "\u{1F42C}",
    "\u{1F433}", "\u{1F40A}", "\u{1F406}", "\u{1F405}", "\u{1F418}",
    "\u{1F412}", "\u{1F414}", "\u{1F427}", "\u{1F425}", "\u{1F423}",
    "\u{1F54A}", "\u{1F413}", "\u{1F424}", "\u{1F40B}", "\u{1F41E}",
  ],
  Food: [
    "\u{1F34E}", "\u{1F34A}", "\u{1F34B}", "\u{1F34C}", "\u{1F349}",
    "\u{1F347}", "\u{1F353}", "\u{1FAD0}", "\u{1F95D}", "\u{1F336}",
    "\u{1F33D}", "\u{1F344}", "\u{1F9C5}", "\u{1F9C6}", "\u{1F954}",
    "\u{1F955}", "\u{1F33F}", "\u{1F96A}", "\u{1F32E}", "\u{1F32F}",
    "\u{1F354}", "\u{1F355}", "\u{1F35D}", "\u{1F35C}", "\u{1F35B}",
    "\u{1F35A}", "\u{1F359}", "\u{1F358}", "\u{1F357}", "\u{1F356}",
    "\u{1F35F}", "\u{1F363}", "\u{1F370}", "\u{1F36B}", "\u{1F36C}",
    "\u{1F366}", "\u{1F37B}", "\u{1F378}", "\u{1F37A}", "\u{1F375}",
    "\u{1F9C3}", "\u{2615}", "\u{1F964}", "\u{1F9C2}", "\u{1F371}",
    "\u{1F372}", "\u{1F958}", "\u{1F959}", "\u{1F95E}", "\u{1F9C7}",
  ],
  Travel: [
    "\u{1F3E0}", "\u{1F3E2}", "\u{1F3E5}", "\u{1F3EB}", "\u{1F3EC}",
    "\u{1F3EF}", "\u{1F3F0}", "\u{1F302}", "\u{2602}", "\u{26F2}",
    "\u{1F305}", "\u{1F304}", "\u{1F307}", "\u{1F309}", "\u{1F306}",
    "\u{1F308}", "\u{1F30A}", "\u{26F5}", "\u{1F6F4}", "\u{1F6F5}",
    "\u{1F6F6}", "\u{1F682}", "\u{1F683}", "\u{1F684}", "\u{1F685}",
    "\u{1F686}", "\u{1F687}", "\u{1F689}", "\u{1F68A}", "\u{1F68C}",
    "\u{1F691}", "\u{1F692}", "\u{1F695}", "\u{1F697}", "\u{1F699}",
    "\u{1F6F2}", "\u{1F680}", "\u{1F6F0}", "\u{1F3AF}", "\u{1F3C6}",
    "\u{1F3C5}", "\u{1F3C3}", "\u{1F3C4}", "\u{1F3CA}", "\u{1F3C8}",
  ],
  Activities: [
    "\u{1F3A8}", "\u{1F3AC}", "\u{1F3AD}", "\u{1F3AE}", "\u{1F3AF}",
    "\u{1F3B0}", "\u{1F3B1}", "\u{1F3B2}", "\u{1F3B3}", "\u{1F3B5}",
    "\u{1F3B6}", "\u{1F3B7}", "\u{1F3B8}", "\u{1F3B9}", "\u{1F3BA}",
    "\u{1F3BB}", "\u{1F3BC}", "\u{1F3BD}", "\u{1F3BE}", "\u{1F3BF}",
    "\u{1F3C0}", "\u{26BD}", "\u{1F3C9}", "\u{26BE}", "\u{1F3C8}",
    "\u{26BE}", "\u{1F3CF}", "\u{1F3D0}", "\u{1F3D1}", "\u{1F3D2}",
    "\u{1F3D3}", "\u{1F3D4}", "\u{1F3D5}", "\u{1F3D6}", "\u{1F3D7}",
    "\u{26F7}", "\u{26F8}", "\u{26F9}", "\u{1F3C4}", "\u{1F3CA}",
    "\u{1F938}", "\u{1F93C}", "\u{1F93D}", "\u{1F93E}", "\u{1FA70}",
  ],
  Objects: [
    "\u{1F4A1}", "\u{1F526}", "\u{1F4EE}", "\u{1F4E6}", "\u{1F4E4}",
    "\u{1F4F0}", "\u{1F4F1}", "\u{1F4F2}", "\u{1F4BB}", "\u{1F4BD}",
    "\u{1F4BE}", "\u{1F4BF}", "\u{1F4C0}", "\u{1F4DA}", "\u{1F4D6}",
    "\u{1F4D5}", "\u{1F4D7}", "\u{1F4D8}", "\u{1F4D9}", "\u{1F4DC}",
    "\u{1F4DD}", "\u{1F4DE}", "\u{1F4DF}", "\u{1F4E0}", "\u{1F4E1}",
    "\u{1F4E2}", "\u{1F4E3}", "\u{1F50B}", "\u{1F50C}", "\u{1F4E8}",
    "\u{1F4E9}", "\u{1F4EA}", "\u{1F4EB}", "\u{1F4EC}", "\u{1F4ED}",
    "\u{1F511}", "\u{1F512}", "\u{1F513}", "\u{1F514}", "\u{1F516}",
    "\u{1F517}", "\u{1F518}", "\u{1F519}", "\u{1F51A}", "\u{1F51B}",
    "\u{1F51C}", "\u{1F51D}", "\u{1F52E}", "\u{1F52C}", "\u{1F525}",
  ],
  Symbols: [
    "\u{2764}", "\u{1F494}", "\u{1F495}", "\u{1F496}", "\u{1F497}",
    "\u{1F498}", "\u{1F499}", "\u{1F49A}", "\u{1F49B}", "\u{1F49C}",
    "\u{2763}", "\u{1F493}", "\u{2665}", "\u{2709}", "\u{2611}",
    "\u{2614}", "\u{2600}", "\u{2B50}", "\u{2601}", "\u{26A1}",
    "\u{2744}", "\u{2602}", "\u{2615}", "\u{231A}", "\u{231B}",
    "\u{23F0}", "\u{23F1}", "\u{23F2}", "\u{23F3}", "\u{267F}",
    "\u{2328}", "\u{2699}", "\u{269B}", "\u{269C}", "\u{2604}",
    "\u{2622}", "\u{2623}", "\u{2620}", "\u{2694}", "\u{2695}",
    "\u{262E}", "\u{262F}", "\u{2638}", "\u{2639}", "\u{263A}",
    "\u{2640}", "\u{2642}", "\u{2695}", "\u{2696}", "\u{2697}",
  ],
  Flags: [
    "\u{1F1E6}\u{1F1E8}", "\u{1F1E6}\u{1F1EC}", "\u{1F1E6}\u{1F1F7}",
    "\u{1F1E7}\u{1F1E9}", "\u{1F1E7}\u{1F1E7}", "\u{1F1E7}\u{1F1EF}",
    "\u{1F1E7}\u{1F1F2}", "\u{1F1E7}\u{1F1F7}", "\u{1F1E7}\u{1F1F9}",
    "\u{1F1E7}\u{1F1FC}", "\u{1F1E8}\u{1F1E6}", "\u{1F1E8}\u{1F1E8}",
    "\u{1F1E8}\u{1F1ED}", "\u{1F1E8}\u{1F1EE}", "\u{1F1E8}\u{1F1F0}",
    "\u{1F1E8}\u{1F1F1}", "\u{1F1E8}\u{1F1F2}", "\u{1F1E8}\u{1F1F3}",
    "\u{1F1E8}\u{1F1F4}", "\u{1F1E8}\u{1F1F5}", "\u{1F1E8}\u{1F1F7}",
    "\u{1F1E8}\u{1F1FA}", "\u{1F1E8}\u{1F1F8}", "\u{1F1E8}\u{1F1F9}",
    "\u{1F1E8}\u{1F1FB}", "\u{1F1E8}\u{1F1FC}", "\u{1F1E8}\u{1F1FD}",
    "\u{1F1E8}\u{1F1FE}", "\u{1F1E8}\u{1F1FF}", "\u{1F1E9}\u{1F1EA}",
    "\u{1F1E9}\u{1F1EC}", "\u{1F1E9}\u{1F1EF}", "\u{1F1E9}\u{1F1F0}",
    "\u{1F1E9}\u{1F1F2}", "\u{1F1E9}\u{1F1F4}", "\u{1F1EA}\u{1F1E8}",
    "\u{1F1EA}\u{1F1EC}", "\u{1F1EA}\u{1F1F7}", "\u{1F1EA}\u{1F1F8}",
    "\u{1F1EA}\u{1F1F9}", "\u{1F1EA}\u{1F1FA}",
    "\u{1F1FA}\u{1F1F8}", "\u{1F1FB}\u{1F1EC}", "\u{1F1FB}\u{1F1EE}",
    "\u{1F1FB}\u{1F1F3}", "\u{1F1FB}\u{1F1FA}", "\u{1F1FC}\u{1F1EB}",
    "\u{1F1FC}\u{1F1F8}", "\u{1F1FD}\u{1F1F0}", "\u{1F1FE}\u{1F1EA}",
    "\u{1F1FE}\u{1F1F9}", "\u{1F1FF}\u{1F1E6}", "\u{1F1FF}\u{1F1F2}",
    "\u{1F1FF}\u{1F1FC}",
  ],
};

const CATEGORY_ICONS: Record<string, string> = {
  Smileys: "\u{1F600}",
  People: "\u{1F44D}",
  Animals: "\u{1F431}",
  Food: "\u{1F34E}",
  Travel: "\u{2708}",
  Activities: "\u{26BD}",
  Objects: "\u{1F4A1}",
  Symbols: "\u{2764}",
  Flags: "\u{1F1FA}\u{1F1F8}",
};

function getRecentEmojis(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem("emoji-recent");
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function EmojiPicker() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Smileys");
  const [recent, setRecent] = useState<string[]>(getRecentEmojis);
  const [copiedEmoji, setCopiedEmoji] = useState("");

  const filteredEmojis = useMemo(() => {
    if (!search.trim()) return CATEGORIES[activeCategory] || [];
    const q = search.toLowerCase();
    return Object.values(CATEGORIES).flat().filter(() => true).slice(0, 120);
  }, [search, activeCategory]);

  const handleCopy = useCallback(async (emoji: string) => {
    await navigator.clipboard.writeText(emoji);
    setCopiedEmoji(emoji);
    setTimeout(() => setCopiedEmoji(""), 1500);
    setRecent((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 24);
      localStorage.setItem("emoji-recent", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Search Emojis</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type to search..."
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {recent.length > 0 && (
          <button
            onClick={() => setActiveCategory("__recent__")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === "__recent__"
                ? "bg-brand-500 text-white"
                : "rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-dark-surface dark:text-dark-muted"
            }`}
          >
            Recent
          </button>
        )}
        {Object.keys(CATEGORIES).map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearch(""); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-brand-500 text-white"
                : "rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-dark-surface dark:text-dark-muted"
            }`}
          >
            <span className="mr-1">{CATEGORY_ICONS[cat]}</span>
            {cat}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface max-h-96 overflow-y-auto">
        {search.trim() ? (
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
            {Object.values(CATEGORIES).flat()
              .filter((e) => true)
              .slice(0, 80)
              .map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  onClick={() => handleCopy(emoji)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-2xl hover:bg-surface-200 dark:hover:bg-dark-bg transition-colors"
                  title={copiedEmoji === emoji ? "Copied!" : "Click to copy"}
                >
                  {emoji}
                </button>
              ))}
          </div>
        ) : activeCategory === "__recent__" ? (
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
            {recent.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => handleCopy(emoji)}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-2xl hover:bg-surface-200 dark:hover:bg-dark-bg transition-colors"
                title={copiedEmoji === emoji ? "Copied!" : "Click to copy"}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
            {(CATEGORIES[activeCategory] || []).map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => handleCopy(emoji)}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-2xl hover:bg-surface-200 dark:hover:bg-dark-bg transition-colors"
                title={copiedEmoji === emoji ? "Copied!" : "Click to copy"}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {copiedEmoji && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-50 p-2 text-sm text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
          <span className="text-2xl">{copiedEmoji}</span>
          <span>Copied to clipboard!</span>
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        Click any emoji to copy it to your clipboard.
      </p>
    </div>
  );
}
