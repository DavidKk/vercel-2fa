import LoginForm from './Form'

interface LoginPageProps {
  searchParams: Promise<{ redirectUrl: string }>
}

export default async function LoginPage(props: LoginPageProps) {
  const enableTotp = !!process.env.ACCESS_TOTP_SECRET
  const enableWebAuthn = !!process.env.ACCESS_WEBAUTHN_SECRET
  if (!enableTotp && !enableWebAuthn) {
    return <div>2FA is not enabled</div>
  }

  const { searchParams } = props
  const { redirectUrl: url = '/login/blank' } = await searchParams

  const redirectUrl = decodeURIComponent(url)
  return <LoginForm enableTotp={enableTotp} enableWebAuthn={enableWebAuthn} redirectUrl={redirectUrl} />
}
