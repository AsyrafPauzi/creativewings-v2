import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

import {
  buildCertificateSvg,
  parseCertificateLayout,
  type CertificateLayout,
} from "@/lib/certificates/layout";

export async function generateCertificatePng(opts: {
  templateUrl: string;
  layout: CertificateLayout | unknown;
  studentName: string;
  campaignTitle: string;
  issuedAt: Date;
}): Promise<Buffer> {
  const res = await fetch(opts.templateUrl);
  if (!res.ok) throw new Error("Could not load certificate template.");
  const templateBuffer = Buffer.from(await res.arrayBuffer());

  const layout = parseCertificateLayout(opts.layout as never);
  const meta = await sharp(templateBuffer).metadata();
  const width = meta.width ?? 800;
  const height = meta.height ?? 600;

  const dateStr = opts.issuedAt.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const svg = buildCertificateSvg(width, height, layout, {
    name: opts.studentName,
    date: dateStr,
    campaignTitle: opts.campaignTitle,
  });

  return sharp(templateBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export async function pngToPdf(pngBuffer: Buffer): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const png = await pdf.embedPng(pngBuffer);
  const page = pdf.addPage([png.width, png.height]);
  page.drawImage(png, { x: 0, y: 0, width: png.width, height: png.height });
  return Buffer.from(await pdf.save());
}
