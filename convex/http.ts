import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";


function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

const http = httpRouter();
http.route({
    path: "/test",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      for (let i = 0; i < 20; i += 1) {
        console.log("HELLO", i)
        await sleep(2000)
      };     
      return new Response(null, { status: 200 })
    })
})

export default http