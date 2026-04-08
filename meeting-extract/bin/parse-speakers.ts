import { readFileSync } from "fs";

interface Speaker {
  name: string;
  segments: number;
}

interface ParseResult {
  speakers: Speaker[];
  total_segments: number;
  title: string;
}

const WECHAT_TAG = /^(.{1,20}?) {2}(\d{2}:\d{2}:\d{2})$/;

function parseWechat(content: string): ParseResult {
  const lines = content.split("\n");
  const speakerMap = new Map<string, number>();
  let totalSegments = 0;
  let title = "";

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (i === 0 && trimmed.length > 0 && !WECHAT_TAG.test(trimmed)) {
      title = trimmed;
      continue;
    }

    const match = WECHAT_TAG.exec(trimmed);
    if (match) {
      const name = match[1].trim();
      const count = speakerMap.get(name) || 0;
      speakerMap.set(name, count + 1);
      totalSegments++;
    }
  }

  const speakers: Speaker[] = [];
  for (const [name, segments] of speakerMap) {
    speakers.push({ name, segments });
  }

  speakers.sort((a, b) => b.segments - a.segments);

  return { speakers, total_segments: totalSegments, title };
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: bun run parse-speakers.ts <file>");
  process.exit(1);
}

let content: string;
try {
  content = readFileSync(filePath, "utf-8");
} catch {
  const proc = Bun.spawnSync(["iconv", "-f", "GBK", "-t", "UTF-8", filePath]);
  content = new TextDecoder().decode(proc.stdout);
}

if (content.charCodeAt(0) === 0xfeff) {
  content = content.slice(1);
}

const result = parseWechat(content);
console.log(JSON.stringify(result));
