import { readFileSync } from "fs";

interface FormatResult {
  format: string;
  confidence: number;
}

const WECHAT_TAG = /^.{1,20} {2}\d{2}:\d{2}:\d{2}$/;
const TIMESTAMP = /\d{2}:\d{2}:\d{2}/;

function detectWechat(lines: string[]): number {
  let matched = 0;
  let tsLines = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (TIMESTAMP.test(trimmed)) tsLines++;
    if (WECHAT_TAG.test(trimmed)) matched++;
  }
  return tsLines > 0 ? matched / tsLines : 0;
}

function detectFormat(filePath: string): FormatResult {
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    if (readFileSync(filePath).length > 0) {
      try {
        const proc = Bun.spawnSync([
          "iconv",
          "-f",
          "GBK",
          "-t",
          "UTF-8",
          filePath,
        ]);
        content = new TextDecoder().decode(proc.stdout);
      } catch {
        content = "";
      }
    } else {
      content = "";
    }
  }

  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  const lines = content.split("\n").slice(0, 50);

  const wechatConf = detectWechat(lines);

  if (wechatConf > 0.6) {
    return { format: "wechat", confidence: Math.round(wechatConf * 100) / 100 };
  }

  return { format: "unknown", confidence: 0 };
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: bun run detect-format.ts <file>");
  process.exit(1);
}

const result = detectFormat(filePath);
console.log(JSON.stringify(result));
