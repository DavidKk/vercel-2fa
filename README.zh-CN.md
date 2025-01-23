[![Build Status](https://github.com/DavidKk/vercel-2fa/actions/workflows/coverage.workflow.yml/badge.svg)](https://github.com/DavidKk/vercel-2fa/actions/workflows/coverage.workflow.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# 二步验证服务

一个简单易用的二步验证服务，基于 TOTP（基于时间的一次性密码）标准，实现更安全的身份验证。

- **用途**：提供更安全的登录验证，减少因密码泄露导致的安全问题。
- **适用场景**：用户登录验证、敏感操作的身份确认等。

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
