import sharp from "sharp";

export type PrintArea = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export async function compositeMockup(opts: {
  mockupUrl: string;
  artworkBuffer: Buffer;
  printArea: PrintArea;
}): Promise<Buffer> {
  const mockupRes = await fetch(opts.mockupUrl);
  if (!mockupRes.ok) throw new Error("Could not load product mockup image.");
  const mockupBuf = Buffer.from(await mockupRes.arrayBuffer());
  const mockup = sharp(mockupBuf);
  const meta = await mockup.metadata();
  const W = meta.width ?? 1;
  const H = meta.height ?? 1;

  const left = Math.round((opts.printArea.x / 100) * W);
  const top = Math.round((opts.printArea.y / 100) * H);
  const width = Math.round((opts.printArea.w / 100) * W);
  const height = Math.round((opts.printArea.h / 100) * H);

  const artworkResized = await sharp(opts.artworkBuffer)
    .resize(width, height, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return mockup
    .composite([{ input: artworkResized, left, top }])
    .png()
    .toBuffer();
}
