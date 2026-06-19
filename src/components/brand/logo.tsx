import Image from "next/image";

import { cn } from "@/lib/utils";

export type LogoWordmark = "mark" | "text" | "bilingual";

interface LogoProps {
  className?: string;
  /** Pixel height of the mark / image. */
  size?: number;
  /**
   * - `mark` — just the wing + infinity mark.
   * - `text` (default) — mark + a clean "Creative Wings" wordmark, ideal on light backgrounds.
   * - `bilingual` — the full brand image with 无限创翼 / CREATIVE WINGS baked in,
   *   designed for dark backgrounds (the wordmark inside is white).
   */
  wordmark?: LogoWordmark;
  /** Color for the text wordmark when `wordmark="text"`. */
  tone?: "default" | "white";
  /** Optional explicit alt text. Defaults to "Creative Wings". */
  alt?: string;
}

const ASSETS = {
  /** Tight-cropped mark (~4% padding) for nav/header; favicons keep the padded square. */
  mark: { src: "/brand/logo-cw-mark-tight.png", width: 800, height: 472 },
  bilingual: { src: "/brand/logo-cw.png", width: 480, height: 381 },
};

export function Logo({
  className,
  size = 32,
  wordmark = "text",
  tone = "default",
  alt = "Creative Wings",
}: LogoProps) {
  if (wordmark === "bilingual") {
    const a = ASSETS.bilingual;
    const width = Math.round((a.width / a.height) * size);
    return (
      <Image
        src={a.src}
        alt={alt}
        width={width}
        height={size}
        priority
        className={cn("select-none", className)}
        style={{ height: size, width }}
      />
    );
  }

  const a = ASSETS.mark;
  const markWidth = Math.round((a.width / a.height) * size);
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <Image
        src={a.src}
        alt={alt}
        width={markWidth}
        height={size}
        priority
        style={{ height: size, width: markWidth }}
      />
      {wordmark === "text" && (
        <span
          className={cn(
            "font-extrabold tracking-tight leading-none",
            tone === "white" ? "text-white" : "text-foreground",
          )}
          style={{ fontSize: Math.round(size * 0.66) }}
        >
          Creative<span className="text-primary"> Wings</span>
        </span>
      )}
    </span>
  );
}
