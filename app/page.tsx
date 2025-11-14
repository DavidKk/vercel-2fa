import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

import { generate } from '@/components/Meta'

const { generateMetadata } = generate({
  title: 'Two-Factor Authentication Service',
  description: 'A simple and user-friendly two-factor authentication service based on the TOTP standard for enhanced security.',
})

export { generateMetadata }

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium mb-4">
          <FeatherIcon icon="shield" size={14} />
          <span>Secure · Reliable · Easy to Use</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Two-Factor Authentication
          <span className="block text-indigo-600 mt-2 text-3xl md:text-4xl">Service</span>
        </h1>

        <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          Self-hosted authentication center based on TOTP and WebAuthn standards
          <br className="hidden md:block" />
          One login service for all your personal projects
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
          <Link
            href="/getting-started"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FeatherIcon icon="play-circle" size={18} />
            Get Started
          </Link>

          <Link
            href="/login?redirectUrl=/login/blank"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all border-2 border-indigo-600"
          >
            <FeatherIcon icon="log-in" size={18} />
            Try Login
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-indigo-600 mb-1">2</div>
            <div className="text-xs text-gray-600">Auth Methods</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
            <div className="text-xs text-gray-600">Open Source</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-purple-600 mb-1">SSO</div>
            <div className="text-xs text-gray-600">Single Sign-On</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-orange-600 mb-1">5min</div>
            <div className="text-xs text-gray-600">Quick Setup</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Core Features</h2>
            <p className="text-gray-600">Simple yet secure authentication for your projects</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* TOTP */}
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 shadow-sm border border-indigo-100 hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FeatherIcon icon="smartphone" size={24} className="text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">TOTP Authentication</h3>
              <p className="text-gray-600 text-sm mb-3">Time-based one-time password, compatible with Google Authenticator, Microsoft Authenticator, and more</p>
              <Link href="/totp" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm inline-flex items-center gap-2">
                Generate Secret
                <FeatherIcon icon="arrow-right" size={14} />
              </Link>
            </div>

            {/* WebAuthn */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FeatherIcon icon="shield" size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WebAuthn Authentication</h3>
              <p className="text-gray-600 text-sm mb-3">Support for biometrics, hardware keys like YubiKey, and FIDO2-compliant modern authentication</p>
              <Link href="/webauthn" className="text-green-600 hover:text-green-700 font-medium text-sm inline-flex items-center gap-2">
                Register Credential
                <FeatherIcon icon="arrow-right" size={14} />
              </Link>
            </div>

            {/* SSO */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 shadow-sm border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FeatherIcon icon="link" size={24} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unified Auth Center</h3>
              <p className="text-gray-600 text-sm mb-3">One authentication service for all your personal projects, no need to build login for each app</p>
              <Link href="/getting-started" className="text-purple-600 hover:text-purple-700 font-medium text-sm inline-flex items-center gap-2">
                Learn Integration
                <FeatherIcon icon="arrow-right" size={14} />
              </Link>
            </div>

            {/* JWT Token */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-6 shadow-sm border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FeatherIcon icon="key" size={24} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">JWT Token Auth</h3>
              <p className="text-gray-600 text-sm mb-3">Standard JWT token implementation with customizable expiration time for easy user identity verification</p>
              <div className="text-orange-600 font-medium text-sm inline-flex items-center gap-2">
                <FeatherIcon icon="check-circle" size={14} />
                Secure & Reliable
              </div>
            </div>

            {/* Whitelist */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FeatherIcon icon="check-square" size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">URL Whitelist</h3>
              <p className="text-gray-600 text-sm mb-3">Configure allowed redirect URL whitelist to prevent open redirect vulnerabilities, supports wildcard patterns</p>
              <div className="text-blue-600 font-medium text-sm inline-flex items-center gap-2">
                <FeatherIcon icon="shield" size={14} />
                Complete Protection
              </div>
            </div>

            {/* CSRF Protection */}
            <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-6 shadow-sm border border-pink-100 hover:shadow-lg transition-shadow">
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FeatherIcon icon="lock" size={24} className="text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">CSRF Protection</h3>
              <p className="text-gray-600 text-sm mb-3">Built-in state parameter support to protect login flow from cross-site request forgery attacks</p>
              <div className="text-pink-600 font-medium text-sm inline-flex items-center gap-2">
                <FeatherIcon icon="check-circle" size={14} />
                Security First
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How It Works</h2>
            <p className="text-gray-600">Four simple steps to integrate with your projects</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-5 text-center">
              <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-indigo-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">Initiate Login</h4>
              <p className="text-xs text-gray-600">User redirects from your app to auth center</p>
            </div>

            <div className="bg-white rounded-lg p-5 text-center">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">2FA Verification</h4>
              <p className="text-xs text-gray-600">Enter password and verification code to complete authentication</p>
            </div>

            <div className="bg-white rounded-lg p-5 text-center">
              <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">Get Token</h4>
              <p className="text-xs text-gray-600">System generates JWT token and redirects back</p>
            </div>

            <div className="bg-white rounded-lg p-5 text-center">
              <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-orange-600">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">Verify & Login</h4>
              <p className="text-xs text-gray-600">Your app verifies token to complete login</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Get Started?</h2>
          <p className="text-indigo-100 mb-6">Add secure two-factor authentication to all your projects in minutes</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/getting-started"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              <FeatherIcon icon="book-open" size={18} />
              View Documentation
            </Link>

            <Link
              href="/totp"
              className="inline-flex items-center gap-2 bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition-all border-2 border-white"
            >
              <FeatherIcon icon="smartphone" size={18} />
              Generate TOTP Secret
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
