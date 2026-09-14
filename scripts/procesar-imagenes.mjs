import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SRC = "/private/tmp/claude-502/-Users-felix-Desktop-marketing/78270df4-9b82-4769-ace3-26e644e5bd0d/scratchpad/uns";
const ROOT = "/Users/felix/Desktop/marketing";

// destino -> [archivo fuente, ancho, alto|null]
const MAP = {
  // ── ALTURA ──────────────────────────────────────────────
  "altura/hero":            ["ext__photo-1580587771525-78b9dba3b914", 2000, 1125],
  "altura/lumen-01":        ["ext__photo-1719887805632-de5be825f72b", 1600, 1067],
  "altura/lumen-02":        ["liv__photo-1598928506311-c55ded91a20c", 1400, 933],
  "altura/lumen-03":        ["kit__photo-1512916194211-3f2b7f5f7de3", 1400, 933],
  "altura/lumen-04":        ["bed__photo-1651132205872-091b35e72b15", 1400, 933],
  "altura/aral-01":         ["ext__photo-1670589953882-b94c9cb380f5", 1600, 1067],
  "altura/aral-02":         ["liv__photo-1600121848594-d8644e57abab", 1400, 933],
  "altura/aral-03":         ["kit__photo-1663811396777-05505d999151", 1400, 933],
  "altura/aral-04":         ["bed__photo-1644057501622-dfa7dd26dbfb", 1400, 933],
  "altura/sereno-01":       ["ext__photo-1602343168117-bb8ffe3e2e9f", 1600, 1067],
  "altura/sereno-02":       ["pool__photo-1543489822-c49534f3271f", 1400, 933],
  "altura/sereno-03":       ["liv__photo-1600210491892-03d54c0aaf87", 1400, 933],
  "altura/sereno-04":       ["bed__photo-1616594092403-fb65629b0a46", 1400, 933],
  "altura/obsidiana-01":    ["ext__photo-1698994705178-d244d73ea573", 1600, 1067],
  "altura/obsidiana-02":    ["kit__photo-1635321350281-e2a91ecffd00", 1400, 933],
  "altura/obsidiana-03":    ["liv__photo-1605774337664-7a846e9cdf17", 1400, 933],
  "altura/obsidiana-04":    ["bed__photo-1663811397207-418a92396ad5", 1400, 933],
  "altura/mirador-01":      ["ext__photo-1706808849780-7a04fbac83ef", 1600, 1067],
  "altura/mirador-02":      ["liv__photo-1564078516393-cf04bd966897", 1400, 933],
  "altura/mirador-03":      ["kit__photo-1610177534644-34d881503b83", 1400, 933],
  "altura/mirador-04":      ["bed__photo-1699800900071-ae073285ca02", 1400, 933],
  "altura/marea-01":        ["ext__photo-1613977257363-707ba9348227", 1600, 1067],
  "altura/marea-02":        ["pool__photo-1600760380065-2fcdc9e73007", 1400, 933],
  "altura/marea-03":        ["kit__photo-1656402887556-e727ffe1f6d7", 1400, 933],
  "altura/marea-04":        ["bed__photo-1648634158203-199accfd7afc", 1400, 933],
  // ── NOVA ────────────────────────────────────────────────
  "nova/caso-aurora":       ["fsh__photo-1662532577856-e8ee8b138a8b", 1400, 1750],
  "nova/caso-polen":        ["fsh__photo-1595550891383-152fbed0f9bc", 1400, 1750],
  "nova/caso-helio":        ["abs__photo-1676018526208-0c80014f8a50", 1400, 1750],
  "nova/caso-marea":        ["abs__photo-1627637819794-fba32f82be16", 1400, 1750],
  "nova/caso-vector":       ["abs__photo-1671519821564-ced7e41ee7ae", 1400, 1750],
  "nova/caso-colectivo":    ["fsh__photo-1718563072717-db22ef0c9434", 1400, 1750],
  // ── IMPULSO ─────────────────────────────────────────────
  "impulso/amb-01":         ["abs__photo-1757167301187-5777536c564c", 1600, 1000],
  "impulso/amb-02":         ["abs__photo-1672080070762-764c74ee1227", 1600, 1000],
  "impulso/t-01":           ["por__photo-1494790108377-be9c29b29330", 320, 320],
  "impulso/t-02":           ["mpo__photo-1656399910161-8efafd973a29", 320, 320],
  "impulso/t-03":           ["por__photo-1699899657680-421c2c2d5064", 320, 320],
};

const blur = {};
for (const [dest, [src, w, h]] of Object.entries(MAP)) {
  const inPath = path.join(SRC, src + ".jpg");
  const outPath = path.join(ROOT, "public/img", dest + ".webp");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  const pipe = sharp(inPath).resize(w, h, { fit: "cover", position: "attention" });
  await pipe.clone().webp({ quality: 76, effort: 5 }).toFile(outPath);
  const tiny = await sharp(inPath).resize(14, null).webp({ quality: 28 }).toBuffer();
  blur[dest] = `data:image/webp;base64,${tiny.toString("base64")}`;
  const { size } = await fs.stat(outPath);
  console.log(`${String(Math.round(size / 1024)).padStart(5)} KB  ${dest}.webp`);
}

const ts =
  "// Generado por scripts/procesar-imagenes.mjs — no editar a mano.\n" +
  "// Placeholders base64 diminutos para next/image placeholder=\"blur\".\n" +
  "export const blurs: Record<string, string> = " +
  JSON.stringify(blur, null, 1) + ";\n";
await fs.writeFile(path.join(ROOT, "src/lib/blurs.ts"), ts);
console.log(`\n${Object.keys(MAP).length} imágenes procesadas`);
