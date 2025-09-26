import { withContext } from './context'

export const getReqHeaders = withContext((ctx) => {
  return ctx.req!.headers
})

export const getHeaders = withContext((ctx) => {
  return ctx.headers
})

export const setHeaders = withContext((ctx, headers: Headers | Record<string, string>) => {
  for (const [key, value] of Object.entries(headers)) {
    ctx.headers!.set(key, value)
  }
})
