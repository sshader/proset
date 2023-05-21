import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'

const http = httpRouter()

http.route({
  path: '/graphql',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const q = await request.json()
    const introspection = await ctx.runQuery('graphql', {
      ...q,
    })
    return new Response(JSON.stringify(introspection), {
      headers: {
        'Access-Control-Allow-Origin': 'https://studio.apollographql.com',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
        vary: 'origin',
      },
    })
  }),
})

http.route({
  path: '/graphql',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': 'https://studio.apollographql.com',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        vary: 'origin',
      },
    })
  }),
})

export default http
