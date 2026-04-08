# AGENTS.md

## Project

会议录音转写文件处理工具集。核心资产是 8 个针对不同 LLM 深度优化的中文会议 Prompt 模板，目标是封装为一个 Claude Code Skill（meeting-extract）。

## Repository layout

```
Prompt/                        # 8 个 Prompt 模板（不可运行的参考文档）
├── 会议发言提取_{模型}版.md   # 4 个模型：Claude / Gemini / GLM / Qwen
└── 会议纪要提取_{模型}版.md   # 同上
文本-A8411D47DF72-1.txt        # 真实转写样本（926 行，UTF-8，微信录音格式）
```

## Transcript format

样本文件格式：`说话人姓名  HH:MM:SS\n发言内容\n`（说话人与时间戳之间两个空格）。说话人名可能含组织前缀，如"康方刘淼"、"康方杨媛"。第一行是自由格式标题。

## Prompt templates

`Prompt/` 下 8 个文件按 `{输出类型}_{模型}版.md` 命名。两种输出类型：

- **发言提取**（speaker extract）：针对特定人员，第一人称视角还原观点体系，输出五章节结构（核心观点、执行方案、争议事项、行动项、观点演化）
- **会议纪要**（meeting summary）：泛用型六模块结构（基本信息、摘要、议题与决议、待办事项、分歧与风险、关键发言摘录）

四个模型适配差异：
- **Claude** — XML 五段式标签（`<context>` `<task>` `<constraints>` `<output_format>` `<input>`）
- **GLM** — system/user 双消息，扁平 Markdown 结构，`enable_thinking: false`
- **Gemini** — Markdown `#` 标题分区（非 XML），需显式格式锁定示例防漂移
- **Qwen** — `/no_think` 关闭思考模式，角色-指令-约束-格式四段式扁平结构

## Design doc

已通过工程评审的设计文档：`~/.gstack/projects/04_/f.sh-unknown-design-20260408-113445.md`（APPROVED）

选定方案：Skill + Bun 预处理脚本 + Prompt 模板目录。脚本输出 JSON stdout，SKILL.md 消费后注入 Claude 上下文。V1 只实现微信录音格式检测和 Claude 版 Prompt。

## Runtime

Bun 1.3.10（已安装于 `/Users/f.sh/.bun/bin/bun`）。测试用 `bun test`。

## Language

所有用户面向输出使用简体中文。代码变量名、文件路径、CLI 命令保持英文。
