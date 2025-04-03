export interface VerificationProps {
  credential: string
}

export default function Verification(props: VerificationProps) {
  const { credential } = props

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center">WebAuthn Setup Complete!</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Your WebAuthn credential has been successfully registered. You can now use this device for authentication.</p>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Important Information</h2>
          <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
            <li>Your device is now registered for WebAuthn authentication</li>
            <li>You can use biometric or security key authentication</li>
            <li>Make sure to keep your device secure</li>
          </ul>
        </div>

        <div className="text-sm text-gray-500">
          <p className="font-medium mb-2">Credential Details:</p>
          <pre className="bg-gray-50 p-2 rounded-md overflow-auto">
            <code>{credential}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
