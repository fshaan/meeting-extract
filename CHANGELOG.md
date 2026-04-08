# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2026-04-08

### Changed

- 发言提取：第一人称视角改为第三人称客观陈述，行文风格对齐专业分析报告
- 发言提取：口语完全转化为专业书面用语，不再保留原始用词和语气特征
- 发言提取：移除来源时间戳标注要求
- 会议纪要：移除"模块X"模板标签文字，使用语义化章节标题
- 会议纪要：移除时间戳标注要求
- 两种模式均强化口语→书面语转化规则

### Added

- 发言提取：新增「需核实」章节（无法确定的转写错误单独列出）
- 发言提取：新增智能纠错规则（上下文可推断的错别字直接纠正）
- 两种模式均新增「词汇确认表」章节（关键人名、组织名、专业术语供客户确认）

### Fixed

- SKILL.md：转写文件读取改用 Bash cat，避免 Read 工具在同会话内重复读取时被缓存拦截

## [0.1.0] - 2026-04-08

### Added

- 发言提取功能：针对特定人员，第一人称视角还原观点体系，输出五章节结构化文档
- 会议纪要功能：泛用型六模块结构化纪要（基本信息、摘要、议题与决议、待办事项、分歧与风险、关键发言摘录）
- 微信录音转写格式自动检测（`detect-format.ts`），正则匹配 + 置信度评分
- 说话人自动识别与统计（`parse-speakers.ts`），输出 JSON 供 Skill 消费
- Claude 版 Prompt 模板：发言提取（XML 五段式）和会议纪要（XML 六段式）
- SKILL.md 工作流定义，包含完整消费链路和错误处理
- 8 个参考 Prompt 模板（Claude / Gemini / GLM / Qwen 各两个输出类型）
