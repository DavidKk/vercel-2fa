import FeatherIcon from 'feather-icons-react'

export function IntegrationContent() {
  return (
    <div className="prose max-w-none prose-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Integrate with Your Projects</h2>

      <p className="text-gray-600 text-sm mb-4">
        Every project simply redirects to this login page, waits for the JWT callback, and then verifies it. No more re-building auth for each repo.
      </p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-indigo-900 mb-2">🔄 Flow overview</h3>
        <div className="space-y-3 text-sm text-indigo-800">
          {[
            { step: '1', title: 'Redirect user', desc: 'Send users to /login?redirectUrl=your-app&state=uuid' },
            { step: '2', title: 'Complete 2FA', desc: 'User enters credentials plus TOTP/WebAuthn' },
            { step: '3', title: 'Receive JWT', desc: 'Service redirects back with token + state' },
            { step: '4', title: 'Verify', desc: 'Your app validates the token and creates its own session' },
          ].map(({ step, title, desc }) => (
            <div className="flex items-start gap-3" key={step}>
              <div className="bg-indigo-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-indigo-900">{step}</div>
              <div>
                <h4 className="font-semibold text-indigo-900 text-sm">{title}</h4>
                <p className="text-[11px]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-blue-900 mb-2">Option A · Shared secret</h3>
          <p className="text-blue-800 text-xs mb-3">Use the same JWT secret inside your project:</p>
          <div className="bg-white rounded border border-blue-200 p-3 mb-2">
            <pre className="text-[11px] font-mono text-gray-700 whitespace-pre-wrap">
              {`import jwt from 'jsonwebtoken'

const payload = jwt.verify(token, process.env.JWT_SECRET)
if (payload?.authenticated) {
  // create your local session
}`}
            </pre>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <FeatherIcon icon="check-circle" size={14} />
            <span>Fastest and simplest</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-green-900 mb-2">Option B · Verify API</h3>
          <p className="text-green-800 text-xs mb-3">When you cannot share secrets, call the verify endpoint:</p>
          <div className="bg-white rounded border border-green-200 p-3 mb-2">
            <pre className="text-[11px] font-mono text-gray-700 whitespace-pre-wrap">
              {`const res = await fetch('https://your-2fa-domain.com/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
})
const data = await res.json()
if (data.code === 0 && data.data.valid) {
  // trusted login
}`}
            </pre>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-700">
            <FeatherIcon icon="shield" size={14} />
            <span>No key sharing required</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-purple-900 mb-2">📝 React example</h3>
        <div className="space-y-3 text-[11px] text-purple-900 font-mono bg-white rounded border border-purple-200 p-3">
          <div>
            <p className="mb-1 font-sans text-xs text-purple-700 font-semibold">Launch login:</p>
            <pre className="whitespace-pre-wrap">{`function handleLogin() {
  const state = crypto.randomUUID()
  sessionStorage.setItem('oauth_state', state)

  const callback = window.location.origin + '/auth/callback'
  const url = \`https://auth.example.com/login?\${new URLSearchParams({
    redirectUrl: callback,
    state,
  })}\`

  window.location.href = url
}`}</pre>
          </div>
          <div>
            <p className="mb-1 font-sans text-xs text-purple-700 font-semibold">Handle callback:</p>
            <pre className="whitespace-pre-wrap">{`function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const state = params.get('state')

    if (state !== sessionStorage.getItem('oauth_state')) throw new Error('Invalid state')
    sessionStorage.removeItem('oauth_state')

    verifyTokenAndCreateSession(token)
  }, [])

  return <div>Signing you in...</div>
}`}</pre>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-yellow-900 mb-2">🔒 Best practices</h3>
        <ul className="text-yellow-800 text-xs space-y-1 list-disc list-inside">
          <li>Whitelist only domains you control via ALLOWED_REDIRECT_URLS</li>
          <li>Generate a fresh state value for every login attempt</li>
          <li>Use short-lived tokens (defaults to 5 minutes) then create local sessions</li>
          <li>Serve everything over HTTPS in production</li>
        </ul>
      </div>
    </div>
  )
}
