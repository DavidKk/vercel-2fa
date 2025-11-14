'use client'

import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import { useState } from 'react'

type Tab = 'overview' | 'totp' | 'webauthn' | 'integration' | 'env'

export function GettingStartedContent() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-4">
          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3 py-1.5 rounded-md transition-colors text-sm ${
                activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FeatherIcon icon="home" size={16} />
                <span>概览</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('totp')}
              className={`w-full text-left px-3 py-1.5 rounded-md transition-colors text-sm ${
                activeTab === 'totp' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FeatherIcon icon="smartphone" size={16} />
                <span>TOTP 设置</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('webauthn')}
              className={`w-full text-left px-3 py-1.5 rounded-md transition-colors text-sm ${
                activeTab === 'webauthn' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FeatherIcon icon="shield" size={16} />
                <span>WebAuthn 设置</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('integration')}
              className={`w-full text-left px-3 py-1.5 rounded-md transition-colors text-sm ${
                activeTab === 'integration' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FeatherIcon icon="link" size={16} />
                <span>第三方接入</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('env')}
              className={`w-full text-left px-3 py-1.5 rounded-md transition-colors text-sm ${
                activeTab === 'env' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FeatherIcon icon="settings" size={16} />
                <span>环境变量</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'totp' && <TOTPContent />}
          {activeTab === 'webauthn' && <WebAuthnContent />}
          {activeTab === 'integration' && <IntegrationContent />}
          {activeTab === 'env' && <EnvironmentContent />}
        </div>
      </div>
    </div>
  )
}

