import { describe, test, expect } from "bun:test";
import { writeFileSync, mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

interface ParseResult {
  speakers: { name: string; segments: number }[];
  total_segments: number;
  title: string;
}

function runParseSpeakers(filePath: string): ParseResult {
  const proc = Bun.spawnSync(["bun", "run", join(__dirname, "parse-speakers.ts"), filePath]);
  const stdout = new TextDecoder().decode(proc.stdout).trim();
  if (proc.exitCode !== 0) {
    const stderr = new TextDecoder().decode(proc.stderr).trim();
    throw new Error(`Exit ${proc.exitCode}: ${stderr}`);
  }
  return JSON.parse(stdout);
}

describe("parse-speakers", () => {
  let tmpDir: string;

  function writeTmpFile(name: string, content: string): string {
    const p = join(tmpDir, name);
    writeFileSync(p, content, "utf-8");
    return p;
  }

  test("parses speakers and counts segments correctly", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "ps-"));
    const content = [
      "项目周会",
      "张三  00:00:05",
      "今天讨论项目进度",
      "李四  00:01:12",
      "好的我先汇报",
      "张三  00:02:30",
      "继续",
      "王五  00:03:00",
      "我补充一下",
    ].join("\n");
    const result = runParseSpeakers(writeTmpFile("meeting.txt", content));
    expect(result.total_segments).toBe(4);
    expect(result.title).toBe("项目周会");
    expect(result.speakers).toHaveLength(3);
    expect(result.speakers[0]).toEqual({ name: "张三", segments: 2 });
    expect(result.speakers[1]).toEqual({ name: "李四", segments: 1 });
    expect(result.speakers[2]).toEqual({ name: "王五", segments: 1 });
    rmSync(tmpDir, { recursive: true });
  });

  test("sorts speakers by segment count descending", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "ps-"));
    const content = [
      "会议标题",
      "A  00:00:01",
      "话",
      "B  00:00:02",
      "话",
      "B  00:00:03",
      "话",
      "B  00:00:04",
      "话",
      "A  00:00:05",
      "话",
    ].join("\n");
    const result = runParseSpeakers(writeTmpFile("sort.txt", content));
    expect(result.speakers[0].name).toBe("B");
    expect(result.speakers[0].segments).toBe(3);
    expect(result.speakers[1].name).toBe("A");
    expect(result.speakers[1].segments).toBe(2);
    rmSync(tmpDir, { recursive: true });
  });

  test("handles title-less file where first line is a speaker tag", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "ps-"));
    const content = "张三  00:00:05\n发言内容\n";
    const result = runParseSpeakers(writeTmpFile("notitle.txt", content));
    expect(result.title).toBe("");
    expect(result.total_segments).toBe(1);
    expect(result.speakers[0].name).toBe("张三");
    rmSync(tmpDir, { recursive: true });
  });

  test("handles BOM prefix", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "ps-"));
    const content = "\uFEFF会议\n张三  00:00:05\n内容\n";
    const result = runParseSpeakers(writeTmpFile("bom.txt", content));
    expect(result.title).toBe("会议");
    expect(result.total_segments).toBe(1);
    rmSync(tmpDir, { recursive: true });
  });

  test("handles speaker names with org prefix", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "ps-"));
    const content = "会议\nXX公司张三  00:00:05\n内容\nYY集团李四  00:01:00\n回复\n";
    const result = runParseSpeakers(writeTmpFile("org.txt", content));
    expect(result.speakers).toHaveLength(2);
    expect(result.speakers[0].name).toBe("XX公司张三");
    expect(result.speakers[1].name).toBe("YY集团李四");
    rmSync(tmpDir, { recursive: true });
  });

  test("exits with error when no file argument", () => {
    const proc = Bun.spawnSync(["bun", "run", join(__dirname, "parse-speakers.ts")]);
    expect(proc.exitCode).toBe(1);
  });
});
