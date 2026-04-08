# meeting-extract

中文会议录音转写文件结构化提取 Claude Code Skill。

从微信录音转写文件自动生成：
- **发言提取** — 针对特定人员，第三人称客观视角提炼观点体系（七章节结构）
- **会议纪要** — 泛用型七章节结构化纪要

核心是 8 个针对 Claude / Gemini / GLM / Qwen 深度优化的中文会议 Prompt 模板，V1 运行时使用 Claude 版。

## 安装

```bash
# 方式一：git clone
git clone https://github.com/fshaan/meeting-extract.git ~/.claude/skills/meeting-extract

# 方式二：npx skills
npx skills add fshaan/meeting-extract -g -y
```

## 使用

在 Claude Code 中：

```
/meeting-extract 转写文件.txt
```

或自然语言：

```
帮我提取这个会议里张三的发言观点，文件是 转写文件.txt
生成会议纪要，文件 ./会议录音.txt
```

Skill 会自动检测转写格式、识别说话人、选择输出类型，生成结构化 Markdown 文件。

## 支持的转写格式

V1 支持 **微信录音转写格式**（`说话人姓名  HH:MM:SS\n发言内容\n`）。其他格式（SRT/VTT/纯文本）留作 V2 扩展。

## 输出类型

### 发言提取

针对指定人员，输出七章节结构：
1. 核心观点阐述（按主题聚类，第三人称客观陈述）
2. 执行方案（含实施步骤表、资源条件）
3. 争议与待决事项
4. 关联行动项
5. 观点演化轨迹
6. 需核实（无法确定的转写错误）
7. 词汇确认表（关键人名、组织名、专业术语）

### 会议纪要

泛用型七章节结构：
1. 会议基本信息
2. 会议摘要（150-300 字）
3. 议题与决议
4. 待办事项
5. 分歧与风险记录
6. 关键发言摘录
7. 词汇确认表（关键人名、组织名、专业术语）

## 项目结构

```
Prompt/                        # 8 个 Prompt 模板（参考文档）
meeting-extract/               # Skill 实现
├── SKILL.md                   # 工作流定义
├── bin/
│   ├── detect-format.ts       # 转写格式检测
│   └── parse-speakers.ts      # 说话人识别与统计
├── prompts/
│   ├── speaker-extract.md     # 发言提取 Prompt（Claude 版）
│   └── meeting-summary.md     # 会议纪要 Prompt（Claude 版）
├── package.json
└── tsconfig.json
```

## 运行环境

- [Bun](https://bun.sh) 1.3.10+
- Claude Code（复用当前模型，不需要外部 API）

## Contributing

参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## License

MIT
