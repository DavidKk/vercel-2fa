# Signet：页头与信息架构重构规划

本文档整理背景、目标理解与分项方案草案，供后续逐项深化设计与实现。

**文档导航：** [一、背景](#一背景) · [二、目标原则](#二目标原则摘要) · [三、需求理解摘要](#三对需求的理解逐条) · [四、路由基线](#四当前路由与页面类型基线) · [五、模块拆分](#五前端模块拆分应该如何拆) · [5.4 页头与移动端](#54-页头重构方案多模块--移动端) · [六、内容与展示规范](#六各模块包含内容与展示规范) · [七、样式重构](#七样式重构专项落地顺序与-tokens) · [八、实施顺序](#八总体推荐实施顺序功能--样式交叉) · [九～十、风险与开放问题](#九风险与依赖)

---

## 一、背景

当前应用同时具备：**标准登录（TOTP / WebAuthn）**、**OAuth/ECDH 演示与 Playground**、**入门文档与若干工具页**。页头（`app/Nav`）以分组链接呈现能力，视觉与层级上对「谁是主路径、谁是辅助」区分不足。

真实使用场景中：

- **集成方 / 用户**最关心：尽快完成认证并回到业务站点；若浏览器内**已有有效登录态**，不应强制再走一遍完整交互登录。
- **学习与文档**仍是刚需，但应明确为**次要入口**，不抢占首屏与导航焦点。
- **工具类页面**（密钥、二维码、凭证生成等）适合归并为清晰的「开发者工具」心智模型。
- **Playground** 风险与心智与「生产形态登录」不同，需在导航与版式上与正式登录路径**显式区分**，避免误操作与混淆。
- **Agent / 自动化**接入需要稳定的 **MCP（HTTP）或等价 function-calling 接口**，可参考 **vercel-web-scripts** 已落地的模式（manifest GET、JSON-RPC POST、`/api/mcp/headers`、服务端配置的鉴权头等）。

---

## 二、目标原则（摘要）

| 原则     | 说明                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 登录优先 | 导航与首页默认引导「去登录 / 继续会话」，文档与工具降级为次级                          |
| 会话连续 | 已登录访问登录入口或带 `redirectUrl` 的回调场景时，优先短路与签发/跳转，而非重复挑战   |
| 分区清晰 | 介绍（Getting Started）、工具（Tools）、Playground、（未来）MCP 文档各自成组，命名一致 |
| 视觉重构 | 全新页头组件与整体布局 tokens（间距、层级、主色），与现有 indigo 顶栏脱钩              |
| 安全不减 | 开放跳转、OAuth、MCP 等均需保持白名单、鉴权与审计边界                                  |

---

## 三、对需求的理解（逐条）

### 1. 登录页为核心 + 已登录时的「直接跳走」

**理解：**  
「登录页」不仅是 UI，而是**认证网关**：当请求携带合法 `redirectUrl`（及可选 `state`）且**当前浏览器已有有效会话**（例如 HTTP-only Cookie / 服务端可验证的 Session JWT）时，应：

- **跳过** TOTP/WebAuthn 交互步骤；
- 按现有安全策略完成 **token 签发或重定向**（与当前 Blank/OAuth 回调链路对齐），让用户回到业务方。

这与典型「静默登录 / session continuation」一致；需注意与 **token 过期、绑定设备、Replay 保护** 等策略的兼容。

**方案方向（草案）：**

- 在 **`/login`（及必要时 OAuth 登录入口）** 的服务端逻辑最前面增加 **session 探测**：若已验证且满足策略，直接走「成功后」分支（重定向到 `redirectUrl` 并附带约定参数，或中间页只做一次性换票）。
- 明确 **哪些路由** 适用短路（仅标准 `/login` + 参数化跳转，还是包含 `/oauth` 无密钥场景需单独定义）。
- 产品文案：未登录看到完整流程；已登录可展示一行提示「已登录，正在跳转…」或直接跳转。

**待深化：**  
会话载体（仅 Cookie 还是双 Cookie）、短路是否调用与原登录相同的 `generateToken` 路径、`redirectUrl` 校验是否与现有一致、是否需 `prompt=none` 类参数与集成方约定。

---

### 2. 介绍模块（Getting Started）：TOTP + WebAuthn + 2FA，非核心

**理解：**  
保留现有 **Getting Started / 文档型内容**，涵盖 **TOTP、WebAuthn、整体 2FA 概念**，但作为 **二级信息**，不作为默认任务流。

**方案方向（草案）：**

- 导航中单独分组，命名建议：**「Docs」** 或 **「Guide」**，入口 **`/getting-started`**（或拆子路由后在导航展示子链接）。
- 首页：主 CTA 指向登录；文档改为次级卡片或页脚区链接（若仍有页脚需求可后续再议）。

**待深化：**  
文档 IA 是否合并 `/totp`、`/webauthn` 独立页进 Getting Started 锚点，还是维持独立页 + 文档内 deep link。

---

### 3. 工具（Tools）：ECDH Key Pair、TOTP QR、WebAuthn Credential 等

**理解：**  
这些是**现有能力**的聚合呈现：例如 ECDH 相关页、TOTP 二维码生成、WebAuthn 凭证生成等，应在导航中归为 **「Tools」**（或「Developer tools」），避免与登录主路径混在同一分组标题下。

**方案方向（草案）：**

- 梳理现有路由：`/ecdh`、`/totp`、`/webauthn` 等各自定位——若部分页面兼具「教学 + 工具」，可在 UI 上标 Badge（如 Tool / Doc）。
- 导航常量 `DEFAULT_NAV` 重构为：**Login（突出）** | Docs | Tools | Playground | MCP（链接到文档或 `/api/mcp` 说明）。

**待深化：**  
工具页是否需要统一前缀路由 `/tools/*` 以利于权限与缓存策略（可选，非必须）。

---

### 4. Playground：保留能力，与登录页区分

**理解：**  
**OAuth Playground**（如 `/oauth/playground`）用于试验回调与参数，**不等同于**生产登录页；需在导航标签、配色或图标上做 **「试验 / Demo」** 区分，避免用户以为这是正式登录入口。

**方案方向（草案）：**

- 导航分组名：**「Playground」** 或 **「Sandbox」**，可选用次要色调或 `Beta` / `Demo` 标记。
- 进入 Playground 时可选顶部 **窄条提示**：「此处用于调试 OAuth 流程，正式登录请使用 Sign in」。
- 路由保持现有或迁移至 `/playground/oauth`（可选，涉及重定向与书签兼容时再定）。

**待深化：**  
是否与标准 `/oauth` 登录入口在导航上并列展示及文案差异。

---

### 5. MCP Function Calling API（对齐 web-scripts）

**理解：**  
提供 **HTTP MCP**（GET manifest + POST 执行 tools），使 Cursor / 其他 Agent 能通过 **JSON-RPC**（及可选 legacy `{ tool, params }`）调用一组**稳定命名的工具**，例如：

- 查询服务状态 / 健康说明；
- **发起或查询登录相关操作**（需在安全模型上严格限定：通常不应让 Agent 代替人类完成 TOTP/WebAuthn，更合理的是 **文档查询、配置校验、生成测试密钥、构造示例 URL** 等）；
- 与 **OpenAPI** 并列时，优先 MCP 给 Agent 省 token。

**参考实现（vercel-web-scripts）：**

- `initializer/mcp/`：`createMCPHttpServer`、`tool` + Zod、`mcpResponse` / JSON-RPC 封装；
- `app/api/mcp/route.ts`：GET manifest、POST 执行；
- `app/api/mcp/headers/route.ts`：向已授权身份暴露 endpoint + 配置头（如 `x-api-key`）；
- 环境变量：如 `SCRIPTS_MCP_HEADERS`（JSON）解析为默认请求头；鉴权：**Session Cookie 或 API Key**。

**方案方向（草案）：**

- 在 Signet 中新增 **`/api/mcp`**（及可选 **`/api/mcp/headers`**），复用与 web-scripts 相同的协议形状，降低 Agent 侧适配成本。
- 新建 **`VERCEL_2FA_MCP_HEADERS`**（或统一命名）存放服务端要求的鉴权头 JSON；工具清单单独文件注册（类似 `scriptMcpTools.ts`）。
- **工具范围 v1** 建议保守：**只读 + 生成类**（例如校验 `ALLOWED_REDIRECT_URLS` 配置说明、生成 ECDH 测试密钥对、返回集成文档 resource URI），避免远程无监督完成敏感登录。

**待深化：**  
工具白名单、速率限制、是否与现有 `integrationAuth` 模式共用、是否暴露 `resources/read` 挂载 README 片段。

---

### 6. 整体样式与页头重构

**理解：**  
在以上 IA 调整基础上，**重做全局导航与关键页面布局**：新版页头（Logo / 主 CTA / 分组菜单 / 移动端抽屉）、间距与字体层级、浅色/深色一致性（若保留）。

**方案方向（草案）：**

- 新建设计 tokens（CSS 变量或 Tailwind 扩展），替换当前单一 `bg-indigo-500` 顶栏。
- 页头结构建议：**左侧品牌 + 中间主导航 + 右侧 GitHub / （可选）登录状态**。
- **响应式**：小屏折叠为汉堡菜单，「登录」仍为显眼按钮。

**待深化：**  
是否引入 Headless UI / Radix / 现有组件库；与 Vercel 品牌指南的距离（内部工具可简化）。

**样式与页头的具体拆分、模板与 tokens，见第四章起；重构时应先做模块与 tokens，再做逐页换肤。**

---

## 四、当前路由与页面类型（基线）

拆分模块时与现有实现对齐（后续可选迁移到 `/tools/*` 等前缀）：

| 路由                          | 页面类型           | 说明                              |
| ----------------------------- | ------------------ | --------------------------------- |
| `/`                           | 营销 / 入口        | 首页；重构后以「去登录」为主 CTA  |
| `/login`                      | **认证网关**       | TOTP/WebAuthn；未来将承载会话短路 |
| `/login/blank`                | 登录后展示         | Token / claims 查看               |
| `/oauth`                      | 认证网关（OAuth）  | ECDH + 加密令牌                   |
| `/oauth/playground`           | **Sandbox**        | 调试回调；与正式登录视觉隔离      |
| `/getting-started`            | 文档枢纽           | Overview / Env / Integration 等   |
| `/totp`、`/webauthn`、`/ecdh` | 工具为主（含说明） | 导航上归入 **Tools** 心智         |

全局另有 **Assist Sidebar**（`AssistSidebar*`）；重构时需约定与顶栏的层级与焦点顺序（见 7.4）。

---

## 五、前端模块拆分（应该如何拆）

原则：**先壳层 → 导航 → 页面模板 → 业务区块 → Tokens**，再在模板内换肤；避免在单个巨型 `Nav` 或 `layout` 内堆叠样式与分支。

### 5.1 分层模型（逻辑结构）

```
AppShell（root layout）
├── AppHeader（sticky 顶栏）
├── OptionalRouteBanner（仅 Playground 等 Sandbox 路由）
├── Main（max-width + 横向 padding + min-height）
│   └── PageTemplate（按路由选用其一）
└── AssistSidebar（浮动入口；打开层与 Header 协同 z-index）
```

### 5.2 代码模块与职责（建议）

| 模块                  | 建议落地路径（可与现有 `app/Nav` 渐进合并）              | 职责                                                          | 明确不包含        |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------------- | ----------------- |
| **Design Tokens**     | `app/globals.css` 的 `:root` 或 `app/styles/theme.css`   | 语义色、字阶、间距刻度、`--header-height`、圆角/阴影          | 业务字符串        |
| **AppShell**          | `app/layout.tsx` + 可选 `components/layout/AppShell.tsx` | Provider、字体、Analytics、`main` 包裹                        | 登录表单字段      |
| **AppHeader**         | `components/AppHeader/`（或重构后的 `app/Nav/`）         | 品牌、导航渲染、主 CTA、GitHub、移动抽屉                      | 页面正文          |
| **Navigation Config** | `config/navigation.ts`（由 `constants.ts` 演进）         | 分组、`href`、可选 `badge`、`variant: 'default' \| 'sandbox'` | 具体 CSS 数值     |
| **Nav Primitives**    | `NavLink`、`NavGroup`、`MobileDrawer`、`ToolsMenu`       | 焦点可见性、键盘导航、hover/active                            | 权限逻辑          |
| **Page Templates**    | `components/page-templates/*.tsx`                        | 统一标题区、可选面包屑、内容最大宽度                          | TOTP 算法等域逻辑 |
| **Feature Blocks**    | 各路由下 `components/*`                                  | 表单、QR、PEM 展示等业务 UI                                   | 顶栏              |

### 5.3 页面模板（按「用户任务」拆分）

同一模板共享布局与纵向节奏；页面只填「标题 / 描述 / 主体」。

| 模板                    | 适用路由                      | 布局与节奏要点                                                                                      |
| ----------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| **HomeTemplate**        | `/`                           | Hero：一句价值命题 + **唯一主 CTA（Sign in）**；次级：Docs / Tools 链接卡片；避免与导航重复过多链接 |
| **AuthGatewayTemplate** | `/login`、`/oauth`            | 单列居中卡片；背景使用 `--color-bg` + 极弱纹理或纯色；干扰链接最少                                  |
| **PostAuthTemplate**    | `/login/blank`                | 较宽阅读宽度；claims 表格 monospace；次要操作链接弱化                                               |
| **DocHubTemplate**      | `/getting-started`            | 正文 `max-width` ~65ch；代码块统一；可选锚点侧栏（大屏）                                            |
| **ToolPageTemplate**    | `/totp`、`/webauthn`、`/ecdh` | **标题 + 一句话说明 + 工具操作区**（表单/按钮）+ 可折叠「原理 / 注意」                              |
| **PlaygroundTemplate**  | `/oauth/playground`           | **Sandbox 警示条**（见 6.4）+ 调试控件区；卡片表面色与 Auth 区分                                    |

模板 props 建议收敛为：`title`、`description?`、`children`、`variant?`，避免每页复制 `container mx-auto py-10`。

### 5.4 页头重构方案（多模块 + 移动端）

模块多（Docs、Tools 三项、Playground、MCP、登录 CTA、GitHub）时，页头要靠 **「一份配置 + 两套布局（桌面横排 / 移动抽屉）」** 承载，而不是把链接在平面上全部铺开。

#### 5.4.1 信息架构：三类条目

| 类型         | 包含什么                                                                                      | 交互形态                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **一级直达** | Docs（→ `/getting-started`）、Playground（→ `/oauth/playground`）、MCP（→ 文档锚点，`_self`） | 桌面：横向链接；移动：抽屉内列表项                                                                                                    |
| **分组折叠** | Tools：ECDH、TOTP、WebAuthn                                                                   | 桌面：**下拉面板 / Hover flyout**（鼠标）或 **点击展开的 Disclosure**（兼顾触控板）；移动：**抽屉内 Accordion** 一节「Tools」展开三项 |
| **全局动作** | Sign in、GitHub                                                                               | 与内容导航区分（按钮 / icon），不参与「分组标题」                                                                                     |

原则：**默认不把 7+ 个同级链接并排放在窄屏上**；Tools 必须折叠为一组，避免横滑或换行三行。

#### 5.4.2 桌面端（≥ md）布局

```
[ Logo ]   Docs   [ Tools ▾ ]   Playground   MCP      [ Sign in ]   [GitHub○]
```

- **Tools ▾**：面板内垂直列表 + 可选图标；面板宽度固定（如 `min-w-[12rem]`），避免过长 href 折行难看。
- **Playground**：使用 `variant: sandbox` 的样式 token（字色略弱或左边小竖条），与 Docs 区分。
- **Sign in**：唯一 `primary` 实心按钮；GitHub 为 `ghost` icon-only。
- **键盘**：`Tab` 顺序为 Logo → 各链接 → Tools（展开后子链）→ CTA → GitHub；Tools 面板 **Esc** 关闭并把焦点回到触发器。

#### 5.4.3 移动端（< md）布局（推荐）

**顶栏一行（sticky，`--header-height`）——始终暴露最高优先级：**

```
[ Logo ]                    [ Sign in ]   [ ☰ ]
```

- **Sign in 留在顶栏右侧**（可 `sm` 文本按钮或图标+「登录」），保证集成用户 **无需打开菜单即可登录**。
- **汉堡仅打开导航**，不把登录藏进二层。

**抽屉内容自上而下顺序：**

1. **可选**：一行次要文案「文档与工具」或留空（勿再放一个大号 Sign in 重复主按钮，除非顶栏空间极小）。
2. **Docs**、**Playground**、**MCP** —— 单列全宽点击区域（`min-h-[44px]` 触控友好）。
3. **Tools（Accordion 标题）** —— 展开后 ECDH / TOTP / WebAuthn 缩进列表。
4. **GitHub** —— 置底或紧随 Tools，避免与 Sign in 抢视觉。

**抽屉行为：** 打开时 **锁 body scroll**；**焦点陷阱**（focus trap）；**Esc** 关闭；关闭后焦点回到汉堡按钮（避免焦点丢失）。**z-index** 高于 Assist Sidebar 触发条，避免菜单挡不住浮球。

#### 5.4.4 配置驱动（与代码模块对齐）

`config/navigation.ts`（示例结构意向）：

```text
sections: [
  { type: 'link', id: 'docs', label, href },
  { type: 'group', id: 'tools', label, items: [{ label, href, icon? }, ...] },
  { type: 'link', id: 'playground', label, href, variant: 'sandbox' },
  { type: 'link', id: 'mcp', label, href, external?: false },
]
actions: [
  { type: 'cta', id: 'sign-in', label, href, prominence: 'primary' },
  { type: 'icon', id: 'github', href, ariaLabel },
]
```

同一数组由 **`AppHeaderDesktop`** 与 **`AppHeaderMobileDrawer`** 渲染，避免外链列表分叉维护。

#### 5.4.5 可达性与 SEO

- 汉堡按钮：`aria-expanded`、`aria-controls` 指向抽屉容器 id。
- 当前路由：`aria-current="page"` 作用于对应 `NavLink`（桌面与抽屉内同步高亮）。
- MCP、Docs 若仅为站内锚点，无需 `target=_blank`；外链才加 `rel`。

#### 5.4.6 与其它模块的边界

- **OptionalRouteBanner**（Playground）在 **Header 之下**，不占顶栏高度，避免顶栏双条拥挤。
- **Assist Sidebar**：小屏若与抽屉冲突，以抽屉为优先（Assist 层级略低于抽屉或抽屉打开时隐藏 Assist 触发）。

---

## 六、各模块包含内容与展示规范

### 6.1 AppHeader（全新页头）

| 区块         | 包含内容                                                                           | 展示规则                                                  |
| ------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 品牌         | 产品名、回 `/`                                                                     | 左对齐；字重高于普通导航链接                              |
| 主导航       | Docs（Getting Started）、Tools（ECDH / TOTP / WebAuthn）、Playground、MCP 文档入口 | 中左；**Playground** 使用次要样式或 `Sandbox`/`Demo` 角标 |
| 主 CTA       | 「Sign in」→ `/login`                                                              | **全站唯一实心主按钮**（使用 `--color-primary`）          |
| 辅助         | GitHub                                                                             | 图标按钮；圆形 hover 底                                   |
| 可选（后续） | 已登录状态                                                                         | 仅在服务端/客户端能可靠判定时展示，避免闪烁误导           |

**移动端细则见 [5.4.3](#543-移动端-md布局推荐)**：**Sign in 固定在顶栏**；多链接进 **抽屉 + Tools Accordion**。

### 6.2 Docs 模块（非核心）

| 包含内容                                                | 展示规范                                                       |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| 现有 Getting Started 各区块（环境、集成、OAuth 说明等） | **DocHubTemplate**；层级用 `h2/h3` + 间距刻度统一              |
| 与工具页关系                                            | 文内 prominent 链接：「打开 TOTP 二维码工具 →」指向 `/totp` 等 |

### 6.3 Tools 模块

| 页面        | 模块包含内容                    | 展示规范                                                                  |
| ----------- | ------------------------------- | ------------------------------------------------------------------------- |
| `/ecdh`     | 密钥对生成、PEM、复制、用途说明 | **ToolPageTemplate**；输出区 monospace + Copy；警示「演示密钥勿用于生产」 |
| `/totp`     | Secret、issuer、账户名、QR      | 表单与 QR **栅格对齐**；QR 固定尺寸减少 CLS                               |
| `/webauthn` | 注册/断言演示（依现有功能）     | 步骤序号或简短 Stepper；错误用 inline alert                               |

导航：**Tools** 分组下三项并列；可选 **16px 级图标**（钥匙 / 二维码 / 指纹）提升扫描性。

### 6.4 Playground 模块（与登录区分）

| 包含内容            | 展示规范                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 现有 OAuth 调试能力 | **PlaygroundTemplate**：主内容 **顶部** `OptionalRouteBanner`（amber 或 neutral + 左边框），文案示例：「Sandbox · 用于调试 OAuth 回调，非生产登录入口」 |
| 视觉差异            | 卡片使用 **`--color-surface-muted`** 或 **虚线边框 token**；不与 `/login` 共用「主表面 + 强阴影」同一套                                                 |

### 6.5 登录网关（核心）

| 包含内容                              | 展示规范                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| TOTP/WebAuthn、`redirectUrl` 合法提示 | **AuthGatewayTemplate**；非法 redirect 沿用错误卡片但与全局 alert token 一致 |
| 会话短路（规划）                      | 已登录：优先 **无表单闪烁**（短 spinner 或直接 302）                         |

### 6.6 MCP（Agent）

| 包含内容                                   | 展示规范                                                                                  |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 对人说明：endpoint、鉴权、`tools` 列表摘要 | Getting Started 新增 **「Agent / MCP」** 章节或锚点；表格列出工具名、危险等级、是否需 Key |
| 页头入口                                   | 「MCP」指向文档锚点即可；**不在导航展示密钥**                                             |

---

## 七、样式重构专项（落地顺序与 Tokens）

### 7.1 推荐顺序（样式角度）

1. **Tokens**：定义语义变量，页头与模板 **只引用 token**，禁止魔法色散落于 TSX。
2. **AppHeader + Nav Primitives + Navigation Config**：结构与非 sandbox/sandbox 样式分支。
3. **五类 PageTemplate + 各标杆页**：每类型至少一页跑通。
4. **OptionalRouteBanner**：仅 playground（及未来其他 Sandbox）。
5. **剩余页面迁移进模板**；最后做暗色（若保留）与动效统一。

### 7.2 建议 Tokens（实现时再填具体色值）

| Token                                       | 用途                                  |
| ------------------------------------------- | ------------------------------------- |
| `--color-bg`                                | 页面背景                              |
| `--color-surface` / `--color-surface-muted` | 卡片、Playground 次要表面             |
| `--color-border` / `--color-border-dashed`  | 分割线、Sandbox 卡片边框              |
| `--color-text` / `--color-text-muted`       | 正文与辅助                            |
| `--color-primary` / `--color-primary-hover` | Sign in 主按钮                        |
| `--color-accent-warning`                    | Playground 警示条                     |
| `--color-danger`                            | 表单错误、非法 redirect               |
| `--header-height`                           | 顶栏高度（与全局 padding-top 协同）   |
| `--radius-card`、`--shadow-card`            | 登录主卡片；Playground 可选用较弱阴影 |

### 7.3 页头信息架构稿（桌面示意）

```
[ Logo · 产品名 ]    Docs ▾    Tools ▾    Playground ⧉    MCP          [ Sign in ]   [ GitHub ○ ]
                      └ GS      └ 三项工具    sandbox 样式    文档锚点      primary      icon
```

### 7.4 Assist Sidebar 与顶栏

- **z-index**：移动抽屉打开时应盖住 Assist 触发钮或统一抬高抽屉层，避免无法关闭。
- **品牌层级**：主色只给 **Sign in**；Assist 保持中性，避免三处抢焦点。

### 7.5 响应式约定

| 断点   | 行为                                 |
| ------ | ------------------------------------ |
| `< md` | 汉堡菜单；Tools 可折叠为单列列表     |
| `≥ md` | 横向分组；Tools 可用下拉减轻横向占用 |

---

## 八、总体推荐实施顺序（功能 + 样式交叉）

1. **Navigation Config + AppHeader 骨架**（可先保留旧色，结构先行）。
2. **Design Tokens + 替换顶栏硬编码色**。
3. **PageTemplate 五类 + 标杆页**。
4. **会话短路**（`/login` 服务端）与 redirect 测试矩阵。
5. **Playground OptionalRouteBanner + 模板套用**。
6. **MCP v1** + Getting Started 文档章节。
7. **可选**：路由前缀 `/tools/*`、页头登录态、暗色模式。

---

## 九、风险与依赖

- **会话短路** 若实现不当可能引入 **开放重定向或 Token 滥用**：必须复用现有 `isAllowedRedirectUrl` 与 Cookie 策略。
- **MCP** 暴露面扩大：**必须 API Key 或等价鉴权**，默认最小工具集。
- **Playground 与正式登录** 依赖 **模板 + Banner + 边框 token** 三重区分，仅靠文案不够。
- **模板泛滥**：约束模板数量为上述 6 类，新增页面须先归类再扩展。

---

## 十、开放问题（需要与你确认）

1. 「已登录直接跳走」是否 **仅限同站 redirectUrl**，还是包含白名单内的第三方 origin？
2. 短路时是否 **重新签发 JWT**（新 `iat/exp`），还是复用会话内已有 token？
3. MCP 工具集中，**禁止**哪些操作（例如绝不暴露「代替用户完成 2FA」）？
4. 首页默认落地是否改为 **`/login`**，还是保留 `/` 但首屏仅登录 CTA？
5. **Tools** 是否一期就做路由前缀迁移（`/tools/totp`），还是先只改导航分组与模板？

---

文档版本：**草案 v2.1**  
变更摘要：v2 补充路由基线、模块拆分、页面模板、展示规范与 Tokens；**v2.1 新增 §5.4**——多模块页头的桌面/移动布局、配置驱动与无障碍要点。
