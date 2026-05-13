import { OAuthPlaygroundContent } from './OAuthPlaygroundContent'

interface OAuthTestPageProps {
  searchParams: Promise<{ mode?: string; resultPage?: string }>
}

export default async function OAuthTestPage(props: OAuthTestPageProps) {
  const searchParams = await props.searchParams
  const mode = searchParams.mode === 'redirect' ? 'redirect' : 'popup'
  const isResultPage = searchParams.resultPage === 'true'
  const flowType: 'login' | 'callback' = isResultPage ? 'callback' : 'login'

  return <OAuthPlaygroundContent mode={mode} isResultPage={isResultPage} flowType={flowType} />
}
