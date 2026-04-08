# Contributing

## 开发环境

```bash
# 安装 Bun（如果还没有）
curl -fsSL https://bun.sh/install | bash

# 安装依赖
cd meeting-extract && bun install
```

## 运行测试

```bash
cd meeting-extract && bun test
```

## 运行脚本

```bash
# 格式检测
bun run detect-format <文件路径>

# 说话人识别
bun run parse-speakers <文件路径>
```

## 项目结构约定

- `meeting-extract/bin/` — Bun 脚本，输出 JSON 到 stdout，供 SKILL.md 消费
- `meeting-extract/prompts/` — Prompt 模板，使用 `{{placeholder}}` 占位符
- `Prompt/` — 8 个参考 Prompt 模板（不可运行的参考文档，不要修改）
- `AGENTS.md` — Claude Code 项目指令

## 添加新转写格式支持

1. 在 `bin/detect-format.ts` 的 `FORMATS` 数组中添加格式名称和正则
2. 在 `bin/parse-speakers.ts` 中添加对应的解析函数
3. 在 `prompts/` 中无需改动（Prompt 模板与格式无关）

## 添加新模型 Prompt 模板

V2 计划：在 `prompts/` 下按模型分子目录（`gemini/`、`glm/`、`qwen/`）。

参考 `Prompt/` 目录下的已有模板，注意各模型的结构差异：
- Claude: XML 标签
- Gemini: Markdown `#` 标题分区
- GLM: system/user 双消息，扁平结构
- Qwen: 四段式扁平结构，需关闭思考模式

## 代码风格

- TypeScript，无额外框架
- 脚本输出 JSON stdout，错误输出 stderr
- 变量名和文件路径用英文，用户面向输出用简体中文
- 不加注释，除非用户要求
