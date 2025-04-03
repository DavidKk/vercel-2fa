export interface QrcodeProps {
  qrCode: string
  secret: string
  onVerify: () => void
}

export default function Qrcode(props: QrcodeProps) {
  const { qrCode, secret, onVerify } = props

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Two-Factor Authentication</h1>

        <div className="mt-6 text-center">
          <p className="text-md text-gray-600 mb-2">Scan this QR code with your authenticator app:</p>
          <img src={qrCode} alt="QR Code" className="mx-auto" />

          <p className="mt-4 text-md text-gray-600">
            <strong>Important:</strong> Below is your secret key. Store it securely in your server and do not share it with anyone. This key is required for generating and
            verifying OTPs.
          </p>

          <p className="mt-4 text-md text-gray-600">Secret: {secret}</p>

          <button onClick={onVerify} className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
            Verify Authentication
          </button>
        </div>
      </div>
    </div>
  )
}
