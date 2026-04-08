# meeting-extract

中文会议录音转写文件结构化提取。从转写文件自动生成发言观点文档或会议纪要。

## Trigger

当用户说以下内容时触发：
- `/meeting-extract`
- "提取会议发言"、"提取会议纪要"、"生成会议纪要"
- "分析会议录音"、"处理会议转写"

## Workflow

### Step 1: 获取输入文件

检查用户是否提供了文件路径：
- 如果用户消息中包含文件路径参数，直接使用
- 如果没有，使用 AskUserQuestion 让用户提供文件路径或拖入文件

### Step 2: 检测格式

```bash
bun run {SKILL_DIR}/bin/detect-format.ts "<文件路径>"
```

预期输出 JSON：
```json
{"format":"wechat","confidence":0.95}
```

- 如果 `confidence < 0.6` 或格式不是 `wechat`，告知用户当前仅支持微信录音转写格式，询问是否继续（退化为纯文本模式）

### Step 3: 识别说话人

```bash
bun run {SKILL_DIR}/bin/parse-speakers.ts "<文件路径>"
```

预期输出 JSON：
```json
{"speakers":[{"name":"张三","segments":163},{"name":"李四","segments":84}],"total_segments":308,"title":"项目周会"}
```

### Step 4: 选择输出类型

使用 AskUserQuestion 让用户选择：

**问题 1: 输出类型**
- 发言提取：针对特定人员，第一人称视角还原观点体系
- 会议纪要：泛用型六模块结构化纪要

**问题 2（仅发言提取时）: 目标人员**
- 列出步骤 3 检测到的所有说话人作为选项
- 用户也可以输入自定义姓名（模糊匹配）

### Step 5: 构造 Prompt

根据输出类型读取对应模板：
- 发言提取：`{SKILL_DIR}/prompts/speaker-extract.md`
- 会议纪要：`{SKILL_DIR}/prompts/meeting-summary.md`

使用 Read 工具读取模板文件。

然后替换模板中的占位符：
- `{{speaker_name}}` → 用户选择的目标人员姓名（仅发言提取）
- `{{speakers_list}}` → 从步骤 3 的 JSON 构造，格式为 "张三、李四、王五"
- `{{speaker_ratio}}` → 从步骤 3 的 JSON 计算：`segments / total_segments × 100%`（仅发言提取）
- `{{transcript}}` → 使用 Read 工具读取转写文件全文

### Step 6: 执行生成

将替换后的完整 Prompt 直接输出。Claude 会按照 Prompt 中的指令生成结构化 Markdown 文档。

**重要**：直接将构造好的完整 Prompt 内容作为你的回复输出，不要添加额外解释或包装。

### Step 7: 保存输出

将生成的文档写入文件：
- 发言提取：`{原文件名}_{目标人员}_发言提取_{YYYYMMDD-HHmmss}.md`
- 会议纪要：`{原文件名}_会议纪要_{YYYYMMDD-HHmmss}.md`

输出文件保存在转写文件同目录下。使用 Write 工具写入。

告知用户输出文件路径。

## Consumer Chain

```
转写文件 ──→ Bash: detect-format.ts ──→ JSON stdout (格式+置信度)
   │                                           │
   └──→ Bash: parse-speakers.ts ──→ JSON stdout (说话人+统计)
                     │
转写文件 ──→ Read: 全文内容 ──────────────────┐
                                               │
prompts/*.md ──→ Read: 模板指令 ───────────────┤
                                               ▼
                                    替换占位符构造完整 prompt
                                    ┌─────────────────────┐
                                    │ 1. 模板指令           │
                                    │ 2. 预处理元数据 (JSON) │
                                    │ 3. 转写文件全文        │
                                    └─────────┬───────────┘
                                              ▼
                                    Claude 执行生成
                                              ▼
                                    Write: 输出 Markdown
```

## Error Handling

- **UTF-8 解码失败**：脚本内部自动尝试 GBK 回退（iconv）
- **BOM 头**：脚本内部自动剥离
- **说话人模糊匹配**：用户输入姓名与转写标签做包含关系匹配（如输入"张三"匹配"XX公司张三"），匹配不到时提示用户从检测到的说话人列表选择
- **超长文件**：如果转写文件超过 200K token，提示用户考虑按议题拆分

## Examples

```
用户: /meeting-extract 文本-A8411D47DF72-1.txt
→ 检测格式 → 识别说话人 → 选择输出类型 → 生成 → 保存文件

用户: 帮我提取这个会议里张三的发言观点，文件是 转写文件.txt
→ 自动识别为"发言提取"类型，目标人员"张三" → 生成 → 保存文件

用户: 生成会议纪要，文件 ./会议录音.txt
→ 自动识别为"会议纪要"类型 → 生成 → 保存文件
```