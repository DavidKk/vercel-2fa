import { verifyJWTToken } from '@/app/actions/jwt'
import TokenViewer from './TokenViewer'

interface PageProps {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function BlankPage(props: PageProps) {
  const { searchParams } = props
  const { token } = await searchParams
  const decodedJWTToken = token ? await verifyJWTToken(token) : null
  return <TokenViewer decodedJWTToken={decodedJWTToken} />
}
