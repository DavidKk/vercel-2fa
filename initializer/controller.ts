import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { stringifyUnknownError } from '@/utils/response'

export interface Context {
  params: Promise<any>
  searchParams: URLSearchParams
}

export interface ContextWithParams<P> extends Context {
  params: Promise<P>
}

export function api(handle: (req: NextRequest, context: Context) => Promise<any>) {
  return async (req: NextRequest, context: Context) => {
    try {
      const result = await handle(req, context)
      if (result instanceof NextResponse) {
        return result
      }

      const status = 'status' in result ? result.status : 200
      const headers = 'headers' in result ? result.headers : {}
      return NextResponse.json(result, { status, headers })
    } catch (error) {
      const message = stringifyUnknownError(error)
      return NextResponse.json(message, { status: 500 })
    }
  }
}

export function plainText<P>(handle: (req: NextRequest, context: ContextWithParams<P>) => Promise<string>) {
  return async (req: NextRequest, context: ContextWithParams<P>) => {
    try {
      const result = await handle(req, context)
      return new NextResponse(result, { status: 200 })
    } catch (error) {
      const message = stringifyUnknownError(error)
      return new NextResponse(message, { status: 500 })
    }
  }
}
