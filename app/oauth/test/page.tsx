import { OAuthTestContent } from './OAuthTestContent'

interface OAuthTestPageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function OAuthTestPage(props: OAuthTestPageProps) {
  const searchParams = await props.searchParams
  const mode = searchParams.mode === 'redirect' ? 'redirect' : 'popup'
  return <OAuthTestContent mode={mode} />
}