function OverviewContent() {
  return (
    <div className="prose max-w-none prose-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-3">欢迎使用双因素认证服务</h2>

      <p className="text-gray-600 text-sm mb-4">这是一个基于 TOTP 和 WebAuthn 标准的双因素认证服务，可以作为独立的认证中心为多个应用提供统一的身份验证服务。</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-indigo-100 rounded-lg p-1.5">
              <FeatherIcon icon="smartphone" size={20} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">TOTP 认证</h3>
          </div>
          <p className="text-gray-600 text-xs mb-3">基于时间的一次性密码，兼容 Google Authenticator、Authy 等应用</p>
          <Link href="/totp" className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
            前往设置 →
          </Link>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 rounded-lg p-1.5">
              <FeatherIcon icon="shield" size={20} className="text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">WebAuthn 认证</h3>
          </div>
          <p className="text-gray-600 text-xs mb-3">支持生物识别、硬件密钥等安全认证方式</p>
          <Link href="/webauthn" className="text-green-600 hover:text-green-700 text-xs font-medium">
            前往设置 →
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
        <div className="flex items-start gap-2">
          <FeatherIcon icon="info" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1.5 text-sm">快速开始</h4>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>配置环境变量（至少需要配置一种 2FA 方式）</li>
              <li>生成 TOTP 密钥或注册 WebAuthn 凭证</li>
              <li>配置允许的重定向 URL 白名单</li>
              <li>外部应用接入登录服务</li>
            </ol>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-3">主要特性</h3>
      <div className="space-y-3 mb-5">
        <div className="flex items-start gap-2">
          <div className="bg-indigo-100 rounded-full p-0.5 mt-0.5 flex-shrink-0">
            <FeatherIcon icon="check" size={14} className="text-indigo-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">统一身份认证中心</h4>
            <p className="text-gray-600 text-xs">作为 SSO 服务，为多个应用提供统一的双因素认证</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="bg-indigo-100 rounded-full p-0.5 mt-0.5 flex-shrink-0">
            <FeatherIcon icon="check" size={14} className="text-indigo-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">安全的 JWT Token</h4>
            <p className="text-gray-600 text-xs">使用 JWT 标准，支持自定义过期时间和负载信息</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="bg-indigo-100 rounded-full p-0.5 mt-0.5 flex-shrink-0">
            <FeatherIcon icon="check" size={14} className="text-indigo-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">重定向 URL 白名单</h4>
            <p className="text-gray-600 text-xs">防止开放重定向漏洞，支持通配符配置</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="bg-indigo-100 rounded-full p-0.5 mt-0.5 flex-shrink-0">
            <FeatherIcon icon="check" size={14} className="text-indigo-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">CSRF 防护</h4>
            <p className="text-gray-600 text-xs">支持 state 参数，保护登录流程安全</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <FeatherIcon icon="alert-triangle" size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1.5 text-sm">安全提醒</h4>
            <ul className="text-xs text-yellow-800 space-y-0.5 list-disc list-inside">
              <li>请妥善保管 JWT_SECRET，不要泄露</li>
              <li>生产环境使用强密码和安全的密钥</li>
              <li>定期更换密钥和凭证</li>
              <li>只在白名单中添加可信的重定向 URL</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function TOTPContent() {
  return (
    <div className="prose max-w-none prose-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-3">TOTP 设置指南</h2>

      <p className="text-gray-600 text-sm mb-4">
        TOTP (Time-based One-Time Password) 是一种基于时间的一次性密码算法，兼容 Google Authenticator、Microsoft Authenticator、Authy 等验证器应用。
      </p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-indigo-900 mb-2">📱 第一步：生成 TOTP 密钥</h3>
        <ol className="text-indigo-800 text-sm space-y-1 list-decimal list-inside mb-3">
          <li>
            访问{' '}
            <Link href="/totp" className="text-indigo-600 hover:underline font-medium">
              /totp
            </Link>{' '}
            页面
          </li>
          <li>输入用户名（建议使用 admin 或你的用户名）</li>
          <li>输入应用名称（如：My App 2FA）</li>
          <li>点击"生成"按钮</li>
        </ol>
        <Link href="/totp" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
          <FeatherIcon icon="arrow-right" size={16} />
          前往生成 TOTP 密钥
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">🔑 第二步：保存密钥</h3>
        <p className="text-blue-800 mb-4">生成后你会看到：</p>
        <ul className="text-blue-800 space-y-2 list-disc list-inside mb-4">
          <li>
            <strong>QR Code</strong>：使用手机验证器应用扫描
          </li>
          <li>
            <strong>Secret</strong>：TOTP 密钥（例如：JBSWY3DPEHPK3PXP）
          </li>
        </ul>
        <div className="bg-white rounded border border-blue-300 p-4">
          <p className="text-sm font-mono text-gray-700">ACCESS_TOTP_SECRET=JBSWY3DPEHPK3PXP</p>
        </div>
        <p className="text-sm text-blue-700 mt-3">⚠️ 请将这个密钥保存到环境变量中</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">📲 第三步：绑定验证器</h3>
        <p className="text-green-800 mb-4">使用任意 TOTP 验证器应用扫描二维码：</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="bg-white rounded-lg p-3 border border-green-300 mb-2">
              <FeatherIcon icon="smartphone" size={32} className="text-green-600 mx-auto" />
            </div>
            <p className="text-sm text-green-800">Google Authenticator</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-3 border border-green-300 mb-2">
              <FeatherIcon icon="smartphone" size={32} className="text-green-600 mx-auto" />
            </div>
            <p className="text-sm text-green-800">Microsoft Authenticator</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-3 border border-green-300 mb-2">
              <FeatherIcon icon="smartphone" size={32} className="text-green-600 mx-auto" />
            </div>
            <p className="text-sm text-green-800">Authy</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-3 border border-green-300 mb-2">
              <FeatherIcon icon="smartphone" size={32} className="text-green-600 mx-auto" />
            </div>
            <p className="text-sm text-green-800">1Password</p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-3">✅ 第四步：测试验证</h3>
        <p className="text-purple-800 mb-4">在同一页面测试你的 TOTP 验证码：</p>
        <ol className="text-purple-800 space-y-2 list-decimal list-inside">
          <li>在验证器应用中查看当前的 6 位验证码</li>
          <li>在"验证"部分输入这个验证码</li>
          <li>点击"验证"按钮</li>
          <li>如果显示"✓ Token is valid"，说明配置成功</li>
        </ol>
      </div>
    </div>
  )
}

function WebAuthnContent() {
  return (
    <div className="prose max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">WebAuthn 设置指南</h2>

      <p className="text-gray-600 mb-6">WebAuthn 是一种现代的无密码认证标准，支持指纹识别、面容识别、硬件密钥（如 YubiKey）等多种安全认证方式。</p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3">🔐 第一步：注册 WebAuthn 凭证</h3>
        <ol className="text-indigo-800 space-y-2 list-decimal list-inside mb-4">
          <li>
            访问{' '}
            <Link href="/webauthn" className="text-indigo-600 hover:underline font-medium">
              /webauthn
            </Link>{' '}
            页面
          </li>
          <li>输入用户名（建议使用 admin 或你的用户名）</li>
          <li>输入显示名称（如：Admin User）</li>
          <li>输入 RP ID（域名，如：localhost 或 example.com）</li>
          <li>点击"注册"按钮</li>
        </ol>
        <Link href="/webauthn" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
          <FeatherIcon icon="arrow-right" size={16} />
          前往注册 WebAuthn 凭证
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">🎯 第二步：完成身份验证</h3>
        <p className="text-blue-800 mb-4">浏览器会提示你选择验证方式：</p>
        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-3">
            <FeatherIcon icon="smartphone" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">生物识别</p>
              <p className="text-sm text-blue-700">使用指纹识别、面容识别等</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FeatherIcon icon="shield" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">硬件密钥</p>
              <p className="text-sm text-blue-700">插入 YubiKey 或其他 FIDO2 设备</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FeatherIcon icon="key" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">平台验证器</p>
              <p className="text-sm text-blue-700">使用设备内置的安全验证</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">💾 第三步：保存凭证信息</h3>
        <p className="text-green-800 mb-4">注册成功后，页面会显示凭证信息（JSON 格式）：</p>
        <div className="bg-white rounded border border-green-300 p-4 mb-4">
          <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all">
            {`{
  "id": "...",
  "publicKey": "...",
  "counter": 0,
  "rpId": "localhost"
}`}
          </pre>
        </div>
        <p className="text-sm text-green-700 mb-3">⚠️ 将完整的 JSON 保存到环境变量中：</p>
        <div className="bg-white rounded border border-green-300 p-4">
          <p className="text-sm font-mono text-gray-700 break-all">ACCESS_WEBAUTHN_SECRET=&#123;"id":"...","publicKey":"..."&#125;</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ 重要提示</h3>
        <ul className="text-yellow-800 space-y-2 list-disc list-inside">
          <li>
            <strong>RP ID 必须匹配</strong>：生产环境的 RP ID 必须是你的域名（不含 https:// 和端口号）
          </li>
          <li>
            <strong>HTTPS 要求</strong>：WebAuthn 在生产环境需要 HTTPS（localhost 除外）
          </li>
          <li>
            <strong>凭证绑定</strong>：凭证与设备绑定，更换设备需要重新注册
          </li>
          <li>
            <strong>备份方案</strong>：建议同时启用 TOTP 作为备用认证方式
          </li>
        </ul>
      </div>
    </div>
  )
}

function IntegrationContent() {
  return (
    <div className="prose max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">第三方应用接入指南</h2>

      <p className="text-gray-600 mb-6">本服务可以作为统一的身份认证中心（SSO），为多个外部应用提供双因素认证服务。</p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3">🔄 接入流程</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-indigo-900 text-sm font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">发起登录请求</h4>
              <p className="text-indigo-800 text-sm mb-2">外部应用将用户重定向到登录页面：</p>
              <div className="bg-white rounded border border-indigo-300 p-3">
                <code className="text-xs text-gray-700 break-all">https://your-2fa-domain.com/login?redirectUrl=https://your-app.com/callback&state=random-string</code>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-indigo-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-indigo-900 text-sm font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">用户完成认证</h4>
              <p className="text-indigo-800 text-sm">用户输入用户名、密码和双因素验证码</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-indigo-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-indigo-900 text-sm font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">获取 JWT Token</h4>
              <p className="text-indigo-800 text-sm mb-2">系统自动跳转回应用，携带 token：</p>
              <div className="bg-white rounded border border-indigo-300 p-3">
                <code className="text-xs text-gray-700 break-all">https://your-app.com/callback?token=eyJhbGciOiJIUzI1NiIs...&state=random-string</code>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-indigo-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-indigo-900 text-sm font-bold">4</span>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">验证 Token</h4>
              <p className="text-indigo-800 text-sm">外部应用验证 token 并创建本地会话</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">方式 A：共享密钥验证</h3>
          <p className="text-blue-800 text-sm mb-4">适合内部系统，使用相同的 JWT_SECRET：</p>
          <div className="bg-white rounded border border-blue-300 p-3 mb-3">
            <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
              {`import jwt from 'jsonwebtoken'

const payload = jwt.verify(
  token, 
  JWT_SECRET
)
// 创建本地会话`}
            </pre>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <FeatherIcon icon="check-circle" size={16} />
            <span>简单高效</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">方式 B：API 验证</h3>
          <p className="text-green-800 text-sm mb-4">适合第三方系统，调用验证接口：</p>
          <div className="bg-white rounded border border-green-300 p-3 mb-3">
            <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
              {`const res = await fetch(
  '/api/auth/verify',
  {
    method: 'POST',
    body: JSON.stringify({ token })
  }
)
const data = await res.json()`}
            </pre>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <FeatherIcon icon="shield" size={16} />
            <span>无需共享密钥</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-3">📝 完整示例（React）</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-purple-800 mb-2 font-medium">1. 发起登录：</p>
            <div className="bg-white rounded border border-purple-300 p-3">
              <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                {`function handleLogin() {
  const state = crypto.randomUUID()
  sessionStorage.setItem('oauth_state', state)
  
  const callback = window.location.origin + '/callback'
  const url = \`https://auth.example.com/login?\${new URLSearchParams({
    redirectUrl: callback,
    state
  })}\`
  
  window.location.href = url
}`}
              </pre>
            </div>
          </div>

          <div>
            <p className="text-sm text-purple-800 mb-2 font-medium">2. 处理回调：</p>
            <div className="bg-white rounded border border-purple-300 p-3">
              <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                {`function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const state = params.get('state')
    
    // 验证 state
    if (state !== sessionStorage.getItem('oauth_state')) {
      throw new Error('Invalid state')
    }
    
    // 验证 token 并创建会话
    verifyAndCreateSession(token)
  }, [])
  
  return <div>Processing...</div>
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">🔒 安全建议</h3>
        <ul className="text-yellow-800 space-y-2 list-disc list-inside text-sm">
          <li>
            <strong>配置白名单</strong>：在 ALLOWED_REDIRECT_URLS 中添加可信的回调地址
          </li>
          <li>
            <strong>使用 State</strong>：每次登录生成随机 state 参数，防止 CSRF 攻击
          </li>
          <li>
            <strong>Token 有效期</strong>：默认 5 分钟，收到后立即验证并创建会话
          </li>
          <li>
            <strong>HTTPS</strong>：生产环境必须使用 HTTPS 保护传输安全
          </li>
          <li>
            <strong>密钥管理</strong>：定期更换 JWT_SECRET，妥善保管密钥
          </li>
        </ul>
      </div>
    </div>
  )
}

function EnvironmentContent() {
  return (
    <div className="prose max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">环境变量配置</h2>

      <p className="text-gray-600 mb-6">以下是所有支持的环境变量及其说明。</p>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <FeatherIcon icon="alert-circle" size={20} className="text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">必需配置</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">ACCESS_USERNAME</code>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">必需</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">管理员用户名</p>
              <div className="bg-gray-50 rounded p-3">
                <code className="text-xs text-gray-700">ACCESS_USERNAME=admin</code>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">ACCESS_PASSWORD</code>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">必需</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">管理员密码（建议使用强密码）</p>
              <div className="bg-gray-50 rounded p-3">
                <code className="text-xs text-gray-700">ACCESS_PASSWORD=your-secure-password</code>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">JWT_SECRET</code>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">必需</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">JWT 签名密钥（至少 32 字符）</p>
              <div className="bg-gray-50 rounded p-3 mb-2">
                <code className="text-xs text-gray-700">JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters</code>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800 mb-2 font-medium">生成安全密钥：</p>
                <code className="text-xs text-blue-700">node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"</code>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <FeatherIcon icon="shield" size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">双因素认证（至少配置一个）</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">ACCESS_TOTP_SECRET</code>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">可选</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">TOTP 验证密钥（Base32 编码）</p>
              <div className="bg-gray-50 rounded p-3 mb-2">
                <code className="text-xs text-gray-700">ACCESS_TOTP_SECRET=JBSWY3DPEHPK3PXP</code>
              </div>
              <Link href="/totp" className="text-sm text-indigo-600 hover:underline">
                → 前往生成 TOTP 密钥
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">ACCESS_WEBAUTHN_SECRET</code>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">可选</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">WebAuthn 凭证（JSON 格式）</p>
              <div className="bg-gray-50 rounded p-3 mb-2">
                <code className="text-xs text-gray-700 break-all">ACCESS_WEBAUTHN_SECRET=&#123;"id":"...","publicKey":"...","rpId":"..."&#125;</code>
              </div>
              <Link href="/webauthn" className="text-sm text-indigo-600 hover:underline">
                → 前往注册 WebAuthn 凭证
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <FeatherIcon icon="settings" size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">可选配置</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">JWT_EXPIRES_IN</code>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">可选</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">JWT Token 过期时间（默认：30d）</p>
              <div className="bg-gray-50 rounded p-3 mb-2">
                <code className="text-xs text-gray-700">JWT_EXPIRES_IN=30d</code>
              </div>
              <p className="text-xs text-gray-500">支持：5m (分钟) / 1h (小时) / 7d (天)</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">ALLOWED_REDIRECT_URLS</code>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">可选</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">允许的重定向 URL 白名单（逗号分隔，支持通配符）</p>
              <div className="bg-gray-50 rounded p-3 mb-2">
                <code className="text-xs text-gray-700 break-all">ALLOWED_REDIRECT_URLS=https://app1.com,https://app2.com,https://*.example.com</code>
              </div>
              <p className="text-xs text-gray-500">如不配置，仅允许相对路径（同域名）跳转</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <FeatherIcon icon="alert-triangle" size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">安全提示</h4>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>生产环境使用强密码和足够长度的 JWT_SECRET</li>
                <li>不要将 .env 文件提交到版本控制系统</li>
                <li>使用 Vercel、AWS Secrets Manager 等安全服务管理密钥</li>
                <li>定期更换密码和密钥</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
