# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-04-08

### Added

- 发言提取功能：针对特定人员，第一人称视角还原观点体系，输出五章节结构化文档
- 会议纪要功能：泛用型六模块结构化纪要（基本信息、摘要、议题与决议、待办事项、分歧与风险、关键发言摘录）
- 微信录音转写格式自动检测（`detect-format.ts`），正则匹配 + 置信度评分
- 说话人自动识别与统计（`parse-speakers.ts`），输出 JSON 供 Skill 消费
- Claude 版 Prompt 模板：发言提取（XML 五段式）和会议纪要（XML 六段式）
- SKILL.md 工作流定义，包含完整消费链路和错误处理
- 8 个参考 Prompt 模板（Claude / Gemini / GLM / Qwen 各两个输出类型）
