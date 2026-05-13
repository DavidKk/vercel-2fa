---
name: signet-consumer-integration
description: Signet（vercel-2fa）消费端接入 — 托管 signet-client.mjs、HTTP MCP 工具与实例、与 vercel-web-scripts 对齐。涉及「接入 Signet」「/oauth hash」「MCP signet_*」「stripLoginCallbackFromUrl」时使用。
---

# Signet 消费端接入

## 必读顺序

1. 本仓库 **`README.zh-CN.md`** →「作为统一登录服务」「静态 ESM SDK」。
2. 已连接 **`/api/mcp`** 时，先用工具拿 **当前部署 `origin`** 与 **`sdkExports` / `mcpExamples`**，避免手写错域名或漏参。

## 托管 SDK（`…/sdk/signet-client.mjs`）

| 导出                                       | 用途                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------- |
| `normalizeAuthCenterOrigin`                | Signet 根 URL 去尾 `/`                                               |
| `getVerifyApiUrl` / `getOAuthPublicKeyUrl` | 验票、ECDH 公钥接口完整 URL                                          |
| `buildLoginUrl` / `buildOAuthLoginUrl`     | 发起 `/login` 或 `/oauth`                                            |
| `parseLoginCallbackParams`                 | 从 **完整 URL / hash / query / URLSearchParams** 取 `token`、`state` |
| `getLoginCallbackFromWindow`               | 浏览器：`location.href` 上解析                                       |
| `stripLoginCallbackFromUrl`                | 从 query **和** hash 去掉 `token`/`state`，配合 `replaceState`       |
| `isLoginCallbackTokenInHash`               | 判断是否典型 `/oauth` hash 回跳                                      |
| `verifyTokenAtAuthCenter`                  | `POST /api/auth/verify`                                              |

**Next：** `import(/* webpackIgnore: true */ sdkUrl)` + **缓存**同一 Promise（见 vercel-web-scripts `loadSignetSdk`）。

## MCP 工具与调用示例（JSON 参数）

调用 **`signet_get_integration_guide`** 可一次性拿到 `hostedSdkUrl`、`sdkExports`、`mcpExamples`、`pitfalls`。

典型参数（复制到 MCP `arguments`）：

```json
{
  "name": "signet_get_integration_guide",
  "arguments": { "framework": "nextjs", "encryptedReturn": true }
}
```

```json
{
  "name": "signet_build_login_url",
  "arguments": {
    "redirectUrl": "https://your-app.example.com/auth/callback",
    "state": "550e8400-e29b-41d4-a716-446655440000",
    "encryptedReturn": false
}
```

```json
{
  "name": "signet_validate_redirect_url",
  "arguments": { "redirectUrl": "https://your-app.example.com/auth/callback" }
}
```

`encryptedReturn: true` 时 **`signet_build_login_url`** 必须带 **`clientPublicKey`**（见工具 schema）。

## 与 vercel-web-scripts 对齐

- `lib/signet-sdk-url.ts` — `getSignetSdkModuleUrl()`
- `lib/load-signet-sdk.ts` — `loadSignetSdk()`
- `/auth/vercel-2fa/callback` — `/login` 回跳：服务端 `parseLoginCallbackParams(searchParams)` + `verifyTokenAtAuthCenter`
- OAuth — `buildOAuthLoginUrl`；回调 `parseLoginCallbackParams(href)`；成功后可 **`await stripLoginCallbackFromUrl`**（经 SDK）

## 反例

1. `/oauth` 回调只用 `useSearchParams()` → 永远无 token。
2. Route Handler 从 `request.url` 读 hash 里的 token → **不可能**。
3. 未配 `ALLOWED_REDIRECT_URLS` → 跨域回调被拒。

## 不要做的事

不要让 AI **代填密码、代过 2FA、冒充用户**操作 Signet。

## 维护清单（改一处、同步多处）

- `public/sdk/signet-client.mjs`
- `services/mcp/signetIntegrationShared.ts`（MCP skill + Getting Started 片段）
- `services/mcp/signetTools.ts`
- `README.md` / `README.zh-CN.md`
- 本 SKILL
