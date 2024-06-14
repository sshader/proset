import { httpRouter, makeFunctionReference } from 'convex/server'
import { ConvexError } from 'convex/values'
import { httpAction } from './_generated/server'

const http = httpRouter()
const headers = {
  'Access-Control-Allow-Origin': '*',
  Vary: 'origin',
  'content-type': 'application/json',
}

const wrapWithErrorHandler = (p: Promise<any>): Promise<Response> => {
  return p
    .then((result) => {
      return new Response(
        JSON.stringify({ status: 'success', value: result }),
        {
          status: 200,
          headers,
        }
      )
    })
    .catch((e) => {
      if (e instanceof ConvexError) {
        return new Response(
          JSON.stringify({
            status: 'error',
            errorMessage: e.message,
            errorData: e.data,
          }),
          {
            status: 500,
            headers: { 'content-type': 'application/json' },
          }
        )
      } else {
        return new Response(
          JSON.stringify({
            status: 'error',
            errorMessage: (e as any).message,
            errorData: {},
          }),
          {
            status: 500,
            headers,
          }
        )
      }
    })
}

http.route({
  pathPrefix: '/api/',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const body = await request.json()
    const args = body.args ?? {}
    const pathParts = new URL(request.url).pathname.split('/')
    console.log(pathParts)
    const [_empty, _api, udfType, ...rest] = pathParts
    const functionName = rest.pop()
    const functionReference = `${rest.join('/')}:${functionName}`
    switch (udfType) {
      case 'query': {
        return await wrapWithErrorHandler(
          ctx.runQuery(makeFunctionReference<'query'>(functionReference), args)
        )
      }
      case 'mutation': {
        return await wrapWithErrorHandler(
          ctx.runMutation(
            makeFunctionReference<'mutation'>(functionReference),
            args
          )
        )
      }
      case 'action':
        return await wrapWithErrorHandler(
          ctx.runAction(
            makeFunctionReference<'action'>(functionReference),
            args
          )
        )
      default:
        return new Response(
          JSON.stringify({
            status: 'error',
            errorMessage: `Unexpected function type: ${udfType}`,
          }),
          { status: 400, headers }
        )
    }
  }),
})

http.route({
  pathPrefix: '/api/',
  method: 'OPTIONS',
  handler: httpAction(async (_, request) => {
    const headers = request.headers
    if (
      headers.get('Origin') !== null &&
      headers.get('Access-Control-Request-Method') !== null &&
      headers.get('Access-Control-Request-Headers') !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Digest',
          'Access-Control-Max-Age': '86400',
        }),
      })
    } else {
      return new Response()
    }
  }),
})

export default http
