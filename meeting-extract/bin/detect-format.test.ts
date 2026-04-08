import { describe, test, expect } from "bun:test";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

function runDetectFormat(filePath: string): { format: string; confidence: number } {
  const proc = Bun.spawnSync(["bun", "run", join(__dirname, "detect-format.ts"), filePath]);
  const stdout = new TextDecoder().decode(proc.stdout).trim();
  if (proc.exitCode !== 0) {
    const stderr = new TextDecoder().decode(proc.stderr).trim();
    throw new Error(`Exit ${proc.exitCode}: ${stderr}`);
  }
  return JSON.parse(stdout);
}

describe("detect-format", () => {
  let tmpDir: string;

  function writeTmpFile(name: string, content: string): string {
    const p = join(tmpDir, name);
    writeFileSync(p, content, "utf-8");
    return p;
  }

  test("detects wechat format with high confidence", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "df-"));
    const content = [
      "项目周会",
      "张三  00:00:05",
      "今天讨论一下项目进度",
      "李四  00:01:12",
      "好的，我先汇报一下",
      "张三  00:02:30",
      "继续说",
    ].join("\n");
    const result = runDetectFormat(writeTmpFile("wechat.txt", content));
    expect(result.format).toBe("wechat");
    expect(result.confidence).toBeGreaterThan(0.6);
    rmSync(tmpDir, { recursive: true });
  });

  test("returns unknown for plain text without timestamps", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "df-"));
    const content = "这是一段普通文本\n没有时间戳\n也没有说话人标签\n";
    const result = runDetectFormat(writeTmpFile("plain.txt", content));
    expect(result.format).toBe("unknown");
    expect(result.confidence).toBe(0);
    rmSync(tmpDir, { recursive: true });
  });

  test("handles BOM prefix", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "df-"));
    const content = "\uFEFF张三  00:00:05\n发言内容\n李四  00:01:12\n回复内容\n";
    const result = runDetectFormat(writeTmpFile("bom.txt", content));
    expect(result.format).toBe("wechat");
    rmSync(tmpDir, { recursive: true });
  });

  test("returns unknown for empty file", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "df-"));
    const result = runDetectFormat(writeTmpFile("empty.txt", ""));
    expect(result.format).toBe("unknown");
    expect(result.confidence).toBe(0);
    rmSync(tmpDir, { recursive: true });
  });

  test("exits with error when no file argument", () => {
    const proc = Bun.spawnSync(["bun", "run", join(__dirname, "detect-format.ts")]);
    expect(proc.exitCode).toBe(1);
  });
});
