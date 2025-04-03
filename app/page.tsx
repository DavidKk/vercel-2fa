import Meta, { generate } from '@/components/Meta'

const { generateMetadata, metaProps } = generate({
  title: 'Two-Factor Authentication Service',
  description: 'A simple and user-friendly two-factor authentication service based on the TOTP standard for enhanced security.',
})

export { generateMetadata }

export default function Home() {
  return (
    <div className="flex flex-col items-center p-10 pt-20 max-w-6xl mx-auto text-center">
      <Meta {...metaProps} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full my-12">
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Key Generation & Management</h2>
          <p className="text-gray-600">
            Provides a user-friendly interface to generate TOTP keys with QR code display, making it easy to integrate into your application's authentication system.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Learning Example</h2>
          <p className="text-gray-600">
            Serves as a complete 2FA implementation example, demonstrating how to build a secure and reliable two-factor authentication system using the TOTP standard.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Security Note</h2>
          <p className="text-gray-600">This service does not store any generated key information. All data is managed by your application, ensuring maximum security.</p>
        </div>
      </div>
    </div>
  )
}
