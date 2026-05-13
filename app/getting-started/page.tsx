import { redirect } from 'next/navigation'

/** Default entry: send users to the overview tab route. */
export default function GettingStartedIndexPage() {
  redirect('/getting-started/overview')
}
