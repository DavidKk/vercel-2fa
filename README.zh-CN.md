[![Build Status](https://github.com/DavidKk/vercel-2fa/actions/workflows/coverage.workflow.yml/badge.svg)](https://github.com/DavidKk/vercel-2fa/actions/workflows/coverage.workflow.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![中文](https://img.shields.io/badge/%E6%96%87%E6%A1%A3-%E4%B8%AD%E6%96%87-green?style=flat-square&logo=docs)](https://github.com/DavidKk/vercel-2fa/blob/main/README.zh-CN.md) [![English](https://img.shields.io/badge/docs-English-green?style=flat-square&logo=docs)](https://github.com/DavidKk/vercel-2fa/blob/main/README.md)

# 二步验证服务

[online](https://vercel-2fa.vercel.app)

一个简单易用的二步验证服务，基于 TOTP（基于时间的一次性密码）和 WebAuthn 标准，实现更安全的身份验证。

- **用途**：为你的多个个人项目提供统一的登录服务，无需为每个项目单独开发登录功能。
- **适用场景**：个人开发者的多个项目、小团队内部应用、自托管服务等。

## 部署到 Vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYourUsername%2Ftwo-factor-auth)

## 快速开始

1. **生成二维码和秘钥**

   - 使用提供的表单输入用户名和应用名称，生成绑定二步验证的 QR 码和 Secret。
   - 将 Secret 存储在服务端，用户扫描 QR 码绑定到自己的验证器（如 Google Authenticator）。

2. **验证用户的动态验证码**
   - 用户输入验证器生成的 6 位动态验证码。
   - 服务端使用存储的 Secret 和 `otplib` 库验证验证码的有效性。

### 示例代码

#### 验证动态验证码

```typescript
import { authenticator } from 'otplib'

const isValid = authenticator.check(token, secret)
if (isValid) {
  console.log('Token is valid!')
} else {
  console.log('Token is invalid or expired.')
}
```

## 功能

- 自动生成二步验证的密钥和绑定 QR 码。
- 验证动态验证码的有效性。
- 支持 Vercel 部署，简单快速上线。

## 注意事项

- **存储安全**：Secret 必须存储在服务端，且不可泄露给用户。
- **时间同步**：确保服务器与客户端的时间同步，避免因时间偏差导致验证失败。

## 环境变量配置

| 变量名                   | 必填 | 说明                                | 示例                                                                      |
| ------------------------ | ---- | ----------------------------------- | ------------------------------------------------------------------------- |
| `ACCESS_USERNAME`        | 是   | 管理员用户名                        | `admin`                                                                   |
| `ACCESS_PASSWORD`        | 是   | 管理员密码                          | `your-secure-password`                                                    |
| `ACCESS_TOTP_SECRET`     | 可选 | TOTP 二步验证密钥                   | `JBSWY3DPEHPK3PXP`                                                        |
| `ACCESS_WEBAUTHN_SECRET` | 可选 | WebAuthn 验证密钥                   | `{"id":"...","publicKey":"..."}`                                          |
| `JWT_SECRET`             | 是   | JWT 令牌签名密钥（至少32字符）      | `your-super-secret-jwt-key-min-32-chars`                                  |
| `JWT_EXPIRES_IN`         | 可选 | JWT 令牌过期时间                    | `30d`（默认30天）                                                         |
| `ALLOWED_REDIRECT_URLS`  | 可选 | 允许的重定向 URL 白名单（逗号分隔） | `https://app1.example.com,https://app2.example.com,https://*.example.com` |

**注意**：

- `ACCESS_TOTP_SECRET` 和 `ACCESS_WEBAUTHN_SECRET` 至少需要配置一个
- `ALLOWED_REDIRECT_URLS` 支持通配符模式，如 `https://*.example.com`
- 如果不配置 `ALLOWED_REDIRECT_URLS`，只允许相对路径跳转（同域名）

## 作为统一登录服务

本系统可以作为你所有个人项目的统一登录入口，一次部署，处处使用。

### 接入流程

#### 1. 你的项目发起登录

将用户重定向到认证中心，携带回调地址：

```
https://your-2fa-domain.com/login?redirectUrl=https://your-app.com/auth/callback&state=random-string
```

**参数说明**：

- `redirectUrl`: 登录成功后的回调地址（需要 URL 编码）
- `state`: （可选）随机字符串，用于防止 CSRF 攻击

#### 2. 用户完成认证

用户输入用户名、密码和二步验证码（TOTP 或 WebAuthn）

#### 3. 获取认证令牌

认证成功后，系统会自动跳转回指定的 `redirectUrl`，并在 URL 中携带 JWT token：

```
https://your-app.com/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&state=random-string
```

#### 4. 验证令牌

外部系统有两种方式验证令牌：

**方式 A：使用共享密钥验证（推荐用于内部系统）**

```typescript
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'your-shared-secret' // 与认证中心相同的密钥

function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    // payload 包含: { username, authenticated, iat, exp }

    if (payload.authenticated) {
      // 验证通过，创建本地会话
      return { success: true, username: payload.username }
    }
  } catch (error) {
    return { success: false, error: 'Invalid token' }
  }
}
```

**方式 B：调用验证 API（适合无法共享密钥的场景）**

```typescript
const response = await fetch('https://your-2fa-domain.com/api/auth/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ token }),
})

const result = await response.json()
if (result.code === 0 && result.data.valid) {
  // 验证通过
  console.log('User:', result.data.payload.username)
}
```

### 安全配置建议

#### 1. 配置 Redirect URL 白名单

在环境变量中配置允许的回调地址：

```bash
ALLOWED_REDIRECT_URLS=https://app1.example.com,https://app2.example.com,http://localhost:3000
```

支持通配符：

```bash
ALLOWED_REDIRECT_URLS=https://*.example.com,https://*.company.com
```

#### 2. 使用 State 参数防止 CSRF

```javascript
// 外部系统发起登录时生成随机 state
const state = crypto.randomUUID()
sessionStorage.setItem('oauth_state', state)

const loginUrl = `https://your-2fa-domain.com/login?redirectUrl=${encodeURIComponent(callbackUrl)}&state=${state}`
window.location.href = loginUrl

// 回调时验证 state
const params = new URLSearchParams(window.location.search)
const returnedState = params.get('state')
if (returnedState !== sessionStorage.getItem('oauth_state')) {
  throw new Error('Invalid state - possible CSRF attack')
}
```

#### 3. Token 有效期管理

- 默认登录 token 有效期为 5 分钟
- 建议外部系统接收 token 后立即验证并创建本地会话
- 不要将短期 token 用于长期会话管理

### 完整示例（React 应用）

```typescript
// 1. 登录按钮点击处理
function handleLogin() {
  const state = crypto.randomUUID()
  sessionStorage.setItem('oauth_state', state)

  const callbackUrl = `${window.location.origin}/auth/callback`
  const loginUrl = `https://your-2fa-domain.com/login?redirectUrl=${encodeURIComponent(callbackUrl)}&state=${state}`

  window.location.href = loginUrl
}

// 2. 回调页面处理 (pages/auth/callback.tsx)
export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const state = params.get('state')

    // 验证 state
    if (state !== sessionStorage.getItem('oauth_state')) {
      console.error('Invalid state')
      return
    }

    // 清除 state
    sessionStorage.removeItem('oauth_state')

    if (token) {
      // 发送到自己的后端验证并创建会话
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }).then(async res => {
        const data = await res.json()
        if (data.success) {
          router.push('/dashboard')
        }
      })
    }
  }, [])

  return <div>正在处理登录...</div>
}
```

### API 端点

#### POST /api/auth/verify

验证 JWT token 的有效性

**请求体**：

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "valid": true,
    "payload": {
      "username": "admin",
      "authenticated": true,
      "iat": 1699999999,
      "exp": 1699999999
    }
  }
}
```

**失败响应**：

```json
{
  "code": 2000,
  "message": "Invalid or expired token",
  "data": null
}
```
