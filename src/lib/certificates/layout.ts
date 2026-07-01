import type { Json } from "@/lib/supabase/database.types";

export type CertificateTextBlock = {
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align?: "left" | "center" | "right";
};

export type CertificateLayout = {
  name: CertificateTextBlock;
  date: CertificateTextBlock;
  campaign_title: CertificateTextBlock;
};

const DEFAULT_LAYOUT: CertificateLayout = {
  name: { x: 400, y: 320, fontSize: 48, fontFamily: "Helvetica", color: "#1a1a1a", align: "center" },
  date: { x: 400, y: 400, fontSize: 24, fontFamily: "Helvetica", color: "#666666", align: "center" },
  campaign_title: {
    x: 400,
    y: 260,
    fontSize: 20,
    fontFamily: "Helvetica",
    color: "#444444",
    align: "center",
  },
};

export function parseCertificateLayout(raw: Json | null | undefined): CertificateLayout {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_LAYOUT;
  const obj = raw as Record<string, unknown>;
  const pick = (key: keyof CertificateLayout): CertificateTextBlock => {
    const block = obj[key];
    if (!block || typeof block !== "object" || Array.isArray(block)) return DEFAULT_LAYOUT[key];
    const b = block as Record<string, unknown>;
    const base = DEFAULT_LAYOUT[key];
    return {
      x: typeof b.x === "number" ? b.x : base.x,
      y: typeof b.y === "number" ? b.y : base.y,
      fontSize: typeof b.fontSize === "number" ? b.fontSize : base.fontSize,
      fontFamily: typeof b.fontFamily === "string" ? b.fontFamily : base.fontFamily,
      color: typeof b.color === "string" ? b.color : base.color,
      align:
        b.align === "left" || b.align === "right" || b.align === "center" ? b.align : base.align,
    };
  };
  return {
    name: pick("name"),
    date: pick("date"),
    campaign_title: pick("campaign_title"),
  };
}

export function layoutFromFormData(formData: FormData): CertificateLayout {
  const num = (key: string, fallback: number) => {
    const v = parseFloat(String(formData.get(key) ?? ""));
    return Number.isFinite(v) ? v : fallback;
  };
  const str = (key: string, fallback: string) => String(formData.get(key) ?? "").trim() || fallback;

  return {
    name: {
      x: num("name_x", 400),
      y: num("name_y", 320),
      fontSize: num("name_fontSize", 48),
      fontFamily: str("name_fontFamily", "Helvetica"),
      color: str("name_color", "#1a1a1a"),
      align: "center",
    },
    date: {
      x: num("date_x", 400),
      y: num("date_y", 400),
      fontSize: num("date_fontSize", 24),
      fontFamily: str("date_fontFamily", "Helvetica"),
      color: str("date_color", "#666666"),
      align: "center",
    },
    campaign_title: {
      x: num("title_x", 400),
      y: num("title_y", 260),
      fontSize: num("title_fontSize", 20),
      fontFamily: str("title_fontFamily", "Helvetica"),
      color: str("title_color", "#444444"),
      align: "center",
    },
  };
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svgText(block: CertificateTextBlock, text: string) {
  const anchor =
    block.align === "left" ? "start" : block.align === "right" ? "end" : "middle";
  return `<text x="${block.x}" y="${block.y}" font-size="${block.fontSize}" font-family="${escapeXml(block.fontFamily)}" fill="${escapeXml(block.color)}" text-anchor="${anchor}">${escapeXml(text)}</text>`;
}

export function buildCertificateSvg(
  width: number,
  height: number,
  layout: CertificateLayout,
  fields: { name: string; date: string; campaignTitle: string },
) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
${svgText(layout.campaign_title, fields.campaignTitle)}
${svgText(layout.name, fields.name)}
${svgText(layout.date, fields.date)}
</svg>`;
}
