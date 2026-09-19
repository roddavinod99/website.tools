"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, Share2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

// Original brand colors — matching SVGRepo "original colour" packs
// (https://www.svgrepo.com/ — search: whatsapp-color, facebook-color, etc.)
// Colors verified against Simple Icons brand guidelines.
const BRAND = {
  whatsapp: "#25D366",
  x: "#000000",
  facebook: "#0866FF",
  pinterest: "#E60023",
  reddit: "#FF4500",
  linkedin: "#0A66C2",
  telegram: "#26A5E4",
  email: "#EA4335",
} as const;

type ShareButtonsProps = {
  url?: string;
  title?: string;
  description?: string;
};

function getShareUrl() {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function getShareTitle(fallback?: string) {
  if (fallback) return fallback;
  if (typeof document !== "undefined" && document.title) return document.title;
  return "DevStackIO Tools";
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Client-only native share detection — set once after mount (allowed cascading render for feature detection)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client feature detection after mount
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const resolvedUrl = url ?? getShareUrl();
  const resolvedTitle = getShareTitle(title);

  const shareText = description ? `${resolvedTitle} — ${description}` : resolvedTitle;
  const encodedUrl = encodeURIComponent(resolvedUrl);
  const encodedTitle = encodeURIComponent(resolvedTitle);
  const encodedText = encodeURIComponent(shareText);

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: create temporary input
      const el = document.createElement("input");
      el.value = resolvedUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [resolvedUrl]);

  const nativeShare = useCallback(async () => {
    try {
      await navigator.share({ title: resolvedTitle, text: shareText, url: resolvedUrl });
    } catch {
      // user cancelled or not supported — silently ignore
    }
  }, [resolvedTitle, shareText, resolvedUrl]);

  const openShare = useCallback((href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
  }, []);

  // Share intent URLs — each opens the native app on mobile if installed (via OS handler),
  // otherwise falls back to web. Text is pre-filled so user just taps "Post/Send".
  const links = {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
  };

  const btnBase =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border text-[var(--color-accent-fg)] shadow-sm transition-all hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-accent)] active:scale-95";

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Share this tool">
      {/* WhatsApp — SVGRepo whatsapp-color (https://www.svgrepo.com/svg/475692/whatsapp-color) */}
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
        onClick={(e) => {
          e.preventDefault();
          openShare(links.whatsapp);
        }}
        className={btnBase}
        style={{ backgroundColor: BRAND.whatsapp, borderColor: BRAND.whatsapp }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>

      {/* X (Twitter) — SVGRepo x-color */}
      <a
        href={links.x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        title="Share on X"
        onClick={(e) => {
          e.preventDefault();
          openShare(links.x);
        }}
        className={btnBase}
        style={{ backgroundColor: BRAND.x, borderColor: BRAND.x }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white" aria-hidden="true">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      </a>

      {/* Facebook — SVGRepo facebook-color */}
      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        title="Share on Facebook"
        onClick={(e) => {
          e.preventDefault();
          openShare(links.facebook);
        }}
        className={btnBase}
        style={{ backgroundColor: BRAND.facebook, borderColor: BRAND.facebook }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white" aria-hidden="true">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      </a>

      {/* LinkedIn — SVGRepo linkedin-color */}
      <a
        href={links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        onClick={(e) => {
          e.preventDefault();
          openShare(links.linkedin);
        }}
        className={btnBase}
        style={{ backgroundColor: BRAND.linkedin, borderColor: BRAND.linkedin }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>

      {/* Reddit — SVGRepo reddit-color */}
      <a
        href={links.reddit}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Reddit"
        title="Share on Reddit"
        onClick={(e) => {
          e.preventDefault();
          openShare(links.reddit);
        }}
        className={btnBase}
        style={{ backgroundColor: BRAND.reddit, borderColor: BRAND.reddit }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white" aria-hidden="true">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      </a>

      {/* Pinterest — SVGRepo pinterest-color */}
      <a
        href={links.pinterest}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Pinterest"
        title="Share on Pinterest"
        onClick={(e) => {
          e.preventDefault();
          openShare(links.pinterest);
        }}
        className={btnBase}
        style={{ backgroundColor: BRAND.pinterest, borderColor: BRAND.pinterest }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white" aria-hidden="true">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
        </svg>
      </a>

      {/* Telegram — SVGRepo telegram-color */}
      <a
        href={links.telegram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Telegram"
        title="Share on Telegram"
        onClick={(e) => {
          e.preventDefault();
          openShare(links.telegram);
        }}
        className={btnBase}
        style={{ backgroundColor: BRAND.telegram, borderColor: BRAND.telegram }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </a>

      {/* Email */}
      <a
        href={links.email}
        aria-label="Share via Email"
        title="Share via Email"
        className={btnBase}
        style={{ backgroundColor: BRAND.email, borderColor: BRAND.email }}
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
      </a>

      {/* Copy URL */}
      <Button
        variant="outline"
        size="sm"
        onClick={copyUrl}
        aria-label={copied ? "Copied!" : "Copy link"}
        title={copied ? "Copied!" : "Copy link"}
        className="h-9 w-9 rounded-md border-[var(--color-border)] p-0"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </Button>

      {/* Native Web Share (mobile) */}
      {canNativeShare && (
        <Button
          variant="outline"
          size="sm"
          onClick={nativeShare}
          aria-label="More share options"
          title="More share options"
          className="h-9 w-9 rounded-md border-[var(--color-border)] p-0"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
