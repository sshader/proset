'use node';
import { action } from "./_generated/server"
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
export default action(async (_) => {
// test client configured by Tom, don't use in automated tests (we'll get cut off)
// const client = new postmark.ServerClient(
//   "eb684243-712f-49c8-bb8a-1eff514b8245"
// );

const x = async () => {
    await sleep(5000);
    throw new ReferenceError("what's up");
};

// const result = await client.sendEmail({
//   From: "tom@convex.dev",
//   To: email,
//   Subject: "Hello from Postmark",
//   HtmlBody: "<strong>Hello</strong> dear Convex user!",
//   TextBody: `Hello from Tom!`,
//   MessageStream: "outbound",
// });
console.log("email sent...");
// console.log(result);
x();
await sleep(5000);
});